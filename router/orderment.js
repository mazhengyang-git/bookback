const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const {
  adminGetAllOrders,
  adminUpdateOrderStatus,
 
} = require('../controller/orderadmin');

router.get('/back/order/list', auth, auth.admin, adminGetAllOrders);
router.post('/back/order/update', auth, auth.admin,  adminUpdateOrderStatus);
module.exports = router;