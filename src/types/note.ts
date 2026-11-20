export interface Note {
  id: string;
  title: string;
  content: string;
  createdAt: number;
  updatedAt: number;
  isPinned: boolean;
  color?: NoteColor;
}

export type NoteColor =
  | 'default'
  | 'yellow'
  | 'orange'
  | 'red'
  | 'pink'
  | 'purple'
  | 'blue'
  | 'cyan'
  | 'green'
  | 'gray';

export const NOTE_COLORS: Record<NoteColor, { bg: string; border: string; text: string }> = {
  default: { bg: 'transparent', border: 'transparent', text: 'inherit' },
  yellow: { bg: '#fef9c3', border: '#fde047', text: '#713f12' },
  orange: { bg: '#ffedd5', border: '#fb923c', text: '#7c2d12' },
  red: { bg: '#fee2e2', border: '#f87171', text: '#7f1d1d' },
  pink: { bg: '#fce7f3', border: '#f472b6', text: '#831843' },
  purple: { bg: '#f3e8ff', border: '#a855f7', text: '#581c87' },
  blue: { bg: '#dbeafe', border: '#60a5fa', text: '#1e3a5f' },
  cyan: { bg: '#cffafe', border: '#22d3ee', text: '#155e75' },
  green: { bg: '#dcfce7', border: '#4ade80', text: '#14532d' },
  gray: { bg: '#f1f5f9', border: '#94a3b8', text: '#334155' },
};

export const NOTE_COLOR_OPTIONS: { value: NoteColor; label: string; preview: string }[] = [
  { value: 'default', label: 'Padrão', preview: '#ffffff' },
  { value: 'yellow', label: 'Amarelo', preview: '#fef9c3' },
  { value: 'orange', label: 'Laranja', preview: '#ffedd5' },
  { value: 'red', label: 'Vermelho', preview: '#fee2e2' },
  { value: 'pink', label: 'Rosa', preview: '#fce7f3' },
  { value: 'purple', label: 'Roxo', preview: '#f3e8ff' },
  { value: 'blue', label: 'Azul', preview: '#dbeafe' },
  { value: 'cyan', label: 'Ciano', preview: '#cffafe' },
  { value: 'green', label: 'Verde', preview: '#dcfce7' },
  { value: 'gray', label: 'Cinza', preview: '#f1f5f9' },
];

export function createEmptyNote(overrides: Partial<Note> = {}): Note {
  const now = Date.now();
  return {
    id: crypto.randomUUID(),
    title: '',
    content: '',
    createdAt: now,
    updatedAt: now,
    isPinned: false,
    color: 'default',
    ...overrides,
  };
}

export function sortNotes(notes: Note[]): Note[] {
  return [...notes].sort((a, b) => {
    if (a.isPinned !== b.isPinned) return b.isPinned ? 1 : -1;
    return b.updatedAt - a.updatedAt;
  });
}