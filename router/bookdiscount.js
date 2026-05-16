const express = require('express');
const router = express.Router();
const pool = require('../config/db');

// 1. 获取【优惠专区图书列表】（左联优惠表，不影响原book.js）
router.get('/front/discount/book/list', async (req, res) => {
  try {
    // 修正：将name改为book_name，和表结构保持一致
    const [discountBooks] = await pool.execute(`
      -- 普通图书优惠
      SELECT 
        bd.book_id,
        bd.discount_price,
        bd.discount_rate,
        b.book_name AS name,  -- 修复：book表的书名是book_name
        b.author,
        b.cover,
        b.price,
        0 AS book_type
      FROM book_discount bd
      INNER JOIN book b ON bd.book_id = b.id
      WHERE bd.book_type = 0 AND b.status = 1

      UNION ALL

      -- 新书优惠
      SELECT 
        bd.book_id,
        bd.discount_price,
        bd.discount_rate,
        nb.book_name AS name,  -- 修复：newbook表的书名也是book_name
        nb.author,
        nb.cover,
        nb.price,
        1 AS book_type
      FROM book_discount bd
      INNER JOIN newbook nb ON bd.book_id = nb.id
      WHERE bd.book_type = 1 AND nb.status = 1
    `);

    res.json({
      code: 200,
      data: discountBooks
    });
  } catch (error) {
    // 打印完整错误日志，方便后续排查
    console.error('❌ 获取优惠图书失败:', error);
    res.json({
      code: 500,
      msg: '获取优惠图书失败'
    });
  }
});
// 2. 获取【优惠图书详情】
router.get('/front/discount/book/detail', async (req, res) => {
  try {
    const { id } = req.query;
    if (!id || isNaN(Number(id))) {
      return res.send({ code: 400, msg: '图书ID不能为空' });
    }
    const sql = `
      SELECT 
        b.id,
        b.book_name AS name,
        b.author,
        b.author_into,
        b.category,
        b.price,
        b.cover,
        b.desc,
        b.mulu,
        b.stock,
        COALESCE(b.sales_count,0) AS sales_count,
        b.status,
        b.avg_score,
        b.comment_count,
        b.publisher,
        bd.discount_price,
        bd.discount_rate
      FROM book b
      LEFT JOIN book_discount bd 
      ON b.id = bd.book_id
      WHERE b.id = ?
    `;
    const [results] = await pool.execute(sql, [Number(id)]);

    if (results.length === 0) {
      return res.send({ code: 404, msg: '图书不存在' });
    }
    res.send({ code: 200, data: results[0] });
  } catch (err) {
    console.error('优惠详情查询失败：', err);
    res.send({ code: 500, msg: '获取优惠详情失败', error: err.message });
  }
});

module.exports = router;