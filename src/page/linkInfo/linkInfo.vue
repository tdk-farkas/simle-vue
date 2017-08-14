<template>
  <div id="linkInfo">
    <my-header :my-title="pageTitle" :is-back="true" @go-back="goBack">

    </my-header>
    <main class="poup">
      <p class="edit-tips">
        温馨提示：提供准确有效的联系人信息对您订单的后续跟进服
        务非常重要，请务必仔细核对！
      </p>
      <div class="edit-info">
        <p>
          <span>联系人</span>
          <input type="text" placeholder="请输入联系人" v-model="linkName">
        </p>
        <p>
          <span>联系电话</span>
          <input type="tel" placeholder="请输入联系电话" v-model="linkPhone">
        </p>
        <template v-if="isOrder">
          <p>
            <label>
              <span style="width: auto;" @click.stop="selectType">{{cardType}}</span>
              <i class="iconfont icon-xiala-copy" :class="{'transform270':!showType}"
                 @click.stop="selectType"></i>
              <input type="text" :placeholder="'请输入'+cardType+'号码'" v-model="linkCard">
            </label>
          </p>
        </template>
        <template v-if="showType">
          <div class="certificates">
            <ul>
              <template v-for="(item,idx) in typeList">
                <li @click="checkType(idx)">{{item.txt}}</li>
              </template>
            </ul>
          </div>
        </template>
      </div>
      <div class="btn-box">
        <button @click="checkLinkInfo">保 存</button>
      </div>
    </main>
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
    name: 'mine',
    components: {myHeader},
    mounted(){
      vm = utils.init(this)
    },
    activated () {
      common.testLoginInfo(utils.router, window, xyz)
      initPage();
    },
    data(){
      return {
        pageTitle: '编辑联系人信息',
        linkName: '',
        linkPhone: '',
        linkCard: '',
        orderNum: '',
        typeList: [{txt: '身份证'}, {txt: '护照'}],
        showType: false,
        cardType: '身份证',
        isOrder: false
      }
    },
    methods: {
      'goBack'(){
        utils.routerBack()
      },
      'selectType' () {
        this.showType = !this.showType;
      },
      'checkType' (idx) {
        this.cardType = this.typeList[idx].txt;
        this.showType = false;
      },
      'checkLinkInfo' () {
        if (xyz.isNull(this.linkName)) {
          utils.vuxToast('请填写联系人', 't')
          return
        }
        if (xyz.isNull(this.linkPhone)) {
          utils.vuxToast('请填写联系电话', 't')
          return
        }
        if (!xyz.isPhone(this.linkPhone)) {
          utils.vuxToast('请填写11位正确的手机号码（仅支持中国大陆手机号）', 't')
          return
        }

        if (this.isOrder && this.orderNum) {
          if (xyz.isNull(this.linkCard)) {
            utils.vuxToast('请填写' + this.cardType + '号码', 't')
            return
          }
          updateOrderLinkInfo();
        } else {
          subLinkInfo();
        }
      }
    }
  }

  function subLinkInfo() {
    xyz.ajax({
      url: 'CustomerWS/editCustomerLinkInfo.cus',
      data: {
        apikey: window.localStorage.apikey,
        linkman: vm.linkName,
        linkPhone: vm.linkPhone
      },
      loading: utils.vux.loading,
      success: function (data) {
        if (data.status === 1) {
          let localLoginInfo = xyz.isNull(window.localStorage.localLoginInfo) ? "" : JSON.parse(window.localStorage.localLoginInfo);
          localLoginInfo.linkman = vm.linkName;
          localLoginInfo.linkPhone = vm.linkPhone;
          window.localStorage.localLoginInfo = JSON.stringify(localLoginInfo);
          utils.vuxToast('<br/>保存成功<br/><br/>', 'success', 2000, utils.routerBack)
        }
      }
    });
  }

  function updateOrderLinkInfo() {
    let data = {
      apikey: window.localStorage.apikey,
      orderNum: vm.orderNum
    };

    data.linkman = vm.linkName;
    data.linkPhone = vm.linkPhone;
    data.cardType = vm.cardType;
    data.cardNum = vm.linkCard;

    xyz.ajax({
      url: 'BuyerOrderWS/editOrder.cus',
      data: data,
      loading: utils.vux.loading,
      success (data) {
        if (data.status === 1) {
          utils.vuxToast('保存成功', 'success', 2000, utils.routerBack)
        } else {
          utils.vuxToast(data.msg, 'warn')
        }
      }
    })
  }

  function initPage() {
    let o = utils.routeQuery()
    if (o.type === 'order') {
      if (!o.orderNum) {
        utils.vuxAlert('警告', '参数错误，即将返回上一页', utils.routerBack)
      }

      vm.isOrder = true;
      vm.linkName = o.linkName;
      vm.linkPhone = o.linkPhone;
      vm.cardType = o.cardType;
      vm.linkCard = o.linkCard;
      vm.orderNum = o.orderNum
    } else {
      let localLoginInfo = xyz.isNull(window.localStorage.localLoginInfo) ? "" : JSON.parse(window.localStorage.localLoginInfo);
      vm.linkName = localLoginInfo.linkman;
      vm.linkPhone = localLoginInfo.linkPhone;
    }
  }
</script>
<style lang="less" src="./linkInfo.less">

</style>
