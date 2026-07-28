// n8n Code node: normaliza order_shipped -> Custom Action (BRANCH INPUT).
// Mode: Run Once for Each Item.
//
// Este e o ramo INPUT: abre (dispara) o ONBOARDING 2 (despacho / codigo de rastreio).
//   Switch [order_shipped] -> ESTE Code (JavaScript6) -> Wait -> HTTP "Order shipping (input)"
//   -> credencial ligada como Plataforma de Origem (input) do Onboarding 2.
//
// O Wait ANTES deste HTTP existe para o Onboarding 1 fechar primeiro (pelo ramo output) e so
// depois abrir o Onboarding 2, evitando o lead ficar nas duas campanhas ao mesmo tempo.
//
// SOURCE DIFERENTE do ramo output de proposito: assim a AWSales distingue o evento que FECHA o
// Onboarding 1 do evento que ABRE o Onboarding 2, mesmo vindo do mesmo order_shipped.
//
// Schema Custom Action: obrigatorios event, timestamp, source.id, source.name,
// lead.phone, lead.email. utm.source DEVE ser "awsales". metadata e opcional.
// MATCHER: o email e o matcher confiavel.

const SOURCE = {
  id: 'nuestra_rx_order_shipped_input',
  name: 'Nuestra RX - Pedido despachado (order_shipped) [input - abre Onboarding 2]',
};

function isBlank(value) {
  if (value === null || value === undefined) return true;
  if (typeof value === 'string') return value.trim() === '';
  return false;
}

function firstNonBlank(values) {
  for (const value of values) {
    if (!isBlank(value)) return value;
  }
  return undefined;
}

function toE164(value) {
  if (isBlank(value)) return undefined;
  const trimmed = String(value).trim();
  const digits = trimmed.replace(/[^\d]/g, '');
  if (!digits) return undefined;
  // Ja veio com "+" e codigo de pais (input forms-site manda phone_e164 "+1..."/"+55...").
  if (trimmed.startsWith('+')) return `+${digits}`;
  // US/Canada SEM codigo de pais: 10 digitos -> prefixar "1" (a audiencia da Nuestra RX e EUA).
  // Caso real 2026-06-26 (Adriana): "2248335033" virava "+2248335033" (codigo +224, Guine) e
  // criava lead DUPLICADO em vez de casar com "+12248335033".
  if (digits.length === 10) return `+1${digits}`;
  // US/Canada COM codigo de pais ja incluso: 11 digitos comecando com 1.
  if (digits.length === 11 && digits.startsWith('1')) return `+${digits}`;
  // Demais casos (ja deve trazer codigo de pais): best-effort.
  return `+${digits}`;
}

function normalizeTimestamp(value) {
  const date = value ? new Date(value) : new Date();
  if (Number.isNaN(date.getTime())) return new Date().toISOString();
  return date.toISOString();
}

function stripUndefined(obj) {
  const out = {};
  for (const [k, v] of Object.entries(obj)) {
    if (v === undefined || v === null) continue;
    if (typeof v === 'string' && v.trim() === '') continue;
    out[k] = v;
  }
  return out;
}

const item = $input.item.json || {};
const body = item.body || item;
const raw = body.dosable_raw || {};

const email = firstNonBlank([body.email, raw.email]);
const phone = toE164(firstNonBlank([body.phone, raw.phone]));
const name = [firstNonBlank([body.first_name, raw.first_name]), firstNonBlank([body.last_name, raw.last_name])]
  .filter(Boolean)
  .join(' ') || undefined;

const shouldSendOutput =
  body.event === 'order_shipped' && !isBlank(email) && !isBlank(phone);

const awsalesPayload = {
  event: 'custom_action',
  timestamp: normalizeTimestamp(firstNonBlank([body.shipped_at, body.received_at])),
  source: { id: SOURCE.id, name: SOURCE.name },
  lead: stripUndefined({ phone, email, name }),
  utm: { source: 'awsales' },
  // metadata leva o rastreio para o Onboarding 2 mandar o codigo ao lead.
  metadata: stripUndefined({
    tracking_number: firstNonBlank([body.tracking_number, raw.tracking_number]),
    carrier: firstNonBlank([body.carrier, raw.carrier]),
    tracking_url: firstNonBlank([body.tracking_url, raw.tracking_url]),
    order_id: firstNonBlank([body.order_id, raw.order_id]),
    product_id: firstNonBlank([body.product_id, raw.product_id]),
    product_name: firstNonBlank([body.product_name, raw.product_name]),
    dosable_event_type: firstNonBlank([body.dosable_event_type, raw.event_type]),
  }),
};

// Mode "Run Once for Each Item": retornar UM objeto { json: {...} }, nao um array.
return {
  json: {
    awsales_payload: awsalesPayload,
    awsales_payload_json: JSON.stringify(awsalesPayload),
    should_send_output: shouldSendOutput,
  },
};
