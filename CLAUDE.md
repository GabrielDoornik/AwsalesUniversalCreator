# CLAUDE.md — AWSales Universal Campaign Creator

Contexto persistente deste projeto. Sistema universal para criação de campanhas de bots de WhatsApp AI na plataforma AWSales.

> **Instrução para o Claude:** quando o usuário pedir para lembrar algo, registrar feedback, ou salvar contexto persistente neste projeto, **atualize este arquivo diretamente** em vez de criar memórias em `~/.claude/projects/.../memory/`. Este arquivo é versionado no Git e sincroniza entre máquinas; a pasta `memory/` não.

## Projeto

Este projeto é um sistema universal para criação de campanhas na plataforma AWSales — bots de WhatsApp com IA para vendas, recuperação, lançamentos, CS e SDR.

**Artefatos por campanha:**
1. Texto Complementar (Produto + Playbook) — preenche lacunas dos inputs do cliente, direciona auto-geração de FAQs
2. Checkpoint — o mais crítico; controla comportamento/fluxo do bot via sub-agente Checkpoint Manager
3. Mensagens de Disparo — mensagem de abertura + FUPs para WhatsApp

**Fluxo obrigatório de 3 fases:**
- Fase 1: Ler inputs → gerar textos complementares → PARAR e aguardar FAQs
- Fase 2: Avaliar FAQs → criar Checkpoint → criar Mensagens
- Fase 3: Otimizações (ler tudo primeiro, aplicar diretamente, validar formatação, checar FAQs)

**Arquitetura da plataforma:** cadeia multiagente. Checkpoint Manager mantém memória/estado; Information Manager consulta FAQs/catálogo; Integration Manager só planeja tools quando encontra `@toolName`; Integration Runner executa; Copywriter escreve a resposta final; Response Auditor valida segurança/coerência; Smart Follow-Up usa transcrição + checkpoint para retomar conversas. Checkpoint NÃO deve repetir conteúdo das FAQs.

**Regras críticas:** Zero asteriscos/emojis no checkpoint, FAQs em linguagem coloquial do lead (busca semântica), links como variáveis no checkpoint (`{{link_vendas}}`), preço parcelado antes do preço à vista, Tools referenciadas como `@tool_name`.

## Orquestração real dos agentes AWSales

O checkpoint é o artefato mais decisivo porque funciona como roteador da cadeia inteira, não apenas como script de etapas.

**Checkpoint Manager:** atualiza a memória factual da conversa. Ele não deve ser fonte de preço, prazo, bônus, garantia ou política comercial. Esses fatos pertencem às FAQs Produto/catálogo ou ao insumo oficial.

**Information Manager:** consulta a base de conhecimento e entrega informação para o Copywriter. Se a FAQ Produto estiver fraca, o agente fica sem fatos; se a FAQ Playbook estiver fraca, o agente contorna objeções de forma genérica.

**Integration Manager:** só planeja ferramentas quando o checkpoint contém menção explícita no formato correto de tool. Se não houver `@toolName`, ele tende a retornar `should_run_tools:false` e o Copywriter apenas conversa.

**Copywriter:** escreve a resposta final usando checkpoint + informações encontradas + variáveis. Se o checkpoint estiver passivo, ele responde passivo; se estiver agressivo demais, ele pode soar pressionador.

**Response Auditor:** pega idioma errado, vazamento de sistema, meta-comentário e incoerência. Ele não deve ser tratado como proteção suficiente contra abordagem comercial ruim. A técnica de venda precisa estar correta no checkpoint e no Playbook.

**Smart Follow-Up:** depende de status, pendência, temperatura, alavanca de valor e próximo passo. Checkpoints que só dizem "Etapa 3" geram follow-ups genéricos.

## Técnica comercial universal

Este projeto atende clientes de nichos variados, não apenas público cristão. Portanto, a venda pode ser mais assertiva, direta e orientada a conversão, desde que não use mentira, falsa escassez, promessa inventada ou coerção.

Padrão comercial para campanhas de venda: RAR — Recuperação/Venda Adaptativa com Baixa Reatância.

Base de raciocínio:
- Venda adaptativa: ajustar o ritmo ao estado do lead converte melhor do que seguir roteiro fixo.
- Reatância psicológica: linguagem controladora aumenta resistência; linguagem com escolha e próximo passo claro reduz defesa.
- Entrevista Motivacional: boas perguntas fazem o lead verbalizar motivo de ação; confronto cedo demais faz ele defender a objeção.
- Abandono de carrinho: abandono não é desinteresse; pode ser fricção, comparação, risco percebido, pagamento, timing ou simples distração.
- Intenção em ação: quando o lead sinaliza compra, o melhor próximo passo é concreto e imediato.

