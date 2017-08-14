<template>
  <div id="refundList">
    <header>
      <a href="javascript:" class="left" @click="goBack"><i class="iconfont icon-fanhui"></i></a>
      <h1>退款列表</h1>
      <template v-if="!all">
        <a href="javascript:" class="right" @click="addRequest"><i class="iconfont icon-tuikuan"></i></a>
      </template>
    </header>
    <main class="poup">
      <template v-if="all">
        <div class="classify-title">
          <ul>
            <template v-for="(item,idx) in titleList">
              <li :class="{'line-active':checkTitle==idx}" @click="checkTitleBar(idx)">{{item.txt}}</li>
            </template>
          </ul>
        </div>
      </template>
      <my-dropload @refresh="refreshList" @more="moreList" ref="dropload">
        <div class="collection-item" ref="mainList">
          <ul>
            <template v-for="item in list">
              <li>
                <div class="title">
                  <p>{{item.productName}}</p>
                  <span>{{countFlag(item)}}</span>
                </div>
                <div class="yuanyin">
                  <span>退款原因：</span>
                  <p>{{item.remark}}</p>
                </div>
                <div class="yuanyin">
                  <span>退款金额：</span>
                  <p class="price">¥{{item.amountApply}}</p>
                </div>
              </li>
            </template>
          </ul>
        </div>
        <!-- 无订单 -->
        <template v-if="isNull">
          <div class="none-order">
            <img src="../../res/img/not-order.png" alt="">
            <p>未找到退款申请</p>
          </div>
        </template>
      </my-dropload>
    </main>
  </div>
</template>
<script>
  import Vue from 'vue'
  import xyz from '@/lib/wp-xyz'
  import VmUtils from '@/lib/vm-utils'
  import common from '@/lib/wp-common'
  import myDropload from '@/utils/dropload'

  let vm, utils = new VmUtils()

  export default{
    name: 'order',
    components: {myDropload},
    mounted(){
      vm = utils.init(this)
    },
    activated () {
      common.testLoginInfo(utils.router, window, xyz)
      initPage();
    },
    deactivated(){
      this.list = []
      this.page = 0
    },
    data() {
      return {
        o: {},
        page: 0,
        list: [],
        checkTitle: 0,
        titleList: [{txt: '申请中', val: 'noCheck'}, {txt: '退款中', val: 'yesCheck'}, {txt: '已退款', val: 'yesRefund'}],
        isNull: false,
        all: true
      }
    },
    methods: {
      'goBack' () {
        utils.routerBack()
      },
      'checkTitleBar' (idx) {
        this.checkTitle = idx;
        queryList(vm.page = 1);
      },
      'addRequest' () {
        //当列表为空时直接跳转到 申请退款页面
        let data = {
          orderNum: this.o.orderNum,
          price: this.o.price
        };

        utils.routerPush('refundReq', data, {name: utils.routeName})
      },
      'countFlag' (o) {
        let tip = o['refundFlag'] === 1 ? '已退款' : '申请中';
        tip = (o['refundFlag'] === 0 && o['checkFlag'] === 1) ? '退款中' : tip;
        tip = (o['refundFlag'] === 0 && o['closeFlag'] === 1) ? '已关闭' : tip;
        return tip;
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

    let url, data;
    if (vm.all) {
      url = 'BuyerRefundWS/queryRefundList.cus';
      data = {
        apikey: window.localStorage.apikey,
        page: page,
        rows: 10,
        flag: vm.titleList[vm.checkTitle].val
      };
    } else {
      done(true, vm.isNull)
      return
    }

    xyz.ajax({
      url: url,
      data: data,
      loading: utils.vux.loading,
      success (data) {
        if (data.status === 1) {
          let result = data.content;//当前数据条数;

          let total = data.content['total']
          vm.isNull = total <= 0;
          if (page === 1 || vm.isNull) {
            vm.list = [];
          }

          for (let i = 0; i < result.rows.length; i++) {
            vm.list.push(result.rows[i]);
          }

          Vue.nextTick(common.wResize)

          done(!(vm.list.length === total ), vm.isNull)
        } else {
          done(true, vm.isNull)
        }
      },
      error () {
        done(true, vm.isNull)
        utils.vuxToast('无法访问服务器啦', 'warn')
      }
    });
  }

  function done(isNotMore, isHide) {
    utils.getDom('dropload').$emit('done', isNotMore, isHide)
  }

  function initPage() {
    let o = utils.routeQuery()
    if (o.type && o.type === 'refundRequest' && o.orderNum) {
      vm.o = o;
      vm.all = false;
      xyz.ajax({
        url: 'BuyerRefundWS/queryRefundListByOrderNum.cus',
        data: {
          apikey: window.localStorage.apikey,
          orderNum: o.orderNum
        },
        loading: utils.vux.loading,
        success (data) {
          if (data.status === 1) {
            let result = data.content;//当前数据条数
            let len = result.length;

            let total = data.content['total']
            vm.isNull = total <= 0;
            if (vm.page === 1 || vm.isNull) {
              vm.list = [];
            }

            if (len <= 0) {
              //当列表为空时直接跳转到 申请退款页面
              let p = {
                orderNum: o.orderNum,
                price: o.price
              }
              utils.routerPush('refundReq', p, {name: utils.routeName})
            } else {
              for (let i = 0; i < len; i++) {
                vm.list.push(result[i])
              }
            }

            Vue.nextTick(common.wResize)
            done(false, true)
          }
        },
        error () {
          utils.vuxToast('无法访问服务器啦', 'warn')
        }
      });
    } else {
      vm.all = true
      queryList(vm.page = 1)
    }
  }

</script>
<style lang="less" src="./refundList.less">

</style>
