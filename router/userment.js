const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const {
  getuserment,
  toggleSellerBanStatus
} = require('../controller/usermentController');

// 公共接口（无需登录）
router.get('/list', auth, auth.admin, getuserment);
router.put('/ban', auth, auth.admin,toggleSellerBanStatus);

module.exports = router;