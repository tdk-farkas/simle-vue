/**
 * Created by Farkas on 2017/5/24.
 */
import screw from './first.vue'

screw.install = function (Vue) {
  Vue.component('my-first', screw)
};

export default screw
