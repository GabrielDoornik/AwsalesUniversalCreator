# Relatório — Análise de Conversas: Abandono (Recuperação de Formulário)

Período analisado: 25/06 a 02/07/2026 (export de 02/07). 133 conversas, 683 mensagens.
Fonte: `Conversas/query_result_2026-07-02T17_18_52.xlsx`.

**Notas de método:**
- Timestamps do export em UTC (≈ ET+4, BRT+3). Leads anonimizados como A01–A133; nomes em trechos substituídos por `[nome]`.
- Conversas ANTERIORES ao checkpoint de 02/07 (tool de status, seção 12/motor de dor). Onde a ausência disso apareceu, marcado como **[valida mudança 02/07]**, não como erro do agente.
- Caveat: o lead de A92 é o mesmo de R53 da Receptiva (mesma thread nos dois exports; a IA chegou a enviar link com UTM de abandono na conversa receptiva). Dupla contagem entre campanhas para esse lead.

---

## 1. Resumo executivo

A abertura disparada no período NÃO é a do checkpoint ("¿Te interrumpió algo o te quedó alguna duda?") e sim uma versão que termina em "¿Quieres que te explique cómo funciona la evaluación?" — isso cria um funil de 2 passos extras ("Si" → explicação → "¿te paso el link?" → "Si" → link) e atrai muitos "Si" vazios que morrem na explicação. 28% dos 133 leads responderam à abertura. Quando o lead fala, o agente é educado, responde preço corretamente (tirzepatida primeiro, $0) e envia o link de retomada certo. Erros que precisam de correção: pedir o nome que já vem no metadata (3 casos, um deles perguntando de novo depois de a lead já ter dito), FUP e insistência depois de recusa clara (A18) e depois de bloqueio de segurança do formulário (A122), envio de link de retomada a leads que o formulário bloqueou por contraindicação (A82, A114), e rajadas/loops de mensagens que entregam robô (A25, A60). O maior vazamento do FUP: nenhum dos 96 leads silenciosos recebeu follow-up — o FUP inteligente só rodou para quem já tinha respondido.

## 2. Tabela de FUP

| Métrica | Valor |
|---|---|
| Abordados (receberam a abertura) | 133 |
| Responderam à abertura em algum momento | 37 (28%) |
| Leads que receberam ≥1 FUP | 22 (todos entre os 37 engajados; **0 FUP para os 96 silenciosos**) |
| Responderam após o FUP (≤48h) | 5 (A25, A92, A93, A105, A119) |
| **Taxa de resposta ao FUP** | **23%** |
| Avançaram após o FUP | 4 receberam/pediram link ou retomaram (A92 "lo haré ahora mismo", A93, A105, A119) |
| Leads que receberam link de retomada | 25 |
| Auto-relato de conclusão/avanço na transcrição | A92 (declarou que ia fazer na hora), A108 (avaliação feita, travou no valor) — cruzar com banco |

Observações:
- O 2º FUP (cupom) não apareceu em nenhuma conversa — mesma pendência da Receptiva: verificar painel.
- FUPs em lote às 15:00 UTC (12:00 BRT). Para lead que respondeu de madrugada, o FUP chega ~10-12h depois.
- A ausência de FUP para silenciosos é a maior alavanca de volume desta campanha: 96 leads receberam 1 mensagem e nunca mais foram tocados.

## 3. Erros do agente (priorizados)

**E1 — FUP/insistência após recusa clara (viola RAR + regra de SKIP).**
- A18: lead "No gracias" → IA ainda vendeu ("Si luego quieres probar algo que ayude a tu biología... Te dejo el link guardado por si te sientes lista después? 👋") e o FUP voltou no dia seguinte ("¿qué es lo que más te haría sentir segura para dar el siguiente paso?"). Recusa clara = encerrar + SKIP.

**E2 — Lead bloqueado por segurança tratado como lead recuperável.**
- A82: lead: "Me dijo que no puedo. Tengo cálculos biliares" (o formulário a barrou) → IA reenviou o link de retomada ("¿Quieres que te ayude a retomar para que el médico pueda analizarlo?").
- A114: lead barrada por condições de saúde → IA agendou call E ainda mandou o link: "si quieres puedes intentar avanzar con tu evaluación por aquí: https://...".
- A122: print de "bypass gástrico <6 meses: vuelve a aplicar después de 6 meses" → IA ofereceu call e o FUP insistiu no agendamento ("¿Prefieres que te llamen en la mañana, tarde o noche?"). A orientação de FUP manda SKIP para desqualificado por segurança.
O tratamento correto já existe na própria campanha: A49 (print de "contraindicaciones absolutas" → "Nuestra prioridad es siempre tu salud... lo mejor es que consultes con tu médico de confianza. Siento mucho no poder ayudarte esta vez."). Padronizar A49.

