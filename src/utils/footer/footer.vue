<template>
  <footer id="myFooter">
    <ul>
      <template v-for="(item,idx) in footList">
        <li @click="clickFootMenu(item)">
          <a href="javascript:">
            <i class="icon" :class="countFootCheck(item)"></i>
          </a>
        </li>
      </template>
    </ul>
  </footer>
</template>
<script>
  export default{
    name: 'myFooter',
    props: {
      footIndex: {
        type: String
      }
    },
    data () {
      let data = {
        footList: [{
          cls: 'icon-fenlei',
          name: 'classify'
        }, {
          cls: 'icon-order',
          name: 'order'
        }, {
          cls: 'icon-me',
          name: 'mine'
        }],
        fI: ''
      };

      if (this.footIndex) {
        data.fI = this.footIndex;
      }

      return data
    },
    methods: {
      countFootCheck (item) {
        return item.cls + (this.fI === item.name ? '-check' : '');
      },
      clickFootMenu(item){
        this.$emit('menu-check', item.name);
      }
    },
    watch: {
      'footIndex' (nVal) {
        this.fI = nVal;
      }
    }
  }
</script>
<style lang="less" src="./footer.less">

</style>
