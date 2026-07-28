# Fato, Causa e Ação - Suporte EQJC

Análise baseada no Optimization Hub do período de 28/04/2026 a 05/05/2026, checkpoint atual, FAQs extraídas dos PDFs e prints de configuração da campanha.

Observação importante: parte relevante dos handoffs do relatório ainda está contaminada pelo problema antigo das tools `buscar_membro_por_email` e `gerar_deep_link_curseduca`. Como a troca para `gerar_deep_link_de_acesso` foi aplicada em 04/05/2026, esses casos devem ser lidos como causa histórica já tratada, não como prioridade nova.

| Prioridade | Fato | Causa provável | Ação recomendada |
|---|---|---|---|
| P0 | `TOOL_FAILURE` representa a maior parte dos handoffs do período | O relatório ainda inclui dias em que as tools antigas retornavam erro HTTP/404 e acionavam transferência automática | Tratar como problema histórico já resolvido. Monitorar somente atendimentos após 04/05/2026 com a nova tool |
| P0 | `gerar_deep_link_de_acesso` aparece com 100% de sucesso | A nova tool via n8n retorna HTTP 200 com JSON estruturado `{ ok, deeplink, mensagem }` | Manter essa tool como única ativa no checkpoint e validar no painel se as tools antigas não estão selecionadas ou disponíveis para a campanha |
| P0 | FAQ de Playbook ainda cita `@buscar_membro_por_email` | A base de conhecimento ainda contém instrução antiga e pode contaminar a resposta da IA | Editar ou remover essa FAQ. Trocar por uma FAQ sobre retorno `ok=false` no deep link novo, sem mencionar tool antiga |
| P0 | Hub recomenda criar documento sobre “Matrículas Bloqueadas” e login | Já existe FAQ sobre o tema, mas ela é curta e não cobre todo o protocolo atual: deep link, cache, aba anônima, senha, novo e-mail e confirmação da Hotmart | Corrigir a FAQ “Apareceu matrículas bloqueadas...” para refletir a Seção 7 atual do checkpoint |
| P1 | Tópico “Acesso à Área de Membros” é a maior causa raiz de atrito | Acesso/login ainda concentra a maior parte das dúvidas reais dos alunos | Priorizar otimização das FAQs Produto e Playbook sobre acesso, login, e-mail, deep link e ambiente do navegador |
| P1 | `Lie Detector` gerou 3 intervenções | Algumas FAQs mandam a IA prometer coisas que ela não pode fazer, como “vou resolver agora”, “ficarei por perto”, “registre o caso” ou “agende próximo horário” | Limpar o Playbook removendo promessas de acompanhamento, registro interno, retorno futuro ou ação humana não executável |
| P1 | 208 tickets aguardando na fila e alerta “Fila acima do SLA” | Gargalo operacional humano. A campanha transfere pouco, mas quando transfere a fila fica parada por muito tempo | Avaliar ligar IA de acompanhamento da fila e revisar rotina/escala dos operadores. Timers só devem ser ligados se houver SLA real |
| P1 | Operadores aparecem suspensos e a fila média está alta | Operação humana com disponibilidade/capacidade inconsistente | Revisar operadores ativos, horários, permissões, capacidade por operador e regras de autosuspensão |
| P2 | `AI_DONT_KNOW` gerou 1 intervenção | Gap pontual de base ou resposta de encerramento pouco explícita | Criar FAQ Playbook curta ensinando como encerrar quando o aluno confirma que resolveu |
| P2 | Hub mostra gap “Como encerrar o atendimento após resolução” | O checkpoint já tem regra de encerramento, mas a base não ajuda o RAG quando esse tema aparece | Adicionar FAQ Playbook: quando o aluno disser “deu certo”, “resolvido” ou “obrigado”, encerrar curto e não abrir novo assunto |
| P2 | Template de CSAT está pendente na Meta | Fora da janela de 24h, a coleta de CSAT pode ficar prejudicada | Aprovar o template de CSAT. Não mexer no checkpoint por causa disso |
| P2 | Checkpoint local tem variável inválida no “Grupo oficial A Ruptura” | Está como `{{[https://sndflw.com/i/a-ruptura](https://sndflw.com/i/a-ruptura)}}`, que não é formato válido de variável | Corrigir para variável real, exemplo `{{link_do_grupo_A_Ruptura}}`, e cadastrar no painel se ainda não existir |
| P2 | Checkpoint local ainda tem asteriscos no glossário | A regra da plataforma proíbe `*` no checkpoint | Remover negritos do glossário antes de reaplicar no painel |

## Sequência recomendada

1. Corrigir a FAQ antiga que cita `@buscar_membro_por_email`.
2. Atualizar a FAQ de “matrículas bloqueadas/login” com o protocolo novo.
3. Limpar FAQs de Playbook que prometem ações humanas ou futuras.
4. Revisar configuração operacional da fila e acompanhamento enquanto aguarda humano.
5. Adicionar FAQ curta de encerramento pós-resolução.

## Leitura executiva

O maior vilão numérico do relatório ainda é a tool antiga, mas isso já foi atacado com a troca para `gerar_deep_link_de_acesso`. O próximo ganho real está em alinhar as FAQs com a nova arquitetura de deep link e remover instruções que fazem a IA prometer ações humanas que ela não executa.
