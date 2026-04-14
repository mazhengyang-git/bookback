<template>
  <div class="notice-manage">
    <h2 style="-webkit-user-select: none; color: #000">用户信息</h2>
    <h3 style="-webkit-user-select: none; color: #000; margin-top: 30px">最新统计数据:</h3>

    <div class="stats-box" style="-webkit-user-select: none">
      <div class="stats-item">
        <span>总用户数</span>
        <strong>{{ stats.totalUserCount }}</strong>
      </div>
      <div class="stats-item">
        <span>买家数量</span>
        <strong>{{ stats.buyerCount }}</strong>
      </div>
      <div class="stats-item">
        <span>卖家数量</span>
        <strong>{{ stats.sellerCount }}</strong>
      </div>
    </div>

    <!-- 用户列表 -->
    <div class="list">
      <div v-for="item in userList" :key="item.id" class="item">
        <div class="info">
          <h4>用户ID：{{ item.id }}</h4>
          <p>用户名：{{ item.username }}</p>
          <p>
            身份角色：{{
              item.role === 'buyer' ? '买家' : item.role === 'seller' ? '卖家' : '管理员'
            }}
          </p>
          <span>创建时间：{{ item.create_time }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { getusermentList } from '@/api/back/userment'
import type { userment } from '@/types/index'

const userList = ref<userment[]>([])

const stats = ref({
  totalUserCount: 0,
  buyerCount: 0,
  sellerCount: 0,
})
//获取用户列表+统计数据
const getList = async () => {
  try {
    const res = await getusermentList()
    //后端返回:data={ list:用户数组,statistics:统计对象 }
    userList.value = res.data.list
    stats.value = res.data.statistics
  } catch (err) {
    console.error('获取用户信息失败：', err)
  }
}

//页面加载自动请求数据
onMounted(() => getList())
</script>
<style scoped>
.user-manage {
  padding: 20px;
  user-select: none;
}

/* 面板样式 */
.stats-box {
  display: flex;
  gap: 20px;
  margin: 20px 0;
}
.stats-item {
  flex: 1;
  padding: 15px;
  background: #fff;
  border-radius: 10px;
  text-align: center;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}
.stats-item span {
  display: block;
  color: #666;
  margin-bottom: 8px;
}
.stats-item strong {
  font-size: 20px;
  color: #4e73df;
}

/*列表样式*/
.list {
  display: flex;
  flex-direction: column;
  gap: 10px;
  width: 100%;
}
.item {
  padding: 15px;
  background: #fff;
  border-radius: 10px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}
.info h4 {
  margin: 0 0 8px 0;
  color: #000;
}
.info p {
  margin: 0 0 5px 0;
  color: #333;
}
.info span {
  font-size: 12px;
  color: #999;
}
</style>
