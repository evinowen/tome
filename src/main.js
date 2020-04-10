import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import vuetify from './plugins/vuetify'

import SplitPane from 'vue-splitpane'

import VueCodemirror from 'vue-codemirror'
import 'codemirror/mode/markdown/markdown.js'
import 'codemirror/lib/codemirror.css'

import ExplorerDirectory from './components/ExplorerDirectory.vue'
import ExplorerFile from './components/ExplorerFile.vue'

Vue.component('split-pane', SplitPane)

Vue.component('explorer-directory', ExplorerDirectory)
Vue.component('explorer-file', ExplorerFile)

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
