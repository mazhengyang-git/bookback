const pool = require('../config/db');

// 1. 校验用户评价权限
const checkCommentAuth = async (req, res) => {
  try {
    // 商家后台：永远允许
    res.json({ code: 200, msg: '权限校验成功', data: { hasAuth: true, hasCommented: false } });
  } catch (error) {
    console.error('【权限接口报错】', error);
    res.status(500).json({ code: 500, msg: '权限校验失败', data: { hasAuth: false, hasCommented: false } });
  }
};

// 2. 获取图书平均分
const getBookAvgScore = async (req, res) => {
  try {
    const { bookId, source } = req.query;
    if (!bookId || !source) return res.json({ code: 400, msg: '参数不能为空', data: { avgScore: 0.0, commentCount: 0 } });

    const [avgResult] = await pool.execute(
      `SELECT IFNULL(AVG(score), 0.0) AS avgScore, COUNT(id) AS commentCount FROM book_comment WHERE book_id = ? AND source = ?`,
      [bookId, source]
    );

    const data = {
      avgScore: Number(avgResult[0].avgScore) || 0.0,
      commentCount: Number(avgResult[0].commentCount) || 0
    };
    res.json({ code: 200, msg: '获取评分成功', data });
  } catch (error) {
    console.error('【评分接口报错】', error);
    res.status(500).json({ code: 500, msg: '获取评分失败', data: { avgScore: 0.0, commentCount: 0 } });
  }
};

// 3. 获取评价列表
const getCommentList = async (req, res) => {
  try {
    const { bookId, source } = req.query;
    if (!bookId || !source) return res.json({ code: 400, msg: '参数不能为空', data: [] });

    const [list] = await pool.execute(
      `SELECT c.*, u.username 
       FROM book_comment c
       LEFT JOIN user u ON c.user_id = u.id
       WHERE c.book_id = ? AND c.source = ?
       ORDER BY c.create_time DESC`,
      [bookId, source]
    );

    const formatList = list.map(item => ({
      id: item.id,
      userId: item.user_id,
      bookId: item.book_id,
      score: Number(item.score) || 0.0,
      content: item.content?.trim() || '用户未填写文字评价',
      nickname: item.username || '匿名用户',
      createTime: item.create_time
    }));

    res.json({ code: 200, msg: '获取评价列表成功', data: formatList });
  } catch (error) {
    console.error('【列表接口报错】', error);
    res.status(500).json({ code: 500, msg: '获取评价列表失败', data: [] });
  }
};

// 4. 提交图书评价
const addComment = async (req, res) => {
  try {
    const userId = req.user.id;
    const { bookId, score, content, source } = req.body;

    if (!bookId || !score || !source) return res.json({ code: 400, msg: '参数不能为空', data: null });
    if (score < 0 || score > 5) return res.json({ code: 400, msg: '评分必须0~5分', data: null });

    // 商家版：跳过购买校验
    // 校验是否已评价
    const [commentCheck] = await pool.execute(
      `SELECT id FROM book_comment WHERE user_id = ? AND book_id = ? AND source = ?`,
      [userId, bookId, source]
    );
    if (commentCheck.length > 0) {
      return res.json({ code: 403, msg: '您已评价过该图书', data: null });
    }

    await pool.execute(
      `INSERT INTO book_comment (book_id, user_id, score, content, source) VALUES (?, ?, ?, ?, ?)`,
      [bookId, userId, score, content || '', source]
    );

    const [avgData] = await pool.execute(
      `SELECT IFNULL(AVG(score),0.0) AS avg, COUNT(id) AS count FROM book_comment WHERE book_id = ? AND source = ?`,
      [bookId, source]
    );
    const avgScore = Number(avgData[0].avg) || 0;
    const commentCount = Number(avgData[0].count) || 0;

    if (source === 'normal') {
      await pool.execute(`UPDATE book SET avg_score = ?, comment_count = ? WHERE id = ?`, [avgScore, commentCount, bookId]);
    } else if (source === 'new') {
      await pool.execute(`UPDATE newbook SET avg_score = ?, comment_count = ? WHERE id = ?`, [avgScore, commentCount, bookId]);
    } else if (source === 'seller') {
      await pool.execute(`UPDATE seller_book SET avg_score = ?, comment_count = ? WHERE id = ?`, [avgScore, commentCount, bookId]);
    }

    res.json({ code: 200, msg: '评价提交成功', data: null });
  } catch (error) {
    console.error('【提交评价接口报错】', error);
    res.status(500).json({ code: 500, msg: '评价提交失败', data: null });
  }
};

