const pool = require('../config/db');

exports.getAllApplyList = async (req, res) => {
  try {
    if (!req.user || req.user.role !== 'admin') {
      return res.json({ code: 403, msg: '无管理员权限' });
    }
    const { audit_status } = req.query;
    let sql = `
      SELECT a.*, s.shop_name, s.avatar AS seller_avatar, u.username
      FROM seller_bookapply a
      LEFT JOIN seller s ON a.seller_id = s.id
      LEFT JOIN user u ON s.user_id = u.id
      WHERE 1=1
    `;
    const params = [];
    if (audit_status !== undefined && audit_status !== '') {
      sql += ' AND a.audit_status = ?';
      params.push(Number(audit_status));
    }
    sql += ' ORDER BY a.create_time DESC';
    const [list] = await pool.execute(sql, params);
    res.json({ code: 200, msg: '获取成功', data: list });
  } catch (err) {
    console.error('管理员获取申请列表失败：', err);
    res.json({ code: 500, msg: '服务器错误' });
  }
};

exports.approveApply = async (req, res) => {
  const conn = await pool.getConnection();
  try {
    if (!req.user || req.user.role !== 'admin') {
      return res.json({ code: 403, msg: '无管理员权限' });
    }
    const { id } = req.body;
    if (!id) return res.json({ code: 400, msg: '申请ID不能为空' });

    await conn.beginTransaction();
    const [rows] = await conn.execute('SELECT * FROM seller_bookapply WHERE id = ? FOR UPDATE', [id]);
    if (!rows.length) {
      await conn.rollback();
      return res.json({ code: 404, msg: '申请不存在' });
    }
    const apply = rows[0];
    if (apply.audit_status === 1) {
      await conn.rollback();
      return res.json({ code: 400, msg: '该申请已通过' });
    }

    if (apply.source_book_id) {
      const [exist] = await conn.execute(
        'SELECT id FROM seller_book WHERE id = ? AND seller_id = ?',
        [apply.source_book_id, apply.seller_id]
      );
      if (!exist.length) {
        await conn.rollback();
        return res.json({ code: 404, msg: '原上架图书不存在，无法更新' });
      }
      await conn.execute(
        `UPDATE seller_book SET
          book_name=?, author=?, author_into=?, category=?, price=?, stock=?,
          cover=?, \`desc\`=?, mulu=?, status=?, publisher=?, audit_status=1, audit_reason='审核通过'
        WHERE id=? AND seller_id=?`,
        [
          apply.book_name, apply.author, apply.author_into, apply.category, apply.price,
          apply.stock, apply.cover, apply.desc, apply.mulu, apply.status, apply.publisher,
          apply.source_book_id, apply.seller_id,
        ]
      );
    } else {
      await conn.execute(
        `INSERT INTO seller_book (
          seller_id, book_name, author, author_into, category, price, stock, sales_count,
          cover, \`desc\`, mulu, status, publisher, avg_score, comment_count, audit_status, audit_reason
        ) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,1,'审核通过')`,
        [
          apply.seller_id, apply.book_name, apply.author, apply.author_into, apply.category,
          apply.price, apply.stock, apply.sales_count, apply.cover, apply.desc, apply.mulu,
          apply.status, apply.publisher, apply.avg_score, apply.comment_count,
        ]
      );
    }

    await conn.execute(
      'UPDATE seller_bookapply SET audit_status=1, audit_reason=? WHERE id=?',
      ['审核通过', id]
    );
    await conn.commit();
    res.json({ code: 200, msg: '审核通过，图书已上架至卖家图书库' });
  } catch (err) {
    await conn.rollback();
    console.error('审核通过失败：', err);
    res.json({ code: 500, msg: '服务器错误' });
  } finally {
    conn.release();
  }
};

exports.rejectApply = async (req, res) => {
  try {
    if (!req.user || req.user.role !== 'admin') {
      return res.json({ code: 403, msg: '无管理员权限' });
    }
    const { id, audit_reason } = req.body;
    if (!id) return res.json({ code: 400, msg: '申请ID不能为空' });
    if (!audit_reason || !audit_reason.trim()) {
      return res.json({ code: 400, msg: '请填写驳回原因' });
    }

    const [rows] = await pool.execute('SELECT * FROM seller_bookapply WHERE id = ?', [id]);
    if (!rows.length) return res.json({ code: 404, msg: '申请不存在' });
    if (rows[0].audit_status === 1) {
      return res.json({ code: 400, msg: '已通过的申请不可驳回' });
    }

    await pool.execute(
      'UPDATE seller_bookapply SET audit_status=2, audit_reason=? WHERE id=?',
      [audit_reason.trim(), id]
    );
    res.json({ code: 200, msg: '已驳回该申请' });
  } catch (err) {
    console.error('驳回申请失败：', err);
    res.json({ code: 500, msg: '服务器错误' });
  }
};
