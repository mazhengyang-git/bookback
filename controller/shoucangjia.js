//导入数据库连接
const pool = require('../config/db')


//1.加入收藏夹 

exports.addShoucang = async (req, res) => {
  try {
    const { goodsId, num, spec, source, bookName, bookCover, bookPrice } = req.body;
    const userId = req.user.id;

    if (!goodsId || !num || !spec) {
      return res.json({ code: 400, msg: '参数缺失：goodsId/num/spec不能为空' });
    }

    // 使用前端传过来的source
    const finalSource = source || 'normal';

    // source判断，避免不同来源的同ID冲突
    const [exist] = await pool.execute(
      'SELECT id FROM shoucang WHERE user_id = ? AND goods_id = ? AND spec = ? AND source = ?',
      [userId, goodsId, spec, finalSource]
    );
    if (exist.length > 0) {
      return res.json({ code: 400, msg: '该图书已在收藏夹中' });
    }

    let bookInfo = null;
    // 根据source查询图书信息
    if (finalSource === 'new') {
      // 新书：从newbook表查询最新信息
      const [newRows] = await pool.execute('SELECT book_name, price, cover FROM newbook WHERE id = ?', [goodsId]);
      if (!newRows.length) return res.json({ code: 400, msg: '新书不存在' });
      bookInfo = newRows[0];
    } else if (finalSource === 'seller') {
      // 商家书：从seller_book表查询
      const [sellerRows] = await pool.execute('SELECT book_name, price, cover FROM seller_book WHERE id = ?', [goodsId]);
      if (!sellerRows.length) return res.json({ code: 400, msg: '商家图书不存在' });
      bookInfo = sellerRows[0];
    } else {
      // 普通图书：从book表查询
      const [bookRows] = await pool.execute('SELECT book_name, price, cover FROM book WHERE id = ?', [goodsId]);
      if (!bookRows.length) return res.json({ code: 400, msg: '普通图书不存在' });
      bookInfo = bookRows[0];
    }

    // 插入时保存source
    await pool.execute(
      `INSERT INTO shoucang (user_id, goods_id, quantity, spec, book_name, book_price, book_cover, source)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [userId, goodsId, num, spec, bookInfo.book_name, bookInfo.price, bookInfo.cover, finalSource]
    );

    res.json({ code: 200, msg: '收藏成功' });
  } catch (error) {
    console.error(error);
    res.json({ code: 500, msg: '服务器错误' });
  }
};
//2.获取收藏夹列表


exports.getShoucangList = async (req, res) => {
  try {
    const userId = req.user.id;
    const [shoucangList] = await pool.execute(`
      SELECT 
        c.id AS shoucang_id,
        c.goods_id,
        c.spec,
        c.source,
        c.book_name,
        c.book_price AS original_price,
        -- 根据source关联对应book_type的优惠
        CASE 
          WHEN c.source = 'new' THEN bd3.discount_price
          WHEN c.source = 'seller' THEN bd2.discount_price
          ELSE bd.discount_price
        END AS discount_price,
        -- 根据实际优惠价计算折扣率
        CASE 
          WHEN 
            (c.source = 'new' AND bd3.discount_price IS NOT NULL AND bd3.discount_price < c.book_price) OR
            (c.source = 'seller' AND bd2.discount_price IS NOT NULL AND bd2.discount_price < c.book_price) OR
            (c.source = 'normal' AND bd.discount_price IS NOT NULL AND bd.discount_price < c.book_price)
          THEN ROUND(
            (
              CASE 
                WHEN c.source = 'new' THEN bd3.discount_price
                WHEN c.source = 'seller' THEN bd2.discount_price
                ELSE bd.discount_price
              END / c.book_price
            ) * 10, 
            1
          )
          ELSE NULL 
        END AS discount_rate,
        -- 封面兼容所有来源
        COALESCE(b.cover, sb.cover, nb.cover, c.book_cover) AS cover
      FROM shoucang c
      -- 关联普通图书优惠（book_type=0）
      LEFT JOIN book b ON c.goods_id = b.id AND c.source = 'normal'
      LEFT JOIN book_discount bd ON c.goods_id = bd.book_id AND bd.book_type = 0
      -- 关联商家图书优惠（book_type=2）
      LEFT JOIN seller_book sb ON c.goods_id = sb.id AND c.source = 'seller'
      LEFT JOIN book_discount bd2 ON c.goods_id = bd2.book_id AND bd2.book_type = 2
      -- 关联新书优惠（book_type=1）
      LEFT JOIN newbook nb ON c.goods_id = nb.id AND c.source = 'new'
      LEFT JOIN book_discount bd3 ON c.goods_id = bd3.book_id AND bd3.book_type = 1
      WHERE c.user_id = ?
    `, [userId]);

    const formatShoucangList = shoucangList.map(item => ({
      shoucangId: item.shoucang_id,
      id: item.goods_id,
      name: item.book_name || '未知图书',
      price: Number(item.original_price) || 0,
      // 优惠价为空时返回null
      discount_price: item.discount_price ? Number(item.discount_price) : null,
      discount_rate: item.discount_rate,
      cover: item.cover || '/default-book.png',
      spec: item.spec || '平装版',
      source: item.source || 'normal'
    }));

    res.json({ code: 200, msg: '获取收藏夹列表成功', data: formatShoucangList });
  } catch (error) {
    console.error(error);
    res.json({ code: 500, msg: '服务器错误', data: [] });
  }
};

//3.删除收藏夹项
exports.deleteShoucang = async (req, res) => {
  try {
    const { shoucangId } = req.body;
    const userId = req.user.id;

    const [shoucang] = await pool.execute(
      'SELECT * FROM shoucang WHERE id = ? AND user_id = ?',
      [shoucangId, userId]
    );
    if (!shoucang.length) {
      return res.json({ code: 403, msg: '无权删除该收藏夹项' });
    }

    await pool.execute('DELETE FROM shoucang WHERE id = ?', [shoucangId]);
    res.json({ code: 200, msg: '删除成功' });
  } catch (error) {
    console.error('删除收藏夹失败：', error);
    res.json({ code: 500, msg: '服务器错误' });
  }
};

//4.清空收藏夹
exports.clearShoucang = async (req, res) => {
  try {
    const userId = req.user.id;
    await pool.execute('DELETE FROM shoucang WHERE user_id = ?', [userId]);
    res.json({ code: 200, msg: '收藏夹已清空' });
  } catch (error) {
    console.error('清空收藏夹失败：', error);
    res.json({ code: 500, msg: '服务器错误' });
  }
};