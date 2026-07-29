# Metabase — cruzar com a base de conhecimento REAL (read-only)

> Por quê: o LangSmith mostra só o que o RAG **devolveu**. Pra saber se a base **TINHA** o dado (RAG errou = falha de retrieval) ou **NÃO tinha** (gap de conteúdo), tem que ler o conteúdo real da KB. Isso muda o fix.
> INVARIANTE: **só SELECT** (read-only). Nunca INSERT/UPDATE/DELETE/DDL. db `7` = NEO (awsales_backoffice_db).

## Atalho: o script

```bash
python scripts/kb_fetch.py <conversation_id> --grep "Felipe Azuma,coordenador,fundador"
```
Resolve a cadeia, puxa o `extracted_content` de todas as fontes das KBs (playbook+product) que a conversa usou pra `build/<conv>/knowledge/`, diz se cada termo do `--grep` está ou não na base, **e salva `rag_queries.txt`** (o que o RAG REALMENTE buscou + scores — via `messages_rag_documents`). Key Metabase (read-only) vem de `.env.local` ou de `$METABASE_API_KEY` — nunca do código, porque este repo é público.

**O triângulo do retrieval** (o que a skill te dá junto): (1) *o que o RAG buscou* — `rag_queries.txt`; (2) *o que a base tinha* — `knowledge/*.txt` + grep; (3) *o que chegou no modelo* — trace LangSmith. Se a base tinha mas o RAG não trouxe → falha de **retrieval**; se o RAG nem buscou pelo tema (nenhuma query sobre liderança) → **query mal formulada**; se a base não tinha → gap de **conteúdo**.

## A cadeia (schema NEO, confirmado 2026-06-26)

```
conversation_id
  └─ messages.conversation_agent_session_id            (1 conversa → 1+ agent-session)
       └─ conversations_agents_sessions.id
            ├─ playbook_knowledge_base_id
            └─ product_knowledge_base_id
                 └─ knowledge_bases_sources.knowledge_base_id
                      └─ extracted_content   ← o TEXTO real da base (o que o RAG deveria achar)
```
Tabelas-chave (db 7): `messages`, `conversations_agents_sessions`, `knowledge_bases`, `knowledge_bases_sources`. Forensics de retrieval: **`messages_rag_documents`** (por mensagem: `query` que o RAG formulou, `document_id` do chunk, `score` de similaridade) — mostra EXATAMENTE o que o RAG buscou e com que score. `messages_tools_executions` (tools chamadas).
- ⚠️ `messages_rag_documents.document_id` é id de chunk no **Pinecone** (vetorial) — NÃO dá join no SQL pra pegar o texto do chunk. O que dá pra cravar pelo SQL: a `query` usada e os `score`s. O texto-fonte completo vem de `knowledge_bases_sources.extracted_content`.
- `knowledge_bases`: id, **type** (playbook|product), name, organization_id, pinecone_* (a busca é vetorial via Pinecone — por isso o RAG pode errar mesmo com o dado na base).
- `knowledge_bases_sources`: knowledge_base_id, source, source_type (file|text), **extracted_content** (o texto).
- Playbook e product KB às vezes apontam pras MESMAS fontes (mesmo arquivo subido nas duas) — o script **flagga duplicatas por hash** (`dup_of` no `_manifest.json`); escreve todas no disco, não remove.
- `rag_queries.txt` é **best-effort**: se `messages_rag_documents` faltar/falhar, o script segue sem ele e você perde 1 vértice do triângulo (o que o RAG buscou) — aí use só base-vs-trace.

## API Metabase (manual, se precisar)

- Base: `https://metabase.awsales.io` · Auth: header `x-api-key: mb_...` (de `.env.local` / `$METABASE_API_KEY`)
- Query: `POST /api/dataset` body `{"database":7,"type":"native","native":{"query":"SELECT ..."}}` → linhas em `data.rows`, colunas em `data.cols[].name`.
- **GOTCHA (custou tempo):** Metabase **bloqueia User-Agent `Python-urllib`** (403). Mande `User-Agent: curl/8.4.0` (ou use curl). O script já faz isso.
- Escape de `'` em SQL inline: dobre (`''`). Aspas aninhadas no shell são um inferno → use o script/python, não curl à mão.

## A distinção que isto entrega (o ponto todo)

Depois de puxar a base, grep pelo dado que a IA deveria saber:
- **NÃO está na base** → gap de CONTEÚDO → fix = enriquecer a base.
- **ESTÁ na base mas o RAG não devolveu** (compare com `informationsFromKnowledgeBases`/`observation` do trace) → falha de RETRIEVAL (query mal formada, embedding/chunking, threshold) → fix = no retrieval, **não** no conteúdo. A base está certa.

**Caso Jader (2026-06-25), reanalisado com Metabase:** grep na base real → `Jader` NÃO existe (confirma alucinação paramétrica), MAS `Felipe Azuma` / `coordenador` / `fundador` ESTAVAM na base (fonte playbook de 4.865 chars: *"# Felipe Azuma — Coordenador da pós de Academia Criminal / Tribunal do Júri... 24 anos de advocacia criminal"*). O RAG perguntou "Quais são os dados da Academia Criminal?" e trouxe só links/diferenciais/módulos — **não trouxe a fonte do coordenador**. Conclusão refinada: a causa do Gate 3a era **falha de retrieval**, não "a base não tinha" (que foi o que o LangSmith sozinho sugeriu). Lição: **sempre cruzar com a base antes de cravar "gap de conteúdo".**

## Queries úteis (read-only)

```sql
-- conversa → kb ids
SELECT cas.id, cas.playbook_knowledge_base_id, cas.product_knowledge_base_id
FROM conversations_agents_sessions cas
WHERE cas.id IN (SELECT DISTINCT conversation_agent_session_id FROM messages WHERE conversation_id='<conv>');

-- a base tinha o termo? (presença + tamanho por fonte)
SELECT kb.type, kbs.source_type, length(kbs.extracted_content) AS len,
       (kbs.extracted_content ILIKE '%<termo>%') AS tem
FROM knowledge_bases_sources kbs LEFT JOIN knowledge_bases kb ON kb.id=kbs.knowledge_base_id
WHERE kbs.knowledge_base_id IN ('<playbook_kb>','<product_kb>') ORDER BY kb.type, len DESC;

-- trecho em torno do termo (pra ler o que a base diz de fato)
SELECT substring(extracted_content from greatest(1, strpos(lower(extracted_content),'<termo>')-220) for 520)
FROM knowledge_bases_sources WHERE knowledge_base_id='<kb>' AND extracted_content ILIKE '%<termo>%' LIMIT 1;

-- o que o RAG REALMENTE buscou nesta conversa (query + nº docs + scores)
SELECT mrd.query, count(*) AS docs, min(mrd.score) AS score_min, max(mrd.score) AS score_max
FROM messages_rag_documents mrd JOIN messages m ON m.id=mrd.message_id
WHERE m.conversation_id='<conv>' GROUP BY mrd.query ORDER BY max(mrd.score) DESC;
-- Caso Jader: "Quais são os dados da Academia Criminal?" → 1 doc @85; nenhuma query trouxe o chunk do coordenador.
```
