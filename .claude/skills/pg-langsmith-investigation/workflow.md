# Conversa AWsales — acesse LangSmith + base, e faça o que pediram

> Esta skill é a **FERRAMENTA de acesso** a uma conversa de IA: dado um LINK, ela puxa o **contexto completo** — o trace inteiro (LangSmith) + a base de conhecimento real e o que o RAG buscou (Metabase). **O usuário só manda o link e diz o que quer.** Você SEMPRE puxa o contexto primeiro (Gate 0) e depois faz **O QUE FOI PEDIDO** — investigar um bug, otimizar um prompt/fluxo, melhorar o agente, analisar custo, ou responder uma pergunta. O RCA é só UM dos modos, não a única razão de existir. Princípio único, vale pra todo modo: **toda afirmação factual sobre a conversa precisa de EVIDÊNCIA** (file:line / grep / query), nunca "acho que". Encodado a partir do caso `investigations/2026-06-25-langsmith-jader-hallucination/`.

## INVARIANTES (não-negociáveis — releia em todo step que produz/avalia)

1. **READ-ONLY SEMPRE.** LangSmith: só `GET`/`POST /runs/query`. Metabase: só `SELECT` (nunca INSERT/UPDATE/DELETE/DDL). NUNCA criar, editar, anotar nada em lugar nenhum. Keys são de leitura (`lsv2_pt_*` no LangSmith; key Metabase no db NEO read-only).
2. **Verificar > inferir (mecânico, não vibe).** Afirmação sobre o trace ("a IA inventou X", "não está na base", "o auditor não tem regra Y") só vale depois de **grep/contagem determinística** sobre os dados crus. Proibido concluir "alucinação" sem provar que a string NÃO está em NENHUMA camada de input.
3. **Done = evidência.** Toda conclusão carrega: `arquivo:campo` + string verbatim, OU contagem de grep, OU a query. Em relatório, separe "lido no trace" de "pesquisado na web".
4. **Enumerar antes de analisar.** Puxe TODOS os root runs e monte o índice (agente · modelo · status · tokens · erro) ANTES de julgar. Se não está no índice, não existe pra análise.
5. **Não vaze segredo nem PII.** Nunca cole a API key, telefone do lead, ou nome de terceiro/concorrente num relatório que circula. Doc client-facing = redigir nome sensível (ver `pg-feature-cycle`/template PDF e o caso de referência).
6. **Rate limit é real (429).** A API responde 429 "Rate limit exceeded" sob a menor rajada. SERIALIZE as chamadas e faça backoff (~12s) — nunca dispare N queries em paralelo contra a API. (Sub-agentes NÃO batem na API: o orquestrador extrai pra disco, os agentes leem os arquivos.)
7. **Orquestre (NN-6).** Investigação não-trivial: o orquestrador (a) extrai os dados crus e salva `build/<conversa>/evidence/*`, depois (b) dispara sub-agentes sem viés sobre os ARQUIVOS — análises dimensionais (1 por camada) + pesquisa + adversarial. Tier: `haiku` pra extração/grep mecânico, `sonnet` pra análise dimensional, herda pra adversarial/síntese. Fecha com revisor ≠ autor + kill-advocate. **Uso manual (humano, sem sub-agentes):** ignore a orquestração — os Gates 1–6 viram um checklist sequencial; rode você mesmo.

## COMO RODAR (onde) + GLOSSÁRIO

- **Onde:** neste repositório a skill vive em `.claude/skills/pg-langsmith-investigation/`. **`cd` pra esse diretório antes de rodar** os scripts (`python scripts/ls_fetch.py`). Os scripts imprimem o caminho ABSOLUTO de saída.
- **Onde a saída cai:** SEMPRE em `<skill>/build/<conversation_id>/` (caminho fixo, ancorado na pasta da skill — não depende do cwd). É gitignorado: trace e base contêm dado real de lead.
- **Deps:** só Python 3 stdlib. **Keys NÃO ficam no código** (este repo é público) — vêm de `.env.local` na raiz da skill ou de variável de ambiente. Detalhe: `./INSTALL.md`.
- **Glossário rápido:** *root run* = uma invocação de agente (1 turno tem vários); *session* = projeto no LangSmith (1 por org); *is_root* = filtro só dos runs de topo; *observation* = o que a tool RAG devolveu (`outputs.intermediateSteps[].observation`); *kill-advocate* = agente pago pra DERRUBAR o veredito; *NN-3/NN-6* = regras da convenção de skills (persistir saída / orquestrar sub-agentes).

