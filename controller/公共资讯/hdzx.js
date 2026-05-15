const pool = require('../../config/db');


// ================== 活动列表（只查主表）==================
exports.gethuodongApiList = async (req, res) => {
  try {
    const [list] = await pool.execute(`
      SELECT id, title, name, image, \`desc\`, status, time, create_time,content, page_type
      FROM huodong ORDER BY create_time DESC
    `);
    res.json({ code: 200, data: list, msg: '成功' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ code: 500, msg: '服务器错误' });
  }
};

// ================== 活动详情（id + title 双字段联表）==================
exports.gethuodongDetail = async (req, res) => {
  try {
    const { id, title } = req.params;
    if (!id || !title) return res.status(400).json({ code: 400, msg: '缺少参数' });

    // 优先联表匹配 ID+标题，没有就只按ID兜底
    const [rows] = await pool.execute(`
      SELECT h.*,
             COALESCE(hd.desc, hd2.desc) AS detail_desc,
             COALESCE(hd.content, hd2.content) AS detail_content,
             COALESCE(hd.extra_fields, hd2.extra_fields) AS extra_fields
      FROM huodong h
      LEFT JOIN huodong_detail hd 
        ON h.id = hd.activity_id AND h.title = hd.activity_title
      LEFT JOIN huodong_detail hd2
        ON h.id = hd2.activity_id
      WHERE h.id = ? AND h.title = ?
    `, [id, title]);

    if (!rows.length) return res.status(404).json({ code: 404, msg: '活动不存在' });

    const row = rows[0];
    let extra = {};
    try { if (row.extra_fields) extra = JSON.parse(row.extra_fields); } catch (e) {}

    const detail = {
      desc: row.detail_desc || '',
      content: row.detail_content || '',
      extra_fields: extra
    };

    res.json({
      code: 200,
      data: {
        ...row,
        detail: detail,
        extra_fields: extra
      },
      msg: 'ok'
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ code: 500, msg: '服务器错误' });
  }
};

exports.getzixunApiList = async (req, res) => {
  try {
    const [list] = await pool.execute('select * from zixun')
    res.json({ code: 200, data: list, msg: '获取资讯成功' });
  }
  catch (err) {
    console.error(err);
    res.status(500).json({ code: 500, msg: '服务器错误' });
  }

}
//2.管理员新增活动
exports.addhuodong = async (req, res) => {
  try {
    if (!req.user || req.user.role !== 'admin') {
      return res.status(403).json({ code: 403, msg: '无管理员权限' });
    }

    const {
      title,
      name,
      desc,
      image,
      url,
      status,       // 前端传字符串 '未开始'
      content,
      time,
      create_time,
    } = req.body;

    // 字符串转数字
    let statusNum = 0;
    switch (status) {
      case '未开始': statusNum = 0; break;
      case '进行中': statusNum = 1; break;
      case '快结束': statusNum = 2; break;
      case '已结束': statusNum = 3; break;
      case '已取消': statusNum = 4; break;
      default: statusNum = 0;
    }

    // 兜底空值
    const finalCreateTime = create_time || new Date().toISOString().slice(0, 19).replace('T', ' ');

    // SQL：字段数 = 占位符数 = 值数（9个）
    await pool.execute(
      `INSERT INTO huodong(
        title,
        name,
        \`desc\`,
        image,
        url,
        status,
        \`content\`,
        time,
        create_time
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        title || '',
        name || title || '',
        desc || '',
        image || '',
        url || '',
        statusNum,
        content || '',
        time || '',
        finalCreateTime
      ]
    );

    res.json({ code: 200, msg: '活动新增成功' });
  } catch (err) {
    console.error('新增活动失败：', err);
    res.json({ code: 500, msg: '新增失败' });
  }
};

//3.管理员修改活动内容
exports.updatehuodong = async (req, res) => {
  try {
    if (!req.user || req.user.role !== 'admin') {
      return res.status(403).json({ code: 403, msg: '无管理员权限' });
    }

    const {
      id,
      name,
      desc,
      image,
      url,
      status,
      content,
      time,
      create_time,
      title,
    } = req.body;

    // 前端字符串 → 数据库数字
    let statusNum = 0;
    switch (status) {
      case '未开始': statusNum = 0; break;
      case '进行中': statusNum = 1; break;
      case '快结束': statusNum = 2; break;
      case '已结束': statusNum = 3; break;
      case '已取消': statusNum = 4; break;
      default: statusNum = 0;
    }

    await pool.execute(
      `UPDATE huodong 
       SET title=?, name=?, \`desc\`=?, image=?, url=?, status=?, \`content\`=?, time=?, create_time=?
       WHERE id=?`,
      [title, name, desc, image, url, statusNum, content, time, create_time, id]
    );

    res.json({ code: 200, msg: '活动修改成功' });
  } catch (err) {
    console.error('修改活动失败：', err);
    res.json({ code: 500, msg: '修改失败' });
  }
};

