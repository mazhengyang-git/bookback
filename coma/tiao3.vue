<template>
  <div class="zongg">
    <div class="n11">
      <li class="liis">
        <div class="container">
          <div v-for="(e, index) in chexuan" :key="index" class="item">
           <router-link :to="e.route!">
              <span
                style="
                  display: grid !important;
                  grid-template-columns: repeat(auto-fit, minmax(100px, 1fr)) !important;
                  grid-gap: 20px;
                "
                ><img :src="e.img" class="aatu"
              /></span>
            </router-link>
            <router-link :to="e.route!" class="aaa">
              <span style="position: relative; left: -73px">{{ e.ming }}</span>
            </router-link>
          </div>
        </div>

        <br />
        <hr />
        <br />
       
          <li class="liiss">
            <router-link
              v-for="(e, index) in chejia"
              :key="index"
              class="aaaa"
              :to="e.routee"
              @mouseenter="showCategory(index)"
              @mouseleave="resetToDefault"
            >
              &nbsp;{{ e.img }}
            </router-link>

            <br />
          </li>
      
        <hr style="position: relative; top: -70px" />

        <div class="zuo" v-for="(e, index) in zuo"  :key="index"  @mouseenter="zuo3zuo=index" @mouseleave="zuo3zuo=-1">
          <router-link :to="e.eou"   >{{
            e.n
          }}</router-link>
          <div class="zuo3zuo" v-if="zuo3zuo===index">

<router-link class="zuoee" v-if="zuo3zuo===2" to="/纯电汽车">纯电汽车</router-link>
<router-link class="zuoff" v-if="zuo3zuo===2" to="/油电混动">油电混动</router-link>
<router-link class="zuogg" v-if="zuo3zuo===2" to="/氢能源">氢能源</router-link>
<router-link class="zuoee" v-if="zuo3zuo===1" to="/小型轿车">小型轿车</router-link>
<router-link class="zuoff" v-if="zuo3zuo===1" to="/中型轿车">中型轿车</router-link>
<router-link class="zuogg" v-if="zuo3zuo===1" to="/大型轿车">大型轿车</router-link>
<router-link class="zuoee" v-if="zuo3zuo===0" to="/紧凑型suv">紧凑型</router-link>
<router-link class="zuoff" v-if="zuo3zuo===0" to="/中大型suv">中大型</router-link>
<router-link class="zuogg" v-if="zuo3zuo===0" to="/大型suv">大型</router-link>
</div>
</div>

        <!-- 内容区域 -->
        <span style="position: relative; top: -80px">
          <div class="containerr">
            <!-- 热门车(默认) -->
            <div v-show="chejia[0].show">
              <div class="category-row">
                <div class="category-item">
                  <div class="car-list">
                    <div class="car-item" v-for="car in carCategories[0].cars" :key="car.name">
                      <router-link class="rx1" :to="car.rue">
                        <div class="car-name">{{ car.name }}</div>
                      </router-link>
                      <hr />
                      <div class="car-links">
                        <router-link class="rx2" :to="car.rueb || car.rue"
                          ><span>报价</span></router-link
                        >
                        |
                        <router-link class="rx3" :to="car.ruet || car.rue"
                          ><span>图库</span></router-link
                        >
                        |
                        <router-link class="rx4" :to="car.rues || car.rue"
                          ><span>社区</span></router-link
                        >
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- 推荐车 -->
            <div v-show="chejia[1].show">
              <div class="category-row">
                <div class="category-item">
                  <div class="car-list">
                    <div class="car-item" v-for="car in carCategories[1].cars" :key="car.name">
                      <router-link class="rx1" :to="car.rue">
                        <div class="car-name">{{ car.name }}</div>
                      </router-link>
                      <hr />
                      <div class="car-links">
                        <router-link class="rx2" :to="car.rueb"><span>报价</span></router-link> |
                        <router-link class="rx3" :to="car.ruet"><span>图库</span></router-link> |
                        <router-link class="rx4" :to="car.rues"><span>社区</span></router-link>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- 6-9w车 -->
            <div v-show="chejia[2].show">
              <div class="category-row">
                <div class="category-item">
                  <div class="car-list">
                    <div class="car-item" v-for="car in carCategories[2].cars" :key="car.name">
                      <router-link class="rx1" :to="car.rue">
                        <div class="car-name">{{ car.name }}</div>
                      </router-link>
                      <hr />
                      <div class="car-links">
                        <router-link class="rx2" :to="car.rueb"><span>报价</span></router-link> |
                        <router-link class="rx3" :to="car.ruet"><span>图库</span></router-link> |
                        <router-link class="rx4" :to="car.rues"><span>社区</span></router-link>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div v-show="chejia[3].show">
              <div class="category-row">
                <div class="category-item">
                  <div class="car-list">
                    <div class="car-item" v-for="car in carCategories[3].cars" :key="car.name">
                      <router-link class="rx1" :to="car.rue">
                        <div class="car-name">{{ car.name }}</div>
                      </router-link>
                      <hr />
                      <div class="car-links">
                        <router-link class="rx2" :to="car.rueb"><span>报价</span></router-link> |
                        <router-link class="rx3" :to="car.ruet"><span>图库</span></router-link> |
                        <router-link class="rx4" :to="car.rues"><span>社区</span></router-link>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div v-show="chejia[4].show">
              <div class="category-row">
                <div class="category-item">
                  <div class="car-list">
                    <div class="car-item" v-for="car in carCategories[4].cars" :key="car.name">
                      <router-link class="rx1" :to="car.rue">
                        <div class="car-name">{{ car.name }}</div>
                      </router-link>
                      <hr />
                      <div class="car-links">
                        <router-link class="rx2" :to="car.rueb"><span>报价</span></router-link> |
                        <router-link class="rx3" :to="car.ruet"><span>图库</span></router-link> |
                        <router-link class="rx4" :to="car.rues"><span>社区</span></router-link>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div v-show="chejia[5].show">
              <div class="category-row">
                <div class="category-item">
                  <div class="car-list">
                    <div class="car-item" v-for="car in carCategories[5].cars" :key="car.name">
                      <router-link class="rx1" :to="car.rue">
                        <div class="car-name">{{ car.name }}</div>
                      </router-link>
                      <hr />
                      <div class="car-links">
                        <router-link class="rx2" :to="car.rueb"><span>报价</span></router-link> |
                        <router-link class="rx3" :to="car.ruet"><span>图库</span></router-link> |
                        <router-link class="rx4" :to="car.rues"><span>社区</span></router-link>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <!-- 其他价格区间... -->
            <div v-show="chejia[6].show">
              <div class="category-row">
                <div class="category-item">
                  <div class="car-list">
                    <div class="car-item" v-for="car in carCategories[6].cars" :key="car.name">
                      <router-link class="rx1" :to="car.rue">
                        <div class="car-name">{{ car.name }}</div>
                      </router-link>
                      <hr />
                      <div class="car-links">
                        <router-link class="rx2" :to="car.rueb"><span>报价</span></router-link> |
                        <router-link class="rx3" :to="car.ruet"><span>图库</span></router-link> |
                        <router-link class="rx4" :to="car.rues"><span>社区</span></router-link>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div v-show="chejia[7].show">
              <div class="category-row">
                <div class="category-item">
                  <div class="car-list">
                    <div class="car-item" v-for="car in carCategories[7].cars" :key="car.name">
                      <router-link class="rx1" :to="car.rue">
                        <div class="car-name">{{ car.name }}</div>
                      </router-link>
                      <hr />
                      <div class="car-links">
                        <router-link class="rx2" :to="car.rueb"><span>报价</span></router-link> |
                        <router-link class="rx3" :to="car.ruet"><span>图库</span></router-link> |
                        <router-link class="rx4" :to="car.rues"><span>社区</span></router-link>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </span>
        <xialun />
      </li>
    </div>
  </div>
  <ylun />
