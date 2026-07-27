/**
 * Fluxo n8n: Tintim | Cal - Consultar Horários   (webhook: tintim-cal-horarios)
 * Nó: "Achata e organiza horários"   (tipo: Code, typeVersion 2)
 * Ordem: Recebe pedido (AWSales) -> Consulta horários no Cal.com -> [ESTE NÓ] -> Responde horários pra IA
 *
 * O que faz: trata erro do Cal e agenda vazia; achata os slots por dia e devolve no
 * máximo 15 horários. Quando um dia tem mais de 3 slots, pega manhã / meio / tarde.
 * Retorno pra IA:
 *   sucesso        -> { ok: true, total, horarios: [...] }
 *   Cal fora do ar -> { ok: false, motivo: 'erro_ao_consultar_agenda', horarios: [] }
 *   agenda lotada  -> { ok: false, motivo: 'sem_horario_disponivel', horarios: [] }
 *
 * Doc do fluxo: ../CONFIG_TOOLS_CAL.md (TOOL 1)
 * Estado: conferido contra o export real do n8n em 2026-07-22.
 */
const r = $input.first().json;

if (!r || r.status !== 'success') {
  return [{ json: { ok: false, motivo: 'erro_ao_consultar_agenda', horarios: [] } }];
}

const data = r.data || {};
const horarios = [];
for (const dia of Object.keys(data).sort()) {
  const slots = (data[dia] || []).map(s => s.start);
  if (slots.length <= 3) {
    horarios.push(...slots);
  } else {
    const meio = Math.floor(slots.length / 2);
    horarios.push(slots[0], slots[meio], slots[slots.length - 1]); // manhã, meio, tarde
  }
}
const lista = horarios.slice(0, 15);

if (lista.length === 0) {
  return [{ json: { ok: false, motivo: 'sem_horario_disponivel', horarios: [] } }];
}

return [{ json: { ok: true, total: lista.length, horarios: lista } }];
