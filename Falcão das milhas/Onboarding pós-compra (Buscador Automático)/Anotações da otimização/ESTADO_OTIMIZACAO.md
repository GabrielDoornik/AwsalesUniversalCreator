# Estado da otimização — Suporte e Onboardings 1, 2 e 3

Documento de controle da bateria de redução de handoff. Task de origem: `task_clickup_pedro.md`. Contexto do cliente: `wpp.txt`. Ações de painel: `ACOES_NA_PLATAFORMA.md`.

Leva 1 concluída em 2026-08-05. Tudo abaixo foi conferido contra a produção por query (db 7 NEO e db 3 APP), não por memória.

Ids no NEO: Suporte `ffbc47ff-425b-4027-a23f-ec0ee5ec8c73` · Onb1 `b46abedb-0e64-40f0-b778-623902574555` · Onb2 `4814732e-276c-402b-93cf-416934c08cbe` · Onb3 `e071f730-044f-472d-8775-f193d6ce2e4c`.
Ids no APP, que são DIFERENTES: Suporte `7900b302-2eaf-4682-9910-df133e9e39bf` · Onb1 `f8a38d92-131b-4a64-981b-391479c290b6` · Onb2 `e953e13d-4889-4f09-a61c-e55d6e30068c` · Onb3 `1279c6f4-68b3-49f4-8f79-6da41829d4e3`.

---

## LEVA 1 — feito e verificado em produção

### Checkpoint da Onb3

Itens 1, 2c, 2d e 8 da task, mais a regra que substituiu o 2b.

- Abertura real (template v2) transcrita na Seção 1, com a origem do "perfil concluído": vem do evento de formulário enviado, não é suposição da IA.
- Etapa 1 virou ENTRADA. Quem toca em "Ver presente" vai direto para a Etapa 2, sem comemoração e sem pergunta antes.
- Etapa 2 em bloco único, com o mesmo texto do cliente na mesma ordem. Antes eram três mensagens, o modelo mandava tudo junto, o auditor reprovava e estourava as 5 tentativas.
- Reanúncio do presente cortado da antiga Mensagem 1. O bloco começa em "Agora, você pode adicionar ele de graça no Buscador."
- Regra de toque em template antigo: "Continuar", "Preciso de ajuda" e "COMPLETAR MEU PERFIL" são toque em botão de horas antes, não pedido novo.
- `{{link_formulario_perfil}}` na Seção 2 e no rodapé, com trava de troca entre os três links.
- Regra de e-mail literal, caractere por caractere.
- Barreira nova no estado do cliente: respondeu a botão de mensagem antiga.

17.211 para 19.999 chars. Produção bate exato, com as 28 caixas `- [ ]` preservadas.

### Checkpoint do Suporte

Itens 4a, 4b e 4c.

- Bloco novo "Cadastro do perfil de viagens" na Seção 5.
- Buraco da proibição do formulário de reembolso fechado: entraram "cadastro" e "perfil de viagens" na lista.
- `{{link_formulario_perfil}}` na Seção 2 e no rodapé.

27.229 para 29.260 chars. Produção tem 29.387, e os 127 de diferença são linha em branco que o editor insere entre bullets.

### FAQs da base de Suporte

Item 4d. As 6 FAQs do formulário de perfil, copiadas da base de onboarding, ativas.

- Produto passou de 49 para 52 ativas: "Pra que serve esse formulário de perfil de viagens?" (com a URL `https://rebrand.ly/buscador-perfil` dentro da resposta), "Preciso mesmo preencher?" e "Por que pergunta sobre meus cartões?".
- Playbook passou de 30 para 33 ativas: cliente achou longo, cliente desconfia, cliente parou no meio.
- Arquivos de referência: `Suporte/FAQs/Otimização FAQs - Produto.md` e `- Playbook.md`. Todas as respostas abaixo de 1000 chars.

### Prazo da fila de cancelamento

