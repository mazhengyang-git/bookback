const pool = require('../config/db');

const BOOK_FIELDS = [
  'book_name', 'author', 'author_into', 'category', 'price', 'stock',
  'cover', 'desc', 'mulu', 'status', 'publisher', 'sales_count', 'avg_score', 'comment_count'
];

function pickBookBody(body) {
  return {
    book_name: body.book_name?.trim(),
    author: body.author?.trim() || '',
    author_into: body.author_into || '',
    category: body.category || '',
    price: Number(body.price),
    stock: Number(body.stock) || 0,
    cover: body.cover || '',
    desc: body.desc || '',
    mulu: body.mulu || '',
    status: body.status !== undefined ? Number(body.status) : 1,
    publisher: body.publisher || '',
    sales_count: Number(body.sales_count) || 0,
    avg_score: Number(body.avg_score) || 0,
    comment_count: Number(body.comment_count) || 0,
  };
}

function validateBookBody(data) {
  if (!data.book_name) return '图书名称不能为空';
  if (!data.category) return '图书分类不能为空';
  if (!data.price || data.price <= 0) return '价格必须大于0';
  if (data.stock < 0) return '库存不能为负数';
  return null;
}

async function getOrCreateSeller(userId) {
  const [rows] = await pool.execute('SELECT * FROM seller WHERE user_id = ?', [userId]);
  if (rows.length) return rows[0];
  const [userRows] = await pool.execute('SELECT username, avatar, phone FROM user WHERE id = ?', [userId]);
  const u = userRows[0] || {};
  const [result] = await pool.execute(
    'INSERT INTO seller (user_id, avatar, shop_name, intro, contact) VALUES (?, ?, ?, ?, ?)',
    [userId, u.avatar || '', `${u.username || '卖家'}的店铺`, '欢迎光临本店', u.phone || '']
  );
  const [created] = await pool.execute('SELECT * FROM seller WHERE id = ?', [result.insertId]);
  return created[0];
}

function formatBookRow(row) {
  if (!row) return null;
  return {
    id: row.id,
    seller_id: row.seller_id,
    name: row.book_name,
    book_name: row.book_name,
    author: row.author,
    author_into: row.author_into,
    category: row.category,
    price: row.price,
    stock: row.stock,
    sales_count: row.sales_count,
    cover: row.cover,
    desc: row.desc,
    mulu: row.mulu,
    status: row.status,
    publisher: row.publisher,
    avg_score: row.avg_score,
    comment_count: row.comment_count,
    audit_status: row.audit_status,
    audit_reason: row.audit_reason,
    create_time: row.create_time,
    is_seller: true,
    book_type: 2,
  };
}

module.exports = {
  BOOK_FIELDS,
  pickBookBody,
  validateBookBody,
  getOrCreateSeller,
  formatBookRow,
};
