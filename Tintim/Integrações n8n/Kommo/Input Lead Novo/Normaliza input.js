/**
 * Fluxo n8n: Tintim | Input Kommo - Lead Novo   (webhook: kommo-lead-novo)
 * No: "Normaliza input"   (tipo: Code, typeVersion 2, mode Run Once for All Items)
 * Ordem: ... Busca contato no Kommo -> [ESTE NO] -> Registra input na AWSales
 *
 * O que faz: monta o custom_action de INPUT da AWSales a partir do contato do Kommo (telefone e
 * e-mail, que o webhook do Kommo nao manda). Sai como STRING (bodyJson) para o no HTTP mandar em
 * RAW.
 *
 * CONFIG: SOURCE_ID e SOURCE_NAME no topo decidem qual "Produto de atuacao" a AWSales
 * materializa, e portanto qual campanha esse lead abre. E o unico lugar a trocar quando o destino
 * for definido. Ver o doc antes de mexer.
 *
 * ITERA SOBRE TODOS OS ITENS de proposito: um webhook do Kommo pode trazer varios leads. Versao
 * anterior usava $input.first() e mandava so o primeiro pra AWSales, perdendo o resto sem aviso.
 *
 * Alinhamento por indice: o GET de contato emite 1 item por item de entrada (neverError ligado),
 * entao o indice i aqui corresponde ao indice i do "Extrai contato principal" - de onde saem
 * lead_name, lead_id e origem_evento. Nao usar .first() nesse acesso.
 *
 * TELEFONE - ver normalizaTelefoneBR() abaixo. Regra anterior era "10 ou 11 digitos -> prefixa 55",
 * so por comprimento. Ela transformou 55196521078 (numero incompleto do lote de teste de 31/07) em
 * +5555196521078, com 55 duplicado. A regra atual valida contra o plano de numeracao da Anatel em
 * vez de contar digitos, e recupera formatos que a anterior perdia (nono digito, 0 de operadora).
 *
 * E-MAIL: o lote de 31/07 (4 contatos criados pela automacao do Jorge) veio com campo EMAIL
 * preenchido nos quatro, ao contrario do primeiro teste. Ou seja, o input entra com e-mail real e o
 * casamento com o OUTPUT da Vindi tem chance de fechar. Quando faltar, cai no mockado
 * <telefone>@naoinformado.tintim.app. O flag metadata.email_real diz qual dos dois foi usado.
 * Atencao: e-mail de empresa (visto um marketing@ no lote) pode nao bater com o e-mail do
 * comprador no checkout. Ver "Casamento do lead" em ../Vindi/CONFIG_OUTPUT_VINDI.md.
 *
 * DESCARTE: telefone irrecuperavel nao vira input (nao da pra abrir campanha de WhatsApp sem
 * numero), mas NAO some calado - vai pro console.log no fim, com lead_id, nome e motivo, para
 * aparecer no historico de execucoes do n8n e ser corrigido no CRM. Mesmo padrao do normalizador
 * da Hubla no Falcao.
 *
 * Doc do fluxo: ../CONFIG_INPUT_LEAD_NOVO.md
 * Estado: telefone reescrito e testado contra o lote real de 31/07 + bateria de casos BR.
 */

// ---- CONFIG ----------------------------------------------------------------
const SOURCE_ID = 'kommo-lead-novo';        // materializa o Produto de atuacao na AWSales
const SOURCE_NAME = 'Kommo - Lead Novo';
// ---------------------------------------------------------------------------

// ---- TELEFONE BR -----------------------------------------------------------
// Os 67 DDDs que existem (Anatel). Os buracos sao de proposito: 20, 23, 25, 26, 29, 30, 36, 39,
// 40, 50, 52, 56-60, 70, 72, 76, 78, 80 e 90 nunca foram atribuidos ou foram extintos. Validar
// contra esta lista e o que separa "numero de DDD invalido" de "numero so mal digitado".
const DDD_VALIDOS = new Set([
  11,12,13,14,15,16,17,18,19, 21,22,24,27,28, 31,32,33,34,35,37,38,
  41,42,43,44,45,46,47,48,49, 51,53,54,55, 61,62,63,64,65,66,67,68,69,
  71,73,74,75,77,79, 81,82,83,84,85,86,87,88,89, 91,92,93,94,95,96,97,98,99
]);

