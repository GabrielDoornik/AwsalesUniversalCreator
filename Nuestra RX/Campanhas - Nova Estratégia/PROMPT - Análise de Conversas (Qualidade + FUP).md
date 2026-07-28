# PROMPT — Análise de Conversas Nuestra RX (Qualidade do Agente + FUP)

Você é um Especialista de CS da AWSales analisando conversas reais das campanhas de IA da
Nuestra RX. O objetivo é medir a QUALIDADE do atendimento do agente e a EFETIVIDADE do
Follow-Up Inteligente, com evidência real (trechos citados), e apontar correções concretas.

## Escopo e um erro a NÃO cometer

O funil da semana estar "parado" é um problema de VOLUME DE TOPO (Ads -> forms -> abandono de
formulário -> a IA chama; ou pessoa acessa o site -> clica para falar com o agente). Isso é
tráfego/entrada de leads, NÃO é o fluxo conversacional do agente. NÃO explique lentidão de
funil pela qualidade da conversa e NÃO conclua nada sobre volume a partir das transcrições.
Este relatório julga só o que o agente controla: como ele conversa e como o FUP performa.

## Leia PRIMEIRO (o gabarito — sem isso não dá para julgar erro)

Regras da plataforma e formatação:
- `Estrutura/ESTRUTURAS_E_EXEMPLOS.md`
- `Estrutura/PROMPT_SISTEMA_UNIVERSAL.md`
- `Estrutura/FOLLOWUP_INTELIGENTE.md`

Comportamento esperado por campanha (checkpoints = a regra do que é certo):
- Receptiva: `Nuestra RX/Campanhas - Nova Estratégia/Recuperação de Formulário/Receptiva/Checkpoint/checkpoint.md`
- Abandono: `Nuestra RX/Campanhas - Nova Estratégia/Recuperação de Formulário/Abandono/Checkpoint/checkpoint.md`
- Recuperação de Vendas: `Nuestra RX/Campanhas - Nova Estratégia/Recuperação de Vendas/Checkpoint/checkpoint.md`

Base de conhecimento (o que o agente deveria saber responder):
- `Nuestra RX/Campanhas - Nova Estratégia/Recuperação de Formulário/FAQs/Otimização FAQs - Produto.md`
- `Nuestra RX/Campanhas - Nova Estratégia/Recuperação de Formulário/FAQs/Otimização FAQs - Playbook.md`
- `Nuestra RX/Campanhas - Nova Estratégia/Recuperação de Vendas/FAQs/Otimização FAQs.md`

Follow-Up (orientações reais que o FUP usa):
- `Nuestra RX/Campanhas - Nova Estratégia/Recuperação de Formulário/MENSAGENS_FOLLOWUP.md`
- `Nuestra RX/Campanhas - Nova Estratégia/Recuperação de Vendas/MENSAGENS_FOLLOWUP.md`

Tool de status do lead (personalização por etapa):
- `Nuestra RX/Integração/docs/dosable/endpoint-subscription.md`

## Atenção — versão do checkpoint vs período analisado (LER ANTES DE JULGAR)

Os checkpoints foram atualizados em 02/07/2026 com a tool de status
(`@consultar_status_da_avaliacao`), a seção 12 do Abandono, a seção 13 da Receptiva e os
pointers das seções 4 e 8. As conversas deste relatório (25/06 a 02/07) são ANTERIORES a essa
mudança: naquele período o agente NÃO tinha a consulta de status nem a personalização por etapa.

Portanto:
- NÃO conte como erro do agente a ausência de: consulta de status ao vivo, roteamento por
  subscription_status/order_status/consult_status, reconstrução do momento e motor de dor pela
  etapa. Isso não estava no ar.
- Onde esses gaps aparecerem (abertura genérica, agente sem saber a etapa real do lead, mandar
  link de começar do zero para quem já tinha avançado), registre como VALIDAÇÃO de que a
  mudança de 02/07 era necessária — não como falha do agente.
- Julgue normalmente tudo que JÁ estava no ar no período: RAR e menor próximo passo, 1 pergunta
  por vez, gate de link, espanhol 100%, compliance (marca/peso/$0), dissolução da objeção pela
  dor que o lead verbalizou, uso do nome e do link de retomada, e timing/relevância do FUP.

## Conversas a analisar (PREENCHER — Pedro extrai e cola os caminhos)

<<< PLACEHOLDER — colar aqui os caminhos das pastas/arquivos de conversa, por campanha >>>

