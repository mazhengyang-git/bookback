const pool = require('../config/db');
const {
  isSalesCountedStatus,
  adjustBookSalesDelta,
} = require('../utils/bookSales');

// 省市区数据转成编码名称映射 
const regionMap = {};
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
// 递归构建编码 → 名称映射
function buildRegionMap(options) {
  options.forEach(option => {
    regionMap[option.value] = option.label;
    if (option.children && option.children.length) {
      buildRegionMap(option.children);
    }
  });
}
buildRegionMap(regionOptions);
// ===================== 获取订单接口 =====================
const getUserOrders = async (req, res) => {
  try {
    const userId = req.user.id;
    // 关联 seller 店铺表，查询店铺信息
    const [orders] = await pool.execute(`
      SELECT 
        o.*, 
        b.book_name, 
        b.cover AS book_cover,
        n.book_name AS new_book_name,
        n.cover AS new_book_cover,
        s.book_name AS seller_book_name,
        s.cover AS seller_book_cover,
        -- 店铺字段（匹配你的 seller 表）
        se.id AS shop_id,
        se.shop_name,
        se.avatar AS seller_avatar
      FROM \`order\` o
      LEFT JOIN book b ON o.book_id = b.id AND o.source = 'normal'
      LEFT JOIN newbook n ON o.book_id = n.id AND o.source = 'new'
      LEFT JOIN seller_book s ON o.book_id = s.id AND o.source = 'seller'
      -- 关联店铺表（核心！）
      LEFT JOIN seller se ON s.seller_id = se.id
      WHERE o.user_id = ?
      ORDER BY o.create_time DESC
    `, [userId]);
    // 编码转中文 + 注入店铺数据
    const formatOrders = orders.map(item => {
      const provinceName = regionMap[item.province] || item.province || '';
      const cityName = regionMap[item.city] || item.city || '';
      const districtName = regionMap[item.district] || item.district || '';
      return {
        id: item.id,
        orderNo: item.order_no,
        bookName: item.source === 'new' 
          ? item.new_book_name 
          : (item.source === 'seller' ? item.seller_book_name : item.book_name) || '未知图书',
        count: item.count,
        totalPrice: Number(item.total_price) || 0,
        status: item.status || '已付款',
        bookCover: item.source === 'new' 
          ? (item.new_book_cover || '/default-book.png') 
          : (item.source === 'seller' ? (item.seller_book_cover || '/default-book.png') : (item.book_cover || '/default-book.png')),
        createTime: item.create_time || '',
        bookId: item.book_id,
        source: item.source,
        province: provinceName,
        city: cityName,
        district: districtName,
        detailAddress: item.detail_address,
        fullAddress: `${provinceName} ${cityName} ${districtName} ${item.detail_address || ''}`.trim(),
        // 店铺信息
        shopId: item.shop_id || null,
        shopName: item.shop_name || '官方店铺',
        sellerAvatar: item.seller_avatar || '/default-avatar.png'
      };
    });

    res.json({ code: 200, msg: '获取订单成功', data: formatOrders });
  } catch (error) {
    console.error('[订单接口错误]', error);
    res.status(500).json({ code: 500, msg: '获取订单失败', data: [] });
  }
};

