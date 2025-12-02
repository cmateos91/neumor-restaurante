-- =============================================
-- Migracion: Leads, Actividad e Integraciones
-- Para usar con n8n y automatizaciones
-- =============================================

-- ===== TIPOS ENUM =====

-- Origen del lead
CREATE TYPE lead_source AS ENUM (
  'web_form',
  'instagram',
  'facebook',
  'whatsapp',
  'google',
  'tripadvisor',
  'email',
  'phone',
  'referral',
  'n8n',
  'manual',
  'other'
);

-- Estado del lead
CREATE TYPE lead_status AS ENUM (
  'new',
  'contacted',
  'qualified',
  'negotiating',
  'converted',
  'lost'
);

-- Prioridad del lead
CREATE TYPE lead_priority AS ENUM (
  'low',
  'medium',
  'high',
  'urgent'
);

-- Tipo de actividad
CREATE TYPE activity_type AS ENUM (
  'lead_created',
  'lead_updated',
  'lead_contacted',
  'lead_converted',
  'lead_lost',
  'message_received',
  'message_sent',
  'email_sent',
  'email_opened',
  'review_received',
  'review_responded',
  'reservation_created',
  'reservation_confirmed',
  'reservation_cancelled',
  'social_mention',
  'social_comment',
  'webhook_received',
  'automation_triggered',
  'system'
);

-- Tipo de integracion
CREATE TYPE integration_type AS ENUM (
  'instagram',
  'facebook',
  'whatsapp',
  'google_business',
  'tripadvisor',
  'email_smtp',
  'n8n'
);

-- Estado de integracion
CREATE TYPE integration_status AS ENUM (
  'active',
  'inactive',
  'error',
  'pending'
);


-- ===== TABLA: LEADS =====
CREATE TABLE IF NOT EXISTS leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sitio_id UUID NOT NULL REFERENCES sitios(id) ON DELETE CASCADE,

  -- Datos de contacto
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255),
  phone VARCHAR(50),

  -- Origen y estado
  source lead_source NOT NULL DEFAULT 'other',
  source_id VARCHAR(255),          -- ID del mensaje/comentario original
  source_url TEXT,                  -- URL del post/mensaje original
  status lead_status NOT NULL DEFAULT 'new',
  priority lead_priority NOT NULL DEFAULT 'medium',

  -- Contenido
  message TEXT,
  notes TEXT,
  tags TEXT[] DEFAULT '{}',

  -- Datos adicionales (JSON flexible)
  metadata JSONB DEFAULT '{}',

  -- Asignacion
  assigned_to UUID REFERENCES auth.users(id),

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  contacted_at TIMESTAMPTZ,
  converted_at TIMESTAMPTZ
);

-- Indices para leads
CREATE INDEX idx_leads_sitio ON leads(sitio_id);
CREATE INDEX idx_leads_status ON leads(status);
CREATE INDEX idx_leads_source ON leads(source);
CREATE INDEX idx_leads_created ON leads(created_at DESC);
CREATE INDEX idx_leads_email ON leads(email) WHERE email IS NOT NULL;
CREATE INDEX idx_leads_phone ON leads(phone) WHERE phone IS NOT NULL;


-- ===== TABLA: ACTIVIDAD =====
CREATE TABLE IF NOT EXISTS activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sitio_id UUID NOT NULL REFERENCES sitios(id) ON DELETE CASCADE,

  type activity_type NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT,

  -- Relaciones opcionales
  lead_id UUID REFERENCES leads(id) ON DELETE SET NULL,
  reservation_id UUID,  -- Para futuras reservas

  -- Datos adicionales
  metadata JSONB DEFAULT '{}',

  -- Estado de lectura
  read BOOLEAN DEFAULT FALSE,
  read_at TIMESTAMPTZ,

  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indices para actividad
