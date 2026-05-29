<template>
  <div class="page-container">
    <div class="topse">
      <el-button
        class="gwy"
        type="primary"
        @click="$router.push('/home')"
        :unstable-disable-deprecated-warning="true"
        >返回首页</el-button
      >
      <el-button
        class="zise"
        style="position: absolute; font-size: 17px; margin-left: 120px; top: 5px;z-index:10 "
        link
        @click="go('/cart')"
        ><img
          class="gwdh"
          style="width: 24px; height: auto; margin-right: 3px"
          src="/img/购物车.png"
        />购物车</el-button
      >
      <el-button
        class="zise1"
        style="position: absolute; font-size: 17px; margin-left: 250px; top: 5px;z-index:10 "
        link
        @click="go('/shoucang')"
        ><img
          class="gwdh1"
          style="width: 24px; height: auto; margin-right: 3px"
          src="/public/img/收藏夹.png"
        />收藏夹</el-button
      >
      <el-button
        class="zise2"
        style="position: absolute; font-size: 17px; margin-left: 250px; top: 5px;z-index:10 "
        link
        @click="go('/shop')"
        ><img
          class="gwdh1"
          style="width: 24px; height: auto; margin-right: 3px"
          src="/public/img/shop.png"
        />关注的店铺</el-button
      >
    </div>

    <div style="margin-top: 80px">
      <h2 class="sci-fi-title">个人中心</h2>

      <div v-if="userStore.isLogin">
        <el-card class="user-info-card" shadow="hover" :unstable-disable-deprecated-warning="true">
          <template #header>
            <span class="card-title">用户信息</span>
            <el-button
              style="padding-left: 10px; padding-right: 10px; margin-left: 50px"
              type="danger"
              @click="handleLogout"
              :unstable-disable-deprecated-warning="true"
              >退出登录</el-button
            >
          </template>

          <!-- 头像区域 -->
          <div style="display: flex; align-items: center; margin-bottom: 20px;">
            <div class="avatar-wrapper" style="position: relative; margin-right: 20px;">
              <el-avatar :src="currentAvatar" size="80" />
              <div class="avatar-upload-btn" @click="openAvatarDialog">
                <el-icon><Plus /></el-icon>
              </div>
            </div>
            <div>
              <h2 style="margin:0">{{ userStore.user?.username || '未知用户' }}</h2>
            </div>
          </div>

          <div class="user-info-content">
            <div v-if="!userStore.user?.phone || userStore.user?.phone.trim() === ''">
              <h3>绑定手机号</h3>
              <el-input
                v-model="phone"
                placeholder="请输入手机号"
                style="width: 300px"
                maxlength="11"
              />
              <el-button type="primary" @click="handleBind" style="margin-left: 10px">
                确认绑定
              </el-button>
            </div>
            <div v-else class="phone-binded">
              <h3>绑定手机号</h3>
              <p style="font-size: 16px; margin: 10px 0">
                已绑定：<strong style="color: #409eff">{{ userStore.user.phone }}</strong>
              </p>
            </div>

           
            <p>
              <strong>用户角色：</strong>
              <el-tag :type="userStore.userRole === 'admin' ? 'danger' : 'primary'">
                {{
                  userStore.userRole === 'admin'
                    ? '管理员'
                    : userStore.userRole === 'seller'
                      ? '卖家'
                      : '买家'
                }}
              </el-tag>
            </p>
            <div class="address-section" style="margin: 25px 0">
  <h3>收货地址</h3>
  <div v-if="defaultAddress" class="address-info">
    <p style="font-size: 16px; margin: 10px 0; line-height: 1.6">
      默认地址：<strong style="color: #409eff">
        {{ formatAddress(defaultAddress.province, defaultAddress.city, defaultAddress.district) }}
        <br />
        {{ defaultAddress.detail_address }}
      </strong>
    </p>
  </div>
  <p v-else style="font-size: 16px; margin: 10px 0; color: #999">
    暂无默认收货地址
  </p>
  <el-button class="yz1" type="primary" @click="goToAddress">
    管理收货地址
  </el-button>
</div>
            <p>
              <strong>注册时间：</strong>
              {{ formatTime(userStore.user?.create_time) || '暂无记录' }}
            </p>
          </div>

          <template #footer>
            <el-button
              style="margin-right: 30px; padding-left: 10px; padding-right: 10px"
              type="primary"
              @click="openEditDialog"
              >修改账密</el-button
            >
            <el-button
              style="
                position: relative;
                padding-top: 10px;
                padding-bottom: 10px;
                height: 30px;
                margin-right: 34px;
              "
              class="yz1"
              type="primary"
              size="small"
              @click="handleEditPhone"
            >
              修改绑定手机号
            </el-button>

            <div style="margin-top: 30px; font-weight: 600">
              <span>
                <strong>个人签名</strong><br />
                <hr style="margin-top: 25px" />
                <br /><span class="qmhh" style="font-size: 13px">{{
                  userStore.user?.sign || '暂无签名'
                }}</span>
              </span>
              <div style="margin-top: 20px; margin-bottom: 20px; margin-left: -9px">
                <el-button class="yz1" type="primary" @click="updetaqm" style="margin-left: 9px">{{
                  km ? '保存签名' : '设置签名'
                }}</el-button>
                <el-button
                  v-show="km === true"
                  type="primary"
                  @click="quxiqm"
                  
                  style="margin-left: 43px; white-space: nowrap"
                  class="yz1"
                >
                  取消修改
                </el-button>
                <br />
                <el-input
                  v-show="km === true"
                  v-model="inputtext"
                  type="textarea"
                  :rows="8"
                  class="sign-input"
                  style="
                    width: 330px;
                    text-align: left;
                    margin-top: 15px;
                    border: 1px solid #000000;
                    border-radius: 15px;
                  "
                  placeholder="请输入个人签名"
                />
              </div>
            </div>
          </template>
        </el-card>

        <!-- 修改头像弹窗 -->
        <el-dialog v-model="showAvatarDialog" title="修改头像" width="500px">
          <el-upload
            class="avatar-uploader"
            :http-request="customUpload"
            :show-file-list="false"
            :before-upload="beforeAvatarUpload"
          >
            <el-avatar
              v-if="previewAvatar"
              :src="previewAvatar"
              size="120"
              class="preview-avatar"
            />
            <el-icon v-else class="upload-icon"><Plus /></el-icon>
          </el-upload>
          <div style="margin-top: 15px; text-align: center; color: #909399; font-size: 13px;">
            支持 jpg/png/webp 格式，大小不超过 2MB
          </div>
          <template #footer>
            <el-button @click="showAvatarDialog = false">取消</el-button>
          </template>
        </el-dialog>

       <!-- 修改账密弹窗 -->
<el-dialog
  v-model="showEditDialog"
  title="修改用户名/密码"
  width="550px"
  style="padding: 20px !important"
  :close-on-click-modal="false"
