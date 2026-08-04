# Configuração da Integração (input) — Cal.com -> AWSales via n8n (Tintim)

Status: IMPLEMENTADO e em produção (export conferido em 2026-07-22).

Esta NÃO é uma tool (a IA não chama). É a integração de **input** da campanha, no modelo de `Estrutura/INPUT_OUTPUT_CAMPANHAS.md`: um evento externo (booking no Cal.com) vira um objeto de reunião na AWSales, que serve de entrada para a campanha **Lembrete de Comparecimento**.

## Para que serve

- Quando um booking é criado, remarcado ou cancelado no Cal.com (event type Análise de Parceria IA, time Tintim Parcerias), o Cal dispara um webhook.
- O n8n recebe, normaliza para o formato de evento de reunião da AWSales e registra na plataforma.
- A AWSales passa a ter a reunião com seus dados de metadata, que a campanha Lembrete usa: `{{metadata.meeting.uid}}`, `{{metadata.meeting.start_time}}`, `{{metadata.meeting.location.url}}`.
- Loop fechado: como as tools `@agendar_reuniao` e `@cancelar_reuniao` (as duas já construídas) provocam BOOKING_CREATED / BOOKING_CANCELLED no Cal, esses eventos voltam por aqui e atualizam/encerram a reunião na AWSales, reprogramando ou cancelando os lembretes automaticamente.

## Dados fixos

- Webhook n8n (entrada, vindo do Cal): `https://n8n.nonprod.awsales.io/webhook/integracao-cal` (POST, sem auth).
- Endpoint AWSales (saída): `https://app.awsales.io/api/webhooks/organizations/effffee8-1d6a-49e5-8c91-8309d1af6e4f/credentials/cal-integracao` (POST, Body RAW JSON, header `Accept: application/json`). É o webhook da credential "cal-integracao" da organização Tintim na AWSales.
- No Cal.com: o webhook da conta/time precisa apontar para o `integracao-cal` do n8n, nos eventos BOOKING_CREATED, BOOKING_RESCHEDULED e BOOKING_CANCELLED.

## Fluxo n8n "Tintim | Integração com a cal.com (input)"

```
Webhook1 (integracao-cal) -> Normaliza reunião -> Registra reunião AWSales
```

1. Webhook1 — nó Webhook, POST, path integracao-cal. Recebe o payload cru do Cal.com em `$json.body`.
2. Normaliza reunião — nó Code. Traduz o evento do Cal para o evento interno da AWSales e monta o payload como STRING (bodyJson). Código canônico: `Integração (input)/Normaliza reunião.js`.
3. Registra reunião AWSales — nó HTTP Request, POST no endpoint da AWSales, Body RAW `{{ $json.bodyJson }}`, header `Accept: application/json`.

## O que o Normaliza reunião faz

- Mapeia o `triggerEvent` do Cal para o `event` da AWSales:
  - BOOKING_CREATED -> meeting_scheduled (status scheduled)
  - BOOKING_RESCHEDULED -> meeting_rescheduled (status scheduled)
  - BOOKING_CANCELLED -> meeting_cancelled (status cancelled)
- Monta o payload no schema de input da AWSales: `source`, `lead` (phone, email, name), `meeting` (title, uid, start_time, start_local, end_time, timezone, status, host, location), `metadata` (o que a IA referencia na conversa via `{{metadata.*}}`: ESPELHA `lead` e `meeting` inteiros, mais empresa, tomador_decisao, context_notes) e `utm`. O uid da tool de cancelar vem de `metadata.meeting.uid`.
- **title:** é fixo no código ("Reunião Programa de Parceiros"), não vem do título real do evento no Cal.
- **uid:** já inclui `uid: p.uid` — é o que a `@cancelar_reuniao` vai usar via `{{metadata.meeting.uid}}`. Isso resolve, no lado n8n, o pré-requisito que estava aberto no plano do Lembrete.
- **start_local:** horário da reunião já formatado no fuso de SP (ex: 23/07/2026 às 10:00). O `start_time` continua indo em UTC; o `start_local` é pra IA falar a hora certa sem fazer conta.
- **telefone do lead:** vem de `payload.metadata.phone` primeiro, e só então de `attendees[0].phoneNumber`. Importa: o Cal costuma mandar `attendees[0].phoneNumber` como null (visto no payload real), e quem carrega o telefone é o `metadata.phone` que o nó "Monta body do booking" (tool Agendar) injeta no booking. Ou seja, a expansão do metadata na tool de agendar existe justamente para o telefone chegar aqui.
- **link da chamada:** vem de `payload.metadata.videoCallUrl` ou de `payload.videoCallData.url` (Google Meet no caso real).

## Variáveis de metadata que a AWSales passa a expor (checkpoint do Lembrete)

- `{{metadata.meeting.uid}}` — id do booking, para cancelar/remarcar.
- `{{metadata.meeting.start_time}}` — data/hora da reunião.
- `{{metadata.meeting.start_local}}` — data/hora já formatada no fuso de SP (ex: 23/07/2026 às 10:00), pronta pra IA falar sem errar o fuso.
- `{{metadata.meeting.location.url}}` — link da videochamada.

Confirmar no painel da AWSales os tokens exatos dessas variáveis, conforme o objeto de reunião que a plataforma cria a partir deste payload.

## Pendências / hardening

- O webhook do Cal chega com `x-cal-signature-256: no-secret-provided` — sem assinatura. Para produção, configurar um secret no webhook do Cal e validar no n8n.
- O webhook `integracao-cal` do n8n não tem auth própria.
- O nó `Registra reunião AWSales` está sem `On Error: Continue` (o equivalente no fluxo kommo-cal tem). Se a AWSales devolver erro, a execução falha sem tratamento e a reunião não é registrada silenciosamente. Padronizar.
- Nós com nome default a batizar: `Webhook1`. O nó Code no canvas é "Normaliza reunião" (com acento), igual ao `.js`.
- Confirmar que a AWSales de fato materializa `{{metadata.meeting.uid}}` como variável da campanha (o normalizador já manda o uid; falta validar o lado plataforma / re-registrar a integração se o objeto de reunião ainda tiver sido criado com um payload antigo sem uid).
