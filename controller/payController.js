const pool = require('../config/db');

// 统一订单号生成逻辑（保证唯一）
const createOrderNo = (userId) => {
  const timestamp = Date.now().toString(); 
  const random = Math.floor(100000 + Math.random() * 900000).toString(); 
  const userIdSuffix = userId.toString().slice(-2); 
  return 'OD' + timestamp + random + userIdSuffix;
};

// 1. 购物车支付-获取支付信息（保留原逻辑，无修改）
const getPayInfo = async (req, res) => {
  try {
    let { cartIds } = req.body;
    const userId = req.user.id;

    if (typeof cartIds === 'string') {
      cartIds = cartIds.split(',').map(id => parseInt(id.trim())).filter(id => !isNaN(id));
    } else if (Array.isArray(cartIds)) {
      cartIds = cartIds.map(id => parseInt(id)).filter(id => !isNaN(id));
    } else {
      return res.status(400).json({ code: 400, msg: '参数错误', data: [] });
    }

    if (cartIds.length === 0) {
      return res.status(200).json({ code: 200, msg: '无待支付商品', data: [] });
    }

    const placeholders = cartIds.map(() => '?').join(',');
    const sql = `SELECT * FROM cart WHERE id IN (${placeholders}) AND user_id = ?`;
    const params = [...cartIds, userId];

    const [payList] = await pool.execute(sql, params);
    res.status(200).json({ code: 200, msg: '获取成功', data: payList });
  } catch (error) {
    console.error('[getPayInfo] 错误:', error);
    res.status(500).json({ code: 500, msg: '获取支付信息失败', data: [] });
  }
};

// 2. 【已修复】购物车支付-提交支付（新增：库存校验 + 库存扣减 + 防超卖锁）
const submitPay = async (req, res) => {
  let connection;
  try {
    let { cartIds } = req.body;
    const userId = req.user.id;

    if (typeof cartIds === 'string') {
      cartIds = cartIds.split(',').map(id => parseInt(id.trim())).filter(id => !isNaN(id));
    } else if (Array.isArray(cartIds)) {
      cartIds = cartIds.map(id => parseInt(id)).filter(id => !isNaN(id));
    } else {
      return res.status(400).json({ code: 400, msg: '参数错误', data: {} });
    }

    if (cartIds.length === 0) {
      return res.status(400).json({ code: 400, msg: '无待支付商品', data: {} });
    }

    connection = await pool.getConnection();
    await connection.beginTransaction();

    // 查询购物车商品
    const placeholders = cartIds.map(() => '?').join(',');
    const cartSql = `SELECT * FROM cart WHERE id IN (${placeholders}) AND user_id = ?`;
    const [cartItems] = await connection.execute(cartSql, [...cartIds, userId]);

    if (cartItems.length === 0) {
      await connection.rollback();
      return res.status(400).json({ code: 400, msg: '购物车商品不存在', data: {} });
    }

    // 存储最终生成的订单号（修复：返回真实订单号）
    let lastOrderNo = '';

    // 循环创建订单 + 校验库存 + 扣减库存
    for (let item of cartItems) {
      const orderNo = createOrderNo(userId);
      lastOrderNo = orderNo; // 记录最后一个订单号
      const bookPrice = item.book_price ? Number(item.book_price) : 0;
      const quantity = item.quantity ? Number(item.quantity) : 1;
      const totalPrice = (bookPrice * quantity).toFixed(2);
      const bookId = item.goods_id; // 购物车goods_id对应图书id

      // =============== 修复1：校验图书是否存在 + 库存是否充足（加行锁防超卖） ===============
      const [bookInfo] = await connection.execute(
        'SELECT stock FROM book WHERE id = ? FOR UPDATE',
        [bookId]
      );
      if (!bookInfo.length) {
        await connection.rollback();
        return res.status(400).json({ code: 400, msg: '图书不存在，支付失败', data: {} });
      }
      const stock = bookInfo[0].stock;
      if (stock < quantity) {
        await connection.rollback();
        return res.status(400).json({ code: 400, msg: `图书库存不足，仅剩${stock}本`, data: {} });
      }

      // 插入订单
      await connection.execute(
        `INSERT INTO \`order\` (order_no, user_id, book_id, count, total_price, status) 
         VALUES (?, ?, ?, ?, ?, ?)`,
        [orderNo, userId, bookId, quantity, totalPrice, '已付款']
      );

      // =============== 修复2：扣减图书库存（核心功能） ===============
      await connection.execute(
        'UPDATE book SET stock = stock - ? WHERE id = ?',
        [quantity, bookId]
      );
    }

    // 删除购物车商品
    const deleteSql = `DELETE FROM cart WHERE id IN (${placeholders}) AND user_id = ?`;
    await connection.execute(deleteSql, [...cartIds, userId]);

    await connection.commit();
    // 修复：返回真实生成的订单号
    res.status(200).json({ code: 200, msg: '支付成功', data: { orderNo: lastOrderNo } });
  } catch (error) {
    if (connection) await connection.rollback();
    console.error('[submitPay] 错误:', error);
    res.status(500).json({ code: 500, msg: '支付失败', data: {} });
  } finally {
    if (connection) connection.release();
  }
};

