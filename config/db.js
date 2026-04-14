const mysql = require('mysql2/promise');
require('dotenv').config();

//创建数据库连接池
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  charset: 'utf8mb4'
});

//测试连接
async function testDB() {
  try {
    const [rows] = await pool.execute('SELECT 1');
    console.log('MySQL连接成功 ✅');
  } catch (error) {
    console.error('MySQL连接失败 ❌：', error);
    process.exit(1); // 连接失败退出进程
  }
}

testDB();

module.exports = pool;