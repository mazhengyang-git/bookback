const pool = require('../config/db');

// 获取所有订单（后台）- 修正版：字段别名+联表查询
exports.adminGetAllOrders = async (req, res) => {
  try {
    const { status } = req.query;
    // 联表查询获取用户/图书名；字段别名驼峰
    let sql = `
      SELECT 
        o.id,
        o.order_no AS orderNo,
        o.count,
        o.total_price AS totalPrice,
        o.status,
        o.create_time AS createTime,
        u.username,
        b.book_name AS bookName
      FROM \`order\` o
      LEFT JOIN \`user\` u ON o.user_id = u.id
      LEFT JOIN \`book\` b ON o.book_id = b.id
    `;
    let params = [];

    // 状态筛选
    if (status && status !== '全部') {
      sql += ` WHERE o.status = ?`;
      params.push(status);
    }

    // 倒序获取订单
    sql += ` ORDER BY o.create_time DESC`;
    const [rows] = await pool.execute(sql, params);

    res.json({
      code: 200,
      msg: '获取成功',
      data: rows
    });
  } catch (err) {
    console.error(err);
    res.json({ code: 500, msg: '服务器错误' });
  }
};
exports.adminUpdateOrderStatus = async (req, res) => {
  try {
    const { orderId, status } = req.body; // 前端传的是 orderId 和 status

    // 1. 校验参数
    if (!orderId || !status) {
      return res.json({ code: 400, msg: '参数错误' });
    }

    // 2. 更新订单状态
    const [result] = await pool.execute(
      'UPDATE `order` SET status = ? WHERE id = ?',
      [status, orderId]
    );

    // 3. 判断是否更新成功
    if (result.affectedRows === 0) {
      return res.json({ code: 404, msg: '订单不存在' });
    }

    res.json({ code: 200, msg: '订单状态修改成功' });
  } catch (err) {
    console.error('修改订单状态错误：', err);
    res.json({ code: 500, msg: '修改失败' });
  }
};