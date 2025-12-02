import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import type { Lead, LeadStatus, LeadSource, LeadPriority } from '@/lib/integrations.types';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

/**
 * GET /api/leads
 *
 * Obtener lista de leads con filtros y paginacion
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    // Parametros de filtrado
    const sitioId = searchParams.get('sitio_id');
    const status = searchParams.get('status') as LeadStatus | null;
    const source = searchParams.get('source') as LeadSource | null;
    const priority = searchParams.get('priority') as LeadPriority | null;
    const search = searchParams.get('search');

    // Parametros de paginacion
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = (page - 1) * limit;

    // Parametros de ordenamiento
    const sortBy = searchParams.get('sort_by') || 'created_at';
    const sortDir = searchParams.get('sort_dir') === 'asc' ? true : false;

    // Construir query
    let query = supabase
      .from('leads')
      .select('*', { count: 'exact' });

    // Aplicar filtros
    if (sitioId) query = query.eq('sitio_id', sitioId);
    if (status) query = query.eq('status', status);
    if (source) query = query.eq('source', source);
    if (priority) query = query.eq('priority', priority);

    // Busqueda por nombre o email
    if (search) {
      query = query.or(`name.ilike.%${search}%,email.ilike.%${search}%,phone.ilike.%${search}%`);
    }

    // Ordenamiento y paginacion
    query = query
      .order(sortBy, { ascending: sortDir })
      .range(offset, offset + limit - 1);

    const { data: leads, error, count } = await query;

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      leads,
      pagination: {
        page,
        limit,
        total: count || 0,
        pages: Math.ceil((count || 0) / limit)
      }
    });

  } catch (error) {
    console.error('Error fetching leads:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/leads
 *
 * Crear un nuevo lead manualmente
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const {
      sitio_id,
      name,
      email,
      phone,
      source = 'manual',
      message,
      notes,
      priority = 'medium',
      tags = []
    } = body;

    if (!sitio_id || !name) {
      return NextResponse.json(
        { error: 'sitio_id and name are required' },
        { status: 400 }
      );
    }

    const { data: lead, error } = await supabase
      .from('leads')
      .insert({
        sitio_id,
        name,
        email,
        phone,
        source,
        message,
        notes,
        priority,
        tags,
        status: 'new'
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ lead }, { status: 201 });

  } catch (error) {
    console.error('Error creating lead:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
