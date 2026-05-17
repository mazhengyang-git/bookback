const pool = require('../config/db');
const { adjustBookSalesDelta } = require('../utils/bookSales');
const bcrypt = require('bcrypt'); 
// 统一订单号生成逻辑
const createOrderNo = (userId) => {
  const timestamp = Date.now().toString(); 
  const random = Math.floor(100000 + Math.random() * 900000).toString(); 
  const userIdSuffix = userId.toString().slice(-2); 
  return 'OD' + timestamp + random + userIdSuffix;
};

// 1. 购物车支付-获取支付信息（新书+普通书库存 + 优惠价）
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

    const [cartItems] = await pool.execute(sql, params);

    // 核心：根据source查询对应表，补全信息+库存+优惠价
    const payList = [];
    for (let item of cartItems) {
      let realGoods = null;
      // 新书：查 newbook 表 + 库存 + 优惠表
      if (item.source === 'new') {
        const [newBook] = await pool.execute(`
          SELECT nb.book_name, nb.price, nb.cover, nb.stock, bd.discount_price
          FROM newbook nb
          LEFT JOIN book_discount bd ON nb.id = bd.book_id AND bd.book_type = 1
          WHERE nb.id = ?
        `, [item.goods_id]);
        realGoods = newBook[0] || {};
      } 
      // 普通书：查 book 表 + 库存 + 优惠表
      else {
        const [book] = await pool.execute(`
          SELECT b.book_name, b.price, b.cover, b.stock, bd.discount_price
          FROM book b
          LEFT JOIN book_discount bd ON b.id = bd.book_id AND bd.book_type = 0
          WHERE b.id = ?
        `, [item.goods_id]);
        realGoods = book[0] || {};
      }

      payList.push({
        ...item,
        book_name: realGoods.book_name || '未知图书',
        book_price: realGoods.price || 0,
        discount_price: realGoods.discount_price || null, // 返回优惠价
        book_cover: realGoods.cover || '/default-book.png',
        stock: realGoods.stock || 0
      });
    }

    res.status(200).json({ code: 200, msg: '获取成功', data: payList });
  } catch (error) {
    console.error('[getPayInfo] 错误:', error);
    res.status(500).json({ code: 500, msg: '获取支付信息失败', data: [] });
  }
};

