'use client';

import { useState, useCallback } from 'react';
import { ConfirmVariant } from '../components/ui/ConfirmDialog';

// ===== CONFIRM DIALOG =====

export interface ConfirmDialogState {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText: string;
  cancelText: string;
  variant: ConfirmVariant;
  onConfirm: () => void;
}

const defaultConfirmState: ConfirmDialogState = {
  isOpen: false,
  title: '',
  message: '',
  confirmText: 'Confirmar',
  cancelText: 'Cancelar',
  variant: 'question',
  onConfirm: () => {}
};

export interface ConfirmOptions {
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: ConfirmVariant;
}

export function useConfirmDialog() {
  const [state, setState] = useState<ConfirmDialogState>(defaultConfirmState);

  const confirm = useCallback((options: ConfirmOptions): Promise<boolean> => {
    return new Promise((resolve) => {
      setState({
        isOpen: true,
        title: options.title,
        message: options.message,
        confirmText: options.confirmText || 'Confirmar',
        cancelText: options.cancelText || 'Cancelar',
        variant: options.variant || 'question',
        onConfirm: () => {
          setState(prev => ({ ...prev, isOpen: false }));
          resolve(true);
        }
      });
    });
  }, []);

  const close = useCallback(() => {
    setState(prev => ({ ...prev, isOpen: false }));
  }, []);

  // Atajos para variantes comunes
  const confirmDelete = useCallback((itemName: string): Promise<boolean> => {
    return confirm({
      title: 'Eliminar elemento',
      message: `¿Estas seguro de eliminar "${itemName}"? Esta accion no se puede deshacer.`,
      confirmText: 'Eliminar',
      variant: 'danger'
    });
  }, [confirm]);

  return {
    state,
    confirm,
    confirmDelete,
    close
  };
}

// ===== INPUT DIALOG =====

export interface InputDialogState {
  isOpen: boolean;
  title: string;
  message: string;
  placeholder: string;
  defaultValue: string;
  confirmText: string;
  cancelText: string;
  inputType: 'text' | 'url' | 'email' | 'number';
  required: boolean;
  onConfirm: (value: string) => void;
}

const defaultInputState: InputDialogState = {
  isOpen: false,
  title: '',
  message: '',
  placeholder: '',
  defaultValue: '',
  confirmText: 'Aceptar',
  cancelText: 'Cancelar',
  inputType: 'text',
  required: true,
  onConfirm: () => {}
};

export interface InputOptions {
  title: string;
  message?: string;
  placeholder?: string;
  defaultValue?: string;
  confirmText?: string;
  cancelText?: string;
  inputType?: 'text' | 'url' | 'email' | 'number';
  required?: boolean;
}

export function useInputDialog() {
  const [state, setState] = useState<InputDialogState>(defaultInputState);

  const prompt = useCallback((options: InputOptions): Promise<string | null> => {
    return new Promise((resolve) => {
      setState({
        isOpen: true,
        title: options.title,
        message: options.message || '',
        placeholder: options.placeholder || '',
        defaultValue: options.defaultValue || '',
        confirmText: options.confirmText || 'Aceptar',
        cancelText: options.cancelText || 'Cancelar',
        inputType: options.inputType || 'text',
        required: options.required !== false,
        onConfirm: (value: string) => {
          setState(prev => ({ ...prev, isOpen: false }));
          resolve(value);
        }
      });
    });
  }, []);

  const close = useCallback(() => {
    setState(prev => ({ ...prev, isOpen: false }));
  }, []);

  // Atajos comunes
  const promptText = useCallback((title: string, placeholder?: string): Promise<string | null> => {
    return prompt({ title, placeholder });
  }, [prompt]);

  const promptUrl = useCallback((title: string): Promise<string | null> => {
    return prompt({
      title,
      placeholder: 'https://...',
      inputType: 'url'
    });
  }, [prompt]);

  return {
    state,
    prompt,
    promptText,
    promptUrl,
    close
  };
}

// ===== COMBINED HOOK =====

export function useDialogs() {
  const confirmDialog = useConfirmDialog();
  const inputDialog = useInputDialog();

  return {
    // Confirm dialog
    confirmState: confirmDialog.state,
    confirm: confirmDialog.confirm,
    confirmDelete: confirmDialog.confirmDelete,
    closeConfirm: confirmDialog.close,

    // Input dialog
    inputState: inputDialog.state,
    prompt: inputDialog.prompt,
    promptText: inputDialog.promptText,
    promptUrl: inputDialog.promptUrl,
    closeInput: inputDialog.close
  };
}
