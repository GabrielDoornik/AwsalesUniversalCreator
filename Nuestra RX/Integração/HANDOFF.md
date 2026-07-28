# HANDOFF — Integração Nuestra RX (Dosable + Checkout Champ + NMI)

> **Para IA que pegar essa thread depois:** leia este arquivo INTEIRO antes de responder qualquer coisa. Ele é a fonte de verdade do estado atual. Os arquivos referenciados estão todos em `c:\Users\Pedro\Desktop\AwsalesUniversalCreator\Nuestra RX\Integração\`.

---

## Quem é o usuário e o que ele está fazendo

- **Pedro** (pedrohlmendes@gmail.com), trabalha na agência **AWSales** que cria campanhas de bots IA de WhatsApp (contexto do `CLAUDE.md` raiz do workspace — não interfere nessa task).
- Esta task específica é uma operação chamada **Nuestra RX** — DTC telehealth/Rx (provavelmente GLP-1, weight loss, ED, hair, skincare).
- Stack da operação: **Dosable** (front funil) → **Checkout Champ** (CRM/OMS/checkout) → **NMI** (gateway).
- **Ferramenta de integração: n8n** (self-hosted em `n8n-dev.awsales.io`). NÃO é projeto de código Node/TypeScript. O usuário **não vai codar** — vai montar fluxos visuais no n8n e usar a doc desta pasta como referência.
- Erro inicial cometido (importante não repetir): na primeira iteração, montei estrutura de projeto Node/TS com `integrations/`, `shared/`, `.env.example` no formato de app. O usuário corrigiu — só queria docs pra consulta. **Foi deletado.**

## Estado atual da pasta

```
Nuestra RX/Integração/
├── README.md                   ← índice da doc, visão do stack
├── HANDOFF.md                  ← ESTE arquivo, fonte de verdade do contexto
├── credenciais-checklist.md    ← o que coletar de cada plataforma p/ n8n Credentials
└── docs/
    ├── nmi/
    │   ├── overview.md
    │   ├── api-reference.md
    │   ├── webhooks.md
    │   └── links.md
    ├── checkout-champ/
    │   ├── overview.md
    │   ├── api-reference.md
    │   ├── webhooks.md
    │   └── links.md
    └── dosable/
        ├── overview.md
        ├── pending-api-docs.md  ← template de e-mail p/ pedir doc à Dosable
        └── links.md
```

## O que já está documentado (lido da doc oficial)

### NMI — gateway (✅ doc completa)
- **Base prod v5:** `https://api.nmi.com` (REST/JSON)
- **Base prod Classic Direct Post:** `https://secure.nmi.com/api/transact.php` (form-urlencoded)
- **Sandbox:** `https://guide.nmi.com` (portal pra emitir keys; usa mesmos hosts de API)
- **Auth v5:** header `Authorization: <PRIVATE_KEY>` (NÃO é Bearer; é a chave direta)
- **Auth Classic:** `security_key=<KEY>` no body form-encoded
- **3 tipos de chave:** Private (server), Public Tokenization (Collect.js browser, SAQ-A), Partner (onboarding)
- **Webhook HMAC:** `HMAC-SHA256(nonce + "." + raw_body, signing_key)`, header `Webhook-Signature: t=<nonce>,s=<sig>`
- **IPs webhook (NMI → você):** `104.192.32.81-87` e `104.192.36.81-87`
- **Eventos:** transactions, recurring/ACH, settlement, chargebacks, ACU (account updater)
- **SDK Node:** ❌ não tem oficial. No n8n, usar nós HTTP Request.

### Checkout Champ (✅ doc razoável, alguns gaps)
- **Base prod única:** `https://api.checkoutchamp.com` (sem sandbox público)
- **Auth:** `loginId` + `password` como query string OU form-encoded body. Sempre server-side.
- **Endpoints confirmados:** `/landers/clicks/import/`, `/leads/import/`, `/order/import/`, `/upsale/import/`, `/order/confirm/`, `/transactions/confirmPaypal`, `/transactions/query/`, `/order/query/`, `/customer/query/`, `/purchases/query/`
- **Fluxo:** click → lead → order → upsale → confirm (se 3DS/PayPal redirect)
- **Paginação:** default 25, máx 500 via `resultsPerPage`, navegação por `page=N`
- **Rate limit:** 10 queries abertas simultâneas por conta (concorrência)
- **IPs CKC (CKC → você, p/ webhook):** `80.248.30.132`, `80.248.30.141`, `52.206.5.84`, `44.219.22.112`
- **Webhook = Postback Export Profile** (Admin → Exports → New Profile → Postback)
- **❌ CKC NÃO tem HMAC nativo** — segurança = IP allowlist + shared secret em Field Mapping + reconciliação via Query API
- **Eventos exportáveis:** SALE, PARTIAL, DECLINE, CANCEL, REFUND, CHARGEBACK, SUBSCRIPTION_STOP, UPSELL, RETURN

### Dosable (❌ SEM doc pública)
- Não tem `/developers`, `/api`, SDK, Postman, OpenAPI.
- Contato encontrado no site: `kirten@dosable.com` (⚠️ confirmar validade)
- Template de e-mail pronto em `docs/dosable/pending-api-docs.md`
- **Bloqueio:** sem doc oficial, qualquer integração da Dosable é especulação. Não fazer engenharia reversa.

## Decisões importantes já tomadas

1. **Tudo server-side** — credenciais sensíveis (NMI Private Key, CKC loginId/password) ficam nos **Credentials do n8n**, nunca em texto plano em nodes.
2. **Tokenização preferida:** Collect.js do NMI no front (mantém PCI SAQ-A). ⚠️ Confirmar com Pedro qual padrão a Dosable usa de fato.
3. **CKC sem HMAC:** convencionamos validar postback do CKC via combinação de (a) IP allowlist, (b) shared secret em Field Mapping chamado `secret_token`, (c) reconciliação periódica via Query API.
4. **`⚠️ confirmar`:** marcação usada em todos os pontos ambíguos da doc lida — não assumir silenciosamente.

## Onde estamos AGORA na execução

**Fase atual:** Configuração de webhooks da NMI no painel + criação do receiver no n8n.

**🚨 DESCOBERTA CRÍTICA (2026-05-26):** já existe webhook NMI ativo apontando para:
- **`https://nuestrarx-hub.vercel.app/api/webhooks/nmi`**
- Implica que existe um **hub** em produção na Vercel da operação Nuestra RX que JÁ recebe eventos da NMI.
- **Não sabemos ainda:** (a) o n8n vai substituir o hub ou rodar em paralelo; (b) quem mantém o hub; (c) se há código/repo desse hub acessível.
- Pedro precisa esclarecer isso antes de seguir. NMI suporta múltiplos endpoints na mesma subscription compartilhando Signing Key, então tecnicamente roda em paralelo.

**Status da Signing Key:**
- Foi **revelada visualmente** no painel (compartilhada por todos os endpoints da subscription).
- **Foi coletada**. Por segurança, valor NÃO está em arquivo nesta pasta — vai pros Credentials do n8n direto.
- Se a key vazar, regenerar no painel quebra o hub Vercel atual também — coordenar antes.

**Step in progress (último que o Pedro estava fazendo):**
- Logado no painel NMI, adicionou endpoint para `https://n8n-dev.awsales.io/webhook/nuestra-nmi`.
- Erro "Invalid Authentication REFID" foi resolvido com logout/login.
- ✅ **Salvo com sucesso.** Painel agora mostra DOIS endpoints sob a MESMA Signing Key (`[REDACTED — salvo no n8n/painel NMI]`):
  1. `https://nuestrarx-hub.vercel.app/api/webhooks/nmi` (preexistente)
  2. `https://n8n-dev.awsales.io/webhook/nuestra-nmi` (recém-adicionado)

**⚠️ Implicação arquitetural:** os 2 endpoints estão na MESMA Webhook Subscription. Compartilham Signing Key, eventos subscritos e regeneração de key. Mexer em um afeta o outro.

**Decisão pendente:** manter como está (1 subscription, 2 endpoints) ou separar em 2 subscriptions independentes (cada uma com Signing Key própria) — depende de:
1. Quem mantém o hub Vercel (pergunta aberta pro Pedro).
2. Se NMI permite múltiplas subscriptions (não confirmado — botão "Create" visível só adiciona endpoint na mesma subscription).

**🔄 Update 2026-05-26 (continuação):**

