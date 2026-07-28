# NMI — API Reference

## Base URLs

| Ambiente | URL base | Observação |
|---|---|---|
| **Produção (v5 / REST)** | `https://api.nmi.com` | API moderna v5 (REST/JSON, autenticação via header) |
| **Produção (Classic / Direct Post)** | `https://secure.nmi.com/api/transact.php` | API legada (POST x-www-form-urlencoded) — ainda amplamente usada |
| **Produção (Query API legacy)** | `https://secure.nmi.com/api/query.php` | Reporting machine-readable (XML) |
| **Sandbox** | `https://guide.nmi.com` | Portal sandbox; usa as mesmas URLs `secure.nmi.com` / `api.nmi.com` com chaves sandbox emitidas em `guide.nmi.com` |

⚠️ **Confirmar:** white-label resellers do NMI (ex: Maverick, NMI-powered gateways de bancos) podem expor a mesma API em domínios próprios (`secure.[reseller].com/api/transact.php`). Conferir com o cliente qual host real eles usam.

## Autenticação

NMI tem **dois modos** que coexistem:

### v5 (recomendado para integração nova)
- Header HTTP: `Authorization: <PRIVATE_API_KEY>`
- Não é "Bearer". É a chave direta no valor do header.
- JSON body / responses.

### Classic / Direct Post (legacy mas ainda usado)
- Parâmetro `security_key` (ou `api_key`) no body, como form-urlencoded.
- Sem header de auth.
- Resposta em querystring (`response=1&responsetext=APPROVED&...`).

### Tipos de chave

| Tipo | Onde mora | Para que serve |
|---|---|---|
| **Private API Key / Security Key** | Servidor backend | Todas as chamadas server-side (sale, vault, subscription, query) |
| **Public Tokenization Key** | Front-end (Collect.js) | Tokenizar cartão no browser (PCI SAQ-A) |
| **Partner / Affiliate Key** | Backend de revenda | Onboarding de merchants (Create Merchant), comissão, sub-affiliate |

Criação no painel: **Merchant Portal → Settings → Security Keys → Add a New Key**. Para tokenization: aba "Public Security Keys → Add a New Public Key → Permission: Tokenization".

## Grupos de endpoints (v5)

### Payment API
| Endpoint | Método | Propósito |
|---|---|---|
| `/v5/transactions` (action=sale) | POST | Sale (auth + capture) |
| `/v5/transactions` (action=auth) | POST | Authorization only |
| `/v5/transactions/{id}/capture` | POST | Capture de auth |
| `/v5/transactions/{id}/void` | POST | Void (antes de settlement) |
| `/v5/transactions/{id}/refund` | POST | Refund (após settlement) |
| `/v5/transactions/{id}` | GET | Retrieve transaction |
| `/v5/transactions/credit` | POST | Standalone credit |
| `/v5/transactions/validate` | POST | Validate payment method (zero-dollar auth) |

### Customer Vault
- `POST /v5/customers` — criar customer com payment method tokenizado
- `GET /v5/customers/{id}` — recuperar
- `PATCH /v5/customers/{id}` — atualizar
- `DELETE /v5/customers/{id}` — remover
- `GET /v5/customers` — listar (paginado)
- Endpoints aninhados para `billing-address` e `shipping-address` (CRUD completo)

### Subscriptions & Plans (Recurring)
- `POST /v5/plans` — criar plano (template: amount, interval, day_frequency)
- `POST /v5/subscriptions` — criar subscription vinculada a customer
- `GET /v5/subscriptions/{id}` / `PATCH` / `DELETE` / `GET /v5/subscriptions` (list)

### Invoice / Product
- `POST /v5/invoices` — criar
- `POST /v5/invoices/{id}/send` — enviar email do invoice
- `POST /v5/invoices/{id}/close` — fechar
- `POST /v5/products`, `GET /v5/products/{id}`, `PATCH`, `DELETE`, `GET /v5/products`

