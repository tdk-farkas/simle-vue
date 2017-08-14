<!--
   下拉刷新组件
   v 1.0.0

  参数：
  @refresh    下拉刷新回调函数
  @more      点击加载更多回掉函数


  重置下拉刷新组件的方法：
  父容器
  给 组件添加  ref="dropload"
  this.$refs['dropload'].$emit('done');  //重置 组件状态
  this.$refs['dropload'].$emit('done', false) //重置组件状态， 并且 不允许加载更多   可以通过再调用一次   重置组件状态 的函数来 恢复加载更多的功能
-->
<template>
  <div id="dropload">
    <div ref="top" class="dropload-up" :style="{'height':refreshHeight+'px'}" >
      <template v-if="refreshStatus==0">
        <div class="dropload-refresh">↓下拉刷新</div>
      </template>
      <template v-else-if="refreshStatus==1">
        <div class="dropload-update">↑释放更新</div>
      </template>
      <template v-else>
        <div class="dropload-load">
          <span class="loading"></span>
          加载中...
        </div>
      </template>
    </div>
    <div ref="body" @scroll="bodyScroll" @touchstart="touchStart($event)" @touchmove="touchMove($event)"
         @touchend="touchEnd($event)">
      <slot>

      </slot>
    </div>
    <div ref="down" class="dropload-down">
      <template v-if="downLoadStatus==0">
        <div class="dropload-refresh" @click="loadMore">点击加载更多</div>
      </template>
      <template v-else-if="downLoadStatus ==1">
        <div class="dropload-load"><span class="loading"></span>加载中...</div>
      </template>
      <template v-else-if="downLoadStatus==3">
        <div class="dropload-noData">暂无更多数据</div>
      </template>
      <template v-else-if="downLoadStatus==4">

      </template>
    </div>
  </div>
</template>

<script>
  export default {
    name: 'dropload',
    data(){
      return {
        isLockUp: false,//下拉是否锁定
        isLockDown: false,//上拉是否锁定
        loading: false, //加载中状态
        refreshStatus: 0,
        refreshHeight: 0,
        downLoadStatus: 4,
        _scrollTop: 0,//下拉刷新距离
        _threshold: 0,//滑动到距离底部0px时,自动加载下一页
        _scrollWindowHeight: 0,
        _scrollContentHeight: 0,
        _startY: 0,
        _moveY: 0,
        _curY: 0,
        _offsetY: 0,
        touchScrollTop: 0,
        distance: 50, //拉动距离
        direction: ''
      }
    },
    ready(){
      console.log('下拉刷新组件准备完成')
    },
    mounted () {
      this.$nextTick(function () {
        this.$on('done', function (isMore, noShow) {
          this.refreshHeight = 0;
          this.refreshStatus = 0;

          if (isMore === false) {
            this.downLoadStatus = 3;
          } else {
            this.downLoadStatus = 0;
          }

          if (noShow) {
            this.downLoadStatus = 4;
          }

          this.loading = false;
        })
      })
    },
    methods: {
      bodyScroll(){
        this._scrollTop = window.pageYOffset || this.$refs['body'].scrollTop || document.body.scrollTop;

        // 滚动页面触发加载数据
        if (!this.loading && !this.isLockDown && (this._scrollContentHeight - this._threshold) <= (this._scrollWindowHeight + this._scrollTop)) {
          this.loadDown();
        }
      },
      loadDown(){

      },
      touchStart(e){
        if (!this.loading) {
          this.fnTouches(e);
          this.fnTouchstart(e);
        }
      },
      touchMove(e){
        if (!this.loading) {
          this.fnTouches(e);
          this.fnTouchmove(e);
        }
      },
      touchEnd(e){
        if (!this.loading) {
          this.fnTouchend();
        }
      },
      fnTouchstart(e){
        this._startY = e.touches[0].pageY;
        this.touchScrollTop = window.pageYOffset || this.$refs['body'].scrollTop || document.body.scrollTop;
      },
      fnTouchmove(e){
        this._curY = e.touches[0].pageY;
        this._moveY = this._curY - this._startY;

        if (this._moveY > 0) {
          this.direction = 'down';
        } else if (this._moveY < 0) {
          this.direction = 'up';
        }

        let _absMoveY = Math.abs(this._moveY);

        let dom = null;
        if (this.touchScrollTop <= 0 && this.direction === 'down' && !this.isLockUp) {
          e.preventDefault();

          dom = this.$refs['top'];
        }

        this.fnTransition(dom, 0);

        if (_absMoveY <= this.distance) {
          this._offsetY = _absMoveY;

          this.refreshStatus = 0;
        } else if (_absMoveY > this.distance && _absMoveY <= this.distance * 2) {
          this._offsetY = this.distance + (_absMoveY - this.distance) * 0.5;

          this.refreshStatus = 1;
        } else {
          this._offsetY = this.distance + this.distance * 0.5 + (this._moveY - this.distance * 2) * 0.2;
        }

        if (dom && !isNaN(this._offsetY)) {
          this.refreshHeight = this._offsetY;
        }
      },
      fnTouchend(){
        let that = this;
        let _absMoveY = Math.abs(this._moveY);
        let dom = this.$refs['top'];
        if (this.touchScrollTop <= 0 && this.direction === 'down' && !this.isLockUp) {
          this.fnTransition(dom, 300);

          if (_absMoveY > this.distance) {
            let readyHeight = 0;
            let du = dom.childNodes;
            for (let i = 0; i < du.length; i++) {
              readyHeight += du[i].clientHeight;
            }
            this.refreshHeight = readyHeight;

            this.refreshStatus = 2;
            //dom.innerHTML = me.opts.domUp.domLoad;

            this.loading = true;
            this.$emit('refresh');
          } else {
            this.refreshHeight = 0;
          }
          this._moveY = 0;
        }
      },
      fnTouches(e){
        if (!e.touches) {
          e.touches = e.originalEvent.touches;
        }
      },
      fnTransition(dom, num){
        if (dom) {
          dom.style['-webkit-transition'] = 'all ' + num + 'ms';
          dom.style['transition'] = 'all ' + num + 'ms';
        }
      },
      loadMore(){
        this.downLoadStatus = 1;
        this.$emit('more');
      }
    }
  }
</script>

<style src="./dropload.less" lang="less">

</style>
