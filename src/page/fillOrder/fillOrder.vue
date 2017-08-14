<template>
  <div id="fillOrder" @click="pageClick">
    <my-header :my-title="pageTitle" :is-back="true" @go-back="goBack">

    </my-header>
    <main class="poup">
      <div class="order-info-title clear">
        <div class="order-img">
          <img src="" :src="getCheckSku().imageUrl?getCheckSku().imageUrl:providerImg">
        </div>
        <div class="order-name" v-cloak>
          <span class="price">¥{{checkStock ? (checkStock.price * shopCount).toFixed(2) : getCheckSku().price}}</span>
          <p>{{providerNameCn}}</p>
        </div>
      </div>
      <div class="fill-order-wraper">
        <!-- 门票种类 -->
        <div class="ticket-type-box">
          <p class="fill-order-title">
            <i class="s-line"></i>门票种类 <span style="display: none;">1.2米以下50kg以内</span>
          </p>
          <ul class="ticket-type clear">
            <template v-for="(item,idx) in skuList">
              <li :class="{'li-active':idx==checkIndex}" @click="checkSku(idx)">
                {{item.nameCn}}
              </li>
            </template>
          </ul>

          <p class="remark red" v-if="getCheckSku().aheadTime>0" v-cloak>
            {{countDate(getCheckSku())}}</p>
          <p class="remark" v-if="getCheckSku().remark" v-cloak>{{getCheckSku().remark}}</p>
        </div>
        <!-- 出行日期 -->
        <my-date
          :date="stockDate"
          :min-date="new Date()"
          :stock-list="stockList"
          :title="'出行日期'"
          :not-stock-check="false"
          @check-item="clickItem"
          @update-stock="getStock" v-cloak></my-date>
        <!-- 购买数量 -->
        <div class="purchase-quantity-box clear" v-cloak>
          <p class="fill-order-title" v-cloak>
            <i class="s-line"></i>购买数量
            <span class="quantity-choice">
                可购{{checkStock ? checkStock.count : 0}}个
                <i class="iconfont icon-jian" :class="{'icon-check':shopCount>0}"
                   @click="shopCount>0?countCheckCount(-1):''"></i>
                <label class="num">{{shopCount < 10 ? '0' + shopCount : shopCount}}</label>
                <i class="iconfont icon-jia"
                   :class="{'icon-check':shopCount<(checkStock?checkStock.count:0)}"
                   @click="shopCount<(checkStock?checkStock.count:0)?countCheckCount(1):''"></i>
            </span>
          </p>
        </div>
        <!--出行时间-->
        <template v-if="checkStock">
          <div class="purchase-quantity-box clear" v-cloak>
            <p class="fill-order-title" v-cloak>
              <i class="s-line"></i>出行时间
              <span class="check-time" id="selectTime">{{checkTime.h + ' : ' + checkTime.m}}</span>
              <span class="check-date">{{checkStock.dateInfo}} </span>
            </p>
          </div>
        </template>
      </div>
      <div class="fill-order-wraper contact-info" v-cloak>
        <div class="link-tel">
          <p class="fill-order-title">
            <i class="s-line"></i><span>联系人</span>
            <input type="text" placeholder="请输入联系人姓名" v-model="linkName">
          </p>
        </div>
        <div class="link-tel">
          <p class="fill-order-title">
            <i class="s-line"></i><span>联系电话</span>
            <input type="tel" placeholder="用于联系您" v-model="linkPhone">
          </p>
        </div>
        <div class="link-tel">
          <p class="fill-order-title">
            <i class="s-line"></i><span @click.stop="selectType">{{typeList[checkTypeIndex].txt}}</span>
            <i class="iconfont icon-xiala-copy" :class="{'transform270':!showType}"
               @click.stop="selectType"></i>
            <input type="text" :placeholder="'请输入'+typeList[checkTypeIndex].txt+'号码'" v-model="linkCard">
          </p>
          <template v-if="showType">
            <div class="certificates">
              <ul>
                <template v-for="(item,idx) in typeList">
                  <li @click="checkType(idx)">{{item.txt}}</li>
                </template>
              </ul>
            </div>
          </template>
        </div>
        <div class="order-remarks">
          <textarea placeholder="订单备注" v-model="remark"></textarea>
        </div>
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

    <footer class="footer">
      <a href="javascript:" @click="checkOrder">确 定</a>
    </footer>
  </div>
