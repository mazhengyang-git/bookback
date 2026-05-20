<template>
  <div class="image-url-upload">
    <el-input
      :model-value="modelValue"
      :placeholder="placeholder"
      clearable
      @update:model-value="emit('update:modelValue', $event)"
    />
    <div class="upload-row">
      <div v-if="modelValue" class="preview-wrap" :class="{ round: shape === 'round' }">
        <el-image :src="modelValue" fit="cover" class="preview-img" />
      </div>
      <el-upload
        class="image-uploader"
        :class="{ round: shape === 'round' }"
        :http-request="handleUpload"
        :show-file-list="false"
        :before-upload="beforeUpload"
      >
        <el-icon class="upload-icon"><Plus /></el-icon>
      </el-upload>
      <span class="upload-tip">支持填写 URL 或点击加号上传（jpg/png/webp，≤2MB）</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Plus } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { uploadImageApi } from '@/api/common/upload'

withDefaults(
  defineProps<{
    modelValue: string
    placeholder?: string
    shape?: 'round' | 'rect'
  }>(),
  {
    placeholder: '请输入图片 URL',
    shape: 'rect',
  }
)

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

// 格式支持
const beforeUpload = (file: File) => {
  // 1. 获取文件后缀名（转小写）
  const fileExt = file.name.split('.').pop()?.toLowerCase() || ''
  // 2. 允许的后缀 + MIME类型 双验证
  const allowedExts = ['jpg', 'jpeg', 'png', 'webp']
  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp']
  
  // 满足任意一个就通过
  const ok = allowedExts.includes(fileExt) || allowedTypes.includes(file.type)
  
  if (!ok) {
    ElMessage.error('仅支持 JPG/PNG/WEBP 格式')
    return false
  }
  if (file.size / 1024 / 1024 >= 2) {
    ElMessage.error('图片大小不能超过 2MB')
    return false
  }
  return true
}

const handleUpload = async (options: { file: File }) => {
  try {
    const res = await uploadImageApi(options.file)
    if (res.code === 200 && res.data?.url) {
      emit('update:modelValue', res.data.url)
      ElMessage.success('图片上传成功')
    } else {
      ElMessage.error(res.msg || '上传失败')
    }
  } catch {
    ElMessage.error('上传失败')
  }
}
</script>
<style scoped>
.image-url-upload {
  width: 100%;
}
.upload-row {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 12px;
  margin-top: 10px;
}
.preview-wrap {
  width: 80px;
  height: 80px;
  border: 1px solid #e4e7ed;
  border-radius: 6px;
  overflow: hidden;
}
.preview-wrap.round {
  border-radius: 50%;
}
.preview-img {
  width: 100%;
  height: 100%;
}
.image-uploader :deep(.el-upload) {
  border: 1px dashed #d9d9d9;
  border-radius: 6px;
  width: 80px;
  height: 80px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: border-color 0.3s;
}
.image-uploader.round :deep(.el-upload) {
  border-radius: 50%;
}
.image-uploader :deep(.el-upload:hover) {
  border-color: #409eff;
}
.upload-icon {
  font-size: 28px;
  color: #c0c4cc;
}
.upload-tip {
  font-size: 12px;
  color: #909399;
  flex: 1;
  min-width: 200px;
}
</style>
