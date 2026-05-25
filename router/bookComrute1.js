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
  getReplyList,
  deleteReply    
} = require('../controller/bookController1');

// auth中间件（登录校验）
const auth = require('../middleware/auth');

// 路由路径（完整路径 /api/comment/xxx）
router.get('/comment/checkAuth1', auth, checkCommentAuth);
router.get('/comment/avg1', getBookAvgScore);
router.get('/comment/list1', getCommentList);
router.post('/comment/add1', auth, addComment);
router.post('/comment/delete1', auth, deleteComment);


router.post('/comment/edit1', auth, editComment);           // 编辑评论（需登录）
router.post('/comment/reply/add1', auth, addReply);         // 发表追评（需登录）
router.get('/comment/reply/list1', getReplyList);           // 获取追评列表（公开）
router.post('/comment/deleteReply', auth, deleteReply);   
module.exports = router;