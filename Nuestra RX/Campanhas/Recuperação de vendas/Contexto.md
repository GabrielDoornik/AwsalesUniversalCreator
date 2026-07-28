# Contexto — Recuperação de Vendas (Nuestra RX)

Como funciona o modelo de vendas da Nuestra RX, que é **diferente** da recuperação de
formulário e diferente do padrão brasileiro de recuperação de vendas. Baseado em conversa
com o Willian (áudio transcrito no WhatsApp, 2026-06-08 — pode ter palavra trocada na
transcrição, mas o contexto está fiel).

---

## A diferença que muda tudo: ninguém paga no checkout (pre-save)

No Brasil, recuperação de vendas = carrinho abandonado, cartão recusado, Pix expirado,
boleto expirado. Na Nuestra RX (EUA) **não é assim**.

A Nuestra vende **medicamento de emagrecimento como tratamento** (plano **mensal** ou
**trimestral**). Independente do plano:

> **No momento do checkout a pessoa NÃO paga nada.** O campo de cobrança aparece como
> **$0**. Isso é o que eles chamam de **pre-save** (pre-saved).

No pre-save, o lead só:
1. Registra o cartão.
2. Faz um **booking** (reserva) do pedido.

Ou seja: o "checkout" aqui é um **pré-cadastro de cartão + reserva**, sem cobrança.

---

## O funil real (checkout → médico → cobrança)

```
1. Lead faz o checkout (pre-save: registra cartão, $0 cobrado, booking do pedido)
        ↓
2. Pedido vai para a Beluga Health (os médicos que aprovam)
        ↓
3. Médico acessa o formulário, verifica as informações, dá o sign-off (aprova)
        ↓
4. Aprovou → pedido é despachado para a farmácia
        ↓
5. NO MOMENTO do despacho para a farmácia → realiza a COBRANÇA (debita o cartão de verdade)
        ↓
6. Status do pedido muda: PENDENTE → APROVADO/ATIVO
```

**Regra de ouro (Willian):** depois que o paciente faz o checkout, **NÃO significa que ele
comprou**. Só vira venda de fato quando o médico aprova, chega na farmácia e o pedido é
finalizado (com a cobrança real). Fazer checkout ≠ comprou.

Isso casa com a hierarquia da Dosable (ver `../../Integração/docs/dosable/admin-panel-mapping.md`):
`Lead → Partial → Customer → Subscription`. O pre-save/booking provavelmente é o **Partial**
(cartão registrado + Consult Status PENDING); vira **Customer** quando aprova e cobra.
"DR Status" = Doctor Review (aprovação Beluga).

---

## O que isso significa para a campanha de Recuperação de Vendas

> ATENÇÃO: tudo aqui é DEPOIS do formulário. A campanha de **Recuperação de Formulário**
> pega quem abandonou o intake médico (antes do checkout). A de **Recuperação de Vendas**
> pega quem **chegou no checkout** e não concluiu o pre-save.

---

## Desenho final da campanha (confirmado 2026-06-08)

Não existe evento explícito de "abandono de checkout". A solução é o padrão **debounce**:
dispara no momento que o lead chega ao checkout e, se em X minutos não vier a conversão,
recupera.

| Papel | Evento | O que é | O que faz |
|---|---|---|---|
| **INPUT** (dispara) | `intake_plan_selected` | lead chegou no checkout (gera `checkout_url`) | IA espera ~15 min |
| **OUTPUT** (encerra) | `order_paid` | lead clicou **"Complete Purchase"** = concluiu o pre-save ($0, booking) | **para a campanha** (conversão) |

Lógica: chegou `intake_plan_selected` → espera 15 min → se **não** veio `order_paid` nesse
intervalo, a IA chama (lead abandonou o checkout); se **veio** `order_paid`, a IA **não**
chama (lead concluiu).

