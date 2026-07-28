# Mensagens de Disparo — Onboarding 2 (Nuestra RX · Pedido despachado / rastreio)

Idioma: espanhol neutro latino-americano. Abertura sem emoji (template HSM). Sem variável {{nome}}.
Dispara no evento de despacho (`order_shipped`).

> REGRA DE PLATAFORMA: o template de abertura (HSM) NÃO interpola as variáveis de rastreio. Por
> isso a abertura NÃO manda o código. Ela anuncia o despacho e PERGUNTA se o lead quer o rastreio,
> para induzir a resposta e abrir a janela. Assim que o lead responde, a IA manda o código de
> rastreio numa mensagem normal da conversa (aí sim consegue usar o metadata). Diferente das outras
> campanhas, aqui a abertura PRECISA induzir resposta.

---

## Abertura de janela (HSM — dispara quando a farmácia despacha)

Sem variável. Termina com pergunta de propósito (pra abrir a janela).

¡Buenas noticias! Tu pedido ya fue despachado y va en camino.

¿Quieres que te pase el código de rastreo para seguir tu envío?

---

## Resposta de entrega do rastreio (NÃO é disparo — a IA gera na conversa após o lead responder)

Quando o lead responde que sim, a IA manda o rastreio usando as variáveis do evento (confirmadas
no payload `order_shipped`). Modelo de referência:

¡Perfecto! Aquí tienes tu rastreo:

Código: {{metadata.tracking_number}}
Transportadora: {{metadata.carrier}}
Sigue tu paquete aquí: {{metadata.tracking_url}}

Llega refrigerado en 3 a 5 días hábiles. Cuando lo recibas, guárdalo de inmediato en el refrigerador. Cualquier duda, estoy aquí.

---

## Follow-up (se o lead não responder à abertura)

Hola, paso para avisarte que tu pedido ya está en camino.

¿Te gustaría que te pase el código de rastreo para seguir tu envío?

---

## Alternativa: Follow-Up Inteligente

Pode usar o Follow-Up Inteligente da plataforma no lugar do FUP estático. Se optar, as orientações
dos 3 campos vão num `MENSAGENS_FOLLOWUP.md` e NÃO no checkpoint. Me avisa que eu preparo.