CREATE INDEX idx_activities_sitio ON activities(sitio_id);
CREATE INDEX idx_activities_type ON activities(type);
CREATE INDEX idx_activities_lead ON activities(lead_id) WHERE lead_id IS NOT NULL;
CREATE INDEX idx_activities_created ON activities(created_at DESC);
CREATE INDEX idx_activities_unread ON activities(sitio_id, read) WHERE read = FALSE;


-- ===== TABLA: INTEGRACIONES =====
CREATE TABLE IF NOT EXISTS integrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sitio_id UUID NOT NULL REFERENCES sitios(id) ON DELETE CASCADE,

  type integration_type NOT NULL,
  name VARCHAR(255) NOT NULL,
  status integration_status NOT NULL DEFAULT 'pending',

  -- Configuracion (en produccion, encriptar datos sensibles)
  config JSONB DEFAULT '{}',

  -- Estadisticas
  last_sync_at TIMESTAMPTZ,
  last_error TEXT,
  messages_received INTEGER DEFAULT 0,
  messages_sent INTEGER DEFAULT 0,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- Solo una integracion activa por tipo por sitio
  UNIQUE(sitio_id, type)
);

-- Indices para integraciones
CREATE INDEX idx_integrations_sitio ON integrations(sitio_id);
CREATE INDEX idx_integrations_type ON integrations(type);
CREATE INDEX idx_integrations_status ON integrations(status);


-- ===== TABLA: WEBHOOK LOGS =====
-- Para debugging y auditoria de webhooks recibidos
CREATE TABLE IF NOT EXISTS webhook_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sitio_id UUID REFERENCES sitios(id) ON DELETE CASCADE,

  -- Datos del request
  source VARCHAR(50) NOT NULL,       -- 'n8n', 'instagram', etc.
  event VARCHAR(100),                 -- Tipo de evento
  payload JSONB NOT NULL,             -- Payload completo
  headers JSONB,                      -- Headers relevantes

  -- Resultado
  success BOOLEAN NOT NULL,
  response JSONB,
  error TEXT,
  processing_time_ms INTEGER,

  -- IP y metadata
  ip_address INET,
  user_agent TEXT,

  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indices para webhook logs (con retencion - se pueden limpiar periodicamente)
CREATE INDEX idx_webhook_logs_sitio ON webhook_logs(sitio_id) WHERE sitio_id IS NOT NULL;
CREATE INDEX idx_webhook_logs_source ON webhook_logs(source);
CREATE INDEX idx_webhook_logs_created ON webhook_logs(created_at DESC);
CREATE INDEX idx_webhook_logs_errors ON webhook_logs(created_at DESC) WHERE success = FALSE;


-- ===== TABLA: AUTOMATIZACIONES =====
CREATE TABLE IF NOT EXISTS automations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sitio_id UUID NOT NULL REFERENCES sitios(id) ON DELETE CASCADE,

  name VARCHAR(255) NOT NULL,
  description TEXT,
  enabled BOOLEAN DEFAULT TRUE,

  -- Trigger
  trigger VARCHAR(50) NOT NULL,       -- 'lead_created', 'message_received', etc.
  trigger_config JSONB DEFAULT '{}',

  -- Acciones (array de acciones a ejecutar)
  actions JSONB NOT NULL DEFAULT '[]',

  -- Estadisticas
  times_triggered INTEGER DEFAULT 0,
  last_triggered_at TIMESTAMPTZ,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indices para automatizaciones
CREATE INDEX idx_automations_sitio ON automations(sitio_id);
CREATE INDEX idx_automations_enabled ON automations(sitio_id, enabled) WHERE enabled = TRUE;
CREATE INDEX idx_automations_trigger ON automations(trigger);


-- ===== FUNCIONES Y TRIGGERS =====

-- Funcion para actualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers para updated_at
CREATE TRIGGER leads_updated_at
  BEFORE UPDATE ON leads
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER integrations_updated_at
  BEFORE UPDATE ON integrations
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER automations_updated_at
  BEFORE UPDATE ON automations
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();


