# Normalizer NMI → AWSales

Mapeamento dos eventos NMI pro formato canônico do endpoint AWSales:
`POST https://app.awsales.io/api/webhooks/organizations/b34f181e-c7b3-49fb-b69f-3454a7336df2/credentials/nmi-checkout`

## Mapeamento `event_type` → `event` AWSales

| NMI event_type | AWSales `event` | AWSales `transaction.status` |
|---|---|---|
| `transaction.sale.success` | `APPROVED_PURCHASE` | `APPROVED` |
| `transaction.auth.success` | `APPROVED_PURCHASE` | `APPROVED` |
| `transaction.capture.success` | `COMPLETED_PURCHASE` | `COMPLETED` |
| `transaction.sale.failure` | `REFUSED_PURCHASE` | `REFUSED` |
| `transaction.auth.failure` | `REFUSED_PURCHASE` | `REFUSED` |
| `transaction.capture.failure` | `REFUSED_PURCHASE` | `REFUSED` |
| `transaction.refund.success` | `REFUNDED_PURCHASE` | `REFUND_REQUESTED` |
| `transaction.void.success` | `REFUNDED_PURCHASE` | `CANCELED` |
| `chargeback.batch.complete` | `CHARGED_BACK` | `CHARGEBACK` |
| `recurring.subscription.add` | `APPROVED_PURCHASE` | `APPROVED` |

## Eventos SKIP (não vão pro AWSales)

- `transaction.*.unknown` — status indefinido (timeout/comunicação), esperar resolução.
- `transaction.refund.failure`, `transaction.void.failure` — sem evento equivalente no AWSales.
- `transaction.credit.unknown` — não usamos credit standalone.
- `recurring.subscription.update/delete` — sem evento de update/cancel no AWSales enum.
- `settlement.batch.*` — batch-level, não per-transaction.
- `acu.summary.*` — não é evento transacional, é atualização de cartão.

Skip retorna `{ _skip: true, _reason: "..." }` — usar IF node depois pra filtrar.

## Mapeamentos de campo

### `user`
- `name` ← `billing_address.first_name + " " + billing_address.last_name`
- `email` ← `billing_address.email`
- `phone` ← `billing_address.phone` ou `cell_phone`

### `producer`
- `name` ← `merchant.name` (ex: "Nuestra Rx llc")

### `transaction`
- `id` ← `transaction_id`
- `type` ← `subscription` se evento começa com `recurring.subscription`, senão `one_time`
- `status` ← tabela acima
- `payment_method` ← se `transaction_type === "cc"` → `CREDIT_CARD` (Nuestra RX não usa ck/cs)
- `total_value` ← `action.amount` ou `requested_amount` (parseFloat, 2 casas)
- `fee` ← `0.00` (NMI não retorna fee no webhook)
- `net_value` ← `total_value` (sem fee)
- `installments` ← `1` (NMI cc default)
- `cycle` ← `1`
- `currency` ← `USD` → mapear para `"US"` (AWSales spec usa `US`, não `USD`)
- `items[0].product.id` ← `order_id` ou fallback `nmi-{transaction_id}`
- `items[0].product.name` ← `order_description` ou fallback `Nuestra RX Product`
- `items[0].product.price` ← `total_value`
- `items[0].product.offer.id` ← `merchant_defined_fields.offer_id` ou `"default"`
- `items[0].product.offer.name` ← `merchant_defined_fields.offer_name` ou `"Geral"`

### `payment_links`
- `pix_url`, `boleto_url` ← `null` (NMI é cc-first, sem PIX/boleto)

### `utm`
- `source` ← `merchant_defined_fields.utm_source` ou `"awsales"` (default conforme doc AWSales — pra aparecer no dashboard)
- `campaign`, `medium`, `content`, `term` ← `merchant_defined_fields.utm_*` ou `null`

### `metadata` (livre — usado pra preservar dados NMI)
- `nmi_event_id` ← `event_id` (UUID, dedupe)
- `nmi_event_type` ← `event_type` original
- `nmi_merchant_id` ← `merchant.id`
- `nmi_processor_id` ← `processor_id`
- `nmi_authorization_code` ← `authorization_code`
- `nmi_response_code` ← `action.response_code`
- `nmi_transaction_type` ← `transaction_type` (cc/ck/cs)
- `nmi_is_test_mode` ← `features.is_test_mode` (bool)
- `nmi_card_last4` ← últimos 4 do `card.cc_number`
- `nmi_card_bin` ← `card.cc_bin`
- `nmi_card_type` ← `card.cc_type` (Visa/MC/etc.)

## Conversões

### Data NMI → ISO 8601 UTC
NMI manda `"YYYYMMDDhhmmss"` (ex: `"20260526203732"`). AWSales quer ISO 8601 com `Z`.
Conversão: `20260526203732` → `2026-05-26T20:37:32Z`

⚠️ **Assumir UTC** — NMI não documenta timezone (⚠️ confirmar com NMI; alguns gateways usam UTC, outros local do MID).

### Valor monetário NMI → number
NMI manda string `"1.00"`. AWSales quer number `1.00`.
Conversão: `parseFloat("1.00")` → arredondar 2 casas → `1.00`

### Cartão mascarado → last4
NMI manda `"411111******1111"`. Extrair últimos 4: `slice(-4)` → `"1111"`.

## Decisões pendentes (⚠️ confirmar)

1. **Currency NMI USD → AWSales `"US"`**: doc AWSales diz enum é `BRL/US/EUR`. Achei estranho mas vou seguir literalmente. Se AWSales aceitar `USD`, melhor.
2. **Recurring subscription update/delete**: hoje skip. Se Nuestra RX precisar disparar evento de cancelamento pra AWSales, criar evento custom ou pedir AWSales pra estender enum.
3. **Fee/net_value**: NMI não retorna fee no webhook. Sempre vai 0/total. Se Nuestra RX tem taxa de processador conhecida (ex: 2.9% + $0.30), calcular aqui.
4. **Installments**: NMI cc é sempre 1. Se algum dia subir multi-installments, ajustar.
5. **Date timezone**: hoje assume UTC. Confirmar com NMI ou inspecionar quando comparar com horário real da transação.

## Arquivo do Code node

Versão pronta pra colar no n8n: [`code-node.js`](./code-node.js).
