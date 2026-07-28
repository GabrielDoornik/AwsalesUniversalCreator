# Playbook — Relatório de Suporte Falcão das Milhas

## O que é esse relatório

Relatório de performance da IA de suporte da campanha Falcão das Milhas. Conecta dados operacionais (atendimento, resolução, handoff) com impacto financeiro (custo da IA, retenção, reembolso). O destinatário é o João (cliente), que usa o relatório em reunião de liderança.

---

## Tabelas que você precisa puxar

### 1. Optimization Hub

- **Fonte**: Plataforma Awsales → exportar relatório da campanha de suporte.
- **Formato**: `.xlsx`
- **O que tem**: Visão consolidada da campanha — total de conversas, resolvidas pela IA, resolvidas por humano, abandonadas, CSAT, volume por dia, tópicos mais frequentes e fricções.
- **Por que importa**: É o resumo-mãe. Dele saem os indicadores principais do relatório (deflexão, taxa de resolução, CSAT).

---

### 2. Tactical Analysis

- **Fonte**: Banco de dados → tabela `tactical_analysis` (ou equivalente).
- **Formato**: `.xlsx` (query result)
- **O que tem**: Uma linha por conversa analisada. Campos principais:
  - `Conversation ID`, `Campaign ID`, `Created At`, `Analyzed At`
  - `Resolution Status`, `Had Handoff`, `Handoff Reason`
  - `Topic Primary`, `Topic Secondary`, `Topic Tags`
  - `Is Product Friction`, `Product Friction Feature`
  - `Rag Missing Info`, `Rag Accuracy`
  - `Ai Cost Usd ($)`
  - `Duration Total Seconds`, `Duration Ai Only Seconds`, `Duration Human Handling Seconds`
  - `Csat Score`, `Summary`
- **Por que importa**: Custo por conversa, temas recorrentes, tempo de atendimento, lacunas da base de conhecimento e fricções de produto. É a tabela mais rica para análise detalhada.

---

### 3. Handoff Snapshots

- **Fonte**: Banco de dados → tabela `handoff_snapshots` (ou equivalente).
- **Formato**: `.xlsx` (query result)
- **O que tem**: Snapshot do momento exato em que a IA transferiu para humano. Campos principais:
  - `Conversation ID`, `Handoff Ticket ID`
  - `Handoff Type`, `Handoff Reason`, `Handoff Summary`
  - `Rag Last Query`, `Rag Results`, `Rag Score`
  - `Last Ai Response`, `Last User Message`
  - `Conversation Transcription`
- **Por que importa**: Entender **por que** a IA transferiu. Permite classificar handoffs em evitáveis vs inevitáveis, identificar gaps da base de conhecimento e propor melhorias no checkpoint.

---

### 4. Handoff Tickets

- **Fonte**: Banco de dados → tabela `handoff_tickets` (ou equivalente).
- **Formato**: `.xlsx` (query result)
- **O que tem**: Registro do que aconteceu **depois** da transferência. Campos principais:
  - `Conversation ID`, `Handoff Reason`, `Handoff Summary`
  - `Priority`, `Priority Score`, `Status`
  - `Assigned At`, `Resolved At`, `Sla Breached`
  - `Return Count`, `Last Return Reason`
- **Por que importa**: Medir qualidade pós-handoff — tickets resolvidos, tempo de resolução, SLA, retornos por problema não resolvido.

---

### 5. Conversas completas da campanha

- **Fonte**: Banco de dados → tabela de mensagens/conversas da campanha de suporte.
- **Formato**: `.xlsx` (query result)
- **O que tem**: Todas as mensagens das conversas. Campos principais:
  - `conversation_id`, `conversation_agent_session_id`
  - `created_at`, `sender` / `role`
  - `message` / `content`
  - `is_handoff`, `handoff_reason`
  - `customer_phone`, `customer_email`
- **Por que importa**: Reconstruir conversas completas, identificar pedidos de cancelamento/reembolso, verificar se houve retenção (cliente desistiu de cancelar após orientação da IA). É essencial para a análise qualitativa e para cruzar com dados de reembolso.

---

### 6. Tabela de reembolso / checkout — DOIS checkouts, sempre consolidar

- **Fonte**: os DOIS checkouts em uso pela Falcão: **Assiny** (`export_assiny.csv`) e **Hubla** (`export_hubla.xlsx`). Exportar ambos, mesmo período, status "todos".
- **Por que importa**: taxa de reembolso atual vs baseline histórico (22,5%–23%) e valor preservado.

**Regra crítica (aprendida em junho/2026): consolidar Assiny + Hubla e segmentar pelo Buscador Automático.** O Assiny sozinho engana — em junho deu 24% só Assiny, mas a Hubla (canal de maior volume, reembolso mais baixo) puxou o consolidado do Buscador para ~19%. Comparar contra o baseline 22,5–23% usando a taxa do **Buscador Automático** (produto do suporte), não a de todos os produtos (diluída por high-ticket como Black Falcon/Balcão).

