import { router } from '@/router';
import { pinia } from '@/stores/pinia';
import { useAuthStore } from '@/stores/auth';

describe('route guard', () => {
  it('auth olmayanı /login?a=r ile yönlendirir', async () => {
    const auth = useAuthStore(pinia);
    auth.isAuthed = false;
    await router.push('/work-orders');
    await router.isReady();
    expect(router.currentRoute.value.path).toBe('/login');
    expect(router.currentRoute.value.query.r).toBe('/work-orders');
  });

  it('role uyuşmazlığı /unauthorized', async () => {
    const auth = useAuthStore(pinia);
    auth.isAuthed = true;
    auth.role = 'ops';
    await router.push('/assets'); // assets -> roles: ['admin','tech']
    await router.isReady();
    expect(router.currentRoute.value.path).toBe('/unauthorized');
  });

  it('yetkili kullanıcı hedefe girer', async () => {
    const auth = useAuthStore(pinia);
    auth.isAuthed = true;
    auth.role = 'admin';
    await router.push('/assets');
    await router.isReady();
    expect(router.currentRoute.value.path).toBe('/assets');
  });
});
