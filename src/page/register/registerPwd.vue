<template>
  <div id="registerPwd" class="register-register">
    <my-header :my-title="title" :is-back="true" @go-back="goBack">

    </my-header>
    <main class="poup">
      <div class="register-box">
        <p>
          <span>您的账户</span>
          <input type="text" placeholder="手机号" :value="phone" readonly/>
        </p>
        <p>
          <span>输入密码</span>
          <input v-if="isShowRePwd" type="text" placeholder="请输入密码" v-model="pwd"
                 @keyup.enter="nextInput" @focus="blur"/>
          <input v-else type="password" placeholder="请输入密码" v-model="pwd"
                 @keyup.enter="nextInput" @focus="blur"/>
          <i class="iconfont icon-yanjing" :class="{'icon-active':isShowPwd}" @click="checkShowPwd"></i>
        </p>
        <p>
          <span>重复密码</span>
          <input v-if="isShowRePwd" type="text" placeholder="请再次输入密码" v-model="rePwd"
                 @keyup.enter="enterClick" v-blur="isBlur" v-focus="isFocus" @focus="focus"/>
          <input v-else type="password" placeholder="请再次输入密码" v-model="rePwd"
                 @keyup.enter="enterClick" v-blur="isBlur" v-focus="isFocus" @focus="focus"/>
          <i class="iconfont icon-yanjing" :class="{'icon-active':isShowRePwd}"
             @click="checkShowRePwd"></i>
        </p>
      </div>
      <div class="btn-box">
        <button class="bu" @click="register" v-cloak>{{btnTxt}}</button>
      </div>
    </main>
    <div class="reg-footer">
      <p>
        四川翔腾国际旅行社有限公司 <br>
        蜀ICP备15011668号-2
      </p>
    </div>

    <!-- 弹出层 -->
    <template v-if="showPop">
      <div class="eject-box">
        <div class="eject-out-box"></div>
        <div class="eject-inner-box">
          <div class="tips-box">
            <div class="tips-inner">
              <i class="iconfont icon-gou"></i>
              <span v-html="popBody">
                        </span>
            </div>
            <div class="tips-btn">
              <button @click="closePop">完&nbsp;成</button>
            </div>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<script>
  import xyz from '@/lib/wp-xyz'
  import VmUtils from '@/lib/vm-utils'
  import common from '@/lib/wp-common'
  import myHeader from '@/utils/header'
  import {md5} from 'vux'


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
        pwd: '',
        rePwd: '',
        showPop: false,
        isShowPwd: false,
        isShowRePwd: false,
        type: '',
        title: '',
        popBody: '',
        btnTxt: '',
        isBlur: false,//是否失去焦点，关闭软键盘
        isFocus: false//重复密码input框是否获得焦点
      }
    },
    methods: {
      'goBack'(){
        utils.routerBack()
      },
      'register': register,
      'checkShowPwd' () {
        this.isShowPwd = !this.isShowPwd;
      },
      'checkShowRePwd' () {
        this.isShowRePwd = !this.isShowRePwd;
      },
      'closePop' () {
        utils.routerReplace('login')
      },
      'enterClick' () {//重复密码input框 点击enter键时
        this.isBlur = true;
        register();
      },
      'focus' () { //重复密码input框 获得焦点时
        this.isBlur = false;
      },
      'blur' () { //密码input框 获得焦点时
        this.isFocus = false;
      },
      'nextInput' () {//密码input框 点击 enter 键时
        this.isFocus = true;
      }
    }
  }

  function initPage() {
    let p = utils.routeQuery()
    let title, popBody, btnTxt, type;
    switch (p.type) {
      case 'register':
        btnTxt = '注 册';
        title = '立即注册';
        popBody = '恭喜你注册成功 <br>请联系客服激活账号';
        type = 'register';
        break;
      case 'reset':
        btnTxt = '重 置';
        title = '重置密码';
        popBody = '恭喜你重置密码成功,请重新登录';
        type = 'reset';
        break;
      default:
        btnTxt = '注 册';
        title = '立即注册';
        popBody = '恭喜你注册成功 <br>请联系客服激活账号';
        type = 'register';
        break;
    }

    vm.title = title;
    vm.popBody = popBody;
    vm.type = type;
    vm.btnTxt = btnTxt;
    vm.phone = p.phone;
  }

  function register() {
    let username = vm.phone;
    let password = vm.pwd;
    let rePassword = vm.rePwd;
    if (xyz.isNull(username)) {
      utils.vuxToast('账号不能为空', 't')
      return
    }
    if (xyz.isNull(password)) {
      utils.vuxToast('密码不能为空', 't')
      return
    }
    if (xyz.isNull(rePassword)) {
      utils.vuxToast('重复密码不能为空', 't')
      return;
    }
    if (password.length < 3 || password.length > 16) {
      utils.vuxToast('密码需要3到16为字符', 't')
      return
    }
    if (password !== rePassword) {
      utils.vuxToast('两次输入的密码不匹配', 't')
      return
    }

    let md5password = md5(password) + ''
    md5password = md5password.substr(8, 16)
    let url = 'CustomerWS/recoverPassword.app';
    let data = {
      username: username,
      newPassword: md5password
    };
    if (vm.type === 'register') {
      url = 'CustomerWS/register.app';
      data = {
        phone: username,
        password: md5password
      }
    }

    xyz.ajax({
      url: url,
      data: data,
      loading: utils.vux.loading,
      success (data) {
        if (data.status === 1) {
          window.localStorage.localLoginInfo = '';
          window.localStorage.loginInfo = '';
          window.localStorage.apikey = '';
          window.localStorage.loginInfo = '';
          window.localStorage.username = '';
          vm.showPop = true;
        } else {
          utils.vuxToast(data.msg, 'warn')
        }
      }
    })
  }
</script>

<style lang="less" src="./register.less">

</style>