-- Funcion para crear actividad automaticamente cuando se crea un lead
CREATE OR REPLACE FUNCTION create_lead_activity()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO activities (sitio_id, type, title, description, lead_id, metadata)
  VALUES (
    NEW.sitio_id,
    'lead_created',
    'Nuevo lead: ' || NEW.name,
    COALESCE(NEW.message, 'Lead creado desde ' || NEW.source),
    NEW.id,
    jsonb_build_object('source', NEW.source, 'priority', NEW.priority)
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER lead_created_activity
  AFTER INSERT ON leads
  FOR EACH ROW
  EXECUTE FUNCTION create_lead_activity();


-- Funcion para crear actividad cuando cambia el estado del lead
CREATE OR REPLACE FUNCTION create_lead_status_activity()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.status != NEW.status THEN
    INSERT INTO activities (sitio_id, type, title, description, lead_id, metadata)
    VALUES (
      NEW.sitio_id,
      CASE NEW.status
        WHEN 'contacted' THEN 'lead_contacted'
        WHEN 'converted' THEN 'lead_converted'
        WHEN 'lost' THEN 'lead_lost'
        ELSE 'lead_updated'
      END,
      'Lead actualizado: ' || NEW.name,
      'Estado cambiado de ' || OLD.status || ' a ' || NEW.status,
      NEW.id,
      jsonb_build_object('old_status', OLD.status, 'new_status', NEW.status)
    );

    -- Actualizar timestamps especiales
    IF NEW.status = 'contacted' AND OLD.status = 'new' THEN
      NEW.contacted_at = NOW();
    ELSIF NEW.status = 'converted' THEN
      NEW.converted_at = NOW();
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER lead_status_changed_activity
  BEFORE UPDATE ON leads
  FOR EACH ROW
  EXECUTE FUNCTION create_lead_status_activity();


-- ===== ROW LEVEL SECURITY =====

-- Habilitar RLS
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE integrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE webhook_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE automations ENABLE ROW LEVEL SECURITY;

-- Politicas para leads (por ahora publico, ajustar segun auth)
CREATE POLICY "Leads visibles por sitio" ON leads
  FOR ALL USING (true);

CREATE POLICY "Activities visibles por sitio" ON activities
  FOR ALL USING (true);

CREATE POLICY "Integrations visibles por sitio" ON integrations
  FOR ALL USING (true);

CREATE POLICY "Webhook logs visibles" ON webhook_logs
  FOR ALL USING (true);

CREATE POLICY "Automations visibles por sitio" ON automations
  FOR ALL USING (true);


-- ===== VISTAS UTILES =====

-- Vista de estadisticas de leads por sitio
CREATE OR REPLACE VIEW lead_stats AS
SELECT
  sitio_id,
  COUNT(*) as total,
  COUNT(*) FILTER (WHERE status = 'new') as new_count,
  COUNT(*) FILTER (WHERE status = 'contacted') as contacted_count,
  COUNT(*) FILTER (WHERE status = 'qualified') as qualified_count,
  COUNT(*) FILTER (WHERE status = 'converted') as converted_count,
  COUNT(*) FILTER (WHERE status = 'lost') as lost_count,
  ROUND(
    COUNT(*) FILTER (WHERE status = 'converted')::numeric /
    NULLIF(COUNT(*)::numeric, 0) * 100, 2
  ) as conversion_rate,
  COUNT(*) FILTER (WHERE created_at > NOW() - INTERVAL '7 days') as last_7_days,
  COUNT(*) FILTER (WHERE created_at > NOW() - INTERVAL '30 days') as last_30_days
FROM leads
GROUP BY sitio_id;

-- Nota: Para obtener actividades no leidas, usar:
-- SELECT * FROM activities WHERE read = FALSE ORDER BY created_at DESC;
