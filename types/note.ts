export type NoteStatus = 'active' | 'archived' | 'all';

export interface NoteDTO {
  id: string;
  title: string;
  content: string;
  tags: string[];
  pinned: boolean;
  archived: boolean;
  createdAt: string;
  updatedAt: string;
}
