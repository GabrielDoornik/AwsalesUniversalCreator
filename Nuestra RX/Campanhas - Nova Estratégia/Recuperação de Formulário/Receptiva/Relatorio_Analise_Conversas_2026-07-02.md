# Relatório — Análise de Conversas: Receptiva (Recuperação de Formulário)

Período analisado: 24/06 a 02/07/2026 (export de 02/07). 83 conversas, 1.491 mensagens.
Fonte: `Conversas/query_result_2026-07-02T17_19_53.xlsx`.

**Notas de método:**
- Timestamps do export estão em UTC (evidência: em R08 a IA disse "son las 6:28 PM" na costa leste quando o registro marcava 22:29 — bate com UTC-4). O "FUP das 15:00 UTC" = 12:00 de Brasília = 11:00 ET.
- Leads anonimizados como R01–R83. Nomes citados em trechos foram substituídos por `[nome]`.
- As conversas são ANTERIORES ao checkpoint de 02/07 (tool de status, seção 13, roteamento por etapa). Ausência de consulta de status ao vivo NÃO foi contada como erro — os casos em que ela faria diferença estão marcados como **[valida mudança 02/07]**.
- Caveat de dados: o lead de R53 é o mesmo de A92 do Abandono (a mesma thread aparece nos dois exports, com a IA enviando link com `utm_campaign=rec-formulario-abandono` dentro da conversa receptiva). Há dupla contagem entre campanhas para esse lead.

---

## 1. Resumo executivo

O agente soa humano na maior parte do tempo: valida emoção, adapta o registro à alfabetização do lead e faz diagnóstico antes de vender. As melhores conversas (R15, R51, R59) estão em nível de atendente sênior. Os problemas principais são: (a) 3 escorregões de compliance no ângulo de condição de saúde (prediabetes/açúcar); (b) promessas não verificáveis — afirmar que a avaliação "foi recebida" ou que "sigue en revisión" sem ter como saber, e prometer aviso proativo da resposta do médico; (c) primeira resposta padrão viola a seção 12 do checkpoint (pede nome + empilha 2 perguntas); (d) link enviado antes do aceite em ~6 conversas e 1 vez depois de recusa clara; (e) 2 leads ficaram sem NENHUMA resposta (R14, R66) e 1 FUP saiu em português (R44). A fricção nº 1 do funil conversacional é um problema de produto: o campo peso/estatura do formulário trava por confusão de unidades (cm/kg vs pies/libras) — 3 leads travaram nele.

## 2. Tabela de FUP

| Métrica | Valor |
|---|---|
| Leads com conversa no período | 83 (campanha receptiva: todos iniciaram) |
| Leads que receberam ≥1 FUP | 57 |
| Responderam após o FUP (≤48h) | 12 |
| **Taxa de resposta ao FUP** | **21%** |
| Avançaram após o FUP (pediram/receberam link ou retomaram na conversa) | 6 (R05, R15, R51, R62, R65, R74) |
| Leads que receberam link em algum momento | 40 de 83 (48%) |
| Auto-relato de avaliação concluída na transcrição | 9 (R03, R09, R23, R31, R45, R57, R63, R79, R81) — cruzar com o banco |
| Conversão confirmada na transcrição | 1 (R31 — comprou; ver erros) |

Observações de contagem:
- Todos os FUPs saíram para leads que já haviam falado (na receptiva isso é esperado).
- Nenhuma conversa recebeu o 2º FUP (o do cupom, previsto no `MENSAGENS_FOLLOWUP.md`). Ou a janela do export cortou, ou a sequência de 2 FUPs não está rodando — verificar no painel.
- Grande parte dos FUPs dispara em lote às 15:00 UTC (=12:00 BRT, abertura da janela permitida). Leads que pararam de responder de madrugada esperam até 12h pelo FUP (ex.: R65: lead respondeu 04:07, FUP só 15:00).

## 3. Erros do agente (priorizados)

**E1 — Compliance: ângulo de condição de saúde (proibido no checkpoint §3).** 3 ocorrências:
- R06: "El medicamento ayuda a... estabilizar el azúcar, lo cual es ideal por lo que mencionas de la prediabetes." — benefício clínico prometido em cima da prediabetes da lead.
- R15: "el tratamiento ayuda a estabilizar tus niveles de azúcar y evita esos picos que te dejan sin fuerzas... recuperas la energía para trabajar".
- R52: "te quitan esa hambre constante y estabilizan el azúcar".
Correção: reforçar no checkpoint que "estabilizar azúcar / ayudar con prediabetes / presión" é ângulo proibido; falar só de fome/saciedade/peso/energia genérica e remeter condição ao médico.

