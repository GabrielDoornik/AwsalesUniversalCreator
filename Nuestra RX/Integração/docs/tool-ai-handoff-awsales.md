# Tool AWSales -> Nuestra RX: AI Handoff

## Resumo simples

Sim, provavelmente vamos precisar criar uma tool na AWSales para o endpoint de `ai-handoff`.

Essa tool nao substitui o webhook de input da campanha. Ela serve para o outro sentido da integracao:

- Input normalizado: forms-site/Nuestra RX -> n8n -> AWSales.
- Tool `ai-handoff`: AWSales/IA no WhatsApp -> Nuestra RX.

## Quando usar

A IA deve usar essa tool quando o lead continuar a avaliacao pelo WhatsApp e a IA tiver coletado as informacoes necessarias para devolver a avaliacao para a Nuestra RX.

Exemplos:

- Lead abandonou o formulario e prefere continuar no WhatsApp.
- A IA coletou ou confirmou as respostas clinicas.
- A IA precisa enviar essas respostas para a Nuestra RX criar/atualizar a sessao e gerar checkout.

Nao usar essa tool apenas porque o lead clicou em "Continuar la atencion por WhatsApp con un agente". Nesse clique o site ja abre o WhatsApp sozinho; a pessoa chega receptiva para a IA.

## Configuracao da tool

Nome sugerido:

`Enviar avaliacao Nuestra RX`

Handle sugerido:

`@enviar_avaliacao_nuestra_rx`

Metodo:

`POST`

Endpoint:

`https://webhook.nuestrarx.com/ai-handoff`

Autenticacao:

`Authorization: Bearer <AI_HANDOFF_SECRET>`

Content-Type:

`application/json`

## Tela 1 da tool na AWSales

Campo `Nome da Tool`:

`Enviar avaliação Nuestra RX`

Campo `Descrição (para a IA)`:

`Use esta tool somente no final, quando o lead quiser gerar checkout e quando todos os dados obrigatórios já estiverem disponíveis em metadata, form_answers ou na conversa. Antes de chamar, confirme que contact tem first_name, last_name, email, phone e lead_state, e que answers contém os IDs mínimos: 6400, 6401, 6402, 6403, 6404, 6406, 6407, 6408, 6410, 6411, 6415, 6416, 6417, 6418, 6431, 6432 e 6433. Não chame esta tool se faltar qualquer campo; pergunte o dado faltante ao lead primeiro. Não envie só as respostas coletadas no WhatsApp; use também os dados já salvos em metadata e form_answers. A tool envia a avaliação para a Nuestra RX e pode retornar checkout_url.`

## Tela 2 da tool na AWSales

Campo `Método`:

`POST`

Campo `URL do Endpoint`:

`https://webhook.nuestrarx.com/ai-handoff`

Headers customizados:

- `Content-Type`: `application/json`

Não adicionar `Authorization` manualmente se a conexão já estiver configurada como `Bearer Token`.

Query parameters:

Não adicionar nenhum.

Body Schema no formato real da AWSales:

Use este JSON na configuração da tool. Ele é o formato de lista de campos que a tela da AWSales transforma no modo Formulário.