Veio do I1 e da resposta da Nicole no grupo em 05/08. Aplicado no checkpoint do Suporte (Seção 8) e na FAQ "Como explicar o prazo de cancelamento e reembolso", 892 usos.

- Devolução do dinheiro depois da aprovação: até 15 dias. Não se confunde com as 72 horas úteis, que são só a análise.
- Liberação de bônus acontece no momento da compra, não tem fila. Bônus que não apareceu é problema a conferir, não espera.
- Bloco novo "Cliente voltando para saber de um pedido antigo": informa o prazo, não reabre retenção, não repete formulário.

Resolve os 9 de 49 tickets de cancelamento que eram cliente voltando para perguntar andamento.

### Painel

- Variável `link_formulario_perfil` criada no Suporte e na Onb3.
- Variável `Nome_do_agente` criada na Onb2 e na Onb3. Antes as duas só tinham `agent_name`, e o checkpoint chamava `{{Nome_do_agente}}` na primeira linha. É a causa provável do I2.
- Template da Onb3 trocado para `onbiarding_03_2` (id 25268, UTILITY) nos 6 gatilhos de input, inclusive o `form_response`, que é o que abre 100% das janelas reais.
- Gatilho personalizado do Suporte renomeado de "Cancelamento, reembolso e financeiro" para `CANCELAMENTO`. Item 10a.
- ~~"Respeitar horário de atendimento da equipe" ligado no Suporte.~~ **REVERTIDO no mesmo dia, 05/08 20:20, a pedido do Lucas.** `only_transfer_during_available_hours = false` de novo. Ver a seção "Toggle de horário" abaixo antes de propor isso outra vez.
- Checkpoint da Onb2 subiu com o texto atual, 27 caixas preservadas.

---

## Toggle de horário — ligado e revertido em 05/08

Fica registrado com o dado, porque o assunto volta.

**O que motivou ligar:** 48,6% dos 720 tickets do Suporte em 30 dias nasciam fora de seg-sex 9h-18h. A equipe "Geral" atende 09:00 às 18:00, dias 1 a 5, então madrugada e fim de semana geravam ticket sem ninguém para pegar. Cruzando com o caso trabalhado do `INTERVENCAO_HUMANA_E_CSAT.md`, onde 68% dos tickets desta mesma campanha voltaram para a fila por autosuspensão de operador, ligar parecia ganho grande e de um clique.

**O que o toggle faz, medido e não suposto.** Testei na campanha `JOTA FIUZA | MARCO ZERO | ACESSO A...`, que roda com ele ligado desde abril, equipe 08:00 às 17:00 nos dias 2 a 6:

- No dia em que a equipe não atende, os tickets caem de cerca de 87 por dia para 8.
- Não existe fila diferida. Dos 60 tickets criados na primeira hora do expediente, todos tinham a última mensagem do lead 2,1 minutos antes, e nenhum com intervalo maior que 2 horas. Ou seja, o handoff é suprimido, não guardado para depois.
- Fora do horário a IA continua atendendo. Se o caso exigir humano, ele só vira ticket quando a pessoa escrever de novo dentro do horário.

**Por que foi revertido:** decisão do Lucas em 05/08. Fora do horário o caso que exige humano fica sem ticket e sem ninguém avisado, e ele preferiu manter o ticket aberto mesmo sem operador na hora.

**Se voltar a pauta, tem um pré-requisito.** A Seção 6.1 do checkpoint de Suporte proíbe a IA afirmar que encaminhou quando a transferência não está acontecendo naquela resposta. Com o toggle ligado, fora do horário ela nunca está acontecendo, e não existe ramo no checkpoint para esse caso. Sem uma regra nova mandando informar o horário do time em vez de afirmar encaminhamento, a IA vai mentir ou travar. Ligar o toggle sem essa regra é subir um bug.

---

## Caiu por terra — não refazer

