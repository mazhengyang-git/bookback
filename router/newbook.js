const express = require('express');
const router = express.Router();
//引入mysql连接池
const pool = require('../config/db');

//1.获取图书列表（适配mysql2/promise）
router.get('/front/newbook/list', async (req, res) => {
  try {
    const { category } = req.query;
    let sql = 'SELECT id, book_name AS name, author,author_into, category, price, cover, `desc`, mulu, stock, status, avg_score, comment_count  FROM newbook WHERE status = 1';
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

//2.获取图书详情
router.get('/front/newbook/detail', async (req, res) => {
  try {
    const { id } = req.query;
    if (!id || isNaN(Number(id))) {
      return res.send({ code: 400, msg: '图书ID不能为空，且必须是数字' });
    }
    const sql = 'SELECT id, book_name AS name, author,author_into, category, price, cover, `desc`, mulu, stock, status, avg_score, comment_count  FROM newbook WHERE id = ?';
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