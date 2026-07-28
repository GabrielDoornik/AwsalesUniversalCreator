# Contexto para análise de conversas — Venda Ativa A Ruptura (Teste A/B/C)

## Setup do teste

Rodamos 3 versões da mesma campanha de venda ativa em paralelo (mesmo produto, mesma base de FAQs) pra descobrir qual estratégia de abertura e uso da oferta engaja melhor. Cada teste tem seu próprio checkpoint e mensagem de abertura — você vai ler os arquivos da campanha pra entender o conteúdo. O que importa pra análise é a hipótese de cada um:

- **Teste A** — R$ 37 já na abertura como exclusividade da conversa (urgência de horário do dia). Hipótese: lead engaja porque sente privilégio individual.
- **Teste B** — R$ 47 cheio na abertura, R$ 37 só liberado após objeção explícita de preço. Hipótese: preço cheio converte os de alta intenção e R$ 37 vira downsell em vez de queimar margem com todo mundo.
- **Teste C** — Pergunta de filtro sobre a aula gratuita do dia anterior, ramifica entre mandar replay / capturar dúvidas / atalhar pra venda. Hipótese: o conteúdo da aula faz a venda, o bot só fecha.

É venda ativa: o bot abriu a conversa, o lead não pediu contato.

## Objetivo da análise

A campanha vendeu muito pouco no agregado dos 3 testes (1 venda no total). Esta análise é um **post-mortem pra entender o porquê**, não uma comparação de quem converteu mais. Não tente eleger um "vencedor" entre A/B/C — não há volume pra isso. O foco é descobrir o que travou as conversas e o que pode ser ajustado.

## O que analisar

Não force conclusão. Deixe a conversa dizer. Algumas direções (não exaustivas):

1. **Onde a conversa morre.** Lead não respondeu a abertura? Respondeu e sumiu depois de qual mensagem? Travou em qual etapa do checkpoint?
2. **Qualidade do lead.** Frio (não reconheceu nada / não sabia quem é Paulo), morno (lembrava vagamente), quente (já decidindo)? Tem padrão claro? Parece que a base de leads disparada está alinhada com o avatar do produto?
3. **Reação à abertura.** O gancho da dor ressoou? O preço (R$ 37 / R$ 47) pareceu alto, baixo, ou ignorado? Lead questionou a legitimidade da oferta?
4. **A hipótese de cada teste se confirmou ou furou?** Ex: no A, o R$ 37 antecipado virou desconfiança ("é golpe?")? No B, o R$ 47 fez o lead sumir antes de chegar na quebra? No C, leads ignoraram a aula ou travaram no replay sem nunca voltar pra venda?
5. **Comportamento do bot.** Alucinação, promessa indevida, escassez inventada, link solto, falha em parcelar antes do à vista, tom robótico, perdeu o gancho, contornou objeção mal, etc.
6. **Sinais externos à IA.** Pode não ter vendido por motivos não-execução: timing (disparo longe/perto da imersão), público errado da base, preço fora do bolso do perfil, fadiga de campanha, expectativa quebrada vs. página de vendas, dia/horário do disparo. Levante se aparecer.
7. **Padrões agregados.** Objeção que se repete? Mesmo ponto de drop? Tipo de lead que sempre ignora? Pergunta que o bot nunca consegue responder bem?

## Saída

Para cada teste (A, B, C):
- Diagnóstico em 3-5 bullets do que aconteceu nas conversas.
- Top 3 hipóteses do porquê não converteu, ranqueadas por evidência observada (não intuição). Pode haver hipóteses repetidas entre testes — tudo bem.
- Recomendação direta (ajustar checkpoint / abertura / FAQs / público / timing / descartar abordagem / outro).

No final, uma síntese geral: o que os 3 testes juntos sugerem sobre **(a)** o avatar real vs. o avatar idealizado da página de vendas, **(b)** se o problema é mais de execução do bot, da estratégia de oferta, ou da base de leads/contexto da campanha.

Trabalhe no qualitativo. Não invente números nem taxas de conversão.
