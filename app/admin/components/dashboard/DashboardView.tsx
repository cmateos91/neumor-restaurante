'use client';

import React from 'react';
import { StatsCards, StatData } from './StatsCards';
import { OnboardingChecklist, ChecklistItem } from './OnboardingChecklist';
import { ActivityFeed, ActivityItem } from './ActivityFeed';
import { LeadsTable, Lead } from './LeadsTable';

interface DashboardViewProps {
  stats: StatData[];
  checklistItems: ChecklistItem[];
  activities: ActivityItem[];
  leads: Lead[];
  onChecklistItemClick?: (item: ChecklistItem) => void;
  onActivityClick?: (activity: ActivityItem) => void;
  onLeadClick?: (lead: Lead) => void;
}

export function DashboardView({
  stats,
  checklistItems,
  activities,
  leads,
  onChecklistItemClick,
  onActivityClick,
  onLeadClick
}: DashboardViewProps) {
  return (
    <div className="flex-1 overflow-y-auto neuro-scroll p-1">
      <div className="max-w-7xl mx-auto space-y-6 animate-fadeIn">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-700 mb-1">Dashboard</h1>
          <p className="text-gray-500">Resumen de actividad y gestion de leads</p>
        </div>

        {/* Stats Cards */}
        <StatsCards stats={stats} />

        {/* Main Grid: Leads + Sidebar */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Leads Table - Takes 2 columns */}
          <div className="lg:col-span-2">
            <LeadsTable leads={leads} onLeadClick={onLeadClick} />
          </div>

          {/* Sidebar - Takes 1 column */}
          <div className="space-y-6">
            {/* Onboarding Checklist */}
            <OnboardingChecklist
              items={checklistItems}
              onItemClick={onChecklistItemClick}
            />

            {/* Activity Feed */}
            <ActivityFeed
              activities={activities}
              onActivityClick={onActivityClick}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default DashboardView;
