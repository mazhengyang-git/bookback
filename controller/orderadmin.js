const pool = require('../config/db');

// 管理员获取所有订单（新书+普通书）
exports.adminGetAllOrders = async (req, res) => {
  try {
    const { status } = req.query;
    let sql = `
      SELECT 
        o.id,
        o.order_no AS orderNo,
        o.count,
        o.total_price AS totalPrice,
        o.status,
        o.create_time AS createTime,
        o.source,
        u.username,
        b.book_name AS bookName,
        n.book_name AS newBookName
      FROM \`order\` o
      LEFT JOIN \`user\` u ON o.user_id = u.id
      LEFT JOIN \`book\` b ON o.book_id = b.id AND o.source = 'normal'
      LEFT JOIN \`newbook\` n ON o.book_id = n.id AND o.source = 'new'
    `;
    let params = [];

    if (status && status !== '全部') {
      sql += ` WHERE o.status = ?`;
      params.push(status);
    }

    sql += ` ORDER BY o.create_time DESC`;
    const [rows] = await pool.execute(sql, params);

    // 格式化书名
    const data = rows.map(item => ({
      ...item,
      bookName: item.source === 'new' ? item.newBookName : item.bookName || '未知图书'
    }))

    res.json({ code: 200, msg: '获取成功', data });
  } catch (err) {
    console.error(err);
    res.json({ code: 500, msg: '服务器错误' });
  }
};

// 管理员修改订单状态
exports.adminUpdateOrderStatus = async (req, res) => {
  try {
    const { orderId, status } = req.body;
    if (!orderId || !status) {
      return res.json({ code: 400, msg: '参数错误' });
    }

    const [result] = await pool.execute(
      'UPDATE `order` SET status = ? WHERE id = ?',
      [status, orderId]
    );

    if (result.affectedRows === 0) {
      return res.json({ code: 404, msg: '订单不存在' });
    }

    res.json({ code: 200, msg: '订单状态修改成功' });
  } catch (err) {
    console.error('修改订单状态错误：', err);
    res.json({ code: 500, msg: '修改失败' });
  }
};