// 单独修改状态
exports.updatehdstatus = async (req, res) => {
  try {
    if (!req.user || req.user.role !== 'admin') {
      return res.status(403).json({ code: 403, msg: '无管理员权限' });
    }

    const { id, status } = req.body;
    if (!id || status === undefined) {
      return res.status(400).json({ code: 400, msg: '缺少参数' });
    }

    // 字符串 → 数字
    let statusNum = 0;
    switch (status) {
      case '未开始': statusNum = 0; break;
      case '进行中': statusNum = 1; break;
      case '快结束': statusNum = 2; break;
      case '已结束': statusNum = 3; break;
      case '已取消': statusNum = 4; break;
      default: statusNum = 0;
    }

    await pool.execute(
      'UPDATE huodong SET status=? WHERE id=?',
      [statusNum, id]
    );

    res.json({ code: 200, msg: '状态修改成功' });
  } catch (err) {
    console.error('修改状态失败：', err);
    res.json({ code: 500, msg: '修改失败' });
  }
};
//4.管理员删除活动
exports.deletehuodong = async (req, res) => {
  try {
    if (!req.user || req.user.role !== 'admin') {
      return res.status(403).json({ code: 403, msg: '无管理员权限' });
    }
    const { id } = req.params;
    await pool.execute('DELETE FROM huodong WHERE id=?', [id]);
    res.json({ code: 200, msg: '活动删除成功' });
  } catch (err) {
    console.error(err);
    res.json({ code: 500, msg: '活动删除失败' });
  }
};

// ========== 图书资讯 CRUD ==========

//5.管理员新增资讯
exports.addzixun = async (req, res) => {
  try {
    if (!req.user || req.user.role !== 'admin') {
      return res.status(403).json({ code: 403, msg: '无管理员权限' });
    }

    const {
      name,
      desc,
      image,
      url,
      status,      // 前端传的是字符串 '未发布'
      content,
      time,
      create_time,
      title,
    } = req.body;

    // 状态字符串转数字
    let statusNum = 0;
    switch (status) {
      case '未发布': statusNum = 0; break;
      case '已发布': statusNum = 1; break;
      case '已下架': statusNum = 2; break;
      default: statusNum = 0;
    }

    // 处理空的 create_time
    const finalCreateTime = create_time || new Date().toISOString().slice(0, 19).replace('T', ' ');

    await pool.execute(
      `INSERT INTO zixun(name, \`desc\`, image, url, status, \`content\`, time, create_time, title) 
       VALUES (?,?,?,?,?,?,?,?,?)`,
      [name || '', desc || '', image || '', url || '', statusNum, content || '', time || '', finalCreateTime, title || '']
    );

    res.json({ code: 200, msg: '资讯新增成功' });
  } catch (err) {
    console.error('新增资讯失败：', err);
    res.json({ code: 500, msg: '新增失败' });
  }
};

//6.管理员修改资讯内容
exports.updatezixun = async (req, res) => {
  try {
    if (!req.user || req.user.role !== 'admin') {
      return res.status(403).json({ code: 403, msg: '无管理员权限' });
    }

    const {
      id,
      name,
      desc,
      image,
      url,
      status,
      content,
      time,
      create_time,
      title,
    } = req.body;

    // 前端字符串 → 数据库数字
    let statusNum = 0;
    switch (status) {
      case '未发布': statusNum = 0; break;
      case '已发布': statusNum = 1; break;
      case '已下架': statusNum = 2; break;
      default: statusNum = 0;
    }

    await pool.execute(
      `UPDATE zixun 
       SET name=?, \`desc\`=?, image=?, url=?, status=?, \`content\`=?, time=?, create_time=?, title=? 
       WHERE id=?`,
      [name, desc, image, url, statusNum, content, time, create_time, title, id]
    );

    res.json({ code: 200, msg: '资讯修改成功' });
  } catch (err) {
    console.error('修改资讯失败：', err);
    res.json({ code: 500, msg: '修改失败' });
  }
};

//7.单独修改资讯状态
exports.updatezxstatus = async (req, res) => {
  try {
    if (!req.user || req.user.role !== 'admin') {
      return res.status(403).json({ code: 403, msg: '无管理员权限' });
    }

    const { id, status } = req.body;
    if (!id || status === undefined) {
      return res.status(400).json({ code: 400, msg: '缺少参数' });
    }

    // 字符串 → 数字
    let statusNum = 0;
    switch (status) {
      case '未发布': statusNum = 0; break;
      case '已发布': statusNum = 1; break;
      case '已下架': statusNum = 2; break;
      default: statusNum = 0;
    }

    await pool.execute(
      'UPDATE zixun SET status=? WHERE id=?',
      [statusNum, id]
    );

    res.json({ code: 200, msg: '资讯状态修改成功' });
  } catch (err) {
    console.error('修改资讯状态失败：', err);
    res.json({ code: 500, msg: '修改失败' });
  }
};

//8.管理员删除资讯
exports.deletezixun = async (req, res) => {
  try {
    if (!req.user || req.user.role !== 'admin') {
      return res.status(403).json({ code: 403, msg: '无管理员权限' });
    }
    const { id } = req.params;
    await pool.execute('DELETE FROM zixun WHERE id=?', [id]);
    res.json({ code: 200, msg: '资讯删除成功' });
  } catch (err) {
    console.error(err);
    res.json({ code: 500, msg: '资讯删除失败' });
  }
};