const pool = require('../config/db');
const { pickBookBody, validateBookBody, getOrCreateSeller } = require('./sellerHelper');

exports.getPublishedList = async (req, res) => {
  try {
    if (!req.user || req.user.role !== 'seller') {
      return res.json({ code: 403, msg: '无卖家权限' });
    }
    const seller = await getOrCreateSeller(req.user.id);
    const [list] = await pool.execute(
      'SELECT * FROM seller_book WHERE seller_id = ? ORDER BY create_time DESC',
      [seller.id]
    );
    res.json({ code: 200, msg: '获取成功', data: list });
  } catch (err) {
    console.error('获取已上架图书失败：', err);
    res.json({ code: 500, msg: '服务器错误' });
  }
};

exports.getPublishedDetail = async (req, res) => {
  try {
    if (!req.user || req.user.role !== 'seller') {
      return res.json({ code: 403, msg: '无卖家权限' });
    }
    const { id } = req.params;
    const seller = await getOrCreateSeller(req.user.id);
    const [rows] = await pool.execute(
      'SELECT * FROM seller_book WHERE id = ? AND seller_id = ?',
      [id, seller.id]
    );
    if (!rows.length) return res.json({ code: 404, msg: '图书不存在' });
    res.json({ code: 200, msg: '获取成功', data: rows[0] });
  } catch (err) {
    console.error('获取图书详情失败：', err);
    res.json({ code: 500, msg: '服务器错误' });
  }
};

exports.submitEditReapply = async (req, res) => {
  try {
    if (!req.user || req.user.role !== 'seller') {
      return res.json({ code: 403, msg: '无卖家权限' });
    }
    const { id } = req.params;
    const seller = await getOrCreateSeller(req.user.id);
    const [books] = await pool.execute(
      'SELECT * FROM seller_book WHERE id = ? AND seller_id = ?',
      [id, seller.id]
    );
    if (!books.length) return res.json({ code: 404, msg: '图书不存在' });

    const [pending] = await pool.execute(
      `SELECT id FROM seller_bookapply
       WHERE seller_id = ? AND source_book_id = ? AND audit_status = 0`,
      [seller.id, id]
    );
    if (pending.length) {
      return res.json({ code: 400, msg: '该图书已有待审核的修改申请，请等待审核' });
    }

    const data = pickBookBody(req.body);
    const errMsg = validateBookBody(data);
    if (errMsg) return res.json({ code: 400, msg: errMsg });

    const book = books[0];
    await pool.execute(
      `INSERT INTO seller_bookapply (
        seller_id, book_name, author, author_into, category, price, stock, sales_count,
        cover, \`desc\`, mulu, status, publisher, avg_score, comment_count,
        audit_status, audit_reason, source_book_id
      ) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,0,'',?)`,
      [
        seller.id, data.book_name, data.author, data.author_into, data.category,
        data.price, data.stock, book.sales_count || 0, data.cover, data.desc, data.mulu,
        data.status, data.publisher, book.avg_score || 0, book.comment_count || 0, id,
      ]
    );
    await pool.execute('UPDATE seller_book SET status = 0 WHERE id = ? AND seller_id = ?', [
      id,
      seller.id,
    ]);
    res.json({ code: 200, msg: '修改已提交，等待管理员重新审核' });
  } catch (err) {
    console.error('提交图书修改申请失败：', err);
    res.json({ code: 500, msg: '服务器错误' });
  }
};

exports.deletePublished = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) return res.json({ code: 400, msg: '图书ID不能为空' });

    if (req.user.role === 'admin') {
      const [rows] = await pool.execute('SELECT * FROM seller_book WHERE id = ?', [id]);
      if (!rows.length) return res.json({ code: 404, msg: '图书不存在' });
      await pool.execute('DELETE FROM seller_book WHERE id = ?', [id]);
      return res.json({ code: 200, msg: '删除成功' });
    }

    if (req.user.role !== 'seller') {
      return res.json({ code: 403, msg: '无删除权限' });
    }

    const seller = await getOrCreateSeller(req.user.id);
    const [rows] = await pool.execute(
      'SELECT * FROM seller_book WHERE id = ? AND seller_id = ?',
      [id, seller.id]
    );
    if (!rows.length) return res.json({ code: 404, msg: '图书不存在或无权限' });
    await pool.execute('DELETE FROM seller_book WHERE id = ? AND seller_id = ?', [id, seller.id]);
    res.json({ code: 200, msg: '删除成功' });
  } catch (err) {
    console.error('删除已上架图书失败：', err);
    res.json({ code: 500, msg: '服务器错误' });
  }
};

exports.getAdminPublishedList = async (req, res) => {
  try {
    if (!req.user || req.user.role !== 'admin') {
      return res.json({ code: 403, msg: '无管理员权限' });
    }
    const [list] = await pool.execute(
      `SELECT sb.*, s.shop_name, u.username
       FROM seller_book sb
       LEFT JOIN seller s ON sb.seller_id = s.id
       LEFT JOIN user u ON s.user_id = u.id
       ORDER BY sb.create_time DESC`
    );
    res.json({ code: 200, msg: '获取成功', data: list });
  } catch (err) {
    console.error('管理员获取卖家图书失败：', err);
    res.json({ code: 500, msg: '服务器错误' });
  }
};