```json
[
  {
    "name": "product",
    "type": "string",
    "input_type": "llm",
    "fixed_type": "hardcoded",
    "value": "",
    "enum_values": [],
    "description": "Produto escolhido pelo lead. Use exatamente semaglutide ou tirzepatide.",
    "required": true,
    "dependency_tool": "",
    "dependency_field": ""
  },
  {
    "name": "plan",
    "type": "string",
    "input_type": "llm",
    "fixed_type": "hardcoded",
    "value": "",
    "enum_values": [],
    "description": "Plano escolhido pelo lead. Use monthly, quarterly ou rush conforme a oferta.",
    "required": true,
    "dependency_tool": "",
    "dependency_field": ""
  },
  {
    "name": "contact",
    "type": "object",
    "input_type": "llm",
    "fixed_type": "hardcoded",
    "value": "",
    "enum_values": [],
    "description": "Dados do lead. Inclua first_name, last_name, email, phone, lead_state, gender e birthday em MM/DD/YYYY. Se só tiver date_of_birth, envie também. Use metadata e lead para preencher campos já existentes.",
    "required": true,
    "dependency_tool": "",
    "dependency_field": ""
  },
  {
    "name": "answers",
    "type": "object",
    "input_type": "llm",
    "fixed_type": "hardcoded",
    "value": "",
    "enum_values": [],
    "description": "Respostas novas ou confirmadas na conversa, por ID da pergunta Nuestra RX. Exemplo: {\"6415\":{\"value\":\"No\",\"question\":\"Gastric bypass\"}}. Para 6416 use None of the above quando não houver alergia GLP-1. Para 6417 use None of these quando não houver uso prévio de GLP-1. Não precisa recriar tudo se metadata e form_answers forem enviados.",
    "required": true,
    "dependency_tool": "",
    "dependency_field": ""
  },
  {
    "name": "metadata",
    "type": "object",
    "input_type": "llm",
    "fixed_type": "hardcoded",
    "value": "",
    "enum_values": [],
    "description": "Copie o objeto metadata completo disponível no contexto do lead/campanha. É obrigatório enviar para reaproveitar estado, sexo, data de nascimento, altura, peso, BMI, etapa de abandono e links.",
    "required": true,
    "dependency_tool": "",
    "dependency_field": ""
  },
  {
    "name": "form_answers",
    "type": "object",
    "input_type": "llm",
    "fixed_type": "hardcoded",
    "value": "",
    "enum_values": [],
    "description": "Copie a lista form_answers completa disponível no contexto do lead/campanha. Mesmo sendo lista, se a AWSales não aceitar tipo array, envie como objeto/JSON válido com os itens da lista.",
    "required": true,
    "dependency_tool": "",
    "dependency_field": ""
  },
  {
    "name": "source",
    "type": "object",
    "input_type": "llm",
    "fixed_type": "hardcoded",
    "value": "",
    "enum_values": [],
    "description": "Origem da coleta. Use channel=whatsapp, agent=awsales-bot e captured_at em ISO.",
    "required": true,
    "dependency_tool": "",
    "dependency_field": ""
  }
]
```

## Teste manual da tool na AWSales

Objetivo do primeiro teste: validar autenticacao, endpoint e formato basico usando o `sample_request.json` recebido da Nuestra RX.

Campo `product`:

```text
semaglutide
```

Campo `plan`:

```text
rush
```

Se o endpoint reclamar do plano, repetir o teste com:

```text
monthly
```

Campo `contact`:

```json
{"first_name":"Maria","last_name":"Lopez","email":"maria.lopez.test+20260528@nuestrarx-test.com","phone":"+13055551234","lead_state":"FL","gender":"Female","date_of_birth":"1985-03-15","shipping_address":{"line1":"123 Brickell Ave","city":"Miami","state":"FL","postal_code":"33131","country":"US"}}
```

Campo `answers`:

```json
{"6400":"None","6401":"None","6402":"None","6403":"Female","6404":"No","6405":"I acknowledge that I have read and understood the above information","6406":"200","6407":"5'6\"","6408":"180","6409":"I acknowledge that I have read and understood the above information","6410":"Some efforts","6411":["None of the above"],"6415":"No","6416":["None of the above"],"6417":["None of these"],"6418":"Yes, I can inject myself or have reliable help","6430":"","6431":"I have read and understand the above information and I do consent and wish to move forward with this treatment plan","6432":"I have read the above information and I do consent and wish to move forward","6433":"I have read and understand the above information and I wish to continue"}
```

Campo `source`:

```json
{"channel":"whatsapp","agent":"awsales-bot-test","captured_at":"2026-05-28T18:00:00Z"}
```

Resultado esperado:

```json
{
  "ok": true,
  "session_id": "...",
  "lead_id": "...",
  "checkout_url": "...",
  "product": "semaglutide",
  "plan": "...",
  "tenant_id": 64
}
```

### Diagnostico do teste via modo Formulario

No teste com webhook debug do n8n, a AWSales enviou `contact`, `answers` e `source` como strings JSON escapadas:

```json
{
  "contact": "{\"first_name\":\"Maria\"}",
  "answers": "{\"6400\":\"None\"}",
  "source": "{\"channel\":\"whatsapp\"}"
}
```

Esse formato faz o endpoint real `/ai-handoff` responder `400`, porque ele espera objetos JSON reais:

```json
{
  "contact": {
    "first_name": "Maria"
  },
  "answers": {
    "6400": "None"
  },
  "source": {
    "channel": "whatsapp"
  }
}
```

Proximo ajuste recomendado: tentar configurar o Body Schema pelo modo `JSON` em vez de `Formulario`. Se a AWSales continuar stringificando objetos, usar um adapter n8n entre a tool e a Nuestra RX para fazer `JSON.parse` nesses campos antes de repassar para `https://webhook.nuestrarx.com/ai-handoff`.

### Adapter n8n recomendado

Se a AWSales continuar enviando objetos como string, usar este fluxo:

`AWSales Tool -> Webhook n8n -> Code Parse Body -> HTTP Request Nuestra RX`

Webhook n8n:

- Method: `POST`
- Path sugerido: `nuestra-rx-ai-handoff-adapter`
- Respond: `When Last Node Finishes`

Code node `Parse Body`:

Fonte atual para copiar no n8n:

`Nuestra RX/Integração/docs/tool-ai-handoff-normalizer.n8n.js`

Use esse arquivo `.js` como fonte de verdade. O normalizador precisa reaproveitar `metadata` e `form_answers`, converter pesos para número sem unidade e preencher respostas obrigatórias antes do HTTP.

```js
function parseMaybeJson(value) {
  if (typeof value !== 'string') return value;

  const trimmed = value.trim();
  if (!trimmed) return value;

  try {
    return JSON.parse(trimmed);
  } catch (error) {
    return value;
  }
}

function normalizeProduct(value) {
  const raw = String(value || '').trim().toLowerCase();

  const map = {
    semaglutida: 'semaglutide',
    semaglutide: 'semaglutide',
    tirzepatida: 'tirzepatide',
    tirzepatide: 'tirzepatide',
  };

  return map[raw] || value;
}

function normalizePlan(value) {
  const raw = String(value || '').trim().toLowerCase();

  const map = {
    mensual: 'monthly',
    monthly: 'monthly',
    '1_month': 'monthly',
    '1_months': 'monthly',
    trimestral: 'quarterly',
    quarterly: 'quarterly',
    '3_month': 'quarterly',
    '3_months': 'quarterly',
    '3_month_plan': 'quarterly',
    '3_months_plan': 'quarterly',
    '3 month plan': 'quarterly',
    '3 months plan': 'quarterly',
    '3 meses': 'quarterly',
    'plan de 3 meses': 'quarterly',
    rush: 'rush',
  };

  return map[raw] || value;
}

function normalizeGender(value) {
  const raw = String(value || '').trim().toLowerCase();

  const map = {
    m: 'Male',
    male: 'Male',
    hombre: 'Male',
    masculino: 'Male',
    f: 'Female',
    female: 'Female',
    mujer: 'Female',
    femenino: 'Female',
    other: 'Other',
    otro: 'Other',
  };

  return map[raw] || value;
}

function isBlank(value) {
  if (value === null || value === undefined) return true;
  if (typeof value === 'string') return value.trim() === '';
  return false;
}

function firstNonBlank(values) {
  for (const value of values) {
    if (!isBlank(value)) return value;
  }

  return undefined;
}

function splitFullName(value) {
  const parts = String(value || '').trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return {};

  return {
    first_name: parts[0],
    last_name: parts.slice(1).join(' '),
  };
}

function normalizeContact(body) {
  const contact = parseMaybeJson(body.contact) || {};
  const splitName = splitFullName(firstNonBlank([contact.name, contact.full_name, body.name, body.full_name]));
  const shippingAddress = parseMaybeJson(contact.shipping_address) || contact.shipping_address;

  return {
    ...contact,
    first_name: firstNonBlank([contact.first_name, contact.firstName, contact.firstname, body.first_name, body.firstName, splitName.first_name]),
    last_name: firstNonBlank([contact.last_name, contact.lastName, contact.lastname, body.last_name, body.lastName, splitName.last_name]),
    email: firstNonBlank([contact.email, body.email]),
    phone: firstNonBlank([contact.phone, contact.phone_e164, contact.phoneE164, body.phone, body.phone_e164, body.phoneE164]),
    lead_state: firstNonBlank([
      contact.lead_state,
      contact.leadState,
      contact.state,
      contact.state_code,
      contact.stateCode,
      body.lead_state,
      body.leadState,
      body.state,
      body.state_code,
      body.stateCode,
      shippingAddress && shippingAddress.state,
    ]),
    gender: normalizeGender(firstNonBlank([contact.gender, contact.sex, contact.biological_sex, body.gender, body.sex, body.biological_sex])),
    date_of_birth: firstNonBlank([contact.date_of_birth, contact.dateOfBirth, contact.dob, body.date_of_birth, body.dateOfBirth, body.dob]),
    shipping_address: shippingAddress,
  };
}

function getMissingRequiredContactFields(contact) {
  return ['first_name', 'last_name', 'email', 'phone', 'lead_state'].filter((field) => isBlank(contact[field]));
}

function normalizeYesNo(value) {
  if (value === true) return 'Yes';
  if (value === false) return 'No';

  const raw = String(value ?? '').trim().toLowerCase();

  if (['yes', 'si', 'sí', 'y', 'true'].includes(raw)) return 'Yes';
  if (['no', 'n', 'false'].includes(raw)) return 'No';

  return value;
}

function normalizeInjectionAbility(value) {
  const normalized = normalizeYesNo(value);

  if (normalized === 'Yes') return 'Yes, I can inject myself or have reliable help';
  if (normalized === 'No') return "No, I'd need an oral option instead (Direct to oral formulation or disqualified if not offered)";

  return value;
}

function normalizeApproach(value) {
  const raw = String(value ?? '').trim().toLowerCase();

  const map = {
    active: 'Actively managing',
    actively_managing: 'Actively managing',
    'actively managing': 'Actively managing',
    some_efforts: 'Some efforts',
    'some efforts': 'Some efforts',
    attempted: 'Some efforts',
    no_active_efforts: 'No active efforts',
    'no active efforts': 'No active efforts',
    none: 'No active efforts',
  };

  return map[raw] || value;
}

function toArray(value) {
  if (Array.isArray(value)) return value;
  if (value === null || value === undefined || value === '') return [];
  return [value];
}

function normalizeMedicalConditions(value) {
  const values = toArray(value);
  const output = [];

  const map = {
    none: 'None of the above',
    no: 'None of the above',
    ninguno: 'None of the above',
    ninguna: 'None of the above',
    noneoftheabove: 'None of the above',
    gallstonesasymptomatic: 'Current gallstones without symptoms',
    currentgallstoneswithoutsymptoms: 'Current gallstones without symptoms',
    currentgallstones: 'Current gallstones without symptoms',
    gallstones: 'Current gallstones without symptoms',
    symptomaticgallstones: 'Current symptomatic gallstones',
    currentsymptomaticgallstones: 'Current symptomatic gallstones',
    cholecystectomy: 'Past removal of your gallbladder',
    gallbladderremoved: 'Past removal of your gallbladder',
    pastremovalofyourgallbladder: 'Past removal of your gallbladder',
    thyroid: 'Hypothyroidism, Hyperthyroidism, or Thyroid Issues',
    thyroidissues: 'Hypothyroidism, Hyperthyroidism, or Thyroid Issues',
    hypothyroidism: 'Hypothyroidism, Hyperthyroidism, or Thyroid Issues',
    hyperthyroidism: 'Hypothyroidism, Hyperthyroidism, or Thyroid Issues',
  };

  for (const item of values) {
    const compact = String(item ?? '').replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
    const mapped = map[compact] || item;
    if (mapped && !output.includes(mapped)) output.push(mapped);
  }

  return output.length ? output : ['None of the above'];
}

function normalizeGlpAllergies(value) {
  const values = toArray(value);
  const output = [];

  const map = {
    none: 'None of the above',
    no: 'None of the above',
    ninguno: 'None of the above',
    ninguna: 'None of the above',
    noneoftheabove: 'None of the above',
    ozempic: 'Ozempic (Semaglutide)',
    semaglutide: 'Ozempic (Semaglutide)',
    semaglutida: 'Ozempic (Semaglutide)',
    mounjaro: 'Mounjaro (Tirzepatide)',
    tirzepatide: 'Mounjaro (Tirzepatide)',
    tirzepatida: 'Mounjaro (Tirzepatide)',
    wegovy: 'Wegovy (Semaglutide)',
    zepbound: 'Zepbound (Tirzepatide)',
    saxenda: 'Saxenda (Liraglutide)',
    trulicity: 'Trulicity (dulaglutide)',
  };

  for (const item of values) {
    const compact = String(item ?? '').replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
    const mapped = map[compact] || item;
    if (mapped && !output.includes(mapped)) output.push(mapped);
  }

  return output.length ? output : ['None of the above'];
}

function normalizePriorGlp1Use(value) {
  const values = toArray(value);
  const output = [];

  const map = {
    none: 'None of these',
    no: 'None of these',
    ninguno: 'None of these',
    ninguna: 'None of these',
    noneofthese: 'None of these',
    semaglutide: 'Semaglutide (Ozempic, Wegovy, Rybelsus)',
    semaglutida: 'Semaglutide (Ozempic, Wegovy, Rybelsus)',
    ozempic: 'Semaglutide (Ozempic, Wegovy, Rybelsus)',
    wegovy: 'Semaglutide (Ozempic, Wegovy, Rybelsus)',
    rybelsus: 'Semaglutide (Ozempic, Wegovy, Rybelsus)',
    tirzepatide: 'Tirzepatide (Zepbound, Mounjaro)',
    tirzepatida: 'Tirzepatide (Zepbound, Mounjaro)',
    zepbound: 'Tirzepatide (Zepbound, Mounjaro)',
    mounjaro: 'Tirzepatide (Zepbound, Mounjaro)',
  };

  for (const item of values) {
    const compact = String(item ?? '').replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
    const mapped = map[compact] || item;
    if (mapped && !output.includes(mapped)) output.push(mapped);
  }

  return output.length ? output : ['None of these'];
}

function formatHeightFromCm(value) {
  const cm = Number(value);
  if (!Number.isFinite(cm) || cm <= 0) return value;

  const totalInches = Math.round(cm / 2.54);
  const feet = Math.floor(totalInches / 12);
  const inches = totalInches % 12;

  return `${feet}'${inches}"`;
}

