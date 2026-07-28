# Integrações n8n — Lucas Firmino (D'Leon)

Todas as tools da campanha SDR passam por webhook n8n (gateway). As credenciais da Plataforma UNO ficam server-side no n8n, e o n8n normaliza o que a AWSales não normalizaria sozinha (achatar a grade de horários, defaults de campo opcional, tratamento de erro) e devolve sempre 200 com flag `ok`.

Migrado da chamada direta à UNO em 2026-07-23.

- Conexões na AWSales: `Plataforma Uno` e `Plataforma Uno - RP` (as duas continuam existindo, mas os headers de auth foram removidos das tools — hoje só carregam a URL do webhook).
- Ambiente de dev: `https://n8n.nonprod.awsales.io/webhook/` — onde os fluxos são montados e testados.
- Ambiente de produção: `https://flow.awsales.io/webhook/` — para onde vai via push/pull. **É esta a base configurada nas tools da AWSales.**

## Mapa: fluxo -> webhook -> handle

| Fluxo n8n | Webhook | Handle da tool | Endpoint UNO |
|---|---|---|---|
| Consultar Horários | `lucasfirmino-horarios` | `@consultar_horarios_disponiveis` | GET `/v1/scheduler/hours` |
| Criar Agendamento | `lucasfirmino-output` | `@criar_agendamento` | POST `/v1/scheduler/create` |
| Registrar Lead no RP | `lucasfirmino-lead` | `@registrar_lead_no_rp` | POST `/v1/lead` |

`@registrar_solicitacao_sdr` (Planilha SDR) já estava no n8n antes e não passou por esta migração.

## Contrato de resposta

Os três fluxos respondem **sempre 200**, nunca erro HTTP. Falha vira `ok: false` no corpo. É isso que impede a IA de tratar instabilidade da UNO como agenda vazia e registrar encaixe indevido.

| Campo | Onde | Significado |
|---|---|---|
| `ok` | todos | `false` = falha técnica. Não é ausência de horário nem recusa do CRM. |
| `tem_horario` | horários | `false` = agenda realmente vazia na data. Este sim autoriza registrar encaixe. |
| `horarios` / `sugestoes` | horários | lista apresentável e 3 sugestões (manhã/tarde/noite). |
| `appointment_id` | agendamento | só existe quando a UNO confirmou de fato. |
| `duplicado` | lead | `true` = lead já estava no CRM. Não bloqueia nada, a conversa segue. |
| `mensagem` | todos | instrução em linguagem natural para o Copywriter. |

## Credenciais UNO (server-side no n8n)

São dois pares distintos — o de agenda e o de CRM não são intercambiáveis.

| Fluxo | `x-uno-access-token` | `x-uno-secret-key` |
|---|---|---|
| Horários, Agendamento | `BA779B6447B12E3F0150` | `d59217553f292c649dc74cbbbd14098eab16b26247b3e87e6c` |
| Lead no RP | `2D3453FD350EAF7478E6` | `3d9bc7418e4ec1ed74bae82c03c945ee780d4f798df21108ba` |

Passados como Header Parameters fixos no nó HTTP Request de cada fluxo.

## Desenho comum dos fluxos

```txt
Webhook (POST, Respond = Using Respond to Webhook Node)
   -> [Pré-Normalizar]           só no fluxo de agendamento
   -> HTTP Request (UNO)         onError: continueErrorOutput
        |- Success -> Code (monta contrato) -> Respond Sucesso (First Incoming Item)
        |- Error   -> Respond Erro (JSON, Response Code 200, ok:false)
```

O nó de Respond fica **acima** do resto no canvas de propósito: a ordem de execução v1 do n8n é de cima para baixo, então a IA recebe a resposta antes de o fluxo terminar o restante.

### Criar Agendamento — ramo de output

Este fluxo faz duas coisas na mesma passada: cria o agendamento na UNO **e** dispara o output `agendamento-realizado-dleon` para a AWSales (`POST /api/webhooks/organizations/b1da232c-9fea-4507-9ecb-e66d2338698e/credentials/output-personalizado`), que encerra o objetivo da campanha. Ver `Estrutura/INPUT_OUTPUT_CAMPANHAS.md`.

O `Code in JavaScript` começa com um guard: se a UNO devolveu 200 sem `appointmentId`, ele retorna array vazio e o `Output` não executa. Sem isso, uma falha lógica da UNO (ex: horário tomado entre a consulta e a criação) marcaria a campanha como concluída com o lead sem agendamento e ninguém atrás dele.

## Inventário de nós Code

| Fluxo | Nó Code | Arquivo `.js` |
|---|---|---|
| Consultar Horários | Organiza Horários | `Consultar Horários/Organiza Horários.js` |
| Criar Agendamento | Pré-Normalizar | `Criar Agendamento/Pré-Normalizar.js` |
| Criar Agendamento | Monta confirmação | `Criar Agendamento/Monta confirmação.js` |
| Criar Agendamento | Code in JavaScript | `Criar Agendamento/Code in JavaScript.js` |
| Registrar Lead no RP | Monta resposta | `Registrar Lead no RP/Monta resposta.js` |

## Pendências com o cliente

- Quanto dura a avaliação e qual o último horário que a clínica aceita agendar de fato. Hoje a grade da UNO oferece até 19:40 (seg-sex) e 11:40 (sáb); se o expediente fecha logo depois, esses slots provavelmente não são agendáveis de verdade.
