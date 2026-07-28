# Relatório de Performance - IA de Suporte Falcão das Milhas

Período analisado: 11/04/2026 a 11/05/2026  
Fonte: Optimization Hub - 11/05/2026  
Campanha: IA de Suporte - Falcão das Milhas

## Objetivo deste relatório

Apresentar uma visão consolidada da operação atual da IA de Suporte da Falcão das Milhas, com foco em volume atendido, deflexão, satisfação, principais motivos de contato, gargalos de handoff e oportunidades de melhoria já endereçadas na campanha.

O objetivo principal da otimização realizada foi aumentar a capacidade da IA de resolver dúvidas comuns antes de transferir para o atendimento humano, sem deixar de escalar casos que realmente exigem ação interna, suporte especializado ou pedido explícito do cliente para falar com humano.

## 1. Visão geral de performance

| Indicador | Resultado | Leitura |
|---|---:|---|
| Conversas no período | 21 | Volume analisado no snapshot do Optimization Hub. |
| Resolvidas 100% pela IA | 6 | Representa 29% de deflexão. |
| Atendimento humano | 14 | A maior parte das conversas ainda passou por humano. |
| Deflexão | 29% | Principal ponto de evolução da campanha. |
| Intervenção humana | 66,7% | Indica oportunidade clara de reduzir handoffs evitáveis. |
| CSAT médio | 4,5/5 | Satisfação positiva no período. |
| Problema resolvido no pós-handoff | 6/6 | 100% dos respondentes marcaram como resolvido. |
| Cobertura RAG | 83,9% | Boa cobertura de base, com espaço para melhorar respostas em pontos específicos. |

Leitura executiva: a campanha apresenta boa satisfação final, mas a operação ainda depende bastante do atendimento humano. A combinação de 29% de deflexão e 66,7% de intervenção humana mostra que o maior ganho esperado está em qualificar melhor a IA para resolver dúvidas recorrentes e só transferir casos realmente necessários.

## 2. Principais motivos de contato e fricção

Os temas mais recorrentes do período ficaram concentrados em três grupos:

| Tema | Evidência no relatório | Interpretação |
|---|---|---|
| Cancelamento, assinatura e reembolso | `CANCELAMENTO_ASSINATURA` apareceu em 3 conversas; também houve tópicos de reembolso, cancelamento por insatisfação e cancelamento por motivo de saúde. | O fluxo de retenção e triagem de cobrança precisa ser muito claro para evitar envio precoce de formulário. |
| Uso e percepção de valor do Buscador | Buscador Automático apareceu como fricção em 6 reclamações; Buscador de passagens em 4. | Parte da fricção vem de expectativa desalinhada entre busca manual, Tarifas Awards e comparação com buscadores comuns. |
| Acesso e erro técnico | Houve fricção específica de acesso à área de membros com erro 404. | O atendimento precisa coletar contexto técnico simples antes do handoff e evitar envio de links não oficiais. |

Também apareceu fricção sobre mudança na exibição de preços ou quantidade de milhas no Buscador. Esse ponto é importante porque pode gerar sensação de erro no produto, mesmo quando a causa está ligada ao comportamento dinâmico de tarifas award, disponibilidade e confirmação final no site da companhia ou parceiro.

## 3. Gargalos de handoff

O relatório mostra que 100% dos handoffs do período foram automáticos. Os principais motivos listados foram:

| Motivo | Total no relatório | Leitura |
|---|---:|---|
| `AI_DONT_KNOW` | 2 | A IA precisou de mais segurança para responder com base no conhecimento disponível. |
| Cancelamento confirmado, solicitado ou insistente | 4 eventos listados | Fluxo sensível, precisa equilibrar retenção com respeito à decisão do cliente. |
| Reembolso/cancelamento | 1 | Precisa seguir regra de formulário apenas quando fizer sentido. |
| Problema de acesso | 1 | Pode ser reduzido com triagem técnica inicial mais objetiva. |
| `LIE_DETECTOR` | 1 | Indica atuação de segurança do auditor/resposta automática. |

Leitura executiva: o handoff não deve ser eliminado, porque há casos financeiros, acesso travado, emissão de passagem, pedido explícito de humano e situações especializadas que realmente precisam do time. A oportunidade está nos casos em que a IA transbordava por insegurança, resposta genérica, falta de interpretação do contexto ou ausência de condução antes da transferência.

