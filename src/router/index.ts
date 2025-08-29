import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router';
import { useAuthStore } from '@/stores/auth';

const routes: RouteRecordRaw[] = [
  { path: '/', name: 'home', component: () => import('@/pages/Dashboard.vue'), meta: { requiresAuth: true } },
  { path: '/login', name: 'login', component: () => import('@/pages/Login.vue') },
  { path: '/unauthorized', name: 'unauthorized', component: () => import('@/pages/Unauthorized.vue') },

  { path: '/work-orders', name: 'workOrders', component: () => import('@/pages/WorkOrders.vue'), meta: { requiresAuth: true } },
  { path: '/work-orders/:id(\\d+)', name: 'workOrderDetail', component: () => import('@/pages/WorkOrderDetail.vue'), meta: { requiresAuth: true } },

  { path: '/customers', name: 'customers', component: () => import('@/pages/Customers.vue'), meta: { requiresAuth: true } },
  { path: '/assets', name: 'assets', component: () => import('@/pages/Assets.vue'), meta: { requiresAuth: true, roles: ['admin', 'tech'] } },
  { path: '/map', name: 'map', component: () => import('@/pages/Map.vue'), meta: { requiresAuth: true } },

  { path: '/:pathMatch(.*)*', name: 'notfound', component: () => import('@/pages/Unauthorized.vue') } // basit 404
];

const router = createRouter({ history: createWebHistory(), routes });

router.beforeEach((to) => {
  const auth = useAuthStore();
  if (to.meta?.requiresAuth && !auth.isAuthed) {
    return { name: 'login', query: { r: to.fullPath } };
  }
  const roles = to.meta?.roles as string[] | undefined;
  if (roles && (!auth.role || !roles.includes(auth.role))) {
    return { name: 'unauthorized' };
  }
  return true;
});

export default router;
