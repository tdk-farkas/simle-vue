<template>
  <div id="evaluate">
    <my-header :my-title="pageTitle" :is-back="true" @go-back="goBack">

    </my-header>
    <main class="poup">
      <div class="evaluate-wraper">
        <div class="pro-info clear">
          <div class="pro-img">
            <img src="" :src="img" alt=""/>
          </div>
          <div class="pro-name" v-cloak>
            <p>{{name}}</p>
            <span>{{o.product}}</span>
          </div>
        </div>
        <div class="evaluate-score">
          <span class="evaluate-score-title">为商家服务打分</span>
          <p class="star-item">
                    <span>
                        <i class="iconfont icon-e637" :class="{'icon-check':star>=1}"
                           @click="evalSubBtn?checkStar(1):''"></i>
                        <i class="iconfont icon-e637" :class="{'icon-check':star>=2}"
                           @click="evalSubBtn?checkStar(2):''"></i>
                        <i class="iconfont icon-e637" :class="{'icon-check':star>=3}"
                           @click="evalSubBtn?checkStar(3):''"></i>
                        <i class="iconfont icon-e637" :class="{'icon-check':star>=4}"
                           @click="evalSubBtn?checkStar(4):''"></i>
                        <i class="iconfont icon-e637" :class="{'icon-check':star>=5}"
                           @click="evalSubBtn?checkStar(5):''"></i>
                    </span>
            <span v-cloak>{{countStarTxt}}</span>
          </p>
        </div>
      </div>
      <div class="evaluate-text">
        <textarea placeholder="请您给与我们宝贵的建议，让我们更好的服务您" v-model="evalTxt" :readonly="!evalSubBtn"></textarea>
        <span v-cloak>{{countEvalTxtLength}}</span>
      </div>
      <template v-if="evalSubBtn">
        <div class="btn-box">
          <button @click="checkSub">提交评价</button>
        </div>
      </template>
    </main>
  </div>
</template>
<script>
  import Vue from 'vue'
  import xyz from '@/lib/wp-xyz'
  import VmUtils from '@/lib/vm-utils'
  import common from '@/lib/wp-common'
  import myHeader from '@/utils/header'

  let commImg = require('@/res/img/comm-img.png')
  let vm, utils = new VmUtils();

  export default{
    name: 'evaluate',
    components: {myHeader},
    mounted(){
      vm = utils.init(this)
    },
    activated () {
      common.testLoginInfo(utils.router, window, xyz)
      initPage();
    },
    deactivated(){
      this.evalSubBtn = false
      this.evalTxt = ''
      this.star = 5
      this.name = ''
      this.img = ''
    },
    data(){
      return {
        pageTitle: '评价',
        o: {},
        star: 5,
        evalTxt: '',
        maxLength: 150,
        evalSubBtn: false,
        name: '',
        img: ''
      }
    },
    methods: {
      'goBack'(){
        this.$router.back()
      },
      'checkStar' (num) {
        this.star = num;
      },
      'checkSub': checkSub
    },
    computed: {
      countStarTxt () {
        let pj = ['令人愤怒!!', '不满意!', '不及格!', '一般般.', '值得再来!', '非常愉快!'];
        return pj[this.star];
      },
      countEvalTxtLength () {
        return this.evalTxt.length + '/' + this.maxLength;
      }
    },
    watch: {
      evalTxt (newValue) {
        if (newValue.length > this.maxLength) {
          this.evalTxt = newValue.substring(0, this.maxLength);
        }
      }
    }
  }

  function checkSub() {
    if (xyz.isNull(vm.evalTxt)) {
      utils.vuxToast('<br/>你还没有填写评价<br/><br/>', 't');
      return
    }

    subEvaluate();
  }

  function subEvaluate() {
    xyz.ajax({
      url: 'CommentWS/addProviderComment.cus',
      data: {
        apikey: window.localStorage.apikey,
        content: vm.evalTxt,
        provider: vm.o.provider,
        orderNum: vm.o.orderNum,
        score: vm.star
      },
      loading: utils.vux.loading,
      success (data) {
        if (data.status === 1) {
          utils.vuxToast('<br/>感谢您的评价<br/><br/>', 'success', 2000, utils.routerBack)
        } else {
          utils.vuxAlert('错误', data.msg)
        }
      }
    })
  }

  function loadComment() {
    xyz.ajax({
      url: 'CommentWS/getCommentByOrderNum.cus',
      data: {
        apikey: window.localStorage.apikey,
        orderNum: vm.o.orderNum
      },
      loading: utils.vux.loading,
      success (data) {
        if (data.status === 1) {
          vm.evalSubBtn = false;
          vm.star = data.content.score;
          vm.evalTxt = data.content.content;
        } else {
          vm.evalSubBtn = true;
        }
      }
    });
  }

  function loadData() {
    xyz.ajax({
      url: 'BuyerProviderWS/getProvider.app',
      data: {
        numberCode: vm.o.provider
      },
      loading: utils.vux.loading,
      success (data) {
        if (data.status === 1) {
          let obj = data.content;

          vm.img = xyz.isNull(obj.imageUrl) ? commImg : obj.imageUrl;
          vm.name = obj.nameCn;
        } else {
          utils.vuxToast(data.msg, 'warn');
        }
      }
    });
  }

  function initPage() {
    let o = utils.routeQuery()
    if (!o.orderNum || !o.provider) {
      utils.vuxAlert('错误', '缺少必要参数，即将返回上一页', () => {
        utils.routerBack()
      })
      return
    }

    vm.o = o;
    loadComment();
    loadData();
  }


</script>
<style lang="less" src="./evaluate.less">

</style>
