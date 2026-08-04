/**
 * Fluxo n8n: Tintim | Kommo - Card   (webhook: tintim-kommo-card)
 * No: "Filtra handoff"   (tipo: Code, typeVersion 2)
 * Ordem: ... Monta resposta -> [ESTE NO] -> Chama kommo-cal
 *
 * O que faz: e o gatilho do handoff do nao-MQL. Roda em TODA chamada da tool
 * @atualizar_card_no_crm e corta o ramo (return []) quando a etapa nao e "Oferta Enviada"
 * (status_id 106939427). Quando e, monta { telefone, nome, resumo } como STRING (bodyJson)
 * para o no HTTP "Chama kommo-cal" mandar em RAW pro webhook kommo-cal, que registra o
 * custom_action na AWSales e abre a campanha Venda - Nao-MQL.
 *
 * O return [] corta o ramo sem precisar de no IF (padrao do projeto).
 *
 * Doc do fluxo: ../CONFIG_TOOLS_KOMMO.md (ramo de handoff) e ../CONFIG_HANDOFF_NAO_MQL.md
 * Estado: conferido contra o export real do n8n em 2026-07-30.
 *
 * ATENCAO - duas correcoes pendentes neste no (ver pendencias do CONFIG_TOOLS_KOMMO.md):
 * 1. Ele ignora o proprio input. Se a busca no Kommo cair na rota "erro" (401/500) ou se
 *    "Cria card" falhar, o card NAO entra em Oferta Enviada mas o handoff dispara igual, e a
 *    campanha de Venda abre com um lead sem card correspondente. Fix: checar o ok que vem do
 *    "Monta resposta" antes de seguir  ->  if (!$input.first().json.ok) return [];
 * 2. Posicao no canvas: este no esta ACIMA do "Respond to Webhook" (y 624 vs 816). Com
 *    executionOrder v1 o n8n ordena por posicao, entao a cadeia de handoff roda ANTES de a
 *    tool responder pra IA. Subir o "Respond to Webhook" para y < 624.
 */
const p = $('Prepara dados').first().json;
if (p.status_id !== 106939427) {   // 106939427 = Oferta Enviada
  return [];
}
const body = { telefone: p.telefone, nome: p.nome, resumo: p.resumo };
return [{ json: { bodyJson: JSON.stringify(body) } }];