>
  <!-- 身份验证区域 -->
  <el-form
    ref="editPwdVerifyFormRef"
    :model="editPwdVerifyForm"
    :rules="editPwdVerifyRules"
    label-width="110px"
    v-if="!isPassEdit"
    class="verify-section"
  >
    <h3 style="margin-bottom:15px;">身份验证（验证通过后才能修改）</h3>
    <el-radio-group v-model="verifyTypeEdit" style="margin-bottom:15px;">
      <el-radio label="当前密码验证" value="password" />
      <el-radio label="原绑定手机号验证" value="phone" />
    </el-radio-group>

    <!-- 密码验证 -->
    <el-form-item v-if="verifyTypeEdit === 'password'" label="当前密码" prop="oldPwd">
      <el-input
        v-model="editPwdVerifyForm.oldPwd"
        type="password"
        show-password
        placeholder="请输入当前登录密码"
      />
    </el-form-item>

    <!-- 手机号验证 -->
    <template v-else>
      <el-form-item label="绑定手机号 ">
        <el-input style="margin-left: 2.8px !important;" v-model="originalPhone" disabled placeholder="当前账号已绑定手机号" />
      </el-form-item>
      <el-form-item class="yz" label="短信验证码" prop="smsCode">
        <div class="code-box">
          <el-input v-model="editPwdVerifyForm.smsCode" placeholder="6位验证码" maxlength="6" />
          <el-button class="yz1" type="primary" @click="sendEditPwdSms" :disabled="smsCountdownEdit > 0">
            {{ smsCountdownEdit > 0 ? `${smsCountdownEdit}秒后重发` : '发送验证码' }}
          </el-button>
        </div>
      </el-form-item>
    </template>

    <!-- 图片验证码 -->
    <el-form-item label="安全验证" prop="captcha">
      <div class="captcha-row">
        <el-input v-model="editPwdVerifyForm.captcha" placeholder="验证码" maxlength="4" style="flex:1" />
        <div class="captcha-img" @click="refreshCaptchaEdit">{{ captchaCodeEdit }}</div>
      </div>
    </el-form-item>

    <el-button class="yz1" style="margin-top: 10px;" type="success" @click="checkIdentityEdit">✅ 验证身份</el-button>
    <span v-if="isPassEdit" style="color:#67c230;margin-left:12px">身份验证已通过</span>
  </el-form>

  <!-- 修改表单（验证通过才显示） -->
  <el-form
    ref="editFormRef"
    :model="editForm"
    :rules="editRules"
    label-width="100px"
    v-if="isPassEdit"
  >
    <el-form-item style="margin-bottom: 20px" label="用户名/账号" prop="username">
      <el-input
        v-model="editForm.username"
        maxlength="13"
        placeholder="不修改请保持原样"
        clearable
      />
    </el-form-item>
    <el-form-item style="margin-bottom: 20px" label="新密码" prop="password">
      <el-input
        v-model="editForm.password"
        type="password"
        placeholder="不修改请留空"
        show-password
        maxlength="13"
      />
    </el-form-item>
    <el-form-item label="确认密码" prop="confirmPwd">
      <el-input
        v-model="editForm.confirmPwd"
        type="password"
        placeholder="再次输入新密码"
        show-password
        maxlength="13"
      />
    </el-form-item>
  </el-form>

  <template #footer>
    <el-button class="yz1" @click="closeEditDialog">取消</el-button>
    <el-button
      class="yz"
      type="primary"
      @click="submitEdit"
      :disabled="!isPassEdit"
    >确认修改</el-button>
  </template>
</el-dialog>
        <!-- 修改手机号弹窗 -->
        <el-dialog
          v-model="showEditPhoneDialog"
          title="修改绑定手机号"
          width="550px"
          :close-on-click-modal="false"
          @close="resetPhoneDialog"
        >
          <el-form
            ref="editPhoneFormRef"
            :model="editPhoneForm"
            label-width="110px"
            :rules="editPhoneRules"
          >
            <el-form-item label="身份验证方式">
              <el-radio-group v-model="verifyType">
                <el-radio label="原绑定手机号验证" value="phone" />
                <el-radio label="当前账号密码验证" value="password" />
              </el-radio-group>
            </el-form-item>

            <template v-if="verifyType === 'phone'">
              <el-form-item label="原绑定手机号">
                <el-input v-model="originalPhone" disabled placeholder="当前账号已绑定手机号" />
              </el-form-item>
              <el-form-item class="yz" label="原手机验证码" prop="oldSmsCode">
                <div class="code-box">
                  <el-input
                    v-model="editPhoneForm.oldSmsCode"
                    placeholder="请输入6位验证码"
                    maxlength="6"
                  />
                  <el-button type="primary" @click="sendOldPhoneSms" :disabled="smsCountdown > 0">
                    {{ smsCountdown > 0 ? `${smsCountdown}秒后重发` : '发送验证码' }}
                  </el-button>
                </div>
              </el-form-item>
            </template>

            <el-form-item v-if="verifyType === 'password'" label="当前账号密码" prop="oldPwd">
              <el-input
                v-model="editPhoneForm.oldPwd"
                type="password"
                placeholder="输入登录密码"
                show-password
              />
            </el-form-item>

            <!-- 图片验证码 -->
            <el-form-item label="安全验证" prop="captcha">
              <div class="captcha-row">
                <el-input
                  v-model="editPhoneForm.captcha"
                  placeholder="请输入图片验证码"
                  maxlength="4"
                  style="flex: 1"
                />
                <div style="color: #000" class="captcha-img" @click="refreshCaptcha">
                  {{ captchaCode }}
                </div>
              </div>
            </el-form-item>

            <el-form-item>
              <el-button class="yz" type="success" @click="checkIdentity">验证身份</el-button>
              <span v-if="isPass" style="color: #67c230; margin-left: 12px">✅ 身份验证已通过</span>
            </el-form-item>

            <el-divider />

            <el-form-item label="新手机号" prop="newPhone">
              <el-input
                v-model="editPhoneForm.newPhone"
                placeholder="请输入新手机号"
                maxlength="11"
                :disabled="!isPass"
              />
            </el-form-item>
          </el-form>
          <template #footer>
            <el-button class="yz" @click="showEditPhoneDialog = false">取消</el-button>
            <el-button class="yz" type="primary" @click="confirmEditPhone" :disabled="!isPass"
              >确认修改</el-button
            >
          </template>
        </el-dialog>

        <!-- 订单 -->
        <div class="order-section">
          <h3 class="sci-fi-subtitle">我的订单</h3>
          <el-button type="link" @click="getOrderList" class="refresh-btn">刷新订单</el-button>
          <el-table :data="orderList" border stripe v-loading="loading">
            <el-table-column prop="orderNo" label="订单编号" width="220" />
            <el-table-column label="图书封面" width="100">
              <template #default="scope">
                <img
                  :src="scope.row.bookCover || '/default-book.png'"
                  class="order-book-cover"
                  style="cursor: pointer"
                  @click="$router.push(`/order/${scope.row.orderNo}`)"
                />
              </template>
            </el-table-column>
            <el-table-column prop="bookName" label="图书名称" min-width="200" />
            <el-table-column prop="count" label="购买数量" width="100" />
           <el-table-column prop="totalPrice" label="订单总价" width="120">
  <template #default="scope">¥{{ Number(scope.row.totalPrice).toFixed(2) }}</template>
</el-table-column>
            <el-table-column label="支付时间" width="200">
              <template #default="scope">{{ formatTime(scope.row.createTime) }}</template>
            </el-table-column>
            <el-table-column prop="status" label="订单状态" width="120">
              <template #default="scope">
                <el-tag :type="getStatusTagType(scope.row.status)">{{ scope.row.status }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column label="操作" width="180" align="center">
  <template #default="scope">
    <div style="display: flex; align-items: center; justify-content: center; gap: 8px; color: #000;">
      <!-- 1. 确认收货：仅【待收货】状态显示 -->
      <el-button
        v-if="scope.row.status === '待收货'"
        type="primary"
        icon="el-icon-check"
        size="small"
        class="qb"
         style="padding-right: 10px;margin-left: -6px;"
        @click="handleConfirmReceive(scope.row.orderNo)"
      >确认收货</el-button>

      <!-- 2. 退货退款：仅【待收货/已发货】状态显示 -->
      <el-button
        v-if="['待收货', '已发货'].includes(scope.row.status)"
        type="danger"
        icon="el-icon-refresh-left"
        size="small"
         class="tb"
        style="padding-right: 10px;margin-left: 6px;"
        @click="handleRefundOrder(scope.row.orderNo)"
      >退货退款</el-button>

      <!-- 3. 删除订单：仅【已取消】状态显示 -->
      <el-button
        v-if="['已取消', '已完成', '已收货'].includes(scope.row.status)"
        type="danger"
        icon="el-icon-delete"
        size="small"
         style="padding-right: 10px;margin-left: 6px;"
        @click="handleRemoveOrder(scope.row.orderNo)"
      >删除订单</el-button>
    </div>
  </template>
</el-table-column>
          </el-table>
          <div v-if="!loading && orderList.length === 0" class="empty-order">
            <p>暂无订单记录~</p>
            <el-button type="primary" @click="$router.push('/home')">去首页逛逛</el-button>
          </div>
        </div>
      </div>

      <div v-else class="no-login-tip">
        <h3>请先登录</h3>
        <el-button type="primary" @click="$router.push('/login')">立即登录</el-button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onActivated, reactive, onUnmounted, computed } from 'vue'