- **Item 2b, trava na Etapa 1 da Onb3.** O diagnóstico da task estava errado. O gatilho é `form_response` e está correto: das 24 conversas ditas mal roteadas, 100% tinham registro real de submissão do formulário, janela da Onb2 aberta antes, e a mensagem "Continuar" chegando em média 158 minutos DEPOIS da abertura da Onb3. A IA afirmou que o perfil estava completo e estava certa. Pedir confirmação antes de comemorar poria fricção em 281 conversas corretas para tratar 24 de toque atrasado.
- **Item 9, asterisco.** Morreu com o template novo. O `*PRESENTE GRATUITO:*` estava no template `onboarding_3`, não na IA.
- **Item 5, dois links para o mesmo formulário.** Já resolvido do lado da IA: ela mandou o link cru 11 vezes, todas entre 27/07 19:05 e 28/07 15:28, antes da variável existir. De 28/07 em diante usou só o encurtado (168 vezes na Onb2, 154 na Onb3). Os 14 casos restantes são operadores humanos colando à mão. É recado de operação.
- **Item 10b, copiar o gatilho para Onb2 e Onb3.** Cancelamento é 1 ticket em 10 dias nas duas somadas. Não paga o trabalho.
- **Item 6, pedido de confirmação.** Não é ponto cego. O auditor pega: reprovou a IA com o motivo literal "A IA prometeu que o cliente deve avisar quando enviar o presente, o que viola a diretriz de não pedir confirmação ou retorno futuro nesta campanha."
- **Item 3c, falso positivo com "bem rápido".** Não existe gate pegando a expressão sozinha. Dos 196 `false_promise` da Onb2 em 10 dias, 158 têm motivo de tempo e quase todos são o "cerca de cinco minutos" que a IA lê do template. O "bem rápido" aparece em 6 casos e nunca como motivo único: vem junto com "fundamental para a nossa equipe entender", que é promessa de análise e é proibida de verdade. O conserto é o item 3, não o 3c.

---

## PENDENTE — a lista curta, atualizada em 2026-08-05 fim do dia

Tudo o que era demanda do CS foi aplicado e verificado em produção, com duas exceções deliberadas. Sobrou isto:

| O quê | De quem depende |
|---|---|
| Item 3, template da Onb2 sem os cinco minutos | CS. É o único artefato de campanha em aberto |
| Recontagem de 7 dias, janela 08 a 11/08 | CS pede, eu rodo. Receita neste arquivo |
| Pergunta do `utm_source` ao cliente | Stand by por decisão do CS |
| Tool de reset de acesso | Cliente. O Gustavo respondeu em 05/08 que consegue liberar, mas precisa avaliar a implementação. Quando voltar, precisamos de endpoint, autenticação e contrato de resposta; a tool vai por webhook n8n com o padrão de sempre HTTP 200 e flag `ok`. Resolve cerca de 10% do que chega no time humano hoje |

**Item 10b descartado por evidência**, não esquecido: copiar o gatilho de cancelamento para a Onb2 e a Onb3 não paga o trabalho, porque cancelamento é 1 ticket em 10 dias nas duas somadas.

**Pendência do acesso ao Typeform: morta.** Ela existia para a AWSales saber que o formulário foi enviado, e esse sinal já chega — é o `form_response` que abre a Onboarding 3, 281 janelas entre 30/07 e 05/08. O que sobra do tema é outro pedido, e webhook não resolve: quem abandona no meio do formulário não é identificável porque os campos de nome, e-mail e telefone ficam no fim. Para recuperar essas pessoas, a identificação tem que ir para o começo do Typeform. Escopo novo, não pendência.

---

## Stand by

