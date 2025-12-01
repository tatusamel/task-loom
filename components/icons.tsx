import * as React from 'react';

type IconProps = React.SVGProps<SVGSVGElement>;

function createIcon(children: React.ReactNode, displayName: string) {
  const Icon = React.forwardRef<SVGSVGElement, IconProps>(({ className, ...props }, ref) => (
    <svg
      ref={ref}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      {...props}
    >
      {children}
    </svg>
  ));
  Icon.displayName = displayName;
  return Icon;
}

export const PlusIcon = createIcon(
  <>
    <line x1="12" x2="12" y1="5" y2="19" />
    <line x1="5" x2="19" y1="12" y2="12" />
  </>,
  'PlusIcon',
);

export const SearchIcon = createIcon(
  <>
    <circle cx="11" cy="11" r="7" />
    <line x1="16.65" y1="16.65" x2="21" y2="21" />
  </>,
  'SearchIcon',
);

export const MoreVerticalIcon = createIcon(
  <>
    <circle cx="12" cy="5" r="1" />
    <circle cx="12" cy="12" r="1" />
    <circle cx="12" cy="19" r="1" />
  </>,
  'MoreVerticalIcon',
);

export const PinIcon = createIcon(
  <>
    <path d="M12 22v-6" />
    <path d="m8 4 2 6-3 3 5 4 5-4-3-3 2-6" />
  </>,
  'PinIcon',
);

export const ArchiveIcon = createIcon(
  <>
    <rect x="3" y="4" width="18" height="4" rx="1" />
    <path d="M5 8v10a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8" />
    <path d="M10 12h4" />
  </>,
  'ArchiveIcon',
);

export const RestoreIcon = createIcon(
  <>
    <path d="M3 12a9 9 0 1 1 9 9" />
    <polyline points="3 12 3 18 9 18" />
    <path d="M9 12h6" />
  </>,
  'RestoreIcon',
);

export const TrashIcon = createIcon(
  <>
    <path d="M3 6h18" />
    <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
    <path d="M19 6v13a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" />
    <line x1="10" x2="10" y1="11" y2="17" />
    <line x1="14" x2="14" y1="11" y2="17" />
  </>,
  'TrashIcon',
);

export const CheckIcon = createIcon(
  <>
    <polyline points="20 6 9 17 4 12" />
  </>,
  'CheckIcon',
);

export const ArrowRightIcon = createIcon(
  <>
    <line x1="5" x2="19" y1="12" y2="12" />
    <polyline points="12 5 19 12 12 19" />
  </>,
  'ArrowRightIcon',
);

export const ArrowLeftIcon = createIcon(
  <>
    <line x1="19" x2="5" y1="12" y2="12" />
    <polyline points="12 19 5 12 12 5" />
  </>,
  'ArrowLeftIcon',
);

export const ChevronDownIcon = createIcon(
  <>
    <polyline points="6 9 12 15 18 9" />
  </>,
  'ChevronDownIcon',
);

export const ChevronUpIcon = createIcon(
  <>
    <polyline points="18 15 12 9 6 15" />
  </>,
  'ChevronUpIcon',
);

export const ChevronLeftIcon = createIcon(
  <>
    <polyline points="15 18 9 12 15 6" />
  </>,
  'ChevronLeftIcon',
);

export const ChevronRightIcon = createIcon(
  <>
    <polyline points="9 18 15 12 9 6" />
  </>,
  'ChevronRightIcon',
);

export const TagIcon = createIcon(
  <>
    <path d="M20 10v6a2 2 0 0 1-2 2h-6l-7-7 6-6 7 7z" />
    <path d="M6.5 6.5h.01" />
  </>,
  'TagIcon',
);

export const CalendarIcon = createIcon(
  <>
    <rect x="3" y="4" width="18" height="18" rx="2" />
    <line x1="16" x2="16" y1="2" y2="6" />
    <line x1="8" x2="8" y1="2" y2="6" />
    <line x1="3" x2="21" y1="10" y2="10" />
  </>,
  'CalendarIcon',
);

export const ClockIcon = createIcon(
  <>
    <circle cx="12" cy="12" r="9" />
    <polyline points="12 7 12 12 15 14" />
  </>,
  'ClockIcon',
);

export const InboxIcon = createIcon(
  <>
    <path d="M4 4h16l2 8v6a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2v-6z" />
    <path d="M16 4v4H8V4" />
    <path d="M3 12h4l2 3h6l2-3h4" />
  </>,
  'InboxIcon',
);

export const StickyNoteIcon = createIcon(
  <>
    <path d="M9 3h10a2 2 0 0 1 2 2v10l-6 6H9a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2z" />
    <path d="M15 13h6" />
    <path d="M15 9h6" />
  </>,
  'StickyNoteIcon',
);

export const ListChecksIcon = createIcon(
  <>
    <path d="M9 6h11" />
    <path d="M9 12h11" />
    <path d="M9 18h11" />
    <path d="m3 6 1.5 1.5L7 5" />
    <path d="m3 12 1.5 1.5L7 11" />
    <path d="m3 18 1.5 1.5L7 17" />
  </>,
  'ListChecksIcon',
);

export const EyeIcon = createIcon(
  <>
    <path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7-11-7-11-7z" />
    <circle cx="12" cy="12" r="3" />
  </>,
  'EyeIcon',
);

export const PenIcon = createIcon(
  <>
    <path d="m18.374 2.626 3 3L9.5 17.5 6 18l.5-3.5z" />
    <path d="M16 5l3 3" />
    <path d="M5 21h14" />
  </>,
  'PenIcon',
);

export const SparklesIcon = createIcon(
  <>
    <path d="M12 3v4" />
    <path d="M12 17v4" />
    <path d="M3 12h4" />
    <path d="M17 12h4" />
    <path d="m4.2 4.2 2.8 2.8" />
    <path d="m17 19 2.8 2.8" />
    <path d="m4.2 19.8 2.8-2.8" />
    <path d="m17 5 2.8-2.8" />
  </>,
  'SparklesIcon',
);

export const LoaderIcon = createIcon(
  <>
    <path d="M12 2v4" />
    <path d="m16.24 7.76 2.83-2.83" />
    <path d="M20 12h-4" />
    <path d="m16.24 16.24 2.83 2.83" />
    <path d="M12 20v-4" />
    <path d="m7.76 16.24-2.83 2.83" />
    <path d="M4 12h4" />
    <path d="m7.76 7.76-2.83-2.83" />
  </>,
  'LoaderIcon',
);

export const UserIcon = createIcon(
  <>
    <circle cx="12" cy="7" r="4" />
    <path d="M5.5 21a6.5 6.5 0 0 1 13 0" />
  </>,
  'UserIcon',
);

export const XIcon = createIcon(
  <>
    <line x1="18" x2="6" y1="6" y2="18" />
    <line x1="6" x2="18" y1="6" y2="18" />
  </>,
  'XIcon',
);
