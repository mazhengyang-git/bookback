<template>
  <div class="seller-apply">
    <h3 style="color: #000;font-weight: 600;">{{ pageTitle }}</h3>
    <el-form ref="formRef" :model="form" :rules="rules" label-width="100px" style="max-width: 640px">
      <el-form-item style="font-weight: 600;" label="书名" prop="book_name">
        <el-input v-model="form.book_name" />
      </el-form-item>
      <el-form-item style="font-weight: 600;" label="作者" prop="author">
        <el-input v-model="form.author" />
      </el-form-item>
      <el-form-item style="font-weight: 600;" label="分类" prop="category">
        <el-select v-model="form.category" placeholder="请选择">
          <el-option v-for="c in categories" :key="c" :label="c" :value="c" />
        </el-select>
      </el-form-item>
      <el-form-item style="font-weight: 600;" label="价格" prop="price">
        <el-input-number v-model="form.price" :min="0.01" :precision="2" />
      </el-form-item>
      <!-- ✅ 库存部分：修改为 min=1，禁止输入0 -->
      <el-form-item style="font-weight: 600;" label="库存" prop="stock">
        <el-input-number v-model="form.stock" :min="1" />
      </el-form-item>

      <el-form-item style="font-weight: 600;" label="出版社" prop="publisher">
        <el-select v-model="form.publisher" placeholder="请选择出版社">
          <el-option label="机械工业出版社" value="机械工业出版社" />
          <el-option label="航天科技出版社" value="航天科技出版社" />
          <el-option label="科幻文学出版社" value="科幻文学出版社" />
          <el-option label="庆华大学出版社" value="庆华大学出版社" />
          <el-option label="港澳译学出版社" value="港澳译学出版社" />
          <el-option label="东方星月文艺出版社" value="东方星月文艺出版社" />
          <el-option label="欧美科幻出版社" value="欧美科幻出版社" />
          <el-option label="京都文学出版社" value="京都文学出版社" />
          <el-option label="现代文艺出版社" value="现代文艺出版社" />
          <el-option label="深度求索科技出版社" value="深度求索科技出版社" />
        </el-select>
      </el-form-item>

      <el-form-item style="font-weight: 600;" label="封面" prop="cover">
        <ImageUrlUpload v-model="form.cover" placeholder="图书封面 URL" />
      </el-form-item>
      <el-form-item style="font-weight: 600;" label="简介" prop="desc">
        <el-input v-model="form.desc" type="textarea" :rows="3" />
      </el-form-item>
      <el-form-item style="font-weight: 600;" label="目录">
        <el-input v-model="form.mulu" type="textarea" :rows="3" />
      </el-form-item>
      <el-form-item style="font-weight: 600;" label="作者简介">
        <el-input v-model="form.author_into" type="textarea" :rows="2" />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" :loading="submitting" @click="handleSubmit">
          {{ isEdit ? '重新提交审核' : '提交审核' }}
        </el-button>
        <el-button @click="$router.push('/seller/apply-list')">返回列表</el-button>
      </el-form-item>
    </el-form>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage, type FormInstance, type FormRules } from 'element-plus'
import { submitSellerApplyApi, getSellerApplyListApi, updateSellerApplyApi } from '@/api/seller/apply'
import { getSellerPublishedDetailApi, submitSellerBookReapplyApi } from '@/api/seller/book'
import ImageUrlUpload from '@/components/ImageUrlUpload.vue'
import type { SellerBookForm } from '@/types/seller'

const route = useRoute()
const router = useRouter()
const formRef = ref<FormInstance>()
const submitting = ref(false)
const editId = computed(() => Number(route.query.id) || 0)
const bookId = computed(() => Number(route.query.bookId) || 0)
const isApplyEdit = computed(() => editId.value > 0)
const isBookEdit = computed(() => bookId.value > 0)
const isEdit = computed(() => isApplyEdit.value || isBookEdit.value)
const pageTitle = computed(() => {
  if (isBookEdit.value) return '编辑已上架图书（需重新审核）'
  if (isApplyEdit.value) return '重新编辑图书申请'
  return '发布图书申请'
})

const categories = [
  '太空歌剧', '赛博朋克', '时间旅行', '智能纪元', '外星文明', '末世废土',
  '星际灾厄', '虚幻惊悚', '星系攻略', '次元交互', '梦灵空间', '自然谜团', '平行宇宙', '意识陷落',
]

const form = ref<SellerBookForm>({
  book_name: '',
  author: '',
  author_into: '',
  category: '',
  price: 0,
  
  stock: 1,
  cover: '',
  desc: '',
  mulu: '',
  status: 1,
  publisher: '',
})

// 校验规则：库存最小值为1
const rules: FormRules = {
  book_name: [{ required: true, message: '请输入书名', trigger: 'blur' }],
  author: [{ required: true, message: '请输入作者', trigger: 'blur' }],
  category: [{ required: true, message: '请选择分类', trigger: 'change' }],
  price: [{ required: true, message: '请输入价格', trigger: 'blur' }],
  cover: [{ required: true, message: '请输入封面', trigger: 'blur' }],
  desc: [{ required: true, message: '请输入简介', trigger: 'blur' }],
  // stock: [
  //   { required: true, message: '请输入库存', trigger: ['blur', 'change'] },
  //   { min: 1, message: '库存不能为0', trigger: ['blur', 'change'] }
  // ],
  publisher: [{ required: true, message: '请选择出版社', trigger: 'change' }],
}

const loadEdit = async () => {
  if (isBookEdit.value) {
    const res = await getSellerPublishedDetailApi(bookId.value)
    if (res.code === 200 && res.data) {
      const row = res.data
      form.value = {
        book_name: row.book_name,
        author: row.author,
        author_into: row.author_into || '',
        category: row.category,
        price: Number(row.price),
        stock: row.stock,
        cover: row.cover,
        desc: row.desc || '',
        mulu: row.mulu || '',
        status: row.status,
        publisher: row.publisher || '',
      }
    } else {
      ElMessage.warning('图书不存在')
      router.push('/seller/book-list')
    }
    return
  }
  if (!isApplyEdit.value) return
  const res = await getSellerApplyListApi()
  if (res.code === 200) {
    const row = res.data?.find((i) => i.id === editId.value)
    if (row && row.audit_status === 2) {
      form.value = {
        book_name: row.book_name,
        author: row.author,
        author_into: row.author_into || '',
        category: row.category,
        price: Number(row.price),
        stock: row.stock,
        cover: row.cover,
        desc: row.desc || '',
        mulu: row.mulu || '',
        status: row.status,
        publisher: row.publisher || '',
      }
    } else {
      ElMessage.warning('仅驳回记录可编辑')
      router.push('/seller/apply-list')
    }
  }
}

const handleSubmit = async () => {
  await formRef.value?.validate()
  submitting.value = true
  try {
    let res
    if (isBookEdit.value) {
      res = await submitSellerBookReapplyApi(bookId.value, form.value)
    } else if (isApplyEdit.value) {
      res = await updateSellerApplyApi(editId.value, form.value)
    } else {
      res = await submitSellerApplyApi(form.value)
    }
    if (res.code === 200) {
      ElMessage.success(res.msg || '提交成功')
      router.push(isBookEdit.value ? '/seller/book-list' : '/seller/apply-list')
    } else ElMessage.error(res.msg || '提交失败')
  } catch {
    ElMessage.error('提交失败')
  } finally {
    submitting.value = false
  }
}

onMounted(loadEdit)
</script>
<style scoped>
.seller-apply{
margin-left: 28%;
}
</style>