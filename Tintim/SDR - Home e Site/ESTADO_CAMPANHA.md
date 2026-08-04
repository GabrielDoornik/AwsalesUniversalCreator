# Estado da Campanha — Tintim | SDR Home/Site

Estado vivo desta campanha. Fica AQUI, na pasta do cliente (não no CLAUDE.md, que carrega toda sessão e misturaria clientes distintos).

## Contexto

Cliente: Tintim (empresa Codevance; contatos Jorge Oliveira e Junior Faria; GP Awsales Lucas Cardoso). Produto: plataforma de inteligência de vendas no WhatsApp (rastreia origem das conversas e atribui vendas às campanhas de tráfego).

Campanha 1 — SDR Home/Site: receptiva (o lead chega pelo botão de WhatsApp do site, sem formulário). IA chamada "Clara".

## Roteamento (o que o SDR faz)

Qualifica MQL (gestor de tráfego OU dono de agência com 3+ clientes) x não-MQL.
- MQL com dor + interesse -> agenda reunião do Programa de Parceiros (Cal.com) + reduz no-show.
- Não-MQL -> a IA NÃO vende; avisa que o time comercial de vendas dá sequência (o não-MQL é o input da futura campanha de venda, outra IA). Por ora, placeholder rebrandly + card no CRM.
- O SDR nunca fecha venda; sempre encaminha (reunião marcada ou handoff pra vendas).

## Status (última atualização 2026-07-20)

MIGRAÇÃO CONCLUÍDA E VALIDADA (2026-07-20): as reuniões saíram da agenda pessoal do Junior e passaram para a agenda do time (rodízio entre 5 closers). Event type novo: Análise de Parceria IA, id 2153406, team Tintim Parcerias id 11887. O event type do time exige 3 campos que o pessoal não exigia (nome da empresa, WhatsApp, tomador de decisão). Aplicado em n8n (nó novo "Monta body do booking" que normaliza telefone em E.164 e o select em texto exato; nó HTTP em RAW; "Monta confirmação" com consultor + fallback de link + separação de motivo), na tool AWSales (3 campos no schema, só telefone Req; 2 variáveis novas mapeadas) e no checkpoint (publicado). Teste real ponta a ponta em 2026-07-20: agendamento ok, round robin sorteou Willian Cantuario, bookingFieldsResponses gravou Agencia Teste / +5511911112222 / Sim, Meet real retornado. Detalhes em `../Integrações n8n/Cal.com/CONFIG_TOOLS_CAL.md`.

PENDÊNCIAS DA MIGRAÇÃO:
- Cancelar o booking de teste (uid xcrVfubSzAh7ex5KThSA3C, 22/07/2026 10:00, com Willian) e os bookings de teste antigos na agenda pessoal do Junior.
- Sugerir ao Jorge: (a) trocar a API key pessoal do Junior por uma de owner do time ou conta de serviço, senão a saída dele derruba a integração; (b) adicionar opção "Não informado" no select tomadordedecisao ou desmarcar obrigatório, para o fallback "Não" não subdimensionar o lead quando ele não responde.

## Status anterior (2026-07-14)

- Fase 1 concluída: Textos Complementares Produto e Playbook (em `Textos Complementares/`).
- Tools do Cal.com CONSTRUÍDAS via gateway n8n (a tool da AWSales aponta pro webhook do n8n, que chama o Cal — não é chamada direta) e testadas ponta a ponta. Detalhe reproduzível em `../Integrações n8n/Cal.com/CONFIG_TOOLS_CAL.md`.
  - event type 424760 (Reunião de 30 min, agenda do Junior Faria). Conexão AWSales "Tintim - Gateway n8n" (auth Nenhuma).
  - Webhooks n8n: `tintim-cal-horarios` (consultar) e `tintim-cal-agendar` (agendar, com tratamento de horário ocupado devolvendo ok:false).
  - Handles: `@consultar_horarios_disponiveis`, `@agendar_reuniao`.
  - Variáveis mapeadas na AWSales (usar no checkpoint): `horarios_disponiveis`, `agendamento_ok`, `link_reuniao`, `horario_reuniao`, `id_reuniao`.
