'use client';

import React from 'react';
import { Plus, Trash2, Eye, RefreshCw, Image } from 'lucide-react';
import { SitioGaleria } from '@/lib/database.types';

interface GaleriaTabProps {
  sitio: { id: string } | null;
  galeria: SitioGaleria[];
  onAddItem: (url: string) => Promise<boolean>;
  onToggleHome: (id: string, current: boolean) => void;
  onUpdateItem: (id: string, field: string, value: string) => void;
  onDeleteItem: (id: string) => Promise<boolean>;
  onRefresh: () => void;
  // Dialog functions
  promptUrl: (title: string) => Promise<string | null>;
  confirmDelete: (itemName: string) => Promise<boolean>;
}

export function GaleriaTab({
  sitio,
  galeria,
  onAddItem,
  onToggleHome,
  onUpdateItem,
  onDeleteItem,
  onRefresh,
  promptUrl,
  confirmDelete
}: GaleriaTabProps) {
  const handleAddItem = async () => {
    const url = await promptUrl('Nueva imagen');
    if (url) {
      await onAddItem(url);
    }
  };

  const handleDeleteItem = async (item: SitioGaleria) => {
    const confirmed = await confirmDelete(item.titulo || 'esta imagen');
    if (confirmed) {
      await onDeleteItem(item.id);
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
        onClick={handleAddItem}
        disabled={!sitio}
        className={`neuro-btn w-full flex items-center justify-center gap-2 text-sm ${!sitio ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
        <Plus className="w-4 h-4" />
        Agregar imagen
      </button>

      <div className="space-y-3">
        {galeria.map(img => (
          <div key={img.id} className="neuro-card-sm p-3 space-y-2">
            <div className="flex gap-3">
              <div className="w-20 h-20 rounded-lg overflow-hidden neuro-inset flex-shrink-0">
                <img src={img.url} alt="" className="w-full h-full object-cover" />
              </div>
              <div className="flex-1 space-y-2">
                <input
                  type="text"
                  value={img.titulo || ''}
                  onChange={(e) => onUpdateItem(img.id, 'titulo', e.target.value)}
                  className="neuro-input text-sm w-full"
                  placeholder="Titulo de la imagen"
                />
                <input
                  type="text"
                  value={img.url}
                  onChange={(e) => onUpdateItem(img.id, 'url', e.target.value)}
                  className="neuro-input text-xs w-full font-mono"
                  placeholder="URL de la imagen"
                />
              </div>
            </div>
            <div className="flex items-center justify-between">
              <button
                onClick={() => onToggleHome(img.id, img.es_home)}
                className={`text-xs px-3 py-1 rounded-lg flex items-center gap-1 cursor-pointer ${
                  img.es_home
                    ? 'bg-[#d4af37] text-white'
                    : 'neuro-flat text-gray-600'
                }`}
              >
                <Eye className="w-3 h-3" />
                {img.es_home ? 'Visible en Home' : 'Mostrar en Home'}
              </button>
              <button
                onClick={() => handleDeleteItem(img)}
                className="text-red-400 hover:text-red-600 p-1 cursor-pointer"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {galeria.length === 0 && sitio && (
        <div className="neuro-card-sm p-8 text-center">
          <Image className="w-12 h-12 mx-auto mb-3 text-gray-300" />
          <p className="text-gray-500 mb-2">No hay imagenes en la galeria</p>
          <p className="text-gray-400 text-xs">Haz clic en "Agregar imagen" para comenzar</p>
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

export default GaleriaTab;
