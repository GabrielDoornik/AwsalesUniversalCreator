// n8n Code node: normalize Nuestra RX forms-site payloads to AWSales form webhook.
// Mode: Run Once for All Items.
//
// HTTP Request node after this code:
// - Method: POST
// - URL: https://awsales-app.prod.awsales.io/api/webhooks/{organization-id}/credentials/{integration-name}
// - Body: {{$json.awsales_payload}}
// - If n8n does not send object bodies correctly, use Raw body with:
//   {{$json.awsales_payload_json}}
//
// Important workflow rule:
// intake_progress/intake_partial are snapshots only and should not trigger AWSales.
// The Worker now emits intake_abandoned after its own 20-minute durable-object
// timeout by session_id; that event is the confirmed form-abandonment trigger.

const CONFIG = {
  formId: 'nuestra_rx_evaluacion_glp1',
  formName: 'Nuestra RX - Evaluacion GLP-1',
  defaultAbandonmentDelayMinutes: 10,
  includeRawPayloadInMetadata: false,
};

const STEP_LABELS = {
  '4': 'Contato e escolha entre WhatsApp ou continuar no site',
  rxMedsList: 'Medicamentos recetados',
  identidad: 'Fecha de nacimiento',
  heightWeight: 'Altura, peso y peso meta',
  bmiConsent: 'Consentimiento BMI/off-label',
  approach: 'Enfoque actual y condiciones medicas',
  recentHistory: 'Historial medico reciente',
  vitals: 'Signos vitales',
  gastricBypass: 'Bypass gastrico reciente',
  currentMeds: 'Medicamentos actuales',
  injectionAbility: 'Capacidad de auto-inyeccion',
  finalConsents: 'Consentimientos finales',
  processing: 'Procesando evaluacion',
  success: 'Evaluacion completada / seleccion de plan',
};

const VALUE_LABELS = {
  m: 'Hombre',
  male: 'Hombre',
  hombre: 'Hombre',
  f: 'Mujer',
  female: 'Mujer',
  mujer: 'Mujer',
  yes: 'Si',
  si: 'Si',
  no: 'No',
  none: 'Ninguno',
  accept: 'Acepto',
  reject: 'No acepto',
  monthly: 'Plan mensual',
  quarterly: 'Plan trimestral',
  semaglutida: 'Semaglutida+ Personalizada',
  semaglutide: 'Semaglutida+ Personalizada',
  tirzepatida: 'Tirzepatida+ Personalizada',
  tirzepatide: 'Tirzepatida+ Personalizada',
  elevated: 'Elevada',
  slightly_fast: 'Ligeramente rapida',
};

const INITIAL_PROFILE_QUESTION_IDS = new Set([
  'nrx_sex',
  'nrx_age_range',
  'nrx_height_weight_bmi',
  'nrx_contact_state',
]);