## 4. O que a IA já vinha performando bem

Mesmo com a taxa de handoff ainda alta, há sinais positivos na campanha:

| Ponto positivo | Evidência |
|---|---|
| Satisfação final positiva | CSAT médio de 4,5/5 no período. |
| Resolução percebida após atendimento | 6 de 6 respostas pós-handoff indicaram problema resolvido. |
| Boa cobertura de base | RAG com 83,9% de cobertura. |
| Capacidade de absorver dúvidas variadas | A campanha tratou temas de acesso, produto, busca, benefícios, cobrança e cancelamento. |

O ponto principal não é falta de qualidade percebida pelo cliente, mas sim aumentar a autonomia da IA em dúvidas recorrentes e melhorar a passagem para humano quando ela for necessária.

## 5. Ajustes já realizados na campanha

Com base no relatório atual e nos pontos enviados pela Falcão das Milhas, já foram aplicadas melhorias na estrutura da IA, na base de conhecimento e nas configurações operacionais.

| Frente ajustada | O que foi feito | Impacto esperado |
|---|---|---|
| Lógica antes do handoff | A IA agora tem uma progressão clara: entender intenção, consultar base, orientar, educar, reter quando fizer sentido e encaminhar humano quando necessário. | Reduzir handoffs por resposta genérica ou insegurança da IA. |
| Interpretação do contexto e não-repetição | A IA passou a interpretar dados já informados pelo cliente (origem, destino, datas, problema, bônus) e a avançar a cada turno em vez de repetir perguntas ou explicações. | Reduzir sensação de atendimento automático e demonstrar entendimento estratégico do que o cliente já trouxe. |
| `AI_DONT_KNOW` | Foram reforçadas instruções para a IA usar a base antes de escalar e não prometer verificação interna, retorno futuro ou abertura de chamado. | Diminuir transbordos por incapacidade declarada da IA. |
| Busca manual vs Tarifas Awards | A base passou a explicar melhor a diferença entre busca manual e seção Tarifas Awards, com foco em reposicionar expectativa e mostrar onde está o principal diferencial do produto. | Melhorar percepção de valor e reduzir frustração de clientes que comparam o Buscador com Skyscanner. |
| Tarifas, preços e milhas dinâmicas | Foi adicionada orientação sobre disponibilidade dinâmica, confirmação final na companhia/parceiro e diferença entre card do Buscador e emissão final. | Responder melhor dúvidas sobre mudança de preço, milhas ou tarifa que desaparece. |
| Uso correto do Buscador (postura pedagógica) | A IA passou a explicar o preenchimento completo dos campos obrigatórios (origem, destino, datas, programa, passageiros) e a validar se todos foram preenchidos antes de interpretar erro como falha do sistema. Foi removido o uso do termo "janela de datas" como se fosse busca flexível automática. | Reduzir erros do cliente por instrução incompleta e evitar expectativa errada sobre funcionalidades inexistentes. |
| Cancelamento e reembolso | O fluxo passou a exigir entendimento do motivo e tentativa de retenção antes do envio do formulário, quando aplicável. A IA também foi orientada a não confirmar prazos da garantia (ex: 7 dias) para não criar brecha indevida. | Evitar cancelamentos por falta de orientação, reduzir envio precoce de formulário e remover risco de confirmar elegibilidade que não foi validada. |
| Renovação automática e cobrança | Renovação deixou de ser tratada automaticamente como cancelamento/reembolso. A IA passou a validar a insatisfação, explicar brevemente como funciona a renovação e direcionar ao fluxo correto. | Encaminhar melhor casos financeiros e reduzir atrito de atendimento automático. |
| Falta de uso e baixa autonomia | Foi incluída a Consultoria Individual como alternativa para clientes que precisam de acompanhamento mais próximo, com reposicionamento de valor antes do formulário de cancelamento. | Converter parte das conversas de cancelamento em possível migração para solução mais adequada. |
| Acesso, erro 404 e coleta de evidência | O fluxo de acesso foi reforçado com pedido de print do erro, coleta de e-mail de compra, testes básicos e cuidado para não enviar link não oficial da área de membros. | Identificar o tipo de erro com mais precisão, reduzir respostas genéricas e evitar repetição de link incorreto. |
| Bônus não localizado | Foi criado tratamento específico para bônus, separado de problema genérico de acesso, com reconhecimento imediato do problema informado e orientação direta. | Melhorar interpretação da dúvida e evitar perguntas repetidas. |
| Cotação específica | A IA foi orientada a fazer triagem (origem, destino, datas, milhas acumuladas, quantidade de pessoas, bagagem) mas não prometer que irá buscar voo ou cotar passagem, e a informar que cotações específicas envolvem taxa antes de encaminhar. | Evitar expectativa incorreta e encaminhar corretamente casos personalizados. |
| Passagem emitida, compra errada ou Oner | A IA foi orientada a tratar como suporte especializado, não como dúvida comum do Buscador, direcionando ao canal responsável. | Reduzir demora e retrabalho em casos operacionais. |
| Encerramento de atendimento humano por inatividade | Foi configurado Smart Follow-Up para atendimento humano inativo, com mensagem de acompanhamento e encerramento automático após período sem retorno. | Evitar tickets parados em "Respondidos" e permitir que a IA volte a atender novas mensagens quando o atendimento for encerrado. |
| Acompanhamento de fila | A IA de acompanhamento da fila foi ativada com orientação para acalmar o lead e informar horário oficial do suporte quando configurado, sem prometer prazo exato. | Melhorar experiência durante espera pelo time humano. |
| Auditor de respostas | Auditor ativo com retries para promessa humana, quebra de persona, falha de ferramenta, idioma e outros riscos. | Aumentar segurança e consistência antes do envio da resposta. |
| CSAT | Coleta de satisfação configurada após encerramento. | Manter leitura contínua de satisfação e resolução percebida. |