Pedro tentou separar e descobriu/esclareceu:
1. **A conta NMI é da NUESTRA RX LLC** (Pedro Leite logado nela). Confirmado no header do painel.
2. **O hub Vercel `nuestrarx-hub.vercel.app` foi configurado por OUTRO Pedro da Nuestra RX** (homônimo trabalhando na mesma operação). Não é misterioso — é infra interna feita por outro dev/responsável da empresa.
3. Pedro quer **isolar** o trabalho dele no n8n da infra que o outro Pedro montou no Vercel — não quer que mexer no n8n quebre nada do outro lado.

**🔧 Correção FINAL de entendimento (claude errou DUAS vezes, agora confirmado pela doc oficial NMI lida pelo Pedro):**

Iteração 1: "NMI só tem 1 subscription por gateway" — meio certo, meio errado.
Iteração 2: "Cada endpoint tem sua própria Signing Key" — ERRADO (fonte secundária do search).

**Realidade confirmada (doc oficial citada pelo Pedro):**

> "The Webhooks settings page shows your webhooks signing key" (singular, "your" da conta inteira).

**Estrutura definitiva da NMI:**
- **1 Signing Key por conta NMI inteira** (não por endpoint, não por subscription).
- **N endpoints** podem ser adicionados, cada um com URL e lista de eventos PRÓPRIOS.
- Todos os endpoints da conta usam a mesma Signing Key pra HMAC.

**O que é compartilhado:** Signing Key.
**O que é independente por endpoint:** URL + lista de eventos subscritos.

**Implicação para Nuestra RX:**
- A Signing Key (`[REDACTED — salvo no n8n/painel NMI]`) **é da conta NUESTRA RX LLC**, portanto é da operação — não é "do outro Pedro" exclusivamente.
- Pode usar essa mesma key no n8n sem culpa. Os dois (Vercel do outro Pedro e n8n do Pedro atual) validam HMAC com a mesma key, em consumidores independentes.
- Único risco real: regenerar a Signing Key quebra os dois simultaneamente — coordenar com o outro Pedro antes se isso for necessário.

**Próximo passo:** Pedro clica em "Add Endpoint" / Create, cadastra URL n8n + eventos que ELE quer (lista independente do que o Vercel tem subscrito), salva. Usa a Signing Key salva no n8n/painel NMI.

---

**🔄 Update 2026-05-26 (continuação 2):**

**Concluído:**
- ✅ Pedro cadastrou endpoint `https://n8n-dev.awsales.io/webhook/nuestra-nmi` na NMI com eventos selecionados, usando a Signing Key compartilhada da conta (`[REDACTED — salvo no n8n/painel NMI]`).
- ✅ Workflow criado no n8n com nó **Webhook** trigger, Path `nuestra-nmi`, Method POST, Authentication None, Respond Immediately 200. Workflow está **Active**, Production URL ao vivo.

**Confusão evitar repetir (claude errou de novo):**
- Header Auth credentials no n8n NÃO servem pro signing key — são pra outbound auth. Pra HMAC validation em Code node, usar env var, n8n Variables (se Enterprise), ou hardcode em dev.
- HTTP Request node (outbound) NÃO é o caminho pra receber webhook. Webhook trigger node é.
- Já criamos `Header Auth account 2` e `NMI - Webhook Signing Key` no n8n — podem ficar como storage seguro pro futuro, mas NÃO vão ser usados no fluxo de webhook receiver.

**Status atual (em progresso):**
- Pedro quer testar enviando evento real pro webhook. NMI não tem botão "Send Test Event" — caminhos: (A) Test Mode + transação via Virtual Terminal; (B) curl manual mockando payload.
- HMAC validation ainda NÃO foi implementada. Workflow só recebe e responde 200.

**Próximos passos:**
1. Pedro ativa Test Mode na NMI e roda transação de teste via Virtual Terminal → vê payload chegar no n8n Executions.
2. Confirmar estrutura real do payload (campos, headers).
3. Adicionar Code node depois do Webhook trigger pra validar HMAC com signing key (hardcoded em dev, env var em prod).
4. Adicionar Switch node pra rotear por `event_type`.
5. Decidir destinos downstream (DB, Slack, fila, etc.).

---

**🔄 Update 2026-05-26 (continuação 3 — sessão final do dia):**

**Concluído:**
- ✅ Test Mode da NMI ativado (Gateway Options → Test Mode → Enable).
- ✅ Sale teste processada com sucesso via Credit Cards → Sale (Virtual Terminal). Transaction ID `12108893059`, $1.00, Visa `4111...1111`, Test User, NY 10001.
- ✅ NMI disparou webhook `transaction.sale.success`. Primeira tentativa falhou no n8n (HTTP Request órfão quebrava validação do workflow), mas Pedro consertou (deletou o nó), fez nova sale (`12108893059`) e o payload chegou limpo.
- ✅ **Payload real capturado e documentado em `docs/nmi/sample-payload-sale-success.md`**. Contém headers reais, body completo, dicas de normalização, algoritmo HMAC, e alerta crítico sobre raw body.

**Aprendizados desta iteração:**
- Workflow no n8n com qualquer nó inválido (HTTP Request sem URL) faz o webhook trigger RETORNAR ERRO antes de processar payload. NMI vai retry, mas pra debug é mais rápido consertar e refazer transação de teste.
- IP real da NMI vem em `x-original-forwarded-for` (tem Cloudflare na frente do n8n self-hosted). IP confirmado: `104.192.36.84` — dentro do range documentado `104.192.36.81-87`.
- MID da Nuestra RX: `1307043` (confirmado pelo payload — `merchant.id`).
- NMI usa cliente Go (`user-agent: Go-http-client/2.0`).
- Payload já vem com `features.is_test_mode: true` — filtrar antes de processar em prod.

**Pendente urgente — investigação técnica:**
- ⚠️ HMAC validation depende do RAW BODY. n8n Webhook node parsa o JSON automaticamente. Precisa descobrir como acessar `rawBody` no n8n (opção do node? `$json` vs `$binary`?). Se não der nativo, alternativa é desabilitar parse e fazer manual no Code node. Validar isso antes de codar a verificação HMAC.

**Próximos passos atualizados:**
1. Investigar como acessar raw body no n8n Webhook node (opção "Binary Data"? `request.rawBody`?).
2. Adicionar Code node com validação HMAC usando a Signing Key salva no n8n/painel NMI (algoritmo pronto em `docs/nmi/sample-payload-sale-success.md`).
3. Switch node por `event_type` (sale.success, sale.failure, refund.*, etc.).
4. Decidir destinos downstream (DB, Slack, fila).
5. Configurar webhook do Checkout Champ (Postback Profile) — quando tiver acesso/credenciais.
6. Solicitar doc Dosable (template em `docs/dosable/pending-api-docs.md`).

---

**🔄 Update 2026-05-26 (continuação 4 — sessão muito longa, esta pode ser a última):**

**Concluído nesta etapa:**
- ✅ Pedro adicionou doc oficial NMI dos payloads em `docs/nmi/Payloads/` — 16 arquivos .md, um por event_type.
- ✅ Pedro adicionou payload real capturado de `transaction.void.success` em `docs/nmi/Payloads/transaction.void.success.md`. Agora a pasta tem 17 arquivos.
- ✅ Pedro adicionou payload real capturado de `transaction.refund.success` em `docs/nmi/Payloads/transaction.refund.success.md`. Agora a pasta tem 18 arquivos.
- ✅ Pedro adicionou payload real capturado de `transaction.sale.failure` em `docs/nmi/Payloads/transaction.sale.failure.md`. Agora a pasta tem 19 arquivos.
- ✅ **Comparação doc vs real (transaction.sale.success):** estrutura idêntica, mesmas chaves/nesting/tipos. Real tem ~20 campos extras (newer features: VAT/tax internacional, `network_token_used`, `tap_to_mobile`, `feature_token`, `merchant_defined_fields`, `merchant_advice_code`, etc.). Doc é **subset-compatível com real** — pode usar doc como referência canônica de normalização.
- ✅ Descoberto: `transaction.sale.success` tem **3 variants por `transaction_type`**:
  - `cc` (Credit Card) — tem objeto `card`
  - `ck` (Electronic Check) — tem objeto `check { check_account, check_aba, account_holder_type, account_type, sec_code }`
  - `cs` (Cash) — sem `card` nem `check`
  - Pra Nuestra RX provavelmente só `cc` interessa, mas Switch deve considerar variant.
- ✅ Tabela `card.entry_mode`: 0=Unknown, 1=Invalid, 2=NFC MSD, 3=Swiped, **4=Keyed**, 5=EMV ICC, 6=NFC EMV, 7=Keyed-Fallback, 8=Swiped-Fallback. Sale teste deu `entry_mode: "4"` (Keyed) — bate com Virtual Terminal.

