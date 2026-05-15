<template>
  <div class="space-fill-panel">
    <!-- 银河资讯 -->
    <div class="module-card">
      <div class="module-title">
        <span class="title-icon">🚀</span>
        银河快讯
     <span @click="router.push(`/huodong `)" style="font-size:16px;color:gray;position: relative;top: 1.5px;cursor: pointer;">查看全部></span> </div>

      <div class="news-list">
        <div v-for="(item, index) in newsList" :key="index" class="news-item">
          <div class="news-tag">{{ item.tag }}</div>
          <div class="news-content">
            <div class="news-title">{{ item.title }}</div>
            <div class="news-desc">{{ item.desc }}</div>
          </div>
        </div>
      </div>
    </div>

    <!-- 科幻数据面板 -->
    <div class="module-card">
      <div class="module-title">
        <span class="title-icon">📡</span>
        星际数据中心
      </div>

      <div class="data-grid">
        <div class="data-box">
          <div class="data-num">6W+</div>
          <div class="data-label">科幻读者</div>
        </div>

        <div class="data-box">
          <div class="data-num">342</div>
          <div class="data-label">已收录图书</div>
        </div>

        <div class="data-box">
          <div class="data-num">29</div>
          <div class="data-label">签约作者</div>
        </div>

        <div class="data-box">
          <div class="data-num">729</div>
          <div class="data-label">宇宙专题</div>
        </div>
      </div>
    </div>

    <!-- 科幻语录 -->
    <div class="module-card">
      <div class="module-title">
        <span class="title-icon">🪐</span>
        今日科幻语录
      </div>

      <div class="quote-box">
        “给岁月以文明，而不是给文明以岁月。”
      </div>

      <div class="quote-author">——《三体》</div>
    </div>

    <!-- 阅读进度 -->
    <div class="module-card">
      <div class="module-title">
        <span class="title-icon">📚</span>
        星际阅读计划
      </div>

      <div class="progress-item">
        <div class="progress-top">
          <span>银河帝国全集</span>
          <span>76%</span>
        </div>
        <div class="progress-bar">
          <div class="progress-inner w76"></div>
        </div>
      </div>

      <div class="progress-item">
        <div class="progress-top">
          <span>沙丘</span>
          <span>54%</span>
        </div>
        <div class="progress-bar">
          <div class="progress-inner w54"></div>
        </div>
      </div>

      <div class="progress-item">
        <div class="progress-top">
          <span>基地系列</span>
          <span>89%</span>
        </div>
        <div class="progress-bar">
          <div class="progress-inner w89"></div>
        </div>
      </div>
    </div>

    <!-- 星际勋章 -->
    <div class="module-card">
      <div class="module-title">
        <span class="title-icon">🏅</span>
        星际勋章墙
      </div>

      <div class="badge-list">
        <div class="badge-item">🌌 银河探索者</div>
        <div class="badge-item">🛰 深空旅人</div>
        <div class="badge-item">🤖 AI观察者</div>
        <div class="badge-item">🛸 文明发现者</div>
        <div class="badge-item">🌠 时间跃迁者</div>
        <div class="badge-item">⚡ 赛博行者</div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
const router = useRouter()
const newsList = [
  {
    tag: '最新',
    title: '《银河边缘计划》正式上线',
    desc: '新一代太空歌剧专题已开放阅读'
  },
  {
    tag: '推荐',
    title: '本周赛博朋克阅读热度上涨',
    desc: '霓虹都市题材连续三周霸榜'
  },
  {
    tag: '新星',
    title: '星际文明主题征文开始',
    desc: '参与即可获得限定电子徽章'
  },
  {
    tag: '更新',
    title: '新增 AI 文明专题合集',
    desc: '收录近百本科幻经典作品'
  }
]
</script>

<style scoped>
.space-fill-panel {
  width: 100%;
  padding: 10px 0 30px;
  display: flex;
  flex-direction: column;
  gap: 22px;
}

