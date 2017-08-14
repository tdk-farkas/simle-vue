<template>
  <ViewBox ref="first" id="first" :body-padding-top="'2.2rem'" :body-padding-bottom="'2.45rem'">
    <header slot="header">
      {{'当前滑动类型' + scrollType}}
      <button @click="changeScroll">{{scrollType == 'top' ? '切换为横向' : '切换为竖向' }}</button>
    </header>

    <elastic-scroller slot="default" :scroll-style="'scroll'" :scroll-type="scrollType">
      <ul>
        <li v-for="i in 99"
            :style="{'display':scrollType=='left'?'inline-block':'block'}"
            @click="clickItem">
          {{i}}
        </li>
      </ul>
    </elastic-scroller>

    <my-footer slot="bottom" :foot-index="footIndex" @menu-check="clickFootMenu">

    </my-footer>
  </ViewBox>
</template>

<script>
  import {ViewBox} from 'vux'
  import VmUtils from '@/lib/vm-utils'
  import myFooter from '@/utils/footer'
  import elasticScroller from '@/utils/elasticScroller'

  let utils = new VmUtils()
  export default {
    components: {ViewBox, myFooter, elasticScroller},
    name: 'first',
    beforeCreate(){
    },
    mounted(){
      utils.init(this)
    },
    activated(){
      utils.getDom('first').scrollTo(utils.vuexGetScrollTopByRouteName(utils.routeName))
    },
    deactivated(){
      utils.vuexSaveScrollTop(utils.routeName, utils.getDom('first').getScrollTop())
    },
    data () {
      return {
        msg: 'Welcome to Your Vue.js App',
        stockDate: new Date(),
        footIndex: -1,
        scrollType: 'default',
        stockList: [],
      }
    },
    methods: {
      changeScroll(){
        switch (this.scrollType) {
          case 'top':
            this.scrollType = 'left'
            break
          case 'left':
            this.scrollType = 'top'
            break
          default:
            this.scrollType = 'top'
            break
        }
      },
      clickFootMenu(ddd){
        utils.routerPush(ddd)
//        utils.routerPush('regTel', {type: 'register'}, {name: utils.routeName})
      },
      clickItem () {
//        alert(utils.getDom('first').getScrollTop());
      },
      getStock () {

      },
      goBack(){
      }
    }
  }

</script>

<style lang="less">
  #first {
    font-family: 'Avenir', Helvetica, Arial, sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    text-align: center;
    color: #2c3e50;

    h1, h2 {
      font-weight: normal;
    }

    ul {
      list-style: none; /* 将默认的列表符号去掉 */
      padding: 0; /* 将默认的内边距去掉 */
      margin: 0; /* 将默认的外边距去掉 */
    }

    li {
      display: inline-block;
    }

    a {
      color: #42b983;
    }

    .scroll {
      width: 100%;
      height: 100%;
      /*padding-bottom: 2.45rem;*/
      overflow: hidden;
    }

    header {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 2.2rem;
      button {
        border: #42b983 0.05rem solid;
      }
    }
  }
</style>
