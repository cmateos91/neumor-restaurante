import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

/**
 * GET /api/dashboard/activities
 *
 * Obtener actividades recientes
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const sitioId = searchParams.get('sitio_id');
    const limit = parseInt(searchParams.get('limit') || '20');
    const unreadOnly = searchParams.get('unread_only') === 'true';

    let query = supabase
      .from('activities')
      .select('*, lead:leads(id, name, email)')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (sitioId) {
      query = query.eq('sitio_id', sitioId);
    }

    if (unreadOnly) {
      query = query.eq('read', false);
    }

    const { data: activities, error } = await query;

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Contar no leidas
    let countQuery = supabase
      .from('activities')
      .select('id', { count: 'exact', head: true })
      .eq('read', false);

    if (sitioId) {
      countQuery = countQuery.eq('sitio_id', sitioId);
    }

    const { count: unreadCount } = await countQuery;

    return NextResponse.json({
      activities,
      unread_count: unreadCount || 0
    });

  } catch (error) {
    console.error('Error fetching activities:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/dashboard/activities
 *
 * Marcar actividades como leidas
 */
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { activity_ids, mark_all_read, sitio_id } = body;

    if (mark_all_read && sitio_id) {
      // Marcar todas como leidas para un sitio
      const { error } = await supabase
        .from('activities')
        .update({ read: true, read_at: new Date().toISOString() })
        .eq('sitio_id', sitio_id)
        .eq('read', false);

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      return NextResponse.json({ success: true, message: 'All activities marked as read' });
    }

    if (activity_ids && Array.isArray(activity_ids)) {
      // Marcar actividades especificas como leidas
      const { error } = await supabase
        .from('activities')
        .update({ read: true, read_at: new Date().toISOString() })
        .in('id', activity_ids);

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      return NextResponse.json({ success: true, marked_count: activity_ids.length });
    }

    return NextResponse.json(
      { error: 'activity_ids array or mark_all_read with sitio_id required' },
      { status: 400 }
    );

  } catch (error) {
    console.error('Error updating activities:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