</template>

<script>

  import xyz from '@/lib/wp-xyz'
  import common from '@/lib/wp-common'
  import VmUtils from '@/lib/vm-utils'
  import myHeader from '@/utils/header'
  import myDate from '@/utils/myDate'

  require('@/utils/dateSelector/dateSelector.css')
  require('@/utils/dateSelector/dateSelector.js')

  let defaultImg = require('@/res/img/default.png')

  let vm = {}, utils = new VmUtils()
  export default{
    name: 'fillOrder',
    components: {myHeader, myDate},
    mounted(){
      vm = utils.init(this)
    },
    activated () {
      common.testLoginInfo(utils.router, window, xyz)
      initPage()
    },
    deactivated(){
      this.numberCode = ''
      this.providerNameCn = ''
      this.providerImg = defaultImg
      this.skuList = []
      this.checkIndex = 0
      this.showType = false
      this.checkTypeIndex = 0
      this.stockDate = new Date()
      this.stockList = []
      this.shopCount = 0
      this.checkStock = null
      this.linkPhone = ''
      this.linkName = ''
      this.linkCard = ''
      this.remark = ''
      this.pop = {
        isShowPop: false,
        content: '',
        cancel: '取消',
        done: '确定',
        prarm: {},
        doneCallBack  () {
        }
      }
      this.checkTime = {
        h: '00',
        m: '00'
      }
    },
    data(){
      return {
        pageTitle: '填写订单',
        numberCode: '',
        providerNameCn: '',
        providerImg: defaultImg,
        skuList: [],
        checkIndex: 0,
        showType: false,
        checkTypeIndex: 0,
        typeList: [{txt: '身份证'}, {txt: '护照'}],
        stockDate: new Date(),
        stockList: [],
        shopCount: 0,
        checkStock: null,
        linkPhone: '',
        linkName: '',
        linkCard: '',
        remark: '',
        dateSelector: null,
        pop: {
          isShowPop: false,
          content: '',
          cancel: '取消',
          done: '确定',
          prarm: {},
          doneCallBack  () {
          }
        },
        checkTime: {
          h: '00',
          m: '00'
        }
      }
    },
    methods: {
      'goBack' () {
        utils.routerBack();
      },
      'getCheckSku' () {
        let defaultData = {
          price: '0.0'
        };
        return this.skuList.length > 0 ? this.skuList[this.checkIndex] : defaultData;
      },
      'checkSku' (idx) {
        this.checkIndex = idx;
        getStock();
      },
      'selectType' () {
        this.showType = !this.showType;
      },
      'checkType' (idx) {
        this.checkTypeIndex = idx;
      },
      'pageClick' () {
        this.showType = false;
      },
      'clickItem' (checkObj) {
        if (checkObj && checkObj.stock) {
          this.checkStock = checkObj.stock;
          if (this.checkStock.count <= this.shopCount) {
            this.shopCount = this.checkStock.count;
          } else if (this.shopCount === 0) {
            this.shopCount = 1;
          }
        } else {
          this.checkStock = null;
          this.shopCount = 0;
        }

        if (this.checkStock) {
          if (vm.dateSelector) {

          } else {
            let contianerId = 'mult_dateselector_' + new Date().getTime();
            let contianerDiv = document.createElement('div');
            contianerDiv.id = contianerId;
            document.body.appendChild(contianerDiv);
            vm.dateSelector = new window.DateSelector({
              input: 'selectTime',//点击触发插件的input框的id
              container: contianerId,
              type: 0,
              param: [0, 0, 0, 1, 1],
              beginTime: [],
              endTime: [],
              recentTime: [],
              success (arr) {
                vm.checkTime.h = arr[0] > 9 ? arr[0] : '0' + arr[0];
                vm.checkTime.m = arr[1] > 9 ? arr[1] : '0' + arr[1];
              }
            });
          }
        }

        this.checkTime.h = '00';
        this.checkTime.m = '00'
      },
      'countCheckCount' (num) {
        this.shopCount += num;
      },
      'getStock': getStock,
      'checkOrder': checkOrder,
      'doneClick' () {
        let pop = this.pop;
        pop.isShowPop = false;

        pop.doneCallBack(pop.prarm);
        pop.doneCallBack = function () {
        };
      },
      'countDate'  (obj) {
        let aheadTime = obj.aheadTime;
        let time = xyzZhTime(aheadTime);

        return '该产品需提前' + (time[0] > 0 ? time[0] + '天' : '') + (time[1] > 0 ? time[1] + '小时' : '') + (time[2] > 0 ? time[2] + '分' : '') + '预定';
      }
    }
  }

  function initPage() {
    let p = vm.$route.query//xyz.getUrlparam();
    if (!p || !p.numberCode) {
      utils.vuxAlert('警告', '参数错误，即将返回上页',
        () => {
          vue.$router.back();
        });
      return
    }

    vm.numberCode = p.numberCode;
    vm.providerNameCn = p.providerNameCn;
    vm.providerImg = p.img;

    let localLoginInfo = xyz.isNull(window.localStorage.localLoginInfo) ? "" : JSON.parse(window.localStorage.localLoginInfo)
    if (!xyz.isNull(localLoginInfo.linkman)) {
      vm.linkName = localLoginInfo.linkman
    }
    if (!xyz.isNull(localLoginInfo.linkPhone)) {
      vm.linkPhone = localLoginInfo.linkPhone
    }

    queryList()
  }

  function queryList() {
    xyz.ajax({
      url: 'BuyerScenicWS/queryScenicList.app',
      data: {
        provider: vm.numberCode,
        page: 1,
        rows: 100
      },
      loading: utils.vux.loading,
      success (data) {
        if (data.status === 1) {
          let result = data.content;
          if (result['total'] <= 0) {
            vm.skuList = [];
          }

          if (result.rows.length > 0) {
            for (let i = 0; i < result.rows.length; i++) {
              vm.skuList.push(result.rows[i]);
            }
          }

          getStock();
        } else {
          vm.skuList = [];
          utils.vuxToast(data.msg, 'warn')
        }
      }, error  () {
        utils.vuxToast('无法访问服务器啦', 'warn')
      }
    })
  }

  function getStock(resultDate) {
    if (vm.skuList.length === 0) {
      return
    }

    if (resultDate) {
      vm.stockDate.setTime(resultDate.getTime());
    }

    let endDate = new Date();
    endDate.setTime(vm.stockDate.getTime());
    endDate.setMonth(endDate.getMonth() + 1);
    endDate.setDate(0);
    vm.stockList = [];
    xyz.ajax({
      url: 'ProductStockWS/queryProductStockList.app',
      data: {
        apikey: window.localStorage.apikey,
        product: vm.skuList[vm.checkIndex].numberCode,
        dateStart: vm.stockDate.xyzFormat('yyyy-MM-dd'),
        dateEnd: endDate.xyzFormat('yyyy-MM-dd')
      },
      loading: utils.vux.loading,
      success (data) {
        if (data.status === 1) {
          let array = data.content.rows;
          let len = array.length;
          if (len === 0) {

          } else {
            for (let i = 0; i < len; i++) {
              let o = array[i];
              let cc = o['count'] - o['useCount'];
              if (cc > 0) {
                vm.stockList.push({
                  id: o['iidd'],
                  price: Number(o.price).toFixed(2),
                  dateInfo: o.dateInfo.split(' ')[0],
                  count: cc
                });
              }
            }
          }
        } else {
          utils.vuxToast(data.msg, 'warn')
        }
      },
      error  () {
        vm.stockList = null;
      }
    });
  }

  function checkOrder() {
    if (xyz.isNull(vm.checkStock)) {
      utils.vuxToast('请选择出行日期', 't')
      return
    }
    if (vm.shopCount < 1) {
      utils.vuxToast('请选择购买数量', 't')
      return
    }
    if (xyz.isNull(vm.linkName)) {
      utils.vuxToast('请填写联系人姓名', 't')
      return
    }
    if (xyz.isNull(vm.linkPhone)) {
      utils.vuxToast('请填写联系电话', 't')
      return
    }
    if (xyz.isNull(vm.linkCard)) {
      utils.vuxToast('请填写' + vm.typeList[vm.checkTypeIndex].txt + '号码', 't')
      return
    }
    if (!xyz.isPhone(vm.linkPhone)) {
      utils.vuxToast('请填写11位正确的手机号码（仅支持中国大陆手机号）', 't')
      return
    }

    let aheadTime = vm.getCheckSku().aheadTime
    if (aheadTime > 0) {
      let checkDate = new Date(vm.checkStock.dateInfo)
      checkDate.setHours(vm.checkTime.h)
      checkDate.setMinutes(vm.checkTime.m)
      let nowTime = new Date().getTime()
      let minDate = new Date(nowTime + aheadTime)
      if (minDate.getTime() >= checkDate.getTime()) {
        let time = xyzZhTime(aheadTime)
        utils.vuxToast('预定该产品需提前<br>' + (time[0] > 0 ? time[0] + '天' : '') + (time[1] > 0 ? time[1] + '小时' : '') + (time[2] > 0 ? time[2] + '分' : '') + '<br>请另选合适的<br>出行日期与时间', 'warn')
        return
      }
    }

    let pop = vm.pop
    pop.content = '<div style="text-align: left;padding: 0.5rem;"><p style="width:100%; text-align: center;">订单确认</p><br>' +
      '<label style="margin-left:0.5rem;">日期：</label>' +
      '<label style="margin-left:0.5rem; color:#333;">' + vm.checkStock.dateInfo + ' ' + vm.checkTime.h + ':' + vm.checkTime.m + '</label><br>' +
      '<label style="margin-left:0.5rem;">数量：</label>' +
      '<label style="margin-left:0.5rem; color:#333;">' + vm.shopCount + '张</label><br>' +
      '<label style="margin-left:0.5rem;">总价：</label>' +
      '<label style="margin-left:0.5rem; color:#333;">¥' + Number(vm.checkStock.price * vm.shopCount) + '</label></div>'
    pop.doneCallBack = createOrder
    pop.done = '下单'
    pop.isShowPop = true
  }

  function createOrder() {
    let distribution = (window.localStorage.distribution && window.localStorage.distributionDate && Number(window.localStorage.distributionDate) >= new Date().getTime()) ? window.localStorage.distribution : '';
    xyz.ajax({
      url: 'BuyerOrderWS/createOrder.cus',
      data: {
        apikey: window.localStorage.apikey,
        product: vm.skuList[vm.checkIndex].numberCode,
        count: vm.shopCount,
        dateInfo: vm.checkStock.dateInfo,
        day: 1,
        linkman: vm.linkName,
        linkPhone: vm.linkPhone,
        cardNum: vm.linkCard,
        cardType: vm.typeList[vm.checkTypeIndex].txt,
        distribution: distribution,
        remarkBuy: vm.remark
      },
      loading: utils.vux.loading,
      success (data) {
        if (data.status === 1) {
          utils.vuxToast('<br/>下单成功<br/><br/>三十分钟未支付订单将关闭。', 'success', 2000,
            () => {
              if (!xyz.isNull(data.content)) {
                let param = {
                  orderNum: data.content,
                  shopCount: vm.shopCount,
                  money: vm.checkStock.price,
                  img: xyz.getMiddleImageUrl(vm.skuList[vm.checkIndex].imageUrl)
                }

                utils.routerPush('orderDetails', param, {name: utils.routeName})
              } else {
                utils.routerPush('order', {checkIndex: 0})
              }
            })
        }
        else {
          utils.vuxToast(data.msg, 'warn')
        }
      }
    });
  }

  function xyzZhTime(time) {
    let day = parseInt(time / (24 * 60 * 60 * 1000));
    let hour = parseInt((time % (24 * 60 * 60 * 1000)) / (60 * 60 * 1000));
    let min = parseInt((time % (60 * 60 * 1000)) / (1000 * 60));
    return [day, hour, min];
  }

  function xyzDeZhTime(day, hour, min) {
    let dd = day * 24 * 60 * 60 * 1000;
    let hh = hour * 60 * 60 * 1000;
    let mm = min * 60 * 1000;
    return dd + hh + mm;
  }

</script>

<style lang="less" src="./fillOrder.less">

</style>
<style lang="less" src="./pop-box.less">

</style>
