# Otimização FAQs — Produto (Base de Suporte)

Base: `IA de Suporte - Falcão das Milhas` — Produto, ID `8a977399-f9fa-4ba9-a318-483d93ae1eb5`.
Data: 2026-08-05. Origem: task de redução de handoff, item 4d.

Motivo: o onboarding do perfil de viagens nasceu em 27/07 e passou a mandar centenas de pessoas para um formulário que a base de Suporte nunca conheceu. Conferido em 05/08: nenhum dos documentos da base de Suporte menciona o formulário de perfil, e `rebrand.ly/buscador-perfil` não aparece em nenhuma base da organização. Resultado em produção: a IA encaminhava o caso, e em dois tickets mandou o formulário de reembolso afirmando ser o de cadastro de perfil.

As três FAQs abaixo são cópia das que já existem e funcionam na base `IA de Suporte - Falcão das Milhas (Onboarding)` (Produto, ID `3be720b8-608b-4e85-a98f-ac934cd258b8`), com um ajuste: a primeira passa a trazer o endereço do formulário dentro da resposta. Hoje nenhuma das seis diz qual é o endereço.

O endereço entra como URL crua, não como variável. Vale a exceção já registrada no `CLAUDE.md`: em campanha de suporte, link estável de informação que É a própria resposta mora na FAQ. O `{{link_formulario_perfil}}` continua existindo no checkpoint, para o caso em que o link é enviado por decisão de fluxo e não por consulta à base.

---

## CRIAR 1

Pergunta:

```
Pra que serve esse formulário de perfil de viagens?
```

Resposta:

```
O formulário de perfil de viagens é o passo que completa o cadastro do cliente no Buscador Automático, e o endereço dele é https://rebrand.ly/buscador-perfil. Explique que ele reúne informações sobre o jeito de viajar da pessoa: com que frequência ela voa para fora do Brasil, em que classe, em qual programa ela acumula milhas e pontos, qual o próximo destino e a data pretendida, e quanta flexibilidade ela tem para mudar a data. É isso que permite direcionar a pessoa às oportunidades que combinam com o caso dela, em vez de deixar ela garimpar tudo sozinha entre todas as promoções da plataforma. O login funciona sem o formulário, mas as passagens do Buscador só aparecem depois que ela responde as perguntas. Este formulário não tem nenhuma relação com cancelamento ou reembolso: nunca envie o formulário de reembolso no lugar dele. Não prometa resultado, valor de passagem nem disponibilidade, e não diga que alguém vai analisar as respostas ou entrar em contato.
```

Motivo da criação: é a FAQ que o cliente aciona quando pergunta do formulário ao Suporte, e a única das seis que carrega o endereço. A frase sobre login e passagens vem da confirmação do cliente no grupo em 05/08. A trava explícita contra o formulário de reembolso está aqui porque foi exatamente esse o erro visto em produção.

---

## CRIAR 2

Pergunta:

```
Preciso mesmo preencher o formulário de perfil de viagens? É obrigatório?
```

Resposta:

```
Explique que preencher é o caminho previsto para concluir o cadastro e ser direcionado dentro do Buscador Automático, conforme a própria tela de abertura do formulário informa. Enquadre pelo ganho prático e não pela obrigação: sem o perfil, a pessoa vê a plataforma inteira e precisa procurar sozinha; com o perfil, o caminho fica apontado para o destino, o programa de milhas e as datas dela. O login continua funcionando sem o formulário, mas as passagens do Buscador só aparecem depois que ela responde. Não afirme que a conta será bloqueada, cancelada ou perdida, porque isso não acontece. Se a pessoa recusar de forma clara duas vezes, aceite, deixe o link registrado numa frase e encerre sem insistir.
```

Motivo da criação: cobre a intenção "sou obrigado a isso?", que na base de onboarding é a FAQ mais usada do tema (54 usos). Ajuste em relação ao original: o original dizia "não afirme que o acesso será bloqueado", e agora o texto separa o que é verdade do que não é, com base na confirmação do cliente.

---

## CRIAR 3

Pergunta:

```
Por que o formulário de perfil de viagens pergunta sobre meus cartões de crédito e quanto eu gasto?
```

Resposta:

```
Trate a dúvida como legítima, nunca como implicância, porque é uma pergunta razoável. Explique o motivo real: o acúmulo de pontos no cartão é a principal fonte de milhas de quem não voa com frequência, então saber o banco, a bandeira e a faixa de gasto permite orientar a pessoa sobre onde e como acumular mais rápido. Deixe claro, sempre, que o formulário pergunta apenas banco, bandeira e categoria do cartão, e nunca o número, o código de segurança, a senha ou qualquer dado bancário, e que a IA também nunca pede isso pelo WhatsApp. Se a pessoa continuar desconfortável, não prometa que dá para pular: a pergunta é obrigatória. Diga que ela escolhe uma faixa aproximada e não um valor exato, e que não precisa consultar fatura nem conferir nada. Se ainda assim não quiser, aceite, deixe o link registrado e encerre sem insistir. Se ela questionar formalmente o uso dos dados ou pedir exclusão, encaminhe para o time humano com o e-mail de compra.
```

Motivo da criação: é a objeção que mais aparece no público 45 mais e a que tem maior chance de virar acusação de golpe. Cópia literal da base de onboarding, sem alteração.

---

## EDITAR 1

Pergunta (manter exatamente como está):

```
Como explicar o prazo de cancelamento e reembolso sem prometer elegibilidade nem confirmar os 7 dias?
```

Resposta nova:

```
Separe a linha do tempo em etapas, sem dar um prazo único. 1) Preenchimento do formulário oficial abre o pedido. 2) Análise pelo time responsável, até 72 horas úteis, de segunda a sexta, das 09h às 18h. 3) Confirmação do cancelamento, se aprovado. 4) Devolução do dinheiro, quando aplicável: até 15 dias após a aprovação. Esse prazo é a devolução em si e não se confunde com as 72 horas úteis, que são só a análise. Pix costuma refletir mais rápido; cartão de crédito depende da operadora e do ciclo de fatura. Sobre a garantia de 7 dias (CDC): pode mencionar que existe, dentro de 7 dias há reembolso, fora do prazo o cancelamento segue sem reembolso integral. Nunca confirme se aquele cliente específico está dentro ou fora do prazo; isso é conferência do time humano. Explicar o prazo não substitui a transferência: depois de explicar, encaminhe o caso, porque nenhum pedido de cancelamento ou reembolso é concluído dentro do atendimento automático.
```

Motivo da edição: é a FAQ mais usada da base neste tema, 892 usos, e não tinha o prazo da devolução. Sem esse número literal na base ou no checkpoint, o Auditor barra a IA se ela tentar responder, porque prazo entra na regra de número comercial. O 15 dias veio da Nicole no grupo em 05/08.

Impacto medido: 9 dos 49 tickets de cancelamento entre 01 e 04/08 eram cliente voltando só para saber o andamento de um pedido antigo. Com o prazo alinhado na hora do encaminhamento, essa volta deixa de acontecer.

Atenção: esta base NÃO é compartilhada com os onboardings, que usam uma cópia própria. Editar aqui não afeta as outras campanhas.

---

## Ativar sem alteração

As outras 48 FAQs da base de Produto de Suporte seguem como estão.

---

## Conflito para decidir depois, fora do escopo desta task

Duas FAQs de alto uso desta base contrariam a Seção 2 do checkpoint de Suporte.

- "Como orientar quando o cliente está preso na área de membros ou numa tela mobile e não consegue chegar ao Buscador?" (166 usos): "O Buscador fica dentro da área de membros, não é um endereço separado."
- "O que é o Buscador Automático?" (965 usos): "O acesso é feito pela área de membros, em https://buscadorautomatico.memberclass.com.br/login, e o Buscador fica dentro dela."

O checkpoint diz o contrário, em duas passagens: "Os dois endereços são diferentes. Não tratar um como sinônimo do outro." E outras FAQs da mesma base mandam o cliente para `https://novo.buscadorautomatico.com.br/`. A cópia da base para o onboarding já foi corrigida nesse ponto e diz que são endereços diferentes.

Não mexi porque não está na task e porque a correção certa depende de qual dos dois é verdade hoje na plataforma do Falcão. Vale confirmar com o cliente antes, e a decisão afeta duas FAQs com mais de mil usos somados.