**Inventário de payload docs (cross-ref com 25 Subscribed Events do painel NMI):**

✅ **COM payload documentado disponível:** transaction.sale.success, transaction.sale.failure (captura real), transaction.void.success (captura real), transaction.refund.success (captura real), transaction.check.status.{settle,return,latereturn}, recurring.subscription.{add,update,delete}, recurring.plan.{add,update,delete}, settlement.batch.{complete,failure}, chargeback.batch.complete, acu.summary.{automaticallyupdated,contactcustomer,closedaccount}.

⚠️ **Correção importante:** a doc oficial NMI aparentemente NÃO publica exemplos separados para `transaction.sale.failure/unknown`, `transaction.auth.*`, `transaction.capture.*`, `transaction.void.*`, `transaction.refund.*` ou `transaction.credit.*`. No menu de Examples > Transaction só existe `transaction.sale.success`; os demais exemplos de transação publicados são apenas `transaction.check.status.*` (ACH/check).

📁 **Arquivos extras (não subscritos, ignorar por enquanto):** transaction.check.status.{settle,return,latereturn}, recurring.plan.{add,update,delete}.

**Onde parou (última coisa concreta):**
Cross-ref atualizado após Pedro confirmar visualmente a árvore da doc oficial NMI: não há 15 payload docs faltantes para copiar. Para transações de cartão, usar `transaction.sale.success` + payloads reais capturados (`transaction.sale.success`, `transaction.sale.failure`, `transaction.void.success`, `transaction.refund.success`) como base canônica e capturar eventos reais de teste para auth/capture quando possível.

**Próximos passos atualizados (em ordem):**

1. **Desenhar schema unificado de normalização** sem esperar por samples oficiais inexistentes — TS/zod-like na cabeça, vira Code node de "Normalize NMI Event" no n8n. Vai mapear:
   - Discriminator: `event_type` + `event_body.transaction_type` (pra sale.success com variants cc/ck/cs)
   - Campos canônicos: event_id, transaction_id, merchant_id, is_test_mode, amount, currency, response_code, success, action_type, date_utc (parsear de `YYYYMMDDhhmmss`), card_last4, card_bin, card_type, billing_address, customer_email/phone
   - Variants extras: subscription_id (recurring), batch_id (settlement), chargeback_id (chargeback)

2. **Capturar payloads reais adicionais via Test Mode** quando possível: `transaction.auth.success`, `transaction.capture.success`. Esses samples viram docs locais, mas não dependem da doc oficial. `transaction.sale.failure`, `transaction.void.success` e `transaction.refund.success` já foram capturados.

3. **Investigar `rawBody` no n8n Webhook node** (pendente desde antes — crítico pra HMAC).

4. **HMAC validation Code node** com Signing Key salva no n8n/painel NMI (algoritmo em `docs/nmi/sample-payload-sale-success.md`).

5. **Switch node** roteando por event_type (após normalização).

6. **Downstream:** decidir destinos (DB? Slack? fila? CRM próprio?).

7. **Checkout Champ + Dosable**: paralelo, conforme credenciais/doc destravam.

**Arquivos importantes pra próxima IA ler ANTES de qualquer coisa:**
- `HANDOFF.md` (este arquivo — sempre primeiro)
- `docs/nmi/normalizer/sample-real-payload.md` (payload real + algoritmo HMAC)
- `docs/nmi/payloads/*.md` (samples da doc oficial)
- `docs/nmi/normalizer/mapping.md` (mapeamento NMI → AWSales)
- `docs/nmi/normalizer/code-node.js` (Code node pronto pra n8n)
- `docs/nmi/webhooks.md` (mecanismo de HMAC e eventos)
- `credenciais-checklist.md` (status de credenciais coletadas)

**Estado de credenciais no n8n (final desta sessão):**
- `Header Auth account 2` e `NMI - Webhook Signing Key` criados como Header Auth — **NÃO usados** no workflow atual (não servem pra HMAC em Code node). Manter como storage seguro pra outbound futuro ou deletar.
- Workflow `Nuestra RX - Integrações` (ou nome similar) tá Active com 3 nós Webhook trigger placeholder: `NMI`, `Checkout champ`, `Dosable`. Só NMI tá conectado a algo (HTTP Request que foi deletado, agora limpo).

**Sinais e bandeiras importantes pra próxima IA:**
- 🟢 Pedro é técnico, entende rápido, mas detesta repetir passos já dados. Confirmar contexto antes de instruir.
- 🟢 Pedro lê doc oficial e questiona quando algo soa errado — confiar nele quando ele questiona, validar 2x antes de cravar comportamento da plataforma.
- 🔴 Eu (claude na sessão anterior) errei 3x: estrutura code Node/TS desnecessária; signing key "por endpoint" baseado em snippet ruim; insistir em criar webhook separado quando NMI só permite um. Não repetir.
- 🟡 Hub Vercel do "outro Pedro" da Nuestra RX está ativo e compartilha a signing key. Não deletar/mexer sem coordenar.
- 🟡 Test Mode da conta NMI tá LIGADO (Pedro ligou pra testar). Lembrar de desligar antes de ir pra prod.

**Eventos disponíveis na NMI (lista REAL extraída do painel, confirmada 2026-05-26):**

Recurring: `recurring.plan.add/update/delete`, `recurring.subscription.add/update/delete`
Settlement: `settlement.batch.complete`, `settlement.batch.failure`
Transaction sale: `transaction.sale.success/failure/unknown`
Transaction auth: `transaction.auth.success/failure/unknown`
Transaction capture: `transaction.capture.success/failure/unknown`
Transaction void: `transaction.void.success/failure/unknown`
Transaction refund: `transaction.refund.success/failure/unknown`
Transaction credit: `transaction.credit.success/failure/unknown`
Transaction validate: `transaction.validate.success/failure/unknown`
Check ACH: `transaction.check.status.return/latereturn/settle`
ACU: `acu.summary.automaticallyupdated/contactcustomer/closedaccount`
Network Token: `networktoken.token.create/refresh`
Chargeback: `chargeback.batch.complete`

**Subscritos (recomendado para Nuestra RX):**
- transaction.sale.success/failure
- transaction.auth.success/failure
- transaction.capture.success/failure
- transaction.void.success/failure
- transaction.refund.success/failure
- recurring.subscription.add/update/delete
- settlement.batch.complete/failure
- chargeback.batch.complete
- acu.summary.automaticallyupdated/contactcustomer/closedaccount
- `.unknown` variants (sale/auth/capture/void/refund/credit) — opcional, ajuda na reconciliação

**Não subscritos (deliberadamente):**
- recurring.plan.* — plans são templates raramente mexidos
- transaction.validate.* — zero-dollar auth, sem valor operacional
- transaction.check.status.* — só ACH (Nuestra RX provavelmente não aceita)
- networktoken.* — só se usar Network Tokenization explicitamente
- transaction.credit.success/failure — credit standalone, raro em DTC

## Credenciais coletadas até agora

| Item | Status | Valor |
|---|---|---|
| NMI Private API Key | ⏳ pendente | — |
| NMI Public Tokenization Key | ⏳ pendente | — |
| NMI Webhook Signing Key | ✅ coletada (não armazenar em arquivo) | Vai para Credentials do n8n como `NMI Webhook Signing Key`. Compartilhada com hub Vercel preexistente. |
| NMI Webhook URL no n8n | ✅ definido | `https://n8n-dev.awsales.io/webhook/nuestra-nmi` |
| NMI MID(s) | ✅ confirmado | `1307043` (visto no payload — merchant.id, name "Nuestra Rx llc") |
| CKC loginId | ⏳ pendente | — |
| CKC password | ⏳ pendente | — |
| CKC tenant subdomain | ⏳ pendente | — |
| CKC campaignId | ⏳ pendente | — |
| CKC shared secret p/ postback | ⏳ pendente | — |
| Dosable — qualquer coisa | ❌ bloqueado | (precisa enviar e-mail pra `kirten@dosable.com`) |

> **IA que continuar:** ATUALIZE esta tabela conforme o Pedro for confirmando valores. NÃO guarde valores secretos aqui em texto plano — anote só que foi coletado e onde está armazenado (ex: "Salvo em Credentials do n8n como `NMI - Private Key`").

## n8n — convenções desta operação

- Self-hosted em `n8n-dev.awsales.io`
- Webhook URL pattern: `https://n8n-dev.awsales.io/webhook/<nome-do-fluxo>`
- Receiver da NMI: `nuestra-nmi`
- Próximos receivers a criar (sugestão): `nuestra-ckc-postback`, `nuestra-dosable` (quando destravar)

