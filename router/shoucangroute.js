const express = require('express');
const router = express.Router();
const cartController = require('../controller/shoucangjia');
const auth = require('../middleware/auth'); //复用鉴权中间件

//所有cart接口都鉴权
router.post('/add', auth, cartController.addShoucang); //加入收藏夹
router.get('/list', auth, cartController.getShoucangList); //获取收藏夹列表

router.post('/delete', auth, cartController.deleteShoucang); //删除项
router.post('/clear', auth, cartController.clearShoucang); //清空收藏夹

module.exports = router;