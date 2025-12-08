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

export const AlertTriangleIcon = createIcon(
  <>
    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
    <line x1="12" x2="12" y1="9" y2="13" />
    <line x1="12" x2="12.01" y1="17" y2="17" />
  </>,
  'AlertTriangleIcon',
);

export const BoldIcon = createIcon(
  <>
    <path d="M6 4h8a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z" />
    <path d="M6 12h9a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z" />
  </>,
  'BoldIcon',
);

export const ItalicIcon = createIcon(
  <>
    <line x1="19" x2="10" y1="4" y2="4" />
    <line x1="14" x2="5" y1="20" y2="20" />
    <line x1="15" x2="9" y1="4" y2="20" />
  </>,
  'ItalicIcon',
);

export const StrikethroughIcon = createIcon(
  <>
    <path d="M16 4H9a3 3 0 0 0-2.83 4" />
    <path d="M14 12a4 4 0 0 1 0 8H6" />
    <line x1="4" x2="20" y1="12" y2="12" />
  </>,
  'StrikethroughIcon',
);

export const CodeIcon = createIcon(
  <>
    <polyline points="16 18 22 12 16 6" />
    <polyline points="8 6 2 12 8 18" />
  </>,
  'CodeIcon',
);

export const Heading1Icon = createIcon(
  <>
    <path d="M4 12h8" />
    <path d="M4 18V6" />
    <path d="M12 18V6" />
    <path d="m17 12 3-2v8" />
  </>,
  'Heading1Icon',
);

export const Heading2Icon = createIcon(
  <>
    <path d="M4 12h8" />
    <path d="M4 18V6" />
    <path d="M12 18V6" />
    <path d="M21 18h-4c0-4 4-3 4-6 0-1.5-2-2.5-4-1" />
  </>,
  'Heading2Icon',
);

export const Heading3Icon = createIcon(
  <>
    <path d="M4 12h8" />
    <path d="M4 18V6" />
    <path d="M12 18V6" />
    <path d="M17.5 10.5c1.7-1 3.5 0 3.5 1.5a2 2 0 0 1-2 2" />
    <path d="M17 17.5c2 1.5 4 .3 4-1.5a2 2 0 0 0-2-2" />
  </>,
  'Heading3Icon',
);

export const ListIcon = createIcon(
  <>
    <line x1="8" x2="21" y1="6" y2="6" />
    <line x1="8" x2="21" y1="12" y2="12" />
    <line x1="8" x2="21" y1="18" y2="18" />
    <line x1="3" x2="3.01" y1="6" y2="6" />
    <line x1="3" x2="3.01" y1="12" y2="12" />
    <line x1="3" x2="3.01" y1="18" y2="18" />
  </>,
  'ListIcon',
);

export const ListOrderedIcon = createIcon(
  <>
    <line x1="10" x2="21" y1="6" y2="6" />
    <line x1="10" x2="21" y1="12" y2="12" />
    <line x1="10" x2="21" y1="18" y2="18" />
    <path d="M4 6h1v4" />
    <path d="M4 10h2" />
    <path d="M6 18H4c0-1 2-2 2-3s-1-1.5-2-1" />
  </>,
  'ListOrderedIcon',
);

export const QuoteIcon = createIcon(
  <>
    <path d="M3 21c3 0 7-1 7-8V5c0-1.25-.756-2.017-2-2H4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2 1 0 1 0 1 1v1c0 1-1 2-2 2s-1 .008-1 1.031V21z" />
    <path d="M15 21c3 0 7-1 7-8V5c0-1.25-.757-2.017-2-2h-4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2h.75c0 2.25.25 4-2.75 4v3z" />
  </>,
  'QuoteIcon',
);

export const UndoIcon = createIcon(
  <>
    <path d="M3 7v6h6" />
    <path d="M21 17a9 9 0 0 0-9-9 9 9 0 0 0-6 2.3L3 13" />
  </>,
  'UndoIcon',
);

export const RedoIcon = createIcon(
  <>
    <path d="M21 7v6h-6" />
    <path d="M3 17a9 9 0 0 1 9-9 9 9 0 0 1 6 2.3l3 2.7" />
  </>,
  'RedoIcon',
);

export const SunIcon = createIcon(
  <>
    <circle cx="12" cy="12" r="4" />
    <path d="M12 2v2" />
    <path d="M12 20v2" />
    <path d="m4.93 4.93 1.41 1.41" />
    <path d="m17.66 17.66 1.41 1.41" />
    <path d="M2 12h2" />
    <path d="M20 12h2" />
    <path d="m6.34 17.66-1.41 1.41" />
    <path d="m19.07 4.93-1.41 1.41" />
  </>,
  'SunIcon',
);

export const MoonIcon = createIcon(
  <>
    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79Z" />
  </>,
  'MoonIcon',
);

export const ShareIcon = createIcon(
  <>
    <circle cx="18" cy="5" r="3" />
    <circle cx="6" cy="12" r="3" />
    <circle cx="18" cy="19" r="3" />
    <line x1="8.59" x2="15.42" y1="13.51" y2="17.49" />
    <line x1="15.41" x2="8.59" y1="6.51" y2="10.49" />
  </>,
  'ShareIcon',
);

export const CopyIcon = createIcon(
  <>
    <rect width="14" height="14" x="8" y="8" rx="2" />
    <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
  </>,
  'CopyIcon',
);

export const LinkIcon = createIcon(
  <>
    <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
    <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
  </>,
  'LinkIcon',
);

export const GlobeIcon = createIcon(
  <>
    <circle cx="12" cy="12" r="10" />
    <line x1="2" x2="22" y1="12" y2="12" />
    <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
  </>,
  'GlobeIcon',
);

export const LockIcon = createIcon(
  <>
    <rect width="18" height="11" x="3" y="11" rx="2" />
    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
  </>,
  'LockIcon',
);

export const UsersIcon = createIcon(
  <>
    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </>,
  'UsersIcon',
);
