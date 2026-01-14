import { Sun, Moon } from 'lucide-react';
import { Button } from './ui/button';
import { useTheme } from './ThemeContext';

interface ThemeToggleProps {
  variant?: 'default' | 'ghost' | 'outline';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  showLabels?: boolean;
}

export function ThemeToggle({ variant = 'outline', size = 'default', showLabels = true }: ThemeToggleProps) {
  const { theme, setTheme } = useTheme();

  if (showLabels) {
    return (
      <div className="flex items-center gap-2 p-1 bg-muted rounded-lg">
        <Button
          variant={theme === 'light' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => setTheme('light')}
          className="gap-2"
        >
          <Sun className="h-4 w-4" />
          <span>Terang</span>
        </Button>
        <Button
          variant={theme === 'dark' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => setTheme('dark')}
          className="gap-2"
        >
          <Moon className="h-4 w-4" />
          <span>Gelap</span>
        </Button>
      </div>
    );
  }

  return (
    <Button
      variant={variant}
      size={size}
      onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
    >
      {theme === 'light' ? (
        <Moon className="h-[1.2rem] w-[1.2rem]" />
      ) : (
        <Sun className="h-[1.2rem] w-[1.2rem]" />
      )}
      <span className="sr-only">Tukar tema</span>
    </Button>
  );
}
