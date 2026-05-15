const pool = require('../config/db');
const { adjustBookSalesDelta } = require('../utils/bookSales');

// 获取当前用户订单列表（兼容新书+普通书）
const getUserOrders = async (req, res) => {
  try {
    const userId = req.user.id;
    
    // 查询时带上source字段
    const [orders] = await pool.execute(`
      SELECT 
        o.*, 
        b.book_name, 
        b.cover AS book_cover,
        n.book_name AS new_book_name,
        n.cover AS new_book_cover
      FROM \`order\` o
      LEFT JOIN book b ON o.book_id = b.id AND o.source = 'normal'
      LEFT JOIN newbook n ON o.book_id = n.id AND o.source = 'new'
      WHERE o.user_id = ?
      ORDER BY o.create_time DESC
    `, [userId]);

    // 格式化：新书取newbook数据，普通书取book数据
    const formatOrders = orders.map(item => ({
      id: item.id,
      orderNo: item.order_no,
      bookName: item.source === 'new' ? item.new_book_name : item.book_name || '未知图书',
      count: item.count,
      totalPrice: Number(item.total_price) || 0,
      status: item.status || '已付款',
      bookCover: item.source === 'new' ? (item.new_book_cover || '/default-book.png') : (item.book_cover || '/default-book.png'),
      createTime: item.create_time || '',
      bookId: item.book_id,
      source: item.source
    }));

    res.json({ code: 200, msg: '获取订单成功', data: formatOrders });
  } catch (error) {
    console.error('[订单接口错误]', error);
    res.status(500).json({ code: 500, msg: '获取订单失败', data: [] });
  }
};

// 删除订单 + 新书/普通书 库存自动回滚
const deleteOrders=async(req,res)=>{
  let connection;
  try{
    const {orderno}=req.body
    const userId=req.user.id

    if (!orderno) {
      return res.status(400).json({ code: 400, msg: '订单编号不能为空',data:null });
    } 

    connection = await pool.getConnection();
    await connection.beginTransaction();

    // 1. 查询订单 + source + 销量记账
    const [orderResult]=await connection.execute(
      `SELECT book_id, \`count\`, status, source, COALESCE(sales_recorded,0) AS sales_recorded FROM \`order\` WHERE \`order_no\` = ? AND user_id = ?`, 
      [orderno, userId]
    ); 

    if (!orderResult.length) {
      await connection.rollback();
      return res.status(403).json({ code: 403, msg: '无权删除该订单', data: null });
    }   

    const order = orderResult[0];
    const paidStatus = ["已付款", "待发货", "已完成", "已发货", "已收货"];

    // 1.5 退货退款：若本单曾计入销量，先扣回（与库存回滚对称）
    if (Number(order.sales_recorded) === 1) {
      await adjustBookSalesDelta(connection, order, -Math.abs(Number(order.count) || 0));
    }
    
    // 2. 根据source回加库存
    if (paidStatus.includes(order.status)) {
      if (order.source === 'new') {
        // 新书：回加 newbook 表库存
        await connection.execute(
          `UPDATE newbook SET stock = stock + ? WHERE id = ?`,
          [order.count, order.book_id]
        );
      } else {
        // 普通书：回加 book 表库存
        await connection.execute(
          `UPDATE book SET stock = stock + ? WHERE id = ?`,
          [order.count, order.book_id]
        );
      }
    }

    // 3. 删除订单
    const [result]= await connection.execute(
      'DELETE FROM `order` WHERE `order_no` = ? AND user_id = ?', 
      [orderno, userId]
    );

    await connection.commit();
    res.status(200).json({ code: 200, msg: '删除成功，库存已恢复', data: null });

  } catch(error){
    if(connection) await connection.rollback();
    console.error('删除订单失败：', error);
    res.status(500).json({ code: 500, msg: '服务器错误',data:null });
  } finally {
    if(connection) connection.release();
  }
}

module.exports = { getUserOrders,deleteOrders };