const QUESTION_DEFS = [
  {
    id: 'nrx_sex',
    question: 'Cual es tu sexo biologico?',
    paths: ['raw_answers.intake.sexo', 'demographics.biological_sex', 'raw_answers.beluga.sex'],
    transform: labelValue,
  },
  {
    id: 'nrx_age_range',
    question: 'Cuantos anos tienes?',
    paths: ['raw_answers.intake.edad', 'demographics.age_range'],
  },
  {
    id: 'nrx_height_weight_bmi',
    question: 'Cuanto mides y cuanto pesas?',
    rawKeys: ['intake.cm', 'intake.kg', 'intake.height', 'intake.weightLbs', 'intake.bmi', 'beluga.heightUnit', 'beluga.heightFt', 'beluga.heightIn', 'beluga.heightCm', 'beluga.weightUnit', 'beluga.weightKg', 'beluga.weightLb', 'beluga.bmi'],
    get: (body) => compactJoin([
      formatMeasure('Altura', getFirst(body, ['biometrics.height_display', 'raw_answers.intake.height'])),
      formatMeasure('Altura cm', getFirst(body, ['biometrics.height_cm', 'raw_answers.intake.cm', 'raw_answers.beluga.heightCm'])),
      formatMeasure('Peso kg', getFirst(body, ['biometrics.weight_kg', 'raw_answers.intake.kg', 'raw_answers.beluga.weightKg'])),
      formatMeasure('Peso lbs', getFirst(body, ['biometrics.weight_lbs', 'raw_answers.intake.weightLbs', 'raw_answers.beluga.weightLb'])),
      formatMeasure('BMI', getFirst(body, ['biometrics.bmi', 'raw_answers.intake.bmi', 'raw_answers.beluga.bmi'])),
    ], ' | '),
  },
  {
    id: 'nrx_contact_state',
    question: 'En que estado estas?',
    paths: ['address.state_code', 'raw_answers.intake.stateCode'],
  },
  {
    id: 'nrx_takes_rx_meds',
    question: 'Tomas algun medicamento recetado?',
    rawKeys: ['beluga.takesRxMeds', 'beluga.rxMeds', 'beluga.rxMedsOther'],
    get: (body) => compactJoin([
      formatMeasure('Respuesta', labelValue(get(body, 'raw_answers.beluga.takesRxMeds'))),
      formatMeasure('Medicamentos', labelValue(getFirst(body, ['raw_answers.beluga.rxMeds', 'medical_history.current_medications']))),
      formatMeasure('Otro', get(body, 'raw_answers.beluga.rxMedsOther')),
    ], ' | '),
  },
  {
    id: 'nrx_allergies',
    question: 'Tienes alergias conocidas?',
    rawKeys: ['beluga.hasAllergies', 'beluga.allergiesList', 'beluga.allergiesOther'],
    get: (body) => compactJoin([
      formatMeasure('Respuesta', labelValue(get(body, 'raw_answers.beluga.hasAllergies'))),
      formatMeasure('Alergias', labelValue(getFirst(body, ['raw_answers.beluga.allergiesList', 'medical_history.allergies']))),
      formatMeasure('Otra', get(body, 'raw_answers.beluga.allergiesOther')),
    ], ' | '),
  },
  {
    id: 'nrx_date_of_birth',
    question: 'Cual es tu fecha de nacimiento?',
    rawKeys: ['beluga.dobMonth', 'beluga.dobDay', 'beluga.dobYear'],
    get: (body) => getFirst(body, ['demographics.dob']) || formatDob(get(body, 'raw_answers.beluga.dobMonth'), get(body, 'raw_answers.beluga.dobDay'), get(body, 'raw_answers.beluga.dobYear')),
  },
  {
    id: 'nrx_highest_weight',
    question: 'Cual fue tu peso mas alto?',
    rawKeys: ['beluga.highestWeight', 'beluga.highestWeightUnit'],
    get: (body) => compactJoin([
      get(body, 'raw_answers.beluga.highestWeight'),
      get(body, 'raw_answers.beluga.highestWeightUnit'),
    ], ' '),
  },
  {
    id: 'nrx_goal_weight',
    question: 'A que peso quieres llegar?',
    rawKeys: ['beluga.goalWeight', 'beluga.goalWeightUnit'],
    get: (body) => compactJoin([
      getFirst(body, ['goals.weight_loss_goal', 'raw_answers.beluga.goalWeight']),
      get(body, 'raw_answers.beluga.goalWeightUnit'),
    ], ' '),
  },
  {
    id: 'nrx_bmi_consent',
    question: 'Consentimiento de uso off-label por BMI 25-29',
    paths: ['raw_answers.beluga.bmiConsent'],
    transform: labelValue,
  },
  {
    id: 'nrx_weight_management_approach',
    question: 'Como describirias tu enfoque actual sobre el peso?',
    paths: ['raw_answers.beluga.approach'],
    transform: labelValue,
  },
  {
    id: 'nrx_conditions',
    question: 'Marca todas las condiciones actuales o pasadas',
    paths: ['raw_answers.beluga.conditions', 'medical_history.conditions_quick', 'medical_history.conditions_detail'],
    transform: labelValue,
  },
  {
    id: 'nrx_gallstone_consent',
    question: 'Consentimiento por calculos biliares',
    paths: ['raw_answers.beluga.gallstoneConsent'],
    transform: labelValue,
  },
  {
    id: 'nrx_cholecystectomy_consent',
    question: 'Consentimiento por vesicula removida',
    paths: ['raw_answers.beluga.cholecystectomyConsent'],
    transform: labelValue,
  },
  {
    id: 'nrx_thyroid_consent',
    question: 'Consentimiento por problemas tiroideos',
    paths: ['raw_answers.beluga.thyroidConsent'],
    transform: labelValue,
  },
  {
    id: 'nrx_gastric_bypass_recent',
    question: 'Has tenido bypass gastrico en los ultimos 6 meses?',
    paths: ['raw_answers.beluga.gastricBypass', 'medical_history.gastric_bypass_recent'],
    transform: labelValue,
  },
  {
    id: 'nrx_prior_weight_loss_surgery',
    question: 'Has tenido alguna cirugia de perdida de peso previa?',
    paths: ['raw_answers.beluga.priorWLS'],
    transform: labelValue,
  },
  {
    id: 'nrx_opiates_recent',
    question: 'En los ultimos 3 meses, has tomado opioides?',
    paths: ['raw_answers.beluga.opiates'],
    transform: labelValue,
  },
  {
    id: 'nrx_blood_pressure',
    question: 'Presion arterial',
    paths: ['raw_answers.beluga.bp'],
    transform: labelValue,
  },
  {
    id: 'nrx_heart_rate',
    question: 'Frecuencia cardiaca',
    paths: ['raw_answers.beluga.hr'],
    transform: labelValue,
  },
  {
    id: 'nrx_glp1_drug_allergies',
    question: 'Eres alergico a medicamentos GLP-1/GIP?',
    paths: ['raw_answers.beluga.drugAllergies', 'medical_history.drug_allergies_glp1'],
    transform: labelValue,
  },
  {
    id: 'nrx_current_meds_detail',
    question: 'Medicamentos actuales detallados',
    paths: ['raw_answers.beluga.currentMeds', 'medical_history.current_medications'],
    transform: labelValue,
  },
  {
    id: 'nrx_injection_ability',
    question: 'Puedes inyectarte de forma segura o tener ayuda confiable?',
    paths: ['raw_answers.beluga.injectionAbility', 'medical_history.can_self_inject'],
    transform: labelValue,
  },
  {
    id: 'nrx_last_dose_timing',
    question: 'Cuando fue la ultima vez que tomaste medicamento de perdida de peso?',
    paths: ['raw_answers.beluga.lastDoseTiming'],
    transform: labelValue,
  },
  {
    id: 'nrx_dose_decrease_consent',
    question: 'Acepta reiniciar con dosis reducida?',
    paths: ['raw_answers.beluga.doseDecreaseConsent'],
    transform: labelValue,
  },
  {
    id: 'nrx_restart_consent',
    question: 'Acepta reiniciar desde dosis inicial?',
    paths: ['raw_answers.beluga.restartConsent'],
    transform: labelValue,
  },
  {
    id: 'nrx_last_dose_date',
    question: 'Fecha aproximada de ultimo uso del medicamento',
    paths: ['raw_answers.beluga.lastDoseDate'],
  },
  {
    id: 'nrx_last_dose_match',
    question: 'Medicamento y dosis mas reciente',
    paths: ['raw_answers.beluga.lastDoseMatch'],
    transform: labelValue,
  },
  {
    id: 'nrx_med_form',
    question: 'Medicamento de marca o compuesto?',
    paths: ['raw_answers.beluga.medForm'],
    transform: labelValue,
  },
  {
    id: 'nrx_compound_details',
    question: 'Detalles del medicamento compuesto',
    paths: ['raw_answers.beluga.compoundDetails'],
  },
  {
    id: 'nrx_side_effects',
    question: 'Efectos secundarios',
    paths: ['raw_answers.beluga.sideEffects'],
    transform: labelValue,
  },
  {
    id: 'nrx_response_to_med',
    question: 'Como esta respondiendo al medicamento?',
    paths: ['raw_answers.beluga.responseToMed'],
    transform: labelValue,
  },
  {
    id: 'nrx_dose_preference',
    question: 'Como desea continuar el tratamiento?',
    paths: ['raw_answers.beluga.dosePreference'],
    transform: labelValue,
  },
  {
    id: 'nrx_rx_photo',
    question: 'Tiene foto de la receta actual?',
    paths: ['raw_answers.beluga.rxPhoto'],
    transform: labelValue,
  },
  {
    id: 'nrx_rx_photo_consent',
    question: 'Consentimiento o decision sobre foto de receta',
    paths: ['raw_answers.beluga.rxPhotoConsent'],
    transform: labelValue,
  },
  {
    id: 'nrx_other_questions',
    question: 'Que otra informacion o preguntas tiene para el doctor?',
    paths: ['raw_answers.beluga.otherQuestions'],
  },
  {
    id: 'nrx_individualized_consent',
    question: 'Consentimiento de tratamiento individualizado',
    paths: ['raw_answers.beluga.individualizedConsent'],
    transform: labelValue,
  },
  {
    id: 'nrx_truthfulness_consent',
    question: 'Consentimiento de veracidad de informacion',
    paths: ['raw_answers.beluga.truthfulnessConsent'],
    transform: labelValue,
  },
  {
    id: 'nrx_glp_consent',
    question: 'Consentimiento GLP-1 / GIP',
    paths: ['raw_answers.beluga.glpConsent'],
    transform: labelValue,
  },
  {
    id: 'nrx_selected_treatment',
    question: 'Tratamiento seleccionado',
    paths: ['plan_selection.medication', 'treatment_selection.medication', 'raw_answers.intake.treatment'],
    transform: labelValue,
  },
  {
    id: 'nrx_selected_plan',
    question: 'Plan seleccionado',
    paths: ['plan_selection.plan', 'treatment_selection.plan', 'raw_answers.intake.plan'],
    transform: labelValue,
  },
];

