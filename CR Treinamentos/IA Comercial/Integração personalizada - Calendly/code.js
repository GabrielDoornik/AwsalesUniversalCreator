// Normalização: Calendly Raw Webhook → AWSales API Format
// Cliente: CR Treinamentos - Paulo Aguiar (Sessão Individual)
// Input: payload raw do webhook Calendly (invitee.created / invitee.canceled)
// Output: formato AWSales (event, lead, meeting, metadata, utm)

const message = $input.first().json.message || $input.first().json;
const body    = message.body  || {};
const params  = message.query || {};
const payload = body.payload  || {};
const scheduledEvent = payload.scheduled_event || {};
const host = scheduledEvent.event_memberships?.[0] || {};

// ==================== MAPEAMENTO DE EVENTO ====================

function mapEvent(calendlyEvent) {
  switch (calendlyEvent) {
    case 'invitee.created':  return 'meeting_scheduled';
    case 'invitee.canceled': return 'meeting_cancelled';
    default:                 return calendlyEvent || null;
  }
}

function mapStatus(calendlyEvent) {
  switch (calendlyEvent) {
    case 'invitee.created':  return 'scheduled';
    case 'invitee.canceled': return 'cancelled';
    default:                 return 'scheduled';
  }
}

// ==================== PROCESSAMENTO DE TELEFONE ====================

function cleanPhone(raw) {
  if (!raw) return null;
  return raw.replace(/[^\d]/g, '');
}

function formatPhone(cleanNumber) {
  if (!cleanNumber) return null;

  // Adiciona DDI 55 se não tiver
  if (!cleanNumber.startsWith('55')) {
    cleanNumber = '55' + cleanNumber;
  }

  // Adiciona nono dígito se celular tem só 8 dígitos após DDD
  const ddd    = cleanNumber.slice(2, 4);
  const number = cleanNumber.slice(4);
  if (number.length === 8) {
    cleanNumber = '55' + ddd + '9' + number;
  }

  return '+' + cleanNumber;
}

function getPhoneFromPayload(payload) {
  // 1. text_reminder_number (campo nativo do Calendly)
  if (payload.text_reminder_number) return payload.text_reminder_number;

  // 2. Busca em questions_and_answers por palavras-chave
  if (payload.questions_and_answers) {
    const keywords = ['telefone', 'phone', 'whatsapp', 'whats', 'celular'];
    for (const qa of payload.questions_and_answers) {
      for (const kw of keywords) {
        if (qa.question.toLowerCase().includes(kw)) return qa.answer;
      }
    }

    // 3. Fallback: regex em qualquer answer
    const phoneRegex = /[\+\d][\d\-\s\(\)\.]{8,}/;
    for (const qa of payload.questions_and_answers) {
      const match = qa.answer.match(phoneRegex);
      if (match) return match[0];
    }
  }

  return null;
}

// ==================== HELPERS ====================

function extrairUUID(value) {
  if (!value) return null;
  const match = value.match(/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i);
  return match ? match[0] : null;
}

function buildCancellationNotes(payload) {
  const cancellation = payload.cancellation || payload.scheduled_event?.cancellation;
  if (!cancellation) return null;

  const canceledBy = cancellation.canceled_by || 'desconhecido';
  const reason     = cancellation.reason || 'sem motivo informado';
  return `Cancelado por: ${canceledBy}. Motivo: ${reason}`;
}

// ==================== OUTPUT ====================

const phone = formatPhone(cleanPhone(getPhoneFromPayload(payload)));

const output = {
  event:     mapEvent(body.event),
  timestamp: body.created_at || new Date().toISOString(),

  source: {
    id:   params.org_id || null,
    name: scheduledEvent.name || null
  },

  lead: {
    phone: phone,
    email: payload.email || null,
    name:  payload.name  || null
  },

  meeting: {
    title:      scheduledEvent.name || null,
    start_time: scheduledEvent.start_time || null,
    end_time:   scheduledEvent.end_time   || null,
    timezone:   payload.timezone || 'America/Sao_Paulo',
    status:     mapStatus(body.event),
    host: {
      name:  host.user_name  || null,
      email: host.user_email || null
    },
    location: scheduledEvent.location?.join_url
      ? { type: 'online', url: scheduledEvent.location.join_url }
      : { type: 'phone' }
  },

  metadata: {
    reschedule_url: payload.reschedule_url || null,
    cancel_url:     payload.cancel_url     || null,
    lead_name:      payload.name           || null,
    sales_rep_name: host.user_name         || null,
    context_notes:  buildCancellationNotes(payload)
  },

  utm: {
    source:   payload.tracking?.utm_source   || null,
    medium:   payload.tracking?.utm_medium   || null,
    campaign: payload.tracking?.utm_campaign || null,
    term:     payload.tracking?.utm_term     || null,
    content:  payload.tracking?.utm_content  || null
  }
};

return output;
