<template>
  <div id="orderDetails">
    <header>
      <a href="javascript:" class="left" @click="goBack"><i class="iconfont icon-fanhui"></i></a>
      <h1>订单详情</h1>
      <template v-if="orderObj.flagPay==1&&orderObj.flagAllowRefund==1">
        <a href="javascript:" class="right" @click="refundRequest">退款</a>
      </template>
    </header>
    <main class="poup">
      <template v-if="isFlagOver">
        <div class="order-tips" :style="{'color':flagOverStyle}" v-cloak>
          {{flagOverTxt}}
        </div>
      </template>
      <div class="order-info-list" v-cloak>
        <ul>
          <li class="clear">
            <span>订单编号</span>
            <p>{{orderObj.orderNum}}</p>
          </li>
          <li class="clear">
            <span>供应商</span>
            <p>{{orderObj.providerNameCn}}</p>
          </li>
          <li class="clear">
            <span>下单时间</span>
            <p>{{countAddDate}}</p>
          </li>
          <li class="clear">
            <span>出行日期</span>
            <p>{{goOutDate}}</p>
          </li>
        </ul>
      </div>
      <div class="order-info-list" v-cloak>
        <ul>
          <li class="clear">
            <span>产品</span>
            <p>{{orderObj.productNameCn}}</p>
          </li>
          <li class="clear">
            <span>数量</span>
            <p>{{orderObj.count}}张</p>
          </li>
          <li class="clear">
            <span>总金额</span>
            <p style="color:#ff9a14">¥{{Number(orderObj.money).toFixed(2)}}</p>
          </li>
        </ul>
      </div>
      <div class="order-info-list">
        <ul>
          <li class="clear">
            <label><span>联系人</span>
              <input type="text" v-model="orderObj.linkman" readonly>
            </label>
            <i class="iconfont icon-bianji" @click="linkUpdate"></i>
          </li>
          <li class="clear">
            <label><span>联系电话</span>
              <input type="tel" v-model="orderObj.linkPhone" readonly>
            </label>
            <i class="iconfont icon-bianji" @click="linkUpdate"></i>
          </li>
          <li class="clear">
            <label><span>{{orderObj.cardType ? orderObj.cardType : '身份证'}}</span>
              <input type="tel" v-model="orderObj.cardNum" readonly>
            </label>
            <i class="iconfont icon-bianji" @click="linkUpdate"></i>
          </li>
        </ul>
      </div>
    </main>
    <template v-if="payBtn">
      <footer class="footer" @click="checkPayOrder">
        <a href="javascript:">去付款</a>
      </footer>
    </template>
    <template v-if="pjBtn">
      <footer class="footer" @click="lockEval">
        <a href="javascript:">{{pjTxt}}</a>
      </footer>
    </template>
  </div>
</template>