Aplicação universal:
- Lead quente: enviar link/preço/caminho de compra imediatamente, sem continuar diagnóstico.
- Lead com dúvida factual: responder pela FAQ Produto e reconectar ao próximo passo.
- Lead com objeção: validar rapidamente, responder pela FAQ Playbook e contrastar o custo de continuar parado com o benefício de agir agora.
- Lead ambivalente: fazer uma pergunta única de trava, não entrevista longa.
- Lead frio ou sem contexto: usar SPIN enxuto por no máximo uma pergunta por mensagem.
- Lead recusou claramente: respeitar, tentar entender uma vez se couber, e encerrar sem insistência.

Para clientes universais, é permitido usar contraste comercial mais forte do que em público cristão:
- ROI, perda financeira, tempo desperdiçado, oportunidade perdida, custo de esperar, risco de continuar igual, comparação entre "pagar para resolver" vs "continuar pagando o preço do problema".
- Urgência e escassez podem ser usadas quando forem reais: prazo, lote, bônus limitado, agenda, turma, condição operacional.
- Não usar urgência falsa, ameaça, culpa pessoal, promessa garantida ou números que não estejam no insumo.

## Checkpoint enxuto por design

Checkpoint é roteador comportamental, não base de conhecimento. Ele deve carregar identidade da IA, tom, limites, ordem de decisão, gates anti-handoff, uso de tools, variáveis/links e critérios de encaminhamento. Não deve repetir explicações detalhadas, passos de produto, contornos completos de objeção, scripts longos, definições ou respostas que já estão cobertas pelas FAQs.

**Why:** As FAQs são lidas pelo Information Manager via busca semântica; repetir esse conteúdo no checkpoint aumenta tokens em agentes que carregam `{checkpoints}` e pode criar conflito entre duas fontes. Em suporte, checkpoint grande também não reduz handoff por si só; o que reduz handoff é ter gates claros antes de transferir e FAQs completas para responder a dúvida.

**How to apply:** Ao enxugar checkpoint, remover apenas conteúdo já coberto nas FAQs e manter no checkpoint as travas operacionais: consultar FAQ antes de transferir, coletar dado mínimo, não prometer ação humana, tentar retenção quando fizer sentido, não enviar formulário/link errado, e listar casos que realmente exigem humano. Antes de cortar uma seção, validar que o tema existe nas FAQs. Se não existir, criar/ajustar FAQ em vez de manter resposta longa no checkpoint.

Caso real de referência: `Falcão das milhas/Suporte/Checkpoint/checkpoint.md` (2026-05-15). Checkpoint reduzido de ~24.887 chars / 3.643 palavras para ~10.382 chars / 1.502 palavras (~58% menor), mantendo gates anti-handoff. Temas removidos foram validados contra FAQs de Produto/Playbook: erro 404, acesso, erro técnico, Buscador, busca manual, Tarifas Awards, Skyscanner, cards, monitoramento, programa de milhas, tarifa que some, cotação específica, renovação automática, cancelamento/reembolso, Consultoria Individual, Balcão de Milhas, The Travel e Black Falcon.

## Abertura de janela sem emoji

Mensagem de abertura (template HSM / primeira mensagem da campanha) nunca deve ter emoji. FUPs e demais mensagens da conversa podem ter emoji conforme regra geral (até 3 por mensagem, preferência no cumprimento).

**Why:** Convenção operacional do CS. Templates de abertura têm regras mais rígidas (aprovação Meta, taxa de entrega) e o padrão da agência é mantê-los limpos sem emoji.

**How to apply:** Ao gerar a mensagem de abertura de qualquer campanha, zero emojis. Cumprimento natural ("Oi, tudo bem?") sem o 😊 / 👋 / similares. Aplica só à abertura, não aos FUPs nem ao fluxo de conversa do bot.

## Terminologia: IA, não "bot"

Sempre se referir ao agente da AWSales como "IA", "agente de IA" ou "assistente". Nunca "bot". O cliente faz distinção: bot é fluxo automatizado (rule-based), agente de IA é o sistema com Checkpoint Manager + LLM. Confundir os dois soa amador.

**Why:** Vocabulário operacional do CS da agência. "Bot" carrega conotação de chatbot antigo e empobrece a percepção do produto.

**How to apply:** Em checkpoints, mensagens de campanha, conversas com o usuário e qualquer artefato escrito, usar "IA", "agente de IA" ou "assistente". Em raras menções históricas a "bot" (texto legado), pode manter; em texto novo, sempre IA.

## Nome da IA na campanha

A IA pode (e geralmente deve) ter nome quando o cliente tiver batizado o assistente. O que não pode é a IA se passar por uma pessoa real específica (consultor, fundador). Nomes de IA assistente (ex: Nia, Aura, Sofia) são permitidos quando definidos pelo cliente.

