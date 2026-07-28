# Rascunho do Checkpoint da IA - Nuestra RX

Este arquivo é uma cola para quando formos montar o checkpoint final da IA da AWSales.

A ideia é não esquecer como as duas partes se conectam:

1. Metadata que chega da campanha/formulário.
2. Tool `Enviar avaliação Nuestra RX`, que a IA usa para devolver dados para a Nuestra RX e gerar checkout.

Também vamos encaixar isso no modelo `SATURN` do checkpoint quando formos escrever a versão final.

## Fluxos envolvidos

### 1. Entrada da campanha

Fluxo:

```text
Nuestra RX forms-site -> n8n normalizer -> AWSales campanha/lead
```

Esse fluxo serve para a IA receber contexto do que aconteceu no formulário.

O payload normalizado enviado para a AWSales tem:

- `lead`: dados do lead.
- `form_answers`: perguntas e respostas já capturadas.
- `metadata`: contexto técnico e de progresso.

### 2. Tool da IA

Fluxo:

```text
AWSales IA -> n8n adapter -> Nuestra RX /ai-handoff -> checkout_url
```

Essa tool serve para a IA enviar uma avaliação coletada pelo WhatsApp para a Nuestra RX.

Se a Nuestra aceitar, ela retorna `checkout_url`.

## Tool que deve existir no checkpoint

Nome visível:

```text
Enviar avaliação Nuestra RX
```

Handle:

```text
@enviar_avaliacao_nuestra_rx
```

Uso:

```text
Use esta tool somente quando o lead quiser finalizar a avaliação pelo WhatsApp e a IA já tiver coletado os dados obrigatórios, respostas clínicas e consentimentos necessários.
```

Não usar a tool:

- Se faltar dado obrigatório.
- Se o lead ainda não confirmou que quer seguir para checkout.
- Se houver critério de desqualificação.
- Se o lead recusou consentimento obrigatório.
- Só porque o lead clicou no WhatsApp. O clique em WhatsApp apenas indica que ele chegou receptivo para conversa.

Quando a tool retornar `checkout_url`, a IA deve enviar o link para o lead.

## Campos da tool

A tool espera estes campos:

```json
{
  "product": "semaglutide",
  "plan": "rush",
  "contact": {},
  "answers": {},
  "source": {}
}
```

Significado:

- `product`: tratamento escolhido. Exemplo: `semaglutide` ou `tirzepatide`.
- `plan`: plano/oferta escolhido. Exemplo validado em teste: `rush`.
- `contact`: dados do lead.
- `answers`: respostas clínicas usando IDs da Nuestra RX.
- `source`: origem da coleta, normalmente WhatsApp/AWSales.

Observação importante:

A AWSales pode enviar `contact`, `answers` e `source` como texto JSON. O n8n adapter já foi criado para converter isso com `JSON.parse` antes de repassar para a Nuestra RX.

## Metadata que a IA deve usar

Campos importantes que chegam em `metadata`:

- `event_kind`: tipo normalizado do evento.
- `nrx_event`: evento original da Nuestra RX.
- `recommended_recovery_url`: melhor URL para recuperação. Pode ser checkout ou resume.
- `form_resume_url`: link para retomar avaliação.
- `checkout_url`: link de checkout quando já existir.
- `resume_step`: etapa técnica onde o lead parou.
- `resume_step_label`: etapa humana onde o lead parou.
- `session_id`: chave da sessão no formulário.
- `dosable_lead_id`: lead ID da Dosable, quando vier.
- `dosable_session_id`: session ID da Dosable, quando vier.
- `lead_state`: estado do lead.
- `biological_sex`, `age_range`, `dob`: dados demográficos.
- `height_display`, `height_cm`, `weight_lbs`, `weight_kg`, `bmi`, `bmi_class`: dados corporais.
- `goal_weight`: peso meta.
- `selected_medication`: medicamento escolhido, quando houver.
- `selected_plan`: plano escolhido, quando houver.
- `plan_price`: preço do plano, quando houver.
- `final_consents_from_raw`: consentimentos finais capturados, quando houver.
- `answers_count`: quantidade de respostas capturadas.

Regra para a IA:

Use o `metadata` para entender contexto e ponto de retomada. Use `form_answers` para saber quais perguntas já foram respondidas e evitar repetir tudo.

Se `metadata` e `form_answers` parecerem conflitantes, a IA deve confirmar com o lead antes de avançar.

## Comportamento por tipo de evento

### `form_abandonment`

O lead parou no formulário antes de concluir.

A IA deve:

- Usar `resume_step_label` para saber onde ele parou.
- Usar `recommended_recovery_url` ou `form_resume_url` para oferecer retomada.
- Se o lead preferir seguir pelo WhatsApp, continuar a coleta ali.
- Não repetir perguntas já respondidas, quando `form_answers` tiver contexto.
- Só chamar a tool se conseguir completar dados clínicos e consentimentos pelo WhatsApp.

Mensagem base:

```text
Vi que você estava completando sua avaliação da Nuestra RX e parou em: {{metadata.resume_step_label}}. Posso te ajudar a continuar por aqui ou te enviar o link para retomar?
```

### `checkout_abandonment`

O lead já chegou no checkout ou já tem `checkout_url`.

A IA deve:

- Priorizar `metadata.checkout_url` ou `metadata.recommended_recovery_url`.
- Perguntar se ele quer finalizar agora.
- Enviar o checkout existente antes de tentar coletar tudo de novo.
- Não chamar a tool se já existe checkout válido, a menos que precise gerar um novo checkout por algum motivo.

Mensagem base:

```text
Sua avaliação já chegou na etapa de checkout. Posso te enviar o link para finalizar agora?
```

### `whatsapp_handoff`

O lead clicou para continuar pelo WhatsApp.

A IA deve:

- Tratar como lead receptivo/inbound.
- Não iniciar campanha agressiva.
- Continuar a conversa naturalmente.
- Usar metadata e form_answers para não começar do zero.

### `form_completed_no_checkout`

O lead completou a avaliação/formulário, mas o payload não trouxe checkout.

A IA deve:

- Não assumir abandono.
- Se o lead chamar, verificar se precisa gerar checkout.
- Se os dados estiverem completos e o lead quiser seguir, usar a tool.

## SATURN no checkpoint

Ainda vamos montar a versão final no formato SATURN.

Rascunho de intenção para encaixar no SATURN:

- Usar metadata para situar a conversa.
- Usar `form_answers` para preservar respostas já dadas.
- Usar a tool apenas como ação final de envio para Nuestra RX.
- Sempre responder em espanhol para o lead.
- Nunca inventar checkout_url.
- Se a tool retornar erro, assumir falha técnica e encaminhar para suporte humano.
- Se a tool retornar `checkout_url`, enviar o link com orientação clara para finalizar.

Quando o Pedro mandar o checkpoint final, revisar este arquivo antes de responder.

## Pontos que ainda podem mudar

- Willian pode ajustar o worker para consolidar eventos de abandono.
- O schema da Nuestra RX pode mudar.
- O valor de `plan` pode precisar ser confirmado entre `rush`, `monthly` ou outro nome interno.
- A AWSales pode mudar como envia objetos na tool; hoje precisou de adapter n8n.