// 3. 直付-获取商品信息（保留原逻辑，无修改）
const getDirectPayGoodsInfo = async (req, res) => {
  try {
    const { bookId, buyCount } = req.body;
    const userId = req.user.id;

    // 1. 基础参数校验
    if (!bookId || !buyCount || buyCount < 1) {
      return res.status(400).json({ 
        code: 400, 
        msg: '参数错误：图书ID/购买数量不能为空且数量需≥1', 
        data: null 
      });
    }

    // 2. 查询图书信息
    const [books] = await pool.execute(
      'SELECT id, book_name, price, cover, stock FROM book WHERE id = ?',
      [bookId]
    );

    // 3. 图书存在性校验
    if (books.length === 0) {
      return res.status(400).json({ 
        code: 400, 
        msg: '图书不存在', 
        data: null 
      });
    }

    const book = books[0];
    // 4. 库存校验
    if (buyCount > book.stock) {
      return res.status(400).json({ 
        code: 400, 
        msg: `库存不足！该图书仅剩${book.stock}本`, 
        data: null 
      });
    }

    // 5. 返回统一格式
    res.status(200).json({
      code: 200,
      msg: '获取直付信息成功',
      data: {
        bookId: book.id,
        name: book.book_name,
        cover: book.cover || '',
        spec: '平装版',
        count: buyCount,
        price: book.price
      }
    });
  } catch (error) {
    console.error('[getDirectPayGoodsInfo] 错误:', error);
    res.status(500).json({ 
      code: 500, 
      msg: '服务器异常：获取直付商品信息失败', 
      data: null 
    });
  }
};

