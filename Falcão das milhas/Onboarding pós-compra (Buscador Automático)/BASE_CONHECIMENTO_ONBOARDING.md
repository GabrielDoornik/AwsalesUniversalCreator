# Base de conhecimento dos Onboardings — curadoria

A base de Suporte foi DUPLICADA pelo CS para os onboardings (2026-07-27). Ela é independente: mexer aqui não afeta a campanha de Suporte que está no ar.

Ponto de partida: 49 FAQs de Produto e 30 de Playbook, herdadas do Suporte.

---

## ESTADO APLICADO (2026-07-27)

Base nova na plataforma: "IA de Suporte - Falcão das Milhas (Onboarding)".

- Produto: ID `3be720b8-608b-4e85-a98f-ac934cd258b8`, 20 documentos ativos
- Playbook: ID `4aedb65e-52cf-4be3-84ff-9507d00a01bb`, 11 documentos ativos
- Total: 31 ativas, contra 79 na origem

A curadoria abaixo foi aplicada e conferida documento a documento. As 6 edições estão com o texto revisado correto. As 12 FAQs que estavam marcadas como "deixar inativas por ora" também ficaram de fora, o que é adequado para o Onboarding 1, que é puro acesso. Reavaliar quando Onboarding 2 e 3 forem definidos.

Exportação em `FAQs/IA de Suporte - Falcão das Milhas (Onboarding) - Produto.pdf` e `- Playbook.pdf`, com os `.txt` extraídos ao lado.

### Caminho canônico de acesso (decidido em 2026-07-27)

Primeiro acesso do cliente: `https://novo.buscadorautomatico.com.br/`, com o e-mail usado na compra. A área de membros (`buscadorautomatico.memberclass.com.br/login`) é outro endereço e serve para cursos, planilhas e bônus.

Correções decorrentes: 4 FAQs de Produto a editar, nenhuma no Playbook. Textos prontos em `FAQs/Otimização FAQs - Caminho de acesso.md`.

Registro da contradição que motivou a decisão, para não se perder:

A base ativa afirmava duas coisas incompatíveis sobre onde o cliente entra. Isso é tolerável no Suporte, onde há humano de retaguarda, e é grave aqui, porque o primeiro acesso é o único objetivo desta campanha.

Dizem que o Buscador tem endereço próprio, separado da área de membros (5 FAQs):

- "Não consigo acessar ou criar minha conta. O que faço?"
- "Não consigo acessar o Buscador e a recuperação de senha não funciona. O que faço?"
- "Perdi o celular ou ele foi roubado e perdi o acesso. O que faço?"
- "Como orientar quando o cliente relata erro 404 na área de membros?"
- Playbook: "Estou com problema no acesso, o que faço?"

Dizem o contrário, que o Buscador fica dentro da área de membros e não é endereço separado (2 FAQs):

- "O que é o Buscador Automático?" — afirma que o acesso é feito pela área de membros
- "Como orientar quando o cliente está preso na área de membros ou numa tela mobile e não consegue chegar ao Buscador?" — afirma literalmente "não é um endereço separado"

O Information Manager pode devolver as duas versões no mesmo top 5. O Copywriter então escolhe uma, e metade dos clientes recebe o link errado logo na mensagem mais importante da campanha.

Resolvido: o CS definiu o login direto do Buscador como caminho canônico. As FAQs do segundo grupo passam a apontar para ele.

---

## 1. Por que podar, e não só adicionar

A busca semântica devolve as 5 FAQs mais próximas da mensagem do lead. Isso é um orçamento fixo: toda FAQ que entra nas 5 empurra outra para fora.

Hoje, das 79 FAQs herdadas, mais da metade trata de cancelamento, reembolso, renovação, retenção, milhas avançadas e venda de Consultoria, Balcão e Black Falcon. Nenhuma delas foi escrita pensando em quem comprou há dez minutos.

O risco não é abstrato. Dois exemplos concretos do que acontece se a base ficar como está:

- Lead do onboarding diz "não tô conseguindo, acho que não é pra mim". A busca casa com "Como reter cliente que quer cancelar por falta de uso" e com "Quero cancelar porque não tive resultados rápidos". As duas mandam oferecer a Consultoria Individual gratuita. Só que a Consultoria gratuita é alavanca de retenção reservada a quem PEDIU cancelamento. A IA acabou de queimar um benefício caro com alguém que só não sabia fazer login.

- Lead diz "não achei nada bom". Casa com "Como lidar com cliente frustrado porque não encontrou nada barato" e com o fluxo de cancelamento. A IA entra em modo retenção numa pessoa que está no primeiro dia e deveria estar sendo ensinada a usar as Tarifas Awards.

Ou seja: o problema não é a IA não achar. É ela achar a FAQ certa para o Suporte e errada para o Onboarding.