**E2 — Afirmar fato que não tem como ver (alucinação de status).**
- R09: lead disse "Ya" 5 min após receber o link → IA: "Buenísimo! Ya quedó recibida tu evaluación." (não tinha como confirmar).
- R81 (FUP): "Tu evaluación sigue en revisión médica como te comenté antes." (status inventado).
- R03/R50/R63/R81: "te avisaremos por aquí cualquier novedad" / "me quedo pendiente de cualquier actualización del médico y te aviso" — não existe gatilho que avise o agente; promessa que a operação não cumpre.
Correção: proibir afirmar recebimento/estado sem consulta; com a tool de 02/07, consultar antes de confirmar. **[valida mudança 02/07]** Remover do repertório o "te aviso cuando el médico responda".

**E3 — Primeira resposta viola a seção 12 (sem nome, UMA pergunta).** Padrão sistemático:
- R01: "Por cierto, cómo te llamas? Y para orientarte mejor, cuánto te gustaría bajar y qué has intentado hasta ahora?" — nome + 2 perguntas empilhadas na primeira resposta (também em R02, R04).
Correção: primeira resposta = acolhida + 1 linha do que é + UMA pergunta; nome só depois, natural.

**E4 — Pedir dado clínico no WhatsApp (proibido §2).**
- R32: "para calcular tu IMC y ver si el tratamiento es adecuado para ti, cuánto mides?" — altura/IMC é coleta do formulário.
Correção: nunca coletar peso/altura/condição; direcionar ao formulário.

**E5 — Gate de link furado.**
- Link antes de aceite/pedido: R26, R29, R35, R73, R75, R83 (ex.: R26 — lead só disse "50 libras" e a IA já mandou o link na mesma mensagem da explicação).
- Link após recusa clara: R76 — lead "No gracias" (queria balão gástrico) → despedida e ainda assim: "Si cambias de opinión... puedes ver si calificas aquí: https://...". 
Correção: manter a regra dura da seção 8: dissolver → pergunta → link só depois do sinal de avanço; recusa = zero link.

**E6 — Roteador: lead quente tratado como frio.**
- R54: lead abriu com "Hola, quiero continuar mi evaluación" (2x) → IA respondeu com pitch + "cuánto te gustaría bajar?"; o FUP ainda condicionou o link à resposta: "Para poder avanzar y enviarte el enlace, ¿cuántos kilos te gustaría bajar?". Intenção clara = link imediato.

**E7 — Preço sonegado quando perguntado.** O checkpoint §7 manda informar.
- R20: "Cuánto sale?" → "Para orientarte con los detalles, cuánto te gustaría bajar?" (nunca respondeu o valor; lead sumiu).
- R40: "el costo, no tengo seguro" → só "ahora no pagas nada", sem valor. 
Nas conversas em que o preço foi respondido direto (R22, R24, R44, R65, R75), a conversa continuou. Correção: responder o valor + $0 + reconduzir, sempre.

**E8 — Falhas operacionais de resposta (não é conversa, é plataforma/fila — reportar):**
- R14: lead escreveu "Hola, tengo una pregunta sobre mi evaluación" e nunca recebeu resposta.
- R66: últimas mensagens do lead ("Dietas pero me da mucha ansiedad" / "Cuál es el precio de la inyección") ficaram sem resposta.
- R65: gap de 11h entre a mensagem do lead (04:07) e a retomada (15:00).

**E9 — Call do especialista: promessas quebradas e uso prematuro.**
- R08: IA agendou ligação, errou o cálculo de fuso ("El especialista te llamará a la 1:00 PM hora del este" depois de o lead pedir 14h) e a ligação não aconteceu: lead voltou com "espere la llamada y no llego". Reagendou "sin falta" para segunda.
- R31: call agendada para resolver cobrança indevida percebida (caso crítico abaixo).
- Uso prematuro: R08 escalou para call sem nem tentar o link. Checkpoint §13 (02/07) já endereça: call é último recurso. **[valida mudança 02/07]**

