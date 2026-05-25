const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const {
  getAddressList,
  getDefaultAddress,
  saveAddress,
  deleteAddress
} = require('../controller/addressController');

// 收货地址接口
router.get('/address/list', auth, getAddressList);
router.get('/address/default', auth, getDefaultAddress);
router.post('/address/save', auth, saveAddress);
router.post('/address/delete', auth, deleteAddress);

module.exports = router;