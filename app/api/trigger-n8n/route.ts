import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Leemos la URL secreta del archivo .env.local
    const webhookUrl = process.env.N8N_RESERVATION_WEBHOOK_URL;

    if (!webhookUrl) {
      console.error('ERROR: Falta la variable N8N_RESERVATION_WEBHOOK_URL');
      return NextResponse.json({ error: 'Configuración faltante' }, { status: 500 });
    }

    // Enviamos los datos a N8N
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      throw new Error(`Error enviando a N8N: ${response.statusText}`);
    }

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Error en el puente a N8N:', error);
    // Devolvemos success true para no romper la experiencia del usuario
    // ya que la reserva sí se guardó en Supabase.
    return NextResponse.json({ success: true }); 
  }
}