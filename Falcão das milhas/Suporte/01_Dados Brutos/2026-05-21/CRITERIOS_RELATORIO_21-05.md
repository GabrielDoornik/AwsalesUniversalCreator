# Critérios do relatório - Suporte Falcão das Milhas - 21/05/2026

Este arquivo registra o escopo final combinado antes da análise das tabelas grandes. Usar como guia para não perder contexto durante o processamento dos dados.

## 1. Objetivo principal

Criar um relatório para enviar ao João, da Falcão das Milhas, conectando performance da IA de suporte com impacto financeiro.

O relatório não deve ser apenas operacional. Ele precisa responder:

- A IA está ajudando o suporte?
- A IA reduziu carga do time humano?
- A IA ajudou a reter pedidos de cancelamento/reembolso?
- Qual foi o valor recuperado ou preservado pela AWSales?
- Vale manter e expandir a IA para outros projetos?

## 2. Task enviada pelo chefe

Task literal:

Enviar ao João os dados da reunião:

- taxa de reembolso;
- valor recuperado pela AWSales de pedidos de reembolso;
- análise conclusiva do suporte.

Esses três pontos são obrigatórios no relatório final.

## 3. Pedido do João na reunião

O João disse que está achando a IA boa no geral e que o time já está documentando ajustes semanais.

Ele pediu que o relatório mostre melhor:

- custo total da IA na semana ou mês;
- custo por atendimento;
- comparação com atendimento humano;
- tempo humano economizado;
- retenções feitas pela IA;
- redução de reembolso;
- impacto financeiro claro para mostrar ao financeiro/liderança;
- análise em linguagem executiva, pronta para reunião de líderes na sexta de manhã.

Ele também comentou que:

- o custo da IA é aceitável se estiver gerando ROI;
- o processo melhorou;
- houve menos pressão em Reclame Aqui;
- a IA parece estar com performance mais interessante;
- se der certo, eles tendem a expandir para novos projetos.

## 4. Dados financeiros já conhecidos

Data atual: 21/05/2026.

Custo total informado da IA no mês até hoje:

- R$ 3.873,52

Observação de escopo:

- A análise detalhada de reembolso e valor recuperado pode ser feita depois, em uma etapa separada.
- O usuário tem acesso ao checkout do cliente e vai orientar posteriormente como seguir nessa parte.
- No relatório de suporte atual, se os dados de checkout ainda não forem enviados, tratar taxa de reembolso, valor recuperado e retenção financeira como pendências ou seção futura, sem inventar números.

Baseline histórico de reembolso informado pelo João:

- aproximadamente 22,5% a 23%;
- análise histórica dos últimos 4 meses ficava nessa faixa;
- usar 22,5% como referência conservadora e mencionar 23% como faixa histórica.

Exemplo de faturamento citado pelo João:

- se a operação vende R$ 1.000.000/mês, uma queda de reembolso de 22% para 15% representa impacto financeiro relevante.

Não inventar faturamento real do período se não vier em tabela oficial. Se usar cenário hipotético, rotular como simulação.

## 5. Períodos que devem ser analisados

Como o último relatório foi até 15/05/2026, separar:

- Recorte novo: 16/05/2026 a 21/05/2026.
- Acumulado do mês: 01/05/2026 a 21/05/2026.
- Comparativo: relatório anterior até 15/05 vs dados novos após 15/05.

Se alguma tabela vier sem filtro de data, filtrar localmente por `Created At`, `created_at`, `Analyzed At`, `analyzed_at` ou campo equivalente.

## 6. Insumos esperados

### 6.1 Optimization Hub

Relatório principal da campanha.

Usar para:

- conversas analisadas;
- resolvidas pela IA;
- resolvidas por humano;
- abandonadas;
- taxa de resolução pela IA;
- intervenção humana;
- CSAT;
- volume por dia;
- tópicos;
- fricções;
- fila e operadores, se vierem no arquivo.

### 6.2 Tactical Analysis

Tabela do banco com uma linha por conversa analisada.

Nome identificado pelo usuário:

- Tactical Analysis

Campos úteis:

