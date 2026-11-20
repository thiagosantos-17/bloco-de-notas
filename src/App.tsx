import { useState, useEffect, useRef } from 'react';
import { Sidebar } from './components/Sidebar';
import { Editor } from './components/Editor';
import { Header } from './components/Header';
import { useNotes } from './hooks/useNotes';
import { useTheme } from './hooks/useTheme';
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts';
import { cn } from './lib/utils';
import { X } from 'lucide-react';

// Type for BeforeInstallPromptEvent
interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

function App() {
  const { resolvedTheme } = useTheme();
  const {
    toggleSidebar,
    createNote,
    selectedNote,
    clearSearch,
    isSidebarOpen,
    sidebarCollapsed,
    setSidebarCollapsed,
    notes,
  } = useNotes();

  const [isMobile, setIsMobile] = useState(false);
  const [showInstallPrompt, setShowInstallPrompt] = useState(false);
  const [mobileNoteId, setMobileNoteId] = useState<string | null>(null);
  const deferredPromptRef = useRef<BeforeInstallPromptEvent | null>(null);

  // Detect mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // PWA Install prompt
  useEffect(() => {
    const handleBeforeInstallPrompt = (e: BeforeInstallPromptEvent) => {
      e.preventDefault();
      deferredPromptRef.current = e;
      setTimeout(() => setShowInstallPrompt(true), 10000);
    };

    const handleAppInstalled = () => {
      setShowInstallPrompt(false);
      deferredPromptRef.current = null;
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt as EventListener);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt as EventListener);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleInstall = async () => {
    if (deferredPromptRef.current) {
      await deferredPromptRef.current.prompt();
      const { outcome } = await deferredPromptRef.current.userChoice;
      if (outcome === 'accepted') {
        setShowInstallPrompt(false);
        deferredPromptRef.current = null;
      }
    }
  };

  // Keyboard shortcuts
  useKeyboardShortcuts([
    {
      key: 'b',
      ctrl: true,
      handler: toggleSidebar,
      description: 'Alternar barra lateral',
    },
    {
      key: 'n',
      ctrl: true,
      handler: createNote,
      description: 'Nova nota',
      preventDefault: true,
    },
    {
      key: 'f',
      ctrl: true,
      handler: () => {},
      description: 'Buscar notas',
      preventDefault: true,
    },
    {
      key: 't',
      ctrl: true,
      shift: true,
      handler: () => {},
      description: 'Alternar tema',
    },
    {
      key: 'Escape',
      handler: () => {
        clearSearch();
        if (isMobile && isSidebarOpen) {
          toggleSidebar();
        }
      },
      description: 'Fechar/limpar',
    },
  ]);

  // Apply theme class to document
  useEffect(() => {
    document.documentElement.classList.remove('light', 'dark');
    document.documentElement.classList.add(resolvedTheme);
  }, [resolvedTheme]);

  // Handle back button on mobile
  useEffect(() => {
    const handleBack = () => {
      if (isMobile && isSidebarOpen) {
        toggleSidebar();
        return true;
      }
      return false;
    };

    window.addEventListener('popstate', handleBack);
    return () => window.removeEventListener('popstate', handleBack);
  }, [isMobile, isSidebarOpen, toggleSidebar]);

  const mainTransition = 'transition-all duration-200 ease-out';

  return (
    <div className={cn('min-h-screen flex', resolvedTheme)}>
      {/* Sidebar Overlay for Mobile */}
      {isMobile && isSidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/50 backdrop-blur-sm lg:hidden animate-in"
          onClick={() => toggleSidebar()}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <Sidebar
        isOpen={isSidebarOpen || !isMobile}
        onToggle={toggleSidebar}
        collapsed={sidebarCollapsed && !isMobile}
        onCollapseChange={setSidebarCollapsed}
        onMobileNoteClick={setMobileNoteId}
      />

      {/* Main Content */}
      <div className={cn(
        'flex-1 flex flex-col min-w-0',
        mainTransition,
        !isMobile && sidebarCollapsed ? 'lg:pl-20' : 'lg:pl-72',
        isMobile && isSidebarOpen && 'lg:pl-0'
      )}>
        {/* Header only on mobile (when sidebar is closed) */}
        {isMobile && !isSidebarOpen && (
          <Header onMenuClick={toggleSidebar} />
        )}

        <main className="flex-1 overflow-hidden">
          <Editor note={selectedNote} />
        </main>
      </div>

      {/* Mobile Note Modal - Custom fullscreen modal */}
      {isMobile && mobileNoteId && (
        <div className="fixed inset-0 z-50 lg:hidden animate-in" role="dialog" aria-modal="true">
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setMobileNoteId(null)} aria-hidden="true" />
          <div className="fixed inset-0 flex flex-col bg-[var(--bg)] z-10">
            {/* Modal Header */}
            <div className="sticky top-0 z-20 flex items-center justify-between h-14 px-4 border-b border-[var(--border)] bg-[var(--bg-secondary)]/95 backdrop-blur-md">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setMobileNoteId(null)}
                  className="p-2 rounded-lg hover:bg-[var(--bg-tertiary)] text-[var(--text-secondary)] transition-colors"
                  aria-label="Fechar nota"
                >
                  <X className="h-5 w-5" />
                </button>
                <span className="text-lg font-semibold text-[var(--text)]">Bloco de Notas</span>
              </div>
              <div className="flex items-center gap-1">
                {/* Theme toggle in modal */}
                <Header onMenuClick={toggleSidebar} />
              </div>
            </div>
            {/* Editor */}
            <div className="flex-1 overflow-auto">
              <Editor note={notes.find((n: { id: string }) => n.id === mobileNoteId) || null} isMobileModal={true} />
            </div>
          </div>
        </div>
      )}

      {/* Install Prompt - Desktop */}
      {showInstallPrompt && !isMobile && (
        <div className="fixed bottom-4 right-4 z-50 animate-in lg:bottom-6 lg:right-6">
          <div className="bg-[var(--bg-secondary)] border border-[var(--border)] rounded-xl shadow-xl p-4 min-w-[280px] flex items-center gap-3 relative">
            <div className="p-2 bg-primary-100 dark:bg-primary-900/30 rounded-lg">
              <svg className="h-6 w-6 text-primary-600 dark:text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>
            </div>
            <div className="flex-1">
              <p className="font-medium text-[var(--text)]">Instalar Bloco de Notas</p>
              <p className="text-sm text-[var(--text-secondary)]">Acesse rápido da tela inicial, funcione offline</p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setShowInstallPrompt(false)}
                className="px-3 py-1.5 text-sm text-[var(--text-secondary)] hover:text-[var(--text)] transition-colors"
              >
                Agora não
              </button>
              <button
                onClick={handleInstall}
                className="px-3 py-1.5 text-sm bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
              >
                Instalar
              </button>
            </div>
            <button
              onClick={() => setShowInstallPrompt(false)}
              className="absolute top-2 right-2 text-[var(--text-muted)] hover:text-[var(--text)] transition-colors"
              aria-label="Dispensar"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {/* Mobile Install Banner */}
      {showInstallPrompt && isMobile && (
        <div className="fixed bottom-0 left-0 right-0 z-50 animate-in pb-safe lg:hidden">
          <div className="bg-[var(--bg-secondary)] border-t border-[var(--border)] rounded-t-2xl shadow-xl p-4 safe-bottom">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary-100 dark:bg-primary-900/30 rounded-lg">
                <svg className="h-6 w-6 text-primary-600 dark:text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>
              </div>
              <div className="flex-1">
                <p className="font-medium text-[var(--text)]">Instalar Bloco de Notas</p>
                <p className="text-sm text-[var(--text-secondary)]">Acesse rápido da tela inicial, funcione offline</p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setShowInstallPrompt(false)}
                  className="px-4 py-2 text-sm text-[var(--text-secondary)]"
                >
                  Agora não
                </button>
                <button
                  onClick={handleInstall}
                  className="px-4 py-2 text-sm bg-primary-600 text-white rounded-lg"
                >
                  Instalar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Global Modal Portal */}
      <div id="modal-portal" />
    </div>
  );
}

export default App;