const pool = require('../config/db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

//修改用户信息
exports.userupdate = async (req, res) => {
  try {
    const { username, password,originalUsername} = req.body;

    const userId = req.user.id;
    
if (username !== originalUsername) {
    const [rows] = await pool.execute('SELECT * FROM user WHERE username = ?', [username]);
    if (rows.length > 0) {
      return res.json({ code: 400, msg: '用户名已存在' });
    }   
    }
const [userRows] = await pool.execute('SELECT password FROM user WHERE id = ?', [userId]);
    if (userRows.length === 0) {
      return res.json({ code: 400, msg: '用户不存在' });
    }
    const oldPasswordHash = userRows[0].password; // 数据库里的bcrypt哈希

    //只有用户填了新密码，才做校验
    if (password && password.trim() !== '') {
      // 用bcrypt.compare正确对比：明文新密码 和 原哈希
      const isSamePassword = await bcrypt.compare(password, oldPasswordHash);
      if (isSamePassword) {
        //新密码和原密码一致，拦截报错
        return res.json({ code: 400, msg: '新密码不能与原密码一致' });
      }
    }

    // ========== 3. 执行更新 ==========
    let sql = 'UPDATE user SET username = ?';
    let params = [username];

    // 密码不为空，才加密更新
    if (password && password.trim() !== '') {
      const salt = await bcrypt.genSalt(10);
      const hashPwd = await bcrypt.hash(password, salt);
      sql += ', password = ?';
      params.push(hashPwd);
    }

    sql += ' WHERE id = ?';
    params.push(userId);

    await pool.execute(sql, params);
    res.json({ code: 200, msg: '修改账号信息成功' });
  } catch (err) {
    console.error(err);
    res.json({ code: 500, msg: '修改失败,服务器错误' });
  }
};