**Why:** Nomes de IA criam vínculo e identidade da experiência. O risco a evitar é a IA se passar por humano real, não usar nome próprio em si.

**How to apply:**
- Se a base de conhecimento ou o cliente atribuiu um nome (ex: Nia no FDS), a IA usa esse nome em apresentações e fechamentos.
- Se a campanha não tiver nome atribuído, manter identidade neutra ("assistente da equipe de experiência").
- Nunca usar nome de pessoa real (Paulo Aguiar, Lucas Firmino, etc.) como identidade da IA. Nomes de pessoas reais só aparecem como referência ("o time do Paulo", "as tutorias com o time treinado pelo Paulo"), nunca como o "eu" do agente.

## FAQs sem variáveis ou links

FAQs na plataforma AWSales nunca devem conter links externos nem variáveis de navegação (`{{link_vendas}}`, `{{link_reagendamento}}`, etc.). Essas variáveis vão exclusivamente no Checkpoint. FAQs são conteúdo puro para busca semântica, com exceção de variáveis de arquivo/mídia usadas para disparar prova social.

**Why:** Links/integrações são tratados no nível do checkpoint/plataforma, não na base de conhecimento.

**How to apply:** Ao escrever Texto Complementar para geração de FAQs, focar só em conteúdo (o que são as coisas, como funcionam, objeções, tom). Nunca incluir variáveis de navegação ou URLs em textos complementares voltados para extração de FAQ. Se a intenção for disparar imagem de prova social, seguir a exceção documentada na seção abaixo.

**Exceção: campanhas de SUPORTE podem ter link estável direto na FAQ (URL crua).** A regra de "FAQ sem link" existe por causa de churn de checkout em vendas: se o link vive só como variável no checkpoint, troca-se o checkout num lugar só. Em suporte, links de informação são estáveis (acesso, área de membros, WhatsApp de suporte/parceiro, grupos, contrato) e o link costuma SER a própria resposta da FAQ. Pôr na FAQ entrega mais confiável, porque o link viaja junto com a resposta em vez de depender de o Copywriter amarrar o tópico a uma variável do checkpoint. O Response Auditor aceita, já que o resumo da FAQ é fonte autorizada. Regra do "um lar por link": link estável de informação que é a resposta vai como URL crua na FAQ; link comercial/condicional (pagamento, checkout, typeform de oferta) fica como variável no checkpoint. Preço comercial continua no checkpoint (o Auditor é rígido com número). Definido com o usuário em 2026-06-16 (Suporte Falcão das Milhas). Só vale onde a plataforma NÃO resolve `{{variável}}` dentro do conteúdo da FAQ; se resolver, preferir a variável dentro da FAQ.

## FAQs sem valores, ofertas ou condições de pagamento

FAQs na plataforma AWSales nunca devem conter valores de produto, parcelas, formas de pagamento ou condições de oferta (preço, desconto à vista, número de parcelas, entrada de boleto, etc.). Essas informações ficam EXCLUSIVAMENTE no Checkpoint de cada campanha. A FAQ, quando precisar tocar no tema, deve remeter o agente a consultar o checkpoint da campanha em uso.

**Why:** É padrão na operação AWSales uma mesma Base de Conhecimento (FAQs Produto + Playbook) ser compartilhada por várias campanhas do mesmo produto (ex: Lista de Espera, Disparo, Recuperação, Ascensão), cada uma com oferta diferente (lotes, descontos, condições temporárias, números de parcela próprios). Hard-codar valor numa FAQ compartilhada quebra automaticamente as campanhas que têm oferta diferente — virou regra geral, não exceção. Caso real (JV Academy, 2026-05-20): a FAQ "Qual o preço e as condições de pagamento" da base compartilhada tinha 12x R$ 152,86 e R$ 1.478 à vista; cliente corrigiu a Lista de Espera v2 para 12x R$ 169 e 12x R$ 189 boleto, e os valores antigos da FAQ entraram em conflito com as outras 3 campanhas que usam a mesma base.

**How to apply:**
- Ao avaliar/criar FAQ que toca em preço, parcela, forma de pagamento ou condição de oferta, a resposta deve instruir o agente a consultar o checkpoint da campanha em uso para puxar valores e condições, e descrever apenas a estratégia comportamental (ordem de apresentação, quando mostrar parcelado antes do à vista, quando revelar ou não o valor à vista, regras de internacional/erro).
- Todos os valores numéricos, links de checkout, regras de desconto, bônus específicos da oferta e janelas de venda vão no Checkpoint.
- Vale também para FAQs de objeção de preço (ex: "Como abordar quem acha caro?"): manter o contorno comportamental, mas tirar os valores literais e remeter ao checkpoint.
- Ao otimizar uma campanha que altere valores, sempre alertar o usuário sobre o impacto cross-campanha das FAQs compartilhadas antes de aplicar.

