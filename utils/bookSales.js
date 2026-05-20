/*
 图书销量：与库存解耦，仅在「已收货/已完成」及退款链路中调整。
 「已完成」与历史后台选项兼容；「已收货」为需求指定状态。
 */
 const SALES_COUNTED_STATUSES = ['已收货', '已完成'];

 function isSalesCountedStatus(status) {
   return SALES_COUNTED_STATUSES.includes(status);
 }
 
 /* 已进入支付后流程（库存已扣）的状态 */
 function isPostPayStatus(status) {
   return ['已付款', '待发货', '已发货', '已收货', '已完成'].includes(status);
 }
 
 /**
  * @param {import('mysql2/promise').PoolConnection} connection
  * @param {{ source?: string, book_id: number, count?: number }} order
  * @param {number} delta 正数加销量，负数减销量（通常为 ±count）
  */
 async function adjustBookSalesDelta(connection, order, delta) {
   const d = Number(delta);
   if (!d) return;
   const bookId = Number(order.book_id);
   if (!bookId) return;
 
   // ==============================================
   // 类型判断
   // ==============================================
   let table;
   if (order.source === 'new') {
     table = 'newbook';        // 新书
   } else if (order.source === 'seller') {
     table = 'seller_book';   // 商家书
   } else {
     table = 'book';           // 普通书
   }
 
   // 统一更新销量字段 sales_count
   await connection.execute(
     `UPDATE ${table} SET sales_count = GREATEST(0, COALESCE(sales_count, 0) + ?) WHERE id = ?`,
     [d, bookId]
   );
 }
 
 module.exports = {
   isSalesCountedStatus,
   isPostPayStatus,
   adjustBookSalesDelta,
   SALES_COUNTED_STATUSES,
 };