Detalhes técnicos para o script:
- Assiny: `Valor` em **CENTAVOS** (dividir por 100); produto em `NomeDoProduto`; status em `Status` (`paid`, `refunded`, `chargedback_refunded`, `refused`, `waiting_payment`, `pix_expired`).
- Hubla: `Valor do produto` em **REAIS**; produto em `Nome do produto`; status em `Status da fatura` (`Paga`, `Reembolsada`, `Em disputa`).
- Denominador (transações ever-paid) = Assiny(`paid`+`refunded`+`chargedback_refunded`) + Hubla(`Paga`+`Reembolsada`+`Em disputa`). Numerador (reembolso) = `refunded`/`Reembolsada` (chargeback/disputa à parte).
- Calcular a taxa por **quantidade E por valor** (no Buscador as duas batem ~19%; em "todos os produtos" divergem porque o valor é diluído por high-ticket).
- Ressalva no texto: coorte de fim de mês ainda não maturou o prazo de arrependimento, então a taxa é piso.
- **Pendência aberta**: confirmar com o João se o baseline 22,5–23% é da conta inteira ou só do Buscador (define qual taxa de junho é o headline e o valor preservado real).

---

## Resumo rápido

| # | Tabela | Responde a... |
|---|--------|---------------|
| 1 | Optimization Hub | Indicadores gerais (deflexão, CSAT, volume) |
| 2 | Tactical Analysis | Custo, temas, resolução, fricções |
| 3 | Handoff Snapshots | Por que a IA transferiu |
| 4 | Handoff Tickets | O que aconteceu depois do handoff |
| 5 | Conversas completas | Retenção, padrões, análise qualitativa |
| 6 | Reembolso / checkout | Taxa de reembolso, valor recuperado |

---

## Dado financeiro fixo

- Custo total da IA no mês (informado pelo cliente): usar o valor atualizado que o João passar.
- Baseline histórico de reembolso: **22,5% a 23%** (referência dos últimos 4 meses).

## Filtro de período

- Filtrar tudo por `Created At` ou `Analyzed At`.
- Separar: recorte novo (desde último relatório) + acumulado do mês.

---

## Aprendizados e regras (atualizado jun/2026)

Contexto fixo da campanha:
- Cliente: Falcão das Milhas (João Victor França e Joao Fergon; equipe Harpya/Nicole no suporte).
- Produto principal: Buscador Automático (assinatura anual R$ 297). A IA de Suporte (campanha `ffbc47ff-425b-4027-a23f-ec0ee5ec8c73`) atende Buscador + Balcão de Milhas + Consultoria Individual + Black Falcon.
- Cadência de relatórios: 11-05, 15-05, 21-05, ~03-06, 30-06 (mês fechado).
- KPI da operação (definida pela AWSales com o cliente, 25/06): atingir 50% de resolução automática. Junho fechou 32,6%; o grosso das otimizações entrou na 2ª metade do mês, então o efeito aparece em julho.
- Memória crua de cada ciclo: `01_Dados Brutos/<data>/ACHADOS_ANALISE_*.md`.
- Gerador de PDF: `05_Scripts/gerar_relatorio_<DD_MM>.py` (reportlab; clonar o de junho e trocar cards/datas/paths). Console Windows é cp1252 — escrever saída de análise em arquivo UTF-8.

CSAT — sempre separar IA vs humano (a Tactical Analysis tem `Resolution Method`; calcular CSAT médio por método):
- Histórico: maio IA 4,85 / humano 4,16; junho IA 4,76 / humano 3,33.
- "Resolvidas pela IA" usar a contagem por método AI (consistente com relatórios antigos), NÃO a definição estrita da aba "Resumo" do Optimization Hub (que dá um número menor).
- Para comparar com o mês anterior, processar os brutos antigos (`2026-05-21`) do mesmo jeito.

Regras de tom e escrita (pedido do usuário em 30/06 — o relatório vai para a liderança E para o time humano do cliente):
- NÃO "humilhar" o atendimento humano ao comparar CSAT. Mostrar que a IA superou de forma construtiva: a IA segurou a nota estável mesmo com volume 3,3x, e o humano recebe os casos mais difíceis (cancelamento, validação financeira, acesso com liberação interna). Não citar nomes/notas de operadores individuais.
- NÃO repetir o mesmo dado em várias seções — cada ponto uma vez; a conclusão referencia, não re-despeja.
- SEMPRE trazer comparativo com o mês anterior (CSAT IA/humano, resolução, cobertura).
- Posicionamento que valoriza a AWSales sem mentir: contenção sob pressão, satisfação estável da IA, diagnóstico e correção das alavancas (acesso/login é o gargalo nº 1 e a maior alavanca de retenção), custo por conversa baixo vs time que não escalaria.
- Reembolso: ver seção 6 (consolidar Assiny + Hubla, segmentar Buscador). Pendência aberta: confirmar com o João se o baseline 22,5–23% é da conta inteira ou só do Buscador.
