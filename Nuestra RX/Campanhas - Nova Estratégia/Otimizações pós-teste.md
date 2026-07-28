# Otimizações pós-teste

Lista de ajustes identificados testando os checkpoints no playground.

STATUS (2026-06-22): pontos 1 a 7 APLICADOS nos 3 checkpoints (Abandono, Receptiva, Vendas). Ponto 8
são itens de config no painel (janela/fuso/duração do @freeBusy), do lado do usuário. FAQs não precisaram
mudar: a "¿Es lo mismo que Ozempic?" e a da garantia já trazem o conteúdo certo; o problema era o
Copywriter não seguir, agora reforçado no checkpoint.

## PRIORIDADE MÁXIMA - Compliance FDA

6. Equivalência com marca (violação real no teste).
   - Sintoma (teste Abandono, "¿es como el ozempic?"): a IA respondeu "La Semaglutida utiliza el mismo principio activo y mecanismo de acción" — confirma equivalência com a marca (proibido) e omitiu o disclaimer.
   - Ajuste (vale os 3 checkpoints): tornar a regra FDA operacional, com o trap exato. Ao perguntarem "¿es como [marca]?" ou comparar, NUNCA confirmar com "mismo principio activo/mecanismo". Responder: descrever pelo princípio ativo (semaglutida/tirzepatida), dizer EXPLICITAMENTE que não é a mesma nem versão da marca, que é composto por farmácia 503A não aprovado diretamente pela FDA, e voltar ao mecanismo. Marca só como referência em alergia/uso prévio. Adicionar exemplo DO/DON'T no checkpoint. O Response Auditor NÃO pega isso — prevenção tem que estar no checkpoint + FAQ.

## Vale para os 3 checkpoints

1. REGRA DE TAMANHO (textão) — prioridade alta.
   - Sintoma (teste Abandono, lead "ya probé de todo"): a IA respondeu 3 parágrafos / ~80 palavras. Reframe ótimo, mas longo demais; entrega "IA", não concierge humano.
   - Ajuste: regra de tamanho dura no tom — máximo ~2 frases curtas por mensagem; as FAQs e o checkpoint são para a IA ENTENDER, não recitar; explicar o mecanismo em UMA frase, não em parágrafo; se passar de 2-3 linhas, cortar.
   - Recorrência: voltou na pergunta de preço (~70 palavras, 4 blocos). Confirma prioridade alta.

3. Ordem da indução da tirzepatida.
   - Sintoma (teste Abandono, "¿cuánto cuesta?"): a IA apresentou a Semaglutida PRIMEIRO e a Tirzepatida depois.
   - Ajuste: reforçar na Seção 7 que a Tirzepatida vem SEMPRE primeiro, como a recomendada/mais completa; a Semaglutida entra depois, como alternativa mais econômica. Vale checar Receptiva e Vendas também.

4. Uma alavanca por vez (objeção) — liga-se ao tamanho.
   - Sintoma (teste Abandono, "está caro"): a IA disparou 5 alavancas de uma vez (valor incluído + garantia + $0 + cupom + oferta de link). Vira shotgun, perde impacto e soa IA.
   - Ajuste: ao dissolver objeção, usar UMA alavanca forte e fechar com pergunta. Guardar as outras pros próximos turnos.
   - Positivo a manter: NÃO rebaixou pro mensal e usou o cupom certo (só trimestral, sem revelar código).

5. Frase da garantia (compliance).
   - Sintoma: "si no bajas de peso, se te devuelve el dinero" dito cru, sem condições.
   - Ajuste: sempre citar a garantia como sujeita a termos (12 meses contínuos, 13 envios, seguir indicações). Nunca prometer reembolso incondicional. Reforçar no checkpoint e conferir a FAQ.

7. Tique de "¿te paso el link?".
   - Sintoma: a IA fecha quase todo turno com "¿quieres que te pase el link?". Vira repetitivo e empurra link demais.
   - Ajuste: variar o fecho (às vezes uma pergunta sobre a lead, às vezes a próxima info); oferecer o link só quando o gate da seção 8 permitir, não como muleta de fechamento.

