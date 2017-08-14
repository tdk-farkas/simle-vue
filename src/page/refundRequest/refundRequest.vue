<template>
  <div id="refundReq">
    <my-header :my-title="pageTitle" :is-back="true" @go-back="goBack">

    </my-header>
    <main class="poup">
      <div class="refund-request">
        <ul>
          <li>
            <span>订单编号</span>
            <p v-cloak>{{o.orderNum}}</p>
          </li>
          <li>
            <span>退款金额</span>
            <input type="number" placeholder='' :placeholder="countMaxPrice()" v-model="price">
          </li>
          <li>
            <span>退款说明</span>
            <textarea placeholder="请输入退款说明" v-model="txt"></textarea>
            <span class="span-size" v-cloak>{{txt.length}}/{{maxLength}}</span>
          </li>
        </ul>
      </div>
      <div class="btn-box">
        <button @click="checkSub">提交申请</button>
      </div>
    </main>
    <!-- 弹出层 -->
    <template v-if="showPop">
      <div class="eject-box">
        <div class="eject-out-box"></div>
        <!-- 退款申请成功 -->
        <div class="eject-inner-box">
          <div class="tips-box">
            <div class="tips-inner">
              <i class="iconfont icon-gou"></i>
              <span>
                    退款申请提交成功
                </span>
            </div>
            <div class="tips-btn">
              <button @click="hidePop">完&nbsp;成</button>
            </div>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>
<script>
  import Vue from 'vue'
  import xyz from '@/lib/wp-xyz'
  import VmUtils from '@/lib/vm-utils'
  import common from '@/lib/wp-common'
  import myHeader from '@/utils/header'

  let vm, utils = new VmUtils()
  export default{
    name: 'refundReq',
    components: {myHeader},
    mounted(){
      vm = VmUtils.init(this)
    },
    activated () {
      common.testLoginInfo(utils.router, window, xyz)
      initPage()
    },
    deactivated(){
      this.showPop = false
      this.o = {}
      this.price = ''
      this.txt = ''
    },
    data(){
      return {
        pageTitle: '添加退款申请',
        o: {},
        showPop: false,
        price: '',
        maxPrice: '0.01',
        txt: '',
        maxLength: 200
      }
    },
    methods: {
      'goBack' () {
        utils.routerBack()
      },
      'hidePop' () {
        this.showPop = false;
        this.goBack()
      },
      'countMaxPrice' () {
        return '金额不超过￥' + this.maxPrice;
      },
      'checkSub' () {
        if (xyz.isNull(this.price) || !(this.price.indexOf('.') === -1 || this.price.lastIndexOf('.') === this.price.length - 3)) {
          utils.vuxToast('<br/>请填写有效的金额<br/><br/>', 't')
          return
        }

        if (xyz.isNull(this.txt)) {
          utils.vuxToast('<br/>退款理由不能为空<br/><br/>', 't')
          return
        }

        subRequest();
      }
    },
    watch: {
      txt (newValue) {
        if (newValue.length > this.maxLength) {
          this.txt = newValue.substring(0, this.maxLength);
        }
      }
    }
  }

  function subRequest() {
    xyz.ajax({
      url: 'BuyerRefundWS/addRefund.cus',
      data: {
        apikey: window.localStorage.apikey,
        orderNum: vm.o.orderNum,
        amountApply: vm.price,
        remark: vm.txt,
        imageRemark: ''
      },
      loading: utils.vux.loading,
      success (data) {
        if (data.status === 1) {
          vm.showPop = true;
        } else {
          utils.vuxToast(data.msg, 'warn')
        }
      }
    });
  }

  function initPage() {
    let o = utils.routeQuery()
    if (!o.orderNum) {
      utils.vuxToast('参数错误，返回上一页', 'warn', 2000, utils.routerBack)
    }

    vm.o = o;
    vm.maxPrice = o.price;
  }
</script>
<style lang="less" src="./refundRequest.less">

</style>
