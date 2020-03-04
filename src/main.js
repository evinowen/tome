import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import vuetify from './plugins/vuetify'

import SplitPane from 'vue-splitpane'

import VueCodemirror from 'vue-codemirror'
import 'codemirror/mode/markdown/markdown.js'
import 'codemirror/lib/codemirror.css'

import Explorer from './components/Explorer.vue'

import ExplorerNode from './components/ExplorerNode.vue'
Vue.component('split-pane', SplitPane)
Vue.component('explorer', Explorer)
Vue.component('explorer-node', ExplorerNode)

Vue.use(VueCodemirror, {
  options: {
    tabSize: 4,
    mode: 'text/x-markdown',
    theme: 'base16-dark',
    lineNumbers: true,
    line: true
  }
})

Vue.config.productionTip = false

new Vue({
  router,
  store,
  vuetify,
  render: h => h(App)
}).$mount('#app')
