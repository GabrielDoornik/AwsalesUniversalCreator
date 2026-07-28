# Nuestra RX — Nova Estratégia (pós-mudança 2026-06-21)

Estado vivo da virada de estratégia das campanhas da Nuestra RX. A pasta antiga
`Nuestra RX/Campanhas/` fica INTACTA (campanhas que usavam a coleta completa no WhatsApp e
a tool do Dosable). Estas aqui são as novas, pós-mudança.

Origem: conversa no grupo (2026-06-21) + Doc Hormozi (`Nuestra RX/Doc Hormozi/HORMOZI PLAYBOOK.txt`).

---

## A mudança em uma frase

Parar de coletar as ~20 perguntas do intake no WhatsApp. A IA agora VENDE primeiro (quebra
objeção) e só manda o link depois que o lead engaja. O lead preenche o formulário/checkout no
site, não por aqui.

---

## As campanhas

### 1. Recuperação de Formulário — ABANDONO
- Input: abandono do formulário (mesmo evento de hoje, `intake_abandoned`).
- Lead morno: já começou o intake, tem perfil parcial no `metadata`.
- Conversão: mandar o link de retomada `{{metadata.form_resume_url}}` (retoma de onde parou).
- Tem mensagem de abertura (campanha dispara).

### 2. Recuperação de Formulário — RECEPTIVA (indicação)
- Input: lead clica no ícone de WhatsApp do site e chega com "Hola, quiero información sobre NuestraRx".
- Lead frio: sem contexto, sem formulário começado. Não existe mais o botão antigo do site.
- Conversão: mandar o link do formulário `{{link_formulario}}` (começar a avaliação do zero).
- Receptiva: a IA reage à primeira mensagem do lead, não manda opener frio.

> A antiga "Recuperação de Vendas" (checkout/pre-save abandonado) também recebe ajuste
> (cupom + call do especialista), mas é ajuste, não reescrita. Tratar depois.

---

## Motor de venda (igual nas duas, calibrado)