---

## ACESSO (setup — faça primeiro)

> **Gate 0-A — ESCOLHER A PORTA DE ENTRADA (antes de tudo).** Existem DUAS, e usar a errada faz você concluir "não existe" sobre dado que existe:
>
> | O usuário deu | Porta | Comando |
> |---|---|---|
> | link do LangSmith / link do neo / uuid | **trace** (LangSmith) | `python scripts/ls_fetch.py "<link>"` → Gate 0 abaixo |
> | **telefone do lead** + campanha/organização | **banco APP db 3** | `python scripts/conv_fetch.py --phone "<tel>" --org <org> --campaign <camp>` |
>
> Campanha do legado (ex: Falcão das Milhas / Onboarding) costuma **não ter trace no LangSmith** — `channel_conversation_id` nulo e o resolver não acha a janela. Nesse caso a análise inteira sai do banco, e afirmar qualquer coisa sobre modelo/temperatura/auditor é overclaim. Cadeia, campos que vêm nulos e gotchas: **`./reference/banco-conversas-app.md`** (leia ANTES de concluir). SELECT ad-hoc em qualquer banco: `python scripts/mb_query.py --db 3 "SELECT ..."`.

> **Gate 0 — RESOLVER O LINK (quando a porta é o trace).** Você recebe QUALQUER link/id e NÃO pede o conversation_id pro humano. O resolver se vira: descobre projeto + conversation_id e puxa a conversa inteira. Pré-requisito único: `.env.local` configurado (ver `./INSTALL.md`).

```bash
# Cole EXATAMENTE o que o usuário mandou (entre aspas). Funciona com os 3 formatos:
python scripts/ls_fetch.py "<link ou id que o usuário colou>"
#   → resolve projeto + conversation_id, puxa todos os root runs,
#     salva build/<conversation_id>/raw_query.json + run_index.txt e imprime o resumo.
```

**Formatos que o resolver aceita (testado namoral):**
| O que o usuário cola | Como resolve |
|---|---|
| URL LangSmith com `conversation_id` no filtro | lê projeto + conversation_id direto da URL |
| URL LangSmith com `run_id` no filtro | consulta o projeto pelo `run_id` → lê o `conversation_id` no `extra.metadata` |
| URL do neo (`?id=`, path-style `/conversations/<uuid>`, ou hash `#/conversations?id=`) | extrai o `id`/uuid, lista os projetos da org e acha por busca multi-session |
| UUID cru (conversation_id ou run_id) | tenta como conversation_id; se vazio, como run_id |

> **O `id` do neo É o `conversation_id` do LangSmith** (mesmo valor — confirmado namoral: `e7172cc4…` aparece nos dois). Se o resolver disser "não encontrado em nenhum projeto", o id existe mas a conversa pode não ter trace no LangSmith (ou é id de outra entidade) — confira o id antes de suspeitar da key.

A key (read-only) vem de `LANGSMITH_API_KEY` no ambiente ou de `.env.local` na raiz da skill — nunca do código. Backoff de 429 e paginação já estão no script.

Detalhe completo (endpoints, estrutura de um run, filtros, link-types, backoff): **`./reference/api-access.md`**.

**Cruzar com a base real (Metabase) — opcional mas decisivo pro Gate 3a.** Pra saber se a base TINHA o dado (e o RAG errou) ou NÃO tinha:
```bash
python scripts/kb_fetch.py <conversation_id> --grep "termo que a IA deveria saber, outro termo"
#   → resolve session → playbook+product KB → extracted_content pra build/<conv>/knowledge/,
#     diz se cada termo ESTÁ/NÃO na base, E salva rag_queries.txt (o que o RAG buscou + scores).
```
Triângulo do retrieval: (1) o que o RAG buscou (`rag_queries.txt`) · (2) o que a base tinha (`knowledge/` + grep) · (3) o que chegou no modelo (trace). **Base tinha + RAG não trouxe = falha de RETRIEVAL, não gap de conteúdo.** Detalhe (cadeia de tabelas, schema, key embutida): **`./reference/metabase-kb.md`**.