- **Item 3, cinco minutos na Onb2.** O cliente respondeu no grupo em 05/08 13:36: "Muda a abertura. Não precisa dizer que demora 5 minutos. E se alguém perguntar, é só dizer que é bem rapidinho. São poucas perguntas só pra entender o estilo de viagem." É o Caminho B, com uma diferença: ele libera dizer "poucas perguntas", o que o B2 da task proíbe. Decisão do CS foi deixar para o fim da otimização.

  Quando destravar, são três frentes e nenhuma pode ficar de fora: template `onboarding_2`, template `fup2_onboarding` (que tem "dezesseis perguntas" E os cinco minutos), e a Seção 3 do checkpoint da Onb2, cuja proibição cita o número literal. Textos novos já redigidos, em `ACOES_NA_PLATAFORMA.md`.

  Atenção ao cortar número da FAQ compartilhada: a abertura da Onb1 diz "leva menos de dois minutos" e ali é verdade. A FAQ de Playbook "Como motivar um cliente que está procrastinando" repete esse número e está alinhada com a Onb1. Apagar o número da FAQ quebra a Onb1. O conserto tem que ser por campanha.

- ~~Item 7~~ **FECHADO em 05/08.** O CS decidiu que a frase podia mudar sem esperar o cliente, porque ela vive no checkpoint e não no template. Na Etapa 2 da Onb3, "para ter acesso às passagens mais baratas" virou "para ver as oportunidades do Buscador". Aplicado e verificado em produção: 19.995 chars, 28 caixas, frase antiga zerada.

- **Pergunta do `utm_source` ao cliente (I0).** Decisão do CS em 05/08: não levar ao cliente por ora. O diagnóstico está fechado e registrado, só a conversa está parada.

  Quando destravar, a pergunta é: onde o link com `utm_source=awsales` está sendo usado além da IA, e o que mudou no link de tráfego da Hubla em 29-30/07. Suspeito concreto: o `link_vendas` das campanhas de Recuperação é um rebrand.ly (`buscador-falcao-hubla-297`, `buscador-automatico`, `buscadorautomatico`); se o destino tem `?utm_source=awsales` e o link foi reusado fora da IA, toda venda que passa por ele é rotulada sem ter conversa.

  Não confundir com a campanha "Falcão das Milhas - Onboarding", que tem `link_formulario = https://emeo1uhrjwf.typeform.com/to/RSuIPOnP?utm_source=awsales`. Esse marca o formulário, não a venda, e é a origem dos 150 `form_response` com utm awsales.

  Vale enquanto estiver parado: não reportar as vendas com `utm_source=awsales` como resultado da Awsales.

---

## Investigações — todas as 8 fechadas em 2026-08-05

Nenhuma confirmou a hipótese da task. Cinco a refutaram.

### I0. A alta de `utm_source=awsales` é troca de rótulo, não receita nova

Em 29 e 30/07 o `utm_source` do checkout da Hubla virou de `meta` para `awsales`, no mesmo checkout, com o total de vendas parado.

| Dia | Hubla + meta | Hubla + awsales | Total |
|---|---|---|---|
| 26/07 | 46 | 0 | 68 |
| 28/07 | 41 | 1 | 63 |
| 29/07 | 15 | 15 | 62 |
| 30/07 | 2 | 48 | 66 |
| 04/08 | 4 | 32 | 41 |

Não é o stamp do n8n. Aquele aparece como `checkout='awsales'`, rodou só de 27 a 29/07, 64 transações, e parou. A troca é no link do checkout da Hubla.

**O número honesto:** de 30/07 a 04/08, 298 vendas, 204 rotuladas `awsales`, **6 com conversa de campanha pré-venda antes da compra.** As conversas atreladas às 204 são pós-compra: Onb2 em 195 casos, Onb3 em 161, Suporte em 48, e em praticamente todas a conversa começou DEPOIS da data do pedido. Onboarding não causa compra.

Consequência: não reportar as 32 a 48 vendas diárias com `utm_source=awsales` como resultado da Awsales. Pendência com o cliente: quem trocou o `utm_source` do link da Hubla em 29-30/07 e por quê.

### I1. A retenção não está sendo pulada

49 tickets de cancelamento entre 01 e 04/08: 30 mencionaram a Consultoria, 19 não. Nos 19, a IA teve **2,9 turnos em média** antes de transferir e 13 tiveram 3 ou mais. Só 2 transferiram no primeiro turno, então **não é gate disparando antes do Copywriter.**

