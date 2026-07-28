# Relatório — Análise de Conversas: Recuperação de Vendas (Checkout)

Período analisado: 24/06 a 02/07/2026 (export de 02/07). 76 conversas, 299 mensagens.
Fonte: `Conversa (25-06)/query_result_2026-07-02T17_20_31.xlsx`.

**Notas de método:**
- Timestamps do export em UTC (≈ ET+4, BRT+3). Leads anonimizados como V01–V76; nomes em trechos substituídos por `[nome]`. Links de checkout citados foram truncados (contêm nome/e-mail do lead — não reproduzir).
- Conversas ANTERIORES ao checkpoint de 02/07 (tool de status). Onde a consulta de status faria diferença, marcado como **[valida mudança 02/07]**, não como erro do agente.

---

## 1. Resumo executivo

A abertura está limpa (sem emoji, $0 na lógica certa) mas 80% dos leads nunca respondem — e parte das aberturas dispara na madrugada do lead (evento de abandono + debounce, ex.: V25 às ~01:13 ET), o que é config de disparo, não conversa. Quando o lead responde, o agente destrava bem: reexplica o $0, reenvia o checkout certo do metadata, usa o cupom quando o preço é a trava real e é honesto sobre o cobro automático na aprovação (regra crítica do checkpoint §2, cumprida em V62 e V69). Os erros graves estão concentrados: V53 alucinou ("el link que te pasé arriba" sem link enviado; "ya nos aparece aquí la confirmación" sem ter como ver) e prometeu ligação "en unos 40 minutos" que não aconteceu; V69 recebeu FUP cobrando retorno depois de dizer "yo le aviso" e reclamou de insistência. O melhor FUP do período também é desta campanha (V73 — personalizado, lead respondeu "Si" e recebeu o link de novo).

## 2. Tabela de FUP

| Métrica | Valor |
|---|---|
| Abordados (receberam a abertura) | 76 |
| Responderam à abertura em algum momento | 15 (20%) |
| Leads que receberam ≥1 FUP | 18 (12 engajados + 6 silenciosos) |
| Responderam após o FUP (≤48h) | 3 (V60, V69, V73) |
| **Taxa de resposta ao FUP** | **17%** |
| Avançaram após o FUP | 2 (V73: "Si" → checkout reenviado; V60: "S" → agendamento de call). V69 respondeu para reclamar da insistência. |
| Leads que receberam link de checkout | 10 |
| Desfechos confirmados na transcrição | 2 finalizaram (V53 — "ya eso lo hice anoche"; V56 — "Ya llené todos los pasos"); cruzar com banco |

Observações:
- Única campanha em que o FUP alcançou leads silenciosos (6 de 61) — bom, mas cobertura baixa; os outros 55 nunca receberam 2º toque.
- O 2º FUP (cupom) não disparou em nenhuma conversa — mesma pendência das outras campanhas: verificar painel.
- FUPs em lote às 15:00 UTC (12:00 BRT): lead quente de checkout que parou às 06:02 (V61) só foi tocado às 15:00 (~9h depois). Para lead no checkout, o prompt base pede timing curto — a janela está engolindo isso.

## 3. Erros do agente (priorizados)

**E1 — V53: referenciar link nunca enviado + inventar confirmação + promessa de ligação em minutos.**
- "Si quieres, puedes ir terminando por el link que te pasé arriba mientras esperas la llamada." → lead: "muchas gracias pero no hay nigun link". A IA referenciou um link que não existia na conversa.
- Lead: "si pero ya eso lo hice anoche" → IA: "Tienes razón, ya nos aparece aquí la confirmación." — não tinha nenhuma fonte para "aparecer" confirmação; inventou a verificação. Com a tool de status isso vira consulta real. **[valida mudança 02/07]**
- "Un especialista te va a marcar en unos 40 minutos" → 1h depois: "nunca me llamo el medico... no quiero tener una mala experiencia". Reagendou ("En unos 30 minutos te contacta") — de novo em minutos.
Correções: (a) só referenciar link que exista nesta conversa; (b) nunca afirmar confirmação/estado sem tool; (c) call sem promessa de minutos — janela e ponto.

**E2 — FUP ignorando pedido explícito de timing (V69).** Lead: "Yo le aviso cuando" → FUP no dia seguinte: "Ayer quedamos en que me avisabas cuando estuvieras lista... ¿Te gustaría aprovechar el cupón de $50...?" → lead: "no puedo en El momento y tampoco con mucha insistensia." A regra do prompt base (oportunidade EXPLÍCITA = respeitar literalmente) foi atropelada. O pedido de desculpas depois foi bom ("Perdona si sonó a mucha presión"), mas o dano estava feito. Reforçar no Campo 2: "yo aviso" sem data = SKIP ou espera longa, nunca cobrança em 24h.

