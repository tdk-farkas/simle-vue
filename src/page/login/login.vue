<template>
  <div id="login">
    <div class="top">
      <div class="register">
        <a href="javascript:" @click="go('register')">注册</a>
      </div>
      <div class="logo">
        <img src="../../res/img/logo.png"/>
        <span>翔腾票务</span>
      </div>
    </div>
    <form action="" method="post">
      <div class="zhanghao" @click="getFocus('id')">
        账号<input type="tel" placeholder="请输入账号" v-model="username" ref="id"/><br/>
      </div>
      <div class="mima" @click="getFocus('pwd')">
        密码
        <template v-if="isShowPwd">
          <input type="text" placeholder="请输入密码" v-model="password"
                 @keyup.enter="enterClick" @focus="focus" v-blur="isBlur" ref="pwd"/>
        </template>
        <template v-else>
          <input type="password" placeholder="请输入密码" v-model="password"
                 @keyup.enter="enterClick" @focus="focus" v-blur="isBlur" ref="pwd"/>
        </template>
        <i class="iconfont icon-yanjing" :class="{'icon-check':isShowPwd}" @click.stop="checkShowPwd"></i>
      </div>
      <div class="btn">
        <input type="button" value="登  录" @click="login"/>
      </div>
    </form>
    <div class="wenzi">
      <div class="wenzi1">
        <a href="javascript:" @click="go('reset')">忘记密码？</a>
      </div>
      <div class="wenzi2" @click="checkAutoLogin">
        <i class="iconfont icon-gou" :class="{'not-check':!isAutoLogin}"></i>
        <span>自动登录</span>
      </div>
    </div>
    <div
      style="margin-top: 5rem; width: 100%; color: #888; font-size: 0.5rem; text-align: center; padding: 0.125rem 0;">
      <span>四川翔腾国际旅行社有限公司</span><br>
      <span>蜀ICP备15011668号-2</span>
    </div>
  </div>
</template>

<script>
  import xyz from '@/lib/wp-xyz'
  import common from '@/lib/wp-common'
  import {md5} from 'vux'
  import VmUtils from '@/lib/vm-utils'

  let vm, utils = new VmUtils()

  export default{
    name: 'login',
    data(){
      return {
        pageScroll: 0,
        username: '',
        password: '',
        isAutoLogin: true,
        isShowPwd: false,
        isBlur: false
      }
    },
    mounted(){
      vm = utils.init(this)
      if (common.isWeixin(window)) {
        let o = utils.routeQuery()
        if (o && o.openid) {
          window.localStorage.openid = o.openid
        }
      }


      if (!xyz.isNull(window.localStorage.localLoginInfo)) {//自动登录
        if (window.plus) {
          autoLogin()
        } else {
          document.addEventListener('plusready', plusReady, false)
          plusreadyId = setTimeout(() => {
            autoLogin()
          }, 500)
        }
      }
    },
    methods: {
      login,
      go (type) {
        utils.routerPush('regTel', {type: type}, {name: utils.routeName})
      },
      checkAutoLogin () {
        this.isAutoLogin = !this.isAutoLogin
      },
      checkShowPwd () {
        this.isShowPwd = !this.isShowPwd
      },
      enterClick () {
        this.isBlur = true
        this.login()
      },
      focus () {
        this.isBlur = false
      },
      getFocus(name){
        utils.getDom(name).focus()
      }
    }
  }

  function login() {
    let name = vm.username
    let pwd = vm.password
    if (xyz.isNull(name) || xyz.isNull(pwd)) {
      utils.vuxToast('用户名和密码不能为空', 't')
      return
    }

    if (name.length < 3 || name.length > 16) {
      utils.vuxToast('用户名需要3到16为字符', 't')
      return
    }

    if (pwd.length < 3 || pwd.length > 16) {
      utils.vuxToast('密码需要3到16为字符', 't')
      return
    }

    let md5password = md5(pwd) + ''
    md5password = md5password.substr(8, 16)
    loginOper(name, md5password, '登陆中....')
  }

  function loginOper(username, md5password, progressText) {
    xyz.ajax({
      url: 'CustomerWS/login.app',
      data: {
        username: username,
        password: md5password
      },
      loading: utils.vux.loading,
      progress: progressText,
      success (data) {
        if (data.status === 1) {
          let obj = data.content
          window.localStorage.apikey = obj.apikey
          window.localStorage.loginInfo = JSON.stringify(obj)
          window.localStorage.username = username
          let localLoginInfonew = {}
          localLoginInfonew.username = username
          localLoginInfonew.password = md5password
          localLoginInfonew.linkman = obj.linkman
          localLoginInfonew.linkPhone = obj.linkPhone
          //过期时间7天
          if (vm.isAutoLogin) {
            localLoginInfonew.expTime = new Date().getTime() + (7 * 24 * 60 * 60 * 1000)
          } else {
            localLoginInfonew.expTime = new Date().getTime()
          }
          window.localStorage.localLoginInfo = JSON.stringify(localLoginInfonew)

          //拉取个人收藏
          if (!xyz.isNull(window.localStorage.localCollectionList)) {
            let cList = JSON.parse(window.localStorage.localCollectionList)
            //每周同步一次
            if ((cList.time + (7 * 24 * 60 * 60 * 1000)) < new Date().getTime()) {
              getCollectionList()
            } else {
              href()
            }
          } else {
            getCollectionList()
          }
        } else {
          utils.vuxToast(data.msg, 'warn')
        }
      },
      error(request, txt){
        utils.vuxToast(txt, 'warn')
      }
    })
  }

  function href() {
    let o = utils.routeQuery()
    if (o && !xyz.isNull(o.go)) {
      utils.routerBack()
    } else {
      utils.routerReplace('classify')
    }
  }

  function getCollectionList() {
    xyz.ajax({
      url: 'CustomerWS/queryAllCustomerCollectionList.cus',
      data: {
        apikey: window.localStorage.apikey
      },
      loading: utils.vux.loading,
      progress: '加载中。。。',
      success (data) {
        if (data.status === 1) {
          let myCollectionList = {}
          myCollectionList.time = new Date().getTime()
          myCollectionList.list = data.content
          window.localStorage.localCollectionList = JSON.stringify(myCollectionList)

          href()
        } else {
          utils.vuxToast(data.msg, 'warn')
        }
      },
      error  (request, txt) {
        utils.vuxToast(txt, 'warn')
      }
    })
  }

  let plusreadyId = 0
  function plusReady() {
    if (!xyz.isNull(window.localStorage.localLoginInfo)) {//自动登录
      autoLogin()
    }
  }

  function autoLogin() {
    if (plusreadyId) {
      clearTimeout(plusreadyId)
    }

    let loginInfo = JSON.parse(window.localStorage.localLoginInfo)
    let saveDate = loginInfo.expTime
    let nowDate = new Date().getTime()
    if (nowDate < saveDate) {
      vm.isAutoLogin = true
      let user = loginInfo.username
      let pwd = loginInfo.password
      loginOper(user, pwd, '自动登陆中')
    }
  }
</script>

<style lang="less" src="./login.less">

</style>
