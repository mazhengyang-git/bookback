const express = require('express')
const router = express.Router()
const orderController = require('../controller/orderController')
// 导入登录校验中间件
const auth = require('../middleware/auth')

// 先校验token，再获取订单（用户隔离）
router.get('/user/orders', auth, orderController.getUserOrders)
router.post('/user/orders/delete', auth, orderController.deleteOrders)
router.post('/user/orders/updatestatus', auth, orderController.updateOrderStatus)
module.exports = router