**Gotcha de acesso:** o root run JÁ traz tudo — `inputs` (campos: input/checkpoints/campaignVariables/transcription/informationsFromKnowledgeBases/productContext/...), `outputs`, `extra.metadata.model` (modelo + temperature) e `error` (ex: 503). Raramente é preciso descer pros child runs. Por isso a extração inteira sai de 1 query.

---

## MAPA DO PIPELINE (IA legado multi-agente)

```
POR TURNO, em sequência (cada um é um root run "Agent: <X>"):
 Information Manager  → RAG: chama get_knowledge_bases_info, resume a base
 Integrations Manager → tools/integrações
 Copywriter           → ESCREVE o texto enviado ao cliente   ← onde mora a alucinação
 Checkpoint Manager   → estado/fluxo do checkpoint
 Response Auditor     → GUARDRAIL: aprova/RETRY/HANDOFF/FINALIZE/BLACKLIST
```
**Modelo + temperatura por agente mudam** — leia do `run_index` da conversa (campo `extra.metadata.model`) e cruze com a tabela-cache + gotchas em **`./reference/learnings.md`** (fonte única; não duplique modelos aqui).

---

## DEPOIS DE PUXAR — O PEDIDO MANDA (escolha o modo)

Gate 0 (puxar o contexto) é SEMPRE igual. O que muda é o que o usuário pediu:

| O usuário pediu… | Faça |
|---|---|
| **Investigar um problema** (alucinou, errou, handoff indevido, loop, "o auditor não pegou") | **MODO INVESTIGAÇÃO** — o trilho de Gates abaixo (input-vs-output → 4 camadas → relatório). |
| **Otimizar** (prompt, gates do auditor, retrieval, fluxo/checkpoint, handoff) | Use o trace (o que FALHOU, turno a turno) + a base real (o que EXISTE) + `rag_queries` (o que o RAG buscou) pra propor a mudança concreta. Toda proposta aponta a evidência no trace/base que a justifica. Ofereça o diff/texto novo, não conselho genérico. |
| **Analisar custo / latência / padrões** | `run_index.txt` (tokens, modelo, erros/503 por agente, duração) + `rag_queries` (nº de buscas). Some por agente; aponte o caro/lento com número. |
| **Pergunta livre sobre a conversa** | Responda do contexto puxado. Claim factual ("a IA disse X", "a base tem Y") só vale com evidência (input-vs-output / grep na base). |

Regra comum a TODO modo: **nunca afirme sem evidência** (file:line / grep / query); e antes de cravar "faltava na base", cruze com o Metabase (a base pode ter, e o RAG ter errado).

---

## MODO INVESTIGAÇÃO — o trilho de RCA (quando o pedido é diagnosticar um problema)

> Detalhe de cada gate, com os comandos e o que cada camada significa: **`./reference/investigation-method.md`**. Persistir a saída de cada gate em `build/<conversa>/` (NN-3).

**Gate 0 — RESOLVER + EXTRAIR (scriptado).** Rode `python scripts/ls_fetch.py "<o que o usuário colou>"` (ver ACESSO). Ele resolve projeto+conversation_id de qualquer link/id, puxa todos os root runs e gera `build/<conv>/raw_query.json` + `run_index.txt`. Depois, se for fazer fan-out, salve `inputs`/`outputs`/`extra`/`error` dos runs-chave em `evidence/` (script 6d em api-access.md).
→ Gate: `run_index.txt` existe e cobre 100% dos runs; projeto+conversation_id impressos.

**Gate 1 — ENUMERAR + MAPEAR.** Sobre o `run_index.txt`: mapeie a topologia (quais agentes, qual modelo/temp cada um, quantos `status=error` e em qual modelo). Identifique o(s) run(s) suspeito(s) (ex.: o Copywriter que escreveu a mensagem ruim).
→ Gate: topologia mapeada; run(s) alvo identificado(s).

