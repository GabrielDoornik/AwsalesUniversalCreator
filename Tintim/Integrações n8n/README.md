# Integrações n8n — Tintim

Infra compartilhada entre as campanhas do Tintim (SDR Home/Site, Lembrete de Comparecimento e Venda - Não-MQL). Toda tool da AWSales que fala com Cal.com ou Kommo passa por um webhook n8n (gateway): a key/token fica server-side no n8n, e o n8n monta/normaliza o que a AWSales não montaria sozinha (objeto aninhado, body em array, encadeamento buscar->decidir->agir, tratamento de erro).

- Conexão única na AWSales: **Tintim - Gateway n8n** (auth Nenhuma).
- Base dos webhooks: `https://n8n.nonprod.awsales.io/webhook/`.

Atenção: `nonprod` é o ambiente de DEV. A convenção do projeto é a tool apontar para produção (`https://flow.awsales.io/webhook/<path>`). Tudo do Tintim está em dev — uma queda do nonprod derruba as três campanhas. Migrar exige trocar a URL nas tools da AWSales E a chamada n8n->n8n do nó "Chama kommo-cal".

Todos os 6 fluxos vivem no MESMO canvas do n8n, separados por sticky note. Consequência prática: nome de nó tem que ser único no canvas inteiro, senão as referências `$('...')` quebram (foi por isso que o nó do Cal virou "Monta body do booking", já que o Kommo tem um "Monta body").

## Organização da pasta

- `Cal.com/` — agendamento das reuniões do Programa de Parceiros (tools) e a integração de input Cal.com -> AWSales. Docs reproduzíveis: `CONFIG_TOOLS_CAL.md` (tools) e `CONFIG_INTEGRACAO_CAL.md` (input). Nós Code em subpasta por fluxo.
- `Kommo/` — CRM (criar/mover card no pipe IA [Awsales]), o handoff do não-MQL que abre a campanha de Venda e o input de lead novo por etapa do CRM. Docs reproduzíveis: `CONFIG_TOOLS_KOMMO.md` (tool), `CONFIG_HANDOFF_NAO_MQL.md` (handoff) e `CONFIG_INPUT_LEAD_NOVO.md` (input). Nós Code em subpasta por fluxo.
- `Vindi/` — output de vendas (assinatura criada -> encerra a campanha de Venda). Doc reproduzível: `CONFIG_OUTPUT_VINDI.md`.

Cada nó "Code" do n8n vive como um `.js` na subpasta do seu fluxo, com o **nome exato do nó** (pra casar 1:1 com o canvas). Serve pra copiar/colar direto no n8n. Os `.md` descrevem a arquitetura de cada fluxo e apontam pro `.js` canônico do código.

Exceções onde o nó no canvas está com nome default e o `.js` usa o nome bom (renomear no n8n para casar): `Cancelar Reunião/Monta resposta.js` = nó `Monta resposta1`; `Vindi/Output de Vendas/Normaliza assinatura.js` = nó `Code in JavaScript`.

## Mapa: fluxo -> webhook -> handle -> campanha

| Integração | Fluxo n8n | Webhook | Handle da tool | Usada em |
|---|---|---|---|---|
| Cal.com | Consultar Horários | `tintim-cal-horarios` | `@consultar_horarios_disponiveis` | SDR, Lembrete |
| Cal.com | Agendar Reunião | `tintim-cal-agendar` | `@agendar_reuniao` | SDR, Lembrete |
| Cal.com | Cancelar Reunião | `tintim-cal-cancelar` | `@cancelar_reuniao` | Lembrete |
| Kommo | Atualizar Card | `tintim-kommo-card` | `@atualizar_card_no_crm` | SDR |

## Integrações de input/output (não são tools; ver `Estrutura/INPUT_OUTPUT_CAMPANHAS.md`)

| Tipo | Fluxo n8n | Webhook n8n | Credential AWSales | Campanha | Status |
|---|---|---|---|---|---|
| input | Integração com a cal.com (input) | `integracao-cal` | `cal-integracao` | Lembrete de Comparecimento (alimenta as reuniões) | em produção |
| input | Handoff Não-MQL | `kommo-cal` | `kommo-nao-mql` | Venda - Não-MQL (abre a campanha) | em produção |
| output | Output de vendas | `integracao-vindi` | `output-vendas` | Venda - Não-MQL (encerra a campanha) | construído, não liberado |
| input | Input Kommo - Lead Novo | `kommo-lead-novo` | `kommo-lead-novo` | a definir (não-MQL de qualquer origem) | validado ponta a ponta; falta amarrar na campanha |