const FALLBACK_SKIP_RAW_KEYS = new Set([
  'intake.fname',
  'intake.lname',
  'intake.phone',
  'intake.phoneCountry',
  'intake.whatsappUrl',
  'intake.email',
  'intake.dosableSessionId',
  'intake.dosableLeadId',
  'intake.planPrice',
  'beluga.email',
  'beluga.phone',
  'beluga.prefilledFromLead',
]);

function unwrapPayload(input) {
  let candidate = input && input.json ? input.json : input;

  if (Array.isArray(candidate)) {
    candidate = candidate[0] || {};
  }

  if (candidate && candidate.body && (candidate.body.event || candidate.body.contact || candidate.body.resume)) {
    return candidate.body;
  }

  if (candidate && candidate.event) {
    return candidate;
  }

  if (candidate && candidate.data && candidate.data.body) {
    return candidate.data.body;
  }

  return candidate || {};
}

function normalizeItem(inputItem) {
  const rawInput = inputItem && inputItem.json ? inputItem.json : inputItem;
  const body = unwrapPayload(inputItem);
  const eventKind = getEventKind(body);
  const awsalesEvent = getAwsalesEvent(body, eventKind);
  const timestamp = normalizeTimestamp(getFirst(body, ['abandon.detected_at', 'submitted_at', 'timestamp', 'created_at']));
  const lead = buildLead(body);
  const formAnswers = buildFormAnswers(body);
  const metadata = buildMetadata(body, eventKind, formAnswers.length);

  const awsalesPayload = stripUndefined({
    event: awsalesEvent,
    timestamp,
    form: {
      id: CONFIG.formId,
      name: CONFIG.formName,
    },
    lead,
    utm: buildUtm(body),
    form_answers: formAnswers,
    metadata,
  });

  if (CONFIG.includeRawPayloadInMetadata) {
    awsalesPayload.metadata.raw_payload = rawInput;
  }

  const routing = buildRouting(body, eventKind, awsalesPayload);
  const missing = requiredMissing(awsalesPayload);

  return {
    awsales_payload: awsalesPayload,
    awsales_payload_json: JSON.stringify(awsalesPayload),
    routing,
    diagnostics: {
      valid_for_awsales: missing.length === 0,
      missing_required_fields: missing,
      source_event: body.event || null,
      source_step: get(body, 'resume.step'),
      source_stage: get(body, 'resume.stage'),
      answers_count: formAnswers.length,
    },
  };
}

function buildLead(body) {
  const firstName = getFirst(body, ['contact.first_name', 'raw_answers.intake.fname']);
  const lastName = getFirst(body, ['contact.last_name', 'raw_answers.intake.lname']);
  const fullName = compactJoin([firstName, lastName], ' ');

  return stripUndefined({
    phone: getFirst(body, ['contact.phone_e164', 'raw_answers.intake.phone', 'raw_answers.beluga.phone']),
    email: getFirst(body, ['contact.email', 'raw_answers.intake.email', 'raw_answers.beluga.email']),
    name: fullName || undefined,
  });
}

