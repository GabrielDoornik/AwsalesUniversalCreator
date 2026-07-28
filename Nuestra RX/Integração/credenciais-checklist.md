# Checklist de credenciais para n8n

Lista do que coletar de cada plataforma antes de criar os Credentials no n8n. Marque `[x]` quando tiver em mãos.

---

## NMI

### Onde criar
Merchant Portal → **Settings → Security Keys → Add a New Key**
Portal de produção: https://secure.nmi.com/merchants/login.php
Sandbox: https://guide.nmi.com

### Coletar

- [ ] **Private API Key** (permission: API) — usar nos nodes HTTP do n8n que falam server-to-server
  - Onde colar no n8n: header `Authorization: <key>` (v5) ou campo `security_key` no body (Classic)
- [ ] **Public Tokenization Key** (permission: Tokenization) — usar se o front-end (Dosable) tokeniza via Collect.js
- [ ] **Webhook Signing Key** — gerada ao criar o webhook em Settings → Webhooks (necessária pra validar HMAC-SHA256 do postback)
- [ ] **MID(s)** — identificador do merchant, se a operação tiver mais de um (split por produto/oferta)
- [ ] **URL base que vai usar:**
  - v5 REST: `https://api.nmi.com`
  - Classic Direct Post: `https://secure.nmi.com/api/transact.php`
  - Query legacy: `https://secure.nmi.com/api/query.php`
- [ ] **Sandbox keys** (separadas das de produção — emitidas em `guide.nmi.com`)

### IPs pra liberar no firewall (webhook NMI → n8n)
- `104.192.32.81` – `104.192.32.87`
- `104.192.36.81` – `104.192.36.87`

---

## Checkout Champ

### Onde criar
Painel CKC → **Admin → Users → + (botão verde)** → marcar como **API User** e selecionar endpoints permitidos.

### Coletar

- [ ] **loginId** do API User (não é o login de admin)
- [ ] **password** do API User
- [ ] **Subdomínio do tenant** (`nuestrarx.checkoutchamp.com`? `crm.nuestrarx.com`?) — relevante pra links de painel; a API é sempre `api.checkoutchamp.com`
- [ ] **campaignId** padrão (e secundários, se houver mais de uma campanha)
- [ ] **Gateway Profile ID** que aponta pro NMI (configurado em Gateway Setup)
- [ ] **Postback Profile** criado em Admin → Exports (ver `docs/checkout-champ/webhooks.md`)
  - [ ] URL do receiver (webhook do n8n)
  - [ ] Field Mappings configurados (incluir um campo `secret_token` com valor estático compartilhado)
  - [ ] Eventos roteados (SALE, PARTIAL, DECLINE, REFUND, CANCEL, SUBSCRIPTION_STOP, etc.)
- [ ] **URL base:** `https://api.checkoutchamp.com` (única, não há sandbox público)
- [ ] **Shared secret** que vai no field mapping `secret_token` (gerar UUID, guardar no n8n Credentials)

### IPs do CKC (pra allowlist do receiver do n8n)
- `80.248.30.132`
- `80.248.30.141`
- `52.206.5.84`
- `44.219.22.112`

---

## Dosable

⚠️ **Sem documentação pública.** Antes de coletar credenciais, é preciso solicitar a doc — template em [`docs/dosable/pending-api-docs.md`](docs/dosable/pending-api-docs.md).

### Coletar (depois que a Dosable responder)

- [ ] **API base URL** (prod e sandbox, se houver)
- [ ] **Auth credential** (formato a confirmar: Bearer token? API key? OAuth2 client_id/secret?)
- [ ] **Webhook secret / signing key** (formato a confirmar)
- [ ] **Tenant ID / Account ID** dentro da Dosable
- [ ] **BAA** (Business Associate Agreement) assinado — requisito HIPAA antes de produção
- [ ] **IPs de origem** dos webhooks da Dosable (pra allowlist)
- [ ] **Rate limits** por endpoint
- [ ] **Lista de eventos** de webhook disponíveis e payload de cada

### Contato
- E-mail: kirten@dosable.com (⚠️ confirmar validade)
- Alternativa: formulário "Book a Demo" em https://dosable.com/

---

## Nuestra RX - AI Handoff

### Onde usar
AWSales -> Configurar Habilidades Personalizadas -> Criar conexao da tool `Enviar avaliacao Nuestra RX`.

### Coletado

- [x] **Nome da conexao AWSales:** `Nuestra RX - AI Handoff`
- [x] **Organizacao AWSales:** `Nuestra Rx` (`b34f181e-c7b3-49fb-b69f-3454a7336df2`)
- [x] **Tipo de autenticacao:** `Bearer Token`
- [x] **Endpoint:** `https://webhook.nuestrarx.com/ai-handoff`
- [x] **AI_HANDOFF_SECRET / Token:** `EKSqZLZXgARMrY9l9eDOreI_aNH4u9ebkwRBYyuMRSM`

### Como colar na AWSales

No campo `Token`, colar somente o valor do `AI_HANDOFF_SECRET`, sem `Bearer` antes.

Header final esperado pela requisicao:

```http
Authorization: Bearer EKSqZLZXgARMrY9l9eDOreI_aNH4u9ebkwRBYyuMRSM
```

---

## Receivers (webhook URLs do n8n)

Quando criar os webhooks no n8n, anotar aqui pra referência:

- [ ] **NMI webhook URL** (cadastrar em NMI Merchant Portal → Settings → Webhooks): `_______________`
- [ ] **CKC postback URL** (cadastrar em Admin → Exports → Postback Profile): `_______________`
- [ ] **Dosable webhook URL** (cadastrar quando a Dosable destravar): `_______________`

Lembrar: usar webhook URLs **com HTTPS válido**. Se for self-hosted n8n atrás de Cloudflare/Nginx, validar certificado antes de ativar em produção.
