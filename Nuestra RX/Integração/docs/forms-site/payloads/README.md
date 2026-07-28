# Forms-site payloads reais

Payloads brutos capturados no n8n para o receiver:

`https://n8n.nonprod.awsales.io/webhook/nuestra-forms-site`

## 2026-06-03 - clique em "Continuar por WhatsApp"

- `2026-06-03T16-55-13_intake_partial_wa-handoff.json`
  - Evento principal do clique para WhatsApp.
  - `event: intake_partial`
  - `_source: wa-handoff`
  - `wa_redirect: true`
  - `handoff_channel: whatsapp`

- `2026-06-03T16-55-13_intake_progress_pagehide.json`
  - Autosave disparado na saida/redirecionamento da pagina.
  - `event: intake_progress`
  - `progress_trigger: pagehide`

Os dois payloads sao do mesmo lead/sessao:

- `tracking.session_id: nrx_1780505713258_aupa61`
- `tracking.dosable_lead_id: 17964`
- `tracking.dosable_session_id: c4b43cf0-1aa6-47d0-87d1-0bb4f656cd6d`
- `resume.cross_device_token: e7d4ea0a-c976-4637-beaf-9f80246cee63`
- `resume.cross_device_url: https://nuestrarx.com/evaluacion?lt=e7d4ea0a-c976-4637-beaf-9f80246cee63&lang=es`

## Observacao tecnica

O campo `raw_answers.beluga` neste sample parece conter dados inconsistentes com o lead atual. Para uso em campanha de WhatsApp, priorizar os campos normalizados (`contact`, `address`, `demographics`, `biometrics`, `tracking`, `resume`) ate o dev confirmar a origem desses dados.

## 2026-06-03 - clique em "Quiero continuar yo mismo"

- `2026-06-03T17-03-21_intake_progress_continue-self_rxMedsList.json`
  - Evento de progresso apos o usuario escolher continuar no proprio site.
  - `event: intake_progress`
  - `resume.stage: beluga`
  - `resume.step: rxMedsList`
  - `progress_trigger: visibility_hidden`

Esse payload manteve:

- `tracking.session_id: nrx_1780505713258_aupa61`
- `resume.cross_device_token: e7d4ea0a-c976-4637-beaf-9f80246cee63`
- `resume.cross_device_url: https://nuestrarx.com/evaluacion?lt=e7d4ea0a-c976-4637-beaf-9f80246cee63&lang=es`

Mas criou/alterou os IDs da Dosable:

- `tracking.dosable_lead_id: 18064`
- `tracking.dosable_session_id: c51fced1-781d-4ea1-8d2b-5ddc58b4de85`

Para campanha, esse evento indica que o usuario nao pediu WhatsApp naquele clique; ele avancou para o bloco medico do site. Ainda assim, o `cross_device_url` continua servindo como link de retomada.

## 2026-06-03 - respondeu medicamentos e alergias

- `2026-06-03T17-07-41_intake_progress_meds-allergies_identidad.json`
  - Evento de progresso apos responder as duas primeiras perguntas do bloco medico.
  - `event: intake_progress`
  - `resume.stage: beluga`
  - `resume.step: identidad`
  - `progress_trigger: visibility_hidden`

Respostas observadas:

- Medicamentos atuais: `raw_answers.beluga.takesRxMeds: no`
- Lista de medicamentos: `raw_answers.beluga.rxMeds: ["none"]`
- Alergias: `raw_answers.beluga.hasAllergies: no`
- Lista de alergias: `raw_answers.beluga.allergiesList: ["none"]`
- Alergias GLP-1: `raw_answers.beluga.drugAllergies: ["none"]`

Campos normalizados equivalentes:

- `medical_history.current_medications: ["none"]`
- `medical_history.allergies: ["none"]`
- `medical_history.drug_allergies_glp1: ["none"]`

## 2026-06-03 - respondeu identidade/data de nascimento

- `2026-06-03T17-10-04_intake_progress_identity_heightWeight.json`
  - Evento de progresso apos responder a etapa de identidade.
  - `event: intake_progress`
  - `resume.stage: beluga`
  - `resume.step: heightWeight`
  - `progress_trigger: visibility_hidden`

Respostas observadas:

- Data de nascimento normalizada: `demographics.dob: 06/14/2000`
- `raw_answers.beluga.dobMonth: 06`
- `raw_answers.beluga.dobDay: 14`
- `raw_answers.beluga.dobYear: 2000`
- Sexo no bloco Beluga: `raw_answers.beluga.sex: male`

