# Intervenção Humana, CSAT e Optimization Hub na Plataforma AWSales

Referência operacional para configurar, explicar e otimizar recursos de Intervenção Humana, CSAT e análise de suporte em campanhas da plataforma AWSales.

Essas configurações ficam no painel da campanha e nas áreas administrativas da plataforma. Elas não devem ser escritas como configuração técnica dentro do checkpoint nem nas FAQs.

O checkpoint pode mencionar handoff humano apenas como regra de comportamento do agente, por exemplo:

```markdown
- [ ] Se o lead relatar erro de acesso após as orientações iniciais, coletar o e-mail de compra e encaminhar para atendimento humano.
```

O checkpoint não deve detalhar timers, fila, autosuspensão, redistribuição, CSAT, template Meta, Response Auditor ou Optimization Hub. Isso é configuração operacional da plataforma.

---

## 1. Visão rápida

| Recurso | Para que serve | Onde configura | Quando usar |
|---|---|---|---|
| Equipes | Define destino, horário, capacidade e regras operacionais do time humano | Admin / Equipes | Antes de ligar handoff em qualquer campanha |
| Transferência Manual | Permite que humano assuma uma conversa/ticket | Campanha / Intervenção Humana | Suporte, onboarding, vendas assistidas e exceções sensíveis |
| Transferência Automática 2.0 | IA transfere sozinha quando gatilhos críticos são detectados | Campanha / Intervenção Humana + Response Auditor | Pedido de humano, baixa confiança, hostilidade, falha crítica ou casos que exigem pessoa |
| IA intermediária na fila | Mantém o lead informado enquanto aguarda atendimento humano | Campanha / Handoff | Operações com fila ou horário de atendimento definido |
| Sequência de Inatividade | Retoma e encerra tickets quando o lead para de responder | Campanha / Suporte | Campanhas de suporte com fila ativa |
| Timers de Atendimento | Controla SLA do operador humano | Equipe / Campanha | Times com compromisso real de tempo de resposta |
| Redistribuição | Repassa tickets se operador ficar suspenso/inativo | Campanha / Timers | Equipes com mais de um operador e SLA ativo |
| Response Auditor | Audita respostas e aplica ações como retry, handoff, finalize e blacklist | Campanha / Gatilhos | Todas as campanhas com risco de resposta ruim, custo alto ou necessidade de controle |
| CSAT | Mede resolução e satisfação no fim do atendimento | Campanha / CSAT | Campanhas de suporte |
| Optimization Hub | Diagnostica gaps, custos, transbordo, tools e base de conhecimento | Optimization Hub | Otimização contínua de suporte |

---

## 2. O que entra nos artefatos da campanha

### Entra no checkpoint

- Quando a IA deve tentar resolver sozinha.
- Quando deve coletar dados antes de encaminhar.
- Quando deve fazer handoff humano por comportamento.
- Como avisar o lead antes de transferir.
- Limites de escopo do agente.
- Regras de uso de tools, se a campanha tiver tools.

Exemplo:

```markdown
- [ ] Se o lead disser que não recebeu acesso, pedir o e-mail usado na compra e orientar a checar caixa de entrada e spam.
- [ ] Se após essa orientação o lead continuar sem acesso, encaminhar para atendimento humano com o contexto do problema.
```

### Não entra no checkpoint

- Configuração de equipes.
- Timer de operador.
- Autosuspensão.
- Redistribuição de ticket.
- Template Meta de CSAT.
- Perguntas de CSAT.
- Gatilhos técnicos do Response Auditor.
- Métricas do Optimization Hub.

### Entra nas FAQs

- Respostas para dúvidas reais do lead.
- Orientações de acesso, compra, produto, suporte ou política.
- Instruções para a IA responder com base no conhecimento da campanha.

### Não entra nas FAQs

- Configurações de Intervenção Humana.
- Configurações de CSAT.
- Regras internas de fila.
- Mensagens automáticas de avaliação.
- Explicações operacionais para o CS.

---

## 3. Configuração de equipes

Antes de ligar Intervenção Humana, a equipe precisa estar bem configurada. A IA pode usar a descrição da equipe para decidir o roteamento do ticket, então essa descrição não é só administrativa.

### Campos e decisões importantes

- Nome da equipe: nome interno claro, como Suporte Geral, Financeiro, Comercial ou Suporte Técnico.
- Identificador: nome técnico usado pela plataforma.
- Descrição: deve explicar quando aquela equipe deve receber tickets. Esta descrição ajuda a IA a decidir o destino quando há múltiplas equipes.
- Horário de atendimento: janela real em que a equipe responde.
- Valor mensal por operador: usado nas métricas de custo e economia do Optimization Hub.
- Limite máximo de tickets por operador: controla atribuição automática.
- Timeout de autosuspensão: define quando operador inativo é suspenso.

