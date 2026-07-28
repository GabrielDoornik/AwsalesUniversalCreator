/**
 * Fluxo n8n: Tintim | Kommo - Card   (webhook: tintim-kommo-card)
 * No: "Monta body"   (tipo: Code, typeVersion 2)
 * Ordem: Switch (nao_achou) -> Busca contato por telefone -> [ESTE NO] -> Cria card
 *
 * O que faz: dedup de contato. Se ja existe contato com o telefone, liga o novo card a ele
 * (por id); senao cria contato novo com o telefone. Monta o body de /leads/complex como STRING
 * (bodyJson) para o no HTTP mandar em RAW (o campo JSON do n8n quebra com objeto aninhado).
 *
 * Nome do no: "Monta body" (ha outro "Monta body do booking" no fluxo do Cal, no mesmo canvas).
 * Doc do fluxo: ../CONFIG_TOOLS_KOMMO.md (secao 8)
 * Estado: conferido contra o export real do n8n em 2026-07-22.
 */
const p = $('Prepara dados').first().json;
const raw = $input.first().json;
const emb = (raw.body || raw)._embedded || {};
const contatos = emb.contacts || [];
const idExistente = contatos[0] && contatos[0].id ? contatos[0].id : null;

const contato = idExistente
  ? { id: idExistente }
  : { name: p.nome, custom_fields_values: [ { field_code: 'PHONE', values: [ { value: p.telefone } ] } ] };

const lead = {
  name: p.nome,
  status_id: p.status_id,
  pipeline_id: p.pipeline_id,
  _embedded: { contacts: [ contato ] }
};

return [{ json: { bodyJson: JSON.stringify([lead]), reusou: !!idExistente } }];
