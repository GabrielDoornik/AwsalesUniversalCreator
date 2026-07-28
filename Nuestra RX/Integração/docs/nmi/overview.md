# NMI — Network Merchants Inc

## O que é (resumo curto)

**Gateway de pagamento** que conecta o checkout (Checkout Champ) com a rede de cartão (Visa/MC/Amex). Não cobra dinheiro — só **autoriza** transações e devolve resposta (aprovado/recusado). Multi-MID, suporta tokenização, recurring billing, 3DS, chargebacks.

## Papel no stack Nuestra RX

```
Cliente preenche cartão no Checkout Champ
            ↓
    Checkout Champ chama NMI (security key)
            ↓
NMI conversa com processador (EPX) → banco do cliente
            ↓
NMI devolve: APPROVED / DECLINED + auth_code + transaction_id
            ↓
NMI dispara webhook pra nós (Vercel hub + n8n)
```

## Configuração atual da conta Nuestra RX (confirmado em 2026-05-26)

| Item | Valor |
|---|---|
| Conta NMI | **NUESTRA RX LLC** (gateway Pedro Leite) |
| Merchant ID | `1307043` (visto em payload real, `merchant.name = "Nuestra Rx llc"`) |
| Processador real | **EPX** (`processor_id: "epx"` no payload) |
| Test Mode | 🟠 **LIGADO** (lembrar de desligar antes de prod) |
| Webhook Signing Key | 🔑 `DA3BBBE67C06EB25B8E40018C3ACDC7F` (compartilhada com hub Vercel do Ruben) |
| Endpoints ativos | (1) `nuestrarx-hub.vercel.app/api/webhooks/nmi` — Ruben (2) `n8n-dev.awsales.io/webhook/nuestra-nmi` — nosso |
| Eventos subscritos | 25 (sale/auth/capture/void/refund/credit success+failure+unknown, recurring.subscription, settlement.batch, chargeback.batch, acu.summary) |

⚠️ **Importante:** Signing Key é **única por conta NMI** — não dá pra ter signing key separada por endpoint. Os 2 endpoints (Vercel + n8n) compartilham. Regenerar quebra os 2 simultaneamente.

## Conceitos críticos

- **Security Key / Private API Key**: credencial server-side. Vai como `Authorization` header (v5) ou `security_key` no body (Classic).
- **Public Tokenization Key**: chave pública pra Collect.js tokenizar cartão no browser (PCI SAQ-A).
- **Webhook Signing Key**: secret pra validar HMAC-SHA256 dos webhooks recebidos.
- **Customer Vault**: cofre tokenizado. Cada cartão salvo vira um `customer_vault_id` reutilizável (rebill, MIT).
- **Subscription + Plan**: módulo de recorrência nativo do NMI. ⚠️ Nuestra RX usa rebill do **Checkout Champ**, não do NMI — então esse módulo NMI fica sem uso.
- **3DS**: Visa/MC fora dos US precisa de autenticação 3DS2. Nuestra RX é US-only, então não obrigatório.
- **Test Mode**: liga/desliga em Gateway Options → Test Mode. Em test mode, NMI não envia transação pro processador — útil pra teste integrado com Checkout Champ.

## Webhooks

**Endpoint atual no n8n:** `https://n8n-dev.awsales.io/webhook/nuestra-champ`... espera, é `nuestra-nmi`. Profile separado.

**IPs do NMI** (allowlist se precisar):
- `104.192.32.81` – `104.192.32.87`
- `104.192.36.81` – `104.192.36.87`

**Header de assinatura:** `Webhook-Signature: t=<nonce>,s=<sig>`
**Algoritmo:** `HMAC-SHA256(nonce + "." + raw_body, signing_key)`

Detalhes completos em [webhooks.md](webhooks.md) e [normalizer/sample-real-payload.md](normalizer/sample-real-payload.md).

## PCI

NMI é PCI Level 1. Usando Collect.js + Customer Vault, aplicação fica em SAQ-A. Se PAN passar pelo seu servidor (Direct Post API), vira SAQ-D — evitar.

## Status atual do trabalho (2026-05-27)

- ✅ Webhook endpoint cadastrado
- ✅ Workflow n8n recebendo payload real
- ✅ Normalizer NMI → AWSales implementado ([normalizer/code-node.js](normalizer/code-node.js))
- ⏳ Validação HMAC ainda não implementada (precisa decidir como acessar raw body no n8n)
- ⏳ Teste com produto real fora do Virtual Terminal pendente

## Pendências (⚠️ confirmar com Ruben/operação)

- Se Collect.js já está habilitado na conta (Public Tokenization Key emitida?)
- Se Subscription do NMI é usado pra algum cenário ou se 100% do rebill é do CKC
- Quando desligar Test Mode pra ir pra prod
