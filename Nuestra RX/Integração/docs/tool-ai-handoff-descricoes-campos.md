# Descrições dos campos da Tool "Enviar avaliação Nuestra RX"

Texto pronto pra colar em cada campo "Descrição para IA" do Body Schema da tool `enviar_avaliacao_nuestra_rx` na plataforma AWSales.

Aqui mora o conserto de verdade: a IA entende a língua e manda o **token canônico**; o normalizer n8n só garante o formato exato. Por isso o contrato de formato vai aqui, não no checkpoint (senão o checkpoint vira monstro).

Erros reais que isso previne:
- Regina (2026-06-17): 6418 foi como frase `"No, me asistían en clínica"` em vez de `Yes`/`No`.
- Yasmira (2026-06-17): `lead_state` foi `"Florida"` em vez de `FL` (Dosable exige 2 letras maiúsculas).

---

## product (String)

Tratamento escolhido pelo lead. Envie exatamente um destes valores, em minúsculo: semaglutide ou tirzepatide. Nunca envie o nome em espanhol nem texto livre.

## plan (String)

Plano escolhido pelo lead. Envie exatamente: monthly (mensal) ou quarterly (trimestral / 3 meses). Minúsculo, sem texto livre.

## contact (Objeto)

Dados do lead. Inclua first_name, last_name, email, phone, lead_state, gender, date_of_birth.

REGRA CRÍTICA do lead_state: SEMPRE o código USPS de 2 letras MAIÚSCULAS do estado dos EUA (ex: FL, NY, CA, NJ, IL). Se o lead falar a cidade ou o nome do estado, você converte para o código antes de enviar: Orlando vira FL, Florida vira FL, Houston vira TX, Nueva York vira NY. Nunca envie o nome do estado por extenso nem a cidade.

gender: Male ou Female. date_of_birth: data de nascimento do lead. Não coloque nome, email nem telefone dentro de answers; dados de contato vão só aqui.

## answers (Objeto)

Respostas clínicas no formato { "id": { "value": ... } } usando os IDs do Dosable.

CADA ID É UM CAMPO ESPECÍFICO. Não troque um pelo outro (caso real 2026-06-17: a IA jogou "penicilina" no 6416 e um peso no 6402):
- 6400: condições médicas atuais ou passadas, texto livre ("None" se nenhuma).
- 6401: medicamentos atuais que o lead toma, texto livre ("None" se nenhum). NUNCA a data de nascimento aqui.
- 6402: alergias GERAIS conhecidas (ex: penicilina, alimentos), texto livre ("None" se nenhuma). É aqui que vai uma alergia comum, não no 6416.
- 6416: SÓ alergia a medicamento GLP-1 de marca (Ozempic, Wegovy, Mounjaro, Zepbound, Saxenda, Trulicity). Se o lead não é alérgico a esses, use ["None of the above"]. Penicilina e alergias gerais NÃO vão aqui, vão no 6402.
- 6406: maior peso já alcançado. 6408: peso atual. Aceite kg OU libras, não force o lead a converter. Envie o número COM a unidade que o lead usou (ex: "86 kg" ou "190 lbs"); o sistema converte para libras (formato do Dosable). Se vier só número sem unidade e ambíguo, confirme kg ou libras antes de enviar. NUNCA pré-converta o número para kg você mesmo nem mande número solto: número sem unidade o sistema lê como libras e grava errado. Mande o valor na unidade ORIGINAL do lead (ex: "325 lbs").
- 6407: altura. Aceite cm OU pés. Envie em cm (ex: "170") ou em pés (ex: "5'7\""); o sistema converte para pés.

REGRA DE FORMATO (opção fechada): nas perguntas de opção NUNCA envie a frase do lead; envie o SENTIDO já traduzido para o token canônico, baseado no que o lead confirmou no FINAL da conversa:
- Sim/Não (6404 gravidez, 6415 bypass gástrico, 6418 auto-injeção): envie Yes ou No.
- Sexo biológico (6403): Male ou Female.
- Enfoque com o peso (6410): Actively managing, Some efforts ou No active efforts.
- Listas/arrays (6411 condições, 6416 alergia GLP-1, 6417 uso recente GLP-1): array. Se nada se aplica, use ["None of the above"] em 6411 e 6416, e ["None of these"] em 6417.
- Consentimentos finais (6431, 6432, 6433): Yes.

A DATA DE NASCIMENTO vai SOMENTE em contact, nunca dentro de answers.

IDs mínimos: 6400, 6401, 6402, 6403, 6404, 6406, 6407, 6408, 6410, 6411, 6415, 6416, 6417, 6418, 6431, 6432, 6433. Envie o sentido confirmado pelo lead, não a frase literal.

## metadata (Objeto)

Copie o objeto metadata completo disponível no contexto. Se não houver metadata, envie um objeto vazio {}. Não invente campos.

## form_answers (Objeto)

Copie a lista form_answers completa disponível no contexto. Se não houver, envie []. Serve para o backfill de dados que já vieram do formulário.

## source (Objeto)

Origem da coleta. Use channel = whatsapp, agent = awsales-bot e captured_at com a data e hora atual.

---

## O que NÃO é resolvido por aqui (vai no checkpoint)

- Bloqueio de estado blacklisted (TX): compliance, a IA tem que barrar ANTES de coletar dado clínico. Pendente: o que fazer com lead de TX (Pedro perguntando ao Matheus).
- Não alucinar erro técnico e não mandar link cru de suporte: usar variável `{{whatsapp_suporte}}`.
- Capturar a resposta FINAL confirmada do lead (não a fala antiga). Ex Regina: ela confirmou que pode se auto-injetar, mas a IA gravou a fala velha.