**E10 — Caso R31 (a conversa mais importante do período para o negócio).** Lead completou o checkout, o médico aprovou em minutos e o cartão foi cobrado US$ 798 de uma vez — ela contava com "no pagas nada ahora" e não tinha o valor: "Siii pero en mi tarjeta ya esta negativo ya se lo cobraron". A IA cruzou mensagens e respondeu primeiro comemorando a aprovação ("Qué buena noticia!") antes de tratar o susto; depois recuperou bem (explicou o cobro único do trimestral, agendou especialista, segurou a pergunta de renovação para o humano). Dois aprendizados: (1) quando o lead relata cobrança/susto financeiro, tratar ISSO primeiro, nunca comemorar; (2) o discurso "$0 ahora" precisa vir com "el cobro del plan completo es automático apenas el médico apruebe (suele ser rápido)" quando o lead já está no checkout — a aprovação em minutos torna o "$0" enganoso na prática.

**E11 — Idioma.** R44 (FUP): "Vi que hoje você perguntou sobre o valor do tratamento para bajar de peso. Só para reforçar: agora não pagas nada..." — FUP saiu em português misturado. Única quebra do espanhol-100% no período, e foi do Follow-Up Inteligente, não do fluxo principal. Reforçar idioma no Campo 1 das orientações de FUP.

**E12 — Robô à mostra:** loops de despedida (R23, R53 — responde a cada "gracias", 5+ turnos de tchau), mensagens duplicadas em rajada (R53, R23 por corrida quando o lead manda várias mensagens), e o mesmo template de abertura idêntico em dezenas de conversas. Menor, mas é o que o cliente percebe como "bot".

## 4. Contorno de objeções (por trava)

- **Preço:** BOM quando responde direto (R22, R24, R44, R65, R75 — tirzepatida primeiro, $0 na lógica de agora, tudo incluído). RUIM quando esquiva (R20, R40) e quando insiste no "$0" após "no tengo dinero" repetido — R53: lead disse 3x que não tinha dinheiro e não poria o cartão; a IA repetiu $0 e ofereceu call 2x; lead: "Dinero no tengo cmo quiere q se lo vuelva a repetir". O "$0" não dissolve "não quero registrar cartão sem ter dinheiro"; falta o passo de respeitar e agendar retorno futuro (ou FUP com cupom).
- **"¿Es para mí?":** BOM. R06 (vesícula/prediabetes → "eso no impide que el médico revise tu caso"), R51 (DIU/hormônios → validou e remeteu ao médico sem diagnosticar), R70 (bariátrica).
- **Desconfiança/golpe:** FORTE. R10 (áudio contando golpe anterior → validou, $0 como prova anti-golpe, elogiou a lead por bloquear um falso enfermeiro), R19 (confusão do TikTok "gratis" → explicou avaliação grátis vs tratamento pago com honestidade), R80 ("por privacidad no tengo acceso a tus datos clínicos; es una decisión médica" — honestidade exemplar).
- **Medo (agulha/efeitos):** BOM. R24 e R38 ("aguja súper fina", efeitos leves que passam, médico ajusta).
- **"Ya probé todo":** reframe de biologia aplicado com consistência (R15, R31, R38, R52) — só vigiar a repetição da MESMA frase em turnos seguidos (R92-style; em R15 "no es falta de voluntad" aparece 4x).

## 5. Generalização vs personalização

**Veredito: personalização acima da média nas conversas engajadas; genérico nas pontas.**
- A favor: usa a meta declarada ("llegar a esos 130", "bajar esas 48 libras"), a situação de vida (R05 trabalho, R81 turnos em Chicago) e FUPs que citam o que o lead disse (R02: "vi que ya diste pasos para comer más sano y dejar las sodas"; R70: "después de la bariátrica has vuelto a subir... te sientes desesperada").
- Contra: abertura idêntica em todas as conversas (esperado — sem metadata na receptiva; a tool de status de 02/07 é o caminho para abrir personalizado quando o lead já mexeu no funil **[valida mudança 02/07]**); FUPs de leads silenciosos são o mesmo template "¿tienes una meta en mente...?"; e pedir nome que o formulário coleta.

## 6. Acertos a manter

- R59: lead mandou print do formulário travado; a IA leu a imagem e diagnosticou a causa exata ("pusiste 5.2 cm de altura... querías 5 pies y 2 pulgadas") — destravou na hora e o FUP cobrou exatamente esse ponto. Melhor troubleshooting do período.
- R47: "Odio las llamadas" → "Descuida, nada de llamadas entonces" + solução por texto. Adaptação imediata.
- R42/R80: recusa respeitada com porta aberta, sem insistência (R42: usuária de Mounjaro — zero comparação de marca, compliance limpo).
- R46: garantia citada DO JEITO CERTO ("garantía tras 12 meses (13 envíos) siguiendo las indicaciones") e disclosure 503A/FDA correto quando questionada.
- R19: honestidade sobre o registro do cartão ("no se te hace ningún cargo ahora... si no calificas, no pagas nada") em linguagem simples para lead confusa com anúncio.
- FUP das 15:00 com gancho real da conversa (R05, R15, R41, R51) — os 6 avanços pós-FUP vieram todos desse estilo.

