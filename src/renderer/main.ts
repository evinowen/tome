import { createApp, h } from 'vue'
import { createPinia } from 'pinia'
import { fetch_application_store } from './store/modules/application'
import vuetify from './vuetify'
import api from '@/api'
import App from '@/components/App.vue'

import '@/styles/main.css'
import '@fontsource/montserrat'
import '@mdi/font/css/materialdesignicons.min.css'

async function main () {
  try {
    const app = createApp({ render: () => h(App) })

    const pinia = createPinia()
    app.use(pinia)

    const application = fetch_application_store()
    await application.hydrate()

    app.use(vuetify)

    app.mount('#app')
  } catch (error) {
    api.log.error(error.message)
  }
}

export default main()