### Por que `order_paid` é o output certo (e não a cobrança pós-médico)
Confirmado por teste: `order_paid` dispara no clique do **"Complete Purchase"**, que é a
**ação do lead** (pre-save, $0 — a tela mostra "Total Due Now: $0.00" e "You're only charged
if a doctor approves"). É o sinal de que o lead fez a parte dele. A cobrança real (pós-médico)
é assíncrona (horas/dias) e **não** serve de output — senão a IA chamaria quem já concluiu o
checkout e só espera aprovação. A IA recupera o lead, não acelera o médico.

> Nota: o `order_paid` vem com `source: "dosable.checkout_complete"` / `dosable_event_type:
> "checkout_complete"`. O nome interno cita checkout_complete, mas o gatilho é o
> Complete Purchase (pre-save). Confirmar com o Willian se algum dia precisar de granularidade.

### Encadeamento das duas campanhas
O `intake_plan_selected` é **output da Recuperação de Formulário** E **input da Recuperação
de Vendas** — o mesmo evento encerra uma campanha e dispara a outra. No painel, configurar a
campanha de vendas para **disparar** nesse evento (o `form_response` que já flui hoje); não
precisa normalizador novo para o input.

### Fluxo n8n (output do order_paid)
O `order_paid` chega no **mesmo webhook `forms-site`** (`x-nrx-event: order_paid`). Separar
com um IF para não misturar com a normalização de abandono:

```
Forms-site (webhook)
   ↓
[IF] {{ $json.body.event }} == "order_paid"
   ├─ true  → [Code] order-paid-output-awsales.n8n.js → [IF should_send_output] → [HTTP] POST Custom Action (integração DEDICADA de vendas)
   └─ false → [Code] Normalize Abandono (fluxo dos eventos de formulário)
```

- Code node: `../../Integração/docs/forms-site/order-paid-output-awsales.n8n.js`
- Monta um `custom_action` (mesmo schema do output do WhatsApp), com `utm.source: "awsales"`.
- HTTP: integração/credencial **dedicada** de vendas (ex: `output-order-paid`), ligada como
  **Evento de Conversão** da campanha de Recuperação de Vendas. Isolar das outras credenciais.

### ⚠️ Pendência crítica: telefone quebrado no order_paid
No payload do `order_paid` o `phone` chega **estripado** (ex: `1983020653` em vez de
`+5531983020653` — perde o `553`). O `email` vem correto e é o **matcher confiável**. Pedir
para o Willian mandar o `phone` em **+E164**. Enquanto isso, o match da conversão depende do
email.

---

## Pendências / próximos passos

Resolvido:
- [x] **Desenho input/output definido:** input `intake_plan_selected`, output `order_paid`
      (pre-save), debounce 15 min. Payload do `order_paid` conhecido e normalizado.
- [x] **Code node do output criado:** `order-paid-output-awsales.n8n.js` (order_paid → custom_action).

Falta:
- [ ] **Willian: mandar o `phone` do order_paid em +E164** (vem estripado, ex `1983020653`).
- [ ] **Criar a integração dedicada de vendas no painel** (ex: `output-order-paid`) e ligar
      como **Evento de Conversão** da campanha. Configurar o **input** para disparar no
      `intake_plan_selected` (form_response) e o **wait de 15 min** antes da IA chamar.
- [ ] **Montar o ramo no n8n:** IF (`body.event == order_paid`) → Code → HTTP Custom Action,
      separado do Normalize Abandono.
- [ ] **Acessar a plataforma Dosable** com o Willian para ver o funil de checkout
      graficamente (menu tem `Order Fulfillment` e `Pending Check-Ins`). Confirmar acesso.
- [ ] **Avaliar eventos intermediários** (médico aprovou sem cobrar / recusa do médico /
      cartão recusado na cobrança real) — só se for usar numa campanha pós-pre-save. Willian
      adiciona no endpoint se precisar.
- [ ] **Checkpoint + mensagens da IA** da recuperação de vendas (seguir o fluxo de 3 fases).

---

## Resumo de uma linha

Recuperação de Vendas da Nuestra = recuperar quem travou **no checkout (pre-save, $0) ou
no caminho até a cobrança real** (que só acontece quando o médico da Beluga aprova e o
pedido é despachado pra farmácia). Conversão = `checkout_complete` (pago + aprovado).
Fazer checkout NÃO é comprar.
