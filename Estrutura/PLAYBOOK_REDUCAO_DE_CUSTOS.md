# PLAYBOOK — Redução de custos de campanha

Como investigar o custo de qualquer campanha AWSales no banco, achar onde o dinheiro vai e cortar sem quebrar as tools. Encodado a partir do caso SDR Lucas Firmino / D'Leon (julho de 2026).

Ferramenta: `.claude/skills/pg-langsmith-investigation/`. Tudo somente leitura.

---

## Passo 0 — Onde os dados estão (o que mais custa tempo)

| Banco | id | O que tem |
|---|---|---|
| **APP** (`awsales_db`) | **3** | custos, tarifas, tokens, campanhas, leads, conversas, mensagens |
| **NEO** (`awsales_backoffice_db`) | 7 | bases de conhecimento, **execuções de tool** (`messages_tools_executions`) |

Custo vive no **db 3**. Sucesso de tool vive no **db 7**. Procurar no banco errado dá zero e leva à conclusão falsa de que o dado não existe.

**LangSmith não serve para custo aqui.** Campanhas do legado nem trace têm. Todo o playbook abaixo roda só com SQL.

```bash
cd .claude/skills/pg-langsmith-investigation
python scripts/mb_query.py --db 3 "SELECT ..."
python scripts/mb_query.py --db 3 --tables "%custo%"      # procurar tabela
python scripts/mb_query.py --db 3 --columns costs         # ver schema
```

---

## Passo 1 — A cadeia do custo

```
costs                      uma linha por cobrança
  ├─ organization_id       filtro principal
  ├─ lead_id               a única ponte até a campanha
  ├─ total_value           valor em USD
  ├─ fee_id    ──────────► fees.type  = QUAL SUB-AGENTE     ← a chave da análise
  │                        fees.name  = modelo + input/output
  └─ token_id  ──────────► tokens.input / tokens.output / tokens.model
```

Três armadilhas confirmadas:

- **`costs` não tem `campaign_id`.** Atribuir por `lead_id` → `conversion_window.campaign_id`. Leads que aparecem em duas campanhas do mesmo cliente têm que ser excluídos ou contados à parte.
- **`fee_token_id_v2` vem NULO** nas orgs do legado. Usar `fee_id` e `token_id` (v1).
- **`total_value` é USD.** `total_value_brl_cents` só existe a partir de 05/06/2026. O câmbio real está em `usd_brl_rate`, na própria linha.

---

## Passo 2 — `fees.type` traduz para sub-agente

Este mapa é o que transforma a tabela de custo em diagnóstico:

| `fees.type` | Sub-agente |
|---|---|
| `MEMORY` | Checkpoint Manager |
| `RETRIEVAL` | Information Manager |
| `RESPONSE` | Copywriter |
| `GUARDRAIL_COPYWRITER` | Response Auditor |
| `PLANNING` | Integration Manager |
| `TOOLS` | Integration Runner |
| `FOLLOWUP_ANALYSIS` / `FOLLOWUP_RESPONSE` | Smart Follow-Up |
| `ABANDONED` | fluxo de abandono |
| `STRATEGIC_ANALYZER`, `TRANSCRIPTION` | analisador estratégico, transcrição de áudio |
| *(nulo)* | cobrança fixa: `mensagem_enviada`, `mensagem_recebida`, `active_lead`, `disparo_marketing` |

**Não confie na intuição de qual agente é caro.** O CLAUDE.md dizia desde abril que o Copywriter e o Integration Manager pagavam a conta; em julho o Copywriter era 5% e o Checkpoint Manager 36%. Meça sempre.

---

## Passo 3 — Recorte a janela certa

Se houve otimização de plataforma no período, **medir só depois dela**. Misturar antes e depois esconde o efeito.

Para achar o degrau, olhar tokens médios por chamada por dia e por agente — isso independe de volume:

```sql
SELECT c.created_at::date AS dia, f.type::text AS agente,
       count(*) AS chamadas, round(avg(t.input)) AS in_medio, round(avg(t.output)) AS out_medio
FROM costs c JOIN fees f ON f.id=c.fee_id JOIN tokens t ON t.id=c.token_id
WHERE c.organization_id='<org>' AND f.name LIKE '%_input' AND c.created_at >= '<data>'
GROUP BY 1,2 ORDER BY 2,1
```

Queda brusca de input ou output num único agente = alguém mexeu no prompt daquele agente.

---

## Passo 4 — A razão que acha o dinheiro

**Normalize tudo pelo número de chamadas do `RESPONSE`.** Ele é a única métrica que corresponde ao que o lead lê. Todo o resto é máquina em volta.

No caso D'Leon: 371 respostas geraram 1.167 chamadas do Checkpoint Manager, 1.547 buscas, 702 auditorias e 918 do fluxo de abandono.

O achado que explicou tudo: **o Checkpoint Manager roda uma vez por mensagem ENVIADA, não por resposta gerada.** A IA mandava quase 3 balões por resposta, o que triplicava o item mais caro da conta.

```sql
-- balões por resposta: se passar de 2, o agente mais caro está sendo multiplicado à toa
SELECT count(*) FILTER (WHERE sent_by IS NULL) AS enviadas,
       count(*) FILTER (WHERE sent_by='user') AS do_lead
FROM messages m JOIN conversion_window cw ON cw.id=m.conversation_id
WHERE cw.campaign_id='<campanha>' AND cw.start_at >= '<data>'
```

---

## Passo 5 — Tarifa fora do padrão

