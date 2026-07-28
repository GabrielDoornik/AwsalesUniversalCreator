# Relatório — Recuperação de Vendas A/B: por que não está vendendo (03/07 a 10/07)

Fonte: `rec de vendas sem imagem.xlsx` (Campanha A, 03/07-10/07, 81 leads, 204 mensagens) e
`rec de vendas com imagem.xlsx` (Campanha B, 08/07-10/07, 25 leads, 140 mensagens).
Leads anonimizados como A01-A81 e B01-B25. Timestamps em UTC (≈ ET+4). Links de checkout truncados
(contêm nome/e-mail do lead).

---

## 1. Veredito direto (quem é o culpado)

Ordem de peso na falta de venda, com base nas transcrições:

1. **Tráfego / fit da oferta (~50-55% do problema).** 88% dos leads da campanha A nunca respondem
   nada — nem à abertura, nem a 3 FUPs no mesmo dia. E dos 18 leads que conversaram nas duas campanhas,
   **14 (78%) travaram em dinheiro/cobrança**: "no tengo dinero", "estoy desempleado", "no tengo tarjeta",
   "mi tarjeta no tiene dinero", "el viernes tendré el dinero", "me están cobrando 700/500/299". Dois leads
   acharam que era grátis ("Pensé que era gratis" A48; "No es la primera gratis" A64). O anúncio está
   trazendo gente sem poder de compra e/ou com expectativa de gratuidade para um produto de $546-798 por
   trimestre. Isso a IA não conserta: não existe contorno conversacional para "estoy desempleado".
