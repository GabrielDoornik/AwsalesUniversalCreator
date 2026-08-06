# Ações na plataforma — otimização de 05/08/2026

O que não se resolve editando arquivo. Cada item traz o valor exato para colar e o motivo, para não precisar reabrir a task.

Verificado no banco em 05/08/2026. Ids de campanha no NEO (db 7): Suporte `ffbc47ff-425b-4027-a23f-ec0ee5ec8c73`, Onb1 `b46abedb-0e64-40f0-b778-623902574555`, Onb2 `4814732e-276c-402b-93cf-416934c08cbe`, Onb3 `e071f730-044f-472d-8775-f193d6ce2e4c`.

---

## 1. Trocar o template de abertura da Onboarding 3

Apontar a campanha para `onbiarding_03_2` (id interno 25268), aprovado hoje às 13:52 como UTILITY.

Em 05/08 às 14:39 a campanha ainda disparava o `onboarding_3` (id 24096, marketing, com `*PRESENTE GRATUITO:*`). O 25268 nunca disparou: zero mensagens.

Isso encerra o item 9 da task sem reenviar nada para a Meta. O asterisco estava no template, não na IA, e o template novo não tem asterisco nem caixa alta.

---

## 2. Criar a variável do formulário de perfil em duas campanhas

Nome: `link_formulario_perfil`
Valor: `https://rebrand.ly/buscador-perfil`

Onde criar:

- Suporte. Hoje a campanha tem cinco variáveis e nenhuma delas é o formulário de perfil. O checkpoint atualizado já usa `{{link_formulario_perfil}}` na Seção 2, na Seção 5 e no rodapé, então sem a variável cadastrada a instrução fica sem destino.
- Onboarding 3. Mesmo caso, usada na Seção 2 e no roteador.

A Onboarding 2 já tem a variável cadastrada com esse valor exato. Não mexer.

Por que isso resolve os 10 tickets do item 4: o cliente pedia o formulário de perfil ao Suporte, o Suporte não tinha esse link em variável, checkpoint nem base, e em dois casos a IA mandou `{{link_formulario_reembolso}}` afirmando ser o cadastro de perfil. Os dois formulários são Typeform da mesma conta, e o de reembolso era o único que ela tinha na mão.

---

## 3. Cadastrar `Nome_do_agente` na Onboarding 2 e na Onboarding 3

Nome: `Nome_do_agente`
Valor: `Nicole`

Este é provavelmente o achado mais sério da rodada, e ele não estava na task.

Os checkpoints da Onb2 e da Onb3 referenciam `{{Nome_do_agente}}` na primeira linha, em "Você é {{Nome_do_agente}}, assistente do Buscador Automático". Só que as duas campanhas têm cadastrada a variável `agent_name`, não `Nome_do_agente`. A Onboarding 1 tem as duas e funciona.

Ou seja: nas duas campanhas com volume, a IA lê uma variável que não resolve e fica sem nome. É a explicação mais provável para o I2, a IA que se apresentou como "Jéssica, designer de interiores" na Onboarding 2. Não é contaminação de prompt entre organizações: é um campo vazio que o modelo preencheu sozinho.

Cadastrar `Nome_do_agente` é preferível a reescrever o checkpoint para `{{agent_name}}`, porque alinha as três campanhas com a Onb1 e não muda artefato nenhum.

Confirmar depois de cadastrar: abrir uma conversa nova da Onb2 e checar se a IA se apresenta como Nicole.

---

## 4. Fixar os cinco valores do rótulo de handoff no Suporte

No gatilho personalizado da campanha de Suporte, hoje único e com rótulo em texto livre:

```
id:     custom_3oqw4ery6
name:   Cancelamento, reembolso e financeiro
status: HANDOFF
```

Valores a fixar:

```
CANCELAMENTO
REEMBOLSO
ESTORNO_CONTESTACAO
STATUS_PEDIDO
COBRANCA_DUPLICIDADE
```

Não é bug: o campo é livre e a IA nomeia pela condição que disparou, o que gerou 24 rótulos diferentes para 52 tickets do mesmo gatilho. Não reduz volume, só faz o painel mostrar um problema em vez de 24.

---

## 5. Copiar o gatilho personalizado para a Onb2 e a Onb3

As duas campanhas têm `custom_triggers: []`, confirmado no banco. Os checkpoints já mandam a coisa certa (acolher, coletar e-mail, encaminhar sem tentar retenção), mas sem o gatilho o caso não vai para fila própria.

Copiar o gatilho do Suporte, com fila própria para cada campanha. O prompt pode ser o mesmo:

```
Lead pede cancelamento, reembolso ou estorno, confirma o preenchimento do formulário
ou cita prazo de 7 dias, CDC, Procon, chargeback ou contestação
```

---

## 6. Liberar bloco único na Etapa 2 da Onboarding 3, se o retry continuar

O checkpoint já foi reescrito para pedir uma única mensagem, que é o lado de arquivo do item 1. Se o auditor continuar reprovando a entrega do convite depois disso, aí sim liberar bloco único nessa etapa no painel. Medir uma vez antes de mexer: o conserto do checkpoint pode bastar.

---

## 7. Recado para a operação, não é campanha

O link cru do Typeform (`emeo1uhrjwf.typeform.com/to/RSuIPOnP`) continua sendo colado à mão por operadores humanos: 13 vezes na Onb3 e 1 na Onb2, a mais recente hoje. Do lado da IA o problema já não existe. Ela mandou o link cru 11 vezes, todas entre 27/07 19:05 e 28/07 15:28, antes de a variável existir, e de 28/07 para cá usou só o `rebrand.ly` (168 vezes na Onb2, 154 na Onb3).

Pedir ao time que use o encurtado. Dois endereços para o mesmo formulário quebram a medição de UTM, e se o destino do `rebrand.ly` mudar, quem recebeu o cru vai para o lugar errado.

---

## 8. Divergência de identidade no Suporte, decidir

A campanha de Suporte tem `agent_name` cadastrado como `Lucas`, e o checkpoint diz o contrário, na Seção 3: "Não atribuir nome pessoal ao agente. A identidade é assistente de suporte do Buscador Automático."

O checkpoint não usa a variável, então na prática não vaza hoje. Mas é uma contradição em pé, e a regra da agência é nome unificado no mesmo funil: a recuperação usa Sofia, os onboardings usam Nicole, o Suporte não tem nome. Ou o Suporte passa a ter nome e ele é o mesmo dos onboardings, ou a variável sai. Não decidi sozinho.
