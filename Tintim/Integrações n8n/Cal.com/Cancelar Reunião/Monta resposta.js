/**
 * Fluxo n8n: Tintim | Cal - Cancelar Reunião   (webhook: tintim-cal-cancelar)
 * Nó: "Monta resposta"   (tipo: Code, typeVersion 2)
 * Ordem: Recebe pedido (AWSales) -> Cancela no Cal.com -> [ESTE NÓ] -> Responde pra IA
 *
 * O que faz: interpreta a resposta do Cal e devolve { ok } pra IA.
 *   sucesso do Cal      -> { ok: true }
 *   "already cancelled" -> { ok: true, ja_cancelada: true } (objetivo ja atingido, idempotente)
 *   outro erro          -> { ok: false, detalhe }
 *
 * Depende de: no "Cancela no Cal.com" (POST /v2/bookings/{uid}/cancel) com On Error = Continue.
 * Doc: sera a TOOL 3 em ../CONFIG_TOOLS_CAL.md.
 * Estado: construido com o usuario em 2026-07-22 (fluxo Cancelar Reuniao, novo).
 */
const item = $input.first().json || {};

// sucesso do Cal
if (item.status === 'success') {
  return [{ json: { ok: true } }];
}

const msg = String((item.error && item.error.message) || item.message || 'nao_foi_possivel_cancelar');

// ja estava cancelada = objetivo atingido, trata como sucesso
if (/cancel/i.test(msg) && /already/i.test(msg)) {
  return [{ json: { ok: true, ja_cancelada: true } }];
}

return [{ json: { ok: false, detalhe: msg.slice(0, 200) } }];
