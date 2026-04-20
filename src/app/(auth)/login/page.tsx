import { LoginForm } from '@/components/auth/login-form';
import { Suspense } from 'react';

export const metadata = {
  title: 'Sign In – FastTrack',
  description: 'Sign in to FastTrack AI Content Writer',
};

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="h-24 flex justify-center items-center text-slate-400 text-sm">Loading...</div>}>
      <div className="space-y-2 mb-8">
        <h1 className="text-3xl font-bold text-white">Sign in</h1>
        <p className="text-slate-400">Welcome back! Enter your credentials to continue.</p>
      </div>
      <LoginForm requiredRole="user" />
    </Suspense>
  );
}
