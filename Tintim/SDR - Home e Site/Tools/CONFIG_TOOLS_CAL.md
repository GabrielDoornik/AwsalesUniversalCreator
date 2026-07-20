# Configuração de Tools — Cal.com via Gateway n8n (SDR Tintim)

Status: IMPLEMENTADO e testado ponta a ponta em 2026-07-14 (AWSales -> n8n -> Cal.com). Duas tools funcionando: consultar horários e agendar reunião (com tratamento de erro de horário ocupado).

Arquitetura: a tool da AWSales aponta para um webhook do n8n, e o n8n chama o Cal.com. Isso mantém a API key do Cal server-side, monta o corpo aninhado que a AWSales não montaria e permite tratar erros. Decidido em 2026-07-14 (a pedido do Jorge, que não consegue limitar o escopo da key).

## Dados fixos da integração

- Event type usado: Reunião de 30 min, eventTypeId 424760 (agenda do Junior Faria, junior.faria@codevance.com.br, username junior-faria).
- Timezone: America/Sao_Paulo.
- cal-api-version: slots = 2024-09-04; bookings = 2024-08-13.
- API base do Cal: https://api.cal.com/v2
- Base dos webhooks n8n: https://n8n.nonprod.awsales.io/webhook/

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
   - Headers: Authorization = Bearer {API key cal_live_...}; cal-api-version = 2024-09-04
   - Query: eventTypeId = 424760; timeZone = America/Sao_Paulo; start = `{{ $now.setZone('America/Sao_Paulo').toFormat('yyyy-MM-dd') }}`; end = `{{ $now.setZone('America/Sao_Paulo').plus({ days: 14 }).toFormat('yyyy-MM-dd') }}`
   - Settings -> On Error: Continue (senão o Cal fora do ar devolve 500 cru para a IA)
3. Achata e organiza horários — nó Code (trata erro do Cal e agenda vazia; robustez aplicada em 2026-07-15):
```javascript
const r = $input.first().json;

if (!r || r.status !== 'success') {
  return [{ json: { ok: false, motivo: 'erro_ao_consultar_agenda', horarios: [] } }];
}

const data = r.data || {};
const horarios = [];
for (const dia of Object.keys(data).sort()) {
  const slots = (data[dia] || []).map(s => s.start);
  if (slots.length <= 3) {
    horarios.push(...slots);
  } else {
    const meio = Math.floor(slots.length / 2);
    horarios.push(slots[0], slots[meio], slots[slots.length - 1]); // manhã, meio, tarde
  }
}
const lista = horarios.slice(0, 15);

if (lista.length === 0) {
  return [{ json: { ok: false, motivo: 'sem_horario_disponivel', horarios: [] } }];
}

return [{ json: { ok: true, total: lista.length, horarios: lista } }];
```
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
- Body Schema (3 campos, todos Fonte IA, obrigatórios):
  - start (String): "Use exatamente o horário que o lead escolheu, como veio na consulta. Não reformatar."
  - nome (String): "Nome do lead. Priorizar nome completo; não inventar sobrenome."
  - email (String): "E-mail do lead, coletado e confirmado antes de agendar."
- Descrição para IA: "Use esta tool para marcar a reunião no horário que o lead escolheu, depois de já ter consultado os horários. Chame apenas quando o lead já escolheu um horário e você tem nome e e-mail confirmados."

Fluxo n8n "Tintim | Cal - Agendar Reunião":

1. Recebe pedido (AWSales) — nó Webhook, POST, path tintim-cal-agendar, Respond: Using 'Respond to Webhook' Node.
2. Agenda no Cal.com — nó HTTP Request:
   - POST https://api.cal.com/v2/bookings
   - Headers: Authorization = Bearer {API key cal_live_...}; cal-api-version = 2024-08-13
   - Body (JSON):
```json
{
  "start": "{{ $json.body.start }}",
  "eventTypeId": 424760,
  "attendee": {
    "name": "{{ $json.body.nome }}",
    "email": "{{ $json.body.email }}",
    "timeZone": "America/Sao_Paulo",
    "language": "pt-BR"
  },
  "metadata": { "src": "ia-awsales" }
}
```
   - Settings -> On Error: Continue (passa o erro pela saída normal, sem quebrar o fluxo).
3. Monta confirmação — nó Code:
```javascript
const item = $input.first().json || {};
const d = item.data || {};

if (item.status === 'success' && d.uid) {
  let inicioLocal = null;
  if (d.start) {
    inicioLocal = DateTime.fromISO(d.start, { zone: 'utc' })
      .setZone('America/Sao_Paulo')
      .toFormat("dd/MM/yyyy 'às' HH:mm");
  }
  return [{ json: {
    ok: true,
    uid: d.uid,
    inicio: inicioLocal,
    link_reuniao: d.meetingUrl || d.location || null,
    status: d.status
  } }];
}

const msg = (item.error && (item.error.message || item.error)) || item.message || 'nao_foi_possivel_agendar';
return [{ json: { ok: false, motivo: 'horario_indisponivel', detalhe: String(msg).slice(0, 200) } }];
```
4. Responde pra IA — nó Respond to Webhook, Respond With: First Incoming Item.

Respostas para a IA:
- Sucesso: `{ ok: true, uid, inicio: "16/07/2026 às 10:30", link_reuniao: "https://meet.google.com/...", status: "accepted" }`
- Falha (horário ocupado ou outro erro do Cal): `{ ok: false, motivo: "horario_indisponivel", detalhe: "..." }`

Observação: o Cal gera link do Google Meet automático (meetingUrl). A IA pode enviar esse link ao lead pelo WhatsApp, além do convite por e-mail.

---

## Variáveis mapeadas na AWSales (Tela 3 — usar no checkpoint)

Mapeadas em 2026-07-14 na aba de Mapeamento de Resposta de cada tool. A AWSales recebe a resposta na raiz, então o Caminho na resposta é o nome do campo direto.

De `agendar_reuniao`:
- `agendamento_ok` <- `ok` (true/false; a IA decide o próximo passo por ele)
- `link_reuniao` <- `link_reuniao` (link do Google Meet; enviar ao lead pelo WhatsApp)
- `horario_reuniao` <- `inicio` (data/hora local já formatada, ex: 16/07/2026 às 10:30)
- `id_reuniao` <- `uid` (id do booking; útil pra lembrete e pra gravar no Kommo)

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

## Pendências / hardening

- Ativar os workflows no n8n (produção só responde com o workflow ativo).
- Segurança: hoje os webhooks não têm auth e a API key do Cal está direto no header do nó HTTP. Para produção: proteger os webhooks com header secreto e mover a key para um Credential do n8n (Header Auth).
- Cancelar os bookings de teste criados na validação (João Teste).
- Se um dia a reunião for a "Demonstração do Tintim" (eventTypeId 476545) em vez da de 30 min, configurar a disponibilidade daquele event type no Cal antes (hoje está sem agenda).
