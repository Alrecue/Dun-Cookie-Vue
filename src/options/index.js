import Vue from 'vue'
import App from './App.vue'
import ElementUI from 'element-ui';
import 'element-ui/lib/theme-chalk/index.css';
import background from '../background'

Vue.use(ElementUI).use({
    install(Vue) {
        Vue.prototype.background = background; // eslint-disable-line
    }
})

// Vue.config.productionTip = false

new Vue({
    render: h => h(App),
}).$mount('#app')
