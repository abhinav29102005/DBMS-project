import { GraduationCap, ArrowLeft } from 'lucide-react';
import Head from 'next/head';
import Link from 'next/link';
import { RegisterForm } from '@/components/forms/RegisterForm';

export default function RegisterPage() {
  return (
    <>
      <Head>
        <title>Sign Up | UIMS Portal</title>
      </Head>
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4 sm:p-6 lg:p-8">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center">
            <div className="mx-auto h-16 w-16 bg-brand-600 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-brand-500/20 mb-6">
              <GraduationCap size={40} />
            </div>
            <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Create Account</h1>
            <p className="mt-2 text-sm text-gray-600">
              Join the University Integrated Management System
            </p>
          </div>

          <div className="bg-white p-8 rounded-3xl shadow-xl shadow-gray-200/50 border border-gray-100">
            <RegisterForm />

            <div className="mt-8 pt-6 border-t border-gray-100 text-center">
              <p className="text-sm text-gray-600">
                Already have an account?{' '}
                <Link href="/auth/login" className="text-brand-600 font-bold hover:underline">
                  Sign in
                </Link>
              </p>
            </div>
          </div>
          
          <div className="text-center">
            <Link 
              href="/auth/login" 
              className="inline-flex items-center gap-2 text-sm font-semibold text-gray-500 hover:text-brand-600 transition-colors"
            >
              <ArrowLeft size={16} /> Back to Login
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
