// =====================================================================
// NORMALIZADOR — Bot AWSales (Lucas Firmino) -> Webhook AWSales (output)
// =====================================================================
// Monta o evento custom_action no formato esperado pelo endpoint
// /api/webhooks/organizations/.../credentials/output-personalizado.
//
// Só roda se a UNO confirmou o agendamento de verdade. "Success" no
// Tool http significa só HTTP 200, e essa API devolve 200 em falha
// lógica também — registrar output sem agendamento marcaria a campanha
// como concluída e o lead ficaria sem ninguém atrás.
//
// Lê do Pré-Normalizar, que já aplicou os defaults dos campos opcionais.
// Email é placeholder porque a tool não coleta email e a AWSales exige
// um email válido.
// =====================================================================

if (!$('Tool http1').first().json.appointmentId) return [];

const dados = $('Pré-Normalizar').first().json;

// --- Normaliza o telefone para o formato internacional +55XXXXXXXXXXX ---
function formatPhone(raw) {
  if (!raw) return "";
  const digits = String(raw).replace(/\D/g, "");
  if (digits.startsWith("55") && digits.length >= 12) return "+" + digits;
  if (digits.length >= 10) return "+55" + digits;
  return "+" + digits;
}

// --- Resolve email: usa o real se vier; senão gera placeholder ---
function resolveEmail(rawEmail, rawPhone) {
  const email = String(rawEmail || "").trim();
  if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return email;
  const digits = String(rawPhone || "").replace(/\D/g, "");
  return digits ? `lead-${digits}@placeholder.awsales.io` : "no-email@placeholder.awsales.io";
}

// --- Timestamp UTC no formato ISO 8601 sem milissegundos ---
const timestamp = new Date().toISOString().replace(/\.\d{3}Z$/, "Z");

return [{ json: {
  event: "custom_action",
  timestamp: timestamp,
  source: {
    id: "agendamento-realizado-dleon",
    name: "Agendamento Realizado"
  },
  lead: {
    phone: formatPhone(dados.cellPhone),
    email: resolveEmail(dados.email, dados.cellPhone),
    name: dados.name || ""
  },
  utm: {
    source: "awsales",
    campaign: "lucas-firmino-sdr",
    medium: "whatsapp",
    content: "",
    term: ""
  },
  metadata: {
    action_details: "Lead solicitou agendamento via bot WhatsApp",
    engagement_level: "high",
    intent_level: "ready",
    emotional_tone: "interessado",
    context_notes: dados.observation
  }
}}];
