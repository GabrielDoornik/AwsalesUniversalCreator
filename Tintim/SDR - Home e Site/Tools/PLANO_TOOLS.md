# Plano de Integrações (Tools) — SDR Tintim

Status: PRELIMINAR. Specs montadas a partir do conhecimento público das APIs Kommo v4 e Cal.com v2. Precisam de confirmação com a documentação/painel do cliente e dos dados listados na seção "O que falta para finalizar". Nada aqui deve ser publicado na plataforma antes de fechar esses pontos.

Regra de ouro (do guia de tools): toda menção a tool no checkpoint usa o formato `Utilize a tool para [ação] @nome_da_tool`. Nunca `@tool` em definição, checklist, parêntese ou referência a evento passado.

## 1. Visão geral e arquitetura

Duas plataformas integram esta campanha:

- Cal.com — agendar a reunião do Programa de Parceiros (rota MQL): consultar disponibilidade e criar o agendamento.
- Kommo (CRM) — mover e criar cards no pipeline "IA [Awsales]" (id 13859031), nas duas rotas: qualificação, reunião agendada/marcada, handoff do não-MQL para o time de vendas, ganho/perdido.

Fluxo resumido:
- Lead chega (receptivo) -> SDR qualifica -> move card para "Qualificação".
- MQL com dor + interesse -> coleta nome e e-mail -> consulta horários no Cal.com -> agenda no Cal.com -> move card para "Reunião Agendada" -> lembretes de comparecimento.
- Não-MQL -> informa que o time de vendas dá sequência -> move card para a etapa de handoff/venda -> encaminha link placeholder.

## 2. Conexões (Parte 1 — uma vez por plataforma)

### Conexão Cal.com
- Tipo de autenticação: Bearer Token (a API key `cal_live_...`).
- Header adicional por tool: `cal-api-version` (valor depende do endpoint — ver cada tool).
- Observação de segurança: essa key tem escopo total da conta Cal.com (o próprio Jorge sinalizou que não consegue limitar o escopo). Ver seção 4 (gateway).

### Conexão Kommo
- Tipo de autenticação: Bearer Token (o token de longa duração fornecido).
- Base URL: `https://tintim.kommo.com/api/v4/` (CONFIRMADO 2026-07-14 via API — HTTP 200 com o token).
- Conta: Tintim, id 32491523, país BR, moeda BRL.
- Token validado (não expirado). O host genérico api-c.kommo.com retorna 401 "Account not found"; usar sempre o subdomínio tintim.

### Descobertas via API (read-only, 2026-07-14)

Etapas reais do pipeline IA [Awsales] (id 13859031) e seus status_id:

| Etapa | status_id | type |
|---|---|---|
| Incoming leads (entrada padrão) | 106939419 | 1 |
| Aguardando Contato | 106939423 | 0 |
| Contato Inicial | 108958275 | 0 |
| Qualificação | 108380651 | 0 |
| Oferta Enviada | 106939427 | 0 |
| Agência / Parceiros | 106939431 | 0 |
| Handoff Humano Necessário | 108380655 | 0 |
| Reunião Marcada | 108380659 | 0 |
| Venda ganha | 142 | 0 (system) |
| Venda perdida | 143 | 0 (system) |

Observações importantes:
- A estrutura real diverge do que o Jorge descreveu no grupo: NÃO existe etapa "Reunião Agendada"; só "Reunião Marcada". Confirmar se "Reunião Marcada" cobre tanto agendado quanto comparecido, ou se falta uma etapa.
- O pipe está vazio (0 leads). Como os leads da Home chegam só pelo botão do WhatsApp (sem formulário, confirmado pelo Jorge), não há card pré-existente: a IA precisa CRIAR o card no primeiro contato e depois movê-lo. Isso torna a tool de criar card PRIMÁRIA, não secundária.
- Telefone é gravado em E.164 sem "+" (ex: 5537991863256). Contatos guardam PHONE e EMAIL em custom_fields_values. A busca por telefone (query) é o caminho para localizar o card quando o id não estiver em contexto.
- Etapa de handoff do não-MQL para o time de vendas: PENDENTE de confirmação. Candidata natural pelo fluxo do Jorge: "Oferta Enviada" (106939427), interpretada como a raia da rota de venda. Confirmar.

## 3. Tools necessárias (specs preliminares)

