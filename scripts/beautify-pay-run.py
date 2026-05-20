# -*- coding: utf-8 -*-
import re
from pathlib import Path

D = 'div'
INDEX = Path(r'd:\vue-k3\vue_k2\src\views\front\pay\index.vue')
DIRECT = Path(r'd:\vue-k3\vue_k2\src\views\front\pay\direct.vue')

INDEX_CSS = Path(__file__).with_name('pay-index.css').read_text(encoding='utf-8') if Path(__file__).with_name('pay-index.css').exists() else ''

def strip_styles(text):
    return re.sub(r'<style scoped>.*?</style>\s*', '', text, flags=re.DOTALL)


def patch_index(t):
    t = re.sub(
        r'<div v-if="loading" class="loading-tip">.*?</div>',
        f'<div v-if="loading" class="loading-tip">\n      <{D} class="loading-spinner"></{D}>\n      <p>正在加载订单信息…</p>\n    </{D}>',
        t,
        count=1,
        flags=re.DOTALL,
    )
    t = t.replace(
        f'        </el-form>\n      </{D}>\n\n      <!-- 2. 商品列表 -->\n      <{D} class="goods-list">',
        f'        </el-form>\n      </section>\n\n      <!-- 2. 商品列表 -->\n      <section class="goods-section section-card">\n        <h3 class="block-title">商品清单</h3>\n        <{D} class="goods-list">',
    )
    old = """            <p style="color: black; font-weight: 500; margin:0">{{ item.book_name }}</p>
            <!-- 🔥 优惠价展示（和直付页完全一致） -->
            <p style="color: gray; margin:0">
              单价：¥{{ toFixedNumber(item.discount_price || item.book_price, 2) }} × {{ item.quantity }}
              <span v-if="item.discount_price && item.discount_price !== item.book_price" 
                style="color: #999; text-decoration: line-through; margin-left: 8px; font-size: 12px;">
                ¥{{ toFixedNumber(item.book_price, 2) }}
              </span>
            </p>"""
    new = """            <p class="goods-name">{{ item.book_name }}</p>
            <p class="goods-price">
              单价：¥{{ toFixedNumber(item.discount_price || item.book_price, 2) }} × {{ item.quantity }}
              <span
                v-if="item.discount_price && item.discount_price !== item.book_price"
                class="goods-price-origin"
              >
                ¥{{ toFixedNumber(item.book_price, 2) }}
              </span>
            </p>"""
    t = t.replace(old, new)
    t = t.replace(
        f'      </{D}>\n\n      <!-- 总计 -->\n      <{D} class="pay-total">\n        <span style="color: black">实付金额：</span>',
        f'        </{D}>\n      </section>\n\n      <!-- 总计 -->\n      <section class="pay-total section-card">\n        <span class="total-label">实付金额</span>',
    )
    t = t.replace(
        f'      </{D}>\n    </{D}>\n\n    <!-- 支付按钮 -->',
        f'      </section>\n    </{D}>\n\n    </main>\n\n    <!-- 支付按钮 -->',
    )
    if 'pay-footer-bar' not in t:
        t = t.replace(
            """    <!-- 支付按钮 -->
    <el-button
      v-if="payList.length"
      type="primary"
      size="large"
      @click="mockPay"
      class="pay-btn"
      :loading="payLoading"
    >
      确认支付 ¥{{ toFixedNumber(total, 2) }}
    </el-button>""",
            f"""    <{D} v-if="payList.length" class="pay-footer-bar">
      <el-button
        type="primary"
        size="large"
        @click="mockPay"
        class="pay-btn"
        :loading="payLoading"
      >
        确认支付 ¥{{{{ toFixedNumber(total, 2) }}}}
      </el-button>
    </{D}>

    <footer class="pay-footer">
      <p>© 2026 星途科幻图书 · 安全支付</p>
    </footer>""".replace('{{{{', '{{').replace('}}}}', '}}'),
        )
    if 'pay-verify-dialog' not in t:
        t = t.replace(
            'width="480px"\n      :close-on-click-modal="false"',
            'width="480px"\n      class="pay-verify-dialog"\n      :close-on-click-modal="false"',
            1,
        )
    return t


