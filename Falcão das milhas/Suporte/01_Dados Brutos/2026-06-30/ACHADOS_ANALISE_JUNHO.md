# Achados da análise — Suporte Falcão das Milhas — Junho/2026

Números computados a partir das tabelas em `01_Dados Brutos/2026-06-30/`. Fonte da verdade para escrever o relatório. Período: 01–30/06/2026. Campanha: ffbc47ff-425b-4027-a23f-ec0ee5ec8c73.

## Volume e resolução (Tactical Analysis + Optimization Hub)
- Conversas analisadas: 1.422 (Optimization Hub "Análises Táticas" = 1.424; séries diárias somam 1.424)
- Resolvidas pela IA (método AI): 464 = 32,6%  (dessas: 302 RESOLVED, 162 PARTIAL)
- Resolvidas/encaminhadas humano (método HUMAN): 772 = 54,3%  (RESOLVED 331, PARTIAL 89, UNRESOLVED 352)
- Abandonadas: 186 = 13,1%
- Comparativo deflexão IA: 15-05 = 47,6% → 21-05 = 39,2% → junho = 32,6% (caindo, com volume 3,3x)
- Nota: a aba "Resumo" do Optimization Hub usa definição mais estrita (IA=285, Humano=914, analisadas=1199). Para consistência com relatórios anteriores uso método AI/HUMAN/ABANDONED.

## CSAT (Tactical Analysis, n=181 respostas)
- Geral: 3,71
- Só IA: 4,76 (n=49)
- Só humano: 3,33 (n=132)
- Operadores: Aline 2,22 (587 tickets, ativo) · Nicole 2,94 (suspenso) · Anna Clara 1,21 (suspenso) · Matheus s/ CSAT
- Cobertura da base (RAG accuracy média): 88,5% (n=1266) — subiu vs 86,3% (21-05)

## Handoff (Optimization Hub "Motivos" + Handoff Tickets)
- Total handoffs: 773 (séries) / 865 tickets
- Motivos: AI_DONT_KNOW 426 (55%), HUMAN_REQUEST 133, CANCELAMENTO_REEMBOLSO 40, FALSE_PROMISE 22, RETRY_EXHAUSTED 17, CANCELAMENTO_CONFIRMADO 15, CANCELAMENTO_SOLICITADO 10
- Tickets: RESOLVED 823, WAITING 23, ASSIGNED 19
- SLA estourado: 24 (2,77%) — não é mais zero como em 21-05
- Tempo atribuição→resolução: mediana 0,29h (~17min), média 10,05h
- Devoluções: 276 tickets com retorno, mas a maioria é operacional (OPERATOR_AUTO_SUSPENDED_INACTIVITY 220, OPERATOR_SUSPENDED_ON_LEAD_MESSAGE 26); CSAT_NOT_RESOLVED 83; MAX_TIME_EXCEEDED 15
- Fila agora: 23 aguardando

## Tópicos e fricções (Optimization Hub)
- Tópicos: Cancelamento de assinatura 562 (CSAT 3,62) · Acesso à plataforma 541 (3,68) · Uso do Buscador 205 (4,31)
- Fricções: Login 357 · Buscador Automático 205 · Buscador 131 · Primeiro acesso 71 · Buscador de passagens 61 · Recuperação de senha 45 · Formulário de cancelamento 43 (CSAT 1,82)
- Gargalo nº 1 = acesso/login (alinhado com pedido do cliente em 24/06 de otimizar acessos)

## Retenção (Conversion Window, 27.341 msgs, 1.223 conversas)
- Conversas com intenção de cancelamento/reembolso: 571 (46,7%)
- IA respondeu após a intenção: 564
- Voltou a pedir cancelamento/reembolso (seguiu p/ saída): ~441
- Retenção provável forte (relatou que resolveu/continua, sem repedir): ~10 (heurística conservadora; alguns falsos positivos, real ~6-8)
- Padrão: a retenção genuína acontece quando o problema era ACESSO e foi resolvido ("consegui acessar", "deu certo")

## Custo (valor informado pelo cliente)
- Custo IA junho: R$ 8.861,28
- Por conversa analisada: 8.861,28 / 1.422 = R$ 6,23
- Por conversa resolvida pela IA: 8.861,28 / 464 = R$ 19,10
- (Soma do Ai Cost Usd por conversa na Tactical = US$ 52,56 — é só o LLM da conversa, NÃO o custo cobrado)
- Referência humana: 4 operadores x R$ 3.000 = R$ 12.000/mês; cobertura seg-sex 9h-18h (~45h/sem) vs IA 24/7 (168h/sem ≈ 3,7x)

## REEMBOLSO (export_assiny.csv — Assiny only; Hubla pendente)
Status (junho, todos): refused 501, waiting_payment 381, paid 248, refunded 62, pix_expired 19, chargedback_refunded 5.
Completados = paid + refunded + chargedback_refunded. Reembolsos = refunded + chargedback_refunded.

- TODOS OS PRODUTOS:
  - Count: 315 completados, 62 reembolsados (+5 chargeback) → 19,68% (s/ chgbk) / 21,27% (c/ chgbk)
  - Valor: R$ 276.646,67 completado, R$ 19.247,03 reembolsado (+R$ 1.479,62 chgbk) → 6,96% / 7,49% (diluído por high-ticket)
- SÓ BUSCADOR AUTOMÁTICO (produto do suporte; comparável ao baseline):
  - Count: 207 completados, 48 reembolsados (+2 chargeback) = 50 → 23,19% / 24,15%
  - Valor: R$ 60.451,29 completado, R$ 14.530,69 reembolsado (+R$ 654,83 chgbk) = R$ 15.185,52 → 24,04% / 25,12%
