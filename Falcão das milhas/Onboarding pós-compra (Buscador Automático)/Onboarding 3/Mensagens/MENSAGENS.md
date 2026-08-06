# Onboarding 3 — Mensagens

Campanha disparada pelo envio do formulário de perfil (output do Onboarding 2).
Criado em 2026-07-29. Conferido contra a produção em 2026-08-05.

Só existem duas mensagens configuradas na plataforma: a abertura de janela e o follow-up de inatividade. Todo o resto da conversa é a IA respondendo, e por isso vive no checkpoint, não aqui.

Decisão: um único follow-up, de inatividade. A retentativa de 1 hora do board, para quem não interage com o anúncio do presente, não será implementada.

---

## 1. Abertura de janela (template)

Existem duas versões aprovadas na conta. A v2 é a que vale e ainda não entrou no ar.

### v2, vigente a partir de agora

Nome na plataforma: `onbiarding_03_2` (id interno 25268, ref Meta `1709289596944299`)
Status: APROVADO. Categoria: UTILITY. Aprovado em 05/08/2026 13:52.
Momento: assim que o formulário de perfil é enviado.
Sem cabeçalho e sem rodapé.

Corpo:
```
Seu perfil no Buscador Automático foi concluído.

Um presente gratuito está disponível na sua conta
```

Botão (resposta rápida):
```
[ Ver presente ]
```

Conseguiu ser UTILITY porque saiu o hype: nada de "presente exclusivo", nada de caixa alta e nada de ênfase. O texto virou constatação de um passo concluído mais a existência de um item disponível, que é a forma que a Meta aceita.

Pendência de painel: em 05/08 às 14:39 a campanha ainda estava disparando a v1. Trocar o template da campanha para a v2. Enquanto a troca não acontecer, o asterisco continua saindo na conversa.

Ressalva de copy, para acompanhar: "disponível na sua conta" pode fazer o cliente ir procurar o presente dentro da plataforma, onde não tem nada. O presente é entregue na conversa. O checkpoint já trata isso na Seção 6, mas se aparecer volume de "entrei e não achei", o ajuste é no texto do template.

### v1, a ser substituída

Nome na plataforma: `onboarding_3` (id interno 24096, ref Meta `1588838962833447`)
Status: APROVADO. Categoria: MARKETING. Criado em 29/07/2026. 203 disparos até 05/08.

Corpo, exatamente como sai em produção:
```
Agora sim, está tudo pronto para você começar a usar o Buscador Automático...

*PRESENTE GRATUITO:* Por ter completado o seu perfil, você acaba de ganhar um presente exclusivo!
```

Botão (resposta rápida):
```
[ RESGATAR PRESENTE ]
```

Dois pontos que esta versão criou e que a v2 resolve. O asterisco: o template sai com negrito de WhatsApp, a IA espelhava a formatação e o checkpoint proíbe asterisco, o que gerou reprovação do auditor. E a categoria Marketing, que era o motivo de o fluxo não estar 100% coberto por copy de utilidade.

Alteração feita em relação ao texto do cliente, nas duas versões: saiu `{{first_name}}`, que abria a frase.

---

## 2. Follow-up de inatividade

Momento: 5 minutos sem resposta depois de a IA entregar o convite.

Corpo:
```
Deu tudo certo? Conseguiu enviar o presente para o seu amigo?
```

Botões:
```
[ SIM ]  [ Preciso de ajuda ]
```

Alteração: nenhuma. Texto do cliente.

---

## O que NÃO é mensagem configurada

As mensagens a, b e c do board, e o fechamento, são resposta da IA dentro da janela. Não são disparo e não podem ser três aberturas em sequência. O conteúdo delas foi transposto para o checkpoint:

- A ideia de presentear o amigo que ama viajar, e de que ele entra por causa do cliente, está na Etapa 2 e na Ponte da campanha.
- Os três passos (tocar no link, encaminhar a mensagem ao amigo, o amigo criar a conta gratuitamente) estão na Seção 3 e, com o texto literal, na Etapa 2.
- O envio do convite acontece pela variável `{{link_convite_amigo}}`, entregue pela IA na Etapa 2.
- O fechamento, com a sugestão de acompanhar se o amigo conseguiu acessar, está na Etapa 4.

Mudança em 05/08/2026, a partir da análise de handoff: as três mensagens da Etapa 2 viraram uma só, com o mesmo texto e na mesma ordem. O modelo gera uma resposta por turno, então na prática ele já mandava tudo junto, o auditor reprovava, tentava cinco vezes e escalava para humano. Eram 45% dos encaminhamentos da campanha, com o conteúdo certo. Uma mensagem única vale mais do que cinco tentativas barradas.

No mesmo passo saiu a abertura da antiga Mensagem 1 ("Você acabou de ganhar o direito de presentear aquele seu amigo que também ama viajar..."). O anúncio do presente já está no template de abertura, e a Etapa 1 do checkpoint não repete. O bloco agora começa em "Agora, você pode adicionar ele de graça no Buscador."

Texto original do cliente, guardado apenas como referência do que a IA precisa comunicar:

```
a) Você acabou de ganhar o direito de presentear aquele seu amigo(a) que também ama viajar...
   Agora, você pode adicionar ele(a) de graça no Buscador.
   E ele vai ter acesso às melhores passagens por causa de você!

b) Para adicionar seu amigo de graça, é bem simples.
   1) Você vai tocar no link abaixo
   2) Vai encaminhar a mensagem para o seu amigo(a)
   3) Ele vai criar a conta gratuitamente no Buscador Automático para ter acesso às passagens mais baratas

   Versão atualizada pelo cliente em 29/07/2026. A anterior, que trazia um passo de
   "responder um formulário rápido", foi descartada por ele: não existe formulário no
   caminho do amigo, ele vai direto para o cadastro.

c) Toque no botão abaixo e mande seu presente agora:
   BOTÃO: ENVIAR PRESENTE

Fechamento) Excelente! Depois, confere certinho se ele conseguiu acessar.
             Qualquer ajuda que precisar, pode me chamar aqui.
```

---

## Convite que o amigo recebe

Definido pelo cliente, entregue pelo `wa.me` por trás de `{{link_convite_amigo}}`:

```
Oi! Consegui liberar um acesso grátis ao Buscador de passagens (o app que acha voo com desconto) e pensei em você, que adora viajar!

Se você quiser entrar pra ver alguma passagem com desconto, é só criar seu acesso, rapidinho:
https://novo.buscadorautomatico.com.br/cadastro
```

---

## Ponto a confirmar

Botão em mensagem de follow-up: se a plataforma não permitir botão fora de template, os rótulos SIM e Preciso de ajuda viram texto. A lógica do checkpoint não muda, porque ele já trata a fala do cliente e não só o clique.
