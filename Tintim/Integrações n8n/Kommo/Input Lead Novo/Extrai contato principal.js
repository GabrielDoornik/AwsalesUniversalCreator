/**
 * Fluxo n8n: Tintim | Input Kommo - Lead Novo   (webhook: kommo-lead-novo)
 * No: "Extrai contato principal"   (tipo: Code, typeVersion 2, mode Run Once for All Items)
 * Ordem: ... Busca lead no Kommo -> [ESTE NO] -> Busca contato no Kommo -> Normaliza input
 *
 * O que faz: pega o id do contato principal de CADA card e carrega adiante o que o resto do fluxo
 * vai precisar (nome do card, lead_id, tipo do evento).
 *
 * Existe porque o webhook do Kommo nao manda telefone, e o GET /leads/{id}?with=contacts devolve
 * os contatos SO com id/is_main, sem custom fields. Confirmado no retorno real (2026-07-31):
 *   "_embedded": { "contacts": [ { "id": 25296052, "is_main": true, "_links": {...} } ] }
 * Ou seja: precisa de um segundo GET em /contacts/{id} para chegar no telefone, e este no e a
 * ponte entre os dois.
 *
 * ITERA SOBRE TODOS OS ITENS de proposito. O "Extrai lead do Kommo" pode devolver varios leads
 * (o Kommo agrupa no mesmo webhook quando mais de um card muda junto - caso da injecao em lote do
 * estoque de leads). Versao anterior usava $input.first() e descartava do 2o lead em diante sem
 * aviso nenhum.
 *
 * Alinhamento por indice: o no HTTP anterior emite exatamente 1 item de saida por item de entrada
 * (neverError ligado), entao o indice i aqui corresponde ao indice i do "Extrai lead do Kommo".
 * E por isso que origem_evento e lead_id sao copiados adiante aqui: depois do proximo GET esse
 * alinhamento se perde, porque este no pode DESCARTAR itens (card sem contato).
 *
 * O nome sai daqui e nao do webhook: o payload do Kommo nao traz "name", mas o GET do lead traz
 * (visto no teste real: "name": "Pedro Leite"). E o nome do CARD, que e o que o time ve no CRM.
 *
 * Card sem contato -> item descartado (nao da pra abrir campanha de WhatsApp sem telefone). E um
 * DROP SILENCIOSO: o lead simplesmente nao entra na campanha. Ver pendencias no doc.
 *
 * Doc do fluxo: ../CONFIG_INPUT_LEAD_NOVO.md
 * Estado: validado contra retorno real da API em 2026-07-31; multi-item corrigido em 2026-07-31.
 */
const origem = $('Extrai lead do Kommo').all();
const itens = $input.all();
const out = [];

for (let i = 0; i < itens.length; i++) {
  const lead = itens[i].json.body || itens[i].json;   // o no HTTP roda com fullResponse

  const contatos = (lead._embedded && lead._embedded.contacts) || [];
  if (!contatos.length) continue;

  const principal = contatos.find(c => c.is_main) || contatos[0];
  if (!principal || !principal.id) continue;

  const o = (origem[i] && origem[i].json) || {};

  out.push({ json: {
    contato_id: String(principal.id),
    lead_name: lead.name || '',
    lead_id: o.lead_id || String(lead.id || ''),
    origem_evento: o.origem_evento || ''
  } });
}

return out;
