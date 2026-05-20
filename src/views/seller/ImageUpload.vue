<template>
  <div class="upload-box">
    <!-- 已有图片预览 -->
    <div v-if="modelValue" class="img-preview">
      <img :src="modelValue" alt="">
      <i class="del-icon" @click="handleDel">×</i>
    </div>
    <!-- 加号上传按钮 -->
    <div v-else class="add-btn" @click="openFile">
      <span>+</span>
    </div>
    <input 
      ref="fileRef"
      type="file"
      accept="image/*"
      style="display:none"
      @change="handleChange"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, defineProps, defineEmits } from 'vue'
import axios from 'axios'
import { ElMessage } from 'element-plus'

const props = defineProps<{
  modelValue: string
}>()
const emit = defineEmits(['update:modelValue'])
const fileRef = ref<HTMLInputElement>()

const openFile = () => fileRef.value?.click()

// 选中文件自动上传
const handleChange = async (e:Event) => {
  const target = e.target as HTMLInputElement
  const file = target.files?.[0]
  if(!file) return

  const formData = new FormData()
  formData.append('file', file)

  try {
    const res = await axios.post('/api/upload/img', formData)
    if(res.data.code === 200){
      emit('update:modelValue', res.data.data)
      ElMessage.success('图片上传成功')
    }
  } catch {
    ElMessage.error('图片上传失败')
  }
  // 清空重置
  target.value = ''
}

// 删除图片
const handleDel = () => {
  emit('update:modelValue', '')
}
</script>

<style scoped>
.upload-box{width:120px;height:120px;border:1px dashed #ccc;border-radius:4px;overflow:hidden;}
.add-btn{width:100%;height:100%;display:flex;align-items:center;justify-content:center;font-size:30px;color:#999;cursor:pointer;}
.img-preview{width:100%;height:100%;position:relative;}
.img-preview img{width:100%;height:100%;object-fit:cover;}
.del-icon{position:absolute;top:2px;right:4px;color:#fff;background:#0008;border-radius:50%;width:18px;height:18px;text-align:center;line-height:18px;cursor:pointer;}
</style>