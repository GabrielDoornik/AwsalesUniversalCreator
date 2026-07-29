# Learnings — pipeline IA legado + gotchas (caso de referência 2026-06-25)

> Índice: 1) Topologia do pipeline multi-agente · 2) Modelos · 3) O caso Jader (padrão de alucinação) · 4) Gotchas que custaram caro · 5) Padrões de melhoria (não só bug).
> Tudo aqui é CACHE — confirme no trace atual (modelos/prompts mudam). Caso completo: `investigations/2026-06-25-langsmith-jader-hallucination/`.

## 1. Topologia do pipeline (IA de vendas/atendimento legado)

Por turno, em sequência, cada agente é um root run `Agent: <X>`:

| Agente | Papel | Campo-chave de saída |
|---|---|---|
| **Information Manager** | RAG: chama `get_knowledge_bases_info`, resume a base | `outputs.intermediateSteps[].observation` (chunks crus) + `outputs.output` (resumo) |
| **Integrations Manager** | tools/integrações | `outputs` (ações) |
| **Copywriter** | ESCREVE o texto enviado ao cliente | `outputs` (a mensagem; aqui mora a alucinação) |
| **Checkpoint Manager** | estado/fluxo do checkpoint | `outputs` |
| **Response Auditor (Semantic)** | GUARDRAIL: julga a resposta antes do envio | `outputs...content` JSON `{status, triggered_check, reason}` |

- Auditor status possíveis: `APPROVED` · `RETRY` (copywriter reescreve) · `HANDOFF` · `FINALIZE` · `BLACKLIST`.
- O Copywriter recebe a saída RESUMIDA do Information Manager em `inputs.informationsFromKnowledgeBases` — **não** os chunks crus do RAG. Se o IM resumir como placeholder, o gerador fica sem o dado mesmo que o RAG tenha trazido algo.

## 2. Modelos (no caso 06-25 — confirme sempre no `run_index`)

| Agente | Modelo | Temp |
|---|---|---|
| Copywriter (gera texto do cliente) | `gemini-3-flash-preview` | 0.5 |
| Integrations Manager | `gemini-3.1-flash-lite` | 0.5 |
| Information / Checkpoint / Response Auditor | `gemini-2.5-flash-lite` | 0.5 |

Pesquisa de status (06-25): `gemini-3-flash-preview` é **preview** (deprecação com 2 semanas de aviso; "most production apps should use a specific stable model"); substituto GA = `gemini-3.5-flash`. **`gemini-2.5-flash-lite` tem shutdown anunciado 16/10/2026** (bomba-relógio: 4 dos 5 agentes usavam). Benchmark: gemini-3-flash-preview é o pior dos Flash em over-answer (AA-Omniscience 91%) e grounding (Vectara HHEM 13.5% vs 3.3% do 2.5-flash-lite).

## 3. O caso Jader — o padrão de alucinação por gap de grounding

Lead cético pediu credenciais ("se apresentar / mande os dados da academia"). A IA respondeu *"A Academia Criminal é liderada pelo Dr. Jader Marques, que tem mais de 30 anos de plenário"* — **falso**: Jader Marques é advogado real do júri, fundador de uma escola CONCORRENTE, não do cliente. A string "Jader" tinha contagem **0 em todos os inputs** e 4 no bruto (só output + cópia ao auditor) → confabulação paramétrica pura.

**Cadeia causal (as 4 camadas):**
- (a) RAG **devolveu** links/diferenciais/módulos, sem quem lidera/fundou; `productContext` vazio. **MAS a base TINHA "Felipe Azuma, Coordenador" — o RAG não trouxe (ver gotcha §4: era falha de RETRIEVAL, não gap de conteúdo).**
- (b) Prompt do Copywriter: "NÃO crie informações" (fraca) sobreposta por "Nunca negue a informação que o cliente deseja / seu objetivo é vender" + "fale algo de acordo com os dados que você tem"; **sem regra de grounding nem de recusa**.
- (c) `gemini-3-flash-preview` temp 0.5 — preview, alto over-answer → puxou um nome real famoso do treino.
- (d) Response Auditor **APROVOU** (`triggered_check: null`) — tinha checagem factual MAS com carve-out "omissão da base não é evidência de mentira" + lista de "fatos sensíveis" só comercial (preço/parcela/desconto…); liderança/pessoa fora do escopo → passou.

