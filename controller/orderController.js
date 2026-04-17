const pool = require('../config/db');

//获取当前用户订单列表（关联book表 + 字段转小驼峰）
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
const deleteOrders=async(req,res)=>{
  try{
     const {orderno}=req.body
const userId=req.user.id
if (!orderno) {
      return res.status(400).json({ code: 400, msg: '订单编号不能为空',data:null });
    } 
const [order]=await pool.execute(
`SELECT * FROM \`order\` WHERE \`order_no\` = ? AND user_id = ?`, [orderno, userId]
);  if (!order.length) {
      return res.status(403).json({ code: 403, msg: '无权删除该订单', data: null });
    }   
    const [result]= await pool.execute('DELETE FROM \`order\` WHERE \`order_no\` = ? AND user_id = ?', [orderno, userId]);
     if (result.affectedRows > 0) {
      res.status(200).json({ code: 200, msg: '删除成功', data: null });
    } else {
      res.status(500).json({ code: 500, msg: '删除失败，请重试', data: null });
    }
  }
  catch(error){
 console.error('删除订单失败：', error);
    res.status(500).json({ code: 500, msg: '服务器错误',data:null });
  }
}
module.exports = { getUserOrders,deleteOrders };