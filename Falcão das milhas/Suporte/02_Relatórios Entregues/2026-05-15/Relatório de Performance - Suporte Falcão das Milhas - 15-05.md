# Relatório de Performance - Suporte Falcão das Milhas

Período analisado: 15/04/2026 a 15/05/2026  
Campanha: IA de Suporte - Falcão das Milhas

## 1. Resumo executivo

O volume de conversas aumentou de forma significativa em relação ao relatório anterior. No relatório de 11/05 havia 21 conversas analisadas; no relatório atual há 294 conversas analisadas.

Em número absoluto, o atendimento humano também aumentou: de 14 conversas para 119. Porém, proporcionalmente, o cenário melhorou. A taxa de intervenção humana caiu de 66,7% para 40,5%, enquanto a taxa de resolução pela IA subiu de 29% para 47,6%.

Isso indica que o aumento de transferências para o time humano aconteceu principalmente por aumento de volume, não por piora proporcional da IA. A IA passou a absorver mais atendimentos, mas o crescimento da demanda elevou o número bruto de casos enviados ao suporte humano.

## 2. Comparativo com o relatório anterior

| Métrica | Relatório 11/05 | Relatório 15/05 | Leitura |
|---|---:|---:|---|
| Conversas analisadas | 21 | 294 | Aumento forte de volume |
| Resolvidas pela IA | 6 | 140 | IA absorveu muito mais casos |
| Resolvidas por humano | 14 | 119 | Subiu em número absoluto |
| Abandonadas | 1 | 35 | Cresceu junto com o volume |
| Taxa de resolução pela IA | 29% | 47,6% | Melhorou significativamente |
| Intervenção humana | 66,7% | 40,5% | Caiu proporcionalmente |
| CSAT médio | 4,5/5 | 4,56/5 | Manteve satisfação positiva |
| Cobertura da base de conhecimento | 83,9% | 85,5% | Leve melhora |

## 3. Por que houve mais atendimentos humanos?

O principal motivo foi o crescimento do volume total. A comparação direta mostra:

| Indicador | Antes | Agora |
|---|---:|---:|
| Conversas analisadas | 21 | 294 |
| Conversas humanas | 14 | 119 |
| Taxa humana | 66,7% | 40,5% |

A leitura correta é: houve mais atendimentos humanos em número absoluto, mas menos intervenção humana proporcionalmente. A operação recebeu muito mais conversas e a IA segurou uma fatia maior delas.

## 4. Principais motivos de transferência

Os principais motivos de transferência para humano foram agrupados abaixo em linguagem operacional:

| Motivo | Ocorrências | Leitura |
|---|---:|---|
| Informação não encontrada na base | 27 | Principal oportunidade de reforço da base de conhecimento |
| Acesso, login, senha ou cadastro | 24 | Ainda é um gargalo importante |
| Falha de resposta automática ou resposta em loop | 11 | Ajustes de instrução e resposta podem reduzir esse bloco |
| Pedido direto para falar com humano | 9 | Parte é inevitável, mas pedidos genéricos podem receber uma tentativa objetiva antes |
| Cancelamento já confirmado | 7 | Casos sensíveis, exigem fluxo correto e respeito à decisão do cliente |
| Cancelamento solicitado | 5 | Oportunidade de entender motivo antes de enviar formulário |
| Cancelamento ou reembolso | 4 | Precisa de regra clara sobre formulário, análise e pós-envio |

Ao agrupar motivos equivalentes em uma análise mais ampla dos atendimentos transferidos, os maiores blocos foram:

| Bloco | Casos analisados | Leitura |
|---|---:|---|
| Informação não encontrada ou dúvida sem resposta segura | 71 | Base precisa cobrir melhor dúvidas comerciais, links oficiais, benefícios e perguntas de produto |
| Acesso, login e cadastro | 43 | Fluxo técnico precisa ser bem fechado antes do humano |
| Cancelamento e reembolso | 42 | Fluxo de retenção e pós-formulário precisa ser mais explícito |
| Falha de resposta, loop ou quebra de regra | 20 | Ajustes de resposta reduzem transferências sem depender do cliente |
| Pedido de humano | 18 | Manter respeito ao pedido insistente, mas tentar resolver pedidos genéricos |

## 5. Operação após transferência

Na amostra operacional de atendimentos transferidos, foram encontrados:

| Indicador | Resultado |
|---|---:|
| Atendimentos transferidos analisados | 220 |
| Transferências automáticas | 219 |
| Transferência manual | 1 |
| Resolvidos | 193 |
| Ainda em atendimento | 27 |
| SLA estourado | 0 |
| Casos que voltaram por problema não resolvido | 20 |
| Mediana entre atribuição e resolução | 6,65h |
| Média entre atribuição e resolução | 30,36h |

