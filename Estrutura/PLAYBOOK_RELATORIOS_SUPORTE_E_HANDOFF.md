# Playbook Geral - Relatórios de Suporte, Handoff e Base de Conhecimento

Este playbook define o padrão para criar relatórios de performance de suporte para qualquer cliente da AWSales e transformar os dados em ações práticas de redução de handoff.

Use este fluxo quando a campanha tiver suporte, atendimento humano, CSAT, fila, motivos de transferência ou necessidade de melhorar a base de conhecimento.

## 1. Objetivo do playbook

O objetivo não é apenas gerar um relatório bonito. O objetivo é responder quatro perguntas:

1. A IA está resolvendo mais ou menos?
2. Por que os atendimentos estão indo para humano?
3. O que já conseguimos corrigir na base/checkpoint?
4. O que ainda depende do cliente responder para reduzir handoff?

Ao final, a entrega ideal tem três arquivos:

1. Relatório para o cliente.
2. Perguntas para o cliente responder.
3. Backlog interno de FAQs/ajustes.

## 2. Planilhas necessárias

Sempre que possível, trabalhar com três bases.

### 2.1 Planilha principal de performance

Nome comum:

- `optimization-hub-AAAA-MM-DD.xlsx`

Onde salvar:

- `{Cliente}/{Campanha}/Suporte hoje/`

Uso:

- Fonte oficial dos números do relatório para cliente.
- Usar para totais, taxas, CSAT, volume, motivos agregados, tópicos, fricções, operadores e fila.

Abas mais importantes:

| Aba | Para que serve |
|---|---|
| `Resumo` | Totais: conversas analisadas, resolvidas pela IA, resolvidas por humano, abandonadas |
| `Volume por dia` | Evolução diária e deflexão/resolução pela IA |
| `CSAT por dia` | Satisfação geral, IA e humano |
| `Motivos de Handoff` | Principais motivos agregados de transferência |
| `Tópicos` | Assuntos mais recorrentes |
| `Fricções de Produto` | Pontos do produto que mais geram atrito |
| `Operadores` | Performance do time humano |
| `Fila` | Aguardando agora, tempo médio, SLA e devoluções |
| `Análises Táticas` | Linha por conversa analisada, útil para auditoria |

Regra:

Use essa planilha como fonte oficial das taxas do relatório. As outras tabelas podem ter nível de ticket/evento e não devem substituir os totais oficiais.

### 2.2 Handoff Snapshots

Nome comum:

- `query_result_...xlsx`

Onde salvar:

- `{Cliente}/{Campanha}/Handoff Snapshots/`

Uso:

- Diagnosticar por que a conversa foi transferida.
- Ver última mensagem do usuário, última resposta da IA, motivo, resumo do handoff, consulta na base e transcrição antes da transferência.
- Descobrir lacunas de base, falhas de interpretação, loops, promessas indevidas e transferências evitáveis.

Colunas importantes:

| Coluna | Uso |
|---|---|
| `ID` | Chave para cruzar com Handoff Tickets via `Handoff Snapshot ID` |
| `Conversation ID` | Chave da conversa |
| `Conversation Agent Session ID` | Chave da sessão da IA |
| `Handoff Ticket ID` | Chave do ticket de handoff |
| `Handoff Type` | Automático ou manual |
| `Handoff Reason` | Motivo bruto da transferência |
| `Handoff Summary` | Resumo do motivo e contexto |
| `Rag Last Query` | Última busca feita na base |
| `Rag Results` | Resultados recuperados na base |
| `Rag Score` | Indício de cobertura/confiança |
| `Response Auditor Last Feedback` | Por que a resposta falhou ou foi bloqueada |
| `Last Ai Response` | Última resposta da IA antes do handoff |
| `Last User Message` | Última mensagem do usuário |
| `Conversation Transcription` | Transcrição disponível antes da transferência |
| `Created At` / `Updated At` | Recorte temporal |

Colunas geralmente descartáveis:

- `Organization ID`
- `Checkpoint Variables`
- `Checkpoint History`
- `Tool Logs`, quando vazio

Regra:

Essa tabela explica o “porquê”, mas normalmente não mostra a resposta final do humano depois que ele assumiu. Não afirmar que pegamos ensinamento humano real se a transcrição só mostra `user` e `agent` antes da transferência.

### 2.3 Handoff Tickets

Nome comum:

- `query_result_...xlsx`

Onde salvar:

- `{Cliente}/{Campanha}/Handoff Tickets/`

Uso:

