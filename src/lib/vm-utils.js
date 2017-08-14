/**
 * Created by Farkas on 2017/7/11.
 */
export default function () {
  let context = this
  context.init = function (vue) {
    context.refs = vue.$refs

    initVue(context)

    if (vue.$vux) {
      context.vux = vue.$vux

      vue.$watch('$vux', function (newVal, oldVal) {
        context.vux = newVal
      })

      initVux(context)
    } else {
      console.log('没有找到 vux 组件')
    }

    if (vue.$router) {
      context.route = vue.$route
      context.router = vue.$router

      vue.$watch('$route', function (newVal, oldVal) {
        context.route = newVal
      })
      vue.$watch('$router', function (newVal, oldVal) {
        context.router = newVal
      })

      initRouter(context)

      if (vue.$store) {
        context.store = vue.$store

        vue.$watch('$store', function (newVal, oldVal) {
          context.store = newVal
        })

        initVuex(context)
      }
    } else {
      console.log('没有找到 router 组件')
    }

    return vue
  }
}

function initVue(vm) {
  vm.getDom = (key) => vm.refs[key]
}

function initVuex(vm) {
  vm.vuexGetScrollTopByRouteName = function (name) {
    return vm.store.state.scrollTop[name]
  }

  vm.vuexSaveScrollTop = function (name, side) {
    vm.store.commit('saveScrollTop', {
      name: name,
      side: side
    })
  }
}

//初始化 Vux 组件的功能
function initVux(vm) {
  vm.vuxLoadingShow = function (text) {
    vm.vux.loading.show({text: text ? text : '加载中...'})
  }

  vm.vuxLoadingHide = function (time) {
    setTimeout(() => {
      vm.vux.loading.hide()
    }, time ? time : 0)
  }

  /**
   * @param title           标题
   * @param content    内容
   * @param hide         由显示变为隐藏时的回调
   * @param show        由隐藏变为显示时的回调
   * @returns {{title: string, content: string}}
   */
  vm.vuxAlert = function (title, content, hide, show) {
    let p = vuxAlertParams(...arguments)
    vm.vux.alert.show(p)
  }

  /**
   * @param text     文本
   * @param position     提示类型有4个选择  d , t , m , b   默认 ， 顶部， 中部 ， 底部
   * @param type     提示类型有4个选择  success, warn, cancel, text
   * @param time     展示时间
   * @param callback    展示结束时执行
   * @returns {{text: *, type: string, time: number, cb: null}}
   */
  vm.vuxToast = function (text, position, type, time, callback) {
    let p = vuxToastParams(...arguments)
    vm.vux.toast.show(p)
    if (p.cb) {
      setTimeout(() => {
        p.cb()
      }, p.time)
    }
  }

  /**
   * @param autoHide    是否点击按钮后自动隐藏   默认  true
   * @param title            弹出框 标题
   * @param content     弹出框 内容
   * @param doneTxt     确定按钮文本  默认 确定
   * @param cancelTxt   取消按钮文本 默认 取消
   * @param done          确定按钮回调
   * @param cancel       取消按钮回调
   */
  vm.vuxConfirm = function (autoHide, title, content, doneTxt, cancelTxt, done, cancel) {
    let p = vuxConfirmParams(...arguments)
    vm.vux.confirm.show(p)
  }

  vm.vuxConfirmHide = function (time) {
    setTimeout(() => {
      vm.vux.confirm.hide()
    }, time ? time : 0)
  }
}

//初始化 route，router 的属性和常用功能
function initRouter(vm) {
  vm.routeName = vm.route.name
  vm.routePath = vm.route.path

  vm.routeQuery = () => vm.route.query
  vm.routeParam = () => vm.route.params

  /**
   * @param name     路由 名称
   * @param query     url 参数   json格式
   * @param params   路由参数  只在需要的时候传递
   * @returns {{name: *, query: {}}}
   */
  vm.routerPush = function (name, query, params) {
    let p = routerHrefParams(...arguments)
    vm.router.push(p)
  }

  /**
   * 同上
   */
  vm.routerReplace = function (name, query, params) {
    let p = routerHrefParams(...arguments)
    vm.router.replace(p)
  }

  vm.routerBack = function (time) {
    setTimeout(() => {
      vm.router.back()
    }, time ? time : 0)
  }
}

/**
 *  两个参数   参数会被识别为   content , done
 *  三个参数   参数会被识别为   (content , done , cancel) | (title , content , done)
 *  四个参数   参数会被识别为    autoHide|title , content , done , cancel
 *  五个参数   参数会被识别为    (autoHide , title , content , done , cancel)| (content , doneTxt , cancelTxt , done, cancel)
 *  六个参数   参数会被识别为    title , content , doneTxt , cancelTxt , done , cancel
 */
