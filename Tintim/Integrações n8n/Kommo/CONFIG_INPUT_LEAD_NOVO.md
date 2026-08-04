# Configuração do Input Lead Novo — Kommo -> AWSales via n8n (Tintim)

Status: FLUXO COMPLETO E VALIDADO ponta a ponta em 31/07/2026 (Kommo -> n8n -> AWSales). Webhook do Kommo configurado pelo cliente, payload real recebido, os 7 nós montados, e o POST materializou o produto na AWSales. Falta apenas amarrar o produto como Evento de Input da campanha de destino, que ainda não foi decidida. Pedido do cliente no grupo em 29-30/07/2026: os leads que não vêm do botão da Home (trial e não-MQL de outras origens) precisam receber disparo ativo da IA, e o volume deles é muito maior que o dos leads passivos.

Confirmado no grupo em 30/07/2026: a raia recebe SÓ não-MQL, de qualquer origem, e o SDR continua receptivo apenas para os leads da Home. Consequência para a campanha: a abertura não pode assumir que o lead fez trial.

Esta NÃO é uma tool. É uma integração de INPUT: um card entrando numa etapa do Kommo abre uma campanha na AWSales.

## O que decide "onde colocar" (as duas constantes)

O fluxo foi escrito agnóstico de destino de propósito. Trocar de etapa-gatilho ou de campanha de destino é editar duas constantes, nada mais:

| Constante | Onde | Valor atual | O que muda |
|---|---|---|---|
| `STATUS_GATILHO` | `Input Lead Novo/Extrai lead do Kommo.js` | `106939423` (Aguardando Contato) | qual etapa do Kommo dispara |
| `SOURCE_ID` / `SOURCE_NAME` | `Input Lead Novo/Normaliza input.js` | `kommo-lead-novo` / `Kommo - Lead Novo` | qual Produto de atuação a AWSales materializa, e portanto qual campanha abre |

Mais a URL do nó `Registra input na AWSales`, que aponta para a credential escolhida.

## Contexto da decisão (leitura da conversa do grupo, 29-30/07/2026)

O cliente NÃO pediu input do SDR. A sequência foi:

1. Lucas propôs duas coisas: (a) criar uma coluna "Novo Lead" como gatilho de entrada do SDR, e (b) mandar o não-MQL direto para a coluna de não-MQL, "evitando nova qualificação".
2. O cliente respondeu "Sim, rola sim!" para (b) e desfez (a): a coluna "Aguardando Contato" que ele citou já É a coluna de não-MQL ("Posso mudar pra esse nome... Talvez 'Não-MQL sem contato'").
3. Portanto: lead de trial entra no CRM já classificado como não-MQL e a IA de VENDAS abre com template. O SDR não participa dessa raia. O "fluxo seria exatamente o mesmo" do áudio se refere ao fluxo da conversa, não à campanha do SDR.

Renomear a etapa no Kommo é seguro: o gatilho vai por `status_id`, não por nome.

## Etapas do pipe IA [Awsales] (13859031)

| Etapa | status_id | Papel hoje |
|---|---|---|
| Incoming leads | 106939419 | — |
| Aguardando Contato | 106939423 | ETAPA GATILHO deste input (não usada pela tool) |
| Contato Inicial | 108958275 | — |
| Qualificação | 108380651 | tool |
| Oferta Enviada | 106939427 | tool + gatilho do handoff não-MQL |
| Agência / Parceiros | 106939431 | tool |
| Handoff Humano Necessário | 108380655 | tool |
| Reunião Marcada | 108380659 | tool |
| Venda ganha | 142 | — |
| Venda perdida | 143 | tool |

REGRA DURA: a etapa-gatilho deste input NUNCA pode entrar no mapa `etapas` do `Atualizar Card/Prepara dados.js`. Se entrar, a IA passa a poder mover card para lá com `@atualizar_card_no_crm`, o webhook do Kommo dispara e a campanha reabre para um lead que já está sendo atendido. Hoje "Aguardando Contato" não está no mapa — é o que torna o gatilho seguro.

## Dados fixos

- Webhook n8n (entrada, vindo do Kommo): `https://n8n.nonprod.awsales.io/webhook/kommo-lead-novo` (POST, sem auth).
- Credential/integração na AWSales: `kommo-lead-novo` (criada em 31/07/2026, ativa).
- Endpoint AWSales (saída): `https://app.awsales.io/api/webhooks/organizations/effffee8-1d6a-49e5-8c91-8309d1af6e4f/credentials/kommo-lead-novo` (POST, Body RAW JSON, header `Accept: application/json`).
- Produto materializado: `kommo-lead-novo` / name "Kommo - Lead Novo", criado a partir do `source.id` do normalizer no primeiro POST. É o que se seleciona como Produto de atuação no Evento de Input da campanha.

