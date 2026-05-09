const pool = require('../config/db');

// 1. 校验用户评价权限
const checkCommentAuth = async (req, res) => {
  try {
    const userId = req.user.id;
    const { bookId } = req.query;

    console.log('\n==========【评价权限接口】开始 ==========');
    console.log('当前登录用户ID(req.user.id)：', userId);
    console.log('当前页面图书ID(bookId)：', bookId);

    if (!bookId) {
      console.log('错误：图书ID为空');
      return res.json({ code: 400, msg: '图书ID不能为空', data: { hasAuth: false, hasCommented: false } });
    }

    const [buyResult] = await pool.execute(
      `SELECT id FROM \`order\` WHERE user_id = ? AND book_id = ? AND status IN ('已付款', '已发货','待发货')`,
      [userId, bookId]
    );

    console.log('订单查询结果数组长度：', buyResult.length);
    const hasAuth = buyResult.length > 0;

    const [commentResult] = await pool.execute(
      `SELECT id FROM book_comment WHERE user_id = ? AND book_id = ?`,
      [userId, bookId]
    );
    const hasCommented = commentResult.length > 0;

    console.log('是否拥有购买权限(hasAuth)：', hasAuth);
    console.log('是否已经评价过(hasCommented)：', hasCommented);
    console.log('==========【评价权限接口】结束 ==========\n');

    res.json({
      code: 200,
      msg: '权限校验成功',
      data: { hasAuth, hasCommented }
    });
  } catch (error) {
    console.error('【权限接口致命报错】', error);
    res.status(500).json({ code: 500, msg: '权限校验失败', data: { hasAuth: false, hasCommented: false } });
  }
};

// 2. 获取图书平均分（独立接口，用于详情页动态刷新）
const getBookAvgScore = async (req, res) => {
  try {
    const { bookId } = req.query;
    if (!bookId) return res.json({ code: 400, msg: '图书ID不能为空', data: { avgScore: 0.0, commentCount: 0 } });

    const [avgResult] = await pool.execute(
      `SELECT IFNULL(AVG(score), 0.0) AS avgScore, COUNT(id) AS commentCount FROM book_comment WHERE book_id = ?`,
      [bookId]
    );

    const data = {
      avgScore: Number(avgResult[0].avgScore) || 0.0,
      commentCount: Number(avgResult[0].commentCount) || 0
    };
    console.log(`【评分接口】图书${bookId} 平均分：${data.avgScore}，评价人数：${data.commentCount}`);
    res.json({ code: 200, msg: '获取评分成功', data });
  } catch (error) {
    console.error('【评分接口报错】', error);
    res.status(500).json({ code: 500, msg: '获取评分失败', data: { avgScore: 0.0, commentCount: 0 } });
  }
};

// 3. 获取评价列表
const getCommentList = async (req, res) => {
  try {
    const { bookId } = req.query;
    if (!bookId) return res.json({ code: 400, msg: '图书ID不能为空', data: [] });

    const [list] = await pool.execute(
      `SELECT c.*, u.username 
       FROM book_comment c
       LEFT JOIN user u ON c.user_id = u.id
       WHERE c.book_id = ?
       ORDER BY c.create_time DESC`,
      [bookId]
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

    console.log(`【列表接口】图书${bookId} 评价条数：${formatList.length}`);
    res.json({ code: 200, msg: '获取评价列表成功', data: formatList });
  } catch (error) {
    console.error('【列表接口报错】', error);
    res.status(500).json({ code: 500, msg: '获取评价列表失败', data: [] });
  }
};

// 4. 提交图书评价（自动更新 book 和 newbook 表的 avg_score, comment_count）
const addComment = async (req, res) => {
  try {
    const userId = req.user.id;
    const { bookId, score, content } = req.body;

    console.log('\n==========【提交评价接口】开始 ==========');
    console.log('当前用户ID：', userId);
    console.log('提交参数：图书ID', bookId, '评分', score, '内容', content);

    if (!bookId || !score) return res.json({ code: 400, msg: '图书ID和评分不能为空', data: null });
    if (score < 0 || score > 5) return res.json({ code: 400, msg: '评分必须0~5分', data: null });

    const [buyCheck] = await pool.execute(
      `SELECT id FROM \`order\` WHERE user_id = ? AND book_id = ? AND status IN ('已付款', '已发货','待发货')`,
      [userId, bookId]
    );
    if (buyCheck.length === 0) {
      return res.json({ code: 403, msg: '未购买该图书，无法评价', data: null });
    }

    const [commentCheck] = await pool.execute(
      `SELECT id FROM book_comment WHERE user_id = ? AND book_id = ?`,
      [userId, bookId]
    );
    if (commentCheck.length > 0) {
      return res.json({ code: 403, msg: '您已评价过该图书', data: null });
    }

    await pool.execute(
      `INSERT INTO book_comment (book_id, user_id, score, content) VALUES (?, ?, ?, ?)`,
      [bookId, userId, score, content || '']
    );

    // 重新计算平均分和评价总数
    const [avgData] = await pool.execute(
      `SELECT IFNULL(AVG(score),0.0) AS avg, COUNT(id) AS count FROM book_comment WHERE book_id = ?`,
      [bookId]
    );
    const avgScore = Number(avgData[0].avg) || 0;
    const commentCount = Number(avgData[0].count) || 0;

    // 更新普通图书表
    await pool.execute(
      `UPDATE book SET avg_score = ?, comment_count = ? WHERE id = ?`,
      [avgScore, commentCount, bookId]
    );
    // 同步更新新书表
    await pool.execute(
      `UPDATE newbook SET avg_score = ?, comment_count = ? WHERE id = ?`,
      [avgScore, commentCount, bookId]
    );

    console.log('普通图书+新书表 评分数据同步更新成功');
    console.log('==========【提交评价接口】结束 ==========\n');

    res.json({ code: 200, msg: '评价提交成功', data: null });
  } catch (error) {
    console.error('【提交评价接口致命报错】', error);
    res.status(500).json({ code: 500, msg: '评价提交失败', data: null });
  }
};

module.exports = {
  checkCommentAuth,
  getBookAvgScore,
  getCommentList,
  addComment
};