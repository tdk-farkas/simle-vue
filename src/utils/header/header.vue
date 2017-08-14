<!--
    Created by Farkas on 2017/4/26.
    版本 v1.0.0

    1.isBack    是否显示返回按钮
    2.@go-back   返回按钮的点击事件
    3.title    标题名称
-->
<template>
  <header id="myHeader" ref="header">
    <template v-if="isB">
      <a href="javascript:" class="left" @click="clickBack" v-if="isB"><i class="iconfont icon-fanhui"></i></a>
    </template>
    <h1>{{myT}}</h1>
  </header>
</template>

<script>
  export default{
    name: 'myHeader',
    props: {
      isBack: {
        type: Boolean
      },
      myTitle: {
        type: String
      }
    },
    data () {
      let data = {
        isB: false,
        myT: '标题栏'
      };

      if (this.isBack) {
        data.isB = this.isBack
      }

      if (this.myTitle) {
        data.myT = this.myTitle;
      }

      return data
    },
    methods: {
      clickBack(){
        this.$emit('go-back');
      }
    },
    watch: {
      'myTitle'  (nVal) {
        this.myT = nVal;
      },
      'isBack'  (nVal) {
        this.isB = nVal;
      }
    }
  }
</script>

<style lang="less" src="./header.less">

</style>
