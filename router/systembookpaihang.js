const express = require('express');
const router = express.Router();
const systemConfigController = require('../controller/systemConfig');
const auth = require('../middleware/auth');
// 获取系统配置（公开接口，前端首页用）
router.get('/config', systemConfigController.getSystemConfig);

// 更新系统配置（管理员接口）
router.put('/config', auth,systemConfigController.updateSystemConfig);

module.exports = router;