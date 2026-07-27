/**
 * Fluxo n8n: Tintim | Integração com a cal.com (input)   (webhook: integracao-cal)
 * No: "Normaliza reuniao"   (tipo: Code, typeVersion 2)
 * Ordem: Webhook1 (integracao-cal) -> [ESTE NO] -> Registra reuniao AWSales
 *
 * O que faz: normaliza o webhook do Cal para o schema de input da AWSales
 * (event, source, lead, meeting, metadata, utm) e monta bodyJson (string) pro HTTP em RAW.
 *
 * IMPORTANTE: o que a IA referencia na conversa vem do campo "metadata" (via {{metadata.*}}).
 * Por isso o metadata ESPELHA lead e meeting inteiros. Assim {{metadata.meeting.uid}},
 * {{metadata.meeting.start_local}}, {{metadata.meeting.location.url}} e {{metadata.lead.name}}
 * resolvem. O uid vem daqui pra tool cancelar_reuniao.
 *
 * Doc do fluxo: ../CONFIG_INTEGRACAO_CAL.md
 * Estado: ajustado com o usuario em 2026-07-23 (metadata espelha lead+meeting; fallback source.id).
 */
const b = $input.first().json.body || {};
const p = b.payload || {};
// so processa o nosso event type (Analise de Parceria IA, 2153406).
// outros funis do time caem aqui pelo webhook da conta -> ignora sem erro.
if (Number(p.eventTypeId) !== 2153406) {
  return [];
}

const md = p.metadata || {}; // metadata do booking do Cal: src, phone, empresa, tomador, videoCallUrl

const eventMap = {
  BOOKING_CREATED: 'meeting_scheduled',
  BOOKING_RESCHEDULED: 'meeting_rescheduled',
  BOOKING_CANCELLED: 'meeting_cancelled'
};
const statusMap = {
  BOOKING_CREATED: 'scheduled',
  BOOKING_RESCHEDULED: 'scheduled',
  BOOKING_CANCELLED: 'cancelled'
};

const trigger = b.triggerEvent;
const att = (p.attendees && p.attendees[0]) || {};
// telefone: metadata.phone (nosso agendar) -> responses.phone (campo do Cal, outros event types) -> attendee
const respPhone = (p.responses && p.responses.phone && p.responses.phone.value)
  || (p.userFieldsResponses && p.userFieldsResponses.phone && p.userFieldsResponses.phone.value)
  || '';
const dig = String(md.phone || respPhone || att.phoneNumber || '').replace(/\D/g, '');

// horario ja formatado no fuso de SP, pra IA nao errar timezone
let startLocal = '';
if (p.startTime) {
  startLocal = DateTime.fromISO(p.startTime, { zone: 'utc' })
    .setZone('America/Sao_Paulo')
    .toFormat("dd/MM/yyyy 'às' HH:mm");
}

const empresa = md.empresa || '';
const tomador = md.tomador || '';

const lead = {
  phone: dig ? ('+' + dig) : '',
  email: att.email || '',
  name: att.name || ''
};

const meeting = {
  title: 'Reunião Programa de Parceiros',
  uid: p.uid || '',
  start_time: p.startTime,
  start_local: startLocal,
  end_time: p.endTime,
  timezone: att.timeZone || (p.organizer && p.organizer.timeZone) || 'America/Sao_Paulo',
  status: statusMap[trigger] || 'scheduled',
  host: { name: (p.organizer && p.organizer.name) || '', email: (p.organizer && p.organizer.email) || '' },
  location: { type: 'online', url: md.videoCallUrl || (p.videoCallData && p.videoCallData.url) || '' }
};

const payload = {
  event: eventMap[trigger] || 'meeting_scheduled',
  timestamp: b.createdAt || new Date().toISOString(),
  source: {
    id: String(p.eventTypeId || 'cal'),
    name: p.eventTypeTitle || 'Cal.com'
  },
  lead: lead,
  meeting: meeting,
  metadata: {
    lead: lead,
    meeting: meeting,
    empresa: empresa,
    tomador_decisao: tomador,
    context_notes: 'Lead qualificado (MQL) com reuniao do Programa de Parceiros ja agendada. Esta campanha so cuida do comparecimento.'
  },
  utm: { source: '', medium: '', campaign: '', term: '', content: '' }
};

// payload solto = preview legivel no n8n; bodyJson = string que vai em RAW pro AWSales
return [{ json: { payload, bodyJson: JSON.stringify(payload) } }];
