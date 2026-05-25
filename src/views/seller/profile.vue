<template>
  <div class="seller-profile">
    <h3 style="color: #000;font-weight: 600;">店铺资料</h3>
    <el-form v-loading="loading" :model="form" label-width="100px" style="max-width: 560px">
      <el-form-item style="font-weight: 600;" label="店铺头像">
        <!-- 头像 + 悬浮加号 -->
        <div class="avatar-wrapper" style="position: relative; margin-right: 20px">
          <el-avatar :src="form.avatar" size="80" />
          <!-- 加号按钮 → 点击弹框 -->
          <div class="avatar-upload-btn" @click="openAvatarDialog">
            <el-icon><Plus /></el-icon>
          </div>
        </div>
      </el-form-item>

      <el-form-item style="font-weight: 600;" label="店铺名称" required>
        <el-input v-model="form.shop_name" placeholder="请输入店铺名称" />
      </el-form-item>
      <el-form-item style="font-weight: 600;" label="店铺简介">
        <el-input v-model="form.intro" type="textarea" :rows="4" placeholder="店铺简介" />
      </el-form-item>
      <el-form-item style="font-weight: 600;" label="联系方式">
        <el-input v-model="form.contact" placeholder="手机/邮箱等" />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" :loading="saving" @click="handleSave">保存资料</el-button>
      </el-form-item>
    </el-form>

    <!-- 头像上传弹窗 -->
    <el-dialog v-model="showAvatarDialog" title="修改店铺头像" width="500px">
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
import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { Plus } from '@element-plus/icons-vue'
import { getSellerProfileApi, updateSellerProfileApi } from '@/api/seller/profile'
// 复用个人中心上传接口
import { uploadAvatar } from '@/api/front/user'

const loading = ref(false)
const saving = ref(false)
const form = ref({
  avatar: '',
  shop_name: '',
  intro: '',
  contact: '',
})

// 弹窗 + 预览
const showAvatarDialog = ref(false)
const previewAvatar = ref('')

// 打开弹窗
const openAvatarDialog = () => {
  previewAvatar.value = form.value.avatar || ''
  showAvatarDialog.value = true
}

// 加载资料
const loadProfile = async () => {
  loading.value = true
  try {
    const res = await getSellerProfileApi()
    if (res.code === 200 && res.data) {
      form.value = {
        avatar: res.data.avatar || '',
        shop_name: res.data.shop_name || '',
        intro: res.data.intro || '',
        contact: res.data.contact || '',
      }
    }
  } catch {
    ElMessage.error('加载店铺资料失败')
  } finally {
    loading.value = false
  }
}

// 个人中心的上传校验
const beforeAvatarUpload = (file: any) => {
  const isImg = file.type === 'image/jpeg' || file.type === 'image/png'|| file.type === 'image/webp'|| file.type === 'image/x-webp'
  const isLt2M = file.size / 1024 / 1024 < 2
  if (!isImg) ElMessage.error('只能 JPG/PNG/webp')
  if (!isLt2M) ElMessage.error('不能超过 2MB')
  return isImg && isLt2M
}


// 上传成功 → 赋值给店铺头像
const customUpload = async (options: any) => {
  try {
    const res = await uploadAvatar(options.file)
    if (res.code === 200) {
      ElMessage.success('上传成功')
      // 把头像赋值给店铺表单
      form.value.avatar = res.data.url
      showAvatarDialog.value = false
    }
  } catch (e) {
    ElMessage.error('上传失败')
  }
}

// 保存
const handleSave = async () => {
  if (!form.value.shop_name.trim()) {
    ElMessage.warning('请填写店铺名称')
    return
  }
  saving.value = true
  try {
    const res = await updateSellerProfileApi(form.value)
    if (res.code === 200) ElMessage.success('保存成功')
    else ElMessage.error(res.msg || '保存失败')
  } catch {
    ElMessage.error('保存失败')
  } finally {
    saving.value = false
  }
}

onMounted(loadProfile)
</script>

<style scoped>

.avatar-wrapper {
  position: relative;
  display: inline-block;
}
.avatar-upload-btn {
  position: absolute;
  bottom: -6px;
  right: -10px;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: #1989fa;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  border: 2px solid #fff;
}
.avatar-upload-btn:hover {
  background: #409eff;
}
.upload-icon {
  font-size: 28px;
  color: #999;
}
.avatar-uploader {
  width: 120px;
  height: 120px;
  border: 1px dashed #ccc;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto;
}
</style>
<style scoped>
/* 圆形头像样式 */
.avatar-upload-box {
  width: 80px;
  height: 80px;

}
.avatar-uploader {
  width: 100px;
  height: 100px;
  border: 1px dashed #ccc;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}
.upload-icon {
  font-size: 30px;
  color: #999;
}
.seller-profile{
 
  height: 540px;
 margin-left: 28%;
}
</style>