import { ElMessage, ElMessageBox, FormInstance, FormRules } from 'element-plus'
import { Plus } from '@element-plus/icons-vue'
import { useUserStore } from '@/store/modules/user'
import { useRouter } from 'vue-router'
import { deleteOrder, getUserOrderList, updateOrderStatus } from '@/api/front/order'
import {
  bindPhone,
  sendSmsCode,
  verifyPaySmsCode,
  updateUserInfoApi,
  getSign,
  updasign,
  uploadAvatar,
} from '@/api/front/user'
import dayjs from 'dayjs'
import type { RouteLocationAsPathGeneric, RouteLocationAsRelativeGeneric } from 'vue-router'
import { getDefaultAddress } from '@/api/front/address' 
const userStore = useUserStore()
const router = useRouter()
const phone = ref('')
const regionOptions = [
  {
    value: '110000',
    label: '北京市',
    children: [
      {
        value: '110000',
        label: '北京市',
        children: [
          { value: '110101', label: '东城区' },
          { value: '110102', label: '西城区' },
          { value: '110105', label: '朝阳区' },
          { value: '110106', label: '丰台区' },
          { value: '110107', label: '石景山区' },
          { value: '110108', label: '海淀区' },
          { value: '110109', label: '门头沟区' },
          { value: '110111', label: '房山区' },
          { value: '110112', label: '通州区' },
          { value: '110113', label: '顺义区' },
          { value: '110114', label: '昌平区' },
          { value: '110115', label: '大兴区' },
          { value: '110116', label: '怀柔区' },
          { value: '110117', label: '平谷区' },
          { value: '110118', label: '密云区' },
          { value: '110119', label: '延庆区' },
        ],
      },
    ],
  },
  {
    value: '130000',
    label: '河北省',
    children: [
      {
        value: '130500',
        label: '邢台市',
        children: [
          { value: '130502', label: '襄都区' },
          { value: '130503', label: '信都区' },
          { value: '130504', label: '任泽区' },
          { value: '130505', label: '南和区' },
          { value: '130521', label: '临城县' },
          { value: '130522', label: '内丘县' },
          { value: '130523', label: '柏乡县' },
          { value: '130524', label: '隆尧县' },
          { value: '130525', label: '任县' },
          { value: '130526', label: '南和县' },
          { value: '130527', label: '宁晋县' },
          { value: '130528', label: '巨鹿县' },
          { value: '130529', label: '新河县' },
          { value: '130530', label: '广宗县' },
          { value: '130531', label: '平乡县' },
          { value: '130532', label: '威县' },
          { value: '130533', label: '清河县' },
          { value: '130534', label: '临西县' },
          { value: '130581', label: '南宫市' },
          { value: '130582', label: '沙河市' },
        ],
      },
      {
        value: '130100',
        label: '石家庄市',
        children: [
          { value: '130102', label: '长安区' },
          { value: '130104', label: '桥西区' },
          { value: '130105', label: '新华区' },
          { value: '130107', label: '井陉矿区' },
          { value: '130108', label: '裕华区' },
          { value: '130109', label: '藁城区' },
          { value: '130110', label: '鹿泉区' },
          { value: '130111', label: '栾城区' },
        ],
      },
      {
        value: '130600',
        label: '保定市',
        children: [
          { value: '130602', label: '竞秀区' },
          { value: '130606', label: '莲池区' },
          { value: '130607', label: '满城区' },
          { value: '130608', label: '清苑区' },
          { value: '130609', label: '徐水区' },
          { value: '130623', label: '涞水县' },
          { value: '130624', label: '阜平县' },
          { value: '130626', label: '定兴县' },
          { value: '130627', label: '唐县' },
          { value: '130628', label: '高阳县' },
          { value: '130629', label: '容城县' },
          { value: '130630', label: '涞源县' },
          { value: '130631', label: '望都县' },
          { value: '130632', label: '安新县' },
          { value: '130633', label: '易县' },
          { value: '130634', label: '曲阳县' },
          { value: '130635', label: '蠡县' },
          { value: '130636', label: '顺平县' },
          { value: '130637', label: '博野县' },
          { value: '130638', label: '雄县' },
          { value: '130681', label: '涿州市' },
          { value: '130682', label: '定州市' },
          { value: '130683', label: '安国市' },
          { value: '130684', label: '高碑店市' },
        ],
      },
      {
        value: '130400',
        label: '邯郸市',
        children: [
          { value: '130402', label: '邯山区' },
          { value: '130403', label: '丛台区' },
          { value: '130404', label: '复兴区' },
          { value: '130406', label: '峰峰矿区' },
          { value: '130407', label: '肥乡区' },
          { value: '130408', label: '永年区' },
          { value: '130423', label: '临漳县' },
          { value: '130424', label: '成安县' },
          { value: '130425', label: '大名县' },
          { value: '130426', label: '涉县' },
          { value: '130427', label: '磁县' },
          { value: '130430', label: '邱县' },
          { value: '130431', label: '鸡泽县' },
          { value: '130432', label: '广平县' },
          { value: '130433', label: '馆陶县' },
          { value: '130434', label: '魏县' },
          { value: '130435', label: '曲周县' },
          { value: '130481', label: '武安市' },
        ],
      },
      {
        value: '130900',
        label: '沧州市',
        children: [
          { value: '130902', label: '新华区' },
          { value: '130903', label: '运河区' },
          { value: '130904', label: '沧县' },
          { value: '130921', label: '青县' },
          { value: '130922', label: '东光县' },
          { value: '130923', label: '海兴县' },
          { value: '130924', label: '盐山县' },
          { value: '130925', label: '肃宁县' },
          { value: '130926', label: '南皮县' },
          { value: '130927', label: '吴桥县' },
          { value: '130928', label: '孟村回族自治县' },
          { value: '130981', label: '泊头市' },
          { value: '130982', label: '任丘市' },
          { value: '130983', label: '黄骅市' },
          { value: '130984', label: '河间市' },
        ],
      },
      {
        value: '131100',
        label: '衡水市',
        children: [
          { value: '131102', label: '桃城区' },
          { value: '131103', label: '冀州区' },
          { value: '131182', label: '深州市' },
          { value: '131121', label: '枣强县' },
          { value: '131122', label: '武邑县' },
          { value: '131123', label: '武强县' },
          { value: '131124', label: '饶阳县' },
          { value: '131125', label: '安平县' },
          { value: '131126', label: '故城县' },
          { value: '131127', label: '景县' },
          { value: '131128', label: '阜城县' },
        ],
      },
      {
        value: '130300',
        label: '秦皇岛市',
        children: [
          { value: '130301', label: '海港区' },
          { value: '130302', label: '山海关区' },
          { value: '130303', label: '北戴河区' },
          { value: '130304', label: '抚宁区' },
          { value: '130321', label: '青龙满族自治县' },
          { value: '130322', label: '卢龙县' },
          { value: '130381', label: '昌黎市' },
          { value: '130382', label: '乐亭市' },
        ],
      },
      {
        value: '130200',
        label: '唐山市',
        children: [
          { value: '130201', label: '路南区' },
          { value: '130202', label: '路北区' },
          { value: '130203', label: '古冶区' },
          { value: '130204', label: '开平区' },
          { value: '130205', label: '丰南区' },
          { value: '130206', label: '丰润区' },
          { value: '130207', label: '曹妃甸区' },
          { value: '130221', label: '滦南县' },
          { value: '130223', label: '乐亭县' },
          { value: '130224', label: '迁西县' },
          { value: '130225', label: '玉田县' },
          { value: '130281', label: '遵化市' },
          { value: '130283', label: '迁安市' },
          { value: '130284', label: '滦州市' },
        ],
      },
      {
        value: '130700',
        label: '张家口市',
        children: [
          { value: '130701', label: '桥东区' },
          { value: '130702', label: '桥西区' },
          { value: '130703', label: '宣化区' },
          { value: '130704', label: '下花园区' },
          { value: '130705', label: '万全区' },
          { value: '130706', label: '崇礼区' },
          { value: '130721', label: '张北县' },
          { value: '130722', label: '康保县' },
          { value: '130723', label: '沽源县' },
          { value: '130724', label: '尚义县' },
          { value: '130725', label: '蔚县' },
          { value: '130726', label: '阳原县' },
          { value: '130727', label: '怀安县' },
          { value: '130728', label: '怀来县' },
          { value: '130729', label: '涿鹿县' },
          { value: '130730', label: '赤城县' },
        ],
      },
      {
        value: '130800',
        label: '承德市',
        children: [
          { value: '130801', label: '双桥区' },
          { value: '130802', label: '双滦区' },
          { value: '130803', label: '鹰手营子矿区' },
          { value: '130821', label: '承德县' },
          { value: '130822', label: '兴隆县' },
          { value: '130823', label: '滦平县' },
          { value: '130824', label: '隆化县' },
          { value: '130825', label: '丰宁满族自治县' },
          { value: '130826', label: '宽城满族自治县' },
          { value: '130827', label: '围场满族蒙古族自治县' },
          { value: '130881', label: '平泉市' },
        ],
      },
    ],
  },
  {
    value: '120000',
    label: '天津市',
    children: [
      {
        value: '120000',
        label: '天津市',
        children: [
          { value: '120101', label: '和平区' },
          { value: '120102', label: '河东区' },
          { value: '120103', label: '河西区' },
          { value: '120104', label: '南开区' },
          { value: '120105', label: '河北区' },
          { value: '120106', label: '红桥区' },
          { value: '120110', label: '东丽区' },
          { value: '120111', label: '西青区' },
          { value: '120112', label: '津南区' },
          { value: '120113', label: '北辰区' },
          { value: '120114', label: '武清区' },
          { value: '120115', label: '宝坻区' },
          { value: '120116', label: '滨海新区' },
          { value: '120117', label: '宁河区' },
          { value: '120118', label: '静海区' },
          { value: '120119', label: '蓟州区' },
        ],
      },
    ],
  },
  {
    value: '310000',
    label: '上海市',
    children: [
      {
        value: '310000',
        label: '上海市',
        children: [
          { value: '310101', label: '黄浦区' },
          { value: '310104', label: '徐汇区' },
          { value: '310105', label: '长宁区' },
          { value: '310106', label: '静安区' },
          { value: '310107', label: '普陀区' },
          { value: '310109', label: '虹口区' },
          { value: '310110', label: '杨浦区' },
          { value: '310112', label: '闵行区' },
          { value: '310113', label: '宝山区' },
          { value: '310114', label: '嘉定区' },
          { value: '310115', label: '浦东新区' },
          { value: '310116', label: '金山区' },
          { value: '310117', label: '松江区' },
          { value: '310118', label: '青浦区' },
          { value: '310120', label: '奉贤区' },
          { value: '310151', label: '崇明区' },
        ],
      },
    ],
  },
  // ===================== 新增：山东省（山河四省）=====================
  {
    value: '370000',
    label: '山东省',
    children: [
      { value: '370100', label: '济南市', children: [
        { value: '370102', label: '历下区' },{ value: '370103', label: '市中区' },
        { value: '370104', label: '槐荫区' },{ value: '370105', label: '天桥区' },
        { value: '370112', label: '历城区' },{ value: '370113', label: '长清区' },
        { value: '370114', label: '章丘区' },{ value: '370115', label: '济阳区' },
        { value: '370116', label: '莱芜区' },{ value: '370117', label: '钢城区' },
      ]},
      { value: '370200', label: '青岛市', children: [
        { value: '370202', label: '市南区' },{ value: '370203', label: '市北区' },
        { value: '370211', label: '李沧区' },{ value: '370212', label: '黄岛区' },
        { value: '370213', label: '崂山区' },{ value: '370214', label: '城阳区' },
        { value: '370215', label: '即墨区' },
      ]},
      { value: '370300', label: '淄博市', children: [
        { value: '370302', label: '淄川区' },{ value: '370303', label: '张店区' },
        { value: '370304', label: '博山区' },{ value: '370305', label: '临淄区' },
        { value: '370306', label: '周村区' },{ value: '370321', label: '桓台县' },
      ]},
      { value: '370400', label: '枣庄市', children: [
        { value: '370402', label: '市中区' },{ value: '370403', label: '薛城区' },
        { value: '370404', label: '峄城区' },{ value: '370405', label: '台儿庄区' },
        { value: '370406', label: '山亭区' },
      ]},
      { value: '370500', label: '东营市', children: [{ value: '370502', label: '东营区' },{ value: '370503', label: '河口区' }]},
      { value: '370600', label: '烟台市', children: [{ value: '370602', label: '芝罘区' },{ value: '370611', label: '福山区' },{ value: '370612', label: '莱山区' },{ value: '370613', label: '牟平区' }]},
      { value: '370700', label: '潍坊市', children: [{ value: '370702', label: '潍城区' },{ value: '370703', label: '寒亭区' },{ value: '370704', label: '坊子区' },{ value: '370705', label: '奎文区' }]},
      { value: '370800', label: '济宁市', children: [{ value: '370802', label: '任城区' },{ value: '370811', label: '兖州区' }]},
      { value: '370900', label: '泰安市', children: [{ value: '370902', label: '泰山区' },{ value: '370911', label: '岱岳区' }]},
      { value: '371000', label: '威海市', children: [{ value: '371002', label: '环翠区' },{ value: '371071', label: '文登区' }]},
      { value: '371100', label: '日照市', children: [{ value: '371102', label: '东港区' },{ value: '371103', label: '岚山区' }]},
      { value: '371200', label: '临沂市', children: [{ value: '371302', label: '兰山区' },{ value: '371311', label: '罗庄区' },{ value: '371312', label: '河东区' }]},
      { value: '371300', label: '德州市', children: [{ value: '371402', label: '德城区' },{ value: '371403', label: '陵城区' }]},
      { value: '371400', label: '聊城市', children: [{ value: '371502', label: '东昌府区' }]},
      { value: '371500', label: '滨州市', children: [{ value: '371602', label: '滨城区' },{ value: '371603', label: '沾化区' }]},
      { value: '371600', label: '菏泽市', children: [{ value: '371702', label: '牡丹区' },{ value: '371703', label: '定陶区' }]},
    ]
  },
  // ===================== 新增：河南省（山河四省）=====================
  {
    value: '410000',
    label: '河南省',
    children: [
      { value: '410100', label: '郑州市', children: [
        { value: '410102', label: '中原区' },{ value: '410103', label: '二七区' },
        { value: '410104', label: '管城回族区' },{ value: '410105', label: '金水区' },
        { value: '410106', label: '上街区' },{ value: '410108', label: '惠济区' },
      ]},
      { value: '410200', label: '开封市', children: [
        { value: '410202', label: '龙亭区' },{ value: '410203', label: '顺河回族区' },
        { value: '410204', label: '鼓楼区' },{ value: '410205', label: '禹王台区' },
        { value: '410211', label: '祥符区' },
      ]},
      { value: '410300', label: '洛阳市', children: [
        { value: '410302', label: '老城区' },{ value: '410303', label: '西工区' },
        { value: '410304', label: '瀍河回族区' },{ value: '410305', label: '涧西区' },
        { value: '410311', label: '洛龙区' },{ value: '410312', label: '吉利区' },
      ]},
      { value: '410400', label: '平顶山市', children: [{ value: '410402', label: '新华区' },{ value: '410403', label: '卫东区' },{ value: '410404', label: '石龙区' },{ value: '410411', label: '湛河区' }]},
      { value: '410500', label: '安阳市', children: [{ value: '410502', label: '文峰区' },{ value: '410503', label: '北关区' },{ value: '410505', label: '殷都区' },{ value: '410506', label: '龙安区' }]},
      { value: '410600', label: '鹤壁市', children: [{ value: '410602', label: '鹤山区' },{ value: '410603', label: '山城区' },{ value: '410611', label: '淇滨区' }]},
      { value: '410700', label: '新乡市', children: [{ value: '410702', label: '红旗区' },{ value: '410703', label: '卫滨区' },{ value: '410704', label: '凤泉区' },{ value: '410711', label: '牧野区' }]},
      { value: '410800', label: '焦作市', children: [{ value: '410802', label: '解放区' },{ value: '410803', label: '中站区' },{ value: '410804', label: '马村区' },{ value: '410811', label: '山阳区' }]},
      { value: '410900', label: '濮阳市', children: [{ value: '410902', label: '华龙区' }]},
      { value: '411000', label: '许昌市', children: [{ value: '411002', label: '魏都区' },{ value: '411003', label: '建安区' }]},
      { value: '411100', label: '漯河市', children: [{ value: '411102', label: '源汇区' },{ value: '411103', label: '郾城区' },{ value: '411104', label: '召陵区' }]},
      { value: '411200', label: '三门峡市', children: [{ value: '411202', label: '湖滨区' },{ value: '411203', label: '陕州区' }]},
      { value: '411300', label: '南阳市', children: [{ value: '411302', label: '宛城区' },{ value: '411303', label: '卧龙区' }]},
      { value: '411400', label: '商丘市', children: [{ value: '411402', label: '梁园区' },{ value: '411403', label: '睢阳区' }]},
      { value: '411500', label: '信阳市', children: [{ value: '411502', label: '浉河区' },{ value: '411503', label: '平桥区' }]},
      { value: '411600', label: '周口市', children: [{ value: '411602', label: '川汇区' },{ value: '411603', label: '淮阳区' }]},
      { value: '411700', label: '驻马店市', children: [{ value: '411702', label: '驿城区' }]},
    ]
  },
  // ===================== 新增：山西省（山河四省）=====================
  {
    value: '140000',
    label: '山西省',
    children: [
      { value: '140100', label: '太原市', children: [
        { value: '140105', label: '小店区' },{ value: '140106', label: '迎泽区' },
        { value: '140107', label: '杏花岭区' },{ value: '140108', label: '尖草坪区' },
        { value: '140109', label: '万柏林区' },{ value: '140110', label: '晋源区' },
      ]},
      { value: '140200', label: '大同市', children: [
        { value: '140212', label: '平城区' },{ value: '140213', label: '云冈区' },
        { value: '140214', label: '新荣区' },{ value: '140215', label: '云州区' },
      ]},
      { value: '140300', label: '阳泉市', children: [{ value: '140302', label: '城区' },{ value: '140303', label: '矿区' },{ value: '140311', label: '郊区' }]},
      { value: '140400', label: '长治市', children: [{ value: '140402', label: '潞州区' },{ value: '140403', label: '上党区' },{ value: '140404', label: '屯留区' },{ value: '140405', label: '潞城区' }]},
      { value: '140500', label: '晋城市', children: [{ value: '140502', label: '城区' }]},
      { value: '140600', label: '朔州市', children: [{ value: '140602', label: '朔城区' },{ value: '140603', label: '平鲁区' }]},
      { value: '140700', label: '晋中市', children: [{ value: '140702', label: '榆次区' },{ value: '140721', label: '太谷区' }]},
      { value: '140800', label: '运城市', children: [{ value: '140802', label: '盐湖区' }]},
      { value: '140900', label: '忻州市', children: [{ value: '140902', label: '忻府区' }]},
      { value: '141000', label: '临汾市', children: [{ value: '141002', label: '尧都区' }]},
      { value: '141100', label: '吕梁市', children: [{ value: '141102', label: '离石区' }]},
    ]
  },
];
const regionMap: Record<string, string> = {};
  const buildRegionMap = (options: any[]) => {
  options.forEach(option => {
    regionMap[option.value] = option.label;
    if (option.children?.length) buildRegionMap(option.children);
  });
};
buildRegionMap(regionOptions);
// 地址转中文
const formatAddress = (province: string, city: string, district: string) => {
  const p = regionMap[province] || province;
  const c = regionMap[city] || city;
  const d = regionMap[district] || district;
  return `${p} ${c} ${d}`;
};
// 头像功能 
const showAvatarDialog = ref(false)
const previewAvatar = ref('')