## Pontos pendentes (⚠️ confirmar com Pedro)

1. **🚨 Hub Vercel `nuestrarx-hub.vercel.app/api/webhooks/nmi`** — quem mantém, tem repo, vai substituir ou rodar em paralelo com n8n?
2. Qual MID(s) da NMI a operação usa em prod (split por produto?).
3. Se Dosable tokeniza via Collect.js do NMI ou se envia PAN cru pro CKC.
4. Subdomínio do CKC (`nuestrarx.checkoutchamp.com`?).
5. Quem é source of truth do customer/paciente — Dosable ou CKC?
6. Se vai usar Subscription do NMI ou do CKC pra rebill.
7. Janela de testes em sandbox vs go-live em prod.
8. BAA (Business Associate Agreement) HIPAA — quem assinou com quem.

## Próximos passos lógicos (caminho recomendado)

1. **Terminar webhook NMI no painel** — copiar Signing Key, salvar em Credentials do n8n como `NMI Webhook Signing Key`.
2. **Montar o receiver no n8n** (`/webhook/nuestra-nmi`):
   - Nó **Webhook** (POST, JSON, retornar 200 imediato)
   - Nó **Code** ou **Function** pra validar HMAC-SHA256 (algoritmo no `docs/nmi/webhooks.md`)
   - Nó **Switch** pra rotear por tipo de evento
   - Nós downstream conforme caso (gravar em DB, mandar pra Slack, etc.)
3. **Criar webhook CKC** — Admin → Exports → New Postback Profile → URL `https://n8n-dev.awsales.io/webhook/nuestra-ckc-postback` + Field Mappings (incluir `secret_token`) + Routing (eventos).
4. **Enviar e-mail pra Dosable** com template de `docs/dosable/pending-api-docs.md`.
5. **Criar API User no CKC** e salvar `loginId`/`password` em Credentials do n8n.
6. **Coletar Private Key e Tokenization Key da NMI** (Merchant Portal → Settings → Security Keys).

## Regras gerais ao continuar

- **Não criar pastas/arquivos de código** (`integrations/`, `shared/`, `.env.example` no formato Node). Já foi deletado uma vez. Esta pasta é **só documentação + checklist + handoff**.
- **n8n é o runtime**, não código próprio.
- **Sempre marcar `⚠️ confirmar`** quando a doc oficial deixar ambíguo.
- **Não inventar endpoints, headers ou payloads** — se não está em `docs/*/api-reference.md` ou na doc oficial, é pergunta pro Pedro / pra Dosable.
- **Atualizar este HANDOFF.md** a cada passo concluído ou nova decisão tomada. Esse arquivo é a continuidade do projeto se o contexto cair.
- **Conferir doc oficial 2x antes de cravar comportamento da plataforma.** Eu (Claude) já errei duas vezes sobre estrutura de Signing Key da NMI — confiei em snippet de search secundário quando deveria ter pedido pro Pedro confirmar no painel/doc oficial.

## Logs de sessão (apêndice cronológico)

### 2026-05-26 (primeira sessão)
- Pesquisa de doc oficial das 3 plataformas (WebSearch + WebFetch).
- Confirmado: NMI tem doc completa, CKC tem doc razoável, Dosable não tem doc pública.
- Criada estrutura inicial com `docs/{nmi,checkout-champ,dosable}/`.
- Erro: criei `integrations/`, `shared/`, `.env.example` no formato Node — **deletado** após feedback.
- README reescrito como índice de doc. `credenciais-checklist.md` criado.
- Pedro entrou no painel NMI (Gateway Options → Webhooks), iniciou criação de novo endpoint para `https://n8n-dev.awsales.io/webhook/nuestra-nmi`.
- 🚨 **Descoberta:** já existe webhook NMI ativo apontando para `https://nuestrarx-hub.vercel.app/api/webhooks/nmi` (hub Vercel preexistente). Signing Key é compartilhada entre endpoints da mesma subscription.
- Lista REAL de eventos da NMI extraída e documentada (37 eventos disponíveis). Recomendação de subscrição definida.
- Pedro selecionou ~10 eventos essenciais e tentou Save Changes — recebeu **"Invalid Authentication REFID: 991818905"** (erro de sessão do painel, não de config). Pendente: logout/login e re-save.
- Signing Key coletada visualmente. Decisão: NÃO armazenar valor em arquivo desta pasta — vai pros Credentials do n8n direto.

### 2026-05-26 (sessão prolongada — continuação)

- Estrutura da pasta NMI reorganizada: `docs/nmi/normalizer/` (mapping + code-node + sample real payload) e `docs/nmi/payloads/` (samples por event_type, com README de cross-ref). README na raiz de `docs/nmi/` como índice.
- Pedro adicionou doc oficial dos payloads em `docs/nmi/Payloads/` (21 arquivos .md). [agora em `docs/nmi/payloads/`]
- Comparação doc vs real (transaction.sale.success) feita: **doc é subset-compatível**, real tem ~20 campos extras (network token, tap_to_mobile, VAT/tax internacional, etc.). Pode confiar na doc como referência canônica.
- Endpoint AWSales descoberto: `POST https://app.awsales.io/api/webhooks/organizations/b34f181e-c7b3-49fb-b69f-3454a7336df2/credentials/nmi-checkout`. Formato target documentado por Pedro (event, created_at, user, producer, transaction, payment_links, utm, metadata).
- Enums AWSales mapeados (event, transaction.status, payment_method, currency — `US` sic, não `USD`).
- **Normalizer NMI → AWSales criado:**
  - `docs/nmi/normalizer/mapping.md` (mapeamento, decisões, pendências)
  - `docs/nmi/normalizer/code-node.js` (Code node pronto pra colar no n8n)
- 10 eventos NMI mapeados pra 4 eventos AWSales (APPROVED_PURCHASE, COMPLETED_PURCHASE, REFUSED_PURCHASE, REFUNDED_PURCHASE, CHARGED_BACK). 15 eventos skipados (unknown, refund/void.failure, subscription update/delete, settlement.*, acu.*, credit.unknown).
- Próximo passo: Pedro cola `docs/nmi/normalizer/code-node.js` num Code node no n8n após o Webhook trigger; testa com payload real; adiciona IF pra filtrar `_skip` e HTTP Request pro AWSales.

### 2026-05-26 (transição NMI → Checkout Champ)

**Status NMI:** workflow montado, normalizer pronto com fallback test_mode pra email/phone (AWSales validou 422 quando vinha vazio do Virtual Terminal). Falta validar HMAC e fazer teste end-to-end com produto real (fora do Virtual Terminal). NMI pronto pra prod operacional quando flows reais começarem.

**Decisão de Pedro:**
1. Pedro tem acesso admin ao painel CKC.
2. Conta CKC está totalmente do zero — nada configurado (sem campanha, produto, gateway, postback).
3. Fluxo confirmado: Dosable (funil) → CKC (CRM/OMS/checkout) → NMI (gateway).
4. Estratégia: replicar normalizer CKC → AWSales (mesmo endpoint, mesmo formato target). Encaixar no fluxo do n8n.

**Plano CKC do zero (próxima fase):**

Trilha A — receber postback (rápido):
1. Criar API User no CKC (Admin → Users → +)
2. Criar Postback Profile no CKC apontando pra `https://n8n-dev.awsales.io/webhook/nuestra-ckc-postback`
3. Criar Webhook trigger no n8n em `/webhook/nuestra-ckc-postback`

Trilha B — base estrutural (pra ter algo que dispare evento):
4. Gateway Profile no CKC apontando pra NMI (precisa NMI Private API Key)
5. Campaign mínima
6. Product mínimo
7. Routing do Postback Profile (qual campanha + qual evento)
8. Sale teste via CKC → NMI → postback chega no n8n

Trilha C — normalização (paralela):
9. Code node normalizer CKC → AWSales (similar ao NMI mas com shape do CKC)

**Diferenças chave CKC vs NMI a considerar:**
- Payload CKC: query string (GET default) ou form-urlencoded (POST opcional), NÃO é JSON body como NMI
- CKC sem HMAC nativo — usar IP allowlist (`80.248.30.132, 80.248.30.141, 52.206.5.84, 44.219.22.112`) + shared secret em Field Mapping
- Eventos CKC: SALE, PARTIAL, DECLINE, REFUND, CANCEL, CHARGEBACK, SUBSCRIPTION_STOP, UPSELL, RETURN (configuráveis por Postback Profile, não por endpoint)