**E3 — Pedir o nome que já vem no metadata (viola §1 do checkpoint).**
- A25: "Por cierto, cómo te llamas? Así te registro bien por aquí."
- A88: "Cómo te llamas?" no meio da explicação.
- A60: perguntou o nome, a lead respondeu "[nome]", e 25 minutos depois perguntou DE NOVO "Por cierto, cómo te llamas?" — falha de memória que entrega robô na hora.
Correção: usar o nome do metadata; se realmente não vier, seguir sem nome (não travar a conversa nisso).

**E4 — Rajadas, duplicações e loops de despedida (percepção de robô).**
- A25: link enviado 4x em ~1h, com turnos duplicados sem o lead responder ("Dale, perfecto." às 18:39 sem mensagem nova da lead; duas respostas simultâneas às 19:18-19:19).
- A60: ~12 trocas de boa-noite — a IA respondeu a cada "Ok" da lead ("Buenas noches!" / "Hasta el lunes." / "Que descanses!" / "Dale, nos vemos el lunes!").
- A101: respondeu 2x em sequência com tons contraditórios (despedida respeitosa + piada "Jajaja, qué exagerada! 😂") por corrida entre duas mensagens da lead.
Correção: 1 resposta por turno do lead; encerramentos de 1 mensagem; não responder a monossílabos de despedida.

**E5 — Promessa de ligação com hora marcada e "sin falta".**
- A74: "Mañana a las 5:00 PM te llaman sin falta"; A114: "te contactan sin falta" — no mesmo período houve calls prometidas e não realizadas em outras campanhas (R08 na Receptiva, V53 em Vendas). Prometer "sin falta" + hora exata é risco de quebra de confiança que o agente não controla.
Correção: confirmar a janela sem juramento ("un especialista te llama mañana por la tarde; si algo cambia te aviso por aquí").

**E6 — UTM ausente nos links até ~29/06 (perda de atribuição).**
- A29 (26/06) e A83 (28/06): links de retomada sem os parâmetros `utm_source=awsales...`; a partir de A92 (29/06 23:33) a UTM aparece. Metade do período ficou sem atribuição no analytics. (A93 saiu com utm duplicada — fb + awsales — funciona, mas vale sanear.)

**E7 — Lead que já passou do formulário recebeu link de formulário. [valida mudança 02/07]**
- A108: "La evaluación la hice ayer, por eso le dije que no puedo pagar todo junto" (ela já estava no preço/checkout) → IA reenviou o link do formulário ("¿Te parece si terminas de enviarla?"). Sem a tool de status o agente não tinha como saber a etapa real — é exatamente o caso que a consulta de status + roteamento por PARTIAL resolve.

**E8 — Link de retomada com token divergente.**
- A119: primeiro link com `lt=83d2020e...`, segundo link (após o FUP) com `lt=81aec8a8...` — dois tokens diferentes para a mesma lead. Se o segundo abre outra sessão, a lead recomeça do zero. Verificar com o Willian qual token o metadata entrega e por que mudou.

## 4. Contorno de objeções (por trava)

- **Preço:** BOM. A03/A32/A41/A64/A89: responde valor quando perguntado, tirzepatida primeiro, $0 na lógica de agora, sem rebaixar proativamente. A108 é o melhor exemplo completo: reclamação de falta de clareza → "¿qué precio te confundió?" → explicação tirze vs sema → cupom TIRZE3 quando o total de 3 meses apareceu como trava real → plano mensal só quando a lead pediu explicitamente pagamento mensal. Dentro do playbook.
- **"Gratis do anúncio":** A25: "Pensé que era gratis como dice en el anuncio" → separou bem consulta grátis vs tratamento pago. Recorrente também na Receptiva — problema de copy do anúncio, não da conversa.
- **Medo de agulha:** A117 é referência: lead já aplicava insulina → "también es una aplicación subcutánea con una aguja súper fina. Como ya tienes experiencia con la insulina, te va a resultar mucho más fácil" — ancorou no repertório da lead.
- **Fricção prática (sinais vitais):** A52: "no tengo donde tomarme los signos" → indicou máquinas gratuitas de farmácia (CVS/Walgreens). Resolveu; padronizar via FAQ (hoje foi improviso).
- **Emocional/descrença:** quase não aparece — a abertura atual puxa o lead para PROCESSO ("te explico como funciona") em vez de puxar a trava/dor. O motor de dor por etapa do checkpoint de 02/07 ataca exatamente isso. **[valida mudança 02/07]**

## 5. Generalização vs personalização

**Veredito: FUPs personalizados (melhores das 3 campanhas), abertura e explicação genéricas.**
- FUPs citam a última dúvida real: A03 ("más temprano preguntaste por la dosis de tirzepatida..."), A25 ("mencionaste que tenías una pregunta sobre tu evaluación. ¿Qué te gustaría saber?"), A32 ("ayer me preguntaste por el precio de la tirzepatida y no supe si te pareció bien").
- A abertura não reconstrói o momento do lead (não diz em que passo parou, nem o medicamento) — era limitação do período, o metadata + status de 02/07 habilitam isso. **[valida mudança 02/07]**
- A explicação do processo é o mesmo bloco ("evaluación de 5 minutos... médico revisa en menos de 24 horas... 3 a 5 días") em todas as conversas — funcional, mas é onde os "Si" morrem.
- Nome usado com parcimônia correta quando vem do metadata ✓.

