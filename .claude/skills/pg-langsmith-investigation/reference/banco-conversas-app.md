# Banco APP (db 3) — conversa real a partir de TELEFONE

> Encodado a partir do caso Falcão das Milhas / Onboarding 1 e 2 (2026-07-29). O que custou tempo naquele caso está aqui como fato, não como descoberta a repetir.
> INVARIANTE: só SELECT. Nunca INSERT/UPDATE/DELETE/DDL. Não colar telefone, e-mail ou nome de lead em arquivo versionado — este repo é público.

## O erro de partida que este doc evita

A skill nasceu apontando pro **NEO (db 7)**, e é lá que vive a base de conhecimento. Mas a **conversa** das campanhas do legado NÃO está lá — está no **APP (db 3)**. Procurar `conversion_window` no db 7 dá zero, e a conclusão errada é "não existe". Existe, no outro banco.

Pior: campanhas do legado podem **não ter trace no LangSmith**. No caso Falcão, `conversion_window.channel_conversation_id` vinha nulo e o `ls_fetch.py` não achou a janela em nenhum projeto. Então o Gate 0 da skill (puxar o trace) simplesmente **não se aplica** — e prometer análise de trace/modelo/auditor ali é overclaim. Diga que não há trace e analise pelo banco.

## Os bancos do Metabase (confirmado 2026-07-29)

| id | nome | engine | o que tem |
|---|---|---|---|
| **3** | APP (awsales_db / Plataforma) | postgres | **conversas, mensagens, leads, campanhas, conversion_window** |
| **7** | NEO (awsales_backoffice_db) | postgres | knowledge_bases, messages_rag_documents (o que `kb_fetch.py` usa) |
| 4 / 8 | Awsales 3.0 / Awsales 3 | mysql | — |
| 6 | Big query (Legado) | bigquery | — |

## A cadeia (db 3)

```
telefone
  └─ leads."phoneNumber"          formato: 55 + DDD + 9 + numero, só dígitos, sem "+"
       │                          ⚠️ o MESMO telefone existe em várias orgs → filtrar organization
       └─ conversion_window.lead_id        (1 lead → N janelas, 1 por campanha/disparo)
            └─ conversion_window.id  ==  messages.conversation_id     ← A CHAVE NÃO ÓBVIA
                 └─ messages (content, from, to, is_template, is_followup, current_checkpoint...)
```

`conversion_window.id` **é** o `conversation_id` das mensagens. Não existe tabela `conversations` no db 3 — a janela É a conversa. A tabela `whatsapp_conversation_conversion_window` NÃO tem coluna `conversion_window_id` (as colunas são `whatsapp_conversation_id` e `conversation_id`) — não perca tempo com ela.

## Atalho: o script

```bash
python scripts/conv_fetch.py --phone "<telefone do lead>" --org falc --campaign onboarding
#  → build/<lead_id>/janelas.txt (estado de cada janela)
#  → build/<lead_id>/conversa.txt (transcrição, direção IA/LEAD, TEMPLATE/FUP/ckpt)
python scripts/mb_query.py --db 3 --tables "%conversion%"     # procurar tabela
python scripts/mb_query.py --db 3 --columns conversion_window # schema
python scripts/mb_query.py --db 3 "SELECT ..."               # SELECT ad-hoc
```
O `--phone` aceita qualquer formatação: usa os últimos 8 dígitos como sufixo, então é imune a `+55`, DDD e ao 9 do celular.

## Campos de `conversion_window` (24 colunas) — o que presta e o que engana

Prestam: `start_at`/`end_at`, `window_status` (`available`, `message_failed`), `status` (`encerrada`), `trigger_type` (`ativa`, `receptiva`), `campaign_id`, `lead_id`, `human_handoff_on` + `human_handoff_on_at`.

