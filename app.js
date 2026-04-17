const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = 3002;
const userRouter = require('./router/user');
const cartRouter = require('./router/cart');
const bookRouter = require('./router/book');
const umentRouter = require('./router/userment');
const payRouter = require('./router/payRouter');
//中间件
//解决跨域
app.use(express.json()); //解析JSON请求体
app.use(express.urlencoded({ extended: true })); //解析表单请求体
app.use(cors({
  origin:'http://localhost:3000',
  credentials:true
}))
//路由挂载

//导入订单路由
const orderRouter = require('./router/orderRouter')
const userdate = require('./router/userupdate')
const orderadmin = require('./router/orderment')

const announcementRouter = require('./router/announcement');
const bookguan = require('./router/bookguanli');
app.use('/api/user', userRouter);
app.use('/api', orderRouter);
app.use('/api/cart', cartRouter);
app.use('/api/book', bookRouter);
app.use('/api/userment', umentRouter);
app.use('/api/announcement', announcementRouter);
app.use('/api/bookguanli', bookguan);
app.use('/api/pay', payRouter);
app.use('/api', userdate);
// 订单后台路由（前缀和前端的 /api/back/order 完全匹配）
app.use('/api', orderadmin);
//启动服务器
app.listen(3002, () => {
  console.log(`后端服务器运行在：http://localhost:3002 ✅`);
});