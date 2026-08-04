# Report diário — Nuestra RX (campanhas de vendas/forms)

Rotina diária: rodar duas queries, colar os números num template de mensagem e mandar pro cliente.
Handoff para o **Ricardo Ariza** (2026-08-04). Antes: Pedro Leite.

Repositório é **público**: nunca colar chave de API, telefone, e-mail ou nome de lead nestes arquivos.

---

## O que é o report

Quatro campanhas da nova estratégia da Nuestra RX, uma seção por campanha, quatro linhas cada:
investimento, leads que chegaram, leads que responderam (com taxa) e leads que converteram (com taxa).

| Campanha (nome no report) | `campaign_id` | Tipo |
|---|---|---|
| RECUPERAÇÃO DE FORMULÁRIO \| ESTRATÉGIA NOVA \| RECEPTIVA | `3ccdfd27-b067-4fe6-a874-1dcc8aa62dc5` | receptiva (lead inicia) |
| RECUPERAÇÃO DE FORMULÁRIO \| ESTRATÉGIA NOVA \| ABANDONO | `9e0f28a6-29ba-4491-893b-12c9846bb59e` | ativa (template) |
| RECUPERAÇÃO DE VENDAS \| ESTRATÉGIA NOVA | `b21feb9c-17d8-4ccc-9241-18e0934c5710` | ativa (template) — variação A do teste A/B |
| RECUPERAÇÃO DE VENDAS \| ESTRATÉGIA NOVA \| IMAGEM PROVA SOCIAL | `83ed0ce1-1bde-4a9b-af73-d3c81bab526c` | ativa (template) — variação B (prova social) |

Os quatro IDs foram conferidos contra `campaigns.name` em 2026-08-04: os rótulos do `CASE` batem com o
nome real na plataforma. Se algum dia alguém duplicar campanha, revalidar antes de confiar no rótulo.

Organização (Nuestra RX): `b34f181e-c7b3-49fb-b69f-3454a7336df2`.

Existe uma 5ª campanha da nova estratégia, `Venda Ativa - LISTO`, que **não** entra neste report.
Se ela for ativada, decidir se entra.

---

## Passo 1 — Métricas

Rodar [query-metricas.sql](query-metricas.sql) no **Metabase** (`metabase.awsales.io`), banco **APP**
(`awsales_db`, id 3). Trocar só as duas datas no `WHERE` (início inclusivo, fim exclusivo, **horário de
Brasília**). Para um dia só: `>= '2026-08-04'` e `< '2026-08-05'`.

Saída: uma linha por campanha, com as 4 métricas e as 2 taxas já calculadas.

### Fuso: as datas são em horário de Brasília (−3h)

O banco grava **UTC**. O ETL oficial de custos da plataforma (`costs_vw.py`) subtrai 3 horas de todo
timestamp (`created_at`, `start_at`, `dateTime`, `active_lead_costs.date`) para produzir horário local, e é
essa a base do painel. Por isso a query filtra `(cw.start_at - INTERVAL '3 hours')`, e não `cw.start_at` cru.

**Isso não é detalhe.** No fim de semana de 01–02/08 a fronteira errada (UTC cru) devolvia
33/33/0 na Receptiva e 24/1/1 na Prova Social; com a fronteira certa (BRT) é 31/31/1 e 24/3/0. Mesmo
período "de fim de semana", 3 horas de deslocamento, conversão trocando de campanha.

---

## Passo 2 — Investimento

**Fonte canônica: a tabela silver `costs_vw` no BigQuery**, coluna `total_value_with_margin` (preço com
margem = o que o cliente paga). É de lá que sai o card "Investimento total" do painel. A tabela é gerada
pelo `costs_vw.py` (job bronze→silver mantido pelo **Lucas Reis**), e já vem com `campaign_id`,
`campaign_name`, `datetime` (já em BRT) e `fee_name` — ou seja, lá o investimento é um `SUM` simples,
sem nenhuma das ginásticas abaixo.

