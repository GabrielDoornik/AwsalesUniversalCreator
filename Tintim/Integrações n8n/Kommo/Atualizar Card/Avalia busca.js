/**
 * Fluxo n8n: Tintim | Kommo - Card   (webhook: tintim-kommo-card)
 * No: "Avalia busca"   (tipo: Code, typeVersion 2)
 * Ordem: ... Busca lead por telefone -> [ESTE NO] -> Switch (achou / nao_achou / erro)
 *
 * O que faz: separa "nao achou" (204) de "erro real" (401/500/timeout). E o fix do card
 * duplicado: em erro real NAO cria card (a rota erro do Switch nao toca no CRM).
 *   200 + leads -> { resultado:'achou', lead_id }
 *   204         -> { resultado:'nao_achou' }
 *   outro       -> { resultado:'erro', detalhe:'HTTP <status>' }
 *
 * Depende de: "Busca lead por telefone" com Response Format=JSON e fullResponse (statusCode + body).
 * Doc do fluxo: ../CONFIG_TOOLS_KOMMO.md (secao 4)
 * Estado: conferido contra o export real do n8n em 2026-07-22.
 */
const r = $input.first().json;
const status = r.statusCode;
const leads = r.body?._embedded?.leads || [];

if (status === 200 && leads.length > 0) {
  return [{ json: { resultado: 'achou', lead_id: leads[0].id } }];
}
if (status === 204) {
  return [{ json: { resultado: 'nao_achou' } }];
}
// 401, 500, timeout: erro real. NAO criar card.
return [{ json: { resultado: 'erro', detalhe: `HTTP ${status}` } }];
