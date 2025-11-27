import type { Metadata } from 'next';
import Link from 'next/link';
import { SignInForm } from '@/components/SignInForm';
import { buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export const metadata: Metadata = {
  title: 'Sign in - Task Loom',
};

interface SignInPageProps {
  searchParams?: {
    callbackUrl?: string;
  };
}

export default function SignInPage({ searchParams }: SignInPageProps) {
  const callbackUrl = searchParams?.callbackUrl && searchParams.callbackUrl.startsWith('/')
    ? searchParams.callbackUrl
    : '/';

  return (
    <div className="mx-auto flex min-h-[calc(100vh-160px)] max-w-md flex-col justify-center py-8">
      <div className="rounded-lg border border-slate-200/80 bg-white p-8 shadow-soft-md">
        <div className="space-y-2 text-center">
          <h1 className="text-xl font-semibold tracking-tight text-slate-900">Welcome back</h1>
          <p className="text-sm text-slate-500">
            Use your Task Loom credentials to continue.
          </p>
        </div>
        <div className="mt-6">
          <SignInForm callbackUrl={callbackUrl} />
        </div>
      </div>
      <p className="mt-6 text-center text-sm text-slate-500">
        Need an account?{' '}
        <Link href="mailto:support@taskloom.app" className={cn(buttonVariants({ variant: 'link', size: 'sm' }))}>
          Contact us
        </Link>
      </p>
    </div>
  );
}