Situação em 2026-08-04: essa tabela **não está** nas conexões do Metabase que temos. A conexão BigQuery
disponível (id 6, "Big query (Legado)") só tem os datasets `billing_export`, `finops_staging_us`,
`analytics_293454697`, `anomalies`, `financeiro_mamba_culture`, `Base_de_Dados_mld_c03_set` — nenhum com
`costs_vw`. **Pedir ao Lucas Reis acesso ao dataset silver** (ou que ele exponha `costs_vw` no Metabase).
Resolvido isso, o Passo 2 vira uma query de 5 linhas e o resto desta seção pode ser apagado.

Enquanto não tiver: pegar os 4 valores no **card "Investimento total" do painel**, filtrando por campanha e
período. É o que o Pedro fazia.

### Alternativa: [query-investimento.sql](query-investimento.sql) (aproximação, não confiar cegamente)

Réplica em SQL puro da lógica do `costs_vw.py` sobre o banco APP: soma os 5 blocos de custo (mensagens,
disparo da 1ª mensagem, template WhatsApp, tokens, lead ativo), com o preço **com margem** nos disparos, e
converte para BRL por `total_value_brl_cents` / `usd_brl_rate` (`costs.total_value` é **USD**).

Ela não reproduz o painel. Medido no dia 16/07:

| Campanha | Report do dia (painel) | Esta query |
|---|---|---|
| Receptiva | R$ 196,69 | R$ 213,11 |
| Abandono | R$ 71,33 | R$ 81,44 |
| Vendas | R$ 12,63 | R$ 16,11 |
| Imagem prova social | R$ 158,05 | R$ 61,74 |

Três primeiras na mesma ordem de grandeza (8–28% acima); a Prova Social dá 2,5x **menor**. Não use como
substituto do painel sem antes fechar essa diferença com o Lucas. Serve para ordem de grandeza e para
comparar campanhas entre si no mesmo dia.

Duas causas conhecidas da diferença, ambas fora do alcance de uma query só no banco APP:
1. **Tokens órfãos de Smart Follow-Up.** Custos com `tokens.message_id_ref` no formato
   `smart-fup-analysis-<id>` / `smart-fup-template-<id>` não casam com campanha pelo banco APP. O
   `costs_vw.py` recupera a campanha desses custos indo no banco **NEO** (`awsales_backoffice_db`) —
   join entre bancos, impossível numa query única do Metabase. Numa campanha com Smart FUP ligado isso
   subestima o investimento.
2. **`mensagem_enviada` no bloco de 1º disparo** sai NULL no próprio ETL (o bloco define `base_value`
   como a *string* `'NULL'`, então o `COALESCE(base_value, 0.0055)` não cai no default). Mirrei o
   comportamento para bater com a silver; vale confirmar com o Lucas se é intencional.

---

## Passo 3 — Montar a mensagem

Ordenar as campanhas por investimento (maior primeiro) e preencher:

```
Report geral do dia DD/MM das campanhas de vendas/forms:

<NOME DA CAMPANHA>:
• Investimento: R$ X,XX
• Leads que chegaram: N
• Leads que responderam: N (XX% de taxa de resposta)
• Leads que converteram: N (XX% de taxa de conversão)

[repetir para as 4 campanhas]
```

Para fim de semana ou período agregado, trocar o cabeçalho ("Report geral do final de semana (01/08 e
02/08)...") e rodar a query com o range inteiro — ela já agrega, não precisa somar dia a dia na mão.
Somar dia a dia na mão infla o número: `COUNT(DISTINCT lead_id)` conta uma vez o lead que aparece nos
dois dias.

---

## O que sabemos que engana no número (ler antes de comentar resultado com o cliente)

1. **Taxa de resposta da Receptiva é ~100% por construção.** Nela o lead é quem inicia a conversa (não
   existe template de abertura — ver o checkpoint em `../Campanhas - Nova Estratégia/Recuperação de
   Formulário/Receptiva/Checkpoint/checkpoint.md`, §1). Comparar essa taxa com as das campanhas ativas é
   comparar mecânicas diferentes. Se o cliente puxar comparação, é isso que se responde.
