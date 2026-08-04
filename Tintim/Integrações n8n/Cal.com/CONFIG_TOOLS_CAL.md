# Configuração de Tools — Cal.com via Gateway n8n (SDR Tintim)

Status: IMPLEMENTADO e testado ponta a ponta em 2026-07-14 (AWSales -> n8n -> Cal.com). Duas tools funcionando: consultar horários e agendar reunião (com tratamento de erro de horário ocupado).

MIGRAÇÃO PENDENTE (2026-07-20): o cliente pediu para tirar as reuniões da agenda pessoal do Junior e passar para a agenda do time, que distribui por rodízio entre os closers. Ver a seção "Migração para a agenda do time" no fim do arquivo. As tools abaixo já estão descritas com o event type NOVO; enquanto o n8n não for alterado, ele ainda roda com o 424760.

Arquitetura: a tool da AWSales aponta para um webhook do n8n, e o n8n chama o Cal.com. Isso mantém a API key do Cal server-side, monta o corpo aninhado que a AWSales não montaria e permite tratar erros. Decidido em 2026-07-14 (a pedido do Jorge, que não consegue limitar o escopo da key).

## Dados fixos da integração

- Event type usado: Análise de Parceria IA, eventTypeId 2153406. Agenda do time Tintim Parcerias (teamId 11887), slug público /team/tintim-parcerias/analise-de-parceria-ia. 30 min, schedulingType roundRobin, 5 hosts (Jhonatan Neves, Willian Cantuario, Pamela Lisboa, Wellington Barbosa, Norton Orthmann). O Cal sorteia o closer.
- Event type ANTIGO (agenda pessoal): Reunião de 30 min, eventTypeId 424760, junior-faria. Desativado nesta campanha a partir da migração de 2026-07-20.
- Regras do event type novo que afetam o comportamento da IA: minimumBookingNotice 120 min (não dá para marcar para menos de 2h à frente), slotInterval 60 min (horários de hora em hora), buffer de 10 min antes e depois, locations = organizersDefaultApp (o link da chamada vem do app padrão do closer sorteado, não é fixo).
- API key: pessoal do Junior Faria (junior.faria@codevance.com.br, userId 123670). Ela tem acesso ao time 11887, validado em 2026-07-20. RISCO: se o Junior sair do time ou da conta, as duas tools param. Recomendado ao cliente trocar por uma key de owner do time ou conta de serviço.
- Timezone: America/Sao_Paulo.
- cal-api-version: slots = 2024-09-04; bookings = 2024-08-13; event-types e teams = 2024-06-14.
- Formato do header de auth nos nós HTTP: NÃO é padronizado entre os fluxos, e tanto faz. Consultar Horários manda a key crua `Authorization: cal_live_...` (SEM `Bearer`); Agendar Reunião manda `Authorization: Bearer cal_live_...` (COM `Bearer`). Os dois estão em produção e funcionam — o Cal.com v2 aceita as duas formas. Confirmado nos exports de 2026-07-22. Para a tool de cancelar, recomendo copiar o de Agendar (`Bearer cal_live_...`), que usa o mesmo endpoint /v2/bookings e a mesma api-version 2024-08-13.
- API base do Cal: https://api.cal.com/v2
- Base dos webhooks n8n: https://n8n.nonprod.awsales.io/webhook/

### Campos obrigatórios do event type do time

O event type do time tem campos de booking obrigatórios que o pessoal não tinha. Sem eles o POST /v2/bookings volta 400.

| slug | label | tipo | obrigatório | de onde vem |
|---|---|---|---|---|
| name | Nome Completo | name | sim | attendee.name |
| email | E-mail | email | sim | attendee.email |
| Nome-da-empresa | Nome da Empresa | text | sim | IA coleta na Etapa 3A |
| phone | WhatsApp | phone (E.164 com +) | sim | telefone do próprio atendimento |
| tomadordedecisao | Você é o tomador de decisão? | select | sim | IA coleta na Etapa 3A |
| location | (radioInput) | radioInput | não | não enviar |
| guests | (multiemail) | multiemail | não | não enviar |

Opções aceitas em tomadordedecisao, texto exato: `Sim`, `Não`, `Não, mas vou garantir que o tomador de decisão esteja na chamada`. Qualquer outro valor é recusado pelo Cal.

Os três campos customizados vão em `bookingFieldsResponses`, chaveados pelo slug, no mesmo nível de `attendee`.

## Conexão na AWSales

- Nome: Tintim - Gateway n8n
- Tipo de autenticação: Nenhuma (webhook n8n sem auth)
- Organização: Tintim

