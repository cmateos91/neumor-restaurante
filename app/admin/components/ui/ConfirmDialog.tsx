'use client';

import React from 'react';
import { AlertTriangle, Trash2, Info, HelpCircle, type LucideIcon } from 'lucide-react';
import { Modal } from './Modal';

export type ConfirmVariant = 'danger' | 'warning' | 'info' | 'question';

export interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: ConfirmVariant;
  loading?: boolean;
}

const variantConfig: Record<ConfirmVariant, {
  icon: LucideIcon;
  iconBg: string;
  iconColor: string;
  confirmBtnClass: string;
}> = {
  danger: {
    icon: Trash2,
    iconBg: 'bg-red-100',
    iconColor: 'text-red-600',
    confirmBtnClass: 'bg-red-500 hover:bg-red-600 text-white'
  },
  warning: {
    icon: AlertTriangle,
    iconBg: 'bg-amber-100',
    iconColor: 'text-amber-600',
    confirmBtnClass: 'bg-amber-500 hover:bg-amber-600 text-white'
  },
  info: {
    icon: Info,
    iconBg: 'bg-blue-100',
    iconColor: 'text-blue-600',
    confirmBtnClass: 'neuro-btn-primary'
  },
  question: {
    icon: HelpCircle,
    iconBg: 'bg-gray-100',
    iconColor: 'text-gray-600',
    confirmBtnClass: 'neuro-btn-primary'
  }
};

export function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirmar',
  cancelText = 'Cancelar',
  variant = 'question',
  loading = false
}: ConfirmDialogProps) {
  const config = variantConfig[variant];
  const Icon = config.icon;

  const handleConfirm = () => {
    onConfirm();
    if (!loading) {
      onClose();
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="sm"
      showCloseButton={false}
      closeOnOverlay={!loading}
      closeOnEscape={!loading}
    >
      <div className="text-center">
        {/* Icon */}
        <div className={`w-14 h-14 mx-auto mb-4 rounded-full flex items-center justify-center ${config.iconBg}`}>
          <Icon className={`w-7 h-7 ${config.iconColor}`} />
        </div>

        {/* Title */}
        <h3 className="text-lg font-semibold text-gray-800 mb-2">{title}</h3>

        {/* Message */}
        <p className="text-gray-500 text-sm mb-6">{message}</p>

        {/* Buttons */}
        <div className="flex gap-3">
          <button
            onClick={onClose}
            disabled={loading}
            className="flex-1 neuro-btn py-2.5 text-gray-600 font-medium disabled:opacity-50"
          >
            {cancelText}
          </button>
          <button
            onClick={handleConfirm}
            disabled={loading}
            className={`flex-1 neuro-btn py-2.5 font-medium disabled:opacity-50 ${config.confirmBtnClass}`}
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Procesando...
              </span>
            ) : (
              confirmText
            )}
          </button>
        </div>
      </div>
    </Modal>
  );
}

export default ConfirmDialog;
