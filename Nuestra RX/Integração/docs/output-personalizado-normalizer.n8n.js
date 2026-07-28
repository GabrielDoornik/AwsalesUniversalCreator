// n8n Code node: normaliza o payload da tool @output_desqualificado para o webhook
// de Output Personalizado da AWSales (path do webhook: output-personalizado).
// Mode: Run Once for All Items.
//
// Fluxo: Webhook (output-personalizado) -> ESTE Code -> HTTP Request (POST AWSales).
//
// HTTP Request node depois deste code:
// - Method: POST
// - URL: https://app.awsales.io/api/webhooks/organizations/b34f181e-c7b3-49fb-b69f-3454a7336df2/credentials/output-personalizado
// - Headers: Accept: application/json | Content-Type: application/json
// - Body (JSON): {{ $json.awsales_payload }}
//   (se o n8n nao mandar objeto direito, use Raw/JSON: {{ $json.awsales_payload_json }})
//
// Proposito: quando o lead e DESQUALIFICADO no meio da conversa, o checkpoint chama
// esta tool. O output fecha a janela do lead na AWSales para NAO disparar follow-up.
//
// A IA manda { nome, phone, email }. Se algum faltar, INVENTAMOS um fallback valido
// (o phone praticamente sempre vem; email/nome as vezes nao). O importante e o payload
// nunca quebrar por campo vazio e o lead.phone chegar para casar a janela certa.

const CONFIG = {
  // OBRIGATORIO ser "custom_action": a AWSales so PROCESSA o output personalizado
  // quando event == "custom_action". Com outro nome ela responde 200/success mas nao
  // executa a acao (a janela nao fecha). O tipo especifico da acao vai em metadata.event_type.
  event: 'custom_action',
  // Identificador da acao (vai em metadata.event_type). Confirmar com o tech qual e o
  // valor que o output de cierre escuta; "lead_descalificado" e o nosso rotulo.
  eventType: 'lead_descalificado',
  sourceId: 'output_personalizado_cierre',
  sourceName: 'Cierre de ventana - lead descalificado',
  // Dominio usado quando precisamos inventar um email (placeholder valido).
  fallbackEmailDomain: 'sin-correo.nuestrarx.com',
};

function get(obj, path) {
  if (!obj) return null;
  const parts = String(path).split('.');
  let cur = obj;
  for (const p of parts) {
    if (cur === null || cur === undefined || typeof cur !== 'object') return null;
    cur = cur[p];
  }
  return cur === undefined ? null : cur;
}

function isBlank(v) {
  if (v === null || v === undefined) return true;
  if (typeof v === 'string') return v.trim() === '';
  return false;
}

// "n/a", "none", "ninguno", "-", "null" etc. contam como vazio -> inventamos.
function isPlaceholder(v) {
  if (isBlank(v)) return true;
  const s = String(v).trim().toLowerCase();
  return ['n/a', 'na', 'none', 'null', 'undefined', 'ninguno', 'ninguna', '-', '--', '.'].includes(s);
}

function clean(v) {
  return isPlaceholder(v) ? null : String(v).trim();
}

// Telefone -> E.164 (so digitos com + na frente). "5531987424967" -> "+5531987424967".
function normalizePhone(v) {
  const digits = String(v || '').replace(/\D/g, '');
  if (!digits) return null;
  return '+' + digits;
}

function validEmail(v) {
  const s = clean(v);
  if (!s) return null;
  return /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(s) ? s : null;
}

function unwrap(input) {
  const j = input && input.json ? input.json : input;
  if (j && j.body && (j.body.phone || j.body.email || j.body.nome || j.body.name)) return j.body;
  if (j && j.body) return j.body;
  return j || {};
}

function normalizeItem(inputItem) {
  const body = unwrap(inputItem);

  const rawPhone = body.phone || body.telefone || get(body, 'lead.phone');
  const rawEmail = body.email || get(body, 'lead.email');
  const rawName = body.nome || body.name || get(body, 'lead.name');

  // Phone: normaliza; se faltar (raro/"impossivel"), inventa um placeholder.
  const phone = normalizePhone(rawPhone) || '+550000000000';
  const phoneDigits = phone.replace(/\D/g, '');

  // Email: valida; se faltar/placeholder, inventa um valido a partir do phone.
  const email = validEmail(rawEmail) || ('lead' + phoneDigits + '@' + CONFIG.fallbackEmailDomain);

  // Nome: usa o que veio; se faltar, "Lead".
  const name = clean(rawName) || 'Lead';

  const awsales_payload = {
    event: CONFIG.event,
    timestamp: new Date().toISOString(),
    source: {
      id: CONFIG.sourceId,
      name: CONFIG.sourceName,
    },
    lead: {
      phone: phone,
      email: email,
      name: name,
    },
    metadata: {
      event_type: CONFIG.eventType,
      action_details: 'Lead desqualificado na conversa. Fechar a janela e nao enviar follow-up.',
      reason: 'lead_descalificado',
      intent_level: 'disqualified',
      context_notes: 'Disparado pela tool @output_desqualificado a partir do checkpoint quando um gate de desqualificacao foi confirmado.',
    },
  };

  return {
    awsales_payload,
    awsales_payload_json: JSON.stringify(awsales_payload),
    diagnostics: {
      phone_invented: isPlaceholder(rawPhone),
      email_invented: !validEmail(rawEmail),
      name_invented: isPlaceholder(rawName),
    },
  };
}

const inputItems = $input.all();
return inputItems.map((item) => ({ json: normalizeItem(item) }));
