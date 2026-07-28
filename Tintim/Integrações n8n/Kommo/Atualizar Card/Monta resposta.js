/**
 * Fluxo n8n: Tintim | Kommo - Card   (webhook: tintim-kommo-card)
 * No: "Monta resposta"   (tipo: Code, typeVersion 2)
 * Ordem: (Move card | Cria card | Switch erro) -> [ESTE NO] -> Respond to Webhook
 *
 * O que faz: monta o retorno pra IA. Nas rotas achou/nao_achou existe id; na rota erro nao,
 * e o ok sai false sozinho.  ->  { ok, lead_id, etapa }
 *
 * Doc do fluxo: ../CONFIG_TOOLS_KOMMO.md (secao 10)
 * Estado: conferido contra o export real do n8n em 2026-07-22.
 */
const id = $input.first().json.id || null;
const p = $('Prepara dados').first().json;
return [{ json: { ok: !!id, lead_id: id, etapa: p.etapa } }];
