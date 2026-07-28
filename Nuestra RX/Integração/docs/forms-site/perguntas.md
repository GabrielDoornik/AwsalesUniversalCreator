# Forms-Site — Mapeamento Completo do Funil de Intake

Site: `nuestrarx.com/evaluacion`
Idioma: Espanhol (es)
Source captado nos screenshots: 2026-05-29

## Visão geral do fluxo

O funil tem 2 grandes blocos:

1. **PERFIL + ELEGIBILIDAD** (Perguntas 1–4 declaradas como "9 preguntas"): coleta básica + IMC + dados de contato. Gera o evento `intake_partial`.
2. **HISTORIAL + CONSENTIMIENTOS + VERIFICACIÓN + PLAN** (continuação pós-contato): historial médico detalhado, consentimentos legais, upload de docs, seleção de produto + plano. Gera o evento `intake_submitted` (em implementação por Willian).

⚠️ Pedro entrou até a seleção de plano e foi redirecionado pro WhatsApp do Matheus — só `intake_partial` chegou no n8n. `intake_submitted` ainda não foi visto na prática. Aguardando Willian confirmar trigger exato.

---

## Perguntas em ordem

### Bloco 1 — PERFIL (gera `intake_partial`)

#### P1 — Sexo biológico
- **Step UI:** PASO 1, PERFIL — Pregunta 1 de 9
- **Pergunta:** `¿Cuál es tu sexo biológico?`
- **Tipo:** radio
- **Opções:** `Mujer` / `Hombre`
- **Cross-ref schema Willian:** `6403` (radio, "sex assigned at birth", valores `Male`/`Female`)

#### P2 — Idade (faixa)
- **Step UI:** PASO 2, PERFIL — Pregunta 2 de 9
- **Pergunta:** `¿Cuántos años tienes?`
- **Tipo:** radio com badges informativos
- **Opções:**
  - `18 – 29 años`
  - `30 – 44 años` (badge "El grupo más frecuente en nuestro programa")
  - `45 – 59 años` (badge "El segundo grupo más frecuente")
  - `60 años o más`
- **Subtexto:** "El tratamiento GLP-1 está disponible para adultos de 18 años en adelante"
- **Cross-ref schema Willian:** mapeia parcialmente em `dob`/`age_range` (intake payload já tem `demographics.age_range`)

#### P3 — Altura + Peso (IMC)
- **Step UI:** PASO 3, ELEGIBILIDAD MÉDICA — Pregunta 3 de 9
- **Pergunta:** `¿Cuánto mides y cuánto pesas?`
- **Tipo:** 2 inputs numéricos com toggle de unidade
- **Inputs:**
  - Altura: `cm/kg` ou `pies/libras`
  - Peso actual: `kg` ou `lb`
- **Output calculado on-the-fly:**
  - `Tu IMC estimado: X.X`
  - Status:
    - BMI < 25 → não califica
    - BMI 25–29 → `Calificas · uso fuera de etiqueta (consentimiento)` (off-label)
    - BMI ≥ 30 → califica padrão
- **Botão:** `Calcular elegibilidad →`
- **Subtexto:** "Calculamos tu IMC para verificar elegibilidad. Necesitas IMC ≥ 25 para calificar médicamente."
- **Cross-ref schema Willian:** `6407` (altura) + `6408` (peso) + `6409` (BMI consent off-label se 25–29). Payload intake já manda `biometrics.height_cm`, `weight_kg`, `bmi`, `bmi_class`.

#### P4 — Calificación + Dados de contato (FORK do funil)
- **Step UI:** Pregunta 4 de 9 — "¡Calificas hasta aquí!"
- **Headline:** `Tu IMC califica para tratamiento GLP-1`
- **Subhead:** "Solo faltan 5 preguntas rápidas. ¿A dónde te enviamos tu plan?"
- **Stats motivacionais exibidos:**
  - `15–20% pérdida de peso promedio con GLP-1`
  - `<24h revisión por médico con licencia`
  - `$165 desde /mes, sin seguro`
  - `100% en español, a tu puerta`
- **Inputs:**
  - First name (texto)
  - Last name (texto)
  - Phone country (dropdown com flag, ex: `+55`) + phone number (texto)
  - Email (texto)
  - State (dropdown US states, ex: `VA - Virginia`)
