//数据库连接池
const pool = require('../config/db');

//管理员获取所有用户信息（含买家/卖家数量统计）
exports.getuserment = async (req, res) => {
  try {
    //1.管理员权限校验（失败直接return，无需else）
    if (!req.user || req.user.role !== 'admin') {
      return res.status(403).json({ code: 403, msg: '无管理员权限，禁止访问' });
    }

    //2.查询用户列表
    const [list] = await pool.execute(
      'SELECT id, username, create_time,phone, update_time, role FROM user ORDER BY id DESC'
    );

    //3.统计买家数量（role = 'buyer'）
    const [buyerCountResult] = await pool.execute(
      'SELECT COUNT(*) AS count FROM user WHERE role = ?',
      ['buyer'] // 参数化查询防注入
    );

    //4.统计卖家数量（role = 'seller'）
    const [sellerCountResult] = await pool.execute(
      'SELECT COUNT(*) AS count FROM user WHERE role = ?',
      ['seller']
    );

    //5.统计总用户数（SQL查询）
    const [totalCountResult] = await pool.execute(
      'SELECT COUNT(*) AS count FROM user'
    );

    //6.整理统计数据（SQL结果）
    const statistics = {
      buyerCount: buyerCountResult[0].count, // 买家数量
      sellerCount: sellerCountResult[0].count, // 卖家数量
      totalUserCount: totalCountResult[0].count // 总用户数（精准）
    };

    //7.响应：返回用户列表+统计数据
    res.json({
      code: 200,
      data: {
        list: list, // 变量名统一为list
        statistics: statistics
      },
      msg: '获取用户列表及统计数据成功'
    });

  } catch (err) {
    console.error('获取用户列表失败：', err);
    res.status(500).json({ code: 500, msg: '服务器错误，获取用户数据失败' });
  }
};