- `ID`
- `Conversation ID`
- `Conversation Agent Session ID`
- `Campaign ID`
- `Created At`
- `Analyzed At`
- `Resolution Status`
- `Had Handoff`
- `Handoff Reason`
- `Topic Primary`
- `Topic Secondary`
- `Topic Tags`
- `Is Product Friction`
- `Product Friction Feature`
- `Rag Missing Info`
- `Rag Accuracy`
- `Ai Cost Usd ($)`
- `Duration Total Seconds`
- `Duration Ai Only Seconds`
- `Duration Human Handling Seconds`
- `Csat Score`
- `Analysis Json`
- `Summary`

Usar para:

- custo por conversa quando aplicável;
- temas recorrentes;
- resolução;
- handoff;
- retenção qualitativa;
- fricções de produto;
- lacunas da base.

### 6.3 Handoff Snapshots

Usar para entender por que a IA transferiu.

Campos úteis:

- `ID`
- `Conversation ID`
- `Conversation Agent Session ID`
- `Handoff Ticket ID`
- `Handoff Type`
- `Handoff Reason`
- `Handoff Summary`
- `Rag Last Query`
- `Rag Results`
- `Rag Score`
- `Response Auditor Last Feedback`
- `Last Ai Response`
- `Last User Message`
- `Conversation Transcription`
- `Created At`
- `Updated At`

Usar para:

- motivos reais de handoff;
- última tentativa da IA;
- lacunas da base;
- transferências evitáveis;
- transferências inevitáveis;
- contexto antes do humano assumir.

### 6.4 Handoff Tickets

Usar para analisar pós-transferência.

Campos úteis:

- `ID`
- `Conversation ID`
- `Conversation Agent Session ID`
- `Handoff Reason`
- `Handoff Summary`
- `Priority`
- `Priority Score`
- `Status`
- `Assigned At`
- `Resolved At`
- `Sla Breached`
- `Return Count`
- `Last Return Reason`
- `Handoff Snapshot ID`
- `Created At`
- `Updated At`

Usar para:

- tickets resolvidos;
- tickets abertos;
- tempo de resolução;
- SLA;
- retornos por problema não resolvido;
- qualidade da transferência.

### 6.5 Conversas completas da campanha de suporte

O usuário vai extrair todas as conversas da campanha de suporte.

Campos ideais:

- `conversation_id`
- `conversation_agent_session_id`
- `created_at`
- `sender` ou `role`
- `message` ou `content`
- `is_handoff`
- `handoff_reason`
- `operator_id`
- `customer_phone`
- `customer_email`
- `campaign_id`

Usar para:

- reconstruir conversas por `conversation_id`;
- identificar pedidos de cancelamento/reembolso;
- identificar retenção;
- diferenciar IA vs humano;
- extrair padrões qualitativos;
- encontrar conversas em que o cliente desistiu de cancelar ou aceitou orientação.

### 6.6 Tabela/formulário de reembolso

Essencial para a parte financeira.

Campos ideais:

- ID do pedido ou solicitação;
- e-mail;
- telefone;
- produto;
- valor;
- data de compra;
- data de solicitação de reembolso;
- motivo;
- status final;
- reembolsado sim/não;
- pedido retido sim/não, se existir;
- origem do pedido, se existir.

Usar para:

- taxa de reembolso atual;
- comparação com baseline histórico;
- valor em risco;
- valor efetivamente reembolsado;
- valor recuperado/preservado;
- principais motivos de reembolso.

## 7. Métricas obrigatórias do relatório

### 7.1 Suporte

- conversas analisadas;
- resolvidas pela IA;
- transferidas/resolvidas por humano;
- abandonadas;
- taxa de resolução pela IA;
- taxa de intervenção humana;
- CSAT médio;
- principais motivos de contato;
- principais motivos de handoff;
- principais fricções de produto;
- tempo de fila/tempo de resolução, se disponível.

### 7.2 Custo e eficiência

- custo total da IA até 21/05/2026: R$ 3.873,52;
- custo por conversa;
- custo por conversa resolvida pela IA;
- custo estimado humano equivalente;
- horas humanas economizadas;
- economia operacional estimada;
- comparação IA vs operador humano.

Premissas operacionais vindas da reunião:

- operador: cerca de R$ 3.000/mês;
- jornada aproximada: segunda a sexta, 9h às 18h;
- equipe de suporte estimada: até 4 pessoas.

Não tratar economia operacional como economia de caixa direta se não houver redução real de headcount. Chamar de capacidade operacional preservada ou carga humana economizada.

