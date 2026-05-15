<template>
  <!-- Tab切换按钮 -->
  <div class="tab-header">
    <h2 class="showan" :class="{ active: activeTab === 'huodong' }" @click="activeTab = 'huodong'">活动管理</h2>
    <h2 class="showan" :class="{ active: activeTab === 'zixun' }" @click="activeTab = 'zixun'">资讯管理</h2>
  </div>

  <!-- 活动管理 -->
  <div v-show="activeTab === 'huodong'" >
    <div class="filter-scroll-wrapper">
      <el-scrollbar class="filter-scroll" horizontal>
        <div class="filter-btn-group">
          <div style="font-weight: bold;" class="filter-btn" :class="{ active: selectedStatus === '全部' }" @click="handleFilter('全部')">全部</div>
          <div style="font-weight: bold;" class="filter-btn" :class="{ active: selectedStatus === '未开始' }" @click="handleFilter('未开始')">未开始</div>
          <div style="font-weight: bold;" class="filter-btn" :class="{ active: selectedStatus === '进行中' }" @click="handleFilter('进行中')">进行中</div>
          <div style="font-weight: bold;" class="filter-btn" :class="{ active: selectedStatus === '快结束' }" @click="handleFilter('快结束')">快结束</div>
          <div style="font-weight: bold;" class="filter-btn" :class="{ active: selectedStatus === '已结束' }" @click="handleFilter('已结束')">已结束</div>
          <div style="font-weight: bold;" class="filter-btn" :class="{ active: selectedStatus === '已取消' }" @click="handleFilter('已取消')">已取消</div>
        </div>
      </el-scrollbar>
    </div>

    <!-- 新增活动按钮 -->
    <div style="margin-bottom: 12px;">
      <el-button style="font-weight: bold;" type="primary" @click="handleAddHuodong">新增活动</el-button>
    </div>

    <div class="table-sticky-wrapper">
      <el-table style="color: #000;" v-loading="loading" :data="hd" border
        :header-cell-style="{ color: '#333', fontSize: '14px', fontWeight: 600 }" stripe fit>
        <el-table-column prop="id" label="活动编号" min-width="46" />
        <el-table-column prop="title" label="活动名称" min-width="126" show-overflow-tooltip />
        <el-table-column prop="content" label="活动内容" min-width="146" show-overflow-tooltip />
        <el-table-column prop="time" label="时间" min-width="160" />
        <el-table-column label="状态" min-width="90">
          <template #default="scope">
            <el-tag :type="getStatusTagType(scope.row.status)">
              {{ getStatusText(scope.row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" min-width="260">
          <template #default="scope">
            <el-select
              v-model="scope.row.statusText"
              placeholder="修改状态"
              size="small"
              style="width: 120px; margin-right: 8px;"
              @change="(val: string) => handleUpdateStatus(scope.row.id, val)"
            >
              <el-option label="未开始" value="未开始" />
              <el-option label="进行中" value="进行中" />
              <el-option label="快结束" value="快结束" />
              <el-option label="已结束" value="已结束" />
              <el-option label="已取消" value="已取消" />
            </el-select>
            <el-button style="font-size: 15px;" size="small" type="warning" @click="handleEditHuodong(scope.row)">编辑</el-button>
            <el-button style="font-size: 15px;" size="small" type="danger" @click="handleDeleteHuodong(scope.row.id)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <!-- 新增/编辑活动对话框 -->
    <el-dialog v-model="huodongDialogVisible" :title="huodongDialogTitle" width="600px" destroy-on-close>
      <el-form :model="huodongForm" label-width="80px">
        <el-form-item label="活动名称">
          <el-input v-model="huodongForm.title" placeholder="请输入活动名称" />
        </el-form-item>
        <el-form-item label="活动内容">
          <el-input v-model="huodongForm.content" type="textarea" :rows="4" placeholder="请输入活动内容" />
        </el-form-item>
        <el-form-item label="时间">
          <el-input v-model="huodongForm.time" placeholder="如：2026-05-10 ~ 2026-05-20" />
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="huodongForm.statusText" placeholder="请选择状态">
            <el-option label="未开始" value="未开始" />
            <el-option label="进行中" value="进行中" />
            <el-option label="快结束" value="快结束" />
            <el-option label="已结束" value="已结束" />
            <el-option label="已取消" value="已取消" />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="huodongDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitHuodongForm">确认</el-button>
      </template>
    </el-dialog>
  </div>

  <!-- 资讯管理 -->
  <div v-show="activeTab === 'zixun'">
    <div class="filter-scroll-wrapper">
      <el-scrollbar class="filter-scroll" horizontal>
        <div class="filter-btn-group">
          <div style="font-weight: bold;" class="filter-btn" :class="{ active: selectedZxStatus === '全部' }" @click="handleZxFilter('全部')">全部</div>
          <div style="font-weight: bold;" class="filter-btn" :class="{ active: selectedZxStatus === '未发布' }" @click="handleZxFilter('未发布')">未发布</div>
          <div style="font-weight: bold;" class="filter-btn" :class="{ active: selectedZxStatus === '已发布' }" @click="handleZxFilter('已发布')">已发布</div>
          <div style="font-weight: bold;" class="filter-btn" :class="{ active: selectedZxStatus === '已下架' }" @click="handleZxFilter('已下架')">已下架</div>
        </div>
      </el-scrollbar>
    </div>

    <div style="margin-bottom: 12px;">
      <el-button style="font-weight: bold;" type="primary" @click="handleAddZixun">新增资讯</el-button>
    </div>

    <div class="table-sticky-wrapper">
      <el-table style="color: #000;" v-loading="zxLoading" :data="zxList" border
        :header-cell-style="{ color: '#333', fontSize: '14px', fontWeight: 600 }" stripe fit>
        <el-table-column prop="id" label="资讯编号" min-width="46" />
        <el-table-column prop="title" label="资讯标题" min-width="126" show-overflow-tooltip />
        <el-table-column prop="content" label="资讯内容" min-width="146" show-overflow-tooltip />
        <el-table-column prop="time" label="时间" min-width="120" />
        <el-table-column label="状态" min-width="90">
          <template #default="scope">
            <el-tag :type="getZxStatusTagType(scope.row.status)">
              {{ getZxStatusText(scope.row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" min-width="260">
          <template #default="scope">
            <el-select
              v-model="scope.row.zxStatusText"
              placeholder="修改状态"
              size="small"
              style="width: 120px; margin-right: 8px;"
              @change="(val: string) => handleUpdateZxStatus(scope.row.id, val)"
            >
              <el-option label="未发布" value="未发布" />
              <el-option label="已发布" value="已发布" />
              <el-option label="已下架" value="已下架" />
            </el-select>
            <el-button style="font-size: 15px;" size="small" type="warning" @click="handleEditZixun(scope.row)">编辑</el-button>
            <el-button style="font-size: 15px;" size="small" type="danger" @click="handleDeleteZixun(scope.row.id)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <!-- 新增/编辑资讯对话框 -->
    <el-dialog v-model="zixunDialogVisible" :title="zixunDialogTitle" width="600px" destroy-on-close>
      <el-form :model="zixunForm" label-width="80px">
        <el-form-item label="资讯标题">
          <el-input v-model="zixunForm.title" placeholder="请输入资讯标题" />
        </el-form-item>
        <el-form-item label="资讯内容">
          <el-input v-model="zixunForm.content" type="textarea" :rows="4" placeholder="请输入资讯内容" />
        </el-form-item>
        <el-form-item label="时间">
          <el-input v-model="zixunForm.time" placeholder="如：2026-05-10" />
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="zixunForm.status" placeholder="请选择状态">
            <el-option label="未发布" value="未发布" />
            <el-option label="已发布" value="已发布" />
            <el-option label="已下架" value="已下架" />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="zixunDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitZixunForm">确认</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted } from 'vue'
import {
  getHuodongListApi,
  updateHuodongStatusApi,
  addHuodongApi,
  updateHuodongApi,
  deleteHuodongApi
} from '@/api/front/huodong'
import { getZixunListApi, addZixunApi, updateZixunApi, updateZixunStatusApi, deleteZixunApi } from '@/api/front/zixun'
import type { Huodong } from '@/types/front/huodong'
import type { Zixun } from '@/types/front/zixun'
import { ElMessage, ElMessageBox } from 'element-plus'

// Tab切换
const activeTab = ref<'huodong' | 'zixun'>('huodong')

// 活动管理 
const loading = ref(false)
const hd = ref<Huodong[]>([])
const selectedStatus = ref('全部')

// 状态文本
const getStatusText = (status: number) => {
  switch (status) {
    case 0: return '未开始'
    case 1: return '进行中'
    case 2: return '快结束'
    case 3: return '已结束'
    case 4: return '已取消'
    default: return '未知'
  }
}
// 状态标签样式
const getStatusTagType = (status: number) => {
  switch (status) {
    case 0: return 'info'
    case 1: return 'primary'
    case 2: return 'success'
    case 3: return 'danger'
    case 4: return 'warning'
    default: return 'info'
  }
}

// 获取活动列表
const gethd = async () => {
  loading.value = true
  try {
    const res = await getHuodongListApi()
    let list = res.data || []

    if (selectedStatus.value !== '全部') {//@ts-ignore
      list = list.filter(item => {
        return getStatusText(item.status) === selectedStatus.value
      })
    }
//@ts-ignore
    hd.value = list.map((item: any) => ({
      ...item,
      statusText: getStatusText(item.status)
    }))
  } catch (error) {
    console.error('获取失败', error)
  } finally {
    loading.value = false
  }
}

// 修改活动状态
const handleUpdateStatus = async (id: number, statusText: string) => {
  if (!id || !statusText) {
    ElMessage.warning('参数不完整，无法修改')
    return
  }
  try {
    const res = await updateHuodongStatusApi({ id, status: statusText })//@ts-ignore
    if (res.code === 200) {
      ElMessage.success('状态修改成功')
      gethd()
    } else {//@ts-ignore
      ElMessage.error('修改失败：' + res.msg)
    }
  } catch (err) {
    console.error('修改状态失败：', err)
    ElMessage.error('修改失败，请重试')
  }
}

// 筛选
const handleFilter = (statusText: string) => {
  selectedStatus.value = statusText
  gethd()
}

// 活动表单
const huodongDialogVisible = ref(false)
const huodongDialogTitle = ref('新增活动')
const isEditHuodong = ref(false)
const huodongForm = ref({
  id: 0,
  title: '',
  content: '',
  time: '',
  statusText: '未开始',
})

// 重置表单
const resetHuodongForm = () => {
  huodongForm.value = {
    id: 0,
    title: '',
    content: '',
    time: '',
    statusText: '未开始',
  }
}

// 新增活动
const handleAddHuodong = () => {
  resetHuodongForm()
  isEditHuodong.value = false
  huodongDialogTitle.value = '新增活动'
  huodongDialogVisible.value = true
}

// 编辑活动
const handleEditHuodong = (row: any) => {
  isEditHuodong.value = true
  huodongDialogTitle.value = '编辑活动'
  huodongForm.value = {
    id: row.id,
    title: row.title || '',
    content: row.content || '',
    time: row.time || '',
    statusText: getStatusText(row.status),
  }
  huodongDialogVisible.value = true
}

// 提交活动表单
const submitHuodongForm = async () => {
  const form = huodongForm.value
  if (!form.title) {
    ElMessage.warning('请输入活动名称')
    return
  }

  const submitData = {
    id: form.id,
    title: form.title,
    content: form.content,
    time: form.time,
    status: form.statusText,
    name: form.title,
    desc: '',
    image: '',
    url: '',
    create_time: new Date().toISOString().slice(0, 19).replace('T', ' ')
  }

  try {
    if (isEditHuodong.value) {
      const res = await updateHuodongApi(submitData)//@ts-ignore
      if (res.code === 200) {
        ElMessage.success('活动修改成功')
        huodongDialogVisible.value = false
        gethd()
      } else {//@ts-ignore
        ElMessage.error('修改失败：' + res.msg)
      }
    } else {
      const res = await addHuodongApi(submitData)//@ts-ignore
      if (res.code === 200) {
        ElMessage.success('活动新增成功')
        huodongDialogVisible.value = false
        gethd()
      } else {//@ts-ignore
        ElMessage.error('新增失败：' + res.msg)
      }
    }
  } catch (err) {
    console.error('提交活动失败：', err)
    ElMessage.error('操作失败，请重试')
  }
}

// 删除活动
const handleDeleteHuodong = async (id: number) => {
  try {
    await ElMessageBox.confirm('确定删除该活动吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    })
    const res = await deleteHuodongApi(id)//@ts-ignore
    if (res.code === 200) {
      ElMessage.success('活动删除成功')
      gethd()
    } else {//@ts-ignore
      ElMessage.error('删除失败：' + res.msg)
    }
  } catch (err) {
    // 用户取消删除
  }
}

// 资讯管理 
const zxLoading = ref(false)
const zxList = ref<Zixun[]>([])
const selectedZxStatus = ref('全部')

const getZxStatusText = (status: number) => {
  switch (status) {
    case 0: return '未发布'
    case 1: return '已发布'
    case 2: return '已下架'
    default: return '未知'
  }
}

const getZxStatusTagType = (status: number) => {
  switch (status) {
    case 0: return 'info'
    case 1: return 'success'
    case 2: return 'warning'
    default: return 'info'
  }
}

const getZxList = async () => {
  zxLoading.value = true
  try {
    const res = await getZixunListApi()
    let list = res.data || []

    if (selectedZxStatus.value !== '全部') {//@ts-ignore
      list = list.filter((item: any) => {
        return getZxStatusText(item.status) === selectedZxStatus.value
      })
    }
//@ts-ignore
    zxList.value = list.map((item: any) => ({
      ...item,
      zxStatusText: getZxStatusText(item.status)
    }))
  } catch (error) {
    console.error('获取资讯失败', error)
  } finally {
    zxLoading.value = false
  }
}

const handleZxFilter = (statusText: string) => {
  selectedZxStatus.value = statusText
  getZxList()
}

const handleUpdateZxStatus = async (id: number, statusText: string) => {
  if (!id || !statusText) {
    ElMessage.warning('参数不完整，无法修改')
    return
  }
  try {
    const res = await updateZixunStatusApi({ id, status: statusText })//@ts-ignore
    if (res.code === 200) {
      ElMessage.success('资讯状态修改成功')
      getZxList()
    } else {//@ts-ignore
      ElMessage.error('修改失败：' + res.msg)
    }
  } catch (err) {
    console.error('修改资讯状态失败：', err)
    ElMessage.error('修改失败，请重试')
  }
}

const zixunDialogVisible = ref(false)
const zixunDialogTitle = ref('新增资讯')
const isEditZixun = ref(false)
const zixunForm = ref({
  id: 0,
  title: '',
  content: '',
  time: '',
  status: '未发布',
  name: '',
  desc: '',
  image: '',
  url: '',
  create_time: '',
})

const resetZixunForm = () => {
  zixunForm.value = {
    id: 0,
    title: '',
    content: '',
    time: '',
    status: '未发布',
    name: '',
    desc: '',
    image: '',
    url: '',
    create_time: '',
  }
}

const handleAddZixun = () => {
  resetZixunForm()
  isEditZixun.value = false
  zixunDialogTitle.value = '新增资讯'
  zixunDialogVisible.value = true
}

const handleEditZixun = (row: Zixun) => {
  isEditZixun.value = true
  zixunDialogTitle.value = '编辑资讯'
  zixunForm.value = {
    id: row.id,
    title: row.title || '',
    content: row.content || '',
    time: row.time || '',
    status: getZxStatusText(row.status),
    name: row.name || '',
    desc: row.desc || '',
    image: row.image || '',
    url: row.url || '',
    create_time: row.create_time || '',
  }
  zixunDialogVisible.value = true
}

const submitZixunForm = async () => {
  const form = zixunForm.value
  if (!form.title) {
    ElMessage.warning('请输入资讯标题')
    return
  }
  try {
    if (isEditZixun.value) {
      const res = await updateZixunApi(form as any)//@ts-ignore
      if (res.code === 200) {
        ElMessage.success('资讯修改成功')
        zixunDialogVisible.value = false
        getZxList()
      } else {//@ts-ignore
        ElMessage.error('修改失败：' + res.msg)
      }
    } else {
      const res = await addZixunApi(form as any)//@ts-ignore
      if (res.code === 200) {
        ElMessage.success('资讯新增成功')
        zixunDialogVisible.value = false
        getZxList()
      } else {//@ts-ignore
        ElMessage.error('新增失败：' + res.msg)
      }
    }
  } catch (err) {
    console.error('提交资讯失败：', err)
    ElMessage.error('操作失败，请重试')
  }
}

const handleDeleteZixun = async (id: number) => {
  try {
    await ElMessageBox.confirm('确定删除该资讯吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    })
    const res = await deleteZixunApi(id)//@ts-ignore
    if (res.code === 200) {
      ElMessage.success('资讯删除成功')
      getZxList()
    } else {//@ts-ignore
      ElMessage.error('删除失败：' + res.msg)
    }
  } catch (err) {
    // 用户取消
  }
}

onMounted(() => {
  gethd()
  getZxList()
})
</script>


<style scoped>
.tab-header {
  display: inline-flex;
  margin-bottom: 20px;
  gap: 50px;
}

.showan {
  font-weight: 700;
  color: #ffffff;
  padding-top: 5px;
  padding-bottom: 5px;
  background-color: #b7b5b5;
  width: 120px;
  display: flex;
  text-align: center;
  align-items: center;
  justify-content: center;
  border-radius: 10px;
  user-select: none;
  cursor: pointer;
  transition: all 0.3s;
}

.showan.active {
  background: linear-gradient(180deg, #409eff, #337ecc);
  box-shadow: 0 2px 8px rgba(64, 158, 255, 0.4);
}

.admin-order-container {
  width: 100%;
  padding: 20px;
  box-sizing: border-box;
}

/* 头部布局 */
.admin-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 10px;
  border-bottom: 1px solid #eee;
  gap: 20px;
}

/* 筛选导航条容器 */
.filter-scroll-wrapper {
  flex: 1;
  max-width: 600px;
}
.filter-scroll {
  height: 40px;
}

.filter-btn-group {
  display: flex;
  gap: 8px;
  padding: 4px 0;
  white-space: nowrap;
}

/* 未选中状态文字纯黑 */
.filter-btn {
  padding: 6px 16px;
  border-radius: 20px;
  background: #f5f5f5;
  cursor: pointer;
  transition: all 0.3s;
  font-size: 13px;
  color: #333;
}
.filter-btn.active {
  background: #409eff;
  color: #fff;
}
.filter-btn:hover {
  background: #e5e6eb;
}
.filter-btn.active:hover {
  background: #3388ff;
}

/* 粘性表格容器（滚动条固定） */
.table-sticky-wrapper {
  overflow-x: auto;
  position: sticky;
  top: 80px;
  background: #fff;
  z-index: 10;
  padding-bottom: 5px;
  width: 100%;
}

/* 加宽横向滚动条 */
:deep(.el-scrollbar__bar.is-horizontal) {
  height: 6px !important;
}
:deep(.el-scrollbar__thumb) {
  background: #c0c4cc !important;
  border-radius: 3px !important;
}
:deep(.el-scrollbar__thumb:hover) {
  background: #909399 !important;
}
</style>