## Prompts de Extração — Recuperação == Venda Direta

Os Prompts de Extração internos da plataforma para os tipos **Recuperação de Vendas** e **Venda Direta** são **idênticos** (verificado em 2026-05-06 lendo `Prompts de extração/Prompt de extração - Recuperação de vendas.txt` e `Prompts de extração/Prompt de extração - Venda Direta.txt`). Tanto o prompt de Produto quanto o de Playbook batem palavra por palavra (única diferença é cosmética).

**Why:** O `Estrutura/PROMPT_SISTEMA_UNIVERSAL.md` lista 5 tipos com prompts "específicos por tipo de campanha", o que dá a entender que cada tipo tem lente diferente. Para Recuperação vs Venda Direta isso não é verdade hoje.

**How to apply:** Quando o cliente tiver uma campanha de Venda Direta + uma de Recuperação para o MESMO produto, criar UMA única Base de Conhecimento na plataforma (tipo Venda Direta OU Recuperação, tanto faz) e apontar as duas campanhas para ela. Não duplicar a base. O comportamento diferenciado entre Venda Ativa e Recuperação fica 100% no checkpoint.

Não verificado ainda para Lançamentos, Customer Success e SDR — esses podem ter prompts genuinamente diferentes; conferir caso a caso quando aparecer.

## Follow-Up Inteligente

A plataforma AWSales tem um recurso chamado "Follow-Up Inteligente" que substitui mensagens de FUP estáticas. É configurado por campanha no painel da plataforma.

O sistema roda 3 prompts automáticos: (1) Análise de necessidade (SEND/SKIP), (2) Timing ideal, (3) Geração de mensagem personalizada.

O CS preenche 3 campos de "Orientações adicionais" que são concatenados ao final de cada prompt base. As orientações são específicas por campanha.

Prompts base documentados em `Estrutura/FOLLOWUP_INTELIGENTE.md`. Orientações por campanha ficam no `MENSAGENS_FOLLOWUP.md` de cada campanha.

**FUPs inteligentes NÃO vão no checkpoint.** São configurados direto no painel da plataforma.

## Campanha Suporte EQJC (estado vivo)

Campanha "CR Treinamentos | Suporte | Os Exercícios Quânticos de Jesus Cristo" está em ciclo de otimização baseado em relatório de 455 atendimentos (80.9% resolvidos pela IA, 18.7% escalados) e análise de 33 casos de escalonamento.

Estado (última atualização 2026-04-17): checkpoint reescrito, FAQs Produto e Playbook otimizadas em documentos de referência (não aplicados na plataforma ainda). 12 blocos de dúvidas enviados ao cliente em PDF — aguardando respostas para fechar gaps restantes.

Refactor da tool de deep link (2026-05-04): tools antigas `@buscar_membro_por_email` + `@gerar_deep_link_curseduca` (conexão Curseduca CR Treinamentos) substituídas por 1 tool única `@gerar_deep_link_de_acesso` (conexão "CR Treinamentos - Deep Link n8n", sem auth) apontando para webhook n8n `https://n8n-dev.awsales.io/webhook/cr-deep-link`. O n8n centraliza buscar membro + gerar deep link e SEMPRE retorna 200 OK com `{ ok, deeplink, mensagem }` — "Member not found" da Curseduca vira `ok:false` em vez de erro HTTP, matando o gatilho de handoff por falha técnica de tool. Checkpoint Seção 7 reestruturada em 7 níveis: Nível 1 tenta com `{{lead_email}}`, Nível 2 pede confirmação ao aluno se ok=false, Nível 3 manda buscar email na confirmação Hotmart antes de escalar (Seção 10 item 13 atualizado para refletir essa hierarquia).

**Why:** Tool antiga propagava 404 da API Curseduca como erro técnico, disparando handoff via gatilho de Transferência Automática 2.0 quando lead tentava logar com email diferente do cadastrado. O novo fluxo nunca expõe erro HTTP ao bot — só JSON com flag `ok` para o Checkpoint Manager tratar como caminho conversacional normal.

**How to apply:** Docs completos em `CR Treinamentos/Suporte/Tool Deep Link n8n - Configuração.md` (config da tool na AWSales) e `CR Treinamentos/Suporte/Fluxo n8n - cr-deep-link.md` (config do n8n nó a nó). Tools antigas não foram desativadas fisicamente — basta o checkpoint não as referenciar para que o Checkpoint Manager nunca as invoque. Pendente: aplicar checkpoint atualizado na plataforma AWSales (até 2026-05-04 ainda só estava no `.md` local) e monitorar 1-2 dias os atendimentos que cairem em "email não encontrado" para validar Níveis 2 e 3 em produção.