- **Validação visível:** `Valid WhatsApp number: +5531987424967` quando válido
- **Selo:** "🔒 HIPAA · Sin spam · Solo tu médico accede a esto"
- **CTAs (2 caminhos — FORK):**
  - Verde (primário): `Continuar la atención por WhatsApp con un agente` → handoff pro AWSales bot via WhatsApp (Matheus). **Provavelmente dispara `intake_partial` AQUI.**
  - Branco (secundário): `Quiero continuar yo mismo` → continua no site, completa fluxo todo, vai pra checkout

⚠️ **Crítico para integração:** depois desse step, o usuário pode bifurcar. Se escolher WhatsApp, o resto do quiz acontece no chat (handoff AI). Se escolher site, segue do P5 em diante.

---

### Bloco 2 — HISTORIAL MÉDICO (caminho "Quiero continuar yo mismo")

#### P5 — Medicamentos recetados
- **Step UI:** HISTORIAL MÉDICO — Medicamentos y alergias (pergunta 1)
- **Pergunta:** `¿Tomas algún medicamento recetado?`
- **Tipo:** checkbox múltiplo. "Ninguno" é radio-like (exclui outros).
- **Opções:**
  - `Ninguno`
  - `Presión arterial (lisinopril, amlodipino, losartán...)`
  - `Diabetes (metformina, insulina, otros)`
  - `Colesterol / triglicéridos (estatinas)`
  - `Tiroides (levotiroxina, etc.)`
  - `Antidepresivos / ansiedad (SSRIs, SNRIs)`
  - `Anticoagulantes (warfarina, Eliquis, Xarelto)`
  - `Anticonceptivos orales`
  - `Acidez / reflujo (omeprazol, etc.)`
  - `Analgésicos recetados`
  - `ADHD / estimulantes`
  - `Anticonvulsivos`
  - `Terapia hormonal`
  - `Otro (especificar abajo)`
- **Cross-ref schema Willian:** `6401` (textarea — "Please list all your current medications including dosages"). No site é checkbox; no schema é texto livre. **Conversão entre os dois precisa de mapper.**

#### P6 — Alergias conocidas
- **Step UI:** HISTORIAL MÉDICO — Medicamentos y alergias (pergunta 2)
- **Pergunta:** `¿Tienes alergias conocidas?`
- **Tipo:** checkbox múltiplo. "Ninguna conocida (NKDA)" é radio-like (exclui outros).
- **Opções:**
  - `Ninguna conocida (NKDA)`
  - `Penicilina / amoxicilina`
  - `Sulfa (sulfonamidas)`
  - `Ibuprofeno / AINEs / aspirina`
  - `Codeína / opioides`
  - `Látex`
  - `Yodo / contraste`
  - `Mariscos`
  - `Nueces / maní`
  - `Huevo`
  - `Algún GLP-1 previo (Ozempic, Wegovy, Mounjaro, Zepbound, Saxenda, Trulicity)` ⚠️ HARD STOP
  - `Polen / polvo / animales`
  - `Otra (especificar abajo)`
- **Cross-ref schema Willian:** `6402` (textarea — "Please list all of your known allergies") + `6416` (checkbox — Are you allergic to any of the following: Ozempic, Mounjaro, Wegovy, Zepbound, Saxenda, Trulicity → HARD STOP)

#### P7 — Fecha de nacimiento
- **Step UI:** "¿Cuál es tu fecha de nacimiento?"
- **Tipo:** 3 inputs (Mes / Día / Año)
- **Subtexto:** "Debes tener entre 18 y 80 años"
- **Validação:** 18 ≤ idade ≤ 80
- **Cross-ref schema Willian:** payload já tem `contact.birthday` + `demographics.dob`

#### P8 — Peso meta + Histórico de peso
- **Step UI:** TU OBJETIVO — "¿A qué peso quieres llegar?"
- **Subtexto:** "En promedio, pacientes con GLP-1 pierden 15–20% de su peso inicial."
- **Box informativo:** "Tus datos actuales: 166 cm · 80 kg / BMI 29"
- **Inputs:**
  - `Peso más alto que has alcanzado` (kg/lb toggle)
  - `Peso meta` (kg/lb toggle)
- **Cross-ref schema Willian:** `6406` (textarea "highest weight reached") + `goals.weight_loss_goal`

