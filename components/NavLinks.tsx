'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { InboxIcon, ListChecksIcon, StickyNoteIcon } from '@/components/icons';
import { buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const links = [
  { href: '/', label: 'Inbox', Icon: InboxIcon },
  { href: '/notes', label: 'Notes', Icon: StickyNoteIcon },
  { href: '/tasks', label: 'Tasks', Icon: ListChecksIcon },
];

export function NavLinks() {
  const pathname = usePathname() || '/';

  return (
    <nav className="flex items-center gap-1">
      {links.map(({ href, label, Icon }) => {
        const isActive = pathname === href || pathname.startsWith(`${href}/`);

        return (
          <Link
            key={href}
            href={href}
            aria-current={isActive ? 'page' : undefined}
            className={cn(
              buttonVariants({ variant: 'ghost', size: 'sm' }),
              isActive
                ? 'bg-slate-100 text-slate-900 hover:text-slate-900'
                : 'text-slate-600 hover:text-slate-900',
            )}
          >
            <Icon className="h-4 w-4" aria-hidden />
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
