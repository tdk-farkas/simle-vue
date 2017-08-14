<template>
  <!-- 路由出口 -->
  <!-- 路由匹配到的组件将渲染在这里 -->
  <div id="main">
    <transition :name="transitionName" appear>
      <keep-alive>
        <router-view></router-view>
      </keep-alive>
    </transition>
  </div>
</template>

<script>
  import xyz from '@/lib/wp-xyz'
  import common from "@/lib/wp-common"

  let ico = require('@/res/img/favicon.ico')
  export default {
    mounted(){
      setTimeout(common.wResize, 200)
    },
    data(){
      return {
        transitionName: 'slide',
        nowRouterName: ''
      }
    },
    watch: {
      '$route'(to, from){
        const toDepth = to.path.split('/').length
        const fromDepth = from.path.split('/').length
        if (toDepth === fromDepth) {
          this.transitionName = 'fade';
        } else if (toDepth < fromDepth) {
          this.transitionName = 'slide-out'
        } else {
          this.transitionName = 'slide-in'
        }

        this.nowRouterName = to.name;
      }
    }
  };
</script>
<style lang="less" src="./main.less">

</style>
