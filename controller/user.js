const pool = require('../config/db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// 验证码缓存
const verifyCodeCache = {};

// ===================== 上传配置 =====================
const uploadDir = path.join(__dirname, '../public/uploads/avatars');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, 'avatar-' + uniqueSuffix + ext);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 2 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = ['image/jpeg', 'image/png'];
    if (allowed.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('仅支持 JPG/PNG'));
    }
  }
});

// ===================== 注册 =====================
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

// ===================== 登录 =====================
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
      data: { token, user }
    });
  } catch (err) {
    console.error(err);
    res.json({ code: 500, msg: '服务器错误' });
  }
};

// ===================== 获取用户信息 =====================
exports.getUserInfo = async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.json({ code: 401, msg: '未登录' });

    const decoded = jwt.verify(token, 'abc123def456');
    const [rows] = await pool.execute(
      'SELECT id,username,role,phone,sign,avatar FROM user WHERE id = ?',
      [decoded.id]
    );

    if (rows.length === 0) return res.json({ code: 401, msg: '用户不存在' });

    res.json({ code: 200, data: rows[0] });
  } catch (err) {
    res.json({ code: 401, msg: '登录已过期' });
  }
};

// ===================== 发送短信验证码 =====================
exports.sendSmsCode = async (req, res) => {
  try {
    const { phone } = req.body;
    if (!phone || !/^1[3-9]\d{9}$/.test(phone)) {
      return res.json({ code: 400, msg: '请输入正确的手机号' });
    }

    const code = Math.floor(100000 + Math.random() * 900000).toString();
    verifyCodeCache[phone] = code;
    setTimeout(() => delete verifyCodeCache[phone], 5 * 60 * 1000);

    console.log('====== 验证码 ======');
    console.log('手机号:', phone);
    console.log('验证码:', code);

    res.json({
      code: 200,
      msg: '验证码发送成功',
      data: { code }
    });
  } catch (err) {
    console.error(err);
    res.json({ code: 500, msg: '验证码发送失败' });
  }
};

// ===================== 短信登录 =====================
exports.loginBySmsCode = async (req, res) => {
  try {
    const { phone, code, role } = req.body;
    if (!phone || !code || !role) {
      return res.json({ code: 400, msg: '参数不全' });
    }

    if (!verifyCodeCache[phone] || verifyCodeCache[phone] !== code) {
      return res.json({ code: 400, msg: '验证码错误或已过期' });
    }

    const [rows] = await pool.execute(
      'SELECT * FROM user WHERE phone = ? AND role = ?',
      [phone, role]
    );

    if (rows.length === 0) {
      return res.json({ code: 400, msg: '该手机号未注册或角色不匹配' });
    }

    const user = rows[0];
    const token = jwt.sign({ id: user.id, role: user.role }, 'abc123def456', { expiresIn: '7d' });
    delete verifyCodeCache[phone];

    res.json({ code: 200, msg: '登录成功', data: { token, user } });
  } catch (err) {
    console.error(err);
    res.json({ code: 500, msg: '服务器错误' });
  }
};

// ===================== 验证码核验 =====================
exports.verifyCode = async (req, res) => {
  try {
    const { phone, code } = req.body;
    if (!phone || !code) return res.json({ code: 400, msg: '参数不全' });
    if (!/^1[3-9]\d{9}$/.test(phone)) return res.json({ code: 400, msg: '手机号格式错误' });

    if (!verifyCodeCache[phone] || verifyCodeCache[phone] !== code) {
      return res.json({ code: 400, msg: '短信验证码错误或已过期' });
    }

    res.json({ code: 200, msg: '验证码核验成功' });
  } catch (err) {
    res.json({ code: 500, msg: '服务器校验失败' });
  }
};

// ===================== 绑定手机号 =====================
exports.bindPhone = async (req, res) => {
  try {
    const { phone: newPhone } = req.body;
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.json({ code: 401, msg: '请先登录' });

    const decoded = jwt.verify(token, 'abc123def456');
    if (!newPhone || !/^1[3-9]\d{9}$/.test(newPhone)) {
      return res.json({ code: 400, msg: '请输入正确的11位手机号' });
    }

    await pool.execute('UPDATE user SET phone = ? WHERE id = ?', [newPhone, decoded.id]);
    res.json({ code: 200, msg: '绑定手机号修改成功' });
  } catch (err) {
    res.json({ code: 500, msg: '服务器错误' });
  }
};

