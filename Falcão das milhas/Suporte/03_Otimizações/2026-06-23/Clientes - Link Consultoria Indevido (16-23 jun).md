# Clientes que receberam o link da Consultoria de Retenção — 16 a 23 jun 2026

Base: 55 mensagens de saída da IA (número 5531953471689) contendo a URL `https://emeo1uhrjwf.typeform.com/to/SMEYLynR` (valor resolvido de `{{link_consultoria_retencao}}`), no período de 16/06 a 23/06/2026.

Total de clientes únicos: 50 (5 clientes receberam 2 mensagens cada).

## Conclusão

O bug foi generalizado. Na esmagadora maioria dos casos a IA apresentou a Consultoria e enviou o link na mesma mensagem, sem o cliente confirmar a contratação — exatamente o comportamento corrigido no checkpoint em 23/06. Só uma minoria mostra sinal de que o cliente pediu/aceitou antes.

## Grupo A — Envio indevido (link junto da oferta, sem confirmação) — disparo recomendado

41 clientes. São os que receberam o link empurrado dentro da oferta, em contexto de frustração, dúvida de uso, cotação, renovação ou cancelamento, sem terem confirmado que queriam a Consultoria.

5511944481201
5511994306551
5521982839628
5521999999863
5566984318566
5547999165757
5519991904013
5584999842015
5511976579561
5592984039077
5511946042098
5511994024404
5521998911968
5521979625657
5551999944555
5521982323987
5511956557984
5512981234082
5545998022525
5512996079110
5532984054084
5532998285099
5571988941301
5521987236761
5521975860206
5551996905999
5554996497661
5547999978421
5541984178494
5511984438000
5521979738576
5567991427257
5591981231939
5521988003691
5551999506584
5531986730912
5541999369990
5541998999058
5537988020264
5547984023249
5592981361404

Observação: 5592981361404 é o caso do print original que a Nicole enviou ("Como você não tem milhas... é por aqui").

## Grupo B — Provável pedido/aceite do cliente (revisar antes; talvez NÃO disparar)

4 clientes. A mensagem indica que o cliente já tinha pedido ou aceitado a Consultoria ("Claro...", "Segue o acesso...", "próximo passo... agendamento"). Esses entenderam o que estavam recebendo; disparar pode confundir.

5511993186046 (16/06, "Agora o próximo passo... organizar sua consultoria... agendamento")
5511982040833 (20/06, "Claro. A consultoria de retenção é por aqui")
5514981330250 (22/06, "Segue o acesso da consultoria gratuita de retenção")
5531991579005 (21/06, "Claro. Vamos tentar... sessão de 1 hora... pra seguir com o agendamento")

## Grupo C — Link "seco" sem contexto na mensagem (verificar transcrição completa)

5 clientes. A mensagem é só "preenche por aqui: link" ou o link sozinho. Pode ser continuação de uma conversa em que o cliente pediu, ou pode ser envio indevido. Conferir a transcrição completa antes de decidir.

5534991037700
5551999048494
5562984103000
5585986209031
5562999272088

## Casos sensíveis — tratar com cuidado no disparo (estão no Grupo A)

- 5547999165757 — contexto de luto ("Sinto muito... força pra vocês nesse momento").
- 5567991427257 — contexto de desemprego ("Perdi o emprego"). Atenção: nessa conversa a IA expôs o e-mail do cliente (danieloshiro@me.com) no texto da mensagem.

## Alerta sobre o conteúdo do disparo

A mensagem que a Nicole quer enviar afirma que "ao optar pela Consultoria, o cliente abre mão da solicitação de reembolso". Confirmar com o cliente se essa é a regra real antes de disparar:

- Dentro de 7 dias é direito de arrependimento do CDC; afirmar que a pessoa "abriu mão do reembolso" pode ser contestável.
- O próprio checkpoint instrui a IA a não confirmar elegibilidade de prazo — o disparo não deveria afirmar o que a IA tem ordem de não afirmar.

Sugestão de enquadramento mais seguro: esclarecer que a Consultoria gratuita é uma alternativa do processo de retenção e que, se a intenção ainda for reembolso, é só seguir pelo canal de reembolso normalmente. Sem cravar que perdeu o direito.
