const express = require('express');
const router = express.Router();
const hdzxController = require('../../controller/公共资讯/hdzx');

// 活动资讯相关接口
router.get('/huodong', hdzxController.gethuodongApiList);
router.get('/zixun', hdzxController.getzixunApiList);

module.exports = router;