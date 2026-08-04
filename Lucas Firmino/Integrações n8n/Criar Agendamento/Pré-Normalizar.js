// =====================================================================
// PRÉ-NORMALIZADOR — Webhook3 -> Tool http1 (UNO /v1/scheduler/create)
// =====================================================================
// Roda ANTES do Tool http. Garante que todo campo opcional do payload
// chegue na UNO com valor válido (string não-vazia), evitando erros
// como "observation is not allowed to be empty" quando a IA não
// preenche o campo na chamada da tool.
//
// serviceId não vem mais da tool da AWSales: a campanha só trabalha com
// Lentes de Porcelana, então o default 1 é o valor real.
//
// Para campos que vierem preenchidos pela IA, mantém o valor original.
// =====================================================================

const webhook = $('Webhook3').first().json;
const body = webhook.body || {};

// --- Helper: retorna valor trimado ou fallback ---
function withDefault(raw, fallback) {
  const v = String(raw || "").trim();
  return v || fallback;
}

// --- Payload pronto pro Tool http consumir ---
// roomId 34 = "Avaliação Inicial I", fixo. Sem ele, a UNO auto-aloca na
// MENOR sala livre do serviceId 1 — e a sala 1 "Dra Izabella Helena" fica
// livre das 09:00 às 16:50, então todo agendamento do meio do dia caía na
// agenda da Izabella e ficava fora da cadência de confirmação da Avaliação.
// Confirmado que o /scheduler/create respeita o roomId (2026-08-03).
const normalized = {
  date: withDefault(body.date, ""),
  hour: withDefault(body.hour, ""),
  roomId: 34,
  name: withDefault(body.name, ""),
  cellPhone: withDefault(body.cellPhone, ""),
  serviceId: withDefault(body.serviceId, "1"),
  observation: withDefault(
    body.observation,
    "Agendamento solicitado via IA WhatsApp - sem observações adicionais do lead"
  )
};

return [{ json: normalized }];
