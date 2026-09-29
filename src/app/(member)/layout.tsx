import React from 'react';
import { AppNavigation } from '@/components/navigation';
import { PWAInstallPrompt } from '@/components/pwa-install-prompt';
import { CURRENT_USER } from '@/lib/data';

export default function MemberLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground transition-colors pb-16 md:pb-0">
      <PWAInstallPrompt />
      <AppNavigation user={CURRENT_USER} />
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-6 animate-in fade-in duration-300">
        {children}
      </main>
    </div>
  );
}
