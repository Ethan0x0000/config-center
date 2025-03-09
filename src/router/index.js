import { createRouter, createWebHashHistory } from 'vue-router'

import BoardPage from '@/views/BoardPage.vue'
import SettingPage from '@/views/SettingPage.vue'
import NodePage from '@/views/NodePage.vue'
import RulePage from '@/views/RulePage.vue'
import GroupPage from '@/views/GroupPage.vue'

// import TestPage from '@/views/TestPage.vue'

const routes = [
  {
    path: '/',
    redirect: '/board',
  },
  {
    path: '/board',
    name: 'board',
    component: BoardPage,
  },
  {
    path: '/setting',
    name: 'setting',
    component: SettingPage,
  },
  {
    path: '/node',
    name: 'node',
    component: NodePage,
  },
  {
    path: '/rule',
    name: 'rule',
    component: RulePage,
  },
  {
    path: '/group',
    name: 'group',
    component: GroupPage,
  },
  // {
  //   path: '/test',
  //   name: 'test',
  //   component: TestPage,
  // },
]

const router = createRouter({
  history: createWebHashHistory(),
  routes
})

export default router
