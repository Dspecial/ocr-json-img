/*
 * @Author: dxx
 * @Email: dingxixi@techbloom.net
 * @Date: 2021-08-27 11:09:58
 * @LastEditors: dxx
 * @LastEditTime: 2021-09-01 11:56:53
 */
// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import App from './App'
import router from './router'
import axios from 'axios'

import ElementUI from 'element-ui';
import JsonViewer from 'vue-json-viewer';
import VueAwesomeSwiper from 'vue-awesome-swiper';
import menuData from '@/assets/js/menu.js';

Vue.use(ElementUI);
Vue.use(JsonViewer);
Vue.use(VueAwesomeSwiper);

Vue.prototype.$axios = axios;
Vue.prototype.$menuData = menuData;

import 'element-ui/lib/theme-chalk/index.css';
import 'swiper/swiper-bundle.css';
import './assets/css/base.css';

Vue.config.productionTip = false

/* eslint-disable no-new */
new Vue({
  el: '#app',
  router,
  components: { App },
  template: '<App/>'
})
