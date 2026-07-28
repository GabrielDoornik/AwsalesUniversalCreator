# Mensagens de Disparo — Onboarding 1 (Nuestra RX · Pedido aprovado pelo médico)

Idioma: espanhol neutro latino-americano. Abertura sem emoji (template HSM). Sem variável {{nome}}.
Dispara no evento de aprovação do médico (`rx_written`). Foco: dar a boa notícia da aprovação e
avisar que o código de rastreio chega em até 24 horas. Fecha em afirmação, sem induzir pergunta.

---

## Abertura de janela (HSM — dispara quando o médico aprova)

¡Felicidades! Tu receta ya fue aprobada por el médico.

Tu tratamiento entra ahora en preparación en la farmacia. En un máximo de 24 horas te envío el código de rastreo para que puedas seguir tu pedido.

Cualquier duda mientras tanto, estoy aquí para acompañarte.

---

## Follow-up (se o lead não responder)

Hola, paso para avisarte que tu tratamiento sigue su curso después de la aprobación.

En cuanto la farmacia lo despache, te envío el código de rastreo. Aquí estoy si surge cualquier duda.

---

## Alternativa: Follow-Up Inteligente

Esta campanha pode usar o Follow-Up Inteligente da plataforma no lugar do FUP estático. Se optar,
as orientações dos 3 campos vão num `MENSAGENS_FOLLOWUP.md` e NÃO no checkpoint. Me avisa que eu
preparo.
