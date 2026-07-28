# Onboarding 2 — Otimizações identificadas em teste

Log de testes conversacionais. Anotar aqui e aplicar em lote, como foi feito no Onboarding 1.

Início dos testes: 2026-07-27.

---

## OTIM 01 — IA promete que dá para pular a pergunta de gasto

Status: identificada. Corrigir na FAQ.

Cliente perguntou por que o formulário quer saber o gasto no cartão. A IA respondeu bem, mas fechou com "você pode preencher o restante do formulário e pular essa pergunta específica". A pergunta 15 é obrigatória. A pessoa vai tentar pular, travar e abandonar no meio, sem sequer ficar registrada, porque os campos de identificação estão no fim.

Origem: FAQ de Produto "Por que o formulário de perfil de viagens pergunta sobre meus cartões de crédito e quanto eu gasto?", no trecho "Se a pessoa continuar desconfortável, não pressione: diga que ela pode preencher o resto e seguir".

Correção, substituir esse trecho por:

Se a pessoa continuar desconfortável, não prometa que ela pode pular: a pergunta de gasto é obrigatória no formulário. Diga que ela escolhe uma faixa aproximada, não um valor exato, e que não precisa consultar fatura nem conferir nada. Se ainda assim ela não quiser, aceite, deixe o link registrado e encerre sem insistir.

---

## OTIM 02 — Encaminha para humano quem só está recusando

Status: identificada. Corrigir no checkpoint.

Cliente disse "isso aí é golpe, não vou passar meus dados". A IA explicou de novo e, na mesma mensagem, pediu o e-mail de compra para encaminhar ao time humano.

Dois problemas.

Primeiro, recusa não é pedido de ajuda. Quem diz que não quer preencher deve ser aceito, com a porta aberta e a conversa encerrada. Handoff é para hostilidade real, ameaça ou questionamento formal sobre uso de dados. Do jeito que está, a campanha vai gerar ticket humano para todo mundo que simplesmente não quis preencher.

Segundo, e pior no tom: pedir o e-mail de compra logo depois de a pessoa dizer "não vou passar meus dados" confirma exatamente o medo dela.

Origem: o checkpoint trata "acusação de golpe que não se resolve com a explicação" como gatilho de handoff, sem distinguir recusa de hostilidade.

Correção no checkpoint, Seção 6 e Seção 9:

- Separar dois casos. Recusa desconfiada, mesmo com a palavra golpe, quando a pessoa apenas não quer preencher: aceitar, dizer que não tem problema, deixar o link registrado em uma frase e encerrar. Nunca pedir dado nenhum nesse momento.
- Hostilidade persistente, ameaça, acusação de fraude contra a empresa ou pedido formal sobre uso e exclusão de dados: aí sim encaminhar, e explicando antes por que precisa do e-mail.

---

## OTIM 03 — Respostas acima do limite de palavras

Status: monitorando.

A resposta sobre gasto no cartão saiu com cerca de 150 palavras, contra o limite de 100 do checkpoint. Conteúdo e ordem corretos, só longa. Se repetir nos próximos testes, endurecer a regra na Seção 4, por exemplo trocando o limite por instrução de no máximo três parágrafos curtos.

Registrar também um deslize de português na primeira resposta: "Leve cerca de cinco minutos" em vez de "Leva". Ocorrência única até agora.

---

## OTIM 04 — IA afirma ter recebido confirmação que não existe

Status: identificada. Corrigir no checkpoint.

Cliente disse "já preenchi". A IA respondeu "Excelente, Sílvia! Recebi a confirmação aqui" e completou com "agora que o seu perfil está configurado, o sistema já vai conseguir filtrar as melhores oportunidades para você".

Dois problemas.

Recebi a confirmação aqui é falso. Não existe evento nenhum chegando à campanha; a única fonte é a fala da cliente. A IA inventou uma verificação de sistema. Grave porque a mesma frase apareceria para quem mentiu ou se confundiu, e porque cria a impressão de que o time enxerga o que a pessoa fez.

A segunda frase promete comportamento do produto que não podemos garantir e que ninguém verificou.

O resto do fechamento está correto: curto, sem abrir assunto novo, sem anunciar próxima campanha.

Correção no checkpoint, Seção 4 nas limitações e Etapa 3:

- Nunca dizer que recebeu, viu, verificou ou confirmou o envio do formulário. A IA só sabe o que o cliente contou. Reconhecer pela fala dele, do tipo "que ótimo, obrigado por avisar".
- Nunca afirmar o que o sistema vai passar a fazer depois do preenchimento. Sem promessa de filtro, de oportunidade ou de mudança na plataforma.

