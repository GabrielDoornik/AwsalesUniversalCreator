# Templates Meta (HSM) — FUPs das campanhas Nuestra RX

Estes templates só REABREM a janela de 24h quando o lead sumiu. É recuperação para VENDER:
formulário para vender, checkout para vender. Nada de passividade.

## Onde mora o cupom (regra dura da conta US)

Template Utility do Meta NÃO pode ter desconto/cupom (isso é Marketing, e a conta US só aprova
Utility). Então:
- CUPOM (TIRZE3 / SEMA3) = arma da CONVERSA livre (FUP inteligente), que dispara com a janela
  aberta. Ver `MENSAGENS_FOLLOWUP.md` de cada campanha.
- TEMPLATE = reabre a janela vendendo com o que Utility PERMITE: valor já incluído no pedido,
  risco zero e urgência real da reserva. Cada FUP é uma alavanca diferente, não a mesma coisa
  reescrita.
- Se conseguir aprovar 1 template Marketing, o cupom vira um FUP de Marketing; enquanto não,
  ele fica na conversa.

## Alavancas por FUP (a escada de venda)

1. Momentum: está a um passo, é rápido, fecha agora.
2. Risco zero / reframe: mata o medo (só paga se o médico aprovar + garantia; biologia).
3. Urgência real: a reserva/avaliação vence; agir agora ou perder o progresso e o valor incluído.

Regras: sem emoji, sem reapresentação (a abertura já foi enviada), continuação do fio, CTA
isolado, botão de resposta rápida. Nome: `nrx_[campanha]_fup[n]_[angulo]`.

---

## Recuperação de Vendas — recuperar o checkout para VENDER

ATUALIZAÇÃO 16/07 (pedido do cliente — comunicação de PRÉ-AUTORIZAÇÃO): parar de comunicar "$0 / no
pagas nada" (leads entendendo que o tratamento é grátis). Nova narrativa: consulta/envio/acompanhamento
grátis; paga-se só a medicação; no checkout há uma pré-autorização que só se confirma se o médico
aprovar (senão, libera). Os templates fup2 e fup3 abaixo foram REESCRITOS e precisam de NOVA APROVAÇÃO
Meta (utility). O fup3 antigo ("tu reserva está por vencer... empezar de cero") está PROIBIDO: escassez
inventada, foi a 18 leads entre 03-10/07 — não reaprovar nem reutilizar.

Abertura atual (ref.): "Hola, tu tratamiento en Nuestra RX quedó reservado y a un paso de terminar.
Ahora no pagas nada; solo se cobra si el médico aprueba tu receta. ¿Damos el último paso?"

Abertura NOVA proposta (submeter à aprovação Meta; substitui a atual quando aprovada):
```
Hola, tu tratamiento en Nuestra RX quedó reservado y a un paso de terminar.

La consulta médica es gratis; solo pagas la medicación si el médico aprueba tu receta.

¿Damos el último paso?
```

### nrx_venta_fup1_confirmar  (Utility — momentum; sem mudança, segue aprovado)
```
Hola, tu tratamiento sigue reservado y a un solo paso de quedar confirmado.

Es cuestión de un minuto terminar y aseguras tu lugar.

¿Lo confirmamos ahora?
```

### nrx_venta_fup2_sinriesgo_v2  (Utility — risco zero; REESCRITO 16/07, submeter à aprovação)
```
Sé que dar el paso da respeto, así que tranquilo: la consulta es gratis y el valor solo se confirma si un médico aprueba tu receta; si no, se libera.

Tu tratamiento sigue reservado a tu nombre.

¿Lo dejamos confirmado hoy?
```

### nrx_venta_fup3_progreso  (Utility — progresso real; SUBSTITUI o fup3_vence proibido, submeter à aprovação)
```
Tu evaluación ya quedó completa y tu tratamiento sigue reservado; solo falta confirmar.

En cuanto lo confirmes, el médico revisa tu caso, normalmente en menos de 24 horas.

¿Lo dejamos listo?
```

---

## Abandono — recuperar o formulário para VENDER

Abertura já enviada (ref.): "Hola, vi que empezaste tu evaluación en Nuestra RX y no llegaste a
terminarla... ¿Quieres que te explique cómo funciona la evaluación?"

### nrx_aband_fup1_retomar  (Utility — momentum)
```
Hola, tu evaluación quedó a un paso de terminar y sigue justo donde la dejaste.

Retomarla toma un par de minutos.

¿La terminamos ahora?
```

### nrx_aband_fup2_sinriesgo  (Utility — JÁ APROVADO, usar este)
```
Sigo por aquí para ayudarte a terminar tu evaluación.

La revisa un médico con licencia y solo pagas el tratamiento si él lo aprueba.

¿La retomamos donde quedó?
```
Nota: já aprovado como Utility. Torna desnecessários o antigo nrx_aband_fup2_reframe (Marketing) e o nrx_aband_fup2_pendiente. O reframe de biologia vai na conversa, não no template.

### nrx_aband_fup3_vence  (Utility — urgência + valor)
```
Tu evaluación sigue guardada, pero no queda abierta indefinidamente.

Si la terminas hoy, un médico revisa tu caso y desbloqueas tu tratamiento con la consulta incluida sin costo.

¿La dejamos lista ahora?
```

---

## Receptiva — levar o lead à avaliação para VENDER

Sem abertura de janela (o lead inicia). Estes só entram para REABRIR quando o lead sumiu.

### nrx_recep_fup1_pendiente  (Utility — nome novo; substitui nrx_recep_fup1_seguir)
```
Hola, quedó pendiente continuar con tu evaluación.

Son unos minutos y la revisa un médico con licencia.

¿Te comparto el enlace para seguir?
```

### nrx_recep_fup2_proceso  (Utility — nome novo; substitui nrx_recep_fup2_reframe)
```
Hola, sigue pendiente tu evaluación con nosotros.

La hace un médico con licencia y solo se cobra el tratamiento si él lo aprueba.

¿La retomamos hoy?
```

### nrx_recep_fup3_incompleta  (Utility — nome novo; substitui nrx_recep_fup3_ahora)
```
Hola, tu evaluación quedó sin completar.

Cuando quieras, un médico con licencia revisa tu caso y te dice si aplicas.

¿Seguimos con ella?
```

Nota Receptiva: como o lead frio não tem uma transação pendente clara, o Meta pode insistir em
Marketing mesmo assim. Estas versões ancoram na avaliação pendente e tiram gancho de oferta para
dar a melhor chance de Utility; se ainda cair em Marketing, é estrutural (lead sem transação) e
aceitamos Marketing nesses três.

---

## Mapa rápido (todos Utility, idioma es)

| Nome do modelo | Campanha | FUP | Alavanca |
|---|---|---|---|
| nrx_venta_fup1_confirmar | Vendas | 1 | momentum |
| nrx_venta_fup2_sinriesgo | Vendas | 2 | risco zero |
| nrx_venta_fup3_vence | Vendas | 3 | urgência real |
| nrx_aband_fup1_retomar | Abandono | 1 | momentum |
| nrx_aband_fup2_sinriesgo | Abandono | 2 | risco zero (já aprovado) |
| nrx_aband_fup3_vence | Abandono | 3 | urgência |
| nrx_recep_fup1_pendiente | Receptiva | 1 | pendiente |
| nrx_recep_fup2_proceso | Receptiva | 2 | proceso |
| nrx_recep_fup3_incompleta | Receptiva | 3 | incompleta |

O cupom NÃO está aqui de propósito (Utility não permite). Ele é o fechamento da CONVERSA.