Poda também é economia: menos documentos indexados, resumo do Information Manager mais curto, menos token no prompt do Copywriter a cada turno.

---

## 2. PRODUTO — o que fazer com as 49

### Manter ativas (núcleo de acesso e primeiro uso)

1. Como interpretar cada mensagem de erro de acesso e qual o próximo passo certo, sem repetir testes genéricos?
2. Não consigo acessar ou criar minha conta. O que faço?
3. Não consigo acessar o Buscador e a recuperação de senha não funciona. O que faço?
4. Como orientar quando o cliente relata erro 404 na área de membros?
5. Como orientar quando o Buscador apresenta erro técnico ou tela não carrega?
6. Como orientar quando o cliente está preso na área de membros ou numa tela mobile e não consegue chegar ao Buscador?
7. Perdi o celular ou ele foi roubado e perdi o acesso. O que faço?
8. O que fazer quando não encontrei meu bônus ou benefício?
9. Quais bônus ou benefícios vêm junto com o Buscador? (ouvi falar em 8 benefícios)
10. Tem grupo de promoções? Como faço para entrar?
11. O que é o Buscador Automático?
12. Como explico ao cliente o que é e o que não é o Buscador Automático?
13. Como o cliente realiza a primeira busca no filtro principal do buscador?
14. Onde encontro as melhores tarifas no Buscador?
15. Como funcionam os cards de promoção e a emissão da passagem?
16. Como orientar o cliente a usar a busca manual?
17. Por que o primeiro filtro não tem destino e como devo explicar isso ao cliente?
18. Como o cliente pode não perder oportunidades usando o monitoramento?
19. Como faço para aumentar as chances de encontrar passagens melhores?
20. O que responder quando o cliente pede para falar com uma pessoa?

### Desativar agora (comportamento errado no onboarding)

Não é que o conteúdo esteja errado. É que ele instrui a IA a fazer, no primeiro dia, algo que só faz sentido no Suporte.

21. Como proceder quando o cliente pede cancelamento ou reembolso?
22. O que fazer quando quero cancelar porque não encontrei as passagens que queria?
23. Não encontrei boas oportunidades no Buscador. O produto não funciona para mim?
24. Já preenchi o formulário de reembolso. E agora?
25. Como explicar o prazo de cancelamento e reembolso sem prometer elegibilidade nem confirmar os 7 dias?
26. O que fazer quando fui cobrado ou houve renovação da assinatura?
27. Quando indicar a Consultoria Individual e como posicioná-la?
28. Quando indicar o Black Falcon ao cliente?
29. Quando e como indicar o Balcão de Milhas ao cliente?
30. Quero que vocês cotem uma viagem específica. O que preciso informar?
31. Comprei ou emiti a passagem e não acho minha reserva. O que faço?
32. Como orientar quando o cliente comprou passagem errada ou precisa de suporte de passagem emitida?
33. O que está incluso no Super Combo Vitalício?
34. Posso comprar passagem pagando em dinheiro?
35. Como funciona a área de seguros na plataforma?
36. O que são Alianças Aéreas (Star Alliance, Oneworld, SkyTeam) e como funcionam?
37. Qual a diferença entre Alta e Baixa Temporada para encontrar passagens?

Observação sobre as 31 e 32: se um cliente novo aparecer com problema de passagem emitida, o checkpoint já manda encaminhar para o Oner. O caminho não se perde com a desativação.

### Decidir quando Onboarding 2 e 3 estiverem definidos

Estas são de uso do produto, não de suporte reativo. Se algum dos próximos onboardings for sobre primeiro uso ou primeira emissão, elas voltam.

38. O que são Tarifas Award e por que elas são limitadas?
39. Como orientar sobre a escolha da origem e o papel dos hubs?
40. Como explico o campo Programa de Milhas e o que fazer se o cliente não tem saldo nele?
41. Onde o cliente encontra promoções de acúmulo de pontos e como utilizar?
42. Como interpretar os resultados do Buscador quando aparecem companhia operadora, conexão ou tarifa award?
43. O Buscador é igual ao Skyscanner, Google Flights ou buscadores comuns?
44. Como orientar cliente que compara o Buscador com Skyscanner?
45. Trava quando tento selecionar uma tarifa. O que faço?
46. A tarifa apareceu no Buscador, mas sumiu ou mudou. Isso é erro?
47. O que o cliente deve fazer se a tarifa sumir no site da companhia?
48. Como explicar mudança na exibição de preços ou quantidade de milhas no Buscador?
49. Mapa de produtos para a IA reconhecer seriam quais?

Nota sobre 43 e 44: são a mesma intenção em duas FAQs. Se voltarem, voltar só uma.

---

## 3. PLAYBOOK — o que fazer com as 30

### Manter ativas