Atenção ao montar o endpoint: a documentação da plataforma mostra `/api/webhooks/{org-id}/credentials/{nome}`, mas o endpoint real gerado tem `/organizations/` no meio. Copiar sempre o valor do campo Endpoint da tela da integração, não montar à mão.
- Base da API do Kommo: `https://tintim.kommo.com/api/v4/`. Token de longa duração: ver arquivo de credenciais (não colar aqui).
- Pipeline: IA [Awsales], id 13859031.

## Fluxo n8n "Tintim | Input Kommo - Lead Novo"

```
Webhook5 (kommo-lead-novo)
  -> Extrai lead do Kommo        (filtra a etapa gatilho; return [] no resto)
  -> Busca lead no Kommo         (GET /leads/{id}?with=contacts)
  -> Extrai contato principal    (acha o contact_id)
  -> Busca contato no Kommo      (GET /contacts/{id})
  -> Normaliza input             (monta o custom_action com telefone e e-mail reais)
  -> Registra input na AWSales   (POST na credential)
```

Por que 6 nós para uma coisa simples: **o webhook do Kommo não manda telefone.** Ele manda id, nome, status_id, pipeline_id do card. E o `GET /leads/{id}?with=contacts` devolve os contatos só com id/is_main, sem custom fields. Então precisa de dois GETs encadeados para chegar no telefone, que é o único dado sem o qual a campanha de WhatsApp não abre.

### 1. Webhook5
- POST, path `kommo-lead-novo`
- Sem `responseMode` (responde 200 na hora, onReceived). O Kommo só espera o ACK; não pode ficar preso esperando a AWSales.

Payload real recebido em 31/07/2026 (user-agent `amoCRM-Webhooks/3.0`, content-type `application/x-www-form-urlencoded`):

```json
{
  "leads[add][0][id]": "22791302",
  "leads[add][0][status_id]": "106939423",
  "leads[add][0][pipeline_id]": "13859031",
  "account[id]": "32491523",
  "account[subdomain]": "tintim"
}
```

Três coisas que esse payload resolve:
- **As chaves chegam LITERAIS e planas.** O n8n não aninha os colchetes. O parse plano é o caminho de produção; o aninhado ficou no código só como defesa para upgrade do n8n.
- **O evento é `add`**, não `status`. O lead foi criado já na etapa.
- **Vem só id, status_id e pipeline_id.** Sem nome, sem telefone, sem contato — é o que obriga os dois GETs seguintes.

### 2. Extrai lead do Kommo (Code)
Código canônico: `Input Lead Novo/Extrai lead do Kommo.js`. Filtra a etapa-gatilho e devolve um item por lead.

Eventos a inscrever no Kommo: `add` E `status`. O teste chegou como `add` (lead criado na etapa), mas os não-MQL "de outras origens" que o cliente falou em rotear provavelmente entram por movimentação de card, o que dispara `status`. Com só `add` marcado, esses leads nunca entram na campanha. CONFIRMAR com o Jorge o que ele marcou.

### 3. Busca lead no Kommo (HTTP Request)
- GET `https://tintim.kommo.com/api/v4/leads/{{ $json.lead_id }}`
- Query: `with` = `contacts`
- Header: `Authorization` = `Bearer {token do Kommo}`
- Options -> Response: Include Response Headers and Status = ON; **Response Format = JSON**; Never Error = ON
- Settings -> On Error: Continue

O `Response Format = JSON` é obrigatório: o Kommo responde `application/hal+json` e o n8n não parseia isso sozinho. Sem a opção, o corpo chega como string, `_embedded` desaparece e o nó seguinte não acha contato nenhum. Mesmo bug que gerou os 3 cards duplicados no fluxo da tool.

Retorno real de `GET /leads/22791302?with=contacts` (31/07/2026), na parte que importa:

```json
"name": "Pedro Leite",
"_embedded": { "contacts": [ { "id": 25296052, "is_main": true } ] }
```

Confirma que o contato vem só com `id`/`is_main`, sem custom fields — daí a necessidade do segundo GET. E confirma que o `name` do lead existe aqui, apesar de não vir no webhook.

### 4. Extrai contato principal (Code)
Código canônico: `Input Lead Novo/Extrai contato principal.js`. Além do `contato_id`, carrega adiante `lead_name`, `lead_id` e `origem_evento`.

Multi-item: o Kommo agrupa vários leads no mesmo webhook quando mais de um card muda junto (é o que vai acontecer na injeção em lote do estoque). Por isso este nó e o `Normaliza input` iteram sobre `$input.all()`, nunca `$input.first()` — a primeira versão usava `.first()` e descartava do segundo lead em diante sem nenhum aviso. Os dois rodam em mode "Run Once for All Items".