### Boa descrição de equipe

```text
Equipe responsável por dúvidas de acesso, login, área de membros, problemas técnicos, materiais não encontrados e erros de pagamento já concluído. Não recebe dúvidas comerciais antes da compra.
```

### Descrição fraca

```text
Equipe de suporte.
```

### Operador invisível

Operadores invisíveis não recebem atribuição automática, não entram na lógica de autosuspensão e não acumulam penalidade operacional por ficarem fora da fila.

Use operador invisível quando uma pessoa precisa poder assumir tickets manualmente, mas não deve receber tickets automaticamente.

### Limite de tickets e permissão manual

O limite de tickets por operador vale para atribuição automática. Um operador com permissão para assumir manualmente pode pegar tickets mesmo fora desse limite.

Se o cliente quer impedir que alguém assuma tickets manualmente, a correção não é mexer no limite. É ajustar a permissão do operador.

---

## 4. Intervenção Humana

Permite que atendentes humanos participem do atendimento quando necessário. O sistema gerencia fila de tickets, atribuição, tempos de resposta e encerramentos.

![Intervenção Humana - visão geral](imagens/intervencao_humana_csat/01_intervencao_humana_visao_geral.png)

São mecanismos principais:

- Transferência Manual.
- Transferência Automática 2.0.
- IA intermediária na fila.
- Sequência de Inatividade.
- Timers de Atendimento.
- Redistribuição de Tickets.

### Regra de ouro

Só ligue Intervenção Humana se existir equipe responsável por atender.

Se o cliente não tiver operador, horário ou rotina de atendimento, ligar handoff pode piorar a experiência: a IA transfere, pausa e o lead fica esperando.

---

## 4.1 Transferência Manual

Operadores conseguem assumir tickets quando julgarem necessário. Ideal para casos que exigem empatia, negociação, validação interna ou conhecimento especializado.

![Transferência Manual](imagens/intervencao_humana_csat/02_transferencia_manual.png)

### Fluxo

1. Lead conversa com a IA normalmente.
2. Conversa entra em ticket ou fica disponível conforme permissões/visão do operador.
3. Operador identifica necessidade de intervir.
4. IA é pausada.
5. Operador assume.
6. Operador encerra e a IA pode retomar se houver nova mensagem e a campanha permitir.

### Quando ligar

- Suporte com equipe real.
- Onboarding pós-venda com risco de erro de acesso.
- Vendas assistidas com negociação humana.
- Casos de reclamação, financeiro, dados cadastrais ou exceções operacionais.

### Quando evitar

- Campanhas simples de show up ou lembrete.
- Operações sem operador disponível.
- Clientes que querem apenas "ver conversas", mas não têm processo de atendimento.

---

## 4.2 Transferência Automática 2.0

A IA analisa a conversa e transfere para fila humana quando um gatilho crítico é acionado.

![Transferência Automática](imagens/intervencao_humana_csat/03_transferencia_automatica.png)

### Fluxo

1. IA prepara ou avalia a próxima resposta.
2. Response Auditor ou gatilho de handoff identifica risco.
3. Conversa é enviada para uma ou mais equipes configuradas.
4. Operador assume o atendimento com contexto preservado.
5. IA permanece pausada enquanto o ticket humano estiver ativo.

### Gatilhos comuns

- Lead pediu humano.
- IA não sabe responder ou está com baixa confiança.
- Lead usa linguagem hostil/agressiva.
- Falha crítica de ferramenta.
- Caso financeiro/cadastral que exige validação humana.
- Pedido que foge do escopo da campanha.

### Múltiplas equipes de destino

A plataforma permite selecionar mais de uma equipe de destino. Nesse caso, as descrições e orientações por equipe ficam ainda mais importantes.

Exemplo:

- Suporte Técnico: acesso, login, área de membros, erro de vídeo, material não encontrado.
- Financeiro: reembolso, segunda via, cobrança, pagamento, nota fiscal.
- Comercial: upgrade, plano, negociação, renovação.

Se as descrições forem vagas, a IA pode rotear ticket para a equipe errada.

### Orientação de mensagem de transferência

A mensagem de transferência deve ser natural e honesta, mas sem expor falha interna.

Bom:

```text
Vou encaminhar seu caso para o time responsável conferir isso com mais segurança. Eles vão seguir por aqui com o histórico da conversa.
```

Evitar:

```text
A IA não conseguiu resolver, então vou transferir.
```

```text
Não sei responder isso.
```

### Cuidado em campanhas comerciais

