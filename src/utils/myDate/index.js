import myDate from './myDate.vue'

myDate.install = function (Vue) {
    Vue.component('my-date', myDate)
};

export default myDate