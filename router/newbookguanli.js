const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const {
 getBookList,
  addBook,
  updateBook,
  deleteBook
} = require('../controller/newbookguan');

//公共接口（无需登录）
router.get('/front/list',  getBookList);

//管理员接口:登录验证+管理员权限
router.post('/add', auth, auth.admin,  addBook);
router.put('/update', auth, auth.admin,  updateBook);
router.delete('/delete/:id', auth, auth.admin,deleteBook);

module.exports = router;