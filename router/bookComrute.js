const express = require('express');
const router = express.Router();

// 引入控制器
const { 
  checkCommentAuth, 
  getBookAvgScore, 
  getCommentList, 
  addComment,
  deleteComment,
  editComment,    
  addReply,      
  getReplyList    
} = require('../controller/bookController');

// auth中间件（登录校验）
const auth = require('../middleware/auth');

// 路由路径（完整路径 /api/comment/xxx）
router.get('/comment/checkAuth', auth, checkCommentAuth);
router.get('/comment/avg', getBookAvgScore);
router.get('/comment/list', getCommentList);
router.post('/comment/add', auth, addComment);
router.post('/comment/delete', auth, deleteComment);


router.post('/comment/edit', auth, editComment);           // 编辑评论（需登录）
router.post('/comment/reply/add', auth, addReply);         // 发表追评（需登录）
router.get('/comment/reply/list', getReplyList);           // 获取追评列表（公开）

module.exports = router;