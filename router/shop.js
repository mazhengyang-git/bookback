const express = require('express');
const router = express.Router();
const cartController = require('../controller/shop');
const auth = require('../middleware/auth'); //复用鉴权中间件

//收藏夹接口鉴权
router.post('/add', auth, cartController.addShop); //加入收藏夹
router.get('/list', auth, cartController.getShop); //获取收藏夹列表

router.post('/delete', auth, cartController.deleteShop); //删除项
router.post('/clear', auth, cartController.clearShop); //清空收藏夹

module.exports = router;