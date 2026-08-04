# Onboarding 3 — Mensagens

Campanha disparada pelo envio do formulário de perfil (output do Onboarding 2).
Data: 2026-07-29.

Só existem duas mensagens configuradas na plataforma: a abertura de janela e o follow-up de inatividade. Todo o resto da conversa é a IA respondendo, e por isso vive no checkpoint, não aqui.

Decisão: um único follow-up, de inatividade. A retentativa de 1 hora do board, para quem não interage com o anúncio do presente, não será implementada.

---

## 1. Abertura de janela (template)

Nome sugerido: `falcao_onboarding3_presente`
Momento: assim que o formulário de perfil é enviado.
Sem cabeçalho e sem rodapé.

Corpo:
```
Agora sim, está tudo pronto para você começar a usar o Buscador Automático...

PRESENTE GRATUITO: Por ter completado o seu perfil, você acaba de ganhar um presente exclusivo!
```

Botão (resposta rápida):
```
[ RESGATAR MEU PRESENTE ]
```

Alteração em relação ao texto do cliente: saiu `{{first_name}}`, que abria a frase.

Atenção na categoria: este texto quase certamente será classificado como MARKETING, não UTILITY. Anúncio de presente e brinde é promoção por definição, e não é um passo pendente de uma transação. Submeter direto como Marketing evita uma rodada perdida de reprovação. Insistir em Utility exigiria descaracterizar o texto que o cliente pediu.

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