### Rota MQL — Cal.com

STATUS: IMPLEMENTADO via gateway n8n em 2026-07-14 (não foi a chamada direta descrita abaixo). Documentação real e reproduzível das duas tools em `Integrações n8n/Cal.com/CONFIG_TOOLS_CAL.md`. As specs diretas abaixo ficam como referência da API do Cal.

#### Tool 1 — Consultar horários disponíveis  (@consultar_horarios_disponiveis)
- Objetivo (descrição para a IA): consultar os horários livres da agenda de reuniões do Programa de Parceiros antes de propor um horário ao lead. Chamar sempre que o lead MQL demonstrar interesse em agendar ou perguntar por horários. Informar a data desejada.
- Método: GET
- URL: `https://api.cal.com/v2/slots`
- Header customizado: `cal-api-version: 2024-09-04`
- Query params:
  - `eventTypeId` (Number, Fixo) — 424760 (Reunião de 30 min, agenda do Junior Faria). VALIDADO 2026-07-14. Config detalhada em `Integrações n8n/Cal.com/CONFIG_TOOLS_CAL.md`.
  - `start` (String, IA, Req) — início do intervalo de busca (ISO 8601, ex: 2026-07-15). Se o lead disse "quinta", calcular a próxima ocorrência a partir da data atual.
  - `end` (String, IA, Req) — fim do intervalo de busca (ISO 8601). Normalmente o mesmo dia ou a semana pedida.
  - `timeZone` (String, Fixo) — `America/Sao_Paulo`.
- Mapeamento de resposta: extrair a lista de slots disponíveis.

#### Tool 2 — Agendar reunião  (@agendar_reuniao)
- Objetivo (descrição para a IA): criar o agendamento da reunião do Programa de Parceiros no horário escolhido pelo lead, depois de confirmar horário, nome e e-mail. Chamar apenas após o lead escolher um horário disponível retornado pela consulta.
- Método: POST
- URL: `https://api.cal.com/v2/bookings`
- Header customizado: `cal-api-version: 2024-08-13`
- Body:
  - `eventTypeId` (Number, Fixo) — 424760 (mesmo da Tool 1). VALIDADO. Config detalhada em `Integrações n8n/Cal.com/CONFIG_TOOLS_CAL.md`.
  - `start` (String, IA, Req) — horário escolhido, ISO 8601 com timezone.
  - `attendee.name` (String, IA, Req) — nome do lead.
  - `attendee.email` (String, IA, Req) — e-mail do lead (Cal.com exige e-mail do participante; o SDR precisa coletar antes de agendar).
  - `attendee.timeZone` (String, Fixo) — `America/Sao_Paulo`.
  - `metadata.src` (String, Fixo) — `ia-awsales` (marcação de origem citada pelo Jorge; confirmar campo).
- Mapeamento de resposta: extrair id/uid do booking e status para confirmar ao lead e registrar no CRM.

Nota: a estrutura aninhada (`attendee.name`, `metadata.src`) precisa ser validada contra o que o schema de body da AWSales suporta. Se a plataforma não montar objeto aninhado, este é mais um motivo para o gateway (seção 4).

### CRM — Kommo (as duas rotas)

STATUS: IMPLEMENTADO via gateway n8n em 2026-07-15, com UMA tool única (`@atualizar_card_no_crm`) que faz buscar + criar-ou-mover, e não com as tools separadas descritas abaixo. Documentação real e reproduzível em `Integrações n8n/Kommo/CONFIG_TOOLS_KOMMO.md`. As specs diretas abaixo ficam como referência da API do Kommo.

#### Tool 3 — Buscar card do lead  (@buscar_card_no_crm)
- Objetivo (descrição para a IA): localizar o card do lead no CRM pelo telefone para obter o id antes de mover de etapa. Chamar antes de mover o card quando o id do lead não vier no contexto.
- Método: GET
- URL: `https://tintim.kommo.com/api/v4/leads`
- Query params:
  - `query` (String, IA, Req) — telefone do lead (busca textual do Kommo).
- Mapeamento de resposta: extrair `_embedded.leads[0].id`.
- Observação: só é necessária se a AWSales NÃO entregar o id do card via metadata da conversa. Confirmar (ver seção 5).

