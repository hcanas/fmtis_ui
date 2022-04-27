import { createRouter, createWebHistory } from 'vue-router';
import Cookies from 'js-cookie';
import axios from 'axios';
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
    meta: {
      action_group: 'fund_sources',
    },
  },
  {
    path: '/wfps',
    component: () => import('../views/work_financial_plans/WfpList.vue'),
  },
  {
    path: '/wfp/:id',
    component: () => import('../views/work_financial_plans/WfpProfile.vue')
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

router.beforeEach((to, from) => {
  const auth_token = Cookies.get('auth_token');
  
  if (auth_token) {
    axios.defaults.headers.common['Authorization'] = `Bearer ${auth_token}`;
    
    axios.get(`${import.meta.env.VITE_PORTAL_API}/auth/${auth_token}`)
    .then(response => {
      // extract permissions
      const permissions = [];
      response.data.roles.forEach(role => {
        role.permissions.forEach(permission => {
          if (permissions.filter(item => item === permission.name).length === 0) {
            permissions.push({
              name: permission.name,
              offices: [],
            });
            
            if (permission.offices.length > 0) {
              permission.offices.forEach(office => {
                permissions.find(item => item.name === permission.name).offices.push({
                  id: office.office_id,
                  name: office.name,
                });
              });
            }
          }
        });
      });
      
      Cookies.set('auth_user', JSON.stringify((({ username, given_name, middle_name, last_name, name_suffix }) => ({ username, given_name, middle_name, last_name, name_suffix }))(response.data)));
      Cookies.set('auth_permissions', JSON.stringify(permissions));
    })
    .catch(() => {
      Cookies.set('auth_user', null);
      Cookies.set('auth_permissions', null);
    });
  } else {
    window.location = import.meta.env.VITE_PORTAL_LOGIN;
  }
});

export default router;