**Gate 2 — LOCALIZAR (input-vs-output).** Pegue o trecho suspeito (a frase errada / o claim). Faça **grep determinístico** em CADA campo de INPUT (system prompt, checkpoint, KB/RAG, campaignVariables, transcrição, mensagens do lead) vs OUTPUT. **A pergunta decisiva:** o conteúdo ruim aparece em algum INPUT, ou SÓ no OUTPUT?
- Só no output → **alucinação/confabulação** (não foi ambiguidade nem erro de dado).
- Em algum input → **ambiguidade / erro de cadastro / RAG envenenado** (rastreie a fonte).
→ Gate: a origem está provada por contagem de grep, não por leitura parcial.

**Gate 3 — CAUSA-RAIZ pelas 4 camadas** (para problema de RESPOSTA da IA):
- **(a) Retrieval/grounding — DUAS perguntas, não uma:**
  1. *O que o RAG DEVOLVEU?* (no trace: `outputs.intermediateSteps[].observation` do Information Manager + `inputs.informationsFromKnowledgeBases` do Copywriter).
  2. *O que a base REALMENTE TINHA?* → **cruze com a base real via Metabase** (`python scripts/kb_fetch.py <conversation_id> --grep "termo1,termo2"`). Isso puxa o `extracted_content` das KBs (playbook+product) que a conversa usou.
  - **A distinção que só o Metabase dá:** se o dado **NÃO está** na base → gap de CONTEÚDO (enriquecer a base). Se **está na base mas o RAG não devolveu** → falha de RETRIEVAL (query/embedding/chunking) — a base está certa, o conserto é no retrieval, não no conteúdo. (No caso Jader: "Felipe Azuma, Coordenador" ESTAVA na base; o RAG não trouxe → era retrieval, não conteúdo — o LangSmith sozinho concluiu errado "faltava na base".)
- **(b) Prompt** — há conflito de diretrizes? Existe regra de grounding ("responda só da base") e de recusa ("se não tem, não invente")? Ou só pressão ("sempre responder/vender")?
- **(c) Modelo** — qual modelo/temperatura? É preview ou estável? Tem comportamento conhecido (alucinação, over-answer)?
- **(d) Guardrail** — o auditor rodou? Qual o checklist dele? Tinha uma regra que pegaria ESTE caso, ou tem carve-out/escopo que deixa passar?
→ Gate: cada camada tem veredito com evidência; nenhuma foi pulada.

**Gate 4 — PESQUISA (quando a decisão é não-óbvia / toca modelo ou entidade externa).** Status/deprecação do modelo; comportamento conhecido (benchmarks de alucinação/grounding); identidade de entidade (confabulação com nome real?); boas práticas de mitigação. Sempre com URL aberta + citação.
→ Gate: alegações sobre modelo/mundo têm fonte, não memória.

**Gate 5 — VERIFICAÇÃO ADVERSARIAL (revisor ≠ autor).** Um sub-agente independente reconfere CADA citação contra os arquivos. Um **kill-advocate** tenta DERRUBAR o veredito (foi ambiguidade? o prompt está ok? overclaim?). Corrija overclaims (o caso Jader pegou eu mesmo afirmando "auditor não tem checagem" — tinha, com carve-out).
→ Gate: veredito sobrevive ao ataque; overclaims corrigidos; itens não-verificáveis marcados como tal.

**Gate 6 — SÍNTESE + RELATÓRIO.** Camadas causais + fixes priorizados (P0/P1/P2) acionáveis. Se vai pra negócio/cliente: PDF no padrão canônico (capa AWsales, client-safe, nome sensível redigido). Reporte no chat LEGÍVEL (prosa, uma ideia por linha).
→ Gate: cada fix mapeia a uma camada; relatório separa lido-no-trace de pesquisado.

---

## DETECÇÃO DE FASE (entrei no meio — onde estou?)

