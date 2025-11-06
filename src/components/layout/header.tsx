'use client';
import { PanicButton } from '@/components/panic-button';
import Link from 'next/link';

export function AppHeader() {
  return (
    <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b bg-background/80 backdrop-blur-sm px-4 md:px-6 justify-between">
      <Link href="/" className="flex items-center gap-2">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="h-6 w-6 text-primary"
        >
          <path d="M8 17a4 4 0 0 0 8 0" />
          <path d="M9 13h6" />
          <path d="M12 3v1" />
          <path d="M18.7 5.3a2.4 2.4 0 0 0-3.4 0" />
          <path d="M5.3 5.3a2.4 2.4 0 0 1 3.4 0" />
          <path d="M21 11.5a6.5 6.5 0 0 0-11-5.2" />
          <path d="M3 11.5a6.5 6.5 0 0 1 11-5.2" />
          <path d="M3.5 17.5a2.5 2.5 0 0 0 4 0" />
          <path d="M16.5 17.5a2.5 2.5 0 0 1-4 0" />
        </svg>
        <h1 className="text-xl font-semibold">TaskZen</h1>
      </Link>
      <PanicButton />
    </header>
  );
}