**How to apply:** Se o usuário mencionar "EQJC", "Suporte Paulo Aguiar", "otimizar suporte" ou similar, ler `CR Treinamentos/Suporte/MEMÓRIA - Suporte EQJC.md` primeiro — é o estado vivo da campanha (otimizações aplicadas, próximo passo, entregáveis). Para contexto de gap-closing com o cliente, complementar com `CR Treinamentos/Suporte/CONTEXTO_E_PROXIMOS_PASSOS.md`.

Entregáveis vivos (editar conforme cliente responder):
- `CR Treinamentos/Suporte/Checkpoint/checkpoint.md`
- `CR Treinamentos/Suporte/FAQs/Otimização FAQs - Produto.md`
- `CR Treinamentos/Suporte/FAQs/Otimização FAQs - Playbook.md`

Variáveis atuais: `link_suporte`, `link_area_de_membros`, `link_do_grupo`, `link_pagamento_alt`, `link_consultor_completo`, `link_consultor_21`, `link_reembolso_7d`, `link_reembolso_21d`, `link_matricula`, `link_ascensao_grupo`, `link_ascensao_youtube`, `lead_email`.

## Imagens de prova social via FAQ

Quando a campanha tiver imagens de prova social (antes/depois, resultados de clientes, prints, etc.), criar FAQs específicas para capturar intenções como "quero ver resultado", "tem foto?" ou "o resultado fica natural?" e disparar a mídia no momento certo da conversa.

**Why:** As FAQs funcionam por busca semântica. Se não existir uma pergunta/resposta que cubra a intenção do lead, a imagem cadastrada na plataforma nunca será enviada, mesmo que o arquivo já esteja disponível.

**How to apply:** Criar 1-2 FAQs de Produto na linguagem do lead, contextualizar a imagem antes de referenciá-la, usar a variável de arquivo no final da resposta (ex: `{{imagem1}}`) e distribuir as imagens entre intenções diferentes. As imagens ficam nas FAQs, não no checkpoint nem no texto complementar, e os links brutos dos arquivos não devem entrar no insumo limpo.

## Formato de menção `@tool` no checkpoint

Toda referência a tool no checkpoint DEVE usar o formato exato `Utilize a tool para [ação] @nome_da_tool` (do guia `Estrutura/Guia — Criar Tool Personalizada na Awsales.md`). Nunca usar `@tool` em definições, listagens, checklists, parênteses ou referências a eventos passados.

**Why:** O Integration Manager escaneia o checkpoint procurando `@toolName` em cada turno para planejar execuções. O modelo pode variar por agente, mas a lógica do prompt é a mesma: se encontrar menção de tool, ele tenta planejar. Menções fora do formato correto (ex: "Após sucesso da @criar_agendamento", "Use @consultar_horarios", "(@registrar_lead_no_rp)" em checklist) podem fazer ele:
- Planejar execução desnecessária da tool, gastando tokens à toa.
- Em casos críticos, executar a tool indevidamente — risco real, não teórico (ex: duplicar agendamento por causa de uma referência a evento passado).

**How to apply:**
- Em invocações reais (Etapas 4, 5 etc.): "Utilize a tool para [ação descritiva] @nome_da_tool"
- Em definições/regras gerais sobre tools: descrever sem `@` (ex: "Tool de consulta de horários: usar SEMPRE antes de propor horários")
- Em checklists de pré-requisitos: omitir o `@` (ex: "- [ ] Lead já registrado no RP")
- Em referências a eventos passados: descrever a ação sem o handle (ex: "Após sucesso na criação do agendamento")
- Validar com `grep '@\w+' checkpoint.md` ao final, conferindo cada ocorrência.

## Rodapé de variáveis do checkpoint — descrever, nunca colar o valor

Na seção final "VARIÁVEIS DE SISTEMA UTILIZADAS NO CHECKPOINT", cada variável é listada com uma descrição curta do que ela é/faz, NUNCA com o valor real colado (URL, telefone, e-mail). Ex: `{{link_formulario}}`: link do formulário de avaliação médica — e não `{{link_formulario}}`: https://nuestrarx.com/evaluacion.

**Why:** O valor real fica configurado na plataforma (no cadastro da variável). Colar o conteúdo no checkpoint anula o propósito da variável, duplica a fonte da verdade e cria risco de divergência quando o valor muda na plataforma. O checkpoint deve referenciar `{{variavel}}` no corpo e, no rodapé, só explicar o objetivo de cada uma para quem lê.

**How to apply:** No rodapé, escrever `{{variavel}}`: descrição curta do objetivo. Variáveis de `metadata` (ex: `{{metadata.checkout_url}}`) descrevem de onde vêm no evento. Nunca incluir o valor literal. Caso real (Nuestra RX, 2026-06-11): rodapés de Formulário, Vendas e Suporte tinham URLs/telefone/e-mail colados; corrigidos para descrição.