#### Tool 4 — Mover card de etapa  (@mover_card_no_crm)
- Objetivo (descrição para a IA): mover o card do lead para a etapa correta do pipeline conforme o momento (qualificação, reunião agendada, handoff para vendas, etc.). Chamar quando o estado do lead mudar.
- Método: PATCH
- URL: `https://tintim.kommo.com/api/v4/leads/{id}` (id no path)
- Body:
  - `pipeline_id` (Number, Fixo) — `13859031`.
  - `status_id` (Number, IA ou Fixo por invocação) — id da etapa de destino. IDs PENDENTES (ver seção 5).
- Mapeamento de resposta: confirmar sucesso.

#### Tool 5 — Registrar nota no card  (@registrar_nota_no_crm)  [opcional, recomendado]
- Objetivo (descrição para a IA): registrar no card um resumo curto da qualificação (perfil MQL/não-MQL, dor confirmada, próximo passo) para o time humano.
- Método: POST
- URL: `https://tintim.kommo.com/api/v4/leads/{id}/notes`
- Body: nota do tipo comum com o texto do resumo. (Kommo espera array de notas — validar suporte de body em array na AWSales.)

#### Tool 6 — Criar card  (@criar_card_no_crm)  [secundária]
- Objetivo: criar o card quando o lead chega só pelo WhatsApp sem card pré-existente no pipe.
- Método: POST -> `https://tintim.kommo.com/api/v4/leads`
- Observação: o create do Kommo espera body em array e o vínculo do telefone exige contato embutido (`_embedded.contacts`), o que é mais complexo. Provável que a maioria dos leads já exista no pipe (site -> Kommo); confirmar se o create é mesmo necessário nesta versão.

## 4. Recomendação sobre o gateway do Cal.com (pedido do Jorge)

Jorge sinalizou que não consegue limitar o escopo da API key do Cal.com e pediu para avaliarmos um gateway que restrinja o tipo de chamada que a IA consegue fazer. Concordo com a preocupação: a key do Cal.com dá acesso total (listar todos os bookings, cancelar, excluir), não só consultar e agendar.

Duas opções:
- Direto na AWSales (mais rápido para a V0/V1): configuramos só as duas tools (consultar + agendar). Na prática a IA só chama esses dois endpoints, mas a key de escopo total fica armazenada na conexão da AWSales.
- Via gateway (recomendado para produção): um webhook intermediário (ex: n8n, mesmo padrão já usado no caso CR Treinamentos) expõe só duas ações — get-availability e create-booking — e guarda a key do Cal.com no servidor. A AWSales nunca segura a key de escopo total, e qualquer chamada fora dessas duas ações é impossível. Também resolve de uma vez os objetos aninhados do body do Cal.com.

Sugestão: começar a V0/V1 direto para validar rápido e, ao aprovar, migrar o Cal.com para o gateway antes de escalar. Decisão do usuário.

Nota de segurança: token do Kommo e key do Cal.com estão hoje em arquivos .md em texto puro na pasta do chat. Depois de cadastrar nas conexões (ou no gateway), o ideal é rotacionar/remover esses arquivos, principalmente a key do Cal.com por ser de escopo total.

## 5. O que falta para finalizar as tools

Kommo:
- Subdomínio da conta (ex: `tintim.kommo.com`).
- IDs numéricos (status_id) de cada etapa do pipeline 13859031: Aguardando Contato, Contato Inicial, Qualificação, Oferta Enviada, Agência/Parceiros, Reunião Agendada, Handoff Humano Necessário, Reunião Marcada, Ganho, Perdido. Posso descobrir via `GET /api/v4/leads/pipelines/13859031` (read-only) assim que tiver o subdomínio e sua autorização para a chamada.
- Como a IA obtém o id do card para mover: a AWSales entrega via metadata da conversa? Ou a IA precisa buscar por telefone (Tool 3)?
- Qual etapa exata representa o handoff do não-MQL para o time de vendas (input da campanha de venda).

Cal.com:
- eventTypeId da reunião do Programa de Parceiros (posso descobrir via `GET /api/v2/event-types`), username e duração do evento.
- Decisão do gateway (direto x wrapper) — muda a URL das tools.
- Confirmar o campo/nome correto da marcação de origem `src=ia-awsales`.

Geral:
- Confirmar se o schema de body da AWSales suporta objeto aninhado (Cal) e array (Kommo notes/create); se não, reforça a opção gateway.
