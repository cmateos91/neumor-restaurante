import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import {
  sendReservaConfirmacionCliente,
  sendReservaAlertaRestaurante,
  sendReservaCancelacion,
  ReservaEmailData
} from '@/lib/email';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

interface EmailRequest {
  reservaId: string;
  tipo: 'nueva' | 'confirmacion' | 'cancelacion';
}

/**
 * POST /api/reservas/email
 * Envía emails relacionados con reservas
 */
export async function POST(request: NextRequest) {
  try {
    const body: EmailRequest = await request.json();
    const { reservaId, tipo } = body;

    if (!reservaId || !tipo) {
      return NextResponse.json(
        { success: false, error: 'reservaId y tipo son requeridos' },
        { status: 400 }
      );
    }

    // Obtener datos de la reserva
    const { data: reserva, error: reservaError } = await supabase
      .from('sitio_reservas')
      .select('*')
      .eq('id', reservaId)
      .single();

    if (reservaError || !reserva) {
      return NextResponse.json(
        { success: false, error: 'Reserva no encontrada' },
        { status: 404 }
      );
    }

    // Obtener datos del restaurante
    const { data: config } = await supabase
      .from('sitio_config')
      .select('nombre, telefono, email, email_secundario, direccion_calle, direccion_ciudad')
      .eq('sitio_id', reserva.sitio_id)
      .single();

    const emailData: ReservaEmailData = {
      nombre: reserva.nombre,
      email: reserva.email,
      telefono: reserva.telefono,
      fecha: reserva.fecha,
      hora: reserva.hora,
      personas: reserva.personas,
      notas: reserva.notas,
      restaurante: {
        nombre: config?.nombre || 'Restaurante',
        telefono: config?.telefono,
        email: config?.email,
        direccion: config?.direccion_calle
          ? `${config.direccion_calle}, ${config.direccion_ciudad || ''}`
          : undefined
      }
    };

    const results: { cliente?: boolean; restaurante?: boolean } = {};

    switch (tipo) {
      case 'nueva':
        // Nueva reserva: alertar al restaurante
        if (config?.email || config?.email_secundario) {
          const emailRestaurante = config.email_secundario || config.email;
          await sendReservaAlertaRestaurante(emailData, emailRestaurante);
          results.restaurante = true;
        }
        break;

      case 'confirmacion':
        // Confirmación: enviar al cliente
        await sendReservaConfirmacionCliente(emailData);
        results.cliente = true;
        break;

      case 'cancelacion':
        // Cancelación: enviar al cliente
        await sendReservaCancelacion(emailData);
        results.cliente = true;
        break;

      default:
        return NextResponse.json(
          { success: false, error: 'Tipo de email no válido' },
          { status: 400 }
        );
    }

    return NextResponse.json({
      success: true,
      message: 'Email(s) enviado(s)',
      results
    });

  } catch (error) {
    console.error('Error enviando email:', error);
    return NextResponse.json(
      { success: false, error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
