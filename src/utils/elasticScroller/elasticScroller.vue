<template>
  <div :class="[scrollStyle]" ref="parent">
    <div ref="scroll" class="elastic-scroll-div"
         :style="{'transform':returnTransform,'transition':returnTransition}" @touchmove="tMove"
         @touchstart="tMove" @touchend="tMove" @mousedown="mMove" @mousemove="mMove" @mouseup="mMove">
      <slot>

      </slot>
    </div>
  </div>
</template>

<script>
  export default{
    props: {
      scrollStyle: {
        required: true
      },
      scrollType: {
        'default': 'top',
        required: true
      },
      maxScroll: {
        'default': 100
      }
    },
    data(){
      return {
        elasticTime: 0,
        maxElastic: 200,
        mouseDown: false,
        top: {
          now: 0,
          touchId: 0,
          touchStart: 0,
          touchMove: 0,
          touchStartTime: 0,
          scrollStart: 0,
          scrollEnd: 0,
          lastTwoPoint: [],
        },
        left: {
          now: 0,
          touchId: 0,
          touchStart: 0,
          touchMove: 0,
          touchStartTime: 0,
          scrollStart: 0,
          scrollEnd: 0,
          lastTwoPoint: []
        },
      }
    },
    computed: {
      returnTransform(){
        return 'translate(' + this.left.now + 'px,' + this.top.now + 'px)'
      },
      returnTransition(){
        return 'transform ' + this.elasticTime + 's cubic-bezier(0.1, 0.85, 0.25, 1) 0s'
      },
    },
    methods: {
      tMove(event){
        switch (this.scrollType) {
          case 'top':
            this.scroll(event, 'screenY', 'offsetHeight', this.top)
            break
          case 'left':
            this.scroll(event, 'screenX', 'offsetWidth', this.left)
            break
          default:
            this.scroll(event, 'screenY', 'offsetHeight', this.top)
            this.scroll(event, 'screenX', 'offsetWidth', this.left)
            break
        }
      },
      mMove(event){
        switch (event.type) {
          case 'mousedown':
            this.mouseDown = true
            break
          case 'mousemove':
            if (this.mouseDown) {
              console.log(event.clientY)
            }
            break
          case 'mouseup':
            this.mouseDown = false
            break
        }
      },
      scroll(event, direction, max, scroll){
        let e = event.touches[0]
        switch (event.type) {
          case 'touchstart':
            try {
              event.preventDefault()
            } catch (e) {
              console.log(e)
            }
            this.elasticTime = 0
            scroll.touchStart = e[direction]
            scroll.lastTwoPoint = []
            scroll.lastTwoPoint.push(e[direction])
            scroll.lastTwoPoint.push(e[direction])

            let scrollDiv = this.$refs['scroll'][max]
            let parentDiv = this.$refs['parent'][max]

            scroll.scrollStart = 0
            scroll.scrollEnd = (scrollDiv - parentDiv) * -1
            break
          case 'touchend':
            let p = scroll.now
            p += (scroll.lastTwoPoint[1] - scroll.lastTwoPoint[0]) * 25;

            if (p > scroll.scrollStart) {
              p = scroll.scrollStart
            } else if (p < scroll.scrollEnd) {
              p = scroll.scrollEnd
            }

            this.elasticTime = Math.sqrt(Math.abs(scroll.lastTwoPoint[1] - scroll.lastTwoPoint[0])) / 5

            scroll.now = p
            break
          case 'touchcancel':
            console.log('cancel')
            break
          case 'touchmove':
            let dx = Number(e[direction] - scroll.lastTwoPoint[scroll.lastTwoPoint.length - 1])

            if (scroll.now >= scroll.scrollStart || scroll.now <= scroll.scrollEnd) {
              dx = dx / 2
            }

            scroll.touchMove = dx;
            scroll.now += scroll.touchMove;

            if (scroll.lastTwoPoint.length > 1) {
              scroll.lastTwoPoint.shift()
            }

            scroll.lastTwoPoint.push(e[direction])
            break
        }
      }
    },
    watch: {}
  }
</script>

<style lang="less" src="./elasticScroller.less">

</style>