- Entender o pós-handoff.
- Ver se o ticket foi resolvido, se está aberto, se voltou por problema não resolvido, prioridade, SLA e tempo de resolução.

Colunas importantes:

| Coluna | Uso |
|---|---|
| `ID` | ID do ticket |
| `Conversation ID` | Chave da conversa |
| `Conversation Agent Session ID` | Chave da sessão |
| `Handoff Reason` | Motivo bruto |
| `Handoff Summary` | Resumo do contexto |
| `Priority` / `Priority Score` | Urgência operacional |
| `Status` | Resolvido, atribuído, aberto etc. |
| `Assigned At` | Quando foi atribuído |
| `Resolved At` | Quando foi resolvido |
| `Sla Breached` | Se estourou SLA |
| `Return Count` | Se voltou depois de resolvido |
| `Last Return Reason` | Motivo da devolução |
| `Handoff Snapshot ID` | Chave para cruzar com snapshot |
| `Created At` / `Updated At` | Recorte temporal |

Colunas geralmente descartáveis:

- `Organization ID`
- `Campaign ID`
- `Team ID`, salvo análise operacional específica
- colunas vazias como `Urgency`, `Auto Resolved Reason`, `Last Operator Response At`, se vierem sem dados

Regra:

Essa tabela mede a operação depois da transferência. Ela não substitui a planilha principal de performance para taxa oficial de resolução pela IA ou taxa de intervenção humana.

### 2.4 Tabela opcional: mensagens humanas pós-handoff

Se existir uma tabela de mensagens, comentários do ticket, respostas de operador ou transcrição completa depois do handoff, ela é altamente valiosa.

Nomes possíveis:

- `messages`
- `ticket_messages`
- `operator_messages`
- `handoff_messages`
- `ticket_comments`
- `conversation_messages`

Uso:

- Extrair respostas reais dos humanos.
- Transformar soluções recorrentes em FAQs.
- Validar se um handoff era inevitável ou se a IA poderia ter resolvido.

Regra:

Sem essa tabela, não dizer que extraímos ensinamentos dos humanos. O máximo que temos é diagnóstico do que a IA não resolveu antes da transferência.

## 3. Ordem de análise

1. Abrir a planilha principal e registrar os totais.
2. Comparar com o relatório anterior, se existir.
3. Separar aumento absoluto de aumento proporcional.
4. Agrupar motivos de handoff parecidos.
5. Cruzar Handoff Tickets com Handoff Snapshots via `Handoff Snapshot ID`.
6. Identificar blocos que reduzem handoff com FAQ.
7. Identificar blocos que só melhoram handoff.
8. Identificar lacunas que dependem do cliente.
9. Atualizar checkpoint apenas com regras de comportamento.
10. Atualizar base de conhecimento com respostas que o lead pode receber.

## 4. Comparação com relatório anterior

Ao comparar períodos, sempre explicar:

- número absoluto;
- taxa proporcional;
- mudança de volume;
- impacto em CSAT;
- mudança na taxa de resolução pela IA;
- mudança na intervenção humana.

Exemplo de leitura correta:

> O número absoluto de atendimentos humanos subiu porque o volume total de conversas cresceu. Porém, proporcionalmente, a IA melhorou: a taxa de resolução pela IA aumentou e a intervenção humana caiu.

Nunca dizer que a IA piorou apenas porque o número bruto de handoffs subiu. Primeiro verificar a taxa.

## 5. Normalização de motivos de handoff

Os motivos podem vir misturados em caixa alta, caixa baixa, português, inglês ou variações. Para análise interna, agrupar por intenção.

Exemplos:

| Motivos brutos | Grupo recomendado |
|---|---|
| `AI_DONT_KNOW`, `ai_dont_know`, `info_not_found`, `NO_RAG_MATCH` | Informação não encontrada / baixa confiança |
| `SUPORTE_ACESSO`, `access_issue`, `access_problem`, `problema_acesso`, `acesso_plataforma` | Acesso, login e cadastro |
| `CANCELAMENTO_CONFIRMADO`, `cancelamento_solicitado`, `REFUND_REQUEST`, `reembolso_confirmado` | Cancelamento e reembolso |
| `RETRY_EXHAUSTED` | Falha de resposta, loop ou auditoria |
| `HUMAN_REQUEST`, `human_request` | Pedido de humano |
| `FALSE_PROMISE`, `LIE_DETECTOR` | Promessa indevida ou resposta insegura |
| `COTACAO_ESPECIFICA`, `COTACAO_VIAGEM` | Cotação específica |
| `BILLING_DISPUTE`, `BILLING_RENEWAL` | Cobrança e renovação |

