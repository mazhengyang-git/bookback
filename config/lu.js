// 在你的路由文件中添加以下代码
const express = require('express');
const router = express.Router();
const {
  checkCommentAuth,
  getBookAvgScore,
  getCommentList,
  addComment,
  getBookList,
  getNewBookList
} = require('../controllers/commentController');  // 根据你的实际路径修改
const authMiddleware = require('../middleware/auth');  // 根据你的实际路径修改

// 评价相关接口
router.get('/comment/auth', authMiddleware, checkCommentAuth);
router.get('/comment/score', getBookAvgScore);
router.get('/comment/list', getCommentList);
router.post('/comment/add', authMiddleware, addComment);

// ✅ 新增：图书列表接口
router.get('/books', getBookList);
router.get('/newbooks', getNewBookList);

module.exports = router;