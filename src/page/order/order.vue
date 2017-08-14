<template>
  <div id="orderList">
    <my-header :my-title="pageTitle" :is-back="false">

    </my-header>
    <main class="poup">
      <div class="order-status-title">
        <ul>
          <template v-for="(item,idx) in titleBarList">
            <li :class="{'li-avtive':checkTitleIndex==idx}" @click="titleBarCheck(idx,item.val)">
              {{item.txt}}
            </li>
          </template>
        </ul>
      </div>
      <!-- 全部订单 -->
      <my-dropload @refresh="refreshList" @more="moreList" ref="dropload">
        <div class="order-item-box" ref="mainList">
          <ul>
            <template v-for="item in orderList">
              <li class="order-item">
                <p class="order-num clear">
                  <span>编号：{{item.orderNum}}</span>
                  <span>{{tipTxt(item)}}</span>
                </p>
                <div class="order-info clear" @click="openProduct(item)">
                  <div class="order-img">
                    <img src="" :src="item.img" alt="">
                  </div>
                  <div class="order-name">
                    <p>{{item.providerNameCn}}</p>
                    <span>门票类型:{{item.productNameCn}}</span>
                  </div>
                  <div class="order-price">
                    <span>¥{{item.money / item.count}}</span>
                    <span>x{{item.count}}</span>
                  </div>
                </div>
                <p class="order-total clear">
                  <span>合计：¥{{item.money}}</span>
                  <span>
                    <button @click="itemClick(item)">查看详情</button>
                     <template v-if="checkTitleVal==0">
                       <button v-if="item.flagPay==0" @click="pay(item)">立即付款</button>
                     </template>
                  </span>
                </p>
              </li>
            </template>
          </ul>
        </div>

        <!-- 无订单 -->
        <template v-if="isNull">
          <div class="none-order">
            <img src="../../res/img/not-order.png" alt="">
            <p>查询不到订单</p>
          </div>
        </template>
      </my-dropload>
    </main>
    <my-footer :foot-index="footIndex" @menu-check="clickFootMenu">

    </my-footer>
  </div>