function buildUtm(body) {
  return stripUndefined({
    source: get(body, 'tracking.utm_source'),
    medium: get(body, 'tracking.utm_medium'),
    campaign: get(body, 'tracking.utm_campaign'),
    content: get(body, 'tracking.utm_content'),
    term: get(body, 'tracking.utm_term'),
  });
}

function buildFormAnswers(body) {
  const answers = [];
  const coveredRawKeys = collectCoveredRawKeys();

  for (const def of QUESTION_DEFS) {
    const answerValue = getAnswerValue(body, def);
    if (isBlank(answerValue)) continue;

    answers.push({
      question_id: def.id,
      question: def.question,
      answer: stringifyAnswer(answerValue),
    });
  }

  addRawFallbackAnswers(body, answers, coveredRawKeys);

  return answers;
}

function getAnswerValue(body, def) {
  if (isInitialProfileOnly(body) && !INITIAL_PROFILE_QUESTION_IDS.has(def.id)) {
    return null;
  }

  let value = null;

  if (typeof def.get === 'function') {
    value = def.get(body);
  } else {
    value = getFirst(body, def.paths || []);
  }

  if (isBlank(value)) return null;
  return typeof def.transform === 'function' ? def.transform(value) : value;
}

function addRawFallbackAnswers(body, answers, coveredRawKeys) {
  const rawAnswers = get(body, 'raw_answers');
  if (!isPlainObject(rawAnswers)) return;

  const profileOnly = isInitialProfileOnly(body);

  for (const [blockName, block] of Object.entries(rawAnswers)) {
    if (!isPlainObject(block)) continue;
    if (profileOnly && blockName !== 'intake') continue;

    for (const [key, value] of Object.entries(block)) {
      const rawKey = `${blockName}.${key}`;

      if (coveredRawKeys.has(rawKey)) continue;
      if (FALLBACK_SKIP_RAW_KEYS.has(rawKey) || FALLBACK_SKIP_RAW_KEYS.has(key)) continue;
      if (isBlank(value)) continue;

      answers.push({
        question_id: `raw_${safeId(blockName)}_${safeId(key)}`,
        question: `Campo bruto ${blockName}.${key}`,
        answer: stringifyAnswer(labelValue(value)),
      });
    }
  }
}

function isInitialProfileOnly(body) {
  return String(get(body, 'resume.stage') || '') === 'parent' && String(get(body, 'resume.step') || '') === '4';
}

function collectCoveredRawKeys() {
  const keys = new Set(FALLBACK_SKIP_RAW_KEYS);

  for (const def of QUESTION_DEFS) {
    for (const rawKey of def.rawKeys || []) {
      keys.add(rawKey);
    }

    for (const path of def.paths || []) {
      const match = path.match(/^raw_answers\.([^.\s]+)\.([^.\s]+)$/);
      if (match) keys.add(`${match[1]}.${match[2]}`);
    }
  }

  return keys;
}

// Encurta o checkout_url para so products + cc_custom_created (Willian confirmou que basta isso).
// Remove firstName/lastName/emailAddress/shipState/phoneNumber/utm_* para o link ficar curto.
// Fallback seguro: se faltar products ou cc_custom_created, mantem a URL original.
function shortenCheckout(url) {
  if (isBlank(url)) return url;
  const s = String(url);
  const base = s.split('?')[0];
  const query = s.slice(base.length + 1);
  if (!query) return url;
  const params = {};
  for (const pair of query.split('&')) {
    const idx = pair.indexOf('=');
    if (idx === -1) continue;
    params[pair.slice(0, idx)] = pair.slice(idx + 1);
  }
  const products = params['products'];
  const cc = params['cc_custom_created'];
  if (isBlank(products) || isBlank(cc)) return url;
  return `${base}?products=${products}&cc_custom_created=${cc}`;
}

