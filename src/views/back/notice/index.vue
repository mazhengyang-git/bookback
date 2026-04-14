<template>
  <div class="notice-manage">
    <h2 class="page-title">公告管理</h2>
    <button class="add-btn" @click="toAdd">发布新公告</button>

    <div class="list">
      <div v-for="item in noticeList" :key="item.id" class="item">
        <div class="info">
          <h4>{{ item.title }}</h4>
          <p>{{ item.content }}</p>
          <span>{{ item.create_time }}</span>
        </div>
        <div class="btns">
          <button class="edit-btn" @click="toEdit(item)">修改</button>
          <button class="del-btn" @click="delNotice(item.id)">删除</button>
        </div>
      </div>
    </div>

    <div v-if="formVisible" class="modal-overlay" @click.self="formVisible = false">
      <div class="form-modal">
        <h3 class="modal-title">{{ form.id ? '编辑公告' : '新增公告' }}</h3>
        <input class="form-input" v-model="form.title" placeholder="请输入公告标题" />
        <textarea
          class="form-textarea"
          v-model="form.content"
          placeholder="请输入公告内容"
        ></textarea>
        <div class="modal-btns">
          <button class="save-btn" @click="saveNotice">保存</button>
          <button class="cancel-btn" @click="formVisible = false">取消</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import {
  getAnnouncementList,
  addAnnouncement,
  updateAnnouncement,
  deleteAnnouncement,
} from '@/api/back/announcement'
import type { Announcement } from '@/types/index'

const noticeList = ref<Announcement[]>([])
const formVisible = ref(false) //@ts-ignore
const form = ref<Announcement>({ id: 0, title: '', content: '', create_time: '' })

const getList = async () => {
  const res = await getAnnouncementList() //@ts-ignore
  noticeList.value = res.data
}

const toAdd = () => {
  //@ts-ignore
  form.value = { id: 0, title: '', content: '', create_time: '' }
  formVisible.value = true
}

const toEdit = (item: Announcement) => {
  form.value = { ...item }
  formVisible.value = true
}

const saveNotice = async () => {
  if (!form.value.title.trim() || !form.value.content.trim()) {
    alert('标题和内容不能为空！')
    return
  }
  if (form.value.id) {
    await updateAnnouncement(form.value)
  } else {
    await addAnnouncement(form.value)
  }
  formVisible.value = false
  getList()
}

const delNotice = async (id: number) => {
  if (!confirm('确定删除该公告吗？')) return
  await deleteAnnouncement(id)
  getList()
}

onMounted(() => getList())
</script>

<style scoped>
.notice-manage {
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
  box-sizing: border-box;
  user-select: none;
}

.page-title {
  margin: 0 0 20px 0;
  color: #000;
  font-size: 24px;
}

.add-btn {
  padding: 10px 20px;
  background: #4e73df;
  color: #fff;
  border: none;
  border-radius: 5px;
  margin-bottom: 20px;
  cursor: pointer;
}
.add-btn:hover {
  opacity: 0.9;
}

.list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px;
  background: #fff;
  border-radius: 10px;
  gap: 20px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.info {
  flex: 1;
  color: #000;
}
.info h4 {
  margin: 0 0 8px 0;
}
.info p {
  margin: 0 0 8px 0;
  color: #666;
  word-break: break-all;
}
.info span {
  font-size: 12px;
  color: #999;
}

.btns {
  display: flex;
  gap: 8px;
}
.edit-btn {
  padding: 6px 12px;
  border: none;
  border-radius: 4px;
  background: #6c757d;
  color: #fff;
  cursor: pointer;
}
.del-btn {
  padding: 6px 12px;
  border: none;
  border-radius: 4px;
  background: #dc3545;
  color: #fff;
  cursor: pointer;
}

/* 遮罩层：全屏最高层级 */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0, 0, 0, 0.5);
  z-index: 9999;
  /* 默认居中 */
  display: flex;
  align-items: center;
  justify-content: center;
}

/* 弹窗主体：默认样式 */
.form-modal {
  background: #e6e1dc;
  padding: 30px;
  border-radius: 8px;
  width: 90%;
  max-width: 500px;
  max-height: 85vh;
  overflow-y: auto;
  box-sizing: border-box;
}

.modal-title {
  text-align: center;
  margin: 0 0 20px 0;
  color: #000;
}

.form-input,
.form-textarea {
  width: 100%;
  padding: 12px;
  margin-bottom: 15px;
  border: 1px solid #ddd;
  border-radius: 5px;
  box-sizing: border-box;
}
.form-textarea {
  min-height: 120px;
  resize: vertical;
}

.modal-btns {
  display: flex;
  gap: 10px;
  justify-content: center;
}
.save-btn {
  padding: 10px 25px;
  background: #4e73df;
  color: #fff;
  border: none;
  border-radius: 5px;
  cursor: pointer;
}
.cancel-btn {
  padding: 10px 25px;
  background: #6c757d;
  color: #fff;
  border: none;
  border-radius: 5px;
  cursor: pointer;
}

/* ======================
核心：小屏幕自动向左偏移，避开按钮栏
======================= */
/* 窗口宽度 ≤ 600px 时，弹窗向左靠，不居中 */
@media (max-width: 600px) {
  .modal-overlay {
    justify-content: flex-start; /* 取消居中，左对齐 */
    padding-left: 120px; /* 左侧留空隙，完全避开按钮栏 */
  }
  .form-modal {
    width: 80%; /* 缩小宽度，不占满屏幕 */
    padding: 20px;
  }
}

/* 更小屏幕 ≤ 400px，进一步左移+缩宽 */
@media (max-width: 400px) {
  .modal-overlay {
    padding-left: 5px;
  }
  .form-modal {
    width: 75%;
    position: relative;
  }
}

/* 常规手机适配 */
@media (max-width: 576px) {
  .item {
    flex-direction: column;
    align-items: flex-start;
  }
  .btns {
    align-self: flex-end;
  }
}
</style>