/**
 * Le um numero nacional (DDD + assinante) e diz se e valido.
 * Celular: 9 digitos comecando em 9.  Fixo: 8 digitos comecando em 2-5.
 * Celular antigo (8 digitos comecando em 6-9) e recuperado com o nono digito - foi obrigatorio
 * em todo o pais a partir de 2016, entao numero velho parado no CRM ainda aparece nesse formato.
 */
function leNacional(s) {
  if (!/^\d+$/.test(s) || (s.length !== 10 && s.length !== 11)) return null;
  const ddd = s.slice(0, 2);
  if (!DDD_VALIDOS.has(Number(ddd))) return null;
  const assinante = s.slice(2);

  if (assinante.length === 9) {
    if (assinante[0] !== '9') return null;              // celular sempre comeca com 9
    return { nsn: s, tipo: 'celular', recuperado: false, prefere: 2 };
  }
  if ('2345'.includes(assinante[0])) {
    return { nsn: s, tipo: 'fixo', recuperado: false, prefere: 1 };
  }
  if ('6789'.includes(assinante[0])) {                  // celular pre-2016, sem o nono digito
    return { nsn: ddd + '9' + assinante, tipo: 'celular', recuperado: true, prefere: 2 };
  }
  return null;
}

/**
 * Normaliza qualquer coisa que o CRM tenha guardado como telefone.
 * Retorna { ok, e164, tipo, recuperado, suspeito, motivo }.
 *
 * Estrategia: em vez de aplicar correcoes em cadeia (onde a ordem importa e um passo estraga o
 * outro), gera TODAS as leituras plausiveis do numero, valida cada uma e escolhe a que exigiu
 * menos correcao. Assim "5511999999999", "11999999999", "011999999999" e "0 15 11 99999-9999"
 * caem todos no mesmo lugar, e um numero que nao tem leitura valida e recusado em vez de virar
 * um E.164 quebrado.
 */
function normalizaTelefoneBR(bruto) {
  const original = String(bruto == null ? '' : bruto).trim();
  const tinhaMais = original.startsWith('+');
  const d = original.replace(/\D/g, '');

  if (!d) return { ok: false, motivo: 'sem telefone', original };

  // Nao geografico / atendimento: nao existe no WhatsApp, nao adianta tentar
  if (/^0?(800|300|500|900)\d+$/.test(d)) {
    return { ok: false, motivo: 'numero nao geografico (0800/0300/0500/0900)', original };
  }
  if (/^(3003|4003|4004|4020)\d{4}$/.test(d)) {
    return { ok: false, motivo: 'numero de atendimento curto (4003/3003)', original };
  }

  // candidatos: texto -> custo (quantas correcoes foram precisas)
  const cand = new Map();
  const poe = (s, custo) => {
    if (s && (!cand.has(s) || cand.get(s) > custo)) cand.set(s, custo);
  };

  poe(d, 0);
  if (d.startsWith('00')) poe(d.slice(2), 1);            // prefixo internacional discado
  if (d.startsWith('0')) {
    poe(d.replace(/^0+/, ''), 1);                        // 0 de tronco
    poe(d.replace(/^0\d{2}/, ''), 2);                    // 0 + codigo de operadora (CSP): 015, 021...
  }
  for (const [s, c] of Array.from(cand)) {               // DDI 55, inclusive duplicado
    if (s.startsWith('55')) poe(s.slice(2), c + 1);
    if (s.startsWith('5555')) poe(s.slice(4), c + 2);
  }

  let melhor = null, melhorCusto = Infinity;
  for (const [s, custo] of cand) {
    const v = leNacional(s);
    if (!v) continue;
    // menor custo vence; empate escolhe celular (a campanha e de WhatsApp) e depois o que nao
    // precisou de recuperacao
    const ganha = custo < melhorCusto ||
      (custo === melhorCusto && melhor && (v.prefere > melhor.prefere ||
        (v.prefere === melhor.prefere && melhor.recuperado && !v.recuperado)));
    if (ganha) { melhor = v; melhorCusto = custo; }
  }

  if (melhor) {
    const assinante = melhor.nsn.slice(2);
    return {
      ok: true,
      e164: '+55' + melhor.nsn,
      tipo: melhor.tipo,
      recuperado: melhor.recuperado,
      // digito unico repetido no assinante = numero de teste/preenchimento. Passa, mas marcado.
      suspeito: new Set(assinante).size === 1,
      original
    };
  }

  // Nao e BR. So aceita como estrangeiro quando veio com + explicito - sem isso, um numero
  // brasileiro mal digitado viraria "internacional" e sairia errado do mesmo jeito.
  if (tinhaMais && !d.startsWith('55') && d.length >= 8 && d.length <= 15) {
    return { ok: true, e164: '+' + d, tipo: 'internacional', recuperado: false, suspeito: false, original };
  }

  return {
    ok: false,
    motivo: `nao ha leitura valida para ${d.length} digitos (DDD inexistente, ou digitos faltando)`,
    original
  };
}
// ---------------------------------------------------------------------------

