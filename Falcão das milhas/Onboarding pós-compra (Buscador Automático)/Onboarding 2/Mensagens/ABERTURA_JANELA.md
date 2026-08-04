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

É bem rápido e é o que falta para concluir seu cadastro. São algumas perguntas para a equipe entender o seu perfil de viagem.

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

Texto do cliente, sem cabeçalho e sem rodapé.

Corpo:
```
Vi que você ainda não completou seu perfil... e por isso, você não conseguiu acessar o Buscador.

Essa etapa é mais simples do que parece, e é importante para você ter acesso as passagens baratas que o Buscador mostra.

Te prometo que é bem rápido!

Consegue terminar agora de responder rapidinho as perguntas para você finalmente ver as passagens que você precisa com desconto?
```

Botão (resposta rápida):
```
[ COMPLETAR MEU PERFIL ]
```

### Única alteração no texto do cliente

Saiu `{{first_name}}`, que abria a primeira frase. Nada mais foi tocado.

O cliente escreveu dois textos encadeados, a e b. Viraram um template só, porque o botão vive no segundo e cada template é uma mensagem.

### Riscos conhecidos, mantidos por decisão do cliente

"Passagens baratas", "finalmente ver as passagens que você precisa com desconto" e "acesso as passagens" são linguagem de benefício. É o que mais pesa para a Meta classificar como Marketing em vez de Utility, e foi por aí que o follow-up do Onboarding 1 caiu. Se este voltar reprovado, começar removendo essas expressões.

"E por isso, você não conseguiu acessar o Buscador" é uma afirmação sobre o cliente. Ela se sustenta se o Buscador realmente ficar bloqueado sem o perfil preenchido, o que a tela de abertura do formulário sugere ao dizer que a pessoa preenche para ser direcionada ao Buscador. Confirmar com o cliente. Se o bloqueio não for real, a frase erra na cara de quem já está usando a plataforma.

O botão precisa ser resposta rápida, nunca URL. Botão de URL não devolve mensagem, não abre a janela e a IA nunca entra na conversa para mandar o formulário.

O texto do cliente traz "acesso as passagens" sem crase. Correção opcional, não alterei.

---

## Follow-up dentro da janela

Não é template. Se o cliente respondeu alguma coisa nas últimas 24 horas e depois sumiu, a retomada é mensagem nativa, gerada pelo Follow-Up Inteligente.

Ainda não configurado. As orientações dos três campos do painel ficam em `MENSAGENS_FOLLOWUP.md` quando forem escritas.
