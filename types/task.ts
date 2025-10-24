export type TaskStatusFilter = 'all' | 'active' | 'completed' | 'archived' | 'upcoming';

export interface TaskDTO {
  id: string;
  title: string;
  notes: string | null;
  dueAt: string | null;
  estimatedEffort: number | null;
  importance: number | null;
  project: string | null;
  completed: boolean;
  archived: boolean;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}
