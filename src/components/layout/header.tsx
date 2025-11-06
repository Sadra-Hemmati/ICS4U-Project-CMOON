'use client';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { useSidebar } from '@/components/ui/sidebar';
import { PanicButton } from '@/components/panic-button';
import { usePathname } from 'next/navigation';

export function AppHeader() {
  const { isMobile } = useSidebar();
  const pathname = usePathname();

  const getTitle = () => {
    switch (pathname) {
      case '/':
        return 'Dashboard';
      case '/calendar':
        return 'Calendar';
      case '/chatbot':
        return 'Chatbot';
      default:
        return 'TaskZen';
    }
  };

  return (
    <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b bg-background/80 backdrop-blur-sm px-4 md:px-6">
      {isMobile && <SidebarTrigger />}
      <h1 className="text-xl font-semibold">{getTitle()}</h1>
      <div className="ml-auto">
        <PanicButton />
      </div>
    </header>
  );
}
