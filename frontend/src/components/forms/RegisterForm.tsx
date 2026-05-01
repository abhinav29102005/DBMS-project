'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useRouter } from 'next/router';
import { toast } from 'sonner';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Mail, Lock, User, UserCircle, Eye, EyeOff } from 'lucide-react';

import { authService } from '@/services/auth/authService';

const RegisterSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: z.string().email('Please enter a valid university email'),
  role: z.enum(['student', 'faculty', 'admin', 'staff'], {
    errorMap: () => ({ message: 'Please select a valid role' }),
  }),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

type RegisterFormValues = z.infer<typeof RegisterSchema>;

export function RegisterForm() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(RegisterSchema),
    defaultValues: {
      role: 'student',
    }
  });

  const onSubmit = async (data: RegisterFormValues) => {
    try {
      await authService.register(data);
      toast.success('Account created successfully! Please sign in.');
      router.push('/auth/login');
    } catch (err: any) {
      toast.error(err.message || 'Registration failed');
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      <div className="grid grid-cols-2 gap-4">
        <div className="relative">
          <User className="absolute left-4 top-[46px] text-gray-400 z-10" size={18} />
          <Input
            label="First Name"
            placeholder="John"
            className="pl-11"
            error={errors.firstName?.message}
            {...register('firstName')}
          />
        </div>
        <div className="relative">
          <Input
            label="Last Name"
            placeholder="Doe"
            error={errors.lastName?.message}
            {...register('lastName')}
          />
        </div>
      </div>

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

      <div className="space-y-1.5">
        <label className="text-sm font-semibold text-gray-700 ml-1 flex items-center gap-2">
          <UserCircle size={14} /> Account Role
        </label>
        <select
          className="flex w-full rounded-xl border-2 border-gray-100 bg-gray-50 px-4 py-3 text-sm text-gray-900 transition-all focus:border-brand-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-brand-500/10"
          {...register('role')}
        >
          <option value="student">Student</option>
          <option value="faculty">Faculty Member</option>
          <option value="staff">Staff Member</option>
          <option value="admin">Administrator</option>
        </select>
        {errors.role && <p className="text-xs font-medium text-red-500 ml-1">{errors.role.message}</p>}
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

      <Button
        type="submit"
        className="w-full mt-2"
        size="lg"
        loading={isSubmitting}
      >
        Create Account
      </Button>
    </form>
  );
}
