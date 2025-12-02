/**
 * Servicio de Leads
 *
 * Funciones para interactuar con la API de leads desde el frontend
 */

import type {
  Lead,
  LeadStatus,
  LeadSource,
  LeadPriority,
  Activity,
  DashboardStats
} from '@/lib/integrations.types';

const API_BASE = '/api';

// ===== LEADS =====

export interface LeadsResponse {
  leads: Lead[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export interface LeadsFilters {
  sitio_id?: string;
  status?: LeadStatus;
  source?: LeadSource;
  priority?: LeadPriority;
  search?: string;
  page?: number;
  limit?: number;
  sort_by?: string;
  sort_dir?: 'asc' | 'desc';
}

/**
 * Obtener lista de leads con filtros
 */
export async function getLeads(filters: LeadsFilters = {}): Promise<LeadsResponse> {
  const params = new URLSearchParams();

  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      params.append(key, String(value));
    }
  });

  const response = await fetch(`${API_BASE}/leads?${params}`);

  if (!response.ok) {
    throw new Error('Error fetching leads');
  }

  return response.json();
}

/**
 * Obtener un lead por ID
 */
export async function getLead(id: string): Promise<Lead> {
  const response = await fetch(`${API_BASE}/leads/${id}`);

  if (!response.ok) {
    throw new Error('Error fetching lead');
  }

  const { lead } = await response.json();
  return lead;
}

/**
 * Crear un nuevo lead
 */
export async function createLead(data: {
  sitio_id: string;
  name: string;
  email?: string;
  phone?: string;
  source?: LeadSource;
  message?: string;
  notes?: string;
  priority?: LeadPriority;
  tags?: string[];
}): Promise<Lead> {
  const response = await fetch(`${API_BASE}/leads`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Error creating lead');
  }

  const { lead } = await response.json();
  return lead;
}

/**
 * Actualizar un lead
 */
export async function updateLead(
  id: string,
  data: Partial<Pick<Lead, 'name' | 'email' | 'phone' | 'status' | 'priority' | 'message' | 'notes' | 'tags' | 'assigned_to' | 'metadata'>>
): Promise<Lead> {
  const response = await fetch(`${API_BASE}/leads/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Error updating lead');
  }

  const { lead } = await response.json();
  return lead;
}

/**
 * Eliminar un lead
 */
export async function deleteLead(id: string): Promise<void> {
  const response = await fetch(`${API_BASE}/leads/${id}`, {
    method: 'DELETE'
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Error deleting lead');
  }
}

/**
 * Cambiar estado de un lead
 */
export async function changeLeadStatus(id: string, status: LeadStatus): Promise<Lead> {
  return updateLead(id, { status });
}

// ===== DASHBOARD =====

/**
 * Obtener estadisticas del dashboard
 */
export async function getDashboardStats(
  sitioId?: string,
  period: number = 30
): Promise<DashboardStats> {
  const params = new URLSearchParams();
  if (sitioId) params.append('sitio_id', sitioId);
  params.append('period', String(period));

  const response = await fetch(`${API_BASE}/dashboard/stats?${params}`);

  if (!response.ok) {
    throw new Error('Error fetching dashboard stats');
  }

  return response.json();
}

// ===== ACTIVIDADES =====

export interface ActivitiesResponse {
  activities: Activity[];
  unread_count: number;
}

/**
 * Obtener actividades recientes
 */
export async function getActivities(
  sitioId?: string,
  limit: number = 20,
  unreadOnly: boolean = false
): Promise<ActivitiesResponse> {
  const params = new URLSearchParams();
  if (sitioId) params.append('sitio_id', sitioId);
  params.append('limit', String(limit));
  if (unreadOnly) params.append('unread_only', 'true');

  const response = await fetch(`${API_BASE}/dashboard/activities?${params}`);

  if (!response.ok) {
    throw new Error('Error fetching activities');
  }

  return response.json();
}

/**
 * Marcar actividades como leidas
 */
export async function markActivitiesAsRead(
  activityIds?: string[],
  markAllRead?: boolean,
  sitioId?: string
): Promise<void> {
  const response = await fetch(`${API_BASE}/dashboard/activities`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      activity_ids: activityIds,
      mark_all_read: markAllRead,
      sitio_id: sitioId
    })
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Error updating activities');
  }
}
