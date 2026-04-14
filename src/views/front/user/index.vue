<template>
  <!-- 外层容器：完整闭合 -->
  <div class="page-container">
    <!-- 个人中心标题 -->
    <el-button
      class="gwy"
      type="primary"
      @click="$router.push('/home')"
      :unstable-disable-deprecated-warning="true"
      >返回首页</el-button
    >
    <h2 class="sci-fi-title">个人中心</h2>

    <!-- 已登录：展示用户信息 + 订单列表 -->
    <div v-if="userStore.isLogin">
      <!-- 用户信息卡片 -->
      <el-card class="user-info-card" shadow="hover" :unstable-disable-deprecated-warning="true">
        <template #header>
          <span class="card-title">用户信息</span>
        </template>
        <div class="user-info-content">
          <p><strong>用户名：</strong>{{ userStore.user?.username || '未知用户' }}</p>
          <p>
            <strong>用户角色：</strong>
            <el-tag :type="userStore.userRole === 'admin' ? 'danger' : 'primary'">
              {{
                userStore.userRole === 'admin'
                  ? '管理员'
                  : userStore.userRole === 'seller'
                    ? '卖家'
                    : '买家'
              }}
            </el-tag>
          </p>
          <p>
            <strong>注册时间：</strong>
            <!--@vue-ignore-->{{ formatTime(userStore.user?.create_time) || '暂无记录' }}
          </p>
        </div>
        <template #footer>
          <el-button type="danger" @click="handleLogout" :unstable-disable-deprecated-warning="true"
            >退出登录</el-button
          >
        </template>
      </el-card>

      <!-- 我的订单区域 -->
      <div class="order-section">
        <h3 class="sci-fi-subtitle">我的订单</h3>
        <!--刷新按钮，方便手动刷新 -->
        <el-button
          type="text"
          @click="getOrderList"
          class="refresh-btn"
          :unstable-disable-deprecated-warning="true"
          >刷新订单</el-button
        >
        <el-table
          :data="orderList"
          border
          stripe
          v-loading="loading"
          :unstable-disable-deprecated-warning="true"
        >
          <el-table-column
            prop="orderNo"
            label="订单编号"
            width="220"
            :unstable-disable-deprecated-warning="true"
          />
          <!-- 图书封面列 -->
          <el-table-column label="图书封面" width="100" :unstable-disable-deprecated-warning="true">
            <template #default="scope">
              <img
                :src="scope.row.bookCover || '/default-book.png'"
                alt="图书封面"
                class="order-book-cover"
                :key="scope.row.orderNo"
                @click="$router.push(`/order/${scope.row.orderNo}`)"
                v-loading="!scope.row.orderNo"
                style="cursor: pointer !important"
              />
            </template>
          </el-table-column>
          <el-table-column
            prop="bookName"
            label="图书名称"
            min-width="200"
            :unstable-disable-deprecated-warning="true"
          >
            <template #default="scope"
              ><span
                :key="scope.row.orderNo"
                @click="$router.push(`/order/${scope.row.orderNo}`)"
                v-loading="!scope.row.orderNo"
                style="cursor: pointer !important"
                >{{ scope.row.bookName }}</span
              ></template
            >
          </el-table-column>
          <el-table-column
            prop="count"
            label="购买数量"
            width="100"
            :unstable-disable-deprecated-warning="true"
          />
          <el-table-column
            prop="totalPrice"
            label="订单总价"
            width="120"
            :unstable-disable-deprecated-warning="true"
          >
            <template #default="scope">¥{{ toFixedNumber(scope.row.totalPrice, 2) }}</template>
          </el-table-column>
          <!-- 支付时间列 -->
          <el-table-column label="支付时间" width="200" :unstable-disable-deprecated-warning="true">
            <template #default="scope">
              {{ formatTime(scope.row.createTime) }}
            </template>
          </el-table-column>
          <el-table-column
            prop="status"
            label="订单状态"
            width="120"
            :unstable-disable-deprecated-warning="true"
          >
            <template #default="scope">
              <el-tag
                :type="getStatusTagType(scope.row.status)"
                :unstable-disable-deprecated-warning="true"
                >{{ scope.row.status }}</el-tag
              >
            </template>
          </el-table-column>
          <el-table-column label="操作" width="120">
            <template #default="scope">
              <el-button
                type="text"
                icon="el-icon-delete"
                class="delete-btn"
                @click="handleDeleteOrder(scope.row.orderNo)"
                :unstable-disable-deprecated-warning="true"
              >
                删除
              </el-button>
            </template>
          </el-table-column>
        </el-table>
        <!-- 空订单提示 -->
        <div v-if="!loading && orderList.length === 0" class="empty-order">
          <p>暂无订单记录~</p>
          <el-button
            type="primary"
            @click="$router.push('/home')"
            :unstable-disable-deprecated-warning="true"
            >去首页逛逛</el-button
          >
        </div>
      </div>
    </div>

    <!-- 未登录提示 -->
    <div v-else class="no-login-tip">
      <h3>请先登录</h3>
      <el-button type="primary" @click="$router.push('/login')">立即登录</el-button>
    </div>
  </div>
</template>

<script setup lang="ts">
//@ts-ignore
import { ref, onMounted, onActivated } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useUserStore } from '@/store/modules/user'
import { useRouter } from 'vue-router'
import { deleteOrder, getUserOrderList } from '@/api/front/order'
import type { Order } from '@/types/index'
import dayjs from 'dayjs'