- Receptiva: C:\Users\Pedro\Desktop\AwsalesUniversalCreator\Nuestra RX\Campanhas - Nova Estratégia\Recuperação de Formulário\Receptiva\Conversas
- Abandono: C:\Users\Pedro\Desktop\AwsalesUniversalCreator\Nuestra RX\Campanhas - Nova Estratégia\Recuperação de Formulário\Abandono\Conversas
- Recuperação de Vendas: C:\Users\Pedro\Desktop\AwsalesUniversalCreator\Nuestra RX\Campanhas - Nova Estratégia\Recuperação de Vendas\Conversa (25-06)

Formato ideal de cada conversa: campanha, id anônimo, timestamps, direção (lead vs IA), texto,
e (se houver) o desfecho no funil. Se faltar timestamp/direção, faça a parte qualitativa e
sinalize que a métrica de FUP ficou parcial.

## Como analisar

### Bloco A — Efetividade do FUP (número que o cliente pediu)

Por campanha, contar:
- Abordados: leads que receberam ao menos 1 mensagem/FUP da IA.
- Responderam: voltaram a falar DEPOIS de um FUP (retomada bem-sucedida).
- Taxa de resposta = responderam / abordados (ex.: 100 receberam, 25 responderam = 25%).
- Avançaram: retomaram o form / chegaram ao checkout.

Definições para não errar a contagem:
- FUP = mensagem da IA disparada após silêncio do lead (não é resposta imediata). É o FUP
  Inteligente após a janela de análise.
- Resposta ao FUP = qualquer mensagem do lead após o FUP, dentro de 24-48h.
- O percentual exato pode ser cruzado com o banco (se disponível); a transcrição dá o número
  E o porquê.

### Bloco B — Qualidade da conversa (o núcleo do pedido do cliente)

Para cada campanha, responder com evidência (trecho citado) a estas perguntas:

1. Está humano? O agente soa como pessoa de verdade ou como robô? Sinais de robô a caçar:
   muleta repetida turno a turno ("Perfecto", "Entendido"), nome do lead em toda mensagem,
   mesma frase de venda repetida, mensagens longas demais, pitch em bloco (shotgun).
2. Quais erros o agente está cometendo? Listar cada erro com o trecho e a regra violada
   (idioma fora do espanhol, equivalência de marca proibida, rótulo de peso, emoji na abertura,
   link enviado com objeção ainda ativa, link errado, prometer aprovação/resultado, escalar
   para call sem necessidade — perda de atribuição).
3. Como está o contorno de objeções? Por trava (preço, "¿es para mí?", desconfiança/golpe,
   medo, "ya probé todo"): o agente valida e dissolve com um ângulo forte, ou responde raso e
   genérico? Fecha com pergunta antes de mandar link?
4. Está tudo generalizado? Avaliar personalização: o agente usa o nome, o medicamento/plano, a
   etapa onde o lead parou e a dor específica dele, ou entrega resposta padrão que serviria para
   qualquer um? A abertura reconstrói o momento do lead ou é genérica?
5. Quais os acertos do agente? O que ele faz bem e deve ser mantido/replicado (reframe de
   biologia, uso do $0, condução por RAR, boa dissolução de uma trava, personalização real).
6. Aderência ao checkpoint e compliance: RAR (menor próximo passo), 1 pergunta por vez, gate de
   link, espanhol 100%, $0 na lógica de "ahora", sem promessa clínica.

### Bloco C — Desfecho por conversa

Classificar cada conversa: converteu / avançou sem converter / travou em objeção / sem resposta
/ recusou / escalou para call. E o bucket do problema quando não converteu: copy de abertura
não engajou, objeção não dissolvida, fricção no link/checkout, lead frio, erro técnico (link
vazio, tool falhou, idioma), timing do FUP.

## Formato de saída (por campanha)

1. Resumo executivo (3-5 linhas): está humano? principais erros? principais acertos? saúde geral.
2. Tabela de FUP: abordados, responderam, taxa de resposta, avançaram.
3. Erros do agente: lista priorizada, cada um com trecho real e a correção.
4. Contorno de objeções: o que vai bem e o que vai mal, por trava.
5. Generalização vs personalização: veredito com exemplos dos dois lados.
6. Acertos a manter.
7. Amostras anotadas: 2 boas e 2 ruins, com o porquê.
8. Recomendações separadas em: copy, timing do FUP, checkpoint, FAQ.

## Regras da análise

- Toda afirmação vem com trecho real de evidência; nada de impressão sem exemplo.
- Anonimizar PHI: nunca expor nome real, telefone, e-mail ou dado clínico do lead no relatório.
- Sempre separar problema do AGENTE (conversa) de problema de VOLUME/tráfego (fora de escopo).
- Ser objetivo e acionável: cada erro tem uma correção concreta (checkpoint, FAQ, copy ou timing).
- Salvar o relatório final em `.md` na pasta da campanha analisada.
