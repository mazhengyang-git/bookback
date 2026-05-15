<template>
  <div class="page-container">
    <div class="topse">
      <el-button class="gwy" type="primary" @click="$router.go(-1)">返回</el-button>
    </div>

    <div style="margin-top: 80px">
      <el-card class="user-info-card" shadow="hover">
        <template #header>
          <span class="card-title">用户</span>
        </template>

        <div class="user-info-content">
          <p>
            <span style="display: flex; align-items: center; margin-bottom: 20px">
              <div class="avatar-wrapper" style="position: relative; margin-right: 20px">
                <el-avatar :src="showUser.avatar" size="80" />

                <!-- 只有自己才显示上传按钮 -->
                <div
                  v-if="isMySelf"
                  class="avatar-upload-btn"
                  @click="openAvatarDialog"
                >
                  <el-icon><Plus /></el-icon>
                </div>
              </div>

              <div>
                <h2 style="margin: 0">{{ showUser.username }}</h2>
              </div>
            </span>
          </p>

          <p>
            <strong>用户角色：</strong>
            <el-tag :type="showUser.role === 'admin' ? 'danger' : 'primary'">
              {{ showUser.role === 'admin' ? '管理员' : showUser.role === 'seller' ? '卖家' : '买家' }}
            </el-tag>
          </p>
        </div>

        <template #footer>
          <div style="margin-top: 30px; font-weight: 600">
            <strong>个人签名</strong><br />
            <hr style="margin-top: 25px" />
            <br />
            <span class="qmhh" style="font-size: 13px">{{ showUser.sign || '暂无签名' }}</span>
          </div>
        </template>
      </el-card>
    </div>

    <!-- 头像弹窗 -->
    <el-dialog v-if="isMySelf" v-model="showAvatarDialog" title="修改头像" width="500px">
      <el-upload
        class="avatar-uploader"
        :http-request="customUpload"
        :show-file-list="false"
        :before-upload="beforeAvatarUpload"
      >
        <el-avatar v-if="previewAvatar" :src="previewAvatar" size="120" />
        <el-icon v-else class="upload-icon"><Plus /></el-icon>
      </el-upload>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { ElMessage } from 'element-plus'
import { Plus } from '@element-plus/icons-vue'
import { useUserStore } from '@/store/modules/user'
import { useRoute, useRouter } from 'vue-router'
import { getSign, uploadAvatar, getUserPublicInfo } from '@/api/front/user'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()

const targetUsername = ref('')
const targetUser = ref({
  username: '加载中...',
  role: 'buyer',
  avatar: '',
  sign: ''
})

// 是否是自己
const isMySelf = computed(() => {
  if (!targetUsername.value) return true
  return targetUsername.value === userStore.user?.username
})

// 最终显示谁
const showUser = computed(() => {
  if (isMySelf.value) {
    return {
      username: userStore.user?.username || '未知用户',
      role: userStore.userRole || 'buyer',
      avatar: userStore.user?.avatar || 'https://cube.elemecdn.com/0/5/0df5cf44e51f1197950fddc469d08jpeg.jpeg',
      sign: userStore.user?.sign || '暂无签名'
    }
  }
  return targetUser.value
})

// 加载别人信息
const loadTargetUser = async (username: string) => {
  try {
    const res = await getUserPublicInfo(username) //@ts-ignore
    if (res.code === 200) {
      targetUser.value = res.data
    } else {
      ElMessage.error('用户不存在')
      router.back()
    }
  } catch (err) {
    ElMessage.error('获取失败')
  }
}

// 头像逻辑
const showAvatarDialog = ref(false)
const previewAvatar = ref('')

const openAvatarDialog = () => {
  previewAvatar.value = userStore.user?.avatar || ''
  showAvatarDialog.value = true
}

const beforeAvatarUpload = (file: any) => {
  const isImg = file.type === 'image/jpeg' || file.type === 'image/png'
  const isLt2M = file.size / 1024 / 1024 < 2
  if (!isImg) ElMessage.error('只能 JPG/PNG')
  if (!isLt2M) ElMessage.error('不能超过 2MB')
  return isImg && isLt2M
}

const customUpload = async (options: any) => {
  try {
    const res = await uploadAvatar(options.file)
    //@ts-ignore
    if (res.code === 200) {
      ElMessage.success('上传成功')
      userStore.user.avatar = res.data.url
      showAvatarDialog.value = false
    }
  } catch (e) {
    ElMessage.error('上传失败')
  }
}

onMounted(async () => {
  if (route.query.username) {
    targetUsername.value = route.query.username as string
    if (!isMySelf.value) {
      await loadTargetUser(targetUsername.value)
    }
  }

  if (userStore.isLogin) {
    const res = await getSign()
     //@ts-ignore
    if (res.code === 200 && userStore.user) {
      userStore.user.sign = res.data.sign
    }
  }
})
</script>