// ===================== 删除订单 =====================
const deleteOrders=async(req,res)=>{
  let connection;
  try{
    const {orderno}=req.body
    const userId=req.user.id

    if (!orderno) {
      return res.status(400).json({ code: 400, msg: '订单编号不能为空',data:null });
    } 

    connection = await pool.getConnection();
    await connection.beginTransaction();

    const [orderResult]=await connection.execute(
      `SELECT book_id, \`count\`, status, source, COALESCE(sales_recorded,0) AS sales_recorded FROM \`order\` WHERE \`order_no\` = ? AND user_id = ?`, 
      [orderno, userId]
    ); 

    if (!orderResult.length) {
      await connection.rollback();
      return res.status(403).json({ code: 403, msg: '无权删除该订单', data: null });
    }   

    const order = orderResult[0];
    const paidStatus = ["已付款", "待发货", "已完成", "已发货","待收货", "已收货"];

    if (Number(order.sales_recorded) === 1) {
      await adjustBookSalesDelta(connection, order, -Math.abs(Number(order.count) || 0));
    }
    
    // 库存回滚
    if (paidStatus.includes(order.status)) {
      if (order.source === 'new') {
        await connection.execute(
          `UPDATE newbook SET stock = stock + ? WHERE id = ?`,
          [order.count, order.book_id]
        );
      } else if (order.source === 'seller') {
        await connection.execute(
          `UPDATE seller_book SET stock = stock + ? WHERE id = ?`,
          [order.count, order.book_id]
        );
      } else {
        await connection.execute(
          `UPDATE book SET stock = stock + ? WHERE id = ?`,
          [order.count, order.book_id]
        );
      }
    }
    if (!['已取消', '已完成', '已收货'].includes(order.status)) {
      await connection.rollback();
      return res.status(400).json({ code: 400, msg: '仅已完成/已取消订单可删除', data: null });
    }
    const [result]= await connection.execute(
      'DELETE FROM `order` WHERE `order_no` = ? AND user_id = ?', 
      [orderno, userId]
    );

    await connection.commit();
    res.status(200).json({ code: 200, msg: '删除成功，库存已恢复', data: null });

  } catch(error){
    if(connection) await connection.rollback();
    console.error('删除订单失败：', error);
    res.status(500).json({ code: 500, msg: '服务器错误',data:null });
  } finally {
    if(connection) connection.release();
  }
}
const updateOrderStatus = async (req, res) => {
  let connection;
  try {
    const { orderNo, status } = req.body;
    const userId = req.user.id;

    if (!orderNo || !status) {
      return res.status(400).json({ code: 400, msg: '参数错误' });
    }

    // 仅允许用户修改为这两个状态
    const allowStatus = ['已收货', '已取消'];
    if (!allowStatus.includes(status)) {
      return res.status(403).json({ code: 403, msg: '非法状态' });
    }

    connection = await pool.getConnection();
    await connection.beginTransaction();

    // 查询订单
    const [orderRows] = await connection.execute(
      'SELECT id, book_id, `count`, status, source, IFNULL(sales_recorded, 0) AS sales_recorded FROM `order` WHERE order_no = ? AND user_id = ? FOR UPDATE',
      [orderNo, userId]
    );

    if (!orderRows.length) {
      await connection.rollback();
      return res.status(404).json({ code: 404, msg: '订单不存在' });
    }

    const oldOrder = orderRows[0];
    const oldStatus = oldOrder.status;

    // 1. 确认收货：只能 待收货 → 已收货
    if (status === '已收货' && oldStatus !== '待收货') {
      await connection.rollback();
      return res.json({ code: 400, msg: '只有待收货订单可确认收货' });
    }

    // 2. 退货退款：只能 待收货/已发货 → 已取消
    if (status === '已取消' && !['待收货', '已发货'].includes(oldStatus)) {
      await connection.rollback();
      return res.json({ code: 400, msg: '该订单无法退货退款' });
    }

    // ===================== 销量逻辑 =====================
    const oldCounted = isSalesCountedStatus(oldStatus);
    const newCounted = isSalesCountedStatus(status);
    const recorded = !!oldOrder.sales_recorded;

    console.log('===== 用户端订单销量调试 =====');
    console.log('旧状态:', oldStatus, '是否计数:', oldCounted);
    console.log('新状态:', status, '是否计数:', newCounted);
    console.log('是否已记录销量:', recorded);
    console.log('============================');

    // 先更新订单状态
    await connection.execute(
      'UPDATE `order` SET status = ? WHERE order_no = ? AND user_id = ?',
      [status, orderNo, userId]
    );

   
    // 1. 非计数状态 → 计数状态（比如待收货 → 已收货）：加销量 + 标记1
    if (newCounted && !oldCounted && !recorded) {
      console.log('✅ 用户确认收货：增加销量');
      await adjustBookSalesDelta(connection, oldOrder, Number(oldOrder.count) || 0);
      await connection.execute('UPDATE `order` SET sales_recorded = 1 WHERE id = ?', [oldOrder.id]);
    }

    // 2. 计数状态 → 非计数状态（比如待收货/已发货 → 已取消）：减销量 + 标记0 + 回滚库存
    else if (!newCounted && oldCounted && recorded) {
      console.log('✅ 用户退货退款：扣减销量');
      await adjustBookSalesDelta(connection, oldOrder, -Math.abs(Number(oldOrder.count) || 0));
      await connection.execute('UPDATE `order` SET sales_recorded = 0 WHERE id = ?', [oldOrder.id]);
      
      // 回滚库存
      if (oldOrder.source === 'new') {
        await connection.execute('UPDATE newbook SET stock = stock + ? WHERE id = ?', [oldOrder.count, oldOrder.book_id]);
      } else if (oldOrder.source === 'seller') {
        await connection.execute('UPDATE seller_book SET stock = stock + ? WHERE id = ?', [oldOrder.count, oldOrder.book_id]);
      } else {
        await connection.execute('UPDATE book SET stock = stock + ? WHERE id = ?', [oldOrder.count, oldOrder.book_id]);
      }
    }
    // ------------------------------------------------------------------------

    await connection.commit();
    res.json({ code: 200, msg: '订单状态修改成功' });

  } catch (err) {
    if (connection) await connection.rollback();
    console.error('修改订单状态错误：', err);
    res.json({ code: 500, msg: '操作失败' });
  } finally {
    if (connection) connection.release();
  }
};
module.exports = { getUserOrders,deleteOrders, updateOrderStatus };