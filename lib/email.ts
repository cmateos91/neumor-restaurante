import { Resend } from 'resend';

// Cliente de Resend (inicialización lazy)
let resendClient: Resend | null = null;

function getResendClient(): Resend {
  if (!resendClient) {
    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
      throw new Error('RESEND_API_KEY no configurada. Añádela a .env.local');
    }
    resendClient = new Resend(apiKey);
  }
  return resendClient;
}

// Configuración del remitente (configurar en .env.local)
const getFromEmail = () => process.env.EMAIL_FROM || 'reservas@tudominio.com';
const getFromName = () => process.env.EMAIL_FROM_NAME || 'Reservas';

export interface ReservaEmailData {
  nombre: string;
  email: string;
  telefono?: string;
  fecha: string;
  hora: string;
  personas: number;
  notas?: string;
  restaurante: {
    nombre: string;
    telefono?: string;
    email?: string;
    direccion?: string;
  };
}

/**
 * Enviar email de confirmación al cliente
 */
export async function sendReservaConfirmacionCliente(data: ReservaEmailData) {
  const fechaFormateada = new Date(data.fecha).toLocaleDateString('es-ES', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  const { error } = await getResendClient().emails.send({
    from: `${getFromName()} <${getFromEmail()}>`,
    to: data.email,
    subject: `Reserva confirmada - ${data.restaurante.nombre}`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #d4af37 0%, #b8962d 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .details { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; }
          .detail-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #eee; }
          .detail-row:last-child { border-bottom: none; }
          .label { color: #666; }
          .value { font-weight: 600; color: #333; }
          .footer { text-align: center; padding: 20px; color: #666; font-size: 14px; }
          .btn { display: inline-block; background: #d4af37; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin-top: 20px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1 style="margin: 0;">¡Reserva Confirmada!</h1>
            <p style="margin: 10px 0 0 0; opacity: 0.9;">${data.restaurante.nombre}</p>
          </div>
          <div class="content">
            <p>Hola <strong>${data.nombre}</strong>,</p>
            <p>Tu reserva ha sido confirmada. Te esperamos con mucho gusto.</p>

            <div class="details">
              <div class="detail-row">
                <span class="label">Fecha</span>
                <span class="value">${fechaFormateada}</span>
              </div>
              <div class="detail-row">
                <span class="label">Hora</span>
                <span class="value">${data.hora}</span>
              </div>
              <div class="detail-row">
                <span class="label">Personas</span>
                <span class="value">${data.personas}</span>
              </div>
              ${data.notas ? `
              <div class="detail-row">
                <span class="label">Notas</span>
                <span class="value">${data.notas}</span>
              </div>
              ` : ''}
            </div>

            ${data.restaurante.direccion ? `
            <p><strong>Dirección:</strong><br>${data.restaurante.direccion}</p>
            ` : ''}

            <p style="color: #666; font-size: 14px;">
              Si necesitas modificar o cancelar tu reserva, contactanos:
              ${data.restaurante.telefono ? `<br>Tel: ${data.restaurante.telefono}` : ''}
              ${data.restaurante.email ? `<br>Email: ${data.restaurante.email}` : ''}
            </p>
          </div>
          <div class="footer">
            <p>Gracias por elegir ${data.restaurante.nombre}</p>
          </div>
        </div>
      </body>
      </html>
    `
  });

  if (error) {
    console.error('Error enviando email de confirmación:', error);
    throw error;
  }

  return { success: true };
}

/**
 * Enviar alerta al restaurante de nueva reserva
 */
export async function sendReservaAlertaRestaurante(data: ReservaEmailData, emailRestaurante: string) {
  const fechaFormateada = new Date(data.fecha).toLocaleDateString('es-ES', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  const { error } = await getResendClient().emails.send({
    from: `${getFromName()} <${getFromEmail()}>`,
    to: emailRestaurante,
    subject: `Nueva reserva - ${data.nombre} (${data.personas} personas)`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #2c2c2c; color: white; padding: 20px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .highlight { background: #fff3cd; border-left: 4px solid #d4af37; padding: 15px; margin: 20px 0; }
          .details { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; }
          .detail-row { padding: 8px 0; border-bottom: 1px solid #eee; }
          .detail-row:last-child { border-bottom: none; }
          .label { color: #666; font-size: 12px; text-transform: uppercase; }
          .value { font-weight: 600; color: #333; font-size: 16px; }
          .contact { background: #e8f4e8; padding: 15px; border-radius: 8px; margin-top: 20px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1 style="margin: 0; font-size: 20px;">Nueva Reserva Recibida</h1>
          </div>
          <div class="content">
            <div class="highlight">
              <strong>${fechaFormateada}</strong> a las <strong>${data.hora}</strong>
              <br>
              <span style="font-size: 24px; font-weight: bold;">${data.personas} personas</span>
            </div>

            <div class="details">
              <div class="detail-row">
                <div class="label">Cliente</div>
                <div class="value">${data.nombre}</div>
              </div>
              <div class="detail-row">
                <div class="label">Email</div>
                <div class="value">${data.email}</div>
              </div>
              ${data.telefono ? `
              <div class="detail-row">
                <div class="label">Teléfono</div>
                <div class="value">${data.telefono}</div>
              </div>
              ` : ''}
              ${data.notas ? `
              <div class="detail-row">
                <div class="label">Notas especiales</div>
                <div class="value">${data.notas}</div>
              </div>
              ` : ''}
            </div>

            <div class="contact">
              <strong>Acciones rápidas:</strong>
              <br>
              ${data.telefono ? `<a href="tel:${data.telefono}">Llamar al cliente</a> | ` : ''}
              <a href="mailto:${data.email}">Enviar email</a>
            </div>

            <p style="color: #666; font-size: 14px; margin-top: 20px;">
              Accede al panel de administración para confirmar o gestionar esta reserva.
            </p>
          </div>
        </div>
      </body>
      </html>
    `
  });

  if (error) {
    console.error('Error enviando alerta al restaurante:', error);
    throw error;
  }

  return { success: true };
}

/**
 * Enviar email de cancelación al cliente
 */
export async function sendReservaCancelacion(data: ReservaEmailData) {
  const fechaFormateada = new Date(data.fecha).toLocaleDateString('es-ES', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  const { error } = await getResendClient().emails.send({
    from: `${getFromName()} <${getFromEmail()}>`,
    to: data.email,
    subject: `Reserva cancelada - ${data.restaurante.nombre}`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #dc3545; color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .details { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; }
          .footer { text-align: center; padding: 20px; color: #666; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1 style="margin: 0;">Reserva Cancelada</h1>
          </div>
          <div class="content">
            <p>Hola <strong>${data.nombre}</strong>,</p>
            <p>Lamentamos informarte que tu reserva ha sido cancelada.</p>

            <div class="details">
              <p><strong>Detalles de la reserva cancelada:</strong></p>
              <p>Fecha: ${fechaFormateada}<br>
              Hora: ${data.hora}<br>
              Personas: ${data.personas}</p>
            </div>

            <p>Si tienes alguna pregunta o deseas hacer una nueva reserva, no dudes en contactarnos.</p>

            ${data.restaurante.telefono || data.restaurante.email ? `
            <p>
              ${data.restaurante.telefono ? `Tel: ${data.restaurante.telefono}<br>` : ''}
              ${data.restaurante.email ? `Email: ${data.restaurante.email}` : ''}
            </p>
            ` : ''}
          </div>
          <div class="footer">
            <p>Esperamos verte pronto en ${data.restaurante.nombre}</p>
          </div>
        </div>
      </body>
      </html>
    `
  });

  if (error) {
    console.error('Error enviando email de cancelación:', error);
    throw error;
  }

  return { success: true };
}
