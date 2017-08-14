<template>
  <div id="supplierDetail" @touchmove="tMove" @touchstart="tMove" @touchend="tMove">
    <my-header :my-title="pageTitle" :is-back="true" @go-back="goBack">

    </my-header>
    <main class="poup">
      <template>
        <div class="page1" :style="{top: (slideTop-100)+'%',height: poupHeight}" ref="page1">
          <div class="comm-img" ref="page1-img">
            <img src="../../res/img/default.png" :src="providerObj.img" ref="mainImg">
          </div>
          <div class="comm-info-wraper" ref="page1-info">
            <div class="comm-info clear">
              <div class="comm-info-left">
                <p class="comm-name" v-cloak>{{providerObj.nameCn}}</p>
                <span v-cloak>{{providerObj.price}}<i>{{providerObj.price == '暂无' ? '' : '起'}}</i></span>
              </div>
              <div class="comm-info-right" @click="collection">
                <i class="iconfont"
                   :class="{'icon-icon':!isCollection,'icon-aixin':isCollection}"></i>
                <span v-cloak>{{isCollection ? '已收藏' : '&nbsp;&nbsp;收藏&nbsp;&nbsp;'}}</span>
              </div>
            </div>
            <div class="comm-info comm-address clear" @click="callMap">
              <i class="iconfont icon-dizhi"></i>
              <p v-cloak>{{providerObj.address.length > 0 ? providerObj.address : '商家未填写地址'}}</p>
              <i class="iconfont icon-gengduo"></i>
            </div>
            <div class="comm-info comm-tel clear" @click="callPhone">
              <i class="iconfont icon-dianhua"></i>
              <p v-cloak>{{providerObj.phone.length > 0 ? providerObj.phone : '商家未填写电话'}}</p>
              <i class="iconfont icon-gengduo"></i>
            </div>
          </div>
          <p class="more-derc" :class="{'more-derc-now':upMoveTxt}" @click="clickMove" ref="page1-txt">
            向上滑动或点击查看图文详情</p>
        </div>
      </template>
      <!-- 图文详情 -->
      <template>
        <div class="img-derc-wraper" :style="{top:slideTop+'%'}">
          <div class="derc-title">
            <ul @click="detailMenuClick($event)">
              <li :class="{'line-active':detailType=='js'}" data-type="js">介绍</li>
              <li :class="{'line-active':detailType=='pj'}" data-type="pj">评价</li>
            </ul>
          </div>
          <!-- 介绍模块 开始 -->
          <template v-if="detailType=='js'">
            <div class="derc-details introduce-wraper" :style="{height: detailHeight}" ref="page2">
              <div class="seize"></div>
              <div class="card">
                <template v-if="providerObj.remark||providerObj.coverImage.length>0">
                  <p>{{providerObj.remark}}</p>
                  <template v-for="item in providerObj.coverImage">
                    <img src="" :src="item">
                  </template>
                </template>
                <template v-else>
                  <div class="none-data">
                    <img src="" :src="nothingImg" alt="">
                    <p>暂时没有介绍...</p>
                  </div>
                </template>
              </div>
            </div>
          </template>
          <!-- 介绍模块 结束 -->

          <!-- 评价模块 开始 -->
          <template v-if="detailType=='pj'">
            <div class="derc-details evaluate-box" :style="{height: detailHeight}" ref="page3">
              <div class="seize"></div>
              <div class="card">
                <div class="evaluate-title">
                  <p>
                    <i class="iconfont icon-e637" :class="{'not-check':averageScore<0.5}"></i>
                    <i class="iconfont icon-e637" :class="{'not-check':averageScore<1.5}"></i>
                    <i class="iconfont icon-e637" :class="{'not-check':averageScore<2.5}"></i>
                    <i class="iconfont icon-e637" :class="{'not-check':averageScore<3.5}"></i>
                    <i class="iconfont icon-e637" :class="{'not-check':averageScore<4.5}"></i>
                    <span class="score">{{averageScore}}<i>/5.0分</i></span>
                  </p>
                  <span class="evaluate-num">{{pjList.length}}人评价</span>
                </div>
                <div class="evaluate-list">
                  <ul>
                    <template v-for="item in pjList">
                      <li class="clear">
                        <div class="user-img">
                          <img src="" :src="item.userImage">
                        </div>
                        <div class="evaluate-inner">
                          <span class="user-name">{{item.username}}</span>
                          <p>
                            <i class="iconfont icon-e637"
                               :class="{'not-check':item.score<1}"></i>
                            <i class="iconfont icon-e637"
                               :class="{'not-check':item.score<2}"></i>
                            <i class="iconfont icon-e637"
                               :class="{'not-check':item.score<3}"></i>
                            <i class="iconfont icon-e637"
                               :class="{'not-check':item.score<4}"></i>
                            <i class="iconfont icon-e637"
                               :class="{'not-check':item.score<5}"></i>
                            <span class="evaluate-date">{{item.addDate}}</span>
                          </p>
                          <p class="evaluate-content">
                            {{item.content}}
                          </p>
                        </div>
                      </li>
                    </template>
                  </ul>
                </div>
                <template v-if="pjIsMore">
                  <div class="evaluate-foot" @click="morePj">
                    {{pjMoreTxt}}
                  </div>
                </template>
              </div>
            </div>
          </template>
          <!-- 评价模块 结束 -->
        </div>
      </template>
    </main>
    <footer class="footer">
      <a href="javascript:" @click="hrefFillOrder">立即购买</a>
    </footer>
  </div>