**E3 — Duplicação e agenda confusa (V60).** Link de checkout idêntico enviado 2x seguidas (00:44 e 00:47) sem mensagem do lead no meio; no agendamento, perguntou o horário, e antes de a lead responder confirmou sozinha ("Vale, genial. Hoy por la tarde te llamamos") e propôs 16:00 — três mensagens que se atropelam. Lead vulnerável (baixa alfabetização, mandou cartão de seguro com dados pessoais) — a conversa precisa de mais calma, não de rajada.

**E4 — Muleta do $0.** Em V60 e V73 a frase "ahora no pagas nada; solo se cobra si el médico aprueba" aparece em quase toda mensagem da IA. O checkpoint §2 manda dizer uma vez, bem, e variar. É a muleta que entrega robô nesta campanha.

**E5 — Transferir a escolha do medicamento ao médico (viola §7).** V72: "El médico es quien define cuál es la mejor para ti después de revisar tu evaluación." — e a lead já tinha tirzepatida reservada no metadata. O certo: a escolha é dela (com indução à tirze), o médico valida elegibilidade.

**E6 — Preço espontâneo colado no link (V61).** Lead: "Cuál es el último paso" → IA: "La Tirzepatida trimestral sale en 266 al mes y el último paso es completar el checkout aquí: [link]". O lead não perguntou preço; jogar o valor na primeira resposta pode criar a objeção que não existia, e preço + link na mesma mensagem viola o "uma ideia por mensagem".

**E7 — FUP repetindo o ângulo da última mensagem (viola prompt base "nunca repita ângulos").**
- V27: última mensagem ofereceu o cupom SEMA3 → FUP: "¿Te gustaría aprovechar el cupón de $25...?" (mesmo gancho).
- V28: última mensagem perguntou "¿Quieres que te pase el link?" → FUP: "¿Te gustaría recibir el enlace...?" (mesma estrutura).

**E8 — Loops de despedida (V53, V62).** Responde a cada "gracias" com nova despedida (3-4 turnos). Uma mensagem de encerramento basta.

## 4. Contorno de objeções (por trava)

- **Preço / sem dinheiro:** BOM no mecanismo, com um limite. V27 e V62: validou, $0, cupom (TIRZE3/SEMA3) quando o valor era a trava real; V62 respeitou a recusa final ("Mejor cuando yo tenga el dinero le dejo saber" → encerrou com porta aberta). Honestidade sobre o cobro automático cumprida à risca: V62 "el cobro se hace automático a la tarjeta que dejes registrada" e V69 "el cobro real se hace automático en cuanto el médico aprueba tu receta" — exatamente a regra do §2. Limite: para "no tengo dinero" a resposta padrão virou oferecer call do especialista (V62, V69) — call não resolve falta de dinheiro; o melhor caminho é respeitar + combinar retorno (e aí sim o FUP futuro com cupom).
- **Fricção técnica/checkout:** FORTE. V05 ("Se me fue la página" → link reenviado na hora + recap do plano); V70 ("me salía que si pagaría por eso no seguí" → explicou o total $0, pediu confirmação, lead "Okis" → link). É o fluxo da seção 8 funcionando.
- **"¿Qué es esto?" (lead perdido):** V09 ("Que es tx") e V28 ("Cuál medicamento sería") — respostas curtas e personalizadas pelo metadata ("Tienes reservada la Tirzepatida personalizada"). Bom.
- **Medo de agulha:** V72 — validou e deu concretude ("aguja súper fina, el kit ya trae todo"), gate respeitado (perguntou antes de mandar o link). Bom, exceto o E5.
- **"Ya finalicé":** V56 — parabenizou e encerrou sem upsell, conforme §11. Perfeito.
- **Seguro médico:** V60 respondeu ("no usamos seguros"); em V62 a menção ao "seguro del gobierno" passou sem resposta direta — responder sempre, a FAQ cobre.

## 5. Generalização vs personalização

**Veredito: boa personalização via metadata; FUPs a silenciosos são template (aceitável).**
- A favor: usa medicamento/plano reservados ("¿Seguimos con el plan trimestral de Tirzepatida?" — V05; "Tienes reservada la Tirzepatida personalizada" — V28) e o FUP V73 é o modelo do período: "Más temprano comentaste que solo avanzarías después de la aprobación del médico, y justo así funciona: ahora no pagas nada" — cita a objeção exata do lead e a resolve; lead respondeu "Si" e recebeu o checkout.
- Contra: FUPs a silenciosos são variações de "¿Te quedó alguna duda antes de dar el último paso?" (sem personalização — esperado, não há conversa para ancorar); a abertura é idêntica para todos e não menciona o medicamento reservado, que o metadata tem.

## 6. Acertos a manter

