import { createApp, h } from 'vue'
import App from '@/components/App.vue'
import { store, key } from './store'
import vuetify from './vuetify'

import '@/styles/main.css'
import '@fontsource/montserrat'
import '@mdi/font/css/materialdesignicons.min.css'

async function main () {
  await store.dispatch('hydrate')

  const app = createApp({ render: () => h(App) })

  app.use(store, key)
  app.use(vuetify)

  app.mount('#app')
}

export default main()
