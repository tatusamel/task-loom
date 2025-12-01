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

interface NavLinksProps {
  orientation?: 'horizontal' | 'vertical';
  className?: string;
}

export function NavLinks({ orientation = 'horizontal', className }: NavLinksProps) {
  const pathname = usePathname() || '/';

  const isVertical = orientation === 'vertical';

  return (
    <nav
      className={cn('flex', isVertical ? 'flex-col gap-1.5' : 'items-center gap-2', className)}
    >
      {links.map(({ href, label, Icon }) => {
        const isActive = pathname === href || pathname.startsWith(`${href}/`);

        const baseItem = isVertical
          ? 'w-full justify-start gap-3 rounded-lg px-3 py-2.5 text-sm transition-all'
          : 'gap-2 px-3.5';
        const activeItem = isVertical
          ? 'bg-purple-50 text-purple-800 border border-purple-100 shadow-[0_1px_6px_rgba(124,58,237,0.08)]'
          : 'bg-slate-100 text-slate-900 hover:text-slate-900';
        const inactiveItem = isVertical
          ? 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
          : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900';

        return (
          <Link
            key={href}
            href={href}
            aria-current={isActive ? 'page' : undefined}
            className={cn(
              buttonVariants({ variant: 'ghost', size: 'sm' }),
              baseItem,
              isActive ? activeItem : inactiveItem,
            )}
          >
            <Icon
              className={cn(
                'h-4 w-4 shrink-0 text-slate-500',
                isVertical ? 'translate-y-[0.5px]' : 'translate-y-px',
              )}
              aria-hidden
            />
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