No relatório externo, não usar os códigos brutos. Traduzir para linguagem de cliente.

## 6. Entregável 1: relatório para o cliente

O relatório deve ser objetivo, executivo e sem termos internos da plataforma.

Não usar no relatório externo:

- `Optimization Hub`
- `Handoff Tickets`
- `Handoff Snapshots`
- `RAG`
- `AI_DONT_KNOW`
- `RETRY_EXHAUSTED`
- `LIE_DETECTOR`
- `checkpoint`
- `ticket`, se puder usar “atendimento transferido”
- qualquer nome de tabela ou query

Termos recomendados:

| Interno | Externo |
|---|---|
| Deflexão | Taxa de resolução pela IA |
| Handoff | Transferência para o time humano |
| RAG | Base de conhecimento |
| Retry exhausted | Falha de resposta automática ou resposta em loop |
| AI don’t know | Informação não encontrada na base |
| Snapshot | Amostra de conversa analisada |
| Ticket | Atendimento transferido |

Estrutura recomendada:

1. Resumo executivo.
2. Comparativo com relatório anterior.
3. Por que houve mais atendimento humano.
4. Principais motivos de transferência.
5. Operação após transferência.
6. Temas e fricções mais recorrentes.
7. Ajustes já realizados.
8. Plano de ação recomendado.
9. Conclusão.

### 6.1 Resumo executivo

Manter curto. O cliente precisa entender:

- o que mudou;
- se melhorou ou piorou;
- por que o atendimento humano subiu ou caiu;
- o que será feito a seguir.

### 6.2 Ajustes já realizados

Falar em overview, não FAQ por FAQ.

Exemplo:

> Foram reforçadas respostas na base para cobrir dúvidas recorrentes sobre acesso, uso correto do produto, comparação com buscadores comuns, variação de tarifas, cancelamento por expectativa desalinhada, cobrança/renovação e coleta de contexto antes de cotação específica.

### 6.3 Plano de ação

O plano de ação para o cliente deve ser o que depende dele responder.

Não colocar como plano:

- “criar FAQ X”, se a equipe interna já pode criar;
- “ajustar checkpoint”, se já foi feito;
- “revisar planilha”, se isso é bastidor.

Colocar como plano:

- links oficiais;
- política de cancelamento;
- regra de renovação;
- benefícios oficiais;
- canais oficiais;
- critérios de produto;
- prazos oficiais;
- procedimentos operacionais que só o cliente conhece.

## 7. Entregável 2: perguntas para o cliente

Este arquivo deve ter somente o que não temos resposta segura.

Não perguntar:

- o que já está claro na base;
- o que já apareceu em FAQ oficial;
- o que pode ser inferido com segurança;
- detalhes internos que o cliente não precisa saber.

Perguntar:

- links oficiais;
- política comercial;
- preço/teste;
- prazo;
- benefício;
- canal;
- procedimento;
- regra de elegibilidade;
- produto certo para cada caso.

Organização sugerida:

1. Links e canais oficiais.
2. Preço, teste e compra.
3. Benefícios, bônus e pacote.
4. Acesso, login e segurança.
5. Cancelamento, reembolso e renovação.
6. Produtos e direcionamento.
7. Passagem emitida e suporte operacional.
8. Perguntas prioritárias.

## 8. Entregável 3: backlog interno de FAQs/ajustes

Este arquivo é interno. Não enviar para o cliente como relatório.

Cada item deve ter status:

- Reduz handoff.
- Reduz handoff em parte.
- Melhora handoff.
- Não adicionar ainda.

### 8.1 Reduz handoff

Use quando a IA consegue responder e continuar resolvendo sem humano.

Exemplos:

- diferença entre produto e concorrente;
- como usar melhor uma funcionalidade;
- por que uma tarifa muda;
- como interpretar uma informação do produto;
- como ajustar uma busca.

### 8.2 Reduz handoff em parte

Use quando a IA resolve casos simples, mas casos persistentes ainda exigem humano.

Exemplos:

- primeiro acesso;
- recuperação de senha;
- tarifa que trava;
- cliente querendo cancelar por expectativa desalinhada;
- pós-formulário quando o cliente só quer entender o próximo passo.

### 8.3 Melhora handoff

Use quando a IA não resolve, mas coleta contexto para o humano.

Exemplos:

- cotação específica;
- cobrança duplicada;
- problema de cadastro persistente;
- passagem já emitida;
- alteração ou remarcação.

