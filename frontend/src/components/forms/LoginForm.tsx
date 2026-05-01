'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useRouter } from 'next/router';
import { toast } from 'sonner';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useAuthStore } from '@/store/authStore';
import { Mail, Lock } from 'lucide-react';

const LoginSchema = z.object({
  email: z.string().email('Please enter a valid university email'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

type LoginFormValues = z.infer<typeof LoginSchema>;

export function LoginForm() {
  const router = useRouter();
  const setAuth = useAuthStore((s) => s.setAuth);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(LoginSchema),
  });

  const onSubmit = async (data: LoginFormValues) => {
    try {
      // In a real app, this would call authService.login(data)
      await new Promise(resolve => setTimeout(resolve, 1200));
      
      let role: any = 'student';
      if (data.email.includes('admin')) role = 'admin';
      else if (data.email.includes('faculty')) role = 'faculty';

      const mockToken = 'mock.jwt.token';
      const mockUser = {
        id: '1',
        email: data.email,
        role: role,
        name: data.email.split('@')[0],
      };

      document.cookie = `access_token=${mockToken}; path=/; max-age=3600; SameSite=Lax`;
      setAuth(mockToken, mockUser);
      
      toast.success('Signed in successfully');
      router.push(`/${role}/dashboard`);
    } catch (err: any) {
      toast.error(err.message || 'Login failed');
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="relative">
        <Mail className="absolute left-4 top-[46px] text-gray-400 z-10" size={18} />
        <Input
          label="University Email"
          placeholder="name@university.edu"
          className="pl-11"
          error={errors.email?.message}
          {...register('email')}
        />
      </div>

      <div className="relative">
        <Lock className="absolute left-4 top-[46px] text-gray-400 z-10" size={18} />
        <Input
          label="Password"
          type="password"
          placeholder="••••••••"
          className="pl-11"
          error={errors.password?.message}
          {...register('password')}
        />
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <input
            id="remember-me"
            type="checkbox"
            className="h-4 w-4 text-brand-600 focus:ring-brand-500 border-gray-300 rounded cursor-pointer"
          />
          <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700 cursor-pointer">
            Remember me
          </label>
        </div>

        <div className="text-sm font-semibold">
          <a href="#" className="text-brand-600 hover:text-brand-500 transition-colors">
            Forgot password?
          </a>
        </div>
      </div>

      <Button
        type="submit"
        className="w-full"
        size="lg"
        loading={isSubmitting}
      >
        Sign in to UIMS
      </Button>
    </form>
  );
}
