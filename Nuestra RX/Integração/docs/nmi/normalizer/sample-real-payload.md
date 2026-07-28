# NMI Webhook — Sample Payload Real

Payload real capturado no n8n em **2026-05-26**, evento `transaction.sale.success` disparado por sale de teste no Virtual Terminal da NMI ($1.00, cartão `4111111111111111`, Test Mode).

Útil pra:
- Validar HMAC (header `webhook-signature` no formato `t=<nonce>,s=<sig>`)
- Mapear campos pro modelo interno (normalização)
- Confirmar shape antes de codar Switch/IF nodes no n8n
- Testar parsing offline (copia/cola num "Edit Fields" do n8n)

## Headers relevantes

| Header | Valor | Uso |
|---|---|---|
| `webhook-signature` | `t=1779827853,s=0084b101352ccee3a426872617fe635faaa72c931813409dedf34e6002b327f1` | HMAC-SHA256 validation |
| `x-original-forwarded-for` | `104.192.36.84` | IP real da NMI (dentro do range `104.192.36.81-87`) |
| `cf-connecting-ip` | `104.192.36.84` | Mesmo IP, via Cloudflare |
| `content-type` | `application/json; charset=utf-8` | Body é JSON puro |
| `user-agent` | `Go-http-client/2.0` | NMI usa cliente Go |

⚠️ Note que `x-real-ip` e `x-forwarded-for` mostram `10.128.0.45` (IP interno do túnel/proxy do n8n-dev). O IP **real** da NMI tá em `x-original-forwarded-for` e `cf-connecting-ip` (depois do Cloudflare).

## Estrutura do body

```json
{
  "event_id": "70ababe6-33c7-412b-bcbd-b107e7cd3006",
  "event_type": "transaction.sale.success",
  "event_body": {
    "merchant": { "id": "1307043", "name": "Nuestra Rx llc" },
    "features": { "is_test_mode": true },
    "transaction_id": "12108893059",
    "transaction_type": "cc",
    "condition": "pendingsettlement",
    "processor_id": "epx",
    "currency": "USD",
    "requested_amount": "1.00",
    "authorization_code": "123456",
    "billing_address": { /* ... */ },
    "shipping_address": { /* ... */ },
    "card": {
      "cc_number": "411111******1111",
      "cc_exp": "1229",
      "cc_bin": "411111",
      "cc_type": "Visa",
      "avs_response": "N",
      "csc_response": "N",
      "entry_mode": "4",
      "feature_token": ""
    },
    "merchant_defined_fields": {},
    "action": {
      "amount": "1.00",
      "action_type": "sale",
      "date": "20260526203732",
      "success": "1",
      "ip_address": "187.111.24.132",
      "source": "virtual_terminal",
      "api_method": "virtual_terminal",
      "username": "pedro.leite@awsales",
      "response_text": "SUCCESS",
      "response_code": "100",
      "tap_to_mobile": false,
      "network_token_used": false,
      "network_token_cryptogram_created": false
    }
  }
}
```

## Campos-chave para normalização

| Campo NMI | Tipo | Notas |
|---|---|---|
| `event_id` | UUID v4 | Dedupe key — usar pra idempotência |
| `event_type` | string | Roteamento (sale.success, refund.success, etc.) |
| `event_body.merchant.id` | string | MID — usar pra split multi-MID |
| `event_body.features.is_test_mode` | bool | **Crítico filtrar** em prod |
| `event_body.transaction_id` | string numérica | Chave canônica da transação |
| `event_body.action.date` | `YYYYMMDDhhmmss` | Sem timezone — assumir UTC (⚠️ confirmar) |
| `event_body.action.success` | string `"1"` ou `"0"` | Sucesso/falha |
| `event_body.action.response_code` | string | `100` = approved (ver doc Response Codes) |
| `event_body.requested_amount` | string `"1.00"` | Sempre string, com decimal — converter pra Number/cents no consumidor |
| `event_body.card.cc_number` | string mascarada | `411111******1111` — primeiros 6 + últimos 4 |
| `event_body.card.cc_bin` | string | BIN (primeiros 6) — usar pra antifraude/segmentação |

## Payload completo (raw)

