import Vue from 'vue'
import VueRouter from 'vue-router'
import EmptyPane from '../components/EmptyPane.vue'

Vue.use(VueRouter)

const routes = [
  {
    path: '/',
    name: 'EmptyContent',
    component: EmptyPane
  }
]

const router = new VueRouter({
  routes
})

export default router