| Já existe em `build/<conversa>/` | Você está em |
|---|---|
| pedido = "melhorar a IA / achar padrões" (N conversas, não 1 bug) | MODO VARREDURA (ver seção) |
| nada (só o link/id) | Gate 0 (rodar ls_fetch.py) |
| `raw_query.json` + `run_index.txt` | Gate 1 (mapear) → Gate 2 (localizar) |
| `run_index.txt` mas sem busca da string | Gate 2 (localizar) |
| origem provada (input vs output) | Gate 3 (4 camadas) |
| 4 camadas com veredito | Gate 4/5 (pesquisa + adversarial) |
| veredito verificado | Gate 6 (relatório) |

---

## MODO VARREDURA (N conversas — "melhorias no geral", não 1 bug)

> Quando o pedido é "melhora os prompts/gates da IA" / "a IA tá errando, acha os padrões" — não é 1 conversa, é uma AMOSTRA. O trilho Gate 1–6 vale por conversa; a varredura agrega.

1. **Amostrar.** Liste roots do projeto numa janela (`gt(start_time,"<ISO>")`), sem filtro de conversation_id. Estratifique: priorize conversas com sinal (Auditor `HANDOFF`/`RETRY`/`BLACKLIST`, `status=error`/503, custo/turnos alto, ou flag humana). N por orçamento (10–50), não 1.
2. **Agrupar por conversa.** Extraia o `conversation_id` de cada root (`extra.metadata`) e rode Gate 1–3 (extrair → input-vs-output → 4 camadas) em CADA conversa amostrada — fan-out de sub-agentes, 1 por conversa, lendo arquivos (NN-6, tier sonnet).
3. **Agregar padrões.** Some os achados por CATEGORIA (alucinação por gap de grounding · prompt que over-dispara handoff · guardrail mal-escopado · modelo/temp · RAG sem o dado · custo/latência/503). Conte frequência × impacto.
4. **Priorizar.** P0/P1/P2 por frequência × impacto (não por 1 caso isolado). Um padrão recorrente vira fix sistêmico (ex: trava anti-fabricação no auditor cobre toda a classe).
5. **Relatório de melhoria** (não post-mortem): top padrões + fix por camada + quais conversas exemplificam cada um (evidência). Mesmo gate de honestidade (lido-no-trace vs pesquisado).

**Gate:** cada padrão tem ≥2 conversas de evidência (1 caso = anedota, não padrão) + fix mapeado a uma camada.

---

## GOTCHAS (a nata — do caso 2026-06-25)

- **A query 1x já traz tudo.** `inputs`/`outputs`/`extra.metadata.model`/`error` estão no root run. Não perca tempo com child runs salvo necessidade.
- **429 trava você.** Serialize + backoff ~12s. Sub-agentes leem os ARQUIVOS extraídos, não a API (rate limit + key).
- **"Jader" só no output = prova de alucinação.** O teste input-vs-output é o coração: se a string tem contagem 0 em todos os inputs e ≥1 no output, a IA inventou. (Cuidado: conte no JSON BRUTO, não só nos arquivos curados — o caso teve "4x" no bruto vs "2x" nos extraídos.)
- **temp/erro vivem em `extra`/`error`** — se você só salvar `inputs`/`outputs` pros sub-agentes, eles marcarão "temp não-verificável". Inclua `extra.metadata.model` e `error` na extração.
- **Guardrail pode existir e mesmo assim deixar passar.** Não conclua "não tem gate" — leia o system prompt INTEIRO do auditor. O caso tinha checagem factual COM carve-out ("omissão da base não é evidência de mentira") + lista de "fatos sensíveis" só comercial → fabricação de pessoa passava. Falha por ESCOPO, não ausência.
- **Modelo preview é munição.** `gemini-3-flash-preview` é o pior dos Flash em over-answer/grounding (AA-Omniscience 91%, Vectara HHEM 13.5%); o juiz num modelo MAIS FRACO que o gerador é anti-padrão. Sempre cheque modelo+temp da peça que gera o texto do cliente.
- **503 "high demand"** nos modelos lite/preview sob carga = guardrail/etapa pode cair no meio do disparo. Conte os `status=error` por modelo.

**Caso de referência completo:** `investigations/2026-06-25-langsmith-jader-hallucination/` (report.md + analise-incidente PDF + evidence/ + raw_traces).