function buildMetadata(body, eventKind, answersCount) {
  const resumeUrl = getFirst(body, ['resume.cross_device_url', 'resume.url']);
  const checkoutUrl = shortenCheckout(get(body, 'checkout_url'));
  const treatment = getFirst(body, ['plan_selection.medication', 'treatment_selection.medication', 'raw_answers.intake.treatment']);
  const plan = getFirst(body, ['plan_selection.plan', 'treatment_selection.plan', 'raw_answers.intake.plan']);
  const step = get(body, 'resume.step');
  const stage = get(body, 'resume.stage');
  const profileOnly = isInitialProfileOnly(body);
  // intake_partial_wa chega com stage=parent/step=4 (profileOnly=true), mas o lead JA escolheu
  // medicamento/plano antes de clicar "Continuar por WhatsApp". Manter a escolha no metadata
  // pra IA nao re-perguntar medicamento/plano nesse handoff.
  const keepTreatment = !profileOnly || (eventKind === 'wa_button_handoff' && !isBlank(treatment));

  const full = stripUndefined({
    nrx_event: get(body, 'event'),
    nrx_event_version: get(body, 'event_version'),
    event_kind: eventKind,
    recovery_type: eventKind,
    recommended_recovery_url: checkoutUrl || resumeUrl,
    form_resume_url: resumeUrl,
    checkout_url: checkoutUrl,
    resume_stage: stage,
    resume_step: step,
    resume_step_label: STEP_LABELS[String(step)] || undefined,
    resume_updated_at: get(body, 'resume.updated_at'),
    resume_cross_device_token: get(body, 'resume.cross_device_token'),
    resume_cross_device_ttl_seconds: get(body, 'resume.cross_device_ttl_seconds'),
    session_id: get(body, 'tracking.session_id'),
    dosable_lead_id: get(body, 'tracking.dosable_lead_id'),
    dosable_session_id: get(body, 'tracking.dosable_session_id'),
    progress_trigger: get(body, 'progress_trigger'),
    abandon_reason: get(body, 'abandon.reason'),
    abandon_idle_seconds: get(body, 'abandon.idle_seconds'),
    abandon_last_step: get(body, 'abandon.last_step'),
    abandon_last_event: get(body, 'abandon.last_event'),
    abandon_detected_at: get(body, 'abandon.detected_at'),
    wa_redirect: get(body, 'wa_redirect'),
    handoff_channel: get(body, 'handoff_channel'),
    source_page: get(body, 'source.page'),
    source_url: get(body, 'source.url'),
    source_lang: get(body, 'source.lang'),
    source_referrer: get(body, 'source.referrer'),
    lead_first_name: getFirst(body, ['contact.first_name', 'raw_answers.intake.fname']),
    lead_last_name: getFirst(body, ['contact.last_name', 'raw_answers.intake.lname']),
    // Email/telefone espelhados no metadata (alem de lead.email/lead.phone): a IA copia o
    // metadata para o contact da tool de forma confiavel, mas nao le lead.email direito e
    // re-pergunta o email (casos reais Ana Rivas e Marizol/Keila, 2026-06). O mirror mata o
    // re-perguntar. Email tambem fica em lead.email; aqui e redundancia proposital no campo critico.
    lead_email: getFirst(body, ['contact.email', 'raw_answers.intake.email', 'raw_answers.beluga.email']),
    lead_phone: getFirst(body, ['contact.phone_e164', 'raw_answers.intake.phone', 'raw_answers.beluga.phone']),
    phone_country: get(body, 'contact.phone_country'),
    whatsapp_url: get(body, 'contact.whatsapp_url'),
    lead_state: get(body, 'address.state_code'),
    lead_zip: get(body, 'address.zip'),
    lead_country: get(body, 'address.country'),
    biological_sex: labelValue(get(body, 'demographics.biological_sex')),
    age_range: get(body, 'demographics.age_range'),
    dob: profileOnly ? undefined : get(body, 'demographics.dob'),
    height_cm: get(body, 'biometrics.height_cm'),
    height_display: get(body, 'biometrics.height_display'),
    weight_kg: get(body, 'biometrics.weight_kg'),
    weight_lbs: get(body, 'biometrics.weight_lbs'),
    bmi: get(body, 'biometrics.bmi'),
    bmi_class: get(body, 'biometrics.bmi_class'),
    goal_weight: profileOnly ? undefined : getFirst(body, ['goals.weight_loss_goal', 'raw_answers.beluga.goalWeight']),
    goal_weight_unit: profileOnly ? undefined : get(body, 'raw_answers.beluga.goalWeightUnit'),
    highest_weight: profileOnly ? undefined : get(body, 'raw_answers.beluga.highestWeight'),
    highest_weight_unit: profileOnly ? undefined : get(body, 'raw_answers.beluga.highestWeightUnit'),
    current_medications: profileOnly ? undefined : labelValue(getFirst(body, ['medical_history.current_medications', 'raw_answers.beluga.rxMeds'])),
    allergies: profileOnly ? undefined : labelValue(getFirst(body, ['medical_history.allergies', 'raw_answers.beluga.allergiesList'])),
    weight_management_approach: profileOnly ? undefined : labelValue(get(body, 'raw_answers.beluga.approach')),
    medical_conditions: profileOnly ? undefined : labelValue(getFirst(body, ['raw_answers.beluga.conditions', 'medical_history.conditions_quick', 'medical_history.conditions_detail'])),
    glp1_drug_allergies: profileOnly ? undefined : labelValue(getFirst(body, ['medical_history.drug_allergies_glp1', 'raw_answers.beluga.drugAllergies'])),
    // Gravidez no metadata: a IA repassa metadata de forma confiavel a tool (o form_answers
    // ela manda vazio as vezes). O normalizador da tool preenche o answer 6404 a partir
    // daqui (metadata.pregnancy_status), evitando perguntar gravidez a leads mulheres.
    pregnancy_status: profileOnly ? undefined : getFirst(body, ['medical_history.pregnancy_status', 'raw_answers.beluga.pregnancy']),
    // Espelhados no metadata para a tool nao re-perguntar (a IA manda form_answers vazio):
    // bypass gastrico (hard stop ja respondido no form) e uso previo de GLP-1.
    gastric_bypass: profileOnly ? undefined : getFirst(body, ['medical_history.gastric_bypass_recent', 'raw_answers.beluga.gastricBypass']),
    prior_glp1_use: profileOnly ? undefined : getFirst(body, ['medical_history.prior_glp1_use', 'raw_answers.beluga.priorGlp1Use']),
    selected_medication: keepTreatment ? labelValue(treatment) : undefined,
    selected_plan: keepTreatment ? labelValue(plan) : undefined,
    plan_price: keepTreatment ? get(body, 'raw_answers.intake.planPrice') : undefined,
    eligibility_qualified: get(body, 'eligibility.qualified'),
    eligibility_state_supported: get(body, 'eligibility.state_supported'),
    can_self_inject_from_raw: profileOnly ? undefined : labelValue(get(body, 'raw_answers.beluga.injectionAbility')),
    can_self_inject_normalized: profileOnly ? undefined : get(body, 'medical_history.can_self_inject'),
    final_consents_from_raw: profileOnly ? undefined : stripUndefined({
      individualized: labelValue(get(body, 'raw_answers.beluga.individualizedConsent')),
      truthfulness: labelValue(get(body, 'raw_answers.beluga.truthfulnessConsent')),
      glp: labelValue(get(body, 'raw_answers.beluga.glpConsent')),
    }),
    form_version: get(body, 'meta.form_version'),
    answers_count: answersCount,
  });

  // Metadata ENXUTO para o handoff via botao WhatsApp (intake_partial_wa). O lead clicou
  // "Continuar por WhatsApp" no step 4 (so perfil), entao o full vem cheio de ruido pra IA:
  // source_*, tracking, resume tokens/ttl, wa_redirect, handoff_channel, form_version,
  // age_range, bmi_class, height_display (aspa de polegada 5'6" quebra o JSON que a IA copia).
  // Mantemos so o objetivo: identificar o lead (nome/estado), biometria pra avaliacao medica,
  // escolha de tratamento se houver, e url de retomada. Email/telefone/nome ficam em `lead`.
  if (eventKind === 'wa_button_handoff') {
    const KEEP_WA = [
      'nrx_event', 'event_kind', 'recovery_type',
      'form_resume_url',
      'dosable_lead_id', 'dosable_session_id',
      'lead_first_name', 'lead_last_name', 'lead_email', 'lead_phone', 'lead_state',
      'biological_sex',
      'height_cm', 'weight_lbs', 'bmi',
      'selected_medication', 'selected_plan', 'plan_price',
    ];

    const leanWa = {};

    for (const key of KEEP_WA) {
      if (full[key] !== undefined) leanWa[key] = full[key];
    }

    return leanWa;
  }

  // Metadata ENXUTO para a familia de abandono (form_abandonment_confirmed, form_abandonment,
  // checkout_abandonment) - os eventos que ENVIAM pra campanha de Recuperacao de Formulario.
  // Mantem: link de retomada + onde parou + backfill medico + identidade. Corta: debug,
  // analytics, duplicados, derivaveis (bmi_class, weight_kg, age_range), session_id/whatsapp_url,
  // os flags de elegibilidade (sao false so porque o form ficou incompleto, nao porque o lead
  // e inelegivel ou o estado e bloqueado - quem decide isso e o checkpoint pelos dados clinicos),
  // can_self_inject_normalized (default nao-sincronizado que contradiz o _from_raw), plan_price
  // (preco e dominio do checkpoint) e o height_display (a aspa de polegada 5'1" quebra o JSON
  // que a IA copia pra tool - mesmo bug de 2026-06-10).
  if (['form_abandonment_confirmed', 'form_abandonment', 'checkout_abandonment'].includes(eventKind)) {
    const KEEP_ABANDON = [
      'nrx_event', 'event_kind',
      'form_resume_url', 'checkout_url',
      'resume_stage', 'resume_step', 'resume_step_label',
      'dosable_lead_id', 'dosable_session_id',
      'lead_first_name', 'lead_last_name', 'lead_email', 'lead_phone', 'lead_state',
      'biological_sex', 'dob',
      'height_cm', 'weight_lbs', 'bmi',
      'goal_weight', 'goal_weight_unit',
      'highest_weight', 'highest_weight_unit',
      'current_medications', 'allergies', 'weight_management_approach',
      'medical_conditions', 'glp1_drug_allergies',
      'pregnancy_status', 'gastric_bypass', 'prior_glp1_use',
      'can_self_inject_from_raw',
      'final_consents_from_raw',
      'selected_medication', 'selected_plan',
    ];

    const leanAbandon = {};

    for (const key of KEEP_ABANDON) {
      if (full[key] !== undefined) leanAbandon[key] = full[key];
    }

    return leanAbandon;
  }

  if (eventKind !== 'checkout_reached') return full;

  // Metadata ENXUTO para o evento de checkout (input da campanha de Recuperacao de Vendas).
  // Motivo: o campo metadata da tool e copiado pela PROPRIA IA (input_type: llm) em cada
  // chamada. Com ~50 campos a LLM trunca/quebra a serializacao (caso real 2026-06-10:
  // height_display com aspa de polegada 5'7" gerou JSON invalido, o parse falhou e o
  // backfill inteiro morreu -> tool pediu dados que ja existiam). Menos campos = copia
  // confiavel. height_display fica FORA de proposito (a aspa quebra o JSON); height_cm
  // basta, o normalizador da tool converte cm -> pes.
  const KEEP = [
    'nrx_event', 'event_kind', 'recovery_type',
    'checkout_url', 'form_resume_url',
    'dosable_lead_id', 'dosable_session_id',
    'lead_first_name', 'lead_last_name', 'lead_email', 'lead_phone', 'lead_state',
    'biological_sex', 'dob',
    'height_cm', 'weight_lbs',
    'highest_weight', 'highest_weight_unit',
    'allergies', 'medical_conditions', 'current_medications',
    'weight_management_approach', 'glp1_drug_allergies',
    'pregnancy_status', 'gastric_bypass', 'prior_glp1_use',
    'can_self_inject_from_raw',
    'final_consents_from_raw',
    'selected_medication', 'selected_plan', 'plan_price',
  ];

  const lean = {};

  for (const key of KEEP) {
    if (full[key] !== undefined) lean[key] = full[key];
  }

  return lean;
}

