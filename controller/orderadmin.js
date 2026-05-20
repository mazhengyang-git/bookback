const pool = require('../config/db');
const {
  isSalesCountedStatus,
  adjustBookSalesDelta,
} = require('../utils/bookSales');

// 管理员获取所有订单（普通书+新书+商家书）
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
        -- 普通书
        b.book_name AS bookName,
        b.price AS originalPrice,
        -- 新书
        n.book_name AS newBookName,
        n.price AS newOriginalPrice,
        -- 商家书
        s.book_name AS sellerBookName,
        s.price AS sellerOriginalPrice
      FROM \`order\` o
      LEFT JOIN \`user\` u ON o.user_id = u.id
      LEFT JOIN \`book\` b ON o.book_id = b.id AND o.source = 'normal'
      LEFT JOIN \`newbook\` n ON o.book_id = n.id AND o.source = 'new'
      LEFT JOIN \`seller_book\` s ON o.book_id = s.id AND o.source = 'seller'
    `;
    let params = [];

    if (status && status !== '全部') {
      sql += ` WHERE o.status = ?`;
      params.push(status);
    }

    sql += ` ORDER BY o.create_time DESC`;
    const [rows] = await pool.execute(sql, params);

    const data = rows.map(item => {
      // 根据source区分不同图书类型的原价
      let originalPrice = 0;
      let bookName = '未知图书';
      
      if (item.source === 'new') {
        originalPrice = Number(item.newOriginalPrice || 0);
        bookName = item.newBookName || '未知新书';
      } else if (item.source === 'seller') {
        originalPrice = Number(item.sellerOriginalPrice || 0);
        bookName = item.sellerBookName || '未知商家书';
      } else {
        originalPrice = Number(item.originalPrice || 0);
        bookName = item.bookName || '未知普通书';
      }

      // 实付单价（优惠价）
      const realUnitPrice = item.count > 0 
        ? (Number(item.totalPrice) / item.count).toFixed(2) 
        : 0;

      return {
        ...item,
        bookName,
        originalPrice: originalPrice.toFixed(2),
        realUnitPrice: realUnitPrice,
      };
    });

    res.json({ code: 200, msg: '获取成功', data });
  } catch (err) {
    console.error('获取订单列表错误：', err);
    res.json({ code: 500, msg: '服务器错误' });
  }
};

// 管理员修改订单状态
exports.adminUpdateOrderStatus = async (req, res) => {
  let connection;
  try {
    const { orderId, status } = req.body;
    if (!orderId || !status) {
      return res.json({ code: 400, msg: '参数错误' });
    }

    connection = await pool.getConnection();
    await connection.beginTransaction();

    // 强制读取 sales_recorded，NULL 转 0
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

    // 先更新状态
    await connection.execute('UPDATE `order` SET status = ? WHERE id = ?', [status, orderId]);

    const oldCounted = isSalesCountedStatus(oldRow.status);
    const newCounted = isSalesCountedStatus(status);
    const recorded = !!oldRow.sales_recorded;

    console.log('===== 销量调试日志 =====');
    console.log('旧状态:', oldRow.status, '是否计数:', oldCounted);
    console.log('新状态:', status, '是否计数:', newCounted);
    console.log('是否已记录销量:', recorded);
    console.log('========================');


    // 1. 非计数状态 → 计数状态：加销量 + 标记1
    if (newCounted && !oldCounted && !recorded) {
      console.log('✅ 执行：增加销量');
      await adjustBookSalesDelta(connection, oldRow, Number(oldRow.count) || 0);
      await connection.execute('UPDATE `order` SET sales_recorded = 1 WHERE id = ?', [orderId]);
    }

    // 2. 计数状态 → 非计数状态：减销量 + 标记0
    else if (!newCounted && oldCounted && recorded) {
      console.log('✅ 执行：减少销量');
      await adjustBookSalesDelta(connection, oldRow, -Math.abs(Number(oldRow.count) || 0));
      await connection.execute('UPDATE `order` SET sales_recorded = 0 WHERE id = ?', [orderId]);
    }
    // ==============================================

    await connection.commit();
    res.json({ code: 200, msg: '订单状态修改成功' });
  } catch (err) {
    if (connection) await connection.rollback();
    console.error('修改订单状态错误：', err);
    res.json({ code: 500, msg: '修改失败' });
  } finally {
    if (connection) connection.release();
  }
};