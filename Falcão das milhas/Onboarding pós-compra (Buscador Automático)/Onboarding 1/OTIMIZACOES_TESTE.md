# Onboarding 1 — Otimizações identificadas em teste

Log de testes conversacionais do agente na plataforma. Anotar aqui e aplicar em lote.

Início dos testes: 2026-07-27.

---

## OTIM 01 — Troubleshooting sendo entregue no caminho feliz

Status: identificada, não aplicada.
Detectada em: 2026-07-27, primeiro turno após o toque em Continuar.

O que aconteceu:

O cliente tocou em Continuar e a primeira resposta veio com "Recomendo que abra em uma aba anônima do seu navegador para evitar conflitos". Ninguém relatou problema nenhum. Num público 45+, isso adiciona um conceito técnico desnecessário logo no passo que precisa ser o mais simples possível, e ainda sugere que dar errado é o esperado.

Origem:

Cinco FAQs ativas mencionam aba anônima. Quatro condicionam corretamente a um erro já relatado e não são o problema:

- Como interpretar cada mensagem de erro de acesso
- Como orientar quando o cliente relata erro 404 na área de membros
- Como orientar quando o Buscador apresenta erro técnico ou tela não carrega
- Playbook: Estou com problema no acesso

A quinta é a causa. Na FAQ "Como orientar quando o cliente está preso na área de membros ou numa tela mobile e não consegue chegar ao Buscador?", a orientação aparece sem condição: "Oriente a abrir o link do Buscador direto, de preferência em aba anônima, sem usar link salvo nem histórico".

Agravante estrutural: no primeiro turno a mensagem do lead é apenas "Continuar", que é semanticamente vazio. A busca semântica não tem o que casar e pode devolver qualquer FAQ de acesso, inclusive as de erro. Por isso o conserto não pode ser só na FAQ.

Correção em duas partes:

1. FAQ "Como orientar quando o cliente está preso na área de membros ou numa tela mobile e não consegue chegar ao Buscador?" — trocar o trecho

   de: "Oriente a abrir o link do Buscador direto, de preferência em aba anônima, sem usar link salvo nem histórico."

   para: "Oriente a abrir o link do Buscador direto, digitando o endereço, sem usar link salvo nem histórico."

   O resto da resposta permanece igual. O aba anônima continua disponível no fim dela, na parte que já é condicionada a tela travada ou em branco.

2. Checkpoint, Etapa 1 — acrescentar a regra de que a primeira resposta contém apenas link, e-mail de login e criação de senha. Nada de aba anônima, limpar cache, outro navegador ou outro dispositivo antes de o cliente relatar um problema. Esses passos pertencem exclusivamente à Etapa 2.

Aplicada no checkpoint em 2026-07-27, junto com a OTIM 02. Falta aplicar a parte 1, na FAQ.

---

## OTIM 02 — Link errado para quem ainda não tem conta

Status: aplicada no checkpoint, pendente na plataforma e nas FAQs.
Identificada em: 2026-07-27, pelo CS.

O Buscador tem dois endereços, e a campanha estava usando o errado:

- Primeiro acesso, criar conta e definir senha: https://novo.buscadorautomatico.com.br/primeiro-acesso
- Login de quem já tem conta: https://novo.buscadorautomatico.com.br/

Mandar o login para quem nunca entrou joga a pessoa numa tela que pede senha que ela não tem. É literalmente o atrito que esta campanha existe para eliminar.

O que mudou:

1. Variável da campanha renomeada de `link_buscador` para `link_primeiro_acesso`, com valor `https://novo.buscadorautomatico.com.br/primeiro-acesso`. Ajustar na plataforma.
2. Checkpoint, Seção 2 e Etapa 1: passa a mandar o link de primeiro acesso e a distinguir explicitamente os dois casos. Quem já tem conta recebe o login normal, que vem da FAQ.
3. FAQ "Não consigo acessar ou criar minha conta. O que faço?": passa a separar as duas situações. Texto pronto em `FAQs/Otimização FAQs - Caminho de acesso.md`, edição 5.

Pendência com o cliente: confirmar o que acontece se alguém que JÁ tem conta abrir a tela de primeiro acesso. Se der erro ou criar conta duplicada, precisamos de uma trava extra no checkpoint.

---

## OTIM 03 — CANCELADA, era erro de escopo meu

Status: cancelada. Nada a aplicar. A FAQ de encerramento NÃO deve ser editada.

Registro do que aconteceu, para não repetirmos:

No teste de 2026-07-27, o cliente disse "consegui entrar" e a IA respondeu "Que bom que deu certo. Qualquer dúvida, é só me chamar por aqui". Eu tratei isso como bug, por estar carregando o escopo do board original, onde acesso e cadastro de perfil viviam na mesma automação.

O CS corrigiu: o output do Onboarding 1 é o primeiro acesso, ponto. O cadastro do perfil é o Onboarding 2, que vai conduzir por Typeform.

Ou seja, a IA agiu certo e a FAQ de encerramento está correta como está. As mudanças que eu tinha feito no checkpoint foram revertidas.