- Honestidade sobre o cobro automático na aprovação (V62, V69) — regra sensível do checkpoint cumprida sem contradição.
- V56: encerramento pós-finalização sem upsell.
- V70/V05: destravamento de fricção de checkout em 2 mensagens.
- Cupom como carta de fechamento só quando o preço é a trava real (V27, V62, V69) — não foi oferecido a quem só perguntou preço.
- Hierarquia de link respeitada: sempre o checkout do metadata; nenhum caso de link trocado de plano.
- V69: pedido de desculpas genuíno após a reclamação de insistência ("Tienes toda la razón... Perdona si sonó a mucha presión") — reparo bem feito.
- Espanhol 100%, zero emoji na abertura, sem equivalência de marca (V72 falou "compuestos de GLP-1, principalmente semaglutida o tirzepatida" sem citar marca).

## 7. Amostras anotadas

**BOA — V73:** lead pergunta "Cuánto se paga ahora" 2x com desconfiança → IA responde "$0, son $0" + explica o cobro do plano mensal só na aprovação, sem esconder o valor (299) → FUP personalizado cita a condição exata do lead → "Si" → checkout reenviado. Por quê: transparência de preço + FUP com gancho real = retomada.

**BOA — V70:** a lead abandonou porque a tela "dizia que ia pagar" → IA explica que o total marca $0, pede confirmação antes do link, lead aceita, link vai limpo com instrução ("verás el total en $0"). Por quê: identificou a trava exata do abandono (fricção de percepção de cobrança) e a dissolveu em 2 mensagens.

**RUIM — V53:** a sequência alucinação de link → alucinação de confirmação → ligação prometida em 40 min que não veio, com um lead que avisou "no quiero tener una mala experiencia porque tienen buenos review". É o maior risco reputacional do período. Correções no E1.

**RUIM — V69 (FUP):** cobrança no dia seguinte após "yo le aviso", ainda com cupom no meio — a lead respondeu pedindo menos insistência. O FUP transformou uma pausa combinada em pressão.

## 8. Recomendações

**Copy (abertura):**
1. 80% de silêncio com a abertura atual. Testar variação que usa o metadata: nomear o medicamento reservado ("Tu Tirzepatida quedó reservada y a un paso de terminar...") — mais concreto que "tu tratamiento".
2. Janela de disparo da abertura: hoje o evento de abandono dispara a qualquer hora (aberturas à 01:00-02:00 no fuso do lead, ex. V25, V02). Segurar disparos entre ~22h e 8h locais e soltar de manhã.

**Timing/necessidade do FUP:**
3. Campo 2 (necessidade): explicitar que "yo te aviso" sem data = respeitar (SKIP ou espera de vários dias), com o V69 como exemplo.
4. Campo 1 (mensagem): reforçar "não repetir o gancho da última mensagem do agente" (V27/V28) — o prompt base já pede; se persistir, colocar exemplo negativo nas orientações.
5. Aumentar cobertura de FUP para silenciosos (só 6 de 61 receberam). Lead de checkout é o mais quente das 3 campanhas — merece o follow-up mais agressivo em cobertura (não em tom).
6. Janela 12:00-22:00 BRT segura o FUP do lead quente da madrugada por ~9h (V61). Avaliar abrir mais cedo.
7. Verificar o 2º FUP (cupom) que não disparou em nenhuma conversa do período.

**Checkpoint:**
8. Guarda anti-alucinação: "só mencione um link se ele foi enviado NESTA conversa; nunca afirme que 'aparece confirmação' — confirme pelo estado real" (a tool de status de 02/07 dá o meio de fazer isso). **[valida mudança 02/07]**
9. Call: proibir promessa em minutos ("te llama en 40 minutos"); confirmar janela.
10. Variação do $0: máximo 1 vez a cada 2-3 turnos; nas demais, variar alavanca (garantia, reversão de risco, passo curto).
11. "No tengo dinero" firme: não oferecer call; respeitar, combinar retorno e deixar o cupom para o FUP futuro.
12. Reforçar §7: nunca dizer que "o médico define qual medicamento é melhor para você" — a escolha é do lead, o médico valida elegibilidade.

**FAQ:**
13. Base está completa (cronograma, segurança/FDA, erro técnico, "já finalizou"). Único ajuste: na FAQ de "sem dinheiro hoje", incluir a instrução de NÃO escalar para call e sim combinar retorno — hoje o agente improvisa a call como saída.

**Fora do fluxo conversacional (reportar):**
14. Ligações do especialista não realizadas (V53, 2x no mesmo dia; ver também R08 na Receptiva) — enquanto o SLA humano não estiver garantido, o agente não deve prometer horário.
15. O lead V60 enviou foto de cartão de seguro com dados pessoais — confirmar política de retenção/descarte dessas mídias (PHI) com a plataforma.