**Todos os agentes cobram USD 0,0025 por mil tokens de input.** Divida o valor cobrado pelos tokens registrados; qualquer agente fora dessa marca é anomalia de cobrança, não escolha de modelo.

```sql
SELECT f.type::text AS agente,
       round((sum(c.total_value)/sum(t.input)*1000)::numeric,5) AS usd_por_1k_input
FROM costs c JOIN fees f ON f.id=c.fee_id JOIN tokens t ON t.id=c.token_id
WHERE c.organization_id='<org>' AND f.name LIKE '%_input' AND c.created_at >= '<data>'
GROUP BY 1 ORDER BY 2 DESC
```

No caso D'Leon o Checkpoint Manager passou a cobrar 0,00449 depois de uma otimização, quase o dobro dos demais, sem que a tarifa cadastrada mudasse — ~R$ 115/mês só nessa campanha. Isso é pedido para o time de plataforma, não conserto nosso.

---

## Passo 6 — Separe o que é seu do que é da plataforma

**Alavancas do CS:**

1. **Tamanho do checkpoint.** É carregado em toda chamada do Checkpoint Manager, do Auditor, do Integration Manager e do Copywriter. Some as chamadas desses quatro para dimensionar o ganho: cada 1.000 tokens cortados valem `chamadas × 1000 × 0,0025 / 1000` dólares no período.
2. **Modelo por sub-agente.** Verificar se sobrou alguém fora do `gemini-3.1-flash-lite`, que hoje é o melhor custo-benefício. Costuma sobrar `gpt-4-1` em transcrição (não dá para trocar, é áudio), no fluxo de abandono e na resposta do follow-up.

**Da plataforma, não adianta pedir para o CS:** fragmentação de mensagens, escopo do Response Auditor, frequência do fluxo de abandono e correção de tarifa.

Diga isso explicitamente no diagnóstico. No caso D'Leon o teto do que o CS conseguia sozinho era 12% a 14%; o resto dependia de produto.

---

## Passo 7 — Cortar o checkpoint sem quebrar as tools

Ordem de corte, da mais segura para a mais arriscada:

1. **Repetição interna.** Quase sempre é o maior ganho e tem risco zero. Procure a mesma regra escrita em Limites, Regras de Conversa, Roteador, Fluxo e "Situações Específicas". No D'Leon a regra de preço aparecia 4 vezes e uma seção inteira repetia duas outras.
2. **Bloco de Follow-Up Inteligente.** Não pertence ao checkpoint: é configurado no painel e mora no `MENSAGENS_FOLLOWUP.md`.
3. **Conteúdo já coberto por FAQ.** Antes de cortar, **abrir a FAQ e confirmar que a resposta existe e diz a mesma coisa**. Se não existir, criar a FAQ em vez de manter o texto no checkpoint.
4. **Listas verbosas de campos de estado**, comprimidas para uma linha sem perder as opções.

**Nunca cortar:** a seção de Tools, a etapa do fluxo que invoca as tools, formato de data, tratamento de erro (`ok false` não é agenda vazia), ordem das chamadas, campos de estado que o Smart FUP lê, e os scripts de mensagem usados palavra por palavra.

**Fica nos dois lugares** o que é comportamento que a IA precisa seguir sempre: como responder preço, como conduzir caso sensível, o que nunca prometer. FAQ é o que ela sabe; checkpoint é como ela age.

Validação obrigatória no final:

```bash
grep -o "@[a-z_]*" Checkpoint.md | sort | uniq -c    # todas as tools continuam invocadas?
grep -ci "utilize a tool para .*@" Checkpoint.md      # formato correto em todas?
```

Comparar com o checkpoint que está em produção, que é a verdade:

```sql
SELECT length(current_checkpoint), left(current_checkpoint, 200)
FROM messages m JOIN conversion_window cw ON cw.id=m.conversation_id
WHERE cw.campaign_id='<campanha>' AND current_checkpoint IS NOT NULL
ORDER BY m.datetime DESC LIMIT 1
```

Um checkpoint de campanha com tool costuma ter piso entre 15 e 17 mil caracteres. Abaixo disso começa a sair lógica de tool. Prometer "voltar aos 11 mil" numa campanha com quatro tools é promessa que não se cumpre.

---

## Passo 8 — Fechar

Diga sempre três coisas: o custo por chamada (não só o total, porque volume distorce), quanto cada alavanca vale em reais por mês, e o que depende da plataforma.

Recomende medir de novo em 7 dias.

---

## Gotchas que custaram tempo

- `ILIKE '%termo%'` na tabela `messages` sem filtro de conversa dá **HTTP 504**. Escopar sempre.
- Metabase bloqueia User-Agent `Python-urllib` com **403**. Mandar `curl/8.4.0` (os scripts já fazem).
- `messages.current_checkpoint` guarda o checkpoint INTEIRO em cada linha. Selecionar cru infla a saída em milhares de linhas — usar `left(...)`.
- `costs.quantity` arredonda para milhares e vira **0** quando o agente usa poucos tokens, mesmo com valor cobrado. Para custo por chamada, dividir `total_value` pelo número de linhas, nunca por `quantity`.
- Erro do Metabase vem truncado em 200 caracteres pelo `kb_fetch`; usar `mb_query.py`, que mostra 400.

## Caso de referência

SDR Lucas Firmino V2 (`ab66f06f-…`), org D'Leon (`b1da232c-…`), julho de 2026. Análise completa em `Lucas Firmino/SDR/Analise de custos - SDR V2 (30-07-2026).html`.
