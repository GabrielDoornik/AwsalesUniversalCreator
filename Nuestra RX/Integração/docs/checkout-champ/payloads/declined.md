# DECLINED — Payload Real CKC Postback

⚠️ **IMPORTANTE:** Esse payload veio de uma ação **Cancel Order** no UI do CKC, NÃO de um decline real do gateway. CKC mistura os conceitos — Cancel Order é tratado como "QA Decline" internamente (confirma erro UI: *"Can only issue QA decline on orders in a Pending status"*).

Pro normalizer: **`orderStatus: "DECLINED"` pode representar TANTO Cancel quanto Decline real do cartão**. Pra desambiguar, olhar:
- `fulfillmentStatus: "CANCELLED"` + `recurringStatus: "CANCELLED"` → é **Cancel manual**
- `fulfillmentStatus: "HOLD"` (ou outro) + `responseType` ≠ SUCCESS → provável **Decline real do gateway**

**Customer Type CKC:** `Declined`
**Capturado em:** 2026-05-28 ~18:30 (delay ~15min do trigger 18:14).
**Origem do trigger:** Cancel Order (Cannot Afford reason) em order External Payment / PREPAID.

---

## Sample 1 — Cancel Order (Pedro Awsales External Payment)

Order criada com External Payment, em status Pending, cancelada manualmente via Cancel Order (Reason: Cannot Afford).

```json
{
  "actualTransactionId": 15,
  "billingCycleNumber": "1",
  "campaignId": 17,
  "campaignName": "NUESTRARX - WEIGHTLOSS - STAGING",
  "clientOrderId": "A9EFA50245",
  "clientPurchaseId": "9BB44020A7",
  "currencyCode": "USD",
  "customerId": 13,
  "declineReason": "Payment marked as Prepaid",
  "emailAddress": "test4@nuestrarx.com",
  "firstName": "Pedro",
  "fulfillmentStatus": "CANCELLED",
  "lastName": "Awsales",
  "orderId": 15,
  "orderStatus": "DECLINED",
  "orderTotal": "199.00",
  "originalOrderId": "15",
  "paySource": "PREPAID",
  "phoneNumber": "+5531987424967",
  "purchaseId": "9",
  "recurringPrice": "199.00",
  "recurringStatus": "CANCELLED",
  "responseType": "SUCCESS",
  "salesTax": "0.00",
  "shipCarrier": "Default",
  "totalDiscount": "0.00",
  "totalShipping": "0.00"
}
```

---

## Observações importantes

### 1. `declineReason` herdado, não específico
Campo `declineReason` veio `"Payment marked as Prepaid"` — mesmo valor do New Sale original dessa order. CKC NÃO substitui com motivo do cancel (não veio "Cannot Afford" que foi o reason da UI). Pro normalizer: não confiar em `declineReason` pra identificar motivo de cancel.

### 2. `agentNote` NÃO exportado
Testamos colocar `"TEST-NORMALIZER-2026-05-28"` no campo Agent Note do modal Cancel Order. **Não veio no payload.** Field Mapping não inclui `agentNote`. Se precisar capturar reason de cancel, terá que usar API CKC pra query depois (campo `notes` no order detail).

### 3. `responseType: "SUCCESS"`
Significa "a operação (cancel) foi bem-sucedida", não "pagamento OK". Confuso. Pra normalizer, ignorar `responseType` quando `orderStatus = DECLINED`.

### 4. Campos de status separados
3 status diferentes que mudaram coordenadamente:
- `orderStatus: DECLINED` (estado do order como um todo)
- `fulfillmentStatus: CANCELLED` (envio cancelado)
- `recurringStatus: CANCELLED` (subscription parada)

Pra confirmar "é cancel manual", os 3 precisam estar alinhados.

---

## Discriminator pro normalizer

```
if (orderStatus === "DECLINED") {
  if (fulfillmentStatus === "CANCELLED" && recurringStatus === "CANCELLED") {
    // → Cancel manual (mapear pra REFUSED_PURCHASE ou criar evento custom CANCELLED no AWSales)
  } else {
    // → Decline real do gateway (cartão recusado, etc) — REFUSED_PURCHASE
  }
}
```

⚠️ **Sample de decline real (cartão recusado pelo NMI) ainda NÃO capturado.** Hipótese sobre os campos acima precisa ser confirmada quando esse cenário aparecer.

---

## Notas pro normalizer

- **Map AWSales:** `REFUSED_PURCHASE` cobre tanto Cancel manual quanto Decline real do gateway. Se AWSales não diferenciar, pode usar `REFUSED_PURCHASE` pra ambos. Se quiser diferenciar, fica como `CANCELLED_MANUAL` vs `REFUSED_PAYMENT`.
- **`orderTotal` continua $199** mesmo após cancel — valor do order, não invalida com cancel.
- **`recurringStatus: CANCELLED`** indica que subscription foi morta. Diferente de `PENDING` (Refunded) ou `ACTIVE` (post-Capture).
