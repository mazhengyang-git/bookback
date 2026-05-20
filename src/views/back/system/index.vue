<template>
  <div class="admin-container">
    <div class="admin-header">
      <h2 style="color: #000;">系统设置</h2>
      <el-button type="primary" @click="$router.push('/home')">返回前台</el-button>
    </div>

    <div class="admin-content">
      <el-card shadow="hover" style="max-width: 800px; margin: 0 auto;">
        <el-form
          ref="formRef"
          :model="form"
          label-width="120px"
          label-position="right"
        >
          <el-form-item label="网站名称">
            <el-input v-model="form.site_name" placeholder="请输入网站名称" />
          </el-form-item>

          <el-form-item label="网站公告">
            <el-input
              v-model="form.site_notice"
              type="textarea"
              rows="3"
              placeholder="请输入网站公告"
            />
          </el-form-item>

          <el-form-item label="开放注册">
            <el-switch v-model="form.register_enable" />
          </el-form-item>

          <el-form-item label="最大上传(MB)">
            <el-input-number v-model="form.upload_max_size" :min="1" :max="100" />
          </el-form-item>

          <el-form-item>
            <el-button type="primary" @click="saveConfig" block>
              保存系统设置
            </el-button>
          </el-form-item>
        </el-form>
      </el-card>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { getSystemConfig, updateSystemConfig } from '@/api/back/config'

const form = ref({
  site_name: '',
  site_notice: '',
  register_enable: false,
  upload_max_size: 10
})

// 加载配置：只取 system_settings 这一条
onMounted(async () => {
  try {
    // 单独获取 system_settings 这一条配置
    const res = await getSystemConfig('system_settings')
    if (res.data && res.data.config_value) {
      // 直接把数据库里存的对象赋值给 form
      form.value = res.data.config_value
    }
  } catch (err) {
    ElMessage.error('获取配置失败')
    console.error(err)
  }
})

// 保存配置（和你原来的一样，不用改）
const saveConfig = async () => {
  try {
    await updateSystemConfig({
      config_key: 'system_settings',
      config_value: form.value,
      config_desc: '系统全局设置'
    })
    ElMessage.success('保存成功！刷新页面就能看到效果')
  } catch (err) {
    ElMessage.error('保存失败，请检查管理员权限')
  }
}
</script>
<style scoped>
.admin-container {
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}
.admin-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid #eee;
  padding-bottom: 10px;
  margin-bottom: 20px;
}
.admin-content {
  padding: 10px 0;
}
</style>