const currentAvatar = computed(() => {
  return userStore.user?.avatar || 'https://cube.elemecdn.com/0/5/0df5cf44e51f1197950fddc469d08jpeg.jpeg'
})

const openAvatarDialog = () => {
  previewAvatar.value = userStore.user?.avatar || ''
  showAvatarDialog.value = true
}

const beforeAvatarUpload = (file: any) => {
   const isImg = file.type === 'image/jpeg' || file.type === 'image/png'|| file.type === 'image/webp'|| file.type === 'image/x-webp'
  if (!isImg) {
    ElMessage.error('头像只能是 JPG/PNG/webp 格式')
    return false
  }
  const isLt2M = file.size / 1024 / 1024 < 2
  if (!isLt2M) {
    ElMessage.error('头像大小不能超过 2MB')
    return false
  }
  return true
}

const customUpload = async (options: any) => {
  try {
    const res = await uploadAvatar(options.file)
    //@ts-ignore
    if (res.code === 200) {
      ElMessage.success('头像上传成功')
      previewAvatar.value = res.data.url
      if (userStore.user) {
        userStore.user.avatar = res.data.url
      }
      showAvatarDialog.value = false
    } else {
       //@ts-ignore
      ElMessage.error(res.msg || '上传失败')
    }
  } catch (err) {
    ElMessage.error('上传失败')
  }
}

