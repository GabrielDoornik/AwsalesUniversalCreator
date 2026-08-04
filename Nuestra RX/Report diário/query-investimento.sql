-- Report diário Nuestra RX — investimento (custo de plataforma COM margem) por campanha
-- Banco: APP (awsales_db) — Metabase id 3
--
-- APROXIMAÇÃO. A fonte canônica é a tabela silver `costs_vw` no BigQuery, coluna
-- `total_value_with_margin` (é de lá que sai o card "Investimento total" do painel).
-- Esta query replica a lógica do job `costs_vw.py` usando só o banco APP, e NÃO reproduz o painel:
-- medido em 16/07, dá 8-28% acima em três campanhas e 2,5x MENOR na Prova Social.
-- Ler a seção "Passo 2" do README.md antes de usar o número com o cliente.
--
-- Trocar SÓ as datas (aparecem em cada bloco), em HORÁRIO DE BRASÍLIA — daí o "- INTERVAL '3 hours'",
-- que é a mesma correção que o ETL oficial aplica.
--
-- Notas de fidelidade ao costs_vw.py:
--   * `costs.total_value` é USD -> BRL por total_value_brl_cents (existe a partir de 05/06/2026),
--     com fallback total_value * usd_brl_rate.
--   * disparos usam o preço COM MARGEM fixo do ETL: disparo_marketing 0.0788, disparo_utilidade 0.0380
--     (USD), e não o valor cru da linha de custo.
--   * bloco b3 não inclui `mensagem_enviada`: no ETL ela sai NULL (base_value é a string 'NULL',
--     então o COALESCE não cai no default 0.0055). Espelhado de propósito. Confirmar com o Lucas Reis.
--   * NÃO cobre tokens órfãos de Smart Follow-Up (message_id_ref 'smart-fup-*'): recuperar a campanha
--     deles exige join com o banco NEO, impossível numa query única do Metabase. Subestima campanha
--     com Smart FUP ligado.

