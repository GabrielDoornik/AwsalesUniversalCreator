# Mapping CKC Postback → AWSales Webhook

Documentação das decisões do normalizer `code-node.js`.

## Endpoint destino AWSales

```
POST https://app.awsales.io/api/webhooks/organizations/b34f181e-c7b3-49fb-b69f-3454a7336df2/credentials/checkout-champ
```

Headers:
```
Accept: application/json
Content-Type: application/json
```

## Mapping de evento (orderStatus → event AWSales)

| CKC `orderStatus` | Condição extra | AWSales `event` | AWSales `transaction.status` |
|---|---|---|---|
| `PARTIAL` | — | **SKIP** (sem mapping) | — |
| `PENDING` | `responseType: SUCCESS` | `APPROVED_PURCHASE` | `APPROVED` |
| `COMPLETE` | `recurringStatus: ACTIVE` ou rebill | `COMPLETED_PURCHASE` | `COMPLETED` |
| `REFUNDED` | `dateRefunded` presente | `REFUNDED_PURCHASE` | `REFUND_REQUESTED` |
| `DECLINED` | `fulfillmentStatus: CANCELLED` (Cancel UI) | `REFUSED_PURCHASE` | `CANCELED` |
| `DECLINED` | outros (decline real gateway — não capturado ainda) | `REFUSED_PURCHASE` | `REFUSED` |
| outros | — | SKIP | — |

## Mapping de campos diretos

| AWSales | CKC | Notas |
|---|---|---|
| `user.name` | `firstName + lastName` | Concatenação. Fallback `"(sem nome)"` |
| `user.email` | `emailAddress` | Direto |
| `user.phone` | `phoneNumber` | Normaliza pra `+DDI` (BR/US heuristic) |
| `producer.name` | hardcoded | `"Nuestra RX LLC"` |
| `transaction.id` | `clientOrderId` | Único por order |
| `transaction.type` | derivado de `billingCycleNumber` | `ONE_TIME` → `one_time`, demais → `subscription` |
| `transaction.payment_method` | `paySource` | `CREDITCARD` → `CREDIT_CARD`. `PREPAID` (External Payment) também → `CREDIT_CARD` (sem enum específico) |
| `transaction.total_value` | `orderTotal` | parseFloat, 2 casas decimais |
| `transaction.fee` | — | `0.00` (CKC não envia fee no postback) |
| `transaction.net_value` | `orderTotal` | Igual ao total (fee 0) |
| `transaction.installments` | — | `1` (CKC não envia no postback) |
| `transaction.cycle` | `billingCycleNumber` | parseInt, fallback 1 |
| `transaction.currency` | `currencyCode` | `USD` → `US`, demais mantém |

## Gaps conhecidos do CKC postback

| Campo AWSales | Situação CKC | Solução temporária |
|---|---|---|
| `product.id` | ✅ Resolvido — `productId` (mapeado de `product1_crmId`) | Fallback pra `clientPurchaseId` se ausente |
| `product.name` | ✅ Resolvido — `productName` (mapeado de `product1_name`) | Fallback pra `campaignName` se ausente |
| `product.offer.id/name` | Não vem | Usa `ckc_campaign_<campaignId>` + `campaignName` |
| `transaction.installments` | Não vem | Hardcode 1 |
| `transaction.fee` | Não vem | Hardcode 0.00 |
| `created_at` | Não vem | `new Date().toISOString()` (hora do processamento) |
| `utm.*` | Não vem (exceto `custom1/custom2` Dosable) | `source: "awsales"` hardcoded, demais null |
| `payment_links.pix_url/boleto_url` | Não aplicável (Nuestra é US/cartão) | null |

⚠️ Pra enriquecer (`product.id`, `installments`, etc), próximo passo seria adicionar HTTP Request entre o normalizer e o destino AWSales pra fazer GET na API CKC (`/order/query/` com clientOrderId) e mergear campos.

## Metadata enriquecida

Tudo que CKC envia mas AWSales não tem campo explícito vai pra `metadata.*`. Útil pra debug, reconciliação e analytics futuros:

```
ckc_order_id, ckc_purchase_id, ckc_customer_id,
ckc_transaction_id, ckc_actual_transaction_id, ckc_client_txn_id,
ckc_original_order_id,
ckc_billing_cycle, ckc_recurring_status, ckc_fulfillment_status,
ckc_pay_source, ckc_decline_reason, ckc_refund_reason,
ckc_next_bill_date, ckc_date_refunded,
ckc_card_last4, ckc_card_type,
ckc_ip_address, dosable_custom1, dosable_custom2,
is_rebill
```

## Workflow n8n (recomendado)

```
Webhook "nuestra-champ" (POST)
        ↓
Code "Normalize CKC → AWSales" (código deste arquivo)
        ↓
IF "Skip ou enviar?" (filtra _skip === true)
   - Branch FALSE (sem _skip) → HTTP Request POST AWSales endpoint
   - Branch TRUE (com _skip)  → opcional: log/Slack pra observabilidade
```

## TODO conforme novos samples chegarem

- [ ] `Paused` event — adicionar mapping (provavelmente skip, pois Pause é estado interno CKC)
- [ ] `Chargeback` event — mapear pra `CHARGED_BACK` AWSales
- [ ] Decline real do gateway (não Cancel manual) — confirmar discriminator
- [ ] Capture com cartão real (Camila Possan) — confirmar campos `cardLast4`/`transactionId` no payload final
- [ ] Subscription Stop (Cancel Subscription action) — sample pendente

## Histórico de samples reais usados

Ver `docs/checkout-champ/payloads/`:
- `partial.md` — 2 samples (Jose funnel + Test User3 manual)
- `new-sale.md` — 2 samples (Pedro Awsales PREPAID + Camila Possan CREDITCARD)
- `capture.md` — 1 sample (Pedro Awsales aprovado QA)
- `rebill.md` — 1 sample (Pedro Awsales Force Bill cycle 2)
- `refunded.md` — 1 sample (Pedro Awsales Externally Refunded)
- `declined.md` — 1 sample (Pedro Awsales Cancel Order)
