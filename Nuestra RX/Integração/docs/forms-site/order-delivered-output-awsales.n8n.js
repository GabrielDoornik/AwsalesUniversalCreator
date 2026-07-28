// n8n Code node: normaliza o evento order_delivered -> Custom Action.
// Uso principal:
// - INPUT do Onboarding 3 da Nuestra RX, que dispara quando o pedido CHEGA na casa do lead.
// - Base para roteamento do Onboarding 4 por plano, via metadata.plan:
//   monthly -> Onboarding 4 Mensal
//   quarterly -> Onboarding 4 Trimestral
// Mode: Run Once for Each Item.
//
// Contexto: a Dosable NAO oferece evento de entrega. O Willian montou a deteccao propria
// via 17track (source: "17track.webhook") e dispara order_delivered no MESMO webhook
// forms-site, com header x-nrx-event: order_delivered, quando a transportadora marca
// "Delivered". E o sinal de "produto chegou" -> input do Onboarding 3.
//
// Posicao no fluxo:
//   Forms-site (webhook) -> Switch (body.event == "order_delivered") -> ESTE Code node
//   -> HTTP Request (POST AWSales, integracao dedicada de INPUT do Onboarding 3)
//   -> Switch metadata.plan -> HTTP Requests dedicados do Onboarding 4 Mensal/Trimestral
//
// O HTTP Request principal depois deste node:
// - Method: POST
// - URL: integracao Custom Action DEDICADA do Onboarding 3 (criar no painel,
//        ex: .../credentials/output-order-delivered). Isolar das outras credenciais.
// - Send Body: JSON -> {{$json.awsales_payload}}  (ou Raw -> {{$json.awsales_payload_json}})
// - So chamar quando {{$json.should_send_output}} === true (gate garante email+phone para
//   casar o lead; sem isso a campanha nao tem como mandar a mensagem no WhatsApp).
//
// Para Onboarding 4:
// - Usar um Switch depois deste node em {{$json.awsales_payload.metadata.plan}}.
// - monthly -> POST na integracao Custom Action do Onboarding 4 Mensal.
// - quarterly -> POST na integracao Custom Action do Onboarding 4 Trimestral.
// - Sem plan ou plan desconhecido -> nao disparar Onboarding 4.
//
// Schema Custom Action: obrigatorios event, timestamp, source.id, source.name,
// lead.phone, lead.email. utm.source DEVE ser "awsales". metadata e opcional.
//
// LEAD MATCHING (atencao): nos disparos de TESTE o phone veio null nos dois e o email veio
// null em um deles. O Willian confirmou que no lead REAL os dois chegam preenchidos. O gate
// abaixo exige email + phone justamente para nao disparar output quebrado caso venha um
// payload incompleto. Se algum dia precisar casar por rastreio, o tracking_number e o
// order_id viajam no metadata (o tracking_number e o mesmo do order_shipped do pedido).

const SOURCE = {
  id: 'nuestra_rx_order_delivered',
  name: 'Nuestra RX - Pedido entregue (order_delivered)',
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

// Telefone para +E164. Best-effort: garante o prefixo "+" e tira o que nao for digito.
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

// Item do webhook forms-site (ja filtrado por event == order_delivered no Switch anterior).
const item = $input.item.json || {};
const body = item.body || item;

const email = firstNonBlank([body.email]);
const phone = toE164(firstNonBlank([body.phone]));
const name = firstNonBlank([body.first_name, body.name]);
const rawPlan = firstNonBlank([body.plan]);
const plan = rawPlan ? String(rawPlan).trim().toLowerCase() : undefined;

// So manda se for mesmo order_delivered e tiver os dois campos obrigatorios do lead.
const shouldSendOutput =
  body.event === 'order_delivered' && !isBlank(email) && !isBlank(phone);

const awsalesPayload = {
  // custom_action = input do Onboarding 3 (pedido chegou na casa do lead).
  event: 'custom_action',
  // delivered_at = quando foi entregue; fallback para received_at e depois agora.
  timestamp: normalizeTimestamp(firstNonBlank([body.delivered_at, body.received_at])),
  source: { id: SOURCE.id, name: SOURCE.name },
  lead: stripUndefined({ phone, email, name }),
  // utm.source = "awsales" e OBRIGATORIO para a conversao aparecer no dashboard.
  utm: { source: 'awsales' },
  // metadata OPCIONAL (rastreio/debug + fallback de matching por tracking_number).
  metadata: stripUndefined({
    plan,
    order_id: body.order_id,
    product_name: body.product_name,
    tracking_number: body.tracking_number,
    carrier: body.carrier,
    status: body.status,
    checkpoint: body.checkpoint,
    delivered_at: body.delivered_at,
    dosable_session_id: body.session_id,
    delivery_source: body.source, // ex: "17track.webhook"
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
