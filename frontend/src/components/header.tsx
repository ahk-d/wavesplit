// src/components/Header.tsx
import { ThemeToggle } from './theme-toggle';

export function Header() {
  return (
    <header className="w-full border-b border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-900">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <div className="font-semibold text-xl text-gray-900 dark:text-white">
            Audio Splitter
          </div>
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}