8. Call: janela/fuso do @freeBusy a alinhar (config, não checkpoint). NÃO houve alucinação.
   - Correção: o @freeBusy RODOU e a IA buscou certo — 17:00 estava ocupado e ela ofereceu 16:00 e 18:00, que estavam livres. Comportamento correto. (A avaliação anterior de "alucinação" estava errada.)
   - "agenda llena" para um retorno de ligação é natural; não é problema.
   - A verificar no painel: o @freeBusy consultou 09:00-20:00 em fuso -03:00 (BRT) = ~08:00-19:00 NY (EDT). O cliente pediu 1pm-8pm NY = ~14:00-21:00 BRT. Conferir com o time se a janela é a do MF (BRT) ou a do lead (NY) e ajustar; cuidar do horário de verão dos EUA.
   - Duração: a consulta usou bloco de 1h (17:00-18:00); a call é de 15 min. Alinhar a duração na config da tool.
   - Guarda de link vazio: a IA escreveu o token `{{metadata.form_resume_url}}` cru (playground sem metadata, esperado). Em produção confirmar que vazio resolve pra vazio para a guarda agir.

## Da revisão do histórico do WhatsApp (reclamações antigas do cliente) - APLICADO nos 3 checkpoints

9. Repetição do nome do lead (reclamação 21/06, pontos 3 e P1; visto nos testes "Suélen/Mira Suélen").
   - Ajuste aplicado: usar o nome com parcimônia, nunca em toda mensagem.

10. Pitch/preço repetitivo (reclamação 21/06, ponto 4 e P1).
   - Ajuste aplicado: variar argumento e fraseado entre turnos; não repetir a frase do $0/preço toda mensagem.

Confirmado com o usuário: manter só cupom fixo (sem urgência falsa); manter as seções "Campos de estado para o Follow-Up Inteligente" (vão usar Smart FUP, configuração pendente). FUP de inatividade fixo, se usado, vira copy separada.

11. Afordabilidade/fluxo de caixa + timing da cobrança (Vendas) - APLICADO.
   - Sintoma (teste pré-otimização, lead "no tengo dinero, recibo el mes que viene"): a IA não tratou a objeção de timing, repetiu "$0 ahora" e se CONTRADISSE sobre cobrança automática (turno 5 "no es automático" x turno 6 "sí es automático").
   - Ajuste (Vendas): objeção de afordabilidade -> oferecer o CUPOM do trimestral (decisão do usuário); timing da cobrança definido como AUTOMÁTICO na aprovação/despacho (<24h), responder sempre igual e honesto, nunca "no es automático"; não prometer adiar a cobrança; se ainda não puder, call do especialista.
   - A replicar (opcional): a regra factual de "timing da cobrança" em Abandono/Receptiva, se a pergunta aparecer lá.

## Da análise das conversas de Vendas (pré-otimização) - APLICADO

12. Cupom no timing certo + caso "total do checkout" (Vendas).
   - Sintoma: a IA ofereceu o cupom cedo demais (na 1ª pergunta de preço) e sumiu quando virou trava real (lead viu o total no checkout e disse "no puedo" → só repetiu "$0 ahora").
   - Preços confirmados pela tela do checkout: Semaglutida trimestral $182/mês ($546 total), Tirzepatida trimestral $266/mês ($798 total), sem imposto. Seção 7 já estava correta; consulta+envío+soporte entram grátis.
   - Ajuste (Vendas, sem número fixo): cupom só quando o preço/total for trava REAL, nunca na 1ª pergunta de preço; e caso "lead reage ao total dos 3 meses" → explicar que é o total dos 3 meses, $0 agora, cobra na aprovação, e oferecer o cupom; nunca citar nem recalcular o total.

## Recuperação de Formulário - Abandono

2. Pace do link na trava "¿es para mí?" / "ya probé de todo".
   - Sintoma: a IA dissolveu a objeção e, na MESMA mensagem, já ofereceu o link ("¿quieres que te pase el link...?"). A lead ainda não tinha sinalizado avanço.
   - Ajuste: reforçar que, nessa trava, o fecho é UMA pergunta sobre a situação da lead (pra ela se sentir ouvida e dar o detalhe); o link/oferta de link só no turno seguinte, depois do sinal de avanço. Defensável que tenha amarrado no "el médico revisa si es para ti", mas ainda puxa pro link rápido demais.
