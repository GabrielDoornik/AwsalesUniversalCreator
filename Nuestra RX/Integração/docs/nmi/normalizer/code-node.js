// =============================================================================
// Nuestra RX — Normalizer NMI → AWSales
// =============================================================================
// Code node do n8n. Cola no nó "Code" (JavaScript) DEPOIS do Webhook trigger
// (e idealmente depois do nó de validação HMAC).
//
// Input esperado: payload bruto do webhook NMI (ver docs/nmi/normalizer/sample-real-payload.md).
// Output: objeto no formato AWSales pronto pra POST em
//   https://app.awsales.io/api/webhooks/organizations/{org_id}/credentials/nmi-checkout
//
// Eventos não mapeados retornam { _skip: true } — filtrar com IF node depois.
//
// Documentação do mapeamento: docs/nmi/normalizer/mapping.md
// =============================================================================

const inputItem = $input.first().json;

// Aceita payload bruto OU já desembrulhado (se houver pre-processamento)
const body = inputItem.body || inputItem;
const eb = body.event_body || {};
const eventType = body.event_type;

// -----------------------------------------------------------------------------
// 1. Mapeamentos NMI → AWSales
// -----------------------------------------------------------------------------
const EVENT_MAP = {
  'transaction.sale.success':     'APPROVED_PURCHASE',
  'transaction.auth.success':     'APPROVED_PURCHASE',
  'transaction.capture.success':  'COMPLETED_PURCHASE',
  'transaction.sale.failure':     'REFUSED_PURCHASE',
  'transaction.auth.failure':     'REFUSED_PURCHASE',
  'transaction.capture.failure':  'REFUSED_PURCHASE',
  'transaction.refund.success':   'REFUNDED_PURCHASE',
  'transaction.void.success':     'REFUNDED_PURCHASE',
  'chargeback.batch.complete':    'CHARGED_BACK',
  'recurring.subscription.add':   'APPROVED_PURCHASE',
};

const STATUS_MAP = {
  'transaction.sale.success':     'APPROVED',
  'transaction.auth.success':     'APPROVED',
  'transaction.capture.success':  'COMPLETED',
  'transaction.sale.failure':     'REFUSED',
  'transaction.auth.failure':     'REFUSED',
  'transaction.capture.failure':  'REFUSED',
  'transaction.refund.success':   'REFUND_REQUESTED',
  'transaction.void.success':     'CANCELED',
  'chargeback.batch.complete':    'CHARGEBACK',
  'recurring.subscription.add':   'APPROVED',
};

const awsaleEvent = EVENT_MAP[eventType];

// Evento não mapeado → sinaliza skip (usar IF node downstream pra filtrar)
if (!awsaleEvent) {
  return [{
    json: {
      _skip: true,
      _reason: `NMI event_type "${eventType}" não mapeado para AWSales enum`,
      _original_event_id: body.event_id || null,
      _original_event_type: eventType || null,
    },
  }];
}

// -----------------------------------------------------------------------------
// 2. Helpers
// -----------------------------------------------------------------------------
function parseNmiDate(d) {
  // NMI: "YYYYMMDDhhmmss" → ISO 8601 UTC: "YYYY-MM-DDTHH:MM:SSZ"
  // ⚠️ Assume UTC — confirmar com NMI se timezone for outro
  if (!d || typeof d !== 'string' || d.length !== 14) {
    return new Date().toISOString();
  }
  const y  = d.substring(0, 4);
  const mo = d.substring(4, 6);
  const da = d.substring(6, 8);
  const h  = d.substring(8, 10);
  const mi = d.substring(10, 12);
  const s  = d.substring(12, 14);
  return `${y}-${mo}-${da}T${h}:${mi}:${s}Z`;
}

function parseAmount(s) {
  // NMI manda string "1.00" → number 1.00 (2 casas)
  if (s === null || s === undefined || s === '') return 0;
  const n = parseFloat(s);
  return isNaN(n) ? 0 : Math.round(n * 100) / 100;
}

function mapPaymentMethod(txnType) {
  // NMI: cc / ck / cs → AWSales enum: CREDIT_CARD / PIX / BOLETO
  // Nuestra RX é cc-first; ck (ACH) e cs (cash) não estão no enum AWSales
  if (txnType === 'cc') return 'CREDIT_CARD';
  return 'CREDIT_CARD'; // fallback
}

function mapCurrency(cur) {
  // AWSales enum: BRL, US, EUR (sic — "US" não "USD", mantido fiel à doc)
  if (cur === 'USD') return 'US';
  if (cur === 'BRL') return 'BRL';
  if (cur === 'EUR') return 'EUR';
  return 'US'; // fallback Nuestra RX
}

