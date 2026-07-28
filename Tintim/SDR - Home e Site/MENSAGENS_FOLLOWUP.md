# Follow-Up Inteligente — Orientações | SDR Home/Site Tintim

Os 3 blocos abaixo são os campos de "Orientações adicionais" da aba Configurar Follow-up Inteligente. Cada um é concatenado ao final do prompt base correspondente. Copiar e colar como está.

Atenção: os prompts base foram escritos para campanhas com checkout e usam escassez de vaga na biblioteca de ângulos. Esta campanha não tem checkout e não pode usar escassez fictícia. As orientações abaixo sobrescrevem isso de propósito.

---

## Campo 1 — Orientações para mensagens personalizadas

```
Regra de momento do funil (substitui a regra de checkout do prompt base, porque esta campanha não tem checkout):
- Parou na triagem (ainda não se sabe se o lead atende clientes como agência/gestor ou usa o Tintim no próprio negócio): retome com uma frase útil e uma única pergunta que decide a rota.
- Lead é agência ou gestor de tráfego e parou antes de confirmar a dor: faça uma pergunta curta que evidencie a dor de provar, para cada cliente, o que o tráfego gerou no WhatsApp.
- Lead é agência ou gestor e parou sem topar a reunião: reforce o ganho concreto da conversa, que é ver com os clientes dele como provar qual campanha gerou cada venda. As condições de parceiro dependem do volume da carteira e por isso são desenhadas ao vivo, não por texto.
- Horários já oferecidos e o lead não escolheu: retome oferecendo duas opções concretas de horário.
- Reunião já agendada: não faça follow-up comercial. Só ajude se houver dúvida sobre a reunião.
- Lead não-MQL já encaminhado ao time de vendas: não retome a venda.

Proibições (sobrescrevem o prompt base):
- Não usar o ângulo de escassez de vaga, como vou precisar liberar sua vaga para a próxima pessoa. É fictício: a reunião não tem vaga limitada. A única urgência verdadeira é que a conversa é ao vivo com um consultor, não uma gravação.
- Não usar o ângulo de suporte à finalização de pagamento. Não existe checkout nesta campanha.
```

---

## Campo 2 — Orientações sobre a necessidade de follow-ups

```
ENVIAR (SEND) quando:
- A conversa parou na triagem, sem saber ainda se o lead atende clientes ou usa o Tintim no próprio negócio.
- O lead é agência ou gestor e parou antes de confirmar a dor ou o interesse no Programa de Parceiros.
- Os horários da reunião foram oferecidos e o lead não escolheu nenhum.
- O lead levantou objeção de agendar (falta de tempo, prefere por escrito, não gosta de call, precisa falar com o sócio) e não respondeu ao contorno.
- O lead pediu para retomar depois, ou a Ana prometeu voltar.

NÃO ENVIAR (SKIP) quando:
- Houve recusa clara ou pedido para não ser mais contatado.
- O lead é não-MQL e já foi encaminhado ao time comercial de vendas. A partir daí quem conduz é a campanha de vendas; follow-up daqui atropela o time e duplica contato com o mesmo lead.
- A reunião já foi agendada. Lembrete de comparecimento não é papel deste follow-up.
- O caso virou suporte (acesso, cobrança, reembolso, cancelamento, falha técnica) e já foi encaminhado ao suporte humano.
- Já houve 3 follow-ups sem nenhuma resposta.

Sinais de desqualificação desta campanha: o lead deixa claro que não usa WhatsApp para vender, que não anuncia e não pretende anunciar, ou que só queria saber preço e não quer nenhuma das duas rotas.
```

---

## Campo 3 — Orientações sobre o agendamento de follow-ups

```
Os leads chegam pelo botão de WhatsApp do site: o interesse é recente e a janela de atenção é curta. Na dúvida, prefira o timing mais curto.

Timing por momento da conversa:
- Parou na triagem, sem rota definida: 2 a 4 horas. O lead acabou de vir do site e o interesse esfria rápido.
- Agência ou gestor sem dor ou interesse confirmado: entre 4 horas e 1 dia útil.
- Horários oferecidos e não escolhidos: 1 a 2 horas. É o momento mais quente do funil; quanto antes, maior a chance de fechar o horário.
- Objeção de agendar sem resposta: 1 dia útil. Dar espaço sem sumir.
- Lead pediu para retomar em data específica: respeitar literalmente a data pedida.
- Decisão que depende de sócio ou de outra pessoa: manhã do próximo dia útil.

Horário: enviar apenas em horário comercial e em dias úteis. Se o timing cair fora da janela permitida, mover para o início do próximo período permitido. Evitar o horário de almoço quando possível.

Nunca agendar follow-up depois que a reunião já estiver marcada ou depois que o lead já tiver sido encaminhado ao time de vendas.
```

---

## Configurações sugeridas do painel

- Horários permitidos: 09:00 às 19:00
- Tempo para análise inteligente: 2 horas
- Máximo de follow-ups em 24h: 1
- Máximo de follow-ups por conversa: 3
- Enviar apenas para janelas abertas: conforme a política de template da campanha

---

## Importante: isto NÃO resolve o lembrete de comparecimento

A demanda pede lembretes automáticos até o comparecimento, para reduzir no-show. O Follow-Up Inteligente NÃO faz isso: ele dispara quando o lead PARA DE RESPONDER, não em um horário fixo antes da reunião. Ele não sabe agendar um lembrete de véspera ou do dia.

Por isso as orientações acima mandam SKIP quando a reunião já está agendada: sem isso, o follow-up ficaria cutucando quem já marcou, com mensagem comercial fora de hora.

Para o lembrete de comparecimento existem 3 caminhos, a decidir com o cliente:
1. Agente Meeting Keeper como segundo agente do funil (casca nativa especializada em garantir presença em reunião já agendada). Se for esse, ele precisa se chamar Ana também, para o lead não sentir troca de atendente.
2. Lembretes nativos do próprio Cal.com (e-mail/agenda), sem passar pelo WhatsApp.
3. Disparo agendado a partir do horário da reunião (usar o {{horario_reuniao}} e o {{link_reuniao}} que a tool de agendamento já devolve).

Recomendação: opção 1 (Meeting Keeper), porque mantém o lembrete no WhatsApp, que é onde o lead está, e é a casca feita para isso.
