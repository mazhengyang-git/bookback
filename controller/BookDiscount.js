const db = require('../config/db');

const BookDiscount = {
  // 清空今日优惠
  clearAll: () => {
    return db.query('DELETE FROM book_discount');
  },

  // 批量插入新优惠
  batchInsert: (list) => {
    const sql = 'INSERT INTO book_discount (book_id, discount_price, discount_rate) VALUES ?';
    return db.query(sql, [list]);
  },

  // 获取所有优惠
  getAll: () => {
    return db.query('SELECT * FROM book_discount');
  }
};

module.exports = BookDiscount;