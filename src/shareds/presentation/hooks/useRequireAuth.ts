import { router } from 'expo-router';
import { useAuthStore } from '@/shareds/infrastructure/auth/authStore';

export function useRequireAuth() {
  const status = useAuthStore((s) => s.status);
  const isAuthenticated = status === 'authenticated';

  const requireAuth = (action: () => void) => {
    if (isAuthenticated) {
      action();
    } else {
      router.push('/login');
    }
  };

  return { isAuthenticated, requireAuth };
}
