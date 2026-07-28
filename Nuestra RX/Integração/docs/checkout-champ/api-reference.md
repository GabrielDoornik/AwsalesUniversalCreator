# Checkout Champ — API Reference

## Base URL

| Ambiente | URL |
|---|---|
| **Produção** | `https://api.checkoutchamp.com` |
| **Sandbox** | ⚠️ Não há sandbox público documentado. O padrão da operação é criar um "test gateway" no painel e usar `paymentMethod=TEST` ou cartões de teste do NMI por trás. Confirmar com Suporte Checkout Champ se há ambiente isolado. |

## Autenticação

- Tipo: `loginId` + `password` (credenciais de **API User**, não o admin do painel).
- Forma: passar como **query string** ou no body (form-encoded). Suporta GET ou POST dependendo do endpoint.
- Criação: **Admin → Users → + (verde)** → marcar tipo "API User" e selecionar endpoints permitidos.

Exemplo mínimo (GET com query):
```
https://api.checkoutchamp.com/transactions/query/?loginId=API_USER&password=SENHA&txnType=SALE&responseType=SUCCESS&startDate=2/1/24&endDate=2/18/24
```

⚠️ **Boa prática inegociável:** chamar SEMPRE server-side. Nunca expor `loginId/password` no browser. Para front (Dosable), tokenizar no NMI Collect.js e chamar o CKC pelo seu backend.

## Categorias de endpoint

A API divide endpoints em **três grupos lógicos**:

| Grupo | O que faz |
|---|---|
| **Import calls** | Cria/insere dados no CRM (lead, order, upsell, click) |
| **Update calls** | Atualiza dados existentes (status, customer, subscription) |
| **Query calls** | Consulta dados (orders, transactions, customers, purchases) |

## Endpoints principais confirmados

### Import (criação)
| Endpoint | Método | Propósito |
|---|---|---|
| `/landers/clicks/import/` | POST | Registrar click numa lander/presell (attribution) |
| `/leads/import/` | POST | Criar lead (firstName, lastName, email, phoneNumber) |
| `/order/import/` | POST | Criar order com cartão / token / `ACCTONFILE` |
| `/upsale/import/` | POST | Adicionar upsell one-click a um order existente |
| `/order/confirm/` | POST | Confirmar order (usado em fluxos 3DS / PayPal pós-redirect) |
| `/transactions/confirmPaypal` | POST | Confirmar venda PayPal Express |

### Query (leitura)
| Endpoint | Propósito |
|---|---|
| `/transactions/query/` | Buscar transactions por tipo, status, range de data, campaign, etc. |
| `/order/query/` | Buscar orders por orderId, customerId, range, status |
| `/customer/query/` | Buscar customers (suportado conforme FAQ) |
| `/purchases/query/` | Buscar purchases (linha de items detalhada) |

⚠️ Outros endpoints específicos (campaign/query, product/query, subscription/query, membership) existem mas não foram confirmados nesta pesquisa — verificar em https://apidocs.checkoutchamp.com/ antes de codar.

### Update / Action
- `/membership/*` — query, cancel, reactivate (precisa ativar módulo no painel).
- `/customer/update/` — atualizar dados do customer (⚠️ confirmar path exato).
- `/subscription/update/` — pausar/cancelar/reativar (⚠️ confirmar path exato).

## Formato de requisição

- **Content-Type**: `application/x-www-form-urlencoded` é o padrão. JSON aceito em alguns endpoints, mas form é o que aparece em todos os exemplos oficiais.
- **Parâmetros comuns**:
  - `loginId`, `password` — auth
  - `campaignId` — id da campanha
  - `customerId` — id do cliente (em update/upsale)
  - `orderId` — id do pedido
  - `paySource=CREDITCARD | ACCTONFILE | PAYPAL` — fonte do pagamento
  - `paySourceId` — id do cartão tokenizado (quando `paySource=ACCTONFILE`)
  - `paymentToken` — token Collect.js (quando vindo do NMI)
  - `firstName`, `lastName`, `email`, `phone`, `address1`, `city`, `state`, `country`, `zip`
  - `creditCardType`, `cardNumber`, `cardMonth`, `cardYear`, `cardSecurityCode` (apenas se você for SAQ-D)
  - `productId_1`, `productQty_1`, `price_1` (e variantes _2, _3 para multi-produto)
  - `ipAddress`, `userAgent`, `affId`, `c1`-`c5` (custom fields)
  - `skipQA=1` — pula fila de QA manual
  - `includeCustomFields=true` — inclui campos custom nas respostas

## Resposta

JSON. Estrutura genérica:
```json
{
  "result": "SUCCESS",
  "message": {
    "orderId": "12345",
    "customerId": "67890",
    "transactionId": "tx_abc",
    "authId": "...",
    "totalAmount": "99.95"
  }
}
```

`result`: `SUCCESS` | `DECLINED` | `ERROR`. Em `DECLINED`, `orderId` **não vem** preenchido (FAQ oficial).

## Paginação (queries)

- Default: `25` resultados por página.
- Override: `resultsPerPage=500` (máximo confirmado na FAQ).
- Navegação: `page=1`, `page=2`, `page=3`, …
- Campos custom: incluir `includeCustomFields=true`.

## Rate limit

- **10 queries abertas simultâneas por conta** (concorrência, não por minuto). Se você abusa, fica aguardando slot livre.
- ⚠️ Não há documentação pública sobre rate por minuto / por endpoint. Para volume alto, conversar com Suporte CKC.

## IPs

### IPs **de saída do CKC** (ele → você)
Para webhooks/postbacks e integrações que CKC consome no seu lado, libere no seu firewall:
- `80.248.30.132`
- `80.248.30.141`
- `52.206.5.84`
- `44.219.22.112`

### IPs **de entrada no CKC** (você → ele)
Não publicado. Use HTTPS direto para `api.checkoutchamp.com`. Se houver alguma whitelist por IP de origem no User da API (configurável no painel), conferir.

## Fluxo recomendado de integração (oficial)

1. `landers/clicks/import/` — visita na presell.
2. `leads/import/` — assim que tiver `email` (ou `phone`).
3. `order/import/` — submissão do checkout (com `paymentToken` Collect.js).
4. `upsale/import/` — em cada upsell page.
5. `order/confirm/` — apenas se houver step out (3DS challenge, PayPal redirect).

Consultas separadas via `transactions/query/` e `order/query/` para o seu sistema interno (rastreio, antifraude, CRM próprio).

## ACCTONFILE — repetir compra com cartão salvo

Para cobrar de novo o mesmo cliente sem solicitar cartão (upsell pós-venda, cross-sell em outra campaign):
```
paySource=ACCTONFILE
customerId=<id do customer>
paySourceId=<id da pay source do customer>
```

Esse fluxo é MIT (merchant-initiated transaction), tem regras de scheme diferentes — confirmar com o gateway que ele aceita esse `paymentType` antes de habilitar produção.

## SDKs

Não há SDK Node/TypeScript oficial publicado. Integração HTTP direta via axios/fetch. Há plugins/conectores third-party (SaaSync, Cometly, Visiopt, Trackbox) mas nenhum cliente Node oficial.
