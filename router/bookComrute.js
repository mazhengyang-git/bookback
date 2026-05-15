const express = require('express');
const router = express.Router();


const { checkCommentAuth, getBookAvgScore, getCommentList, addComment } = require('../controller/bookController');

// auth中间件
const auth = require('../middleware/auth');

// 路由路径（拼接app.js的/api前缀，最终完整路径 /api/comment/xxx）
router.get('/comment/checkAuth', auth, checkCommentAuth);
router.get('/comment/avg', getBookAvgScore);
router.get('/comment/list', getCommentList);
router.post('/comment/add', auth, addComment);

module.exports = router;