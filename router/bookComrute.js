const express = require('express');
const router = express.Router();

// ✅ 完美适配你现有结构：controller(无s) + 文件名bookController.js
const { checkCommentAuth, getBookAvgScore, getCommentList, addComment } = require('../controller/bookController');

// ✅ 你的auth中间件是【默认导出】，直接导入，不能解构
const auth = require('../middleware/auth');

// 路由路径（拼接app.js的/api前缀，最终完整路径 /api/comment/xxx）
router.get('/comment/checkAuth', auth, checkCommentAuth);
router.get('/comment/avg', getBookAvgScore);
router.get('/comment/list', getCommentList);
router.post('/comment/add', auth, addComment);

module.exports = router;