const pega = (cf, code) => {
  const f = (cf || []).find(x => x.field_code === code);
  return (f && f.values && f.values[0] && f.values[0].value) || '';
};

const ctx = $('Extrai contato principal').all();
const itens = $input.all();
const out = [];
const descartados = [];

for (let i = 0; i < itens.length; i++) {
  const c = itens[i].json.body || itens[i].json;   // o no HTTP roda com fullResponse
  const cf = c.custom_fields_values || [];
  const o = (ctx[i] && ctx[i].json) || {};
  const nome = o.lead_name || c.name || 'Lead WhatsApp';

  const tel = normalizaTelefoneBR(pega(cf, 'PHONE'));
  if (!tel.ok) {
    descartados.push({
      lead_id: o.lead_id || '',
      contato_id: String(c.id || ''),
      nome,
      telefone_no_crm: tel.original,
      motivo: tel.motivo
    });
    continue;
  }

  const emailReal = String(pega(cf, 'EMAIL')).trim();
  const soDigitos = tel.e164.replace(/\D/g, '');

  const payload = {
    event: 'custom_action',
    timestamp: new Date().toISOString(),
    source: { id: SOURCE_ID, name: SOURCE_NAME },
    lead: {
      phone: tel.e164,
      email: emailReal || (soDigitos + '@naoinformado.tintim.app'),
      name: nome
    },
    utm: { source: 'awsales', medium: '', campaign: '', term: '', content: '' },
    metadata: {
      action_details: 'Lead entrou na etapa de nao-MQL do CRM (Kommo) e foi encaminhado para a campanha.',
      intent_level: 'interested',
      context_notes: '',
      kommo_lead_id: o.lead_id || '',
      origem_evento: o.origem_evento || '',
      email_real: !!emailReal,
      // rastro da normalizacao: da pra medir em producao quantos numeros o CRM guarda torto
      telefone_original: tel.original,
      telefone_tipo: tel.tipo,
      telefone_recuperado: tel.recuperado,
      telefone_suspeito: tel.suspeito
    }
  };

  // payload solto = preview legivel no n8n; bodyJson = string que vai em RAW pro AWSales
  out.push({ json: { payload, bodyJson: JSON.stringify(payload) } });
}

// Rastro do que nao entrou, para conferir no historico de execucoes e corrigir no CRM.
if (descartados.length) console.log('Telefone invalido, lead NAO enviado:', JSON.stringify(descartados));

return out;
