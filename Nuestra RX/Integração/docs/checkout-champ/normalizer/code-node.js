// =====================================================================
// NORMALIZER — Checkout Champ Postback -> AWSales Webhook
// =====================================================================
// n8n Code node. Roda após Webhook trigger /webhook/nuestra-champ.
// Transforma payload CKC no formato esperado pelo endpoint AWSales:
//   POST https://app.awsales.io/api/webhooks/organizations/
//        b34f181e-c7b3-49fb-b69f-3454a7336df2/credentials/checkout-champ
//
// Customer types cobertos (8 samples reais 2026-05-28):
//   - New Sale (PREPAID + CREDITCARD)  -> APPROVED_PURCHASE
//   - Capture                          -> COMPLETED_PURCHASE
//   - Rebill                           -> COMPLETED_PURCHASE (subscription)
//   - Refunded                         -> REFUNDED_PURCHASE
//   - Declined (Cancel + decline real) -> REFUSED_PURCHASE
//   - Partial                          -> SKIP (sem mapping AWSales)
//   - Paused / Chargeback              -> SKIP (sample ainda pendente)
//
// Output:
//   - Se evento normalizado -> { json: <payload AWSales> } pra HTTP Request
//   - Se skipado            -> [] (array vazio). n8n não passa nada pro próximo
//                              nó, então HTTP Request não roda. Sem IF necessário.
// =====================================================================

const input = $input.first().json;
const body = input.body || input;

// ---------- Helpers ----------
const num = v => {
  const n = parseFloat(v);
  return Number.isFinite(n) ? n : 0;
};
const money = v => Math.round(num(v) * 100) / 100;
const trim = v => String(v == null ? "" : v).trim();
const orNull = v => {
  const t = trim(v);
  return t.length ? t : null;
};

const cycle = parseInt(body.billingCycleNumber, 10);
const cycleSafe = Number.isFinite(cycle) && cycle > 0 ? cycle : 1;
const isRebill =
  cycleSafe > 1 &&
  body.originalOrderId &&
  String(body.originalOrderId) !== String(body.orderId);

// ---------- 1. Decide event AWSales + transaction.status ----------
let event, txStatus, skipReason = null;
const orderStatus = trim(body.orderStatus);

if (orderStatus === "PARTIAL") {
  skipReason = "PARTIAL — lead sem compra, enum AWSales não cobre";
} else if (orderStatus === "REFUNDED") {
  event = "REFUNDED_PURCHASE";
  txStatus = "REFUND_REQUESTED";
} else if (orderStatus === "DECLINED") {
  event = "REFUSED_PURCHASE";
  // Cancel manual via UI vs decline real do gateway
  txStatus = trim(body.fulfillmentStatus) === "CANCELLED" ? "CANCELED" : "REFUSED";
} else if (orderStatus === "COMPLETE" && isRebill) {
  event = "COMPLETED_PURCHASE";
  txStatus = "COMPLETED";
} else if (orderStatus === "COMPLETE") {
  event = "COMPLETED_PURCHASE";
  txStatus = "COMPLETED";
} else if (orderStatus === "PENDING" && trim(body.responseType) === "SUCCESS") {
  event = "APPROVED_PURCHASE";
  txStatus = "APPROVED";
} else {
  skipReason = `Sem mapping pro orderStatus="${orderStatus}" responseType="${trim(body.responseType)}"`;
}

if (skipReason) {
  // Log no console do n8n pra debug (visível nas Executions)
  console.log(`[CKC Normalizer] SKIP — ${skipReason} — order ${trim(body.clientOrderId)}`);
  // Retorna array vazio: n8n não passa nada adiante, HTTP Request não dispara
  return [];
}

// ---------- 2. Currency ----------
const currencyMap = { USD: "US", BRL: "BRL", EUR: "EUR" };
const currency = currencyMap[trim(body.currencyCode)] || "US";

// ---------- 3. Payment method ----------
// CKC paySource conhecidos: CREDITCARD, PREPAID
// AWSales enum: PIX, BOLETO, CREDIT_CARD
const paySourceMap = {
  CREDITCARD: "CREDIT_CARD",
  PREPAID: "CREDIT_CARD" // External Payment fallback (não tem PREPAID no enum)
};
const paymentMethod = paySourceMap[trim(body.paySource)] || "CREDIT_CARD";

