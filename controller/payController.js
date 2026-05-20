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

// 1. 购物车支付-获取支付信息
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
    // 从各类型主表获取实时原价
    const sql = `
      SELECT 
        c.id,
        c.goods_id,
        c.quantity,
        c.spec,
        c.book_name,
        -- 从主表获取实时原价，覆盖购物车表中保存的错误价格
        COALESCE(nb.price, sb.price, b.price, c.book_price) AS original_price,
        -- 按source关联对应book_type的优惠价
        CASE 
          WHEN c.source = 'new' THEN bd3.discount_price
          WHEN c.source = 'seller' THEN bd2.discount_price
          ELSE bd.discount_price
        END AS discount_price,
        c.book_cover,
        c.source,
        -- 库存兼容所有来源
        COALESCE(b.stock, sb.stock, nb.stock, 999) AS stock
      FROM cart c
      -- 关联普通图书
      LEFT JOIN book b ON c.goods_id = b.id AND c.source = 'normal'
      LEFT JOIN book_discount bd ON c.goods_id = bd.book_id AND bd.book_type = 0
      -- 关联商家图书
      LEFT JOIN seller_book sb ON c.goods_id = sb.id AND c.source = 'seller'
      LEFT JOIN book_discount bd2 ON c.goods_id = bd2.book_id AND bd2.book_type = 2
      -- 关联新书
      LEFT JOIN newbook nb ON c.goods_id = nb.id AND c.source = 'new'
      LEFT JOIN book_discount bd3 ON c.goods_id = bd3.book_id AND bd3.book_type = 1
      WHERE c.id IN (${placeholders}) AND c.user_id = ?
    `;
    const params = [...cartIds, userId];

    const [cartItems] = await pool.execute(sql, params);

    const payList = cartItems.map(item => ({
      ...item,
      book_price: Number(item.original_price) || 0,
      // 优惠价：只有当优惠价存在且小于原价时才生效
      discount_price: (item.discount_price && Number(item.discount_price) < Number(item.original_price)) 
        ? Number(item.discount_price) 
        : null,
      stock: item.stock
    }));

    res.status(200).json({ code: 200, msg: '获取成功', data: payList });
  } catch (error) {
    console.error('[getPayInfo] 错误:', error);
    res.status(500).json({ code: 500, msg: '获取支付信息失败', data: [] });
  }
};
// 2. 购物车支付-提交支付
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
    // 从各类型主表获取实时原价
    const cartSql = `
      SELECT 
        c.id,
        c.goods_id,
        c.quantity,
        c.source,
        -- 从主表获取实时原价
        COALESCE(nb.price, sb.price, b.price, c.book_price) AS original_price,
        -- 按source关联对应book_type的优惠价
        CASE 
          WHEN c.source = 'new' THEN bd3.discount_price
          WHEN c.source = 'seller' THEN bd2.discount_price
          ELSE bd.discount_price
        END AS discount_price
      FROM cart c
      -- 关联普通图书
      LEFT JOIN book b ON c.goods_id = b.id AND c.source = 'normal'
      LEFT JOIN book_discount bd ON c.goods_id = bd.book_id AND bd.book_type = 0
      -- 关联商家图书
      LEFT JOIN seller_book sb ON c.goods_id = sb.id AND c.source = 'seller'
      LEFT JOIN book_discount bd2 ON c.goods_id = bd2.book_id AND bd2.book_type = 2
      -- 关联新书
      LEFT JOIN newbook nb ON c.goods_id = nb.id AND c.source = 'new'
      LEFT JOIN book_discount bd3 ON c.goods_id = bd3.book_id AND bd3.book_type = 1
      WHERE c.id IN (${placeholders}) AND c.user_id = ?
    `;
    const [cartItems] = await connection.execute(cartSql, [...cartIds, userId]);

    if (cartItems.length === 0) {
      await connection.rollback();
      return res.status(400).json({ code: 400, msg: '购物车商品不存在', data: {} });
    }

    let lastOrderNo = '';

    for (let item of cartItems) {
      const orderNo = createOrderNo(userId);
      lastOrderNo = orderNo;
      const originalPrice = Number(item.original_price) || 0;
      const quantity = Number(item.quantity) || 1;
      
      // 优先使用优惠价计算订单总金额
      const finalPrice = (item.discount_price && Number(item.discount_price) < originalPrice) 
        ? Number(item.discount_price) 
        : originalPrice;
      const totalPrice = (finalPrice * quantity).toFixed(2);

      const bookId = item.goods_id;
      const source = item.source || 'normal';
      let stock = 0;

      // 库存查询
      if (source === 'new') {
        const [newBookInfo] = await connection.execute('SELECT stock FROM newbook WHERE id = ? FOR UPDATE', [bookId]);
        if (!newBookInfo.length) { await connection.rollback(); return res.status(400).json({ code: 400, msg: '新书不存在', data: {} }); }
        stock = newBookInfo[0].stock;
      } else if (source === 'seller') {
        const [sellerBookInfo] = await connection.execute('SELECT stock FROM seller_book WHERE id = ? FOR UPDATE', [bookId]);
        if (!sellerBookInfo.length) { await connection.rollback(); return res.status(400).json({ code: 400, msg: '商家书不存在', data: {} }); }
        stock = sellerBookInfo[0].stock;
      } else {
        const [bookInfo] = await connection.execute('SELECT stock FROM book WHERE id = ? FOR UPDATE', [bookId]);
        if (!bookInfo.length) { await connection.rollback(); return res.status(400).json({ code: 400, msg: '图书不存在', data: {} }); }
        stock = bookInfo[0].stock;
      }

      if (stock < quantity) {
        await connection.rollback();
        return res.status(400).json({ code: 400, msg: `库存不足，仅剩${stock}本`, data: {} });
      }

      // 库存扣减
      if (source === 'new') {
        await connection.execute('UPDATE newbook SET stock = stock - ? WHERE id = ?', [quantity, bookId]);
      } else if (source === 'seller') {
        await connection.execute('UPDATE seller_book SET stock = stock - ? WHERE id = ?', [quantity, bookId]);
      } else {
        await connection.execute('UPDATE book SET stock = stock - ? WHERE id = ?', [quantity, bookId]);
      }

      // 插入订单
      await connection.execute(
        `INSERT INTO \`order\` (order_no, user_id, book_id, \`count\`, total_price, status, source, province, city, district, detail_address)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [orderNo, userId, bookId, quantity, totalPrice, '已付款', source, address.province, address.city, address.district || '', address.detail]
      );
    }

    // 删除购物车
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
// 3. 直付-获取商品信息（全类型兼容）

const getDirectPayGoodsInfo = async (req, res) => {
  try {
    const { bookId, buyCount, source } = req.body;
    const userId = req.user.id;

    if (!bookId || !buyCount || buyCount < 1) {
      return res.status(400).json({ code: 400, msg: '参数错误', data: null });
    }

    let book = null;
    // 分source查询，同时关联优惠表
    if (source === 'new') {
      // 新书：关联book_discount，book_type=1
      const [newBook] = await pool.execute(`
        SELECT nb.id, nb.book_name, nb.price, nb.cover, nb.stock, bd.discount_price 
        FROM newbook nb 
        LEFT JOIN book_discount bd ON nb.id = bd.book_id AND bd.book_type = 1 
        WHERE nb.id = ?
      `, [bookId]);
      book = newBook[0];
    } else if (source === 'seller') {
      // 商家书：关联book_discount，book_type=2
      const [sellerBook] = await pool.execute(`
        SELECT sb.id, sb.book_name, sb.price, sb.cover, sb.stock, bd.discount_price 
        FROM seller_book sb 
        LEFT JOIN book_discount bd ON sb.id = bd.book_id AND bd.book_type = 2 
        WHERE sb.id = ?
      `, [bookId]);
      book = sellerBook[0];
    } else {
      // 普通书：关联book_discount，book_type=0
      const [normalBook] = await pool.execute(`
        SELECT b.id, b.book_name, b.price, b.cover, b.stock, bd.discount_price 
        FROM book b 
        LEFT JOIN book_discount bd ON b.id = bd.book_id AND bd.book_type = 0 
        WHERE b.id = ?
      `, [bookId]);
      book = normalBook[0];
    }

    if (!book) {
      return res.status(400).json({ code: 400, msg: '图书不存在', data: null });
    }
    if (buyCount > book.stock) {
      return res.status(400).json({ code: 400, msg: `库存不足！仅剩${book.stock}本`, data: null });
    }

    // 优惠价：只有当优惠价存在且小于原价时才生效
    const finalDiscountPrice = (book.discount_price && book.discount_price < book.price) 
      ? book.discount_price 
      : null;

    res.status(200).json({
      code: 200,
      msg: '获取成功',
      data: {
        bookId: book.id,
        name: book.book_name,
        cover: book.cover || '',
        spec: '平装版',
        count: buyCount,
        price: book.price,
        discount_price: finalDiscountPrice 
      }
    });
  } catch (error) {
    console.error('[getDirectPayGoodsInfo] 错误:', error);
    res.status(500).json({ code: 500, msg: '获取信息失败', data: null });
  }
};
// 4. 直付-提交支付+ 全类型支持

const submitDirectPay = async (req, res) => {
  let connection;
  try {
    const { bookId, buyCount, source, address } = req.body;
    const userId = req.user.id;

    if (!bookId || !buyCount || buyCount < 1) {
      return res.status(400).json({ code: 400, msg: '参数错误', data: { orderNo: '' } });
    }

    connection = await pool.getConnection();
    await connection.beginTransaction();

    let book = null;
    // 分source查询，同时获取优惠价
    if (source === 'new') {
      const [newBook] = await connection.execute(`
        SELECT nb.id, nb.book_name, nb.price, nb.stock, bd.discount_price 
        FROM newbook nb 
        LEFT JOIN book_discount bd ON nb.id = bd.book_id AND bd.book_type = 1 
        WHERE nb.id = ? FOR UPDATE
      `, [bookId]);
      book = newBook[0];
    } else if (source === 'seller') {
      const [sellerBook] = await connection.execute(`
        SELECT sb.id, sb.book_name, sb.price, sb.stock, bd.discount_price 
        FROM seller_book sb 
        LEFT JOIN book_discount bd ON sb.id = bd.book_id AND bd.book_type = 2 
        WHERE sb.id = ? FOR UPDATE
      `, [bookId]);
      book = sellerBook[0];
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
      return res.status(400).json({ code: 400, msg: '图书不存在', data: { orderNo: '' } });
    }
    if (buyCount > book.stock) {
      await connection.rollback();
      return res.status(400).json({ code: 400, msg: `库存不足！仅剩${book.stock}本`, data: { orderNo: '' } });
    }

    // 优先使用优惠价计算订单金额
    const finalPrice = (book.discount_price && book.discount_price < book.price) 
      ? Number(book.discount_price) 
      : Number(book.price);
    const totalAmount = (finalPrice * buyCount).toFixed(2);

    const orderNo = createOrderNo(userId);

    // 插入订单（total_price使用优惠价）
    await connection.execute(
      `INSERT INTO \`order\` (
        order_no, user_id, book_id, \`count\`, total_price, status, source,
        province, city, district, detail_address
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        orderNo, userId, bookId, buyCount, totalAmount, '已付款', source,
        address.province, address.city, address.district || '', address.detail
      ]
    );

    // 库存扣减逻辑
    if (source === 'new') {
      await connection.execute('UPDATE newbook SET stock = stock - ? WHERE id = ?', [buyCount, bookId]);
    } else if (source === 'seller') {
      await connection.execute('UPDATE seller_book SET stock = stock - ? WHERE id = ?', [buyCount, bookId]);
    } else {
      await connection.execute('UPDATE book SET stock = stock - ? WHERE id = ?', [buyCount, bookId]);
    }

    await connection.commit();
    res.status(200).json({ code: 200, msg: '支付成功', data: { orderNo } });

  } catch (error) {
    if (connection) await connection.rollback();
    console.error('[submitDirectPay] 错误:', error);
    res.status(500).json({ code: 500, msg: '支付失败', data: { orderNo: '' } });
  } finally {
    if (connection) connection.release();
  }
};
// 删除订单
const deleteOrder = async (req, res) => {
  let connection;
  try {
    const { orderNo } = req.body;
    const userId = req.user.id;
    if (!orderNo) return res.json({ code: 400, msg: "订单编号不能为空" });

    connection = await pool.getConnection();
    await connection.beginTransaction();

    const [orders] = await connection.execute(
      `SELECT id, book_id, \`count\`, status, source FROM \`order\` WHERE order_no = ? AND user_id = ?`,
      [orderNo, userId]
    );
    if (!orders.length) { await connection.rollback(); return res.json({ code: 400, msg: "订单不存在" }); }

    const order = orders[0];
    const paidStatus = ["已付款", "待发货", "已完成", "已发货", "已收货"];
    
    // 库存回滚
    if (paidStatus.includes(order.status)) {
      if (order.source === 'new') {
        await connection.execute('UPDATE newbook SET stock = stock + ? WHERE id = ?', [order.count, order.book_id]);
      } else if (order.source === 'seller') {
        await connection.execute('UPDATE seller_book SET stock = stock + ? WHERE id = ?', [order.count, order.book_id]);
      } else {
        await connection.execute('UPDATE book SET stock = stock + ? WHERE id = ?', [order.count, order.book_id]);
      }
    }

    await connection.execute(`DELETE FROM \`order\` WHERE order_no = ? AND user_id = ?`, [orderNo, userId]);
    await connection.commit();
    return res.json({ code: 200, msg: "订单删除成功，库存已恢复" });

  } catch (error) {
    if (connection) await connection.rollback();
    console.error("删除订单报错：", error);
    return res.json({ code: 500, msg: "删除失败" });
  } finally {
    if (connection) connection.release();
  }
};

// 密码验证
const verifyUserPwd = async (req, res) => {
  try {
    const { password } = req.body;
    const userId = req.user.id;
    if (!password) return res.status(200).json({ code: 400, msg: "请输入密码" });

    const [user] = await pool.execute("SELECT password FROM user WHERE id = ?", [userId]);
    if (!user.length) return res.status(200).json({ code: 400, msg: "用户不存在" });

    const isMatch = await bcrypt.compare(password, user[0].password);
    if (!isMatch) return res.status(200).json({ code: 400, msg: "密码错误" });

    return res.status(200).json({ code: 200, msg: "密码正确" });
  } catch (error) {
    console.error("[verifyUserPwd] 错误:", error);
    return res.status(500).json({ code: 500, msg: "校验失败" });
  }
};

module.exports = {
  getPayInfo,
  submitPay,
  getDirectPayGoodsInfo,
  submitDirectPay,
  deleteOrder,
  verifyUserPwd
};