const userStore = useUserStore()
const router = useRouter()
const orderList = ref<Order[]>([])
const loading = ref(false)

//数字格式化函数
const toFixedNumber = (num: any, digits: number) => {
  if (num === null || num === undefined) return '0.00'
  const number = Number(num) || 0
  return number.toFixed(digits)
}

//退出登录
const handleLogout = () => {
  userStore.logout()
  ElMessage.success('退出登录成功')
  router.push('/login')
}

//订单状态标签样式
const getStatusTagType = (status: string) => {
  const tagMap: Record<string, string> = {
    待付款: 'warning',
    已付款: 'info',
    待发货: 'primary',
    已发货: 'success',
    已完成: 'success',
    已取消: 'danger',
  }
  return tagMap[status] || 'info'
}

//格式化时间
const formatTime = (timeStr: string) => {
  if (!timeStr) return '暂无记录'
  return dayjs(timeStr).format('YYYY-MM-DD HH:mm:ss')
}

//抽离订单获取逻辑，方便复用
const getOrderList = async () => {
  if (!userStore.isLogin) return
  loading.value = true
  try {
    const res = await getUserOrderList() //@ts-ignore
    if (res.code === 200) {
      orderList.value = res.data
    } else {
      //@ts-ignore
      ElMessage.warning(res.msg || '获取订单失败') //@ts-ignore
    }
  } catch (error) {
    console.error('获取订单列表失败：', error)
    ElMessage.error('获取订单失败，请稍后重试')
  } finally {
    loading.value = false
  }
}
const handleDeleteOrder = async (orderNo: string) => {
  try {
    await ElMessageBox.confirm(`确定要删除订单【${orderNo}】吗？删除后不可恢复！`, '删除确认', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    })
    const res = await deleteOrder(orderNo) //@ts-ignore
    if (res.code === 200) {
      ElMessage.success(`${orderNo}` + '订单删除成功')
      getOrderList()
    } else {
      //@ts-ignore
      ElMessage.error(res.msg || '删除订单失败')
    }
  } catch (error) {
    if (error !== 'cancel') {
      console.error('删除订单失败：', error)
      //@ts-ignore
      const errMsg = error.response?.data?.msg || '删除订单失败，请稍后重试'
      ElMessage.error(errMsg)
    }
  }
}
// 页面激活时刷新订单
onActivated(() => {
  if (userStore.isLogin) {
    getOrderList()
  }
})

// 初始化获取订单
onMounted(async () => {
  getOrderList()
})
</script>

<style scoped>
/* 新增刷新按钮样式 */
.refresh-btn {
  margin-bottom: 10px;
  color: #252f39;
  font-size: 19px;
}
.refresh-btn:hover {
  text-decoration: underline;
}

/* 空订单样式 */
.empty-order {
  text-align: center;
  padding: 40px 0;
  color: #999;
}

/* 订单封面样式 */
.order-book-cover {
  width: 80px; /* 封面宽度 */
  height: 100px; /* 封面高度 */
  object-fit: cover; /* 保持比例，裁剪多余部分 */
  border-radius: 4px; /* 圆角，更美观 */
  border: 1px solid #eee; /* 边框分隔 */
}

/* 空订单提示样式 */
.empty-order {
  text-align: center;
  padding: 40px 0;
  color: #999;
}

* {
  user-select: none !important;
  -webkit-user-select: none !important;
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

input,
textarea,
button {
  user-select: auto !important;
  -webkit-user-select: auto !important;
}
/* 页面基础样式 */
.page-container {
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
  background-color: #dfdfe0;
  min-height: 100vh;
  color: #e0e6ff;
}
.gwy {
  position: absolute;
  top: 65px;
  z-index: 10;
  padding: 0 5px 0 5px;
}
/* 科幻标题样式 */
.sci-fi-title {
  font-size: 28px;
  color: #409eff;
  text-align: center;
  margin: 30px 0;
  text-shadow: 0 0 10px rgba(64, 158, 255, 0.5);
}

.sci-fi-subtitle {
  font-size: 22px;
  color: #409eff;
  margin: 40px 0 20px;
  text-shadow: 0 0 8px rgba(64, 158, 255, 0.4);
}

/* 用户信息卡片 */
.user-info-card {
  background-color: rgba(255, 255, 255, 0.9);
  border: 1px solid rgba(64, 158, 255, 0.2);
  padding: 20px;
  border-radius: 8px;
}

.card-title {
  color: #409eff;
  font-size: 18px;
  font-weight: 700;
}

.user-info-content {
  line-height: 2;
  font-size: 16px;
  color: rgb(0, 0, 0);
}

/* 未登录提示 */
.no-login-tip {
  text-align: center;
  padding: 60px 20px;
  background-color: rgba(18, 26, 40, 0.9);
  border: 1px solid rgba(64, 158, 255, 0.2);
  border-radius: 8px;
  margin-top: 100px;
}

/* 订单区域 */
.order-section {
  margin-top: 30px;
}

/* Element 表格样式适配 */
.el-table {
  --el-table-row-hover-bg-color: rgba(0, 80, 160, 0.2);
  --el-table-header-text-color: #409eff;
  --el-table-text-color: #151515;
  background-color: rgba(18, 26, 40, 0.9);
  border: 1px solid rgba(64, 158, 255, 0.2);
}

.el-table th {
  background-color: rgba(0, 66, 133, 0.3) !important;
}

.el-table td,
.el-table th {
  border-color: rgba(64, 158, 255, 0.1);
}
</style>
