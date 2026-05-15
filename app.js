const express = require('express');
const cors = require('cors');
const path = require('path'); 
require('dotenv').config();

const app = express();
const PORT = 3002;
const userRouter = require('./router/user');
const cartRouter = require('./router/cart');
const bookRouter = require('./router/book');
const newbookRouter = require('./router/newbook');
const umentRouter = require('./router/userment');
const payRouter = require('./router/payRouter');
const allowedOrigins = ['http://localhost:3000', 'http://localhost:4173']
//中间件
//解决跨域
app.use(express.json()); //解析JSON请求体
app.use(express.urlencoded({ extended: true })); //解析表单请求体
app.use(cors({
  origin: function (origin, callback) {
    // 允许没有 origin 的请求（如 Postman）
    if (!origin) return callback(null, true)
    if (allowedOrigins.includes(origin)) {
      callback(null, true)
    } else {
      callback(new Error('CORS not allowed'))
    }
  },
  credentials: true // 如果需要携带 cookie
}))
//路由挂载

//导入订单路由
const orderRouter = require('./router/orderRouter')
const userdate = require('./router/userupdate')
const orderadmin = require('./router/orderment')
const hdzx = require('./router/活动资讯/hdzx')
const announcementRouter = require('./router/announcement');
const bookguan = require('./router/bookguanli');
const newbookguan = require('./router/newbookguanli');
const bookcom = require('./router/bookComrute');
const shoucang = require('./router/shoucangroute');
const bookpaihang = require('./router/systembookpaihang');
app.use('/api/user', userRouter);
app.use('/api', orderRouter);
app.use('/api/cart', cartRouter);
app.use('/api/book', bookRouter);
app.use('/api', newbookRouter);
app.use('/api/userment', umentRouter);
app.use('/api/announcement', announcementRouter);
app.use('/api/bookguanli', bookguan);
app.use('/api/newbookguanli', newbookguan);
app.use('/api/pay', payRouter);
app.use('/api', userdate);
app.use('/api', bookcom);
app.use('/api', hdzx);

app.use('/api/shoucang', shoucang);
// 订单后台路由
app.use('/api', orderadmin);
app.use('/api', bookpaihang);
app.use('/uploads', express.static(path.join(__dirname, 'public/uploads')));
//启动服务器
app.listen(3002, () => {
  console.log(`后端服务器运行在：http://localhost:3002 ✅`);
});