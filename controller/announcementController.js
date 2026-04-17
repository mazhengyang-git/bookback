// 数据库连接池
const pool = require('../config/db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

//1.获取所有公告（所有人可见）
exports.getAnnouncement = async (req, res) => {
  try {
    const [list] = await pool.execute('SELECT * FROM gonggao ORDER BY create_time DESC');
    res.json({ code: 200, data: list, msg: '获取成功' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ code: 500, msg: '服务器错误' });
  }
};

//2.管理员新增公告
exports.addAnnouncement = async (req, res) => {
  try {
    const { title, content } = req.body;
    const admin_id = req.user.id;

    await pool.execute(
      'INSERT INTO gonggao (title, content, admin_id) VALUES (?,?,?)',
      [title, content, admin_id]
    );
    res.json({ code: 200, msg: '发布成功' });
  } catch (err) {
    console.error(err);
    res.json({ code: 500, msg: '发布失败' });
  }
};

//3.管理员修改公告
exports.updateAnnouncement = async (req, res) => {
  try {
    const { id, title, content } = req.body;
    await pool.execute(
      'UPDATE gonggao SET title=?, content=? WHERE id=?',
      [title, content, id]
    );
    res.json({ code: 200, msg: '修改成功' });
  } catch (err) {
    console.error(err);
    res.json({ code: 500, msg: '修改失败' });
  }
};

//4.管理员删除公告
exports.deleteAnnouncement = async (req, res) => {
  try {
    const { id } = req.params;
    await pool.execute('DELETE FROM gonggao WHERE id=?', [id]);
    res.json({ code: 200, msg: '删除成功' });
  } catch (err) {
    console.error(err);
    res.json({ code: 500, msg: '删除失败' });
  }
};

// ==============================================
// 用户个人中心 → 绑定/修改手机号
// ==============================================
exports.bindPhone = async (req, res) => {
  try {
    const { phone } = req.body;
    const userId = req.user.id;

    // 校验手机号格式
    if (!/^1[3-9]\d{9}$/.test(phone)) {
      return res.json({ code: 400, msg: '手机号格式不正确' });
    }

    // 校验手机号是否被其他用户绑定
    const [rows] = await pool.execute('SELECT * FROM user WHERE phone = ? AND id != ?', [phone, userId]);
    if (rows.length > 0) {
      return res.json({ code: 400, msg: '该手机号已被其他账号绑定' });
    }

    // 更新手机号
    await pool.execute('UPDATE user SET phone = ? WHERE id = ?', [phone, userId]);
    res.json({ code: 200, msg: '手机号绑定成功' });
  } catch (err) {
    console.error(err);
    res.json({ code: 500, msg: '绑定失败' });
  }
};

// ==============================================
// 管理员 → 重置用户密码（核心最终版）
// 验证手机号 + 生成临时密码 + 插入私密公告到 gonggao 表
// ==============================================
// 管理员重置用户密码（安全版：仅后端打印新密码）
exports.resetUserPassword = async (req, res) => {
  try {
    const { userId, phone } = req.body;

    // 1. 校验用户+手机号
    const [rows] = await pool.execute('SELECT * FROM user WHERE id = ? AND phone = ?', [userId, phone]);
    if (rows.length === 0) {
      return res.json({ code: 400, msg: '用户不存在或手机号不匹配' });
    }

    // 2. 生成随机8位新密码（字母+数字）
    const newPassword = Math.random().toString(36).slice(2, 10);
    
    // 🔴 安全核心：仅后端控制台打印新密码，不返回前端！
    console.log('====================================');
    console.log('【管理员重置用户密码】');
    console.log('用户ID：', userId);
    console.log('用户名：', rows[0].username);
    console.log('绑定手机号：', phone);
    console.log('重置后的新密码：', newPassword);
    console.log('====================================');

    // 3. 加密密码
    const salt = await bcrypt.genSalt(10);
    const hashPwd = await bcrypt.hash(newPassword, salt);

    // 4. 更新数据库
    await pool.execute('UPDATE user SET password = ? WHERE id = ?', [hashPwd, userId]);

    // 5. 前端只收成功状态，不接收任何密码信息
    res.json({ code: 200, msg: '密码重置成功，已通过后台服务器展示' });
  } catch (err) {
    console.error(err);
    res.json({ code: 500, msg: '重置失败' });
  }
};
// ==============================================
// 获取公告（支持全局+私密，未登录可查）
// 用户忘记密码，未登录也能看到自己的重置通知
// ==============================================
exports.getMyNotice = async (req, res) => {
  try {
    let userId = null;
    // 尝试解析用户ID
    const token = req.headers.authorization?.split(' ')[1];
    if (token) {
      try {
        const decoded = jwt.verify(token, 'abc123def456');
        userId = decoded.id;
      } catch (err) {}
    }

    // 查询规则：全局公告(user_id null) + 自己的私密公告
    const [list] = await pool.execute(
      'SELECT * FROM gonggao WHERE user_id IS NULL OR user_id = ? ORDER BY create_time DESC',
      [userId]
    );

    res.json({ code: 200, data: list });
  } catch (err) {
    res.status(500).json({ code: 500, msg: '获取失败' });
  }
};