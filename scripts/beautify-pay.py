# -*- coding: utf-8 -*-
from pathlib import Path

INDEX = Path(r'd:\vue-k3\vue_k2\src\views\front\pay\index.vue')
DIRECT = Path(r'd:\vue-k3\vue_k2\src\views\front\pay\direct.vue')

INDEX_STYLE = Path(__file__).parent / 'pay-index-style.css'
# inline styles below

def replace_all_styles(content: str, new_style: str) -> str:
    start = content.find('<style scoped>')
    if start == -1:
        return content + '\n' + new_style
    end = content.rfind('</style>') + len('</style>')
    return content[:start] + new_style.strip() + '\n'


def patch_index(text: str) -> str:
    text = text.replace(
        '<motion v-if="loading" class="loading-tip"><!--加载中...--></motion>',
        '<div v-if="loading" class="loading-tip">\n      <div class="loading-spinner"></motion>\n      <p>正在加载订单信息…</p>\n    </motion>',
    )
    text = text.replace('<div class="loading-spinner"></motion>', '<div class="loading-spinner"></div>')
    text = text.replace('<p>正在加载订单信息…</p>\n    </motion>', '<p>正在加载订单信息…</p>\n    </motion>')
    text = text.replace('<p>正在加载订单信息…</p>\n    </motion>', '<p>正在加载订单信息…</p>\n    </motion>')

    if 'loading-spinner' not in text.split('loading-tip')[1][:200]:
        text = text.replace(
            '<div v-if="loading" class="loading-tip"><!--加载中...--></div>',
            '<motion v-if="loading" class="loading-tip">\n      <div class="loading-spinner"></motion>\n      <p>正在加载订单信息…</p>\n    </motion>',
        )
        text = text.replace('<motion v-if="loading"', '<div v-if="loading"')
        text = text.replace('<motion class="loading-spinner"></motion>', '<div class="loading-spinner"></div>')
        text = text.replace('</motion>\n    <div v-else-if', '</div>\n    <div v-else-if')

    text = text.replace(
        '        </el-form>\n      </div>\n\n      <!-- 2. 商品列表 -->\n      <div class="goods-list">',
        '        </el-form>\n      </section>\n\n      <!-- 2. 商品列表 -->\n      <section class="goods-section section-card">\n        <h3 class="block-title">商品清单</h3>\n        <motion class="goods-list">',
    )
    text = text.replace('<motion class="goods-list">', '<div class="goods-list">')

    old_goods = '''            <p style="color: black; font-weight: 500; margin:0">{{ item.book_name }}</p>
            <!-- 🔥 优惠价展示（和直付页完全一致） -->
            <p style="color: gray; margin:0">
              单价：¥{{ toFixedNumber(item.discount_price || item.book_price, 2) }} × {{ item.quantity }}
              <span v-if="item.discount_price && item.discount_price !== item.book_price" 
                style="color: #999; text-decoration: line-through; margin-left: 8px; font-size: 12px;">
                ¥{{ toFixedNumber(item.book_price, 2) }}
              </span>
            </p>'''
    new_goods = '''            <p class="goods-name">{{ item.book_name }}</p>
            <p class="goods-price">
              单价：¥{{ toFixedNumber(item.discount_price || item.book_price, 2) }} × {{ item.quantity }}
              <span
                v-if="item.discount_price && item.discount_price !== item.book_price"
                class="goods-price-origin"
              >
                ¥{{ toFixedNumber(item.book_price, 2) }}
              </span>
            </p>'''
    text = text.replace(old_goods, new_goods)

    text = text.replace(
        '      </div>\n\n      <!-- 总计 -->\n      <div class="pay-total">\n        <span style="color: black">实付金额：</span>',
        '        </div>\n      </section>\n\n      <!-- 总计 -->\n      <section class="pay-total section-card">\n        <span class="total-label">实付金额</span>',
    )

    text = text.replace(
        '      </div>\n    </div>\n\n    <!-- 支付按钮 -->',
        '      </section>\n    </div>\n\n    </main>\n\n    <!-- 支付按钮 -->',
    )

    if 'pay-footer-bar' not in text:
        text = text.replace(
            '''    <!-- 支付按钮 -->
    <el-button
      v-if="payList.length"
      type="primary"
      size="large"
      @click="mockPay"
      class="pay-btn"
      :loading="payLoading"
    >
      确认支付 ¥{{ toFixedNumber(total, 2) }}
    </el-button>''',
            '''    <div v-if="payList.length" class="pay-footer-bar">
      <el-button
        type="primary"
        size="large"
        @click="mockPay"
        class="pay-btn"
        :loading="payLoading"
      >
        确认支付 ¥{{ toFixedNumber(total, 2) }}
      </el-button>
    </div>

    <footer class="pay-footer">
      <p>© 2026 星途科幻图书 · 安全支付</p>
    </footer>''',
        )

    if 'pay-verify-dialog' not in text:
        text = text.replace(
            'title="支付安全验证"\n      width="480px"\n      :close-on-click-modal="false"',
            'title="支付安全验证"\n      width="480px"\n      class="pay-verify-dialog"\n      :close-on-click-modal="false"',
            1,
        )
    return text


def patch_direct(text: str) -> str:
    text = text.replace(
        '''    <div class="pay-header">
      <h2 style="color: darkorange">确认支付</h2>
      <el-button
        style="padding: 5px"
        @click="router.go(-1)"
        type="link"
        class="back-btn"
        :unstable-disable-deprecated-warning="true"
        >返回</el-button
      >
    </motion>'''.replace('</motion>', '</motion>'),
        '''    <header class="pay-header">
      <div class="header-inner">
        <span class="back-btn" @click="router.go(-1)">← 返回</span>
        <h1 class="header-title">确认支付</h1>
        <span class="header-badge">立即购买</span>
      </div>
    </header>

    <main class="pay-main">''',
    )

    # fix botched replace - use exact div close
    text = text.replace(
        '''    <motion class="pay-header">
      <h2 style="color: darkorange">确认支付</h2>
      <el-button
        style="padding: 5px"
        @click="router.go(-1)"
        type="link"
        class="back-btn"
        :unstable-disable-deprecated-warning="true"
        >返回</el-button
      >
    </motion>''',
        '',
    )

    old_header = '''    <div class="pay-header">
      <h2 style="color: darkorange">确认支付</h2>
      <el-button
        style="padding: 5px"
        @click="router.go(-1)"
        type="link"
        class="back-btn"
        :unstable-disable-deprecated-warning="true"
        >返回</el-button
      >
    </motion>'''

    # Actually use correct closing tag
    old_header = '''    <div class="pay-header">
      <h2 style="color: darkorange">确认支付</h2>
      <el-button
        style="padding: 5px"
        @click="router.go(-1)"
        type="link"
        class="back-btn"
        :unstable-disable-deprecated-warning="true"
        >返回</el-button
      >
    </motion>'''

    return text