---

## TOOL 1 — Consultar Horários Disponíveis  (handle: @consultar_horarios_disponiveis)

Lado AWSales (Nova Tool HTTP):
- Método: POST
- URL: https://n8n.nonprod.awsales.io/webhook/tintim-cal-horarios
- Headers: nenhum
- Query params: nenhum
- Body: nenhum (a IA só aciona; as datas o n8n calcula sozinho)
- Descrição para IA: "Use esta tool para consultar os horários livres da agenda antes de propor um horário ao lead. Chame sempre que o lead já qualificado quiser agendar a reunião ou perguntar quais horários existem."

Fluxo n8n "Tintim | Cal - Consultar Horários":

1. Recebe pedido (AWSales) — nó Webhook, POST, path tintim-cal-horarios, Respond: Using 'Respond to Webhook' Node.
2. Consulta horários no Cal.com — nó HTTP Request:
   - GET https://api.cal.com/v2/slots
   - Headers: Authorization = a key crua `cal_live_...` (SEM `Bearer` — ver Dados fixos); cal-api-version = 2024-09-04
   - Query: eventTypeId = 2153406; timeZone = America/Sao_Paulo; start = `{{ $now.setZone('America/Sao_Paulo').toFormat('yyyy-MM-dd') }}`; end = `{{ $now.setZone('America/Sao_Paulo').plus({ days: 14 }).toFormat('yyyy-MM-dd') }}`
   - Único campo que muda na migração para a agenda do time: o eventTypeId. O endpoint de slots já agrega sozinho a disponibilidade dos 5 closers. Validado em 2026-07-20.
   - Settings -> On Error: Continue (senão o Cal fora do ar devolve 500 cru para a IA)
3. Achata e organiza horários — nó Code (trata erro do Cal e agenda vazia; robustez aplicada em 2026-07-15). Código canônico (verificado contra o export real do n8n em 2026-07-22): `Consultar Horários/Achata e organiza horários.js`.
4. Responde horários pra IA — nó Respond to Webhook, Respond With: First Incoming Item.

Respostas para a IA:
- Sucesso: `{ ok: true, total: N, horarios: ["2026-07-15T09:30:00.000-03:00", ...] }`
- Cal indisponível: `{ ok: false, motivo: "erro_ao_consultar_agenda", horarios: [] }`
- Agenda lotada ou bloqueada: `{ ok: false, motivo: "sem_horario_disponivel", horarios: [] }`

O checkpoint trata o ok:false avisando que vai confirmar a agenda e retornar, sem inventar horário.

---

## TOOL 2 — Agendar Reunião  (handle: @agendar_reuniao)

Lado AWSales (Nova Tool HTTP):
- Método: POST
- URL: https://n8n.nonprod.awsales.io/webhook/tintim-cal-agendar
- Headers: nenhum
- Query params: nenhum
- Body Schema (6 campos, todos Fonte IA):
  - start (String, obrigatório): "Use exatamente o horário que o lead escolheu, como veio na consulta. Não reformatar."
  - nome (String, obrigatório): "Nome do lead. Priorizar nome completo; não inventar sobrenome."
  - email (String, obrigatório): "E-mail do lead, coletado e confirmado antes de agendar."
  - telefone (String, obrigatório): "Telefone do lead com código do país e DDD, só números, sem espaços ou símbolos. Exemplo: 5511999999999. Use o número do WhatsApp do próprio atendimento."
  - empresa (String, opcional): "Nome da agência ou empresa do lead, como ele informou na qualificação. Se ele não informou, deixe em branco; não invente."
  - tomador_decisao (String, opcional): "Resposta do lead sobre ser o tomador de decisão da parceria, usando exatamente um destes valores: Sim; Não; Não, mas vou garantir que o tomador de decisão esteja na chamada. Se o lead não respondeu, deixe em branco. Nunca deduza a partir do cargo ou do perfil dele."
- Descrição para IA: "Use esta tool para marcar a reunião no horário que o lead escolheu, depois de já ter consultado os horários. Chame apenas quando o lead já escolheu um horário e você tem nome e e-mail confirmados."

Fluxo n8n "Tintim | Cal - Agendar Reunião":

```
Recebe pedido (AWSales) -> Monta body do booking -> Agenda no Cal.com -> Monta confirmação -> Responde pra IA
```

1. Recebe pedido (AWSales) — nó Webhook, POST, path tintim-cal-agendar, Respond: Using 'Respond to Webhook' Node.
2. Monta body do booking — nó Code NOVO (2026-07-20), inserido entre o Webhook e o HTTP Request. Existe porque o event type do time tem campos obrigatórios que precisam de normalização antes de ir para o Cal: telefone em E.164 e o select do tomador de decisão em texto exato.

