# Configuração de Tool — Kommo via Gateway n8n (SDR Tintim)

Status: IMPLEMENTADO e testado ponta a ponta em 2026-07-15 (AWSales -> n8n -> Kommo). Os dois ramos (criar e mover card) validados, incluindo o fix de card duplicado.

Arquitetura: a tool da AWSales aponta para um webhook do n8n, e o n8n fala com a API do Kommo. Não usa a conexão nativa do Kommo da AWSales (aquela é para input/output de plataforma; esta tool é ação pontual durante a conversa). O gateway resolve o que a AWSales não faria sozinha: body em array, contato embutido e o encadeamento buscar -> decidir -> mover/criar.

## Dados fixos da integração

- Conta Kommo: Tintim, subdomínio `tintim.kommo.com` (account_id 32491523). Token de longa duração no arquivo de credenciais.
- Pipeline: IA [Awsales], id 13859031.
- Base da API: `https://tintim.kommo.com/api/v4/`
- Webhook n8n: `https://n8n.nonprod.awsales.io/webhook/tintim-kommo-card`

### Etapas e status_id

| Etapa | status_id |
|---|---|
| Incoming leads | 106939419 |
| Aguardando Contato | 106939423 |
| Contato Inicial | 108958275 |
| Qualificação | 108380651 |
| Oferta Enviada | 106939427 |
| Agência / Parceiros | 106939431 |
| Handoff Humano Necessário | 108380655 |
| Reunião Marcada | 108380659 |
| Venda ganha | 142 |
| Venda perdida | 143 |

Observação: a IA nunca lida com status_id. Ela manda o NOME da etapa e o n8n traduz.

---

## Lado AWSales — Tool  (handle: @atualizar_card_no_crm)

- Conexão: Tintim - Gateway n8n (auth Nenhuma). A mesma das tools do Cal.
- Nome da Tool: Atualizar Card no CRM
- Método: POST
- URL: `https://n8n.nonprod.awsales.io/webhook/tintim-kommo-card`
- Headers e Query params: nenhum
- Mapeamento de resposta: nenhum (ação silenciosa de bastidor; a IA não usa o retorno em nenhuma fala)
- Descrição para IA: "Use esta tool para registrar o lead no CRM e mover o card dele para a etapa correta do funil conforme o momento da conversa. Chame quando classificar o perfil do lead, quando a reunião for agendada, quando encaminhar o lead ao time de vendas ou quando houver recusa clara. Informe o telefone e o nome do lead, a etapa de destino e um resumo curto da qualificação."

Body Schema (4 campos, todos Fonte IA):

| Campo | Tipo | Req | Descrição para IA |
|---|---|---|---|
| telefone | String | sim | Telefone do lead com código do país e DDD, só números, sem espaços ou símbolos. Exemplo: 5511999999999. Use o número do WhatsApp do próprio atendimento. |
| nome | String | sim | Nome do lead. Priorizar nome completo; não inventar sobrenome. Se o lead ainda não informou, use o nome que aparece no WhatsApp. |
| etapa | String | sim | Etapa de destino do card no funil. Use exatamente um destes valores: "Qualificação" quando classificar o perfil do lead; "Reunião Marcada" quando a reunião for agendada com sucesso; "Oferta Enviada" quando encaminhar um lead não-MQL para o time de vendas; "Handoff Humano Necessário" quando o caso precisar de atendimento humano ou suporte; "Venda perdida" quando o lead recusar claramente. |
| resumo | String | não | Resumo curto em 1 ou 2 frases para o time humano: perfil (MQL ou não-MQL), quantos clientes atende, dor confirmada e próximo passo. |

Cuidado conhecido: já aconteceu de o campo telefone ficar com a descrição do nome. Se isso acontecer, a IA preenche telefone com o nome do lead, a busca nunca acha e o fluxo cria card duplicado em toda interação. Conferir as descrições antes de publicar.

---

## Fluxo n8n

Desenho:
```
Webhook -> Prepara dados -> Busca lead por telefone -> Avalia busca -> Switch
   |- achou     -> Move card ------------------------------------------------|
   |- nao_achou -> Busca contato por telefone -> Monta body -> Cria card ----|-> Monta resposta -> Respond to Webhook
   |- erro      -------------------------------------------------------------|
```

### 1. Webhook
- POST, path `tintim-kommo-card`
- Respond: Using 'Respond to Webhook' Node
- Recebe: `{ telefone, nome, etapa, resumo }` em `$json.body`

