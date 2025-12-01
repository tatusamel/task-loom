import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { Inter } from 'next/font/google';
import './globals.css';
import { auth } from '@/auth';
import { NavLinks } from '@/components/NavLinks';
import { SignOutButton } from '@/components/SignOutButton';
import { ToastProvider } from '@/components/ToastProvider';
import { UserIcon } from '@/components/icons';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Task Loom',
  description: 'Fast, keyboard-friendly notes capture for the Auto-Prioritizer MVP.',
  icons: {
    icon: '/task_loom_logo.png',
    shortcut: '/task_loom_logo.png',
    apple: '/task_loom_logo.png',
  },
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  const user = session?.user;
  const isAuthenticated = Boolean(user);

  return (
    <html lang="en" className="bg-slate-50">
      <body className={`${inter.className} bg-slate-50 text-slate-900`}>
        <a
          href="#content"
          className="sr-only focus-visible:not-sr-only focus-visible:absolute focus-visible:left-4 focus-visible:top-4 focus-visible:z-50 focus-visible:inline-flex focus-visible:rounded-xl focus-visible:bg-purple-600 focus-visible:px-3 focus-visible:py-2 focus-visible:text-sm focus-visible:font-medium focus-visible:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500 focus-visible:ring-offset-2"
        >
          Skip to content
        </a>
        <ToastProvider />
        <div className="min-h-screen">
          {isAuthenticated ? (
            <header className="sticky top-0 z-40 border-b border-slate-200 bg-white shadow-xs">
              <div className="mx-auto flex max-w-6xl items-center justify-between px-4 lg:px-6 py-4">
                <div className="flex items-center gap-8">
                  <Link
                    href="/"
                    className="flex items-center gap-2 rounded-full px-2 py-1 text-sm font-semibold tracking-tight text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500 focus-visible:ring-offset-2 focus-visible:ring-offset-white"
                  >
                    <Image
                      src="/task_loom_logo.png"
                      alt="Task Loom"
                      width={40}
                      height={40}
                      priority
                    />
                    Task Loom
                  </Link>
                  <NavLinks />
                </div>
                <div className="flex items-center gap-4">
                  <div className="hidden sm:flex items-center gap-2 text-sm leading-tight text-slate-900">
                    <UserIcon className="h-5 w-5 text-slate-500" aria-hidden />
                    <p className="font-medium">{user?.name ?? 'Signed in'}</p>
                  </div>
                  <SignOutButton />
                </div>
              </div>
            </header>
          ) : null}
          <main id="content" className="mx-auto max-w-6xl px-4 lg:px-6 py-8">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