#### P9 — Consentimiento off-label (BMI 25–29)
- **Step UI:** CONSENTIMIENTO · USO FUERA DE ETIQUETA
- **Headline:** `Consentimiento: uso de medicamentos para pérdida de peso con BMI 25–29`
- **Corpo:** Explicação sobre uso off-label, BMI ≥ 30 vs 25-29, FDA não aprovado pra essa faixa, importância de seguir dose
- **Opções:** `Acepto y deseo continuar` / `No estoy de acuerdo y no deseo continuar`
- **HARD STOP:** "No estoy de acuerdo" desqualifica
- **Cross-ref schema Willian:** `6409` (consent BMI off-label HARD STOP)

#### P10 — Enfoque atual sobre peso
- **Step UI:** TU SALUD (parte 1)
- **Pergunta:** `¿Cómo describirías tu enfoque actual sobre el peso?`
- **Tipo:** radio
- **Opções:**
  - `Lo manejo activamente` (sub: "Dieta, ejercicio o programa estructurado")
  - `Algunos esfuerzos` (sub: "Intento cuidarme pero no de forma constante")
  - `Sin esfuerzos activos`
- **Cross-ref schema Willian:** `6410` (radio — current approach to weight management)

#### P11 — Condições médicas (checkbox HARD STOPS)
- **Step UI:** TU SALUD (parte 2)
- **Pergunta:** `Marca todas las condiciones actuales o pasadas (importante para tu seguridad)`
- **Tipo:** checkbox múltiplo
- **Opções (em vermelho = HARD STOP):**
  - `Ninguna de las anteriores`
  - 🔴 `Gastroparesis (parálisis intestinal)` HARD STOP
  - 🔴 `Triglicéridos sobre 600 en algún momento` HARD STOP
  - 🔴 `Pancreatitis o cáncer pancreático` HARD STOP
  - 🔴 `Diabetes tipo 1 / dependiente de insulina` HARD STOP
  - 🔴 `Retinopatía diabética moderada o severa`
  - 🔴 `Hipoglucemia (azúcar baja en la sangre)` HARD STOP
  - 🔴 `Historial personal o familiar de cáncer medular de tiroides` HARD STOP
  - 🔴 `Historial personal o familiar de Neoplasia Endocrina Múltiple (MEN-2)` HARD STOP
  - 🔴 `Anorexia o bulimia` HARD STOP
  - 🔴 `Insuficiencia hepática / cirrosis` HARD STOP
  - 🔴 `Enfermedad renal crónica etapa 3b o mayor` HARD STOP
  - 🔴 `Síndrome de secreción inadecuada de hormona antidiurética (SIADH)` HARD STOP
  - 🔴 `Cálculos biliares actuales con síntomas` HARD STOP
  - `Cálculos biliares actuales sin síntomas` (consent extra)
  - `Vesícula biliar removida en el pasado` (consent extra)
  - `Hipotiroidismo, hipertiroidismo u otros problemas tiroideos` (consent extra)
- **Cross-ref schema Willian:** `6411` (checkbox HARD STOP). Lista bate 1:1 com a do schema.

#### P12 — Bypass + Cirurgia perda peso + Opioides
- **Step UI:** HISTORIA MÉDICA RECIENTE — "Cuéntanos sobre tu historia reciente"
- **Subtexto:** "Responde las 3 preguntas para continuar"
- **3 sub-perguntas (radio Sí/No):**
  1. `¿Has tenido bypass gástrico en los últimos 6 meses?` (Sí = HARD STOP)
  2. `¿Has tenido alguna cirugía de pérdida de peso previa?` (sub: "Manga, banda, balón, etc. (cualquier momento)")
  3. `En los últimos 3 meses, ¿has tomado opioides?` (sub: "Incluye recetados y no recetados") — Sí = warning (não claro se hard stop)
- **Cross-ref schema Willian:** `6415` (bypass HARD STOP). Cirurgia prévia e opioides não estão explícitos no schema.

#### P13 — Sinais vitais (pressão + FC)
- **Step UI:** SIGNOS VITALES — "Cuéntanos sobre tus signos vitales"
- **Subtexto:** "Si no estás seguro, elige la opción más cercana"
- **2 perguntas radio com cor coding:**
  1. `Presión arterial`:
     - 🟢 `< 120/80` (Normal)
     - 🟡 `120–129 / < 80` (Elevada)
     - 🟠 `130–139 / 80–89` (Hipertensión etapa 1)
     - 🔴 `≥ 140/90` (Hipertensión etapa 2)
  2. `Frecuencia cardíaca en reposo`:
     - 🟢 `< 60 lpm` (Lenta)
     - 🟢 `60 – 100 lpm` (Normal)
     - 🟡 `101 – 110 lpm` (Ligeramente rápida)
     - 🟠 `> 110 lpm` (Rápida)