O nome precisa ser "Monta body do booking", não "Monta body": já existe um nó "Monta body" no fluxo do Kommo, no mesmo canvas, e nome repetido quebra as referências `$('...')`.
Código canônico (conferido contra o export real do n8n em 2026-07-22): `Agendar Reunião/Monta body do booking.js`.

Além do que já estava documentado (normalizar telefone em E.164 e o select do tomador de decisão em texto exato), o export de 2026-07-22 mostra duas coisas a mais que o nó faz e que não estavam neste doc:
- Preenche `bookingFieldsResponses.title` com `Análise de Parceria IA - {empresa}`, para o closer ver a empresa já no título do booking.
- Expande o `metadata` para `{ src, phone, empresa, tomador }` (antes só `{ src }`), guardando uma cópia dos dados do lead na reunião para relatório/rastreio.
3. Agenda no Cal.com — nó HTTP Request:
   - POST https://api.cal.com/v2/bookings
   - Headers: Authorization = Bearer {API key cal_live_...}; cal-api-version = 2024-08-13
   - Body Content Type: RAW. Content Type: `application/json`. Body: `{{ $json.bodyJson }}`
   - Mesmo motivo do fluxo do Kommo: o campo JSON do n8n re-parseia e quebra com objeto aninhado. Com RAW vai exatamente a string do JSON.stringify.
   - Settings -> On Error: Continue (passa o erro pela saída normal, sem quebrar o fluxo).
4. Monta confirmação — nó Code:
Código canônico (conferido contra o export real do n8n em 2026-07-22): `Agendar Reunião/Monta confirmação.js`.

Diferença do que estava documentado: a regex que classifica `dados_incompletos` NÃO inclui mais `no_show`. Hoje é `/booking field|required|invalid|phone|email|responses|not found/i`. Um erro do Cal contendo 'no_show' portanto cai em `horario_indisponivel`, não em `dados_incompletos`.
Por que separar o motivo: antes, qualquer erro virava horario_indisponivel e o checkpoint mandava consultar horários de novo. Com campo obrigatório faltando isso vira laço infinito, porque repropor horário não conserta dado ausente. Agora dados_incompletos manda a Clara encaminhar para humano.

5. Responde pra IA — nó Respond to Webhook, Respond With: First Incoming Item.

Respostas para a IA:
- Sucesso: `{ ok: true, uid, inicio: "16/07/2026 às 10:30", link_reuniao: "https://meet.google.com/...", consultor: "Pamela Lisboa", status: "accepted" }`
- Horário ocupado: `{ ok: false, motivo: "horario_indisponivel", detalhe: "..." }`
- Dado obrigatório recusado pelo Cal: `{ ok: false, motivo: "dados_incompletos", detalhe: "..." }`

Observação: o link da chamada depende do app padrão do closer sorteado (locations = organizersDefaultApp), então não é garantido que venha meetingUrl. O fallback para o link do booking no Cal evita mandar link vazio ao lead.

---

## TOOL 3 — Cancelar Reunião  (handle: @cancelar_reuniao)

Construída e validada ponta a ponta em 2026-07-22: AWSales -> n8n -> Cal cancelou de verdade (booking de teste virou status cancelled; a tool devolveu { ok: true }).

Lado AWSales (Nova Tool HTTP):
- Conexão: Tintim - Gateway n8n (auth Nenhuma).
- Método: POST
- URL: https://n8n.nonprod.awsales.io/webhook/tintim-cal-cancelar
- Headers e Query params: nenhum
- Body Schema (1 campo, Fonte IA):
  - uid (String, obrigatório): "uid da reunião que o lead quer cancelar. Use exatamente o valor de {{metadata.meeting.uid}}, que veio na metadata do evento que abriu a campanha. Nunca invente nem monte esse valor."
- Descrição para IA: "Cancela a reunião atual do lead. Use quando o lead confirmar que quer cancelar, ou logo depois de remarcar (após já ter agendado o novo horário) para cancelar a reunião anterior. Não usar para nenhuma outra finalidade."
- Mapeamento de resposta: não obrigatório (a tool devolve { ok }); mapear só se o checkpoint precisar confirmar o desfecho.

Fluxo n8n "Tintim | Cal - Cancelar Reunião":

```
Recebe pedido (AWSales) -> Cancela no Cal.com -> Monta resposta -> Responde pra IA
```