function vuxConfirmParams() {
  let p = {
    content: '',
    confirmText: '确定',
    cancelText: '取消'
  }

  switch (arguments.length) {
    case 2:
      p.content = arguments[0]
      p.onConfirm = arguments[1]
      break
    case 3:
      if (typeof arguments[1] === 'function') {
        p.content = arguments[0]
        p.onConfirm = arguments[1]
        p.onCancel = arguments[2]
      } else {
        p.title = arguments[0]
        p.content = arguments[1]
        p.onConfirm = arguments[2]
      }
      break
    case 4:
      p.content = arguments[1]
      p.onConfirm = arguments[2]
      p.onCancel = arguments[3]
      if (typeof arguments[0] === 'boolean') {
        p.closeOnConfirm = arguments[0]
      } else {
        p.title = arguments[0]
      }
      break
    case 5:
      p.onConfirm = arguments[3]
      p.onCancel = arguments[4]
      if (typeof arguments[0] === 'boolean') {
        p.closeOnConfirm = arguments[0]
        p.title = arguments[1]
        p.content = arguments[2]
      } else {
        p.content = arguments[0]
        p.confirmText = arguments[1]
        p.cancelText = arguments[2]
      }
      break
    case 6:
      p.title = arguments[0]
      p.content = arguments[1]
      p.confirmText = arguments[2]
      p.cancelText = arguments[3]
      p.onConfirm = arguments[4]
      p.onCancel = arguments[5]
      break
    default:
      p.closeOnConfirm = arguments[0]
      p.title = arguments[1]
      p.content = arguments[2]
      p.confirmText = arguments[3]
      p.cancelText = arguments[4]
      p.onConfirm = arguments[5]
      p.onCancel = arguments[6]
      break
  }
  return p
}

/**
 *  两个参数  会被识别为    (text , position | time |  type | callback)
 *  三个参数  会被识别为   (text , position | time | type ,  type | time | callback)
 *  四个参数  会被识别为   (text , position | time | type ,  type | time , callback | type | time )
 */
function vuxToastParams() {
  function position(obj, arg) {
    switch (arg) {
      case 'd':
        obj.position = 'default'
        break
      case 't':
        obj.position = 'top'
        break
      case 'm':
        obj.position = 'middle'
        break
      case 'b':
        obj.position = 'bottom'
        break
      default:
        return false
    }
    return true
  }

  let p = {
    text: arguments[0],
    position: 'default',
    type: 'text',
    time: 2000,
    cb: null
  }

  switch (arguments.length) {
    case 1:
      break
    case 2:
      if (typeof arguments[1] === 'function') {
        p.cb = arguments[1]
      } else if (typeof arguments[1] === 'number') {
        p.time = arguments[1]
      } else {
        if (!position(p, arguments[1])) {
          p.type = arguments[1]
        }
      }
      break
    case 3:
      if (typeof arguments[1] === 'number') {
        p.time = arguments[1]
      } else {
        if (!position(p, arguments[1])) {
          p.type = arguments[1]
        }
      }

      if (typeof arguments[2] === 'function') {
        p.cb = arguments[2]
      } else if (typeof arguments[2] === 'number') {
        p.time = arguments[2]
      } else {
        p.type = arguments[2]
      }
      break
    case 4:
      if (typeof arguments[1] === 'number') {
        p.time = arguments[1]
      } else {
        if (!position(p, arguments[1])) {
          p.type = arguments[1]
        }
      }

      if (typeof arguments[2] === 'number') {
        p.time = arguments[2]
      } else {
        p.type = arguments[2]
      }

      if (typeof arguments[3] === 'function') {
        p.cb = arguments[3]
      } else if (typeof arguments[3] === 'number') {
        p.time = arguments[3]
      } else {
        p.type = arguments[3]
      }
      break
    default:
      p.position = arguments[1]
      p.type = arguments[2]
      p.time = arguments[3]
      p.cb = arguments[4]
      break
  }
  return p
}

/**
 * 一个参数  会被识别为  content
 * 两个参数  会被识别为  (title , content) | (content , hide)
 * 三个参数  会被识别为  (title , content , hide) | (content , hide , show)
 */
function vuxAlertParams() {
  let p = {
    title: '提示',
    content: ''
  }

  switch (arguments.length) {
    case 1:
      p.content = arguments[0]
      break
    case 2:
      if (typeof arguments[1] === 'string') {
        p.title = arguments[0]
        p.content = arguments[1]
      } else if (typeof arguments[1] === 'function') {
        p.content = arguments[0]
        p.onHide = arguments[1]
      }
      break
    case 3:
      if (typeof arguments[1] === 'string') {
        p.title = arguments[0]
        p.content = arguments[1]
        p.onHide = arguments[2]
      } else if (typeof arguments[1] === 'function') {
        p.content = arguments[0]
        p.onHide = arguments[1]
        p.onShow = arguments[2]
      }
      break
    default:
      p.title = arguments[0]
      p.content = arguments[1]
      p.onHide = arguments[2]
      p.onShow = arguments[3]
      break
  }
  return p
}

/**
 * 一个参数 会被识别为  name
 * 两个参数 会被识别为  name , query
 * @returns {{name: *, query: {}}}
 */
function routerHrefParams() {
  let p = {
    name: arguments[0],
    query: arguments[1] ? arguments[1] : {}
  }

  if (arguments[2]) {
    p.params = arguments[2]
  }
  return p
}
