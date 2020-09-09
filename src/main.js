import Vue from 'vue'
import App from '@/App.vue'
import router from '@/router'
import store from '@/store'
import vuetify from '@/plugins/vuetify'

import SplitPane from 'vue-splitpane'

import VueCodemirror from 'vue-codemirror'
import 'codemirror/mode/markdown/markdown.js'
import 'codemirror/lib/codemirror.css'
import 'codemirror/addon/scroll/simplescrollbars.css'
import 'codemirror/addon/scroll/simplescrollbars.js'
import 'codemirror/addon/search/searchcursor.js'

Vue.component('split-pane', SplitPane)

Vue.use(VueCodemirror, {
  events: ['contextmenu'],
  options: {
    tabSize: 4,
    mode: 'text/x-markdown',
    theme: 'base16-dark',
    lineNumbers: true,
    line: true,
    scrollbarStyle: 'overlay'
  }
})

Vue.config.productionTip = false

new Vue({
  router,
  store,
  vuetify,
  render: h => h(App)
}).$mount('#app')
