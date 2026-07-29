# Método de RCA de IA — os 6 gates em detalhe

> Índice: Gate 1 extrair · Gate 2 input-vs-output · Gate 3 quatro camadas · Gate 4 pesquisa · Gate 5 adversarial · Gate 6 síntese. Orquestração no fim.
> INVARIANTE (releia): read-only · verificar>inferir · done=evidência · enumerar antes de analisar · não vazar segredo/PII. Persistir saída de cada gate em `build/<conversa>/`.

## Gate 1 — Extrair + enumerar
Puxe os root runs (`reference/api-access.md` §6a), ordene por `start_time`, gere `run_index.txt` (§6b) e salve `evidence/*` com `extra`+`error` (§6d). Mapeie a topologia: quais agentes, qual modelo/temp cada um, quantos `status=error` e em qual modelo.
**Saída:** `run_index.txt` + `evidence/`. **Gate:** índice cobre 100% dos runs.

## Gate 2 — Localizar (input-vs-output) — o coração
Pegue o trecho/claim suspeito. Rode a busca §6c. Para cada CAMADA de input, prove presença/ausência:

| Camada de input | Onde no run |
|---|---|
| Mensagem do lead | `inputs.input` + `inputs.transcription` (turns do user) |
| System prompt / roteiro | `inputs.checkpoints` (e `formatInstructions`) |
| Base de conhecimento (RAG) | `inputs.informationsFromKnowledgeBases` + (no Information Manager) `outputs.intermediateSteps[].observation` |
| Contexto de produto | `inputs.productContext` |
| Variáveis da campanha | `inputs.campaignVariables` |
| Histórico | `inputs.transcription` |

**Veredito:**
- contagem 0 em TODOS os inputs + ≥1 no output → **alucinação/confabulação** (não foi ambiguidade nem erro de dado).
- ≥1 em algum input → **ambiguidade / erro de cadastro / RAG envenenado** → rastreie a fonte exata e pare aqui (o conserto é no dado/cadastro, não no modelo).
**Gate:** origem provada por contagem, não por leitura parcial. (Conte no JSON BRUTO também — arquivos curados podem dedupar.)

## Gate 3 — Causa-raiz pelas 4 camadas (problema de RESPOSTA)
Para CADA camada, veredito + evidência. As camadas compõem (a alucinação clássica precisa de a+b, com c+d agravando):

**(a) Retrieval / grounding** — habilitador necessário. DUAS perguntas:
- *O que o RAG DEVOLVEU?* O RAG foi chamado, com que pergunta? (`outputs.intermediateSteps[].action.toolInput`) O que voltou? (`observation`) `productContext` vazio? KB entregue ao gerador era placeholder?
- *O que a base TINHA de verdade?* → **cruze com a base real:** `python scripts/kb_fetch.py <conv> --grep "<dado>"` (ver `reference/metabase-kb.md`).
- **Decisão:** dado **ausente** da base → gap de CONTEÚDO (enriquecer). Dado **presente** mas não devolvido → falha de RETRIEVAL (query/embedding/chunking) — base certa, conserto no retrieval. NUNCA crave "faltava na base" sem este cruzamento (o LangSmith sozinho erra isso).

**(b) Prompt** — gatilho dominante.
- Há conflito de diretrizes? (ex: "NÃO crie informações" vs "Nunca negue a informação que o cliente deseja / seu objetivo é vender").
- Existe regra de **grounding** ("responda só com base na fonte")? E de **recusa** ("se não tem, diga que vai verificar / não invente")? grep negativo prova ausência.
- Regras anti-invenção existem mas estão ESCOPADAS a outra coisa (ex: só "prova social")?

**(c) Modelo** — multiplicador.
- Qual modelo/temp na peça que gera o texto do cliente? (`extra.metadata.model`)
- Preview ou estável? Temperatura >0 em tarefa factual?
- Comportamento conhecido? (Gate 4 confirma com benchmark.)

