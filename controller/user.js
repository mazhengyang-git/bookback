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