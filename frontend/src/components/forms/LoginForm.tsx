'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useRouter } from 'next/router';
import { toast } from 'sonner';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useAuthStore, AuthState } from '@/store/authStore';
import { Mail, Lock, Eye, EyeOff } from 'lucide-react';
import { authService } from '@/services/auth/authService';

const LoginSchema = z.object({
  email: z.string().email('Please enter a valid university email'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

type LoginFormValues = z.infer<typeof LoginSchema>;

export function LoginForm() {
  const router = useRouter();
  const setAuth = useAuthStore((s: AuthState) => s.setAuth);
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(LoginSchema),
  });

  const onSubmit = async (data: LoginFormValues) => {
    try {
      const response = await authService.login(data);

      document.cookie = `access_token=${response.token}; path=/; max-age=3600; SameSite=Lax`;
      setAuth(response.token, response.user);

      toast.success('Signed in successfully');
      
      const dashboardPath = ['student', 'faculty'].includes(response.user.role) 
        ? '/profile/setup' 
        : `/${response.user.role}/dashboard`;
        
      router.replace(dashboardPath).catch(() => {
        window.location.href = dashboardPath;
      });
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

      <div className="relative group">
        <Lock className="absolute left-4 top-[46px] text-gray-400 z-10 group-focus-within:text-brand-600 transition-colors" size={18} />
        <Input
          label="Password"
          type={showPassword ? 'text' : 'password'}
          placeholder="••••••••"
          className="pl-11 pr-12"
          error={errors.password?.message}
          {...register('password')}
        />
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="absolute right-4 top-[46px] text-gray-400 hover:text-brand-600 transition-colors z-10"
          aria-label={showPassword ? 'Hide password' : 'Show password'}
        >
          {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
        </button>
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
