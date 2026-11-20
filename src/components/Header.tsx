import { IconButton } from './ui/IconButton';
import { Dropdown } from './ui/Dropdown';
import { Tooltip } from './ui/Tooltip';
import { Menu, Sun, Moon, Monitor, Info, RefreshCw, ExternalLink, Keyboard } from 'lucide-react';
import { useTheme } from '../hooks/useTheme';

interface HeaderProps {
  onMenuClick: () => void;
}

export function Header({ onMenuClick }: HeaderProps) {
  const { theme, resolvedTheme, setTheme, toggleTheme } = useTheme();

  const themeOptions = [
    { label: 'Claro', value: 'light', icon: <Sun className="h-4 w-4" /> },
    { label: 'Escuro', value: 'dark', icon: <Moon className="h-4 w-4" /> },
    { label: 'Sistema', value: 'system', icon: <Monitor className="h-4 w-4" /> },
  ];

  return (
    <header className="sticky top-0 z-30 bg-[var(--bg-secondary)]/80 backdrop-blur-md border-b border-[var(--border)]">
      <div className="flex items-center justify-between h-12 px-3 md:px-4">
        {/* Left: Menu button */}
        <div className="flex items-center gap-2">
          <Tooltip content="Menu (Ctrl+B)" position="bottom">
            <IconButton
              onClick={onMenuClick}
              aria-label="Abrir menu lateral"
              size="md"
              variant="ghost"
              className="lg:hidden"
            >
              <Menu className="h-5 w-5" />
            </IconButton>
          </Tooltip>

          {/* Title only on mobile */}
          <div className="lg:hidden flex items-center gap-2">
            <span className="text-lg font-semibold text-[var(--text)]">Bloco de Notas</span>
            <span className="px-2 py-0.5 text-xs font-mono bg-[var(--bg-tertiary)] rounded-full text-[var(--text-muted)] border border-[var(--border)]">PWA</span>
          </div>
        </div>

        {/* Center: Theme toggle (desktop) */}
        <div className="hidden md:flex items-center gap-1">
          <Tooltip content={`Tema: ${theme === 'system' ? 'Sistema' : theme === 'light' ? 'Claro' : 'Escuro'} (Ctrl+Shift+T)`} position="bottom">
            <IconButton
              onClick={toggleTheme}
              aria-label={`Tema atual: ${theme}. Clique para alternar.`}
              size="sm"
              variant="outline"
            >
              {resolvedTheme === 'dark' ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
            </IconButton>
          </Tooltip>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-1">
          {/* Theme dropdown (mobile) */}
          <div className="md:hidden">
            <Dropdown
              trigger={
                <Tooltip content={`Tema: ${theme === 'system' ? 'Sistema' : theme === 'light' ? 'Claro' : 'Escuro'}`} position="bottom">
                  <IconButton
                    onClick={toggleTheme}
                    aria-label={`Tema atual: ${theme}. Clique para alternar.`}
                    size="sm"
                    variant="outline"
                  >
                    {resolvedTheme === 'dark' ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
                  </IconButton>
                </Tooltip>
              }
              items={themeOptions}
              onSelect={(value) => setTheme(value as 'light' | 'dark' | 'system')}
              align="right"
            />
          </div>

          {/* Refresh */}
          <Tooltip content="Recarregar app" position="bottom">
            <IconButton
              onClick={() => window.location.reload()}
              aria-label="Recarregar app"
              size="sm"
              variant="ghost"
            >
              <RefreshCw className="h-4 w-4" />
            </IconButton>
          </Tooltip>

          {/* Info dropdown */}
          <Dropdown
            trigger={
              <Tooltip content="Mais opções" position="bottom">
                <IconButton aria-label="Mais opções" size="sm" variant="ghost">
                  <Info className="h-4 w-4" />
                </IconButton>
              </Tooltip>
            }
            items={[
              { label: 'Sobre o Bloco de Notas', value: 'about', icon: <Info className="h-4 w-4" /> },
              { label: 'Atalhos de teclado', value: 'shortcuts', icon: <Keyboard className="h-4 w-4" /> },
              { label: 'Ver no GitHub', value: 'github', icon: <ExternalLink className="h-4 w-4" /> },
            ]}
            onSelect={(value) => {
              if (value === 'about') {
                alert('Bloco de Notas PWA\n\nUm app de notas moderno, offline-first, instalável no celular e desktop.\n\nFeito com React + TypeScript + Vite + Tailwind CSS');
              } else if (value === 'github') {
                window.open('https://github.com', '_blank');
              } else if (value === 'shortcuts') {
                showShortcuts();
              }
            }}
            align="right"
          />
        </div>
      </div>
    </header>
  );
}

function showShortcuts() {
  const shortcuts = [
    { key: 'Ctrl + N', desc: 'Nova nota' },
    { key: 'Ctrl + S', desc: 'Salvar nota' },
    { key: 'Ctrl + D', desc: 'Duplicar nota' },
    { key: 'Ctrl + B', desc: 'Alternar barra lateral' },
    { key: 'Ctrl + Shift + T', desc: 'Alternar tema' },
    { key: 'Ctrl + F', desc: 'Buscar notas' },
    { key: 'Ctrl + B (editor)', desc: 'Negrito' },
    { key: 'Ctrl + I (editor)', desc: 'Itálico' },
    { key: 'Escape', desc: 'Fechar modais / Limpar seleção' },
  ];

  const content = shortcuts.map(s => `${s.key.padEnd(18)} ${s.desc}`).join('\n');
  alert(`Atalhos de Teclado:\n\n${content}`);
}