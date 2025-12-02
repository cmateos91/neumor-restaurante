'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  getLeads,
  getDashboardStats,
  getActivities,
  updateLead,
  createLead,
  deleteLead,
  markActivitiesAsRead,
  type LeadsFilters
} from '@/lib/services/leads';
import type {
  Lead,
  LeadStatus,
  Activity,
  DashboardStats
} from '@/lib/integrations.types';

// Importar ChecklistItem desde el componente UI
import type { ChecklistItem as UIChecklistItem } from '../components/dashboard/OnboardingChecklist';

interface UseDashboardDataOptions {
  sitioId?: string;
  autoRefresh?: boolean;
  refreshInterval?: number; // ms
}

interface UseDashboardDataReturn {
  // Estado
  loading: boolean;
  error: string | null;

  // Datos
  stats: DashboardStats | null;
  leads: Lead[];
  activities: Activity[];
  unreadCount: number;
  checklistItems: UIChecklistItem[];

  // Paginacion de leads
  leadsPage: number;
  leadsTotalPages: number;
  leadsTotal: number;

  // Acciones
  refreshAll: () => Promise<void>;
  refreshStats: () => Promise<void>;
  refreshLeads: (filters?: LeadsFilters) => Promise<void>;
  refreshActivities: () => Promise<void>;

  // CRUD de leads
  addLead: (data: Parameters<typeof createLead>[0]) => Promise<Lead | null>;
  editLead: (id: string, data: Parameters<typeof updateLead>[1]) => Promise<Lead | null>;
  removeLead: (id: string) => Promise<boolean>;
  changeStatus: (id: string, status: LeadStatus) => Promise<Lead | null>;

  // Actividades
  markAsRead: (activityIds?: string[], markAll?: boolean) => Promise<void>;

  // Filtros
  setLeadsFilters: (filters: LeadsFilters) => void;
  leadsFilters: LeadsFilters;
}

export function useDashboardData(options: UseDashboardDataOptions = {}): UseDashboardDataReturn {
  const { sitioId, autoRefresh = false, refreshInterval = 60000 } = options;

  // Estados principales
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Datos
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  // Paginacion
  const [leadsPage, setLeadsPage] = useState(1);
  const [leadsTotalPages, setLeadsTotalPages] = useState(1);
  const [leadsTotal, setLeadsTotal] = useState(0);

  // Filtros
  const [leadsFilters, setLeadsFilters] = useState<LeadsFilters>({
    sitio_id: sitioId,
    page: 1,
    limit: 10
  });

  // Checklist items (calculado basado en datos reales)
  const [checklistItems, setChecklistItems] = useState<UIChecklistItem[]>([]);

  // Refrescar estadisticas
  const refreshStats = useCallback(async () => {
    try {
      const data = await getDashboardStats(sitioId);
      setStats(data);
    } catch (err) {
      console.error('Error refreshing stats:', err);
    }
  }, [sitioId]);

  // Refrescar leads
  const refreshLeads = useCallback(async (filters?: LeadsFilters) => {
    try {
      const mergedFilters = { ...leadsFilters, ...filters, sitio_id: sitioId };
      const { leads: newLeads, pagination } = await getLeads(mergedFilters);

      setLeads(newLeads);
      setLeadsPage(pagination.page);
      setLeadsTotalPages(pagination.pages);
      setLeadsTotal(pagination.total);

      if (filters) {
        setLeadsFilters(mergedFilters);
      }
    } catch (err) {
      console.error('Error refreshing leads:', err);
    }
  }, [sitioId, leadsFilters]);

  // Refrescar actividades
  const refreshActivities = useCallback(async () => {
    try {
      const { activities: newActivities, unread_count } = await getActivities(sitioId, 20);
      setActivities(newActivities);
      setUnreadCount(unread_count);
    } catch (err) {
      console.error('Error refreshing activities:', err);
    }
  }, [sitioId]);

  // Refrescar todo
  const refreshAll = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      await Promise.all([
        refreshStats(),
        refreshLeads(),
        refreshActivities()
      ]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error loading data');
    } finally {
      setLoading(false);
    }
  }, [refreshStats, refreshLeads, refreshActivities]);

  // Agregar lead
  const addLead = useCallback(async (data: Parameters<typeof createLead>[0]): Promise<Lead | null> => {
    try {
      const lead = await createLead({ ...data, sitio_id: sitioId || data.sitio_id });
      await refreshLeads();
      await refreshStats();
      return lead;
    } catch (err) {
      console.error('Error adding lead:', err);
      return null;
    }
  }, [sitioId, refreshLeads, refreshStats]);

  // Editar lead
  const editLead = useCallback(async (
    id: string,
    data: Parameters<typeof updateLead>[1]
  ): Promise<Lead | null> => {
    try {
      const lead = await updateLead(id, data);
      await refreshLeads();
      if (data.status) {
        await refreshStats();
      }
      return lead;
    } catch (err) {
      console.error('Error editing lead:', err);
      return null;
    }
  }, [refreshLeads, refreshStats]);

  // Eliminar lead
  const removeLead = useCallback(async (id: string): Promise<boolean> => {
    try {
      await deleteLead(id);
      await refreshLeads();
      await refreshStats();
      return true;
    } catch (err) {
      console.error('Error removing lead:', err);
      return false;
    }
  }, [refreshLeads, refreshStats]);

  // Cambiar estado
  const changeStatus = useCallback(async (id: string, status: LeadStatus): Promise<Lead | null> => {
    return editLead(id, { status });
  }, [editLead]);

  // Marcar actividades como leidas
  const markAsRead = useCallback(async (activityIds?: string[], markAll?: boolean) => {
    try {
      await markActivitiesAsRead(activityIds, markAll, sitioId);
      await refreshActivities();
    } catch (err) {
      console.error('Error marking as read:', err);
    }
  }, [sitioId, refreshActivities]);

  // Calcular checklist basado en datos reales
  useEffect(() => {
    if (!stats) return;

    const items: UIChecklistItem[] = [
      {
        id: '1',
        title: 'Configura tu informacion basica',
        description: 'Nombre, direccion y horarios',
        completed: true // Asumimos que si hay sitio, esta completo
      },
      {
        id: '2',
        title: 'Conecta tus redes sociales',
        description: 'Instagram, Facebook, WhatsApp',
        completed: false // TODO: verificar integraciones
      },
      {
        id: '3',
        title: 'Configura automatizaciones',
        description: 'Respuestas automaticas con n8n',
        completed: false // TODO: verificar automations
      },
      {
        id: '4',
        title: 'Recibe tu primer lead',
        description: 'Captura leads desde tu web o redes',
        completed: stats.leads.total > 0
      },
      {
        id: '5',
        title: 'Convierte tu primer lead',
        description: 'Transforma un lead en cliente',
        completed: stats.leads.converted > 0
      }
    ];

    setChecklistItems(items);
  }, [stats]);

  // Carga inicial
  useEffect(() => {
    refreshAll();
  }, [refreshAll]);

  // Auto-refresh
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      refreshAll();
    }, refreshInterval);

    return () => clearInterval(interval);
  }, [autoRefresh, refreshInterval, refreshAll]);

  return {
    loading,
    error,
    stats,
    leads,
    activities,
    unreadCount,
    checklistItems,
    leadsPage,
    leadsTotalPages,
    leadsTotal,
    refreshAll,
    refreshStats,
    refreshLeads,
    refreshActivities,
    addLead,
    editLead,
    removeLead,
    changeStatus,
    markAsRead,
    setLeadsFilters,
    leadsFilters
  };
}

export default useDashboardData;