function formatLbsFromKg(value) {
  const kg = Number(value);
  if (!Number.isFinite(kg) || kg <= 0) return value;

  return String(Math.round(kg * 2.2046226218));
}

function getAnswerValue(entry) {
  if (entry && typeof entry === 'object' && Object.prototype.hasOwnProperty.call(entry, 'value')) {
    return entry.value;
  }

  return entry;
}

function setAnswer(target, id, value) {
  if (value === null || value === undefined || value === '') return;
  target[String(id)] = { value };
}

function normalizeAnswers(value) {
  const input = parseMaybeJson(value) || {};
  const output = {};

  const aliasToId = {
    medicalconditions: '6400',
    conditionsquick: '6400',
    currentmeds: '6401',
    currentmedications: '6401',
    medications: '6401',
    allergies: '6402',
    allergieslist: '6402',
    biologicalsex: '6403',
    sex: '6403',
    gender: '6403',
    pregnancy: '6404',
    highestweight: '6406',
    heightdisplay: '6407',
    height: '6407',
    heightcm: '6407',
    weightlbs: '6408',
    weight: '6408',
    weightkg: '6408',
    bmiconsent: '6409',
    approach: '6410',
    conditions: '6411',
    gastricbypass: '6415',
    drugallergies: '6416',
    glpallergies: '6416',
    priorglp1use: '6417',
    injectionability: '6418',
    othersquestions: '6430',
    otherquestions: '6430',
  };

  for (const [key, entry] of Object.entries(input)) {
    const value = getAnswerValue(entry);
    const compactKey = String(key).replace(/[^a-zA-Z0-9]/g, '').toLowerCase();

    if (/^\d+$/.test(String(key))) {
      setAnswer(output, key, normalizeAnswerValueById(String(key), value));
      continue;
    }

    if (compactKey === 'finalconsents' || compactKey === 'finalconsent') {
      setAnswer(output, '6431', 'I have read and understand the above information and I do consent and wish to move forward with this treatment plan');
      setAnswer(output, '6432', 'I have read the above information and I do consent and wish to move forward');
      setAnswer(output, '6433', 'I have read and understand the above information and I wish to continue');
      continue;
    }

    const id = aliasToId[compactKey];
    if (!id) continue;

    setAnswer(output, id, normalizeAnswerValueById(id, value));
  }

  return output;
}