**Vêm NULOS com frequência** (no caso Falcão, em 11 de 11 janelas): `resume`, `interaction`, `lead_status`, `smart_fup_took_control`, `channel_conversation_id`. **Nunca use ausência deles como prova de que nada aconteceu** — a conversa tinha 42 mensagens com interação óbvia e `interaction` era nulo. Se o achado depender de um desses campos, o achado é sobre a instrumentação, não sobre o lead.

Corolário útil: `human_handoff_on = false` enquanto a IA **disse** ao cliente que ia encaminhar é um achado forte — significa que a promessa foi feita e nenhuma flag subiu, então o Smart FUP continua disparando sobre um caso escalado.

## Gotchas de `messages` (custaram tempo)

- **`current_checkpoint` carrega o checkpoint INTEIRO em cada linha.** Selecionar cru transforma 42 mensagens em 2.079 linhas de arquivo. Use `left(coalesce(current_checkpoint,''),1)` só pra saber SE veio, ou `left(...,60)` pra identificar qual é.
- **`thought` veio vazio** em todas as mensagens do caso — não conte com raciocínio do agente aqui (isso é o que o LangSmith daria, quando há trace).
- **Direção só por `from`/`to`.** Antes de afirmar "a IA disse X", confirme `from` = número da campanha e `to` = telefone do lead. O número que envia pode ser diferente do `whatsapp_number` que aparece em `conversation_list`.
- **`ILIKE '%termo%'` em `messages` sem filtro de conversa dá HTTP 504** (varredura da tabela inteira). Sempre escopar por `conversation_id IN (...)` primeiro.
- Resposta de botão chega como `{"interactive_type":"button_reply","title":"Continuar"}` ou como texto puro (`Continuar`) — trate os dois.
- O bloco `> Reply to: "..."` dentro do `content` mostra **qual mensagem o cliente citou**. Foi assim que se provou cruzamento entre campanhas: o "Continuar" citava o FUP do Onboarding 1 mas caiu na janela do Onboarding 2, que respondeu fora do próprio escopo. **Sempre ler o Reply to antes de julgar se o agente respondeu certo.**
- `conversation_list` é agregado por campanha e pode estar defasado — serviu pra achar só um disparo antigo enquanto as janelas novas já existiam. Use `conversion_window`, não ele.

## Gotchas do Metabase

- **User-Agent `Python-urllib` → 403.** Mandar `curl/8.4.0` (os scripts já fazem).
- Erro SQL vem truncado em 200 chars pelo `kb_fetch.q` — pra depurar, use `mb_query.py`, que imprime 400.
- Escapar `'` dobrando (`''`).

## Roteiro pra "analisa a conversa do telefone X na campanha Y"

1. `conv_fetch.py --phone ... --org ... --campaign ...` → janelas + transcrição.
2. Ler `janelas.txt`: quantas janelas, qual trigger, houve handoff, houve `message_failed`.
3. Ler `conversa.txt` inteira, janela por janela, prestando atenção em `TEMPLATE`/`FUP` e no `Reply to`.
4. **Ler o checkpoint da campanha** (o `.md` na pasta do cliente neste repo, ou `left(current_checkpoint,...)` do banco) e conferir a transcrição **contra as regras dele**. É daí que sai o achado que presta: regra escrita × comportamento real, citando a frase da IA e a linha da regra.
5. Só então tentar o LangSmith (`ls_fetch.py`) pra saber qual agente/modelo gerou a resposta. Se não achar, dizer que não há trace — não inferir modelo.
6. Cruzar com a base (`kb_fetch.py`, db 7) só quando a dúvida for "a base tinha o dado?".

## Caso de referência

Falcão das Milhas, campanhas `Harpya | Onboarding 1` e `Harpya | Onboarding 2`, com lead de teste interno (2026-07-29). Achados: promessa de retorno humano proibida pelo checkpoint + handoff nunca registrado + FUP disparando 1h05 depois sobre caso escalado; IA afirmando qual era o e-mail de compra (proibido explicitamente) por contaminação de contexto entre janelas; toque de botão do Onboarding 1 atendido pela janela do Onboarding 2, fora do escopo declarado.
