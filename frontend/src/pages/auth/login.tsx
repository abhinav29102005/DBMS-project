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
              <div className="flex flex-col items-center gap-4">
                <p className="text-sm text-gray-500 font-medium">Quick Access</p>
                <div className="flex items-center gap-4">
                  <Link href="/auth/login" className="flex flex-col items-center gap-1 group">
                    <div className="h-10 w-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-all">
                      <span className="text-xs font-bold">F</span>
                    </div>
                    <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Faculty</span>
                  </Link>
                  <Link href="/auth/login" className="flex flex-col items-center gap-1 group">
                    <div className="h-10 w-10 rounded-xl bg-purple-50 flex items-center justify-center text-purple-600 group-hover:bg-purple-600 group-hover:text-white transition-all">
                      <span className="text-xs font-bold">A</span>
                    </div>
                    <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Admin</span>
                  </Link>
                  <Link href="/auth/login" className="flex flex-col items-center gap-1 group">
                    <div className="h-10 w-10 rounded-xl bg-orange-50 flex items-center justify-center text-orange-600 group-hover:bg-orange-600 group-hover:text-white transition-all">
                      <span className="text-xs font-bold">S</span>
                    </div>
                    <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Staff</span>
                  </Link>
                </div>
              </div>

              <div className="mt-8 text-center">
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
