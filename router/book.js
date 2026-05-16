const express = require('express');
const router = express.Router();
//引入mysql连接池
const pool = require('../config/db');

//1.获取图书列表（适配mysql2/promise）
router.get('/front/book/list', async (req, res) => {
  try {
    const { category } = req.query;
    let sql = 'SELECT id, book_name AS name, author,author_into, category, price, cover, `desc`, mulu, stock, COALESCE(sales_count,0) AS sales_count, status, avg_score, comment_count,publisher FROM book WHERE status = 1';
    const sqlParams = [];

    if (category && category !== '全部') {
      sql += ' AND category = ?';
      sqlParams.push(category);
    }
    // mysql2/promise用execute执行查询，返回 [结果集, 字段信息]
    const [results] = await pool.execute(sql, sqlParams);
    res.send({ code: 200, data: results });
  } catch (err) {
    console.error('图书列表查询失败：', err);
    res.send({ code: 500, msg: '获取图书列表失败', error: err.message });
  }
});

//2.获取图书详情（支持普通图书+新书+自动携带优惠信息）
router.get('/front/book/detail', async (req, res) => {
  try {
    const { id, book_type } = req.query;
    if (!id || isNaN(Number(id))) {
      return res.send({ code: 400, msg: '图书ID不能为空，且必须是数字' });
    }

    let sql;
    // 根据 book_type 判断查询 普通图书(0) 还是 新书(1)
    if (book_type == 1) {
      // 查询新书表 + 关联优惠表
      sql = `
        SELECT 
          nb.id,
          nb.book_name AS name,
          nb.author,
          nb.author_into,
          nb.category,
          nb.price,
          nb.cover,
          nb.\`desc\`,
          nb.mulu,
          nb.stock,
          COALESCE(nb.sales_count,0) AS sales_count,
          nb.status,
          nb.avg_score,
          nb.comment_count,
          nb.publisher,
          bd.discount_price,  -- 优惠价
          bd.discount_rate    -- 折扣
        FROM newbook nb
        LEFT JOIN book_discount bd ON nb.id = bd.book_id AND bd.book_type = 1
        WHERE nb.id = ?
      `;
    } else {
      // 查询普通图书表 + 关联优惠表
      sql = `
        SELECT 
          b.id,
          b.book_name AS name,
          b.author,
          b.author_into,
          b.category,
          b.price,
          b.cover,
          b.\`desc\`,
          b.mulu,
          b.stock,
          COALESCE(b.sales_count,0) AS sales_count,
          b.status,
          b.avg_score,
          b.comment_count,
          b.publisher,
          bd.discount_price,  -- 优惠价
          bd.discount_rate    -- 折扣
        FROM book b
        LEFT JOIN book_discount bd ON b.id = bd.book_id AND bd.book_type = 0
        WHERE b.id = ?
      `;
    }

    const [results] = await pool.execute(sql, [Number(id)]);
    if (results.length === 0) {
      return res.send({ code: 500, msg: '图书不存在' });
    }
    res.send({ code: 200, data: results[0] });
  } catch (err) {
    console.error('图书详情查询失败：', err);
    res.send({ code: 500, msg: '获取图书详情失败', error: err.message });
  }
});

module.exports = router;