# Integrações n8n — Tintim

Infra compartilhada entre as campanhas do Tintim (SDR Home/Site, Lembrete de Comparecimento e, futuramente, Venda). Toda tool da AWSales que fala com Cal.com ou Kommo passa por um webhook n8n (gateway): a key/token fica server-side no n8n, e o n8n monta/normaliza o que a AWSales não montaria sozinha (objeto aninhado, body em array, encadeamento buscar->decidir->agir, tratamento de erro).

- Conexão única na AWSales: **Tintim - Gateway n8n** (auth Nenhuma).
- Base dos webhooks: `https://n8n.nonprod.awsales.io/webhook/`.

## Organização da pasta

- `Cal.com/` — agendamento das reuniões do Programa de Parceiros (tools) e a integração de input Cal.com -> AWSales. Docs reproduzíveis: `CONFIG_TOOLS_CAL.md` (tools) e `CONFIG_INTEGRACAO_CAL.md` (input). Nós Code em subpasta por fluxo.
- `Kommo/` — CRM (criar/mover card no pipe IA [Awsales]). Doc reproduzível do fluxo: `CONFIG_TOOLS_KOMMO.md`. Nós Code em subpasta por fluxo.

Cada nó "Code" do n8n vive como um `.js` na subpasta do seu fluxo, com o **nome exato do nó** (pra casar 1:1 com o canvas). Serve pra copiar/colar direto no n8n. Os `.md` descrevem a arquitetura de cada fluxo e apontam pro `.js` canônico do código.

## Mapa: fluxo -> webhook -> handle -> campanha

| Integração | Fluxo n8n | Webhook | Handle da tool | Usada em |
|---|---|---|---|---|
| Cal.com | Consultar Horários | `tintim-cal-horarios` | `@consultar_horarios_disponiveis` | SDR, Lembrete |
| Cal.com | Agendar Reunião | `tintim-cal-agendar` | `@agendar_reuniao` | SDR, Lembrete |
| Cal.com | Cancelar Reunião | `tintim-cal-cancelar` | `@cancelar_reuniao` | Lembrete |
| Kommo | Atualizar Card | `tintim-kommo-card` | `@atualizar_card_no_crm` | SDR |

## Integrações de input/output (não são tools; ver `Estrutura/INPUT_OUTPUT_CAMPANHAS.md`)

| Tipo | Fluxo n8n | Webhook n8n | Destino | Campanha |
|---|---|---|---|---|
| input | Integração com a cal.com (input) | `integracao-cal` | AWSales (credential `cal-integracao`) | Lembrete de Comparecimento (alimenta as reuniões) |

Recebe BOOKING_CREATED/RESCHEDULED/CANCELLED do Cal.com, normaliza e registra a reunião na AWSales, expondo `{{metadata.meeting.uid}}`, `{{metadata.meeting.start_time}}` e `{{metadata.meeting.location.url}}`. Detalhe em `Cal.com/CONFIG_INTEGRACAO_CAL.md`.

## Inventário de nós Code (fonte da verdade = `.js`)

Os `.js` são criados conforme cada fluxo é enviado e conferido contra o export real do n8n (em andamento desde 2026-07-22).

| Fluxo | Nó Code | Arquivo `.js` | Verificado c/ export real |
|---|---|---|---|
| Cal - Consultar Horários | Achata e organiza horários | `Cal.com/Consultar Horários/Achata e organiza horários.js` | 2026-07-22 |
| Cal - Agendar Reunião | Monta body do booking | `Cal.com/Agendar Reunião/Monta body do booking.js` | 2026-07-22 |
| Cal - Agendar Reunião | Monta confirmação | `Cal.com/Agendar Reunião/Monta confirmação.js` | 2026-07-22 |
| Kommo - Atualizar Card | Prepara dados | `Kommo/Atualizar Card/Prepara dados.js` | 2026-07-22 |
| Kommo - Atualizar Card | Avalia busca | `Kommo/Atualizar Card/Avalia busca.js` | 2026-07-22 |
| Kommo - Atualizar Card | Monta body | `Kommo/Atualizar Card/Monta body.js` | 2026-07-22 |
| Kommo - Atualizar Card | Monta resposta | `Kommo/Atualizar Card/Monta resposta.js` | 2026-07-22 |
| Cal - Integração (input) | Normaliza reunião | `Cal.com/Integração (input)/Normaliza reunião.js` | 2026-07-22 |
| Cal - Cancelar Reunião | Monta resposta | `Cal.com/Cancelar Reunião/Monta resposta.js` | 2026-07-22 |