Objeção comum não é motivo automático para handoff.

Preço, parcelamento, garantia, prazo e dúvidas de compra devem ser tratados pela IA quando estiverem cobertos por checkpoint e FAQs. Handoff comercial deve ficar para exceções reais: pedido de humano, reclamação forte, falha técnica ou negociação que o time humano de fato fará.

---

## 4.3 IA intermediária na fila

Quando o ticket já foi transferido e o lead está aguardando atendimento humano, a plataforma pode usar uma IA intermediária para manter o lead informado.

Essa IA pode comunicar contexto como:

- posição na fila;
- horário de atendimento da equipe;
- que a solicitação já foi encaminhada;
- que o lead não precisa repetir tudo.

### Quando usar

- Equipes com fila.
- Equipes com horário de atendimento definido.
- Operações em que a espera humana pode demorar.

### Por que importa

Sem acompanhamento, o lead sente que foi abandonado depois do handoff. A IA intermediária reduz ansiedade e evita novas mensagens repetidas que aumentam custo e volume.

### Cuidados

- Não prometer prazo exato se o SLA não estiver configurado.
- Não dizer que o atendimento é imediato se não for.
- Não tentar resolver novamente o caso se ele já foi enviado para humano por um gatilho crítico.

---

## 4.4 Sequência de Inatividade do Lead

Aplica-se durante atendimento humano. Se o lead para de responder, o sistema envia mensagens automáticas para retomar contato e pode encerrar o ticket ao final.

![Inatividade do Lead](imagens/intervencao_humana_csat/04_inatividade_lead.png)

### Fluxo

1. Lead para de responder durante atendimento humano.
2. Após o tempo configurado, o sistema envia a primeira mensagem automática.
3. Sequência continua se ele não responder, em intervalos configurados.
4. Ticket é encerrado automaticamente ao final.

Se o lead responder em qualquer momento, a sequência é interrompida e o operador retoma.

### Bloco de encerramento em suporte

Campanhas de suporte possuem configuração específica de sequência de inatividade e bloco de encerramento. Esse bloco orienta como a IA ou o sistema encerra o atendimento quando não há continuidade.

Use mensagens curtas, úteis e sem cobrança.

Bom:

```text
Oi, passando para confirmar se você ainda precisa de ajuda por aqui.

Se sim, é só responder esta mensagem que seguimos o atendimento.
```

Evitar:

```text
Você não respondeu.
```

```text
Estamos aguardando seu retorno.
```

---

## 4.5 Timers de Atendimento

Timers garantem que o operador não deixe o lead esperando indefinidamente. O timer começa a contar a partir da última mensagem do lead.

![Timers de Atendimento](imagens/intervencao_humana_csat/05_timers_atendimento.png)

### Fluxo

1. Operador recebe ou assume o ticket.
2. Lead envia mensagem.
3. Timer começa a contar.
4. Se o operador não responder no prazo, o sistema pode escalar prioridade.
5. Dependendo da configuração, o operador pode ser suspenso/desatribuído.

Tempo configurável: de 5 minutos a 30 dias.

### Autosuspensão não é redistribuição automática

Se um operador ficar off ou ultrapassar o timeout, ele pode ser autosuspenso. Isso não significa que o ticket será transferido automaticamente para outro operador em todos os casos.

A redistribuição depende de configuração da campanha e disponibilidade de outros operadores.

### Quando ligar

- Cliente tem equipe com escala.
- Existe SLA real de resposta.
- Há volume suficiente para justificar controle operacional.

### Quando evitar

- Operação com poucos operadores.
- Cliente responde de forma irregular.
- Não existe compromisso de SLA.

### Recomendação prática

Não configure timer agressivo se a equipe não trabalha em tempo real. Um SLA honesto de 30 ou 60 minutos é melhor do que 5 minutos quebrados o dia inteiro.

---

## 4.6 Redistribuição de Tickets

Redistribuição depende dos Timers de Atendimento. Quando um operador está suspenso/inativo e o lead volta a falar, o ticket pode ser redistribuído para outro operador disponível.

![Redistribuição de Tickets](imagens/intervencao_humana_csat/06_redistribuicao_tickets.png)

### Fluxo

1. Operador fica suspenso por inatividade.
2. Lead envia nova mensagem.
3. Ticket é redistribuído para outro operador disponível.
4. Novo operador assume com contexto preservado.
5. Lead não precisa explicar tudo de novo.

Se nenhum operador estiver ativo, o ticket permanece como está até alguém ficar disponível.

### Quando ligar

- Equipe tem mais de um operador.
- Timers estão ligados.
- Qualquer operador consegue continuar o atendimento com base no histórico.

