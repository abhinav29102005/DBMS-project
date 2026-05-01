import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuthStore } from '@/store/authStore';

export default function IndexPage() {
  const router = useRouter();
  const user = useAuthStore(s => s.user);

  useEffect(() => {
    if (user && user.role) {
      router.replace(`/${user.role}/dashboard`);
    } else {
      router.replace('/auth/login');
    }
  }, [user, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="h-8 w-8 border-4 border-brand-600 border-t-transparent rounded-full animate-spin" />
    </div>
  );
}