Importante: pedidos explícitos de atendimento humano continuam sendo respeitados. A otimização não busca impedir o cliente de falar com uma pessoa; busca evitar transferências desnecessárias quando a dúvida pode ser resolvida pela IA.

## 6. O que deve melhorar a partir dos ajustes

| Indicador ou comportamento | Tendência esperada |
|---|---|
| Deflexão da IA | Tende a aumentar conforme dúvidas de uso, acesso simples, Tarifas Awards e comparação com buscadores comuns forem melhor resolvidas pela base. |
| Intervenção humana | Tende a cair nos casos de dúvida comum, mas deve permanecer em casos financeiros, acesso persistente, emissão, Oner e pedido explícito de humano. |
| Qualidade do handoff | Quando houver transferência, o humano deve receber contexto melhor, e-mail de compra e descrição mais clara do problema. |
| Cancelamento por falta de uso | Parte desses casos tende a receber abordagem de retenção e alternativa de Consultoria Individual antes do formulário. |
| Percepção de valor do Buscador | A explicação sobre Tarifas Awards deve ajudar clientes a entenderem melhor onde está o principal diferencial do produto. |

## 7. Recomendações para acompanhamento

Para medir se a otimização surtiu efeito, recomendamos acompanhar no próximo ciclo:

| Métrica | O que observar |
|---|---|
| Deflexão | Comparar com a base atual de 29%. |
| Intervenção humana | Verificar se cai abaixo dos 66,7% sem queda de CSAT. |
| Motivo `AI_DONT_KNOW` | Deve ser acompanhado com expectativa de redução se a nova base estiver cobrindo os cenários principais. |
| Cancelamento/reembolso | Observar se a IA tenta retenção antes do formulário quando o caso permitir. |
| Tópicos de Buscador e Tarifas Awards | Verificar se há menos fricção por comparação com Skyscanner, busca manual e falta de percepção de valor. |
| CSAT | Manter acima de 4,5/5, validando que a redução de handoff não piorou experiência. |

## 8. Conclusão

A campanha apresenta uma base saudável de satisfação, com CSAT médio de 4,5/5 e boa resolução percebida após atendimento humano. O principal desafio atual não é satisfação final, mas eficiência: a IA ainda transfere uma parcela alta das conversas que poderiam ser resolvidas na própria conversa.

As otimizações já aplicadas atacam diretamente os pontos identificados no relatório e no feedback da Falcão das Milhas: uso do Buscador, diferença entre busca manual e Tarifas Awards, cancelamento/reembolso, renovação automática, acesso, erro 404, passagem emitida, cotações específicas e retenção.

Com esses ajustes, a expectativa é que a IA passe a resolver melhor os casos recorrentes, encaminhe menos por insegurança e entregue handoffs mais qualificados quando o atendimento humano for realmente necessário.

Relatório gerado em 11/05/2026 - Análise de IA - Awsales - Falcão das Milhas