Dos 19, **13 caem em regra que proíbe nova tentativa de retenção**: 9 eram status de pedido que já existia ("andamento do reembolso solicitado há uma semana", "cancelou há 5 meses e as cobranças continuam", "quer o comprovante do estorno"), 2 citaram prazo de 7 dias ou manifestação formal, 3 recusaram a retenção que foi oferecida. Sobram 6 em 49 onde a Consultoria caberia.

A hipótese da task, de que a Seção 6.1 e a Seção 4 empurram para handoff imediato, está refutada. **Não mexer na Seção 4.** A métrica "28 de 54 sem menção à Consultoria" conta como falha os casos em que o checkpoint acerta.

**O ganho que saiu daqui:** 9 dos 49 tickets são cliente voltando para saber o andamento. Aplicado no mesmo dia — prazo de 15 dias para a devolução no checkpoint do Suporte (Seção 8, mais bloco novo "Cliente voltando para saber de um pedido antigo") e na FAQ "Como explicar o prazo de cancelamento e reembolso", a mais usada da base no tema com 892 usos. O número veio da Nicole no grupo em 05/08.

### I2. A "Jéssica, designer de interiores" é a LEAD, não a IA

Em 03/08 17:15 a abertura da Onb2 chega. Quatro segundos depois a pessoa responde com a mensagem automática do WhatsApp Business dela: "Eu sou a Jéssica, designer de interiores...". Vinte segundos depois toca em "Continuar" de verdade.

O ticket saiu de leitura errada do texto do auditor, que diz "A IA se identificou como atendimento do Buscador Automático em resposta a uma mensagem onde o usuário se apresentou como designer de interiores".

Varredura nas 1.574 mensagens de agente das três campanhas: nenhuma em que a IA se apresente como Jéssica ou designer. **Não é contaminação de prompt entre organizações. Nada a escalar.**

Achado colateral: o nome Nicole aparecia em 1 de 1.574 mensagens, porque `{{Nome_do_agente}}` não resolvia. Corrigido no painel. Confirmar em conversa nova.

### I3. Os 19 tickets do item 2 não existem como bucket separado

Os 68 tickets da Onb3 no recorte são 30 `RETRY_EXHAUSTED` e 21 `LIE_DETECTOR`, 75% em dois motivos que são o item 1. A leitura de "disparada para quem não preencheu" saiu dos resumos, não do roteamento, e o I0 do item 2 já provou que o roteamento estava certo.

**Consequência para a meta:** o ganho projetado do item 2 não soma com o do item 1, é o mesmo ticket contado duas vezes. A meta de 66 tickets da task está superestimada.

### I4. Não é recuperável qual URL era

São 2 ocorrências no recorte, não 1, e as duas são rejeição determinística sem registro da URL: o `message_id` da telemetria não devolve conteúdo. O buraco mais provável era o formulário de perfil, já tapado. Remedir no próximo recorte.

### I5. A base está limpa, não falta desativar nada

Nas duas bases de onboarding existe **uma** FAQ ativa que menciona Consultoria, e é só o mapa de produtos (4 usos). Nenhuma FAQ de cancelamento, reembolso ou fluxo de retenção está ativa. Somado aos checkpoints dos três, que proíbem oferecer Consultoria explicitamente, o risco das duas frases-teste está coberto.

### I6. Faltam FAQs do presente, e é isso que empurra a Onb3 para o handoff

O que o RAG devolveu na Onb3 em 10 dias:

| FAQ devolvida | Vezes | Score |
|---|---|---|
| Escalar para suporte humano | 36 | 72 |
| Interpretar mensagem de erro de acesso | 29 | 87 |
| Estou com problema no acesso | 27 | 89 |
| Recuperação de senha não funciona | 16 | 86 |
| Erro 404 na área de membros | 13 | 72 |

