// =====================================================================
// MONTA RESPOSTA — Registrar UNO -> Respond Sucesso
// =====================================================================
// A UNO devolve 200 em dois formatos diferentes:
//   cadastro novo  -> { deal: { id, name, ... } }
//   duplicidade    -> { message: "Já existe um lead cadastrado com numero X" }
// Duplicidade não bloqueia nada: o lead já está no CRM e a conversa segue.
// =====================================================================

const res = $input.first().json || {};
const dealId = res.deal && res.deal.id;
const duplicado = /j[áa] existe/i.test(String(res.message || ''));

if (dealId) {
  return [{ json: {
    ok: true,
    duplicado: false,
    deal_id: dealId,
    mensagem: 'Lead registrado no CRM com sucesso. Seguir a conversa normalmente.'
  }}];
}

if (duplicado) {
  return [{ json: {
    ok: true,
    duplicado: true,
    mensagem: 'Lead já estava cadastrado no CRM. Não registrar de novo. Seguir a conversa normalmente.'
  }}];
}

return [{ json: {
  ok: false,
  duplicado: false,
  mensagem: 'Resposta inesperada do CRM. Não avisar o lead e seguir a conversa normalmente.'
}}];
