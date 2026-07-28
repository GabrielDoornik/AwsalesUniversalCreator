# NEW SALE — Payload Real CKC Postback

Evento disparado quando order é completada no CKC (Order Entry processado, checkout finalizado, ou External Payment marcado como pago).

**Customer Type CKC:** `New Sale` (display "Sale" no UI)
**Profile receptor:** `Nuestra-AWSales-Dev`
**URL n8n:** `https://n8n-dev.awsales.io/webhook/nuestra-champ`
**Capturado em:** 2026-05-28 ~15:13 (delay ~49min do trigger 14:24).

---

## Headers HTTP

```
host: n8n-dev.awsales.io
x-original-forwarded-for: 44.219.22.112
cf-connecting-ip: 44.219.22.112
cf-ipcountry: US
content-type: application/json
content-length: 681
accept: */*
accept-encoding: gzip, br
```

Mesma estrutura dos payloads PARTIAL — Cloudflare na frente, IP CKC `44.219.22.112` confirmado.

---

## Sample 1 — External Payment / Prepaid (Pedro Awsales)

Order criada via Order Entry com método `External Payment` (sem card real, sem test card). CKC marcou `paySource: PREPAID` com `declineReason: "Payment marked as Prepaid"` (não é erro — é label CKC pra "pago fora do sistema"). `responseType: SUCCESS` confirma evento bem-sucedido.

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
  "declineReason": "Payment marked as Prepaid",
  "emailAddress": "pedro.leite@awsales.io",
  "firstName": "Pedro",
  "fulfillmentStatus": "HOLD",
  "lastName": "Awsales",
  "orderId": 9,
  "orderStatus": "PENDING",
  "orderTotal": "199.00",
  "originalOrderId": "9",
  "paySource": "PREPAID",
  "phoneNumber": "5531987424967",
  "purchaseId": "5",
  "recurringPrice": "199.00",
  "recurringStatus": "PENDING",
  "responseType": "SUCCESS",
  "salesTax": "0.00",
  "shipCarrier": "Default",
  "totalDiscount": "0.00",
  "totalShipping": "0.00"
}
```

---

## Sample 2 — Credit Card via Gateway NMI (Camila Possan, funil Dosable)

Order originada do funil Dosable (`custom1` UUID + `custom2: "Checkout Page"`) com cartão real Mastercard 4444. Authorized pelo gateway NMI, aguardando capture. Estado intermediário `declineReason: "Requires Capture"` indica auth completou mas captura não rodou ainda.

```json
{
  "actualTransactionId": 11,
  "billingCycleNumber": "1",
  "campaignId": 17,
  "campaignName": "NUESTRARX - WEIGHTLOSS - STAGING",
  "cardExpiryDate": {
    "date": "2031-09-30 23:59:59.000000",
    "timezone_type": 3,
    "timezone": "America/New_York"
  },
  "cardLast4": "4444",
  "cardType": "MASTERCARD",
  "clientOrderId": "19C35976D3",
  "clientPurchaseId": "8AE0519CDA",
  "clientTxnId": "C96DF517BF4F",
  "currencyCode": "USD",
  "custom1": "5f62695c-4c9a-46fe-a3a4-00e51f6791da",
  "custom2": "Checkout Page",
  "customerId": 11,
  "declineReason": "Requires Capture",
  "emailAddress": "camila+nuestra-1780004989@dosable.com",
  "firstName": "Camila",
  "fulfillmentStatus": "HOLD",
  "gatewayTitle": "NuestraRx - Weightloss - STAGING",
  "ipAddress": "201.3.156.5",
  "lastName": "Possan",
  "orderId": 13,
  "orderStatus": "PENDING",
  "orderTotal": "179.00",
  "originalOrderId": "13",
  "paySource": "CREDITCARD",
  "phoneNumber": "5755550100",
  "purchaseId": "7",
  "recurringPrice": "179.00",
  "recurringStatus": "PENDING",
  "responseType": "SUCCESS",
  "salesTax": "0.00",
  "totalDiscount": "0.00",
  "totalShipping": "0.00",
  "transactionId": "pi_3TcBtc3Bngua1h8E1aGHzmAw"
}
```

### Diferenças críticas vs Sample 1 (PREPAID)

| Campo | Sample 1 (PREPAID) | Sample 2 (CREDITCARD) |
|---|---|---|
| `paySource` | `PREPAID` | `CREDITCARD` |
| `cardLast4` | ausente | `"4444"` |
| `cardType` | ausente | `"MASTERCARD"` |
| `cardExpiryDate` | ausente | objeto `{date, timezone_type, timezone}` |
| `gatewayTitle` | ausente | `"NuestraRx - Weightloss - STAGING"` |
| `transactionId` | ausente | `"pi_3TcBtc3Bngua1h8E1aGHzmAw"` (formato Stripe-like — confirmar gateway exato) |
| `clientTxnId` | ausente | `"C96DF517BF4F"` |
| `ipAddress` | ausente | `"201.3.156.5"` (IP visitante real) |
| `custom1`/`custom2` | ausentes | UUID Dosable + "Checkout Page" |
| `declineReason` | `"Payment marked as Prepaid"` | `"Requires Capture"` |
| `shipCarrier` | `"Default"` | ausente |

### Notas adicionais Sample 2

- **`cardExpiryDate` vem como objeto PHP-style:** `{date, timezone_type, timezone}`. Normalizer precisa parsear `.date` (formato ISO).
- **`transactionId: "pi_3TcBtc3Bngua1h8E1aGHzmAw"`:** formato com prefixo `pi_` é típico de Stripe Payment Intent. Estranho pra gateway listado como NMI. Hipóteses: (a) gateway custom proxy, (b) campo legado, (c) Dosable usa Stripe internamente e CKC propaga. ⚠️ Confirmar com Ruben/Willian.
- **`declineReason: "Requires Capture"`** NÃO é erro — é estado intermediário pós-auth. NMI authorized + ainda não capturou. Após Capture aprovado em QA, vira `responseType: SUCCESS` com `declineReason` limpo.
- **`shipCarrier` ausente** mesmo com card real — provavelmente porque fulfillment ainda não foi atribuído à carrier (Sample 1 tinha "Default" possivelmente porque foi External Payment processado de outro jeito).

---

## Diferenças vs PARTIAL

| Campo | New Sale | Partial |
|---|---|---|
| `orderStatus` | `PENDING` (ou `COMPLETE` após captura) | `PARTIAL` |
| `actualTransactionId` | presente (9) | ausente |
| `clientPurchaseId` | presente | ausente |
| `purchaseId` | presente | ausente |
| `originalOrderId` | presente | ausente |
| `paySource` | `PREPAID`/`CREDITCARD`/etc | ausente |
| `responseType` | `SUCCESS`/`DECLINED` | ausente |
| `fulfillmentStatus` | `HOLD`/`PENDING`/etc | ausente |
| `shipCarrier` | `Default` | ausente |
| `billingCycleNumber` | `"1"` (string numérica) | `"ONE_TIME"` |
| `recurringPrice` | `"199.00"` populado | string vazia |
| `recurringStatus` | `PENDING`/`ACTIVE` | `ONE_TIME` |
| `declineReason` | `"Payment marked as Prepaid"` (legit) | `"Unknown Error"` (lixo) |

**Implicação pro normalizer:**
- Discriminator forte: presença de `actualTransactionId`/`paySource`/`responseType` indica venda real, não lead.
- `recurringStatus: "PENDING"` + `billingCycleNumber: "1"` indica primeira cobrança de subscription (1º cycle). `ACTIVE` viria nos rebills futuros.
- `orderStatus: "PENDING"` aqui é tipo "aguardando captura/QA approval", não falha. Não confundir.
- `declineReason: "Payment marked as Prepaid"` NÃO é erro — significa External Payment. Tratar como fluxo legítimo.

---

## Campos ausentes vs Field Mappings completos

```
trackingNumber, custom1, custom3, custom4, custom5, custom2,
gatewayTitle, cardLast4, chargebackReasonCode, sourceId, transactionId,
chargebackAmount, chargebackDate, refundReason, nextBillDate,
cardExpiryDate, ipAddress, clientTxnId, cardType, dateRefunded,
subAffId
```

Sem `cardLast4`/`cardType`/`cardExpiryDate` porque External Payment não envolve card.
Sem `ipAddress` porque Order Entry roda do painel CKC, não captura IP visitante.
Sem `gatewayTitle`/`transactionId` porque External Payment não passa pelo gateway NMI.
Sem `nextBillDate` porque order ainda PENDING — primeiro rebill será calculado após captura.

---

## Notas pro normalizer

- Discriminator principal: `paySource` indica método. Valores observados: `PREPAID`. Outros esperados: `CREDITCARD`, `PAYPAL`, `ACH` (a confirmar).
- Map `orderStatus: "PENDING"` + `responseType: "SUCCESS"` → AWSales `APPROVED_PURCHASE` ou similar (pendente decisão).
- `recurringStatus: "PENDING"` indica subscription criada mas não confirmada. Após Capture, vira `ACTIVE`.
- Em casos de cartão (não testado ainda), esperar `cardLast4`, `cardType`, `cardExpiryDate`, `actualTransactionId` populados + `transactionId` do gateway.
- `originalOrderId` = `orderId` neste caso (não é refund/rebill de outra order). Em rebills, `originalOrderId` aponta pra order pai.