Nada sobre o presente, porque não existe FAQ do presente. O primeiro colocado é a FAQ de escalar, com score MENOR que as de acesso: a base sabe responder acesso melhor do que sabe encaminhar, e ainda assim o topo é encaminhar.

Recomendação aprovada pelo CS: 3 FAQs novas, redigidas em `FAQs/Otimização FAQs - Produto.md` e `- Playbook.md` da pasta de onboarding. Sem link e sem variável, e sem mandar anunciar o presente, porque a base é compartilhada com a Onb1 e a Onb2. Pendente de criar no painel.

### I7. A Onb1 não estava desligada, estava faminta

Janelas por dia: 2, 2, 3, 3, 1 até 03/08, depois **12 em 04/08 e 26 em 05/08**. Bate com o grupo: o fluxo só passou a rodar 100% em 04/08, por causa da integração do primeiro acesso. As 8 sessões do recorte eram integração quebrada, não split desbalanceado. Agora as três são comparáveis.

---

## Recontagem — receita pronta

Quando o CS pedir "faz a recontagem", é isto. Deploy da leva 1 foi em 2026-08-05, então a janela de comparação é **08 a 11/08/2026**, quatro dias fechados, mesmo formato do recorte original de 01 a 04/08.

Regras que não podem ser esquecidas, porque quebram a comparação:

- Medir handoff POR CONVERSA, nunca em número absoluto. O volume vem caindo desde a semana de 20/07, e absoluto vai cair sozinho sem a otimização ter feito nada.
- Só dias fechados. A mesma query rodada com uma hora de diferença já deu 156 e 168 tickets.
- db 7 não leva ajuste de fuso. db 3 leva `- INTERVAL '3 hours'`.
- A Onb1 só começou a receber volume em 04/08. Antes disso ela não é comparável com nada.

### Query 1 — taxa de transbordo por campanha

```sql
SELECT campaign_id,
       count(*) conversas,
       count(*) FILTER (WHERE had_handoff) handoffs,
       round(1.0*count(*) FILTER (WHERE had_handoff)/count(*),2) handoff_por_conversa,
       round(avg(csat_score)::numeric,2) csat
FROM tactical_analysis
WHERE campaign_id IN ('ffbc47ff-425b-4027-a23f-ec0ee5ec8c73','b46abedb-0e64-40f0-b778-623902574555',
                      '4814732e-276c-402b-93cf-416934c08cbe','e071f730-044f-472d-8775-f193d6ce2e4c')
  AND created_at >= '2026-08-08' AND created_at < '2026-08-12'
GROUP BY 1;
```

### Query 2 — motivos, é aqui que se vê se a leva 1 funcionou

```sql
SELECT campaign_id, upper(handoff_reason) motivo, count(*) n
FROM handoff_tickets
WHERE campaign_id IN ('ffbc47ff-425b-4027-a23f-ec0ee5ec8c73','4814732e-276c-402b-93cf-416934c08cbe',
                      'e071f730-044f-472d-8775-f193d6ce2e4c')
  AND created_at >= '2026-08-08' AND created_at < '2026-08-12'
GROUP BY 1,2 ORDER BY 1,3 DESC;
```

### Query 3 — tickets fora do horário, mede o toggle ligado em 05/08

```sql
SELECT CASE WHEN extract(dow from created_at) IN (0,6) THEN 'fim de semana'
            WHEN extract(hour from created_at) BETWEEN 9 AND 17 THEN 'dentro'
            ELSE 'fora do horario' END janela,
       count(*) tickets, round(100.0*count(*)/sum(count(*)) over (),1) pct
FROM handoff_tickets
WHERE campaign_id='ffbc47ff-425b-4027-a23f-ec0ee5ec8c73'
  AND created_at >= '2026-08-08' AND created_at < '2026-08-12'
GROUP BY 1;
```

### Query 4 — cliente voltando para saber andamento, mede o prazo de 15 dias