## 6. Acertos a manter

- A49: honestidade total no bloqueio por contraindicação ("no podemos saltar esa recomendación del sistema... Siento mucho no poder ayudarte esta vez") — vira o padrão para E2.
- A117: condução de medo de agulha por analogia com insulina + suporte de UI do formulário ("no hace falta que toques 'volver al inicio'... ya estás en la parte final").
- A108: playbook de preço completo (transparência → cupom → mensal só a pedido).
- A52: solução prática dos sinais vitais.
- Links de retomada com token `lt=` (retomar de onde parou) + espanhol 100% em todas as mensagens + zero emoji na abertura ✓.
- Uso do cupom só quando o total é a trava real (A108) — exatamente como o checkpoint §7 pede.

## 7. Amostras anotadas

**BOA — A117:** lead com dúvida de aplicação e confusão na UI do formulário. IA valida, ancora na experiência com insulina, dá instrução exata de navegação e fecha sem pressão. A lead termina orientada e tranquila. Por quê: informação certa + personalização real + zero atrito.

**BOA — A108:** reclamação de preço confuso → diagnóstico da confusão, explicação honesta, cupom no momento certo, acomodação do mensal apenas quando pedida. Por quê: é o contorno de preço do playbook executado por inteiro (só faltou a tool de status para ver que ela já estava no checkout — parte da mudança 02/07).

**RUIM — A18:** "No gracias" → pitch de despedida com emoji + FUP no dia seguinte reabrindo a venda. Por quê: recusa clara é caixa própria no roteador (encerrar sem insistência) e cenário de SKIP no FUP; virou pressão.

**RUIM — A25:** pediu nome que já tinha, mandou o mesmo link 4x, respondeu 2x em paralelo e usou 👍 em sequência. A lead até avançou, mas a conversa parece uma fila de mensagens automáticas — é o retrato do que derruba a percepção de "IA humana".

## 8. Recomendações

**Copy (abertura):**
1. Alinhar a abertura disparada com a do checkpoint: fechar com pergunta de TRAVA ("¿Te interrumpió algo o te quedó alguna duda?") em vez de oferta de explicação ("¿Quieres que te explique cómo funciona?"). A versão atual gera cadeia Si→explicación→Si→link com queda em cada passo.
2. Com a tool de status/metadata (02/07), testar abertura que reconstrói o momento ("vi que paraste justo en [etapa]") — é o que o motor de dor prevê.

**Timing/necessidade do FUP:**
3. Cobrir os silenciosos: hoje 96/133 leads nunca receberam follow-up. Configurar/verificar por que o FUP inteligente não dispara sem resposta do lead (a orientação de necessidade diz "avaliação não concluída é SEND"). Um FUP de reabertura em ~24h para silenciosos é a maior alavanca de volume da campanha.
4. Reforçar cenários de SKIP no Campo 2: recusa clara (A18) e desqualificação por segurança (A122) — ambos já estão escritos; se o comportamento persistir após verificação, endurecer o texto com exemplos.
5. Verificar o 2º FUP (cupom) que não disparou em nenhuma conversa.

**Checkpoint:**
6. Reforçar "NUNCA perguntar o nome" com o caso A60 (perguntou 2x) e definir fallback explícito: sem nome no metadata → seguir sem nome.
7. Regra nova: lead bloqueado pelo formulário por segurança → resposta padrão A49; proibido reenviar link de retomada ou insistir em call (exceto se o lead alegar erro de preenchimento — aí orientar a corrigir a informação verdadeira, sem sugerir mudar resposta).
8. Encerramentos: 1 mensagem de despedida, não responder a monossílabos ("Ok", "Gracias") repetidos.
9. Call: proibir "sin falta" e prometer só janela, não minuto.

**FAQ:**
10. Adicionar FAQ Produto "onde medir peso/pressão para o formulário" (máquinas gratuitas em farmácias CVS/Walgreens etc.) — padroniza o improviso bom do A52.
11. Adicionar FAQ Playbook "o formulário bloqueou o lead por segurança" com o script do A49 (honestidade, médico de cabecera, sem retomada).

**Fora do fluxo conversacional (reportar):**
12. Tokens `lt=` divergentes para o mesmo lead (A119) e links `resume=1` vs `lt=` — validar com o Willian qual formato retoma de verdade a sessão.
13. UTM: garantir que o agente sempre anexe a UTM awsales (corrigido ao longo do período; conferir se ficou estável).
14. Volume/topo (fora de escopo desta análise, só registro): 133 aberturas em 8 dias com 28% de resposta — o gargalo de volume está antes da conversa, não nela.