A ausência de SLA estourado é positiva. O ponto de atenção está nos 20 casos que voltaram como problema não resolvido, porque indicam necessidade de revisar a qualidade da conclusão ou o alinhamento de expectativa em alguns atendimentos.

## 6. Temas e fricções mais recorrentes

Principais temas do período:

| Tema | Ocorrências | CSAT médio |
|---|---:|---:|
| Cancelamento de assinatura | 113 | 4,18 |
| Acesso à plataforma | 61 | 5 |
| Uso do Buscador | 41 | 5 |
| Busca de passagens aéreas | 27 | 5 |
| Erro de cadastro | 12 | 4 |

Principais fricções de produto:

| Fricção | Ocorrências | Leitura |
|---|---:|---|
| Buscador Automático | 77 | Maior bloco de percepção de valor e uso do produto |
| Buscador de passagens | 28 | Relacionado a comparação, busca e expectativa de resultado |
| Login | 19 | Acesso ainda gera volume relevante |
| Buscador | 15 | Variação do mesmo tema principal |
| Buscador de milhas | 13 | Reforça necessidade de explicar uso, milhas e disponibilidade |

## 7. Ajustes já realizados

Foi aplicada uma reorganização nas instruções da IA para deixar o atendimento mais objetivo e reduzir custo de processamento. O conhecimento detalhado ficou concentrado na base de conhecimento, enquanto as instruções principais ficaram focadas em comportamento, tomada de decisão e critérios de transferência.

Também foram adicionadas e reforçadas respostas na base para cobrir os cenários que mais apareciam como dúvida recorrente. O foco foi ampliar a autonomia da IA em temas como uso correto do Buscador, diferença entre busca manual e Tarifas Awards, variação de tarifas, frustração por falta de resultado, cancelamento por expectativa desalinhada, primeiro acesso, recuperação de senha, cobrança/renovação e coleta correta de contexto antes de uma cotação específica.

Em paralelo, foram reforçadas regras para:

- consultar a base de conhecimento antes de transferir;
- não enviar formulário de reembolso para problemas de acesso;
- tentar retenção antes de cancelar, quando aplicável;
- coletar e-mail de compra antes de casos internos;
- não prometer reset, reembolso, prazo, emissão ou consulta interna;
- evitar transferência por insegurança quando existe resposta aplicável na base;
- tratar cotação específica como caso personalizado, com coleta mínima de contexto.

## 8. Plano de ação recomendado

Ainda existem lacunas que dependem de confirmação oficial da Falcão das Milhas. As respostas abaixo devem ser priorizadas porque permitem fechar novas entradas da base de conhecimento e reduzir transferências por falta de informação segura.

| Prioridade | Informação necessária | Impacto esperado |
|---|---|---|
| Alta | Link oficial de acesso ao Buscador e canais oficiais permitidos | Evitar transferências por pedido de link e impedir envio de canais incorretos |
| Alta | Lista oficial de benefícios e bônus inclusos no pacote | Reduzir dúvidas sobre o que foi comprado e onde acessar cada entrega |
| Alta | Regras oficiais após envio do formulário de reembolso | Reduzir transferências repetitivas de clientes que já preencheram o formulário |
| Alta | Política de cancelamento, reembolso e renovação automática | Evitar respostas inseguras sobre prazo, elegibilidade e cobrança |
| Média | Condições de teste, preço ou link de compra do Buscador, se existirem | Responder dúvidas comerciais sem depender do suporte humano |
| Média | Critérios oficiais para indicar The Travel, Black Falcon, Balcão de Milhas ou Consultoria | Melhorar direcionamento quando o produto atual não atende a necessidade do cliente |
| Média | Procedimento oficial para passagem emitida, alteração, remarcação ou reserva não localizada | Encaminhar casos operacionais com mais precisão e menos vai-e-volta |

## 9. Conclusão

O aumento de atendimentos humanos em número absoluto é explicado principalmente pelo crescimento do volume de conversas. A taxa proporcional melhorou: a IA saiu de 29% para 47,6% de resolução própria e reduziu a intervenção humana de 66,7% para 40,5%.

O próximo ganho está em atacar os blocos mais frequentes: dúvidas sem resposta segura na base, acesso, cancelamento/reembolso e falhas de resposta automática. Com a base de conhecimento mais completa e regras mais objetivas, a tendência é reduzir transferências evitáveis sem impedir que casos realmente sensíveis cheguem ao humano.
