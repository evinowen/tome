import { createApp, h } from 'vue'
import App from '@/components/App.vue'
import { store, key } from './store'
import vuetify from './vuetify'

// import SplitPane from 'vue-splitpane'

import '@fontsource/montserrat'
import '@mdi/font/css/materialdesignicons.min.css'

// import * as VueCodemirror from 'vue-codemirror'
// import 'codemirror/mode/markdown/markdown.js'
// import 'codemirror/mode/javascript/javascript.js'
// import 'codemirror/lib/codemirror.css'
// import 'codemirror/theme/base16-light.css'
// import 'codemirror/theme/base16-dark.css'
// import 'codemirror/addon/display/autorefresh.js'
// import 'codemirror/addon/search/searchcursor.js'

// import * as VueShortKey from 'vue-shortkey'

async function main () {
  // Vue.component('SplitPane', SplitPane)

  // Vue.use(VueCodemirror, {
  //   events: ['contextmenu', 'inputRead'],
  //   options: {
  //     tabSize: 4,
  //     theme: 'base16-dark',
  //     lineNumbers: true,
  //     line: true,
  //     autoRefresh: true
  //   }
  // })

  // Vue.use(VueShortKey)

  // Vue.config.productionTip = false

  await store.dispatch('hydrate')

  const app = createApp({ render: () => h(App) })

  app.use(store, key)
  app.use(vuetify)

  app.mount('#app')
}

export default main()