**Próximo passo concreto:** começar Trilha A (API User + Postback Profile + Webhook n8n) enquanto Trilha B fica como preparação. Aguardando Pedro confirmar ordem.

---

### 2026-05-26 (CKC config — final do dia, pausa)

**Descobertas importantes:**
- **CKC NÃO estava "do zero"** — já tinha base configurada por outro dev: **Ruben** (login `rubenNuestra`, visto em "Last Update" da campanha STAGING). Ele é quem mantém o hub Vercel também.
- **Hub Vercel CKC também:** Hub-Main profile aponta pra `https://nuestrarx-hub.vercel.app/api/webhooks/checkoutchamp` (mesmo domínio do hub NMI). Confirma que Ruben mantém ambos hubs (NMI + CKC).
- **7 Postback Profiles já existentes** (do Ruben):
  - `Hub-Main` (TODOS eventos, TODAS campanhas) → Vercel
  - `Weightloss (prod) billing failed` / `cancelled` / `webhooks` → campanha #19 PROD
  - `Weightloss (stage) billing failed` / `cancelled` / `webhooks` → campanha #17 STAGING
- **Nicho confirmado:** GLP-1 weight loss. Produtos vistos: Rush/Medivera Semaglutide (Ozempic genérico) e Tirzepatide (Mounjaro genérico). Preços de $199 (mensal) e $546 (3 meses).
- **2 campanhas reais ativas:** (19) PROD e (17) STAGING — usar #17 pra testes.
- **Quality Assurance = 100%** em ambas campanhas: TODA order vai pra fila de QA antes de capturar.

**Test Cards do CKC (Admin → Test Cards):**
- Generic test card: `0000000000000000`
- Expiry: qualquer não expirada (ex: `01/2030`)
- Testing CVVs:
  - `100` → approved
  - `900` → declined
  - `910` → declined (insufficient funds)
  - `800` → prepaid
  - `700` → debit
  - `111` → 3DS approved (frictionless)
  - `199` → 3DS declined (frictionless)
  - `555` → 3DS challenge

**Setup criado nesta sessão:**
- ✅ Profile `Nuestra-AWSales-Dev` criado, clonado do Hub-Main (clone trouxe Field Mappings completos — 47 campos do CKC: orderId, customerId, transactionId, emailAddress, firstName, lastName, phoneNumber, orderTotal, currencyCode, cardType, cardLast4, paySource, responseType, orderStatus, declineReason, refundReason, recurringStatus, nextBillDate, billingCycleNumber, chargebackAmount, chargebackDate, chargebackReasonCode, campaignId, campaignName, custom1-5, ipAddress, etc. — ver Logs do CKC em 19:42-19:43).
- ✅ Postback URL: `https://n8n-dev.awsales.io/webhook/nuestra-champ` (confirmado em log 19:43)
- ✅ Route criada: Profile=`Nuestra-AWSales-Dev`, Customer Type=**New Sale**, Campaign=All, Product=All (log 19:29 — profile route id 39)
- ✅ Webhook trigger criado no n8n em `/webhook/nuestra-champ` (POST, ativo) — confirmado por curl mock que chegou no Executions
- ✅ Campanha STAGING habilitada pra **List in Order Entry** (toggle ligado em 19:56)
- ✅ Order de teste criada via Customer → Order Entry: `FFDEF248FF`, $179, Rush Semaglutide/B6 1.12mg, Test User test@nuestrarx.com, com test card `0000000000000000` CVV `100`, exp `01/2030`
- ✅ Order aprovada no Customer → Quality Assurance

**🚨 PROBLEMA NO FIM DO DIA — não resolvido:**
Após aprovar a order no QA, **NENHUM postback chegou no n8n**.

Hipóteses para amanhã investigar (em ordem):

1. **Evento errado no Routing:** Pedro configurou Route com Customer Type = `New Sale`, mas talvez o evento que disparou seja `Sale` (sem "New"), `Capture`, ou outro. Hub-Main do Ruben usa `Sale` (sem "New") em vários routings. Solução: criar routes adicionais cobrindo `Sale`, `Capture`, `Partial`, `Declined`, etc., pra ver qual dispara.

2. **Postback não foi sequer tentado:** logs do CKC (`Admin → Logs`) mostram só ações administrativas do Pedro (criar profile, criar route, mudar URL) — **nenhum registro de tentativa de envio de postback**. Isso é suspeito: ou os logs de export não aparecem nessa tela, ou o postback nunca foi disparado. Investigar:
   - Tem aba/seção específica de "Postback Logs" ou "Export Logs" separada de Admin → Logs?
   - Verificar se profile `Nuestra-AWSales-Dev` está com alguma flag de "Active" / "Enabled" que pode estar desligada
   - Tem Routing pra evento específico que aconteceu (Approved/Captured/etc.)?

3. **URL pode ainda estar errada:** verificar no edit do profile que `Postback URL = https://n8n-dev.awsales.io/webhook/nuestra-champ`. Log mostra que foi setada em 19:43, mas pode ter sido sobrescrita em 19:18 (log mostra "Updated export profile" sem mudança visível na URL).

4. **Field Mappings vazios mesmo após clone?** Pouco provável (clone do Hub-Main veio com 47 mappings, e a função "View Output" no Field Mappings da tela retornou JSON template completo). Mas vale conferir.

**Pra amanhã, ordem sugerida:**
1. Conferir em **Admin → Export → lápis no Nuestra-AWSales-Dev**: URL ainda `nuestra-champ`? Profile habilitado? Field Mappings populados?
2. Adicionar Routes pra **mais Customer Types**: começar com `Sale` (sem o "New"), depois `Capture`, depois `Partial`. Manter "All Campaigns + All Products" pra simplicidade.
3. Repetir teste: criar nova order de teste em Order Entry → aprovar QA → ver se chega.
4. Se ainda não chegar, abrir ticket com suporte CKC ou perguntar ao Ruben como ele configurou o Hub-Main pra funcionar.

**Logs CKC capturados em 26/05:**
```
05/26/26 19:56 - Updated List Sales Entry in campaign STAGING (17)
05/26/26 19:53 - Added currency "US Dollar" in campaign STAGING (17)
05/26/26 19:43 - Updated export profile Nuestra-AWSales-Dev. Set Postback URL to https://n8n-dev.awsales.io/webhook/nuestra-champ
05/26/26 19:42 - Created new export profile Nuestra-AWSales-Dev
05/26/26 19:42 - Removed export profile Nuestra-AWSales-Dev (versão anterior deletada)
05/26/26 19:31 - Updated export profile Nuestra-AWSales-Dev
05/26/26 19:29 - Created new export profile route for export profile named: Nuestra-AWSales-Dev (39) tied to All Products and All Campaigns
05/26/26 19:18 - Updated export profile Nuestra-AWSales-Dev
05/26/26 19:16 - Updated export profile Nuestra-AWSales-Dev. Set Postback URL to https://n8n-dev.awsales.io/webhook/nuestra-champ
05/26/26 19:16 - Created new export profile Nuestra-AWSales-Dev
```

**Bandeiras pra próxima IA (ou Pedro amanhã):**
- 🟡 Ruben é colega de operação que mantém hub Vercel (NMI + CKC). Não é "outro cara aleatório". Quando precisar entender por que algo funciona/não funciona, considerar perguntar ao Ruben direto antes de investigar sozinho.
- 🟡 Test Mode da NMI continua LIGADO. Lembrar de desligar antes de produção.
- 🟡 Order `FFDEF248FF` foi aprovada em QA mas postback não disparou — não deletar/limpar até resolver, pode servir de referência.
- 🟢 Field Mappings completos do Hub-Main (47 campos) capturados — usar como referência de shape do payload CKC, ver `docs/checkout-champ/api-reference.md` ou criar `docs/checkout-champ/sample-fields.md` amanhã.

---

### 2026-05-27 (retomada — contexto do produto Nuestra RX)

**Pedro pediu explicação simples das 3 plataformas e mostrou o site real.** Mapeamento de negócio completo:

**Produto Nuestra RX:**
- Telemedicina hispana nos EUA pra GLP-1 emagrecimento (compounded)
- Semaglutida ($165/mês) e Tirzepatida ($255/mês) — versões compostas, não-FDA approved
- 100% espanhol, atende latinos nos 50 estados
- IMC ≥30 (ou ≥27 com comorbidade)
- < 24h aprovação, garantia 12 meses

