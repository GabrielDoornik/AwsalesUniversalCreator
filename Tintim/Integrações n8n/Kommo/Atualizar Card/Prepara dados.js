/**
 * Fluxo n8n: Tintim | Kommo - Card   (webhook: tintim-kommo-card)
 * No: "Prepara dados"   (tipo: Code, typeVersion 2)
 * Ordem: Webhook -> [ESTE NO] -> Busca lead por telefone -> Avalia busca -> Switch -> ...
 *
 * O que faz: normaliza a entrada da IA antes de falar com o Kommo.
 *   - traduz o NOME da etapa (com/sem acento) para o status_id do pipe IA [Awsales] (13859031)
 *   - limpa o telefone (so digitos, E.164 sem +)
 *   - repassa nome/resumo com defaults
 * Etapa desconhecida -> status_id null (o Kommo recusa a criacao; ver pendencias no doc).
 *
 * Doc do fluxo: ../CONFIG_TOOLS_KOMMO.md (secao 2)
 * Estado: conferido contra o export real do n8n em 2026-07-22.
 */
const b = $input.first().json.body || {};

// normaliza (tira acento, minusculo) pra bater a etapa mesmo se vier "Qualificacao"
const norm = (s) => String(s || '')
  .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
  .toLowerCase().trim();

const etapas = {
  'qualificacao': 108380651,
  'reuniao marcada': 108380659,
  'oferta enviada': 106939427,
  'agencia / parceiros': 106939431,
  'handoff humano necessario': 108380655,
  'venda perdida': 143
};

const status_id = etapas[norm(b.etapa)] || null;
const telefone = String(b.telefone || '').replace(/\D/g, ''); // so numeros

return [{ json: {
  telefone,
  nome: b.nome || 'Lead WhatsApp',
  resumo: b.resumo || '',
  etapa: b.etapa,
  status_id,
  pipeline_id: 13859031
} }];