// ---------- 4. Transaction type ----------
// one_time = sem subscription, subscription = qualquer cycle de subscription
const billingType = trim(body.billingCycleNumber);
const txType = billingType === "ONE_TIME" ? "one_time" : "subscription";

// ---------- 5. Phone (normaliza pra +DDI) ----------
let phone = trim(body.phoneNumber).replace(/[^\d+]/g, "");
if (phone && !phone.startsWith("+")) {
  if (phone.startsWith("55") && phone.length >= 12) phone = "+" + phone;
  else if (phone.length === 11 && phone.startsWith("1")) phone = "+" + phone;
  else if (phone.length === 10) phone = "+1" + phone; // US default
  else phone = "+" + phone; // fallback
}

// ---------- 6. Items ----------
// Field Mapping CKC inclui productName (product1_name) + productId (product1_crmId).
// Quando presentes, usar; senão fallback pro campaignName.
const totalValue = money(body.orderTotal);
const offerId = `ckc_campaign_${body.campaignId || "unknown"}`;
const offerName = trim(body.campaignName) || "Geral";

const productName = orNull(body.productName) || offerName;
const productId = orNull(body.productId)
  || orNull(body.clientPurchaseId)
  || `ckc_${body.campaignId}_${body.orderId}`;

const items = [{
  product: {
    id: productId,
    name: productName,
    price: totalValue,
    offer: {
      id: offerId,
      name: offerName
    }
  },
  quantity: 1,
  total_value: totalValue,
  fee: 0.00,
  net_value: totalValue
}];

// ---------- 7. created_at ----------
// CKC não envia timestamp no body. Usa Now em UTC (ISO 8601 Z).
const createdAt = new Date().toISOString().replace(/\.\d{3}Z$/, "Z");

// ---------- 8. Monta payload final ----------
const userName = `${trim(body.firstName)} ${trim(body.lastName)}`.trim() || "(sem nome)";

const out = {
  event,
  created_at: createdAt,
  user: {
    name: userName,
    email: trim(body.emailAddress),
    phone: phone
  },
  producer: {
    name: "Nuestra RX LLC"
  },
  transaction: {
    id: trim(body.clientOrderId),
    type: txType,
    status: txStatus,
    payment_method: paymentMethod,
    total_value: totalValue,
    fee: 0.00,
    net_value: totalValue,
    installments: 1,
    cycle: cycleSafe,
    currency,
    items
  },
  payment_links: {
    pix_url: null,
    boleto_url: null
  },
  utm: {
    source: "awsales", // obrigatório pra aparecer no dashboard AWSales
    campaign: trim(body.campaignName) || null,
    medium: null,
    content: null,
    term: null
  },
  metadata: {
    // Rastreio CKC
    ckc_order_id: trim(body.clientOrderId),
    ckc_purchase_id: orNull(body.clientPurchaseId),
    ckc_customer_id: body.customerId || null,
    ckc_transaction_id: orNull(body.transactionId),
    ckc_actual_transaction_id: body.actualTransactionId || null,
    ckc_client_txn_id: orNull(body.clientTxnId),
    ckc_original_order_id: orNull(body.originalOrderId),
    // Estados
    ckc_billing_cycle: trim(body.billingCycleNumber),
    ckc_recurring_status: orNull(body.recurringStatus),
    ckc_fulfillment_status: orNull(body.fulfillmentStatus),
    ckc_pay_source: orNull(body.paySource),
    ckc_decline_reason: orNull(body.declineReason),
    ckc_refund_reason: orNull(body.refundReason),
    ckc_next_bill_date: orNull(body.nextBillDate),
    ckc_date_refunded: orNull(body.dateRefunded),
    // Card (só preenchido em CREDITCARD)
    ckc_card_last4: orNull(body.cardLast4),
    ckc_card_type: orNull(body.cardType),
    // Origem do lead
    ckc_ip_address: orNull(body.ipAddress),
    dosable_custom1: orNull(body.custom1),
    dosable_custom2: orNull(body.custom2),
    // Flag útil
    is_rebill: isRebill
  }
};

return [{ json: out }];
