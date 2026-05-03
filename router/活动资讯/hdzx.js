const express = require('express');
const router = express.Router();
const hdzxController = require('../../controller/公共资讯/hdzx');
const auth = require('../../middleware/auth');
// 活动资讯相关接口
router.get('/huodong', hdzxController.gethuodongApiList);
router.get('/zixun', hdzxController.getzixunApiList);
router.post('/addhuodong', auth, auth.admin, hdzxController.addhuodong);
router.put('/updatehuodong', auth, auth.admin, hdzxController.updatehuodong);
router.put('/updatehdstatus', auth, auth.admin, hdzxController.updatehdstatus);
router.delete('/deletehuodong/:id', auth, auth.admin, hdzxController.deletehuodong);
module.exports = router;