function normalizeAnswerValueById(id, value) {
  if (id === '6403') return normalizeGender(value);
  if (id === '6404') return normalizeYesNo(value);
  if (id === '6407' && Number.isFinite(Number(value))) return formatHeightFromCm(value);
  if (id === '6408' && Number.isFinite(Number(value))) return formatLbsFromKg(value);
  if (id === '6410') return normalizeApproach(value);
  if (id === '6411') return normalizeMedicalConditions(value);
  if (id === '6415') return normalizeYesNo(value);
  if (id === '6416') return normalizeGlpAllergies(value);
  if (id === '6417') return normalizePriorGlp1Use(value);
  if (id === '6418') return normalizeInjectionAbility(value);
  if (id === '6431' && normalizeYesNo(value) === 'Yes') return 'I have read and understand the above information and I do consent and wish to move forward with this treatment plan';
  if (id === '6432' && normalizeYesNo(value) === 'Yes') return 'I have read the above information and I do consent and wish to move forward';
  if (id === '6433' && normalizeYesNo(value) === 'Yes') return 'I have read and understand the above information and I wish to continue';

  return value;
}

const body = $json.body || {};
const contact = normalizeContact(body);
const answers = normalizeAnswers(body.answers);
const normalizedGender = normalizeGender(contact.gender);
const missingRequiredContactFields = getMissingRequiredContactFields(contact);

