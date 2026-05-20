const pool = require('../config/db');
const { getOrCreateSeller } = require('./sellerHelper');

exports.getProfile = async (req, res) => {
  try {
    if (!req.user || req.user.role !== 'seller') {
      return res.json({ code: 403, msg: '无卖家权限' });
    }
    const seller = await getOrCreateSeller(req.user.id);
    res.json({ code: 200, msg: '获取成功', data: seller });
  } catch (err) {
    console.error('获取卖家资料失败：', err);
    res.json({ code: 500, msg: '服务器错误' });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    if (!req.user || req.user.role !== 'seller') {
      return res.json({ code: 403, msg: '无卖家权限' });
    }
    const { avatar, shop_name, intro, contact } = req.body;
    if (!shop_name || !shop_name.trim()) {
      return res.json({ code: 400, msg: '店铺名称不能为空' });
    }
    const seller = await getOrCreateSeller(req.user.id);
    await pool.execute(
      'UPDATE seller SET avatar=?, shop_name=?, intro=?, contact=? WHERE id=?',
      [avatar || '', shop_name.trim(), intro || '', contact || '', seller.id]
    );
    const [rows] = await pool.execute('SELECT * FROM seller WHERE id = ?', [seller.id]);
    res.json({ code: 200, msg: '更新成功', data: rows[0] });
  } catch (err) {
    console.error('更新卖家资料失败：', err);
    res.json({ code: 500, msg: '服务器错误' });
  }
};

exports.sellerLoginCheck = async (req, res) => {
  try {
    if (!req.user) return res.json({ code: 401, msg: '未登录' });
    if (req.user.role !== 'seller') return res.json({ code: 403, msg: '非卖家账号' });
    const seller = await getOrCreateSeller(req.user.id);
    res.json({ code: 200, msg: '卖家登录校验成功', data: { user: req.user, seller } });
  } catch (err) {
    console.error('卖家登录校验失败：', err);
    res.json({ code: 500, msg: '服务器错误' });
  }
};