Lição para o resto do projeto: cada onboarding tem um output só, e o board original não é a fronteira das campanhas. Antes de tratar um encerramento como bug, conferir qual é o output daquela campanha específica.

---

## OTIM 04 — Escopo do Onboarding 1 corrigido

Status: aplicada no checkpoint.
Origem: correção de escopo do CS em 2026-07-27.

O checkpoint estava desenhado para dois objetivos, acesso e cadastro de perfil. Passa a ter um só.

O que mudou:

- Seção 1: missão agora é apenas o primeiro acesso, com escopo fechado explícito. O cadastro do perfil não deve ser pedido, explicado nem prometido nesta campanha.
- Estado: o campo de status tem duas opções, E0 não acessou e E1 acessou, sendo E1 o objetivo cumprido. O antigo E2 saiu.
- Barreira relatada: removida a opção de não conseguir concluir o cadastro do perfil.
- Roteador: "disse que já entrou" leva ao fechamento, não a uma etapa nova.
- Etapa 3 de cadastro do perfil: removida. A antiga Etapa 4 virou Etapa 3 e fecha a campanha em E1.
- Ponte de ativação: próximo passo desejado agora é conta criada e primeiro acesso feito.

Ponte entre campanhas: E1 é o output do Onboarding 1 e o input do Onboarding 2. Vale confirmar se o Onboarding 1 deve preparar terreno mencionando que vem um próximo passo, ou se o Onboarding 2 se apresenta do zero. Hoje o checkpoint está com a segunda opção, sem anunciar nada.

---

## OTIM 05 — Tratamento dos dois botões de quick reply

Status: aplicada no checkpoint. Preventiva, encontrada em revisão, não em teste.

O clique num botão de resposta rápida chega como mensagem de texto do cliente, com a palavra exata do botão. O checkpoint já reconhecia "Continuar" e "Preciso de ajuda", mas o segundo caminho estava errado e faltava um terceiro.

Erro no "Preciso de ajuda": o checkpoint mandava perguntar "o que aconteceu". Só que esse botão vem antes de qualquer tentativa. Na maioria das vezes a pessoa não errou nada, ela só se sentiu insegura ao ver a mensagem. Perguntar o que aconteceu para quem não fez nada trava a conversa logo no primeiro turno, com quem já tinha levantado a mão pedindo ajuda, que é o pior público para perder.

Agora o caminho é uma pergunta de fato, com as duas respostas aproveitáveis: se já chegou a tentar entrar ou ainda não. Quem não tentou vai para a Etapa 1 com passos mais curtos. Quem tentou vai para a Etapa 2 pela mensagem de erro.

Caso que faltava: o cliente pode responder ao template escrevendo, sem tocar em botão nenhum. O checkpoint assumia que sempre viria um dos dois. Agora tem regra para tratar pelo conteúdo, com saudação e dúvida genérica indo para a Etapa 1 e relato de problema para a Etapa 2.

Também generalizei o contexto de entrada, que citava só o template de confirmação. Como existem dois templates com os mesmos botões, a descrição agora serve para os dois.

---

## Roteiro de teste

Ordem sugerida, do mais arriscado para o menos. Cada bloco testa uma coisa diferente.

### 1. Fechamento por acesso concluído

Mensagem: "consegui entrar"

Testado em 2026-07-27, passou. A IA reconheceu e encerrou curto, que é o comportamento correto: o output do Onboarding 1 é o primeiro acesso. O que ela não pode fazer é abrir assunto novo, oferecer outro produto ou anunciar o cadastro de perfil, que é da campanha seguinte.

### 2. Contaminação da base de Suporte

Mensagem: "não tô conseguindo, acho que não é pra mim"

O que observar: não pode aparecer oferta de Consultoria, formulário de reembolso, retenção ou qualquer coisa de cancelamento. Se aparecer, sobrou FAQ para desativar.

### 3. Buraco do e-mail de compra

Mensagem: "não sei qual e-mail eu usei"

O que observar: a IA não pode chutar nem afirmar um e-mail. Deve tratar como barreira e conduzir. É o cenário que ficou mais exposto por não recebermos {{email_compra}}.

### 4. Erro de acesso real

Mensagem: "aparece e-mail não cadastrado"

O que observar: se ela pede a mensagem exata, aplica a orientação da FAQ certa, uma por vez, e não despeja o protocolo inteiro de uma vez.

### 5. Separação Buscador e área de membros

Mensagem: "onde ficam os cursos?"

O que observar: tem que apontar a área de membros, e só ela. Se mandar o link do Buscador, a correção do caminho de acesso não pegou.

### 6. Gate de handoff

Mensagem: "quero falar com uma pessoa"

O que observar: não pode transferir de primeira. Deve fazer uma tentativa objetiva de ajuda e, se insistir, pedir e-mail de compra e nome completo.

### 7. Fora de escopo

Mensagem: "quero cancelar e pedir meu dinheiro de volta"

O que observar: acolhe, não manda formulário, não tenta retenção, coleta o e-mail e encaminha.

### 8. Adiamento

Mensagem: "depois eu vejo isso"

O que observar: aceita sem insistir, deixa o caminho em uma frase e encerra. Não pode repetir o pedido com outras palavras.
