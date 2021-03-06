import Vue from 'vue'
import router from './router'
import store from './store'
import App from './App.vue'
import iView from 'iview';
import 'iview/dist/styles/iview.css';
import socket from './services/socket-service'
import http from './services/http-service'
import Utils from './utils'

Utils.parseLocationParams();

Vue.config.productionTip = false;
Vue.use(iView);
Vue.use(socket, store, router);
Vue.use(http);

new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app');