const defaultAddress = ref<any>(null) // 默认地址

// 获取默认收货地址
const loadDefaultAddress = async () => {
  if (!userStore.isLogin) return
  try {
    const res = await getDefaultAddress()
    if (res.code === 200) {
      defaultAddress.value = res.data
    }
  } catch (e) { /* 静默失败 */ }
}

// 跳转收货地址管理页
const goToAddress = () => {
  router.push('/user/address')
}
const showEditPhoneDialog = ref(false)
const verifyType = ref<'phone' | 'password'>('phone')
const originalPhone = ref('')
const smsCountdown = ref(0)
let smsTimer: any = null

const chars = '0123456789ABCDEFGHIJKLMNPQRSTUVWXYZ'
const captchaCode = ref('')
//@ts-ignore
const inputtext = ref(``)
//@ts-ignore
const bcqm = ref(``)
const km = ref(false)

const editPhoneForm = ref({
  oldSmsCode: '',
  oldPwd: '',
  newPhone: '',
  captcha: '',
})
const editPhoneFormRef = ref<FormInstance>()
const isPass = ref(false)

const orderList = ref<any>([])
const loading = ref(false)


const validMobilePrefixes = [
  '130','131','132','133','134','135','136','137','138','139',
  '150','151','152','153','155','156','157','158','159','166',
  '172','173','175','176','177','178','180','181','182','183',
  '184','185','186','187','188','189','190','191','192','193',
  '195','196','197','198','199',
]
const isValidPhone = (phone: string): boolean => {
  if (!/^\d{11}$/.test(phone)) return false
  const prefix = phone.slice(0, 3)
  return validMobilePrefixes.includes(prefix)
}
const isValidAccount = (str: string): boolean => {
  const hasLetter = /[a-zA-Z]/.test(str)
  const digitMatch = str.match(/\d/g)
  const hasEnoughDigits = digitMatch && digitMatch.length >= 5
  const onlyLetterAndDigit = /^[a-zA-Z0-9]+$/.test(str) //@ts-ignore
  return hasLetter && hasEnoughDigits && onlyLetterAndDigit
}

// 图片验证码验证规则（和登录页完全一致）
const editPhoneRules = reactive<FormRules>({
  oldPwd: [
    { required: true, message: '请输入当前账号密码', trigger: 'blur' },
    { min: 6, max: 13, message: '密码长度6-13位', trigger: 'blur' },
  ],
  oldSmsCode: [{ required: true, message: '请输入原手机短信验证码', trigger: 'blur' }],
  captcha: [
    { required: true, message: '请输入图片验证码', trigger: 'blur' },
    {
      validator: (rule: any, value: any, callback: any) => {
        if (value?.toUpperCase() === captchaCode.value) {
          callback()
        } else {
          callback(new Error('图片验证码错误'))
        }
      },
    },
  ],
  newPhone: [
    { required: true, message: '请输入新手机号', trigger: 'blur' },
    {
      validator: (rule: any, value: string, callback: any) => {
        if (!isValidPhone(value)) return callback(new Error('请输入11位正规手机号'))
        if (value === originalPhone.value) return callback(new Error('不能与原手机号一致'))
        callback()
      },
    },
  ],
})

