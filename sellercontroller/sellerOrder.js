const pool = require('../config/db');
const {
  isSalesCountedStatus,
  adjustBookSalesDelta,
} = require('../utils/bookSales');

// 1. 获取卖家自己的订单列表（仅商家自营订单）
exports.sellerGetOrders = async (req, res) => {
  try {
    const userId = req.user.id;
    const { status } = req.query;

    const [seller] = await pool.execute(
      'SELECT id FROM seller WHERE user_id = ?',
      [userId]
    );
    if (!seller.length) {
      return res.json({ code: 403, msg: '您还未开通卖家店铺', data: [] });
    }
    const sellerId = seller[0].id;

    const [sellerBooks] = await pool.execute(
      'SELECT id FROM seller_book WHERE seller_id = ?',
      [sellerId]
    );
    if (!sellerBooks.length) {
      return res.json({ code: 200, msg: '您还未上架任何商品', data: [] });
    }
    const bookIds = sellerBooks.map(item => item.id);
    const placeholders = bookIds.map(() => '?').join(',');

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
        s.book_name AS bookName,
        s.price AS originalPrice,
        s.cover AS bookCover
      FROM \`order\` o
      LEFT JOIN \`user\` u ON o.user_id = u.id
      LEFT JOIN \`seller_book\` s ON o.book_id = s.id AND o.source = 'seller'
      WHERE o.source = 'seller' 
        AND o.book_id IN (${placeholders})
    `;
    let params = [...bookIds];

    if (status && status !== '全部') {
      sql += ` AND o.status = ?`;
      params.push(status);
    }

    sql += ` ORDER BY o.create_time DESC`;
    const [rows] = await pool.execute(sql, params);

    const data = rows.map(item => {
      const originalPrice = Number(item.originalPrice || 0);
      const realUnitPrice = item.count > 0 
        ? (Number(item.totalPrice) / item.count).toFixed(2) 
        : 0;

      return {
        ...item,
        bookName: item.bookName || '未知商品',
        originalPrice: originalPrice.toFixed(2),
        realUnitPrice: realUnitPrice,
        bookCover: item.bookCover || '/default-book.png'
      };
    });

    res.json({ code: 200, msg: '获取成功', data });
  } catch (err) {
    console.error('卖家获取订单列表错误：', err);
    res.json({ code: 500, msg: '服务器错误' });
  }
};

// 2. 卖家修改自己订单的状态（权限控制+销量逻辑和管理员保持一致）
exports.sellerUpdateOrderStatus = async (req, res) => {
  let connection;
  try {
    const { orderId, status } = req.body;
    const userId = req.user.id;
    if (!orderId || !status) {
      return res.json({ code: 400, msg: '参数错误' });
    }

    const [seller] = await pool.execute(
      'SELECT id FROM seller WHERE user_id = ?',
      [userId]
    );
    if (!seller.length) {
      return res.json({ code: 403, msg: '您还未开通卖家店铺' });
    }
    const sellerId = seller[0].id;

    connection = await pool.getConnection();
    await connection.beginTransaction();

    const [orderCheck] = await connection.execute(
      `SELECT o.id 
       FROM \`order\` o
       LEFT JOIN seller_book s ON o.book_id = s.id AND o.source = 'seller'
       WHERE o.id = ? 
         AND o.source = 'seller' 
         AND s.seller_id = ?`,
      [orderId, sellerId]
    );
    if (!orderCheck.length) {
      await connection.rollback();
      return res.json({ code: 403, msg: '您无权修改此订单' });
    }

    const [rows] = await connection.execute(
      'SELECT id, book_id, `count`, status, source, IFNULL(sales_recorded, 0) AS sales_recorded FROM `order` WHERE id = ? FOR UPDATE',
      [orderId]
    );
    if (!rows.length) {
      await connection.rollback();
      return res.json({ code: 404, msg: '订单不存在' });
    }

    const oldRow = rows[0];
    if (oldRow.status === status) {
      await connection.commit();
      return res.json({ code: 200, msg: '订单状态未变化' });
    }

    await connection.execute('UPDATE `order` SET status = ? WHERE id = ?', [status, orderId]);

    const oldCounted = isSalesCountedStatus(oldRow.status);
    const newCounted = isSalesCountedStatus(status);
    const recorded = !!oldRow.sales_recorded;

    if (newCounted && !oldCounted && !recorded) {
      await adjustBookSalesDelta(connection, oldRow, Number(oldRow.count) || 0);
      await connection.execute('UPDATE `order` SET sales_recorded = 1 WHERE id = ?', [orderId]);
    } else if (!newCounted && oldCounted && recorded) {
      await adjustBookSalesDelta(connection, oldRow, -Math.abs(Number(oldRow.count) || 0));
      await connection.execute('UPDATE `order` SET sales_recorded = 0 WHERE id = ?', [orderId]);
    }

    await connection.commit();
    res.json({ code: 200, msg: '订单状态修改成功' });
  } catch (err) {
    if (connection) await connection.rollback();
    console.error('卖家修改订单状态错误：', err);
    res.json({ code: 500, msg: '修改失败' });
  } finally {
    if (connection) connection.release();
  }
};

// 卖家统计接口

exports.sellerGetStats = async (req, res) => {
  try {
    const userId = req.user.id;
    const [seller] = await pool.execute(
      'SELECT id FROM seller WHERE user_id = ?',
      [userId]
    );
    if (!seller.length) {
      return res.json({ code: 403, msg: '您还未开通卖家店铺', data: {} });
    }
    const sellerId = seller[0].id;

    // 1. 已上架图书总数（查询 seller_book 表，正确）
    const [bookCount] = await pool.execute(
      'SELECT COUNT(*) AS count FROM seller_book WHERE seller_id = ?',
      [sellerId]
    );

    // 待审核申请数量（查询 seller_bookapply 表）
    // audit_status 是数字类型，用 0 代表待审核
    const [pendingCount] = await pool.execute(
      'SELECT COUNT(*) AS count FROM seller_bookapply WHERE seller_id = ? AND audit_status = ?',
      [sellerId, 0]
    );

    // 本月销售额
    const now = new Date();
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const [sales] = await pool.execute(
      `SELECT IFNULL(SUM(o.total_price), 0) AS total FROM \`order\` o
       LEFT JOIN seller_book s ON o.book_id = s.id AND o.source = 'seller'
       WHERE o.source = 'seller' AND s.seller_id = ? AND o.create_time >= ?`,
      [sellerId, firstDayOfMonth]
    );

    // 订单总数
    const [orderCount] = await pool.execute(
      `SELECT COUNT(*) AS count FROM \`order\` o
       LEFT JOIN seller_book s ON o.book_id = s.id AND o.source = 'seller'
       WHERE o.source = 'seller' AND s.seller_id = ?`,
      [sellerId]
    );

    res.json({
      code: 200,
      msg: '获取成功',
      data: {
        bookCount: Number(bookCount[0].count),
        pendingCount: Number(pendingCount[0].count),
        sales: Number(sales[0].total) || 0,
        orderCount: Number(orderCount[0].count)
      }
    });
  } catch (err) {
    console.error('获取卖家统计数据错误：', err);
    res.json({ 
      code: 500, 
      msg: '服务器错误', 
      data: {
        bookCount: 0,
        pendingCount: 0,
        sales: 0,
        orderCount: 0
      }
    });
  }
};