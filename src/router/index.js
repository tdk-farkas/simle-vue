import Vue from 'vue'
import Router from 'vue-router'

//延迟加载，在需要使用该文件时在再加载
const myFirst = r => {
  require.ensure([], () => {
    r(require('@/page/first/first.vue'))
  })
}

const myLogin = r => {
  require.ensure([], () => {
    r(require('@/page/login/login.vue'))
  })
}

const myClassify = r => {
  require.ensure([], () => {
    r(require('@/page/classify/classify.vue'))
  })
}

const supplierDetail = r => {
  require.ensure([], () => {
    r(require('@/page/supplierDetail/supplierDetail.vue'))
  })
}

const fillOrder = r => {
  require.ensure([], () => {
    r(require('@/page/fillOrder/fillOrder.vue'))
  })
}
const orderList = r => {
  require.ensure([], () => {
    r(require('@/page/order/order.vue'))
  })
}

const cashier = r => {
  require.ensure([], () => {
    r(require('@/page/cashier/cashier.vue'))
  })
}

const orderDetails = r => {
  require.ensure([], () => {
    r(require('@/page/orderDetails/orderDetails.vue'))
  })
}

const mine = r => {
  require.ensure([], () => {
    r(require('@/page/mine/mine.vue'))
  })
}

const myCollection = r => {
  require.ensure([], () => {
    r(require('@/page/myCollection/myCollection.vue'))
  })
}

const regTel = r => {
  require.ensure([], () => {
    r(require('@/page/register/registerTel.vue'))
  })
}

const regPwd = r => {
  require.ensure([], () => {
    r(require('@/page/register/registerPwd.vue'))
  })
}

const linkInfo = r => {
  require.ensure([], () => {
    r(require('@/page/linkInfo/linkInfo.vue'))
  })
}

const evaluate = r => {
  require.ensure([], () => {
    r(require('@/page/evaluate/evaluate.vue'))
  })
}

const refundList = r => {
  require.ensure([], () => {
    r(require('@/page/refundList/refundList.vue'))
  })
}

const refundReq = r => {
  require.ensure([], () => {
    r(require('@/page/refundRequest/refundRequest.vue'))
  })
}

Vue.use(Router)

const Foo = {template: '<div>foo</div>'};
const Bar = {template: '<transition name="slide" appear><div>bar</div></transition>'};

let tomcat = require('$rootPath')
let root = ''
let suffix = ''
if (tomcat && tomcat.dir) {
  root = tomcat.dir
  suffix = '.' + tomcat.suffix
}

export default new Router({
  mode: 'history',
  scrollBehavior (to, from, savedPosition) {
    return savedPosition
  },
  routes: [
    {
      path: root + '/first' + suffix,
      name: 'first',
      component: myFirst
    },
    {
      path: root + '/login' + suffix,
      name: 'login',
      component: myLogin
    },
    {
      path: root + '/classify' + suffix,
      name: 'classify',
      component: myClassify
    },
    {
      path: root + '/:name/supDet' + suffix,
      name: 'supDet',
      component: supplierDetail
    },
    {
      path: root + '/:name/fillOrder' + suffix,
      name: 'fillOrder',
      component: fillOrder
    },
    {
      path: root + '/order' + suffix,
      name: 'order',
      component: orderList
    },
    {
      path: root + '/:name/cashier' + suffix,
      name: 'cashier',
      component: cashier
    },
    {
      path: root + '/:name/orderDetails' + suffix,
      name: 'orderDetails',
      component: orderDetails
    },
    {
      path: root + '/mine' + suffix,
      name: 'mine',
      component: mine
    },
    {
      path: root + '/:name/myCollection' + suffix,
      name: 'myCollection',
      component: myCollection
    },
    {
      path: root + '/:name/regPwd' + suffix,
      name: 'regPwd',
      component: regPwd
    },
    {
      path: root + '/:name/regTel' + suffix,
      name: 'regTel',
      component: regTel
    },
    {
      path: root + '/:name/linkInfo' + suffix,
      name: 'linkInfo',
      component: linkInfo
    },
    {
      path: root + '/:name/evaluate' + suffix,
      name: 'evaluate',
      component: evaluate
    },
    {
      path: root + '/:name/refundList' + suffix,
      name: 'refundList',
      component: refundList
    },
    {
      path: root + '/:name/refundRequest' + suffix,
      name: 'refundReq',
      component: refundReq
    },
  ]
})
