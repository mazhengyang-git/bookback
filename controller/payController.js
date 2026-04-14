const pool = require('../config/db');

// 统一订单号生成逻辑（保证唯一）
const createOrderNo = (userId) => {
  const timestamp = Date.now().toString(); 
  const random = Math.floor(100000 + Math.random() * 900000).toString(); 
  const userIdSuffix = userId.toString().slice(-2); 
  return 'OD' + timestamp + random + userIdSuffix;
};

// 1. 购物车支付-获取支付信息（保留）
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

// 2. 购物车支付-提交支付（保留）
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

    // 插入订单
    for (let item of cartItems) {
      const orderNo = createOrderNo(userId);
      const bookPrice = item.book_price ? Number(item.book_price) : 0;
      const quantity = item.quantity ? Number(item.quantity) : 1;
      const totalPrice = (bookPrice * quantity).toFixed(2);

      await connection.execute(
        `INSERT INTO \`order\` (order_no, user_id, book_id, count, total_price, status) 
         VALUES (?, ?, ?, ?, ?, ?)`,
        [orderNo, userId, item.goods_id, quantity, totalPrice, '已付款']
      );
    }

    // 删除购物车商品
    const deleteSql = `DELETE FROM cart WHERE id IN (${placeholders}) AND user_id = ?`;
    await connection.execute(deleteSql, [...cartIds, userId]);

    await connection.commit();
    res.status(200).json({ code: 200, msg: '支付成功', data: { orderNo: createOrderNo(userId) } });
  } catch (error) {
    if (connection) await connection.rollback();
    console.error('[submitPay] 错误:', error);
    res.status(500).json({ code: 500, msg: '支付失败', data: {} });
  } finally {
    if (connection) connection.release();
  }
};

// 3. 🔴 最终修复：直付-获取商品信息（匹配book表+字段）
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

    // 2. 查询图书信息（⚠️ 表名是book，字段是book_name/price）
    const [books] = await pool.execute(
      'SELECT id, book_name AS name, price, cover, stock FROM book WHERE id = ?',
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

    // 5. 返回统一格式（和购物车商品对齐）
    res.status(200).json({
      code: 200,
      msg: '获取直付信息成功',
      data: {
        bookId: book.id,
        name: book.book_name, // 直接用原字段名，或用book.name（AS映射后）
        cover: book.cover || '',
        spec: '平装版',
        count: buyCount,
        price: book.price
      }
    });
  } catch (error) {
    console.error('[getDirectPayGoodsInfo] 错误:', error);
    // 统一返回500错误格式
    res.status(500).json({ 
      code: 500, 
      msg: '服务器异常：获取直付商品信息失败', 
      data: null 
    });
  }
};

// 4. 🔴 最终修复：直付-提交支付（匹配book表+order表，移除pay_type）
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

    // 3. 校验图书和库存（表名book）
    const [books] = await connection.execute(
      'SELECT id, book_name, price, stock FROM book WHERE id = ?',
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

    // 5. 插入订单表（⚠️ 移除pay_type字段，匹配order表结构）
    await connection.execute(
      'INSERT INTO `order` (order_no, user_id, book_id, count, total_price, status) VALUES (?, ?, ?, ?, ?, ?)',
      [orderNo, userId, bookId, buyCount, totalAmount, '已付款']
    );

    // 6. 扣减库存（表名book）
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
    // 异常回滚
    if (connection) await connection.rollback();
    console.error('[submitDirectPay] 错误:', error);
    res.status(500).json({ 
      code: 500, 
      msg: '支付失败：服务器异常', 
      data: { orderNo: '' } 
    });
  } finally {
    // 释放连接
    if (connection) connection.release();
  }
};

// 导出所有方法
module.exports = { 
  getPayInfo, 
  submitPay,
  getDirectPayGoodsInfo,
  submitDirectPay 
};