**Fixes (mapeados às camadas):** P0 = **consertar o RETRIEVAL** (a base tinha o coordenador e o RAG não trouxe — query/embedding/chunking/threshold) + trava anti-fabricação no auditor (omissão de fonte = sem suporte; ampliar escopo p/ pessoa/credencial) + inverter prompt do Copywriter ("só da base; se não tem, não invente, mesmo que o cliente insista") + deny-list de concorrentes. P1 = verificador de groundedness por claim · juiz ≥ gerador · modelo estável. P2 = temp ~0 · *enriquecer a base = só defesa-em-profundidade aqui (a base já tinha o dado), não a causa.*

## 4. Gotchas que custaram caro

- **A query 1x traz tudo** (`inputs`/`outputs`/`extra`/`error`). Child runs raramente necessários.
- **429 agressivo** — serialize + backoff ~12s; `/bin/sleep` foreground bloqueado (use `perl -e 'select(...)'`).
- **Conte no JSON bruto, não só nos arquivos curados** — o caso teve "4x Jader" no bruto vs "2x" extraído (dedup). A substância (só em output) é o que vale.
- **Inclua `extra.metadata.model` e `error` na extração** — senão sub-agentes marcam temp/503 como "não-verificável". (No caso, temp 0.5 e 7×503 ESTAVAM no bruto, só faltaram nos arquivos curados.)
- **Não conclua "não tem gate" sem ler o prompt INTEIRO do auditor.** O overclaim "auditor não tem checagem factual" foi pego pelo kill-advocate — tinha, com carve-out. Falha por ESCOPO ≠ ausência. Isso MUDA o fix (corrigir carve-out vs criar do zero).
- **Juiz mais fraco que gerador** (lite julgando preview) é anti-padrão — baixa recall em alucinação.
- **503 "high demand"** nos lite/preview sob carga: o próprio auditor caiu 1× no caso → guardrail intermitente durante disparo.
- **A UI de triggers do auditor ≠ prompt.** No painel, "Lie Detector" aparece como "ação sem ferramenta", mas o prompt embute também consistência factual (com o carve-out). Confirme no prompt, não só no rótulo da UI.
- **NUNCA crave "a base não tinha" sem cruzar a base real (Metabase).** O LangSmith só mostra o que o RAG DEVOLVEU. No caso Jader, o LangSmith-sozinho concluiu "gap de conteúdo (a base não tinha quem lidera)" — mas o `kb_fetch.py` provou que a base TINHA "Felipe Azuma, Coordenador" (fonte de 4.865 chars); o RAG é que não trouxe. Causa real = **falha de retrieval**, não conteúdo. Sempre rode `scripts/kb_fetch.py <conv> --grep "<dado>"` antes de fechar o Gate 3a. (Detalhe: `reference/metabase-kb.md`.)

## 5. Não é só caça-bug — serve pra MELHORIA no geral

O mesmo método acha oportunidades, não só falhas:
- **Prompts** que over-disparam (handoff/finalize cedo), repetem nome demais, ou têm conflito de diretrizes.
- **Gates faltando/mal-escopados** no auditor (cada falha vira um trigger novo — custom trigger anti-fabricação foi o conserto P0).
- **Modelo mal configurado** (preview em prod, temp alta em tarefa factual, juiz fraco, modelo com shutdown próximo).
- **RAG sem grounding** (base não responde perguntas óbvias do funil → enriquecer a base vira diferencial de venda).
- **Custo/latência** (tokens por turno, modelo caro onde um lite resolve, 503 sob carga).
Para varredura de melhoria: amostre N conversas (não 1), rode Gate 1–3 em cada, e agregue os padrões recorrentes — aí prioriza P0/P1/P2 por frequência × impacto.
