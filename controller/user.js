const pool = require('../config/db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

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

//登录
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
      return res.json({ code: 400, msg: '账号或密码错误' });
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
    const [rows] = await pool.execute('SELECT id,username,role FROM user WHERE id = ?', [decoded.id]);

    if (rows.length === 0) return res.json({ code: 401, msg: '用户不存在' });

    res.json({ code: 200, data: rows[0] });
  } catch (err) {
    res.json({ code: 401, msg: '登录已过期' });
  }
};