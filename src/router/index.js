import Vue from 'vue'
import VueRouter from 'vue-router'
import EmptyContent from '../views/Empty.vue'

Vue.use(VueRouter)

const routes = [
  {
    path: '/',
    name: 'EmptyContent',
    component: EmptyContent
  },
]

const router = new VueRouter({
  routes
})

export default router
