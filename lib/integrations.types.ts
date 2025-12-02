/**
 * Tipos para integraciones con n8n y automatizaciones
 */

// ===== LEADS =====
export type LeadSource =
  | 'web_form'      // Formulario de contacto del sitio
  | 'instagram'     // DM o comentario de Instagram
  | 'facebook'      // Messenger o comentario de Facebook
  | 'whatsapp'      // Mensaje de WhatsApp Business
  | 'google'        // Google Business Messages
  | 'tripadvisor'   // Mensajes de TripAdvisor
  | 'email'         // Email directo
  | 'phone'         // Llamada telefonica
  | 'referral'      // Referido
  | 'n8n'           // Creado via n8n workflow
  | 'manual'        // Creado manualmente
  | 'other';

export type LeadStatus =
  | 'new'           // Recien llegado
  | 'contacted'     // Ya se contacto
  | 'qualified'     // Calificado como potencial
  | 'negotiating'   // En negociacion
  | 'converted'     // Convertido (reservo/compro)
  | 'lost';         // Perdido

export type LeadPriority = 'low' | 'medium' | 'high' | 'urgent';

export interface Lead {
  id: string;
  sitio_id: string;

  // Datos de contacto
  name: string;
  email?: string;
  phone?: string;

  // Origen y estado
  source: LeadSource;
  source_id?: string;        // ID del mensaje/comentario original
  source_url?: string;       // URL del post/mensaje original
  status: LeadStatus;
  priority: LeadPriority;

  // Contenido
  message?: string;          // Mensaje inicial del lead
  notes?: string;            // Notas internas
  tags?: string[];           // Etiquetas para filtrar

  // Datos adicionales (reservas, pedidos, etc)
  metadata?: Record<string, unknown>;

  // Asignacion
  assigned_to?: string;      // Usuario asignado

  // Timestamps
  created_at: string;
  updated_at: string;
  contacted_at?: string;     // Cuando se contacto por primera vez
  converted_at?: string;     // Cuando se convirtio
}

// ===== ACTIVIDAD =====
export type ActivityType =
  | 'lead_created'
  | 'lead_updated'
  | 'lead_contacted'
  | 'lead_converted'
  | 'lead_lost'
  | 'message_received'
  | 'message_sent'
  | 'email_sent'
  | 'email_opened'
  | 'review_received'
  | 'review_responded'
  | 'reservation_created'
  | 'reservation_confirmed'
  | 'reservation_cancelled'
  | 'social_mention'
  | 'social_comment'
  | 'webhook_received'
  | 'automation_triggered'
  | 'system';

export interface Activity {
  id: string;
  sitio_id: string;

  type: ActivityType;
  title: string;
  description?: string;

  // Relaciones opcionales
  lead_id?: string;
  reservation_id?: string;

  // Datos adicionales
  metadata?: Record<string, unknown>;

  // Estado de lectura
  read: boolean;
  read_at?: string;

  created_at: string;
}

// ===== INTEGRACIONES =====
export type IntegrationType =
  | 'instagram'
  | 'facebook'
  | 'whatsapp'
  | 'google_business'
  | 'tripadvisor'
  | 'email_smtp'
  | 'n8n';

export type IntegrationStatus = 'active' | 'inactive' | 'error' | 'pending';

export interface Integration {
  id: string;
  sitio_id: string;

  type: IntegrationType;
  name: string;              // Nombre personalizado
  status: IntegrationStatus;

  // Configuracion (encriptada en produccion)
  config: {
    webhook_url?: string;    // URL del webhook de n8n
    api_key?: string;
    access_token?: string;
    account_id?: string;
    [key: string]: unknown;
  };

  // Estadisticas
  last_sync_at?: string;
  last_error?: string;
  messages_received?: number;
  messages_sent?: number;

  created_at: string;
  updated_at: string;
}

// ===== WEBHOOKS (para n8n) =====
export interface WebhookPayload {
  event: string;
  timestamp: string;
  source: LeadSource;
  data: {
    // Lead data
    name?: string;
    email?: string;
    phone?: string;
    message?: string;

    // Source specific
    source_id?: string;
    source_url?: string;
    platform_data?: Record<string, unknown>;
  };
  metadata?: Record<string, unknown>;
}

export interface WebhookResponse {
  success: boolean;
  message: string;
  lead_id?: string;
  activity_id?: string;
  error?: string;
}

// ===== AUTOMATIZACIONES =====
export type AutomationTrigger =
  | 'lead_created'
  | 'lead_status_changed'
  | 'message_received'
  | 'review_received'
  | 'reservation_created'
  | 'scheduled';

export type AutomationAction =
  | 'send_email'
  | 'send_whatsapp'
  | 'create_task'
  | 'update_lead'
  | 'notify_team'
  | 'call_webhook';

export interface Automation {
  id: string;
  sitio_id: string;

  name: string;
  description?: string;
  enabled: boolean;

  trigger: AutomationTrigger;
  trigger_config?: Record<string, unknown>;

  actions: {
    type: AutomationAction;
    config: Record<string, unknown>;
    order: number;
  }[];

  // Estadisticas
  times_triggered: number;
  last_triggered_at?: string;

  created_at: string;
  updated_at: string;
}

// ===== ESTADISTICAS DEL DASHBOARD =====
export interface DashboardStats {
  leads: {
    total: number;
    new: number;
    contacted: number;
    converted: number;
    conversion_rate: number;
    by_source: Record<LeadSource, number>;
  };
  messages: {
    received: number;
    sent: number;
    pending_reply: number;
  };
  reviews: {
    total: number;
    average_rating: number;
    responded: number;
    pending: number;
  };
  reservations: {
    total: number;
    confirmed: number;
    pending: number;
    cancelled: number;
  };
  period: {
    start: string;
    end: string;
    comparison_percent: Record<string, number>;
  };
}
