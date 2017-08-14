/**
 * Created by Farkas on 2017/5/31.
 * 这个文件主要是用于初始化 一些全局都可能用到的东西
 */

/*
 5+ sdk 监控返回按钮  start
 */

import Vue from 'vue'
import xyz from  './wp-xyz.js'

let outObj = {};

(function (win) {
  let doc = win.document
  let plusKeyTime = 0

  function plusReady() {
    let p = win.plus
    let __CloseAppPage = [
      'page/login.html',
      'page/classify.html',
      'page/order.html',
      'page/me.html'
    ]

    let __pathname = win.location.pathname
    let __closeFlag = __CloseAppPage.some(function (radio) {
      return __pathname.indexOf(radio) !== -1
    })

    if (__closeFlag) {
      p.key.addEventListener('backbutton', function () {
        let tt = new Date().getTime() - plusKeyTime
        if (tt <= 2000) {
          p.runtime.quit()
        } else {
          plusKeyTime = new Date().getTime()
          p.nativeUI.toast("再按一次退出应用")
        }
      })
    } else {
      p.key.addEventListener('backbutton', function () {
        xyz.back()
      })
    }
  }

  if (win.plus) {
    plusReady()
  } else {
    doc.addEventListener('plusready', plusReady, false)
  }
})(window);
/*
 5+ sdk 监控返回按钮  end
 */

/**
 * 自定义指令，目前有两个指令 start
 * focus: v-focus 的 value 为  true  时，该元素获得焦点
 * blur: v-blur 的 value 为  true 时， 该元素失去焦点
 */
(function (v) {
  if (v) {
    v.directive('focus', {
      // 当绑定元素插入到 DOM 中。
      update (el, binding) {
        // 获得焦点
        if (binding.name === 'focus') {
          if (binding.oldValue === false && binding.value === true) {
            el.focus()
          }
        }
      }
    })

    // 注册一个全局自定义指令 v-blur
    v.directive('blur', {
      // 当绑定元素插入到 DOM 中。
      update (el, binding) {
        // 失去焦点
        if (binding.name === 'blur') {
          if (binding.oldValue === false && binding.value === true) {
            el.blur()
          }
        }
      }
    })
  }
})(Vue)
/**
 *  自定义指令，目前有两个指令 end
 */


/**
 * 判断是否在微信环境中运行
 * @returns {Boolean}
 */
outObj.isWeixin = function () {
  let ua = window.navigator.userAgent.toLowerCase().match(/micromessenger/i)
  return ua ? ua[0] === 'micromessenger' : false
}

outObj.testLoginInfo = function (router, win, xyz) {
  let __pathname = win.location.pathname
  let __noDecideLogin = [
    'index.html',
    'main.html',
    'wx.html',
    'error.html',
    'error2.html',
    'test.html',
    'login'
  ]
  let __decideFlag = true
  for (let i = 0; i < __noDecideLogin.length; i++) {
    if (__pathname.indexOf(__noDecideLogin[i]) !== -1) {
      __decideFlag = false
      break
    }
  }

  if (__decideFlag) {
    xyz.ajax({
      url: 'CustomerWS/decideLogin.cus',
      data: {
        apikey: win.localStorage.apikey
      },
      success (data) {
        if (data && data.status === 1) {
          return
        }

        if (outObj.isWeixin()) {
          win.location.href = 'http://www.lanpixiang.com/WeixinWS/link.xyz?t=tag&v=index'
        } else {
          router.push({name: 'login', query: {go: __pathname}})
        }
      },
      error(request, txt, error){
        console.log(request)
        console.log(txt)
        console.log(error)
      }
    })
  }
}

/**
 日期格式化
 */
Date.prototype.format = function (fmt) {
  let o = {
    "M+": this.getMonth() + 1, // 月份
    "d+": this.getDate(), // 日
    "h+": this.getHours(), // 小时
    "m+": this.getMinutes(), // 分
    "s+": this.getSeconds(), // 秒
    "q+": Math.floor((this.getMonth() + 3) / 3), // 季度
    "S": this.getMilliseconds()// 毫秒
  }
  if (/(y+)/.test(fmt)) {
    fmt = fmt.replace(RegExp.$1, (this.getFullYear() + "").substr(4 - RegExp.$1.length))
  }
  for (let k in o) {
    if (o.hasOwnProperty(k)) {
      if (new RegExp("(" + k + ")").test(fmt)) {
        fmt = fmt.replace(RegExp.$1, (RegExp.$1.length === 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)))
      }
    }
  }
  return fmt
};

/**
 计算页面的rem 值
 */
(function (win) {
  let maxWidth = 768
  let readyWidth = 375
  let scale = 20
  let doc = win.document

  let wResize = function () {
    let width
    if (!doc.body) {
      width = win.innerWidth ? win.innerWidth : doc.documentElement.clientWidth
    } else {
      width = doc.body.clientWidth
    }

    if (width > maxWidth) {
      width = maxWidth
    }

    let fontSize = (width / readyWidth * scale)
    doc.getElementsByTagName('html')[0].style.fontSize = fontSize + 'px'
  }

  let winWidth = win.innerWidth
  //当浏览器大小变化的时候 刷新页面
  win.onresize = function () {
    if (winWidth !== win.innerWidth) {
      win.location.reload(true)
    }
  }

  outObj.wResize = wResize
})(window)

export default outObj
