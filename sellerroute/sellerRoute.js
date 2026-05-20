const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');

const profileCtrl = require('../sellercontroller/sellerProfileController');
const applyCtrl = require('../sellercontroller/sellerApplyController');
const bookCtrl = require('../sellercontroller/sellerBookController');
const auditCtrl = require('../sellercontroller/sellerAuditController');
const frontCtrl = require('../sellercontroller/sellerFrontController');

// ========== 买家端公开接口 ==========
router.get('/front/books', frontCtrl.getSellerBookList);
router.get('/front/book/detail', frontCtrl.getSellerBookDetail);
router.get('/front/shop/:id', frontCtrl.getSellerHome);
router.get('/front/shops', frontCtrl.getAllShops);
router.get('/front/shops/search', frontCtrl.searchShops);

// ========== 卖家端（需登录 + seller 角色）==========
router.get('/profile/check', auth, profileCtrl.sellerLoginCheck);
router.get('/profile', auth, profileCtrl.getProfile);
router.put('/profile', auth, profileCtrl.updateProfile);

router.post('/apply', auth, applyCtrl.submitApply);
router.get('/apply/list', auth, applyCtrl.getApplyList);
router.put('/apply/:id', auth, applyCtrl.updateApply);
router.delete('/apply/:id', auth, applyCtrl.deleteApply);

router.get('/book/list', auth, bookCtrl.getPublishedList);
router.get('/book/:id', auth, bookCtrl.getPublishedDetail);
router.post('/book/:id/reapply', auth, bookCtrl.submitEditReapply);
router.delete('/book/:id', auth, bookCtrl.deletePublished);

// ========== 管理员审核 ==========
router.get('/admin/apply/list', auth, auth.admin, auditCtrl.getAllApplyList);
router.post('/admin/apply/approve', auth, auth.admin, auditCtrl.approveApply);
router.post('/admin/apply/reject', auth, auth.admin, auditCtrl.rejectApply);
router.get('/admin/book/list', auth, auth.admin, bookCtrl.getAdminPublishedList);
router.delete('/admin/book/:id', auth, auth.admin, bookCtrl.deletePublished);

module.exports = router;