function lastFour(maskedCard) {
  if (!maskedCard || typeof maskedCard !== 'string') return null;
  return maskedCard.slice(-4);
}

// -----------------------------------------------------------------------------
// 3. Extrair campos
// -----------------------------------------------------------------------------
const billing = eb.billing_address || {};
const action  = eb.action || {};
const card    = eb.card || {};
const mdf     = eb.merchant_defined_fields || {};
const features = eb.features || {};

const isTestMode = features.is_test_mode === true;

// Fallbacks pra test mode (Virtual Terminal raramente preenche email/phone).
// Em prod (Dosable → CKC → NMI), esses dados vêm do checkout — não cai aqui.
const PLACEHOLDER_EMAIL = `nmi-${eb.transaction_id || 'unknown'}@example.com`;
const PLACEHOLDER_PHONE = '+10000000000';

const userName = [billing.first_name, billing.last_name]
  .filter(Boolean)
  .join(' ')
  .trim() || 'Unknown';

const rawEmail = billing.email || '';
const rawPhone = billing.phone || billing.cell_phone || '';

// AWSales valida email/phone obrigatórios. Estratégia:
// - Se tem dado real → usa
// - Se vazio E test_mode → usa placeholder pra teste passar
// - Se vazio E NÃO test_mode → marca skip (em prod, falta de dado é red flag)
let userEmail = rawEmail;
let userPhone = rawPhone;
const usedPlaceholders = [];

if (!rawEmail) {
  if (isTestMode) {
    userEmail = PLACEHOLDER_EMAIL;
    usedPlaceholders.push('email');
  } else {
    return [{
      json: {
        _skip: true,
        _reason: `email ausente em transação live (transaction_id ${eb.transaction_id}). Investigar antes de seguir.`,
        _original_event_id: body.event_id || null,
      },
    }];
  }
}

if (!rawPhone) {
  if (isTestMode) {
    userPhone = PLACEHOLDER_PHONE;
    usedPlaceholders.push('phone');
  } else {
    return [{
      json: {
        _skip: true,
        _reason: `phone ausente em transação live (transaction_id ${eb.transaction_id}). Investigar antes de seguir.`,
        _original_event_id: body.event_id || null,
      },
    }];
  }
}

const totalValue = parseAmount(action.amount || eb.requested_amount);
const isSubscription = eventType.startsWith('recurring.subscription');

// -----------------------------------------------------------------------------
// 4. Montar output AWSales
// -----------------------------------------------------------------------------
const output = {
  event: awsaleEvent,
  created_at: parseNmiDate(action.date),

  user: {
    name: userName,
    email: userEmail,
    phone: userPhone,
  },

  producer: {
    name: eb.merchant?.name || 'Nuestra RX LLC',
  },

  transaction: {
    id: eb.transaction_id || '',
    type: isSubscription ? 'subscription' : 'one_time',
    status: STATUS_MAP[eventType] || 'APPROVED',
    payment_method: mapPaymentMethod(eb.transaction_type),
    total_value: totalValue,
    fee: 0.00,
    net_value: totalValue,
    installments: 1,
    cycle: 1,
    currency: mapCurrency(eb.currency),
    items: [{
      product: {
        id: eb.order_id || `nmi-${eb.transaction_id || 'unknown'}`,
        name: eb.order_description || 'Nuestra RX Product',
        price: totalValue,
        offer: {
          id: mdf.offer_id || 'default',
          name: mdf.offer_name || 'Geral',
        },
      },
      quantity: 1,
      total_value: totalValue,
      fee: 0.00,
      net_value: totalValue,
    }],
  },

  payment_links: {
    pix_url: null,
    boleto_url: null,
  },

  utm: {
    source:   mdf.utm_source   || 'awsales',
    campaign: mdf.utm_campaign || null,
    medium:   mdf.utm_medium   || null,
    content:  mdf.utm_content  || null,
    term:     mdf.utm_term     || null,
  },

  metadata: {
    nmi_event_id:           body.event_id || null,
    nmi_event_type:         eventType,
    nmi_merchant_id:        eb.merchant?.id || null,
    nmi_processor_id:       eb.processor_id || null,
    nmi_authorization_code: eb.authorization_code || null,
    nmi_response_code:      action.response_code || null,
    nmi_transaction_type:   eb.transaction_type || null,
    nmi_is_test_mode:       features.is_test_mode === true,
    nmi_card_last4:         lastFour(card.cc_number),
    nmi_card_bin:           card.cc_bin || null,
    nmi_card_type:          card.cc_type || null,
    nmi_placeholders_used:  usedPlaceholders.length ? usedPlaceholders.join(',') : null,
  },
};

return [{ json: output }];