2. **Checkout / percepção de cobrança (~20%).** A objeção mais repetida de quem responde é achar que está
   sendo COBRADO agora: o checkout mostra o total dos 3 meses e o lead entende cobrança imediata (A15
   "dise q so 700 casi", A31 "están cobrando 299 pide tarjeta", A64 "me están cobrando 500... me hicieron
   el cobro... salió diclain"). O caso A64 é grave: a lead relata cobrança REAL tentada e recusada
   ("declined") — se o checkout faz pré-autorização/validação de cartão com valor, a promessa "$0 ahora"
   está sendo desmentida pela experiência do lead. VERIFICAR com o cliente/Willian como o checkout valida
   o cartão. Enquanto o lead "vê" uma cobrança, o melhor argumento da campanha ($0) morre.
3. **Estratégia / configuração de FUP (~15%).** O checkpoint está sendo seguido (ver seção 4) e mesmo
   assim não converte — então parte é teto da estratégia: (a) o FUP3 saiu do combinado — era para oferecer
   o CUPOM, mas está saindo uma mensagem de **escassez falsa** ("Tu reserva no queda abierta para siempre
   y está por vencer... si vence, tendrías que empezar de cero") enviada a 18 leads — viola a orientação
   escrita ("Sem prazo inventado") e o Playbook (nunca escassez falsa); o cupom sumiu do lugar onde foi
   planejado; (b) não existe caminho de downsell para o lead sem dinheiro (mensal é proibido
   proativamente, cupom de $25-50 não resolve "estoy desempleado"); (c) FUP estático-convergente ignora
   acordos da conversa (B07 combinou sexta-feira e recebeu FUP "¿Lo dejamos confirmado hoy?" no mesmo dia).
4. **Execução do agente (~10%).** Sem erro que mate venda neste período. Os erros são de polimento:
   muleta do $0, rajadas de mensagens, loop de despedida, URL repetida, um cupom possivelmente aplicado ao
   plano errado. Nenhum lead desistiu por causa de um erro da IA nas transcrições.

Resumo em uma frase: **a IA está executando o script razoavelmente bem para uma audiência que, na
maioria, não tem dinheiro ou acha que está sendo cobrada na hora — o gargalo é quem chega e o que o
checkout comunica, e o FUP de escassez falsa é o único ponto em que a nossa operação saiu do combinado.**

---

## 2. Funil em números

| Métrica | A (sem imagem, 7 dias) | B (com imagem, 2 dias) |
|---|---|---|
| Leads abordados | 81 | 25 |
| Responderam algo | 10 (12%) | 8 (32%) |
| Receberam link de checkout | 3 | 4 |
| Cupom citado na conversa | 4 leads | 2 leads |
| Call de especialista oferecida | 2 | 2 |
| Receberam FUP de escassez falsa | 12 | 6 |
| Conversões confirmadas na transcrição | 0 | 0 |

- Janela comparável (08-10/07, as duas rodando em paralelo): A = 2/23 respostas (8,7%); B = 8/25 (32%).
  Mesma abertura nas duas. Amostra pequena demais para conclusão, mas vale acompanhar: se B seguir
  respondendo 3x mais com o MESMO copy, investigar diferença de origem/horário dos leads entre as filas.
- Resposta à abertura caiu vs período anterior (20% em 24/06-02/07 → 12% em A). O copy é o mesmo; sugere
  piora do lado do tráfego/audiência.
- Quem responde, responde rápido (mediana ~10 min). Quem não respondeu em 1h quase nunca volta — a
  cadência de FUP no mesmo dia faz sentido; o problema é o CONTEÚDO do 3º toque (escassez falsa).
- Padrão pós-link: "Ok" → link → silêncio (A31, A53, B06, B18). O lead some exatamente no passo do
  checkout — reforça o diagnóstico de fricção no checkout, não na conversa.

## 3. Por que o lead para (evidência por trava)

- **Sem dinheiro / desempregado (7 leads):** A29, A48, A53, B07, B11, B15, B23. Não é objeção contornável
  por copy: é falta de meio de pagamento. A48: "No tengo dinero para pagar... Pensé que era gratis... No
  tengo tarjeta de banco mucho menos."
- **Percepção de cobrança agora (4 leads):** A15 (700), A31 (299), A64 (500 + decline), B15 ("No envíen
  nada si es para pagar"). O total do checkout assusta; o $0 não está visível o suficiente na página.
- **Preço alto (consulta factual) (3 leads):** A21, A44, B03/B06 — perguntaram preço, receberam resposta
  correta (266/299 + $0), sumiram depois do valor.
- **Desconfiança de assinatura (1):** A78 "es una membresía verdad lo leí en las letras pequeñas" —
  resposta da IA foi evasiva (ver E6).
- **Recusa direta (2):** B09 "No me interesa", A64 "No gracias".
- **Nenhum lead do período levantou objeção de credibilidade/resultado** ("¿funciona?", "¿tienen fotos?") —
  por isso a imagem do teste B nunca disparou (ver seção 6).

## 4. Aderência ao checkpoint (a pergunta central)

**Veredito: aderência ALTA. As conversas seguem o checkpoint. Logo, a parte do problema que é nossa está
na estratégia/configuração, não na execução do agente.**

Cumprido à risca:
- Espanhol 100%, sem emoji na abertura, sem comparação com marca, sem rótulo de peso.
- Regra do $0 na lógica de AGORA, honestidade sobre cobro automático na aprovação (B07: "el cobro es
  automático en cuanto te aprueban" — e segurou a finalização para sexta por causa disso; B15 idem).
- Gate de link: link só após intenção ("Ok" → link em A31, A53, B06, B18; A44 perguntou antes de mandar).
- Cupom como carta de fechamento quando preço é a trava real (A15, A29, A31, A64, B07) — **o cupom ESTÁ
  sendo usado no conversacional**; o que não está acontecendo é o cupom no FUP3, que foi substituído pela
  escassez falsa (ver E1). Provável origem da percepção de "cupom não usado".
- Preço informado só quando perguntado, tirzepatida antes de semaglutida, sem recálculo de total.
- Recusa respeitada com porta aberta (A48, B09, B15 — encerramentos educados, sem insistência).
- Desqualificação/segurança: nenhum caso no período.

Violações encontradas (nenhuma mata venda sozinha, mas somam):
- **Muleta do $0 persiste** (proibida no checkpoint §2): em quase toda resposta de A15, A29, A31, B06,
  B11, B23 o $0 aparece de novo — vira eco robô. Mesmo erro E4 do relatório anterior.
- **Shotgun de alavancas** (proibido: "uma alavanca por vez"): A15 despejou total + $0 + cupom em 3
  mensagens no mesmo minuto; A29 idem ($0 + cupom + automático).
- **URL repetida na íntegra** (checkpoint §8 manda referenciar "el enlace que te dejé arriba"): A53 e B06
  reenviaram o link completo minutos depois do primeiro envio.
- **Loop de despedida** (E8 do relatório anterior): B06 respondeu 3x a "gracias"; A64 fechou 3x, incluindo
  um FUP às 23:17 só para se despedir de novo de conversa já encerrada.
- **Link enviado após "No puedo ahora"** (B23) — lead em recusa temporária explícita recebeu o link mesmo
  assim.

## 5. Erros e achados priorizados

**E1 — FUP3 com escassez falsa (18 leads).** Causa raiz esclarecida pelo CS (10/07): a plataforma não
permite configurar 3 FUPs inteligentes (só ativar o inteligente, que decide sozinho se envia), então os 3
toques foram configurados como FUPs ESTÁTICOS de inatividade — por isso o texto idêntico entre leads. E o
cupom não pode entrar no template porque é template de utilidade (regra Meta: desconto = marketing). O
problema restante é o TEXTO do 3º template: "Tu reserva no queda abierta para siempre y está por vencer...
si vence, tendrías que empezar de cero" — prazo inventado (a reserva não tem vencimento documentado no
insumo) + consequência falsa ("empezar de cero": os dados clínicos ficam no metadata; ninguém recomeça do
zero). Viola o Playbook (nunca escassez falsa) e foi a 18 leads (12 em A, 6 em B). Corrigir: reescrever o
template do 3º toque com ângulo verdadeiro e compatível com utilidade (ex.: avaliação já completa +
revisão médica em menos de 24h após confirmar), e manter o cupom exclusivamente no conversacional.

**E2 — FUP ignora acordo de data (B07, reincidência do V69).** Lead combinou sexta-feira ("El viernes
tendré el dinero"), a IA aceitou ("Quedamos así para el viernes") — e às 22:31 do MESMO dia caiu o FUP2
template "¿Lo dejamos confirmado hoy?". Contradiz o combinado e queima a confiança construída. Corrigir no
Campo 2: "lead combinou data específica = SKIP até a data".

**E3 — Possível cobrança real no checkout (A64).** Lead insistiu que houve tentativa de cobrança e que
"salió diclain" (recusada por falta de saldo). Se o checkout faz pré-autorização com valor cheio, o
discurso "$0 ahora" está tecnicamente correto mas experiencialmente falso. AÇÃO EXTERNA: confirmar com o
cliente como funciona a validação do cartão (hold? $1? total?) e ajustar o script do agente para explicar
isso quando o lead relatar cobrança — hoje a IA só nega ("el sistema solo cobra si el médico aprueba"), o
que soa a gaslighting para quem viu o decline no app do banco.

**E4 — Abertura duplicada (A07, A53) — descartado como bug de exibição.** A07 aparece com a MESMA
abertura em 03/07 e 09/07 e A53 com nova abertura em meio a conversa ativa. Esclarecido pelo CS (10/07):
é bug de frontend/exibição — a mensagem é enviada apenas uma vez ao lead. Sem ação; fica registrado para
não reabrir o falso alarme em análises futuras.

**E5 — Cupom possivelmente aplicado ao plano errado (A31).** Lead reportou "cobrando 299" (preço do
tirzepatida MENSAL) e recebeu TIRZE3, que só vale no trimestral. Se o plano dela era mensal, o cupom não
aplica e gera frustração no checkout. Regra a reforçar: confirmar plano trimestral antes de citar cupom.

**E6 — Resposta evasiva sobre "membresía" (A78).** "¿Es una membresía? Lo leí en las letras pequeñas" →
IA: "Es un plan de tratamiento que ya te incluye todo". É assinatura com renovação e política de
cancelamento (7 dias antes da renovação) — a resposta honesta constrói mais confiança com lead
desconfiada que leu letra miúda. Hoje soa esquiva. Ajustar orientação: confirmar a natureza recorrente +
cancelamento livre antes do próximo ciclo.

**E7 — Call de especialista para quem não tem dinheiro (A53, B15).** Recomendação nº 11 do relatório
anterior segue não aplicada: call não resolve falta de dinheiro. B15 (desempregado, "No envíen nada si es
para pagar") recebeu oferta de call — tone-deaf. O caminho: validar, combinar retorno e deixar o cupom
para o FUP futuro. (B23, cartão bloqueado, é caso legítimo de call — esse está certo.)

**E8 — Fato não autorizado: "una de débito también sirve" (B11).** Não há no insumo/FAQ confirmação de
que cartão de débito funciona no checkout. Se for verdade, adicionar ao insumo; se não, é alucinação
factual que o Auditor não pegou (não é número).

**E9 — Aberturas de madrugada: mantidas por decisão do CS (10/07).** O evento de abandono na madrugada
significa lead ativo naquele momento (quente) — o disparo imediato é intencional. Recomendação de janela
de horário para a abertura retirada; sem ação.

## 6. Estado do teste A/B (imagem de prova social)

**A imagem NUNCA foi enviada em 2 dias de campanha B.** Nenhum dos 25 leads caiu no gatilho (dúvida de
credibilidade/resultado, "ya probé de todo", pedido de foto, hesitação). As objeções reais do período
foram todas de dinheiro/cobrança/cartão — a FAQ da imagem não tem como dar match nelas.

Implicações:
1. **O teste ainda não começou de fato.** Zero exposição da variável testada = nenhuma conclusão possível.
   Os 32% de resposta de B vs 8,7% de A na mesma janela NÃO têm relação com a imagem (ela nunca apareceu);
   se persistir, é diferença de fila/horário/audiência.
2. **A objeção-alvo da imagem pode ser mais rara do que assumimos neste funil.** Quem chega ao checkout já
   "acreditou"; a trava dominante é pagamento. Se em mais 5-7 dias a imagem seguir sem disparar, vale
   discutir: (a) ampliar o gatilho para hesitação pós-preço (ex.: depois de dissolver preço, se o lead
   silenciar/hesitar, usar a prova visual como reforço de valor); ou (b) aceitar que o slot certo da prova
   social visual neste funil é outro (anúncio/página), não a conversa.
3. Recomendação: manter B rodando sem mexer por pelo menos 7-10 dias ou ~100 leads antes de qualquer
   decisão, e monitorar no painel se a FAQ da imagem registra uso.

## 7. Recomendações priorizadas

**Agora (nosso lado, sem depender do cliente):**
1. Reescrever o template estático do 3º FUP: tirar a escassez falsa, usar ângulo verdadeiro compatível com
   template de utilidade; cupom permanece só no conversacional (E1).
2. FUPs estáticos disparam mesmo com acordo de data na conversa (E2, caso B07) — avaliar no painel se o
   FUP de inatividade pode ser interrompido quando o lead responde/combina retorno.
3. Checkpoint (A e B): reforçar anti-muleta do $0 com regra dura (máx. 1x a cada 2-3 turnos + 3 fraseados
   alternativos); confirmar plano trimestral antes de citar cupom (E5); resposta honesta padrão para
   "¿es una membresía?" (E6); "no tengo dinero" sem call — combinar retorno (E7); proibir link após recusa
   temporária explícita (B23).
4. (E4 e E9 retirados após esclarecimento do CS: abertura duplicada é bug de exibição; madrugada é
   decisão intencional — lead quente no momento do evento.)

**Cobrar do cliente (fora do nosso alcance):**
5. Como o checkout valida o cartão (A64 viu decline de valor cheio?) — e, se houver pré-autorização,
   autorizar o agente a explicá-la (E3).
6. Visibilidade do "$0 hoy" na página do checkout — o total dos 3 meses sem contexto é a maior fonte de
   pânico nas conversas.
7. Tráfego: audiência com poder de compra e promessa do anúncio alinhada ao ticket (2 leads acharam que
   era grátis). 78% das conversas travando em dinheiro é problema de quem chega, não de quem atende.
8. Cruzar conversões no banco (0 confirmadas na transcrição pode subestimar — lead que finaliza sem avisar).

**Teste A/B:**
9. Não mexer na B por 7-10 dias; medir exposição da imagem (uso da FAQ no painel) antes de julgar a
   variante.

---

## ANEXO (10/07) — Receptiva: análise da amostra de 1 dia

Fonte: `C:\Users\Pedro\Downloads\receptiva.xlsx` (09/07, 18 leads, 214 mensagens, 15 leads conversaram —
83%, esperado numa receptiva: o lead inicia). AMOSTRA PEQUENA: 1 dia; para veredito definitivo, exportar
7 dias.

### A Receptiva está "vendendo" ou não? Resposta honesta

Primeiro, o objetivo DE PROJETO: o checkpoint da Receptiva (§1) define "Objetivo cumprido (encerra o
ciclo): o lead COMEÇA a avaliação pelo link". Ou seja, a Receptiva NÃO é campanha de venda direta — é
topo de funil; a venda acontece rio abaixo (formulário → checkout → aprovação médica), com a Recuperação
de Vendas fechando os abandonos de checkout. Julgar a Receptiva por "venda" é medir contra um KPI que ela
não foi desenhada para entregar. O KPI certo dela é: % de leads atendidos que INICIAM a avaliação
(atribuído por `utm_source=awsales`/`lt=`).

Segundo: nem "não está convertendo" nem "está vendendo" se prova por transcrição — a conversão dela
acontece fora do chat, no site. O cruzamento dos 22 números de formulário
completo (10/07) mostrou que a maioria das conclusões é silenciosa: 21/22 foram tocados pelas campanhas,
mas só 4 conversaram. Julgar a IA pelo chat SUBESTIMA estruturalmente a conversão. Como resolver a
discussão com dados: atribuição via `utm_source=awsales` e link personalizado `lt=` que a própria IA
envia (visto em R03) + cruzamento periódico de conclusões de formulário/checkout contra leads tocados,
como o exercício dos 22 números.

### O que a amostra mostra da qualidade conversacional (boa)

- Condução correta: acolhe, 1 pergunta de meta ("¿cuánto te gustaría bajar?"), reframe de biologia, link
  da avaliação após interesse, preços corretos (tirzepatida antes).
- Empatia e segurança de destaque: R12 (pós-parto) — a IA CHECOU lactação antes de mandar o link (gate
  clínico correto); R01 (menopausa) validada e call agendada; R16 (290 lbs, dirigindo) — "primero tu
  seguridad, maneja con cuidado".
- 15/18 engajaram, várias conversas longas e quentes. Conversacionalmente, a Receptiva cumpre o papel.

### Problemas encontrados na amostra

- **R14 (GRAVE, mesma família do A64): lead cobrada reclamando** — "Dijeron que no sacarían el dinero,
  fue tomado de mi cuenta... quiero mi reembolso". TERCEIRO caso de percepção/efetivação de cobrança
  contra a promessa do $0. Provável mecânica: médico aprovou em <24h → cobro automático disparou → lead
  não ligou os pontos ("yo no sé nada de ningún médico"). Agravante: a IA respondeu "un especialista te
  está llamando justo ahora" — promessa em tempo real inverificável (classe V53). Ações: (a) $0 com
  divulgação completa já corrigido nos checkpoints; (b) recomendar ao cliente notificação ativa "el médico
  aprobó tu receta; se procesará el cobro" entre a aprovação e o cobro; (c) proibir "te está llamando
  ahora mismo" — call é sempre janela combinada, nunca tempo real.
- FUPs da Receptiva repetem o MESMO ângulo ("médico revisa gratis, solo pagas si aprueban") em quase todos
  os toques (R02, R03, R11, R13, R15) — viola o "não repetir ângulo" do prompt base.
- "Hola, tengo una pregunta" sem pergunta (R06, R10): os FUPs seguintes só repetem "¿cuál era tu duda?" —
  testar FUP que já entrega a informação mais pedida (preço/como funciona) em vez de re-perguntar.
- R01: três "Ok" monossilábicos e a IA repetiu a mesma pergunta de escolha 3 vezes — variar a condução com
  lead monossílabo (fazer UMA proposta concreta em vez de reoferecer o menu).

### Adendo (10/07, export ampliado 02-10/07: 131 leads, 2.337 msgs) — leads da Receptiva JÁ no processo de venda

Pergunta do CS: há leads na Receptiva que já preencheram o formulário e estão no estágio de venda
(checkout), território da Recuperação de Vendas? SIM — 7 identificados, com dois problemas sistêmicos:

| Lead | Evidência | Como a IA tratou |
|---|---|---|
| RX049 Ana (1408****) | "Acabo de confirmar mi pedido de tirzepatida (quarterly). Ayúdame a finalizar el checkout" | PIOR caso: não consultou status, não enviou checkout; respondeu $0 genérico + pergunta. Lead sumiu. Venda quente perdida. |
| RX033 Angela (5731****) | "Ya terminé y elegí el Plan" + "¿puedo pagar con Apple Pay?" | Empurrou a dúvida para o link e para a call; call não aconteceu na hora ("No me llamó el Dr"); prometeu "en 2-3 minutos suena tu teléfono" (promessa em tempo real proibida). |
| RX114 Amelia (1805****) | "Ya terminé" + print do checkout com "Invalid Card Number" | Razoável (explicou $0, sugeriu revisar/outro cartão), mas disse "no me aparece el registro por aquí" sem evidência de consulta real (classe V53). |
| RX052 Aruna (1571****) | "Me dice que soy elegible pero me piden tarjeta" | Explicou $0; lead voltou 3 dias depois ainda travada no cartão. |
| RX050 Yesenia (1717****) | "Ya terminé la evaluación" | Assumiu concluído sem consultar status; se ela parou antes do pre-save, ninguém sabe. |
| RX006 Georgina (1908****) | Print de erro ao preencher o formulário | Conduziu no chat. |
| RX120 Daymar (1347****) | "Eso lo llené cuando vi el anuncio en Instagram" | IA mandou o link de COMEÇAR DO ZERO para quem já tinha preenchido (não usou retomada/status). |

**Problema sistêmico 1 — Seção 13 do checkpoint (tool de status) não está sendo usada.** O checkpoint
manda consultar @consultar_status_da_avaliacao sempre que o lead disser que já preencheu/pagou. Em NENHUM
dos 7 casos há evidência de consulta e roteamento por estado (PARTIAL → enviar checkout_url etc.).
RX049 é o retrato: com a tool, a resposta correta era consultar, receber o checkout_url e fechar.
Verificar na plataforma se a tool está configurada/funcionando nesta campanha e testar com "ya pagué".

**Problema sistêmico 2 — buraco no funil de recuperação.** Cruzamento com os exports de Recuperação de
Vendas (A e B, 03-10/07) e Abandono: dos 7 leads acima, SÓ Amelia (RX114) entrou na Recuperação de Vendas.
Ana, Angela, Aruna, Yesenia, Georgina e Daymar nunca receberam a campanha de recuperação — o evento de
abandono de checkout aparentemente não disparou para eles (hipóteses: caminho de entrada sem sessão
rastreada, ex. formulário iniciado pelo anúncio do Instagram; mismatch de telefone; debounce). Investigar
com o Willian na integração forms-site. Enquanto isso, a única rede de segurança desses leads é a própria
Receptiva usar a seção 13 — reforçando o Problema 1.

### Conclusão do anexo

Na condução topo-de-funil (acolher, diagnosticar, mandar pro formulário), a Receptiva executa bem. Os
problemas dela estão nas BORDAS do funil: leads que já avançaram para o checkout não são roteados pela
tool de status (seção 13 ignorada) e, pior, a maioria deles também não é capturada pela Recuperação de
Vendas (evento não dispara). A discussão "converte ou não" só se resolve com dados de funil atribuídos;
o achado R14 (cobrança pós-aprovação gerando sensação de golpe) segue sendo o alerta de produto mais
importante.
