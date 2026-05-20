const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');

const sellerOrderController = require('../sellercontroller/sellerOrder');
router.get('/seller/orders', auth,sellerOrderController.sellerGetOrders);
router.post('/seller/orders/status',auth, sellerOrderController.sellerUpdateOrderStatus);
router.get('/seller/stats', auth, sellerOrderController.sellerGetStats);
module.exports = router;