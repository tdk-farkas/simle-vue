<template>
  <div id="cashier">
    <header>
      <a href="javascript:" class="left" @click="goBack"><i class="iconfont icon-fanhui"></i></a>
      <h1>翔腾收银台</h1>
    </header>
    <main class="poup">
      <div class="order-info-title clear">
        <div class="order-img">
          <img src="" :src="o.img" alt="">
        </div>
        <div class="order-name" v-cloak>
          <span class="price">¥{{o.money}}</span>
          <p>{{o.title}}</p>
        </div>
      </div>
      <div class="pay-method">
        <ul>
          <template v-if="al">
            <li>
                    <span class="icon-box">
                         <i class="zhifubao-icon"></i>
                    </span>
              <p class="pay-inner">
                <span>支付宝支付</span>
                <label>暂不支持支付宝</label>
              </p>
              <i class="iconfont icon-gou "></i>
            </li>
          </template>
          <template v-if="wx">
            <li @click="selectPayMethod('wx')">
                    <span class="icon-box">
                         <i class="weixin-icon"></i>
                    </span>
              <p class="pay-inner">
                <span>微信支付</span>
                <label>推荐安装微信5.0及以上版本的用户使用</label>
              </p>
              <i class="iconfont icon-gou" :class="{'icon-check':checkPayMethod=='wx'}"></i>
            </li>
          </template>
          <template v-if="wxm">
            <li @click="selectPayMethod('wxm')">
                    <span class="icon-box">
                         <i class="iconfont icon-erweima"></i>
                    </span>
              <p class="pay-inner">
                <span>微信二维码支付</span>
                <label>推荐当前设备无法支付时使用</label>
              </p>
              <i class="iconfont icon-gou" :class="{'icon-check':checkPayMethod=='wxm'}"></i>
            </li>
          </template>
          <template v-if="wxn">
            <li @click="selectPayMethod('wxn')">
                    <span class="icon-box">
                         <i class="iconfont icon-erweima"></i>
                    </span>
              <p class="pay-inner">
                <span>微信网页支付</span>
                <label>推荐在微信网页内购买的用户支付</label>
              </p>
              <i class="iconfont icon-gou" :class="{'icon-check':checkPayMethod=='wxn'}"></i>
            </li>
          </template>
        </ul>
      </div>
    </main>
    <footer class="footer" @click="pay">
      <a href="javascript:">立即付款</a>
    </footer>
    <!--微信支付二维码-->
    <div class="orderDetail-pay-icon-parent" @click="hideBarcodeDiv"
         v-show="payBarcodeDiv">
      <div class="orderDetail-pay-icon-card">
        <div class="orderDetail-pay-icon-div" id="payBarcodeShow">
        </div>
        <div class="orderDetail-pay-txt-div">
        <span>
            使用微信扫描二维码完成付款
        </span>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
  import Vue from 'vue'
  import xyz from '@/lib/wp-xyz'
  import common from '@/lib/wp-common'
  import VmUtils from '@/lib/vm-utils'
  import myHeader from '@/utils/header'
  import myDropload from '@/utils/dropload'
  import myFooter from '@/utils/footer'
  require('./qrcode.js')

  let vm, utils = new VmUtils()

  export default{
    mounted(){
      vm = utils.init(this)
    },
    activated () {
      common.testLoginInfo(utils.router, window, xyz)
      initPage()
    },
    data(){
      return {
        o: {},
        al: false,
        wx: false,
        wxm: false,
        wxn: false,
        checkPayMethod: '',
        payBarcodeDiv: false
      }
    },
    methods: {
      'goBack'  () {
        utils.routerBack()
      },
      'pay'  () {
        let checkPayMethod = this.checkPayMethod
        if (xyz.isNull(checkPayMethod)) {
          utils.vuxToast('请选择支付方式')
          return
        }

        let orderNum = this.o.orderNum
        let money = this.o.money
        let productNameCn = this.o.title

        if (checkPayMethod === 'wx') {
          appPay(orderNum, money, productNameCn)
        } else if (checkPayMethod === 'wxm') {
          wxBarcodePay(orderNum, money, productNameCn)
        } else if (checkPayMethod === 'wxn') {
          wxJsPay(orderNum, money, productNameCn)
        }
      },
      'hideBarcodeDiv'  () {
        this.payBarcodeDiv = false
        window.location.reload()
      },
      'selectPayMethod'  (item) {
        this.checkPayMethod = item
      }
    },
    computed: {
      'countAddDate'  () {
        return this.orderObj['addDate'] ? new Date(this.orderObj['addDate'].replace(/-/g, "/")).xyzFormat('yyyy年MM月dd日hh时mm分') : ''
      },
      'goOutDate'  () {
        return this.orderObj['dateInfoStart'] ? new Date(this.orderObj['dateInfoStart'].split(' ')[0].replace(/-/g, "/")).format('yyyy年MM月dd日') : ''
      }
    },
  }

  function intervalDecidePayOk(outTradeNo) {
    xyz.ajax({
      url: 'PayWS/decidePayOk.cus',
      data: {
        apikey: window.localStorage.apikey,
        outTradeNo: outTradeNo
      },
      success (data) {
        if (data.status === 1) {
          utils.vuxToast('支付成功！', 'success', 2000, utils.routerBack)
        } else {
          window.setTimeout(() => {
            intervalDecidePayOk(outTradeNo)
          }, 1000)
        }
      }
    })
  }

  function initPage() {
    let o = utils.routeQuery()
    if (!o.orderNum) {
      utils.vuxAlert('警告', '参数错误，即将返回上页', () => {
        utils.routerBack()
      })
      return
    }
    vm.o = o

    Vue.nextTick(() => {
      vm.al = false
      vm.wx = window.plus
      vm.wxn = common.isWeixin()
      vm.wxm = true
      vm.payBarcodeDiv = false
    })
  }

  function appPay(orderNum, money, productNameCn) {
    // 获取支付通道
    window.plus.payment.getChannels(function (channels) {
      wxPay(orderNum, money, productNameCn, channels)
    })
  }

  function wxBarcodePay(orderNum, money, productNameCn) {
    xyz.ajax({
      url: 'PayWS/getWxPayOrderInfo.cus',
      data: {
        apikey: window.localStorage.apikey,
        orderNo: orderNum,
        totalFee: money,
        body: productNameCn,
        tradeType: 'NATIVE'
      },
      loading: utils.vux.loading,
      success (data) {
        if (data.status === 1) {
          //生成二维码
          xyz.id('payBarcodeShow').innerHTML = ""
          let qrcode = new QRCode("payBarcodeShow", {
            text: data.content.code_url,
            width: 200,
            height: 200,
            colorDark: "#000000",
            colorLight: "#ffffff",
            correctLevel: QRCode.CorrectLevel.H
          })

          vm.payBarcodeDiv = true

          intervalDecidePayOk(data.content.outTradeNo)
        } else {
          utils.vuxToast(data.msg, 'warn')
        }
      }
    })
  }

  function wxJsPay(orderNum, money, productNameCn) {
    xyz.ajax({
      url: 'PayWS/getWxJsPayOrderInfo.xyz',
      data: {
        apikey: window.localStorage.apikey,
        orderNo: orderNum,
        totalFee: money,
        body: productNameCn,
        openid: window.localStorage.openid
      },
      loading: utils.vux.loading,
      success (data) {
        if (data.status === 1) {
          wx.chooseWXPay({
            timestamp: data.content.timeStamp, // 支付签名时间戳，注意微信jssdk中的所有使用timestamp字段均为小写。但最新版的支付后台生成签名使用的timeStamp字段名需大写其中的S字符
            nonceStr: data.content.nonceStr, // 支付签名随机串，不长于 32 位
            'package': data.content.package, // 统一支付接口返回的prepay_id参数值，提交格式如：prepay_id=***）
            signType: data.content.signType, // 签名方式，默认为'SHA1'，使用新版支付需传入'MD5'
            paySign: data.content.paySign, // 支付签名
            success (res) {
              if ('chooseWXPay:ok' === res.errMsg) {
                utils.vuxToast('<br/>恭喜您，支付成功！<br/><br/>', 'success', 3000, utils.routerBack)
              } else {
                utils.vuxToast('<br/>未完成支付<br/><br/>' + res.errMsg, 'warn', 2000, initPage)
              }
            }
          })
        } else {
          utils.vuxToast(data.msg)
        }
      }
    })
  }
</script>
<style lang="less" src="./cashier.less">

</style>