## Otimização de custos AWSales — metodologia

Quando o usuário pedir para reduzir custos de uma campanha, seguir este diagnóstico antes de cortar qualquer coisa do checkpoint.

**Why:** A intuição padrão é "checkpoint grande = Checkpoint Manager caro". Está errado. O Checkpoint Manager roda em Gemini 2.5 Flash Lite (barato). Quem realmente paga o tamanho do checkpoint são os agentes que carregam `{checkpoints}` no prompt em cada turno e usam modelos caros: **Copywriter (Gemini 3 Flash), Integration Manager (Gemini 2.5 Flash normal), Smart FUP Análise/Template/Mensagem**. Esses 4 agentes costumam somar ~80% do gasto.

**How to apply:**
1. **Pedir 3 inputs:** (a) tabela de custos da campanha em xlsx, (b) o agente usado da campanha em txt (mostra qual modelo cada sub-agente usa), (c) checkpoint atual.
2. **Agregar custos por `fee_name`** no xlsx (Python + openpyxl) e mapear modelo → agente usando o txt do agente. Identificar os 2-3 modelos mais caros e quem os consome.
3. **Confirmar com o usuário** o diagnóstico antes de cortar qualquer coisa.
4. **Cortar do checkpoint o que já está nas FAQs:** preço, especificações de produto, endereço, contornos prontos de objeção, contraindicações, scripts longos. Manter no checkpoint só comportamento e fluxo (etapas, gates, ordem de tools).
5. **Conferir conflitos nas FAQs** (regra do prompt universal — só criar `Otimização FAQs.md` se houver conflito ou gap genuíno).
6. **Validar formato `@tool`** (ver seção acima) — etapa obrigatória ao final.
7. **Recomendar monitoramento de 7 dias** após aplicar e medir de novo.