2. **Conversão é piso, não verdade.** `output_leads_event_id` depende de o evento do site chegar na
   plataforma, e isso falha: o relatório de 10/07 (`../Campanhas - Nova Estratégia/Conversas/
   Relatorio_Analise_A-B_2026-07-10.md`) achou 6 de 7 leads que chegaram ao checkout sem nunca entrar na
   Recuperação de Vendas, e de 22 formulários completos 21 tinham sido tocados por campanha mas só 4
   conversaram. Conversão silenciosa (lead que finaliza sem avisar) não aparece aqui.
3. **`window_status = 'available'` exclui `message_failed`.** O denominador é "lead com janela válida", não
   "lead disparado". No fim de semana de 01–02/08 houve 5 falhas de entrega (4 na Prova Social, 1 no
   Abandono) — 14% de falha numa das pernas do teste A/B contamina a comparação com a outra, que teve 0.
   Vale rodar o corte por `window_status` de vez em quando (está comentado no fim da query de métricas).
4. **Campanha sem janela no período não gera linha.** Ausência no resultado é "não teve lead", não "zerou".
5. **Lead em duas campanhas** conta em cada uma. Na Nuestra isso acontece (lead da Receptiva que já está em
   estágio de checkout). Na query de investimento isso também duplica custo entre campanhas.

---

## Mapa de tabelas (para não redescobrir)

Banco APP (`awsales_db`, Metabase id 3):

```
conversion_window          a janela É a conversa (não existe tabela conversations)
  .id            == messages.conversation_id      ← a chave não óbvia
  .lead_id       -> leads.id                      leads."phoneNumber" = 55/1 + número, só dígitos
  .campaign_id   -> campaigns.id
  .window_status  'available' | 'message_failed'
  .output_leads_event_id   preenchido = evento de objetivo da campanha disparou
  .first_message_id -> messages.id                (usado no bloco de 1º disparo do custo)

messages
  .cost_id       -> costs.id       ← liga mensagem a custo (bloco 1 do costs_vw)
  .wam_id_ref    == tokens.message_id_ref  ← liga custo de TOKEN a campanha
                    (NÃO é messages.id; o join por messages.id devolve zero linhas)
  ."from"/."to"  direção: comparar com leads."phoneNumber" para saber se foi o lead que falou

costs                      1 linha por cobrança. total_value é USD;
  .usd_brl_rate            câmbio da própria linha; total_value_brl_cents só existe a partir de 05/06/2026
  .fee_id -> fees          fee 2 = mensagem_recebida, 3 = mensagem_enviada,
                           1 = disparo_marketing, 19 = disparo_utilidade, tokens_* = sub-agentes
  .lead_id                 NÃO tem campaign_id (atribuir por lead é aproximação grosseira — não use)

whatsapp_template_sent     .conversion_window_id, .cost_id, .billable  (template cobrado)
active_lead_costs          .first_conversion_window_id, .cost_id       (cobrança de lead ativo)
```

Não existe nenhuma coluna de investimento de mídia no banco APP (varrido `information_schema` por
`%invest%`, `%spend%`, `%budget%`, `%ad_%`, `%traffic%`). "Investimento" aqui é sempre custo de plataforma
com margem, nunca gasto de anúncio.

Detalhe do `fees.type` → sub-agente e metodologia de corte de custo:
`../../Estrutura/PLAYBOOK_REDUCAO_DE_CUSTOS.md`.

---

## Pendências

- [ ] Acesso ao dataset silver do BigQuery (ou `costs_vw` exposta no Metabase) — pedir ao Lucas Reis.
      Fecha o Passo 2 e mata a query aproximada.
- [ ] Com acesso: fechar a diferença medida no 16/07, em especial a Prova Social (2,5x).
- [ ] Confirmar com o Lucas se `mensagem_enviada` saindo NULL no bloco de 1º disparo é intencional.
- [ ] Decidir se `Venda Ativa - LISTO` entra no report.
- [ ] Investigar com o Willian a integração forms-site (evento de abandono de checkout que não dispara) —
      é o que trava a métrica de conversão. Vem do relatório de 10/07.
