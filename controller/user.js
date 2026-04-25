const pool = require('../config/db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// ===================== 全局缓存：存储手机号验证码（测试用，正式换Redis） =====================
const verifyCodeCache = {};

//注册
exports.register = async (req, res) => {
  try {
    const { username, password, role } = req.body;

    if (!username || !password) {
      return res.json({ code: 400, msg: '用户名或密码不能为空' });
    }

    const [rows] = await pool.execute('SELECT * FROM user WHERE username = ?', [username]);
    if (rows.length > 0) {
      return res.json({ code: 400, msg: '用户名已存在' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashPwd = await bcrypt.hash(password, salt);

    await pool.execute(
      'INSERT INTO user (username, password, role) VALUES (?, ?, ?)',
      [username, hashPwd, role || 'buyer']
    );

    res.json({ code: 200, msg: '注册成功' });
  } catch (err) {
    console.error(err);
    res.json({ code: 500, msg: '服务器错误' });
  }
};

//登录（原密码登录）
exports.login = async (req, res) => {
  try {
    const { username, password, role } = req.body;

    if (!username || !password || !role) {
      return res.json({ code: 400, msg: '参数不全' });
    }

    const [rows] = await pool.execute(
      'SELECT * FROM user WHERE username = ? AND role = ?',
      [username, role]
    );

    if (rows.length === 0) {
      return res.json({ code: 400, msg: '账号不存在' });
    }

    const user = rows[0];
    const isOk = await bcrypt.compare(password, user.password);

    if (!isOk) {
      return res.json({ code: 400, msg: '账号或密码错误' });
    }

    const token = jwt.sign(
      { id: user.id, role: user.role },
      'abc123def456',
      { expiresIn: '7d' }
    );

    res.json({
      code: 200,
      msg: '登录成功',
      data: {
        token: token,
        user: user
      }
    });
  } catch (err) {
    console.error(err);
    res.json({ code: 500, msg: '服务器错误' });
  }
};

//获取用户信息
exports.getUserInfo = async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.json({ code: 401, msg: '未登录' });

    const decoded = jwt.verify(token, 'abc123def456');
    const [rows] = await pool.execute('SELECT id,username,role,phone FROM user WHERE id = ?', [decoded.id]);

    if (rows.length === 0) return res.json({ code: 401, msg: '用户不存在' });

    res.json({ code: 200, data: rows[0] });
  } catch (err) {
    res.json({ code: 401, msg: '登录已过期' });
  }
};

// ===================== 发送短信验证码（模拟版，控制台查看验证码） =====================
exports.sendSmsCode = async (req, res) => {
  try {
    const { phone } = req.body;

    // 1. 校验手机号格式
    if (!phone || !/^1[3-9]\d{9}$/.test(phone)) {
      return res.json({ code: 400, msg: '请输入正确的手机号' });
    }

    // 2. 生成6位数字验证码
    const code = Math.floor(100000 + Math.random() * 900000).toString();

    // 3. 存储验证码，5分钟后过期
    verifyCodeCache[phone] = code;
    setTimeout(() => {
      delete verifyCodeCache[phone];
    }, 5 * 60 * 1000);

    // 4. 模拟发送：控制台打印验证码（开发测试用）
    console.log('====================================');
    console.log('手机号：', phone);
    console.log('验证码：', code);
    console.log('====================================');

   res.json({ 
  code: 200, 
  msg: '验证码发送成功（前后台控制台均可查看）',
  // 开发环境额外返回验证码，方便前端调试
  data: {
    code: code 
  }
});
  } catch (err) {
    console.error(err);
    res.json({ code: 500, msg: '验证码发送失败' });
  }
};

// ===================== 2. 手机号+验证码登录 =====================
exports.loginBySmsCode = async (req, res) => {
  try {
    const { phone, code, role } = req.body;

    // 1. 校验参数
    if (!phone || !code || !role) {
      return res.json({ code: 400, msg: '参数不全' });
    }

    // 2. 校验验证码是否正确/过期
    if (!verifyCodeCache[phone] || verifyCodeCache[phone] !== code) {
      return res.json({ code: 400, msg: '验证码错误或已过期' });
    }

    // 3. 根据 手机号+角色 查询用户（必须绑定过手机号）
    const [rows] = await pool.execute(
      'SELECT * FROM user WHERE phone = ? AND role = ?',
      [phone, role]
    );

    if (rows.length === 0) {
      return res.json({ code: 400, msg: '该手机号未注册或角色不匹配' });
    }

    const user = rows[0];

    // 4. 生成Token（和原登录逻辑一致）
    const token = jwt.sign(
      { id: user.id, role: user.role },
      'abc123def456',
      { expiresIn: '7d' }
    );

    // 5. 登录成功，删除验证码（一次性使用）
    delete verifyCodeCache[phone];

    res.json({
      code: 200,
      msg: '验证码登录成功',
      data: {
        token: token,
        user: user
      }
    });
  } catch (err) {
    console.error(err);
    res.json({ code: 500, msg: '服务器错误' });
  }
};

// ===================== 【新增1：验证码真实性核验接口 解决404报错 /api/user/verify-code】 =====================
// 完全复用你现有的验证码缓存池，和发送短信、验证码登录逻辑100%统一
exports.verifyCode = async (req, res) => {
  try {
    const { phone, code } = req.body;

    // 基础参数校验
    if (!phone || !code) {
      return res.json({ code: 400, msg: '参数不全' });
    }
    if (!/^1[3-9]\d{9}$/.test(phone)) {
      return res.json({ code: 400, msg: '手机号格式错误' });
    }

    // 校验缓存里的验证码是否存在、匹配、未过期
    if (!verifyCodeCache[phone] || verifyCodeCache[phone] !== code) {
      return res.json({ code: 400, msg: '短信验证码错误或已过期' });
    }

    // 验证码校验成功
    res.json({ code: 200, msg: '验证码核验成功' });
  } catch (err) {
    console.error(err);
    res.json({ code: 500, msg: '服务器校验失败' });
  }
};

// ===================== 【新增2：修改/绑定手机号接口 /api/user/bind-phone】 =====================
// 带登录Token鉴权，更新数据库用户手机号，完全适配你user表结构
exports.bindPhone = async (req, res) => {
  try {
    const { phone: newPhone } = req.body;
    // 1. 校验登录Token（和你所有用户接口鉴权逻辑完全统一）
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.json({ code: 401, msg: '请先登录' });

    const decoded = jwt.verify(token, 'abc123def456');
    const userId = decoded.id;

    // 2. 新手机号格式校验
    if (!newPhone || !/^1[3-9]\d{9}$/.test(newPhone)) {
      return res.json({ code: 400, msg: '请输入正确的11位手机号' });
    }

    // 3. 数据库更新当前登录用户的绑定手机号
    await pool.execute(
      'UPDATE user SET phone = ? WHERE id = ?',
      [newPhone, userId]
    );

    res.json({ code: 200, msg: '绑定手机号修改成功' });
  } catch (err) {
    console.error(err);
    res.json({ code: 500, msg: '服务器错误，手机号修改失败' });
  }
};

// ===================== 【新增3：获取图书随机3条评价】=====================
exports.getRandomComments = async (req, res) => {
  try {
    const { bookId } = req.body;
    if (!bookId) {
      return res.json({ code: 400, msg: '图书ID不能为空' });
    }

    // 1. 先获取总评论数
    const [countRes] = await pool.execute(
      'SELECT COUNT(*) AS total FROM comment WHERE book_id = ?',
      [bookId]
    );
    const total = countRes[0].total;

    if (total === 0) {
      return res.json({ code: 200, data: [] });
    }

    // 2. 随机获取3条评论
    // 注意：不同数据库随机排序语法不同，以下为 MySQL 语法
    const [comments] = await pool.execute(
      'SELECT * FROM comment WHERE book_id = ? ORDER BY RAND() LIMIT 3',
      [bookId]
    );

    res.json({ code: 200, data: comments });
  } catch (err) {
    console.error('获取随机评论失败：', err);
    res.json({ code: 500, msg: '服务器错误，获取随机评论失败' });
  }
};