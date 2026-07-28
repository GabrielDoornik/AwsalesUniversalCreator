# Mensagens de Disparo — Onboarding 3 (Nuestra RX · Pedido entregue / início do tratamento)

Idioma: espanhol neutro latino-americano. Abertura sem emoji (template HSM). Sem variável {{nome}}.
Dispara no evento de entrega (`order_delivered`). Foco: confirmar que chegou, reforçar refrigerar
JÁ e abrir a janela perguntando se o lead quer acompanhamento para começar.

> REGRA DE PLATAFORMA: o template de abertura (HSM) não interpola variáveis. Por isso a abertura
> não usa nome nem dado do metadata; ela confirma a entrega, manda refrigerar e PERGUNTA se o lead
> quer ser acompanhado, para induzir a resposta e abrir a janela. Assim que o lead responde, o
> Juan (conserje) conduz a aplicação um passo de cada vez, conforme o checkpoint.

---

## Abertura de janela (HSM — dispara quando a transportadora confirma a entrega)

Sem variável. Termina com pergunta de propósito (pra abrir a janela).

¡Tu tratamiento de Nuestra RX ya llegó! Lo primero: guárdalo en el refrigerador apenas lo tengas en casa.

Si quieres, te acompaño paso a paso para empezar con calma y sin dudas. ¿Te ayudo?

---

## Follow-up (se o lead não responder à abertura)

Hola, paso para saber si tu tratamiento llegó bien y si ya lo guardaste en el refrigerador.

Cuando quieras, te acompaño para empezar con tranquilidad. Aquí estoy.

---

## Alternativa: Follow-Up Inteligente

Esta campanha pode usar o Follow-Up Inteligente da plataforma no lugar do FUP estático. Se optar,
as orientações dos 3 campos vão num `MENSAGENS_FOLLOWUP.md` e NÃO no checkpoint. Me avisa que eu
preparo.
