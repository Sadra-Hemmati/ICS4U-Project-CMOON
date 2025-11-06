'use client';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import { AppSidebar } from './sidebar';
import { AppHeader } from './header';
import { ParticleBackground } from './particle-background';

export function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
        <div className="relative flex min-h-screen">
          <ParticleBackground />
          <AppSidebar />
          <div className="flex-1 flex flex-col z-10">
            <AppHeader />
            <main className="flex-1">
              {children}
            </main>
          </div>
        </div>
    </SidebarProvider>
  );
}
