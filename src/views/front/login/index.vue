<template>
  <div class="beij">
    <div class="home-top-navwy">
      <div>
        <h2 style="margin-top: 0px;" class="sci-fi-title">星途科幻图书</h2>
      
      </div>
    </div>
    <div class="login-page">
      <div class="box">
        <el-button class="gwy" type="primary" @click="$router.push('/home')">返回首页</el-button>
        <h2 class="sci-fi-title" style="margin-left: 3px; position: relative; bottom: 5px">
          星途科幻 - 登录
        </h2>

        <el-tabs v-model="loginType" class="login-tabs">
          <el-tab-pane @click="" label="密码登录" name="password" />
          <el-tab-pane @click="" label="验证码登录" name="code" />
        </el-tabs>

        <el-form
          :rules="rules"
          style="margin-left: -20px"
          :model="form"
          ref="formRef"
          label-width="80px"
        >
          <el-form-item   style="font-weight: 700" label="账号" prop="username">
            <el-input
              maxlength="13"
              :placeholder="loginType==='password'?'请输入用户名':'请输入手机号'"
              v-model="form.username"
              @keyup.enter="submitLogin"
              show-word-limit
            />
          </el-form-item>
       
          <el-form-item
            v-if="loginType === 'password'"
            style="font-weight: 700"
            label="密码"
            prop="password"
          >
            <el-input
              maxlength="13"
              placeholder="请输入密码"
              v-model="form.password"
              type="password"
              @keyup.enter="submitLogin"
              show-password
            />
          </el-form-item>

          <el-form-item v-else style="font-weight: 700" label="验证码" prop="code">
            <div class="code-box">
              <el-input v-model="form.code" placeholder="请输入短信验证码" maxlength="6" />
              <el-button type="primary" @click="handleSendCode" :disabled="countdown > 0">
                {{ countdown > 0 ? `${countdown}秒后重发` : '发送验证码' }}
              </el-button>
            </div>
          </el-form-item>

          <!-- 图片验证码并行验证 -->
          <el-form-item label="验证" prop="captcha">
            <div class="captcha-row">
              <el-input
                v-model="form.captcha"
                placeholder="请输入图片验证码"
                maxlength="4"
                style="flex: 1"
              />
              <div style="color: #000" class="captcha-img" @click="refreshCaptcha">
                {{ captchaCode }}
              </div>
            </div>
          </el-form-item>

          <el-form-item style="font-weight: 700" label="角色">
            <el-radio-group v-model="form.role">
              <el-radio style="font-weight: 700" value="buyer">买家</el-radio>
              <el-radio style="font-weight: 700" value="seller">卖家</el-radio>
              <el-radio style="font-weight: 700" value="admin">管理员</el-radio>
            </el-radio-group>
          </el-form-item>

          <div class="btn-group">
            <el-button type="primary" @click="submitLogin">登录</el-button>
            <el-button @click="$router.push('/register')">注册</el-button>
          </div>
        </el-form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onUnmounted } from 'vue'
import { ElMessage, FormInstance, FormRules } from 'element-plus'
import { useRouter } from 'vue-router'
import { login, sendSmsCode, loginByCode } from '@/api/front/user'
import { useUserStore } from '@/store/modules/user'

const router = useRouter()
const userStore = useUserStore()

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
const loginType = ref('password')
const countdown = ref(0)
let timer: any = null



const form = ref({
  username: '',
  password: '',
  code: '',
  captcha: '',
  role: 'buyer' as 'buyer' | 'seller' | 'admin',
})

const formRef = ref<FormInstance>()

// 图片验证码
const chars = '0123456789ABCDEFGHIJKLMNPQRSTUVWXYZ'
const captchaCode = ref('')

const generateCaptcha = () => {
  let code = ''
  for (let i = 0; i < 4; i++) {
    code += chars[Math.floor(Math.random() * chars.length)]
  }
  captchaCode.value = code
}
const refreshCaptcha = () => generateCaptcha()
generateCaptcha()

//图片验证码必填 
const rules = ref<FormRules>({
  username: [{ required: true, message: '请输入用户名/手机号', trigger: 'blur' }],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, max: 13, message: '密码长度6-13位', trigger: 'blur' },
  ],
  code: [{ required: true, message: '请输入短信验证码', trigger: 'blur' }],
  captcha: [
    { required: true, message: '请输入图片验证码', trigger: 'blur' },
    {//@ts-ignore
      validator: (rule: any, value: string, callback: any) => {
        if (value?.toUpperCase() === captchaCode.value) callback()
        else callback(new Error('图片验证码错误'))
      },
    },
  ],
})

