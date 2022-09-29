import Vue from 'vue'
import App from '@/components/App.vue'
import store from '@/store'
import vuetify from '@/plugins/vuetify'

import SplitPane from 'vue-splitpane'

import '@fontsource/montserrat'
import '@mdi/font/css/materialdesignicons.min.css'

import VueCodemirror from 'vue-codemirror'
import 'codemirror/mode/markdown/markdown.js'
import 'codemirror/mode/javascript/javascript.js'
import 'codemirror/lib/codemirror.css'
import 'codemirror/theme/base16-light.css'
import 'codemirror/theme/base16-dark.css'
import 'codemirror/addon/display/autorefresh.js'
import 'codemirror/addon/search/searchcursor.js'

import VueShortKey from 'vue-shortkey'

async function main () {
  Vue.component('split-pane', SplitPane)

  Vue.use(VueCodemirror, {
    events: ['contextmenu', 'inputRead'],
    options: {
      tabSize: 4,
      theme: 'base16-dark',
      lineNumbers: true,
      line: true,
      autoRefresh: true
    }
  })

  Vue.use(VueShortKey)

  Vue.config.productionTip = false

  await store.dispatch('hydrate')

  new Vue({
    store,
    vuetify,
    render: h => h(App)
  }).$mount('#app')
}

export default main()
