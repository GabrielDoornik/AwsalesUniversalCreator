# LangSmith API — Acesso read-only, queries e extração

> Índice: 0) Resolver autocontido · 1) Auth + URL · 2) Endpoint de query · 3) Filtros · 4) Estrutura de um run · 5) Rate limit/backoff · 6) Scripts de extração prontos.
> INVARIANTE: read-only. Só `POST /runs/query` e `GET`. Nunca mutar.

## 0. Resolver autocontido (`scripts/ls_fetch.py`) — use isto primeiro

Não parseie URL na mão. `python scripts/ls_fetch.py "<qualquer link ou id>"` se vira com os 4 formatos e puxa a conversa inteira:

| Entrada | Resolve por |
|---|---|
| URL LangSmith c/ `conversation_id` no filtro | projeto+conv direto da URL |
| URL LangSmith c/ `run_id` no filtro | query no projeto pelo `run_id` → `conversation_id` no `extra.metadata` |
| URL do neo `neo.awsales.io/conversations?id=<conv>` | lista projetos da org → busca multi-session pela conv |
| UUID cru | tenta conversation_id; fallback run_id |

Saída: `<skill>/build/<conv>/raw_query.json` + `run_index.txt` + resumo (projeto, conv, nº de runs). Key vem de `LANGSMITH_API_KEY` ou de `.env.local` na raiz da skill. Detalhe de parsing: o script desencoda `+`→espaço e `\"`→`"` (a URL do LangSmith encoda espaço como `+`).

> ⚠️ **Segurança (diferente do zip original):** o zip distribuído pro time trazia a key **embutida no código**, decisão tomada assumindo repo privado (PG 2026-06-26). **Este repositório é PÚBLICO**, então a key foi retirada do código e movida pra `.env.local` (gitignorado). Nunca cole a key de volta num arquivo versionado. Mesmo sendo read-only, ela dá acesso de leitura a TODOS os traces da org — conversas reais de lead, com PII.

## 1. Auth + parsear a URL (manual — só se o resolver não cobrir)

- Base: `https://api.smith.langchain.com`
- Header: `x-api-key: lsv2_pt_...` (lida de `.env.local` / `$LANGSMITH_API_KEY` — nunca do código).
- A UI do LangSmith: `https://smith.langchain.com/o/<ORG>/projects/p/<PROJECT>?...`
  - `<ORG>` = organização (id em `/o/<ORG>/`).
  - `<PROJECT>` = projeto = **"session"** no vocabulário da API (id em `/projects/p/<PROJECT>`).
  - O `searchModel`/`filter` (URL-encoded, espaço = `+`) traz `metadata_key` + `metadata_value`: pode ser `conversation_id` OU `run_id`.
  - **Projeto desconhecido** (link do neo / id cru): `GET /sessions?limit=100&offset=N` (pagina; ~200 projetos, 1 por org) → `POST /runs/query` com `session=[todos]` + filtro `conversation_id` → o `session_id` do run achado É o projeto.
  - Org-wide SEM session não é permitido (400: "At least one of 'session'...").

## 2. Endpoint de query

`POST /runs/query` — corpo JSON. Campos úteis:
- `session`: `["<PROJECT>"]` (array de project ids).
- `filter`: string no DSL do LangSmith (ver §3).
- `select`: array de campos (opcional; sem ele vem o run completo).
- `limit`: até 100; pagina com `cursor` (vem em `cursors` na resposta).

Resposta: `{ "runs": [...], "cursors": {...}, "parsed_query": {...} }`.

## 3. Filtros (DSL)

- Só roots de UMA conversa:
  `and(eq(is_root, true), and(eq(metadata_key, "conversation_id"), eq(metadata_value, "<id>")))`
- Por tipo de run: `eq(run_type, "llm")` / `eq(run_type, "chain")`.
- Por erro: `eq(error, null)` (sucesso) — ou filtrar `status` no cliente.
- Por nome: `eq(name, "Agent: Copywriter")`.
- Por janela de tempo (achar conversas sem ter a URL/id): `gt(start_time, "2026-06-24T00:00:00Z")` (+ `lt(...)`). Combine com `eq(is_root, true)` e pagine; depois leia o `conversation_id` de cada root em `extra.metadata`.
- Combine com `and(...)` / `or(...)` aninhados (sempre 2 args por operador).

## 4. Estrutura de um root run (o que importa)

