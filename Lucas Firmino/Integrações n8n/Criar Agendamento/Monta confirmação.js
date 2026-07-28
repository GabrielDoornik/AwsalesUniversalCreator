// =====================================================================
// MONTA CONFIRMAÇÃO — Tool http1 -> Respond Sucesso
// =====================================================================
// A UNO devolve o agendamento cru. Aqui vira o contrato { ok, mensagem }
// usado pelas outras tools, com o que a IA precisa pra confirmar ao lead.
// =====================================================================

const res = $input.first().json || {};

if (!res.appointmentId) {
  return [{ json: {
    ok: false,
    mensagem: 'O CRM não confirmou o agendamento. NÃO afirmar ao lead que está agendado. Consultar os horários de novo e propor outro horário.'
  }}];
}

return [{ json: {
  ok: true,
  appointment_id: res.appointmentId,
  date: res.date,
  hour: res.hour,
  sala: res.room || '',
  mensagem: 'Agendamento confirmado. Confirmar dia e horário ao lead, enviar endereço e estacionamento e pedir documento de identificação.'
}}];
