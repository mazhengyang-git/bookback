const pool = require('../config/db');

// 每日 0 点自动生成优惠
async function generateDailyDiscount() {
  try {
    console.log('⏰ 开始生成今日优惠图书...');

    // 1. 清空昨天所有优惠数据
    await pool.execute('TRUNCATE TABLE book_discount');
    console.log('🗑️ 历史优惠已清空');

    // 2. 获取普通图书 + 新书
    const [normalBooks] = await pool.execute('SELECT id, price FROM book WHERE status = 1');
    const [newBooks] = await pool.execute('SELECT id, price FROM newbook WHERE status = 1');

    console.log(`📚 普通图书总数：${normalBooks.length} 本，新书总数：${newBooks.length} 本`);

    const allDiscounts = [];

    // 3. 生成普通图书优惠（type=0）
    if (normalBooks.length > 0) {
      const rate = 0.25 + Math.random() * 0.5;
      const takeNum = Math.max(1, Math.round(normalBooks.length * rate));
      const selected = normalBooks.sort(() => Math.random() - 0.5).slice(0, takeNum);

      for (const book of selected) {
        const discountRate = (6.6 + Math.random() * 3.2).toFixed(1);
        const discountPrice = (book.price * (discountRate / 10)).toFixed(2);
        allDiscounts.push([book.id, discountPrice, discountRate, 0]);
      }
      console.log(`✅ 普通图书优惠生成：${selected.length} 本`);
    }

    // 4. 生成新书优惠（type=1）
    if (newBooks.length > 0) {
      const rate = 0.25 + Math.random() * 0.5;
      const takeNum = Math.max(1, Math.round(newBooks.length * rate));
      const selected = newBooks.sort(() => Math.random() - 0.5).slice(0, takeNum);

      for (const book of selected) {
        const discountRate = (6.6 + Math.random() * 3.2).toFixed(1);
        const discountPrice = (book.price * (discountRate / 10)).toFixed(2);
        allDiscounts.push([book.id, discountPrice, discountRate, 1]);
      }
      console.log(`✅ 新书优惠生成：${selected.length} 本`);
    }

    // 5. 批量插入
    if (allDiscounts.length > 0) {
      await pool.query(
        'INSERT INTO book_discount (book_id, discount_price, discount_rate, book_type) VALUES ?',
        [allDiscounts]
      );
      console.log(`🎉 今日全部优惠生成完成，共 ${allDiscounts.length} 本图书`);
    } else {
      console.log('⚠️ 没有可生成优惠的图书');
    }

  } catch (e) {
    console.error('❌ 优惠生成失败', e);
  }
}

module.exports = generateDailyDiscount;