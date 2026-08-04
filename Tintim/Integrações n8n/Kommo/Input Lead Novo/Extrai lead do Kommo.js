/**
 * Fluxo n8n: Tintim | Input Kommo - Lead Novo   (webhook: kommo-lead-novo)
 * No: "Extrai lead do Kommo"   (tipo: Code, typeVersion 2)
 * Ordem: Webhook5 (kommo-lead-novo) -> [ESTE NO] -> Busca lead no Kommo -> ...
 *
 * O que faz: le o webhook do Kommo, acha os eventos de lead e deixa passar SO os que entraram
 * na etapa gatilho. Qualquer outra etapa vira return [] (corta o ramo sem erro, padrao do
 * projeto). Devolve UM ITEM POR LEAD na mesma execucao - o Kommo agrupa varios leads no mesmo
 * webhook quando mais de um card muda junto. Por isso os Code nodes seguintes iteram sobre
 * $input.all() em vez de $input.first().
 *
 * CONFIG: os dois valores no topo sao o unico lugar onde se decide "de onde vem o lead".
 * Trocar STATUS_GATILHO muda a etapa que dispara a campanha.
 *
 * PAYLOAD REAL (validado em 2026-07-31, automacao do Jorge, user-agent amoCRM-Webhooks/3.0):
 *   content-type: application/x-www-form-urlencoded
 *   body = {
 *     "leads[add][0][id]": "22791302",
 *     "leads[add][0][status_id]": "106939423",
 *     "leads[add][0][pipeline_id]": "13859031",
 *     "account[id]": "32491523",
 *     "account[subdomain]": "tintim"
 *   }
 * Ou seja: o n8n NAO aninha os colchetes, as chaves chegam LITERAIS e planas. O parse plano e o
 * caminho de producao; o aninhado fica como defesa caso o body parser do n8n mude num upgrade.
 *
 * O payload traz SO id, status_id e pipeline_id. Nao vem nome, telefone nem contato - por isso os
 * dois GETs seguintes no fluxo. O nome sai do GET do lead, no "Extrai contato principal".
 *
 * Eventos: o teste real chegou como "add" (lead criado ja na etapa). Lead MOVIDO para a etapa
 * dispara "status". Os dois precisam estar inscritos no Kommo - ver pendencia no doc, porque os
 * leads "de outras origens" que o cliente falou em rotear provavelmente entram por movimentacao,
 * ou seja por "status", nao por "add".
 *
 * Doc do fluxo: ../CONFIG_INPUT_LEAD_NOVO.md
 * Estado: parse validado contra payload real em 2026-07-31.
 */

// ---- CONFIG ----------------------------------------------------------------
const STATUS_GATILHO = 106939423;   // Aguardando Contato (pipe IA [Awsales]). Ver tabela de etapas no doc.
const PIPELINE = 13859031;          // IA [Awsales]
// ---------------------------------------------------------------------------

const body = $input.first().json.body || {};

function coletaEventos(b) {
  const out = [];

  // forma plana (producao): chaves literais "leads[add][0][id]"
  const acc = {};
  for (const k of Object.keys(b)) {
    const m = k.match(/^leads\[(status|add|update)\]\[(\d+)\]\[(\w+)\]$/);
    if (!m) continue;
    const chave = m[1] + ':' + m[2];
    acc[chave] = acc[chave] || { tipo: m[1] };
    acc[chave][m[3]] = b[k];
  }
  const planos = Object.values(acc);
  if (planos.length) return planos;

  // forma aninhada (defesa: se um upgrade do n8n passar a parsear os colchetes)
  const l = b.leads || {};
  for (const tipo of ['status', 'add', 'update']) {
    const arr = l[tipo];
    if (Array.isArray(arr)) {
      arr.forEach(x => out.push(Object.assign({ tipo }, x)));
    } else if (arr && typeof arr === 'object') {
      Object.keys(arr).forEach(k => out.push(Object.assign({ tipo }, arr[k])));
    }
  }
  return out;
}

const eventos = coletaEventos(body);

// pipeline_id nem sempre vem no evento; quando nao vem, nao rejeita por isso
const alvo = eventos.filter(e =>
  Number(e.status_id) === STATUS_GATILHO &&
  (!e.pipeline_id || Number(e.pipeline_id) === PIPELINE)
);

if (!alvo.length) {
  return [];
}

return alvo.map(e => ({ json: {
  lead_id: String(e.id || ''),
  status_id: Number(e.status_id),
  old_status_id: e.old_status_id ? Number(e.old_status_id) : null,
  origem_evento: e.tipo
} }));
