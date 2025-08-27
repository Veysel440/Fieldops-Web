import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router';
import { useAuthStore } from '@/stores/auth';

const routes: RouteRecordRaw[] = [
  { path: '/login', component: () => import('@/pages/Login.vue'), meta: { guest: true } },
  { path: '/', component: () => import('@/pages/Dashboard.vue'), meta: { requiresAuth: true } },
  { path: '/work-orders', component: () => import('@/pages/WorkOrders.vue'), meta: { requiresAuth: true } },
  { path: '/assets', component: () => import('@/pages/Assets.vue'), meta: { requiresAuth: true, role: ['admin','tech'] } },
  { path: '/map', component: () => import('@/pages/Map.vue'), meta: { requiresAuth: true } },
  { path: '/customers', component: () => import('@/pages/Customers.vue'), meta: { requiresAuth: true } },
  { path: '/work-orders/:id', component: () => import('@/pages/WorkOrderDetail.vue'), meta: { requiresAuth: true } },
];

const router = createRouter({ history: createWebHistory(), routes });

router.beforeEach(async (to) => {
  const auth = useAuthStore();
  if (!auth.initialized) await auth.bootstrap();
  if (to.meta.requiresAuth && !auth.isAuthed) return { path: '/login', query: { r: to.fullPath } };
  const need = to.meta.role as string[] | undefined;
  if (need && auth.role && !need.includes(auth.role)) return { path: '/' };
  if (to.meta.guest && auth.isAuthed) return { path: '/' };
  return true;
});

export default router;
