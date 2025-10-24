import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

function daysFromNow(days: number, hour = 10, minute = 0): Date {
  const date = new Date();
  date.setHours(0, 0, 0, 0);
  date.setDate(date.getDate() + days);
  date.setHours(hour, minute, 0, 0);
  return date;
}

const seedNotes = [
  {
    title: 'Welcome to Auto-Prioritizer',
    content: '### Getting started\n\nUse the quick add box to capture notes with inline tags.',
    tags: ['product', 'mvp'],
    pinned: true,
    archived: false,
  },
  {
    title: 'Retro talking points',
    content: '- Celebrate quick wins\n- Surface blockers\n- Plan next experiments',
    tags: ['team', 'retro'],
    pinned: false,
    archived: false,
  },
  {
    title: 'Research backlog',
    content: 'Outline interviews for early adopters.\n\n- Customer fit\n- Prioritization pain',
    tags: ['research'],
    pinned: true,
    archived: false,
  },
  {
    title: 'Focus time blocks',
    content: 'Protect mornings for deep work.\n\nUse Pomodoro to stay on track.',
    tags: ['productivity'],
    pinned: false,
    archived: false,
  },
  {
    title: 'Hiring ideas',
    content: 'Reach out to referrals for full-stack + product design hybrids.',
    tags: ['people', 'hiring'],
    pinned: false,
    archived: true,
  },
  {
    title: 'Playwright e2e outline',
    content: 'Document the flow for our first automated test run.',
    tags: ['testing', 'automation'],
    pinned: false,
    archived: false,
  },
  {
    title: 'Infrastructure wishlist',
    content: 'Think about logging, alerting, and drift detection for future releases.',
    tags: ['platform', 'ops'],
    pinned: false,
    archived: false,
  },
  {
    title: 'Demo day checklist',
    content: '1. Polish landing page\n2. Prepare live demo\n3. Collect feedback forms',
    tags: ['launch', 'event'],
    pinned: true,
    archived: false,
  },
  {
    title: 'Archived onboarding draft',
    content: 'This draft is kept for reference only.',
    tags: ['ops'],
    pinned: false,
    archived: true,
  },
  {
    title: 'Tagging strategy',
    content: 'Keep tags short, lowercase, and action-oriented.',
    tags: ['guides'],
    pinned: false,
    archived: false,
  },
] satisfies Array<{
  title: string;
  content: string;
  tags: string[];
  pinned: boolean;
  archived: boolean;
}>;

const seedTasks = [
  {
    title: 'Prepare sprint review deck',
    notes: 'Gather highlights, metrics, and demos for stakeholders.',
    dueAt: daysFromNow(2, 15).toISOString(),
    estimatedEffort: 120,
    importance: 4,
    project: 'Sprint 18',
    tags: ['product', 'communications'],
    completed: false,
    archived: false,
  },
  {
    title: 'Schedule customer interviews',
    notes: 'Reach out to five design partners for roadmap feedback.',
    dueAt: daysFromNow(5, 11).toISOString(),
    estimatedEffort: 90,
    importance: 5,
    project: 'Research',
    tags: ['research', 'customers'],
    completed: false,
    archived: false,
  },
  {
    title: 'Refine onboarding checklist',
    notes: 'Incorporate latest legal review and QA sign-off steps.',
    dueAt: null,
    estimatedEffort: 45,
    importance: 3,
    project: 'Enablement',
    tags: ['ops'],
    completed: false,
    archived: false,
  },
  {
    title: 'Archive legacy metrics dashboard',
    notes: 'Migrate remaining charts to the new observability stack.',
    dueAt: daysFromNow(-1, 9).toISOString(),
    estimatedEffort: 60,
    importance: 2,
    project: 'Infrastructure',
    tags: ['platform', 'cleanup'],
    completed: true,
    archived: false,
  },
  {
    title: 'Plan Q3 roadmap workshop',
    notes: 'Outline agenda and pre-read, secure facilitator.',
    dueAt: daysFromNow(14, 13).toISOString(),
    estimatedEffort: 180,
    importance: 5,
    project: 'Strategy',
    tags: ['planning', 'leadership'],
    completed: false,
    archived: false,
  },
  {
    title: 'Close out legacy vendor contract',
    notes: 'Coordinate with finance, ensure data export is stored.',
    dueAt: daysFromNow(-7, 16).toISOString(),
    estimatedEffort: 30,
    importance: 4,
    project: 'Finance',
    tags: ['compliance'],
    completed: true,
    archived: true,
  },
] satisfies Array<{
  title: string;
  notes: string | null;
  dueAt: string | null;
  estimatedEffort: number | null;
  importance: number | null;
  project: string | null;
  tags: string[];
  completed: boolean;
  archived: boolean;
}>;

function normalizeTags(tags: string[]): string[] {
  const seen = new Set<string>();
  const result: string[] = [];

  for (const tag of tags) {
    const trimmed = tag.trim().toLowerCase();
    if (!trimmed || seen.has(trimmed)) continue;
    seen.add(trimmed);
    result.push(trimmed);
  }

  return result;
}

async function main() {
  await prisma.task.deleteMany();
  await prisma.note.deleteMany();
  await prisma.tag.deleteMany();

  for (const note of seedNotes) {
    const normalizedTags = normalizeTags(note.tags);

    for (const name of normalizedTags) {
      await prisma.tag.upsert({
        where: { name },
        update: {},
        create: { name },
      });
    }

    await prisma.note.create({
      data: {
        title: note.title,
        content: note.content,
        pinned: note.pinned,
        archived: note.archived,
        tags:
          normalizedTags.length > 0
            ? {
                connect: normalizedTags.map(name => ({ name })),
              }
            : undefined,
      },
    });
  }

  for (const task of seedTasks) {
    const normalizedTags = normalizeTags(task.tags);
    for (const name of normalizedTags) {
      await prisma.tag.upsert({
        where: { name },
        update: {},
        create: { name },
      });
    }

    await prisma.task.create({
      data: {
        title: task.title,
        notes: task.notes,
        dueAt: task.dueAt ? new Date(task.dueAt) : null,
        estimatedEffort: task.estimatedEffort,
        importance: task.importance,
        project: task.project,
        completed: task.completed,
        archived: task.archived,
        tags:
          normalizedTags.length > 0
            ? {
                connect: normalizedTags.map(name => ({ name })),
              }
            : undefined,
      },
    });
  }
}

main()
  .catch(error => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