- **Cross-ref schema Willian:** não tem questão direta. Pode estar em campos não numerados ou ser exclusividade do site.

#### P14 — Capacidade de auto-injeção
- **Step UI:** PACIENTE NUEVO
- **Pergunta:** `¿Puedes inyectarte de forma segura o tener ayuda confiable?`
- **Tipo:** radio
- **Opções:**
  - `Sí, puedo inyectarme o tengo ayuda confiable`
  - `No, necesito una opción oral` (sub: "Te dirigiremos a la formulación oral si está disponible") — pode disqualify se oral não disponível
- **Cross-ref schema Willian:** `6418` (radio HARD STOP — self-injection). Bate 1:1.

#### P15 — Verificação documental
- **Step UI:** VERIFICACIÓN — "Sube tus fotos de verificación"
- **Subtexto:** "Solo se usan para verificar tu identidad y apoyar la evaluación médica"
- **2 uploads:**
  1. `Sube tu identificación` (sub: "Licencia, pasaporte o ID militar (frente y reverso). Foto clara con nombre, foto y fecha de nacimiento visibles.")
  2. `Foto de cuerpo completo` (sub: "Vestido pero sin ropa muy holgada · Incluye tu cara · Solo para el médico (privada)")
- **Cross-ref schema Willian:** Schema não cobre uploads (são tratados fora do JSON payload — provável upload direto pra storage Dosable).

#### P16 — Consentimentos finais (3 checks)
- **Step UI:** CONSENTIMIENTO FINAL — "Por favor revisa y acepta los últimos consentimientos"
- **Subtexto:** "Cada uno es un reconocimiento legal independiente. Toca 'Ver detalles' para leer el texto completo."
- **3 consentimentos check (todos obrigatórios — HARD STOPS se rejeitar):**
  1. ✅ `Tratamiento individualizado` (sub: "Entiendo que los medicamentos compuestos no son aprobados por la FDA y no han pasado los mismos ensayos clínicos que los de marca.")
  2. ✅ `Veracidad de la información` (sub: "Confirmo que respondí las preguntas de este formulario y que la información es verdadera y completa.")
  3. ✅ `Consentimiento GLP-1 / GIP` (sub: "Acepto los riesgos y beneficios del tratamiento con GLP-1 / GLP-1+GIP, incluidos efectos secundarios comunes y serios.")
- **Cross-ref schema Willian:** `6431` (Individualizado) + `6432` (Veracidad) + `6433` (GLP-1/GIP). Bate 1:1.

---

### Bloco 3 — PRODUCTO + PLAN (CALIFICAS · ELIGE TU PLAN)

#### P17 — Seleção de tratamento
- **Step UI:** "EVALUACIÓN COMPLETADA — Calificas, elige tu plan"
- **Sub:** "Según tu evaluación médica, estas son las opciones disponibles para tu tratamiento para bajar de peso. Un médico con licencia revisa y aprueba tu plan en menos de 24 horas."
- **Banner de urgência:** "Espacios limitados esta semana, tu evaluación expira en HH:MM:SS"
- **2 produtos:**
  - **Tirzepatida+ Personalizada** (badge `MÁS EFECTIVA`)
    - "Activa las vías GLP-1 y GIP para un control más amplio del apetito y del azúcar en sangre"
    - `2.5–15 MG · MANTENIMIENTO Y TITULACIÓN`
  - **Semaglutida+ Personalizada** (badge `MÁS ECONÓMICA`)
    - "Actúa sobre la vía GLP-1 para reducir el apetito y apoyar una pérdida de peso constante"
    - `0.25–2.5 MG · MANTENIMIENTO Y TITULACIÓN`

#### P18 — Seleção de plano (frequency)
- **3 planos:**
  - **Plan Mensual** — `$299/mes` — "4 inyecciones · enviado cada mes"
  - **Plan Trimestral** (badge `MÁS POPULAR`) — `$266/mes` (de $299) — "12 dosis · $797 total · 3 meses · Ahorras $33/mes"
  - **Plan Semestral** (badge `MEJOR PRECIO`) — `$255/mes` (de $299) — "24 dosis · $1,530 total · cuotas disponibles · Ahorras $44/mes"