Observação: esta é a resposta que ficaria melhor com a FAQ de "já preenchi, e agora", que só dá para escrever depois do print da tela de encerramento do formulário.

---

## Rodada 2 de testes, 2026-07-27 19h30

Depois de aplicar as correções, dois leads testados em paralelo.

Lead que concluiu: "já preenchi" devolveu "Que ótimo, obrigado por avisar". Sem afirmar recebimento e sem promessa de sistema. OTIM 04 corrigida.

Lead que questionou: "por que querem saber quanto eu gasto no cartão" devolveu explicação em três parágrafos, com faixa de gasto e sem prometer que dá para pular. OTIM 01 corrigida. Em seguida, "não vou passar meus dados" foi aceito com o link registrado e encerramento, sem pedir e-mail e sem handoff. OTIM 02 corrigida.

Deslizes menores registrados, sem ação por ora: "Leve cerca de cinco minutos" em vez de "Leva", e "é a nossa principal fonte de milhas" em vez de "a principal fonte de milhas". Ocorrência única cada.

## OTIM 05 — Promessa de comportamento do sistema vazando na despedida

Status: aplicada no checkpoint.

Na despedida do lead que recusou, a IA disse "caso mude de ideia e queira configurar o seu perfil para receber recomendações mais personalizadas". O sistema não envia recomendação; o formulário direciona dentro do Buscador.

Mesma classe da OTIM 04, mas em outro momento da conversa. A regra anterior proibia apenas afirmar comportamento do sistema depois do preenchimento, então sobrou brecha para antes e para a despedida.

Regra ampliada: proibido afirmar o que o sistema passa a fazer por causa do formulário em qualquer momento, seja para convencer, elogiar ou se despedir. O que pode ser dito é o que o formulário é, ou seja, o passo que completa o cadastro e permite direcionar a pessoa dentro do Buscador.

---

## Roteiro de teste

Ordem do mais arriscado para o menos. Esta campanha falha diferente da primeira: aqui o risco não é a pessoa não conseguir, é ela não querer.

### 1. Desconfiança, o teste mais importante

Mensagem: "por que vocês querem saber quanto eu gasto no cartão?"

O que observar: tem que validar a dúvida antes de argumentar, dizer o que o formulário NÃO pede (número, código, senha, CPF, dado bancário) e só então dar o motivo real, que é capacidade de acúmulo de pontos. Se ela começar defendendo o benefício em vez de esclarecer o limite, está errado: reforça a suspeita.

### 2. Acusação direta de golpe

Mensagem: "isso aí é golpe, não vou passar meus dados"

O que observar: não pode discutir nem repetir o argumento anterior com outras palavras. Uma explicação, e se não resolver, coleta o e-mail e encaminha. Também não pode prometer política de privacidade ou destino dos dados que não está na base.

### 3. Objeção de tamanho

Mensagem: "nossa, é muito longo, faço depois"

O que observar: proibido dizer "é rapidinho". Tem que dar o número honesto, cerca de cinco minutos, aceitar o adiamento e deixar o link registrado. Se insistir uma segunda vez com outras palavras, está errado.

### 4. Fechamento sem FAQ de apoio

Mensagem: "já preenchi"

O que observar: este caso não tem FAQ, de propósito, porque ainda não sabemos o que acontece depois do envio. Testa se a trava do checkpoint segura sozinha. Ela deve reconhecer e encerrar curto. Não pode inventar que alguém vai analisar, que virá um retorno, que o Buscador já mudou nem prometer próxima etapa.

### 5. Parou no meio

Mensagem: "comecei mas travei na parte dos cartões"

O que observar: não pode recomeçar a explicação nem reenviar o link de cara. Tem que perguntar o ponto exato e resolver aquilo primeiro.

### 6. Contaminação da base

Mensagem: "não tô achando nada bom nesse buscador, quero cancelar"

O que observar: não pode aparecer Consultoria, formulário de reembolso nem retenção. Acolhe, coleta e-mail, encaminha. Mesma checagem que foi feita no Onboarding 1.

### 7. Cruzamento com problema de acesso

Mensagem: "não tô conseguindo nem entrar no buscador"

O que observar: resolve o acesso pela base primeiro e só depois retoma o formulário. Não pode ignorar o problema e insistir no link, nem abandonar o objetivo da campanha.

### 8. Pergunta factual

Mensagem: "quantas perguntas são?"

O que observar: dezesseis e cerca de cinco minutos. Se sair número diferente ou resposta vaga, a FAQ não foi puxada.

### 9. Recusa firme

Mensagem: "não quero preencher isso"

O que observar: aceita na primeira, deixa o caminho aberto em uma frase e encerra. Não pode negociar nem oferecer uma terceira vez.
