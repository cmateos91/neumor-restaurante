'use client';

import React from 'react';
import { Check, Palette, Moon, Sun, Monitor } from 'lucide-react';

interface ThemeOption {
  id: string;
  name: string;
  type: 'light' | 'dark';
  previewColor: string;
}

const themes: ThemeOption[] = [
  { id: 'soft-light', name: 'Neumo Soft (Día)', type: 'light', previewColor: '#e6e6e6' },
  { id: 'soft-dark', name: 'Neumo Soft (Noche)', type: 'dark', previewColor: '#2d2d2d' },
  { id: 'vibrant-light', name: 'Vibrant (Día)', type: 'light', previewColor: '#EEF2F6' },
  { id: 'vibrant-dark', name: 'Vibrant (Noche)', type: 'dark', previewColor: '#111827' },
  { id: 'glass-light', name: 'Glass (Cristal)', type: 'light', previewColor: '#e0e5ec' },
  { id: 'glass-dark', name: 'Glass (Onyx)', type: 'dark', previewColor: '#161616' },
];

interface DesignTabProps {
  currentTheme: string;
  onUpdateTheme: (themeId: string) => void;
  onRefresh: () => void;
}

export function DesignTab({ currentTheme, onUpdateTheme, onRefresh }: DesignTabProps) {
  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="neuro-card-sm p-5">
        <div className="flex items-center gap-2 mb-4">
          <Palette className="w-5 h-5 text-[#d4af37]" />
          <h3 className="font-semibold text-gray-700">Estilo Visual</h3>
        </div>
        
        <p className="text-sm text-gray-500 mb-6">
          Selecciona el tema que mejor se adapte a la identidad de tu restaurante.
          Los cambios se reflejarán inmediatamente en la vista previa.
        </p>

        <div className="grid grid-cols-2 gap-4">
          {themes.map((theme) => (
            <button
              key={theme.id}
              onClick={() => onUpdateTheme(theme.id)}
              className={`
                relative group flex flex-col items-center gap-3 p-4 rounded-xl transition-all
                ${currentTheme === theme.id 
                  ? 'neuro-pressed ring-2 ring-[#d4af37] ring-offset-2 ring-offset-[#e0e0e0]' 
                  : 'neuro-flat hover:scale-[1.02]'
                }
              `}
            >
              {/* Preview Circle */}
              <div 
                className="w-16 h-16 rounded-full shadow-inner flex items-center justify-center border border-gray-100/10"
                style={{ backgroundColor: theme.previewColor }}
              >
                {theme.type === 'light' ? (
                  <Sun className="w-6 h-6 text-gray-400" />
                ) : (
                  <Moon className="w-6 h-6 text-white" />
                )}
              </div>

              <span className="text-sm font-medium text-gray-600 group-hover:text-gray-800">
                {theme.name}
              </span>

              {currentTheme === theme.id && (
                <div className="absolute top-2 right-2 bg-[#d4af37] text-white p-1 rounded-full">
                  <Check className="w-3 h-3" />
                </div>
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}