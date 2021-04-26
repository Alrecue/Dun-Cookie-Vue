import Vue from 'vue'
import App from './App.vue'
import ElementUI from 'element-ui';
import 'element-ui/lib/theme-chalk/index.css';
import VueClipboard from 'vue-clipboard2'
import store from '../store'

Vue.use(ElementUI).use(VueClipboard)
/* eslint-disable no-new */
new Vue({
  el: '#app',
  store,
  render: h => h(App)
})