</template>

<script lang="ts">
export default {
  name: 'tiao3',
  //components: { Preson, people },
}
</script>

<script lang="ts" setup>
import { reactive, ref } from 'vue'
import xiab from '../coma/xiab.vue'
import { useRouter } from 'vue-router'
import xialun from '../coma/xialun.vue'
import ylun from '../coma/youlun.vue'
components: {
  xialun
}
let zuo3zuo=ref(-1)
let showc = ref(true)

const showhover = ref(false)
const showhoverr = ref(false)
const showhove = ref(false)
const router = useRouter()

const jiaoche = () => {
  router.push('/jiaoche')
}

let chexuan = reactive([
  {
    img: '../img/新能源车.png',
    ming: '新能源',
    route: '/ny',
  },
  { img: '../img/轿车.png', ming: '轿车', route: '/jiaoche' },
  { img: '../img/suv (1).png', ming: 'SUV', route: '/suv' },
  { img: '../img/MPV-侧.png', ming: 'MPV' },
  { img: '../img/豪华型车型.png', ming: '豪华品牌' },
  { img: '../img/跑车.png', ming: '跑车' },
  { img: '../img/皮卡.png', ming: '皮卡' },
  { img: '../img/面包车.png', ming: '面包' },
])

let chejia = reactive([
  { img: '热门车', routee: '/热门车', show: true }, // 默认显示
  { img: '推荐', routee: '/推荐', show: false },
  { img: '6-9w', routee: '/6-9w', show: false },
  { img: '9-16w', routee: '/9-16w', show: false },
  { img: '16-23w', routee: '/16-23w', show: false },
  { img: '23-35w', routee: '/23-35w', show: false },
  { img: '35-50w', routee: '/35-50w', show: false },
  { img: '50w以上', routee: '/jiaoche', show: false },
])
let zuo = reactive([
  { n: ' SUV >', eou: '/suv' },
  { n: ' 轿车 >', eou: '/jiaoche' },
  { n: '新能源 >', eou: '/ny' },
])
let carCategories = reactive([
  // 热门车(默认显示)
  {
    cars: [
      {
        name: 'eπ007',
        rue: '/jiaoche',
        rueb: '/eπ007报价',
        ruet: '/eπ007图库',
        rues: '/eπ007社区',
      },
      {
        name: '特斯拉 Model 3',
        rue: '/特斯拉M3',
        rueb: '/特斯拉M3报价',
        ruet: '/特斯拉M3图库',
        rues: '/特斯拉M3社区',
      },
      {
        name: '比亚迪汉 EV',
        rue: '/ByD汉',
        rueb: '/比亚迪汉EV报价',
        ruet: '/比亚迪汉EV图库',
        rues: '/比亚迪汉EV社区',
      },
      {
        name: '大众朗逸',
        rue: '/大众朗逸',
        rueb: '/大众朗逸报价',
        ruet: '/大众朗逸图库',
        rues: '/大众朗逸社区',
      },
      {
        name: '大众速腾',
        rue: '/大众速腾',
        rueb: '/大众速腾报价',
        ruet: '/大众速腾图库',
        rues: '/大众速腾社区',
      },
      {
        name: '蔚来 ET7',
        rue: '/蔚来ET7',
        rueb: '/蔚来ET7报价',
        ruet: '/蔚来ET7图库',
        rues: '/蔚来ET7社区',
      },
      {
        name: '捷达 VS7',
        rue: '/捷达VS7',
        rueb: '/捷达VS7报价',
        ruet: '/捷达VS7图库',
        rues: '/捷达VS7社区',
      },
      {
        name: '本田 埃尔法',
        rue: '/本田埃尔法',
        rueb: '/本田埃尔法报价',
        ruet: '/本田埃尔法图库',
        rues: '/本田埃尔法社区',
      },
      {
        name: '保时捷 911',
        rue: '/保时捷911',
        rueb: '/保时捷911报价',
        ruet: '/保时捷911图库',
        rues: '/保时捷911社区',
      },
      {
        name: '红旗H9',
        rue: '/红旗H9',
        rueb: '/红旗H9报价',
        ruet: '/红旗H9图库',
        rues: '/红旗H9社区',
      },
      {
        name: '沃尔沃S60',
        rue: '/沃尔沃S60',
        rueb: '/沃尔沃S60报价',
        ruet: '/沃尔沃S60图库',
        rues: '/沃尔沃S60社区',
      },
      {
        name: '本田 奥德赛',
        rue: '/本田.奥德赛',
        rueb: '/本田.奥德赛报价',
        ruet: '/本田.奥德赛图库',
        rues: '/本田.奥德赛社区',
      },
      {
        name: '奔驰 C级',
        rue: '/奔驰C级',
        rueb: '/奔驰C级报价',
        ruet: '/奔驰C级图库',
        rues: '/奔驰C级社区',
      },
      {
        name: '宝马 5系',
        rue: '/宝马5系',
        rueb: '/宝马5系报价',
        ruet: '/宝马5系图库',
        rues: '/宝马5系社区',
      },
      {
        name: '奥迪 A6',
        rue: '/奥迪A6',
        rueb: '/奥迪A6报价',
        ruet: '/奥迪A6图库',
        rues: '/奥迪A6社区',
      },
    ],
  },
  // 推荐车
  {
    cars: [
      {
        name: '路虎揽胜',
        rue: '/路虎揽胜',
        rueb: '/路虎揽胜报价',
        ruet: '/路虎揽胜图库',
        rues: '/路虎揽胜社区',
      },
      {
        name: '丰田 卡罗拉',
        rue: '/丰田卡罗拉',
        rueb: '/丰田卡罗拉报价',
        ruet: '/丰田卡罗拉图库',
        rues: '/丰田卡罗拉社区',
      },
      {
        name: '凯迪拉克CT5',
        rue: '/凯迪拉克CT5',
        rueb: '/凯迪拉克CT5报价',
        ruet: '/凯迪拉克CT5图库',
        rues: '/凯迪拉克CT5社区',
      },
      {
        name: '比亚迪秦 PLUS',
        rue: '/比亚迪秦PLUS',
        rueb: '/比亚迪秦PLUS报价',
        ruet: '/比亚迪秦PLUS图库',
        rues: '/比亚迪秦PLUS社区',
      },
      {
        name: '长城炮 皮卡',
        rue: '/长城炮皮卡',
        rueb: '/长城炮皮卡报价',
        ruet: '/长城炮皮卡图库',
        rues: '/长城炮皮卡社区',
      },
      {
        name: '广汽传祺 M8',
        rue: '/广汽传祺M8',
        rueb: '/广汽传祺M8报价',
        ruet: '/广汽传祺M8图库',
        rues: '/广汽传祺M8社区',
      },
      {
        name: '本田 CR5',
        rue: '/本田CR5',
        rueb: '/本田CR5报价',
        ruet: '/本田CR5图库',
        rues: '/本田CR5社区',
      },
      {
        name: '奔驰 E级',
        rue: '/奔驰E级',
        rueb: '/奔驰E级报价',
        ruet: '/奔驰E级图库',
        rues: '/奔驰E级社区',
      },
      {
        name: '宝马 3系',
        rue: '/宝马3系',
        rueb: '/宝马3系报价',
        ruet: '/宝马3系图库',
        rues: '/宝马3系社区',
      },
      {
        name: '奥迪 A4',
        rue: '/奥迪A6',
        rueb: '/奥迪A6报价',
        ruet: '/奥迪A6图库',
        rues: '/奥迪A6社区',
      },
      {
        name: '保时捷 718',
        rue: '/保时捷718',
        rueb: '/保时捷718报价',
        ruet: '/保时捷718图库',
        rues: '/保时捷718社区',
      },
      {
        name: '红旗H7',
        rue: '/红旗H7',
        rueb: '/红旗H7报价',
        ruet: '/红旗H7图库',
        rues: '/红旗H7社区',
      },
      {
        name: '红旗L5',
        rue: '/红旗L5',
        rueb: '/红旗L5报价',
        ruet: '/红旗L5图库',
        rues: '/红旗L5社区',
      },
      {
        name: '奔驰B级',
        rue: '/奔驰B级',
        rueb: '/奔驰B级报价',
        ruet: '/奔驰B级图库',
        rues: '/奔驰B级社区',
      },
      {
        name: '保时捷卡宴',
        rue: '/保时捷卡宴',
        rueb: '/保时捷卡宴报价',
        ruet: '/保时捷卡宴图库',
        rues: '/保时捷卡宴社区',
      },
    ],
  },
  // 6-9w车
  {
    cars: [
      {
        name: '五菱宏光缤果',
        rue: '/五菱宏光缤果',
        rueb: '/五菱宏光缤果报价',
        ruet: '/五菱宏光缤果图库',
        rues: '/五菱宏光缤果社区',
      },
      {
        name: '奇瑞艾瑞泽5',
        rue: '/奇瑞艾瑞泽5',
        rueb: '/奇瑞艾瑞泽5报价',
        ruet: '/奇瑞艾瑞泽5图库',
        rues: '/奇瑞艾瑞泽5社区',
      },
      {
        name: '比亚迪驱逐舰05',
        rue: '/比亚迪驱逐舰05',
        rueb: '/比亚迪驱逐舰05报价',
        ruet: '/比亚迪驱逐舰05图库',
        rues: '/比亚迪驱逐舰05社区',
      },
      {
        name: '比亚迪海鸥',
        rue: '/比亚迪海鸥',
        rueb: '/比亚迪海鸥报价',
        ruet: '/比亚迪海鸥图库',
        rues: '/比亚迪海鸥社区',
      },
      {
        name: '吉利几何E萤火虫',
        rue: '/吉利几何E萤火虫',
        rueb: '/吉利几何E萤火虫报价',
        ruet: '/吉利几何E萤火虫图库',
        rues: '/吉利几何E萤火虫社区',
      },
      {
        name: '五菱Air ev晴空',
        rue: '/五菱Air ev晴空',
        rueb: '/五菱Air ev晴空报价',
        ruet: '/五菱Air ev晴空图库',
        rues: '/五菱Air ev晴空社区',
      },
      {
        name: '五菱宏光星驰',
        rue: '/五菱宏光星驰',
        rueb: '/五菱宏光星驰报价',
        ruet: '/五菱宏光星驰图库',
        rues: '/五菱宏光星驰社区',
      },
      { name: '飞度', rue: '/飞度', rueb: '/飞度报价', ruet: '/飞度图库', rues: '/飞度社区' },
      { name: 'MG5', rue: '/MG5', rueb: '/MG5报价', ruet: '/MG5图库', rues: '/MG5社区' },
      {
        name: '荣威i5',
        rue: '/荣威i5',
        rueb: '/荣威i5报价',
        ruet: '/荣威i5图库',
        rues: '/荣威i5社区',
      },
      {
        name: '零跑T03',
        rue: '/零跑T03',
        rueb: '/零跑T03报价',
        ruet: '/零跑T03图库',
        rues: '/零跑T03社区',
      },
      {
        name: '吉利星愿',
        rue: '/吉利星愿',
        rueb: '/吉利星愿报价',
        ruet: '/吉利星愿图库',
        rues: '/吉利星愿社区',
      },
      {
        name: '吉利帝豪CVT',
        rue: '/吉利帝豪CVT',
        rueb: '/吉利帝豪CVT报价',
        ruet: '/吉利帝豪CVT图库',
        rues: '/吉利帝豪CVT社区',
      },
      {
        name: '大众Polo',
        rue: '/大众Polo',
        rueb: '/大众Polo报价',
        ruet: '/大众Polo图库',
        rues: '/大众Polo社区',
      },
      {
        name: '现代伊兰特',
        rue: '/现代伊兰特',
        rueb: '/现代伊兰特报价',
        ruet: '/现代伊兰特图库',
        rues: '/现代伊兰特社区',
      },
    ],
  },
  //9-16W
  {
    cars: [
      {
        name: '长安起源A06',
        rue: '/长安起源A06',
        rueb: '/长安起源A06报价',
        ruet: '/长安起源A06图库',
        rues: '/长安起源A06社区',
      },
      {
        name: '比亚迪海豹06 EV',
        rue: '/比亚迪海豹06EV',
        rueb: '/比亚迪海豹06EV报价',
        ruet: '/比亚迪海豹06EV图库',
        rues: '/比亚迪海豹06EV社区',
      },
      {
        name: '零跑B01',
        rue: '/零跑B01',
        rueb: '/零跑B01报价',
        ruet: '/零跑B01图库',
        rues: '/零跑B01社区',
      },
      {
        name: '起亚K5',
        rue: '/起亚K5',
        rueb: '/起亚K5报价',
        ruet: '/起亚K5图库',
        rues: '/起亚K5社区',
      },
      {
        name: '大众宝来',
        rue: '/大众宝来',
        rueb: '/大众宝来报价',
        ruet: '/大众宝来图库',
        rues: '/大众宝来社区',
      },
      {
        name: '蔚来 HS5',
        rue: '/蔚来HS5',
        rueb: '/蔚来HS5报价',
        ruet: '/蔚来HS5图库',
        rues: '/蔚来HS5社区',
      },
      {
        name: '捷达 VS5',
        rue: '/捷达VS5',
        rueb: '/捷达VS5报价',
        ruet: '/捷达VS5图库',
        rues: '/捷达VS5社区',
      },
      {
        name: '哈弗 H6',
        rue: '/哈弗H6',
        rueb: '/哈弗H6报价',
        ruet: '/哈弗H6图库',
        rues: '/哈弗H6社区',
      },
      {
        name: '五菱宏光凯捷',
        rue: '/五菱宏光凯捷',
        rueb: '/五菱宏光凯捷报价',
        ruet: '/五菱宏光凯捷图库',
        rues: '/五菱宏光凯捷社区',
      },
      {
        name: '广汽传祺M6',
        rue: '/广汽传祺M6',
        rueb: '/广汽传祺M6报价',
        ruet: '/广汽传祺M6图库',
        rues: '/广汽传祺M6社区',
      },
      {
        name: '奇瑞瑞虎7 PLUS',
        rue: '/奇瑞瑞虎7PLUS',
        rueb: '/奇瑞瑞虎7PLUS报价',
        ruet: '/奇瑞瑞虎7PLUS图库',
        rues: '/奇瑞瑞虎7PLUS社区',
      },
      {
        name: '丰田雷凌',
        rue: '/丰田雷凌',
        rueb: '/丰田雷凌报价',
        ruet: '/丰田雷凌图库',
        rues: '/丰田雷凌社区',
      },
      {
        name: '吉利帝豪L 雷神',
        rue: '/吉利帝豪L雷神',
        rueb: '/吉利帝豪L雷神报价',
        ruet: '/吉利帝豪L雷神图库',
        rues: '/吉利帝豪L雷神社区',
      },
      {
        name: '别克威朗',
        rue: '/别克威朗',
        rueb: '/别克威朗报价',
        ruet: '/别克威朗图库',
        rues: '/别克威朗社区',
      },
      {
        name: '北京现代 途胜',
        rue: '/北京现代途胜',
        rueb: '/北京现代途胜报价',
        ruet: '/北京现代途胜图库',
        rues: '/北京现代途胜社区',
      },
    ],
  },
  // 16-23w
  {
    cars: [
      {
        name: '长安起源A09',
        rue: '/长安起源A09',
        rueb: '/长安起源A09报价',
        ruet: '/长安起源A09图库',
        rues: '/长安起源A09社区',
      },
      {
        name: '小米YU7',
        rue: '/小米YU7',
        rueb: '/小米YU7报价',
        ruet: '/小米YU7图库',
        rues: '/小米YU7社区',
      },
      {
        name: '大众帕萨特',
        rue: '/大众帕萨特',
        rueb: '/大众帕萨特报价',
        ruet: '/大众帕萨特图库',
        rues: '/大众帕萨特社区',
      },
      {
        name: '红旗HS5',
        rue: '/红旗HS5',
        rueb: '/红旗HS5报价',
        ruet: '/红旗HS5图库',
        rues: '/红旗HS5社区',
      },
      {
        name: '大众迈腾',
        rue: '/大众迈腾',
        rueb: '/大众迈腾报价',
        ruet: '/大众迈腾图库',
        rues: '/大众迈腾社区',
      },
      {
        name: '沃尔沃S60',
        rue: '/沃尔沃S60',
        rueb: '/沃尔沃S60报价',
        ruet: '/沃尔沃S60图库',
        rues: '/沃尔沃S60社区',
      },
      {
        name: '大众途岳',
        rue: '/大众途岳',
        rueb: '/大众途岳报价',
        ruet: '/大众途岳图库',
        rues: '/大众途岳社区',
      },
      {
        name: '小鹏P7+',
        rue: '/小鹏P7+',
        rueb: '/小鹏P7+报价',
        ruet: '/小鹏P7+图库',
        rues: '/小鹏P7+社区',
      },
      {
        name: '坦克300',
        rue: '/坦克300',
        rueb: '/坦克300报价',
        ruet: '/坦克300图库',
        rues: '/坦克300社区',
      },
      {
        name: '大众途观L',
        rue: '/大众途观L',
        rueb: '/大众途观L报价',
        ruet: '/大众途观L图库',
        rues: '/大众途观L社区',
      },
      {
        name: '凯迪拉克CT5',
        rue: '/凯迪拉克CT5',
        rueb: '/凯迪拉克CT5报价',
        ruet: '/凯迪拉克CT5图库',
        rues: '/凯迪拉克CT5社区',
      },
      {
        name: '大众途安',
        rue: '/大众途安',
        rueb: '/大众途安报价',
        ruet: '/大众途安图库',
        rues: '/大众途安社区',
      },
      {
        name: '红旗H6',
        rue: '/红旗H6',
        rueb: '/红旗H6报价',
        ruet: '/红旗H6图库',
        rues: '/红旗H6社区',
      },
      {
        name: '本田雅阁',
        rue: '/本田雅阁',
        rueb: '/本田雅阁报价',
        ruet: '/本田雅阁图库',
        rues: '/本田雅阁社区',
      },
      {
        name: '红旗E-HS3',
        rue: '/红旗E-HS3',
        rueb: '/红旗E-HS3报价',
        ruet: '/红旗E-HS3图库',
        rues: '/红旗E-HS3社区',
      },
    ],
  },
  //23-35W
  {
    cars: [
      {
        name: '红旗H9',
        rue: '/红旗H9',
        rueb: '/红旗H9报价',
        ruet: '/红旗H9图库',
        rues: '/红旗H9社区',
      },
      {
        name: '宝马3系',
        rue: '/宝马3系',
        rueb: '/宝马3系报价',
        ruet: '/宝马3系图库',
        rues: '/宝马3系社区',
      },
      {
        name: '大众途昂',
        rue: '/大众帕萨特',
        rueb: '/大众帕萨特报价',
        ruet: '/大众帕萨特图库',
        rues: '/大众帕萨特社区',
      },
      {
        name: '红旗HS7',
        rue: '/红旗HS7',
        rueb: '/红旗HS7报价',
        ruet: '/红旗HS7图库',
        rues: '/红旗HS7社区',
      },
      {
        name: '大众迈腾',
        rue: '/大众迈腾',
        rueb: '/大众迈腾报价',
        ruet: '/大众迈腾图库',
        rues: '/大众迈腾社区',
      },
      {
        name: '沃尔沃XC40',
        rue: '/沃尔沃XC40',
        rueb: '/沃尔沃XC40报价',
        ruet: '/沃尔沃XC40图库',
        rues: '/沃尔沃XC40社区',
      },
      {
        name: '大众CC',
        rue: '/大众CC',
        rueb: '/大众CC报价',
        ruet: '/大众CC图库',
        rues: '/大众CC社区',
      },
      {
        name: '奔驰C级',
        rue: '/奔驰C级',
        rueb: '/奔驰C级报价',
        ruet: '/奔驰C级图库',
        rues: '/奔驰C级社区',
      },
      {
        name: '坦克400',
        rue: '/坦克400',
        rueb: '/坦克400报价',
        ruet: '/坦克400图库',
        rues: '/坦克400社区',
      },
      {
        name: '奥迪A4L',
        rue: '/奥迪A4L',
        rueb: '/奥迪A4L报价',
        ruet: '/奥迪A4L图库',
        rues: '/奥迪A4L社区',
      },
      {
        name: '凯迪拉克CT5',
        rue: '/凯迪拉克CT5',
        rueb: '/凯迪拉克CT5报价',
        ruet: '/凯迪拉克CT5图库',
        rues: '/凯迪拉克CT5社区',
      },
      {
        name: '大众威然',
        rue: '/大众威然',
        rueb: '/大众威然报价',
        ruet: '/大众威然图库',
        rues: '/大众威然社区',
      },
      {
        name: '极氪001',
        rue: '/极氪001',
        rueb: '/极氪001报价',
        ruet: '/极氪001图库',
        rues: '/极氪001社区',
      },
      {
        name: '蔚来ET5',
        rue: '/蔚来ET5',
        rueb: '/蔚来ET5报价',
        ruet: '/蔚来ET5图库',
        rues: '/蔚来ET5社区',
      },
      {
        name: '红旗E-HS3',
        rue: '/红旗E-HS3',
        rueb: '/红旗E-HS3报价',
        ruet: '/红旗E-HS3图库',
        rues: '/红旗E-HS3社区',
      },
    ],
  },
  //35-50W
  {
    cars: [
      {
        name: '红旗H9PLUS',
        rue: '/红旗H9PLUS',
        rueb: '/红旗H9PLUS报价',
        ruet: '/红旗H9PLUS图库',
        rues: '/红旗H9PLUS社区',
      },
      {
        name: '宝马5系',
        rue: '/宝马5系',
        rueb: '/宝马5系报价',
        ruet: '/宝马5系图库',
        rues: '/宝马5系社区',
      },
      {
        name: '大众途昂',
        rue: '/大众帕萨特',
        rueb: '/大众帕萨特报价',
        ruet: '/大众帕萨特图库',
        rues: '/大众帕萨特社区',
      },
      {
        name: '红旗HS7',
        rue: '/红旗HS7',
        rueb: '/红旗HS7报价',
        ruet: '/红旗HS7图库',
        rues: '/红旗HS7社区',
      },
      {
        name: '奔驰E级',
        rue: '/奔驰E级',
        rueb: '/奔驰E级报价',
        ruet: '/奔驰E级图库',
        rues: '/奔驰E级社区',
      },
      {
        name: '沃尔沃XC60',
        rue: '/沃尔沃XC60',
        rueb: '/沃尔沃XC60报价',
        ruet: '/沃尔沃XC60图库',
        rues: '/沃尔沃XC60社区',
      },
      {
        name: '凯迪拉克CT6',
        rue: '/凯迪拉克CT6',
        rueb: '/凯迪拉克CT6报价',
        ruet: '/凯迪拉克CT6图库',
        rues: '/凯迪拉克CT6社区',
      },
      {
        name: '奔驰C级',
        rue: '/奔驰C级',
        rueb: '/奔驰C级报价',
        ruet: '/奔驰C级图库',
        rues: '/奔驰C级社区',
      },
      {
        name: '坦克500',
        rue: '/坦克500',
        rueb: '/坦克500报价',
        ruet: '/坦克500图库',
        rues: '/坦克500社区',
      },
      {
        name: '奥迪A5',
        rue: '/奥迪A5',
        rueb: '/奥迪A5报价',
        ruet: '/奥迪A5图库',
        rues: '/奥迪A5社区',
      },
      {
        name: '奥迪A6L',
        rue: '/奥迪A6L',
        rueb: '/奥迪A6L报价',
        ruet: '/奥迪A6L图库',
        rues: '/奥迪A6L社区',
      },
      {
        name: '雷克萨斯ES',
        rue: '/雷克萨斯ES',
        rueb: '/雷克萨斯ES报价',
        ruet: '/雷克萨斯ES图库',
        rues: '/雷克萨斯ES社区',
      },
      {
        name: '宝马X3',
        rue: '/宝马X3',
        rueb: '/宝马X3报价',
        ruet: '/宝马X3图库',
        rues: '/宝马X3社区',
      },
      {
        name: '蔚来ET7',
        rue: '/蔚来ET7',
        rueb: '/蔚来ET7报价',
        ruet: '/蔚来ET7图库',
        rues: '/蔚来ET7社区',
      },
      {
        name: '红旗E-HS3',
        rue: '/红旗E-HS3',
        rueb: '/红旗E-HS3报价',
        ruet: '/红旗E-HS3图库',
        rues: '/红旗E-HS3社区',
      },
    ],
  },
  //50W+
  {
    cars: [
      {
        name: '红旗H9PLUS',
        rue: '/红旗H9PLUS',
        rueb: '/红旗H9PLUS报价',
        ruet: '/红旗H9PLUS图库',
        rues: '/红旗H9PLUS社区',
      },
      {
        name: '宝马5系',
        rue: '/宝马5系',
        rueb: '/宝马5系报价',
        ruet: '/宝马5系图库',
        rues: '/宝马5系社区',
      },
      {
        name: '大众途昂',
        rue: '/大众帕萨特',
        rueb: '/大众帕萨特报价',
        ruet: '/大众帕萨特图库',
        rues: '/大众帕萨特社区',
      },
      {
        name: '红旗HS7',
        rue: '/红旗HS7',
        rueb: '/红旗HS7报价',
        ruet: '/红旗HS7图库',
        rues: '/红旗HS7社区',
      },
      {
        name: '奔驰E级',
        rue: '/奔驰E级',
        rueb: '/奔驰E级报价',
        ruet: '/奔驰E级图库',
        rues: '/奔驰E级社区',
      },
      {
        name: '沃尔沃XC60',
        rue: '/沃尔沃XC60',
        rueb: '/沃尔沃XC60报价',
        ruet: '/沃尔沃XC60图库',
        rues: '/沃尔沃XC60社区',
      },
      {
        name: '凯迪拉克CT6',
        rue: '/凯迪拉克CT6',
        rueb: '/凯迪拉克CT6报价',
        ruet: '/凯迪拉克CT6图库',
        rues: '/凯迪拉克CT6社区',
      },
      {
        name: '奔驰S级',
        rue: '/奔驰S级',
        rueb: '/奔驰S级报价',
        ruet: '/奔驰S级图库',
        rues: '/奔驰S级社区',
      },
      {
        name: '坦克500',
        rue: '/坦克500',
        rueb: '/坦克500报价',
        ruet: '/坦克500图库',
        rues: '/坦克500社区',
      },
      {
        name: '奥迪A5',
        rue: '/奥迪A5',
        rueb: '/奥迪A5报价',
        ruet: '/奥迪A5图库',
        rues: '/奥迪A5社区',
      },
      {
        name: '奥迪A6L',
        rue: '/奥迪A6L',
        rueb: '/奥迪A6L报价',
        ruet: '/奥迪A6L图库',
        rues: '/奥迪A6L社区',
      },
      {
        name: '雷克萨斯ES',
        rue: '/雷克萨斯ES',
        rueb: '/雷克萨斯ES报价',
        ruet: '/雷克萨斯ES图库',
        rues: '/雷克萨斯ES社区',
      },
      {
        name: '宝马X5',
        rue: '/宝马X5',
        rueb: '/宝马X5报价',
        ruet: '/宝马X5图库',
        rues: '/宝马X5社区',
      },
      {
        name: '蔚来ET7',
        rue: '/蔚来ET7',
        rueb: '/蔚来ET7报价',
        ruet: '/蔚来ET7图库',
        rues: '/蔚来ET7社区',
      },
      {
        name: '红旗E-HS3',
        rue: '/红旗E-HS3',
        rueb: '/红旗E-HS3报价',
        ruet: '/红旗E-HS3图库',
        rues: '/红旗E-HS3社区',
      },
    ],
  },
])
// 鼠标悬停方法
const showCategory = (index: number) => {
  chejia.forEach((item, i) => {
    item.show = i === index
  })
}
const resetToDefault = () => {
  // 只有当没有其他分类被激活时才重置
  if (!chejia.some((item, i) => i !== 0 && item.show)) {
    chejia.forEach((item, i) => {
      item.show = i === 0
    })
  }
}
</script>