</template>
<script>

  import xyz from '@/lib/wp-xyz'
  import VmUtils from '@/lib/vm-utils'
  import common from '@/lib/wp-common'
  import myHeader from '@/utils/header'
  let defaultImg = require('@/res/img/default.png')
  let defaultHead = require('@/res/img/default-head.png')
  let nothingImg = require('@/res/img/nothing.png')

  let vm, utils = new VmUtils()

  export default{
    components: {myHeader},
    name: 'supplierDetail',
    mounted(){
      vm = utils.init(this)
    },
    activated () {
      common.testLoginInfo(utils.router, window, xyz)
      initPage()
    },
    deactivated(){
      this.numberCode = ''
      this.slideTop = 100
      this.detailType = 'js'
      this.touchId = 0
      this.touchStart = 0
      this.touchMove = 0
      this.poupHeight = '100%'
      this.detailHeight = '100%'
      this.productList = []
      this.providerObj = {
        img: defaultImg,
        nameCn: '',
        price: '0.00',
        phone: '',
        address: '',
        loLa: '',
        remark: '',
        coverImage: []
      }
      this.pjList = []
      this.isCollection = false
      this.pjIsMore = false
      this.pjMoreTxt = '查看更多'
      this.pjPage = 1
      this.averageScore = 0
      this.upMoveTxt = true
    },
    data() {
      return {
        nothingImg: nothingImg,
        pageTitle: '商品详情',
        numberCode: '',
        slideTop: 100,
        detailType: 'js',
        touchId: 0,
        touchStart: 0,
        touchMove: 0,
        poupHeight: '100%',
        detailHeight: '100%',
        productList: [],
        providerObj: {
          img: defaultImg,
          nameCn: '',
          price: '0.00',
          phone: '',
          address: '',
          loLa: '',
          remark: '',
          coverImage: []
        },
        pjList: [],
        isCollection: false,
        pjIsMore: false,
        pjMoreTxt: '查看更多',
        pjPage: 1,
        averageScore: 0,
        upMoveTxt: true
      }
    },
    methods: {
      'goBack'  () {
        if (this.slideTop !== 100) {
          animationScroll(100);
        } else {
          utils.routerBack()
        }
      },
      'detailMenuClick'  (event) {
        this.detailType = event.target.dataset['type']
      },
      'clickMove'  () {
        animationScroll(-100)
      },
      'tMove'  (event) {
        if (event.touches.length > 0) {
          let e = event.touches[0];
          this.touchId = e['identifier'];
          if (e['identifier'] === this.touchId) {
            switch (event.type) {
              case 'touchstart':
                this.touchStart = e.screenY;
                this.touchMove = e.screenY;
                break;
              case 'touchend':
                movePage(this.touchStart, this.touchMove);
                break;
              case 'touchmove':
                this.touchMove = e.screenY;
                let page;
                if (this.slideTop === 0 && this.touchStart < this.touchMove) {
                  page = utils.getDom('page2')
                  if (!page) {
                    page = utils.getDom('page3')
                  }
                  if (page.scrollTop === 0) {
                    //用来阻止 微信  qq  浏览器 整个页面滑动导致下划返回第一个页面失效的情况
                    event.preventDefault();
                  }
                } else if (this.slideTop === 100 && this.touchStart > this.touchMove) {
                  page = utils.getDom('page1')
                  let nScrollHight = parseInt(page.scrollHeight);
                  let nScrollTop = Math.ceil(Number(page.scrollTop));
                  let height = Math.ceil(Number(page.style.height.replace('px', '')));
                  if (nScrollTop + height >= nScrollHight - 1) {
                    //用来阻止 微信  qq  和 苹果手机 浏览器 整个页面滑动导致上划进入下一个页面失效的情况
                    event.preventDefault();
                  }
                }
                break
            }
          }
        } else {
          movePage(this.touchStart, this.touchMove)
        }
      },
      'collection': collection,
      'morePj'  () {
        ++this.pjPage;
        queryCommentList(this.numberCode);
      },
      'hrefFillOrder'  () {
        let data = {
          numberCode: vm.numberCode,
          providerNameCn: vm.providerObj.nameCn,
          img: vm.providerObj.img
        }

        utils.routerPush('fillOrder', data, {name: utils.routeName})
      },
      'callMap'  () {
        let lola = this.providerObj.loLa;
        if (xyz.isNull(lola)) {
          utils.vuxToast('未设置位置，无法在地图中查看', 't')
          return
        }
        lola = lola.split(',');

        let data = {
          la: lola[0],
          lo: lola[1]
        };

//        xyz.href('page/map.html', 'page/map.html', data);
//                window.location.href = xyz.setUrlparam(xyz.getFullurl('page/map.html'), {la: lola[0], lo: lola[1]});
      },
      'callPhone'  () {
        let phone = this.providerObj.phone;
        if (xyz.isNull(phone)) {
          utils.vuxToast('商家未填写联系电话', 't');
          return;
        }
        utils.vuxConfirm('提示', '拨打电话' + phone, () => {
          window.location.href = 'tel:' + phone;
        });
      }
    }
  }
  function movePage(start, end) {
    let page, nScrollHight, nScrollTop, height
    if (vm.slideTop === 0 && end - start > 100) {
      page = utils.getDom('page2')
      if (!page) {
        page = utils.getDom('page3')
      }
      nScrollTop = parseInt(page.scrollTop);
      if (nScrollTop <= 5) {
        animationScroll(100);
      }
    } else if (vm.slideTop === 100 && end - start < -100) {
      page = vm.$refs['page1'];
      nScrollHight = parseInt(page.scrollHeight);
      nScrollTop = Math.ceil(Number(page.scrollTop));
      height = Math.ceil(Number(page.style.height.replace('px', '')));
      if (nScrollTop + height >= nScrollHight - 5) {
        animationScroll(-100)
      }
    }
  }

  function animationScroll(side) {
    let timers = 500;
    let fps = 120;
    let count = fps / (1000 / timers );
    let interval = timers / count;
    let distance = side / count;
    let id = setInterval(function () {
      if (vm.slideTop < 0) {
        vm.slideTop = 0;
        clearInterval(id)
      } else if (vm.slideTop > 100) {
        vm.slideTop = 100;
        clearInterval(id)
      } else {
        vm.slideTop += distance;
      }
    }, interval);
  }

  function initPage() {
    let p = utils.routeQuery()
    if (!p || !p.numberCode) {
      utils.vuxToast('参数错误，即将返回首页', 1000, utils.routerBack)
      return
    }

    vm.numberCode = p.numberCode;

    loadData(vm.numberCode);
    queryCommentList(vm.numberCode);
    queryList(vm.numberCode);

    //拉取个人收藏
    if (!xyz.isNull(window.localStorage.localCollectionList)) {
      let cList = JSON.parse(window.localStorage.localCollectionList);
      for (let i = 0; i < cList.list.length; i++) {
        if (cList.list[i] === vm.numberCode) {
          vm.isCollection = true;
          break;
        }
      }
    }

    initPageHight();
  }

  function initPageHight() {
    let rem = Number(document.getElementsByTagName('html')[0].style.fontSize.replace('px', ''));
    let mainHeight = window.innerHeight;
    let titleHeight = rem * 2.2;
    let footBtnHeight = rem * 2.45;
    vm.detailHeight = mainHeight - footBtnHeight - titleHeight + 'px';
    vm.poupHeight = mainHeight - footBtnHeight + 'px';

    utils.getDom('mainImg').onload = () => {
      setTimeout(() => {
        let page1Img = vm.$refs['page1-img'].clientHeight;
        let page1Info = vm.$refs['page1-info'].clientHeight;
        let page1Txt = vm.$refs['page1-txt'].clientHeight;

        vm.upMoveTxt = page1Img + page1Info + page1Txt <= window.innerHeight - titleHeight - footBtnHeight;
      }, 200)
    };
  }

  //增加 onresize  监听，每次 窗口大小改变时 重新计算 高度
  let resize = window.onresize;
  window.onresize = function () {
    initPageHight()
    resize()
  };

  //加载详情
  function loadData(numberCode) {
    xyz.ajax({
      url: 'BuyerProviderWS/getProvider.app',
      data: {
        numberCode: numberCode
      },
      loading: utils.vux.loading,
      progress: '加载中....',
      success (data) {
        if (data.status === 1) {
          let obj = data.content;

          vm.providerObj.img = xyz.isNull(obj.imageUrl) ? defaultImg : obj.imageUrl;
          vm.providerObj.nameCn = obj.nameCn;
          if (!xyz.isNull(obj.phone)) {
            vm.providerObj.phone = obj.phone;
          }
          if (!xyz.isNull(obj.address)) {
            vm.providerObj.address = obj.address;
          }
          if (!xyz.isNull(obj['lat']) && !xyz.isNull(obj['lng'])) {
            vm.providerObj.loLa = obj['lng'] + ',' + obj['lat'];
          }
          if (!xyz.isNull(obj.remark)) {
            vm.providerObj.remark = obj.remark;
          }
          if (!xyz.isNull(obj.coverImage)) {
            vm.providerObj.coverImage = obj.coverImage.split(',');
          }
        } else {
          utils.vuxToast(data.msg, 'warn')
        }
      }
    })
  }

  function queryCommentList(numberCode) {
    if (vm.pjMoreTxt === '加载中...') {
      return;
    }

    vm.pjMoreTxt = '加载中...';
    xyz.ajax({
      url: 'CommentWS/queryCommentListBySource.app',
      data: {
        source: numberCode,
        page: vm.pjPage,
        rows: 5
      },
      loading: utils.vux.loading,
      progress: '加载中....',
      success (data) {
        if (data.status === 1) {
          let result = data.content;
          if (result['total'] <= 0) {
            vm.pjPage = vm.pjPage--;
            vm.pjIsMore = true;
            vm.pjMoreTxt = '暂无买家评论';
          } else if (result.rows.length > 0) {
            vm.pjIsMore = true;
            vm.pjMoreTxt = '点击查看更多';
          } else {
            vm.pjPage = vm.pjPage--;
            vm.pjIsMore = false;
            vm.pjMoreTxt = '没有更多评价';
          }

          for (let i = 0; i < result.rows.length; i++) {
            let row = result.rows[i];

            let username = xyz.isNull(row.username) ? '未知' : row.username;
            if (xyz.isPhone(row.username)) {
              username = row.username.substr(0, 3) + '****' + row.username.substr(-4, 4)
            }
            row.username = username;

            let img = row.userImage;
            if (!xyz.isNull(img)) {
              let lastIndex = img.lastIndexOf("0");
              if (lastIndex === img.length - 1) {
                img = img.substring(0, img.lastIndexOf("0")) + '64';
              }
            } else {
              img = defaultHead;
            }

            row.userImage = img;

            vm.pjList.push(row);
          }

          let allScore = 0;
          for (let j = 0; j < vm.pjList.length; j++) {
            allScore += vm.pjList[j].score;
          }

          vm.averageScore = (allScore / (vm.pjList.length > 0 ? vm.pjList.length : 1)).toFixed(1);
        } else {
          utils.vuxToast(data.msg, 'warn')
          vm.pjList = [];
          vm.pjPage = 0;
          vm.pjIsMo = true;
          vm.pjMoreTxt = '点击重新加载评价';
        }
      }
    });
  }

  function queryList(numberCode) {
    xyz.ajax({
      url: 'BuyerScenicWS/queryScenicList.app',
      data: {
        provider: numberCode,
        page: 1,
        rows: 100
      },
      loading: utils.vux.loading,
      progress: '加载中....',
      success (data) {
        if (data.status === 1) {
          let result = data.content;
          if (result['total'] <= 0) {
            vm.providerObj.price = '暂无';
            vm.productList = [];
          }

          if (result.rows.length > 0) {
            let row = result.rows[0];
            vm.providerObj.price = '¥' + Number(row.price).toFixed(2);
            for (let i = 0; i < result.rows.length; i++) {
              vm.productList.push(result.rows[i]);
            }
          }
        } else {
          vm.productList = [];
          vm.providerObj.price = '暂无';
          utils.vuxToast(data.msg, 'warn')
        }
      }, error () {
        utils.vuxToast('无法访问服务器啦', 'warn')
        vm.providerObj.price = '暂无';
      }
    });
  }

  function collection() {
    xyz.ajax({
      url: 'CustomerWS/editCustomerCollectionFlag.cus',
      data: {
        apikey: window.localStorage.apikey,
        provider: vm.numberCode
      },
      loading: utils.vux.loading,
      progress: '加载中....',
      success (data) {
        if (data.status === 1) {
          let cList = JSON.parse(window.localStorage.localCollectionList);
          if (data.content === 'save') {
            if (!xyz.isNull(window.localStorage.localCollectionList)) {
              cList.list[cList.list.length] = vm.numberCode;

              utils.vuxToast('<br/>已收藏<br/><br/>', 'success')

              vm.isCollection = true;
              window.localStorage.localCollectionList = JSON.stringify(cList);
            }
          } else if (data.content === 'delete') {
            if (!xyz.isNull(window.localStorage.localCollectionList)) {
              let newArray = [];
              for (let i = 0; i < cList.list.length; i++) {
                if (cList.list[i] !== vm.numberCode) {
                  newArray.push(cList.list[i]);
                }
              }

              vm.isCollection = false;
              utils.vuxToast('<br/>取消收藏<br/><br/>', 'success')

              cList.list = newArray;
              window.localStorage.localCollectionList = JSON.stringify(cList);
            }
          }
        } else {
          utils.vuxToast(data.msg, 'warn')
        }
      }
    });
  }
</script>

<style lang="less" src="./supplierDetail.less">

</style>
