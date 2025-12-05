# Integracion n8n - Mensajes Automatizados

## Resumen

Este documento describe como configurar n8n para enviar mensajes automatizados a clientes usando las plantillas configuradas desde el dashboard de NeumorStudio.

## Arquitectura

```
┌──────────────────┐     ┌─────────────────────┐     ┌──────────────────┐
│   Red Social     │     │        n8n          │     │   NeumorStudio   │
│ (Instagram, WA)  │────▶│    Workflow         │────▶│      API         │
└──────────────────┘     └─────────────────────┘     └──────────────────┘
                                  │                           │
                                  │  1. Recibe mensaje        │
                                  │  2. POST /api/webhooks/n8n│
                                  │  3. GET plantilla         │
                                  │  4. Enviar respuesta      │
                                  ▼                           ▼
                         ┌─────────────────────┐     ┌──────────────────┐
                         │   Enviar mensaje    │     │   Dashboard      │
                         │   al cliente        │     │   (editar msg)   │
                         └─────────────────────┘     └──────────────────┘
```

## Endpoints Disponibles

### 1. Webhook para recibir eventos

```
POST /api/webhooks/n8n
Authorization: Bearer {N8N_WEBHOOK_SECRET}
```

**Eventos soportados:**
- `lead.create` - Nuevo lead
- `lead.update` - Actualizar lead
- `message.received` - Mensaje recibido
- `activity.log` - Log de actividad

**Ejemplo payload:**
```json
{
  "event": "lead.create",
  "source": "instagram",
  "data": {
    "name": "Juan Garcia",
    "email": "juan@email.com",
    "phone": "+34612345678",
    "message": "Hola, quiero reservar"
  }
}
```

### 2. Obtener plantilla de mensaje

```
GET /api/automations/messages/template
  ?sitio_id={UUID}
  &trigger={lead_created|message_received|...}
  &channel={whatsapp|instagram_dm|...}
  &variables={"name":"Juan","email":"juan@email.com"}
```

**Respuesta exitosa:**
```json
{
  "found": true,
  "id": "uuid-del-mensaje",
  "name": "Bienvenida Instagram",
  "channel": "instagram_dm",
  "template": "Hola {{name}}, gracias por contactarnos...",
  "rendered": "Hola Juan, gracias por contactarnos...",
  "delay_seconds": 0
}
```

**Sin mensaje configurado:**
```json
{
  "found": false,
  "message": "No hay mensaje automatizado activo para este trigger y canal"
}
```

### 3. Registrar envio de mensaje

```
POST /api/automations/messages/template
Content-Type: application/json

{
  "message_id": "uuid-del-mensaje",
  "sitio_id": "uuid-del-sitio",
  "lead_id": "uuid-del-lead",
  "recipient_identifier": "+34612345678",
  "channel": "whatsapp",
  "rendered_message": "Hola Juan, gracias por contactarnos...",
  "status": "sent",
  "external_id": "whatsapp_msg_123"
}
```

### 4. Variables disponibles

```
GET /api/automations/messages/variables
  ?trigger={lead_created|message_received|...}
```

**Respuesta:**
```json
{
  "trigger": "lead_created",
  "variables": [
    {
      "variable_name": "name",
      "variable_key": "{{name}}",
      "description": "Nombre del cliente",
      "example_value": "Juan Garcia"
    },
    ...
  ]
}
```

## Workflow n8n Ejemplo

### Flujo: Respuesta automatica a DM de Instagram

```
[Instagram Trigger] ──▶ [HTTP Request: Crear Lead] ──▶ [HTTP Request: Obtener Plantilla]
                                                                    │
                                                                    ▼
                                                      [IF: found === true]
                                                                    │
                                                       ┌────────────┴────────────┐
                                                       ▼                         ▼
                                              [Wait: delay_seconds]        [No action]
                                                       │
                                                       ▼
                                              [Instagram: Send DM]
                                                       │
                                                       ▼
                                              [HTTP Request: Log envio]
```

### Nodos del workflow:

#### 1. Instagram Trigger
- Evento: "Mensaje recibido"
- Captura: username, mensaje, timestamp