<script>
  import xyz from '@/lib/wp-xyz'
  import common from '@/lib/wp-common'
  import VmUtils from '@/lib/vm-utils'

  let vm, utils = new VmUtils()
  export default{
    name: 'orderDetails',
    mounted(){
      vm = utils.init(this)
    },
    activated () {
      common.testLoginInfo(utils.router, window, xyz)
      initPage();
    },
    deactivated(){
      this.payBtn = false;
      this.pjBtn = false;
      this.payBarcodeDiv = false;
      this.isFlagOver = false;
    },
    data(){
      return {
        o: {},
        flagOverTxt: '',
        flagOverStyle: 'red',
        flagOverTime: null,
        isFlagOver: false,
        orderObj: {},
        linkedUrl: '',
        payBtn: false,
        pjBtn: false,
        pjTxt: '',
        payBarcodeDiv: false
      }
    },
    methods: {
      'goBack' () {
        utils.routerBack()
      },
      'linkUpdate' () {
        let data = {
          type: 'order',
          linkName: this.orderObj.linkman,
          linkPhone: this.orderObj.linkPhone,
          linkCard: this.orderObj.cardNum,
          cardType: this.orderObj.cardType ? this.orderObj.cardType : '身份证',
          orderNum: this.orderObj.orderNum
        };
        utils.routerPush('linkInfo', data, {name: utils.routeName})
      },
      'checkPayOrder' () {
        let orderNum = this.o.orderNum;
        let money = Number(this.o.shopCount) * Number(this.o.money);

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
              let p = {
                orderNum: orderNum,
                money: money,
                title: (vm.orderObj.providerNameCn + ' ' + vm.orderObj.productNameCn).substring(0, 15),
                img: vm.o.img
              }

              utils.routerPush('cashier', p, {name: utils.routeName})
            }
          }
        });
      },
      'lockEval' () {
        let data = {
          provider: this.orderObj.provider,
          product: this.orderObj.productNameCn,
          orderNum: this.o.orderNum
        };

        utils.routerPush('evaluate', data, {name: utils.routeName})
      },
      'refundRequest' () {
        let data = {
          type: 'refundRequest',
          orderNum: this.o.orderNum,
          price: this.orderObj.money
        };
        utils.routerPush('refundList', data, {name: utils.routeName})
      }
    },
    computed: {
      'countAddDate' () {
        return this.orderObj['addDate'] ? new Date(this.orderObj['addDate'].replace(/-/g, "/")).xyzFormat('yyyy年MM月dd日hh时mm分') : ''
      },
      'goOutDate' () {
        return this.orderObj['dateInfoStart'] ? new Date(this.orderObj['dateInfoStart'].replace(/-/g, "/")).format('yyyy年MM月dd日hh时mm分') : ''
      }
    }
  }

  function initPage() {
    let o = vm.$route.query;
    vm.o = o;
    if (!o.orderNum) {
      utils.vuxAlert('错误', '缺少必要参数，即将返回上一页', () => {
        utils.routerBack()
      })
      return
    }

    xyz.ajax({
      url: 'BuyerOrderWS/getOrder.cus',
      data: {
        apikey: window.localStorage.apikey,
        orderNum: o.orderNum
      },
      loading: utils.vux.loading,
      success (data) {
        if (data.status === 1) {
          let o = data.content['orderContentForm'];
          let rows = data.content['orderContentList'];
          o.cardType = rows[0].cardType;
          o.cardNum = rows[0].cardNum;

          vm.orderObj = o;
          vm.flagOverTime = new Date(o['overDate'].replace(/-/g, "/")).getTime();

          vm.linkedUrl = xyz.setUrlparam(xyz.getFullurl('page/commodityDetails.html'), {
            'numberCode': o.provider,
            'back': window.location.href
          });

          vm.payBtn = o['flagPay'] === 0;
          flagOverInterval();

          if (o['flagPay'] === 0 && o['flagOver'] === 0) {
            vm.flagOverIntervalId = setInterval(flagOverInterval, 1000);
          } else if (o['flagPay'] === 1) {
            vm.flagOverTxt = '【已支付】';
            vm.flagOverStyle = '#0bc00b';
            loadComment();
          }

          if (o['isException'] === 1) {
            vm.flagOverTxt = '异常订单，无法操作';
            vm.flagOverIntervalId ? clearInterval(vm.flagOverIntervalId) : '';
            vm.payBtn = false;
          }
        } else {
          utils.vuxAlert('错误', data.msg, () => {
            utils.routerBack()
          })
        }
      }
    })
  }

  function flagOverInterval() {
    let overDate = vm.flagOverTime;
    let nowDate = new Date().getTime();
    let txt = '订单已冻结/关闭';
    if (nowDate >= overDate) {
      clearInterval(vm.flagOverIntervalId);
      vm.payBtn = false;
    } else {
      let time = overDate - nowDate;
      let m = parseInt(time / (60 * 1000));
      if (m <= 0) {
        let s = parseInt(time / (1000));
        txt = s + '秒后自动取消订单，请尽快付款';
      } else if (m <= 60) {
        m = parseInt(time / (1000 * 60));
        txt = m + '分钟后自动取消订单，请尽快付款';
      } else {
        let h = parseInt(time / (1000 * 60 * 60));
        txt = h + '小时后自动取消订单，请尽快付款';
      }
    }

    vm.flagOverTxt = txt;
    vm.isFlagOver = true;
  }

  function loadComment() {
    xyz.ajax({
      url: 'CommentWS/getCommentByOrderNum.cus',
      data: {
        apikey: window.localStorage.apikey,
        orderNum: vm.orderObj.orderNum
      },
      loading: utils.vux.loading,
      success (data) {
        vm.pjBtn = true;
        if (data.status === 1) {
          vm.pjTxt = '已评价,点击查看评价';
        } else {
          vm.pjTxt = '去评价';
        }
      }
    });
  }

</script>

<style lang="less" src="./orderDetails.less">

</style>
