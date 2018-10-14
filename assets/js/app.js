import Vue from 'vue';

import App from './components/App';


const app = new Vue({
  components: {
    App,
  },

  render: h => h(App),
}).$mount('#app');
