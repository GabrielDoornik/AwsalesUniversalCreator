# Dosable Admin Panel — Mapping do que viu lá dentro

Reconhecimento feito 2026-05-28 com Pedro logado como admin (Pedro Lima). Mapeia estrutura, hierarquia de dados e ligação com CKC.

---

## Menu lateral completo

```
- Dashboard
- Subscriptions
  - All Subscriptions
  - All Recurring
  - All Declines
  - All Pending
  - All Transactions
- Products
  - All Products
  - All Offers
  - All Upsells
- Customers
  - All Customers
  - All Partials
  - All Leads
- Reports
  - New Revenue
  - Cancellations
  - Retentions
  - (mais ocultos pelo scroll)
- Logout
```

**🚨 Não tem seção visível de Settings/Developers/API Keys/Webhooks na sidebar.** Pode estar atrás do avatar/profile dropdown, ou Dosable libera as keys via e-mail/onboarding (consistente com a doc do openapi.json que menciona "Sandbox keys provided in onboarding"). Próxima sessão: clicar nome Pedro Lima ou ícone canto superior direito.

---

## Hierarquia de dados (importante)

Dosable trabalha com pirâmide de dados:

```
Lead (topo)
  ↓
Partial
  ↓
Customer
  ↓
Subscription
```

### 1. Lead (`All Leads`)
- Topo do funil. Só dados básicos do quiz inicial.
- Campos vistos: Customer Name, Email, Date of Birth, Phone, Gender, State, Creation Date.
- 15 leads no STAGING em 2026-05-27, todos testes manuais ("Master Patient", "Smoke Test", "Joao Nobre", "BORA VER", etc).
- **Sem product, sem payment, sem subscription.**

### 2. Partial (`All Partials`)
- Lead que avançou: selecionou produto + (talvez) adicionou payment method, MAS não completou compra.
- Colunas vistas: Customer ID, Customer Name, Email, Phone, City, State, Payment Method, Consult Status, Date, Selected Products, Total.
- 3 partials atuais:
  - **5: Jose Dias** — FL — Tirzepatide Injectable monthly $279 — Consult: PENDING — 2026-05-27
  - **1: Test User3** — New York NY — CREDITCARD — Semaglutide Injectable monthly $179 — Consult: PENDING
  - **9: Daniel Javor** — TX (recusado só no sandbox de teste) — $0 — Consult: PENDING (caso de teste interno do time Dosable, email `dosabletest+052226tx@gmail.com`)

### 3. Customer (`All Customers`)
- Quem completou compra. Tem payment method registrado.
- Colunas vistas: Customer ID, Customer Name, Email, Phone, City, State, Payment Method, Status, LTV, Date of Birthday.
- 2 customers atuais:
  - **3: Teste Awsales** — Phoenix AZ — CREDITCARD (testcard) — Status PENDING
  - **7: Pedro Awsales** — teste AK — PREPAID (External Payment) — Status PENDING

### 4. Subscription (`All Subscriptions`)
- Customer com assinatura ativa (cycle).
- Colunas vistas: Subscription ID, Date, Customer Name, Total, DR Status, Subscription Status.
- 2 subs atuais:
  - **DD030BE4AE** — Teste Awsales — $199 — DR: PENDING — Sub Status: ACTIVE
  - **FFDEF248FF** — Test User — $179 — DR: PENDING — Sub Status: ACTIVE

---

## Insights críticos

### A. Customer IDs sincronizados CKC ↔ Dosable

Customer #3, #5, #7, #9 do Dosable batem com customer #3, #5, #7 do CKC. Mesma numeração. Indica:
- Ou Dosable é "espelho" do CKC (sync via API)
- Ou Dosable é fonte e CKC herda IDs
- A confirmar via openapi.json — provavelmente Dosable cria customer e devolve ID que CKC usa

### B. Test cards APARECEM no Dosable (importante)

Doc oficial CKC: *"Test Card orders will not export through the webhook system"* — mas Dosable VÊ as subscriptions com test card (DD030BE4AE, FFDEF248FF). Implica que:

🚨 **Dosable recebe dados do CKC por canal DIFERENTE do postback webhook.** Pode ser:
- API call real-time (CKC notifica Dosable diretamente via API REST)
- Batch sync (periódico via Dosable API)
- Database sync (compartilhado)

Pro normalizer e workflow n8n isso significa: **não dependemos do postback CKC pra reconciliar com Dosable**. Dosable já tem o dado por outra via.

### C. DR Status vs Consult Status

- **DR Status** (Doctor Review) — visível em Subscriptions. Provavelmente revisão Beluga Health antes liberar Rx.
- **Consult Status** — visível em Partials. Talvez consulta médica em andamento (pré-revisão).
- Ambos PENDING em todos os registros atuais → nenhum doctor approval rodou ainda (pré-lançamento).

### D. Gates customer-side em "All Pending"

