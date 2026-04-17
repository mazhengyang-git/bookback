const express = require('express');
const router = express.Router();
const userupdate = require('../controller/userupdate');
const auth = require('../middleware/auth');
router.post('/user/update',auth,userupdate.userupdate);


module.exports = router;