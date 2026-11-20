import { useRef, useEffect, useCallback, useState } from 'react';
import { cn } from '../lib/utils';
import { Textarea } from './ui/Textarea';
import { Input } from './ui/Input';
import { Button } from './ui/Button';
import { IconButton } from './ui/IconButton';
import { Tooltip } from './ui/Tooltip';
import { Dropdown } from './ui/Dropdown';
import {
  Bold, Italic, Strikethrough, Code, List, ListOrdered, Quote,
  Undo, Redo, MoreHorizontal, Download, Copy, FileText, Type,
  Trash2, Maximize2, Minimize2, LayoutDashboard, Palette, Pin, Check, Plus, X
} from 'lucide-react';
import type { Note, NoteColor } from '../types/note';
import { useNotes } from '../hooks/useNotes';
import { formatDate, countWords, countChars, downloadFile } from '../lib/utils';
import { NOTE_COLOR_OPTIONS, NOTE_COLORS } from '../types/note';

interface EditorProps {
  note: Note | null;
  isMobileModal?: boolean;
}

export function Editor({ note, isMobileModal = false }: EditorProps) {
  const {
    updateNote,
    createNote,
    duplicateNote,
    deleteNote,
  } = useNotes();

  const titleRef = useRef<HTMLInputElement>(null);
  const contentRef = useRef<HTMLTextAreaElement>(null);
  const [showStats, setShowStats] = useState(false);
  const [wordCount, setWordCount] = useState(0);
  const [charCount, setCharCount] = useState(0);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [editorMode, setEditorMode] = useState<'full' | 'centered' | 'dashboard'>('centered');

  // Auto-save
  useEffect(() => {
    if (!note) return;
    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    saveTimeoutRef.current = setTimeout(() => {
      updateNote(note.id, {
        title: titleRef.current?.value || '',
        content: contentRef.current?.value || '',
      });
      setLastSaved(new Date());
    }, 500);
    return () => {
      if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    };
  }, [note?.id, note?.title, note?.content, updateNote]);

  // Update stats
  useEffect(() => {
    if (!note) return;
    const content = contentRef.current?.value || '';
    setWordCount(countWords(content));
    setCharCount(countChars(content));
  }, [note?.content]);

  // Focus title on new note
  useEffect(() => {
    if (note && !note.title && !note.content) {
      setTimeout(() => titleRef.current?.focus(), 50);
    }
  }, [note?.id]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        if (note) {
          updateNote(note.id, {
            title: titleRef.current?.value || '',
            content: contentRef.current?.value || '',
          });
          setLastSaved(new Date());
        }
      }
      if ((e.ctrlKey || e.metaKey) && e.key === 'd') {
        e.preventDefault();
        if (note) duplicateNote(note.id);
      }
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'n') {
        e.preventDefault();
        createNote();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [note, updateNote, duplicateNote, createNote]);

  // Format text helpers
  const applyFormat = useCallback((prefix: string, suffix: string = prefix) => {
    const textarea = contentRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = textarea.value;
    const selectedText = text.substring(start, end);

    let newText = text;
    let newStart = start;
    let newEnd = end;

    if (selectedText) {
      newText = text.substring(0, start) + prefix + selectedText + suffix + text.substring(end);
      newEnd = start + prefix.length + selectedText.length + suffix.length;
    } else {
      newText = text.substring(0, start) + prefix + suffix + text.substring(end);
      newStart = newEnd = start + prefix.length;
    }

    textarea.value = newText;
    textarea.setSelectionRange(newStart, newEnd);
    textarea.focus();

    if (note) {
      updateNote(note.id, { content: newText });
    }
  }, [note, updateNote]);

  const applyBlockFormat = useCallback((prefix: string) => {
    const textarea = contentRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = textarea.value;

    let lineStart = start;
    while (lineStart > 0 && text[lineStart - 1] !== '\n') lineStart--;
    let lineEnd = end;
    while (lineEnd < text.length && text[lineEnd] !== '\n') lineEnd++;

    const beforeLine = text.substring(0, lineStart);
    const line = text.substring(lineStart, lineEnd);
    const afterLine = text.substring(lineEnd);

    const hasPrefix = line.startsWith(prefix);
    const newLine = hasPrefix ? line.slice(prefix.length) : prefix + line;

    const newText = beforeLine + newLine + afterLine;
    const newCursorPos = hasPrefix ? start - prefix.length : start + prefix.length;

    textarea.value = newText;
    textarea.setSelectionRange(newCursorPos, newCursorPos);
    textarea.focus();

    if (note) {
      updateNote(note.id, { content: newText });
    }
  }, [note, updateNote]);

  const handleExportNote = () => {
    if (!note) return;
    const content = `# ${note.title || 'Sem título'}\n\n${note.content}\n\n---\nCriado em: ${formatDate(note.createdAt)}\nAtualizado em: ${formatDate(note.updatedAt)}`;
    downloadFile(content, `${note.title || 'nota'}.md`, 'text/markdown');
  };

  const handleCopyMarkdown = () => {
    if (!note) return;
    const content = `# ${note.title || 'Sem título'}\n\n${note.content}`;
    navigator.clipboard.writeText(content);
  };

  if (!note) {
    return (
      <div className="flex-1 flex items-center justify-center bg-[var(--bg)] p-8">
        <div className="text-center max-w-xl mx-auto w-full">
          {/* Hero illustration */}
          <div className="mx-auto mb-8">
            <div className="inline-flex items-center justify-center w-24 h-24 rounded-3xl bg-gradient-to-br from-primary-500 to-primary-600 shadow-lg shadow-primary-500/25">
              <FileText className="h-12 w-12 text-white" />
            </div>
          </div>

          <h1 className="text-3xl font-bold text-[var(--text)] mb-3">Bem-vindo ao Bloco de Notas</h1>
          <p className="text-lg text-[var(--text-secondary)] mb-8 max-w-md mx-auto">
            Um app de notas moderno, offline-first, instalável no celular e desktop.
            Suas notas ficam salvas localmente e funcionam sem internet.
          </p>

          {/* Quick Actions - Mobile first: full width buttons, shortcuts only desktop */}
          <div className="flex flex-col gap-3 mb-8 max-w-md mx-auto">
            <Button onClick={createNote} size="lg" className="h-14 justify-center gap-3 bg-primary-600 hover:bg-primary-700 w-full">
              <Plus className="h-5 w-5" />
              <span>Nova nota</span>
            </Button>
            {/* Ver atalhos - only on desktop (shortcuts are desktop-only) */}
            <Button
              variant="outline"
              size="lg"
              className="h-14 justify-center gap-3 w-full hidden sm:flex"
              onClick={() => alert('Atalhos de teclado (desktop):\nCtrl+N = Nova nota\nCtrl+S = Salvar\nCtrl+B = Alternar sidebar\nCtrl+Shift+T = Tema\nEscape = Fechar/limpar')}
            >
              <FileText className="h-5 w-5" />
              <span>Ver atalhos</span>
            </Button>
          </div>

          {/* Features */}
          <div className="grid grid-cols-3 gap-4 text-center max-w-md mx-auto p-4 bg-[var(--bg-secondary)] rounded-2xl border border-[var(--border)]">
            <div className="p-2">
              <div className="w-10 h-10 mx-auto mb-2 bg-primary-100 dark:bg-primary-900/30 rounded-xl flex items-center justify-center">
                <Download className="h-5 w-5 text-primary-600 dark:text-primary-400" />
              </div>
              <p className="text-xs text-[var(--text-secondary)]">Offline-first</p>
            </div>
            <div className="p-2">
              <div className="w-10 h-10 mx-auto mb-2 bg-green-100 dark:bg-green-900/30 rounded-xl flex items-center justify-center">
                <Check className="h-5 w-5 text-green-600 dark:text-green-400" />
              </div>
              <p className="text-xs text-[var(--text-secondary)]">Instalável (PWA)</p>
            </div>
            <div className="p-2">
              <div className="w-10 h-10 mx-auto mb-2 bg-amber-100 dark:bg-amber-900/30 rounded-xl flex items-center justify-center">
                <Palette className="h-5 w-5 text-amber-600 dark:text-amber-400" />
              </div>
              <p className="text-xs text-[var(--text-secondary)]">Cores & Fixar</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const getContainerClasses = () => {
    switch (editorMode) {
      case 'full':
        return 'w-full px-4 md:px-6 lg:px-8';
      case 'dashboard':
        return 'w-full max-w-7xl mx-auto px-4 md:px-6 lg:px-8';
      case 'centered':
      default:
        return 'max-w-3xl mx-auto w-full px-4 md:px-6';
    }
  };

  const getToolbarPadding = () => {
    switch (editorMode) {
      case 'full':
        return 'px-4 md:px-6 lg:px-8';
      case 'dashboard':
        return 'px-4 md:px-6 lg:px-8';
      case 'centered':
      default:
        return 'px-4 md:px-6';
    }
  };

  const getTextareaClasses = () => {
    const base = 'min-h-[400px] bg-[var(--bg)] border-[var(--border)] focus:border-primary-500 rounded-xl shadow-sm';
    switch (editorMode) {
      case 'full':
        return `${base} w-full`;
      case 'dashboard':
        return `${base} w-full`;
      case 'centered':
      default:
        return `${base} max-w-3xl mx-auto w-full`;
    }
  };

  const isColored = note.color && note.color !== 'default';

  return (
    <div className="flex-1 flex flex-col bg-[var(--bg)] overflow-hidden">
      {/* Modern Toolbar */}
      <div className="border-b border-[var(--border)] bg-[var(--bg-secondary)]">
        <div className={cn('flex items-center gap-3 flex-wrap', getToolbarPadding())}>
          {/* Title Section */}
          <div className="flex-1 min-w-[200px] relative">
            <Input
              ref={titleRef}
              value={note.title}
              onChange={(e) => updateNote(note.id, { title: e.target.value })}
              placeholder="Título da nota"
              className="bg-[var(--bg)] border-[var(--border)] rounded-xl px-4 py-2.5 text-lg font-medium placeholder:text-[var(--text-muted)] focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
              aria-label="Título da nota"
            />
            {note.isPinned && (
              <Tooltip content="Fixada" position="top">
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-amber-500">📌</span>
              </Tooltip>
            )}
          </div>

          {/* Color & Pin Section */}
          <div className="flex items-center gap-2">
            {/* Color Picker Button */}
            <ColorPickerButton
              value={note.color || 'default'}
              onChange={(color) => updateNote(note.id, { color })}
            />

            {/* Pin Button */}
            <Tooltip content={note.isPinned ? 'Desfixar' : 'Fixar nota'} position="top">
              <IconButton
                onClick={() => updateNote(note.id, { isPinned: !note.isPinned })}
                aria-label={note.isPinned ? 'Desfixar nota' : 'Fixar nota'}
                size="md"
                variant={note.isPinned ? 'solid' : 'outline'}
                className={note.isPinned ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400' : ''}
              >
                <Pin className="h-4 w-4" />
              </IconButton>
            </Tooltip>
          </div>

          {/* Divider */}
          <div className="w-px h-8 bg-[var(--border)] mx-1 hidden sm:block" />

          {/* Formatting Section - Mobile: essential only, Desktop: all */}
          <div className="flex items-center gap-1" role="group" aria-label="Formatação de texto">
            <FormatButton onClick={() => applyFormat('**')} icon={<Bold className="h-4 w-4" />} label="Negrito" />
            <FormatButton onClick={() => applyFormat('*')} icon={<Italic className="h-4 w-4" />} label="Itálico" />
            <div className="hidden sm:inline-flex"><FormatButton onClick={() => applyFormat('~~')} icon={<Strikethrough className="h-4 w-4" />} label="Riscado" /></div>
            <div className="hidden sm:inline-flex"><FormatButton onClick={() => applyFormat('`')} icon={<Code className="h-4 w-4" />} label="Código inline" /></div>
          </div>

          <div className="w-px h-8 bg-[var(--border)] mx-1 hidden sm:block" />

          {/* Block Formatting Section - Desktop only */}
          <div className="hidden sm:flex items-center gap-1" role="group" aria-label="Formatação de bloco">
            <FormatButton onClick={() => applyBlockFormat('- ')} icon={<List className="h-4 w-4" />} label="Lista com marcadores" />
            <FormatButton onClick={() => applyBlockFormat('1. ')} icon={<ListOrdered className="h-4 w-4" />} label="Lista numerada" />
            <FormatButton onClick={() => applyBlockFormat('> ')} icon={<Quote className="h-4 w-4" />} label="Citação" />
          </div>

          <div className="w-px h-8 bg-[var(--border)] mx-1 hidden sm:block" />

          {/* Undo/Redo Section - Desktop only */}
          <div className="hidden sm:flex items-center gap-1" role="group" aria-label="Histórico">
            <FormatButton onClick={() => document.execCommand('undo')} icon={<Undo className="h-4 w-4" />} label="Desfazer" />
            <FormatButton onClick={() => document.execCommand('redo')} icon={<Redo className="h-4 w-4" />} label="Refazer" />
          </div>

          {/* Right side actions */}
          {!isMobileModal && (
            <div className="flex items-center gap-2 ml-auto flex-wrap">
              {/* Stats Toggle - Desktop only */}
              <div className="hidden sm:inline-block">
                <Tooltip content={showStats ? 'Ocultar estatísticas' : 'Mostrar estatísticas'} position="top">
                  <IconButton
                    onClick={() => setShowStats(!showStats)}
                    aria-label="Estatísticas"
                    size="md"
                    variant={showStats ? 'solid' : 'outline'}
                  >
                    <Type className="h-4 w-4" />
                  </IconButton>
                </Tooltip>
              </div>

              {/* Editor Mode Toggle - Desktop only */}
              <div className="hidden sm:inline-block">
                <Tooltip content={editorMode === 'full' ? 'Centralizado' : editorMode === 'dashboard' ? 'Largura total' : 'Dashboard'} position="top">
                  <IconButton
                    onClick={() => setEditorMode(prev => prev === 'full' ? 'centered' : prev === 'centered' ? 'dashboard' : 'full')}
                    aria-label="Alternar modo do editor"
                    size="md"
                    variant="outline"
                  >
                    {editorMode === 'full' ? <Minimize2 className="h-4 w-4" /> : editorMode === 'dashboard' ? <LayoutDashboard className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
                  </IconButton>
                </Tooltip>
              </div>

              {/* More Options Dropdown */}
              <Dropdown
                trigger={
                  <Tooltip content="Mais opções" position="top">
                    <IconButton aria-label="Mais opções" size="md" variant="outline">
                      <MoreHorizontal className="h-4 w-4" />
                    </IconButton>
                  </Tooltip>
                }
                items={[
                  { label: 'Duplicar nota', value: 'duplicate', icon: <Copy className="h-4 w-4" /> },
                  { label: 'Exportar como Markdown', value: 'export-md', icon: <Download className="h-4 w-4" /> },
                  { label: 'Copiar como Markdown', value: 'copy-md', icon: <Copy className="h-4 w-4" /> },
                  { label: 'Nova nota', value: 'new', icon: <FileText className="h-4 w-4" /> },
                  { label: 'Excluir nota', value: 'delete', icon: <Trash2 className="h-4 w-4" />, danger: true },
                ]}
                onSelect={(value) => {
                  switch (value) {
                    case 'duplicate': duplicateNote(note.id); break;
                    case 'export-md': handleExportNote(); break;
                    case 'copy-md': handleCopyMarkdown(); break;
                    case 'new': createNote(); break;
                    case 'delete': deleteNote(note.id); break;
                  }
                }}
                align="right"
              />
            </div>
          )}
        </div>
      </div>

      {/* Editor Area */}
      <div className="flex-1 overflow-auto bg-[var(--bg)]">
        <div className={cn('py-6', getContainerClasses())}>
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-[var(--border)] shadow-lg overflow-hidden">
            {/* Color accent bar on top for colored notes */}
            {isColored && (
              <div
                className="h-1.5 w-full"
                style={{ backgroundColor: NOTE_COLORS[note.color!].border }}
              />
            )}

            <Textarea
              ref={contentRef}
              value={note.content}
              onChange={(e) => updateNote(note.id, { content: e.target.value })}
              placeholder="Comece a digitar..."
              className={cn('p-6 md:p-8', getTextareaClasses())}
              showStats={showStats}
              aria-label="Conteúdo da nota"
              spellCheck={true}
            />

            {/* Stats Bar */}
            {showStats && (
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between px-6 py-4 border-t border-[var(--border)] text-sm text-[var(--text-secondary)] bg-[var(--bg-secondary)] gap-4">
                <div className="flex flex-wrap items-center gap-3 sm:gap-4">
                  <StatItem icon={<Type className="h-3.5 w-3.5" />} value={`${wordCount} palavra${wordCount !== 1 ? 's' : ''}`} />
                  <StatItem icon={<span className="text-[var(--text-muted)]" style={{fontSize: '10px'}}>A</span>} value={`${charCount} caractere${charCount !== 1 ? 's' : ''}`} />
                  <StatItem icon={<span className="text-[var(--text-muted)]" style={{fontSize: '10px'}}>⏐</span>} value={`${note.content.split('\n').length} linha${note.content.split('\n').length !== 1 ? 's' : ''}`} />
                  <StatItem icon={<span className="text-[var(--text-muted)]" style={{fontSize: '10px'}}>📖</span>} value={`~${Math.ceil(wordCount / 200)} min leitura`} />
                </div>
                <div className="flex items-center gap-2 sm:ml-auto">
                  {lastSaved && (
                    <span className="text-[var(--text-muted)] hidden sm:inline flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-green-500" />
                      Salvo em {lastSaved.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  )}
                  <Button
                    onClick={() => {
                      updateNote(note.id, {
                        title: titleRef.current?.value || '',
                        content: contentRef.current?.value || '',
                      });
                      setLastSaved(new Date());
                    }}
                    variant="outline"
                    size="sm"
                    className="gap-1"
                  >
                    <span className="w-3.5 h-3.5 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center">
                      <Check className="h-2.5 w-2.5 text-primary-600 dark:text-primary-400" />
                    </span>
                    Salvar
                  </Button>
                </div>
              </div>
            )}

            {/* Metadata Footer */}
            <div className="px-6 py-4 border-t border-[var(--border)] text-xs text-[var(--text-muted)] flex flex-wrap items-center gap-4 bg-[var(--bg-secondary)]">
              <MetaItem icon="✦" text={`Criado: ${formatDate(note.createdAt)}`} />
              <MetaItem icon="⟳" text={`Atualizado: ${formatDate(note.updatedAt)}`} />
              {note.isPinned && (
                <MetaItem icon={<Pin className="h-3 w-3" />} text="Fixada" className="text-amber-500 font-medium" />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Color Picker Button with Dropdown
function ColorPickerButton({ value, onChange }: { value: NoteColor; onChange: (color: NoteColor) => void }) {
  const [isOpen, setIsOpen] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

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

  const currentColorOption = NOTE_COLOR_OPTIONS.find(c => c.value === value);
  const isColored = value !== 'default';

  return (
    <div className="relative">
      <Tooltip content="Cor da nota" position="top">
        <IconButton
          ref={buttonRef}
          onClick={() => setIsOpen(!isOpen)}
          aria-label="Mudar cor da nota"
          size="md"
          variant={isColored ? 'solid' : 'outline'}
          className={isColored ? 'relative' : ''}
        >
          <Palette className="h-4 w-4" />
          {isColored && (
            <span
              className="absolute -top-1 -right-1 w-3 h-3 rounded-full border-2 border-[var(--bg-secondary)]"
              style={{ backgroundColor: currentColorOption?.preview }}
            />
          )}
        </IconButton>
      </Tooltip>

      {isOpen && (
        <div
          ref={dropdownRef}
          className="fixed z-50 mt-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-xl py-1.5 min-w-[150px] animate-in right-0"
          role="menu"
          style={{ minWidth: '160px' }}
        >
          {NOTE_COLOR_OPTIONS.map((color, index) => (
            <button
              key={color.value}
              onClick={() => { onChange(color.value); setIsOpen(false); }}
              role="menuitem"
              aria-selected={value === color.value}
              className={cn(
                'w-full px-4 py-2.5 flex items-center gap-3',
                'text-slate-900 dark:text-slate-100',
                'hover:bg-slate-100 dark:hover:bg-slate-700',
                'focus:outline-none focus:bg-slate-100 dark:focus:bg-slate-700',
                'transition-colors duration-100'
              )}
              style={{ animationDelay: `${index * 15}ms` }}
            >
              <span
                className="w-6 h-6 rounded-lg border border-slate-300 dark:border-slate-600 flex-shrink-0 shadow-sm"
                style={{ backgroundColor: color.preview }}
              >
                {color.value === 'default' && (
                  <X className="w-3 h-3 text-slate-400 mx-auto my-0.5" />
                )}
              </span>
              <span className="flex-1 text-left capitalize font-medium">{color.label}</span>
              {value === color.value && (
                <Check className="h-5 w-5 text-primary-600 dark:text-primary-400 flex-shrink-0" />
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// Format Button Component
function FormatButton({ onClick, icon, label }: { onClick: () => void; icon: React.ReactNode; label: string }) {
  return (
    <Tooltip content={label} position="top">
      <IconButton onClick={onClick} aria-label={label} size="md" variant="ghost">
        {icon}
      </IconButton>
    </Tooltip>
  );
}

// Stat Item Component
function StatItem({ icon, value }: { icon: React.ReactNode; value: string }) {
  return (
    <span className="flex items-center gap-1.5 text-[var(--text-secondary)]">
      <span className="text-[var(--text-muted)]">{icon}</span>
      <span className="font-mono">{value}</span>
    </span>
  );
}

// Meta Item Component
function MetaItem({ icon, text, className = '' }: { icon: React.ReactNode | string; text: string; className?: string }) {
  return (
    <span className={cn('flex items-center gap-1.5', className)}>
      <span className="text-[var(--text-muted)]">{icon}</span>
      <span>{text}</span>
    </span>
  );
}