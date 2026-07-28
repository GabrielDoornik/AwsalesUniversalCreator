// n8n Code node: normaliza o evento order_paid -> Custom Action (OUTPUT/conversao da
// campanha de RECUPERACAO DE VENDAS da Nuestra RX).
// Mode: Run Once for Each Item.
//
// Contexto: order_paid dispara quando o lead clica "Complete Purchase" no checkout
// (pre-save, $0 cobrado, booking do pedido). E a ACAO DO LEAD que conclui o checkout,
// entao e o sinal de conversao que ENCERRA a recuperacao de vendas. NAO e a cobranca
// real (essa so acontece quando o medico da Beluga aprova). Ver:
//   ../../Campanhas/Recuperacao de vendas/Contexto.md
//
// Posicao no fluxo (fluxo de baixo da imagem 2):
//   Forms-site (webhook) -> IF (body.event == "order_paid") -> ESTE Code node
//   -> HTTP Request (POST AWSales, integracao dedicada de OUTPUT de vendas)
//
// O HTTP Request depois deste node:
// - Method: POST
// - URL: integracao Custom Action DEDICADA da recuperacao de vendas (criar no painel,
//        ex: .../credentials/output-order-paid). Isolar da forms-site e da output-envio-da-tool.
// - Send Body: JSON -> {{$json.awsales_payload}}  (ou Raw -> {{$json.awsales_payload_json}})
// - So chamar quando {{$json.should_send_output}} === true (o IF de order_paid ja filtra,
//   mas o gate aqui garante que tem email+phone para casar o lead).
//
// Schema Custom Action: obrigatorios event, timestamp, source.id, source.name,
// lead.phone, lead.email. utm.source DEVE ser "awsales". metadata e opcional.
//
// ATENCAO (pendencia com o Willian): no payload do order_paid o phone chega QUEBRADO
// (ex: "1983020653" em vez de "+5531983020653" - perde o prefixo). O email vem certo e e
// o matcher confiavel. Pedir para o Willian mandar o phone em +E164.

const SOURCE = {
  id: 'nuestra_rx_order_paid',
  name: 'Nuestra RX - Pedido concluido (pre-save / order_paid)',
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

// Telefone para +E164. OBS: o order_paid chega com o phone estripado, entao isso e
// best-effort para satisfazer o campo obrigatorio. O matcher confiavel e o email.
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

// Item do webhook forms-site (ja filtrado por event == order_paid no IF anterior).
const item = $input.item.json || {};
const body = item.body || item;
const raw = body.dosable_raw || {};

const email = firstNonBlank([body.email, raw.email]);
const phone = toE164(firstNonBlank([body.phone, raw.phone]));
const name = [firstNonBlank([raw.first_name]), firstNonBlank([raw.last_name])]
  .filter(Boolean)
  .join(' ') || undefined;

// So manda se for mesmo order_paid e tiver os dois campos obrigatorios do lead.
const shouldSendOutput =
  body.event === 'order_paid' && !isBlank(email) && !isBlank(phone);

const awsalesPayload = {
  // custom_action = conversao da recuperacao de vendas (lead concluiu o pre-save).
  event: 'custom_action',
  timestamp: normalizeTimestamp(body.received_at),
  source: { id: SOURCE.id, name: SOURCE.name },
  lead: stripUndefined({ phone, email, name }),
  // utm.source = "awsales" e OBRIGATORIO para a conversao aparecer no dashboard.
  utm: { source: 'awsales' },
  // metadata OPCIONAL (rastreio/debug). Pode remover sem quebrar o output.
  metadata: stripUndefined({
    order_id: firstNonBlank([body.order_id, raw.order_id]),
    amount: firstNonBlank([body.amount, raw.amount]),
    product_id: firstNonBlank([body.product_id, raw.product_id]),
    product_name: firstNonBlank([body.product_name, raw.product_name]),
    dosable_lead_id: firstNonBlank([body.customer_id, raw.customer_id]),
    dosable_session_id: firstNonBlank([body.session_id, raw.session_id]),
    thankyou_link: raw.thankyou_link,
    dosable_event_type: firstNonBlank([body.dosable_event_type, raw.event_type]),
  }),
};

// Mode "Run Once for Each Item": retornar UM objeto { json: {...} }, nao um array.
// (Array [{ json }] e o formato do modo "Run Once for All Items".)
return {
  json: {
    awsales_payload: awsalesPayload,
    awsales_payload_json: JSON.stringify(awsalesPayload),
    should_send_output: shouldSendOutput,
  },
};