**Atores adicionais descobertos:**
- **Beluga Health** — clinical provider terceiro (médicos que aprovam receitas). Mencionado no site mas ainda NÃO investigado se tem API/webhook próprio. ⚠️ Conferir se entra no fluxo de integração.
- **Farmácias 503A/503B** — compounding pharmacies que dispensam o medicamento (não tem integração direta com Nuestra, provavelmente entrega via Beluga ou Dosable).

**Funil de 9 etapas (Dosable intake):**
1. Sexo biológico → 2. Idade → 3. Altura/peso/IMC → 4. Objetivo → 5. Histórico médico → 6. Segurança (gravidez, alergias, GLP-1 prévio) → 7. Histórico de tentativas → 8. Estado (TX bloqueado SÓ no sandbox de teste; em prod entrega tudo) → 9. Dados de envio + consentimento

**🎉 GRANDE DESCOBERTA: doc Dosable destravada**
Pedro encontrou/obteve o **openapi.json oficial da Dosable Intake API** em `docs/dosable/Api/openapi.json` (~65k tokens). Contém:
- Quickstart manual
- Sandbox API keys disponíveis no onboarding
- Tenant-specific staging keys 2 semanas antes do go-live
- Endpoints: intake questions, leads, sessions, blacklist-states, products
- Funcionalidades sandbox: retrieve questions, save answers, retrieve/create leads, sessions
- Restrições sandbox: product retrieval e checkout completo bloqueados; TX é declined state default
- Auth: API keys (gerar/rotacionar/validar via `/auth/*`)

Próximo passo (depois de destravar CKC): ler openapi.json completo, pedir Sandbox API Key ao time Dosable, criar webhook receiver `/webhook/nuestra-dosable` no n8n, escrever normalizer Dosable → AWSales.

**Notas técnicas pro normalizer (todos os 3):**
- 🌐 **UTF-8 obrigatório** — site 100% espanhol, dados terão acentos (ñ, á, é, í, ó, ú).
- 🚫 **Estado bloqueado em produção = California (CA), não TX.** O TX NÃO é bloqueado (vinha só do sandbox de teste do Dosable). Mas o Matheus avisou em 2026-06-17 que o único estado que NÃO entregam hoje é California (CA). Então EXISTE gate de estado, só que é CA, e fica no checkpoint da IA (não coletar / não chamar a tool para lead de CA; mensagem honesta sem prometer prazo). Reconfirmar a lista com o Matheus quando mudar.
- 🩺 **PHI (dados de saúde)** — Dosable lida com dados sensíveis HIPAA. Cuidado ao logar payloads em texto plano. Considerar redação de campos médicos nos logs.

---

### 2026-05-28 (CKC postback destravado)

**Causa raíz por que postback nunca chegava:** doc oficial CKC diz duas vezes *"Test Card orders will not export through the webhook system"*. Orders `FFDEF248FF` e `DD030BE4AE` foram criadas com test card `0000000000000000` → CKC bloqueia exportação por design. Não era route, URL, n8n ou Cloudflare.

**Refinamento via Jose Dias (customer real do funil Dosable):**
- History do Jose mostrou entry `"Order# D5A8EFC4EC failed to export to webhook profile: Hub-Main (1) due to error: 404 Not Found"`.
- Prova que (a) postback dispara mesmo sem card quando origem é funil/lead, (b) **Hub-Main do Ruben tá QUEBRADO 404 Not Found no Vercel**, (c) `Nuestra-AWSales-Dev` nem foi tentado porque faltava route `Partial`.

**Ações concluídas:**
- ✅ Route `Partial` adicionada ao `Nuestra-AWSales-Dev`.
- ✅ CKC retry queue rodou próximo cycle 15min e disparou 2 payloads PARTIAL pendentes pro n8n:
  - `D5A8EFC4EC` (Jose Dias — origem Dosable funnel, tem `custom1` UUID e `custom2: "Checkout Page"`)
  - `41C65E08F5` (Test User3 — origem Order Entry manual, sem customs e sem ipAddress)
- ✅ Confirmado fluxo end-to-end criando 1 order via Order Entry External Payment (Pedro Awsales, `B94140F702`, $199 PREPAID). Postback chegou no n8n ~49min depois (consistente com cycle 15min).
- ✅ Headers confirmaram IP CKC `44.219.22.112` (lista oficial), JSON body funciona (Field Mapping `Content-Type: application/json` + `httpMethod: POST` aplicam), Cloudflare na frente do n8n.
- ✅ Documentado em `docs/checkout-champ/payloads/partial.md`, `new-sale.md` + `README.md` com índice de Customer Types capturados vs pendentes.

**Novo receiver descoberto (4º no workflow n8n):**
- `Forms-site` em `https://n8n-dev.awsales.io/webhook/nuestra-forms-site` — Willian (CTO Nuestra RX) configurou Cloudflare Worker em `webhook.nuestrarx.com` como proxy do intake form de `nuestrarx.com/evaluacion`.
- Headers identificadores: `x-nrx-source: webhook.nuestrarx.com`, `user-agent: NuestraRx-Intake-Proxy/1.0`, `cf-worker: nuestrarx.com`.
- 2 events planejados: `intake_partial` (já chegando) e `intake_submitted` (Willian implementando). Pendente confirmar com Willian em que momento exato `intake_submitted` dispara — Pedro completou fluxo até seleção de plano + redirect WhatsApp Matheus e só recebeu `intake_partial`.
- Payload é estruturado próprio (`source`, `tracking`, `contact`, `address`, `demographics`, `biometrics`, `goals`, `medical_history`, `treatment_selection`, `consent`, `eligibility`, `meta`). Tem `tracking.dosable_lead_id` e `tracking.dosable_session_id` (null em intake_partial — provavelmente populado em intake_submitted).
- Receiver NÃO substitui Dosable webhook — é uma camada adicional do próprio site Nuestra (form view) antes de chegar no CKC.

**Cycle CKC = 15min default.** Não esperar postback em segundos.
**Webhook logs ficam em customer history**, não Admin → Logs.

**Bandeira pro Ruben (avisar):** Hub-Main retorna 404 no Vercel — endpoint `/api/webhooks/checkoutchamp` quebrado ou path errado.

**Próximos passos (em ordem):**
1. Escrever normalizer CKC → AWSales (`docs/checkout-champ/normalizer/`). Mapear `orderStatus: "PARTIAL"` → evento AWSales correspondente (provavelmente `ABANDONED_CART`). Reaproveitar shape do normalizer NMI (currency `USD` → `US`, etc.).
2. Capturar samples dos outros Customer Types após primeira venda real pós-lançamento (segunda 01/06):
   - `New Sale`, `Capture`, `Declined`, `Refunded`, `Chargeback`, `Rebill`.
3. Aplicar `Code node` normalizer + IF skip + HTTP Request → AWSales no workflow n8n (mesmo padrão NMI).
4. Avisar Ruben sobre Hub-Main 404.
5. Mover pra Dosable assim que tiver Sandbox API Key.

---

### 2026-05-29 (sessão longa — CKC normalizer em prod, Forms-site mapeado, Willian docs)

**Concluído no CKC (normalizer end-to-end funcionando):**
- ✅ Adicionados Field Mappings `productName` (`product1_name`) + `productId` (`product1_crmId`) no profile `Nuestra-AWSales-Dev`. Confirmados via doc oficial CKC (`help.checkoutchamp.com/.../export-webhook-field-mapping-options`). Escolhemos `product1_crmId` em vez de `product1_id` porque Client ID externo está vazio nos 54 produtos da STAGING (Product IDs 325-431 internos).
- ✅ Payload PARTIAL `D3638D3CA3` confirmou campos chegando: `productId: "325"`, `productName: "Rush Semaglutide/B6 1.12mg alternative"`.
- ✅ Capturados mais 4 Customer Types via testes na order Pedro Awsales (test4@nuestrarx.com, External Payment): `Refunded`, `Declined` (via Cancel Order que CKC trata como QA Decline), `Capture` (via Approve QA), `Rebill` (via Force Bill NOW).
- ✅ Capturado **2º sample de New Sale com cartão real** (Mastercard 4444, Camila Possan vinda do funil Dosable, `paySource: CREDITCARD`, `transactionId: "pi_..."` formato Stripe-like estranho — confirmar com Ruben/Willian).
- ✅ **Total: 6 customer types catalogados, 8 samples reais**: Partial (2), New Sale (2: PREPAID+CREDITCARD), Refunded (1), Declined (1), Capture (1), Rebill (1). Faltam Paused, Chargeback, Cancelled (route não existe ainda no profile Dev).
- ✅ Normalizer `docs/checkout-champ/normalizer/code-node.js` escrito + mapping.md detalhando decisões + gaps. Usa `productName`/`productId` com fallback `campaignName`. Skip rules pra eventos sem mapping AWSales (Partial). Retorna `[]` quando skip — sem IF necessário, n8n para a chain.
- ✅ Normalizer ligado no n8n: Webhook trigger CKC → Code (normalizer) → HTTP Request → AWSales endpoint `/credentials/checkout-champ`. **Funcionando em prod** (1 produto criado no AWSales dashboard como prova).

