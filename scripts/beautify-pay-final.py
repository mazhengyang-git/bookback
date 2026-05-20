# -*- coding: utf-8 -*-
import re
from pathlib import Path

d = ''.join(['d', 'i', 'v'])
INDEX = Path(r'd:\vue-k3\vue_k2\src\views\front\pay\index.vue')
DIRECT = Path(r'd:\vue-k3\vue_k2\src\views\front\pay\direct.vue')
INDEX_CSS = Path(r'd:\vue-k3\vue_k2\src\views\front\pay\pay-theme-index.css').read_text(encoding='utf-8')
DIRECT_CSS = Path(r'd:\vue-k3\vue_k2\src\views\front\pay\pay-theme-direct.css').read_text(encoding='utf-8')


def apply_css(content, css_body):
    content = re.sub(r'<style scoped>.*?</style>\s*', '', content, flags=re.DOTALL)
    return content.rstrip() + '\n\n<style scoped>\n' + css_body.strip() + '\n</style>\n'


def patch_index(t):
    t = re.sub(
        rf'<{d} v-if="loading" class="loading-tip">.*?</{d}>',
        f'<{d} v-if="loading" class="loading-tip">\n      <{d} class="loading-spinner"></{d}>\n      <p>正在加载订单信息…</p>\n    </{d}>',
        t,
        count=1,
        flags=re.DOTALL,
    )
    t = t.replace(
        f'        </el-form>\n      </{d}>\n\n      <!-- 2. 商品列表 -->\n      <{d} class="goods-list">',
        f'        </el-form>\n      </section>\n\n      <!-- 2. 商品列表 -->\n      <section class="goods-section section-card">\n        <h3 class="block-title">商品清单</h3>\n        <{d} class="goods-list">',
    )
    old = (
        '            <p style="color: black; font-weight: 500; margin:0">{{ item.book_name }}</p>\n'
        '            <!-- 🔥 优惠价展示（和直付页完全一致） -->\n'
        '            <p style="color: gray; margin:0">\n'
        '              单价：¥{{ toFixedNumber(item.discount_price || item.book_price, 2) }} × {{ item.quantity }}\n'
        '              <span v-if="item.discount_price && item.discount_price !== item.book_price" \n'
        '                style="color: #999; text-decoration: line-through; margin-left: 8px; font-size: 12px;">\n'
        '                ¥{{ toFixedNumber(item.book_price, 2) }}\n'
        '              </span>\n'
        '            </p>'
    )
    new = (
        '            <p class="goods-name">{{ item.book_name }}</p>\n'
        '            <p class="goods-price">\n'
        '              单价：¥{{ toFixedNumber(item.discount_price || item.book_price, 2) }} × {{ item.quantity }}\n'
        '              <span\n'
        '                v-if="item.discount_price && item.discount_price !== item.book_price"\n'
        '                class="goods-price-origin"\n'
        '              >\n'
        '                ¥{{ toFixedNumber(item.book_price, 2) }}\n'
        '              </span>\n'
        '            </p>'
    )
    t = t.replace(old, new)
    t = t.replace(
        f'      </{d}>\n\n      <!-- 总计 -->\n      <{d} class="pay-total">\n        <span style="color: black">实付金额：</span>',
        f'        </{d}>\n      </section>\n\n      <!-- 总计 -->\n      <section class="pay-total section-card">\n        <span class="total-label">实付金额</span>',
    )
    t = t.replace(
        f'      </{d}>\n    </{d}>\n\n    <!-- 支付按钮 -->',
        f'      </section>\n    </{d}>\n\n    </main>\n\n    <!-- 支付按钮 -->',
    )
    if 'pay-footer-bar' not in t:
        old_btn = (
            '    <!-- 支付按钮 -->\n'
            '    <el-button\n'
            '      v-if="payList.length"\n'
            '      type="primary"\n'
            '      size="large"\n'
            '      @click="mockPay"\n'
            '      class="pay-btn"\n'
            '      :loading="payLoading"\n'
            '    >\n'
            '      确认支付 ¥{{ toFixedNumber(total, 2) }}\n'
            '    </el-button>'
        )
        new_btn = (
            f'    <{d} v-if="payList.length" class="pay-footer-bar">\n'
            '      <el-button\n'
            '        type="primary"\n'
            '        size="large"\n'
            '        @click="mockPay"\n'
            '        class="pay-btn"\n'
            '        :loading="payLoading"\n'
            '      >\n'
            '        确认支付 ¥{{ toFixedNumber(total, 2) }}\n'
            '      </el-button>\n'
            f'    </{d}>\n\n'
            '    <footer class="pay-footer">\n'
            '      <p>© 2026 星途科幻图书 · 安全支付</p>\n'
            '    </footer>'
        )
        t = t.replace(old_btn, new_btn)
    if 'pay-verify-dialog' not in t:
        t = t.replace(
            'title="支付安全验证"\n      width="480px"\n      :close-on-click-modal="false"',
            'title="支付安全验证"\n      width="480px"\n      class="pay-verify-dialog"\n      :close-on-click-modal="false"',
            1,
        )
    return t