function buildRouting(body, eventKind, awsalesPayload) {
  const submittedAt = awsalesPayload.timestamp;
  const delayMinutes = getDelayMinutes(eventKind);
  const dueAt = delayMinutes > 0 ? addMinutesIso(submittedAt, delayMinutes) : null;
  const stateKey = getStateKey(body, awsalesPayload.lead);
  const recoveryUrl = get(body, 'checkout_url') || getFirst(body, ['resume.cross_device_url', 'resume.url']);
  const isWaHandoff = eventKind === 'whatsapp_handoff';
  const shouldSendNow = eventKind === 'form_abandonment_confirmed' || eventKind === 'checkout_reached' || eventKind === 'wa_button_handoff';
  const shouldEverSend = !isWaHandoff &&
    !['contact_captured', 'form_progress_snapshot', 'form_completed_no_checkout'].includes(eventKind);

  return stripUndefined({
    event_kind: eventKind,
    should_send_to_awsales_now: shouldSendNow,
    should_send_after_debounce: shouldEverSend && !shouldSendNow,
    debounce_minutes: delayMinutes,
    abandonment_check_at: dueAt,
    state_key: stateKey,
    dedupe_key: buildDedupeKey(stateKey, awsalesPayload),
    recovery_url: recoveryUrl,
    recommended_action: getRecommendedAction(eventKind),
    reason: getRoutingReason(eventKind),
  });
}

