# CONFIGURAÇÃO DE TOOLS — SDR D'Leon (Lentes de Porcelana)

Instruções para os campos das tools na plataforma AWSales. Colar no campo "Instruções para a LLM" de cada parâmetro.

Desde 2026-07-23 as tools não batem mais direto na Plataforma UNO: elas chamam webhooks n8n, que guardam a credencial e normalizam a resposta. Arquitetura e código dos fluxos em `Lucas Firmino/Integrações n8n/`.

Por isso, três coisas saíram das tools e viraram responsabilidade do n8n:

- Headers `x-uno-access-token` e `x-uno-secret-key` — removidos das tools.
- `serviceId` (horários e agendamento) — o n8n manda `1` fixo, a campanha só trabalha com Lentes de Porcelana.
- `tagId` e `originId` (lead no RP) — o n8n manda `1` e `2` fixos.

Método de todas: POST, com os campos abaixo no Body Schema.

---

## @consultar_horarios_disponiveis

Webhook: `lucasfirmino-horarios`

### date
Se o lead disse dia da semana (ex: "quinta"), calcule a próxima ocorrência a partir da data atual. Se não especificou, use hoje. Formato DD/MM/YYYY, com barras.

> Não precisa mais instruir a IA a descartar horário fora do expediente: o n8n já filtra (seg-sex 08:00-19:40, sáb 08:00-11:40, dom fechado), remove horário que já passou e devolve só horário redondo.

---

## @criar_agendamento

Webhook: `lucasfirmino-output`

### date
Usar exatamente a data verificada como disponível na consulta anterior.

### hour
Usar exatamente o horário que o lead escolheu entre as opções.

### name
Nome completo coletado na etapa 4.2. Não inventar sobrenome.

### cellPhone
Número confirmado na etapa 4.2. Se o lead confirmou o número da conversa, usar esse.

### observation
Resumir em 1-2 frases: incômodo estético principal, objetivo e observações relevantes (ex: pediu presença do Dr. Lucas, gestante, receio específico).

---

## @registrar_lead_no_rp

Webhook: `lucasfirmino-lead`

### name
Usar o nome que o lead informou na conversa. Priorizar nome completo. Se o lead só informou o primeiro nome, usar apenas o primeiro nome. Não inventar sobrenome.

### cellPhone
Usar o número do WhatsApp do próprio atendimento, com DDD. Se houver confirmação explícita do lead, usar o número confirmado.

### observation
Resumir em 1-2 frases: origem pelo atendimento da IA/Awsales, procedimento de interesse, principal dor estética, reação inicial e qualquer observação útil para o time comercial.

---

## Contrato de resposta

Os três webhooks respondem sempre 200. Falha vem como `ok: false` no corpo, nunca como erro HTTP — é o que impede a IA de confundir instabilidade da UNO com agenda vazia.

| Campo | Tool | Significado |
|---|---|---|
| `ok` | todas | `false` = falha técnica. Reconsultar, não encerrar. |
| `tem_horario` | horários | `false` = agenda realmente vazia. Este autoriza registrar encaixe. |
| `horarios` / `sugestoes` | horários | lista apresentável e 3 sugestões (manhã/tarde/noite). |
| `appointment_id` | agendamento | só existe com agendamento confirmado de fato. |
| `duplicado` | lead no RP | `true` = lead já estava no CRM. Segue a conversa normalmente. |
| `mensagem` | todas | instrução em linguagem natural para o Copywriter. |

---

## @registrar_solicitacao_sdr

Tool da Planilha SDR, já era n8n antes desta migração e não foi alterada.
