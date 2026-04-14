<template>
  <div class="admin-user-container">
    <div class="admin-header">
      <h2>用户管理</h2>
    </div>

    <!-- 用户列表 -->
    <el-table v-loading="loading" :data="userList" border stripe>
      <el-table-column prop="id" label="ID" width="80" />
      <el-table-column prop="username" label="用户名" width="150" />
      <el-table-column prop="role" label="角色" width="120">
        <template #default="scope">
          <el-tag
            :type="
              scope.row.role === 'admin'
                ? 'danger'
                : scope.row.role === 'seller'
                  ? 'warning'
                  : 'primary'
            "
          >
            {{
              scope.row.role === 'admin' ? '管理员' : scope.row.role === 'seller' ? '卖家' : '买家'
            }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="180">
        <template #default="scope">
          <el-button type="primary" size="small" @click="handleEdit(scope.row)">修改角色</el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 修改角色弹窗 -->
    <el-dialog v-model="dialogVisible" title="修改用户角色" width="400px">
      <el-form ref="userFormRef" :model="userForm" label-width="80px">
        <el-form-item label="用户名">
          <el-input v-model="userForm.username" disabled />
        </el-form-item>
        <el-form-item label="当前角色">
          <el-tag
            :type="
              userForm.role === 'admin'
                ? 'danger'
                : userForm.role === 'seller'
                  ? 'warning'
                  : 'primary'
            "
          >
            {{
              userForm.role === 'admin' ? '管理员' : userForm.role === 'seller' ? '卖家' : '买家'
            }}
          </el-tag>
        </el-form-item>
        <el-form-item label="新角色" prop="role">
          <el-select v-model="userForm.role" placeholder="请选择新角色">
            <el-option label="买家" value="buyer" />
            <el-option label="卖家" value="seller" />
            <el-option label="管理员" value="admin" />
          </el-select>
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
import { ElMessage } from 'element-plus'
import { adminGetAllUsers, adminUpdateUser } from '@/api/back/user'
import type { User } from '@/types/index'

// 加载状态
const loading = ref(false)
// 用户列表
const userList = ref<User[]>([])
// 弹窗显隐
const dialogVisible = ref(false)
// 表单引用
const userFormRef = ref()

// 表单数据
const userForm = reactive<User>({
  id: 0,
  username: '',
  role: 'buyer',
})

// 表单验证规则
//@ts-ignore
const userRules = reactive({
  role: [{ required: true, message: '请选择新角色', trigger: 'change' }],
})

// 获取用户列表
const getUserList = async () => {
  loading.value = true
  try {
    //@ts-ignore
    const res = (await adminGetAllUsers()) as { code: number; data: User[] }
    userList.value = res.data
  } catch (error) {
    console.error('获取用户列表失败：', error)
  } finally {
    loading.value = false
  }
}

// 编辑角色
const handleEdit = (row: User) => {
  // 赋值
  Object.assign(userForm, row)
  dialogVisible.value = true
}

// 保存角色修改
const handleSave = async () => {
  const valid = await userFormRef.value.validate()
  if (!valid) return

  try {
    //@ts-ignore
    const res = (await adminUpdateUser(userForm)) as { code: number; msg: string }
    if (res.code === 200) {
      ElMessage.success(res.msg)
      dialogVisible.value = false
      // 刷新列表
      getUserList()
    }
  } catch (error) {
    console.error('修改角色失败：', error)
  }
}

// 页面加载时获取列表
onMounted(() => {
  getUserList()
})
</script>

<style scoped>
.admin-user-container {
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
</style>