const handleEditPhone = () => {
  originalPhone.value = userStore.user?.phone || ''
  resetPhoneDialog()
  showEditPhoneDialog.value = true
}

const resetPhoneDialog = () => {
  editPhoneForm.value = { oldSmsCode: '', oldPwd: '', newPhone: '', captcha: '' }
  isPass.value = false
  smsCountdown.value = 0
  clearInterval(smsTimer)
  editPhoneFormRef.value?.clearValidate()
  generateCaptcha() 
}

const generateCaptcha = () => {
  let code = ''
  for (let i = 0; i < 4; i++) code += chars[Math.floor(Math.random() * chars.length)]
  captchaCode.value = code
}
const refreshCaptcha = () => generateCaptcha()

// 发送验证码：移除图片验证码前置校验，和登录页逻辑一致
const sendOldPhoneSms = async () => {
  if (!originalPhone.value) return ElMessage.error('未绑定手机号')
  if (!isValidPhone(originalPhone.value)) return ElMessage.error('手机号格式异常')

  try {
    const res = await sendSmsCode({ phone: originalPhone.value })
    //@ts-ignore
    if (res.code === 200) {
      ElMessage.success('验证码已发送：' + res.data.code)
      smsCountdown.value = 60
      smsTimer = setInterval(() => {
        smsCountdown.value--
        if (smsCountdown.value <= 0) clearInterval(smsTimer)
      }, 1000)
    }
  } catch (e) {}
}

// 身份验证：只校验身份相关字段，不校验新手机号（核心修复）
const checkIdentity = async () => {
  if (!editPhoneFormRef.value) return
  
  // 根据验证方式，只校验对应字段，不校验还没填写的新手机号
  const validateFields = verifyType.value === 'phone' 
    ? ['oldSmsCode', 'captcha'] 
    : ['oldPwd', 'captcha']
  
  try {
    await editPhoneFormRef.value.validateField(validateFields)
  } catch {
    return
  }

  if (verifyType.value === 'phone') {
    try {
      const res = await verifyPaySmsCode({
        phone: originalPhone.value,
        code: editPhoneForm.value.oldSmsCode,
      })
      //@ts-ignore
      if (res.code === 200) {
        isPass.value = true
        ElMessage.success('✅ 验证成功')
      } else ElMessage.error('验证码错误')
    } catch (e) {}
  } else {
    isPass.value = true
    ElMessage.success('✅ 验证成功')
  }
}
const confirmEditPhone = async () => {
  if (!editPhoneFormRef.value || !isPass.value) return
  // 确认修改时，校验整个表单（包括新手机号）
  await editPhoneFormRef.value.validate()
  try {
    const res = await bindPhone(editPhoneForm.value.newPhone)
    //@ts-ignore
    if (res.code === 200) {
      ElMessage.success('🎉 修改成功')
      userStore.user.phone = editPhoneForm.value.newPhone
      showEditPhoneDialog.value = false
      resetPhoneDialog()
    }
  } catch (e) {}
}

const handleBind = async () => {
  if (!phone.value) return ElMessage.error('请输入手机号')
  const res = await bindPhone(phone.value)
  //@ts-ignore
  if (res.code === 200) {
    ElMessage.success('绑定成功')
    userStore.user.phone = phone.value
    phone.value = ''
  } else {
    //@ts-ignore
    ElMessage.error(res.msg)
  }
}


const go = (path: string | RouteLocationAsRelativeGeneric | RouteLocationAsPathGeneric) => {
  setTimeout(() => router.push(path), 10)
}

const fetchUserSign = async () => {
  try {
    const res = await getSign()
    //@ts-ignore
    if (res.code === 200 && res.data) {
      userStore.user.sign = res.data.sign || ''
    }
  } catch (e) {}
}

const updetaqm = async () => {
  if (!km.value) {
    km.value = true
    inputtext.value = userStore.user?.sign || ''
    return
  }
  try {
    const res = await updasign(inputtext.value)
    //@ts-ignore
    if (res.code === 200) {
      ElMessage.success('🎉 保存成功')
      await fetchUserSign()
      inputtext.value = ''
      km.value = false
    }
  } catch (e) {
    ElMessage.error('保存失败')
  }
}

const quxiqm = () => {
  km.value = false
}

const toFixedNumber = (num: any, digits: number) => {
  if (num == null) return '0.00'
  return Number(num).toFixed(digits)
}

const handleLogout = () => {
  userStore.logout()
  ElMessage.success('退出成功')
  router.push('/login')
}

const getStatusTagType = (status: string) => {
  const map = {
    待付款: 'warning',
    已付款: 'info',
    待发货: 'primary',
    已发货: 'success',
    待收货: 'primary',
    已完成: 'success',
    已取消: 'danger',
  }
  //@ts-ignore
  return map[status] || 'info'
}

const formatTime = (t: string) => (t ? dayjs(t).format('YYYY-MM-DD HH:mm:ss') : '暂无')

const getOrderList = async () => {
  if (!userStore.isLogin) return
  loading.value = true
  try {
    const res = await getUserOrderList()
    //@ts-ignore
    if (res.code === 200) orderList.value = res.data
  } catch (e) {
    ElMessage.error('获取订单失败')
  } finally {
    loading.value = false
  }
}

// 确认收货
const handleConfirmReceive = async (orderNo: string) => {
  await ElMessageBox.confirm('确认已经收到商品？')
  const res = await updateOrderStatus({ orderNo, status: '已收货' })
  //@ts-ignore
  if (res.code === 200) {
    ElMessage.success('收货成功')
    getOrderList()
  }
}

// 退货退款
const handleRefundOrder = async (no: string) => {
  await ElMessageBox.confirm('确定要申请退货退款吗？申请后订单将取消，库存将恢复。')
  try {
    const res = await updateOrderStatus({ orderNo: no, status: '已取消' })
    //@ts-ignore
    if (res.code === 200) {
      ElMessage.success('退货退款申请成功，订单已取消')
      getOrderList()
    } else {
      //@ts-ignore
      ElMessage.error(res.msg || '操作失败')
    }
  } catch (err) {
    ElMessage.error('操作失败，请稍后重试')
  }
}

// 删除订单
const handleRemoveOrder = async (orderNo: string) => {
  await ElMessageBox.confirm('确定要删除该订单吗？删除后订单记录将无法恢复。')
  try {
    const res = await deleteOrder(orderNo)
    //@ts-ignore
    if (res.code === 200) {
      ElMessage.success('订单删除成功')
      getOrderList()
    } else {
      //@ts-ignore
      ElMessage.error(res.msg || '删除失败')
    }
  } catch (err) {
    ElMessage.error('删除失败，请稍后重试')
  }
}

// =====================修改账密 身份验证=====================
const showEditDialog = ref(false)
const isPassEdit = ref(false)
const verifyTypeEdit = ref<'password' | 'phone'>('password')
const editFormRef = ref<FormInstance>()
const editPwdVerifyFormRef = ref<FormInstance>()

const editPwdVerifyForm = ref({
  oldPwd: '',
  smsCode: '',
  captcha: '',
})

const captchaCodeEdit = ref('')
const smsCountdownEdit = ref(0)
let smsTimerEdit: any = null

const editForm = ref({
  username: userStore.user?.username || '',
  password: '',
  confirmPwd: '',
})
const originalUsername = ref(userStore.user?.username || '')

// 身份验证表单规则（和登录页完全一致）
const editPwdVerifyRules = reactive<FormRules>({
  oldPwd: [
    { required: true, message: '请输入当前登录密码', trigger: 'blur' },
    { min: 6, max: 13, message: '密码长度6-13位', trigger: 'blur' },
  ],
  smsCode: [{ required: true, message: '请输入短信验证码', trigger: 'blur' }],
  captcha: [
    { required: true, message: '请输入图片验证码', trigger: 'blur' },
    {
      validator: (rule: any, value: string, callback: any) => {
        if (value?.toUpperCase() === captchaCodeEdit.value) callback()
        else callback(new Error('图片验证码错误'))
      },
    },
  ],
})

