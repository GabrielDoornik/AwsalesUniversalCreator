# PARTIAL — Payload Real CKC Postback

Evento disparado quando lead é criado no CKC sem completar checkout (ex: visitante do funil Dosable abandonou na página de pagamento, ou Order Entry concluído sem captura).

**Customer Type CKC:** `Partial`
**Profile receptor:** `Nuestra-AWSales-Dev`
**URL n8n:** `https://n8n-dev.awsales.io/webhook/nuestra-champ`
**Capturado em:** 2026-05-28 via retry queue do CKC após adicionar route `Partial` no profile.

---

## Headers HTTP

```
host: n8n-dev.awsales.io
x-original-forwarded-for: 44.219.22.112
cf-connecting-ip: 44.219.22.112
cf-ipcountry: US
content-type: application/json
content-length: 460-561
accept: */*
accept-encoding: gzip, br
```

**Notas:**
- IP de origem `44.219.22.112` bate com lista oficial CKC: `80.248.30.132, 80.248.30.141, 52.206.5.84, 44.219.22.112`
- Cloudflare na frente do n8n. IP real só em `x-original-forwarded-for` e `cf-connecting-ip` (NÃO em `x-real-ip` que vem `10.60.0.1`)
- `content-type: application/json` confirma que Field Mappings com header `Content-Type: application/json` + `httpMethod: POST` força JSON body (default CKC seria GET com query string)

---

## Sample 1 — Origem Dosable Funnel (Jose Dias)

Lead que entrou no funil Dosable, preencheu quiz, abandonou na página de checkout. Note `custom1` (UUID Dosable) e `custom2: "Checkout Page"` indicando origem do funil.

```json
{
  "billingCycleNumber": "ONE_TIME",
  "campaignId": 17,
  "campaignName": "NUESTRARX - WEIGHTLOSS - STAGING",
  "clientOrderId": "D5A8EFC4EC",
  "currencyCode": "USD",
  "custom1": "5066c3d9-0349-4d86-b2be-a899286d53d4",
  "custom2": "Checkout Page",
  "customerId": 5,
  "declineReason": "Unknown Error",
  "emailAddress": "josedias@gmail.com",
  "firstName": "Jose",
  "ipAddress": "68.132.130.116",
  "lastName": "Dias",
  "orderId": 7,
  "orderStatus": "PARTIAL",
  "orderTotal": 279,
  "phoneNumber": "6782231111",
  "recurringPrice": "",
  "recurringStatus": "ONE_TIME",
  "salesTax": "0.00",
  "totalDiscount": "0.00",
  "totalShipping": 0
}
```

## Sample 2 — Origem Order Entry manual (Test User3)

Entrada via Customer Service → Order Entry sem completar. Sem custom1/custom2 (não veio do funil) e sem `ipAddress` (Order Entry roda do painel CKC).

```json
{
  "billingCycleNumber": "ONE_TIME",
  "campaignId": 17,
  "campaignName": "NUESTRARX - WEIGHTLOSS - STAGING",
  "clientOrderId": "41C65E08F5",
  "currencyCode": "USD",
  "customerId": 1,
  "declineReason": "Unknown Error",
  "emailAddress": "teste3@nuestrarx.com",
  "firstName": "Test",
  "lastName": "User3",
  "orderId": 3,
  "orderStatus": "PARTIAL",
  "orderTotal": 179,
  "phoneNumber": "5555555555",
  "recurringPrice": "",
  "recurringStatus": "ONE_TIME",
  "salesTax": "0.00",
  "totalDiscount": "0.00",
  "totalShipping": 0
}
```

---

## Diferenças entre samples

| Campo | Funnel (Jose) | Order Entry (Test User3) |
|---|---|---|
| `custom1` | UUID Dosable | ausente |
| `custom2` | `"Checkout Page"` | ausente |
| `ipAddress` | IP real do visitante | ausente |
| `orderTotal` | 279 (Tirzepatide) | 179 (Rush Semaglutide) |

**Implicação pro normalizer:** campos opcionais. Usar `?.` ou fallback null. Não assumir presença.

---

## Campos chegados (subset dos 50 Field Mappings)

Só campos com valor populado pelo evento Partial. Os outros 28-30 campos do mapping ficaram `[null]` ou vazios e foram omitidos do JSON.

```
billingCycleNumber, campaignId, campaignName, clientOrderId,
currencyCode, custom1, custom2, customerId, declineReason,
emailAddress, firstName, lastName, phoneNumber, ipAddress,
orderId, orderStatus, orderTotal, recurringPrice,
recurringStatus, salesTax, totalDiscount, totalShipping
```

Campos ausentes (do Field Mapping mas nulos pra Partial):
- `actualTransactionId`, `transactionId`, `cardLast4`, `cardType`, `cardExpiryDate`, `paySource`, `gatewayTitle` — sem captura ainda
- `chargebackAmount`, `chargebackReasonCode`, `chargebackDate`, `dateRefunded`, `refundReason`, `originalOrderId` — N/A pra Partial
- `trackingNumber`, `shipCarrier`, `fulfillmentStatus` — sem fulfillment
- `subAffId`, `sourceId`, `purchaseId`, `clientPurchaseId`, `clientTxnId` — depende do tracking
- `nextBillDate`, `recurringPrice` (vazia string aqui) — só rebill ativo
- `header:httpMethod`, `header:Content-Type` — viram headers HTTP, não body

---

## Notas pro normalizer

- `orderStatus: "PARTIAL"` é o discriminator do evento. Map pra evento AWSales (provavelmente `ABANDONED_CART` ou similar).
- `currencyCode: "USD"` precisa virar `"US"` (enum AWSales — confirmado no normalizer NMI).
- `declineReason: "Unknown Error"` em PARTIAL pode confundir. Significa "checkout abandonado sem tentar pagamento", não "cartão recusado". Não usar como erro real.
- `customerId` (5, 1) é ID interno CKC. Não confundir com `clientOrderId` (D5A8EFC4EC) que é o ID alphanumeric público.
- `orderId` (7, 3) é ID numérico interno do order. `clientOrderId` é o display público.
- `recurringStatus: "ONE_TIME"` indica que não é assinatura ativa. Subscription ativa viria com `RECURRING` ou similar.
