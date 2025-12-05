import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import type { MessageTrigger, MessageChannel, AutomatedMessage } from '@/lib/integrations.types';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

/**
 * GET /api/automations/messages/template
 *
 * Endpoint para que n8n obtenga la plantilla de mensaje activa.
 *
 * Query params:
 * - sitio_id: ID del sitio (requerido)
 * - trigger: Tipo de trigger (requerido)
 * - channel: Canal de envio (requerido)
 * - variables: JSON con variables para renderizar (opcional)
 *
 * Ejemplo:
 * GET /api/automations/messages/template?sitio_id=xxx&trigger=lead_created&channel=whatsapp&variables={"name":"Juan"}
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    const sitioId = searchParams.get('sitio_id');
    const trigger = searchParams.get('trigger') as MessageTrigger | null;
    const channel = searchParams.get('channel') as MessageChannel | null;
    const variablesParam = searchParams.get('variables');

    // Validaciones
    if (!sitioId || !trigger || !channel) {
      return NextResponse.json(
        { error: 'sitio_id, trigger y channel son requeridos' },
        { status: 400 }
      );
    }

    // Buscar mensaje activo para este trigger y canal
    const { data: message, error } = await supabase
      .from('automated_messages')
      .select('*')
      .eq('sitio_id', sitioId)
      .eq('trigger', trigger)
      .eq('channel', channel)
      .eq('enabled', true)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json({
          found: false,
          message: 'No hay mensaje automatizado activo para este trigger y canal'
        });
      }
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Verificar horario si esta configurado
    if (message.schedule_start && message.schedule_end) {
      const now = new Date();
      const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
      const currentDay = now.getDay();

      // Verificar dia de la semana
      if (message.schedule_days && !message.schedule_days.includes(currentDay)) {
        return NextResponse.json({
          found: false,
          message: 'Mensaje no disponible hoy (fuera del horario configurado)',
          schedule: {
            days: message.schedule_days,
            current_day: currentDay
          }
        });
      }

      // Verificar hora
      if (currentTime < message.schedule_start || currentTime > message.schedule_end) {
        return NextResponse.json({
          found: false,
          message: 'Mensaje no disponible ahora (fuera del horario configurado)',
          schedule: {
            start: message.schedule_start,
            end: message.schedule_end,
            current: currentTime
          }
        });
      }
    }

    // Renderizar variables si se proporcionaron
    let renderedTemplate = message.message_template;
    if (variablesParam) {
      try {
        const variables = JSON.parse(variablesParam);
        renderedTemplate = renderTemplate(message.message_template, variables);
      } catch {
        // Si falla el parse, devolver template sin renderizar
      }
    }

    // Incrementar contador de envios
    await supabase
      .from('automated_messages')
      .update({
        times_sent: (message.times_sent || 0) + 1,
        last_sent_at: new Date().toISOString()
      })
      .eq('id', message.id);

    return NextResponse.json({
      found: true,
      id: message.id,
      name: message.name,
      channel: message.channel,
      template: message.message_template,
      rendered: renderedTemplate,
      delay_seconds: message.delay_seconds,
      conditions: message.conditions
    });

  } catch (error) {
    console.error('Error fetching message template:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * Renderizar template reemplazando variables {{variable}}
 */
function renderTemplate(template: string, variables: Record<string, string>): string {
  let result = template;

  for (const [key, value] of Object.entries(variables)) {
    const regex = new RegExp(`\\{\\{${key}\\}\\}`, 'g');
    result = result.replace(regex, value || '');
  }

  return result;
}

/**
 * POST /api/automations/messages/template
 *
 * Registrar que un mensaje fue enviado (para estadisticas)
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const {
      message_id,
      sitio_id,
      lead_id,
      recipient_identifier,
      channel,
      rendered_message,
      status = 'sent',
      external_id,
      provider_response,
      error: errorMsg
    } = body;

    if (!message_id || !sitio_id || !recipient_identifier || !channel || !rendered_message) {
      return NextResponse.json(
        { error: 'message_id, sitio_id, recipient_identifier, channel y rendered_message son requeridos' },
        { status: 400 }
      );
    }

    // Insertar log
    const { data: log, error } = await supabase
      .from('automated_message_logs')
      .insert({
        message_id,
        sitio_id,
        lead_id,
        recipient_identifier,
        channel,
        rendered_message,
        status,
        external_id,
        provider_response,
        error: errorMsg,
        sent_at: status === 'sent' ? new Date().toISOString() : null,
        failed_at: status === 'failed' ? new Date().toISOString() : null
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, log }, { status: 201 });

  } catch (error) {
    console.error('Error logging message send:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