function getEventKind(body) {
  const sourceEvent = get(body, 'event');
  const step = String(get(body, 'resume.step') || '');
  const hasCheckoutUrl = !isBlank(get(body, 'checkout_url'));
  const isWaHandoff =
    sourceEvent === 'intake_partial' &&
    (get(body, '_source') === 'wa-handoff' || get(body, 'wa_redirect') === true || get(body, 'handoff_channel') === 'whatsapp');

  // intake_partial_wa = lead clicou "Continuar la atención por WhatsApp con un agente" depois
  // de preencher o perfil (nome, email, telefone, estado, tratamento). Willian criou esse
  // evento dedicado (2026-06-18). DEVE enviar agora pra AWSales, para o lead chegar com o
  // contato/metadata (especialmente o EMAIL) e a IA nao coletar do zero (raiz do bug "N/A").
  if (sourceEvent === 'intake_partial_wa') return 'wa_button_handoff';
  if (isWaHandoff) return 'whatsapp_handoff';
  if (sourceEvent === 'intake_abandoned') return 'form_abandonment_confirmed';
  // intake_plan_selected = lead chegou no checkout (ja traz checkout_url). E o OUTPUT
  // da campanha de recuperacao de formulario: objetivo cumprido, parar de insistir.
  if (sourceEvent === 'intake_plan_selected') return 'checkout_reached';
  if (hasCheckoutUrl) return 'checkout_abandonment';
  if (sourceEvent === 'intake_submitted' || sourceEvent === 'intake_completed') return 'form_completed_no_checkout';
  if (sourceEvent === 'intake_progress' && (step === 'processing' || step === 'success')) return 'form_completed_no_checkout';
  if (sourceEvent === 'intake_progress') return 'form_progress_snapshot';
  if (sourceEvent === 'intake_partial') return 'contact_captured';
  return 'form_abandonment';
}

function getAwsalesEvent(body, eventKind) {
  const sourceEvent = get(body, 'event');

  if (eventKind === 'checkout_reached') return 'form_response';
  if (eventKind === 'checkout_abandonment') return 'form_response';
  if (eventKind === 'form_completed_no_checkout') return 'form_response';
  if (sourceEvent === 'intake_submitted' || sourceEvent === 'intake_completed') return 'form_response';
  return 'form_response_partial';
}

function getDelayMinutes(eventKind) {
  if (eventKind === 'form_abandonment_confirmed') return 0;
  if (eventKind === 'form_abandonment') return CONFIG.defaultAbandonmentDelayMinutes;
  if (eventKind === 'checkout_abandonment') return CONFIG.defaultAbandonmentDelayMinutes;
  return 0;
}

function getRecommendedAction(eventKind) {
  const actions = {
    form_abandonment_confirmed: 'Send awsales_payload now. The Worker already waited 20 minutes and emitted intake_abandoned.',
    checkout_reached: 'Send awsales_payload now as the campaign OUTPUT. Lead reached checkout (has checkout_url); stop the form-recovery campaign.',
    form_abandonment: 'Store latest state, wait 10 minutes without newer payload, then send awsales_payload.',
    contact_captured: 'Store context only. Do not trigger AWSales because the lead only captured contact and may continue.',
    form_progress_snapshot: 'Store/debug only. Do not trigger AWSales because intake_progress is a progress/autosave snapshot.',
    checkout_abandonment: 'Store latest checkout state, wait 10 minutes without purchase/output event, then send awsales_payload.',
    whatsapp_handoff: 'Store context only. Do not start outbound WhatsApp because the site already opens WhatsApp to the IA.',
    wa_button_handoff: 'Send awsales_payload now. Lead clicked the "Continuar por WhatsApp" button (intake_partial_wa) with profile + treatment filled; populate the lead with contact (EMAIL!) and metadata so the IA does not collect from scratch and does not fill "N/A".',
    form_completed_no_checkout: 'Store context and wait for plan_selected/checkout_url or an explicit submitted event rule.',
  };

  return actions[eventKind] || actions.form_abandonment;
}

function getRoutingReason(eventKind) {
  const reasons = {
    form_abandonment_confirmed: 'The Worker durable object timed out by session_id and emitted intake_abandoned after 20 minutes.',
    checkout_reached: 'Lead selected plan and generated checkout_url; the form-recovery objective is complete (output event).',
    form_abandonment: 'The lead is in the form flow and may still continue; debounce avoids 15 campaign inputs.',
    contact_captured: 'intake_partial only means contact was captured; the lead can still continue normally.',
    form_progress_snapshot: 'intake_progress can fire while the lead is actively moving through the form.',
    checkout_abandonment: 'The lead generated a checkout URL; debounce gives time for immediate payment before recovery.',
    whatsapp_handoff: 'Lead clicked WhatsApp handoff and will arrive inbound/receptive to the IA.',
    wa_button_handoff: 'Lead clicked the WhatsApp handoff button after filling the profile (name, email, phone, state, treatment). Send now so AWSales has the contact/metadata when the lead messages.',
    form_completed_no_checkout: 'The medical intake reached processing/success but no checkout URL is present in this payload.',
  };

  return reasons[eventKind] || reasons.form_abandonment;
}

