-- Report diário Nuestra RX — métricas por campanha
-- Banco: APP (awsales_db) — Metabase id 3
-- Trocar SÓ as duas datas do WHERE (início inclusivo, fim exclusivo), em HORÁRIO DE BRASÍLIA.
--   um dia:        >= '2026-08-04'  e  < '2026-08-05'
--   fim de semana: >= '2026-08-01'  e  < '2026-08-03'
-- Ver README.md para o motivo do "- INTERVAL '3 hours'" e para as ressalvas de leitura dos números.

SELECT
    CASE
        WHEN cw.campaign_id = '9e0f28a6-29ba-4491-893b-12c9846bb59e' THEN 'RECUPERAÇÃO DE FORMULÁRIO | ESTRATÉGIA NOVA | ABANDONO'
        WHEN cw.campaign_id = '3ccdfd27-b067-4fe6-a874-1dcc8aa62dc5' THEN 'RECUPERAÇÃO DE FORMULÁRIO | ESTRATÉGIA NOVA | RECEPTIVA'
        WHEN cw.campaign_id = 'b21feb9c-17d8-4ccc-9241-18e0934c5710' THEN 'RECUPERAÇÃO DE VENDAS | ESTRATÉGIA NOVA'
        WHEN cw.campaign_id = '83ed0ce1-1bde-4a9b-af73-d3c81bab526c' THEN 'RECUPERAÇÃO DE VENDAS | ESTRATÉGIA NOVA | IMAGEM PROVA SOCIAL'
    END AS nome_campanha,

    COUNT(DISTINCT cw.lead_id) AS total_leads_chegaram,

    -- respondeu = existe mensagem na janela enviada pelo próprio lead
    COUNT(DISTINCT CASE WHEN m.id IS NOT NULL THEN cw.lead_id END) AS leads_que_responderam,

    ROUND(
        COUNT(DISTINCT CASE WHEN m.id IS NOT NULL THEN cw.lead_id END) * 100.0 /
        NULLIF(COUNT(DISTINCT cw.lead_id), 0), 2
    ) AS taxa_resposta_percentual,

    -- converteu = evento de objetivo da campanha disparou (ver ressalva 2 do README)
    COUNT(DISTINCT CASE WHEN cw.output_leads_event_id IS NOT NULL THEN cw.lead_id END) AS leads_que_converteram,

    ROUND(
        COUNT(DISTINCT CASE WHEN cw.output_leads_event_id IS NOT NULL THEN cw.lead_id END) * 100.0 /
        NULLIF(COUNT(DISTINCT cw.lead_id), 0), 2
    ) AS taxa_conversao_percentual

FROM
    public.conversion_window cw
INNER JOIN
    public.leads l ON cw.lead_id = l.id
LEFT JOIN
    public.messages m ON m.conversation_id = cw.id AND m."from" = l."phoneNumber"
WHERE
    cw.campaign_id IN (
        '9e0f28a6-29ba-4491-893b-12c9846bb59e',
        '3ccdfd27-b067-4fe6-a874-1dcc8aa62dc5',
        'b21feb9c-17d8-4ccc-9241-18e0934c5710',
        '83ed0ce1-1bde-4a9b-af73-d3c81bab526c'
    )
    AND cw.window_status::text = 'available'
    AND (cw.start_at - INTERVAL '3 hours') >= '2026-08-01'
    AND (cw.start_at - INTERVAL '3 hours') <  '2026-08-03'
GROUP BY
    cw.campaign_id
ORDER BY
    total_leads_chegaram DESC;


-- ---------------------------------------------------------------------------
-- Checagem ocasional: falha de entrega de template no período.
-- 'message_failed' fica FORA do report (a query acima filtra 'available'), mas
-- se uma perna do teste A/B falhar mais que a outra, a comparação suja.
-- ---------------------------------------------------------------------------
-- SELECT cw.campaign_id, cw.window_status::text AS status, COUNT(DISTINCT cw.lead_id) AS leads
-- FROM public.conversion_window cw
-- WHERE cw.campaign_id IN (
--         '9e0f28a6-29ba-4491-893b-12c9846bb59e',
--         '3ccdfd27-b067-4fe6-a874-1dcc8aa62dc5',
--         'b21feb9c-17d8-4ccc-9241-18e0934c5710',
--         '83ed0ce1-1bde-4a9b-af73-d3c81bab526c')
--   AND (cw.start_at - INTERVAL '3 hours') >= '2026-08-01'
--   AND (cw.start_at - INTERVAL '3 hours') <  '2026-08-03'
-- GROUP BY 1, 2 ORDER BY 1, 2;
