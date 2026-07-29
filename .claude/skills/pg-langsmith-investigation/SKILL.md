---
name: pg-langsmith-investigation
description: 'Acessa TUDO de uma conversa de IA a partir de um link (LangSmith OU neo.awsales.io) — trace completo + base de conhecimento real e o que o RAG buscou (Metabase/banco NEO) — e faz o que o usuário pedir: investigar (alucinação, resposta errada, handoff indevido, loop), otimizar (prompt/gates/retrieval/fluxo), analisar custo/latência, ou só responder uma pergunta sobre a conversa. Só precisa do link ou id (conversation_id, run_id ou UUID cru) — acha o id, baixa o trace e cruza com a base sozinha; distingue "a base não tinha" de "a base tinha e o RAG não achou". Use quando o usuário mandar um link/id de conversa (smith.langchain.com ou neo.awsales.io) e pedir qualquer coisa sobre ela: "investiga", "a IA alucinou/errou", "por que respondeu X", "otimiza esse prompt/fluxo", "analisa o custo", "o auditor não pegou", "RCA de IA".'
---

Follow the instructions in ./workflow.md.