O alinhamento entre nós é por índice, e funciona porque o nó HTTP emite exatamente um item de saída por item de entrada (com `neverError` ligado). É também o motivo de `lead_id` e `origem_evento` serem copiados adiante aqui: este nó pode descartar itens (card sem contato), e depois disso o índice não bate mais com o do primeiro nó.

### 5. Busca contato no Kommo (HTTP Request)
- GET `https://tintim.kommo.com/api/v4/contacts/{{ $json.contato_id }}`
- Header: `Authorization` = `Bearer {token do Kommo}`
- Options -> Response: Include Response Headers and Status = ON; Response Format = JSON; Never Error = ON
- Settings -> On Error: Continue

Retorno real de `GET /contacts/25296052` (31/07/2026):

```json
"name": "Pedro Leite",
"custom_fields_values": [
  { "field_id": 1859198, "field_name": "Phone", "field_code": "PHONE",
    "field_type": "multitext",
    "values": [ { "value": "5531987424967", "enum_id": 1325512, "enum_code": "WORK" } ] }
]
```

O telefone vem com DDI e SEM o `+`. Esse contato era um card de teste criado à mão e não tinha campo EMAIL — os contatos reais têm (ver "Destino").

Formatos de telefone vistos no CRM até agora, todos válidos como entrada: `5531987424967` (13 dígitos, com DDI), `24981558600` (11 dígitos, sem DDI) e `55196521078` (número quebrado, do lote de teste de 31/07).

### 6. Normaliza input (Code)
Código canônico: `Input Lead Novo/Normaliza input.js`. Monta o `custom_action` com telefone em E.164.

Normalização de telefone: a regra original era "10 ou 11 dígitos -> prefixa 55", só por contagem de dígitos. Ela quebrou com `55196521078` do lote real, que virou `+5555196521078` (55 duplicado). A versão atual valida contra o plano de numeração da Anatel (os 67 DDDs que existem, celular de 9 dígitos começando em 9, fixo de 8 começando em 2-5) em vez de contar dígitos: gera todas as leituras plausíveis do número, valida cada uma e escolhe a que exigiu menos correção. Com isso `5511999999999`, `11999999999`, `011999999999` e `0 15 11 99999-9999` caem no mesmo E.164, número pré-2016 sem o nono dígito é recuperado, e número sem leitura válida é recusado em vez de virar E.164 quebrado.

Telefone irrecuperável não vira input (não dá para abrir campanha de WhatsApp sem número), mas não desaparece calado: vai para um `console.log` com lead_id, nome e motivo, visível no histórico de execuções do n8n para correção no CRM.

### 7. Registra input na AWSales (HTTP Request)
- POST `https://app.awsales.io/api/webhooks/organizations/effffee8-1d6a-49e5-8c91-8309d1af6e4f/credentials/kommo-lead-novo`
- Header: `Accept: application/json`
- Body Content Type: RAW. Content Type: `application/json`. Body: `{{ $json.bodyJson }}` (em Expression)
- Settings -> On Error: Continue

RAW e não JSON pelo mesmo motivo dos outros fluxos: o campo JSON do n8n re-parseia e quebra com objeto aninhado.

## Payload enviado (validado contra o schema da plataforma em 31/07/2026)

| Campo | Exigência da plataforma | O que o normalizer manda |
|---|---|---|
| `event` | enum | `custom_action` |
| `timestamp` | ISO 8601 UTC | `new Date().toISOString()` |
| `source.id` / `source.name` | obrigatórios | `kommo-lead-novo` / `Kommo - Lead Novo` |
| `lead.phone` | formato internacional | `+5531987424967` |
| `lead.email` | obrigatório | real, ou `<telefone>@naoinformado.tintim.app` |
| `lead.name` | opcional | nome do card |
| `utm.source` | `awsales` para a conversão aparecer no dashboard | `awsales` |
| `metadata` | livre | `action_details`, `intent_level`, `context_notes` + `kommo_lead_id`, `origem_evento`, `email_real` |

Chave extra em `metadata` é aceita e vira variável na campanha (o `integracao-cal` já prova isso: `{{metadata.meeting.uid}}` resolve). Portanto `{{metadata.kommo_lead_id}}` e `{{metadata.origem_evento}}` ficam disponíveis para o checkpoint.

Dois campos que valem revisão antes de ir para volume:
- `context_notes` vai vazio. No handoff do SDR ele carrega o resumo da qualificação; aqui não existe qualificação nenhuma. Vale preencher com algo útil para o Copywriter (ex: "Lead entrou pelo CRM sem passar por qualificação da IA").
- `intent_level: 'interested'` é assumido, não observado — o lead só caiu numa raia. Está igual ao handoff por consistência, mas não é um sinal real.