### Quando evitar

- Operação com um único operador.
- Atendimento altamente personalizado.
- Cliente sem equipe ativa.

---

## 5. Response Auditor e gatilhos

O Response Auditor audita respostas e situações da conversa para decidir ações de controle. Ele reduz a responsabilidade do copywriter/agente principal de decidir sozinho quando tentar de novo, finalizar, transferir ou aplicar blacklist.

Ele pode existir independentemente do handoff estar ligado.

### Ações possíveis

| Ação | O que faz | Uso típico |
|---|---|---|
| retry | Tenta gerar uma resposta melhor | Baixa qualidade, falta de CTA, resposta incompleta |
| handoff | Transfere para atendimento humano | Pedido de humano, risco alto, baixa confiança configurada para transferência |
| finalize | Encerra a sessão | Problema resolvido ou encerramento em suporte |
| blacklist | Marca o lead/status para não seguir atendimento normal | Hostilidade agressiva, excesso de mensagens, custo elevado |

### Gatilhos padrão e personalizados

A plataforma possui gatilhos padrão e permite criar gatilhos personalizados, com nome e descrição.

Para cada gatilho personalizado, descreva:

- qual comportamento deve ser detectado;
- exemplos de mensagens do lead;
- ação esperada;
- quando não acionar.

Exemplo:

```text
Nome: Pedido de suporte financeiro
Descrição: Acionar quando o lead pedir reembolso, segunda via, confirmar cobrança ou contestar pagamento já feito. Não acionar para dúvidas simples sobre preço antes da compra.
Ação: handoff para equipe Financeiro.
```

### Blacklist

Blacklist agora deve ser tratada como status aplicado pelo Response Auditor, não como decisão artesanal do copywriter.

Usos comuns:

- usuário hostil/agressivo;
- quantidade excessiva de mensagens em uma sessão;
- custo de atendimento elevado, conforme limite configurado.

Tenha mensagem de blacklist curta, neutra e sem confronto.

### Finalize em suporte

Em campanhas de suporte, o Response Auditor pode detectar problema resolvido, finalizar a conversa e acionar CSAT.

Esse fluxo é útil quando o lead confirma que conseguiu resolver, agradece ou encerra claramente o assunto.

---

## 6. CSAT (Avaliação de Satisfação)

CSAT coleta satisfação ao final de atendimentos de suporte. Em campanhas de suporte, ele fica sempre ativo e não pode ser desativado.

O lead normalmente recebe duas perguntas:

1. "Conseguimos resolver?"
2. "De 1 a 5, como avalia o atendimento?"

As respostas vão para os relatórios e para o Optimization Hub.

![CSAT - visão geral](imagens/intervencao_humana_csat/07_csat_visao_geral.png)

São três cenários principais que disparam CSAT:

- IA/Response Auditor detecta resolução.
- Atendente encerra o ticket.
- Ticket é encerrado por inatividade.

---

## 6.1 Template com Flow Interativo

O sistema cria um Flow do WhatsApp com duas telas: resolução Sim/Não e nota 1-5. O lead responde nos botões, sem precisar digitar.

![Template com Flow interativo](imagens/intervencao_humana_csat/08_csat_template_flow.png)

### Janela de 24h aberta

A pergunta pode ser enviada direto no chat.

### Janela de 24h fechada

É necessário um template aprovado pela Meta com botão que abre o Flow.

Sem template aprovado, o CSAT não é coletado fora da janela de 24h.

### Checklist do template

- Texto neutro.
- Sem indução de nota.
- Botão claro para abrir avaliação.
- Status aprovado na Meta antes de subir campanha.

---

## 6.2 Cenário 1: IA detecta resolução

A IA ou o Response Auditor identifica sinais de resolução.

![CSAT - IA detecta resolução](imagens/intervencao_humana_csat/09_csat_ia_detecta_resolucao.png)

### Exemplos de sinais

- "Resolveu sim."
- "Era isso mesmo, obrigado."
- "Consegui acessar."
- "Agora funcionou."
- "Deu certo."

### Fluxo

1. Lead sinaliza resolução.
2. Sistema finaliza a conversa de suporte.
3. CSAT é enviado.
4. Lead responde no Flow ou por texto.
5. Avaliação é salva nos relatórios.

### Boa prática no checkpoint

O checkpoint pode orientar a IA a não prolongar atendimento resolvido.

```markdown
- [ ] Quando o lead confirmar que conseguiu resolver, encerrar de forma breve e não abrir novo assunto.
```

Não escreva no checkpoint que a IA deve enviar CSAT. O envio é configuração da plataforma.

---

## 6.3 Cenário 2: Atendente encerra o ticket