**Erro 422 AWSales — root cause encontrada:**
- HTTP Request V4.3 do n8n com `Body Content Type: JSON` + `Specify Body: Using JSON` + `{{ $json }}` envia Object JavaScript que o AWSales recebe como `null` (Zod retorna `": Expected object, received null"` na raiz).
- Tentativa com `{{ JSON.stringify($json) }}` em modo JSON também falhou (n8n wrap como string entre aspas).
- **Solução definitiva:** trocar Body Content Type pra **`Raw`** + Content Type Header `application/json` + Body `={{ JSON.stringify($json) }}`. Aí n8n envia body como JSON puro sem rewrap. Documentado no `mapping.md`.

**Forms-site mapeado em detalhe (`docs/forms-site/perguntas.md`):**
- 18 perguntas em 3 blocos: PERFIL (P1-P4, gera `intake_partial`), HISTORIAL (P5-P16, caminho "Quiero continuar yo mismo"), PRODUCTO+PLAN (P17-P18).
- P4 é FORK do funil: lead pode escolher continuar via WhatsApp (handoff pro bot AWSales) ou continuar no site sozinho.
- Cross-ref com schema Willian (`awsales_t64_schema.md`): 11 perguntas batem 1:1, 3 são exclusivas do site (sinais vitais, cirurgia prévia, opioides), 2 usam checkbox no site mas textarea no schema (medicações + alergias — precisa mapper).
- 33 perguntas IDs 6400-6433 + 10 HARD STOPS catalogados.
- Produtos definidos: Semaglutide $179 (Rush ID 1147, Medivera ID 55), Tirzepatide $279 (Rush 1151, Medivera 56). CEO ainda não decidiu Rush vs Medivera como default — usar Rush.

**Mecânica do Forms-site descoberta via 4 payloads reais analisados:**
- Cada submit de step dispara 1 payload completo (snapshot cumulativo do session). `session_id` estável (`nrx_<ts>_<rand>`), `stage` evolui `parent` → `beluga`, `step` indica etapa.
- ~16-18 payloads por usuário completando tudo. Mesmo no step "submit" (3 consents + 2 uploads tudo `accept`) o event continua sendo `intake_partial`. **`intake_submitted` ainda não foi visto na prática.**
- Payload tem 3 camadas: estrutura normalizada (`contact`, `demographics`, etc), `raw_answers.{intake, beluga}` (~50 chaves Beluga schema), `resume.{cross_device_token, cross_device_url}` (Worker mints UUID one-shot pra WhatsApp follow-up).
- Worker v1.1 deployed pelo Willian em `webhook.nuestrarx.com` (header `user-agent: NuestraRx-Intake-Proxy/1.1`).

**Handoff docs do Willian (em `handoff-awsales-20260528/`):**
- `awsales_t64_schema.md` + `.json`: schema oficial das 33 perguntas pro endpoint `/ai-handoff` (Tenant 64 weightloss).
- `sample_request.json`: exemplo POST esperado.
- Endpoint: `POST https://webhook.nuestrarx.com/ai-handoff` com `Authorization: Bearer <AI_HANDOFF_SECRET>`.
- KV namespace ID: `a63841c1b88b4d34aac52be693f84263` (storage de retomada do quiz).
- AI_HANDOFF_SECRET salvo (NÃO em arquivo desta pasta — guardar em Credentials n8n).
- Endpoint é server-to-server. Provável fluxo: site dispara `intake_partial` → bot AWSales puxa lead via WhatsApp → bot completa quiz na conversa → bot bate `/ai-handoff` com payload formatado → Worker valida + cria customer Dosable + devolve checkout_url → bot manda URL pro lead.

**Customer "Carlos Sixteste" no CKC (cust ID 13) é uma anomalia:**
- Apareceu como customer aparentemente novo mas tem mesmo histórico de orders/transactions do test4@nuestrarx.com. CKC parece ter renomeado ou Pedro editou em algum momento sem perceber. Não bloqueia mas vale notar pra próxima sessão.

**Bloqueios atuais:**
- 🔴 **Force Bill NOW bloqueado** por 24h cooldown (cooldown CKC, esperar pra forçar Rebill de novo).
- 🔴 **Route `Cancelled` não existe** no profile Nuestra-AWSales-Dev. Cancel Subscription disparada hoje não vai gerar postback. Pra catalogar esse sample, adicionar route Cancelled + fazer Cancel em outra sub.
- 🟡 **Sandbox API Key Dosable** ainda não foi liberada. Quase tudo do próximo passo depende dela.

**🚨 GRANDE BLOQUEIO: Dosable bloqueia próximas frentes.** Pedro identificou que muita coisa depende do Dosable estar pronto:
- Webhook outbound Dosable → n8n (`/webhook/nuestra-dosable`) — precisa Sandbox API Key + saber se Dosable expõe webhook registration via API ou só via dashboard interno deles.
- Como Dosable cria order no CKC (qual endpoint CKC chamado, formato, autenticação) — pra reconciliar.
- Beluga Health webhook (potencial 5ª integração) — não investigado, pode existir entre Dosable e Beluga.
- Definir como `intake_submitted` vai ser gerado e quem chama `/ai-handoff` (site vs bot WhatsApp).

**Reunião com Willian às 13h hoje:** Pedro vai validar 6 perguntas (3 sistemas + 1 forms-site + 1 geral + 1 timeline go-live). Perguntas reduzidas pra essenciais.

**Estado dos receivers n8n (atualizado):**
- ✅ NMI (`/webhook/nuestra-nmi`) — receiver + normalizer + envio AWSales rodando parcial. HMAC validation pendente.
- ✅ CKC (`/webhook/nuestra-champ`) — receiver + normalizer + envio AWSales rodando FULL. 6 customer types cobertos, fields product corretos.
- 🟡 Forms-site (`/webhook/nuestra-forms-site`) — receiver recebendo intake_partial. Normalizer NÃO escrito ainda. Decisão pendente: skip todos partials, ou montar payload pro `/ai-handoff` (mais útil), ou esperar `intake_submitted`.
- 🔴 Dosable (`/webhook/nuestra-dosable`) — não começado. Bloqueado por Sandbox API Key.

**Próximos passos (em ordem, considerando bloqueio Dosable):**
1. Reunião 13h com Willian — destravar Sandbox API Key + clarificar fluxo `/ai-handoff` + `intake_submitted`.
2. Após reunião, escolher caminho Forms-site: skip total OU montar formato pro `/ai-handoff` em vez do AWSales.
3. Coordenar com Ruben sobre Hub-Main 404 (pendente desde 28/05).
4. Adicionar route Cancelled ao profile Dev + capturar último Customer Type CKC quando der pra forçar Cancel Sub.
5. Quando Dosable destravar: criar receiver `/webhook/nuestra-dosable` + entender mecanismo CKC → Dosable (test card aparece no Dosable apesar de bloqueado no postback CKC — implica canal sync separado).
6. Investigar Beluga Health (5º receiver possível) só após Dosable destravado.

---

### 2026-06-17 (tool AI Handoff em produção — 2 erros reais + normalizer por aliases)

**Contexto:** a campanha de Recuperação de Formulário já está rodando ao vivo. Dois leads reais falharam na tool `enviar_avaliacao_nuestra_rx` (a IA caiu pro suporte porque o Dosable recusou os dados). Diagnóstico feito a partir do payload de input + código do normalizer (não precisou nem do n8n).

**Erro 1 — Regina (qid 6418, auto-injeção):** a IA mandou a frase crua do lead `"No, me asistían en clínica"` em vez da opção fechada. O Dosable só aceita as strings exatas; valor fora da lista = recusa (apareceu como `[object Object]` na tool). Semântica: a lead na verdade PODE se injetar (tem ajuda), então a resposta certa era `Yes, I can inject myself or have reliable help`. A IA gravou a fala antiga dela.

**Erro 2 — Yasmira (lead_state):** a IA mandou `lead_state: "Florida"`. O Dosable exige código de 2 letras maiúsculas (`State must be two uppercase letters`) → `FL`. A lead falou a cidade ("Orlando") e a IA não converteu pra UF. Florida NÃO é bloqueada (a lead era boa, perdida por formato).

