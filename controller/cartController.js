//导入数据库连接
const pool = require('../config/db')


//1.加入购物车 
exports.addCart = async (req, res) => {
  try {
    const { goodsId, num, spec, source } = req.body;
    const userId = req.user.id;

    //1.参数校验
    if (!goodsId || !num || !spec) {
      return res.json({ code: 400, msg: '参数缺失：goodsId/num/spec不能为空' });
    }
    if (!Number.isInteger(num) || num <= 0) {
      return res.json({ code: 400, msg: '数量必须是大于0的整数' });
    }

    let bookInfo = null;
    // 所有类型图书都从数据库获取最新信息，不依赖前端传参
    if (source === 'new') {
      const [newRows] = await pool.execute('SELECT book_name, price, cover FROM newbook WHERE id = ?', [goodsId]);
      if (!newRows.length) return res.json({ code: 400, msg: '新书不存在' });
      bookInfo = newRows[0];
    } else if (source === 'seller') {
      const [sellerRows] = await pool.execute('SELECT book_name, price, cover FROM seller_book WHERE id = ?', [goodsId]);
      if (!sellerRows.length) return res.json({ code: 400, msg: '商家图书不存在' });
      bookInfo = sellerRows[0];
    } else {
      const [bookRows] = await pool.execute('SELECT book_name, price, cover FROM book WHERE id = ?', [goodsId]);
      if (!bookRows.length) return res.json({ code: 400, msg: '普通图书不存在' });
      bookInfo = bookRows[0];
    }

    //3.查询当前购物车已有的数量
    const [existCart] = await pool.execute(
      'SELECT id, quantity FROM cart WHERE user_id = ? AND goods_id = ? AND spec = ? AND source = ?',
      [userId, goodsId, spec, source || 'normal']
    );

    const alreadyInCart = existCart.length > 0 ? existCart[0].quantity : 0;
    const totalWillBe = alreadyInCart + num;

    // 库存校验
    let stock = 0;
    if (source === 'new') {
      const [newBookInfo] = await pool.execute('SELECT stock FROM newbook WHERE id = ?', [goodsId]);
      stock = newBookInfo[0]?.stock || 999;
    } else if (source === 'seller') {
      const [sellerBookInfo] = await pool.execute('SELECT stock FROM seller_book WHERE id = ?', [goodsId]);
      stock = sellerBookInfo[0]?.stock || 999;
    } else {
      const [bookInfo] = await pool.execute('SELECT stock FROM book WHERE id = ?', [goodsId]);
      stock = bookInfo[0]?.stock || 999;
    }

    if (totalWillBe > stock) {
      return res.json({
        code: 400,
        msg: `库存不足！购物车已有 ${alreadyInCart} 本，最多还能加 ${stock - alreadyInCart} 本`
      });
    }

    //5.有则更新，无则插入
    if (existCart.length > 0) {
      await pool.execute(
        'UPDATE cart SET quantity = quantity + ? WHERE id = ?',
        [num, existCart[0].id]
      );
    } else {
      await pool.execute(
        'INSERT INTO cart (user_id, goods_id, quantity, spec, book_name, book_price, book_cover, source) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
        [userId, goodsId, num, spec, bookInfo.book_name, bookInfo.price, bookInfo.cover, source || 'normal']
      );
    }

    res.json({ code: 200, msg: '加入购物车成功' });
  } catch (error) {
    console.error('加入购物车失败详情：', error);
    res.json({ code: 500, msg: '服务器错误' });
  }
};

exports.getCartList = async (req, res) => {
  try {
    const userId = req.user.id;
    //1.查询当前用户的购物车数据 查询source字段
    const [cartList] = await pool.execute(`
      SELECT 
        c.id AS cart_id,
        c.user_id,
        c.goods_id,
        c.quantity,
        c.spec,
        c.book_name,
        c.book_price,
        c.book_cover,
        c.source,
        b.cover AS book_cover_backup
      FROM cart c
      LEFT JOIN book b ON c.goods_id = b.id
      WHERE c.user_id = ?
    `, [userId]);

    //2.转换字段名 返回source给前端
    const formatCartList = cartList.map(item => ({
      id: item.cart_id,
      goodsId: item.goods_id,
      count: item.quantity,
      spec: item.spec || '平装版',
      bookName: item.book_name || '未知图书',
      price: item.book_price || 0,
      cover: item.book_cover || item.book_cover_backup || '/default-book.png',
      source: item.source || 'normal'
    }));

    res.json({
      code: 200,
      msg: '获取购物车列表成功',
      data: formatCartList
    });
  } catch (error) {
    console.error('获取购物车列表失败：', error);
    res.json({ code: 500, msg: '服务器错误', data: [] });
  }
};

//3.更新购物车数量
exports.updateCart = async (req, res) => {
  try {
    const { cartId, quantity } = req.body;
    const userId = req.user.id;

    if (!Number.isInteger(quantity) || quantity <= 0) {
      return res.json({ code: 400, msg: '数量必须大于0' });
    }

    //查购物车对应的商品 + 查询source
    const [cart] = await pool.execute(
      'SELECT goods_id, source FROM cart WHERE id = ? AND user_id = ?',
      [cartId, userId]
    );
    if (!cart.length) {
      return res.json({ code: 403, msg: '无权修改该购物车项' });
    }
    const { goods_id: goodsId, source } = cart[0];

    // 新书不校验库存
    if (source === 'new') {
      await pool.execute('UPDATE cart SET quantity = ? WHERE id = ?', [quantity, cartId]);
      return res.json({ code: 200, msg: '数量更新成功' });
    }

    // 普通书/卖家书校验库存
    let stock = 0;
    if (source === 'seller') {
      const [sellerRows] = await pool.execute('SELECT stock FROM seller_book WHERE id = ?', [goodsId]);
      if (!sellerRows.length) return res.json({ code: 400, msg: '图书不存在' });
      stock = sellerRows[0].stock;
    } else {
      const [bookRows] = await pool.execute('SELECT stock FROM book WHERE id = ?', [goodsId]);
      if (!bookRows.length) return res.json({ code: 400, msg: '图书不存在' });
      stock = bookRows[0].stock;
    }
    if (quantity > stock) {
      return res.json({ code: 400, msg: `库存不足，最多只能设置为 ${stock} 本` });
    }

    await pool.execute('UPDATE cart SET quantity = ? WHERE id = ?', [quantity, cartId]);
    res.json({ code: 200, msg: '数量更新成功' });
  } catch (error) {
    console.error('更新购物车失败：', error);
    res.json({ code: 500, msg: '服务器错误' });
  }
};

//4.删除购物车项
exports.deleteCart = async (req, res) => {
  try {
    const { cartId } = req.body;
    const userId = req.user.id;

    const [cart] = await pool.execute(
      'SELECT * FROM cart WHERE id = ? AND user_id = ?',
      [cartId, userId]
    );
    if (!cart.length) {
      return res.json({ code: 403, msg: '无权删除该购物车项' });
    }

    await pool.execute('DELETE FROM cart WHERE id = ?', [cartId]);
    res.json({ code: 200, msg: '删除成功' });
  } catch (error) {
    console.error('删除购物车失败：', error);
    res.json({ code: 500, msg: '服务器错误' });
  }
};

//5.清空购物车
exports.clearCart = async (req, res) => {
  try {
    const userId = req.user.id;
    await pool.execute('DELETE FROM cart WHERE user_id = ?', [userId]);
    res.json({ code: 200, msg: '购物车已清空' });
  } catch (error) {
    console.error('清空购物车失败：', error);
    res.json({ code: 500, msg: '服务器错误' });
  }
};