<style>
.zuo3zuo{
  position: absolute;
 
 white-space: nowrap;
 top: -20px;
 color: #000;
 font-size: 16px;
display: grid;
left: 30px;
}
.zuoee {
  display: block;
  text-decoration: none;
 padding: 2px 15px 3px 15px;
  background-color: lavender;
  border-top: 0.5px rgb(224, 129, 21) solid;
   color: rgb(234, 17, 197);
    user-select: none;
}
.zuoff {
  display: block;
  text-decoration: none;
  padding: 2px 15px 3px 15px;
  background-color: lavender;
  border-top: 0.5px rgb(224, 129, 21) solid;
   color: rgb(234, 17, 197);
}
.zuogg {
  display: block;
  text-decoration: none;
  padding: 2px 15px 3px 15px;
  background-color: lavender;
  border-top: 0.5px rgb(224, 129, 21) solid;
  color: rgb(234, 17, 197);
}
.zuoee:hover,
.zuoff:hover,
.zuogg:hover{
  background-color: rgb(214, 184, 201);
  color: red;
}
.zuo {
  display: flex;
  position: relative;
  margin-bottom: 56px;
  text-decoration: none;
  color: black;
  font-weight: 600;
  left: 80px;
  top: -53px;
  font-size: 20px;
 user-select: none;
  width: 80px;
}