- FAQs geradas na plataforma e avaliadas (Produto e Playbook, 15 cada). Avaliação em `FAQs/Otimização FAQs - Produto.md` (remover 4 objeções duplicadas) e `FAQs/Otimização FAQs - Playbook.md` (remover 1 triagem duplicada). Guardrails seguraram: zero preço, zero escassez fictícia, call só para MQL.
- Checkpoint criado e validado (zero asterisco/emoji, formato @tool, variáveis no rodapé): `Checkpoint/checkpoint.md`. Referencia @consultar_horarios_disponiveis, @agendar_reuniao (Cal, prontas) e @atualizar_card_no_crm (Kommo, PENDENTE). NÃO ativar o checkpoint até a tool do Kommo existir com esse handle.
- Kommo: tool CONSTRUÍDA e testada (2026-07-15), também via gateway n8n. Não usa a conexão nativa da AWSales (aquela é input/output de plataforma; a tool é ação pontual na conversa). Detalhe reproduzível em `../Integrações n8n/Kommo/CONFIG_TOOLS_KOMMO.md`.
  - pipeline "IA [Awsales]" id 13859031, subdomínio `tintim.kommo.com`, token de longa duração validado, status_id de todas as etapas mapeados.
  - Webhook n8n: `tintim-kommo-card`. Handle: `@atualizar_card_no_crm`. A IA manda telefone, nome, etapa (nome da etapa, não id) e resumo; o n8n busca o lead, e cria ou move o card.
  - Dedup de contato ativo (2026-07-16): ao criar card, busca contato por telefone em toda a conta e liga o lead a um contato existente em vez de duplicar. Vários cards por pessoa, um contato só. Detalhe em `../Integrações n8n/Kommo/CONFIG_TOOLS_KOMMO.md`.
  - Não existe etapa "Reunião Agendada", só "Reunião Marcada".
- Robustez (aplicada e testada em 2026-07-15): busca do Kommo com erro real (401/500) não cria mais card duplicado (rota `erro` do Switch não toca no CRM); Cal fora do ar devolve `ok:false, erro_ao_consultar_agenda`; agenda vazia devolve `ok:false, sem_horario_disponivel` e o checkpoint proíbe inventar horário.

## Pendências

1. Apagar o card de teste 22791088 ("João Teste") no pipe IA [Awsales].
2. CONFIRMADO com o cliente (24/07/2026): o handoff do não-MQL é a etapa "Oferta Enviada" (status_id 106939427). É o gatilho da integração de INPUT da campanha de Venda — só o não-MQL cai lá (o MQL segue pra Agência / Parceiros -> Reunião Marcada), então é gatilho limpo. Confirmado também que o não-MQL é atendido pela IA de vendas (campanha Venda - Não-MQL), NÃO por humano; "Handoff Humano Necessário" é outra raia, só pro MQL que não dá pra marcar reunião ou que insiste em humano. Falta construir a integração Kommo -> AWSales que dispara a Venda quando o card entra em "Oferta Enviada".
3. Nó de nota no fluxo do Kommo: o `resumo` que a IA gera é recebido mas não é gravado no card (ver pendências em `../Integrações n8n/Kommo/CONFIG_TOOLS_KOMMO.md`).
4. Lembrete de comparecimento: o Follow-Up Inteligente NÃO faz isso (ele dispara quando o lead some, não em horário marcado). Decidir entre Meeting Keeper como 2º agente (recomendado, e teria que se chamar Clara também), lembretes nativos do Cal ou disparo agendado. Ver fim de `MENSAGENS_FOLLOWUP.md`.
5. Hardening: proteger os webhooks n8n com header secreto e mover as credenciais (key do Cal, token do Kommo) para Credentials do n8n em vez de header cru nos nós.
6. Dedup de contato por e-mail (2ª chave): hoje o dedup é só por telefone. No passo do agendamento, quando a IA já tem o e-mail, dá pra gravar no contato e/ou usar como segunda chave. Pendência, não urgente.
6. Cancelar os bookings de teste ("João Teste") no Cal, se ainda existirem.

Feito: FAQs avaliadas e remoções aplicadas; workflows n8n ativos; orientações de follow-up entregues em `MENSAGENS_FOLLOWUP.md`.

## Ao construir o checkpoint (Fase 2)

Referenciar `@consultar_horarios_disponiveis` e `@agendar_reuniao` no formato correto e usar as variáveis mapeadas: `{{horarios_disponiveis}}`, `{{agendamento_ok}}`, `{{link_reuniao}}`, `{{horario_reuniao}}`, `{{id_reuniao}}`. Lógica: MQL -> consulta -> propõe do `{{horarios_disponiveis}}` -> agenda -> se `{{agendamento_ok}}` confirma com `{{horario_reuniao}}` + `{{link_reuniao}}`; se não, oferece outro horário.
