const input = $input.first().json;
const body = input.body;

// Mapear evento
const eventMap = {
    "form_completed": "form_response",
    "form_started": "form_response_partial"
};

// Formatar telefone com +
const phone = body.student.whatsapp.startsWith("+")
    ? body.student.whatsapp
    : "+" + body.student.whatsapp;

// Montar form_answers a partir das respostas (se existirem)
const formAnswers = (body.responses || []).map((r) => ({
    question_id: "q" + r.display_order,
    question: r.question,
    answer: r.answer
}));

// Montar payload normalizado
const output = {
    event: eventMap[body.event] || body.event,
    timestamp: body.timestamp,
    form: {
        id: body.immersion.id,
        name: body.immersion.name
    },
    lead: {
        phone: phone,
        email: body.student.email,
        name: body.student.name
    },
    utm: {},
    form_answers: formAnswers,
    metadata: {}
};

return [{ json: output }];
