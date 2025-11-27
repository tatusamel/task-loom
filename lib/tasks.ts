import { Prisma } from '@prisma/client';
import prisma from './prisma';
import type { TaskDTO, TaskStatusFilter } from '@/types/task';
import { ensureTagsExist, normalizeTags } from './tags';

const taskInclude = {
  tags: {
    select: { name: true },
  },
} satisfies Prisma.TaskInclude;

export function serializeTask(
  task: Prisma.TaskGetPayload<{ include: typeof taskInclude }>,
): TaskDTO {
  const tags = task.tags.map(tag => tag.name).sort((a, b) => a.localeCompare(b));

  return {
    id: task.id,
    title: task.title,
    notes: task.notes,
    dueAt: task.dueAt ? task.dueAt.toISOString() : null,
    estimatedEffort: task.estimatedEffort,
    importance: task.importance,
    project: task.project,
    completed: task.completed,
    archived: task.archived,
    tags,
    createdAt: task.createdAt.toISOString(),
    updatedAt: task.updatedAt.toISOString(),
  };
}

type TaskFilters = {
  userId: string;
  status?: TaskStatusFilter;
  tag?: string;
  project?: string;
  query?: string;
};

export async function getTasks(filters: TaskFilters): Promise<TaskDTO[]> {
  const { userId, status = 'all', tag, project, query } = filters;
  const where: Prisma.TaskWhereInput = {
    userId,
  };

  if (status === 'active') {
    where.completed = false;
    where.archived = false;
  } else if (status === 'completed') {
    where.completed = true;
  } else if (status === 'archived') {
    where.archived = true;
  } else if (status === 'upcoming') {
    where.archived = false;
    where.completed = false;
    where.dueAt = {
      not: null,
      gte: new Date(),
    };
  }

  if (tag) {
    where.tags = {
      some: { name: tag, userId },
    };
  }

  if (project) {
    where.project = project;
  }

  if (query?.trim()) {
    const contains = query.trim();
    where.OR = [
      { title: { contains } },
      { notes: { contains } },
      { project: { contains } },
    ];
  }

  const tasks = await prisma.task.findMany({
    include: taskInclude,
    where,
    orderBy: [
      { dueAt: 'asc' },
      { updatedAt: 'desc' },
    ],
  });

  return tasks.map(serializeTask);
}

export async function getTaskById(userId: string, id: string): Promise<TaskDTO | null> {
  const task = await prisma.task.findUnique({
    where: { id_userId: { id, userId } },
    include: taskInclude,
  });

  return task ? serializeTask(task) : null;
}

export async function createTask(
  userId: string,
  data: {
    title: string;
    notes?: string | null;
    dueAt?: Date | null;
    estimatedEffort?: number | null;
    importance?: number | null;
    project?: string | null;
    tags?: string[] | null;
    completed?: boolean;
    archived?: boolean;
  },
): Promise<TaskDTO> {
  const normalizedTags = normalizeTags(data.tags ?? []);
  await ensureTagsExist(userId, normalizedTags);

  const task = await prisma.task.create({
    data: {
      userId,
      title: data.title,
      notes: data.notes ?? null,
      dueAt: data.dueAt ?? null,
      estimatedEffort: data.estimatedEffort ?? null,
      importance: data.importance ?? null,
      project: data.project ?? null,
      completed: data.completed ?? false,
      archived: data.archived ?? false,
      tags:
        normalizedTags.length > 0
          ? {
              connect: normalizedTags.map(name => ({
                userId_name: {
                  userId,
                  name,
                },
              })),
            }
          : undefined,
    },
    include: taskInclude,
  });

  return serializeTask(task);
}

export async function updateTask(
  userId: string,
  id: string,
  data: {
    title?: string;
    notes?: string | null;
    dueAt?: Date | null;
    estimatedEffort?: number | null;
    importance?: number | null;
    project?: string | null;
    completed?: boolean;
    archived?: boolean;
    tags?: string[] | null;
  },
): Promise<TaskDTO> {
  const normalizedTags = data.tags ? normalizeTags(data.tags) : undefined;
  if (normalizedTags) {
    await ensureTagsExist(userId, normalizedTags);
  }

  const task = await prisma.task.update({
    where: { id_userId: { id, userId } },
    data: {
      ...(data.title !== undefined ? { title: data.title } : {}),
      ...(data.notes !== undefined ? { notes: data.notes } : {}),
      ...(data.dueAt !== undefined ? { dueAt: data.dueAt } : {}),
      ...(data.estimatedEffort !== undefined ? { estimatedEffort: data.estimatedEffort } : {}),
      ...(data.importance !== undefined ? { importance: data.importance } : {}),
      ...(data.project !== undefined ? { project: data.project } : {}),
      ...(data.completed !== undefined ? { completed: data.completed } : {}),
      ...(data.archived !== undefined ? { archived: data.archived } : {}),
      ...(normalizedTags !== undefined
        ? {
            tags: {
              set: normalizedTags.map(name => ({
                userId_name: {
                  userId,
                  name,
                },
              })),
            },
          }
        : {}),
    },
    include: taskInclude,
  });

  return serializeTask(task);
}

export async function deleteTask(userId: string, id: string): Promise<void> {
  await prisma.task.delete({ where: { id_userId: { id, userId } } });
}

export const taskRelations = {
  include: taskInclude,
} as const;
