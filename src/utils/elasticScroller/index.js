/**
 * Created by Farkas on 2017/5/24.
 */
import screw from './elasticScroller.vue'

screw.install = function (Vue) {
  Vue.component('elastic-scroller', screw)
};

export default screw
