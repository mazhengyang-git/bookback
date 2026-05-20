# -*- coding: utf-8 -*-
from pathlib import Path

INDEX = Path(r'd:\vue-k3\vue_k2\src\views\front\pay\index.vue')
DIRECT = Path(r'd:\vue-k3\vue_k2\src\views\front\pay\direct.vue')

INDEX_CSS = r'''
<style scoped>
.pay-page {
  min-height: 100vh;
  background: #f5f7fa;
  padding-bottom: 100px;
}
.pay-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: #fff;
  padding: 14px 20px;
  position: sticky;
  top: 0;
  z-index: 100;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}
.header-inner {
  max-width: 900px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  gap: 16px;
}
.back-btn {
  cursor: pointer;
  padding: 6px 14px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 16px;
  font-size: 14px;
  white-space: nowrap;
  transition: background 0.2s;
}
.back-btn:hover { background: rgba(255, 255, 255, 0.35); }
.header-title {
  flex: 1;
  font-size: 18px;
  font-weight: 600;
  margin: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.header-badge {
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 600;
  background: rgba(255, 255, 255, 0.25);
  white-space: nowrap;
}
.pay-main {
  max-width: 900px;
  margin: 0 auto;
  padding: 20px 16px;
}
.loading-tip, .empty-tip {
  text-align: center;
  padding: 80px 20px;
  color: #6b7280;
}
.loading-spinner {
  width: 40px;
  height: 40px;
  margin: 0 auto 16px;
  border: 3px solid #e5e7eb;
  border-top-color: #667eea;
  border-radius: 50%;
  animation: pay-spin 0.8s linear infinite;
}
@keyframes pay-spin { to { transform: rotate(360deg); } }
.empty-icon { font-size: 48px; margin-bottom: 12px; }
.empty-text { font-size: 16px; color: #4b5563; margin: 0 0 20px; }
.order-wrapper { display: flex; flex-direction: column; gap: 16px; }
.section-card {
  background: #fff;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
}
.block-title {
  font-size: 16px;
  font-weight: 600;
  color: #1f2937;
  margin: 0 0 16px;
  padding-bottom: 8px;
  border-bottom: 2px solid #409eff;
  display: inline-block;
}
.goods-list { display: flex; flex-direction: column; gap: 12px; }
.pay-item {
  display: flex;
  gap: 16px;
  padding: 14px;
  border: 1px solid #f0f0f0;
  border-radius: 10px;
  background: #fafafa;
  transition: box-shadow 0.2s;
}
.pay-item:hover { box-shadow: 0 4px 12px rgba(102, 126, 234, 0.12); }
.cover {
  width: 72px;
  height: 100px;
  object-fit: cover;
  border-radius: 6px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  flex-shrink: 0;
}
.goods-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 8px;
}
.goods-name { color: #1f2937; font-weight: 600; font-size: 15px; margin: 0; line-height: 1.4; }
.goods-price { color: #6b7280; font-size: 14px; margin: 0; }
.goods-price-origin {
  color: #9ca3af;
  text-decoration: line-through;
  margin-left: 8px;
  font-size: 12px;
}
.pay-total {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 18px;
  font-weight: 600;
}
.total-label { color: #4b5563; }
.total-price { color: #dc2626; font-size: 24px; font-weight: 700; }
.pay-footer-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 90;
  padding: 12px 16px 20px;
  background: linear-gradient(to top, #fff 70%, rgba(255, 255, 255, 0.95));
  box-shadow: 0 -4px 20px rgba(0, 0, 0, 0.08);
}
.pay-footer-bar .pay-btn {
  display: block;
  width: 100%;
  max-width: 500px;
  height: 48px;
  margin: 0 auto;
  font-size: 16px;
  font-weight: 600;
  border-radius: 10px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%) !important;
  border: none;
  transition: transform 0.2s, box-shadow 0.2s;
}
.pay-footer-bar .pay-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(102, 126, 234, 0.35);
}
.pay-footer { text-align: center; padding: 24px 16px 8px; color: #9ca3af; font-size: 12px; }
.pay-footer p { margin: 0; }
.code-box { display: flex; gap: 10px; align-items: center; flex-wrap: wrap; }
.code-box .el-input { flex: 1; min-width: 140px; }
.verify-form { padding: 8px 0; }
:deep(.pay-verify-dialog .el-dialog__header) { border-bottom: 1px solid #f0f0f0; margin-right: 0; }
:deep(.pay-verify-dialog .el-dialog__title) { font-weight: 600; color: #1f2937; }
@media (max-width: 768px) {
  .header-inner { flex-wrap: wrap; }
  .header-title { font-size: 16px; order: -1; width: 100%; }
  .pay-item { gap: 12px; padding: 12px; }
  .cover { width: 56px; height: 78px; }
  .pay-total { flex-direction: column; align-items: flex-start; gap: 8px; }
  .total-price { font-size: 22px; }
  .code-box { flex-direction: column; align-items: stretch; }
  .code-box .el-button { width: 100%; }
}
</style>
'''