#### 2. HTTP Request - Crear Lead
```
Method: POST
URL: https://tudominio.com/api/webhooks/n8n
Headers:
  Authorization: Bearer {{$env.N8N_WEBHOOK_SECRET}}
  Content-Type: application/json

Body:
{
  "event": "lead.create",
  "source": "instagram",
  "data": {
    "name": "{{$json.from.username}}",
    "message": "{{$json.message.text}}",
    "source_id": "{{$json.message.id}}"
  }
}
```

#### 3. HTTP Request - Obtener Plantilla
```
Method: GET
URL: https://tudominio.com/api/automations/messages/template
Query Parameters:
  sitio_id: {{$env.SITIO_ID}}
  trigger: lead_created
  channel: instagram_dm
  variables: {"name":"{{$json.from.username}}","message":"{{$json.message.text}}"}
```

#### 4. IF Node
```
Condition: {{$json.found}} equals true
```

#### 5. Wait Node
```
Duration: {{$json.delay_seconds}} seconds
```

#### 6. Instagram - Send DM
```
To: {{$json.from.id}}
Message: {{$json.rendered}}
```

#### 7. HTTP Request - Log envio
```
Method: POST
URL: https://tudominio.com/api/automations/messages/template
Body:
{
  "message_id": "{{$json.id}}",
  "sitio_id": "{{$env.SITIO_ID}}",
  "lead_id": "{{$node['Crear Lead'].json.lead_id}}",
  "recipient_identifier": "{{$json.from.username}}",
  "channel": "instagram_dm",
  "rendered_message": "{{$json.rendered}}",
  "status": "sent"
}
```

## Variables de Entorno n8n

```env
N8N_WEBHOOK_SECRET=tu-token-secreto
SITIO_ID=uuid-de-tu-sitio
NEUMORSTUDIO_API_URL=https://tudominio.com
```

## Triggers Disponibles

| Trigger | Descripcion | Variables |
|---------|-------------|-----------|
| `lead_created` | Nuevo lead recibido | name, email, phone, source, message, restaurant_name |
| `message_received` | Mensaje del cliente | name, email, phone, message, restaurant_name |
| `reservation_created` | Nueva reserva | name, date, time, guests, restaurant_name, restaurant_phone, restaurant_address |
| `reservation_confirmed` | Reserva confirmada | name, date, time, guests, restaurant_name |
| `follow_up` | Seguimiento programado | name, days_since, restaurant_name |

## Canales Soportados

| Canal | Valor | Notas |
|-------|-------|-------|
| WhatsApp | `whatsapp` | Via WhatsApp Business API |
| Instagram DM | `instagram_dm` | Via Instagram Graph API |
| Facebook Messenger | `facebook_messenger` | Via Messenger API |
| Email | `email` | Via Resend/SMTP |
| SMS | `sms` | Via Twilio/similar |
| Telegram | `telegram` | Via Telegram Bot API |

## Configuracion desde Dashboard

1. Ir a **Dashboard > Automatizaciones** (cuando se integre en el menu)
2. Click en **Nuevo Mensaje**
3. Seleccionar:
   - **Trigger**: Cuando disparar el mensaje
   - **Canal**: Por donde enviarlo
   - **Plantilla**: El mensaje con variables {{variable}}
4. Opcionalmente configurar:
   - **Retraso**: Segundos antes de enviar
   - **Horario**: Limitar horas/dias de envio
5. **Activar** el mensaje

## Notas de Seguridad

- El endpoint `/api/webhooks/n8n` requiere token Bearer
- Configurar `N8N_WEBHOOK_SECRET` en `.env.local`
- Los mensajes solo se envian si estan **enabled**
- El horario se respeta automaticamente

## Troubleshooting

### Mensaje no se envia
1. Verificar que el mensaje esta **enabled** en el dashboard
2. Verificar que el trigger y canal coinciden
3. Verificar horario si esta configurado
4. Revisar logs en Supabase: `automated_message_logs`

### Variables no se reemplazan
1. Usar formato exacto: `{{variable}}`
2. Pasar variables en query param `variables` como JSON
3. Verificar nombres de variables en `/api/automations/messages/variables`

### Error de autenticacion
1. Verificar header `Authorization: Bearer {token}`
2. Verificar que `N8N_WEBHOOK_SECRET` coincide en ambos lados
