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
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(LoginSchema),
  });

  const handleQuickLogin = (role: 'student' | 'faculty' | 'admin' | 'staff') => {
    const credentials = {
      student: { email: 'asingh3_be24@thapar.edu', password: 'password123' },
      faculty: { email: 'sushain.sharma@gtu.edu', password: 'password123' },
      admin: { email: 'admin@gtu.edu', password: 'password123' },
      staff: { email: 'staff@gtu.edu', password: 'password123' },
    };

    setValue('email', credentials[role].email);
    setValue('password', credentials[role].password);
    toast.info(`Pre-filled ${role} credentials`);
  };

  const onSubmit = async (data: LoginFormValues) => {
    try {
      const response = await authService.login(data);

      document.cookie = `access_token=${response.token}; path=/; max-age=3600; SameSite=Lax`;
      setAuth(response.token, response.user);

      toast.success('Signed in successfully');
      
      const dashboardPath = `/${response.user.role}/dashboard`;
        
      router.replace(dashboardPath).catch(() => {
        window.location.href = dashboardPath;
      });
    } catch (err: any) {
      toast.error(err.message || 'Login failed');
    }
  };

  return (
    <div className="space-y-6">
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

      <div className="pt-6 border-t border-gray-100">
        <div className="flex flex-col items-center gap-4">
          <p className="text-sm text-gray-500 font-medium">Quick Access</p>
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => handleQuickLogin('student')}
              className="flex flex-col items-center gap-1 group"
            >
              <div className="h-10 w-10 rounded-xl bg-green-50 flex items-center justify-center text-green-600 group-hover:bg-green-600 group-hover:text-white transition-all">
                <span className="text-xs font-bold">S</span>
              </div>
              <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Student</span>
            </button>
            <button
              type="button"
              onClick={() => handleQuickLogin('faculty')}
              className="flex flex-col items-center gap-1 group"
            >
              <div className="h-10 w-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-all">
                <span className="text-xs font-bold">F</span>
              </div>
              <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Faculty</span>
            </button>
            <button
              type="button"
              onClick={() => handleQuickLogin('admin')}
              className="flex flex-col items-center gap-1 group"
            >
              <div className="h-10 w-10 rounded-xl bg-purple-50 flex items-center justify-center text-purple-600 group-hover:bg-purple-600 group-hover:text-white transition-all">
                <span className="text-xs font-bold">A</span>
              </div>
              <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Admin</span>
            </button>
            <button
              type="button"
              onClick={() => handleQuickLogin('staff')}
              className="flex flex-col items-center gap-1 group"
            >
              <div className="h-10 w-10 rounded-xl bg-orange-50 flex items-center justify-center text-orange-600 group-hover:bg-orange-600 group-hover:text-white transition-all">
                <span className="text-xs font-bold">ST</span>
              </div>
              <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Staff</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
