const express = require('express');
const router = express.Router();
const userController = require('../controller/user');

router.post('/register', userController.register);
router.post('/login', userController.login);
router.get('/info', userController.getUserInfo);

// ===================== 验证码相关路由 =====================
router.post('/send-code', userController.sendSmsCode);     // 发送验证码
router.post('/login-by-code', userController.loginBySmsCode); // 验证码登录
module.exports = router;