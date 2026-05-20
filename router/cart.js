const express = require('express');
const router = express.Router();
const cartController = require('../controller/cartController');
const auth = require('../middleware/auth'); //复用鉴权中间件

//cart接口鉴权
router.post('/add', auth, cartController.addCart); //加入购物车
router.get('/list', auth, cartController.getCartList); //获取购物车列表
router.post('/update', auth, cartController.updateCart); //更新数量
router.post('/delete', auth, cartController.deleteCart); //删除项
router.post('/clear', auth, cartController.clearCart); //清空购物车

module.exports = router;