WITH b1 AS (  -- mensagens enviadas/recebidas (fees 3 e 2)
  SELECT cw.campaign_id,
         coalesce(c.total_value_brl_cents/100.0, c.total_value*c.usd_brl_rate) AS brl,
         'mensagens' AS bloco
  FROM costs c
  JOIN messages m ON m.cost_id = c.id
  JOIN conversion_window cw ON cw.id = m.conversation_id
  WHERE c.organization_id = 'b34f181e-c7b3-49fb-b69f-3454a7336df2'
    AND c.fee_id IN (2, 3)
    AND coalesce(m.status::text, '') NOT IN ('FAILED', '')
    AND (c.created_at - INTERVAL '3 hours') >= '2026-08-01'
    AND (c.created_at - INTERVAL '3 hours') <  '2026-08-03'

), b3 AS (  -- disparo da 1ª mensagem da janela, quando não há template cobrado
  SELECT cw.campaign_id,
         (CASE f.name WHEN 'disparo_marketing' THEN 0.0788
                      WHEN 'disparo_utilidade' THEN 0.0380 END) * c.usd_brl_rate AS brl,
         'disparo_1a_msg' AS bloco
  FROM messages m
  JOIN conversion_window cw ON cw.first_message_id = m.id
  JOIN costs c ON c.id = m.cost_id
  JOIN fees f ON f.id = c.fee_id
  WHERE c.organization_id = 'b34f181e-c7b3-49fb-b69f-3454a7336df2'
    AND cw.window_status::text = 'available'
    AND f.name IN ('disparo_marketing', 'disparo_utilidade')
    AND (cw.start_at - INTERVAL '3 hours') >= '2026-08-01'
    AND (cw.start_at - INTERVAL '3 hours') <  '2026-08-03'
    AND NOT EXISTS (
        SELECT 1 FROM whatsapp_template_sent w
        WHERE w.cost_id = m.cost_id
          AND lower(w.billable) IN ('true','t','1','billable','yes','y'))

), b4 AS (  -- template WhatsApp cobrado (fees 1 e 19)
  SELECT cw.campaign_id,
         (CASE f.name WHEN 'disparo_marketing' THEN 0.0788
                      WHEN 'disparo_utilidade' THEN 0.0380
                      ELSE c.total_value END) * c.usd_brl_rate AS brl,
         'template' AS bloco
  FROM whatsapp_template_sent w
  JOIN costs c ON c.id = w.cost_id
  JOIN fees f ON f.id = c.fee_id
  JOIN conversion_window cw ON cw.id = w.conversion_window_id
  WHERE c.organization_id = 'b34f181e-c7b3-49fb-b69f-3454a7336df2'
    AND c.fee_id IN (1, 19)
    AND lower(w.billable) IN ('true','t','1','billable','yes','y')
    AND (w.created_at - INTERVAL '3 hours') >= '2026-08-01'
    AND (w.created_at - INTERVAL '3 hours') <  '2026-08-03'

), b5 AS (  -- tokens dos sub-agentes (campanha via messages.wam_id_ref)
  SELECT cw.campaign_id,
         coalesce(c.total_value_brl_cents/100.0, c.total_value*c.usd_brl_rate) AS brl,
         'tokens' AS bloco
  FROM tokens t
  JOIN costs c ON c.token_id = t.id
  JOIN fees f ON f.id = c.fee_id
  JOIN messages m ON m.wam_id_ref = t.message_id_ref
  JOIN conversion_window cw ON cw.id = m.conversation_id
  WHERE c.organization_id = 'b34f181e-c7b3-49fb-b69f-3454a7336df2'
    AND f.name LIKE 'tokens_%'
    AND (t."dateTime" - INTERVAL '3 hours') >= '2026-08-01'
    AND (t."dateTime" - INTERVAL '3 hours') <  '2026-08-03'

), b6 AS (  -- cobrança de lead ativo
  SELECT cw.campaign_id,
         coalesce(c.total_value_brl_cents/100.0, c.total_value*c.usd_brl_rate) AS brl,
         'lead_ativo' AS bloco
  FROM active_lead_costs alc
  JOIN costs c ON c.id = alc.cost_id
  JOIN conversion_window cw ON cw.id = alc.first_conversion_window_id
  WHERE c.organization_id = 'b34f181e-c7b3-49fb-b69f-3454a7336df2'
    AND (alc.date - INTERVAL '3 hours') >= '2026-08-01'
    AND (alc.date - INTERVAL '3 hours') <  '2026-08-03'

), u AS (
  SELECT * FROM b1
  UNION ALL SELECT * FROM b3
  UNION ALL SELECT * FROM b4
  UNION ALL SELECT * FROM b5
  UNION ALL SELECT * FROM b6
)
SELECT
    CASE
        WHEN campaign_id = '9e0f28a6-29ba-4491-893b-12c9846bb59e' THEN 'RECUPERAÇÃO DE FORMULÁRIO | ESTRATÉGIA NOVA | ABANDONO'
        WHEN campaign_id = '3ccdfd27-b067-4fe6-a874-1dcc8aa62dc5' THEN 'RECUPERAÇÃO DE FORMULÁRIO | ESTRATÉGIA NOVA | RECEPTIVA'
        WHEN campaign_id = 'b21feb9c-17d8-4ccc-9241-18e0934c5710' THEN 'RECUPERAÇÃO DE VENDAS | ESTRATÉGIA NOVA'
        WHEN campaign_id = '83ed0ce1-1bde-4a9b-af73-d3c81bab526c' THEN 'RECUPERAÇÃO DE VENDAS | ESTRATÉGIA NOVA | IMAGEM PROVA SOCIAL'
    END AS nome_campanha,
    round(sum(brl)::numeric, 2) AS investimento_brl_aprox,
    -- quebra por bloco: se um bloco vier vazio onde não deveria, é sinal de join quebrado
    round(sum(CASE WHEN bloco = 'tokens' THEN brl END)::numeric, 2) AS tokens,
    round(sum(CASE WHEN bloco = 'mensagens' THEN brl END)::numeric, 2) AS mensagens,
    round(sum(CASE WHEN bloco IN ('disparo_1a_msg','template') THEN brl END)::numeric, 2) AS disparos,
    round(sum(CASE WHEN bloco = 'lead_ativo' THEN brl END)::numeric, 2) AS lead_ativo
FROM u
WHERE campaign_id IN (
        '9e0f28a6-29ba-4491-893b-12c9846bb59e',
        '3ccdfd27-b067-4fe6-a874-1dcc8aa62dc5',
        'b21feb9c-17d8-4ccc-9241-18e0934c5710',
        '83ed0ce1-1bde-4a9b-af73-d3c81bab526c')
GROUP BY 1
ORDER BY 2 DESC;