// 发送短信验证码 
const handleSendCode = async () => {
  const phone = form.value.username
  if (!/^1[3-9]\d{9}$/.test(phone)) {
    ElMessage.error('请输入正确的11位手机号！')
    return
  }

  try {
    const res = await sendSmsCode({ phone })//@ts-ignore
    if (res.code === 200) {
      ElMessage.success('短信已发送：' + res.data.code)
      countdown.value = 60
      timer = setInterval(() => {
        countdown.value--
        if (countdown.value <= 0) clearInterval(timer)
      }, 1000)
    } else {//@ts-ignore
      ElMessage.error(res.msg || '发送失败')
    }
  } catch (error) {
    ElMessage.error('发送失败')
  }
}

// 登录校验 
const submitLogin = async () => {
  if (!formRef.value) return ElMessage.error('表单异常')

  try {
    await formRef.value.validate()
  } catch {
    ElMessage.warning('请完善信息')
    return
  }

  if (loginType.value === 'password') {
    try {
      const res = await login(form.value)//@ts-ignore
      if (res.code === 200) {//@ts-ignore
        userStore.login({ token: res.data.token, user: { ...res.data.user, role: form.value.role } })
        ElMessage.success({message:'登录成功',offset:80})
        switch (form.value.role) {
          case 'admin': router.replace('/admin'); break
          case 'seller': router.replace('/seller'); break
          default: router.replace('/home')
        }
      } else {//@ts-ignore
        ElMessage.error({message:res.msg || '登录失败',offset:80})
        refreshCaptcha()
      }
    } catch (err) {
      ElMessage.error('服务器异常')
      refreshCaptcha()
    }
  } else {
    try {
      const res = await loginByCode({
        phone: form.value.username,
        code: form.value.code,
        role: form.value.role,
      })//@ts-ignore
      if (res.code === 200) {//@ts-ignore
        userStore.login({ token: res.data.token, user: { ...res.data.user, role: form.value.role } })
        ElMessage.success({message:'登录成功',offset:80})
        switch (form.value.role) {
          case 'admin': router.replace('/admin'); break
          case 'seller': router.replace('/seller'); break
          default: router.replace('/home')
        }
      } else {//@ts-ignore
        ElMessage.error({message:res.msg || '登录失败',offset:80})
        refreshCaptcha()
      }
    } catch (err) {
      ElMessage.error('服务器异常')
      refreshCaptcha()
    }
  }
}

onUnmounted(() => clearInterval(timer))
</script>



<style scoped>
.code-box {
  display: flex;
  gap: 10px;
}
.captcha-row {
  display: flex;
  gap: 10px;
  align-items: center;
}
.captcha-img {
  width: 120px;
  height: 40px;
  line-height: 40px;
  text-align: center;
  border: 1px solid #ccc;
  border-radius: 4px;
  cursor: pointer;
  font-size: 18px;
  font-weight: bold;
  letter-spacing: 2px;
  user-select: none;
}
.beij {
  width: 100%;
  height: 100vh;
}
.home-top-navwy {
  padding: 20px 50px;
}
.login-page {
  display: flex;
  justify-content: center;
  align-items: center;
  height: calc(100vh - 100px);
}
.box {
  width: 450px;
  padding: 30px;
  border: 1px solid #eee;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}
.gwy {
  margin-bottom: 20px;
}
.btn-group {
  display: flex;
  gap: 15px;
  justify-content: center;
  margin-top: 10px;
}
</style>

<style scoped>
* {
  user-select: none !important;
  -webkit-user-select: none !important;
}
input,
textarea,
button {
  user-select: auto !important;
  -webkit-user-select: auto !important;
}
.beij {
  width: 100%;
  height: 100vh !important;
  background: url(/public/img/flzc.jpg);
  background-color: #ffffff !important;
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  background-attachment: fixed;
}

.login-page {
  height: 100vh;
  position: relative;
  top: 30px;
  
  display: flex;
  align-items: center;
  justify-content: center;
}
.gwy {
  position: absolute;
  font-weight: 700;
  margin-top: -30.5px;
  margin-left: -30px;
  z-index: 10;
  padding: 0 5px 0 5px;
}
.home-top-navwy {
  position: absolute;
  width: 100vw;
  height: 80px;
  background-color: rgb(224, 222, 221);
}
.box {
  width: 440px;
  padding: 30px;
  background-color: rgba(255, 255, 255, 0.9);
  border-radius: 8px;
  border: 1px solid rgb(0, 0, 0);
}

.code-box {
  display: flex;
  gap: 10px;
  align-items: center;
}
.login-tabs {
  margin-bottom: 20px;
}

.captcha-row {
  display: flex;
  gap: 10px;
  align-items: center;
}
.captcha-img {
  width: 100px;
  height: 38px;
  line-height: 38px;
  text-align: center;
  background: #f0f2f5;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  font-weight: bold;
  font-size: 18px;
  letter-spacing: 4px;
  cursor: pointer;
  user-select: none !important;
  transition: all 0.2s;
}
.captcha-img:hover {
  background: #e9edf2;
}

.btn-group {
  display: flex;
  gap: 15px;
  margin-left: 110px;
  margin-top: 10px;
}
</style>



