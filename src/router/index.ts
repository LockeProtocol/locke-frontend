import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router'

const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    name: 'Stream',
    component: () => import(/* webpackChunkName: "home" */ '../views/Stream.vue')
  },
  {
    path: '/streamdetails',
    name: 'StreamDetails',
    component: () => import(/* webpackChunkName: "stream" */ '../views/StreamDetails.vue')
  }
]

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes
})

export default router
