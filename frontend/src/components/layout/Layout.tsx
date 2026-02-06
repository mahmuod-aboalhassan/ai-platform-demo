import React from 'react';
import { Sidebar } from './Sidebar';
import { MainContent } from './MainContent';
import { useUrlSync } from '../../hooks/useUrlSync';

export function Layout() {
  // Sync URL params with app state
  useUrlSync();

  return (
    <div className="flex h-dvh bg-slate-50">
      <Sidebar />
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        <MainContent />
      </div>
    </div>
  );
}

