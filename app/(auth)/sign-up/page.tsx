import type { Metadata } from 'next';
import Link from 'next/link';
import { SignUpForm } from '@/components/SignUpForm';
import { buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export const metadata: Metadata = {
  title: 'Sign up - Task Loom',
};

export default function SignUpPage() {
  return (
    <div className="mx-auto flex min-h-[calc(100vh-160px)] max-w-md flex-col justify-center py-8">
      <div className="rounded-lg border border-slate-200/80 bg-white p-8 shadow-soft-md">
        <div className="space-y-2 text-center">
          <h1 className="text-xl font-semibold tracking-tight text-slate-900">Create an account</h1>
          <p className="text-sm text-slate-500">
            Enter your details to get started with Task Loom.
          </p>
        </div>
        <div className="mt-6">
          <SignUpForm />
        </div>
      </div>
      <p className="mt-6 text-center text-sm text-slate-500">
        Already have an account?{' '}
        <Link href="/sign-in" className={cn(buttonVariants({ variant: 'link', size: 'sm' }))}>
          Sign in
        </Link>
      </p>
    </div>
  );
}
