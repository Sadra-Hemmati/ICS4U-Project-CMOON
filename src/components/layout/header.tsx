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
          <path d="M5 12V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v7" />
          <path d="M5 12H3.5a1.5 1.5 0 0 0 0 3H5" />
          <path d="M19 12h1.5a1.5 1.5 0 0 1 0 3H19" />
          <path d="M12 12v7" />
          <path d="M9 20h6" />
        </svg>
        <h1 className="text-xl font-semibold">TaskZen</h1>
      </Link>
      <PanicButton />
    </header>
  );
}
