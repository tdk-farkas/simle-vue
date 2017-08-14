/**
 * Created by Farkas on 2017/6/29.
 */
import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

const store = new Vuex.Store({
  state: {
    scrollTop: {
      classify: 0,
      cashier: 0,
    }
  },
  mutations: {
    saveScrollTop (state, obj) {
      state.scrollTop[obj.name] = obj.side
    }
  }
})

export default store