def patch_direct(t):
    old_h = (
        f'    <{d} class="pay-header">\n'
        '      <h2 style="color: darkorange">确认支付</h2>\n'
        '      <el-button\n'
        '        style="padding: 5px"\n'
        '        @click="router.go(-1)"\n'
        '        type="link"\n'
        '        class="back-btn"\n'
        '        :unstable-disable-deprecated-warning="true"\n'
        '        >返回</el-button\n'
        '      >\n'
        f'    </{d}>\n\n'
        '    <!-- 加载中 -->'
    )
    new_h = (
        '    <header class="pay-header">\n'
        f'      <{d} class="header-inner">\n'
        '        <span class="back-btn" @click="router.go(-1)">← 返回</span>\n'
        '        <h1 class="header-title">确认支付</h1>\n'
        '        <span class="header-badge">立即购买</span>\n'
        f'      </{d}>\n'
        '    </header>\n\n'
        '    <main class="pay-main">\n\n'
        '    <!-- 加载中 -->'
    )
    t = t.replace(old_h, new_h)
    t = re.sub(
        rf'<{d} v-if="loading" class="loading-tip">.*?</{d}>',
        f'<{d} v-if="loading" class="loading-tip"><{d} class="loading-spinner"></{d}><p>正在加载支付信息…</p></{d}>',
        t,
        count=1,
        flags=re.DOTALL,
    )
    t = t.replace(
        f'<{d} v-else class="empty-tip">\n      <p>暂无待支付商品</p>',
        f'<{d} v-else class="empty-tip">\n      <{d} class="empty-icon">📖</{d}>\n      <p class="empty-text">暂无待支付商品</p>',
    )
    old_g = (
        f'      <{d} class="goods-item">\n'
        '        <img :src="payGoods.cover || \'/default-book.png\'" alt="图书封面" class="book-cover" />\n'
        f'        <{d} class="goods-info">\n'
        '          <h3 style="color: black">{{ payGoods.book_name || payGoods.name || \'未知图书\' }}</h3>\n'
        '          <p style="color: gray">规格：{{ payGoods.spec || \'平装版\' }}</p>\n'
        '          <!-- 优先显示优惠价，无优惠时显示原价 -->\n'
        '          <p style="color: gray">\n'
        '            单价：¥{{ toFixedNumber(payGoods.discount_price || payGoods.price, 2) }}\n'
        '            <span v-if="payGoods.discount_price && payGoods.discount_price !== payGoods.price" style="color: #999; text-decoration: line-through; margin-left: 8px; font-size: 12px;">\n'
        '              ¥{{ toFixedNumber(payGoods.price, 2) }}\n'
        '            </span>\n'
        '          </p>\n'
        '          <p style="color: gray">数量：{{ payGoods.count || 1 }}</p>\n'
        f'        </{d}>\n'
        f'      </{d}>'
    )
    new_g = (
        '      <section class="goods-item section-card">\n'
        '        <img :src="payGoods.cover || \'/default-book.png\'" alt="图书封面" class="book-cover" />\n'
        f'        <{d} class="goods-info">\n'
        '          <h3>{{ payGoods.book_name || payGoods.name || \'未知图书\' }}</h3>\n'
        '          <p class="goods-meta">规格：{{ payGoods.spec || \'平装版\' }}</p>\n'
        '          <p class="goods-price-line">\n'
        '            单价：¥{{ toFixedNumber(payGoods.discount_price || payGoods.price, 2) }}\n'
        '            <span\n'
        '              v-if="payGoods.discount_price && payGoods.discount_price !== payGoods.price"\n'
        '              class="goods-price-origin"\n'
        '            >\n'
        '              ¥{{ toFixedNumber(payGoods.price, 2) }}\n'
        '            </span>\n'
        '          </p>\n'
        '          <p class="goods-meta">数量：{{ payGoods.count || 1 }}</p>\n'
        f'        </{d}>\n'
        '      </section>'
    )
    t = t.replace(old_g, new_g)
    t = t.replace(
        f'      <{d} class="address-section">\n'
        '        <h3 style="margin-bottom: 15px; color: #333; font-size: 16px">配送至</h3>',
        '      <section class="address-section section-card">\n        <h3 class="block-title">配送至</h3>',
    )
    t = t.replace(f'        </el-form>\n      </{d}>\n\n      <!-- 总计 -->', '        </el-form>\n      </section>\n\n      <!-- 总计 -->')
    t = t.replace(
        f'      <{d} class="pay-total">\n'
        '        <span style="color: black">支付金额：</span>\n'
        '        <span class="total-price">¥{{ toFixedNumber(totalAmount, 2) }}</span>\n'
        f'      </{d}>',
        '      <section class="pay-total">\n'
        '        <span class="total-label">支付金额</span>\n'
        '        <span class="total-price">¥{{ toFixedNumber(totalAmount, 2) }}</span>\n'
        '      </section>',
    )
    t = t.replace(
        f'      </{d}>\n    </{d}>\n\n    <!-- 无商品 -->',
        f'      </{d}>\n    </main>\n\n    <!-- 无商品 -->',
        1,
    )
    if 'pay-verify-dialog' not in t:
        t = t.replace(
            '  width="480px"\n  :close-on-click-modal="false"',
            '  width="480px"\n  class="pay-verify-dialog"\n  :close-on-click-modal="false"',
            1,
        )
    if 'pay-footer' not in t:
        t = t.replace(
            '</el-dialog>\n  </div>\n</template>',
            '</el-dialog>\n\n    <footer class="pay-footer">\n      <p>© 2026 星途科幻图书 · 安全支付</p>\n    </footer>\n  </div>\n</template>',
        )
    return t


if __name__ == '__main__':
    idx = apply_css(patch_index(INDEX.read_text(encoding='utf-8')), INDEX_CSS)
    INDEX.write_text(idx, encoding='utf-8')
    print('index ok')
    dr = apply_css(patch_direct(DIRECT.read_text(encoding='utf-8')), DIRECT_CSS)
    DIRECT.write_text(dr, encoding='utf-8')
    print('direct ok')