### 7.3 Reembolso e retenção

- baseline histórico de reembolso: 22,5% a 23%;
- taxa atual de reembolso no período;
- diferença em pontos percentuais;
- pedidos de reembolso/cancelamento identificados;
- pedidos retidos pela IA;
- pedidos encaminhados para humano;
- valor total em risco;
- valor recuperado/preservado pela AWSales;
- principais motivos de cancelamento/reembolso;
- exemplos qualitativos, sem expor dados sensíveis.

## 8. Critérios para classificar retenção

Classificar como possível retenção quando a conversa mostrar:

- cliente pede cancelamento/reembolso;
- IA orienta, educa ou tenta resolver antes do formulário;
- cliente aceita testar, ajustar busca, conferir acesso ou aguardar;
- não há evidência de reembolso concluído depois;
- tabela de reembolso confirma que não foi reembolsado, se houver cruzamento por e-mail/telefone/conversation_id.

Classificar como retenção confirmada somente quando houver evidência em tabela oficial:

- pedido de reembolso não finalizado;
- status retido/cancelado/desistiu;
- compra permanece ativa;
- conversa indica desistência clara e tabela financeira confirma.

Classificar como retenção provável quando:

- a conversa indica que o cliente aceitou a orientação;
- não há tabela financeira confirmando o status final.

Classificar como não retenção quando:

- cliente insiste no cancelamento;
- IA envia formulário ou encaminha humano;
- tabela confirma reembolso;
- não há sinal de mudança de decisão.

## 9. Critérios para valor recuperado

Valor recuperado confirmado:

- soma dos valores de pedidos de reembolso/cancelamento que foram retidos com confirmação em tabela oficial.

Valor preservado estimado:

- diferença entre baseline histórico de reembolso e taxa atual, aplicada ao volume financeiro do período.

Exemplo:

- baseline: 22,5%;
- taxa atual: X%;
- faturamento do período: R$ Y;
- valor preservado estimado = (22,5% - X%) * Y.

Se não houver faturamento ou valor por pedido, não inventar. Apresentar como pendência ou usar simulação claramente rotulada.

## 10. Estrutura recomendada do relatório final

1. Resumo executivo.
2. Indicadores principais do período.
3. Performance do suporte.
4. Custo da IA e eficiência operacional.
5. Reembolso, retenção e valor recuperado.
6. Principais motivos de contato, handoff e cancelamento.
7. Análise conclusiva do suporte.
8. Próximas ações recomendadas.

## 11. Linguagem do relatório

O relatório será enviado ao João e pode ser usado com liderança/financeiro.

Usar linguagem:

- executiva;
- objetiva;
- orientada a ROI;
- sem termos internos desnecessários;
- sem nomes de tabela no corpo principal.

Evitar no relatório externo:

- `RAG`;
- `handoff snapshots`;
- `handoff tickets`;
- `tactical analysis`;
- `AI_DONT_KNOW`;
- `RETRY_EXHAUSTED`;
- nomes de queries ou tabelas.

Substituir por:

- base de conhecimento;
- transferências para humano;
- conversas analisadas;
- falha de resposta automática;
- informação não encontrada;
- atendimento humano.

## 12. Conclusão esperada

A conclusão deve responder de forma direta:

- a IA está performando bem ou não;
- se o custo de R$ 3.873,52 se justifica;
- se existe evidência de redução de carga humana;
- se existe evidência de retenção/redução de reembolso;
- o que ainda precisa melhorar.

Não prometer ROI se os dados não sustentarem. Se os dados sustentarem, escrever de forma clara e quantificada.

## 13. Pendências prováveis

Se faltar algum dado, registrar como pendência no relatório ou em arquivo auxiliar:

- faturamento do período;
- valor por pedido de reembolso;
- status final dos pedidos;
- confirmação de compras ativas após tentativa de cancelamento;
- mensagens humanas pós-handoff;
- custo detalhado por dia/campanha, se o total mensal não for suficiente.

## 14. Entregáveis esperados

Ao final da análise, criar:

- relatório final em `.md`;
- PDF do relatório, se necessário;
- arquivo auxiliar com perguntas/pendências para o João, se houver;
- opcionalmente, backlog interno de melhorias se surgirem novos gaps de base/checkpoint.
