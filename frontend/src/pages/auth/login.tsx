import { GraduationCap } from 'lucide-react';
import Head from 'next/head';
import Link from 'next/link';
import { LoginForm } from '@/components/forms/LoginForm';

export default function LoginPage() {
  return (
    <>
      <Head>
        <title>Login | UIMS Portal</title>
      </Head>
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4 sm:p-6 lg:p-8">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center">
            <div className="mx-auto h-16 w-16 bg-brand-600 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-brand-500/20 mb-6">
              <GraduationCap size={40} />
            </div>
            <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">UIMS Portal</h1>
            <p className="mt-2 text-sm text-gray-600">
              Sign in to access your university dashboard
            </p>
          </div>

          <div className="bg-white p-8 rounded-3xl shadow-xl shadow-gray-200/50 border border-gray-100">
            <LoginForm />

            <div className="mt-8 pt-6 border-t border-gray-100">
              <div className="text-center">
                <p className="text-sm text-gray-600">
                  Don't have an account?{' '}
                  <Link href="/auth/register" className="text-brand-600 font-bold hover:underline">
                    Sign up
                  </Link>
                </p>
              </div>

              <p className="mt-8 text-[10px] text-gray-400 text-center">
                UIMS v1.0.0 &copy; 2024 University Integrated Management System
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