if (!answers['6403'] && normalizedGender) {
  setAnswer(answers, '6403', normalizedGender);
}

const outbound = {
  product: normalizeProduct(body.product),
  plan: normalizePlan(body.plan),
  contact: {
    ...contact,
    gender: normalizedGender,
  },
  answers,
  source: parseMaybeJson(body.source),
};

return [
  {
    json: {
      ...outbound,
      outbound,
      outbound_json: JSON.stringify(outbound),
      diagnostics: {
        ready_for_http: missingRequiredContactFields.length === 0,
        missing_required_contact_fields: missingRequiredContactFields,
      },
    },
  },
];
```

HTTP Request node:

- Method: `POST`
- URL: `https://webhook.nuestrarx.com/ai-handoff`
- Header `Authorization`: `Bearer <AI_HANDOFF_SECRET>`
- Header `Content-Type`: `application/json`
- Body: Raw JSON
- Raw body expression: `{{ $json.outbound_json }}`

Validacao obrigatoria antes do HTTP:

Depois do Code node, adicione um IF:

- Condicao: `{{ $json.should_call_http }} is true`
- Ramo true: chamar o HTTP Request da Nuestra RX usando `{{ $json.outbound_json }}`
- Ramo false: responder para a AWSales com `{{ $json.tool_response_json }}`

Nao chame o HTTP Request se `diagnostics.ready_for_http` for false. Isso evita erro de validacao no endpoint e faz a IA pedir os dados faltantes ao lead.

Depois disso, a URL da tool na AWSales deve apontar para o webhook do adapter n8n, nao diretamente para `https://webhook.nuestrarx.com/ai-handoff`.

### Teste validado do adapter

Resultado do teste:

- AWSales envia `contact`, `answers` e `source` como strings JSON.
- Code node `Parse Body` converte esses campos com `JSON.parse`.
- HTTP Request do n8n envia o body corrigido para `https://webhook.nuestrarx.com/ai-handoff`.
- Endpoint retornou `ok: true` com `checkout_url`.

Resposta real do teste:

```json
{
  "ok": true,
  "session_id": "98172146-1711-4527-8c48-09ea3ef62a7e",
  "lead_id": 246273,
  "checkout_url": "https://buy.nuestrarx.com/checkout?products=3359:1&cc_custom_created=98172146-1711-4527-8c48-09ea3ef62a7e&firstName=Maria&lastName=Lopez&emailAddress=maria.lopez.test%2B20260528%40nuestrarx-test.com&shipState=FL&phoneNumber=3055551234",
  "product": "semaglutide",
  "plan": "rush",
  "tenant_id": 64
}
```

Arquitetura final recomendada:

`AWSales Tool -> n8n adapter -> Nuestra RX /ai-handoff`

Importante: configurar o Webhook do adapter para devolver para a AWSales a resposta final do HTTP Request, incluindo `checkout_url`.