Order B94140F702 (Pedro, External Payment) está em Pending com 4 gates não cumpridos:
- ❌ **Password Creation** — customer ainda não criou conta no Nuestra
- ❌ **ID Verification** — não enviou documento
- 🚫 **RX Image** — não permitido/aplicável (talvez External Payment não exige)
- ❌ **Full Body Image** — não enviou foto de corpo inteiro

**Implicação:** order PENDING no Dosable ≠ payment pendente. É **fulfillment pendente** porque customer não cumpriu gates pessoais. Order $$ tá ok, só não pode dispensar Rx até customer subir tudo.

### E. Gateway/transactionId nas transações

`All Transactions` mostra `transactionId` numérico (52225, 58907, 41068, 29608) + gateway "NuestraRx - Weightloss - STAGING". Esses IDs batem com NMI direto (são IDs gerados pelo NMI ao processar a cobrança). Cross-ref:
- transactionId no NMI payload (`transaction_id`) = transactionId no Dosable
- Authorize + Capture = 2 entries separadas por transação
- External Payment (Pedro) só tem 1 entry "SALE" (não passou pelo NMI)

### F. TX bloqueado SÓ no ambiente de teste (NÃO em produção)

Daniel Javor (TX, $0) aparece bloqueado em STAGING (ambiente de teste), que recusa TX por padrão. Isso NÃO vale para produção: o dono Matheus confirmou em 2026-06-17 que a Nuestra RX entrega pros Estados Unidos inteiro, Texas incluído. Em resumo: uma vez testamos e o TX bloqueou porque era ambiente de teste; não é regra de compliance. Não criar gate de estado na IA. **Sample de teste do próprio time Dosable** (email `dosabletest+052226tx@gmail.com`).

---

## Fluxo completo end-to-end (mapeado até agora)

```
1. Visitante entra nuestrarx.com/evaluacion
       ↓
2. Preenche quiz → Cloudflare Worker (webhook.nuestrarx.com) dispara `intake_partial` pro n8n
       ↓ (paralelo)
3. Dosable cria Lead via API interna (não vimos webhook ainda dessa parte)
       ↓
4. Lead seleciona produto + adiciona payment → vira Partial no Dosable
       ↓
5. Submit completo (selectiona plano) → Dosable POSSIVELMENTE dispara `intake_submitted` pro n8n (ainda não confirmado por Willian)
       ↓
6. Dosable cria order no CKC via API CKC
       ↓
7. CKC processa via NMI (Authorize → Capture)
       ↓ (paralelo postback CKC)
8. CKC dispara postback `Partial`/`New Sale`/`Capture` pro n8n (URL: nuestra-champ)
       ↓
9. NMI dispara webhook `transaction.sale.success`/etc pro n8n (URL: nuestra-nmi)
       ↓
10. Customer faz upload de documentos/fotos → libera fulfillment
       ↓
11. Beluga Health (DR Status) aprova Rx
       ↓
12. Farmácia compounding 503A/503B dispensa
```

---

## Lacunas conhecidas (próximas investigações)

1. **Onde estão API Keys do Dosable?** Avatar/profile dropdown não foi explorado. Próxima sessão: clicar no nome "Pedro Lima" canto superior direito.
2. **Onde configurar webhook do Dosable?** Não tem aba visível. Provavelmente:
   - Atrás do mesmo dropdown que API Keys, OU
   - Configurado server-side via API call (Dosable team configura via dashboard interno deles)
3. **Como Dosable cria order no CKC?** Quem chama quem? API direta CKC.import/leads? Provavelmente sim — Dosable Lead Service → CKC `/leads/import/`.
4. **Doctor Review (Beluga) tem webhook próprio?** Possível 4ª integração. Não confirmado.
5. **`intake_submitted` event** — Willian implementando. Aguardando resposta dele.
6. **DR Status** pode ter eventos próprios (DR_APPROVED, DR_DECLINED) que disparariam postback do CKC ou Dosable. Não capturados ainda.

---

## Resumo executivo

O Dosable é o **hub do customer journey**. Tudo o que rola em outro sistema (CKC, NMI, Beluga, Worker do site) eventualmente reflete no Dosable. A integração com CKC é bidirecional e independente do postback webhook (test cards aparecem aqui apesar de não disparar postback).

Pro nosso normalizer n8n + AWSales: **Dosable é a melhor fonte de "estado do customer"**. CKC é fonte de "estado financeiro". NMI é fonte de "estado da transação". Forms-site é fonte de "intake do funil".

4 receivers no n8n cobrem origens diferentes do mesmo customer:
- `/webhook/nuestra-forms-site` — intake do funil
- `/webhook/nuestra-dosable` — estado do customer/order (PENDENTE setup)
- `/webhook/nuestra-champ` — estado financeiro/order CKC
- `/webhook/nuestra-nmi` — estado da transação no gateway
