import { useLayoutEffect, useState } from 'react';
import { Sun, Moon } from 'lucide-react';

export default function ThemeToggle() {
  const [isDarkTheme, setIsDarkTheme] = useState(() => {
    const stored = localStorage.getItem('theme');
    const prefersDark = window.matchMedia?.('(prefers-color-scheme: dark)').matches;
    return stored === 'dark' || (!stored && prefersDark);
  });

  useLayoutEffect(() => {
    document.documentElement.classList.toggle('dark', isDarkTheme);
    localStorage.setItem('theme', isDarkTheme ? 'dark' : 'light');
  }, [isDarkTheme]);

  return (
    <button
      onClick={() => setIsDarkTheme((prev) => !prev)}
      className={`flex h-8 w-16 cursor-pointer items-center justify-start rounded-full px-1 py-1 transition-colors ${
        isDarkTheme ? 'bg-dark-theme-background' : 'bg-light-theme-background'
      }`}
      aria-label="Toggle theme"
    >
      <div
        className={`flex h-6 w-6 items-center justify-center rounded-full transition-transform duration-300 ${
          isDarkTheme
            ? 'translate-x-8 bg-dark-theme-foreground'
            : 'translate-x-0 bg-light-theme-foreground'
        }`}
      >
        {isDarkTheme ? <Moon className="h-4 w-4 text-white" /> : <Sun className="h-4 w-4 text-yellow-900" />}
      </div>
    </button>
  );
}

export default ThemeToggle;
