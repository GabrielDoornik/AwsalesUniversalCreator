# Auditoria dos Cruzamentos - 21/05/2026

Este arquivo registra a validação técnica feita após a geração do relatório.

## 1. Resultado geral

Não houve erro técnico de leitura ou cruzamento que invalide o relatório.

Houve, porém, diferenças de granularidade entre as bases. Por isso, o relatório final foi ajustado para:

- usar o Optimization Hub como fonte oficial de taxa de resolução, intervenção humana, CSAT, tópicos e motivos de handoff;
- usar Handoff Tickets e Handoff Snapshots apenas como base operacional para entender pós-transferência, SLA, status e retornos;
- usar Conversion Window como apoio qualitativo por telefone/data, não como fonte oficial de taxa, porque ela não possui `conversation_id`.

## 2. Optimization Hub x Tactical Analysis

Validação:

- Optimization Hub: 434 linhas.
- Tactical Analysis: 436 linhas.
- `Conversation ID` do Optimization Hub ausente na Tactical Analysis: 0.
- Tactical Analysis tem 1 conversa extra fora do conjunto do Hub.
- Existem `Conversation ID` duplicados nas duas bases, indicando múltiplas análises/registros para a mesma conversa.

Diferença encontrada:

- No acumulado, houve 20 divergências de resolução entre Hub e Tactical Analysis em 379 conversas únicas.
- No recorte 16/05 a 21/05, houve 8 divergências em 119 conversas únicas.

Decisão:

- Usar Optimization Hub como fonte oficial de métricas.
- Usar Tactical Analysis como apoio para resumos, tópicos, leitura qualitativa e investigação.

## 3. Handoff Tickets x Handoff Snapshots

Validação:

- Tickets: 399 linhas.
- Snapshots: 399 linhas.
- Tickets sem snapshot correspondente: 0.
- Snapshots sem ticket correspondente: 0.

Decisão:

- O cruzamento entre Tickets e Snapshots está consistente.
- A base foi usada para análise operacional pós-transferência.

## 4. Handoff oficial x base operacional de tickets

Diferença encontrada:

- Optimization Hub acumulado: 222 conversas com handoff.
- Tickets operacionais acumulados: 399 registros.
- No recorte 16/05 a 21/05:
  - Optimization Hub: 99 conversas com handoff.
  - Tickets operacionais: 173 registros.

Interpretação:

- A base operacional de tickets/snapshots tem granularidade diferente da taxa oficial de conversas.
- Pode conter múltiplos registros, reaberturas ou registros criados em datas diferentes da análise da conversa.

Decisão:

- Não usar Tickets/Snapshots para calcular taxa de intervenção humana.
- Usar Tickets/Snapshots apenas para SLA, status, retorno e análise operacional.
- O relatório foi ajustado para os motivos de handoff virem da base oficial do Hub.

## 5. Conversion Window

Validação:

- 15.013 mensagens.
- 586 leads únicos.
- Período: 15/04/2026 a 21/05/2026.
- Recorte 16/05 a 21/05: 6.025 mensagens e 250 leads únicos.

Limitação:

- A tabela possui `numero_lead`, `remetente`, `mensagem` e `datetime`.
- Não possui `conversation_id`.

Decisão:

- Usar para leitura qualitativa e identificação de padrões de cancelamento/acesso/buscador.
- Não usar como fonte oficial para métricas de conversa.
- Não usar para valor recuperado sem cruzamento posterior com checkout.

## 6. Ajuste aplicado no relatório

Após a auditoria, a seção de motivos de transferência foi corrigida para usar a fonte oficial do Optimization Hub:

- acumulado: 222 encaminhamentos oficiais para humano;
- recorte 16/05 a 21/05: 99 encaminhamentos oficiais para humano.

A seção de operação pós-transferência foi mantida com base nos registros operacionais, mas agora explicitamente nomeada como base operacional, não como total oficial de conversas.
