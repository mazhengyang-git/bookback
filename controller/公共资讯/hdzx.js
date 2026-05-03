const pool = require('../../config/db');



exports.gethuodongApiList = async (req, res) => {
  try {
    const [list] = await pool.execute('select * from huodong')
    res.json({ code: 200, data: list, msg: '获取活动成功' });
  }
  catch (err) {
    console.error(err);
    res.status(500).json({ code: 500, msg: '服务器错误' });
  }

}


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
      id,
      name,
      desc,
      image,
      url,
      status,
      content,
      time,
      create_time,
    } = req.body;

    // 数据库字段顺序
    // book_name, author, category, author_into, price, stock, cover, `desc`, mulu, status
    await pool.execute(
      `INSERT INTO huodong(name,
      \`desc\`,
      image,
      url,
      status,
      \`content\`,
    time,
     create_time,) 
       VALUES (?,?,?,?,?,?,?,?,?,?)`,

      [name,
        desc,
        image,
        url,
        status,
        content,
        time,
        create_time]
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
       SET name=?, \`desc\`=?, image=?, url=?, status=?, \`content\`=?, time=?, create_time=? 
       WHERE id=?`,
      [name, desc, image, url, statusNum, content, time, create_time, id]
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