**(d) Guardrail / auditor** — última linha.
- O auditor rodou? Veredito? (`outputs` do Response Auditor: `status`, `triggered_check`, `reason`).
- LEIA O SYSTEM PROMPT INTEIRO dele. Tinha uma regra que pegaria ESTE caso?
- Cuidado com carve-out (ex: "omissão da base não é evidência de mentira") e listas taxativas (ex: "fatos sensíveis" só comercial) → falha por ESCOPO, não ausência.
- O juiz roda em modelo igual/mais forte que o gerador? (lite julgando preview = anti-padrão.)

**Gate:** 4 vereditos com evidência; nenhuma camada pulada.

## Gate 4 — Pesquisa (decisão não-óbvia / toca modelo ou entidade)
Dispare quando: o caso envolve escolha de modelo, comportamento do modelo, ou uma entidade do mundo (confabulação com nome real). Sempre URL aberta + citação curta.
- **Status do modelo:** preview vs GA, deprecação/shutdown anunciado, política do fornecedor de usar preview em prod. (ai.google.dev/docs/models · /changelog · /deprecations).
- **Comportamento conhecido:** benchmarks de alucinação/grounding (Artificial Analysis AA-Omniscience; Vectara HHEM leaderboard).
- **Identidade de entidade:** o nome inventado é real? Ligado ao cliente ou a um concorrente? (confirma confabulação paramétrica).
- **Mitigação:** grounded generation, refusal prompting ("even if a user insists"), faithfulness/groundedness check (RAGAS, Vertex Check-Grounding, Azure Groundedness, HHEM), juiz ≥ gerador, deny-list de concorrentes.
**Gate:** alegações sobre modelo/mundo têm fonte.

## Gate 5 — Verificação adversarial (revisor ≠ autor)
- **Revisor independente:** reconfere CADA citação contra os arquivos; marca o que é overclaim ou não-verificável.
- **Kill-advocate:** pago pra DERRUBAR o veredito (foi ambiguidade? o prompt está ok? a conclusão tem furo?). O que sobrevive ao ataque fica.
- Reverifique itens "não-verificáveis" no JSON bruto (temp, erros, contagens vivem em `extra`/`error`/bruto).
**Gate:** veredito sobrevive; overclaims corrigidos; não-verificáveis marcados.

## Gate 6 — Síntese + relatório
- RCA = resposta direta à pergunta + camadas causais (cada uma com evidência) + fixes P0/P1/P2 acionáveis (cada fix mapeia a uma camada).
- Para negócio/cliente: PDF no padrão canônico (capa AWsales, client-safe, nome sensível redigido — ver memória `reference_pdf_aesthetic` e o caso de referência). Gerar via Chrome headless `--no-pdf-header-footer`; conferir nº de páginas (sem overflow) lendo o PDF.
- Chat LEGÍVEL: prosa, uma ideia por linha, processo antes da conclusão.
**Gate:** relatório separa lido-no-trace de pesquisado; fixes acionáveis.

---

## Orquestração (NN-6) — topologia recomendada
1. **Orquestrador (inline):** Gate 0 (`ls_fetch.py` resolve+puxa) + Gate 1+2 (enumera, prova input-vs-output) + roda `kb_fetch.py` (base real + rag_queries). Salva `evidence/` + `knowledge/`. Não delega isso — é a fundação factual.
2. **Onda de análise (paralela, sobre os arquivos):** 1 agente por camada do Gate 3 (retrieval / prompt / modelo / guardrail) + 1 de verificação mecânica do input-vs-output. **O agente de RETRIEVAL lê `knowledge/*.txt` + `rag_queries.txt` e decide conteúdo-vs-retrieval** (base tinha? RAG buscou? trouxe?). `model: sonnet`. Cada um retorna `{dimensão, veredito, citações verbatim, confiança}`.
3. **Onda de pesquisa (paralela):** status do modelo · comportamento/benchmarks · identidade da entidade · mitigação. Herda modelo (web).
4. **Adversarial:** kill-advocate + revisor independente sobre os achados consolidados.
5. **Síntese:** orquestrador junta, corrige overclaims, escreve o relatório.
**Tier:** haiku=extração/grep · sonnet=análise dimensional · herda=adversarial/pesquisa/síntese. Sub-agentes leem `build/<conversa>/evidence/`, NUNCA a API.
