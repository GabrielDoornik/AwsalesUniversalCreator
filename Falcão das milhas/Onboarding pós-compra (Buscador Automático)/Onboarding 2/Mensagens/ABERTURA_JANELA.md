# Onboarding 2 — Abertura de janela

Campanha: Onboarding 2, cadastro do perfil de viagens.
Disparo: quando o cliente concluir o Onboarding 1, ou pelo evento de primeiro acesso quando ele existir.
Objetivo do template: fazer o cliente tocar, para abrir a janela de 24 horas e a IA poder entregar o formulário.

---

## Regra técnica, a mesma do Onboarding 1

Sem link no template. Botão de URL não devolve mensagem e não abre a janela, então o cliente sairia da conversa e a IA nunca falaria com ele. Só resposta rápida abre janela.

O formulário é entregue pela IA na primeira mensagem nativa, já dentro da janela.

---

## Template — Abertura

Categoria Meta: UTILITY
Nome sugerido: `falcao_onboarding2_cadastro_perfil`

Cabeçalho (texto):
```
Cadastro de perfil pendente
```

Corpo:
```
Olá, tudo bem?

Sua conta no Buscador Automático já está criada, mas o cadastro do seu perfil de viagens ainda não foi preenchido.

É o passo que falta para concluir seu cadastro. São algumas perguntas sobre o seu jeito de viajar e leva cerca de cinco minutos.

Toque em Continuar que eu te envio o formulário.
```

Rodapé:
```
Passo necessário para concluir seu cadastro
```

Botões (resposta rápida):
```
[ Continuar ]  [ Preciso de ajuda ]
```

Sem variável e sem parâmetro. Texto puro.

---

## Decisões deste texto

Cabeçalho e rodapé mantidos. Foi o que faltava no follow-up do Onboarding 1 que caiu em Marketing. O rodapé é o sinal mais explícito de Utility que existe no template.

Corpo puramente procedural. Conta já criada, cadastro pendente, este é o passo que falta. Nenhuma menção a passagem barata, economia, oportunidade ou vantagem. Foi exatamente esse tipo de frase que derrubou o outro template.

Os cinco minutos aparecem já no template, de propósito. O formulário tem dezesseis perguntas, e o pior cenário não é a pessoa não tocar: é ela tocar, abrir, chegar na pergunta oito e abandonar. Aí ela fica num limbo em que o sistema não sabe quem parou no meio, porque os campos de identificação estão no fim. Alinhar a expectativa na porta custa alguns toques e salva preenchimentos.

Dois botões, como no Onboarding 1. Quem toca em "Preciso de ajuda" abre a janela do mesmo jeito e já sinaliza que tem uma trava.

---

## Se cair em Marketing

Nesta ordem: trocar "sobre o seu jeito de viajar" por "sobre suas viagens"; tirar o segundo botão; encurtar para três linhas cortando a estimativa de tempo, que passa a ser dita pela IA dentro da conversa.

---

## Template — Follow-up de perfil pendente

Categoria Meta: UTILITY
Nome sugerido: `falcao_onboarding2_perfil_pendente`
Momento: quando o cliente não interagiu com a abertura, ou interagiu e não preencheu, e a janela de 24 horas já fechou.

Cabeçalho (texto):
```
Perfil de viagens pendente
```

Corpo:
```
Olá, tudo bem?

Passando para lembrar: o cadastro do perfil de viagens do seu Buscador Automático continua pendente.

São dezesseis perguntas de múltipla escolha, leva cerca de cinco minutos, e é o que falta para concluir seu cadastro.

Toque em Continuar que eu te envio o formulário.
```

Rodapé:
```
Passo necessário para concluir seu cadastro
```

Botões (resposta rápida):
```
[ Continuar ]  [ Preciso de ajuda ]
```

### O que mudou em relação ao texto do cliente

O cliente escreveu dois templates encadeados, a e b, com o botão no segundo. Na AWSales isso vira um template só, com o botão nele.

Quatro coisas saíram, e três delas pelo mesmo motivo que derrubou o follow-up do Onboarding 1 em Marketing:

"acesso as passagens baratas que o Buscador mostra" e "finalmente ver as passagens que você precisa com desconto" são linguagem de benefício. Utility precisa ser instrução seca sobre um passo pendente de algo que a pessoa já comprou. Foi exatamente esse tipo de frase que causou a reclassificação da outra campanha.

"Te prometo que é bem rápido" foi trocado pelo número real. São dezesseis perguntas e cerca de cinco minutos. Minimizar aumenta o abandono no meio do formulário, que é pior do que a pessoa adiar e preencher inteiro depois, porque quem para no meio não fica registrado.

"e por isso, você não conseguiu acessar o Buscador" saiu porque provavelmente é falso para este público. Quem está nesta campanha já criou a conta e já entrou; é justamente por isso que ele chegou aqui. Afirmar que ele não conseguiu acessar erra na cara de quem está dentro. Se o cliente confirmar que o Buscador realmente trava sem o perfil preenchido, dá para reintroduzir a ideia, mas com a formulação correta, algo como "para liberar o uso completo".

A variável `{{first_name}}` saiu. Templates desta operação vão sem variável.

### Atenção na submissão

Este template é parecido com o de abertura da mesma campanha, e a Meta reprova duplicata. As diferenças que sustentam os dois são o cabeçalho, a formulação de pendência que continua, e a menção ao número de perguntas. Se um dos dois voltar como duplicado, o caminho é encurtar a abertura e deixar o número de perguntas só no follow-up.

---

## Follow-up dentro da janela

Não é template. Se o cliente respondeu alguma coisa nas últimas 24 horas e depois sumiu, a retomada é mensagem nativa, gerada pelo Follow-Up Inteligente.

Ainda não configurado. As orientações dos três campos do painel ficam em `MENSAGENS_FOLLOWUP.md` quando forem escritas.