.zuo:hover {
  transform: scale(1.1);
}

.zongg {
  position: relative;
  z-index: 9800;
  transition: all 0.5s;
   user-select: none;
}

.v-showw {
  display: flex !important;
}

.liiss {
  list-style-type: none;
  display: inline-block;
  position: relative;

  margin-top: 40px;

  padding-bottom: 30px !important;
}

.aaaa {
  display: inline-block;
  z-index: 12000;
  left: -28px;
  position: relative;
  margin-top: 5px;
  padding-left: 55px;
  font-size: 20px;
  font-weight: bolder;
  text-decoration: none;
  color: black;
}

.container {
  display: inline-flex;
  flex-wrap: wrap;
  position: relative;

  left: 10.5px;
}

.item {
  position: relative;
  left: 17px;
  margin-bottom: 20px;
  text-align: center;
  justify-items: center;
  justify-content: center;
  align-items: center;
}

.aatu {
  width: 90px;
  height: var(--image-height);
  object-fit: cover;
  margin-bottom: 5px;
  margin-right: 20px;
  padding-right: 35px;
  position: relative;
  transform: scale(1.2);
  left: 1.7px;
}

.aaa {
  text-decoration: none;
  color: black;
  font-weight: 500;
  font-size: 16px;
  position: relative;
  display: grid;
  top: -5px;
  left: 52px;
  transform: scale(1.1);
}

