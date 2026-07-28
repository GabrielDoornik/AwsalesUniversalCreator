// n8n Code node: normaliza o evento rx_written -> Custom Action (OUTPUT/conversao da
// campanha de ONBOARDING 1 / "Aguardando aprovacao do medico" da Nuestra RX).
// Mode: Run Once for Each Item.
//
// Contexto: rx_written dispara quando a Beluga Health PRESCREVE/APROVA o pedido
// ("Rx Written - happens when Beluga prescribed the order"). E o momento em que o
// medico aprova => a fase de ESPERA acabou => encerra a campanha de Onboarding.
// NAO confundir com order_paid (checkout_complete / pre-save $0), que e o INPUT que
// ABRE o Onboarding (e o output da Recuperacao de Vendas). Ver:
//   ../../Campanhas/Recuperacao de vendas/Contexto.md
//   ./order-paid-output-awsales.n8n.js  (mesmo padrao, evento diferente)
//
// Posicao no fluxo (mesmo webhook forms-site, roteado por evento):
//   Forms-site (webhook) -> [Switch/IF] body.event == "rx_written" -> ESTE Code node
//   -> HTTP Request (POST AWSales, integracao DEDICADA de OUTPUT do onboarding)
//
// O HTTP Request depois deste node:
// - Method: POST
// - URL: credencial Custom Action DEDICADA do onboarding (criar no painel, isolada das
//        outras, ex: .../credentials/output-rx-written).
// - Send Body: JSON -> {{$json.awsales_payload}}  (ou Raw -> {{$json.awsales_payload_json}})
// - So chamar quando {{$json.should_send_output}} === true (garante email+phone p/ casar o lead).
//
// Schema Custom Action: obrigatorios event, timestamp, source.id, source.name,
// lead.phone, lead.email. utm.source DEVE ser "awsales". metadata e opcional.
//
// MATCHER: o email e o matcher confiavel (igual ao order_paid). No rx_written de teste o
// phone veio em +E164 ok, mas validar no dado real; se vier estripado, o email ainda casa.

const SOURCE = {
  id: 'nuestra_rx_rx_written',
  name: 'Nuestra RX - Receita aprovada (rx_written / fim da espera)',
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

// Telefone para +E164 (best-effort). O matcher confiavel e o email.
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

// Item do webhook forms-site (ja filtrado por event == rx_written no Switch/IF anterior).
const item = $input.item.json || {};
const body = item.body || item;
const raw = body.dosable_raw || {};

const email = firstNonBlank([body.email, raw.email]);
const phone = toE164(firstNonBlank([body.phone, raw.phone]));
const name = [firstNonBlank([raw.first_name]), firstNonBlank([raw.last_name])]
  .filter(Boolean)
  .join(' ') || undefined;

// So manda se for mesmo rx_written e tiver os dois campos obrigatorios do lead.
const shouldSendOutput =
  body.event === 'rx_written' && !isBlank(email) && !isBlank(phone);

const awsalesPayload = {
  // custom_action = conversao do onboarding (medico aprovou => fim da espera).
  event: 'custom_action',
  timestamp: normalizeTimestamp(body.received_at),
  source: { id: SOURCE.id, name: SOURCE.name },
  lead: stripUndefined({ phone, email, name }),
  // utm.source = "awsales" e OBRIGATORIO para a conversao aparecer no dashboard.
  utm: { source: 'awsales' },
  // metadata OPCIONAL no schema, mas a campanha usa product_name e order_id para personalizar.
  metadata: stripUndefined({
    order_id: firstNonBlank([body.order_id, raw.order_id]),
    product_id: firstNonBlank([body.product_id, raw.product_id]),
    product_name: firstNonBlank([body.product_name, raw.product_name]),
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