1. Estou com problema no acesso, o que faço?
2. Como agir quando o cliente não consegue acessar os bônus?
3. Como orientar clientes acima de 45 anos ou que não entendem de milhas?
4. Como evitar respostas repetitivas e transferência precoce?
5. Como agir quando a IA não encontra resposta direta na base?
6. Quais situações devem escalar para suporte humano sem insistir demais?
7. Como proceder quando o cliente pede atendimento humano imediatamente?
8. Como encerrar o atendimento quando o cliente confirma que resolveu?
9. Como explicar, sem gerar atrito, por que o primeiro filtro não tem destino?

### Manter, mas reescrever para o contexto de onboarding

10. Como motivar um cliente que está procrastinando a decisão?
    Hoje ela fala de procrastinar a emissão. No onboarding, o que a pessoa procrastina é o primeiro acesso. Mesma psicologia, gatilho diferente. Vale reescrever em vez de descartar.

11. Como recuperar um cliente em risco por falta de resultados nos primeiros dias?
    Precisa perder a parte que oferece Consultoria, que aqui é fora de hora, e manter o reposicionamento do Buscador como radar.

12. Como transformar uma reclamação em oportunidade de encantamento?
    Manter a lógica de identificar o objetivo antes de responder; tirar as saídas de Consultoria e Oner.

### Desativar agora

13. Como reter cliente que quer cancelar por falta de uso?
14. Como conduzir um pedido de cancelamento ou reembolso sem perder o cliente?
15. Quero cancelar porque não tive resultados rápidos. O que fazer?
16. Como agir quando o cliente recusa a Consultoria de forma clara e repetida?
17. Como agir em reclamações sobre renovação automática?
18. Não entendo nada de milhas, como posso aprender com segurança?
19. Eu prefiro que alguém faça tudo por mim. Qual o melhor produto?
20. Como diagnosticar o perfil do cliente e indicar o produto certo do ecossistema?
21. Achei a viagem dos sonhos, mas não tenho as milhas certas. E agora?
22. Como agir quando o cliente não tem milhas no programa da oportunidade?
23. Como comprar milhas pelo Buscador?
24. Como conduzir pedido de cotação específica de viagem?
25. Como orientar sobre a área de seguros sem criar expectativa errada?
26. Como lidar com o cliente que só viaja em alta temporada e está insatisfeito?
27. Como agir quando o cliente quer destino e data exatos e está decepcionado?
28. Como responder quando a promoção desaparece ao emitir e o cliente culpa o sistema?
29. Como lidar com cliente frustrado porque não encontrou nada barato no buscador?
30. Como transformar clientes satisfeitos em defensores da marca sem forçar?

---

## 4. FAQs que faltam e precisam ser criadas

A base de Suporte é reativa por natureza: ela responde quem chama com problema. O onboarding é ativo e tem intenções que simplesmente não existem lá. Estas são as lacunas, escritas na linguagem do lead.

Produto:

- "Comprei agora, e aí, o que eu faço primeiro?"
- "O que é esse cadastro de perfil e por que eu preciso completar?" (é o coração do E1 para E2 e hoje não existe na base)
- "Comprei mas não recebi nada por e-mail"
- "Eu comprei com um e-mail mas quero usar outro"
- "Eu preciso criar senha ou já tem uma?"
- "Já entrei, e agora, o que eu faço primeiro lá dentro?"

Playbook:

- Como conduzir quem tocou em "Preciso de ajuda" logo na abertura
- Como agir quando o cliente diz que vai fazer depois
- Como agir quando o cliente já entrou e diz que está tudo certo, sem ter completado o perfil
- Como diferenciar quem não acessou de quem acessou e não completou, quando não há evento do sistema

Se a indicação ficar dentro do Onboarding 1, entram também as FAQs do presente e de como indicar o amigo. Se virar campanha separada, ficam de fora.

---

## 5. Resultado esperado

| | Antes | Depois |
|---|---|---|
| Produto | 49 | 20 ativas, 6 novas, 12 em espera, 17 desativadas |
| Playbook | 30 | 9 ativas, 3 reescritas, 4 novas, 18 desativadas |
| Total ativo | 79 | cerca de 42 |

Quase metade do índice, e a metade que sobra é toda sobre o problema desta campanha.

## 6. Como validar

Antes de dar por pronto, rodar as buscas na aba de Busca Semântica da base com as frases reais do lead e conferir se as 5 devolvidas fazem sentido no primeiro dia:

- "não consigo entrar"
- "não recebi o e-mail"
- "diz que meu e-mail não está cadastrado"
- "não sei minha senha"
- "comprei e não chegou nada"
- "não tô conseguindo, acho que não é pra mim"
- "não achei nada bom"
- "onde ficam os cursos"
- "como entro no grupo"
- "quero falar com uma pessoa"

As duas do meio são o teste que importa: se ainda voltar fluxo de cancelamento ou oferta de Consultoria, faltou desativar alguma coisa.