O proximo passo indicado pelo payload e `heightWeight`, mas altura/peso ja vinham pre-preenchidos do bloco inicial:

- `biometrics.height_cm: 186`
- `biometrics.weight_kg: 101`
- `biometrics.bmi: 29.2`

## 2026-06-03 - respondeu altura/peso/meta

- `2026-06-03T17-11-13_intake_progress_heightWeight_bmiConsent.json`
  - Evento de progresso apos revisar/preencher altura, peso mais alto e peso meta.
  - `event: intake_progress`
  - `resume.stage: beluga`
  - `resume.step: bmiConsent`
  - `progress_trigger: visibility_hidden`

Respostas observadas:

- Altura: `raw_answers.beluga.heightCm: 186`
- Peso atual: `raw_answers.beluga.weightKg: 101`
- Maior peso historico: `raw_answers.beluga.highestWeight: 110`
- Peso meta: `raw_answers.beluga.goalWeight: 88`
- BMI no bloco Beluga: `raw_answers.beluga.bmi: 29.2`

Campo normalizado equivalente:

- `goals.weight_loss_goal: 88`

O proximo passo indicado pelo payload e `bmiConsent`, consentimento off-label/IMC.

## 2026-06-03 - aceitou consentimento BMI

- `2026-06-03T17-12-35_intake_progress_bmiConsent_approach.json`
  - Evento de progresso apos aceitar o consentimento de BMI/off-label.
  - `event: intake_progress`
  - `resume.stage: beluga`
  - `resume.step: approach`
  - `progress_trigger: visibility_hidden`

Resposta observada:

- `raw_answers.beluga.bmiConsent: accept`

O proximo passo indicado pelo payload e `approach`, equivalente a pergunta sobre abordagem atual para controle de peso.

## 2026-06-03 - respondeu abordagem e condicoes

- `2026-06-03T17-13-44_intake_progress_approach_recentHistory.json`
  - Evento de progresso apos responder abordagem atual para controle de peso e condicoes medicas.
  - `event: intake_progress`
  - `resume.stage: beluga`
  - `resume.step: recentHistory`
  - `progress_trigger: visibility_hidden`

Respostas observadas:

- Abordagem atual: `raw_answers.beluga.approach: none`
- Condicoes medicas: `raw_answers.beluga.conditions: ["none"]`

O proximo passo indicado pelo payload e `recentHistory`, etapa de historico medico recente.

## 2026-06-03 - respondeu historico recente

- `2026-06-03T17-14-51_intake_progress_recentHistory_vitals.json`
  - Evento de progresso apos responder historico medico recente.
  - `event: intake_progress`
  - `resume.stage: beluga`
  - `resume.step: vitals`
  - `progress_trigger: visibility_hidden`

Respostas observadas:

- Bypass gastrico recente: `raw_answers.beluga.gastricBypass: no`
- Cirurgia previa de perda de peso: `raw_answers.beluga.priorWLS: no`
- Opioides nos ultimos meses: `raw_answers.beluga.opiates: no`

Campo normalizado equivalente:

- `medical_history.gastric_bypass_recent: no`

O proximo passo indicado pelo payload e `vitals`, etapa de sinais vitais.

## 2026-06-03 - respondeu sinais vitais

- `2026-06-03T17-33-31_intake_progress_vitals_currentMeds.json`
  - Evento de progresso apos responder sinais vitais.
  - `event: intake_progress`
  - `resume.stage: beluga`
  - `resume.step: currentMeds`
  - `progress_trigger: visibility_hidden`

Respostas observadas:

- Pressao arterial: `raw_answers.beluga.bp: elevated`
- Frequencia cardiaca: `raw_answers.beluga.hr: slightly_fast`

Observacao:

- O proximo passo indicado pelo payload e `currentMeds`, apesar de ja existir uma etapa anterior de medicamentos (`rxMedsList`). Confirmar com o dev se `currentMeds` e uma pergunta complementar, revisao, ou uma transicao interna do fluxo.

## 2026-06-03 - respondeu currentMeds complementar

- `2026-06-03T17-34-51_intake_progress_currentMeds_injectionAbility.json`
  - Evento de progresso apos responder a etapa complementar `currentMeds`.
  - `event: intake_progress`
  - `resume.stage: beluga`
  - `resume.step: injectionAbility`
  - `progress_trigger: visibility_hidden`

Respostas observadas:

- Medicamentos atuais detalhados: `raw_answers.beluga.currentMeds: none`
- Campo normalizado: `medical_history.current_medications: none`

