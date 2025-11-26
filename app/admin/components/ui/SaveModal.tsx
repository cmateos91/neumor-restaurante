'use client';

import React from 'react';
import { X, Upload, Loader2 } from 'lucide-react';

interface SaveModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  saving: boolean;
}

export function SaveModal({ isOpen, onClose, onConfirm, saving }: SaveModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black/30 backdrop-blur-sm cursor-pointer"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative neuro-card p-8 max-w-md w-full mx-4 animate-fadeIn">
        {/* Boton cerrar */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Icono */}
        <div className="neuro-inset w-16 h-16 rounded-full mx-auto mb-6 flex items-center justify-center">
          <Upload className="w-8 h-8 text-[#d4af37]" />
        </div>

        {/* Contenido */}
        <h3 className="text-xl font-bold text-gray-700 text-center mb-2">
          Publicar cambios
        </h3>
        <p className="text-gray-500 text-center mb-8">
          Los cambios se guardaran y seran visibles en la web publica. ¿Deseas continuar?
        </p>

        {/* Botones */}
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 neuro-btn py-3 text-gray-600 font-medium"
            disabled={saving}
          >
            Cancelar
          </button>
          <button
            onClick={onConfirm}
            disabled={saving}
            className="flex-1 neuro-btn neuro-btn-primary py-3 font-medium flex items-center justify-center gap-2"
          >
            {saving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Publicando...
              </>
            ) : (
              <>
                <Upload className="w-4 h-4" />
                Publicar
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

export default SaveModal;
