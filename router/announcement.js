const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const {
  getAnnouncement,
  addAnnouncement,
  updateAnnouncement,
  deleteAnnouncement
} = require('../controller/announcementController');

//公共接口（无需登录）
router.get('/list', getAnnouncement);

//管理员接口:登录验证+管理员权限
router.post('/add', auth, auth.admin, addAnnouncement);
router.put('/update', auth, auth.admin, updateAnnouncement);
router.delete('/delete/:id', auth, auth.admin, deleteAnnouncement);

module.exports = router;