Observacao:

- `medical_history.current_medications` apareceu como array em payloads anteriores (`["none"]`) e como string neste payload (`"none"`). O normalizer deve aceitar os dois formatos.

O proximo passo indicado pelo payload e `injectionAbility`, capacidade de auto-injecao.

## 2026-06-03 - respondeu capacidade de auto-injecao

- `2026-06-03T17-35-40_intake_progress_injectionAbility_finalConsents.json`
  - Evento de progresso apos responder capacidade de auto-injecao.
  - `event: intake_progress`
  - `resume.stage: beluga`
  - `resume.step: finalConsents`
  - `progress_trigger: visibility_hidden`

Resposta observada:

- Capacidade de auto-injecao: `raw_answers.beluga.injectionAbility: yes`

Observacoes:

- O campo normalizado `medical_history.can_self_inject` ainda veio como `false`, apesar de `raw_answers.beluga.injectionAbility: yes`. Confirmar com o dev se e bug de normalizacao do Worker.
- O proximo passo indicado pelo payload e `finalConsents`. Neste caminho nao apareceu payload separado de upload/verificacao antes dos consentimentos finais.

## 2026-06-03 - processing + success

Vieram 2 payloads validos logo apos os consentimentos finais. O payload `intake_submitted` correto deste lead ainda nao foi capturado/salvo.

- `2026-06-03T17-36-43_intake_progress_processing.json`
  - Evento de progresso imediatamente apos submit.
  - `event: intake_progress`
  - `resume.stage: parent`
  - `resume.step: processing`
  - `progress_trigger: visibility_hidden`

- `2026-06-03T17-36-47_intake_progress_success.json`
  - Evento de progresso indicando tela final de sucesso.
  - `event: intake_progress`
  - `resume.stage: parent`
  - `resume.step: success`
  - `progress_trigger: visibility_hidden`

Respostas finais observadas:

- `raw_answers.beluga.individualizedConsent: accept`
- `raw_answers.beluga.truthfulnessConsent: accept`
- `raw_answers.beluga.glpConsent: accept`

Observacoes:

- Os payloads `processing` e `success` seguem o lead/sessao que vinha sendo preenchido no caminho "continuar eu mesmo":
  - `tracking.dosable_lead_id: 18064`
  - `tracking.dosable_session_id: c51fced1-781d-4ea1-8d2b-5ddc58b4de85`
  - `contact.first_name: Pedro`
  - `address.state_code: TX`
- Mesmo com `raw_answers.beluga.injectionAbility: yes`, o normalizado ainda veio `medical_history.can_self_inject: false`.
- Mesmo com os 3 consentimentos finais aceitos, o normalizado ainda veio:
  - `consent.informed_consent: false`
  - `consent.self_injection_ack: false`
- Ainda falta capturar o `intake_submitted` correto deste lead para saber o payload final exato.

## 2026-06-03 - selecionou plano e gerou checkout

- `2026-06-03T17-53-15_intake_plan_selected_checkout-url.json`
  - Evento disparado ao clicar em continuar na tela de escolha do tratamento/plano.
  - `event: intake_plan_selected`
  - `resume.stage: parent`
  - `resume.step: success`

Selecao observada:

- Medicacao: `plan_selection.medication: tirzepatida`
- Plano: `plan_selection.plan: quarterly`
- Tambem aparece em `treatment_selection.medication: tirzepatida`
- Tambem aparece em `treatment_selection.plan: quarterly`

Checkout gerado:

- `checkout_url: https://staging-buy.nuestrarx.com/checkout?products=1157:1&cc_custom_created=c51fced1-781d-4ea1-8d2b-5ddc58b4de85&firstName=Pedro&lastName=Testeawsales&emailAddress=pedro.leite%40awsales.io&shipState=TX`

Detalhes importantes do checkout:

- Produto no Checkout Champ: `products=1157:1`
- `cc_custom_created` recebe o `dosable_session_id`: `c51fced1-781d-4ea1-8d2b-5ddc58b4de85`
- `shipState=TX`, mesmo com `eligibility.state_supported: false`

Observacoes:

- Este e o primeiro payload do forms-site que traz uma URL de checkout diretamente acionavel por campanha.
- Para WhatsApp, este evento pode alimentar uma campanha de recuperacao de checkout: usuario terminou intake, escolheu plano, mas ainda nao pagou.
- Confirmar com o dev por que TX ainda gera checkout URL quando `state_supported` esta `false`.