// 5. 删除评价
const deleteComment = async (req, res) => {
  try {
    const userId = req.user.id;
    const { commentId, bookId, source } = req.body;

    if (!commentId || !bookId || !source) {
      return res.json({ code: 400, msg: '参数不能为空' });
    }

    const [checkOwn] = await pool.execute(
      `SELECT user_id FROM book_comment WHERE id = ? AND book_id = ? AND source = ?`,
      [commentId, bookId, source]
    );

    if (checkOwn.length === 0) {
      return res.json({ code: 404, msg: '评价不存在' });
    }

    if (checkOwn[0].user_id !== userId) {
      return res.json({ code: 403, msg: '无权删除他人评价' });
    }

    await pool.execute(
      `DELETE FROM book_comment WHERE id = ? AND book_id = ? AND source = ?`,
      [commentId, bookId, source]
    );

    const [avgData] = await pool.execute(
      `SELECT IFNULL(AVG(score), 0.0) AS avg, COUNT(id) AS count FROM book_comment WHERE book_id = ? AND source = ?`,
      [bookId, source]
    );
    const avgScore = Number(avgData[0].avg) || 0;
    const commentCount = Number(avgData[0].count) || 0;

    if (source === 'normal') {
      await pool.execute(`UPDATE book SET avg_score = ?, comment_count = ? WHERE id = ?`, [avgScore, commentCount, bookId]);
    } else if (source === 'new') {
      await pool.execute(`UPDATE newbook SET avg_score = ?, comment_count = ? WHERE id = ?`, [avgScore, commentCount, bookId]);
    } else if (source === 'seller') {
      await pool.execute(`UPDATE seller_book SET avg_score = ?, comment_count = ? WHERE id = ?`, [avgScore, commentCount, bookId]);
    }

    res.json({ code: 200, msg: '删除成功' });
  } catch (error) {
    console.error('删除评价接口报错', error);
    res.status(500).json({ code: 500, msg: '删除失败' });
  }
};

// 6. 编辑主评论
const editComment = async (req, res) => {
  try {
    const userId = req.user.id;
    const { commentId, score, content, source } = req.body;

    if (!commentId || !score || !source) {
      return res.json({ code: 400, msg: '参数不能为空' });
    }
    if (score < 0 || score > 5) {
      return res.json({ code: 400, msg: '评分必须0~5分' });
    }

    const [checkOwn] = await pool.execute(
      `SELECT book_id FROM book_comment WHERE id = ? AND user_id = ? AND source = ?`,
      [commentId, userId, source]
    );
    if (checkOwn.length === 0) {
      return res.json({ code: 403, msg: '无权编辑他人评论' });
    }
    const bookId = checkOwn[0].book_id;

    await pool.execute(
      `UPDATE book_comment SET score = ?, content = ? WHERE id = ? AND user_id = ? AND source = ?`,
      [score, content || '', commentId, userId, source]
    );

    const [avgData] = await pool.execute(
      `SELECT IFNULL(AVG(score),0.0) AS avg, COUNT(id) AS count FROM book_comment WHERE book_id = ? AND source = ?`,
      [bookId, source]
    );
    const avgScore = Number(avgData[0].avg) || 0;
    const commentCount = Number(avgData[0].count) || 0;

    if (source === 'normal') {
      await pool.execute(`UPDATE book SET avg_score = ?, comment_count = ? WHERE id = ?`, [avgScore, commentCount, bookId]);
    } else if (source === 'new') {
      await pool.execute(`UPDATE newbook SET avg_score = ?, comment_count = ? WHERE id = ?`, [avgScore, commentCount, bookId]);
    } else if (source === 'seller') {
      await pool.execute(`UPDATE seller_book SET avg_score = ?, comment_count = ? WHERE id = ?`, [avgScore, commentCount, bookId]);
    }

    res.json({ code: 200, msg: '编辑评论成功' });
  } catch (error) {
    console.error('【编辑评论接口报错】', error);
    res.status(500).json({ code: 500, msg: '编辑失败' });
  }
};