Quando Intervenção Humana está habilitada e o atendente clica em "Encerrar Atendimento", o sistema aguarda o delay configurado antes de enviar CSAT.

![CSAT - Atendente finaliza](imagens/intervencao_humana_csat/10_csat_atendente_finaliza.png)

### Fluxo

1. Atendente clica em "Encerrar Atendimento".
2. Sistema aguarda o delay configurado.
3. Pesquisa de satisfação é enviada.
4. Lead responde via Flow ou texto livre.

### Delay

O delay evita que a pesquisa chegue abruptamente após o encerramento.

Faixa disponível: 10 segundos a 5 minutos.

Use delay curto em atendimento simples. Use delay maior quando a última mensagem humana é longa ou exige leitura.

### Atribuição da nota

Quando um operador assume a conversa, a avaliação pode ser atribuída ao operador no mapa de performance, mesmo que a IA tenha atendido antes.

Isso é importante para interpretar CSAT por operador: a nota pode refletir a experiência completa, não apenas a última mensagem humana.

---

## 6.4 Cenário 3: Encerramento por inatividade

Durante atendimento humano, se o lead fica inativo e o ticket é encerrado automaticamente pela sequência de inatividade, o CSAT pode ser disparado depois do fechamento.

![CSAT - Encerramento por inatividade](imagens/intervencao_humana_csat/11_csat_encerramento_inatividade.png)

### Fluxo

1. Lead para de responder durante atendimento humano.
2. Sequência de inatividade roda.
3. Ticket é encerrado automaticamente.
4. Pesquisa de satisfação é enviada.
5. Resposta é coletada via Flow ou texto livre.

Esse cenário só se aplica quando houve atendimento humano ou ticket ativo.

---

## 6.5 Mudança de assunto durante o CSAT

Após enviar a pesquisa, o lead pode responder com um novo problema em vez de avaliar.

![CSAT - Mudança de assunto](imagens/intervencao_humana_csat/12_csat_mudanca_assunto.png)

### Fluxo

1. Pesquisa é enviada.
2. Lead responde com outro assunto.
3. Classificador interno entende que não é avaliação.
4. CSAT é encerrado.
5. Fluxo conversacional normal é retomado.

O lead nunca precisa responder à pesquisa antes de ser atendido.

---

## 6.6 Campos de configuração do CSAT

- Mensagem introdutória do template: texto que aparece fora da janela de 24h com botão para abrir o Flow.
- Template de CSAT: template aprovado pela Meta.
- Pergunta de resolução.
- Pergunta de nota.
- Mensagem se não resolveu.
- Mensagem de agradecimento.
- Delay após encerramento humano.

### Boas práticas de texto

Bom:

```text
Conseguimos resolver sua solicitação?
```

```text
De 1 a 5, como você avalia o atendimento?
```

Evitar:

```text
Seu atendimento foi excelente, certo?
```

```text
Dá uma nota 5 para ajudar nosso time?
```

---

## 7. Visão do cliente na Central de Atendimento

O cliente operador não vê todas as conversas em andamento da campanha.

Na Central de Atendimento, ele tem acesso principalmente a:

- Fila.
- Meus Atendimentos.

A aba "Conversas" completa, que mostra todas as conversas em andamento inclusive as que a IA atende sozinha, não está disponível na visão comum do cliente operador.

---

## 7.1 Aba Fila

Mostra conversas que estão na fila aguardando alguém da equipe assumir.

![Central de Atendimento - Fila](imagens/intervencao_humana_csat/13_central_atendimento_fila.png)

Pode incluir:

- Aguardando Atendimento: tickets sem operador atribuído.
- Em Atendimento: tickets já assumidos por alguém da equipe.

O operador pode pesquisar por nome ou telefone.

### Consequência operacional

O operador atua no que já virou ticket. Ele não visualiza livremente todas as conversas que a IA está atendendo sozinha.

---

## 7.2 Aba Meus Atendimentos

Mostra apenas conversas atribuídas ao operador logado.

![Central de Atendimento - Meus Atendimentos](imagens/intervencao_humana_csat/14_central_atendimento_meus.png)

Normalmente ficam divididas em:

- Aguardando: lead respondeu e espera retorno do operador.
- Respondidos: operador já respondeu e aguarda retorno do lead.

### Alinhamento com cliente

Se o cliente disser "quero que minha equipe entre em qualquer conversa quando quiser", alinhe expectativa.

Na visão do cliente operador, ele não tem uma aba geral de todas as conversas da IA. Para atuar, a conversa precisa entrar na fila por handoff, por regra operacional disponível ou por permissão específica.

---

## 7.3 Permissões e ações em massa

