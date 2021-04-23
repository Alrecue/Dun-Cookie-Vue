import Vue from 'vue'
import App from './App.vue'
import ElementUI from 'element-ui';
import 'element-ui/lib/theme-chalk/index.css';
import VueClipboard from 'vue-clipboard2'
import background from '../background'


Vue.config.productionTip = false
Vue.use(ElementUI).use(VueClipboard).use({
    install(Vue) {
        Vue.prototype.chrome = chrome; // eslint-disable-line
        Vue.prototype.background = background;
    }
})

new Vue({
    render: h => h(App),
}).$mount('#app')
