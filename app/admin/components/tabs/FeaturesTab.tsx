'use client';

import React from 'react';
import {
  Plus, Trash2, RefreshCw, Sparkles,
  ChefHat, Award, Clock, MapPin, UtensilsCrossed, Wine, Star, Heart,
  Users, Leaf, Flame, Coffee,
  type LucideIcon
} from 'lucide-react';
import { SitioFeature } from '@/lib/database.types';

// Iconos disponibles para features
const availableIcons: { name: string; icon: LucideIcon }[] = [
  { name: 'ChefHat', icon: ChefHat },
  { name: 'Award', icon: Award },
  { name: 'Clock', icon: Clock },
  { name: 'MapPin', icon: MapPin },
  { name: 'UtensilsCrossed', icon: UtensilsCrossed },
  { name: 'Wine', icon: Wine },
  { name: 'Star', icon: Star },
  { name: 'Heart', icon: Heart },
  { name: 'Users', icon: Users },
  { name: 'Leaf', icon: Leaf },
  { name: 'Flame', icon: Flame },
  { name: 'Coffee', icon: Coffee },
  { name: 'Sparkles', icon: Sparkles }
];

const getIconByName = (name: string): LucideIcon => {
  return availableIcons.find(i => i.name === name)?.icon || Star;
};

interface FeaturesTabProps {
  sitio: { id: string } | null;
  features: SitioFeature[];
  onAddFeature: () => Promise<boolean>;
  onUpdateFeature: (id: string, field: string, value: string) => void;
  onDeleteFeature: (id: string) => Promise<boolean>;
  onRefresh: () => void;
  // Dialog function
  confirmDelete: (itemName: string) => Promise<boolean>;
}

export function FeaturesTab({
  sitio,
  features,
  onAddFeature,
  onUpdateFeature,
  onDeleteFeature,
  onRefresh,
  confirmDelete
}: FeaturesTabProps) {
  const handleDeleteFeature = async (feature: SitioFeature) => {
    const confirmed = await confirmDelete(feature.titulo);
    if (confirmed) {
      await onDeleteFeature(feature.id);
    }
  };

  return (
    <div className="space-y-4 animate-fadeIn">
      {!sitio && (
        <div className="neuro-card-sm p-4 text-center text-amber-600 text-sm">
          Primero debes crear un restaurante en la seccion "Info"
        </div>
      )}

      <button
        onClick={onAddFeature}
        disabled={!sitio}
        className={`neuro-btn w-full flex items-center justify-center gap-2 text-sm ${!sitio ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
        <Plus className="w-4 h-4" />
        Nueva caracteristica
      </button>

      {features.map(feat => {
        const IconComponent = getIconByName(feat.icono);
        return (
          <div key={feat.id} className="neuro-card-sm p-4 space-y-3">
            <div className="flex items-center gap-2">
              <div className="neuro-pressed rounded-lg p-2 flex-shrink-0">
                <IconComponent className="w-5 h-5 text-[#d4af37]" />
              </div>
              <input
                type="text"
                value={feat.titulo}
                onChange={(e) => onUpdateFeature(feat.id, 'titulo', e.target.value)}
                className="neuro-input text-sm flex-1"
                placeholder="Titulo"
              />
              <button
                onClick={() => handleDeleteFeature(feat)}
                className="text-red-400 hover:text-red-600 cursor-pointer"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
            <textarea
              value={feat.descripcion || ''}
              onChange={(e) => onUpdateFeature(feat.id, 'descripcion', e.target.value)}
              className="neuro-input text-sm resize-none"
              rows={2}
              placeholder="Descripcion"
            />
            {/* Selector de icono */}
            <div>
              <label className="text-xs text-gray-500 mb-2 block">Icono</label>
              <div className="flex flex-wrap gap-1">
                {availableIcons.map(({ name, icon: Icon }) => (
                  <button
                    key={name}
                    onClick={() => onUpdateFeature(feat.id, 'icono', name)}
                    className={`p-2 rounded-lg transition-all cursor-pointer ${
                      feat.icono === name
                        ? 'neuro-pressed text-[#d4af37]'
                        : 'neuro-flat text-gray-500 hover:text-gray-700'
                    }`}
                    title={name}
                  >
                    <Icon className="w-4 h-4" />
                  </button>
                ))}
              </div>
            </div>
          </div>
        );
      })}

      {features.length === 0 && sitio && (
        <div className="neuro-card-sm p-8 text-center">
          <Sparkles className="w-12 h-12 mx-auto mb-3 text-gray-300" />
          <p className="text-gray-500 mb-2">No hay caracteristicas</p>
          <p className="text-gray-400 text-xs">Haz clic en "Nueva caracteristica" para comenzar</p>
        </div>
      )}

      <button
        onClick={onRefresh}
        className="neuro-btn w-full flex items-center justify-center gap-2 text-sm"
      >
        <RefreshCw className="w-4 h-4" />
        Actualizar preview
      </button>
    </div>
  );
}

export default FeaturesTab;