```sql
SELECT count(*) tickets_cancelamento,
       count(*) FILTER (WHERE hs.handoff_summary ILIKE '%status%' OR hs.handoff_summary ILIKE '%andamento%'
                          OR hs.handoff_summary ILIKE '%já preench%' OR hs.handoff_summary ILIKE '%aguardando retorno%')
         voltou_para_saber_andamento
FROM handoff_tickets ht JOIN handoff_snapshots hs ON hs.handoff_ticket_id=ht.id
WHERE ht.campaign_id='ffbc47ff-425b-4027-a23f-ec0ee5ec8c73'
  AND ht.created_at >= '2026-08-08' AND ht.created_at < '2026-08-12'
  AND (upper(ht.handoff_reason) LIKE '%CANCEL%' OR upper(ht.handoff_reason) LIKE '%REEMBOLSO%'
       OR upper(ht.handoff_reason) LIKE '%ESTORNO%');
```

### Query 5 — o RAG passou a achar o presente na Onb3

```sql
SELECT left(d.question,58) faq, count(*) vezes, round(avg(mrd.score)::numeric,1) score
FROM messages_rag_documents mrd
JOIN documents d ON d.id=mrd.document_id
JOIN messages m ON m.id=mrd.message_id
JOIN conversations_agents_sessions cas ON cas.id=m.conversation_agent_session_id
WHERE cas.campaign_id='e071f730-044f-472d-8775-f193d6ce2e4c'
  AND mrd.created_at >= '2026-08-08' AND mrd.created_at < '2026-08-12'
GROUP BY 1 ORDER BY 2 DESC LIMIT 12;
```

Também conferir se a IA passou a se apresentar como Nicole na Onb2 e na Onb3, que é a confirmação pendente do I2, e se o template `onbiarding_03_2` (id 25268) de fato disparou.

## Baselines para comparar

Recorte original: 01 a 04/08/2026.

| Métrica | Baseline | Onde |
|---|---|---|
| Suporte, handoff por conversa | 0,87 (76 tickets / 87 conversas) | `handoff_tickets` e `tactical_analysis` |
| Suporte, taxa de transbordo em 30 dias | 67,3% | 1.062 conversas, 715 com handoff |
| Suporte, tickets fora do horário | 48,6% de 720 em 30 dias | Não deve mudar: o toggle foi revertido em 05/08 |
| Onb3, `RETRY_EXHAUSTED` | 39 em 10 dias | Alvo do bloco único |
| Onb3, `LIE_DETECTOR` | 29 em 10 dias | |
| Onb2, `FALSE_PROMISE` | 196 retries em 10 dias, 158 por tempo | Só cai com o item 3 |
| Onb2, `RETRY_EXHAUSTED` | 31 em 10 dias | |

---

## Gotchas de plataforma descobertos nesta bateria

Estão no `CLAUDE.md` também, porque valem para qualquer cliente.

1. **O editor de checkpoint da plataforma corrompe markdown ao salvar.** Apaga `- [ ]` virando `- ` simples, autolinka `metadata.email` para `[metadata.email](http://metadata.email)`, e renumera `1)` para `1.`. Colar a partir de `.txt` preserva. Sempre conferir por query depois de subir.
2. **O rótulo do handoff sai do NOME do gatilho personalizado, não do critério.** O gatilho tem só 5 campos em toda a base: `id`, `name`, `status`, `prompt`, `enabled`. Não existe campo de lista de rótulos.
3. **O template de abertura é configurado por gatilho de input, não por campanha.** A Onb3 tinha 6 gatilhos e trocar o template em 5 deles não trocou no `form_response`, que era justamente o único que disparava.
4. **Os ids de campanha são diferentes entre o db 7 e o db 3.** Só o id da organização é o mesmo.
5. **O autolink do `metadata.email` é cosmético.** A plataforma resolve mesmo assim: dos 859 turnos de agente da Onb1 e Onb2, 46 saíram com e-mail real e nenhum vazou a variável.
