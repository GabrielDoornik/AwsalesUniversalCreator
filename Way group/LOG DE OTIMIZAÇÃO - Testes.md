# LOG DE OTIMIZAÇÃO — Testes de Playground (Way Group)

Erros e ajustes pescados durante os testes conversacionais dos 4 checkpoints. Aplicar depois de rodar todos os cenários. Não recomeçar conversa por erro: anotar aqui e seguir.

Sessão de testes iniciada: 2026-07-17. Testando 3 cenários × 4 campanhas (12 conversas).

Nota de ambiente: cada playground tem dados de lead MOCKADOS diferentes (nome, e-mail, telefone). Divergência entre esses campos NÃO é alucinação. Ex confirmado: playground do Onboarding tinha lead "Emanuel Reis" com e-mail mockado "Ricardo22@hotmail.com" — a IA usou o e-mail corretamente.

---

## Erros a corrigir

### 1. REC — garantia 120 dias sem a condição "loja ativa" (menor)
- Onde: campanha Recuperação, cenário "medo de não vender".
- O que rolou: a Manu citou "aplicar o método e não faturar R$ 10 mil = 100% de volta", omitindo a condição "manter a loja ativa".
- Correto (insumo): a garantia de 120 dias exige as 3 condições juntas — aplicou o método, loja ativa E não faturou R$ 10.000.
- Fix: no Checkpoint REC, Seção 2, reforçar as 3 condições juntas na descrição da garantia para o modelo não soltar versão incompleta. Verificar também FAQ de Produto REC.
- Recorrência: repetiu no cenário "já comprei curso e nunca usei" (REC-1). Padrão consistente, não pontual — prioridade de fix subiu.
- Status: APLICADO no checkpoint (2026-07-17)

### 2. Onboarding — numeração de aula trocada + despeja várias aulas (menor)
- Onde: campanha Onboarding, cenário "consegui entrar".
- O que rolou: (a) a Manu disse "aula 1 (Por que vender na Amazon), aula 2 (CNPJ gratuito)", invertendo a numeração; a ordem real é 1 = CNPJ gratuito e taxa zero, 2 = Porque vender na Amazon. (b) Sugeriu 5 aulas de uma vez (1, 2, 3, 8 e 9), contra a regra de empurrar UMA aula por vez (antídoto da paralisia).
- Fix: no Checkpoint Onboarding, Seção 5 e Etapa 2 — instruir a citar a aula pelo TÍTULO, sem número (evita conflito com a numeração real da plataforma), e empurrar somente a primeira aula recomendada (Porque vender na Amazon) por vez. Revisar a redação da Seção 5 que hoje mistura "ordem de empurrar" com numeração.
- Status: APLICADO no checkpoint (2026-07-17)

### 3. SDR — IA inventa data/horário de call sem tool de agenda (ARQUITETURA, importante)
- Onde: campanhas SDR (pós-compra e pós-aula 2), qualquer lead de capital 5k+.
- O que rolou: no cenário "5 mil", a Manu ofertou a call com datas concretas inventadas ("segunda 20/07 às 10h15 ou terça 21/07 às 15h25"). Os horários picados estão certos, mas a disponibilidade foi alucinada — não há tool de calendário conectada.
- Risco: em produção isso agenda horário que pode não existir, gera double-booking e no-show. Quebra o objetivo real da campanha (agendar de verdade no HighLevel/Google Meet).
- Fix: criar a tool de agendamento (formato @tool no checkpoint) integrando o calendário da equipe (HighLevel + Google Meet, via API/webhook Awsales) ANTES do go-live. Enquanto não existir, a IA não deve cravar data/hora específica — deve oferecer janelas e confirmar que o time encaixa, ou coletar preferência e passar ao handoff humano.
- Status: PENDENTE — NÃO aplicado. Depende de a Awsales criar a tool de agendamento (HighLevel + Google Meet). Enquanto não existir, a IA vai inventar horário. Decidido com o usuário em 2026-07-17: fazer a integração depois; não aplicar o modo interino agora. Antes do go-live, ou entra a tool, ou aplicar o modo B (coletar preferência de horário e passar ao humano, sem cravar data).