**Confirmação do Willian (2026-06-17):** o `/ai-handoff` NÃO normaliza nada do lado dele — repassa o `value` verbatim pro Dosable. As únicas normalizações do worker são telefone (últimos 10 dígitos) e birthday (MM/DD/YYYY). Logo, a conversão "fala do lead → string exata do Dosable" tem que acontecer no NOSSO normalizer n8n. Willian mandou o mapa canônico fechado (todas as opções + `aliases_es` por opção): salvo em `docs/dosable/valid-options-canonicas-tenant64.json`.

**Arquitetura de normalização definida (3 camadas):**
1. IA (descrição da tool) manda o SENTIDO já em token canônico. Textos prontos pra colar nos 7 campos do Body Schema: `docs/tool-ai-handoff-descricoes-campos.md`.
2. Normalizer n8n garante o FORMATO exato (determinístico). É o único lugar que normaliza (Willian confirmou).
3. Checkpoint só comportamento/gates. NÃO repetir tabela de opções (encarece).

**O que foi feito no normalizer (`docs/tool-ai-handoff-normalizer.n8n.js`):**
- `normalizeState`: nome de estado OU cidade grande → código 2 letras (`Florida`/`Orlando` → `FL`). 50 estados + DC. Mata o erro da Yasmira.
- `resolveOption`/`resolveCheckbox` dirigidos pelos `aliases_es` do Willian (`canon` tira acento/pontuação e casa por tiers; alias multi-palavra mais longo vence, pra negação não virar afirmação). Mata o erro da Regina e generaliza pra todas as perguntas de opção. Sem match confiante → cai nas funções antigas; se nem isso, o sanitizer derruba e a IA repergunta (regra do Willian: não chutar).
- Tudo validado com `node --check` + testes dos casos reais.

**Checkpoint Recuperação de Formulário enxugado** (cliente reclamou de custo): tirado o plumbing que o normalizer já faz (lista de 25 campos de metadata, equivalências metadata→answer, tabela de 15 IDs). De 21.922 para 20.049 chars. Capability intacta porque o normalizer faz backfill e a descrição da tool carrega o formato.

**Estado bloqueado — TX não, California SIM.** Primeiro corrigimos que TX não é bloqueado em prod (era só sandbox de teste). Depois, no mesmo dia, o Matheus avisou que o único estado que NÃO entregam hoje é California (CA). Então criamos gate de CA no checkpoint da IA (não coletar / não chamar a tool para lead de CA, mensagem honesta sem prometer prazo) — Recuperação de Formulário (Seção 10) e Recuperação de Vendas (Seção 10). Docs atualizados (overview.md, HANDOFF.md, README.md, comentário do normalizer). A lista de estados pode mudar: reconfirmar com o Matheus.

**Branch de histórico de dose (6419-6428) — NÃO é problema (verificado 2026-06-17).** Cheguei a levantar isso como risco, mas o `sample_request.json` (contrato oficial do `/ai-handoff` que o Willian enviou) NÃO inclui 6419-6428: manda só o conjunto base e `6417: ["None of these"]`, e o endpoint retornou ok:true + checkout_url. O branch existe no funil do SITE, mas o `/ai-handoff` NÃO exige. O normalizer já força `6417` default "None of these" (branch fica fechado). A tool funciona e devolve o link. Sem ação necessária. A lista `required` do nosso normalizer (`getMissingRequiredAnswerIds`) já bate com o sample: base sem 6419-6428.

**Arquivos novos/alterados nesta sessão:**
- NOVO `docs/dosable/valid-options-canonicas-tenant64.json` (mapa canônico do Willian)
- NOVO `docs/tool-ai-handoff-descricoes-campos.md` (descrições dos 7 campos pra colar na plataforma)
- ALTERADO `docs/tool-ai-handoff-normalizer.n8n.js` (normalizeState + resolver por aliases)
- ALTERADO `Campanhas/Recuperação de formulário/Checkpoint/checkpoint.md` (enxugado)
- ALTERADO docs de TX (overview, admin-panel-mapping, HANDOFF, README)

**✅ VALIDADO END-TO-END EM PRODUÇÃO (2026-06-17):** Pedro colou o normalizer novo no Code node, disparou payload de teste com respostas em linguagem natural (lead "TESTE Normalizer", fake) e o `/ai-handoff` retornou `ok:true` + checkout_url (lead_id 252032). Provas: `shipState=FL` (mandei "Orlando" → virou FL, bug Yasmira morto); 6418 aceito sem erro (mandei "No, me asistían en clínica" → virou "Yes, I can inject myself or have reliable help", bug Regina morto); `plan monthly` (mandei "mensual"). Os dois erros reais não acontecem mais. Nota: 6410 em frase de sinal misto ("algo de dieta y ejercicio") pode cair em Actively managing por causa do alias "dieta y ejercicio" — não é hard stop, e a camada da IA manda o token certo de qualquer forma.

**Fallback de erro de tool montado no n8n (2026-06-17).** Antes, quando o `/ai-handoff` devolvia erro, o nó HTTP quebrava o workflow, a AWSales recebia erro cru e a IA improvisava (inventava "intermitencia técnica" + jogava pro suporte). Matheus NÃO quer escalar pro suporte em falha de tool. Montado: `HTTP Request3` com On Error = Continue (using error output); porta de erro → Respond to Webhook2 (Respond With JSON) devolvendo `{ ok:false, error:"handoff_failed", retry:true, message:"...no derives a soporte..." }`. Retry On Fail OFF (a IA retenta). Trigger `tool-ai-handoff` com Respond = "Using Respond to Webhook Node". A porta de erro NÃO toca em Build AWSales Output / POST Custom Action. Checkpoint Seção 14 atualizado: em `handoff_failed` a IA tenta de novo e segura o lead, proibido inventar causa e proibido escalar suporte por falha de tool (suporte segue válido só nos gates clínicos da Seção 10).

**Teste de simulação no playground (2026-06-17, lead "Prueba RecForm Test"):** rodamos uma conversa inteira em espanhol no playground a partir de um metadata de `intake_abandoned` (gerado pelo normalize-abandono). A IA conduziu certo (explicou os 2 remédios e deixou o lead escolher, "ahora no pagas nada", sem comparar com marca, pediu o estado). End-to-end retornou checkout_url com tirzepatide + `shipState=FL` (lead disse "Miami" → virou FL) e auto-injeção ambígua ("sola me da miedo pero mi hija me ayuda") → a IA mandou Yes. Mas o agente chamou a tool 3x no fim e 2 falharam — diagnóstico:
- **Causa real (não era normalizer velho):** a IA mandou `6402` como NUMBER (`95`), e o Dosable exige textarea = STRING (`"Question 6402 expects a string value; received int"`). O normalizer não coagia número→string. CORRIGIDO: função `coerceAnswerTypes` (textarea/radio/consent viram string, checkbox vira array de string) no final do `tool-ai-handoff-normalizer.n8n.js`. Testado: `6402: 95` → `"95"`. RECOLAR o normalizer.
- **3 disparos:** comportamento do agente AWSales (tenta a tool várias vezes na mesma rodada) + nossa Seção 14 (retry em handoff_failed). Como a falha era determinística (int), retentar só repetia. Com a coerage a falha some → passa de primeira.
- **IA bagunçando campos (corrigido na descrição da tool):** jogou "penicilina" (alergia geral) no 6416 (alergia GLP-1) e um peso no 6402. O normalizer impede o crash mas o dado fica torto. Atualizada a descrição do campo `answers` em `tool-ai-handoff-descricoes-campos.md` deixando explícito o que é cada ID (6401=medicamentos, 6402=alergias gerais, 6416=só GLP-1 de marca, data só em contact). RECOLAR as descrições.
- **O fallback `handoff_failed` funcionou** (sem suporte, msg de retry) ✓.

**Próximos passos desta frente (em ordem):**
1. (feito) Normalizer + resolver de aliases + state guard + coerage de tipo.
2. (feito) Fallback de erro no n8n + Seção 14 do checkpoint (sem suporte, sem inventar causa).
3. **RECOLAR no n8n** o normalizer atualizado (coerceAnswerTypes) e **na tool** a descrição atualizada do campo answers.
4. Monitorar próximos leads reais que chamam a tool pra validar o resolver em produção.
5. Confirmar que a tool na AWSales aponta para a Production URL do webhook (`/webhook/debug-awsales-tool`), não a Test URL.
6. Decisões pendentes do Matheus: (a) lead escolhe vs default de medicamento; (b) lead de CA — guardar contato ou só informar.