### 2. Prepara dados (Code)
Traduz o nome da etapa para status_id, normaliza acento e limpa o telefone.
```javascript
const b = $input.first().json.body || {};

const norm = (s) => String(s || '')
  .normalize('NFD').replace(/[̀-ͯ]/g, '')
  .toLowerCase().trim();

const etapas = {
  'qualificacao': 108380651,
  'reuniao marcada': 108380659,
  'oferta enviada': 106939427,
  'agencia / parceiros': 106939431,
  'handoff humano necessario': 108380655,
  'venda perdida': 143
};

const status_id = etapas[norm(b.etapa)] || null;
const telefone = String(b.telefone || '').replace(/\D/g, '');

return [{ json: {
  telefone,
  nome: b.nome || 'Lead WhatsApp',
  resumo: b.resumo || '',
  etapa: b.etapa,
  status_id,
  pipeline_id: 13859031
} }];
```

### 3. Busca lead por telefone (HTTP Request)
- GET `https://tintim.kommo.com/api/v4/leads`
- Query: `query` = `{{ $json.telefone }}` ; `filter[pipeline_id]` = `13859031`
- Header: `Authorization` = `Bearer {token do Kommo}`
- Options -> Response: Include Response Headers and Status = ON; Response Format = JSON; Never Error = ON (recomendado)
- Settings -> On Error: Continue

Dois pontos que NÃO podem ser removidos:
- `filter[pipeline_id]`: sem ele a busca varre o CRM inteiro da Tintim. Existe lead deles no pipeline principal (9901040); sem o filtro, o fluxo acharia um card de produção e o moveria para o nosso pipe. Com o filtro, se o lead existir em outro funil, não tocamos nele: criamos nosso próprio card no pipe da IA.
- Response Format = JSON: o Kommo responde `Content-Type: application/hal+json`, e o n8n não parseia hal+json automaticamente. Sem essa opção, o corpo chega como string dentro de `data`, o `_embedded` some, o IF/Switch cai sempre em "não achou" e o fluxo duplica card. Foi exatamente o bug que gerou 3 cards duplicados no teste.

### 4. Avalia busca (Code)
Separa "não achou" (204) de "erro real" (401, 500, timeout). É o fix do card duplicado.
```javascript
const r = $input.first().json;
const status = r.statusCode;
const leads = r.body?._embedded?.leads || [];

if (status === 200 && leads.length > 0) {
  return [{ json: { resultado: 'achou', lead_id: leads[0].id } }];
}
if (status === 204) {
  return [{ json: { resultado: 'nao_achou' } }];
}
// 401, 500, timeout: erro real. NAO criar card.
return [{ json: { resultado: 'erro', detalhe: `HTTP ${status}` } }];
```

### 5. Switch
- Mode: Rules, comparando `{{ $json.resultado }}` (String, is equal to), com Rename Output ligado:
  - `achou` -> Move card
  - `nao_achou` -> Busca contato por telefone (início do ramo de criação com dedup de contato)
  - `erro` -> Monta resposta (direto, sem tocar no CRM)

### 6. Move card (HTTP Request)
- PATCH `https://tintim.kommo.com/api/v4/leads/{{ $json.lead_id }}`
- Header: Authorization Bearer
- Body (JSON, objeto — não array; array só em update em lote):
```json
{
  "status_id": {{ $('Prepara dados').first().json.status_id }},
  "pipeline_id": {{ $('Prepara dados').first().json.pipeline_id }}
}
```
- Options -> Response Format: JSON (a resposta também é hal+json)
- Settings -> On Error: Continue

Ramo nao_achou (não há card no pipe) = criar card, mas antes deduplicar o contato. Pedido do cliente: vários leads/cards por pessoa é ok, mas um único contato de fundo. Sem isso o fluxo cria um contato novo a cada reentrada (confirmado em produção: 3 contatos para o mesmo telefone do Jorge).

### 7. Busca contato por telefone (HTTP Request)
- GET `https://tintim.kommo.com/api/v4/contacts`
- Query: `query` = `{{ $('Prepara dados').first().json.telefone }}` (sem filtro de pipeline: contato é global, buscamos em toda a conta)
- Header: Authorization Bearer
- Options -> Response: Include Response Headers and Status = ON; Response Format = JSON; Never Error = ON
- Settings -> On Error: Continue

### 8. Monta body (Code)
Decide reusar o contato existente (por id) ou criar um novo, e monta o corpo da criação como STRING JSON.
```javascript
const p = $('Prepara dados').first().json;
const raw = $input.first().json;
const emb = (raw.body || raw)._embedded || {};
const contatos = emb.contacts || [];
const idExistente = contatos[0] && contatos[0].id ? contatos[0].id : null;

const contato = idExistente
  ? { id: idExistente }
  : { name: p.nome, custom_fields_values: [ { field_code: 'PHONE', values: [ { value: p.telefone } ] } ] };

const lead = {
  name: p.nome,
  status_id: p.status_id,
  pipeline_id: p.pipeline_id,
  _embedded: { contacts: [ contato ] }
};

return [{ json: { bodyJson: JSON.stringify([lead]), reusou: !!idExistente } }];
```
Contato existe -> `{ id }` (liga ao existente). Não existe -> contato novo com telefone.

