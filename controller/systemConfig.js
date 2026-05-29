const pool = require('../config/db');
// 1. 获取所有系统配置（或单个配置）
exports.getSystemConfig = async (req, res) => {
  try {
    const { key } = req.query;
    let sql = 'SELECT * FROM system_config';
    let params = [];
    
    if (key) {
      sql += ' WHERE config_key = ?';
      params.push(key);
    }
    const [rows] = await pool.execute(sql, params);
    // 处理JSON格式的value
    const data = rows.map(row => ({
      ...row,
      config_value: parseJsonSafely(row.config_value)
    }));
    res.json({ 
      code: 200, 
      data: key ? data[0] : data, 
      msg: '获取配置成功' 
    });
  } catch (err) {
    console.error('获取配置失败：', err);
    res.status(500).json({ code: 500, msg: '服务器错误' });
  }
};
// 2. 更新系统配置（管理员）
exports.updateSystemConfig = async (req, res) => {
  try {
    // 权限校验
    if (!req.user || req.user.role !== 'admin') {
      return res.status(403).json({ code: 403, msg: '无管理员权限' });
    }
    const { config_key, config_value, config_desc } = req.body;
    // 自动处理JSON格式
    const valueToStore = typeof config_value === 'object' 
      ? JSON.stringify(config_value) 
      : config_value;
    // 使用 INSERT ... ON DUPLICATE KEY UPDATE 实现新增或更新
    await pool.execute(
      `INSERT INTO system_config (config_key, config_value, config_desc) 
       VALUES (?, ?, ?) 
       ON DUPLICATE KEY UPDATE 
       config_value = VALUES(config_value), 
       config_desc = VALUES(config_desc)`,
      [config_key, valueToStore, config_desc || '']
    );
    res.json({ code: 200, msg: '配置更新成功' });
  } catch (err) {
    console.error('更新配置失败：', err);
    res.status(500).json({ code: 500, msg: '更新配置失败' });
  }
};

// 辅助函数：安全解析JSON
function parseJsonSafely(str) {
  if (!str) return str;
  try {
    return JSON.parse(str);
  } catch (e) {
    return str;
  }
}