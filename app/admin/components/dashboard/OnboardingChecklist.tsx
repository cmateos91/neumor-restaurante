'use client';

import React from 'react';
import { Check, Circle, ChevronRight, Sparkles } from 'lucide-react';

export interface ChecklistItem {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  action?: () => void;
}

interface OnboardingChecklistProps {
  items: ChecklistItem[];
  onItemClick?: (item: ChecklistItem) => void;
}

export function OnboardingChecklist({ items, onItemClick }: OnboardingChecklistProps) {
  const completedCount = items.filter(i => i.completed).length;
  const progress = (completedCount / items.length) * 100;

  return (
    <div className="neuro-card p-5">
      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 rounded-xl bg-[#d4af37]/10">
          <Sparkles className="w-5 h-5 text-[#d4af37]" />
        </div>
        <div className="flex-1">
          <h3 className="font-semibold text-gray-700">Onboarding Checklist</h3>
          <p className="text-sm text-gray-500">
            {completedCount} de {items.length} completados
          </p>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-5">
        <div className="neuro-inset h-2 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-[#d4af37] to-[#e0ba3d] rounded-full transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Checklist Items */}
      <div className="space-y-2">
        {items.map((item) => (
          <button
            key={item.id}
            onClick={() => onItemClick?.(item)}
            className={`w-full neuro-card-sm p-3 flex items-center gap-3 transition-all hover:scale-[1.01] ${
              item.completed ? 'opacity-60' : ''
            }`}
          >
            <div className={`w-6 h-6 rounded-full flex items-center justify-center transition-all ${
              item.completed
                ? 'bg-green-100 text-green-500'
                : 'neuro-inset text-gray-400'
            }`}>
              {item.completed ? (
                <Check className="w-4 h-4" />
              ) : (
                <Circle className="w-4 h-4" />
              )}
            </div>
            <div className="flex-1 text-left">
              <p className={`text-sm font-medium ${
                item.completed ? 'text-gray-400 line-through' : 'text-gray-700'
              }`}>
                {item.title}
              </p>
              <p className="text-xs text-gray-400">{item.description}</p>
            </div>
            {!item.completed && (
              <ChevronRight className="w-4 h-4 text-gray-400" />
            )}
          </button>
        ))}
      </div>
    </div>
  );
}

export default OnboardingChecklist;
