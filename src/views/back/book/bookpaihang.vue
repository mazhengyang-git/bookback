<template>
  <div class="top-book-config-container">
    <div class="config-header">
      <h2>首页排行榜配置</h2>
      <el-button type="primary" @click="handleSave" :loading="saveLoading">保存配置</el-button>
    </div>

    <!-- 配置说明 -->
    <el-alert title="配置说明" type="info" :closable="false" style="margin-bottom: 20px">
      <p style="color: gray;font-weight: 550;">1. 下方列表为首页置顶图书，点击「删除」可移除</p>
      <p style="color: gray;font-weight:550">2. 点击「从图书列表选择」可添加现有图书</p>
      <p style="color: gray;font-weight:550">3. 保存后实时生效，刷新首页即可看到效果</p>
    </el-alert>

    <!-- 已选图书列表 -->
    <div class="selected-books">
      <h3>当前置顶图书</h3>
      <el-empty v-if="!selectedBookList.length" description="暂无置顶图书" />

      <el-table
        v-else
        :data="selectedBookList"
        row-key="id"
        border
        stripe
        style="width: 100%; margin-bottom: 20px;color: #000;font-weight: 600;"   :header-cell-style="{ color: '#333', fontSize: '14px', fontWeight: 600 }"
      >
        <el-table-column type="index" label="排序" width="80" />
        <el-table-column prop="book_name" label="图书名称" min-width="200" />
        <el-table-column prop="author" label="作者" width="120" />
        <el-table-column prop="price" label="价格" width="100">
          <template #default="scope"> ¥{{ Number(scope.row?.price || 0).toFixed(2) }} </template>
        </el-table-column>
        <el-table-column label="操作" width="100" fixed="right">
          <template #default="scope">
            <el-button
              type="danger"
              size="small"
              @click="handleRemove(scope.$index)"
              :disabled="saveLoading"
            >
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <!-- 从图书列表选择 -->
    <div class="select-from-books">
      <el-button
        type="primary"
        @click="openBookSelectDialog"
        :loading="bookListLoading"
        :disabled="saveLoading"
      >
        从图书列表选择
      </el-button>
    </div>

    <!-- 图书选择对话框 -->
    <el-dialog
      v-model="bookSelectDialogVisible"
      width="800px"
      :close-on-click-modal="false"
      destroy-on-close
    >
      <template #header>
        <span style="color:#333;font-weight:550">选择要置顶的图书</span>
      </template>

      <el-table
        v-loading="bookListLoading"
        :data="allBookList"
        @selection-change="handleSelectionChange"
        row-key="id"
        border
        style="width: 100%;color:#333;-webkit-text-stroke:0.07px #333"
 :header-cell-style="{ color: '#333', fontSize: '15px', fontWeight: 900 }">

      >
        <el-table-column type="selection" width="55" :selectable="checkSelectable" />
        <el-table-column type="index" label="序号" width="80" />
        <el-table-column prop="book_name" label="图书名称" min-width="200" />
        <el-table-column prop="author" label="作者" width="120" />
        <el-table-column prop="category" label="分类" width="100" />
        <el-table-column prop="price" label="价格" width="100">
          <template #default="scope"> ¥{{ Number(scope.row?.price || 0).toFixed(2) }} </template>
        </el-table-column>
      </el-table>

      <template #footer>
        <el-button @click="bookSelectDialogVisible = false" :disabled="saveLoading">取消</el-button>
        <el-button type="primary" @click="handleConfirmSelect" :loading="saveLoading"
          >确认添加</el-button
        >
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, onUnmounted, nextTick } from 'vue'
import { ElMessage } from 'element-plus'
import { getSystemConfig, updateSystemConfig } from '@/api/back/config'
import { getAdminBookList } from '@/api/back/book'
import type { Book } from '@/types/index'

// ============== 核心稳定机制：标记组件状态 ==============
let isComponentMounted = false
let isLoadingData = false

// ============== 状态定义（全部加默认值，严格兜底） ==============
const saveLoading = ref(false)
const bookListLoading = ref(false)
const bookSelectDialogVisible = ref(false)

// 核心数据：ID列表和图书列表分离，避免数据不一致
const topBookIds = ref<(number | string)[]>([])
const selectedBookList = ref<Book[]>([])
const allBookList = ref<Book[]>([])
const tempSelectedBooks = ref<Book[]>([])

// ============== 安全的API调用封装 ==============
const safeApiCall = async <T,>(
  apiFn: () => Promise<T>,
  errorMsg: string = '操作失败',
): T | null => {
  if (!isComponentMounted) return null
  try {
    return await apiFn()
  } catch (error) {
    if (isComponentMounted) {
      console.error(errorMsg, error)
      ElMessage.error(errorMsg)
    }
    return null
  }
}