Ações em massa, como assumir ou finalizar vários tickets, dependem de permissão de gerente.

Níveis de acesso podem limitar:

- visualizar tickets;
- criar anexos;
- transferir tickets;
- gerenciar atendimentos;
- executar ações em massa.

Antes de treinar o cliente, confirme qual perfil cada operador recebeu. Muitas dúvidas operacionais vêm de permissão, não de erro da campanha.

---

## 8. Optimization Hub

Optimization Hub é a área de diagnóstico e melhoria contínua para campanhas de suporte.

Ele processa atendimentos finalizados e apresenta insights para melhorar:

- checkpoint;
- tools;
- base de conhecimento;
- configuração de handoff;
- operação humana.

As sugestões do Hub não aplicam mudanças automaticamente na campanha. O CS precisa avaliar, transformar em artefatos e aplicar manualmente quando fizer sentido.

---

## 8.1 Métricas principais

Use o Hub para responder perguntas como:

- Qual a taxa de transbordo para humano?
- Quais tópicos mais geram handoff?
- A IA resolve mais que a equipe ou o contrário?
- Quais tools são chamadas e qual a taxa de sucesso?
- Qual a cobertura média da base de conhecimento?
- Qual o custo médio por atendimento humano?
- Qual a economia estimada gerada pela IA?
- Quais operadores resolvem mais tickets e com melhor avaliação?
- Quais temas derrubam CSAT ou sentimento?

### Métricas úteis

- Sessões abertas.
- Tickets em fila.
- Tickets atribuídos.
- Tempo médio de resposta.
- Taxa de transbordo.
- Taxa de resolução por IA.
- Taxa de resolução por equipe.
- CSAT.
- Sentimento, em escala de -1 a 1.
- Sucesso de ferramentas.
- Cobertura da base de conhecimento.
- Custo por atendimento.

---

## 8.2 Diagnóstico de conversas

Ao analisar uma conversa, o Hub pode mostrar:

- resumo do que a IA entendeu;
- motivo de intervenção;
- triggers de handoff acionados;
- execução de tools;
- sucesso ou falha das tools;
- cobertura da base de conhecimento;
- tópicos relacionados;
- impacto em CSAT e transbordo.

### Como interpretar

Se o motivo de handoff foi baixa confiança:

- Verificar se a FAQ existe e está clara.
- Verificar se a pergunta da FAQ cobre a intenção do lead.
- Verificar se o checkpoint instrui a IA a agir antes de transferir.

Se o motivo foi falha de tool:

- Verificar se a tool retorna erro HTTP ou resposta tratável.
- Preferir tools que retornem HTTP 200 com JSON estruturado de sucesso/falha.
- Atualizar checkpoint para explicar o que fazer com cada retorno.

Se o motivo foi solicitação de humano:

- Verificar se é um pedido legítimo ou se a IA gerou insegurança antes.
- Se for legítimo, manter handoff.
- Se o lead pediu humano porque a IA enrolou, corrigir checkpoint/FAQ.

Se o motivo foi hostilidade:

- Verificar se a IA provocou atrito por insistência, promessa falsa ou resposta fora de escopo.
- Ajustar tom, limite de insistência ou gatilho de blacklist/handoff.

---

## 8.3 Recomendações do Hub

O Hub pode sugerir ações como:

- criar novo documento na base de conhecimento;
- editar checkpoint;
- ajustar tool;
- revisar gatilho de handoff;
- melhorar descrição de equipe;
- alterar configuração de fila ou SLA.

### Regra de aplicação

Não aplique sugestão do Hub cegamente.

Antes de alterar a campanha:

1. Abra conversas reais que sustentam o insight.
2. Verifique se é padrão ou caso isolado.
3. Decida se a correção é FAQ, checkpoint, tool ou configuração.
4. Aplique no artefato correto.
5. Reavalie o impacto depois de novos atendimentos.

---

## 8.4 Exportações

O Hub pode oferecer relatório em PDF e exportação para Excel.

Use PDF para resumo executivo e alinhamento com cliente.

Use Excel quando precisar analisar:

- evolução diária;
- tempos de resposta;
- operadores;
- volume por tópico;
- motivos de intervenção;
- comparativos antes/depois.

---

## 9. Como aplicar em novas campanhas

Antes de configurar Intervenção Humana e CSAT, responda:

1. Existe equipe humana responsável por atender?
2. Qual equipe recebe cada tipo de ticket?
3. A descrição das equipes está clara o suficiente para roteamento?
4. Em quais horários cada equipe atende?
5. Existe SLA real de resposta?
6. Quantos tickets cada operador consegue atender?
7. Em quais situações a IA deve transferir?
8. Quais gatilhos devem ser retry, handoff, finalize ou blacklist?
9. O template de CSAT está aprovado?
10. Como o sucesso será acompanhado no Optimization Hub?