### 4. SDR pós-aula 2 — misturou FAS e mentoria em lead de call (menor)
- Onde: SDR pós-aula 2, cenário "5 mil".
- O que rolou: ao ofertar a call, a Manu disse "seja para o FAS ou para uma mentoria mais próxima". Capital 5k é zona de call/mentoria; citar FAS mistura um pouco a mensagem, mas o especialista define na call. Aceitável, só vigiar para não confundir o lead.
- Fix: opcional — no checkpoint SDR, na oferta da call, focar em "o especialista define o melhor plano pro seu caso" sem nomear produtos.
- Status: VIGIAR

### 5. SDR — roteamento não dispara no capital (médio, recorrente nas 2 campanhas SDR)
- Onde: SDR pós-compra (e provável nas duas). Dois sintomas do mesmo problema:
  - SDRc-1: ofertou a call baseada na AMBIÇÃO ("renda principal, sair do emprego") sem ter perguntado o capital. Risco: mandar lead sem capital pra call do closer, desperdiçando o closer.
  - SDRc-3: já tinha o capital declarado (R$ 2 mil = zona FAS) e continuou qualificando (perguntou horas) em vez de ofertar o FAS. Interrogatório / não roteia.
- Correto: o CAPITAL é o gatilho de decisão. Assim que declarado, rotear imediatamente (menos de 1.500 = CNPJ; 1.500-3.000 = FAS; 5.000+ = call). Ambição, horas e dor são complementares, nunca pré-requisito pra rotear. E nunca ofertar call sem capital conhecido.
- Fix: no Checkpoint SDR (as 2 campanhas), Seção 6 Etapa 2 e roteador Seção 4 — deixar explícito: (1) "nunca ofertar call/FAS/CNPJ sem o capital declarado"; (2) "assim que o capital for declarado, PARE de qualificar e vá direto pra oferta do caminho correspondente". Reforçar que o roteiro de perguntas não é script fixo: a meta é chegar no capital rápido.
- Status: APLICADO no checkpoint (2026-07-17) — SEVERIDADE ALTA
- Recorrência confirmada: SDRc-3 perguntou 3 vezes depois do capital conhecido e NUNCA ofertou o FAS (loop). No fim, mesmo com sinal de compra explícito ("quero começar logo, como faço?"), ela ainda perguntou o decisor em vez de mandar o link do FAS. É o erro mais grave da rodada, BLOQUEADOR de go-live. Quando o capital vem certinho antes da oferta (SDRc-2 primeira resposta) ela acerta, mas se vem cedo/fora de ordem ela ignora e continua qualificando.
- Fix adicional: sinal de compra ("quero começar", "como faço", "quero garantir", "manda o link") = enviar link do FAS na hora, sem mais nenhuma pergunta. Adicionar isso explícito no roteador (Seção 4) e na Etapa 2 como override.

### 6. SDR — objeção de preço do FAS vira re-qualificação de capital (menor) + banda de capital vs preço real do FAS
- Onde: SDR pós-compra, cenário FAS ("3 mil tá puxado").
- O que rolou: na objeção de preço do FAS a Manu perguntou "quanto você conseguiria investir?" em vez de reposicionar o valor e o parcelamento primeiro. Risco de descer pra CNPJ rápido demais quando o certo é mostrar que 12x de R$ 300,50 já é a ponte de acessibilidade.
- Nuance de fundo: a banda de capital "R$ 1.500-3.000 = FAS" trata do capital pra ESTOQUE, mas o FAS custa R$ 2.997 (parcelável 12x). Um lead com "2 mil guardados pra estoque" está na banda FAS mas não tem 2.997 à vista — a saída é o parcelamento. O checkpoint precisa deixar claro que capital de estoque e pagamento do FAS (parcelado) são coisas separadas, e que a objeção de preço do FAS se trata com valor + 12x, não baixando o lead pra CNPJ.
- Fix: no Checkpoint SDR, Etapa 3B — objeção de preço do FAS = 4 tempos com reposicionamento de valor e parcelamento 12x ANTES de qualquer coisa; só considerar CNPJ se o lead disser explicitamente que nem o parcelado cabe. Gate do desconto (link_fas_desconto) só após 2 objeções reais de preço com intenção de fechar.
- Status: APLICADO no checkpoint (2026-07-17)

---

## Ajustes aplicados

(nenhum ainda — aplicar após fechar a rodada de testes)