// ===================== 获取签名 =====================
exports.getSign = async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.json({ code: 401, msg: '请先登录' });
    const decoded = jwt.verify(token, 'abc123def456');

    const [rows] = await pool.execute('SELECT sign FROM user WHERE id = ?', [decoded.id]);
    if (rows.length === 0) return res.json({ code: 404, msg: '用户不存在' });

    res.json({ code: 200, data: { sign: rows[0].sign } });
  } catch (err) {
    res.json({ code: 500, msg: '获取签名失败' });
  }
};

// ===================== 修改签名 =====================
exports.updasign = async (req, res) => {
  try {
    const { sign: newSign } = req.body;
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.json({ code: 401, msg: '请先登录' });
    const decoded = jwt.verify(token, 'abc123def456');

    const urlReg = /(http|https):\/\/|www\.|\.(com|cn|net|org|top|xyz|vip|io)/i;
    if (urlReg.test(newSign)) {
      return res.json({ code: 400, msg: '禁止填写网址链接' });
    }
    if (newSign && newSign.length > 255) {
      return res.json({ code: 400, msg: '签名不能超过255字符' });
    }

    await pool.execute('UPDATE user SET sign = ? WHERE id = ?', [newSign ?? '', decoded.id]);
    res.json({ code: 200, msg: '签名保存成功' });
  } catch (err) {
    res.json({ code: 500, msg: '保存失败' });
  }
};

// ===================== 修改头像URL =====================
exports.updateAvatar = async (req, res) => {
  try {
    const { avatar } = req.body;
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.json({ code: 401, msg: '请先登录' });
    const decoded = jwt.verify(token, 'abc123def456');

    await pool.execute('UPDATE user SET avatar = ? WHERE id = ?', [avatar || '', decoded.id]);
    res.json({ code: 200, msg: '头像更新成功' });
  } catch (err) {
    res.json({ code: 500, msg: '服务器错误' });
  }
};

// ===================== 上传头像文件 =====================
exports.uploadAvatar = async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.json({ code: 401, msg: '请先登录' });
    const decoded = jwt.verify(token, 'abc123def456');

    upload.single('file')(req, res, async (err) => {
      if (err) return res.json({ code: 400, msg: '上传失败：' + err.message });
      if (!req.file) return res.json({ code: 400, msg: '请选择图片' });

      // 地址
      const avatarUrl = `http://localhost:3002/uploads/avatars/${req.file.filename}`;
      await pool.execute('UPDATE user SET avatar = ? WHERE id = ?', [avatarUrl, decoded.id]);

      res.json({ code: 200, msg: '上传成功', data: { url: avatarUrl } });
    });
  } catch (err) {
    res.json({ code: 500, msg: '服务器错误' });
  }
};
// ===================== 随机评论 =====================
exports.getRandomComments = async (req, res) => {
  try {
    const { bookId } = req.body;
    if (!bookId) return res.json({ code: 400, msg: '图书ID不能为空' });

    const [count] = await pool.execute('SELECT COUNT(*) AS total FROM comment WHERE book_id = ?', [bookId]);
    if (count[0].total === 0) return res.json({ code: 200, data: [] });

    const [comments] = await pool.execute(
      'SELECT * FROM comment WHERE book_id = ? ORDER BY RAND() LIMIT 3',
      [bookId]
    );
    res.json({ code: 200, data: comments });
  } catch (err) {
    res.json({ code: 500, msg: '获取评论失败' });
  }
};
 exports.userinfo = async (req, res) => {
  try {
    const { username } = req.query;
    if (!username) {
      return res.json({ code: 400, msg: "用户名不能为空" });
    }

    const [rows] = await pool.execute(
      "SELECT username, role, avatar, sign FROM user WHERE username = ?",
      [username]
    );

    if (rows.length === 0) {
      return res.json({ code: 400, msg: "用户不存在" });
    }

    res.json({
      code: 200,
      data: rows[0],
    });
  } catch (err) {
    console.error(err);
    res.json({ code: 500, msg: "服务器错误" });
  }
};

