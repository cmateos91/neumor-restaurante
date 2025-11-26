'use client';

import React from 'react';
import { CheckCircle, XCircle, AlertCircle, Info } from 'lucide-react';
import { Message } from '../../hooks/useAdminUI';

interface MessageToastProps {
  message: Message | null;
}

const iconMap = {
  success: CheckCircle,
  error: XCircle,
  warning: AlertCircle,
  info: Info
};

const colorMap = {
  success: 'text-green-600',
  error: 'text-red-600',
  warning: 'text-amber-600',
  info: 'text-blue-600'
};

export function MessageToast({ message }: MessageToastProps) {
  if (!message) return null;

  const Icon = iconMap[message.type];
  const colorClass = colorMap[message.type];

  return (
    <div className={`fixed top-20 right-8 z-50 neuro-card px-4 py-3 animate-fadeIn flex items-center gap-3 ${colorClass}`}>
      <Icon className="w-5 h-5 flex-shrink-0" />
      <span>{message.text}</span>
    </div>
  );
}

export default MessageToast;