function requiredMissing(payload) {
  const missing = [];

  if (isBlank(get(payload, 'event'))) missing.push('event');
  if (isBlank(get(payload, 'timestamp'))) missing.push('timestamp');
  if (isBlank(get(payload, 'form.id'))) missing.push('form.id');
  if (isBlank(get(payload, 'form.name'))) missing.push('form.name');
  if (isBlank(get(payload, 'lead.phone'))) missing.push('lead.phone');
  if (isBlank(get(payload, 'lead.email'))) missing.push('lead.email');

  return missing;
}

function getStateKey(body, lead) {
  return (
    get(body, 'tracking.session_id') ||
    get(body, 'resume.cross_device_token') ||
    get(body, 'tracking.dosable_session_id') ||
    lead.phone ||
    lead.email ||
    'unknown'
  );
}

function buildDedupeKey(stateKey, payload) {
  const fingerprint = JSON.stringify({
    stateKey,
    event: payload.event,
    sourceEvent: get(payload, 'metadata.nrx_event'),
    step: get(payload, 'metadata.resume_step'),
    checkoutUrl: get(payload, 'metadata.checkout_url'),
    answers: payload.form_answers,
  });

  return `${stateKey}:${simpleHash(fingerprint)}`;
}

function getFirst(obj, paths) {
  for (const path of paths || []) {
    const value = get(obj, path);
    if (!isBlank(value)) return value;
  }

  return null;
}

function get(obj, path, fallback = null) {
  if (!obj || !path) return fallback;

  const parts = String(path).split('.');
  let current = obj;

  for (const part of parts) {
    if (current === null || current === undefined || typeof current !== 'object') return fallback;
    if (!Object.prototype.hasOwnProperty.call(current, part)) return fallback;
    current = current[part];
  }

  return current === undefined ? fallback : current;
}

function isBlank(value) {
  if (value === null || value === undefined) return true;
  if (typeof value === 'string') return value.trim() === '';
  if (Array.isArray(value)) return value.filter((item) => !isBlank(item)).length === 0;
  if (isPlainObject(value)) return Object.keys(value).length === 0;
  return false;
}

function isPlainObject(value) {
  return Object.prototype.toString.call(value) === '[object Object]';
}

function cleanValue(value) {
  if (Array.isArray(value)) {
    return value.map(cleanValue).filter((item) => !isBlank(item));
  }

  if (isPlainObject(value)) {
    const output = {};
    for (const [key, item] of Object.entries(value)) {
      const cleaned = cleanValue(item);
      if (!isBlank(cleaned)) output[key] = cleaned;
    }
    return output;
  }

  if (typeof value === 'string') return value.trim();
  return value;
}

function stringifyAnswer(value) {
  const cleaned = cleanValue(value);

  if (Array.isArray(cleaned)) return cleaned.map(stringifyAnswer).join(', ');
  if (isPlainObject(cleaned)) return JSON.stringify(cleaned);
  if (typeof cleaned === 'boolean') return cleaned ? 'true' : 'false';

  return String(cleaned);
}

function labelValue(value) {
  if (isBlank(value)) return value;

  if (Array.isArray(value)) {
    return value.map(labelValue).filter((item) => !isBlank(item));
  }

  if (isPlainObject(value)) {
    const output = {};
    for (const [key, item] of Object.entries(value)) output[key] = labelValue(item);
    return output;
  }

  const raw = String(value).trim();
  const key = raw.toLowerCase();
  return VALUE_LABELS[key] || raw;
}

function formatMeasure(label, value) {
  if (isBlank(value)) return null;
  return `${label}: ${stringifyAnswer(labelValue(value))}`;
}

function compactJoin(values, separator) {
  return values.filter((value) => !isBlank(value)).map(stringifyAnswer).join(separator);
}

function formatDob(month, day, year) {
  if (isBlank(month) || isBlank(day) || isBlank(year)) return null;
  return `${String(month).padStart(2, '0')}/${String(day).padStart(2, '0')}/${year}`;
}

function normalizeTimestamp(value) {
  const date = value ? new Date(value) : new Date();
  if (Number.isNaN(date.getTime())) return new Date().toISOString();
  return date.toISOString();
}

function addMinutesIso(timestamp, minutes) {
  const date = new Date(timestamp);
  if (Number.isNaN(date.getTime())) return null;
  date.setMinutes(date.getMinutes() + minutes);
  return date.toISOString();
}

function stripUndefined(value) {
  if (Array.isArray(value)) {
    return value.map(stripUndefined).filter((item) => !isBlank(item));
  }

  if (isPlainObject(value)) {
    const output = {};

    for (const [key, item] of Object.entries(value)) {
      if (item === undefined || item === null) continue;
      if (isPlainObject(item)) {
        const nested = stripUndefined(item);
        if (!isBlank(nested)) output[key] = nested;
        continue;
      }
      output[key] = item;
    }

    return output;
  }

  return value;
}

function safeId(value) {
  return String(value)
    .replace(/([a-z])([A-Z])/g, '$1_$2')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '');
}

function simpleHash(input) {
  let hash = 5381;
  const text = String(input);

  for (let i = 0; i < text.length; i += 1) {
    hash = ((hash << 5) + hash) + text.charCodeAt(i);
    hash &= 0xffffffff;
  }

  return Math.abs(hash).toString(36);
}

const inputItems = $input.all();
return inputItems.map((item) => ({ json: normalizeItem(item) }));
