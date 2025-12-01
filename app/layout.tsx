import type { Metadata } from 'next';
import Link from 'next/link';
import { Inter } from 'next/font/google';
import './globals.css';
import { ToastProvider } from '@/components/ToastProvider';
import { InboxIcon, ListChecksIcon, StickyNoteIcon } from '@/components/icons';
import { buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { SignOutButton } from '@/components/SignOutButton';
import { auth } from '@/auth';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Task Loom',
  description: 'Fast, keyboard-friendly notes capture for the Auto-Prioritizer MVP.',
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
                  <Link href="/" className="text-xl font-semibold tracking-tight text-slate-900">
                    Task Loom
                  </Link>
                  <nav className="flex items-center gap-1">
                    <Link
                      href="/"
                      className={cn(
                        buttonVariants({ variant: 'ghost', size: 'sm' }),
                        'text-slate-600 hover:text-slate-900',
                      )}
                    >
                      <InboxIcon className="h-4 w-4" aria-hidden />
                      Inbox
                    </Link>
                    <Link
                      href="/notes"
                      className={cn(
                        buttonVariants({ variant: 'ghost', size: 'sm' }),
                        'text-slate-600 hover:text-slate-900',
                      )}
                    >
                      <StickyNoteIcon className="h-4 w-4" aria-hidden />
                      Notes
                    </Link>
                    <Link
                      href="/tasks"
                      className={cn(
                        buttonVariants({ variant: 'ghost', size: 'sm' }),
                        'text-slate-600 hover:text-slate-900',
                      )}
                    >
                      <ListChecksIcon className="h-4 w-4" aria-hidden />
                      Tasks
                    </Link>
                  </nav>
                </div>
                <div className="flex items-center gap-4">
                  <div className="hidden sm:block text-right text-sm leading-tight">
                    <p className="font-medium text-slate-900">{user?.name ?? 'Signed in'}</p>
                    <p className="text-xs text-slate-500">{user?.email ?? ''}</p>
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
