<template>
  <div id="myCollection">
    <header>
      <template v-if="!showQuery">
        <a href="javascript:" class="left" @click="goBack"><i class="iconfont icon-fanhui"></i></a>
        <h1>我的收藏</h1>
        <a v-if="isShowQueryIcon" href="javascript:" class="right" @click="showQueryInput"><i
          class="iconfont icon-search"></i></a>
      </template>
      <template v-else>
        <div class="search-div">
          <div class="search-box">
            <input type="text" placeholder="请输入商品名称" v-model="queryTxt"
                   @keyup.enter="queryList">
            <i class="iconfont icon-search" @click="queryList"></i>
          </div>
          <div class="search-cancel" @click="hideQueryInput">取消</div>
        </div>
      </template>
    </header>
    <main class="poup">
      <my-dropload @refresh="refreshList" @more="moreList" ref="dropload">
        <div class="collection-item" ref="mainList">
          <ul>
            <template v-for="item in list">
              <li @click="checkItem(item.numberCode)">
                <img src="" :src="item.img" alt="">
                <div class="product-info">
                  <p v-cloak>{{item.title}}</p>
                  <div class="product-price clear">
                    <p v-cloak>{{item.body}}</p>
                    <button @click.stop="cancelCollection(item.title,item.numberCode)">取消收藏</button>
                  </div>
                </div>
              </li>
            </template>
          </ul>
        </div>
        <template v-if="isNull">
          <div class="none-data">
            <img src="../../res/img/no-collection.png" alt="">
            <p>暂时没有收藏...</p>
          </div>
        </template>
      </my-dropload>
    </main>

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
  </div>
</template>
<script>
  import Vue from 'vue'
  import xyz from '@/lib/wp-xyz'
  import VmUtils from '@/lib/vm-utils'
  import common from '@/lib/wp-common'
  import myDropload from '@/utils/dropload'

  let vm, utils = new VmUtils()
  export default{
    name: 'myCollection',
    components: {myDropload},
    mounted(){
      vm = utils.init(this)
    },
    activated () {
      common.testLoginInfo(utils.router, window, xyz)
      queryList(vm.page = 1)
    },
    data(){
      return {
        page: 0,
        queryTxt: '',
        list: [],
        isNull: true,
        showQuery: false,
        isShowQueryIcon: true,
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
      'goBack'() {
        utils.routerBack()
      },
      'checkItem' (code) {
        utils.routerPush('supDet', {numberCode: code}, {name: utils.routeName})
      },
      'showQueryInput' () {
        this.showQuery = true;
      },
      'hideQueryInput' () {
        this.showQuery = false;
      },
      'queryList' () {
        queryList(this.page = 1)
      },
      'cancelCollection' (title, num) {
        let pop = this.pop;
        pop.content = '<p style="width: 100%; text-align: center; font-size: 0.8rem;">提示</p><span>确定取消收藏“' + title + '”？</span>';
        pop.doneCallBack = collection;
        pop.prarm = num;

        pop.isShowPop = true;
      },
      'doneClick' () {
        let pop = this.pop;
        pop.isShowPop = false;
        pop.doneCallBack(pop.prarm);
        pop.doneCallBack = function () {
        }
      },
      'moreList'() {
        queryList(++this.page)
      },
      'refreshList'(){
        queryList(this.page = 1)
      }
    }
  }

  function queryList(page) {
    xyz.ajax({
      url: 'CustomerWS/queryCustomerCollectionList.cus',
      data: {
        nameCn: vm.queryTxt,
        apikey: window.localStorage.apikey,
        page: page,
        rows: 10,
        orderBy: 'alterDate DESC'
      },
      loading: utils.vux.loading,
      success (data) {
        if (data.status === 1) {
          let result = data.content;//当前数据条数
          //重置

          let total = data.content['total']

          vm.isNull = total <= 0;
          vm.isShowQueryIcon = total > 0 || vm.queryTxt.length !== 0

          if (page === 1 || vm.isNull) {
            vm.list = [];
          }

          for (let i = 0; i < result.rows.length; i++) {
            let o = result.rows[i];
            let imgUrl = xyz.getMiddleImageUrl(o[1]);

            vm.list.push({
              numberCode: o[0],
              img: imgUrl,
              title: o[2],
              body: o[3]
            });
          }
          Vue.nextTick(common.wResize)

          done(!(vm.list.length === total ), vm.isNull)
        } else {
          done(true, vm.isNull)
        }
      },
      error (xhr, type) {
        done(true, vm.isNull)
        utils.vuxToast('无法访问服务器啦', 'warn')
      }
    })
  }

  function done(isMore, isHide) {
    utils.getDom('dropload').$emit('done', isMore, isHide)
  }

  function collection(numberCode) {
    xyz.ajax({
      url: 'CustomerWS/editCustomerCollectionFlag.cus',
      data: {
        apikey: window.localStorage.apikey,
        provider: numberCode
      },
      loading: utils.vux.loading,
      success (data) {
        if (data.status === 1) {
          let cList = JSON.parse(window.localStorage.localCollectionList);
          if (data.content === 'delete') {
            if (!xyz.isNull(window.localStorage.localCollectionList)) {
              let newArray = [];
              for (let i = 0; i < cList.list.length; i++) {
                if (cList.list[i] !== numberCode) {
                  newArray.push(cList.list[i]);
                }
              }
              utils.vuxToast('<br/>已取消收藏<br/><br/>', 'success')
              cList.list = newArray;
              window.localStorage.localCollectionList = JSON.stringify(cList);
              queryList(vm.page = 1);
            }
          }
        } else {
          utils.vuxToast(data.msg, 'warn')
        }
      }
    })
  }
</script>
<style lang="less" src="./myCollection.less">

</style>