```
id, name ("Agent: Copywriter"), run_type ("chain"|"llm"), status ("success"|"error"),
start_time, end_time, error  (← 503/timeout vêm aqui, string),
inputs  { input, checkpoints, campaignVariables, transcription,
          informationsFromKnowledgeBases, productContext, tools, formatInstructions, ... },
outputs { ... texto/estrutura gerada ... },
extra.metadata {
   conversation_id, campaign_id, conversation_agent_session_id,
   model { kwargs.model, kwargs.temperature },   ← MODELO + TEMPERATURA
   model_name, ls_model_name, ls_provider
},
total_tokens, prompt_tokens, completion_tokens, total_cost
```
- **inputs/outputs já trazem todo o contexto** (system prompt, KB, histórico, geração). Raramente precisa dos child runs.
- Para o LLM cru (mensagens system/human), runs `run_type="llm"` têm `inputs.messages` (lista de `{kwargs:{content}}`).

## 5. Rate limit + backoff (CRÍTICO)

A API devolve **429 `{"detail":"Rate limit exceeded."}`** sob a menor rajada (inclusive 2 chamadas quase simultâneas). Regras:
- **Serialize.** Uma chamada por vez. Nunca paralelize queries contra a API.
- **Backoff ~12s** entre tentativas; 2–3 tentativas costumam bastar.
- **`/bin/sleep` em foreground é bloqueado no harness** → use `perl -e 'select(undef,undef,undef,12)'`.
- Sub-agentes **não** chamam a API — o orquestrador extrai pra `build/<conversa>/` e os agentes leem os arquivos.

## 6. Scripts prontos

### 6a. Puxar com retry até 200
```bash
KEY="$LANGSMITH_API_KEY"; PROJECT="..."; CONV="..."; OUT=build/$CONV
mkdir -p "$OUT"
for i in 1 2 3 4 5; do
  code=$(curl -s -X POST "https://api.smith.langchain.com/runs/query" \
    -H "x-api-key: $KEY" -H "Content-Type: application/json" \
    -d "{\"session\":[\"$PROJECT\"],\"filter\":\"and(eq(is_root, true), and(eq(metadata_key, \\\"conversation_id\\\"), eq(metadata_value, \\\"$CONV\\\")))\",\"limit\":100}" \
    -o "$OUT/raw_query.json" -w "%{http_code}")
  echo "try $i -> $code"; [ "$code" = "200" ] && break
  perl -e 'select(undef,undef,undef,12)'
done
```

### 6b. Índice dos runs (agente · modelo · temp · status · tokens · erro)
```python
import json
d=json.load(open('build/<conv>/raw_query.json')); runs=sorted(d['runs'],key=lambda x:x['start_time'])
for i,r in enumerate(runs):
    md=(r.get('extra') or {}).get('metadata',{}); mdl=md.get('model',{})
    t=mdl.get('kwargs',{}).get('temperature') if isinstance(mdl,dict) else None
    print(f"{i:2d} {r['start_time'][11:19]} {r['status']:7s} {r['name']:34s} "
          f"model={md.get('model_name') or md.get('ls_model_name')} temp={t} "
          f"tok={r.get('total_tokens')} err={'Y' if r.get('status')=='error' else ''}")
```
Exemplo de saída (o "as expected" do Gate 0):
```
 0 12:49:29 success Agent: Checkpoint Manager     model=gemini-2.5-flash-lite temp=0.5 tok=1840 err=
 1 12:49:49 success Agent: Information Manager     model=gemini-2.5-flash-lite temp=0.5 tok=2587 err=
 2 13:02:15 error   Agent: Response Auditor (Sem.) model=gemini-2.5-flash-lite temp=0.5 tok=0 err=Y
```

### 6c. Busca input-vs-output de uma string (o teste decisivo)
```python
import json
d=json.load(open('build/<conv>/raw_query.json')); runs=d['runs']; NEEDLE="Jader"
for r in runs:
    for fld in ('inputs','outputs'):
        if NEEDLE in json.dumps(r.get(fld,{}),ensure_ascii=False):
            print(r['name'], fld)            # onde aparece
print("total no JSON bruto:", json.dumps(d,ensure_ascii=False).count(NEEDLE))
# Veredito: se só aparece em 'outputs' → alucinação. Se em 'inputs' → rastrear a fonte.
```

### 6d. Salvar evidência pros sub-agentes (inclua extra+error!)
```python
import json,os
d=json.load(open('build/<conv>/raw_query.json')); runs=sorted(d['runs'],key=lambda x:x['start_time'])
E='build/<conv>/evidence'; os.makedirs(E,exist_ok=True)
for r in runs:
    rid=r['id'][:8]
    json.dump({'name':r['name'],'status':r['status'],'error':r.get('error'),
               'model':(r.get('extra') or {}).get('metadata',{}).get('model'),
               'inputs':r.get('inputs'),'outputs':r.get('outputs')},
              open(f"{E}/{rid}-{r['name'].replace(': ','_').replace(' ','_')}.json",'w'),
              ensure_ascii=False,indent=2)
```
