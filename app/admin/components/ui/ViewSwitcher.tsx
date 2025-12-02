'use client';

import React from 'react';
import { LayoutDashboard, Pencil } from 'lucide-react';

export type AdminView = 'editor' | 'dashboard';

interface ViewSwitcherProps {
  currentView: AdminView;
  onViewChange: (view: AdminView) => void;
}

export function ViewSwitcher({ currentView, onViewChange }: ViewSwitcherProps) {
  return (
    <div className="neuro-card-sm flex p-1 gap-1">
      <button
        onClick={() => onViewChange('editor')}
        className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-all duration-300 ${
          currentView === 'editor'
            ? 'neuro-tab active'
            : 'text-gray-400 hover:text-gray-600'
        }`}
        title="Editor Visual"
      >
        <Pencil className="w-4 h-4" />
        <span className="text-sm font-medium">Editor</span>
      </button>
      <button
        onClick={() => onViewChange('dashboard')}
        className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-all duration-300 ${
          currentView === 'dashboard'
            ? 'neuro-tab active'
            : 'text-gray-400 hover:text-gray-600'
        }`}
        title="Dashboard de Leads"
      >
        <LayoutDashboard className="w-4 h-4" />
        <span className="text-sm font-medium">Dashboard</span>
      </button>
    </div>
  );
}

export default ViewSwitcher;
