# Configuração das Tools Calendly - IA Comercial (Paulo Aguiar)

Apenas os campos de texto que a IA preenche. Os dropdowns de tipo de evento/agenda o CS seleciona manualmente.

---

## 1. Buscar eventos de um usuário especifico (@getLeadScheduledEvents)

Qual o e-mail do usuário a ser buscado?
```
Pergunte ao lead qual e-mail ele usou para agendar a Sessão Individual. Use esse e-mail para buscar os eventos dele.
```

---

## 2. Consultar disponibilidade (@checkAvailability)

Qual a data/hora inicial do período de busca da disponibilidade?
```
Use a data e hora atuais como ponto de partida. Busque apenas horários futuros.
```

Qual a data/hora final do período de busca da disponibilidade?
```
Busque até 5 dias úteis à frente a partir da data atual. Se o lead indicar preferência por uma data específica, ajuste o período para incluir essa data.
```

---

## 3. Criar evento (@createScheduledEvent)

Qual será a data/hora de início do evento?
```
Use a data e horário que o lead escolheu entre as opções disponíveis retornadas por @checkAvailability.
```

Qual o nome do usuário?
```
Use o nome que o lead informou durante a conversa. Se o lead não informou, pergunte antes de criar o evento.
```

Qual o e-mail do usuário?
```
Use o e-mail que o lead informou durante a conversa. Se o lead não informou, pergunte antes de criar o evento.
```

---

## 4. Cancelar evento (@cancelScheduledEvent)

Qual o motivo do cancelamento?
```
Resuma em uma frase o motivo real que o lead deu para o cancelamento durante a conversa. Ex: "Lead informou que não tem interesse na sessão" ou "Lead pediu reagendamento para outro horário".
```
