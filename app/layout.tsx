import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { Inter } from 'next/font/google';
import './globals.css';
import { auth } from '@/auth';
import { NavLinks } from '@/components/NavLinks';
import { ToastProvider } from '@/components/ToastProvider';
import { UserMenu } from '@/components/UserMenu';
import { ShortcutOverlay } from '@/components/ShortcutOverlay';
import { ThemeProvider } from '@/components/ThemeProvider';
import { ThemeToggle } from '@/components/ThemeToggle';

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
    <html lang="en" className="bg-slate-50 dark:bg-slate-950" suppressHydrationWarning>
      <body className={`${inter.className} bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100`}>
        <ThemeProvider>
          <a
            href="#content"
            className="sr-only focus-visible:not-sr-only focus-visible:absolute focus-visible:left-4 focus-visible:top-4 focus-visible:z-50 focus-visible:inline-flex focus-visible:rounded-xl focus-visible:bg-purple-600 focus-visible:px-3 focus-visible:py-2 focus-visible:text-sm focus-visible:font-medium focus-visible:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500 focus-visible:ring-offset-2"
          >
            Skip to content
          </a>
          <ToastProvider />
          <ShortcutOverlay />
          <div className="min-h-screen">
            {isAuthenticated ? (
              <>
                <header className="sticky top-0 z-40 border-b border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-900/90 backdrop-blur supports-[backdrop-filter]:backdrop-blur">
                  <div className="mx-auto flex max-w-6xl items-center justify-between px-5 lg:px-8 py-4">
                    <Link
                      href="/"
                      className="flex items-center gap-2 rounded-full px-2 py-1 text-sm font-semibold tracking-tight text-slate-900 dark:text-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-offset-slate-900"
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
                    <div className="flex items-center gap-3">
                      <ThemeToggle />
                      <UserMenu name={user?.name} email={user?.email} />
                    </div>
                  </div>
                  <div className="h-px w-full bg-slate-200/70 dark:bg-slate-800" />
                  <div className="mx-auto max-w-6xl px-5 lg:px-8 py-3 md:hidden">
                    <NavLinks />
                  </div>
                </header>
                <div className="mx-auto flex max-w-6xl gap-6 px-5 lg:px-8 py-8">
                  <aside className="sticky top-[5.5rem] hidden h-[calc(100vh-6rem)] w-56 shrink-0 md:block">
                    <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/70 p-3 shadow-sm">
                      <NavLinks orientation="vertical" className="gap-1.5" />
                    </div>
                  </aside>
                  <main id="content" className="page-fade flex-1">
                    {children}
                  </main>
                </div>
              </>
            ) : (
              <main id="content" className="page-fade mx-auto max-w-6xl px-4 lg:px-6 py-8">
                <div className="mb-4 flex justify-end">
                  <ThemeToggle />
                </div>
                {children}
              </main>
            )}
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}
