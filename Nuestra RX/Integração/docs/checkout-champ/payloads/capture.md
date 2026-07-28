# CAPTURE — Payload Real CKC Postback

Evento disparado quando order é aprovada no QA do CKC (Approve Order). Representa a "conclusão" do fluxo de venda — order ativada, primeiro rebill agendado.

⚠️ **`orderStatus` no payload vem `"COMPLETE"` (não `"CAPTURE"`).** Customer Type CKC que casou no routing é `Capture`, mas o status interno do order é COMPLETE.

**Customer Type CKC:** `Capture`
**Capturado em:** 2026-05-28 ~18:48 (delay ~15min).
**Origem do trigger:** Approve Order no Quality Assurance.

---

## Sample — External Payment Approved (Pedro Awsales)

Order originalmente External Payment / PREPAID, passou por Cancel → Complete Order → Approve Order no QA. Histórico complexo da order não impede capture do evento final.

```json
{
  "actualTransactionId": 17,
  "billingCycleNumber": "1",
  "campaignId": 17,
  "campaignName": "NUESTRARX - WEIGHTLOSS - STAGING",
  "clientOrderId": "A9EFA50245",
  "clientPurchaseId": "A6BD65BF53",
  "currencyCode": "USD",
  "customerId": 13,
  "declineReason": "Payment marked as Prepaid",
  "emailAddress": "test4@nuestrarx.com",
  "firstName": "Pedro",
  "fulfillmentStatus": "CANCELLED",
  "lastName": "Awsales",
  "nextBillDate": "2026-06-28",
  "orderId": 15,
  "orderStatus": "COMPLETE",
  "orderTotal": "199.00",
  "originalOrderId": "15",
  "paySource": "PREPAID",
  "phoneNumber": "+5531987424967",
  "purchaseId": "11",
  "recurringPrice": "199.00",
  "recurringStatus": "ACTIVE",
  "responseType": "SUCCESS",
  "salesTax": "0.00",
  "shipCarrier": "Default",
  "totalDiscount": "0.00",
  "totalShipping": "0.00"
}
```

---

## Diferenças vs NEW SALE (mesma order, antes do Capture)

| Campo | New Sale | Capture |
|---|---|---|
| `orderStatus` | `PENDING` | **`COMPLETE`** |
| `recurringStatus` | `PENDING` | **`ACTIVE`** |
| `nextBillDate` | ausente | **`"2026-06-28"`** (primeiro rebill em +30d) |
| `actualTransactionId` | 9 | 17 (nova transação interna) |
| `clientPurchaseId` | `5701759342` | `A6BD65BF53` (novo) |
| `purchaseId` | `5` | `11` (novo) |

---

## Discriminator pro normalizer

```
if (orderStatus === "COMPLETE" 
    && recurringStatus === "ACTIVE" 
    && nextBillDate exists) {
  // → Capture / Completed Purchase
  // Map AWSales: COMPLETED_PURCHASE
}
```

---

## Observações importantes

### 1. `fulfillmentStatus: "CANCELLED"` — herança contaminada
Esse sample teve histórico Cancel → Complete → Approve. O `fulfillmentStatus` ficou `CANCELLED` mesmo após Approve. Pode ser:
- Bug específico do fluxo Complete Order
- Ou comportamento esperado (uma vez cancelado, não restaura fulfillment)

⚠️ **Sample limpo de Capture sem histórico prévio de cancel ainda NÃO foi capturado.** Provavelmente `fulfillmentStatus` viria `HOLD` ou `PENDING`. Confirmar quando aparecer.

### 2. `nextBillDate` é a evidência forte de subscription ativa
Em outros customer types (Partial, New Sale PENDING, Declined, Refunded), esse campo NÃO aparece. Só em Capture (ou Rebill).

### 3. `recurringStatus: "ACTIVE"` substitui `PENDING`
Indica que subscription saiu de "aguardando captura" pra "rodando ciclo".

### 4. Sample é External Payment — campos de gateway ausentes
- `cardLast4`, `cardType`, `cardExpiryDate`, `gatewayTitle`, `transactionId` — todos ausentes
- Pra Capture com cartão real (Camila Possan, Mastercard 4444), esperar esses campos populados
- ⚠️ Sample de Capture com cartão real ainda pendente

---

## Notas pro normalizer

- **Map AWSales:** `COMPLETED_PURCHASE`.
- **`nextBillDate`** é o cron pra subscription. Pode disparar lógica de "lembrete rebill em X dias" no AWSales.
- **`actualTransactionId` mudou** entre New Sale e Capture pra mesma order — confirma que cada operação CKC gera nova transação interna.
- **`originalOrderId: "15"`** continua igual a `orderId: 15` — não é rebill ainda, é o primeiro ciclo.
