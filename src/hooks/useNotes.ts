import { useState, useEffect, useCallback } from 'react';
import type { Note, NoteColor } from '../types/note';
import { createEmptyNote, sortNotes, NOTE_COLORS } from '../types/note';

const STORAGE_KEY = 'notepad-pwa-notes';

export function useNotes() {
  const [notes, setNotes] = useState<Note[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        return Array.isArray(parsed) ? sortNotes(parsed) : [];
      }
    } catch {
      console.warn('Failed to load notes from localStorage');
    }
    return [];
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedNoteId, setSelectedNoteId] = useState<string | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // Persist notes to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(notes));
    } catch {
      console.warn('Failed to save notes to localStorage');
    }
  }, [notes]);

  // Persist sidebar state
  useEffect(() => {
    try {
      localStorage.setItem('notepad-sidebar-open', JSON.stringify(isSidebarOpen));
    } catch {}
  }, [isSidebarOpen]);

  useEffect(() => {
    try {
      localStorage.setItem('notepad-sidebar-collapsed', JSON.stringify(sidebarCollapsed));
    } catch {}
  }, [sidebarCollapsed]);

  // Load sidebar state
  useEffect(() => {
    try {
      const stored = localStorage.getItem('notepad-sidebar-open');
      if (stored !== null) {
        setIsSidebarOpen(JSON.parse(stored));
      }
      const storedCollapsed = localStorage.getItem('notepad-sidebar-collapsed');
      if (storedCollapsed !== null) {
        setSidebarCollapsed(JSON.parse(storedCollapsed));
      }
    } catch {}
  }, []);

  const filteredNotes = notes.filter((note) => {
    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase();
    return (
      note.title.toLowerCase().includes(query) ||
      note.content.toLowerCase().includes(query)
    );
  });

  const sortedNotes = sortNotes(filteredNotes);

  const selectedNote = notes.find((n) => n.id === selectedNoteId) || null;

  const createNote = useCallback(() => {
    const newNote = createEmptyNote();
    setNotes((prev) => [newNote, ...prev]);
    setSelectedNoteId(newNote.id);
    setSearchQuery('');
    return newNote;
  }, []);

  const updateNote = useCallback((id: string, updates: Partial<Note>) => {
    setNotes((prev) =>
      prev.map((note) =>
        note.id === id
          ? { ...note, ...updates, updatedAt: Date.now() }
          : note
      )
    );
  }, []);

  const deleteNote = useCallback((id: string) => {
    setNotes((prev) => prev.filter((note) => note.id !== id));
    if (selectedNoteId === id) {
      setSelectedNoteId(notes.find((n) => n.id !== id)?.id || null);
    }
  }, [selectedNoteId, notes]);

  const duplicateNote = useCallback((id: string) => {
    const note = notes.find((n) => n.id === id);
    if (!note) return;
    const newNote = createEmptyNote({
      title: note.title,
      content: note.content,
      color: note.color,
    });
    setNotes((prev) => [newNote, ...prev]);
    setSelectedNoteId(newNote.id);
  }, [notes]);

  const togglePin = useCallback((id: string) => {
    const note = notes.find((n) => n.id === id);
    if (!note) return;
    updateNote(id, { isPinned: !note.isPinned });
  }, [notes, updateNote]);

  const setNoteColor = useCallback((id: string, color: NoteColor) => {
    updateNote(id, { color });
  }, [updateNote]);

  const selectNote = useCallback((id: string | null) => {
    setSelectedNoteId(id);
    if (window.innerWidth < 1024) {
      setIsSidebarOpen(false);
    }
  }, []);

  const toggleSidebar = useCallback(() => {
    setIsSidebarOpen((prev) => !prev);
  }, []);

  const clearSearch = useCallback(() => {
    setSearchQuery('');
  }, []);

  const exportNotes = useCallback(() => {
    const data = JSON.stringify(notes, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `notas-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }, [notes]);

  const importNotes = useCallback((file: File) => {
    return new Promise<void>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = JSON.parse(e.target?.result as string);
          if (Array.isArray(data)) {
            setNotes(sortNotes(data));
            resolve();
          } else {
            reject(new Error('Formato inválido'));
          }
        } catch {
          reject(new Error('Arquivo inválido'));
        }
      };
      reader.onerror = () => reject(new Error('Erro ao ler arquivo'));
      reader.readAsText(file);
    });
  }, []);

  const getNoteColorStyles = (color: NoteColor = 'default') => {
    const colors = NOTE_COLORS[color];
    return {
      backgroundColor: colors.bg,
      borderColor: colors.border,
      color: colors.text,
    };
  };

  return {
    notes: sortedNotes,
    allNotes: notes,
    searchQuery,
    setSearchQuery,
    selectedNoteId,
    selectedNote,
    isSidebarOpen,
    sidebarCollapsed,
    setSidebarCollapsed,
    createNote,
    updateNote,
    deleteNote,
    duplicateNote,
    togglePin,
    setNoteColor,
    selectNote,
    toggleSidebar,
    clearSearch,
    exportNotes,
    importNotes,
    getNoteColorStyles,
  };
}