Importante:

Não vender isso internamente como redução direta de handoff. É melhoria de qualidade da transferência.

### 8.4 Não adicionar ainda

Use quando depende de resposta oficial do cliente.

Exemplos:

- link oficial;
- valor;
- prazo;
- política;
- canal;
- benefício;
- elegibilidade.

## 9. Regra para transformar achados em FAQ

Uma FAQ deve responder uma intenção real do lead.

Formato recomendado:

Pergunta:

- Deve ser uma pergunta de verdade.
- Pode usar linguagem coloquial.
- Não usar frases soltas como “Quero cancelar porque não encontrei resultado”.
- Transformar em: “O que fazer quando quero cancelar porque não encontrei resultado?”

Resposta:

- Deve orientar o cliente.
- Deve evitar promessa indevida.
- Deve evitar encaminhar humano quando a IA pode resolver.
- Se terminar em “vou encaminhar para o time”, classificar como “melhora handoff”, não como “reduz handoff”.

## 10. Regra para atualizar checkpoint

Checkpoint não é base de conhecimento.

O checkpoint recebe:

- identidade do agente;
- tom;
- limites;
- ordem de decisão;
- critérios antes de transferir;
- critérios de escalada;
- regras de promessa;
- variáveis e links oficiais;
- comportamento em casos sensíveis.

O checkpoint não deve receber:

- explicações longas de produto;
- respostas detalhadas de FAQ;
- lista extensa de benefícios;
- preço detalhado;
- scripts longos de objeção;
- conteúdo que já está coberto pela base de conhecimento.

Regra prática:

Se é algo que o cliente pergunta e a IA precisa responder, vai para FAQ/base.  
Se é algo que define como a IA deve agir, vai para checkpoint.

## 11. Checklist antes de entregar

Antes de finalizar:

- [ ] Planilha principal salva na pasta correta.
- [ ] Handoff Snapshots salvo na pasta correta, se existir.
- [ ] Handoff Tickets salvo na pasta correta, se existir.
- [ ] Métricas oficiais tiradas da planilha principal.
- [ ] Motivos de handoff agrupados por intenção.
- [ ] Comparação feita com relatório anterior, se houver.
- [ ] Relatório externo sem nomes internos de tabela ou plataforma.
- [ ] Plano de ação contém apenas lacunas que dependem do cliente.
- [ ] Backlog interno separa redução real de handoff vs melhoria de transferência.
- [ ] Não afirmar que pegou resposta humana se não houver tabela pós-handoff.
- [ ] Checkpoint não recebeu conteúdo duplicado de FAQ.
- [ ] PDF gerado, se o cliente for receber relatório final.

## 12. Estrutura de pastas recomendada

Dentro da campanha:

```text
Cliente/
  Campanha/
    Checkpoint/
      checkpoint.md
    FAQs/
      ...
    Suporte hoje/
      optimization-hub-AAAA-MM-DD.xlsx
    Handoff Snapshots/
      query_result_...xlsx
    Handoff Tickets/
      query_result_...xlsx
    Relatório de Performance - Cliente - DD-MM.md
    Relatório de Performance - Cliente - DD-MM.pdf
    Perguntas para Cliente - Cliente - DD-MM.md
    Backlog Interno de FAQs - Cliente - DD-MM.md
```

## 13. Mensagem sugerida para enviar ao cliente

```text
Fala, tudo bem?

Preparei o relatório atualizado da IA de suporte com o comparativo do período.

Resumo rápido: o volume de conversas aumentou, então o número absoluto de atendimentos humanos também pode subir. O ponto principal é olhar a taxa proporcional: quando a IA resolve uma fatia maior das conversas, a operação melhora mesmo com mais volume.

Também separei um arquivo com perguntas objetivas que precisamos validar com vocês. Essas respostas vão ajudar a completar a base de conhecimento e reduzir transferências desnecessárias para o suporte humano.

Envio em anexo:
1. Relatório de performance atualizado.
2. Perguntas para completar a base de conhecimento.

Se puderem responder primeiro os itens prioritários, já conseguimos aplicar as próximas melhorias na IA.
```

Não enviar o backlog interno para o cliente, salvo se o usuário pedir explicitamente.

## 14. Regra de ouro

Relatório bom não é o que tem mais métrica. Relatório bom é o que mostra:

- o que aconteceu;
- por que aconteceu;
- o que já foi corrigido;
- o que ainda falta o cliente responder;
- quais ações vão reduzir handoff sem piorar a experiência.
