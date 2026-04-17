const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const {
  getAnnouncement,
  addAnnouncement,
  updateAnnouncement,
  deleteAnnouncement,
  bindPhone,
  resetUserPassword,
  getMyNotice
} = require('../controller/announcementController');

//公共接口（无需登录）
router.get('/list', getAnnouncement);

//管理员接口:登录验证+管理员权限
router.post('/add', auth, auth.admin, addAnnouncement);
router.put('/update', auth, auth.admin, updateAnnouncement);
router.delete('/delete/:id', auth, auth.admin, deleteAnnouncement);
// 核心接口
router.post('/bind-phone', auth,bindPhone); // 绑定手机号
router.post('/reset-password', auth, auth.admin,resetUserPassword); // 管理员重置密码
router.get('/my-notice', auth, auth.admin,getMyNotice); // 获取个人公告（未登录可查）
module.exports = router;