.item:hover .aatu {
  filter: drop-shadow(0 0 5px rgb(230, 98, 10)) brightness(1.2) contrast(1);

  transition: transform 0.7s;
}

.item:hover .aaa {
  filter: drop-shadow(0 0 5px rgb(230, 98, 10)) brightness(1.2) contrast(1);

  transition: transform 0.7s;
}

.containerr {
  position: relative;
  left: 250px;
  font-size: 14px;
  top: -185px;
  display: flex; /* 使用Flexbox */
  flex-wrap: wrap; /* 允许换行 */
}

.category-row {
  display: flex; /* 一行显示 */
  width: 800px; /* 确保占据所有可用空间 */
  /* 间距 */
  flex-wrap: wrap;
}

.category-item {
  text-align: center; /* 让内容居中 */
  width: 800px; /* 占据整行宽度 */
  box-sizing: border-box; /* 确保padding不影响整体宽度 */
}

.category-icon {
  font-size: 1.5em;
}

.category-name {
  font-weight: bold;

  font-size: 14px;
}

/* 关键修改：车辆列表改为网格布局 */
.car-list {
  display: grid;
  grid-template-columns: repeat(5, 1fr); /* 5列布局 */
  grid-template-rows: repeat(3, auto); /* 3行 */
  gap: 15px; /* 车辆项之间的间距 */
  z-index: 15000;
}