- **Total hoy:** `$0.00` (sub: "Te cobramos solo si el médico te aprueba la receta")
- **CTA:** `Continuar con [produto], Plan [X] Meses →`
- **Confiança:** "Pago seguro · sin riesgo · cancela cuando quieras"

#### Inclusos em todos planos
- Envío exprés gratis (3-5 días)
- Kit de inyección (agujas + alcohol)
- Soporte 24/7 en español
- Médico con licencia (consulta incluida)
- Cancela cuando quieras (sin contratos)
- Privacidad HIPAA

#### Métodos de pagamento aceitos
- Cartões: VISA, MASTERCARD, AMEX, DISCOVER
- BNPL: Klarna, affirm, Afterpay

---

## ⚠️ Discrepâncias schema Willian vs site

Comparando o `awsales_t64_schema.md` (33 perguntas, IDs 6400-6433) com o que o site mostra:

| Categoria | Schema Willian | Site nuestrarx.com | Status |
|---|---|---|---|
| Sexo biológico | `6403` radio | P1 | ✅ bate |
| Idade (DOB) | apenas DOB no `contact.birthday` | P7 | ✅ bate |
| Altura/Peso | `6406-6408` textarea | P3 | ✅ bate |
| BMI off-label | `6409` consent HARD STOP | P9 | ✅ bate |
| Medicações atuais | `6401` textarea | P5 checkbox | ⚠️ Site usa checkbox, schema usa textarea livre. Precisa mapper. |
| Alergias gerais | `6402` textarea | P6 checkbox | ⚠️ Mesmo problema. Mapper de checkbox → texto. |
| Alergias GLP-1 | `6416` checkbox HARD STOP | P6 dentro de "alergias" | ✅ bate semanticamente |
| Pregnancy | `6404`/`6405` consent | NÃO VI NO SITE | ⚠️ Faltando no site? Provavelmente só aparece se P1 = Mujer |
| Condições médicas HARD STOP | `6411` checkbox | P11 | ✅ bate |
| Bypass gástrico 6m | `6415` radio HARD STOP | P12.1 | ✅ bate |
| Self-injection | `6418` radio HARD STOP | P14 | ✅ bate |
| GLP-1 prévio + dose | `6417`, `6419-6428` | NÃO VI fluxo "prior GLP-1 use" no site | ⚠️ Provavelmente aparece só se P6 marcar "GLP-1 previo" |
| Consents finais | `6431/6432/6433` | P16 | ✅ bate |
| Sinais vitais | nenhum ID | P13 | ⚠️ Exclusivo do site, schema não cobre |
| Cirurgia perda peso prévia | nenhum ID | P12.2 | ⚠️ Exclusivo do site |
| Opioides 3 meses | nenhum ID | P12.3 | ⚠️ Exclusivo do site |
| Enfoque sobre peso | `6410` | P10 | ✅ bate |
| Peso meta | `goals.weight_loss_goal` | P8 | ✅ bate |
| Verificação ID/corpo | fora do schema (uploads) | P15 | ⚠️ Tratamento separado |

**Conclusões:**
1. Site coleta 3 perguntas a mais que o schema Willian (P12.2, P12.3, P13). Pro handoff via WhatsApp, bot precisa também coletar essas 3 OU aceitar que esses dados ficam vazios.
2. Site usa checkbox onde schema usa textarea pra medicações e alergias. Mapper precisa converter listas marcadas → string de texto pra payload `/ai-handoff`.
3. Perguntas condicionais (pregnancy só pra Mujer, prior GLP-1 só se marcou) provavelmente existem no site mas não foram screenshotadas porque Pedro foi "Hombre" e marcou "ninguno".

---

## Próximos passos pro normalizer

Quando chegar payload de `intake_partial` e `intake_submitted` real, mapear pra evento AWSales:
- `intake_partial` → ❓ enum AWSales não tem evento de "lead intake". Provável **SKIP** ou criar custom event.
- `intake_submitted` → mesmo problema. Pode ser pré-`APPROVED_PURCHASE` mas não há transação real ainda (Total hoy $0.00). Discutir com Pedro/AWSales como tratar.

Decisão pendente antes de escrever o normalizer.
