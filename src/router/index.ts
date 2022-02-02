import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router'

const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    name: 'StreamList',
    component: () => import(/* webpackChunkName: "home" */ '../views/StreamList.vue')
  },
  {
    path: '/stream/:address',
    name: 'Stream',
    component: () => import(/* webpackChunkName: "stream" */ '../views/Stream.vue')
  },
]

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes
})

export default router
