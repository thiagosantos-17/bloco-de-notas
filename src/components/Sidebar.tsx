import { useState, useRef, useEffect } from 'react';
import { cn } from '../lib/utils';
import { formatRelativeTime, truncate } from '../lib/utils';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { Dropdown } from './ui/Dropdown';
import { Modal, ConfirmDialog } from './ui/Modal';
import { Tooltip } from './ui/Tooltip';
import { Plus, Search, Pin, Trash2, Copy, Palette, FileText, X, ChevronRight, ChevronLeft, Download, Upload, Check, Sun, Moon, RefreshCw, Info, ExternalLink } from 'lucide-react';
import type { Note, NoteColor } from '../types/note';
import { NOTE_COLORS, NOTE_COLOR_OPTIONS } from '../types/note';
import { useNotes } from '../hooks/useNotes';
import { useTheme } from '../hooks/useTheme';

interface SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
  collapsed?: boolean;
  onCollapseChange?: (collapsed: boolean) => void;
  onMobileNoteClick?: (noteId: string) => void;
}

export function Sidebar({ isOpen, onToggle, collapsed = false, onCollapseChange, onMobileNoteClick }: SidebarProps) {
  const { theme, resolvedTheme, toggleTheme } = useTheme();
  const {
    notes,
    searchQuery,
    setSearchQuery,
    selectedNoteId,
    createNote,
    deleteNote,
    duplicateNote,
    togglePin,
    setNoteColor,
    selectNote,
    clearSearch,
    exportNotes,
    importNotes,
  } = useNotes();

  const [showImportModal, setShowImportModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<Note | null>(null);
  const [hoveredNoteId, setHoveredNoteId] = useState<string | null>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen && !collapsed) {
      setTimeout(() => searchInputRef.current?.focus(), 100);
    }
  }, [isOpen, collapsed]);

  // Close dropdown on click outside
  const handleImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      try {
        await importNotes(file);
        setShowImportModal(false);
        event.target.value = '';
      } catch (error) {
        alert('Erro ao importar: ' + (error as Error).message);
      }
    }
  };

  const handleDeleteConfirm = () => {
    if (showDeleteConfirm) {
      deleteNote(showDeleteConfirm.id);
      setShowDeleteConfirm(null);
    }
  };

  const getNotePreview = (note: Note): string => {
    if (!note.content.trim()) return 'Nota vazia';
    const lines = note.content.trim().split('\n');
    const firstLine = lines[0];
    const remaining = lines.length - 1;
    let preview = truncate(firstLine, collapsed ? 30 : 60);
    if (remaining > 0) preview += ` +${remaining}l`;
    return preview;
  };

  if (!isOpen && window.innerWidth < 1024) return null;

  const sidebarWidth = collapsed ? 'w-20' : 'w-72';

  return (
    <aside
      className={cn(
        'fixed inset-y-0 left-0 z-40 bg-[var(--bg-secondary)] border-r border-[var(--border)]',
        'flex flex-col transition-all duration-200 ease-out',
        'lg:translate-x-0 lg:relative lg:z-auto',
        isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0',
        sidebarWidth
      )}
      aria-label="Lista de notas"
    >
      {/* Header - compact */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-[var(--border)] flex-shrink-0 overflow-hidden">
        {!collapsed && (
          <div className="flex items-center gap-1.5 min-w-0">
            <div className="p-1 bg-primary-100 dark:bg-primary-900/30 rounded-lg">
              <FileText className="h-4 w-4 text-primary-600 dark:text-primary-400" />
            </div>
            <h1 className="text-sm font-semibold text-[var(--text)] truncate">Notas</h1>
          </div>
        )}
        <div className="flex items-center gap-0.5">
          {!collapsed && (
            <Tooltip content="Nova nota" position="right">
              <Button
                onClick={createNote}
                className="p-1.5 rounded-lg hover:bg-[var(--bg-tertiary)] text-[var(--text-secondary)] transition-colors"
                aria-label="Nova nota"
                size="icon"
                variant="ghost"
              >
                <Plus className="h-4 w-4" />
              </Button>
            </Tooltip>
          )}
          <Tooltip content={collapsed ? 'Expandir' : 'Colapsar'} position={collapsed ? 'right' : 'bottom'}>
            <button
              onClick={() => onCollapseChange?.(!collapsed)}
              className="p-1.5 rounded-lg hover:bg-[var(--bg-tertiary)] text-[var(--text-secondary)] transition-colors"
              aria-label={collapsed ? 'Expandir sidebar' : 'Colapsar sidebar'}
            >
              {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
            </button>
          </Tooltip>

          {/* Desktop actions: Theme, Refresh, Info - only when not collapsed */}
          {!collapsed && (
            <div className="hidden lg:flex items-center gap-1 ml-auto">
              {/* Theme Toggle */}
              <Tooltip content={`Tema: ${theme === 'system' ? 'Sistema' : theme === 'light' ? 'Claro' : 'Escuro'}`} position="bottom">
                <button
                  onClick={toggleTheme}
                  className="p-1.5 rounded-lg hover:bg-[var(--bg-tertiary)] text-[var(--text-secondary)] transition-colors"
                  aria-label={`Tema atual: ${theme}`}
                >
                  {resolvedTheme === 'dark' ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
                </button>
              </Tooltip>

              {/* Refresh */}
              <Tooltip content="Recarregar" position="bottom">
                <button
                  onClick={() => window.location.reload()}
                  className="p-1.5 rounded-lg hover:bg-[var(--bg-tertiary)] text-[var(--text-secondary)] transition-colors"
                  aria-label="Recarregar app"
                >
                  <RefreshCw className="h-4 w-4" />
                </button>
              </Tooltip>

              {/* Info Dropdown */}
              <Tooltip content="Mais opções" position="bottom">
                <Dropdown
                  trigger={
                    <button
                      className="p-1.5 rounded-lg hover:bg-[var(--bg-tertiary)] text-[var(--text-secondary)] transition-colors"
                      aria-label="Mais opções"
                    >
                      <Info className="h-4 w-4" />
                    </button>
                  }
                  items={[
                    { label: 'Sobre', value: 'about', icon: <Info className="h-4 w-4" /> },
                    { label: 'Ver no GitHub', value: 'github', icon: <ExternalLink className="h-4 w-4" /> },
                  ]}
                  onSelect={(value) => {
                    if (value === 'about') {
                      alert('Bloco de Notas PWA\n\nApp de notas offline-first, instalável no celular e desktop.\nReact + TypeScript + Vite + Tailwind CSS');
                    } else if (value === 'github') {
                      window.open('https://github.com', '_blank');
                    }
                  }}
                  align="right"
                />
              </Tooltip>
            </div>
          )}

          {window.innerWidth < 1024 && !collapsed && (
            <button
              onClick={onToggle}
              className="p-1.5 rounded-lg hover:bg-[var(--bg-tertiary)] text-[var(--text-secondary)]"
              aria-label="Fechar menu"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      {/* New Note Button - only when expanded */}
      {!collapsed && (
        <div className="px-3 py-1.5 border-b border-[var(--border)]">
          <Button
            onClick={createNote}
            className="w-full justify-start gap-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg py-1.5"
            aria-label="Nova nota"
          >
            <Plus className="h-3.5 w-3.5" />
            <span className="font-medium text-sm">Nova nota</span>
          </Button>
        </div>
      )}

      {/* Search - only when expanded */}
      {!collapsed && (
        <div className="px-3 py-1.5 border-b border-[var(--border)]">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[var(--text-muted)]" />
            <Input
              ref={searchInputRef}
              type="search"
              placeholder="Buscar notas..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 bg-[var(--bg)] border-[var(--border)] rounded-lg py-1.5 focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all text-sm"
              aria-label="Buscar notas"
            />
            {searchQuery && (
              <Tooltip content="Limpar busca" position="right">
                <button
                  onClick={clearSearch}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 rounded-lg hover:bg-[var(--bg-tertiary)] text-[var(--text-muted)] transition-colors"
                  aria-label="Limpar busca"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </Tooltip>
            )}
          </div>
        </div>
      )}

      {/* Notes List */}
      <div className="flex-1 overflow-y-auto px-2 py-1">
        {notes.length === 0 ? (
          !collapsed && (
            <div className="flex flex-col items-center justify-center h-full text-[var(--text-muted)] py-8 px-4 text-center">
              <div className="mb-3">
                <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-[var(--bg-tertiary)]">
                  <FileText className="h-7 w-7 opacity-40" />
                </div>
              </div>
              <p className="text-sm font-medium text-[var(--text-secondary)]">Nenhuma nota encontrada</p>
              {searchQuery ? (
                <p className="text-xs mt-1">Tente buscar por outro termo</p>
              ) : (
                <p className="text-xs mt-1">Clique em "Nova nota" para começar</p>
              )}
            </div>
          )
        ) : (
          <ul className="space-y-0.5" role="list" aria-label="Lista de notas">
            {notes.map((note) => (
              <li key={note.id}>
                <NoteItem
                  note={note}
                  isSelected={selectedNoteId === note.id}
                  isHovered={hoveredNoteId === note.id}
                  collapsed={collapsed}
                  onSelect={() => {
                    if (window.innerWidth < 1024 && onMobileNoteClick) {
                      onMobileNoteClick(note.id);
                    } else {
                      selectNote(note.id);
                    }
                  }}
                  onHover={(hovered) => setHoveredNoteId(hovered ? note.id : null)}
                  onDuplicate={() => duplicateNote(note.id)}
                  onDelete={() => setShowDeleteConfirm(note)}
                  onTogglePin={() => togglePin(note.id)}
                  onColorChange={(color: NoteColor) => setNoteColor(note.id, color)}
                  getNotePreview={getNotePreview}
                />
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Footer - only when expanded */}
      {!collapsed && (
        <div className="px-3 py-2.5 border-t border-[var(--border)] flex-shrink-0 space-y-1.5">
          <p className="px-1 text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider">Ações</p>
          <Dropdown
            trigger={
              <Button variant="outline" className="w-full justify-start gap-2 rounded-lg" size="sm">
                <Download className="h-4 w-4" />
                <span>Exportar notas</span>
                <ChevronRight className="h-4 w-4 ml-auto opacity-50" />
              </Button>
            }
              items={[
                { label: 'Exportar como JSON', value: 'export-json', icon: <FileText className="h-4 w-4" /> },
                { label: 'Exportar como Markdown', value: 'export-md', icon: <Download className="h-4 w-4" /> },
              ]}
              onSelect={(value) => {
                if (value === 'export-json') {
                  exportNotes();
                } else if (value === 'export-md') {
                  const allNotes = notes.map(note =>
                    `# ${note.title || 'Sem título'}\n\n${note.content}\n\n---\nCriado: ${new Date(note.createdAt).toLocaleString('pt-BR')}\nAtualizado: ${new Date(note.updatedAt).toLocaleString('pt-BR')}`
                  ).join('\n\n---\n\n');
                  const blob = new Blob([allNotes], { type: 'text/markdown' });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = `notas-${new Date().toISOString().split('T')[0]}.md`;
                  a.click();
                  URL.revokeObjectURL(url);
                }
              }}
              align="left"
            />
            <Dropdown
              trigger={
                <Button variant="outline" className="w-full justify-start gap-2 rounded-xl text-red-600 dark:text-red-400 border-red-200 dark:border-red-900/30 hover:bg-red-50 dark:hover:bg-red-900/10" size="sm">
                  <Trash2 className="h-4 w-4" />
                  <span>Excluir todas as notas</span>
                  <ChevronRight className="h-4 w-4 ml-auto opacity-50" />
                </Button>
              }
              items={[
                { label: 'Confirmar exclusão de TODAS as notas', value: 'delete-all', icon: <Trash2 className="h-4 w-4" />, danger: true },
              ]}
              onSelect={(value) => {
                if (value === 'delete-all') {
                  if (confirm('Tem certeza? Isso excluirá TODAS as notas permanentemente!')) {
                    localStorage.removeItem('notepad-pwa-notes');
                    window.location.reload();
                  }
                }
              }}
              align="left"
            />
            <Button
              variant="outline"
              className="w-full justify-start gap-2 rounded-lg"
              size="sm"
              onClick={() => setShowImportModal(true)}
            >
              <Upload className="h-4 w-4" />
              <span>Importar notas</span>
            </Button>
        </div>
      )}

      {/* Modals */}
      <ConfirmDialog
        isOpen={!!showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(null)}
        onConfirm={handleDeleteConfirm}
        title="Excluir nota"
        message={`Tem certeza que deseja excluir "${showDeleteConfirm?.title || 'esta nota'}"? Esta ação não pode ser desfeita.`}
        confirmText="Excluir"
        variant="danger"
      />

      <Modal
        isOpen={showImportModal}
        onClose={() => setShowImportModal(false)}
        title="Importar notas"
        description="Selecione um arquivo JSON exportado anteriormente"
        size="sm"
      >
        <Input
          type="file"
          accept=".json"
          onChange={handleImport}
          className="cursor-pointer"
        />
        <p className="text-xs text-[var(--text-muted)] mt-2">
          O arquivo deve ser um JSON válido exportado deste app.
        </p>
      </Modal>
    </aside>
  );
}

interface NoteItemProps {
  note: Note;
  isSelected: boolean;
  isHovered: boolean;
  collapsed: boolean;
  onSelect: () => void;
  onHover: (hovered: boolean) => void;
  onDuplicate: () => void;
  onDelete: () => void;
  onTogglePin: () => void;
  onColorChange: (color: NoteColor) => void;
  getNotePreview: (note: Note) => string;
}

function NoteItem({
  note,
  isSelected,
  isHovered,
  collapsed,
  onSelect,
  onHover,
  onDuplicate,
  onDelete,
  onTogglePin,
  onColorChange,
  getNotePreview,
}: NoteItemProps) {
  const preview = getNotePreview(note);
  const colorBorder = note.color && note.color !== 'default' ? NOTE_COLORS[note.color].border : 'transparent';
  const isColored = note.color && note.color !== 'default';

  if (collapsed) {
    return (
      <Tooltip content={note.title || 'Sem título'} position="right">
        <button
          onClick={onSelect}
          onMouseEnter={() => onHover(true)}
          onMouseLeave={() => onHover(false)}
          className={cn(
            'w-full px-3 py-3 rounded-lg transition-all duration-150 flex items-center justify-center',
            'hover:bg-[var(--bg-tertiary)]',
            'focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 focus:ring-offset-[var(--bg-secondary)]',
            isSelected && 'bg-primary-100 dark:bg-primary-900/30 border border-primary-300 dark:border-primary-700',
            note.isPinned && 'relative'
          )}
          style={{
            borderLeft: `3px solid ${colorBorder}`,
          }}
          aria-current={isSelected ? 'true' : 'false'}
          aria-label={note.title || 'Nota sem título'}
        >
          {note.isPinned && <Pin className="h-5 w-5 text-amber-500" />}
          {!note.isPinned && isColored && (
            <div
              className="w-2.5 h-2.5 rounded-full flex-shrink-0"
              style={{ backgroundColor: NOTE_COLORS[note.color!].border }}
            />
          )}
          {!note.isPinned && !isColored && <FileText className="h-5 w-5 text-[var(--text-secondary)]" />}
        </button>
      </Tooltip>
    );
  }

  return (
    <div
      className="group w-full rounded-lg transition-all duration-150"
      onMouseEnter={() => onHover(true)}
      onMouseLeave={() => onHover(false)}
      style={{
        borderLeft: `3px solid ${colorBorder}`,
      }}
    >
      <ColorPickerInline
        value={note.color || 'default'}
        onChange={onColorChange}
      />
      <button
        onClick={onSelect}
        className={cn(
          'w-full p-2.5 rounded-lg text-left transition-all duration-150',
          'hover:bg-[var(--bg-tertiary)]',
          'focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 focus:ring-offset-[var(--bg-secondary)]',
          isSelected && 'bg-primary-100 dark:bg-primary-900/30 border border-primary-300 dark:border-primary-700',
          note.isPinned && 'relative'
        )}
        aria-current={isSelected ? 'true' : 'false'}
        aria-label={note.title || 'Nota sem título'}
      >
        <div className="flex items-start gap-2">
          {/* Color indicator / Pin */}
          <div className="flex flex-col items-center gap-1 flex-shrink-0 pt-0.5">
            {note.isPinned && (
              <Tooltip content="Fixada" position="right">
                <Pin className="h-3.5 w-3.5 text-amber-500" />
              </Tooltip>
            )}
            {isColored && (
              <div
                className="w-2 h-2 rounded-full flex-shrink-0"
                style={{ backgroundColor: NOTE_COLORS[note.color!].border }}
                title={`Cor: ${NOTE_COLOR_OPTIONS.find(c => c.value === note.color)?.label}`}
              />
            )}
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0">
                <h3 className={cn(
                  'font-medium truncate text-sm',
                  isSelected ? 'text-primary-700 dark:text-primary-300' : 'text-[var(--text)]'
                )}>
                  {note.title || 'Sem título'}
                </h3>
                <p className={cn(
                  'text-xs truncate mt-0.5 font-mono',
                  isSelected ? 'text-primary-600/80 dark:text-primary-400/80' : 'text-[var(--text-secondary)]'
                )}>
                  {preview}
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between mt-1.5">
              <time
                className={cn(
                  'text-xs font-mono',
                  isSelected ? 'text-primary-500/80 dark:text-primary-400/80' : 'text-[var(--text-muted)]'
                )}
                dateTime={new Date(note.updatedAt).toISOString()}
              >
                {formatRelativeTime(note.updatedAt)}
              </time>

              {/* Actions - only show on hover or selected */}
              {(isHovered || isSelected) && (
                <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity" role="group" aria-label="Ações da nota">
                  <Tooltip content="Duplicar (Ctrl+D)" position="top">
                    <button
                      onClick={(e) => { e.stopPropagation(); onDuplicate(); }}
                      className="p-1 rounded hover:bg-[var(--bg-tertiary)] text-[var(--text-secondary)] transition-colors"
                      aria-label="Duplicar nota"
                    >
                      <Copy className="h-3.5 w-3.5" />
                    </button>
                  </Tooltip>
                  <Tooltip content={note.isPinned ? 'Desfixar' : 'Fixar'} position="top">
                    <button
                      onClick={(e) => { e.stopPropagation(); onTogglePin(); }}
                      className={cn(
                        'p-1 rounded hover:bg-[var(--bg-tertiary)] transition-colors',
                        note.isPinned ? 'text-amber-500' : 'text-[var(--text-secondary)]'
                      )}
                      aria-label={note.isPinned ? 'Desfixar nota' : 'Fixar nota'}
                      aria-pressed={note.isPinned}
                    >
                      <Pin className="h-3.5 w-3.5" />
                    </button>
                  </Tooltip>
                  <Tooltip content="Excluir" position="top">
                    <button
                      onClick={(e) => { e.stopPropagation(); onDelete(); }}
                      className="p-1 rounded hover:bg-red-100 dark:hover:bg-red-900/30 text-red-500 transition-colors"
                      aria-label="Excluir nota"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </Tooltip>
                </div>
              )}
            </div>
          </div>
        </div>
      </button>
    </div>
  );
}

function ColorPickerInline({ value, onChange }: { value: NoteColor; onChange: (color: NoteColor) => void }) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node) &&
          buttonRef.current && !buttonRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const isColored = value !== 'default';

  return (
    <div className="relative">
      <Tooltip content="Cor da nota" position="top">
        <button
          ref={buttonRef}
          onClick={(e) => { e.stopPropagation(); setIsOpen(!isOpen); }}
          className={cn(
            'p-1.5 rounded-lg hover:bg-[var(--bg-tertiary)] text-[var(--text-secondary)] transition-colors',
            isColored && 'text-primary-600 dark:text-primary-400'
          )}
          aria-label="Mudar cor"
          aria-haspopup="true"
          aria-expanded={isOpen}
        >
          <Palette className="h-4 w-4" />
        </button>
      </Tooltip>

      {isOpen && (
        <div
          ref={dropdownRef}
          className="fixed z-50 mt-1.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-xl py-1 min-w-[140px] animate-in right-0"
          role="menu"
        >
          {NOTE_COLOR_OPTIONS.map((color, index) => (
            <button
              key={color.value}
              onClick={() => { onChange(color.value); setIsOpen(false); }}
              role="menuitem"
              aria-selected={value === color.value}
              className={cn(
                'w-full px-3 py-2 flex items-center gap-2',
                'text-slate-900 dark:text-slate-100',
                'hover:bg-slate-100 dark:hover:bg-slate-700',
                'focus:outline-none focus:bg-slate-100 dark:focus:bg-slate-700',
                'transition-colors duration-100'
              )}
              style={{ animationDelay: `${index * 10}ms` }}
            >
              <span
                className="w-5 h-5 rounded-lg border border-slate-300 dark:border-slate-600 flex-shrink-0 shadow-sm"
                style={{ backgroundColor: color.preview }}
              >
                {color.value === 'default' && (
                  <X className="w-3 h-3 text-slate-400 mx-auto my-1" />
                )}
              </span>
              <span className="flex-1 text-left capitalize font-medium">{color.label}</span>
              {value === color.value && (
                <Check className="h-4 w-4 text-primary-600 dark:text-primary-400 flex-shrink-0" />
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}