// ============== 1. 加载配置（极简版，无watch） ==============
const loadConfig = async () => {
  if (isLoadingData || !isComponentMounted) return
  isLoadingData = true

  const res = await safeApiCall(() => getSystemConfig('home_top_book_ids'), '加载配置失败')

  if (isComponentMounted && res) {
    //@ts-ignore
    if (res.code === 200 && res.data) {
      //@ts-ignore
      topBookIds.value = Array.isArray(res.data.config_value) ? res.data.config_value : []
    }
    // 配置加载完后，再加载图书列表
    await loadAllBooks()
  }

  isLoadingData = false
}

// ============== 2. 加载所有图书（严格数据兜底） ==============
const loadAllBooks = async () => {
  if (!isComponentMounted) return
  bookListLoading.value = true

  const res = await safeApiCall(() => getAdminBookList(), '加载图书列表失败')

  if (isComponentMounted && res) {
    //@ts-ignore
    if (res.code === 200) {
      //@ts-ignore
      const data = Array.isArray(res.data) ? res.data : []
      allBookList.value = data.map((item: any) => ({
        ...item,
        price: Number(item?.price || 0),
      }))
    } else {
      allBookList.value = []
    }
    // 图书列表加载完后，手动更新已选列表（替代watch，更稳定）
    updateSelectedBookList()
  }

  if (isComponentMounted) bookListLoading.value = false
}

// ============== 3. 手动更新已选图书列表（替代watch，避免循环触发） ==============
const updateSelectedBookList = () => {
  if (!isComponentMounted) return

  // 严格按ID顺序匹配，数据兜底
  const result: Book[] = []
  const idList = Array.isArray(topBookIds.value) ? topBookIds.value : []
  const bookPool = Array.isArray(allBookList.value) ? allBookList.value : []

  idList.forEach((id) => {
    const book = bookPool.find((b) => b?.id === id)
    if (book) {
      result.push(book)
    }
  })

  selectedBookList.value = result
}

// ============== 4. 保存配置（极简，无多余操作） ==============
const handleSave = async () => {
  if (!isComponentMounted || saveLoading.value) return
  saveLoading.value = true

  const res = await safeApiCall(
    () =>
      updateSystemConfig({
        config_key: 'home_top_book_ids',
        config_value: Array.isArray(topBookIds.value) ? topBookIds.value : [],
        config_desc: '首页每月热门图书榜置顶图书ID列表',
      }),
    '保存失败',
  )

  if (isComponentMounted && res) {
    //@ts-ignore
    if (res.code === 200) {
      ElMessage.success('保存成功！刷新首页即可看到效果')
    }
  }

  if (isComponentMounted) saveLoading.value = false
}

// ============== 5. 移除图书（直接操作数组，无副作用） ==============
const handleRemove = (index: number) => {
  if (!isComponentMounted || !Array.isArray(topBookIds.value)) return
  if (index < 0 || index >= topBookIds.value.length) return

  topBookIds.value.splice(index, 1)
  // 手动更新，替代watch
  updateSelectedBookList()
}

// ============== 6. 图书选择对话框（极简，无复杂逻辑） ==============
const openBookSelectDialog = async () => {
  if (!isComponentMounted) return
  tempSelectedBooks.value = []
  bookSelectDialogVisible.value = true

  // 如果图书列表为空，先加载
  if (!allBookList.value.length) {
    await loadAllBooks()
  }
}

// 判断图书是否可选（已选的禁用）
const checkSelectable = (row: Book) => {
  if (!row?.id) return false
  return !topBookIds.value.includes(row.id)
}

const handleSelectionChange = (selection: Book[]) => {
  tempSelectedBooks.value = Array.isArray(selection) ? selection : []
}

const handleConfirmSelect = () => {
  if (!isComponentMounted || !Array.isArray(tempSelectedBooks.value)) return

  // 去重添加
  const newIds = tempSelectedBooks.value
    .map((b) => b?.id)
    .filter((id) => id && !topBookIds.value.includes(id)) as (number | string)[]

  if (newIds.length) {
    topBookIds.value = [...topBookIds.value, ...newIds]
    updateSelectedBookList()
    ElMessage.success(`已添加 ${newIds.length} 本图书`)
  } else {
    ElMessage.info('未选择新图书')
  }

  bookSelectDialogVisible.value = false
  tempSelectedBooks.value = []
}

// ============== 生命周期（严格的状态管理） ==============
onMounted(() => {
  isComponentMounted = true
  // 延迟一点加载，避免和首页切换动画冲突
  nextTick(() => {
    if (isComponentMounted) {
      loadConfig()
    }
  })
})

onUnmounted(() => {
  // 核心：组件卸载时，标记状态，停止所有操作
  isComponentMounted = false
  isLoadingData = false
  // 清空所有状态，避免内存泄漏
  topBookIds.value = []
  selectedBookList.value = []
  allBookList.value = []
  tempSelectedBooks.value = []
})
</script>

<style scoped>
.top-book-config-container {
  padding: 20px;
  background: #fff;
  border-radius: 8px;
  min-height: 500px;
}
.config-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}
.config-header h2 {
  margin: 0;
  font-size: 20px;
  color: #000;
}
.selected-books h3 {
  margin-bottom: 15px;
  font-size: 16px;
  color: #000;
}
</style>
