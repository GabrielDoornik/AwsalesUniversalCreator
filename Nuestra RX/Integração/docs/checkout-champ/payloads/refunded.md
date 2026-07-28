# REFUNDED — Payload Real CKC Postback

Evento disparado quando order é refundada no CKC (Full Refund via painel Actions). Confirmado: **Externally Refunded também dispara postback** (mesmo sem chamar gateway).

**Customer Type CKC:** `Refunded`
**Capturado em:** 2026-05-28 18:04 (delay ~15min do trigger).

---

## Sample — Externally Refunded (Pedro Awsales)

Order originalmente External Payment / PREPAID. Full Refund executado com toggle "Refunded Externally?" ON + Reason: RDR.

```json
{
  "actualTransactionId": 9,
  "billingCycleNumber": "1",
  "campaignId": 17,
  "campaignName": "NUESTRARX - WEIGHTLOSS - STAGING",
  "clientOrderId": "B94140F702",
  "clientPurchaseId": "5701759342",
  "currencyCode": "USD",
  "customerId": 7,
  "dateRefunded": "2026-05-28 18:04:03",
  "declineReason": "Payment marked as Prepaid",
  "emailAddress": "pedro.leite@awsales.io",
  "firstName": "Pedro",
  "fulfillmentStatus": "HOLD",
  "lastName": "Awsales",
  "orderId": 9,
  "orderStatus": "REFUNDED",
  "orderTotal": "199.00",
  "originalOrderId": "9",
  "paySource": "PREPAID",
  "phoneNumber": "5531987424967",
  "purchaseId": "5",
  "recurringPrice": "199.00",
  "recurringStatus": "PENDING",
  "refundReason": "RDR",
  "responseType": "SUCCESS",
  "salesTax": "0.00",
  "shipCarrier": "Default",
  "totalDiscount": "0.00",
  "totalShipping": "0.00"
}
```

---

## Diferenças vs NEW SALE (mesma order, antes do refund)

| Campo | New Sale | Refunded |
|---|---|---|
| `orderStatus` | `PENDING` | `REFUNDED` |
| `dateRefunded` | ausente | `"2026-05-28 18:04:03"` |
| `refundReason` | ausente | `"RDR"` |

Todos os outros campos idênticos. O payload **carrega o histórico completo da order** + adiciona campos de refund.

---

## Notas pro normalizer

- **Discriminator:** `orderStatus: "REFUNDED"` + presença de `dateRefunded`.
- **`refundReason`:** valores conhecidos: `"RDR"` (RDR = Return/Refund/Dispute? confirmar). Outros possíveis a documentar quando aparecerem.
- **`orderTotal`** continua $199.00 (valor original) — refund é evento separado, não anula amount.
- **`recurringStatus`** ainda `PENDING` — refund não cancela subscription automaticamente (próximo bill date continua).
- Map AWSales: `orderStatus: "REFUNDED"` → `REFUNDED_PURCHASE`.

## Observação importante

Toggle "Refunded Externally?" ON foi usado neste sample. Em payloads de refund via gateway real (card recusado/devolvido pelo NMI), pode aparecer:
- `actualTransactionId` diferente (ID do refund NMI, não do sale)
- `responseType` outro valor
- `transactionId` populado (gateway tx ID)

Precisa capturar 1 sample de Refund via gateway real pra confirmar.
