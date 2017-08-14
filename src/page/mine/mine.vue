<template>
  <div id="mine">
    <header>
      <h1>个人中心</h1>
      <a class="right" href="javascript:" @click="quit">退出登录</a>
    </header>
    <main class="poup">
      <div class="user-img-wraper">
        <div class="img-box">
          <img src="" :src="userImg" alt="">
        </div>
      </div>
      <div class="user-info" v-cloak>
        <p><span>账户：</span>{{username}} </p>
        <p><span>会员分类：</span>{{userTags}} </p>
      </div>
      <ul class="user-center-item clear">
        <li>
          <a href="javascript:" @click="link">
            <i class="iconfont icon-haoyou-shoujilianxiren"></i>
            <span>常用联系人</span>
          </a>
        </li>
        <li>
          <a href="javascript:" @click="collection">
            <i class="iconfont icon-aixin"></i>
            <span>我的收藏</span>
          </a>
        </li>
        <li>
          <a href="javascript:" @click="reset">
            <i class="iconfont icon-xiugaimima"></i>
            <span>修改/重置密码</span>
          </a>
        </li>
        <li>
          <a href="javascript:" @click="refund">
            <i class="iconfont icon-tuikuan1"></i>
            <span>我的退款申请</span>
          </a>
        </li>
      </ul>
      <div
        style="margin-top: 0.25rem; width: 100%; color: #888; font-size: 0.5rem; text-align: center; padding: 0.125rem 0;">
        <span>四川翔腾国际旅行社有限公司</span><br>
        <span>蜀ICP备15011668号-2</span>
      </div>
    </main>
    <!-- 弹出层 -->
    <template v-if="pop.isShowPop">
      <div class="eject-box">
        <div class="eject-out-box"></div>
        <div class="eject-inner-box">
          <div class="tips-box">
            <div class="tips-inner" v-html="pop.content">

            </div>
            <div class="tips-btn clear">
              <button @click="pop.isShowPop=false">{{pop.cancel}}</button>
              <button @click="doneClick">{{pop.done}}</button>
            </div>
          </div>
        </div>
      </div>
    </template>
    <my-footer :foot-index="footIndex" @menu-check="clickFootMenu">

    </my-footer>
  </div>
</template>
<script>

  import Vue from 'vue'
  import xyz from '@/lib/wp-xyz'
  import VmUtils from '@/lib/vm-utils'
  import common from '@/lib/wp-common'
  import myFooter from '@/utils/footer'

  let defaultHead = require('@/res/img/default-head.png')

  let vm, utils = new VmUtils()
  export default{
    name: 'mine',
    components: {myFooter},
    mounted(){
      vm = utils.init(this)
      initPage();
    },
    activated () {
      common.testLoginInfo(utils.router, window, xyz)
    },
    deactivated(){
      this.pop.isShowPop = false
    },
    data(){
      return {
        footList: ['icon-fenlei', 'icon-order', 'icon-me'],
        footIndex: 'mine',
        userTags: '无',
        username: '',
        userImg: defaultHead,
        pop: {
          isShowPop: false,
          content: '',
          cancel: '取消',
          done: '确定',
          prarm: {},
          doneCallBack () {
          }
        }
      }
    },
    methods: {
      'reset' () {
        utils.routerPush('regTel', {type: 'reset'}, {name: utils.routeName})
      },
      'refund' () {
        utils.routerPush('refundList', {}, {name: utils.routeName})
      },
      'collection' () {
        utils.routerPush('myCollection', {}, {name: utils.routeName})
      },
      'link' () {
        utils.routerPush('linkInfo', {}, {name: utils.routeName})
      },
      'clickFootMenu' (idx) {
        utils.routerReplace(idx)
      },
      'quit' () {
        let pop = this.pop;
        pop.content = '<p style="width: 100%; text-align: center; font-size: 0.8rem;">提示</p><span>退出当前登录账户?</span>';
        pop.doneCallBack = quitLogin;

        pop.isShowPop = true;
      },
      'doneClick' () {
        let pop = this.pop;
        pop.isShowPop = false;

        pop.doneCallBack(pop.prarm);
      }
    }
  }

  function initPage() {
    let loginInfo = false;
    try {
      loginInfo = xyz.isNull(window.localStorage.loginInfo) ? false : JSON.parse(window.localStorage.loginInfo);
    } catch (e) {
        console.log(e)
    }

    if (loginInfo) {
      vm.username = loginInfo.username;

      //会员等级
      if (!xyz.isNull(loginInfo['userTags'])) {
        vm.userTags = loginInfo['userTags'];
      }

      if (!xyz.isNull(loginInfo['headImgUrl'])) {
        let img = loginInfo['headImgUrl'];
        let lastIndex = img.lastIndexOf("0");
        if (lastIndex === img.length - 1) {
          img = img.substring(0, img.lastIndexOf("0")) + '132';
        }

        vm.userImg = img;
      }
    }
  }

  function quitLogin() {
    xyz.ajax({
      url: 'CustomerWS/exit.app',
      data: {
        apikey: window.localStorage.apikey
      },
      loading: utils.vux.loading,
      success (data) {
        if (data.status === 1) {
          window.localStorage.localLoginInfo = '';
          window.localStorage.loginInfo = '';
          window.localStorage.apikey = '';
          window.localStorage.loginInfo = '';
          window.localStorage.username = '';
          utils.routerPush('login', {go: 'mine'})
        } else {
          utils.vuxToast(data.msg, 'warn')
        }
      }
    })
  }

</script>
<style lang="less" src="./mine.less">

</style>