// 2. 购物车支付-提交支付新书+普通书库存校验+扣减 
const submitPay = async (req, res) => {
  let connection;
  try {
    let { cartIds, address } = req.body;
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
    if (!address || !address.province || !address.city || !address.detail) {
      return res.status(400).json({ code: 400, msg: '请完善收货地址', data: {} });
    }

    connection = await pool.getConnection();
    await connection.beginTransaction();

    const placeholders = cartIds.map(() => '?').join(',');
    const cartSql = `SELECT * FROM cart WHERE id IN (${placeholders}) AND user_id = ?`;
    const [cartItems] = await connection.execute(cartSql, [...cartIds, userId]);

    if (cartItems.length === 0) {
      await connection.rollback();
      return res.status(400).json({ code: 400, msg: '购物车商品不存在', data: {} });
    }

    let lastOrderNo = '';

    for (let item of cartItems) {
      const orderNo = createOrderNo(userId);
      lastOrderNo = orderNo;
      const bookPrice = item.book_price ? Number(item.book_price) : 0;
      const quantity = Number(item.quantity) || 1;

      // 优惠价支付
      const discountPrice = item.discount_price ? Number(item.discount_price) : bookPrice;
      const totalPrice = (discountPrice * quantity).toFixed(2);
     

      const bookId = item.goods_id;
      const source = item.source || 'normal';

      let stock = 0;
      if (source === 'new') {
        const [newBookInfo] = await connection.execute(
          'SELECT stock FROM newbook WHERE id = ? FOR UPDATE',
          [bookId]
        );
        if (!newBookInfo.length) {
          await connection.rollback();
          return res.status(400).json({ code: 400, msg: '新书不存在，支付失败', data: {} });
        }
        stock = newBookInfo[0].stock;
      } else {
        const [bookInfo] = await connection.execute(
          'SELECT stock FROM book WHERE id = ? FOR UPDATE',
          [bookId]
        );
        if (!bookInfo.length) {
          await connection.rollback();
          return res.status(400).json({ code: 400, msg: '图书不存在，支付失败', data: {} });
        }
        stock = bookInfo[0].stock;
      }

      if (stock < quantity) {
        await connection.rollback();
        return res.status(400).json({ 
          code: 400, 
          msg: source === 'new' ? `新书库存不足，仅剩${stock}本` : `图书库存不足，仅剩${stock}本`, 
          data: {} 
        });
      }

      if (source === 'new') {
        await connection.execute(
          'UPDATE newbook SET stock = stock - ? WHERE id = ?',
          [quantity, bookId]
        );
      } else {
        await connection.execute(
          'UPDATE book SET stock = stock - ? WHERE id = ?',
          [quantity, bookId]
        );
      }

      await connection.execute(
        `INSERT INTO \`order\` (order_no, user_id, book_id, count, total_price, status, source,province, city, district, detail_address) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [orderNo, userId, bookId, quantity, totalPrice, '已付款', source,address.province, address.city, address.district, address.detail]
      );
    }

    const deleteSql = `DELETE FROM cart WHERE id IN (${placeholders}) AND user_id = ?`;
    await connection.execute(deleteSql, [...cartIds, userId]);

    await connection.commit();
    res.status(200).json({ code: 200, msg: '支付成功', data: { orderNo: lastOrderNo } });
  } catch (error) {
    if (connection) await connection.rollback();
    console.error('[submitPay] 错误:', error);
    res.status(500).json({ code: 500, msg: '支付失败', data: {} });
  } finally {
    if (connection) connection.release();
  }
};
// 3. 直付-获取商品信息（支持新书+普通书 + 返回优惠价discount_price）
const getDirectPayGoodsInfo = async (req, res) => {
  try {
    const { bookId, buyCount, source } = req.body;
    const userId = req.user.id;

    // 1. 基础参数校验
    if (!bookId || !buyCount || buyCount < 1) {
      return res.status(400).json({ 
        code: 400, 
        msg: '参数错误：图书ID/购买数量不能为空且数量需≥1', 
        data: null 
      });
    }

    let book = null;
    // 2. 根据source查询对应表 + 左联优惠表，获取discount_price
    if (source === 'new') {
      // 新书：book_type=1
      const [newBook] = await pool.execute(`
        SELECT nb.id, nb.book_name, nb.price, nb.cover, nb.stock, bd.discount_price
        FROM newbook nb
        LEFT JOIN book_discount bd ON nb.id = bd.book_id AND bd.book_type = 1
        WHERE nb.id = ?
      `, [bookId]);
      book = newBook[0];
    } else {
      // 普通书：book_type=0
      const [normalBook] = await pool.execute(`
        SELECT b.id, b.book_name, b.price, b.cover, b.stock, bd.discount_price
        FROM book b
        LEFT JOIN book_discount bd ON b.id = bd.book_id AND bd.book_type = 0
        WHERE b.id = ?
      `, [bookId]);
      book = normalBook[0];
    }

    // 3. 图书存在性校验
    if (!book) {
      return res.status(400).json({ 
        code: 400, 
        msg: '图书不存在', 
        data: null 
      });
    }

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
        price: book.price,
        discount_price: book.discount_price || null // 返回优惠价
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

// 4. 直付-提交支付（新书+普通书+防超卖+source）
const submitDirectPay = async (req, res) => {
  let connection;
  try {
    const { bookId, buyCount, source, address } = req.body;
    const userId = req.user.id;

    if (!bookId || !buyCount || buyCount < 1) {
      return res.status(400).json({ 
        code: 400, 
        msg: '参数错误：图书ID/购买数量不能为空且数量需≥1', 
        data: { orderNo: '' } 
      });
    }

    connection = await pool.getConnection();
    await connection.beginTransaction();

    let book = null;
    if (source === 'new') {
      const [newBook] = await connection.execute(`
        SELECT id, book_name, price, stock, bd.discount_price
        FROM newbook nb
        LEFT JOIN book_discount bd ON nb.id = bd.book_id AND bd.book_type = 1
        WHERE nb.id = ? FOR UPDATE
      `, [bookId]);
      book = newBook[0];
    } else {
      const [normalBook] = await connection.execute(`
        SELECT b.id, b.book_name, b.price, b.stock, bd.discount_price
        FROM book b
        LEFT JOIN book_discount bd ON b.id = bd.book_id AND bd.book_type = 0
        WHERE b.id = ? FOR UPDATE
      `, [bookId]);
      book = normalBook[0];
    }

    if (!book) {
      await connection.rollback();
      return res.status(400).json({ 
        code: 400, 
        msg: '图书不存在', 
        data: { orderNo: '' } 
      });
    }

    if (buyCount > book.stock) {
      await connection.rollback();
      return res.status(400).json({ 
        code: 400, 
        msg: `库存不足！该图书仅剩${book.stock}本`, 
        data: { orderNo: '' } 
      });
    }

    const orderNo = createOrderNo(userId);

    // 优惠价支付
    const discountPrice = book.discount_price ? Number(book.discount_price) : Number(book.price);
    const totalAmount = (discountPrice * buyCount).toFixed(2);
    // =======================================================

    await connection.execute(
      `INSERT INTO \`order\` (
        order_no, user_id, book_id, count, total_price, status, source,
        province, city, district, detail_address
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        orderNo, userId, bookId, buyCount, totalAmount, '已付款', source,
        address.province, address.city, address.district, address.detail
      ]
    );

    if (source === 'new') {
      await connection.execute('UPDATE newbook SET stock = stock - ? WHERE id = ?', [buyCount, bookId]);
    } else {
      await connection.execute('UPDATE book SET stock = stock - ? WHERE id = ?', [buyCount, bookId]);
    }

    await connection.commit();
    console.log('[直付成功] 订单号:', orderNo);

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
// 删除订单 + 自动回加图书库存
// ==========================================================
const deleteOrder = async (req, res) => {
  let connection;
  try {
    const { orderNo } = req.body;
    const userId = req.user.id;

    if (!orderNo) {
      return res.json({ code: 400, msg: "订单编号不能为空" });
    }

    connection = await pool.getConnection();
    await connection.beginTransaction();

   const [orders] = await connection.execute(
      `SELECT id, book_id, \`count\`, status, source, COALESCE(sales_recorded,0) AS sales_recorded FROM \`order\` WHERE order_no = ? AND user_id = ?`,
      [orderNo, userId]
    );
    if (orders.length === 0) {
      await connection.rollback();
      return res.json({ code: 400, msg: "订单不存在或无权删除" });
    }

    const order = orders[0];
    if (Number(order.sales_recorded) === 1) {
      await adjustBookSalesDelta(connection, order, -Math.abs(Number(order.count) || 0));
    }
    const paidStatus = ["已付款", "待发货", "已完成", "已发货", "已收货"];
    if (paidStatus.includes(order.status)) {
      if (order.source === 'new') {
        await connection.execute('UPDATE newbook SET stock = stock + ? WHERE id = ?', [order.count, order.book_id]);
      } else {
        await connection.execute('UPDATE book SET stock = stock + ? WHERE id = ?', [order.count, order.book_id]);
      }
    }
    await connection.execute(
      `DELETE FROM \`order\` WHERE order_no = ? AND user_id = ?`,
      [orderNo, userId]
    );

    await connection.commit();
    return res.json({ code: 200, msg: "订单删除成功，库存已自动恢复" });

  } catch (error) {
    if (connection) await connection.rollback();
    console.error("删除订单报错：", error);
    return res.json({ code: 500, msg: "删除失败，服务异常" });
  } finally {
    if (connection) connection.release();
  }
};

const verifyUserPwd = async (req, res) => {
  try {
    const { password } = req.body;
    const userId = req.user.id;

    if (!password) {
      return res.status(200).json({ code: 400, msg: "请输入密码" });
    }

    const [user] = await pool.execute(
      "SELECT password FROM user WHERE id = ?",
      [userId]
    );

    if (!user.length) {
      return res.status(200).json({ code: 400, msg: "用户不存在" });
    }

    const hashedPwd = user[0].password;
    const isMatch = await bcrypt.compare(password, hashedPwd);

    if (!isMatch) {
      return res.status(200).json({ code: 400, msg: "输入的密码有误，无法支付" });
    }

    return res.status(200).json({ code: 200, msg: "密码正确" });
  } catch (error) {
    console.error("[verifyUserPwd] 错误:", error);
    return res.status(500).json({ code: 500, msg: "校验失败，请稍后重试" });
  }
};
// 导出所有方法
module.exports = { 
  getPayInfo, 
  submitPay,
  getDirectPayGoodsInfo,
  submitDirectPay,
  deleteOrder,
  verifyUserPwd 
};