Se essas respostas estiverem indefinidas, alinhe com o cliente antes de subir a campanha.

---

## 9.1 Recomendação por tipo de campanha

### Suporte

Configuração recomendada:

- Transferência Manual: ON.
- Transferência Automática 2.0: ON.
- Gatilhos mínimos: pedido de humano, baixa confiança/IA não sabe, linguagem hostil.
- Equipes bem descritas e com horário definido.
- IA intermediária na fila: ON se houver espera.
- Sequência de Inatividade: ON.
- Timers: ON se houver SLA.
- Redistribuição: ON se houver Timers e mais de um operador.
- CSAT: ativo; validar template.
- Optimization Hub: revisar periodicamente.

No checkpoint:

- Instruir a IA a resolver dúvidas comuns.
- Instruir quando coletar dados mínimos antes de transferir.
- Não detalhar configuração técnica da Central.

### Onboarding pós-venda

Configuração recomendada:

- Manual: ON.
- Automática: ON para erro de acesso, compra não localizada, pedido de humano e linguagem hostil.
- IA intermediária: ON se houver fila.
- Inatividade: ON se houver atendimento humano.
- Timers: conforme SLA.

No checkpoint:

- A IA deve orientar acesso básico primeiro.
- Se o problema depender de conferência interna, coletar dados e encaminhar.
- Evitar jogar tudo para humano antes de tentar resolver o básico.

### SDR e agendamento

Configuração recomendada:

- Manual: opcional.
- Automática: ON apenas para casos sensíveis, pedido de humano, erro de tool ou lead muito qualificado pedindo contato direto.
- Timers: só se houver SDRs atuando na Central.
- Response Auditor: usar retry para respostas ruins antes de handoff.

No checkpoint:

- A IA deve qualificar e agendar com autonomia.
- Handoff humano deve ser exceção.

### Comercial, venda direta e recuperação

Configuração recomendada:

- Manual: opcional, se houver time comercial acompanhando.
- Automática: usar com parcimônia.
- Inatividade/Timers: só se houver operação humana real.
- Response Auditor: priorizar retry em baixa qualidade e handoff apenas em exceções.

No checkpoint:

- A IA deve tratar objeções comerciais comuns.
- Não transferir por qualquer objeção de preço.
- Transferir apenas pedido claro de humano, falha técnica, reclamação forte ou exceção que o time consiga resolver melhor.

### Lançamento e show up simples

Configuração recomendada:

- Normalmente manter Intervenção Humana OFF.
- Ativar somente se houver suporte operacional para acesso, grupo, live ou problema técnico.

No checkpoint:

- Manter foco no link principal.
- Dúvidas profundas ou fora do escopo podem ser encaminhadas para suporte, se existir.

---

## 9.2 Checklist de configuração

Use este checklist antes de liberar uma campanha com atendimento humano:

- [ ] Equipes criadas com nome, identificador e descrição útil.
- [ ] Horários de atendimento configurados.
- [ ] Valor mensal por operador preenchido se o cliente quiser métricas de economia.
- [ ] Limite de tickets por operador definido, se houver atribuição automática.
- [ ] Timeout de autosuspensão coerente com a operação.
- [ ] Operadores invisíveis configurados apenas quando fizer sentido.
- [ ] Permissões revisadas para assumir, transferir, gerenciar e fazer ações em massa.
- [ ] Transferência Manual ligada apenas se houver processo humano.
- [ ] Transferência Automática ligada com gatilhos compatíveis com a campanha.
- [ ] Múltiplas equipes de destino descritas com clareza.
- [ ] IA intermediária na fila configurada, se houver espera.
- [ ] Sequência de Inatividade configurada com mensagens sem tom de cobrança.
- [ ] Timers configurados apenas se houver SLA real.
- [ ] Redistribuição ligada somente junto com Timers e equipe com mais de um operador.
- [ ] Response Auditor revisado com ações corretas por gatilho.
- [ ] Blacklist configurada com critérios claros.
- [ ] Template de CSAT aprovado pela Meta.
- [ ] Mensagens de CSAT neutras e sem indução de nota.
- [ ] Checkpoint menciona handoff apenas como comportamento.
- [ ] FAQs não contêm instruções de fila, timer, CSAT ou Response Auditor.
- [ ] Plano de análise no Optimization Hub definido.

---

## 10. Erros comuns

### Ativar handoff sem equipe

Problema: a IA transfere, a conversa pausa e ninguém responde.

Correção: só ligar Intervenção Humana quando houver operador responsável.