// 4. 【已优化】直付-提交支付（新增防超卖行锁，更安全）
const submitDirectPay = async (req, res) => {
  let connection;
  try {
    const { bookId, buyCount } = req.body;
    const userId = req.user.id;

    // 1. 基础参数校验
    if (!bookId || !buyCount || buyCount < 1) {
      return res.status(400).json({ 
        code: 400, 
        msg: '参数错误：图书ID/购买数量不能为空且数量需≥1', 
        data: { orderNo: '' } 
      });
    }

    // 2. 获取数据库连接并开启事务
    connection = await pool.getConnection();
    await connection.beginTransaction();

    // 3. 校验图书和库存（加FOR UPDATE行锁，防止并发超卖）
    const [books] = await connection.execute(
      'SELECT id, book_name, price, stock FROM book WHERE id = ? FOR UPDATE',
      [bookId]
    );
    if (books.length === 0) {
      await connection.rollback();
      return res.status(400).json({ 
        code: 400, 
        msg: '图书不存在', 
        data: { orderNo: '' } 
      });
    }
    const book = books[0];
    if (buyCount > book.stock) {
      await connection.rollback();
      return res.status(400).json({ 
        code: 400, 
        msg: `库存不足！该图书仅剩${book.stock}本`, 
        data: { orderNo: '' } 
      });
    }

    // 4. 生成订单号
    const orderNo = createOrderNo(userId);
    const totalAmount = (book.price * buyCount).toFixed(2);

    // 5. 插入订单表
    await connection.execute(
      'INSERT INTO `order` (order_no, user_id, book_id, count, total_price, status) VALUES (?, ?, ?, ?, ?, ?)',
      [orderNo, userId, bookId, buyCount, totalAmount, '已付款']
    );

    // 6. 扣减库存
    await connection.execute(
      'UPDATE book SET stock = stock - ? WHERE id = ?',
      [buyCount, bookId]
    );

    // 7. 提交事务
    await connection.commit();
    console.log('[直付成功] 订单号:', orderNo);

    // 8. 返回结果
    res.status(200).json({
      code: 200,
      msg: '支付成功',
      data: { orderNo }
    });
  } catch (error) {
    if (connection) await connection.rollback();
    console.error('[submitDirectPay] 错误:', error);
    res.status(500).json({ 
      code: 500, 
      msg: '支付失败：服务器异常', 
      data: { orderNo: '' } 
    });
  } finally {
    if (connection) connection.release();
  }
};

// ==========================================================
// 🔥 新增核心功能：删除订单 + 自动回加图书库存
// ==========================================================
// ==========================================================
// 🔥 终极修复版：按orderNo删除订单 + 自动恢复库存（前端0修改）
// 支持：已付款 / 待发货 / 已完成 所有支付成功状态
// ==========================================================
const deleteOrder = async (req, res) => {
  let connection;
  try {
    // 前端传的是 orderNo，完全不动前端代码
    const { orderNo } = req.body;
    const userId = req.user.id;

    // 非空校验
    if (!orderNo) {
      return res.json({ code: 400, msg: "订单编号不能为空" });
    }

    connection = await pool.getConnection();
    await connection.beginTransaction();

    // 1. 根据【订单号+用户ID】查询订单（精准匹配，防止越权）
    const [orders] = await connection.execute(
      `SELECT id, book_id, count, status FROM \`order\` WHERE order_no = ? AND user_id = ?`,
      [orderNo, userId]
    );

    if (orders.length === 0) {
      await connection.rollback();
      return res.json({ code: 400, msg: "订单不存在或无权删除" });
    }

    const order = orders[0];
    // 2. 只要是支付后的订单，删除就恢复库存（覆盖所有支付状态）
    const paidStatus = ["已付款", "待发货", "已完成", "已发货"];
    if (paidStatus.includes(order.status)) {
      // 库存回滚：图书库存 + 购买数量
      await connection.execute(
        `UPDATE book SET stock = stock + ? WHERE id = ?`,
        [order.count, order.book_id]
      );
    }

    // 3. 根据订单号删除订单
    await connection.execute(
      `DELETE FROM \`order\` WHERE order_no = ? AND user_id = ?`,
      [orderNo, userId]
    );

    await connection.commit();
    return res.json({ code: 200, msg: "订单删除成功，库存已自动恢复" });

  } catch (error) {
    // 事务回滚
    if (connection) await connection.rollback();
    console.error("删除订单报错：", error);
    return res.json({ code: 500, msg: "删除失败，服务异常" });
  } finally {
    if (connection) connection.release();
  }
};
// 导出所有方法（新增 deleteOrder）
module.exports = { 
  getPayInfo, 
  submitPay,
  getDirectPayGoodsInfo,
  submitDirectPay,
  deleteOrder  // 👈 导出新增接口
};