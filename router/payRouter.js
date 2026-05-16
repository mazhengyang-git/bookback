const express = require('express');
const router = express.Router();
const payController = require('../controller/payController');
const auth = require('../middleware/auth');

// 支付相关接口（需登录）
router.post('/info', auth, payController.getPayInfo);
router.post('/submit', auth, payController.submitPay);
router.post('/direct/info', auth, payController.getDirectPayGoodsInfo);
router.post('/direct/submit', auth, payController.submitDirectPay);
router.post('/deleteOrder',auth, payController.deleteOrder);
router.post('/verifyPwd',auth, payController.verifyUserPwd);
module.exports = router;