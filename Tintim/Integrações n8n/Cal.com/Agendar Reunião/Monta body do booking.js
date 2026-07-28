/**
 * Fluxo n8n: Tintim | Cal - Agendar Reunião   (webhook: tintim-cal-agendar)
 * Nó: "Monta body do booking"   (tipo: Code, typeVersion 2)
 * Ordem: Recebe pedido (AWSales) -> [ESTE NÓ] -> Agenda no Cal.com -> Monta confirmação -> Responde pra IA
 *
 * O que faz: normaliza os dados do lead antes do POST /v2/bookings e monta o body como
 * STRING (bodyJson) para o nó HTTP mandar em RAW (o campo JSON do n8n re-parseia e quebra
 * com objeto aninhado).
 *   - telefone -> E.164 com + (o campo phone do Cal recusa número sem DDI)
 *   - tomador_decisao -> um dos 3 textos exatos que o select do Cal aceita (fallback "Não")
 *   - title do booking -> "Análise de Parceria IA - {empresa}" (o closer vê a empresa no título)
 *   - metadata -> { src, phone, empresa, tomador } (cópia dos dados p/ relatório/rastreio)
 *
 * Doc do fluxo: ../CONFIG_TOOLS_CAL.md (TOOL 2)
 * Estado: conferido contra o export real do n8n em 2026-07-22.
 */
const b = $input.first().json.body || {};

const norm = (s) => String(s || '')
  .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
  .toLowerCase().trim();

// telefone em E.164 com +. O campo phone do Cal recusa numero sem DDI.
let tel = String(b.telefone || '').replace(/\D/g, '');
if (tel.length >= 10 && tel.length <= 11) tel = '55' + tel;
const telefone = tel ? '+' + tel : '';

// select do Cal: so estes 3 textos exatos passam.
const t = norm(b.tomador_decisao);
let tomador;
if (t.startsWith('sim')) {
  tomador = 'Sim';
} else if (t.includes('garant') || t.includes('esteja na chamada') || t.includes('socio') || t.includes('levar')) {
  tomador = 'Não, mas vou garantir que o tomador de decisão esteja na chamada';
} else if (t.startsWith('nao')) {
  tomador = 'Não';
} else {
  tomador = 'Não';
}

const empresa = b.empresa || 'Não informado';

const body = {
  start: b.start,
  eventTypeId: 2153406,
  attendee: {
    name: b.nome,
    email: b.email,
    timeZone: 'America/Sao_Paulo',
    language: 'pt-BR'
  },
  bookingFieldsResponses: {
    'Nome-da-empresa': empresa,
    phone: telefone,
    tomadordedecisao: tomador,
    title: 'Análise de Parceria IA - ' + empresa
  },
  metadata: { src: 'ia-awsales', phone: telefone, empresa: empresa, tomador: tomador }
};

return [{ json: { bodyJson: JSON.stringify(body) } }];