## Configuração no Kommo (lado do cliente)

FEITO pelo Jorge em 31/07/2026 — a automação está no ar e o payload chegou. Apontando para `https://n8n.nonprod.awsales.io/webhook/kommo-lead-novo`.

Falta confirmar quais eventos ele marcou. O teste chegou como `add`; precisa também de `status` para pegar lead movido para a raia (os não-MQL de outras origens). O webhook é da conta inteira, não do pipeline — por isso o filtro de `STATUS_GATILHO` + `PIPELINE` no primeiro nó é o que impede que movimentação no funil de produção do Tintim (9901040) abra campanha.

Nota: não temos login no painel do Kommo deles, só o token de API (escopo `crm`). Dá para listar/criar webhook por API (`GET`/`POST /api/v4/webhooks`) se precisar conferir sem depender do cliente.

## Destino (a decidir com o cliente)

E-mail: o primeiro card de teste (criado à mão) não tinha EMAIL, o que fez parecer que o input entraria sempre com e-mail mockado. O lote real de 31/07 desmentiu: os 4 contatos criados pela automação do Jorge vieram com EMAIL preenchido (ex: `marcelofelipe1405@gmail.com`). Ou seja, o input entra com e-mail real e o casamento com o output da Vindi tem chance de fechar. Quando faltar, cai no mockado `<telefone>@naoinformado.tintim.app`, e o flag `metadata.email_real` diz qual dos dois foi usado.

Ressalva: apareceu um `marketing@` no lote. E-mail de empresa não necessariamente bate com o e-mail que o comprador usa no checkout da Vindi, então o casamento por e-mail não é garantido. Ver "Casamento do lead" em `../Vindi/CONFIG_OUTPUT_VINDI.md`.

Duas opções:
- **Reaproveitar a campanha Venda - Não-MQL.** Mais rápido. Se a campanha só aceita um Produto de atuação, trocar `SOURCE_ID` para `sdr-nao-mql` e postar na credential `kommo-nao-mql` — e os leads de trial passam a receber a mesma abertura de quem foi encaminhado pelo SDR ("o time comercial dá sequência"), que não faz sentido para quem nunca falou com ninguém.
- **Campanha nova (ou segundo evento de input na mesma campanha), com `source.id` próprio.** Permite abertura específica de trial e separa o relatório. Preferível.

## Pendências

- Amarrar o produto "Kommo - Lead Novo" como Evento de Input da campanha de destino (depende da decisão em "Destino"). Até isso acontecer, o fluxo roda ponta a ponta e registra o lead na AWSales, mas nenhuma campanha abre.
- Confirmar com o Jorge se o webhook está inscrito em `status` além de `add`. Sem `status`, lead movido para a raia (não-MQL de outras origens) não entra.
- Apagar o card/lead de teste (Pedro Leite, lead 22791302) do pipe IA [Awsales] e o registro de teste na AWSales.
- Sem dedup de reentrada: card que sai e volta para a raia dispara de novo. Aconteceu de verdade em 31/07 (o Jorge passou vários leads por acidente e tirou depois). Confirmar se a AWSales deduplica por lead antes de liberar volume.
- Definir o destino e a abertura (ver acima). A abertura do não-MQL do SDR não serve, e a abertura também não pode assumir trial: a raia recebe não-MQL de qualquer origem.
- Confirmar com o cliente: **trial é sempre não-MQL?** Um gestor de tráfego ou dono de agência com 3+ clientes pode assinar trial, e nesse caso a IA de vendas atende alguém que devia ir para a reunião do Programa de Parceiros. Se houver esse risco, prever uma trava no checkpoint da Venda para reencaminhar.
- Confirmar em qual pipeline o cliente vai rotear os leads de trial: o nosso (13859031) ou o dele (9901040). As constantes assumem o nosso.
- Drop silencioso: card sem contato, ou contato sem telefone, faz o lead não entrar na campanha sem nenhum aviso. Ver se o roteamento do cliente garante contato com telefone; se não, prever um ramo de log/alerta.
- Sem dedup: card que sai e volta para a etapa-gatilho dispara de novo. Confirmar se a AWSales deduplica por lead; se não, checar `old_status_id` ou guardar estado.
- **Estoque de 300-400 leads do mês passado** (o cliente quer teste gradual): mover em lote para a etapa-gatilho dispara o webhook para cada card, o que atropela o limite de requisição do Kommo e abre centenas de janelas de WhatsApp de uma vez. Fazer em fatias pequenas, ou montar um caminho de injeção separado com controle de ritmo. Decidir antes de qualquer movimentação em lote.
- Webhook n8n sem auth, token do Kommo em texto puro no header (mesma pendência de hardening dos outros fluxos).
- Previsão de volume de leads: o cliente ficou de mandar.