Caso real de referência: SDR Lucas Firmino (D'Leon, abr/2026). Checkpoint cortado de 22.230 para 11.834 chars (47%). Diagnóstico inicial: Gemini 2.5 Flash normal era 48% do gasto (não Lite, como se imaginava). Aplicado em 28/04/2026.

## Campanha FDS — Fundamentos da Sintonização (estado vivo)

Cliente: CR Treinamentos (Paulo Aguiar). Produto: Fundamentos da Sintonização (FDS) — programa de 90 dias para "sintonizar a vida ideal" em 7 áreas. Acesso perpétuo aos módulos gravados; 3 meses de comunidade/tutorias/IA Consultor; garantia 7 dias incondicional.

**Ticket (preço REAL do checkout):** 12x R$ 247,00 sem juros no cartão / R$ 2.388,27 à vista (Pix ou cartão). Preço âncora exibido na Assiny: "De R$ 5.000,00". A página de vendas em HTML mostra R$ 2.497 à vista — esse valor está DESATUALIZADO. Sempre usar 12x R$ 247 / R$ 2.388,27.

Pasta mãe das campanhas: `CR Treinamentos/Campanha de vendas do FDS/`. Duas campanhas compartilham a MESMA base de conhecimento (FAQs + Texto Complementar) — só o checkpoint muda:
- `Venda Ativa - FDS/` — disparo pra base quente que pagou pra entrar no lançamento. Não tem mensagem de abertura criada por nós: o cliente vai disparar 3 copies próprias variando. Checkpoint NÃO deve embutir copy exata de abertura — só recapitular essência. Agente: Aniquilador de Objeções.
- `Recuperação de vendas - FDS/` — abandono do checkout (entrou no Assiny e saiu sem finalizar). Tem mensagem de abertura + FUPs criados por nós. Agente: Aniquilador de Objeções.

IA da campanha: **Nia** (mesmo nome usado em outras campanhas FDS — manter coerência).

Insumos: `Insumo/Página de vendas/fds-pagina-completa-v1.html` (HTML da pgvendas) e `Insumo/Áudio de instruções adicionais/Audio 1 e 2.txt` (instruções operacionais da cliente — críticas).

### Métodos de pagamento por checkout (confirmado por screenshot)

- **Assiny (`{{link_assiny}}`):** cartão de crédito (12x sem juros) + Pix. Suporta "Não sou brasileiro" (telefone internacional). 3DS ativo.
- **Hotmart (`{{link_hotmart}}`):** cartão de crédito (12x sem juros, com opção "Usar dois cartões") + Pix + PayPal + Dois cartões + Cupom de desconto disponível no checkout.
- **TMB (`{{link_tmb}}`):** boleto parcelado em 12x (valor unitário PENDENTE — cliente vai mandar).

### Bônus de fechamento (venda ativa — escassez real, com critérios objetivos)

Diferente dos bônus permanentes da página de vendas (Confronto 2.0 R$ 1.997 + Jornada da Transformação 17 Dias R$ 997), a venda ativa pós-lançamento usa três bônus temporários, todos reais e com FAQs já criadas no Information Manager (atualizadas em 2026-05-06):

1. **Sintonização Individual 1-on-1 com o Paulo** — sessão de ~90min ao vivo, com diagnóstico prévio + Alfa + Re-escrita; só os 5 primeiros compradores; sem gravação; contemplado avisado em até 48h via WhatsApp + e-mail.
2. **Despertar do Milhão** — workshop gravado (Fluxo do Dinheiro) + imersão ao vivo online de Sintonização da frequência do dinheiro com o Paulo; só os 100 primeiros compradores; imersão ao vivo sem replay; data e link enviados na Comunidade WhatsApp + e-mail aos contemplados.
3. **Sintoniza Experience Presencial SP** — evento presencial de 2 dias em SP (data e local em finalização); para quem decidiu até meia-noite do dia do início das vendas; limitado a 200 vagas; passagem e hospedagem NÃO inclusas; contemplado avisado em até 48h via WhatsApp + e-mail.

**Regra inegociável (reforçada pelo cliente em 2026-05-06):** a Nia NUNCA promete posição do lead na fila, NUNCA afirma "você garantiu o bônus X", NUNCA diz "ainda dá tempo". A entrega do bônus depende de critérios objetivos (ordem de compra, horário de corte) que só ficam claros após o processamento. Resposta padrão para qualquer "tô dentro?" / "ainda tem?": "as vagas são limitadas, o caminho de tentar pegar é fechar agora a compra; quem foi contemplado recebe comunicação por WhatsApp e e-mail em até 48 horas".

### Hierarquia de checkout (regra inegociável da cliente)

A IA NUNCA escolhe livremente o checkout. Segue exatamente esta ordem:

1. **Assiny (PADRÃO SEMPRE)** — `https://rebrand.ly/fds-a` → variável `{{link_assiny}}`. Todo lead recebe esse link primeiro. Tem 3DS ativo (validação do banco — ver abaixo).
2. **Hotmart (atrito específico)** — `https://rebrand.ly/fds-H` → variável `{{link_hotmart}}`. Só oferecer quando o lead reclamar de problemas no Assiny: "não consigo comprar", cartão internacional, "moro fora do Brasil", "não consigo preencher meu telefone", ou qualquer outro atrito de compra.
3. **TMB (boleto parcelado)** — `https://rebrand.ly/fds-T` → variável `{{link_tmb}}`. Só e somente só se o lead citar EXPLICITAMENTE a palavra "boleto" ou "boleto parcelado" ("quero boleto", "tem boleto parcelado?"). Permite parcelar de 2 a 12 vezes. A IA NÃO informa o valor exato das parcelas — orienta o lead a conferir os valores diretamente no link da TMB.
4. **Consultor humano (último recurso)** — link PENDENTE (cliente vai mandar). Só escoar quando IA detectar tentativas múltiplas de pagamento sem sucesso. Não é canal de dúvida geral, é canal de resgate de tentativa de compra travada.

### 3DS na Assiny (orientação obrigatória)

A Assiny tem 3DS ativo: validação do banco do cliente. Em algumas transações (não todas), o banco que ia recusar o cartão envia notificação ao cliente para confirmar a compra. A notificação chega por SMS ou no aplicativo do banco. Se o cliente não aprovar, o banco recusa.

A IA tem que estar instruída a orientar o lead a aprovar essa notificação quando ele relatar recusa de cartão. Aplica só ao Assiny — não rola na TMB.

**Why:** Pedido explícito da cliente no áudio. "É para a IA estar instruída a orientar a pessoa a aprovar isso." Sem essa orientação, perde-se venda recuperável.

**How to apply:** Na FAQ de "cartão recusado" / "compra não passou", incluir orientação ao agente para perguntar se o lead recebeu notificação no app do banco ou SMS, explicar o que é o 3DS e instruir a aprovar para finalizar. No checkpoint, etapa de tratamento de objeção de pagamento contempla esse fluxo antes de oferecer Hotmart.

### Pendências do cliente (cobrar)

- [ ] Link do consultor humano (último caso de tentativa de pagamento)
- [ ] Janela total da campanha de venda ativa (data de início e data de fim — assumindo por ora que fecha junto com o bônus Sintoniza Experience SP em 06/05/2026 23h59)
- [ ] Por quantos dias a recuperação de checkout abandonado vai rodar após o fechamento da venda ativa
- [ ] **CRÍTICO — Conflito de acesso "perpétuo" vs "1 ano":** página de vendas em HTML diz "acesso permanente aos módulos gravados". Base de Suporte FDS oficial (em uso na campanha de Suporte) diz "O acesso ao curso é de 1 ano contado a partir da data da compra. Após 1 ano, o acesso à plataforma encerra." Apenas tutorias ao vivo + IA Consultor são 3 meses; o resto do curso (módulos + bônus) acompanha o ciclo de 1 ano. A versão segura adotada nas FAQs de venda otimizadas é "1 ano" (alinhada com a operação real). Cobrar definição: se cliente confirmar permanente, ajustar FAQ 4 da base de Produto.

### Bônus do carrinho aberto (completos — descobertos no cruzamento com base de Suporte 2026-05-06)

A página de vendas em HTML lista apenas Confronto 2.0 e Jornada da Transformação 17 Dias. A base de Suporte FDS oficial revela que são **5 bônus** liberados para todos que compram dentro da janela:

1. **Confronto 2.0** — curso completo de alto nível em 2 blocos (valor avulso R$ 1.997)
2. **Lista de Ouro** — curadoria pessoal do Paulo de filmes e livros para elevar frequência e QI
3. **10 Workshops Exclusivos** — imersões temáticas gravadas de 1 a 2h cada (medo, fé, identidade, casamento, missão de vida, etc.)
4. **Jornada da Transformação de 17 Dias** — toda a jornada ao vivo do lançamento, acesso permanente (valor avulso R$ 997)
5. **Ho'oponopono com Foco no Positivo** — versão corrigida pelo Paulo da prática tradicional

São DIFERENTES dos 3 bônus de fechamento (Sintonização Individual / Despertar do Milhão / Sintoniza Experience), que vão só para alguns compradores específicos.

### Aprendizados de campo da campanha FDS

- (em construção — preencher após primeiras otimizações pós go-live)

## Cliente Way Group — funil VTD (estado vivo)

Cliente Way Group (Lucas Arruda, Amazon FBA). 4 campanhas: REC de vendas VTD, Onboarding VTD, SDR pós-compra e SDR pós-aula 2. 3 bases de conhecimento (REC / Onboarding / SDR compartilhada pelos 2 SDRs).

Estado (2026-07-20): Fases 1 e 2 completas, 12 testes conversacionais rodados, fixes aplicados nos checkpoints locais. Bloqueio atual: tool de agendamento SDR depende de "Private Integrations" do HighLevel (admin do cliente precisa ativar no Labs). Falta ainda: subir checkpoints/FAQs corrigidos na plataforma, FUPs. Sempre ler `Way group/MEMÓRIA - Way Group.md` primeiro.

**How to apply:** Se o usuário mencionar "Way group", "VTD", "Lucas Arruda", "FAS" ou "CNPJ gratuito", ler PRIMEIRO `Way group/MEMÓRIA - Way Group.md` (estado vivo e próximos passos) e `Way group/DADOS OPERACIONAIS - Way Group.md` (links, preços, contatos, funil, CRM, regras do agente SDR). Não recriar nada sem checar o que já existe nas pastas das campanhas.

## Campanha SDR Lucas Firmino — D'Leon (estado vivo)

Campanha "SDR - Lucas Firmino" (D'Leon By Lucas Firmino, BH) — agendamento de avaliação presencial gratuita para Lentes de Porcelana. Agente da plataforma: Qualify & Schedule. Tipo: receptiva (lead inicia).

Estado (última atualização 2026-04-28): checkpoint reescrito (47% menor) e validado contra regras de formatação + formato `@tool`. Adicionada 1 FAQ nova no Playbook ("atendimento por texto") — aguardando o usuário aplicar na plataforma. Acompanhar custo em 7 dias para confirmar redução projetada (~R$ 280-370 nos próximos 19 dias).

Tools da campanha (Plataforma Uno): `@consultar_horarios_disponiveis`, `@registrar_lead_no_rp`, `@criar_agendamento`. Variáveis do checkpoint: `{{foto_antes_depois_1}}`, `{{foto_antes_depois_2}}`, `{{link_suporte}}`.

Decisão pendente sobre Smart FUP: estimativa atual ~13-17% do gasto total, esperado cair para ~7-10% após otimização do checkpoint. Reavaliar substituição por FUP estático apenas se ainda for >15% após 1 semana.

**How to apply:** Se o usuário mencionar "Lucas Firmino", "D'Leon", "SDR lentes" ou similar, ler `Lucas Firmino/SDR/Checkpoint/Checkpoint.md` e `Lucas Firmino/SDR/FAQs/Otimização FAQs - Playbook.md` primeiro. Para análise de custos, processar `Lucas Firmino/SDR/Tabela de detalhes/Custos da campanha - Lucas Firmino.xlsx` e cruzar com `Lucas Firmino/SDR/Tabela de detalhes/Qualify & Schedule - Agente.txt`.