<style scoped>
/*全局页面*/
.page-container {
  width: 100%;
  max-width: 1280px;
  margin: 0 auto;
  padding: 24px;
  min-height: 100vh;
  background:
    radial-gradient(circle at top right, rgba(255, 255, 255, 0.447), transparent 22%),
    radial-gradient(circle at bottom left, rgba(255, 255, 255, 0.1), transparent 25%),
    linear-gradient(135deg, rgba(255, 255, 255, 0.447), #f3eaea);
  color: #e0e1e2;
  overflow-x: hidden;
}

/*顶部导航栏*/
.topse {
  position: fixed;
  top: 0;
  z-index: 999;
  margin-left: -23.5px;
  display: flex;
  align-items: center;
  gap: 16px;
  width: 1279px;
  height: 68px;
  padding: 0 24px;
  margin-bottom: 35px;
  border-radius: 18px;
  background: rgba(231, 229, 229, 0.75);
  backdrop-filter: blur(18px);
  box-shadow:
    0 10px 30px rgba(0, 0, 0, 0.121),
    inset 0 1px 0 rgba(255, 255, 255, 0.6);
  border: 1px solid rgba(255, 255, 255, 0.6);
}

/* 返回按钮 */
.gwy {
  height: 42px;
  padding: 0 18px !important;
  border-radius: 12px !important;
  background: linear-gradient(135deg, #b8b8b8, #6bc3ff) !important;
  border: none !important;
  font-weight: 700;
  letter-spacing: 0.5px;
  box-shadow: 0 8px 20px rgba(64, 158, 255, 0.25);
  transition: all 0.25s ease;
}

.gwy:hover {
  transform: translateY(-2px);
  box-shadow: 0 12px 28px rgba(64, 158, 255, 0.35);
}

/* 卡片主体 */
.user-info-card {
  width: 70%;
  height: 520px;
  overflow: hidden;
  border: none !important;
  border-radius: 24px !important;
  background: rgba(240, 240, 240, 0.78) !important;
  backdrop-filter: blur(10px);
  margin-left: 50%;
  transform: translateX(-50.8%);
  box-shadow:
    0 20px 45px rgba(255, 255, 255, 0.08),
    inset 0 1px 0 rgba(255, 0, 0, 0.7);
  transition: all 0.3s ease;
}

/* 卡片标题 */
.card-title {
  font-size: 26px;
  font-weight: 800;
  color: #111827;
}

/* 用户信息 */
.user-info-content {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 18px;
  height: 120px;
  margin-left: 6px;
  line-height: 3.2;
  color: #1f2937;
}

.user-info-content p {
  min-height: 90px;
  padding: 18px;
  max-width: 390px;
  border-radius: 18px;
  background: rgba(237, 206, 200, 0.56);
  border: 1px solid rgba(64, 158, 255, 0.08);
  box-shadow: 0 6px 18px rgba(0, 0, 0, 0.03);
}

/* 标签 */
:deep(.el-tag) {
  border-radius: 999px;
  padding: 0 14px;
  font-weight: 700;
}

/*个人签名*/
.qmhh {
  display: block;
  width: 100%;
  padding: 20px;
  margin-top: 12px;
  height: auto;
  border-radius: 16px;
  background-color: #f2ebd9;
  background-image: linear-gradient(#bab6b6 1px, transparent 1px);
  background-size: 22px 20px;
  border: #868687 1px solid;
  color: #374151;
  font-size: 15px !important;
}

/* 响应式 */
@media (max-width: 768px) {
  .topse {
    flex-wrap: wrap;
    height: auto;
    padding: 14px;
  }

  .user-info-content {
    grid-template-columns: 1fr;
  }
}

/* 全局基础 */
* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
  user-select: none !important;
  -webkit-user-select: none !important;
}

input,
textarea,
button {
  user-select: auto !important;
  -webkit-user-select: auto !important;
}

/* 头像容器 */
.avatar-wrapper {
  position: relative;
  cursor: pointer;
}

/* 头像加号按钮 */
.avatar-upload-btn {
  position: absolute;
  right: -5px;
  bottom: -5px;
  width: 20px;
  height: 20px;
  background: #409eff;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-size: 14px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
}

/* 上传组件样式 */
.avatar-uploader {
  display: flex;
  justify-content: center;
}

.avatar-uploader :deep(.el-upload) {
  border: 1px dashed #d9d9d9;
  border-radius: 50%;
  width: 120px;
  height: 120px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: border-color 0.3s;
}

.avatar-uploader :deep(.el-upload:hover) {
  border-color: #409eff;
}

.upload-icon {
  font-size: 32px;
  color: #c0c4cc;
}

.preview-avatar {
  width: 100%;
  height: 100%;
}
</style>