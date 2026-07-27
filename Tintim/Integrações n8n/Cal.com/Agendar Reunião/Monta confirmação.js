/**
 * Fluxo n8n: Tintim | Cal - Agendar Reunião   (webhook: tintim-cal-agendar)
 * Nó: "Monta confirmação"   (tipo: Code, typeVersion 2)
 * Ordem: Recebe pedido (AWSales) -> Monta body do booking -> Agenda no Cal.com -> [ESTE NÓ] -> Responde pra IA
 *
 * O que faz: lê a resposta do Cal e monta o retorno pra IA.
 *   sucesso -> { ok:true, uid, inicio (dd/MM/yyyy às HH:mm, America/Sao_Paulo),
 *               link_reuniao (fallback p/ cal.com/booking/{uid} quando organizersDefaultApp
 *               não devolve meetingUrl), consultor (host sorteado no round robin), status }
 *   falha   -> { ok:false, motivo, detalhe }
 *             motivo = 'dados_incompletos' quando o erro do Cal casa a regex de campo
 *             obrigatório/inválido (a Ana escala p/ humano; repropor horário não resolve);
 *             senão 'horario_indisponivel' (a Ana consulta horários e repropõe).
 *
 * Nota: a regex de dados_incompletos NÃO inclui mais 'no_show' (diferente da versão antiga do doc).
 * Doc do fluxo: ../CONFIG_TOOLS_CAL.md (TOOL 2)
 * Estado: conferido contra o export real do n8n em 2026-07-22.
 */
const item = $input.first().json || {};
const d = item.data || {};

// Sucesso: Cal retornou status success com uid
if (item.status === 'success' && d.uid) {
  let inicioLocal = null;
  if (d.start) {
    inicioLocal = DateTime.fromISO(d.start, { zone: 'utc' })
      .setZone('America/Sao_Paulo')
      .toFormat("dd/MM/yyyy 'às' HH:mm");
  }
  // round robin: o Cal devolve o closer sorteado em hosts[0]
  const host = (d.hosts && d.hosts[0]) || {};
  return [{ json: {
    ok: true,
    uid: d.uid,
    inicio: inicioLocal,
    // fallback: com organizersDefaultApp o meetingUrl nem sempre vem
    link_reuniao: d.meetingUrl || d.location || ('https://cal.com/booking/' + d.uid),
    consultor: host.name || null,
    status: d.status
  } }];
}

// Falha: separa horario ocupado de dado obrigatorio recusado
const msg = String((item.error && (item.error.message || item.error)) || item.message || 'nao_foi_possivel_agendar');
const dadosRuins = /booking field|required|invalid|phone|email|responses|not found/i.test(msg);
return [{ json: {
  ok: false,
  motivo: dadosRuins ? 'dados_incompletos' : 'horario_indisponivel',
  detalhe: msg.slice(0, 200)
} }];
