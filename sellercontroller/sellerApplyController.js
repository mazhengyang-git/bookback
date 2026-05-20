const pool = require('../config/db');
const { pickBookBody, validateBookBody, getOrCreateSeller } = require('./sellerHelper');

exports.submitApply = async (req, res) => {
  try {
    if (!req.user || req.user.role !== 'seller') {
      return res.json({ code: 403, msg: '无卖家权限' });
    }
    const seller = await getOrCreateSeller(req.user.id);
    const data = pickBookBody(req.body);
    const errMsg = validateBookBody(data);
    if (errMsg) return res.json({ code: 400, msg: errMsg });

    await pool.execute(
      `INSERT INTO seller_bookapply (
        seller_id, book_name, author, author_into, category, price, stock, sales_count,
        cover, \`desc\`, mulu, status, publisher, avg_score, comment_count, audit_status, audit_reason
      ) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,0,'')`,
      [
        seller.id, data.book_name, data.author, data.author_into, data.category,
        data.price, data.stock, data.sales_count, data.cover, data.desc, data.mulu,
        data.status, data.publisher, data.avg_score, data.comment_count,
      ]
    );
    res.json({ code: 200, msg: '图书申请已提交，等待管理员审核' });
  } catch (err) {
    console.error('提交图书申请失败：', err);
    res.json({ code: 500, msg: '服务器错误' });
  }
};

exports.getApplyList = async (req, res) => {
  try {
    if (!req.user || req.user.role !== 'seller') {
      return res.json({ code: 403, msg: '无卖家权限' });
    }
    const seller = await getOrCreateSeller(req.user.id);
    const [list] = await pool.execute(
      'SELECT * FROM seller_bookapply WHERE seller_id = ? ORDER BY create_time DESC',
      [seller.id]
    );
    res.json({ code: 200, msg: '获取成功', data: list });
  } catch (err) {
    console.error('获取申请列表失败：', err);
    res.json({ code: 500, msg: '服务器错误' });
  }
};

exports.updateApply = async (req, res) => {
  try {
    if (!req.user || req.user.role !== 'seller') {
      return res.json({ code: 403, msg: '无卖家权限' });
    }
    const { id } = req.params;
    if (!id) return res.json({ code: 400, msg: '申请ID不能为空' });

    const seller = await getOrCreateSeller(req.user.id);
    const [rows] = await pool.execute(
      'SELECT * FROM seller_bookapply WHERE id = ? AND seller_id = ?',
      [id, seller.id]
    );
    if (!rows.length) return res.json({ code: 404, msg: '申请记录不存在' });
    if (rows[0].audit_status !== 2) {
      return res.json({ code: 400, msg: '仅驳回状态的申请可重新编辑' });
    }

    const data = pickBookBody(req.body);
    const errMsg = validateBookBody(data);
    if (errMsg) return res.json({ code: 400, msg: errMsg });

    await pool.execute(
      `UPDATE seller_bookapply SET
        book_name=?, author=?, author_into=?, category=?, price=?, stock=?, sales_count=?,
        cover=?, \`desc\`=?, mulu=?, status=?, publisher=?, avg_score=?, comment_count=?,
        audit_status=0, audit_reason=''
      WHERE id=? AND seller_id=?`,
      [
        data.book_name, data.author, data.author_into, data.category, data.price, data.stock,
        data.sales_count, data.cover, data.desc, data.mulu, data.status, data.publisher,
        data.avg_score, data.comment_count, id, seller.id,
      ]
    );
    res.json({ code: 200, msg: '已重新提交审核' });
  } catch (err) {
    console.error('更新申请失败：', err);
    res.json({ code: 500, msg: '服务器错误' });
  }
};

exports.deleteApply = async (req, res) => {
  try {
    if (!req.user || req.user.role !== 'seller') {
      return res.json({ code: 403, msg: '无卖家权限' });
    }
    const { id } = req.params;
    const seller = await getOrCreateSeller(req.user.id);
    const [rows] = await pool.execute(
      'SELECT * FROM seller_bookapply WHERE id = ? AND seller_id = ?',
      [id, seller.id]
    );
    if (!rows.length) return res.json({ code: 404, msg: '申请记录不存在' });
    if (rows[0].audit_status === 1) {
      return res.json({ code: 400, msg: '已通过的申请不可删除' });
    }
    await pool.execute('DELETE FROM seller_bookapply WHERE id = ? AND seller_id = ?', [id, seller.id]);
    res.json({ code: 200, msg: '删除成功' });
  } catch (err) {
    console.error('删除申请失败：', err);
    res.json({ code: 500, msg: '服务器错误' });
  }
};