### Cloud Device (POS / card-present)
- `POST /v5/devices` (register), `GET /v5/devices/{id}`, `PATCH`, `DELETE`
- `POST /v5/devices/{id}/payment-request` — disparar venda no terminal
- Display QR, signature/menu/yes-no prompts

### Embedded Payment Component
- `POST /v5/embedded-component-sessions` — cria sessão server-side, retorna `client_secret` para inicializar o componente no front

### Merchant Onboarding (Sign-Up API)
- `POST /v4/merchants` — criar merchant
- `POST /v4/applications` — submeter aplicação completa de onboarding
- `GET /v4/merchants/{gateway_id}` — info do merchant
- `POST /v4/merchants/{gateway_id}/processors` — adicionar processador

## Classic API (Direct Post) — endpoint único

`POST https://secure.nmi.com/api/transact.php` com `Content-Type: application/x-www-form-urlencoded`.

Tudo é discriminado pelo parâmetro `type`:

| `type=` | Ação |
|---|---|
| `sale` | Vender |
| `auth` | Auth only |
| `capture` | Capturar auth (transactionid obrigatório) |
| `void` | Void |
| `refund` | Refund |
| `credit` | Standalone credit |
| `add_customer` | Adicionar ao Customer Vault |
| `update_customer` | Atualizar |
| `delete_customer` | Deletar do vault |
| `validate` | Zero-dollar auth |
| `update_subscription` / `add_subscription` / `delete_subscription` | Recurring |

Exemplo de sale Classic:
```
type=sale
security_key=XXXX
ccnumber=4111111111111111
ccexp=1228
cvv=123
amount=99.95
first_name=John
last_name=Smith
email=john@example.com
```

Resposta:
```
response=1&responsetext=SUCCESS&authcode=123456&transactionid=987654321&avsresponse=N&cvvresponse=M&orderid=&type=sale&response_code=100
```

`response=1` = aprovado, `2` = decline, `3` = error.

## Tokenização front-end (Collect.js)

```html
<script
  src="https://secure.nmi.com/token/Collect.js"
  data-tokenization-key="PUBLIC_TOKENIZATION_KEY">
</script>
```

Captura cartão dentro de iframes do próprio NMI, retorna `payment_token` para enviar ao seu backend. O backend então faz a sale/vault add usando o token no lugar do PAN.

## Paginação

Endpoints `list` da v5 aceitam:
- `page` (default 1)
- `per_page` (default 25, máximo costuma ser 100)
- Resposta inclui `pagination: { current_page, total_pages, total_items }`

Detalhes: https://docs.nmi.com/reference/pagination

## Rate limiting

NMI documenta rate limiting em https://docs.nmi.com/reference/rate-limiting — ⚠️ **confirmar** limites exatos da conta do cliente, pois variam por plano contratado.

## Response codes

Lista completa em https://docs.nmi.com/reference/response-codes. Os mais importantes:
- `100` = approved
- `200-299` = decline (cardholder)
- `300-399` = error gateway/transaction
- `400-499` = error gateway-processor communication

## IPs

NMI **não publica** uma lista oficial de IPs de saída para chamadas server-to-server em produção. Webhooks (postbacks) saem dos ranges abaixo (ver `webhooks.md`).

## SDKs oficiais

- **iOS SDK** (Swift/Obj-C) — para card-present e tap-to-pay
- **Android SDK** — idem
- **Windows / Linux SDK** — para terminais e POS desktop
- Não há SDK oficial Node.js / TypeScript publicado no npm pela NMI. Integração server-side em Node é via HTTP direto (axios/fetch).

## Postman Collection oficial

Disponível em https://docs.nmi.com/reference/postman-collection — recomendado para validar fluxos antes de codar.

## Idempotência

⚠️ A v5 suporta `Idempotency-Key` em endpoints de criação (sale, customer, subscription). Confirmar comportamento exato com a doc — usar UUIDv4 por requisição é a prática segura.
