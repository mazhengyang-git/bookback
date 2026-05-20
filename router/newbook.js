const express = require('express');
const router = express.Router();
// 引入mysql连接池
const pool = require('../config/db');

// 1. 获取新书列表（带分类筛选）
router.get('/front/newbook/list', async (req, res) => {
  try {
    const { category } = req.query;
    // LEFT JOIN 优惠表，book_type 区分数据书源
    let sql = `
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
        bd.discount_rate    -- 折扣率
      FROM newbook nb
      LEFT JOIN book_discount bd 
        ON nb.id = bd.book_id 
        AND bd.book_type = 1  -- 固定关联新书的优惠
      WHERE nb.status = 1
    `;
    const sqlParams = [];

    // 分类筛选逻辑
    if (category && category !== '全部') {
      sql += ' AND nb.category = ?';
      sqlParams.push(category);
    }

    const [results] = await pool.execute(sql, sqlParams);
    res.send({ code: 200, data: results });
  } catch (err) {
    console.error('新书列表查询失败：', err);
    res.send({ code: 500, msg: '获取新书列表失败', error: err.message });
  }
});

// 2. 获取新书详情（带优惠价关联）
router.get('/front/newbook/detail', async (req, res) => {
  try {
    const { id } = req.query;
    if (!id || isNaN(Number(id))) {
      return res.send({ code: 400, msg: '图书ID不能为空，且必须是数字' });
    }
    // LEFT JOIN 优惠表，返回原价+优惠价+折扣率
    const sql = `
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
        bd.discount_rate    -- 折扣率
      FROM newbook nb
      LEFT JOIN book_discount bd 
        ON nb.id = bd.book_id 
        AND bd.book_type = 1
      WHERE nb.id = ?
    `;

    const [results] = await pool.execute(sql, [Number(id)]);
    if (results.length === 0) {
      return res.send({ code: 500, msg: '图书不存在' });
    }
    res.send({ code: 200, data: results[0] });
  } catch (err) {
    console.error('新书详情查询失败：', err);
    res.send({ code: 500, msg: '获取新书详情失败', error: err.message });
  }
});

module.exports = router;