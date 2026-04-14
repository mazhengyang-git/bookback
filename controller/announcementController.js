//数据库连接池
const pool = require('../config/db');

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