- Modelo: RAR (Venda Adaptativa com Baixa Reatância) como chassi, assertivo, NUNCA passivo.
- Abandono: RAR direto. Identifica a trava que parou o lead, dissolve, manda o link de retomada.
- Receptiva: UMA pergunta de diagnóstico no início (SPIN enxuto, ex: "¿cuánto te gustaría
  bajar / qué has intentado?") para criar o gancho, depois RAR. Não é interrogatório.
- Disciplina Hormozi nas duas: toda resposta reconhece o que o lead disse, reforça valor/segurança
  e fecha com pergunta que avança. Objeção vira template curto de 2-3 frases. CTA único e claro.

### Indução da tirzepatida (INDUZIR, não recomendar)
Apresentar a tirzepatida PRIMEIRO, como a opção mais completa (dupla ação GLP-1 + GIP, maior
eficácia média), e puxar o lead pra ela. A decisão formal continua com o lead e o médico valida
elegibilidade (compliance), mas a IA conduz para a tirzepatida, não fica neutra.
Pendência: as FAQs atuais (Produto e Playbook) estão neutras ("deixe a escolha com o cliente") e
precisam ser realinhadas para induzir, senão conflitam com o checkpoint.

### Objeção de preço (SEM rebaixar para o mensal)
NUNCA oferecer o plano mensal como porta acessível (decisão já corrigida pelo cliente). A jogada:
segurar o trimestral com risk reversal (garantia condicional de 12 meses, "nós assumimos o risco
com você"), $0 agora (só cobra se o médico aprovar), valor (médicos latinos em espanhol, envio
refrigerado em casa, HIPAA, 50 estados) e o cupom como incentivo de fechamento.

### Cupom (nas duas, de modo estratégico)
- `TIRZE3` = $50 off no plano TIRZEPATIDA trimestral.
- `SEMA3` = $25 off no plano SEMAGLUTIDA trimestral.
- Código digitado no checkout. Só vale no trimestral.
- Usar quando o preço do trimestral for a trava real, como motivo de fechar agora.

### Compliance (mantido, inegociável)
- Espanhol neutro latino em 100% das mensagens.
- FDA: nunca dizer que o composto é igual/versão/genérico/equivalente a marca; falar só pelo
  princípio ativo e mecanismo. Marca só em pergunta de alergia/uso prévio.
- Não julgar peso (nada de "gordo/obeso/sobrepeso"); reenquadrar como biologia, não força de vontade.
- $0 com lógica de "ahora", nunca "hoy" nem janela de 24h.
- Não se passar por médico nem pessoa real; não dizer "soy un asistente".

---

## Call do especialista (escalada, não CTA padrão)

A call NÃO é oferecida de cara. Entra nos gatilhos:
- B: lead travou de NOVO depois de uma objeção já contornada.
- C: lead esfriou/sumiu. Primeiro o Follow-Up Inteligente tenta reativar; se voltar e não fechar
  (ou seguir frio), aí a IA oferece a call.
- Extra: se o lead pedir explicitamente falar com uma pessoa, mandar para a mesma call (não para
  o WhatsApp de suporte).

Mecânica (invisível para o lead):
- A IA NUNCA fala em "agendar call", "Google Calendar" ou "Meet". Diz que "um especialista vai te ligar".
- Pergunta a preferência de horário do lead (priorizando a experiência dele), dentro da janela.
- Usa `@freeBusy` para achar horário livre na agenda do MF e `@createEvent` para criar o evento.
- `@updateEvent` / `@deleteEvent` para remarcar/cancelar se o lead pedir.
- O MF vê na agenda dele e liga para a pessoa.
- Janela do MF: 13h-20h horário de NY = 14h-21h de Brasília (no horário de verão dos EUA; vira
  15h-22h Brasília quando os EUA saem do DST em nov).

Tools do Google Calendar disponíveis:
- `@freeBusy`: consulta disponibilidade de horários no Google Calendar.
- `@createEvent`: cria um evento no Google Calendar.
- `@updateEvent`: atualiza um evento existente.
- `@deleteEvent`: cancela um evento existente.

---

## Arquitetura de conhecimento (definida 2026-06-22)

3 campanhas, 2 bases de conhecimento, 4 textos complementares. Prompt de extração das duas bases:
Recuperação de Vendas (idêntico ao de Venda Direta; é o tipo já usado na base atual).

- Base 1 (COMPARTILHADA): Recuperação de Formulário Receptiva + Abandono.
  - `Recuperação de Formulário/Base de Conhecimento (compartilhada)/Texto Complementar - Produto.md`
  - `Recuperação de Formulário/Base de Conhecimento (compartilhada)/Texto Complementar - Playbook.md`
- Base 2 (PRÓPRIA): Recuperação de Vendas.
  - `Recuperação de Vendas/Base de Conhecimento/Texto Complementar - Produto.md`
  - `Recuperação de Vendas/Base de Conhecimento/Texto Complementar - Playbook.md`

Regras embutidas nos textos: sem valores/cupons/links na FAQ (vão no checkpoint), induzir tirzepatida,
não rebaixar para o mensal, compliance FDA, message-match com os anúncios, postura da call de especialista.

## Agente da plataforma (definido 2026-06-22)

Aniquilador de Objeções (Recuperação de Vendas) nas 3 campanhas. Motivos: cadeia operacional com
Integration Manager (roda nossas tools), Copywriter em Gemini 2.5 Pro, DNA de objeção+fechamento (não
SPIN consultivo), e tipo casando com as bases (Recuperação de Vendas). O checkpoint substitui o template.

## Tools de calendário (config externa, confirmada por print 2026-06-22)

`@freeBusy`, `@createEvent`, `@updateEvent`, `@deleteEvent`. Parâmetros (título, duração, calendário,
participantes, janela de busca) são configurados NA TOOL, não no checkpoint. O checkpoint só invoca no
momento certo e coleta o horário preferido do lead. Não há campo de "corpo/resumo" no createEvent — o
resumo da conversa vai pelo fluxo do Sheets (lado Awsales).
Pontos a alinhar no painel: duração (config 1h vs call de 15 min) e janela do freeBusy (09-20 vs 13-20 NY).

## Pendências
- [x] FASE 1: 4 textos complementares. FAQs geradas e avaliadas (4 FAQs a adicionar no Formulário).
- [x] Checkpoint Recuperação de Formulário - Abandono (blindado: gates de link, guarda de vazio, "¿es para mí?").
- [x] Checkpoint Recuperação de Formulário - Receptiva (link retomada vs início, lead frio + 1 pergunta de diagnóstico).
- [x] Checkpoint Recuperação de Vendas (checkout/pre-save, @enviar_avaliacao, cupom no checkout, erro sem loop, call).
- [ ] Usuário: testar os 3 checkpoints no playground/produção.
- [ ] Copys das Mensagens de Disparo (abertura + FUPs) — Lucas vai mandando; abertura atual mantida.
- [ ] Orientações do Follow-Up Inteligente por campanha (MENSAGENS_FOLLOWUP.md).
- [ ] Painel: alinhar duração da call (15 min) e janela/fuso do freeBusy; confirmar mapeamento de
      `metadata.form_resume_url` e `metadata.checkout_url` nos eventos.
- [ ] Decidir se aposenta as bases velhas após migrar (campanhas antigas ficam intactas).