### 9. Cria card (HTTP Request)
- POST `https://tintim.kommo.com/api/v4/leads/complex`
- Header: Authorization Bearer
- Body Content Type: RAW (não JSON). Content Type: `application/json`. Body: `{{ $json.bodyJson }}`
- Settings -> On Error: Continue

Por que RAW e não JSON: o campo "JSON" do n8n re-parseia/embrulha o conteúdo e quebrava com o objeto aninhado (erro "JSON parameter needs to be valid JSON"). Com RAW, o n8n manda exatamente a string que o Monta body gerou via JSON.stringify, que já é JSON válido. Usa `/leads/complex` porque cria o lead e o contato (ou liga ao contato existente) numa chamada só.

Nota: no Move card e no Monta body usa-se `$('Prepara dados')` em vez de `$json` porque, depois do Switch, o `$json` é a saída da busca, não os dados originais.

### 10. Monta resposta (Code)
Recebe as três rotas. Nas rotas achou/nao_achou existe `id`; na rota erro não existe, e o ok sai false sozinho.
```javascript
const id = $input.first().json.id || null;
const p = $('Prepara dados').first().json;
return [{ json: { ok: !!id, lead_id: id, etapa: p.etapa } }];
```

### 11. Respond to Webhook
- Respond With: First Incoming Item

Resposta para a IA: `{ "ok": true, "lead_id": 22796842, "etapa": "Oferta Enviada" }`

---

## Como referenciar no checkpoint

Formato obrigatório `Utilize a tool para [ação] @nome_da_tool`:
- Utilize a tool para atualizar o card no CRM para a etapa Qualificação @atualizar_card_no_crm
- Utilize a tool para atualizar o card no CRM para a etapa Reunião Marcada @atualizar_card_no_crm
- Utilize a tool para atualizar o card no CRM para a etapa Oferta Enviada @atualizar_card_no_crm

## Como testar (2 rodadas)

1. Pipe vazio, telefone novo, etapa Qualificação -> rota `nao_achou` -> cria card. Guardar o lead_id.
2. Mesmo telefone, etapa Reunião Marcada -> rota `achou` -> move o card. O `lead_id` da resposta tem que ser o MESMO da rodada 1. Se vier diferente, o fix quebrou e está duplicando.
3. Rota `erro`: estragar o token do header da busca -> tem que voltar `ok:false` e NÃO criar card.

## Dedup de contato (feito)

Implementado e testado em 2026-07-16 (ramo nao_achou: Busca contato -> Monta body -> Cria card). Prova: telefone com contato pré-existente (25301426) recebeu um card novo LIGADO a esse contato, sem criar um segundo contato. Dedup por telefone. E-mail ainda não é usado como chave (a IA só tem o e-mail no agendamento, não na criação do card).

## Armadilha de encoding (importante para testar)

O mapeamento da etapa depende do texto chegar com acento correto ("Qualificação", "Reunião Marcada"). Se a etapa chegar com acento corrompido, o `norm()` não acha no mapa, `status_id` vira null e o Kommo recusa com "status_id should not be null". A plataforma AWSales manda UTF-8 correto, então funciona em produção. O que corrompe é testar via `curl` no Git Bash do Windows (mangla o çã). Para testar por fora, usar arquivo UTF-8 (`--data @arquivo.json`), a própria plataforma, ou uma etapa sem acento (ex: "Oferta Enviada").

## Pendências conhecidas

- O `resumo` é recebido mas não é gravado no card. Falta um nó de nota (POST `/api/v4/leads/{id}/notes`, body em array) depois do Monta resposta. Sem ele, o time da Tintim vê o card sem o contexto da qualificação.
- Etapa desconhecida (ou com acento corrompido) vira `status_id: null` e a criação falha (Kommo 400). Vale validar no Prepara dados e devolver um erro explícito em vez de mandar null.
- Telefone sem DDI (ex: `11999999999` em vez de `5511999999999`) pode não bater com o formato E.164 do Kommo e furar o dedup. A descrição do campo pede DDI; reforçar se aparecer.
- Segurança: o webhook não tem auth e o token do Kommo está direto no header dos nós. Para produção: proteger o webhook com header secreto e mover o token para um Credential do n8n.
- API não permite deletar lead (DELETE retorna 405). Limpeza de cards de teste é manual, no painel do Kommo.
