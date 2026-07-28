// n8n Code node: monta o OUTPUT da campanha quando o lead fecha pelo WhatsApp.
// Mode: Run Once for Each Item.
//
// Posicao no fluxo (fluxo de baixo da imagem):
//   tool-ai-handoff (webhook) -> Code in JavaScript3 (normalizer) -> HTTP Request3
//   (POST /ai-handoff) -> ESTE Code node -> IF should_send_output -> HTTP Request AWSales
//
// Objetivo: quando a tool /ai-handoff retorna checkout_url (ok:true), o lead chegou
// ao checkout PELO WHATSAPP. Isso e o OUTPUT da campanha "Recuperacao de Formulario".
// Mandamos por uma integracao DEDICADA (Custom Action) so para esse output, para
// isolar do fluxo do site.
//
// Integracao destino (Custom Action) -> HTTP Request depois deste node:
// - Method: POST
// - URL: https://app.awsales.io/api/webhooks/organizations/
//        b34f181e-c7b3-49fb-b69f-3454a7336df2/credentials/output-envio-da-tool
// - Headers: Accept: application/json | Content-Type: application/json
// - Body: Raw JSON -> {{$json.awsales_payload_json}}
// - So chamar quando {{$json.should_send_output}} === true (node IF antes).
//
// Schema Custom Action (campos obrigatorios): event, timestamp, source.id,
// source.name, lead.phone, lead.email. IMPORTANTE: utm.source DEVE ser "awsales"
// senao a conversao nao aparece no dashboard. O metadata e opcional (mantido minimo
// so para rastreio/debug; pode remover sem quebrar o output).
//
// IMPORTANTE: o nome do webhook node referenciado abaixo precisa bater com o do seu
// fluxo. Na imagem esta como "tool-ai-handoff". Ajuste se voce renomear.

const SOURCE = {
  id: 'nuestra_rx_ai_handoff_checkout',
  name: 'Nuestra RX - Checkout via WhatsApp (ai-handoff)',
};

const WEBHOOK_NODE = 'tool-ai-handoff';

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

function get(obj, path) {
  if (!obj) return undefined;
  let cur = obj;
  for (const part of String(path).split('.')) {
    if (cur === null || cur === undefined || typeof cur !== 'object') return undefined;
    cur = cur[part];
  }
  return cur;
}

// Telefone para +E164 (mesma forma do input forms-site: contact.phone_e164 "+5531...").
// Garante que o output case com o mesmo lead que o input criou no AWSales.
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

function stripUndefined(obj) {
  const out = {};
  for (const [k, v] of Object.entries(obj)) {
    if (v === undefined || v === null) continue;
    if (typeof v === 'string' && v.trim() === '') continue;
    out[k] = v;
  }
  return out;
}

// Resposta do HTTP Request3 (/ai-handoff): { ok, session_id, lead_id, checkout_url, product, plan, tenant_id }
const res = $input.item.json || {};

// Payload original que a IA mandou para a tool (tem contact + metadata ricos).
let webhookBody = {};
try {
  webhookBody = get($(WEBHOOK_NODE).item.json, 'body') || $(WEBHOOK_NODE).item.json || {};
} catch (error) {
  webhookBody = {};
}

const contact = webhookBody.contact || {};
const metadata = webhookBody.metadata || {};

// So vira OUTPUT quando a tool realmente gerou checkout (lead chegou ao checkout).
const checkoutUrl = firstNonBlank([res.checkout_url, get(res, 'body.checkout_url')]);
const ok = res.ok === true || get(res, 'body.ok') === true;
const shouldSendOutput = ok === true && !isBlank(checkoutUrl);

const phone = toE164(firstNonBlank([
  contact.phone_e164,
  contact.phone,
  metadata.whatsapp_url,
  metadata.lead_phone,
]));

const email = firstNonBlank([contact.email, metadata.lead_email]);

const firstName = firstNonBlank([contact.first_name, metadata.lead_first_name]);
const lastName = firstNonBlank([contact.last_name, metadata.lead_last_name]);
const name = [firstName, lastName].filter(Boolean).join(' ') || undefined;

const awsalesPayload = {
  // custom_action = acao customizada: lead chegou ao checkout pela tool no WhatsApp.
  event: 'custom_action',
  timestamp: new Date().toISOString(),
  source: { id: SOURCE.id, name: SOURCE.name },
  lead: stripUndefined({ phone, email, name }),
  // utm.source = "awsales" e OBRIGATORIO para a conversao aparecer no dashboard.
  utm: { source: 'awsales' },
  // metadata OPCIONAL (so rastreio/debug). Pode remover este bloco sem quebrar nada.
  metadata: stripUndefined({
    checkout_url: checkoutUrl,
    dosable_lead_id: firstNonBlank([res.lead_id, metadata.dosable_lead_id]),
    dosable_session_id: firstNonBlank([res.session_id, metadata.dosable_session_id]),
    selected_medication: firstNonBlank([res.product, webhookBody.product]),
    selected_plan: firstNonBlank([res.plan, webhookBody.plan]),
  }),
};

return [
  {
    json: {
      awsales_payload: awsalesPayload,
      awsales_payload_json: JSON.stringify(awsalesPayload),
      should_send_output: shouldSendOutput,
      tool_result: res,
    },
  },
];
