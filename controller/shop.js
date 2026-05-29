//导入数据库连接
const pool = require('../config/db')

// 1. 关注店铺
exports.addShop = async (req, res) => {
  try {
    const { shop_id, shop_name, shop_avatar } = req.body;
    const userId = req.user.id;

    if (!shop_id) {
      return res.json({ code: 400, msg: '参数缺失：shop_id不能为空' });
    }

    // 判断是否已关注
    const [exist] = await pool.execute(
      'SELECT id FROM shop WHERE user_id = ? AND shop_id = ?',
      [userId, shop_id]
    );
    if (exist.length > 0) {
      return res.json({ code: 400, msg: '已关注该店铺' });
    }

    // 插入关注
    await pool.execute(
      `INSERT INTO shop (user_id, shop_id, shop_name, shop_avatar)
       VALUES (?, ?, ?, ?)`,
      [userId, shop_id, shop_name || '未知店铺', shop_avatar || '']
    );

    res.json({ code: 200, msg: '关注成功' });
  } catch (error) {
    console.error(error);
    res.json({ code: 500, msg: '服务器错误' });
  }
};

// 2. 获取我的关注店铺列表
exports.getShop = async (req, res) => {
  try {
    const userId = req.user.id;
    const [followList] = await pool.execute(`
      SELECT 
        sf.id AS follow_id,
        sf.shop_id,
        sf.shop_name,
        sf.shop_avatar,
        sf.create_time
      FROM shop sf
      WHERE sf.user_id = ?
      ORDER BY sf.create_time DESC
    `, [userId]);

    res.json({ code: 200, msg: '获取关注店铺成功', data: followList });
  } catch (error) {
    console.error(error);
    res.json({ code: 500, msg: '服务器错误', data: [] });
  }
};

// 3. 取消关注店铺
exports.deleteShop = async (req, res) => {
  try {
    const { follow_id } = req.body;
    const userId = req.user.id;

    await pool.execute(
      'DELETE FROM shop WHERE id = ? AND user_id = ?',
      [follow_id, userId]
    );

    res.json({ code: 200, msg: '取消关注成功' });
  } catch (error) {
    console.error('取消关注失败：', error);
    res.json({ code: 500, msg: '服务器错误' });
  }
};

// 4. 清空所有关注
exports.clearShop = async (req, res) => {
  try {
    const userId = req.user.id;
    await pool.execute('DELETE FROM shop WHERE user_id = ?', [userId]);
    res.json({ code: 200, msg: '已清空所有店铺关注' });
  } catch (error) {
    console.error('清空失败：', error);
    res.json({ code: 500, msg: '服务器错误' });
  }
};