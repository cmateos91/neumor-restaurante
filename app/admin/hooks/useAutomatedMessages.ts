import { useState, useEffect, useCallback } from 'react';
import type {
  AutomatedMessage,
  AutomatedMessageInput,
  MessageTrigger,
  MessageChannel,
  MessageVariable
} from '@/lib/integrations.types';

interface UseAutomatedMessagesOptions {
  sitioId: string | null;
  autoLoad?: boolean;
}

interface MessageFilters {
  trigger?: MessageTrigger;
  channel?: MessageChannel;
  enabled?: boolean;
}

export function useAutomatedMessages({ sitioId, autoLoad = true }: UseAutomatedMessagesOptions) {
  const [messages, setMessages] = useState<AutomatedMessage[]>([]);
  const [variables, setVariables] = useState<Record<MessageTrigger, MessageVariable[]>>({} as Record<MessageTrigger, MessageVariable[]>);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<MessageFilters>({});

  // Cargar mensajes
  const loadMessages = useCallback(async (customFilters?: MessageFilters) => {
    if (!sitioId) return;

    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams({ sitio_id: sitioId });
      const activeFilters = customFilters || filters;

      if (activeFilters.trigger) params.set('trigger', activeFilters.trigger);
      if (activeFilters.channel) params.set('channel', activeFilters.channel);
      if (activeFilters.enabled !== undefined) params.set('enabled', String(activeFilters.enabled));

      const response = await fetch(`/api/automations/messages?${params}`);
      const data = await response.json();

      if (!response.ok) throw new Error(data.error);

      setMessages(data.messages || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error cargando mensajes');
    } finally {
      setLoading(false);
    }
  }, [sitioId, filters]);

  // Cargar variables disponibles
  const loadVariables = useCallback(async () => {
    try {
      const response = await fetch('/api/automations/messages/variables');
      const data = await response.json();

      if (!response.ok) throw new Error(data.error);

      setVariables(data.variables || {});
    } catch (err) {
      console.error('Error cargando variables:', err);
    }
  }, []);

  // Crear mensaje
  const createMessage = useCallback(async (input: AutomatedMessageInput): Promise<AutomatedMessage | null> => {
    if (!sitioId) return null;

    setError(null);

    try {
      const response = await fetch('/api/automations/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...input, sitio_id: sitioId })
      });

      const data = await response.json();

      if (!response.ok) throw new Error(data.error);

      // Recargar lista
      await loadMessages();

      return data.message;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error creando mensaje');
      return null;
    }
  }, [sitioId, loadMessages]);

  // Actualizar mensaje
  const updateMessage = useCallback(async (id: string, input: Partial<AutomatedMessageInput>): Promise<AutomatedMessage | null> => {
    setError(null);

    try {
      const response = await fetch(`/api/automations/messages/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(input)
      });

      const data = await response.json();

      if (!response.ok) throw new Error(data.error);

      // Actualizar en la lista local
      setMessages(prev => prev.map(m => m.id === id ? data.message : m));

      return data.message;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error actualizando mensaje');
      return null;
    }
  }, []);

  // Eliminar mensaje
  const deleteMessage = useCallback(async (id: string): Promise<boolean> => {
    setError(null);

    try {
      const response = await fetch(`/api/automations/messages/${id}`, {
        method: 'DELETE'
      });

      const data = await response.json();

      if (!response.ok) throw new Error(data.error);

      // Eliminar de la lista local
      setMessages(prev => prev.filter(m => m.id !== id));

      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error eliminando mensaje');
      return false;
    }
  }, []);

  // Toggle enabled
  const toggleEnabled = useCallback(async (id: string): Promise<boolean> => {
    const message = messages.find(m => m.id === id);
    if (!message) return false;

    const result = await updateMessage(id, { enabled: !message.enabled });
    return result !== null;
  }, [messages, updateMessage]);

  // Obtener variables para un trigger
  const getVariablesForTrigger = useCallback((trigger: MessageTrigger): MessageVariable[] => {
    return variables[trigger] || [];
  }, [variables]);

  // Cargar datos iniciales
  useEffect(() => {
    if (autoLoad && sitioId) {
      loadMessages();
      loadVariables();
    }
  }, [autoLoad, sitioId, loadMessages, loadVariables]);

  return {
    // Estado
    messages,
    variables,
    loading,
    error,
    filters,

    // Acciones
    loadMessages,
    createMessage,
    updateMessage,
    deleteMessage,
    toggleEnabled,
    setFilters,
    getVariablesForTrigger,

    // Helpers
    messagesByTrigger: messages.reduce((acc, m) => {
      if (!acc[m.trigger]) acc[m.trigger] = [];
      acc[m.trigger].push(m);
      return acc;
    }, {} as Record<MessageTrigger, AutomatedMessage[]>),

    messagesByChannel: messages.reduce((acc, m) => {
      if (!acc[m.channel]) acc[m.channel] = [];
      acc[m.channel].push(m);
      return acc;
    }, {} as Record<MessageChannel, AutomatedMessage[]>),

    enabledCount: messages.filter(m => m.enabled).length,
    totalCount: messages.length
  };
}
