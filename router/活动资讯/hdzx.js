const express = require('express');
const router = express.Router();
const hdzxController = require('../../controller/公共资讯/hdzx');
const auth = require('../../middleware/auth');
// 活动资讯相关接口

router.get('/huodong', hdzxController.gethuodongApiList);
// detail 路由，匹配 /api/huodong/detail/:id/:title
router.get('/huodong/detail/:id/:title', hdzxController.gethuodongDetail);
router.get('/zixun', hdzxController.getzixunApiList);
router.post('/addhuodong', auth, auth.admin, hdzxController.addhuodong);
router.put('/updatehuodong', auth, auth.admin, hdzxController.updatehuodong);
router.put('/updatehdstatus', auth, auth.admin, hdzxController.updatehdstatus);
router.delete('/deletehuodong/:id', auth, auth.admin, hdzxController.deletehuodong);
// 图书资讯相关接口
router.post('/addzixun', auth, auth.admin, hdzxController.addzixun);
router.put('/updatezixun', auth, auth.admin, hdzxController.updatezixun);
router.put('/updatezxstatus', auth, auth.admin, hdzxController.updatezxstatus);
router.delete('/deletezixun/:id', auth, auth.admin, hdzxController.deletezixun);
module.exports = router;