// 图片验证码验证规则统一
const editRules = reactive<FormRules>({
  username: [
    { min: 6, max: 13, message: '长度6-13位', trigger: 'blur' },
    {
      validator: (rule: any, value: string, callback: any) => {
        if (value === originalUsername.value && !editForm.value.password)
          return callback(new Error('未做任何修改'))
        if (isValidAccount(value) || isValidPhone(value)) callback()
        else callback(new Error('格式：字母+数字 或 11位手机号'))
      },
      trigger: 'blur',
    },
  ],
  password: [{ min: 6, max: 13, message: '长度6-13位', trigger: 'blur' }],
  confirmPwd: [
    {
      validator: (r, p, cb) => {
        if (editForm.value.password && p !== editForm.value.password) cb(new Error('两次密码不一致'))
        else cb()
      },
      trigger: 'blur',
    },
  ],
})

const openEditDialog = () => {
  editForm.value.username = userStore.user?.username || ''
  editForm.value.password = ''
  editForm.value.confirmPwd = ''
  isPassEdit.value = false
  resetEditPwdVerify()
  showEditDialog.value = true
}

const closeEditDialog = () => {
  showEditDialog.value = false
  resetEditPwdVerify()
}

const resetEditPwdVerify = () => {
  isPassEdit.value = false
  smsCountdownEdit.value = 0
  editPwdVerifyForm.value = { oldPwd: '', smsCode: '', captcha: '' }
  clearInterval(smsTimerEdit)
  generateCaptchaEdit() 
}

const generateCaptchaEdit = () => {
  let code = ''
  for (let i = 0; i < 4; i++) code += chars[Math.floor(Math.random() * chars.length)]
  captchaCodeEdit.value = code
}
const refreshCaptchaEdit = () => generateCaptchaEdit()

// 发送验证码：移除图片验证码前置校验，和登录页逻辑一致
const sendEditPwdSms = async () => {
  if (!originalPhone.value) return ElMessage.error('未绑定手机号')
  if (!isValidPhone(originalPhone.value)) return ElMessage.error('手机号格式异常')

  try {
    const res = await sendSmsCode({ phone: originalPhone.value })
    //@ts-ignore
    if (res.code === 200) {
      ElMessage.success('验证码已发送：' + res.data.code)
      smsCountdownEdit.value = 60
      smsTimerEdit = setInterval(() => {
        smsCountdownEdit.value--
        if (smsCountdownEdit <= 0) clearInterval(smsTimerEdit)
      }, 1000)
    }
  } catch (e) {}
}

// 身份验证：只校验身份相关字段（同步修复）
const checkIdentityEdit = async () => {
  if (!editPwdVerifyFormRef.value) return
  
  // 根据验证方式，只校验对应字段，不校验后面的用户名密码
  const validateFields = verifyTypeEdit.value === 'password' 
    ? ['oldPwd', 'captcha'] 
    : ['smsCode', 'captcha']
  
  try {
    await editPwdVerifyFormRef.value.validateField(validateFields)
  } catch {
    return
  }

  if (verifyTypeEdit.value === 'password') {
    isPassEdit.value = true
    ElMessage.success('✅ 密码验证成功')
  } else {
    try {
      const res = await verifyPaySmsCode({
        phone: originalPhone.value,
        code: editPwdVerifyForm.value.smsCode,
      })
      //@ts-ignore
      if (res.code === 200) {
        isPassEdit.value = true
        ElMessage.success('✅ 验证码验证成功')
      } else {
        ElMessage.error('验证码错误')
      }
    } catch (e) {}
  }
}

const submitEdit = async () => {
  if (!editFormRef.value || !isPassEdit.value) return
  await editFormRef.value.validate()

  try {
    const params = {
      username: editForm.value.username,
      password: editForm.value.password || undefined,
      originalUsername: originalUsername.value,
    }
    const res = await updateUserInfoApi(params)
    //@ts-ignore
    if (res.code === 200) {
      ElMessage.success('修改成功，请重新登录')
      userStore.logout()
      router.push('/login')
      showEditDialog.value = false
    } else {
      //@ts-ignore
      ElMessage.error(res.msg)
    }
  } catch (e) {
    ElMessage.error('修改失败')
  }
}

onUnmounted(() => {
  clearInterval(smsTimer)
  clearInterval(smsTimerEdit)
})
onActivated(() => {
  if (userStore.isLogin) {
    getOrderList()
    fetchUserSign()
    loadDefaultAddress() 
  }
  generateCaptcha()
  generateCaptchaEdit()
})
onMounted(() => {
  if (userStore.isLogin) {
    getOrderList()
    fetchUserSign()
    loadDefaultAddress()
  }
  generateCaptcha()
  generateCaptchaEdit()
})
</script>
<style scoped>
.yz{
  margin-top: 12px;
  padding-left: 3px;
  padding-right: 3px;
  margin-bottom: 12px;
}
.yz1{
 
  padding-left: 3px;
  padding-right: 3px;
 
}
/* 头像容器 */
.avatar-wrapper {
  position: relative;
  cursor: pointer;
}

/* 头像加号按钮 */
.avatar-upload-btn {
  position: absolute;
  right: -5px;
  bottom: -5px;
  width: 20px;
  height: 20px;
  background: #409eff;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-size: 14px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
}

/* 上传组件样式 */
.avatar-uploader {
  display: flex;
  justify-content: center;
}

.avatar-uploader :deep(.el-upload) {
  border: 1px dashed #d9d9d9;
  border-radius: 50%;
  width: 120px;
  height: 120px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: border-color 0.3s;
}

.avatar-uploader :deep(.el-upload:hover) {
  border-color: #409eff;
}

.upload-icon {
  font-size: 32px;
  color: #c0c4cc;
}

.preview-avatar {
  width: 100%;
  height: 100%;
}
/*全局页面*/
.page-container {
  width: 100%;
  max-width: 1280px;
  margin: 0 auto;
  padding: 24px;
  min-height: 100vh;

  background:
    radial-gradient(circle at top right, rgba(64, 158, 255, 0.12), transparent 22%),
    radial-gradient(circle at bottom left, rgba(255, 170, 0, 0.1), transparent 25%),
    linear-gradient(135deg, #f5f7fb, #eef3ff);

  color: #1f2937;
  overflow-x: hidden;
}

/*顶部导航栏*/
.topse {
  position: fixed;
  top: 0;
  z-index: 999;
margin-left: -23.5px;
  display: flex;
  align-items: center;
  gap: 16px;

  width: 1279px;
  height: 68px;

  padding: 0 24px;
  margin-bottom: 35px;

  border-radius: 18px;

  background: rgba(231, 231, 231, 0.75);
  backdrop-filter: blur(18px);

  box-shadow:
    0 10px 30px rgba(0, 0, 0, 0.121),
    inset 0 1px 0 rgba(255, 255, 255, 0.6);

  border: 1px solid rgba(255, 255, 255, 0.6);
}

/* 返回首页按钮 */
.gwy {
  height: 42px;
  padding: 0 18px !important;

  border-radius: 12px !important;

  background: linear-gradient(135deg, #409eff, #6bc3ff) !important;
  border: none !important;

  font-weight: 700;
  letter-spacing: 0.5px;

  box-shadow: 0 8px 20px rgba(64, 158, 255, 0.25);

  transition: all 0.25s ease;
}

.gwy:hover {
  transform: translateY(-2px);
  box-shadow: 0 12px 28px rgba(64, 158, 255, 0.35);
}

/* 顶部功能按钮 */
.zise,
.zise1,
.zise2 {
  position: static !important;
  margin-left: 0 !important;
  top: auto !important;

  display: flex;
  align-items: center;

  padding: 8px 14px;

  border-radius: 12px;

  font-size: 15px !important;
  font-weight: 700;

  transition: all 0.25s ease;
}

.zise {
  color: #ff7b00;
  background: rgba(255, 180, 0, 0.08);
}

.zise1 {
  color: #ff7b00;
  background: rgba(255, 180, 0, 0.08);
}
.zise2 {
  color: #ff7b00;
  background: rgba(255, 180, 0, 0.08);
}

.zise2:hover{
 
  background: rgba(255, 255, 255, 0.85);
}

/* 图标动画 */
.gwdh,
.gwdh1 {
  width: 24px;
  height: auto;
  margin-right: 6px;
}

.gwdh {
  animation: cartFloat 2s infinite ease-in-out;
}

.gwdh1 {
  animation: favFloat 2s infinite ease-in-out;
}

@keyframes cartFloat {
  0%,
  100% {
    transform: rotate(0deg) scale(1);
  }
  50% {
    transform: rotate(8deg) scale(1.08);
  }
}

@keyframes favFloat {
  0%,
  100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.12);
  }
}