- **integracao-cal** recebe BOOKING_CREATED/RESCHEDULED/CANCELLED do Cal.com, normaliza e registra a reunião na AWSales, expondo `{{metadata.meeting.uid}}`, `{{metadata.meeting.start_time}}` e `{{metadata.meeting.location.url}}`. Detalhe em `Cal.com/CONFIG_INTEGRACAO_CAL.md`.
- **kommo-cal** é acionado pelo ramo de handoff do `tintim-kommo-card` quando o card entra em "Oferta Enviada" (status_id 106939427) e posta um `custom_action` que abre a Venda. Detalhe em `Kommo/CONFIG_HANDOFF_NAO_MQL.md`.
- **integracao-vindi** recebe o webhook da Vindi, filtra `subscription_created` e posta o output que encerra a Venda. Bloqueado por casamento de lead (input tem telefone real + e-mail mockado; output tem e-mail real + telefone vazio). Detalhe em `Vindi/CONFIG_OUTPUT_VINDI.md`.
- **kommo-lead-novo** é acionado pelo webhook do PRÓPRIO Kommo quando um card entra na etapa-gatilho (Aguardando Contato, 106939423), faz dois GETs para chegar no telefone (o webhook do Kommo não manda) e registra o lead na AWSales. Serve os não-MQL de qualquer origem — trial e outras vias — que hoje só preenchem formulário. Escrito agnóstico de destino: etapa-gatilho e campanha são duas constantes. Validado ponta a ponta em 31/07/2026; falta amarrar o produto na campanha. Detalhe em `Kommo/CONFIG_INPUT_LEAD_NOVO.md`.

## Inventário de nós Code (fonte da verdade = `.js`)

| Fluxo | Nó Code | Arquivo `.js` | Verificado c/ export real |
|---|---|---|---|
| Cal - Consultar Horários | Achata e organiza horários | `Cal.com/Consultar Horários/Achata e organiza horários.js` | 2026-07-30 |
| Cal - Agendar Reunião | Monta body do booking | `Cal.com/Agendar Reunião/Monta body do booking.js` | 2026-07-30 |
| Cal - Agendar Reunião | Monta confirmação | `Cal.com/Agendar Reunião/Monta confirmação.js` | 2026-07-30 |
| Cal - Cancelar Reunião | Monta resposta1 | `Cal.com/Cancelar Reunião/Monta resposta.js` | 2026-07-30 |
| Cal - Integração (input) | Normaliza reunião | `Cal.com/Integração (input)/Normaliza reunião.js` | 2026-07-30 |
| Kommo - Atualizar Card | Prepara dados | `Kommo/Atualizar Card/Prepara dados.js` | 2026-07-30 |
| Kommo - Atualizar Card | Avalia busca | `Kommo/Atualizar Card/Avalia busca.js` | 2026-07-30 |
| Kommo - Atualizar Card | Monta body | `Kommo/Atualizar Card/Monta body.js` | 2026-07-30 |
| Kommo - Atualizar Card | Monta resposta | `Kommo/Atualizar Card/Monta resposta.js` | 2026-07-30 |
| Kommo - Atualizar Card | Filtra handoff | `Kommo/Atualizar Card/Filtra handoff.js` | 2026-07-30 |
| Handoff Não-MQL | Normaliza handoff | `Kommo/Handoff Não-MQL/Normaliza handoff.js` | 2026-07-30 |
| Output de vendas | Code in JavaScript | `Vindi/Output de Vendas/Normaliza assinatura.js` | 2026-07-30 |
| Input Kommo - Lead Novo | Extrai lead do Kommo | `Kommo/Input Lead Novo/Extrai lead do Kommo.js` | 2026-07-31 |
| Input Kommo - Lead Novo | Extrai contato principal | `Kommo/Input Lead Novo/Extrai contato principal.js` | 2026-07-31 |
| Input Kommo - Lead Novo | Normaliza input | `Kommo/Input Lead Novo/Normaliza input.js` | 2026-07-31 |

Auditoria de 2026-07-30: os 9 nós que já estavam versionados batem byte a byte com o export do n8n. Os 3 últimos da tabela foram criados nessa auditoria (existiam no n8n, não no repositório).

## Pendências transversais

- **Segurança (prioridade):** a API key do Cal (`cal_live_...`) e o token do Kommo estão em texto puro nos headers de 5 nós HTTP, e as duas chaves reais estão versionadas em `../WhatsApp Chat - Awsales  Tintim/*-credentials.md` neste repositório, que é PÚBLICO. Rotacionar as duas e mover para Credentials do n8n; tirar os arquivos do versionamento.
- Nenhum dos webhooks n8n tem auth. O do Cal chega com `x-cal-signature-256: no-secret-provided`; o da Vindi não valida assinatura.
- `Filtra handoff` dispara o handoff mesmo quando a operação no CRM falhou, e está posicionado acima do `Respond to Webhook` (com executionOrder v1 isso faz a tool responder só depois da cadeia de handoff). Ver `Kommo/CONFIG_HANDOFF_NAO_MQL.md`.
- `onError: continueRegularOutput` está inconsistente entre os fluxos: presente em `Registra na AWSales`, ausente em `Registra reunião AWSales` e no `HTTP Request` da Vindi.
- Nós com nome default a batizar: `Webhook`, `Webhook1`, `Webhook2`, `Webhook3`, `Webhook4`, `Monta resposta1`, `Respond to Webhook1`, `Code in JavaScript`, `HTTP Request`. O fluxo Cancelar Reunião e o Handoff Não-MQL não têm sticky note de grupo.
- A key do Cal é pessoal do Junior Faria: se ele sair do time 11887, as tools do Cal param.