</template>
<script>
  import Vue from 'vue'
  import xyz from '@/lib/wp-xyz'
  import VmUtils from '@/lib/vm-utils'
  import common from '@/lib/wp-common'
  import myHeader from '@/utils/header'
  import myDropload from '@/utils/dropload'
  import myFooter from '@/utils/footer'

  let vm, utils = new VmUtils()

  export default{
    name: 'order',
    components: {myHeader, myDropload, myFooter},
    mounted(){
      vm = utils.init(this)
      initPage();
    },
    activated () {
      common.testLoginInfo(utils.router, window, xyz)
      queryList(vm.page = 1);
    },
    data() {
      return {
        pageTitle: '我的订单',
        footList: ['icon-fenlei', 'icon-order', 'icon-me'],
        footIndex: 'order',
        titleBarList: [{txt: '未支付', val: 0}, {txt: '已支付', val: 1}, {txt: '已关闭', val: 2}],
        checkTitleIndex: 1,
        checkTitleVal: 1,
        orderList: [],
        skuList: [],
        productImgs: null,
        isNull: true,
        page: 0
      }
    },
    methods: {
      'tipTxt'  (item) {
        let tipTxt = item['flagPay'] === 1 ? '已支付' : '未支付';
        tipTxt = (item['flagPay'] === 0 && item['flagOver'] === 1) ? '交易关闭' : tipTxt;
        tipTxt = item['isException'] === 1 ? '异常订单' : tipTxt;
        return tipTxt
      },
      'clickFootMenu'  (idx) {
        utils.routerReplace(idx)
      },
      'titleBarCheck'  (idx, val) {
        this.checkTitleIndex = idx;
        this.checkTitleVal = val;
        queryList(vm.page = 1);
      },
      'openProduct'  (item) {
        let data = {
          numberCode: item.provider
        };

        utils.routerPush('supDet', data, {name: utils.routeName})
      },
      'itemClick'  (item) {
        let data = {
          orderNum: item.orderNum,
          shopCount: item.count,
          money: item.money / item.count,
          flag: this.checkTitleVal,
          img: item.img
        };
        utils.routerPush('orderDetails', data, {name: utils.routeName})
      },
      'pay'  (item) {
        let orderNum = item.orderNum;
        let money = item.money;

        if (xyz.isNull(orderNum)) {
          utils.vuxToast('订单编号不存在无法发起支付', 'warn')
          return
        }
        if (xyz.isNull(money) || money <= 0) {
          utils.vuxToast('订单金额异常无法发起支付', 'warn')
          return
        }

        xyz.ajax({
          url: 'BuyerOrderWS/decideOrder.cus',
          data: {
            apikey: window.localStorage.apikey,
            orderNum: orderNum,
            money: money
          },
          loading: utils.vux.loading,
          success (data) {
            if (data.status === 1) {

              let param = {
                title: (item.providerNameCn + ' ' + item.productNameCn).substring(0, 15),
                orderNum: orderNum,
                money: money,
                img: item.img
              };

              utils.routerPush('cashier', param, {name: utils.routeName})
            } else {
              utils.vuxToast(data.msg, 'warn')
            }
          }
        })
      },
      'hrefEval'  (item) {
        let param = {
          provider: item.provider,
          orderNum: item.orderNum
        };
        utils.routerPush('evaluate', param, {name: utils.routeName})
      },
      'moreList'() {
        queryList(++this.page)
      },
      'refreshList'(){
        queryList(this.page = 1)
      }
    }
  }


  function queryList(page) {
    if (page < 1) {
      done(true, vm.isNull)
      return;
    }

    let url = 'BuyerOrderWS/queryOrderList.cus';
    let data = {
      apikey: window.localStorage.apikey,
      page: page,
      rows: 10,
      flag: vm.checkTitleVal,
      productType: 'SC'
    };

    xyz.ajax({
      url: url,
      data: data,
      loading: utils.vux.loading,
      success (data) {
        if (data.status === 1) {
          let result = data.content;//当前数据条数

          let total = data.content['total']
          vm.isNull = total <= 0;

          if (page === 1 || vm.isNull) {
            vm.orderList = [];
          }

          for (let i = 0; i < result.rows.length; i++) {
            let row = result.rows[i];
            vm.orderList.push(row);
          }

          Vue.nextTick(common.wResize)
          done(!(vm.orderList.length === total ), vm.isNull)

          getProductImg();
        } else {
          vm.isNull = true;
          done(true, vm.isNull)
          utils.vuxToast(data.msg, 'warn')
        }
      },
      error  () {
        vm.isNull = true;
        done(true, vm.isNull)
        utils.vuxToast('无法访问服务器啦', 'warn')
      }
    })
  }

  function done(isNotMore, isHide) {
    utils.getDom('dropload').$emit('done', isNotMore, isHide)
  }

  //获取产品图片
  function getProductImg() {
    if (!vm.productImgs) {
      xyz.ajax({
        url: 'BuyerScenicWS/getScenicProductImg.cus',
        data: {
          apikey: window.localStorage.apikey
        },
        success (data) {
          if (data.status === 1) {
            let result = data.content;
            vm.productImgs = result;
            for (let i = 0; i < vm.orderList.length; i++) {
              let item = vm.orderList[i];
              let img = result[item.product];
              item.img = xyz.getMiddleImageUrl(img ? img : '');
              vm.orderList.splice(i, 1, item);
            }
          } else {
            utils.vuxToast(data.msg, 'warn')
          }
        }
      });
    } else {
      for (let i = 0; i < vm.orderList.length; i++) {
        let item = vm.orderList[i];
        let img = vm.productImgs[item.product];
        item.img = xyz.getMiddleImageUrl(img ? img : '');
        vm.orderList.splice(i, 1, item);
      }
    }
  }

  function initPage() {
    let o = utils.routeQuery()

    if (o && o.checkIndex) {
      vm.checkTitleIndex = o.checkIndex;
    } else {
      vm.checkTitleIndex = 1;
    }

    vm.checkTitleVal = vm.titleBarList[vm.checkTitleIndex].val;
  }

</script>
<style lang="less" src="./order.less">

</style>
