<template>
 <span style="display: inline-flex;margin-bottom: 20px;"> <h2 class="showan" style="">活动管理</h2> <h2 style="margin-left: 50px;" class="showan">资讯调整</h2></span>
  <div v-show="hdzx===true">
   
    <div class="filter-scroll-wrapper" >
      <el-scrollbar class="filter-scroll" horizontal>
        <div class="filter-btn-group">
          <div class="filter-btn" :class="{ active: selectedStatus === '全部' }" @click="handleFilter('全部')">全部</div>
          <div class="filter-btn" :class="{ active: selectedStatus === '未开始' }" @click="handleFilter('未开始')">未开始</div>
          <div class="filter-btn" :class="{ active: selectedStatus === '进行中' }" @click="handleFilter('进行中')">进行中</div>
          <div class="filter-btn" :class="{ active: selectedStatus === '快结束' }" @click="handleFilter('快结束')">快结束</div>
          <div class="filter-btn" :class="{ active: selectedStatus === '已结束' }" @click="handleFilter('已结束')">已结束</div>
          <div class="filter-btn" :class="{ active: selectedStatus === '已取消' }" @click="handleFilter('已取消')">已取消</div>
        </div>
      </el-scrollbar>
    </div>

    <div class="table-sticky-wrapper">
      <el-table  style="color: #000;" v-loading="loading" :data="hd" border
        :header-cell-style="{ color: '#333', fontSize: '14px', fontWeight: 600 }"
> stripe fit>
        <el-table-column  prop="id" label="活动编号" min-width="46" />
        <el-table-column prop="title" label="活动名称" min-width="126"  show-overflow-tooltip/>
        <el-table-column prop="content" label="活动内容" min-width="146" show-overflow-tooltip />
        <el-table-column prop="time" label="时间" min-width="160" />
       
        <el-table-column label="状态" min-width="90">
          <template #default="scope">
            <el-tag :type="getStatusTagType(scope.row.status)">
              {{ getStatusText(scope.row.status) }}
            </el-tag>
          </template>
        </el-table-column>
       
        <el-table-column label="操作" min-width="200">
          <template #default="scope">
            <el-select
              v-model="scope.row.statusText"
              placeholder="修改状态"
              size="small"
              style="width: 100%"
              @change="(val: string) => handleUpdateStatus(scope.row.id, val)"
            >
              <el-option label="未开始" value="未开始" />
              <el-option label="进行中" value="进行中" />
              <el-option label="快结束" value="快结束" />
              <el-option label="已结束" value="已结束" />
              <el-option label="已取消" value="已取消" />
            </el-select>
          </template>
        </el-table-column>
      </el-table>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted } from 'vue'
import { getHuodongListApi, updateHuodongStatusApi } from '@/api/front/huodong'
import type { Huodong } from '@/types/front/huodong'
import { ElMessage } from 'element-plus'
const hdzx=ref(true)
const loading = ref(false)
const hd = ref<Huodong[]>([])
const selectedStatus = ref('全部')

// 数字状态 → 文字
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

// 状态标签类型
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

// 获取列表（statusText用于下拉框）
const gethd = async () => {
  loading.value = true
  try {
    const res = await getHuodongListApi()
    let list = res.data || []

    // 筛选逻辑
    if (selectedStatus.value !== '全部') {
      list = list.filter(item => {
        return getStatusText(item.status) === selectedStatus.value
      })
    }

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

// 修改状态
const handleUpdateStatus = async (id: number, statusText: string) => {
  if (!id || !statusText) {
    ElMessage.warning('参数不完整，无法修改')
    return
  }
  try {
    const res = await updateHuodongStatusApi({ id, status: statusText })
    if (res.code === 200) {
      ElMessage.success('状态修改成功')
      gethd() // 刷新列表
    } else {
      ElMessage.error('修改失败：' + res.msg)
    }
  } catch (err) {
    console.error('修改状态失败：', err)
    ElMessage.error('修改失败，请重试')
  }
}
// 筛选按钮点击事件
const handleFilter = ( statusText: string) => {
  selectedStatus.value = statusText
  gethd()
}
onMounted(() => {
  gethd()
})
</script>
<style scoped>
.showan{
  font-weight: 700;
  color: #ffffff;
 padding-top: 5px;
 padding-bottom: 5px;
  background-color: #000000;
  width: 120px;
  display: flex;
  text-align: center;
  align-items: center;
 justify-content: center;
  border-radius: 10px;
  user-select: none;
  cursor: pointer;
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

/* 未选中状态文字改为纯黑 */
.filter-btn {
  padding: 6px 16px;
  border-radius: 20px;
  background: #f5f5f5;
  cursor: pointer;
  transition: all 0.3s;
  font-size: 13px;
  color: #333; /* 未选中文字纯黑 */
}
.filter-btn.active {
  background: #409eff;
  color: #fff; /* 选中状态保持白色 */
}
.filter-btn:hover {
  background: #e5e6eb;
}
.filter-btn.active:hover {
  background: #3388ff;
}

/* 粘性表格容器（滚动条固定） */
.table-sticky-wrapper {
  overflow-x: auto; /* 横向滚动条 */
  position: sticky;
  top: 80px; /* 固定在筛选栏下方，和视口顶部保持距离 */
  background: #fff; /* 背景白色，避免滚动时内容穿透 */
  z-index: 10; /* 层级比侧边栏高，不被挡住 */
  padding-bottom: 5px; /* 给滚动条留一点空间 */
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