const pool = require('../config/db');
const { formatBookRow } = require('./sellerHelper');

exports.getSellerBookList = async (req, res) => {
  try {
    const { category } = req.query;
    let sql = `
      SELECT sb.*, s.shop_name, s.avatar AS seller_avatar, s.id AS shop_id
      FROM seller_book sb
      INNER JOIN seller s ON sb.seller_id = s.id
      WHERE sb.status = 1
    `;
    const params = [];
    if (category && category !== '全部') {
      sql += ' AND sb.category = ?';
      params.push(category);
    }
    sql += ' ORDER BY sb.create_time DESC';
    const [rows] = await pool.execute(sql, params);
    const list = rows.map((r) => ({
      ...formatBookRow(r),
      shop_name: r.shop_name,
      seller_avatar: r.seller_avatar,
      shop_id: r.shop_id,
    }));
    res.json({ code: 200, data: list });
  } catch (err) {
    console.error('获取卖家图书列表失败：', err);
    res.json({ code: 500, msg: '获取失败' });
  }
};

exports.getSellerBookDetail = async (req, res) => {
  try {
    const { id } = req.query;
    if (!id || isNaN(Number(id))) {
      return res.json({ code: 400, msg: '图书ID无效' });
    }
    const [rows] = await pool.execute(
      `SELECT sb.*, s.id AS shop_id, s.shop_name, s.avatar AS seller_avatar, s.intro AS shop_intro, s.contact AS shop_contact
       FROM seller_book sb
       INNER JOIN seller s ON sb.seller_id = s.id
       WHERE sb.id = ? AND sb.status = 1`,
      [Number(id)]
    );
    if (!rows.length) return res.json({ code: 404, msg: '图书不存在' });
    const row = rows[0];
    res.json({
      code: 200,
      data: {
        ...formatBookRow(row),
        shop_id: row.shop_id,
        shop_name: row.shop_name,
        seller_avatar: row.seller_avatar,
        shop_intro: row.shop_intro,
        shop_contact: row.shop_contact,
      },
    });
  } catch (err) {
    console.error('获取卖家图书详情失败：', err);
    res.json({ code: 500, msg: '获取失败' });
  }
};

exports.getSellerHome = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) return res.json({ code: 400, msg: '卖家ID不能为空' });

    const [sellerRows] = await pool.execute('SELECT * FROM seller WHERE id = ?', [id]);
    if (!sellerRows.length) return res.json({ code: 404, msg: '店铺不存在' });
    const seller = sellerRows[0];

    const [books] = await pool.execute(
      'SELECT * FROM seller_book WHERE seller_id = ? AND status = 1 ORDER BY create_time DESC',
      [id]
    );

    res.json({
      code: 200,
      data: {
        seller,
        books: books.map(formatBookRow),
      },
    });
  } catch (err) {
    console.error('获取卖家主页失败：', err);
    res.json({ code: 500, msg: '获取失败' });
  }
};

exports.searchShops = async (req, res) => {
  try {
    const { keyword } = req.query;
    let sql = 'SELECT id, shop_name, avatar, intro, contact, create_time FROM seller WHERE 1=1';
    const params = [];
    if (keyword && keyword.trim()) {
      sql += ' AND shop_name LIKE ?';
      params.push(`%${keyword.trim()}%`);
    }
    sql += ' ORDER BY create_time DESC';
    const [rows] = await pool.execute(sql, params);
    res.json({ code: 200, data: rows });
  } catch (err) {
    console.error('搜索店铺失败：', err);
    res.json({ code: 500, msg: '搜索失败' });
  }
};

exports.getAllShops = async (req, res) => {
  try {
    const [rows] = await pool.execute(
      'SELECT id, shop_name, avatar, intro, contact, create_time FROM seller ORDER BY create_time DESC'
    );
    res.json({ code: 200, data: rows });
  } catch (err) {
    console.error('获取店铺列表失败：', err);
    res.json({ code: 500, msg: '获取失败' });
  }
};
