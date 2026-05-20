const pool = require('../config/db');

(async () => {
  try {
    await pool.execute(
      "ALTER TABLE seller_bookapply ADD COLUMN source_book_id int DEFAULT NULL COMMENT '关联已上架图书ID' AFTER audit_reason"
    );
    console.log('Migration OK: source_book_id added');
  } catch (e) {
    if (e.code === 'ER_DUP_FIELDNAME') console.log('Column source_book_id already exists');
    else console.error('Migration failed:', e.message);
  }
  process.exit(0);
})();