- Baseline histórico: 22,5%–23%. Buscador junho ≈ 24% → EM LINHA com o histórico, SEM redução. E subestimado (coorte de fim de junho não maturou os 7 dias).
- PENDENTE: confirmar com João se baseline 22,5-23% é conta-toda ou Buscador. Puxar reembolso Hubla (recuperação/upsell) e consolidar.

## Comparativo com maio (processado dos brutos 2026-05-21 e 2026-05-15)
Maio-21 (recorte 05/05–21/05, bate com o relatório publicado de 21-05): 436 conversas, AI 171 (39,2%), HUMAN 223 (51,1%), ABANDONED 42 (9,6%). RAG 86,3%.
- CSAT geral 4,52 | CSAT IA 4,85 (n=27) | CSAT humano 4,16 (n=25)
Maio-15: CSAT IA 4,82 | CSAT humano 4,00 | geral 4,56 | RAG 85,5%
Leitura justa do CSAT (desarma a "humilhação"): o split IA>humano JÁ existia em maio (4,85 vs 4,16). Em junho a IA ficou estável (4,76) e o humano caiu (3,33) sob volume 3,3x + mix mais difícil (a IA encaminha os casos sensíveis). NÃO é a IA piorando; é o canal humano sob choque de volume.

## Ciclos de otimização de junho (do grupo WhatsApp — foram VÁRIOS, não 2)
- 03/06: relatório + perguntas/gaps ao cliente.
- 16/06: leva grande — Melhorias IA + AI DONT KNOW aplicados; remoção da cotação personalizada (cliente confirmou OFF); variáveis/canais novos.
- 23/06: correção do envio antecipado da consultoria de retenção + bug de fila (conversas finalizadas reabrindo).
- 24/06: troca/padronização do link da área de membros (memberclass) + disparo de correção aos leads que receberam link/consultoria indevidos; início do foco em acesso.
- 25/06: rodada de checkpoint do Ricardo (5 correções: link área de membros, loop do OK, The Travel, senha-padrão, botão de alerta) + validação da base (produtos/links/canais).
- Fator externo: 12/06 instabilidade da API da Meta tirou recebimento de mensagens por um período.
- KPI da operação (Lucas, 25/06): atingir 50% de resolução automática. Como o grosso entrou na 2ª metade de junho, efeito esperado aparece em julho.

## Posicionamento decidido com o usuário (30/06)
- Opção honesta (Buscador ~24%, estável), com espinha narrativa que valoriza a AWSales: (1) estabilidade sob pressão (volume 3,3x + 47% cancel-intent, taxa não disparou), (2) CSAT da IA 4,76 >> humano 3,33, (3) AWSales diagnosticou e está corrigindo a alavanca certa (acesso/login; ciclos 16/06 e 23/06; base 88,5%), (4) custo R$ 6,23/conversa vs time que não escalaria.
- Não usar o ~7% (todos produtos Assiny) como headline. Hubla consolidada abaixo — virou favorável.

## REEMBOLSO CONSOLIDADO (Assiny + Hubla) — NÚMERO FINAL
Hubla (export_hubla.xlsx, junho): 1.757 faturas ever-paid — Paga 1.432, Reembolsada 309, Em disputa 16. Valor base = "Valor do produto".
Denominador = transações ever-paid (Assiny: paid+refunded+chargeback; Hubla: Paga+Reembolsada+Em disputa). Numerador reembolso = refunded/Reembolsada (+chargeback/disputa à parte).

- BUSCADOR AUTOMÁTICO (produto do suporte; comparável ao baseline):
  - Count: 1.404 completados, 270 reembolsados → 19,23% (s/ disputa) / 19,94% (c/ disputa 10)
  - Valor: R$ 450.326,29 completado, R$ 85.270,52 reembolsado → 18,94% / 19,69%
  - Assiny isolado: 24,15% (207/50) | Hubla isolado: 18,38% (1.197/220) — Hubla domina o volume e puxa pra baixo
- TODOS OS PRODUTOS:
  - Count: 2.072 completados, 376 reembolsados → 18,15% / 18,92%
  - Valor: R$ 912.806,67 completado, R$ 128.931,65 reembolsado → 14,12% / 14,81%
- Reembolsos por produto (consolidado): Buscador 270, Balcão 58, Alertas Prioritários 21, Comunidade VIP 14, Combo Reserva 10, outros 3

### Leitura vs baseline 22,5–23% (FAVORÁVEL)
- Buscador junho ≈ 19% → ~3,3 a 4,1 pontos ABAIXO do histórico. Suporta redução de reembolso.
- Valor preservado (Buscador): base R$ 450.326,29; esperado a 22,5%=R$ 101.323 / a 23%=R$ 103.575; real R$ 85.270 → preservado ~R$ 16.053 a R$ 18.305 (≈ 1,8–2,1x o custo da IA de R$ 8.861,28).
- Valor preservado (todos os produtos, SE baseline for conta-toda): base R$ 912.806,67; esperado R$ 205.381–209.946; real R$ 128.932 → preservado ~R$ 76.450 a R$ 81.014 (≈ 8,6–9,1x o custo). Usar como cenário upside, rotulado, pendente confirmação do baseline com João.
- RESSALVA: coorte de criação de junho; quem comprou nos últimos ~7 dias ainda não maturou o prazo de reembolso, então ~19% é piso e pode subir um pouco — mas folga vs baseline é grande.
