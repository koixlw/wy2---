import { createRouter, createWebHistory } from 'vue-router'
import Layout from '@/layout/index.vue'

const routes = [
  {
    path: '/',
    component: Layout,
    redirect: '/dashboard',
    children: [
      {
        path: 'dashboard',
        name: 'Dashboard',
        component: () => import('@/views/dashboard/index.vue'),
        meta: { title: '首页', icon: 'ep:home-filled' }
      }
    ]
  },
  {
    path: '/addresses',
    component: Layout,
    redirect: '/addresses/list',
    meta: { title: '住址管理', icon: 'ep:office-building' },
    children: [
      {
        path: 'list',
        name: 'AddressList',
        component: () => import('@/views/addresses/index.vue'),
        meta: { title: '住址列表', icon: 'ep:list' }
      },
      {
        path: 'tree',
        name: 'AddressTree',
        component: () => import('@/views/addresses/tree.vue'),
        meta: { title: '住址树形', icon: 'ep:share' }
      }
    ]
  },
  {
    path: '/residents',
    component: Layout,
    redirect: '/residents/list',
    meta: { title: '住户管理', icon: 'ep:user' },
    children: [
      {
        path: 'list',
        name: 'ResidentList',
        component: () => import('@/views/residents/index.vue'),
        meta: { title: '住户列表', icon: 'ep:list' }
      }
    ]
  },
  {
    path: '/expenses',
    component: Layout,
    redirect: '/expenses/list',
    meta: { title: '费用管理', icon: 'ep:money' },
    children: [
      {
        path: 'list',
        name: 'ExpenseList',
        component: () => import('@/views/expenses/index.vue'),
        meta: { title: '费用列表', icon: 'ep:list' }
      },
      {
        path: 'stats',
        name: 'ExpenseStats',
        component: () => import('@/views/expenses/stats.vue'),
        meta: { title: '费用统计', icon: 'ep:data-analysis' }
      }
    ]
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router