## 7. Amostras anotadas

**BOA — R15 ("ya probé todo", lead emocional):** lead responde com emojis de choro; IA valida sem pressa ("no es tu culpa, es un tema biológico"), pergunta o que mais custou, FUP de entrevista motivacional ("¿hay algo que te gustaría volver a hacer cuando logres ese cambio?") → lead verbaliza a dor real ("no logro trabajar, me canso") → link de retomada no momento certo. Único senão: a frase de açúcar/energia (E1). É o RAR funcionando.

**BOA — R59 (fricção técnica):** descrita no item 6. Sequência diagnóstico→correção→FUP de cobrança do mesmo ponto. Replicar como padrão de troubleshooting.

**RUIM — R54 (quente tratado como frio):** "Hola, quiero continuar mi evaluación" → "cuánto te gustaría bajar?" → FUP condicionando o link à pergunta de diagnóstico. O lead pediu o caminho e recebeu questionário; não voltou. Correção direta no roteador (§4): intenção de continuar = link imediato.

**RUIM — R31 (pós-checkout):** comemorar a aprovação enquanto a lead relatava cobrança que não podia pagar; "$0 ahora" sem explicar que a aprovação (e o cobro automático do plano cheio) podia acontecer em minutos. Recuperou depois, mas é o tipo de conversa que gera reembolso/chargeback e reclamação pública.

## 8. Recomendações

**Copy (primeira resposta padrão):**
1. Uma pergunta só, sem nome, sem empilhar ("¿cuánto te gustaría bajar?" OU "¿qué te trajo hasta aquí?").
2. Quando o lead pergunta preço, responder o preço (tirze primeiro) + $0 + pergunta de recondução — nunca esquivar.

**Timing do FUP:**
3. FUPs concentram às 12:00 BRT (abertura da janela). Avaliar abrir a janela mais cedo (ex.: 09:00 BRT) ou revisar o fuso de referência do painel para que lead quente da madrugada não espere 12h.
4. Verificar no painel por que o 2º FUP (cupom) não disparou em nenhuma conversa do período.

**Checkpoint:**
5. Reforçar E1 (proibir "estabilizar azúcar / ideal para prediabetes") com exemplo de frase certa e errada.
6. Proibir: afirmar recebimento/estado da avaliação sem a tool de status; prometer "te aviso cuando el médico responda"; pedir altura/peso/IMC.
7. Roteador: mensagem tipo "quiero continuar/terminar" = enviar link de retomada imediatamente (o novo §13 + form_resume_url já cobrem o caminho; falta a regra explícita de NÃO fazer pergunta de diagnóstico nesse caso).
8. Pós-checkout: se o lead relatar cobrança/susto financeiro, tratar o problema primeiro (nunca comemorar aprovação no mesmo turno) e explicar que o cobro do plano completo é automático na aprovação, que pode ser rápida.

**FAQ:**
9. Adicionar FAQ Produto de troubleshooting do formulário: campo peso/estatura exige atenção à unidade (pies/libras vs cm/kg); orientar conferência da unidade antes de "no funciona" (3 casos: R13, R47, R59).
10. Adicionar FAQ "¿por qué no califico?" com a resposta honesta do R80 (decisão médica, privacidade, consultar médico de cabecera) para padronizar.

**Fora do fluxo conversacional (reportar ao cliente/Willian — não é qualidade do agente):**
11. Bug/UX do formulário: unidade padrão cm/kg derruba leads dos EUA; validação do campo peso/estatura.
12. Leads sem resposta (R14, R66) e gap de 11h (R65) — investigar fila/janela do agente.
13. Ligações do especialista prometidas e não realizadas (R08; ver também V53 em Vendas) — definir SLA ou parar de prometer horário exato.
14. Anúncio prometendo "gratis" gera objeção de quebra de confiança recorrente (R19, R42; também A25 no Abandono) — alinhar copy do anúncio com "$0 agora, cobra só se aprovado".
