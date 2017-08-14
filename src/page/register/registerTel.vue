<template>
  <div id="registerTel" class="register-register">
    <my-header :my-title="title" :is-back="true" @go-back="goBack">

    </my-header>
    <main class="poup">
      <div class="register-box register-tel">
        <p>
          <span>手机号</span>
          <input type="tel" placeholder="请输入手机号" v-model="phone"/>
        </p>
        <p>
          <span>验证码</span>
          <input type="text" placeholder="请输入验证码" v-model="code"
                 @keyup.enter="enterClick" v-blur="isBlur" @focus="focus"/>
          <i class="tips" :class="{'not-click':!isSendCode}" @click="sendValidateCode" v-cloak>{{sendMsgTxt}}</i>
        </p>
      </div>
      <div class="btn-box">
        <button @click="nextStep">下&nbsp;一&nbsp;步</button>
      </div>
    </main>
    <div class="reg-footer">
      <p>
        四川翔腾国际旅行社有限公司 <br>
        蜀ICP备15011668号-2
      </p>
    </div>
  </div>
</template>

<script>
  import xyz from '@/lib/wp-xyz'
  import common from '@/lib/wp-common'
  import VmUtils from '@/lib/vm-utils'
  import myHeader from '@/utils/header'

  let vm, utils = new VmUtils()
  export default{
    name: 'register',
    components: {myHeader},
    mounted(){
      vm = utils.init(this)
    },
    activated () {
      initPage()
    },
    data(){
      return {
        phone: '',
        code: '',
        count: 0,
        sendMsgTxt: '发送验证码',
        isFirst: true,
        isSendCode: true,
        type: 'register',
        title: '立即注册',
        isBlur: false
      }
    },
    methods: {
      'goBack'(){
        utils.routerBack()
      },
      'sendValidateCode': sendValidateCode,
      'nextStep': nextStep,
      'enterClick' () {
        this.isBlur = true;
        nextStep();
      },
      'focus' () {
        this.isBlur = false;
      }
    },
    watch: {
      'count' (newCount) {
        let txt = '重新发送';
        if (this.isFirst) {
          txt = '发送验证码'
        } else {
          txt += newCount > 0 ? '(' + newCount + '秒)' : '';
        }
        this.sendMsgTxt = txt
      }
    }
  }

  function initPage() {
    let p = utils.routeQuery()
    vm.type = p.type;
    let title = '';
    switch (p.type) {
      case 'register':
        title = '立即注册';
        break;
      case 'reset':
        title = '重置密码';
        break;
      default:
        title = '立即注册';
        break;
    }

    vm.title = title;
  }

  function sendValidateCode() {
    if (vm.isSendCode === false) {
      return;
    }

    let phoneNum = vm.phone;
    if (xyz.isNull(phoneNum)) {
      utils.vuxToast('请填写手机号', 't')
      return
    }
    if (!xyz.isPhone(phoneNum)) {
      utils.vuxToast('请填写11位正确的手机号码（仅支持中国大陆手机号）', 't')
      return
    }

    xyz.ajax({
      url: 'CustomerWS/getRandCode.app',//获取验证码的连接
      data: {
        phone: phoneNum
      },
      loading: utils.vux.loading,
      success (data) {
        if (data.status === 1) {
          //发送成功开始计时30秒后才允许重发
          count(30);
          utils.vuxToast("验证码已发送，注意查收", 'success')
          //验证码获取成功
        } else {
          initCount();
          utils.vuxToast(data.msg, 'warn')
        }
      }
    });
  }

  function count(count) {
    vm.count = count;
    vm.isFirst = false;
    vm.isSendCode = false;
    let id = setInterval(function () {
      vm.count--;
      if (vm.count <= 0) {
        clearInterval(id);
        initCount();
      }
    }, 1000);
  }

  function initCount() {
    vm.count = 0;
    vm.isFirst = true;
    vm.isSendCode = true;
  }

  function nextStep() {
    let phoneNum = vm.phone;
    let validateCode = vm.code;
    if (xyz.isNull(phoneNum)) {
      utils.vuxToast('请填写手机号', 't')
      return
    }
    if (!xyz.isPhone(phoneNum)) {
      utils.vuxToast('请填写11位正确的手机号码（仅支持中国大陆手机号）', 't')
      return
    }
    if (xyz.isNull(validateCode)) {
      utils.vuxToast('请填写验证码', 't')
      return
    }

    xyz.ajax({
      url: 'CustomerWS/verifyRandCode.app',
      data: {
        phone: phoneNum,
        randCode: validateCode
      },
      loading: utils.vux.loading,
      success (data) {
        if (data.status === 1) {
          utils.routerPush('regPwd', {phone: phoneNum, type: vm.type}, {name: utils.routeName})
        } else {
          utils.vuxToast(data.msg, 'warn')
        }
      }
    })
  }
</script>

<style lang="less" src="./register.less">

</style>