Resposta esperada:

```json
{
  "ok": true,
  "session_id": "...",
  "lead_id": "...",
  "checkout_url": "...",
  "product": "tirzepatide",
  "plan": "monthly",
  "tenant_id": 64
}
```

## Body esperado

Campos principais:

```json
{
  "product": "semaglutide ou tirzepatide",
  "plan": "monthly ou quarterly",
  "contact": {
    "first_name": "Nome",
    "last_name": "Sobrenome",
    "email": "email@exemplo.com",
    "phone": "+13055551234",
    "lead_state": "TX",
    "gender": "Female",
    "date_of_birth": "1985-03-15",
    "shipping_address": {
      "line1": "Endereco",
      "city": "Cidade",
      "state": "TX",
      "postal_code": "00000",
      "country": "US"
    }
  },
  "answers": {
    "6403": {
      "value": "Female",
      "question": "What was your sex assigned at birth?"
    }
  },
  "source": {
    "channel": "whatsapp",
    "agent": "awsales-bot",
    "captured_at": "2026-06-03T00:00:00Z"
  }
}
```

## Ponto de atencao

Existe uma divergencia nos arquivos recebidos:

- `awsales_t64_schema.md` diz que cada resposta deve ir como `{ "value": "...", "question": "..." }`.
- `sample_request.json` mostra respostas simples, tipo `"6403": "Female"`.

Antes de criar a tool em producao, confirmar com o dev da Nuestra RX qual formato o endpoint realmente aceita.

## Como referenciar no checkpoint

Texto sugerido:

`Utilize a tool para enviar a avaliacao completa para a Nuestra RX e gerar o checkout @enviar_avaliacao_nuestra_rx`

Regra sugerida para o checkpoint:

A IA so deve chamar essa tool quando tiver os dados obrigatorios do lead, as respostas clinicas necessarias e o lead tiver confirmado que deseja seguir para o checkout. Se a tool retornar `checkout_url`, envie o link ao lead. Se a tool falhar, nao invente link; informe que houve um problema tecnico e continue a conversa com suporte humano ou tentativa posterior.

## Checkpoint pronto para colar

Use a tool `@enviar_avaliacao_nuestra_rx` quando o lead quiser finalizar a avaliacao pelo WhatsApp e ja tivermos dados suficientes para enviar a avaliacao para a Nuestra RX.

Regras:

- Responda o lead em espanhol.
- Antes de chamar a tool, confirme contato completo: nome, sobrenome, email, telefone, estado e dados de endereco quando necessario.
- Confirme `product` e `plan` conforme a oferta escolhida/configurada.
- Preencha as respostas clinicas no campo `answers`, usando os IDs da Nuestra RX.
- Chame a tool apenas depois que o lead confirmar que deseja seguir para checkout.
- Se faltar alguma resposta obrigatoria, pergunte ao lead antes de chamar a tool.
- Se houver criterio de desqualificacao ou consentimento recusado, nao gere checkout; explique que precisa encaminhar para suporte humano.
- Se a tool retornar `checkout_url`, envie esse link ao lead.
- Se a tool retornar erro ou nao retornar `checkout_url`, nao invente link; avise que houve uma falha tecnica e encaminhe para suporte humano.

Respostas obrigatorias minimas para tentar checkout:

`6400`, `6401`, `6402`, `6403`, `6404`, `6406`, `6407`, `6408`, `6409`, `6410`, `6411`, `6415`, `6416`, `6417`, `6418`, `6430`, `6431`, `6432`, `6433`.

Respostas condicionais:

- Se marcar condicoes em `6411`, coletar os consentimentos relacionados quando existirem.
- Se o lead ja usou GLP-1/GIP antes, coletar tambem dados de ultimo uso, dose, forma do medicamento, efeitos colaterais e preferencia de continuidade antes de chamar a tool.

## Diferenca para o webhook de input da campanha

O webhook de input da campanha recebe eventos como:

- `form_response_partial`
- `form_response`

Ele serve para a AWSales saber que alguem abandonou ou concluiu parte do formulario.

A tool `ai-handoff` serve para a IA devolver respostas coletadas no WhatsApp para a Nuestra RX.

Em frase curta:

Input traz contexto para a IA. Tool devolve o trabalho da IA para a Nuestra RX.
