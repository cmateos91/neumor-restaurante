'use client';

import React from 'react';
import { CheckCircle, XCircle, AlertCircle, Info, X } from 'lucide-react';
import { Message } from '../../hooks/useAdminUI';

interface MessageToastProps {
  message: Message | null;
  onClose?: () => void;
}

const iconMap = {
  success: CheckCircle,
  error: XCircle,
  warning: AlertCircle,
  info: Info
};

const styleMap = {
  success: {
    bg: 'bg-green-50',
    border: 'border-green-200',
    icon: 'text-green-600',
    text: 'text-green-800'
  },
  error: {
    bg: 'bg-red-50',
    border: 'border-red-200',
    icon: 'text-red-600',
    text: 'text-red-800'
  },
  warning: {
    bg: 'bg-amber-50',
    border: 'border-amber-200',
    icon: 'text-amber-600',
    text: 'text-amber-800'
  },
  info: {
    bg: 'bg-blue-50',
    border: 'border-blue-200',
    icon: 'text-blue-600',
    text: 'text-blue-800'
  }
};

export function MessageToast({ message, onClose }: MessageToastProps) {
  if (!message) return null;

  const Icon = iconMap[message.type];
  const style = styleMap[message.type];

  return (
    <div
      className={`fixed top-20 right-8 z-50 px-4 py-3 rounded-xl border shadow-lg animate-toastIn flex items-center gap-3 ${style.bg} ${style.border}`}
    >
      <Icon className={`w-5 h-5 flex-shrink-0 ${style.icon}`} />
      <span className={`text-sm font-medium ${style.text}`}>{message.text}</span>
      {onClose && (
        <button
          onClick={onClose}
          className={`ml-2 p-0.5 rounded hover:bg-black/5 transition-colors ${style.icon}`}
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}

export default MessageToast;