/* 模块卡片 */
.module-card {
  background: linear-gradient(
    145deg,
    rgba(255,255,255,0.96),
    rgba(247,247,247,0.94)
  );

  border-radius: 18px;
  padding: 22px;

  box-shadow:
    0 8px 24px rgba(0,0,0,0.06),
    inset 0 1px 0 rgba(255,255,255,0.6);

  transition: all 0.35s ease;

  border: 1px solid rgba(255,255,255,0.5);
}

.module-card:hover {
  transform: translateY(-3px);
  box-shadow:
    0 14px 34px rgba(0,0,0,0.1),
    0 0 18px rgba(64,158,255,0.12);
}

/* 标题 */
.module-title {
  display: flex;
  align-items: center;
  gap: 10px;

  font-size: 22px;
  font-weight: 800;
  color: #2c3e50;

  margin-bottom: 18px;
}

.title-icon {
  font-size: 24px;
}

/* 新闻 */
.news-list {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.news-item {
  display: flex;
  gap: 14px;

  padding: 14px;

  background: rgba(245,247,250,0.7);
  border-radius: 12px;

  transition: all 0.3s ease;
}

.news-item:hover {
  background: rgba(230,243,255,0.9);
}

.news-tag {
  min-width: 58px;
  height: 28px;

  border-radius: 8px;

  background: linear-gradient(135deg,#409eff,#67c6ff);

  color: white;
  font-size: 13px;
  font-weight: 700;

  display: flex;
  align-items: center;
  justify-content: center;
}

.news-title {
  font-size: 16px;
  font-weight: 700;
  color: #333;
  margin-bottom: 4px;
}

.news-desc {
  font-size: 13px;
  color: #777;
}

/* 数据中心 */
.data-grid {
  display: grid;
  grid-template-columns: repeat(4,1fr);
  gap: 16px;
}

.data-box {
  background: linear-gradient(
    145deg,
    #edf6ff,
    #f8fbff
  );

  border-radius: 16px;
  padding: 20px 10px;

  text-align: center;

  transition: all 0.3s ease;
}

.data-box:hover {
  transform: scale(1.04);
}

.data-num {
  font-size: 30px;
  font-weight: 900;
  color: #409eff;
  margin-bottom: 8px;
}

.data-label {
  color: #666;
  font-size: 14px;
}

/* 语录 */
.quote-box {
  font-size: 22px;
  line-height: 1.8;

  color: #444;

  text-align: center;

  padding: 30px 20px;

  background:
    linear-gradient(
      135deg,
      rgba(64,158,255,0.08),
      rgba(230,162,60,0.08)
    );

  border-radius: 18px;

  font-weight: 600;
}

.quote-author {
  text-align: right;
  margin-top: 14px;

  color: #888;
  font-size: 15px;
}

/* 阅读进度 */
.progress-item {
  margin-bottom: 20px;
}

.progress-top {
  display: flex;
  justify-content: space-between;

  margin-bottom: 8px;

  color: #444;
  font-size: 15px;
  font-weight: 600;
}

.progress-bar {
  width: 100%;
  height: 12px;

  background: #edf1f5;

  border-radius: 999px;

  overflow: hidden;
}

.progress-inner {
  height: 100%;
  border-radius: 999px;

  background: linear-gradient(
    90deg,
    #409eff,
    #67c6ff
  );
}

.w76 {
  width: 76%;
}

.w54 {
  width: 54%;
}

.w89 {
  width: 89%;
}

/* 勋章 */
.badge-list {
  display: flex;
  flex-wrap: wrap;
  gap: 14px;
}

.badge-item {
  padding: 12px 18px;

  border-radius: 999px;

  background: linear-gradient(
    135deg,
    #fff7e8,
    #fff3d8
  );

  border: 1px solid rgba(230,162,60,0.25);

  color: #a86a00;
  font-weight: 700;

  transition: all 0.3s ease;
}

.badge-item:hover {
  transform: translateY(-2px) scale(1.04);

  background: linear-gradient(
    135deg,
    #ffe7b3,
    #fff4d6
  );
}

/* 响应式 */
@media (max-width: 768px) {
  .data-grid {
    grid-template-columns: repeat(2,1fr);
  }

  .module-title {
    font-size: 18px;
  }

  .quote-box {
    font-size: 18px;
  }
}
</style>