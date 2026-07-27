// =====================================================================
// ORGANIZA HORÁRIOS — Consultar UNO -> Respond Sucesso
// =====================================================================
// A UNO devolve um item por sala/horário (20+ salas x slot de 10 min),
// ~1.400 registros por dia. Aqui vira lista de horários únicos, já
// filtrada pelo expediente da clínica e pelo horário atual.
//
// Expediente: seg-sex 08:00-19:40 | sáb 08:00-11:40 | dom fechado.
// =====================================================================

const req = $('Webhook1').first().json.body || {};
const res = $input.first().json;

const dateStr = String(req.date || res.date || '').trim();

// --- DD/MM/YYYY -> Date, com validação estrita ---
// Sem o round-trip, entrada torta (24/017/20262, 31/02/2026) vira uma data
// válida pro JS e a IA responde bobagem com cara de resposta certa.
function parseData(s) {
  const m = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(String(s).trim());
  if (!m) return null;
  const d = Number(m[1]);
  const mes = Number(m[2]);
  const ano = Number(m[3]);
  const dt = new Date(ano, mes - 1, d);
  if (dt.getDate() !== d || dt.getMonth() !== mes - 1 || dt.getFullYear() !== ano) return null;
  return dt;
}

// --- "HH:MM" -> minutos ---
function toMin(h) {
  const [hh, mm] = String(h).split(':').map(Number);
  return hh * 60 + mm;
}

// --- Janela de expediente (0 = domingo) ---
function janela(dia) {
  if (dia === 0) return null;
  if (dia === 6) return ['08:00', '11:40'];
  return ['08:00', '19:40'];
}

function vazio(mensagem) {
  return [{ json: { ok: true, date: dateStr, tem_horario: false, horarios: [], sugestoes: [], mensagem } }];
}

const agora = new Date(new Date().toLocaleString('en-US', { timeZone: 'America/Sao_Paulo' }));
const hoje = new Date(agora.getFullYear(), agora.getMonth(), agora.getDate());

const data = parseData(dateStr);
if (!data) return vazio('Data inválida ou fora do formato DD/MM/AAAA. Pedir a data exata ao lead e consultar de novo. Isto NÃO é agenda vazia.');
if (data < hoje) return vazio('Data já passou. Pedir ao lead uma data futura e consultar de novo. Isto NÃO é agenda vazia.');

const limites = janela(data.getDay());
if (!limites) return vazio('A clínica não atende aos domingos. Oferecer outro dia ao lead.');

const [ini, fim] = limites.map(toMin);

// --- Se a data for hoje, descartar horários que já passaram ---
const ehHoje = agora.toDateString() === data.toDateString();
const minAgora = agora.getHours() * 60 + agora.getMinutes();

const horarios = [...new Set((res.hours || []).map(h => h.hour))]
  .filter(h => {
    const m = toMin(h);
    if (m < ini || m > fim) return false;
    if (ehHoje && m <= minAgora) return false;
    return true;
  })
  .sort((a, b) => toMin(a) - toMin(b));

if (!horarios.length) return vazio('Sem horário livre nesta data. NÃO registrar encaixe ainda: consultar as datas próximas seguintes (dias úteis adjacentes e, se o lead pediu sábado, os sábados seguintes), no máximo 2 consultas extras, e oferecer os horários reais que aparecerem. Só registrar encaixe se essas também voltarem vazias.');

// --- Lista apresentável: horário redondo (:00 e :30) ---
// Grade de 10 min é granularidade falsa da UNO. Se a grade redonda vier
// vazia (dia quase lotado), cai pra lista completa — senão a IA registraria
// encaixe achando que a agenda está vazia.
const redondos = horarios.filter(h => h.endsWith(':00') || h.endsWith(':30'));
const apresentaveis = redondos.length ? redondos : horarios;

// --- 1 sugestão por período ---
const periodos = [[0, 720], [720, 1080], [1080, 1440]]; // manhã, tarde, noite
const sugestoes = periodos
  .map(([de, ate]) => apresentaveis.find(h => toMin(h) >= de && toMin(h) < ate))
  .filter(Boolean);

return [{
  json: {
    ok: true,
    date: dateStr,
    dia_semana: res.weekdayString || '',
    tem_horario: true,
    horarios: apresentaveis,
    sugestoes,
    total_livres: horarios.length,
    mensagem: 'Horários livres confirmados. Oferecer 2 ou 3 ao lead, priorizando as sugestões.'
  }
}];