// 7. 发表追评

const addReply = async (req, res) => {
  try {
    const userId = req.user.id;
    const { bookId, commentId, content, source } = req.body;

    if (!bookId || !commentId || !content || !source) {
      return res.json({ code: 400, msg: '参数不能为空' });
    }

    // 自动从seller表读取真实店铺名
    const [sellerInfo] = await pool.execute(
      `SELECT shop_name FROM seller WHERE user_id = ?`,
      [userId]
    );
    const realShopName = sellerInfo.length ? sellerInfo[0].shop_name : '商家';

    await pool.execute(
      `INSERT INTO book_comment_reply (comment_id, user_id, content, source, is_seller, shop_name) 
       VALUES (?, ?, ?, ?, 1, ?)`,
      [commentId, userId, content.trim(), source, realShopName]
    );

    res.json({ code: 200, msg: '商家回复成功' });
  } catch (error) {
    console.error('【商家回复接口报错】', error);
    res.status(500).json({ code: 500, msg: '回复失败' });
  }
};
// 8. 获取追评列表
const getReplyList = async (req, res) => {
  try {
    const { commentId, source } = req.query;
    if (!commentId || !source) {
      return res.json({ code: 400, msg: '参数不能为空', data: [] });
    }

    const [list] = await pool.execute(
      `SELECT r.*, u.username 
       FROM book_comment_reply r
       LEFT JOIN user u ON r.user_id = u.id
       WHERE r.comment_id = ? AND r.source = ?
       ORDER BY r.create_time ASC`,
      [commentId, source]
    );

    const formatList = list.map(item => ({
      id: item.id,
      userId: item.user_id,
      commentId: item.comment_id,
      content: item.content?.trim() || '无内容',
      nickname: item.username || '匿名用户',
      shopName: item.shop_name || '', // 新增：店铺名
      createTime: item.create_time,
      isSeller: item.is_seller === 1
    }));

    res.json({ code: 200, msg: '获取追评成功', data: formatList });
  } catch (error) {
    console.error('【获取追评列表报错】', error);
    res.status(500).json({ code: 500, msg: '获取追评失败', data: [] });
  }
};
const deleteReply = async (req, res) => {
  try {
    const userId = req.user.id;
    const { replyId, commentId, source } = req.body;

    if (!replyId || !commentId || !source) {
      return res.json({ code: 400, msg: '参数不能为空' });
    }

    // 1. 校验这条追评是否存在，且是当前用户发布的
    const [checkOwn] = await pool.execute(
      `SELECT user_id FROM book_comment_reply WHERE id = ? AND comment_id = ? AND source = ?`,
      [replyId, commentId, source]
    );

    if (checkOwn.length === 0) {
      return res.json({ code: 404, msg: '追评不存在' });
    }

    if (checkOwn[0].user_id !== userId) {
      return res.json({ code: 403, msg: '无权删除他人的回复' });
    }

    // 2. 删除追评
    await pool.execute(
      `DELETE FROM book_comment_reply WHERE id = ? AND comment_id = ? AND source = ?`,
      [replyId, commentId, source]
    );

    res.json({ code: 200, msg: '删除成功' });
  } catch (error) {
    console.error('【删除追评接口报错】', error);
    res.status(500).json({ code: 500, msg: '删除失败' });
  }
};

module.exports = {
  checkCommentAuth,
  getBookAvgScore,
  getCommentList,
  addComment,
  deleteComment,
  editComment,
  addReply,
  getReplyList,
  deleteReply
};