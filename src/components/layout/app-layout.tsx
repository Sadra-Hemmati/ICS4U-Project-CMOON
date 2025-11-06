'use client';
import { AppHeader } from './header';
import { ParticleBackground } from './particle-background';
import { BottomNav } from './bottom-nav';

export function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative flex min-h-screen flex-col">
      <ParticleBackground />
      <div className="flex-1 flex flex-col z-10">
        <AppHeader />
        <main className="flex-1 pb-20">{children}</main>
      </div>
      <BottomNav />
    </div>
  );
}
