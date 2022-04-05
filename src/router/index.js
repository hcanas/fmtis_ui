import { createRouter, createWebHistory } from 'vue-router';
import Dashboard from "../views/Dashboard.vue";

const routes = [
  {
    path: '/',
    alias: '/dashboard',
    component: Dashboard,
  },
  {
    path: '/fund_sources',
    component: () => import('../views/fund_sources/FundSourceList.vue'),
  },
  {
    path: '/wfps',
    component: () => import('../views/work_financial_plans/WfpList.vue'),
  },
  {
    path: '/apps',
    component: () => import('../views/annual_procurement_plans/AppList.vue'),
  },
  {
    path: '/prs',
    component: () => import('../views/purchase_requests/PrList.vue'),
  },
  {
    path: '/pos',
    component: () => import('../views/purchase_orders/PoList.vue'),
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;