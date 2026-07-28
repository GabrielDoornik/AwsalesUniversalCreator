# REBILL — Payload Real CKC Postback

Evento disparado a cada cobrança recorrente de subscription (cycle 2+). Triggered automaticamente pelo cycle CKC OU manualmente via "Force Bill NOW" no painel da subscription.

**Customer Type CKC:** `Rebill`
**Capturado em:** 2026-05-28 ~19:39 (delay ~15min do Force Bill NOW).
**Origem do trigger:** Force Bill NOW no painel da subscription (forçou rebill antecipado).

---

## Sample — Force Bill (Pedro Awsales, cycle 2)

Order original (A9EFA50245) já estava ACTIVE pós-Capture. Force Bill NOW criou nova order (68020AC884) representando cycle 2 da mesma subscription.

```json
{
  "actualTransactionId": 19,
  "billingCycleNumber": "2",
  "campaignId": 17,
  "campaignName": "NUESTRARX - WEIGHTLOSS - STAGING",
  "clientOrderId": "68020AC884",
  "clientPurchaseId": "A6BD65BF53",
  "currencyCode": "USD",
  "customerId": 13,
  "declineReason": "Payment marked as Prepaid",
  "emailAddress": "test4@nuestrarx.com",
  "firstName": "Pedro",
  "fulfillmentStatus": "HOLD",
  "lastName": "Awsales",
  "nextBillDate": "2026-07-01",
  "orderId": 17,
  "orderStatus": "COMPLETE",
  "orderTotal": "199.00",
  "originalOrderId": "15",
  "paySource": "PREPAID",
  "phoneNumber": "+5531987424967",
  "purchaseId": "11",
  "recurringPrice": "199.00",
  "recurringStatus": "INACTIVE",
  "responseType": "SUCCESS",
  "salesTax": "0.00",
  "shipCarrier": "Default",
  "totalDiscount": "0.00",
  "totalShipping": "0.00"
}
```

---

## Discriminators únicos do REBILL

| Campo | Valor | Por que importa |
|---|---|---|
| `billingCycleNumber` | `"2"` (ou maior) | Discriminator primário — cycle 1 = New Sale, 2+ = rebill |
| `clientOrderId` | `"68020AC884"` (≠ original) | Rebill cria order NOVA pra cada ciclo |
| `orderId` | 17 (novo) | Novo orderId interno |
| `originalOrderId` | `"15"` | Aponta pra order PAI (primeiro ciclo). Confirma vínculo. |
| `clientPurchaseId` | `"A6BD65BF53"` | MESMA da subscription pai — id da subscription |
| `purchaseId` | `"11"` | MESMA da subscription pai |
| `actualTransactionId` | 19 | NOVA transação interna |

---

## Discriminator pro normalizer

```
billingCycleNumber > "1" 
  && originalOrderId !== orderId.toString()
  && orderStatus === "COMPLETE"
  && responseType === "SUCCESS"
  → Rebill / Recurring Charge
  → Map AWSales: COMPLETED_PURCHASE (com flag is_rebill=true)
```

OU mais simples:
```
billingCycleNumber !== "1" && billingCycleNumber !== "ONE_TIME"
  → Rebill
```

---

## Observações importantes

### 1. Rebill cria NOVA order
Cada ciclo de subscription gera um `clientOrderId` novo (`68020AC884` neste caso, distinto de `A9EFA50245` da cycle 1). `originalOrderId` mantém referência pra order original. Pro AWSales, decidir se cada rebill é evento separado ou vinculado.

### 2. `recurringStatus: INACTIVE` é state contaminado
Esse sample tem `recurringStatus: INACTIVE` porque o **Pause Subscription** foi executado ANTES desse postback chegar (cycle 15min é assíncrono — Pause foi 7:42pm, postback chegou ~7:54pm). 

⚠️ **Pra rebill normal sem pause prévio**, esperar `recurringStatus: ACTIVE`. Confirmar quando aparecer.

### 3. `nextBillDate: 2026-07-01` reflete pós-pause
Same reason — Pause moveu next bill date. Em rebill normal, seria `next_bill + interval_days` (geralmente +30d).

### 4. `fulfillmentStatus: HOLD` (limpo)
Diferente da cycle 1 que ficou `CANCELLED` por causa do histórico contaminado. **Rebill é evento limpo, não herda estado de fulfillment da order pai.** Cada cycle gera fulfillment próprio.

### 5. Sem Pause event separado
Apesar do Pause ter sido executado, nenhum postback `Paused` chegou separado. Hipótese: CKC absorveu o estado do Pause no próximo postback (Rebill) em vez de disparar evento independente. **Sample dedicado de `Paused` event ainda pendente.**

---

## Notas pro normalizer

- **Map AWSales:** `COMPLETED_PURCHASE` com flag `is_rebill: true` OU evento dedicado `REBILL_PURCHASE` (depende da arquitetura AWSales).
- **`orderTotal: "199.00"`** = valor do cycle 2 (cobrança recorrente). Igual ao cycle 1 nesse caso. Pode variar se subscription tiver pricing dinâmico.
- **Pro rastreamento de subscription:** chave de agregação = `clientPurchaseId` (mesma pra todos cycles) ou `purchaseId`.
- **Pra ordenar cycles:** `billingCycleNumber` (string numérica, fazer parseInt).
- **Sample de rebill com gateway real (cartão NMI)** ainda pendente — esperar campos `cardLast4`/`cardType`/`transactionId` populados.
