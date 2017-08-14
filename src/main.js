// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import App from '@/App'
import router from "@/router"
import store from "@/vux"
import {AlertPlugin, ToastPlugin, ConfirmPlugin, LoadingPlugin} from 'vux'
// import Axios from 'axios'

const FastClick = require('fastclick')
FastClick.attach(document.body)

Vue.use(AlertPlugin)
Vue.use(ToastPlugin)
Vue.use(ConfirmPlugin)
Vue.use(LoadingPlugin)

// Axios.post('')

let vm = new Vue({
  el: '#app',
  store,
  router,
  render: (h) => h(App)
})

router.replace({name: 'first'})
