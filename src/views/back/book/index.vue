<template>
  <div class="admin-book-container" style="user-select: none; -webkit-user-select: none">
    <div class="admin-header">
      <h2 style="color: black">图书管理</h2>
      <el-button type="primary" @click="handleAdd">新增图书</el-button>
    </div>

    <!-- 表格容器 -->
    <div class="table-scroll-wrapper">
      <el-table v-loading="loading" :data="bookList" border stripe>
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="book_name" label="图书名称" min-width="200" />
        <el-table-column prop="author" label="作者" width="120" />
        <el-table-column prop="category" label="分类" width="100" />
        <el-table-column prop="price" label="价格（元）" width="110">
          <template #default="scope"> ¥{{ Number(scope.row.price || 0).toFixed(2) }} </template>
        </el-table-column>
        <el-table-column prop="stock" label="库存" width="100" />

        <el-table-column prop="mulu" label="目录" width="150">
          <template #default="scope">
            <div class="mulu-ellipsis">
              {{ scope.row.mulu || '暂无目录' }}
            </div>
          </template>
        </el-table-column>

        <el-table-column label="操作" width="180">
          <template #default="scope">
            <el-button type="primary" size="small" @click="handleEdit(scope.row)">编辑</el-button>
            <el-button type="danger" size="small" @click="handleDelete(scope.row.id)"
              >删除</el-button
            >
          </template>
        </el-table-column>
      </el-table>
    </div>

    <el-dialog
      style="color: black; font-size: 20px; user-select: none; -webkit-user-select: none"
      v-model="dialogVisible"
      width="600px"
    >
      <template #title>{{ isEdit ? '编辑图书' : '新增图书' }}</template>
      <el-form ref="bookFormRef" :model="bookForm" :rules="bookRules" label-width="80px">
        <el-form-item label="图书名称" prop="book_name">
          <!--@vue-ignore-->
          <el-input v-model="bookForm.book_name" placeholder="请输入图书名称" />
        </el-form-item>
        <el-form-item label="作者" prop="author">
          <el-input v-model="bookForm.author" placeholder="请输入作者" />
        </el-form-item>
        <el-form-item label="分类" prop="category">
          <el-select v-model="bookForm.category" placeholder="请选择分类">
            <el-option label="硬科幻" value="硬科幻" />
            <el-option label="软科幻" value="软科幻" />
          </el-select>
        </el-form-item>
        <el-form-item label="价格" prop="price">
          <el-input-number v-model="bookForm.price" :min="0.01" step="0.01" precision="2" />
        </el-form-item>
        <el-form-item label="库存" prop="stock">
          <el-input-number v-model="bookForm.stock" :min="0" />
        </el-form-item>
        <el-form-item label="封面URL" prop="cover">
          <el-input v-model="bookForm.cover" placeholder="请输入图书封面图片URL" />
        </el-form-item>
        <el-form-item label="简介" prop="desc">
          <el-input
            v-model="bookForm.desc"
            type="textarea"
            :rows="4"
            placeholder="请输入图书简介"
          />
        </el-form-item>
        <el-form-item label="目录" prop="mulu">
          <el-input v-model="bookForm.mulu" type="textarea" placeholder="请输入图书目录" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSave">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getAdminBookList, addBook, updateBook, deleteBook } from '@/api/back/book'
import type { Book } from '@/types/index'

const loading = ref(false)
const bookList = ref<Book[]>([])
const dialogVisible = ref(false)
const isEdit = ref(false)
const bookFormRef = ref()

// 表单数据
const bookForm = reactive<Book>({
  id: 0, //@ts-ignore
  book_name: '',
  author: '',
  category: '',
  price: 0,
  cover: '',
  desc: '',
  stock: 0,
  mulu: '',
  status: 1, // 默认上架
})

// 校验规则
const bookRules = reactive({
  book_name: [{ required: true, message: '请输入图书名称', trigger: 'blur' }],
  author: [{ required: true, message: '请输入作者', trigger: 'blur' }],
  category: [{ required: true, message: '请选择分类', trigger: 'change' }],
  price: [{ required: true, message: '请输入价格', trigger: 'blur' }],
  stock: [{ required: true, message: '请输入库存', trigger: 'blur' }],
  mulu: [{ required: true, message: '请输入目录', trigger: 'blur' }],
})

// 获取列表
const getBookList = async () => {
  loading.value = true
  try {
    const res = await getAdminBookList() //@ts-ignore
    if (res.code === 200) {
      let data = res.data
      data = data.sort((a: { id: number }, b: { id: number }) => a.id - b.id) //b.id-a.id 反向paixu
      // 价格兜底转数字
      bookList.value = res.data.map((item: any) => ({
        ...item,
        price: Number(item.price) || 0,
      }))
    }
  } catch (error) {
    console.error('获取图书列表失败：', error)
    ElMessage.error('获取图书列表失败')
  } finally {
    loading.value = false
  }
}

// 新增
const handleAdd = () => {
  bookFormRef.value?.resetFields()
  Object.assign(bookForm, {
    id: 0,
    book_name: '',
    author: '',
    category: '',
    price: 0,
    cover: '',
    desc: '',
    stock: 0,
    mulu: '',
    status: 1,
  })
  isEdit.value = false
  dialogVisible.value = true
}

// 编辑
const handleEdit = (row: Book) => {
  bookFormRef.value?.resetFields()
  Object.assign(bookForm, row)
  isEdit.value = true
  dialogVisible.value = true
}

// 保存
const handleSave = async () => {
  const valid = await bookFormRef.value.validate().catch(() => false)
  if (!valid) return

  try {
    const res = isEdit.value ? await updateBook(bookForm) : await addBook(bookForm) //@ts-ignore
    if (res.code === 200) {
      //@ts-ignore
      ElMessage.success(res.msg)
      dialogVisible.value = false
      getBookList()
    }
  } catch (error) {
    console.error('保存失败：', error)
    ElMessage.error('保存图书失败')
  }
}

// 删除
const handleDelete = async (id: number) => {
  try {
    await ElMessageBox.confirm('确定删除该图书吗？', '提示', { type: 'warning' })
    const res = await deleteBook(id) //@ts-ignore
    if (res.code === 200) {
      //@ts-ignore
      ElMessage.success(res.msg)
      getBookList()
    }
  } catch (err) {
    if (err !== 'cancel') ElMessage.error('删除失败')
  }
}

onMounted(() => getBookList())
</script>

<style scoped>
.admin-book-container {
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.admin-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 10px;
  border-bottom: 1px solid #eee;
}

/* 1. 表格容器*/
.table-scroll-wrapper {
  width: 110%;
  overflow-x: auto;
  /* 滚动条美化 */
  position: relative;
  left: -30px;
  scrollbar-width: thin;
}
.table-scroll-wrapper::-webkit-scrollbar {
  height: 6px;
}

:deep(.mulu-ellipsis) {
  display: -webkit-box;
  -webkit-line-clamp: 2; /* 固定显示2行，改3就是3行 */
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
  line-height: 1.5;
  height: 4em;

  padding-top: 0.75em;
  box-sizing: border-box;
}
</style>