1. Recebe pedido (AWSales) — nó Webhook, POST, path tintim-cal-cancelar, Respond: Using 'Respond to Webhook' Node. Recebe { uid } em $json.body.
2. Cancela no Cal.com — nó HTTP Request:
   - POST https://api.cal.com/v2/bookings/{{ $json.body.uid }}/cancel
   - Headers: Authorization = Bearer {API key cal_live_...}; cal-api-version = 2024-08-13
   - Body: JSON -> { "cancellationReason": "Cancelado pelo lead pela IA" }
   - Settings -> On Error: Continue (o erro passa pela saída normal para o Monta resposta tratar).
3. Monta resposta — nó Code. Interpreta a resposta do Cal. Código canônico: `Cancelar Reunião/Monta resposta.js`.
4. Responde pra IA — nó Respond to Webhook, Respond With: First Incoming Item.

Atenção aos nomes reais no canvas (export de 2026-07-30): este fluxo ficou com os nomes default do n8n — `Webhook2`, `Cancela no Cal.com`, `Monta resposta1`, `Respond to Webhook1` — e sem sticky note de grupo. O `.js` está salvo como `Monta resposta.js` (nome bom); ao copiar, o nó de destino é o `Monta resposta1`. Renomear os nós no n8n para casar com esta doc.

Respostas para a IA:
- Sucesso: `{ ok: true }`
- Já estava cancelada: `{ ok: true, ja_cancelada: true }` — idempotente. Cancelar um booking já cancelado devolve 400 no Cal ("has been cancelled already"), mas o objetivo já foi atingido, então tratamos como sucesso.
- Falha real: `{ ok: false, detalhe: "..." }`

Como referenciar no checkpoint (formato @tool):
- Utilize a tool para cancelar a reunião @cancelar_reuniao

Regra de ordem no reagendamento (checkpoint do Lembrete): agendar o novo horário primeiro, só depois cancelar o anterior, para o lead nunca ficar sem reunião. O loop fecha pelo integracao-cal: o cancelamento dispara BOOKING_CANCELLED, que volta e encerra a reunião/lembretes na AWSales.

---

## Variáveis mapeadas na AWSales (Tela 3 — usar no checkpoint)

Mapeadas em 2026-07-14 na aba de Mapeamento de Resposta de cada tool. A AWSales recebe a resposta na raiz, então o Caminho na resposta é o nome do campo direto.

De `agendar_reuniao`:
- `agendamento_ok` <- `ok` (true/false; a IA decide o próximo passo por ele)
- `link_reuniao` <- `link_reuniao` (link da videochamada; enviar ao lead pelo WhatsApp)
- `horario_reuniao` <- `inicio` (data/hora local já formatada, ex: 16/07/2026 às 10:30)
- `id_reuniao` <- `uid` (id do booking; útil pra lembrete e pra gravar no Kommo)
- `consultor_reuniao` <- `consultor` (NOVO 2026-07-20; nome do closer que o rodízio atribuiu, para a Clara dizer com quem é a reunião)
- `motivo_falha_agendamento` <- `motivo` (NOVO 2026-07-20; horario_indisponivel ou dados_incompletos, para a Clara escolher entre repropor horário e escalar)

De `consultar_horarios_disponiveis`:
- `horarios_disponiveis` <- `horarios` (lista de horários pra IA propor 2-3)

No checkpoint, referenciar como `{{link_reuniao}}`, `{{horario_reuniao}}`, `{{agendamento_ok}}`, `{{id_reuniao}}`, `{{horarios_disponiveis}}` conforme a lógica de cada etapa.

## Como referenciar no checkpoint (Fase 2)

Formato obrigatório `Utilize a tool para [ação] @nome_da_tool`:
- Utilize a tool para consultar os horários disponíveis @consultar_horarios_disponiveis
- Utilize a tool para agendar a reunião @agendar_reuniao

Regras de comportamento a colocar no checkpoint:
- Só agendar depois de coletar e confirmar nome e e-mail do lead.
- Propor 2-3 horários da lista; usar o valor start exatamente como veio.
- Se o agendamento voltar ok:false (motivo horario_indisponivel), avisar que o horário não está mais livre e consultar horários de novo.
- Após ok:true, enviar ao lead a confirmação com o inicio e o link_reuniao.

## Migração para a agenda do time (2026-07-20)

Pedido do cliente no grupo: marcar em /team/tintim-parcerias/analise-de-parceria-ia em vez da agenda pessoal do Junior, para distribuir as reuniões entre os closers.