### Criar equipe com descrição vaga

Problema: a IA não sabe para qual equipe rotear.

Correção: escrever descrição com escopo claro, exemplos e limites.

### Usar timer incompatível com a operação

Problema: operador é suspenso o tempo todo e a fila fica instável.

Correção: configurar SLA que a equipe realmente consegue cumprir.

### Confundir autosuspensão com redistribuição

Problema: CS espera que todo ticket mude de operador automaticamente, mas a campanha não está configurada para isso.

Correção: validar Timers, redistribuição e disponibilidade de operadores.

### Transferir objeções comerciais demais

Problema: a IA deixa de vender e tudo vira ticket humano.

Correção: objeções comuns devem ser tratadas pela IA; humano entra em exceções.

### Colocar configuração técnica no checkpoint

Problema: desperdiça tokens e confunde o Checkpoint Manager.

Correção: checkpoint contém comportamento do bot; configuração técnica fica no painel.

### Criar FAQ sobre CSAT ou fila

Problema: a base de conhecimento fica contaminada com instrução interna.

Correção: FAQs respondem dúvidas do lead. CSAT/fila ficam em configuração.

### Esquecer template de CSAT

Problema: fora da janela de 24h, a pesquisa não é enviada corretamente.

Correção: validar template aprovado antes de subir suporte.

### Usar mensagem de CSAT enviesada

Problema: induz nota e piora qualidade do dado.

Correção: perguntas neutras e curtas.

### Aplicar insight do Hub sem olhar conversa real

Problema: corrige um caso isolado como se fosse padrão.

Correção: validar o insight com amostra de conversas antes de alterar checkpoint, FAQ ou tool.

---

## 11. Padrão pronto para campanha de suporte

Use como ponto de partida quando o cliente não trouxer regra específica.

### Admin / Equipes

- Criar equipe Suporte Geral.
- Preencher descrição com escopo de atendimento.
- Configurar horário real de atendimento.
- Preencher valor mensal por operador se for usar métricas de economia.
- Definir limite de tickets por operador apenas se houver atribuição automática.
- Revisar permissões de operadores e gerentes.

### Painel da campanha

- Transferência Manual: ON.
- Transferência Automática 2.0: ON.
- Gatilhos ativos: pedido de humano, baixa confiança/IA não sabe, linguagem hostil.
- Equipe de Destino: Suporte Geral ou equipe específica.
- IA intermediária na fila: ON se houver espera.
- Sequência de Inatividade: ON.
- Timers de Atendimento: ON se houver SLA; OFF se não houver.
- Redistribuição: ON apenas se Timers estiverem ON e houver mais de um operador.
- Response Auditor: revisar retry, handoff, finalize e blacklist.
- CSAT: validar template aprovado e mensagens neutras.

### Checkpoint

Adicionar apenas regras comportamentais:

```markdown
- [ ] Resolver dúvidas simples com base nas FAQs antes de encaminhar.
- [ ] Quando o problema depender de conferência interna, coletar os dados necessários e encaminhar para atendimento humano.
- [ ] Antes de encaminhar, explicar de forma natural que o time vai ajudar com aquele caso específico.
- [ ] Não prometer prazo exato de retorno humano se esse SLA não estiver definido na campanha.
```

### FAQs

Não criar FAQ sobre Intervenção Humana, CSAT, Response Auditor ou Optimization Hub.

Criar FAQ apenas se o lead tiver dúvidas reais, como:

- "Como falo com o suporte?"
- "Quanto tempo demora para responderem?"
- "O que faço se meu acesso não chegou?"

Mesmo nesses casos, a resposta deve orientar o lead, não explicar configuração interna da plataforma.

### Optimization Hub

Depois de rodar a campanha:

- revisar taxa de transbordo;
- abrir conversas com handoff;
- checar motivos de intervenção;
- verificar sucesso de tools;
- medir cobertura da base;
- transformar achados recorrentes em FAQ, checkpoint, tool ou configuração.

---

## 12. Resumo operacional

Intervenção Humana serve para handoff e gestão de tickets.

CSAT serve para medir resolução e satisfação.

Response Auditor controla gatilhos e ações de segurança.

Optimization Hub mostra onde a campanha está perdendo resolução, dinheiro ou qualidade.

O checkpoint só recebe regras de comportamento relacionadas ao momento de resolver, encaminhar ou encerrar.

As FAQs só recebem conhecimento útil para responder o lead.

Se houver equipe, SLA, roteamento claro e template aprovado, esses recursos melhoram suporte e retenção. Se não houver operação humana por trás, ligar handoff pode criar uma experiência pior do que deixar a IA resolver dentro do escopo.
