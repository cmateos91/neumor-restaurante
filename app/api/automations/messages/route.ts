import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import type { AutomatedMessage, AutomatedMessageInput, MessageTrigger, MessageChannel } from '@/lib/integrations.types';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

/**
 * GET /api/automations/messages
 * Listar mensajes automatizados con filtros
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    const sitioId = searchParams.get('sitio_id');
    const trigger = searchParams.get('trigger') as MessageTrigger | null;
    const channel = searchParams.get('channel') as MessageChannel | null;
    const enabled = searchParams.get('enabled');

    let query = supabase
      .from('automated_messages')
      .select('*')
      .order('created_at', { ascending: false });

    if (sitioId) query = query.eq('sitio_id', sitioId);
    if (trigger) query = query.eq('trigger', trigger);
    if (channel) query = query.eq('channel', channel);
    if (enabled !== null) query = query.eq('enabled', enabled === 'true');

    const { data: messages, error } = await query;

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ messages });

  } catch (error) {
    console.error('Error fetching automated messages:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/automations/messages
 * Crear nuevo mensaje automatizado
 */
export async function POST(request: NextRequest) {
  try {
    const body: AutomatedMessageInput & { sitio_id: string } = await request.json();

    const {
      sitio_id,
      name,
      description,
      trigger,
      channel,
      message_template,
      enabled = true,
      delay_seconds = 0,
      schedule_start,
      schedule_end,
      schedule_days,
      conditions
    } = body;

    // Validaciones
    if (!sitio_id || !name || !trigger || !channel || !message_template) {
      return NextResponse.json(
        { error: 'sitio_id, name, trigger, channel y message_template son requeridos' },
        { status: 400 }
      );
    }

    const { data: message, error } = await supabase
      .from('automated_messages')
      .insert({
        sitio_id,
        name,
        description,
        trigger,
        channel,
        message_template,
        enabled,
        delay_seconds,
        schedule_start,
        schedule_end,
        schedule_days,
        conditions
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ message }, { status: 201 });

  } catch (error) {
    console.error('Error creating automated message:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
