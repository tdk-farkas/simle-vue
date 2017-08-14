<template>
  <ViewBox id="classify" ref="classify" :body-padding-top="'2.2rem'" :body-padding-bottom="'2.45rem'">
    <header slot="header">
      <div class="search-box">
        <input type="text" placeholder="请输入商品名称" v-model="queryTxt"
               @keyup.enter="queryList" @focus="focus" v-blur="isBlur">
        <i class="iconfont icon-search" @click="queryList"></i>
      </div>
    </header>
    <main slot="default">
      <div class="classify-title">
        <ul>
          <template v-for="(item,idx) in sortList">
            <li @click="clickSortMenu(idx)" :class="{'line-active': sortIndex==idx}">{{item.txt}}</li>
          </template>
        </ul>
      </div>
      <my-dropload @refresh="refreshList" @more="moreList" ref="dropload">
        <div class="classify-new" ref="mainList">
          <ul class="list">
            <template v-for="item in list">
              <li @click="itemClick(item)">
                <img src="" :src="item.imageUrl">
                <div>
                  <p>{{item.nameCn}}</p>
                  <div>
                    <span>￥{{showPrice(item.scenicPrice)}}<label>起</label></span>
                    <div @click.stop="hrefFillOrder(item)">立即购买</div>
                  </div>
                </div>
              </li>
            </template>
          </ul>
        </div>
        <!-- 无数据 -->
        <template v-if="isNull">
          <div class="none-data">
            <img src="../../res/img/not-order.png" alt="">
            <p>查询不到数据</p>
          </div>
        </template>
      </my-dropload>
    </main>
    <my-footer slot="bottom" :foot-index="footIndex" @menu-check="clickFootMenu">
    </my-footer>
  </ViewBox>
</template>
<script>
  import Vue from 'vue'
  import xyz from '@/lib/wp-xyz'
  import VmUtils from '@/lib/vm-utils'
  import common from '@/lib/wp-common'
  import myDropload from '@/utils/dropload'
  import {ViewBox} from 'vux'
  import myFooter from '@/utils/footer'
  let default2 = require('@/res/img/default-2.jpg');

  let vm, utils = new VmUtils()

  export default{
    components: {myDropload, myFooter, ViewBox},
    name: "classify",
    data() {
      return {
        pageScroll: 0,
        isInit: false,
        page: 0,
        queryTxt: '',
        sortIndex: 0,
        sortList: [{txt: '综合', ext: 'all'}, {txt: '销量', ext: 'sale'}, {txt: '价格', ext: 'price'}],
        list: [],
        collList: false,
        footIndex: 'classify',
        isBlur: false,
        isNull: false,
        scrollTop: 0
      }
    },
    mounted(){
      vm = utils.init(this)
      initPage()
    },
    activated () {
      utils.getDom('classify').scrollTo(utils.vuexGetScrollTopByRouteName(utils.routeName))
      common.testLoginInfo(utils.router, window, xyz)
    },
    deactivated(){
      utils.vuexSaveScrollTop(utils.routeName, utils.getDom('classify').getScrollTop())
    },
    methods: {
      'clickFootMenu' (idx) {
        utils.routerReplace(idx)
      },
      'clickSortMenu' (idx) {
        this.sortIndex = idx
        queryList(this.page = 1)
      },
      'showPrice' (price) {
        return Number(price).toFixed(2)
      },
      'queryList' () {
        queryList(this.page = 1)
      },
      'enterClick' () {
        this.isBlur = true
        queryList(this.page = 1)
      },
      'focus' () {
        this.isBlur = false
      },
      'itemClick'  (item) {
        let data = {
          numberCode: item.numberCode
        }
        utils.routerPush('supDet', data, {name: utils.routeName})
      },
      'hrefFillOrder'  (item) {
        let data = {
          numberCode: item.numberCode,
          providerNameCn: item.nameCn,
          img: item.imageUrl
        }
        utils.routerPush('fillOrder', data, {name: utils.routeName})
      },
      moreList() {
        queryList(++this.page)
      },
      refreshList(){
        queryList(this.page = 1)
      }
    }
  }


  function queryList(page) {
    if (page < 1) {
      done(true, vm.isNull)
      return;
    }
    let sortList = vm.sortList
    let sortIndex = vm.sortIndex
    let orderBy = 'scenic_month_sale DESC';
    if (sortList[sortIndex].ext === 'price') {
      orderBy = 'scenic_price ASC'
    } else if (sortList[sortIndex].ext === 'all') {
      orderBy = 'alter_date DESC'
    }

    xyz.ajax({
      url: 'BuyerProviderWS/queryProviderList.app',
      data: {
        nameCn: vm.queryTxt,
        page: page,
        rows: 10,
        providerType: 'SC',
        orderBy: orderBy,
        extraParam: ''
      },
      loading: utils.vux.loading,
      success (data) {
        if (data.status === 1) {
          let result = data.content;//当前数据条数
          //重置

          let total = data.content['total']

          vm.isNull = total <= 0

          if (page === 1 || vm.isNull) {
            vm.list = []
          }

          for (let i = 0; i < result.rows.length; i++) {
            let row = result.rows[i];
            row.imageUrl = xyz.getMiddleImageUrl(row.imageUrl);

            if (row.imageUrl.indexOf('img/default.png') > -1) {
              row.imageUrl = default2;
            }

            vm.list.push(row);
          }

          Vue.nextTick(common.wResize)

          done(!(vm.list.length === total ), vm.isNull)
        } else {
          vm.isNull = true;
          done(true, vm.isNull)
          utils.vuxToast(data.msg, 'warn')
        }
      },
      error () {
        vm.isNull = true;
        done(true, vm.isNull)
        utils.vuxToast('无法访问服务器啦', 'warn')
      }
    });
  }

  function done(isNotMore, isHide) {
    utils.getDom('dropload').$emit('done', isNotMore, isHide)
  }

  function getProviderCollection() {
    if (!vm.collList) {
      xyz.ajax({
        url: 'BuyerProviderWS/getProviderCollection.cus',
        data: {
          apikey: window.localStorage.apikey
        },
        success (data) {
          if (data.status === 1) {
            let result = data.content;
            vm.collList = result;
            for (let i = 0; i < vm.list.length; i++) {
              let item = vm.list[i];
              let count = result[item.numberCode];
              item.collection = count ? count : 0;
              vm.list.splice(i, 1, item);
            }
          } else {
            utils.vuxToast(data.msg, 'warn')
          }
        }
      });
    } else {
      for (let i = 0; i < vm.list.length; i++) {
        let item = vm.list[i];
        let count = vm.collList[item.numberCode];
        item.collection = count ? count : 0
        vm.list.splice(i, 1, item)
      }
    }
  }

  function initPage() {
    queryList(vm.page = 1)
  }
</script>
<style lang="less" src="./classify-header.less">

</style>
<style lang="less" src="./classify.less">

</style>
<style lang="less" src="./classify-list.less">

</style>