.car-item {
  padding: 5px;
  text-align: center; /* 内容居中 */
}

.car-name {
  margin-bottom: 3px;
  font-size: 16px; /* 增加字体大小 */
}

.car-links {
  font-size: 0.75em;
  color: #888;
}

.car-links span {
  margin: 0 3px;
}

.rx1 {
  text-decoration: none;
  color: #000;
  font-weight: 400;
  font-size: 17px;
}

.rx2 {
  text-decoration: none;
  color: #a19d9d;
  font-weight: 400;
  font-size: 15px;
}

.rx3 {
  text-decoration: none;
  color: #a19d9d;
  font-weight: 400;
  font-size: 15px;
}

.rx4 {
  text-decoration: none;
  color: #a19d9d;
  font-weight: 400;
  font-size: 15px;
}

.rx2:hover,
.rx3:hover,
.rx4:hover {
  color: rgb(84, 71, 71);
}

.rx1:hover {
  font-weight: 800;
  transition: all 0.3s;
}

/* 响应式布局：小屏幕上调整为3列 */

.containerr {
  left: 200px;
  top: -250px;
  margin-top: 20px;
}

.liis {
  list-style-type: none;
  display: inline-block;
  position: relative;
  background: linear-gradient(to top, rgb(197, 168, 126), rgb(255, 255, 255),rgb(205, 190, 190));

  padding-bottom: 30px !important;
  left: 139.5px;
  flex-direction: column;
  height: 750px;
  margin-top: -71px;
  transition: all 0.8s;
  transform: scale(0.8);
  border-left: 1px rgb(270, 219, 218) solid;
  border-right: 1px rgb(270, 218, 218) solid;
   border-bottom: 1px rgb(270, 218, 218) solid;
}
.liis:hover {
  transition: all 0.8s;
  border-left: 1px red solid;
  border-right: 1px red solid;
   border-bottom: 1px red solid;
  transform: scale(0.806);
}

.liiss {
  left: 48px;
  top: -60px;
}

/* 调整内容区域宽度 */
</style>
