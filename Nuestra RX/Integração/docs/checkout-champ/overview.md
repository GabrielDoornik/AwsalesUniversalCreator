# Checkout Champ

## O que é (resumo curto)

**CRM + OMS + Checkout + Rebill all-in-one** pra e-commerce direct response. É o "cérebro da loja" da Nuestra RX: guarda customer, processa checkout, decide gateway, gerencia upsells e renovação mensal (rebill). Sucessor do Konnektive — endpoints e conceitos batem.

## Papel no stack Nuestra RX

```
Cliente termina intake na Dosable e está aprovado
              ↓
Cliente é levado pro checkout (Checkout Champ)
              ↓
CKC pega cartão + dados de envio → guarda em Customer Vault próprio
              ↓
CKC chama NMI pra autorizar/capturar cartão
              ↓
CKC processa upsell (one-click)
              ↓
CKC dispara postback (webhook) pra cada evento → Vercel hub + n8n
              ↓
CKC agenda rebill (cobra automaticamente no próximo mês)
```

## Configuração atual da conta Nuestra RX (confirmado em 2026-05-26 / 27)

| Item | Valor |
|---|---|
| Conta CKC | **Nuestra Rx LLC** (Pedro Leite logado) |
| Account Manager | Michael Jancovic |
| Base API | `https://api.checkoutchamp.com` |
| Campanhas ativas | 4 (Default, "other Store", **#19 PROD**, **#17 STAGING**) |
| Campanhas relevantes | `(19) NUESTRARX - WEIGHTLOSS - PRODUCTION` e `(17) NUESTRARX - WEIGHTLOSS - STAGING` |
| Produtos | Semaglutide + Tirzepatide variantes (Rush, Medivera, mensal $199-299, 3-month $546-798) |
| Quality Assurance | 100% em ambas campanhas (toda order vai pra fila manual) |
| Reorder Days | 2 (dedupe — bloqueia mesmo customer comprando duas vezes em 2 dias) |
| Postback Profiles | 8 (7 do Ruben + 1 nosso `Nuestra-AWSales-Dev`) |
| Gateway configurado | NMI (gateway do Pedro Leite) |
| Configurado por | **Ruben** (login `rubenNuestra`) |

## Hub Vercel — infra do Ruben

O Ruben (colega da operação) mantém um hub na Vercel que consome eventos do CKC (e também do NMI):

- **URL:** `https://nuestrarx-hub.vercel.app/api/webhooks/checkoutchamp`
- **Profile principal:** `Hub-Main` (todos eventos, todas campanhas)
- **Profiles especializados:** `Weightloss (prod/stage) billing failed / cancelled / webhooks`
- **Header de autenticação:** `X-Hub-Secret: W0PaiJh6soWaoMTdo52Qd-XxmnJkU0k9QFtq__Hv-TzEBTCfc` (configurado via Field Mapping `header:X-Hub-Secret`)

Nosso profile `Nuestra-AWSales-Dev` foi clonado do Hub-Main e aponta pra `https://n8n-dev.awsales.io/webhook/nuestra-champ`. Removemos o header X-Hub-Secret (era do Ruben, não nosso).

## Conceitos críticos

- **API User** (loginId + password) — credenciais pra integração programática. Criadas em "Users" no dropdown da conta (não na sidebar). ⚠️ Não criamos ainda — usamos só painel até agora.
- **Campaign** — entidade que agrupa products, gateway, upsells, rebill terms. Toda order pertence a uma campaign.
- **Product** — SKU. Pode ter price ladder (mensal vs 3-month).
- **Offer** — variação de product com preço/parcelamento específico. Campanhas têm "Campaign Offers" linkando product+offer.
- **Order** — venda. Tem `orderId`, `customerId`, `transactionId`, status.
- **Lead** — registro de contato preexistente (firstName, lastName, email, phone). Precede order.
- **Upsale (sic)** — upsell one-click contra order existente usando cartão já salvo.
- **Subscription / Rebill** — orders com termo recorrente disparam cobrança automática conforme `nextBillDate`.
- **Quality Assurance (QA)** — fila de revisão manual antes de capturar. Em Nuestra RX, configurado em 100% — toda order entra na fila.
- **Postback Profile** — config de qual URL recebe webhook. Tem URL + Field Mappings + Routing.
- **Profile Routing** — define qual profile dispara pra qual combinação (Customer Type + Campaign + Product).
- **Customer Type** — categoria de evento (32 tipos: New Sale, Capture, Decline, QA Pending, Refunded, Chargeback, Rebill Declined, Recurring Order, Cancel, etc.).
- **Field Mappings** — define **quais campos** vão no payload do postback. Especiais com prefixo `header:` viram **headers HTTP** (truque do CKC).

## Test cards do CKC (Admin → Test Cards)

⚠️ **Importante:** Test cards do CKC (`0000000000000000`) **NÃO disparam postbacks**. Isso é documentado:
> "Test Card orders will not export through the webhook system."

Pra testar postbacks, usar cartão real (`4111111111111111`) com **Test Mode da NMI ligado** — assim o NMI não cobra, mas o CKC trata como real e exporta.

CVVs do test card genérico CKC:
- `100` → approved
- `900` → declined
- `910` → insufficient funds
- `800` → prepaid
- `700` → debit
- `111` → 3DS approved (frictionless)
- `555` → 3DS challenge

## Status atual do trabalho (2026-05-27)

- ✅ Profile `Nuestra-AWSales-Dev` criado, clonado do Hub-Main
- ✅ Postback URL: `https://n8n-dev.awsales.io/webhook/nuestra-champ`
- ✅ Routes: New Sale, Capture, QA Pending, Decline, Recurring Order, All Refunds, Chargeback (todos x All Campaigns x All Products)
- ✅ Webhook trigger ativo no n8n
- 🚨 **BLOQUEADO**: postback ainda não chegou no n8n. Erro "You have already purchased from this campaign" no Order Entry — dedupe por Reorder Days/cartão/IP. Próximo passo: deletar customers de teste ou ajustar Reorder Days temporariamente.

## Pendências (⚠️ confirmar)

- Subdomínio CKC do tenant (algum painel/SSO diferente de `api.checkoutchamp.com`?)
- Subscription/rebill: 100% via CKC ou tem casos NMI?
- BAA HIPAA (CKC processa PHI? Provavelmente sim já que tem dados de saúde no fluxo).
