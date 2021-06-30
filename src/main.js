import Vue from 'vue'
import App from '@/App.vue'
import router from '@/router'
import store from '@/store'
import vuetify from '@/plugins/vuetify'

import SplitPane from 'vue-splitpane'

import VueCodemirror from 'vue-codemirror'
import 'codemirror/mode/markdown/markdown.js'
import 'codemirror/lib/codemirror.css'
import 'codemirror/theme/base16-light.css'
import 'codemirror/theme/base16-dark.css'
import 'codemirror/addon/display/autorefresh.js'
import 'codemirror/addon/search/searchcursor.js'

Vue.component('split-pane', SplitPane)

Vue.use(VueCodemirror, {
  events: ['contextmenu', 'inputRead'],
  options: {
    tabSize: 4,
    mode: 'text/x-markdown',
    theme: 'base16-dark',
    lineNumbers: true,
    line: true,
    autoRefresh: true
  }
})

Vue.config.productionTip = false

store.dispatch('hydrate')

new Vue({
  router,
  store,
  vuetify,
  render: h => h(App)
}).$mount('#app')
