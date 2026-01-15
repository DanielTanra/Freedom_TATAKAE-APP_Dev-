/**
 * Theme System Verification Component
 * 
 * This component can be temporarily added to any page to verify
 * the theme system is working correctly.
 * 
 * Usage:
 * 1. Import this component: import { ThemeDebug } from './components/ThemeDebug'
 * 2. Add it anywhere: <ThemeDebug />
 * 3. Remove it after verification
 */

import { useTheme } from './ThemeContext';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Sun, Moon, Monitor } from 'lucide-react';

export function ThemeDebug() {
  const { theme, setTheme, toggleTheme } = useTheme();

  // Get localStorage value
  const localStorageTheme = localStorage.getItem('theme');

  // Get system preference
  const systemPreference = window.matchMedia('(prefers-color-scheme: dark)').matches 
    ? 'dark' 
    : 'light';

  // Check if dark class exists on html element
  const htmlHasDarkClass = document.documentElement.classList.contains('dark');

  return (
    <Card className="fixed bottom-4 right-4 w-96 shadow-lg z-50 bg-white dark:bg-gray-900 border-2 border-blue-500 dark:border-blue-400">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          🎨 Theme System Debug
        </CardTitle>
        <CardDescription>
          Real-time theme status
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Current Theme */}
        <div className="p-3 bg-muted rounded-lg">
          <div className="text-sm font-medium mb-2">Current Theme State:</div>
          <div className="text-2xl font-bold flex items-center gap-2">
            {theme === 'dark' ? (
              <>
                <Moon className="h-6 w-6" />
                Dark Mode
              </>
            ) : (
              <>
                <Sun className="h-6 w-6" />
                Light Mode
              </>
            )}
          </div>
        </div>

        {/* Status Checks */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm">
            <span className={htmlHasDarkClass ? 'text-green-600' : 'text-red-600'}>
              {htmlHasDarkClass ? '✅' : '❌'}
            </span>
            <span>HTML has "dark" class: {htmlHasDarkClass ? 'Yes' : 'No'}</span>
          </div>

          <div className="flex items-center gap-2 text-sm">
            <span className={localStorageTheme ? 'text-green-600' : 'text-yellow-600'}>
              {localStorageTheme ? '✅' : '⚠️'}
            </span>
            <span>localStorage: {localStorageTheme || 'Not set'}</span>
          </div>

          <div className="flex items-center gap-2 text-sm">
            <Monitor className="h-4 w-4" />
            <span>System preference: {systemPreference}</span>
          </div>
        </div>

        {/* Test Buttons */}
        <div className="space-y-2">
          <div className="text-sm font-medium mb-2">Test Actions:</div>
          
          <Button 
            onClick={toggleTheme}
            variant="outline"
            className="w-full"
          >
            Toggle Theme
          </Button>

          <div className="grid grid-cols-2 gap-2">
            <Button 
              onClick={() => setTheme('light')}
              variant={theme === 'light' ? 'default' : 'outline'}
              size="sm"
            >
              <Sun className="h-4 w-4 mr-2" />
              Light
            </Button>
            
            <Button 
              onClick={() => setTheme('dark')}
              variant={theme === 'dark' ? 'default' : 'outline'}
              size="sm"
            >
              <Moon className="h-4 w-4 mr-2" />
              Dark
            </Button>
          </div>
        </div>

        {/* Color Samples */}
        <div className="space-y-2">
          <div className="text-sm font-medium mb-2">Color Samples:</div>
          
          <div className="grid grid-cols-2 gap-2">
            <div className="p-3 bg-background border rounded text-center text-sm">
              background
            </div>
            <div className="p-3 bg-foreground text-background border rounded text-center text-sm">
              foreground
            </div>
            <div className="p-3 bg-primary text-primary-foreground border rounded text-center text-sm">
              primary
            </div>
            <div className="p-3 bg-secondary text-secondary-foreground border rounded text-center text-sm">
              secondary
            </div>
            <div className="p-3 bg-muted text-muted-foreground border rounded text-center text-sm">
              muted
            </div>
            <div className="p-3 bg-accent text-accent-foreground border rounded text-center text-sm">
              accent
            </div>
          </div>
        </div>

        {/* Status */}
        <div className="pt-2 border-t">
          <div className="text-xs text-muted-foreground text-center">
            {htmlHasDarkClass && localStorageTheme && theme
              ? '✅ Theme system working correctly!'
              : '⚠️ Theme system may have issues'}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