```json
[
  {
    "headers": {
      "host": "n8n-dev.awsales.io",
      "x-request-id": "af3429318d0297a1167dd5889f2f89e7",
      "x-real-ip": "10.128.0.45",
      "x-forwarded-for": "10.128.0.45",
      "x-forwarded-host": "n8n-dev.awsales.io",
      "x-forwarded-port": "80",
      "x-forwarded-proto": "http",
      "x-forwarded-scheme": "http",
      "x-scheme": "http",
      "x-original-forwarded-for": "104.192.36.84",
      "content-length": "2475",
      "content-type": "application/json; charset=utf-8",
      "user-agent": "Go-http-client/2.0",
      "accept-encoding": "gzip, br",
      "cf-ray": "a01f9414bb77e5b8-IAD",
      "webhook-signature": "t=1779827853,s=0084b101352ccee3a426872617fe635faaa72c931813409dedf34e6002b327f1",
      "cdn-loop": "cloudflare; loops=1",
      "cf-connecting-ip": "104.192.36.84",
      "cf-ipcountry": "US",
      "cf-visitor": "{\"scheme\":\"https\"}"
    },
    "params": {},
    "query": {},
    "body": {
      "event_id": "70ababe6-33c7-412b-bcbd-b107e7cd3006",
      "event_type": "transaction.sale.success",
      "event_body": {
        "merchant": {
          "id": "1307043",
          "name": "Nuestra Rx llc"
        },
        "features": {
          "is_test_mode": true
        },
        "transaction_id": "12108893059",
        "transaction_type": "cc",
        "condition": "pendingsettlement",
        "processor_id": "epx",
        "ponumber": "",
        "order_description": "",
        "order_id": "",
        "customerid": "",
        "customertaxid": "",
        "website": "",
        "shipping": "",
        "currency": "USD",
        "tax": "",
        "surcharge": "",
        "convenience_fee": "",
        "misc_fee": "",
        "misc_fee_name": "",
        "cash_discount": "",
        "tip": "",
        "requested_amount": "1.00",
        "shipping_carrier": "",
        "tracking_number": "",
        "shipping_date": "",
        "partial_payment_id": "",
        "partial_payment_balance": "",
        "platform_id": "",
        "authorization_code": "123456",
        "social_security_number": "",
        "drivers_license_number": "",
        "drivers_license_state": "",
        "drivers_license_dob": "",
        "duty_amount": "0.00",
        "discount_amount": "0.00",
        "national_tax_amount": "0.00",
        "summary_commodity_code": "",
        "alternate_tax_amount": "0.00",
        "vat_tax_amount": "0.00",
        "vat_tax_rate": "0.00",
        "merchant_advice_code": "",
        "merchant_advice_code_description": "",
        "association_response_code": "",
        "association_response_code_description": "",
        "additional_processor_responses": "",
        "additional_processor_response_descriptions": "",
        "billing_address": {
          "first_name": "TEstt",
          "last_name": "User",
          "address_1": "123 Main St",
          "address_2": "",
          "company": "",
          "city": "New York",
          "state": "NY",
          "postal_code": "10001",
          "country": "US",
          "email": "",
          "phone": "",
          "cell_phone": "",
          "fax": ""
        },
        "shipping_address": {
          "first_name": "",
          "last_name": "",
          "address_1": "",
          "address_2": "",
          "company": "",
          "city": "",
          "state": "",
          "postal_code": "",
          "country": "US",
          "email": "",
          "phone": "",
          "fax": ""
        },
        "card": {
          "cc_number": "411111******1111",
          "cc_exp": "1229",
          "cavv": "",
          "cavv_result": "",
          "xid": "",
          "eci": "",
          "avs_response": "N",
          "csc_response": "N",
          "cardholder_auth": "",
          "cc_start_date": "",
          "cc_issue_number": "",
          "card_balance": "",
          "card_available_balance": "",
          "entry_mode": "4",
          "cc_bin": "411111",
          "cc_type": "Visa",
          "feature_token": ""
        },
        "merchant_defined_fields": {},
        "action": {
          "amount": "1.00",
          "action_type": "sale",
          "date": "20260526203732",
          "success": "1",
          "ip_address": "187.111.24.132",
          "source": "virtual_terminal",
          "api_method": "virtual_terminal",
          "username": "pedro.leite@awsales",
          "response_text": "SUCCESS",
          "response_code": "100",
          "processor_response_text": "",
          "tap_to_mobile": false,
          "network_token_used": false,
          "network_token_cryptogram_created": false,
          "processor_response_code": "",
          "processor_response_description": "",
          "device_license_number": "",
          "device_nickname": ""
        }
      }
    },
    "webhookUrl": "https://n8n-dev.awsales.io/webhook/nuestra-nmi",
    "executionMode": "production"
  }
]
```

## Observações pra próximo passo (HMAC validation)

A NMI mandou:
- `webhook-signature: t=1779827853,s=0084b101352ccee3a426872617fe635faaa72c931813409dedf34e6002b327f1`

Algoritmo de validação (vai virar Code node no n8n):

```js
const crypto = require('crypto');

const signingKey = 'DA3BBBE67C06EB25B8E40018C3ACDC7F';
const sigHeader = $input.first().headers['webhook-signature'];
const rawBody = JSON.stringify($input.first().body); // ⚠️ ver nota abaixo

const match = sigHeader.match(/t=([^,]+),s=(.+)/);
const nonce = match[1];
const sigFromNmi = match[2];

const expected = crypto
  .createHmac('sha256', signingKey)
  .update(nonce + '.' + rawBody)
  .digest('hex');

const valid = crypto.timingSafeEqual(
  Buffer.from(sigFromNmi),
  Buffer.from(expected)
);
```

⚠️ **Crítico:** o HMAC depende do **raw body byte-a-byte**. Quando o n8n parse o JSON, ele pode reorganizar/normalizar — o que faz o `JSON.stringify` retornar string diferente da que a NMI assinou. Pra validar corretamente, é preciso que o nó Webhook esteja configurado pra preservar o **raw body** (opção "Binary Data" ou similar). Se não der, validação pode falhar mesmo com signing key certo.

**Workaround possível:** ver se o n8n Webhook node tem opção tipo "Raw Body" / "Don't parse body" / acesso ao `body.raw` ou `rawBody`. Isso é a próxima investigação.
