<template>
  <div class="notice-manage">
    <!--@vue-ignore-->
    <h2 style="-webkit-user-select: none; color: #000">用户信息</h2>
    <!--@vue-ignore--><h3 style="-webkit-user-select: none; color: #000; margin-top: 30px">最新统计数据:</h3>

    <!-- 统计面板 -->
    <!--@vue-ignore--><div class="stats-box" style="-webkit-user-select: none">
      <div class="stats-item">
        <span style="color: #000;font-weight: 600;">总用户数</span>
        <strong>{{ stats.totalUserCount }}</strong>
      </div>
      <div class="stats-item">
        <span style="color: #000;font-weight: 600;">买家数量</span>
        <strong>{{ stats.buyerCount }}</strong>
      </div>
      <div class="stats-item">
        <span style="color: #000;font-weight: 600;">卖家数量</span>
        <strong>{{ stats.sellerCount }}</strong>
      </div>
    </div>

    <!-- 角色筛选 -->
    <div class="filter-box">
      <el-select v-model="selectedRole" placeholder="请选择用户角色" style="width: 200px">
        <el-option label="全部用户" value="all" />
        <el-option label="买家" value="buyer" />
        <el-option label="卖家" value="seller" />
        <el-option label="管理员" value="admin" />
      </el-select>
    </div>

    <!-- 用户列表 -->
    <div class="list">
      <div v-for="item in filteredUserList" key="item.id" class="item">
        <div class="info">
          <h4>用户ID：{{ item.id }}</h4>
          <p>用户名：{{ item.username }}</p>
          <p>绑定手机号：{{ item.phone || '未绑定' }}</p>
          <p>
            身份角色：{{
              item.role === 'buyer' ? '买家' : item.role === 'seller' ? '卖家' : '管理员'
            }}
          </p>
          <span>创建时间：{{ item.create_time }}</span>
          <el-button
            type="warning"
            size="small"
            style="margin-left: 10px"
            @click="openVerify(item)"
          >
            重置密码
          </el-button>
        </div>
      </div>
    </div>

    <!-- 重置密码弹窗 -->
    <el-dialog
      v-model="verifyDialog"
      title="身份验证 - 重置密码"
      width="450px"
      :close-on-click-modal="false"
    >
      <div class="verify-box">
        <p>用户：{{ currentUser.username }}</p>
        <p>绑定手机号：{{ currentUser.phone }}</p>

        <el-input
          v-model="verifyPhone"
          placeholder="请输入用户绑定的手机号"
          style="margin-bottom: 15px"
        />

        <div class="code-box">
          <el-input v-model="verifyCode" placeholder="请输入验证码" style="flex: 1" />
          <el-button type="default" @click="getCode">获取验证码</el-button>
        </div>

        <el-button type="primary" style="width: 100%; margin-top: 10px" @click="confirmReset">
          验证通过并重置密码
        </el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { getusermentList } from '@/api/back/userment'
import type { userment } from '@/types/index'
import { ElMessage } from 'element-plus'
import { resetUserPassword } from '@/api/back/announcement'

const userList = ref<userment[]>([])
const stats = ref({
  totalUserCount: 0,
  buyerCount: 0,
  sellerCount: 0,
})
const selectedRole = ref<string>('all')

// 弹窗相关
const verifyDialog = ref(false)
const currentUser = ref<any>({})
const verifyPhone = ref('')
const verifyCode = ref('')
// 存储随机验证码
const codeCache = ref('')

// 打开验证弹窗
const openVerify = (user: userment) => {
  if (!user.phone) {
    ElMessage.error('该用户未绑定手机号，无法重置！')
    return
  }
  currentUser.value = user
  verifyPhone.value = ''
  verifyCode.value = ''
  codeCache.value = '' // 清空旧验证码
  verifyDialog.value = true
}

// 获取随机验证码（弹窗+控制台双显示）
const getCode = () => {
  // 校验必须先输入手机号
  if (!verifyPhone.value) {
    ElMessage.error('请先输入用户绑定的手机号！')
    return
  }
  if (verifyPhone.value !== currentUser.value.phone) {
    ElMessage.error('输入的手机号与用户绑定手机号不匹配！')
    return
  }

  // 生成6位随机验证码
  const code = Math.floor(100000 + Math.random() * 900000).toString()
  codeCache.value = code

  // 1. 弹窗显示验证码（管理员临时可见）
  ElMessage.success(`重置密码验证码：${code}`)
  // 2. 控制台打印验证码
  console.log('【管理员重置密码】用户手机号：', currentUser.value.phone, ' 验证码：', code)
}

// 确认重置密码
const confirmReset = async () => {
  // 校验手机号
  if (verifyPhone.value !== currentUser.value.phone) {
    ElMessage.error('输入的手机号与用户绑定手机号不匹配！')
    return
  }
  // 校验验证码
  if (!verifyCode.value || verifyCode.value !== codeCache.value) {
    ElMessage.error('验证码错误！')
    return
  }

  try {
    const res = await resetUserPassword({
      userId: currentUser.value.id,
      phone: verifyPhone.value,
    })
    //@ts-ignore
    if (res.code === 200) {
      // 前端仅提示成功，绝不显示密码
      ElMessage.success('密码重置成功！')
      verifyDialog.value = false
    } else {
      //@ts-ignore
      ElMessage.error(res.msg)
    }
  } catch (err) {
    ElMessage.error('重置失败，服务器异常')
  }
}
// 筛选用户
const filteredUserList = computed(() => {
  if (selectedRole.value === 'all') return userList.value
  return userList.value.filter((user) => user.role === selectedRole.value)
})

// 获取用户列表
const getList = async () => {
  try {
    const res = await getusermentList()
    userList.value = res.data.list
    stats.value = res.data.statistics
  } catch (err) {
    console.error(err)
  }
}

onMounted(() => getList())
</script>

<style scoped>
.notice-manage {
  padding: 20px;
  user-select: none;
}
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
.filter-box {
  margin-bottom: 20px;
}
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
.code-box {
  display: flex;
  gap: 10px;
}
</style>
