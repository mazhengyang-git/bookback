<template>
  <div class="page-footer">
    <div class="footer-content">
      <div class="footer-left">
        <h3 class="footer-title">星途科幻图书</h3>
        <p class="footer-slogan">探索宇宙的无限可能</p>
      </div>
      <div class="footer-center">
        <div class="footer-links">
          <a href="/books" class="footer-link">图书一览</a>
          <span class="footer-separator">|</span>
          <a href="/huodong" class="footer-link">热门活动</a>
          <span class="footer-separator">|</span>
          <a href="/user" class="footer-link">个人中心</a>
          <span class="footer-separator">|</span>
          <a href="/cart" class="footer-link">购物仓库</a>
        </div>
      </div>
      <div class="footer-right">
        <p class="footer-copyright">© 2010-2026 xtkh.com 版权所有</p>
        <p class="footer-contact">联系我们：contact@xingtu.com</p>
      </div>
    </div>
    <div class="footer-legal">
      <p class="legal-text">互联网图书服务资格证书:(中)-经营性-2026-0209 中公网安备 33010002000126号</p>
      <p class="legal-text">出版物网络交易平台服务经营备案证:新出发中备字第2017001号 信息网络传播视听许可证:110936a号</p>
      <p class="legal-text">互联网违法和不良信息举报中心:0571-81683755 blxx@list.alixingxin-inc.com</p>
    </div>
  </div>
</template>

<script setup lang="ts">
// 底部组件，无逻辑
</script>

<style scoped>
.page-footer {
  width: 99.95vw;
  min-width: 1200px;
  background: linear-gradient(1.5deg, #333333 0%, #b2b0b0 100%);
  padding: 30px 0;
  position: relative;
  left: -18px;
  right: 0;
 
  box-shadow: 0 -4px 16px rgba(0, 0, 0, 0.1);
}

.footer-content {
  max-width: 1200px;
  min-width: 1200px;
  margin: 0 auto;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 20px;
  white-space: nowrap;
}

.footer-left {
  flex-shrink: 0;
}

.footer-title {
  font-size: 20px;
  font-weight: 700;
  color: #ffffff;
  margin: 0 0 8px 0;
  white-space: nowrap;
}

.footer-slogan {
  font-size: 14px;
  
  color: rgba(227, 224, 224, 0.9);
  margin: 0;
  white-space: nowrap;
}

.footer-center {
  flex: 1;
  display: flex;
  justify-content: center;
  flex-shrink: 0;
}

.footer-links {
  display: flex;
  align-items: center;
  gap: 15px;
  white-space: nowrap;
}

.footer-link {
  font-size: 14px;
  color: #ffffff;
  text-decoration: none;
  white-space: nowrap;
  transition: color 0.3s ease;
}

.footer-link:hover {
  color: #ffd700;
}

.footer-separator {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.6);
}

.footer-right {
  flex-shrink: 0;
  text-align: right;
}

.footer-copyright {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.9);
  margin: 0 0 5px 0;
  white-space: nowrap;
}

.footer-contact {
  font-size: 13px;
  color: rgba(255, 255, 255, 0.8);
  margin: 0;
  white-space: nowrap;
}

.footer-legal {
  max-width: 1200px;
  min-width: 1200px;
  margin: 20px auto 0;
  padding: 15px 20px;
  border-top: 1px solid rgba(255, 255, 255, 0.2);
  white-space: nowrap;
  text-align: center;
}

.legal-text {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.7);
  margin: 5px 0;
  white-space: nowrap;
}
</style>
