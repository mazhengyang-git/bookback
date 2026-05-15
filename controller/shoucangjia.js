//导入数据库连接
const pool = require('../config/db')


//1.加入收藏夹 

exports.addShoucang = async (req, res) => {
  try {
    console.log('前端传入的参数：', req.body);
    const { goodsId, num, spec, source, bookName, bookCover, bookPrice } = req.body;
    const userId = req.user.id;

    if (!goodsId || !num || !spec) {
      return res.json({ code: 400, msg: '参数缺失：goodsId/num/spec不能为空' });
    }

    // 先查是否已经收藏
    const [exist] = await pool.execute(
      'SELECT id FROM shoucang WHERE user_id = ? AND goods_id = ? AND spec = ? AND source = ?',
      [userId, goodsId, spec, source || 'normal']
    );

    // 已存在 返回提示
    if (exist.length > 0) {
      return res.json({ code: 400, msg: '该图书已在收藏夹中' });
    }

    let bookInfo = null;
    if (source === 'new') {
      bookInfo = {
        book_name: bookName || '新书',
        price: bookPrice || 0.00,
        cover: bookCover || '/default-book.png'
      };
    } else {
      const [bookRows] = await pool.execute(
        'SELECT book_name, price, cover FROM book WHERE id = ?',
        [goodsId]
      );
      if (!bookRows.length) {
        return res.json({ code: 400, msg: '图书不存在' });
      }
      bookInfo = bookRows[0];
    }

    // 插入收藏
    await pool.execute(
      `INSERT INTO shoucang
      (user_id, goods_id, quantity, spec, book_name, book_price, book_cover, source)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        userId,
        goodsId,
        num,
        spec,
        bookInfo.book_name,
        bookInfo.price,
        bookInfo.cover,
        source || 'normal'
      ]
    );

    res.json({ code: 200, msg: '收藏成功' });
  } catch (error) {
    console.error('收藏失败详情：', error);
    res.json({ code: 500, msg: '服务器错误' });
  }
};
//2.获取收藏夹列表
exports.getShoucangList = async (req, res) => {
  try {
    const userId = req.user.id;
    //1.查询当前用户的收藏夹数据 查询source字段
    const [shoucangList] = await pool.execute(`
      SELECT 
        c.id AS shoucang_id,
        c.user_id,
        c.goods_id,
        c.quantity,
        c.spec,
        c.book_name,
      c.book_price,
        c.book_cover,
        c.source,
        b.cover AS book_cover_backup
      FROM shoucang c
      LEFT JOIN book b ON c.goods_id = b.id
      WHERE c.user_id = ?
    `, [userId]);

    //2.转换字段名 返回source给前端
    const formatShoucangList = shoucangList.map(item => ({
      id: item.shoucang_id,
      goodsId: item.goods_id,
     bookPrice: item.book_price || 0,
      spec: item.spec || '平装版',
      bookName: item.book_name || '未知图书',
     
      cover: item.book_cover || item.book_cover_backup || '/default-book.png',
      source: item.source || 'normal'
    }));

    res.json({
      code: 200,
      msg: '获取收藏夹列表成功',
      data: formatShoucangList
    });
  } catch (error) {
    console.error('获取收藏夹列表失败：', error);
    res.json({ code: 500, msg: '服务器错误', data: [] });
  }
};


//3.删除收藏夹项
exports.deleteShoucang = async (req, res) => {
  try {
    const { shoucangId } = req.body;
    const userId = req.user.id;

    const [shoucang] = await pool.execute(
      'SELECT * FROM shoucang WHERE id = ? AND user_id = ?',
      [shoucangId, userId]
    );
    if (!shoucang.length) {
      return res.json({ code: 403, msg: '无权删除该收藏夹项' });
    }

    await pool.execute('DELETE FROM shoucang WHERE id = ?', [shoucangId]);
    res.json({ code: 200, msg: '删除成功' });
  } catch (error) {
    console.error('删除收藏夹失败：', error);
    res.json({ code: 500, msg: '服务器错误' });
  }
};

//4.清空收藏夹
exports.clearShoucang = async (req, res) => {
  try {
    const userId = req.user.id;
    await pool.execute('DELETE FROM shoucang WHERE user_id = ?', [userId]);
    res.json({ code: 200, msg: '收藏夹已清空' });
  } catch (error) {
    console.error('清空收藏夹失败：', error);
    res.json({ code: 500, msg: '服务器错误' });
  }
};