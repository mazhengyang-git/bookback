const jwt = require('jsonwebtoken');
require('dotenv').config();
const secretKey = 'abc123def456';

//登录验证中间件
const auth = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.json({ code: 401, msg: '未登录，请先登录' });
  }
  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, secretKey);
    req.user = decoded;
    next();
  } catch (err) {
    console.error('Token解析失败：', err);
    return res.json({ code: 401, msg: 'Token失效，请重新登录' });
  }
};

//管理员权限校验
auth.admin = (req, res, next) => {
  if (!req.user || req.user.role !== 'admin') {
    return res.json({ code: 403, msg: '无管理员权限' });
  }
  next();
};

//默认导出auth
module.exports = auth;