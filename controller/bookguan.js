const pool = require('../config/db');

//1.获取所有图书
exports.getBookList = async (req, res) => {
  try {
    const [list] = await pool.execute('SELECT * FROM book ORDER BY create_time DESC');
    res.json({ code: 200, data: list, msg: '获取book成功' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ code: 500, msg: '服务器错误' });
  }
};

//2.管理员新增图书
exports.addBook = async (req, res) => {
  try {
   if (!req.user || req.user.role !== 'admin') {
      return res.status(403).json({ code: 403, msg: '无管理员权限' });
    }

    const {
      book_name,
      author,
      category,
      price,
      stock,
      cover,
      desc,
      mulu,
      status,
      author_into,
      publisher
    } = req.body;

    // 数据库字段顺序
    // book_name, author, category, author_into, price, stock, cover, `desc`, mulu, status
    await pool.execute(
      `INSERT INTO book (book_name, author, category,author_into, price, stock, cover, \`desc\`, mulu, status,publisher) 
       VALUES (?,?,?,?,?,?,?,?,?,?,?)`,
      
      [book_name, author, category, author_into, price, stock, cover, desc, mulu, status,publisher]
    );

    res.json({ code: 200, msg: '图书新增成功' });
  } catch (err) {
    console.error('新增图书失败：', err);
    res.json({ code: 500, msg: '新增失败' });
  }
};

//3.管理员修改图书内容（同步参数顺序）
exports.updateBook = async (req, res) => {
  try {
    if (!req.user || req.user.role !== 'admin') {
      return res.status(403).json({ code: 403, msg: '无管理员权限' });
    }

    const {
      id,
      book_name,
      author,
      category,
      price,
      stock,
      cover,
      desc,
      mulu,
      status,
      author_into,
      publisher
    } = req.body;

    await pool.execute(
      `UPDATE book 
       SET book_name=?, author=?, category=?,author_into=?, price=?, stock=?, cover=?, \`desc\`=?, mulu=?, status=?,publisher=? 
       WHERE id=?`,
      [book_name, author, category, author_into, price, stock, cover, desc, mulu, status,publisher, id]
    );

    res.json({ code: 200, msg: '图书修改成功' });
  } catch (err) {
    console.error('修改图书失败：', err);
    res.json({ code: 500, msg: '修改失败' });
  }
};

//4.管理员删除图书
exports.deleteBook = async (req, res) => {
  try {
    if (!req.user || req.user.role !== 'admin') {
      return res.status(403).json({ code: 403, msg: '无管理员权限' });
    }
    const { id } = req.params;
    await pool.execute('DELETE FROM book WHERE id=?', [id]);
    res.json({ code: 200, msg: '图书删除成功' });
  } catch (err) {
    console.error(err);
    res.json({ code: 500, msg: '图书删除失败' });
  }
};