Descoberta feita via API (só GET, com a key existente):
- `GET /v2/teams` -> time Tintim Parcerias, id 11887.
- `GET /v2/teams/11887/event-types` (cal-api-version 2024-06-14) -> Análise de Parceria IA, id 2153406, roundRobin, 30 min, 5 hosts.
- `GET /v2/slots?eventTypeId=2153406` -> retorna slots agregados dos 5 closers. Validado.
- O POST de teste não foi executado. `bookingFieldsResponses` é o formato do Cal v2 2024-08-13 para campos customizados, mas precisa ser confirmado na primeira execução real (ver plano de teste).

Checklist da migração:
- [x] n8n, fluxo Consultar Horários: trocar eventTypeId 424760 por 2153406 na query do nó HTTP. Nada mais muda. FEITO em 2026-07-20.
- [x] n8n, fluxo Agendar Reunião: trocar eventTypeId no corpo. FEITO em 2026-07-20, mas sozinho não basta: sem os campos obrigatórios o POST volta 400.
- [x] n8n, fluxo Agendar Reunião: inserir o nó Code "Monta body do booking" entre o Webhook e o HTTP Request. FEITO em 2026-07-20.
- [x] n8n, fluxo Agendar Reunião: nó HTTP passa a Body Content Type RAW com `{{ $json.bodyJson }}` (o eventTypeId agora vive dentro do JSON). FEITO em 2026-07-20.
- [x] n8n, fluxo Agendar Reunião: substituir o Code "Monta confirmação" pela versão com consultor, fallback de link e separação de motivo. FEITO em 2026-07-20.

Lado n8n conferido em 2026-07-20: grafo, nomes de nó e modo RAW validados no JSON exportado, e a lógica do "Monta body do booking" rodada em 9 cenários (telefone com DDI, sem DDI e formatado; decisão com acento, sem acento, frase livre, vazio) sem falha. Falta só o lado AWSales e o teste real contra o Cal.
- [x] AWSales, tool Agendar Reunião: adicionar os 3 campos novos no Body Schema (telefone Req, empresa e tomador_decisao opcionais). FEITO em 2026-07-20.
- [x] AWSales, tool Agendar Reunião: mapear as 2 variáveis novas de resposta (consultor_reuniao, motivo_falha_agendamento). FEITO em 2026-07-20.
- [x] Checkpoint: atualizado e publicado na plataforma em 2026-07-20 (Etapa 3A coleta empresa e decisão, Etapa 4 envia, gates e rodapé).
- [ ] Cancelar os bookings de teste na agenda do Junior e conferir que nada novo cai lá.

Plano de teste (fazer pelo painel da AWSales ou pelo n8n, não por curl, por causa do encoding de acento no Git Bash):
1. Consultar horários. Tem que voltar `ok:true` com horários; comparar com a página pública do time.
2. Agendar com os 6 campos preenchidos, tomador_decisao = "Sim". Esperado `ok:true` com uid, inicio, link_reuniao e consultor preenchido. Conferir no painel do Cal que o card caiu no event type do time e que a empresa, o WhatsApp e a resposta do tomador de decisão apareceram nas respostas do booking. Cancelar depois.
3. Agendar com empresa e tomador_decisao VAZIOS. Esperado `ok:true` com "Não informado" e "Não" no booking. Se voltar `ok:false, dados_incompletos`, o nome de algum slug está errado.
4. Agendar de novo no mesmo horário do teste 2 (se ainda ocupado). Esperado `ok:false, motivo: horario_indisponivel`.

Pontos que ainda dependem do cliente:
- Confirmar que o Junior sai mesmo do circuito: ele não está entre os 5 hosts do event type do time.
- Sugerir ao Jorge adicionar uma opção "Não informado" no select tomadordedecisao, ou desmarcar obrigatório nos 3 campos. Hoje, quando o lead não responde, o n8n manda "Não" como fallback, o que subdimensiona o lead para o closer. É o único ponto do fluxo onde a integração preenche algo que o lead não disse.

## Pendências / hardening

- Ativar os workflows no n8n (produção só responde com o workflow ativo).
- Segurança: hoje os webhooks não têm auth e a API key do Cal está direto no header do nó HTTP. Para produção: proteger os webhooks com header secreto e mover a key para um Credential do n8n (Header Auth).
- A key é pessoal do Junior. Se ele sair do time 11887, as duas tools param. Pedir uma key de owner do time ou conta de serviço.
- Cancelar os bookings de teste criados na validação (João Teste).
- Se um dia a reunião for a "Demonstração do Tintim" (eventTypeId 427607, também do time) em vez da Análise de Parceria IA, conferir a disponibilidade daquele event type antes: ele está com 0 hosts.
