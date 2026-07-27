# Plano de Tools — Campanha Lembrete de Comparecimento (Tintim)

Doc interno de construção. NÃO vai para o checkpoint.

## Objetivo da campanha

Reduzir no-show das reuniões do Programa de Parceiros. Disparada quando uma reunião é agendada (input do Cal via `integracao-cal`). A plataforma envia os lembretes automáticos antes da reunião pela Sequência de Lembretes (config no painel, ex: 2h e 1h antes). O checkpoint governa a conversa quando o lead responde a um lembrete: confirmar, remarcar ou cancelar.

## Fontes de dado (decisão 2026-07-22)

- Recap da reunião (data, horário, link): NÃO usa tool. Vem da METADATA do evento de entrada, que é o mesmo objeto que o `integracao-cal` manda para a AWSales (`meeting.start_time`, `meeting.location.url`). Confirmar no painel o token exato dessas variáveis de metadata; no checkpoint estão como `{{metadata.meeting.start_time}}` e `{{metadata.meeting.location.url}}`.
- Remarcar: NÃO precisa de tool nova. Reusa `@consultar_horarios_disponiveis` (slots) e `@agendar_reuniao` (marca o novo horário), ambas já existentes no SDR. Ordem no checkpoint: agendar o novo primeiro, depois cancelar o anterior, para o lead nunca ficar sem reunião.
- Cancelar: ÚNICA operação que não existe hoje. Precisa da tool nova `@cancelar_reuniao`.

## Pré-requisito: uid na metadata (lado n8n JÁ FEITO, confirmado 2026-07-22)

Para a tool de cancelar cancelar o booking exato, a AWSales precisa expor `{{metadata.meeting.uid}}`. O normalizador do `integracao-cal` JÁ inclui `uid: p.uid` no objeto `meeting` (confirmado no export de 2026-07-22 — ver `Integrações n8n/Cal.com/CONFIG_INTEGRACAO_CAL.md` e o `.js` `Normaliza reunião.js`). O lado n8n está pronto.

Falta só confirmar que a AWSales, ao ingerir esse payload, materializa `{{metadata.meeting.uid}}` como variável da campanha (re-registrar/reprocessar a integração se o objeto de reunião ainda tiver sido criado com um payload antigo sem uid). Sem o uid, a tool de cancelar teria que adivinhar o booking por e-mail, o que fica ambíguo no reagendamento (dois bookings do mesmo lead por um instante).

## Tool nova: cancelar_reuniao

Mesmo padrão de gateway n8n das outras tools do Cal (webhook n8n → API do Cal; a key do Cal fica no n8n, não na AWSales).

- Webhook n8n: `tintim-cal-cancelar`. Recebe `{ uid }`.
- Chamada Cal: POST `https://api.cal.com/v2/bookings/{uid}/cancel`, header `cal-api-version: 2024-08-13`, Bearer com a key do Cal. Body: `{ "cancellationReason": "Cancelado pelo lead pela IA" }`.
- Resposta para a IA: `{ ok: true/false }`.
- Tool na AWSales: 1 parâmetro `uid`, mapeado para `{{metadata.meeting.uid}}` (o uid do booking atual, vindo da metadata). Conexão: Tintim - Gateway n8n (a que já existe).

## Tools que o checkpoint referencia (resumo)

| Handle | Status | Ação |
|---|---|---|
| `consultar_horarios_disponiveis` | já existe (SDR) | horários livres para remarcar — habilitar nesta campanha |
| `agendar_reuniao` | já existe (SDR) | marca a reunião no novo horário — habilitar nesta campanha |
| `cancelar_reuniao` | feita e validada (2026-07-22) | cancela a reunião atual do lead |

## Loop fechado com o integracao-cal

Ao agendar (remarcar) ou cancelar pela tool, o Cal dispara `BOOKING_CREATED` e `BOOKING_CANCELLED`, que passam pelo `integracao-cal` e atualizam as reuniões na AWSales, reprogramando ou encerrando os lembretes automaticamente.

## Config da campanha na plataforma

- Usa a MESMA Base de Conhecimento do SDR (compartilhada).
- Habilitar nesta campanha as 3 tools acima (as duas do SDR precisam ser habilitadas por campanha; a de cancelar depois de construída).
- Os lembretes (2h/1h antes ou o que o cliente definir) são a Sequência de Lembretes, config no painel — não é checkpoint.
- Variável do checkpoint a mapear: `{{link_suporte}}`. As de reunião (`start_time`, `location.url`, `uid`) vêm da metadata do evento.