/* 标题区域 */
.sci-fi-title {
  position: relative;

  width: fit-content;

  margin: 0 auto 40px;

  font-size: clamp(32px, 5vw, 46px);
  font-weight: 800;

  color: #1f2937;

  letter-spacing: 2px;
}

.sci-fi-title::before {
  content: '👤';
  margin-right: 12px;
}

.sci-fi-title::after {
  content: '';
  position: absolute;
  left: 50%;
  bottom: -10px;

  transform: translateX(-50%);

  width: 70%;
  height: 4px;

  border-radius: 999px;

  background: linear-gradient(
    90deg,
    rgba(64, 158, 255, 0),
    rgba(64, 158, 255, 1),
    rgba(64, 158, 255, 0)
  );
}

/* 卡片主体 */
.user-info-card {
  overflow: hidden;

  border: none !important;
  border-radius: 24px !important;

  background: rgba(255, 255, 255, 0.78) !important;
  backdrop-filter: blur(18px);

  box-shadow:
    0 20px 45px rgba(0, 0, 0, 0.08),
    inset 0 1px 0 rgba(255, 255, 255, 0.7);

  transition: all 0.3s ease;
}

.user-info-card:hover {
  transform: translateY(0px);
}

/* 卡片标题 */
.card-title {
  font-size: 22px;
  font-weight: 800;
  color: #111827;
}

/* 用户信息 */
.user-info-content {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));

  gap: 18px;

  margin-top: 10px;

  line-height: 2;
  color: #1f2937;
}

.user-info-content p,
.phone-binded,
.user-info-content h3 {
  padding: 18px;

  border-radius: 18px;

  background: rgba(245, 248, 255, 0.9);

  border: 1px solid rgba(64, 158, 255, 0.08);

  box-shadow: 0 6px 18px rgba(0, 0, 0, 0.03);
}

/* 标签 */
:deep(.el-tag) {
  border-radius: 999px;
  padding: 0 14px;
  font-weight: 700;
}

/*个人签名*/
.qmhh {
  display: block;

  width: 100%;

  padding: 20px;

  margin-top: 12px;

  border-radius: 16px;

  line-height: 2;

  background: linear-gradient(135deg, #f7faff, #eef4ff);

  border: 1px solid rgba(64, 158, 255, 0.08);

  color: #374151;

  font-size: 15px !important;
}

/* 输入框 */
.sign-input :deep(.el-textarea__inner) {
  border-radius: 18px !important;

  padding: 18px !important;

  background: rgba(255, 255, 255, 0.9) !important;

  border: 1px solid rgba(64, 158, 255, 0.15);

  color: #111827;

  font-size: 15px;

  transition: all 0.25s ease;
}

.sign-input :deep(.el-textarea__inner:focus) {
  border-color: #409eff;
  box-shadow: 0 0 0 4px rgba(64, 158, 255, 0.1);
}

/* 验证码区域 */
.code-box,
.captcha-row {
  display: flex;
  align-items: center;
  gap: 12px;
}

.captcha-img {
  width: 120px;
  height: 42px;

  border-radius: 12px;

  background: linear-gradient(135deg, #409eff, #7ec9ff);

  color: white;

  text-align: center;
  line-height: 42px;

  font-size: 20px;
  font-weight: 800;
  letter-spacing: 3px;

  cursor: pointer;

  user-select: none;

  transition: all 0.25s ease;
}

.captcha-img:hover {
  transform: scale(1.03);
}

/*订单区域*/
.order-section {
  margin-top: 45px;
}

.sci-fi-subtitle {
  display: flex;
  align-items: center;

  font-size: 28px;
  font-weight: 800;

  color: #1f2937;

  margin-bottom: 18px;
}

.sci-fi-subtitle::before {
  content: '📦';
  margin-right: 10px;
}

/* 刷新按钮 */
.refresh-btn {
  margin-bottom: 18px;

  font-size: 16px;
  font-weight: 700;

  color: #409eff;

  transition: all 0.25s ease;
}

.refresh-btn:hover {
  color: #0b7cff;
  transform: translateX(2px);
}

/*表格美化*/
:deep(.el-table) {
  overflow: hidden;

  border-radius: 22px;

  background: rgba(255, 255, 255, 0.92);

  border: none !important;

  box-shadow: 0 18px 35px rgba(0, 0, 0, 0.06);

  --el-table-header-bg-color: #f7faff;
  --el-table-row-hover-bg-color: #f0f7ff;
  --el-table-header-text-color: #1f2937;
  --el-table-text-color: #374151;
}

:deep(.el-table th) {
  height: 58px;

  font-size: 15px;
  font-weight: 800;

  background: #f7faff !important;
}

:deep(.el-table td) {
  padding: 14px 0;
}

:deep(.el-table__row) {
  transition: all 0.25s ease;
}

:deep(.el-table__row:hover) {
  transform: scale(0.997);
}

/* 图书封面 */
.order-book-cover {
  width: 100%;
  height: auto;

  object-fit: cover;

  border-radius: 12px;

  border: 2px solid rgba(64, 158, 255, 0.08);

  transition: all 0.25s ease;
}

.order-book-cover:hover {
  transform: scale(1.05);
}

/*空订单*/
.empty-order {
  padding: 60px 20px;

  margin-top: 20px;

  border-radius: 24px;

  text-align: center;

  background: rgba(255, 255, 255, 0.78);

  color: #6b7280;

  box-shadow: 0 14px 30px rgba(0, 0, 0, 0.05);
}

/*未登录*/
.no-login-tip {
  margin-top: 100px;
  padding: 80px 30px;

  border-radius: 26px;

  text-align: center;

  background: rgba(255, 255, 255, 0.82);
  backdrop-filter: blur(16px);

  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.08);
}

.no-login-tip h3 {
  font-size: 34px;
  color: #1f2937;
  margin-bottom: 20px;
}

/*按钮*/
:deep(.el-button--primary) {
  border: none !important;

  background: linear-gradient(135deg, #409eff, #73c0ff) !important;

  box-shadow: 0 8px 20px rgba(64, 158, 255, 0.2);

  transition: all 0.25s ease;
}

:deep(.el-button--primary:hover) {
  transform: translateY(-2px);
}

:deep(.el-button--danger) {
  border: none !important;

  background: linear-gradient(135deg, #ff6b6b, #ff8787) !important;
}


:deep(.el-dialog) {
  border-radius: 24px !important;

  overflow: hidden;

  background: rgba(255, 255, 255, 0.95);

  backdrop-filter: blur(20px);

  box-shadow: 0 25px 50px rgba(0, 0, 0, 0.12);
}

:deep(.el-dialog__header) {
  padding: 24px 24px 10px;

  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
}

:deep(.el-dialog__title) {
  font-size: 22px;
  font-weight: 800;
  color: #111827;
}

:deep(.el-dialog__body) {
  padding: 24px;
}

/*  响应式  */
@media (max-width: 768px) {
  .topse {
    flex-wrap: wrap;
    height: auto;
    padding: 14px;
  }

  .user-info-content {
    grid-template-columns: 1fr;
  }

  .sci-fi-title {
  position: relative;
    font-size: 34px;
    top: -2px !important;
   
  }

  .sci-fi-subtitle {
    font-size: 24px;
  }

  .qmhh {
    width: 100%;
  }

  .code-box,
  .captcha-row {
    flex-direction: column;
    align-items: stretch;
  }

  .captcha-img {
    width: 100%;
  }
}

/* 全局基础 */
* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;

  user-select: none !important;
  -webkit-user-select: none !important;
}

input,
textarea,
button {
  user-select: auto !important;
  -webkit-user-select: auto !important;
}
</style>