DIRECT_CSS = r'''
<style scoped>
.pay-page { min-height: 100vh; background: #fefce8; padding-bottom: 40px; }
.pay-header {
  background: linear-gradient(135deg, #92400e 0%, #b45309 100%);
  color: #fff;
  padding: 14px 20px;
  position: sticky;
  top: 0;
  z-index: 100;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.15);
}
.header-inner {
  max-width: 900px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  gap: 16px;
}
.back-btn { cursor: pointer; font-size: 14px; opacity: 0.9; white-space: nowrap; transition: opacity 0.2s; }
.back-btn:hover { opacity: 1; }
.header-title {
  flex: 1;
  font-size: 18px;
  font-weight: 600;
  margin: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.header-badge {
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 600;
  background: rgba(255, 255, 255, 0.2);
}
.pay-main { max-width: 900px; margin: 0 auto; padding: 20px 16px; }
.loading-tip, .empty-tip { text-align: center; padding: 80px 20px; color: #78716c; }
.loading-spinner {
  width: 40px;
  height: 40px;
  margin: 0 auto 16px;
  border: 3px solid #fde68a;
  border-top-color: #b45309;
  border-radius: 50%;
  animation: pay-spin 0.8s linear infinite;
}
@keyframes pay-spin { to { transform: rotate(360deg); } }
.empty-icon { font-size: 48px; margin-bottom: 12px; }
.empty-text { margin: 0 0 20px; font-size: 16px; }
.pay-goods-card { display: flex; flex-direction: column; gap: 16px; }
.section-card {
  background: #fff;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
}
.block-title {
  font-size: 16px;
  font-weight: 600;
  color: #92400e;
  margin: 0 0 16px;
  padding-bottom: 8px;
  border-bottom: 2px solid #b45309;
  display: inline-block;
}
.goods-item {
  display: flex;
  gap: 24px;
  padding: 24px;
  background: #fff;
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
}
.book-cover {
  width: 120px;
  height: 173px;
  object-fit: cover;
  border-radius: 8px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
  flex-shrink: 0;
}
.goods-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 8px;
}
.goods-info h3 { margin: 0; font-size: 18px; font-weight: 700; color: #1c1917; }
.goods-meta { color: #57534e; font-size: 14px; margin: 0; }
.goods-price-line { color: #78716c; font-size: 14px; margin: 0; }
.goods-price-origin {
  color: #a8a29e;
  text-decoration: line-through;
  margin-left: 8px;
  font-size: 12px;
}
.pay-total {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
  font-size: 18px;
  font-weight: 600;
}
.total-label { color: #57534e; }
.total-price { color: #dc2626; font-size: 24px; font-weight: 700; }
.pay-btn-group { margin-top: 4px; }
.pay-btn-group :deep(.el-button) {
  width: 100%;
  height: 48px;
  font-size: 16px;
  font-weight: 600;
  border: none;
  border-radius: 10px;
  background: linear-gradient(135deg, #92400e, #b45309) !important;
  transition: transform 0.2s, box-shadow 0.2s;
}
.pay-btn-group :deep(.el-button:hover) {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(146, 64, 14, 0.3);
}
.pay-footer {
  text-align: center;
  padding: 24px;
  color: #a8a29e;
  font-size: 12px;
  border-top: 1px solid #e7e5e4;
  margin-top: 8px;
}
.pay-footer p { margin: 0; }
.code-box { display: flex; gap: 10px; align-items: center; flex-wrap: wrap; }
.verify-form { padding: 8px 0; }
:deep(.pay-verify-dialog .el-dialog__header) { border-bottom: 1px solid #f0f0f0; }
@media (max-width: 768px) {
  .header-title { font-size: 16px; }
  .goods-item { flex-direction: column; align-items: center; text-align: center; padding: 20px 16px; }
  .book-cover { width: 100px; height: 144px; }
  .pay-total { flex-direction: column; align-items: flex-start; gap: 8px; }
  .code-box { flex-direction: column; align-items: stretch; }
  .code-box .el-button { width: 100%; }
}
</style>
'''


def strip_styles(text: str) -> str:
    while '<style scoped>' in text:
        s = text.find('<style scoped>')
        e = text.find('</style>', s) + len('</style>')
        text = text[:s] + text[e:]
    return text


def patch_index(t: str) -> str:
    t = t.replace(
        '<div v-if="loading" class="loading-tip"><!--加载中...--></motion>',
        '<div v-if="loading" class="loading-tip"><div class="loading-spinner"></motion><p>正在加载订单信息…</p></motion>',
    )
    t = t.replace('<motion class="loading-spinner"></motion>', '<div class="loading-spinner"></motion>')
    t = t.replace('<div class="loading-spinner"></motion>', '<motion class="loading-spinner"></motion>')
    # fix typos from above - use explicit
    t = t.replace('<motion class="loading-spinner"></motion>', '<div class="loading-spinner"></motion>')
    t = t.replace('<div class="loading-spinner"></motion>', '<div class="loading-spinner"></motion>')
    # final fix closing tags for loading block
    import re
    t = re.sub(
        r'<div v-if="loading" class="loading-tip">.*?</motion>',
        '<div v-if="loading" class="loading-tip">\n      <div class="loading-spinner"></motion>\n      <p>正在加载订单信息…</p>\n    </motion>',
        t,
        count=1,
        flags=re.DOTALL,
    )
    t = t.replace('<div class="loading-spinner"></motion>', '<div class="loading-spinner"></motion>')
    t = t.replace('正在加载订单信息…</p>\n    </motion>', '正在加载订单信息…</p>\n    </motion>')
    return t
