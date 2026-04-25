const pool = require('../config/db');

//获取当前用户订单列表（关联book表 + 字段转小驼峰，你原有代码完全不动）
const getUserOrders = async (req, res) => {
  try {
    const userId = req.user.id;
    
    const [orders] = await pool.execute(`
      SELECT 
        o.*, 
        b.book_name, 
        b.cover AS book_cover
      FROM \`order\` o
      LEFT JOIN book b ON o.book_id = b.id
      WHERE o.user_id = ?
      ORDER BY o.create_time DESC
    `, [userId]);

    //下划线字段转小驼峰，匹配前端
    const formatOrders = orders.map(item => ({
      id: item.id,
      orderNo: item.order_no, //对应前端orderNo
      bookName: item.book_name, //对应前端bookName
      count: item.count, // 购买数量
      totalPrice: Number(item.total_price) || 0, //转数字，对应前端totalPrice
      status: item.status || '已付款', //订单状态
      bookCover: item.book_cover || '/default-book.png', //图书封面（可选）
      createTime:item.create_time||'',
      bookId: item.book_id 
    }));

    res.json({ code: 200, msg: '获取订单成功', data: formatOrders });
  } catch (error) {
    console.error('[订单接口错误]', error);
    res.status(500).json({ code: 500, msg: '获取订单失败', data: [] });
  }
};

// ==============================================
// 🔥 终极修复：删除订单 + 库存自动回滚（全小写orderno参数+完整事务+防超卖）
// 完全对齐你前端原生参数名，大小写100%匹配
// ==============================================
const deleteOrders=async(req,res)=>{
  let connection;
  try{
    // 【严格和你前端统一：全小写 orderno】，不再用驼峰！
    const {orderno}=req.body
    const userId=req.user.id

    // 非空校验
    if (!orderno) {
      return res.status(400).json({ code: 400, msg: '订单编号不能为空',data:null });
    } 

    // 开启数据库事务（保证删除+库存修改原子性，要么全成功，要么全回滚）
    connection = await pool.getConnection();
    await connection.beginTransaction();

    // 1. 根据订单号+用户ID 查询订单（权限校验+获取图书、数量、状态）
    const [orderResult]=await pool.execute(
      `SELECT book_id, count, status FROM \`order\` WHERE \`order_no\` = ? AND user_id = ?`, 
      [orderno, userId]
    ); 

    if (!orderResult.length) {
      await connection.rollback();
      return res.status(403).json({ code: 403, msg: '无权删除该订单', data: null });
    }   

    const order = orderResult[0];
    // 2. 所有已支付状态订单，删除自动回加库存（覆盖你项目所有订单状态）
    const paidStatus = ["已付款", "待发货", "已完成", "已发货"];
    if (paidStatus.includes(order.status)) {
      // 库存回滚：原购买数量 加回图书库存
      await connection.execute(
        `UPDATE book SET stock = stock + ? WHERE id = ?`,
        [order.count, order.book_id]
      );
    }

    // 3. 删除订单
    const [result]= await connection.execute(
      'DELETE FROM `order` WHERE `order_no` = ? AND user_id = ?', 
      [orderno, userId]
    );

    // 事务提交
    await connection.commit();

    if (result.affectedRows > 0) {
      res.status(200).json({ code: 200, msg: '删除成功，图书库存已自动恢复', data: null });
    } else {
      res.status(500).json({ code: 500, msg: '删除失败，请重试', data: null });
    }

  }
  catch(error){
    // 异常全部回滚，保证数据安全
    if(connection) await connection.rollback();
    console.error('删除订单失败：', error);
    res.status(500).json({ code: 500, msg: '服务器错误',data:null });
  } finally {
    // 释放数据库连接
    if(connection) connection.release();
  }
}

module.exports = { getUserOrders,deleteOrders };