def patch_direct(t):
    old_h = """    <motion class="pay-header">
      <h2 style="color: darkorange">确认支付</h2>
      <el-button
        style="padding: 5px"
        @click="router.go(-1)"
        type="link"
        class="back-btn"
        :unstable-disable-deprecated-warning="true"
        >返回</el-button
      >
    </motion>""".replace('motion', D)
    new_h = """    <header class="pay-header">
      <motion class="header-inner">
        <span class="back-btn" @click="router.go(-1)">← 返回</span>
        <h1 class="header-title">确认支付</h1>
        <span class="header-badge">立即购买</span>
      </motion>
    </header>

    <main class="pay-main">""".replace('motion', D)
    t = t.replace(old_h, new_h)
    t = re.sub(
        r'<div v-if="loading" class="loading-tip">.*?</motion>',
        f'<div v-if="loading" class="loading-tip"><{D} class="loading-spinner"></{D}><p>正在加载支付信息…</p></{D}>',
        t,
        count=1,
        flags=re.DOTALL,
    ).replace('</motion>', f'</{D}>')
    t = t.replace(
        f'<{D} v-else class="empty-tip">\n      <p>暂无待支付商品</p>',
        f'<{D} v-else class="empty-tip">\n      <{D} class="empty-icon">📖</{D}>\n      <p class="empty-text">暂无待支付商品</p>',
    )
    old_g = f"""      <{D} class="goods-item">
        <img :src="payGoods.cover || '/default-book.png'" alt="图书封面" class="book-cover" />
        <{D} class="goods-info">
          <h3 style="color: black">{{{{ payGoods.book_name || payGoods.name || '未知图书' }}}}</h3>
          <p style="color: gray">规格：{{{{ payGoods.spec || '平装版' }}}}</p>
          <!-- 优先显示优惠价，无优惠时显示原价 -->
          <p style="color: gray">
            单价：¥{{{{ toFixedNumber(payGoods.discount_price || payGoods.price, 2) }}}}
            <span v-if="payGoods.discount_price && payGoods.discount_price !== payGoods.price" style="color: #999; text-decoration: line-through; margin-left: 8px; font-size: 12px;">
              ¥{{{{ toFixedNumber(payGoods.price, 2) }}}}
            </span>
          </p>
          <p style="color: gray">数量：{{{{ payGoods.count || 1 }}}}</p>
        </{D}>
      </{D}>""".replace('{{{{', '{{').replace('}}}}', '}}')
    new_g = f"""      <section class="goods-item section-card">
        <img :src="payGoods.cover || '/default-book.png'" alt="图书封面" class="book-cover" />
        <{D} class="goods-info">
          <h3>{{{{ payGoods.book_name || payGoods.name || '未知图书' }}}}</h3>
          <p class="goods-meta">规格：{{{{ payGoods.spec || '平装版' }}}}</p>
          <p class="goods-price-line">
            单价：¥{{{{ toFixedNumber(payGoods.discount_price || payGoods.price, 2) }}}}
            <span
              v-if="payGoods.discount_price && payGoods.discount_price !== payGoods.price"
              class="goods-price-origin"
            >
              ¥{{{{ toFixedNumber(payGoods.price, 2) }}}}
            </span>
          </p>
          <p class="goods-meta">数量：{{{{ payGoods.count || 1 }}}}</p>
        </{D}>
      </section>""".replace('{{{{', '{{').replace('}}}}', '}}')
    t = t.replace(old_g, new_g)
    t = t.replace(
        f"""      <{D} class="address-section">
        <h3 style="margin-bottom: 15px; color: #333; font-size: 16px">配送至</h3>""",
        """      <section class="address-section section-card">
        <h3 class="block-title">配送至</h3>""",
    )
    t = t.replace(f'        </el-form>\n      </{D}>\n\n      <!-- 总计 -->', '        </el-form>\n      </section>\n\n      <!-- 总计 -->')
    t = t.replace(
        f"""      <{D} class="pay-total">
        <span style="color: black">支付金额：</span>
        <span class="total-price">¥{{{{ toFixedNumber(totalAmount, 2) }}}}</span>
      </{D}>""".replace('{{{{', '{{').replace('}}}}', '}}'),
        """      <section class="pay-total">
        <span class="total-label">支付金额</span>
        <span class="total-price">¥{{ toFixedNumber(totalAmount, 2) }}</span>
      </section>""",
    )
    t = t.replace(
        f'      </{D}>\n    </{D}>\n\n    <!-- 无商品 -->',
        f'      </{D}>\n    </main>\n\n    <!-- 无商品 -->',
        1,
    )
    if 'pay-footer' not in t:
        t = t.replace(
            '  :close-on-click-modal="false"\n>',
            '  class="pay-verify-dialog"\n  :close-on-click-modal="false"\n>',
            1,
        )
        t = t.replace(
            '</el-dialog>\n  </div>\n</template>',
            '</el-dialog>\n\n    <footer class="pay-footer">\n      <p>© 2026 星途科幻图书 · 安全支付</p>\n    </footer>\n  </motion>\n</template>'.replace('motion', D),
        )
    return t


# Write CSS files
Path(__file__).with_name('pay-index.css').write_text(INDEX_CSS or open(__file__).read().split("INDEX_CSS_INLINE = '''")[1].split("'''")[0] if "INDEX_CSS_INLINE" in open(__file__).read() else '', encoding='utf-8')
