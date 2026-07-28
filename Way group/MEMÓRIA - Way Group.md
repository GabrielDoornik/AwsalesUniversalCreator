# MEMÓRIA — Way Group (estado vivo)

Última atualização: 2026-07-20. Ponto de entrada para retomar o projeto em qualquer máquina. Ler junto: `DADOS OPERACIONAIS - Way Group.md` (links, preços, contatos, funil, CRM, regras do SDR) e `LOG DE OTIMIZAÇÃO - Testes.md` (erros dos testes e o que já foi corrigido).

## O que é o projeto

Cliente Way Group (Lucas Arruda, "Embaixador Amazon Brasil", BH). Ecossistema Amazon FBA. 6 campanhas no funil do VTD:

1. REC de vendas VTD (recuperação de checkout/indeciso/reembolso)
2. Onboarding VTD (ativação pós-compra, 50% dos compradores)
3. SDR pós-compra do VTD (outros 50%, abordagem comercial direta)
4. SDR pós-aula 2 (os 50% onboardados, gatilho = assistiu 2 primeiras aulas)
5. Venda FAS (venda direta da Formação Amazon Seller, a IA FECHA)
6. Venda CNPJ (projeto CNPJ Gratuito da Way Econt, conversão = preencher formulário)

Correção de escopo (2026-07-20): a memória antiga dizia que Venda FAS e Venda CNPJ eram "campanhas do Cardoso, não nossas". Errado. O Cardoso listou no grupo em 16/07 que o funil do VTD precisa de 5 campanhas incluindo essas duas, e que elas são reaproveitadas no segundo funil (agendamento direto). São nossas.

Arquitetura: 5 bases de conhecimento — REC (tipo Recuperação), Onboarding (tipo Customer Success), SDR compartilhada pelos 2 SDRs (tipo SDR), Venda FAS e Venda CNPJ (criadas como tipo Recuperação de vendas, que tem prompt de extração idêntico ao de Venda Direta). Diferença entre os SDRs vive só no checkpoint/abertura.

IA da campanha: Nome = **Manu** nas 6, pro lead não sentir troca de atendente. Cliente não batizou; escolha provisória nossa.

Agente/casca na plataforma para os 2 SDRs: **Qualify & Schedule**.

## Estado atual (o que está PRONTO)

1. Estrutura de pastas criada. Insumos coletados/convertidos em cada `Insumos/`. (PDF do FAS era imagem → extração manual em `SDR pós-VTD/Insumos/FAS 2026 - página de vendas EXTRAÍDA.txt`.)
2. FASE 1 — 10 textos complementares (Produto + Playbook × 5 bases). Os 6 das 3 primeiras bases já aplicados na plataforma; os 4 de Venda FAS e Venda CNPJ aplicados em 20/07.
3. FAQs geradas e avaliadas nas 5 bases:
   - 3 bases antigas: 91 FAQs, 5 edições pendentes de aplicar.
   - Venda FAS e Venda CNPJ: 60 FAQs (15 × 4), avaliadas em 20/07. 7 ações no total, já entregues nos arquivos `Otimização FAQs - *.md` de cada campanha.
4. FASE 2 — 6 checkpoints criados e validados (zero asterisco/emoji, caixas de estado com critério e default, variáveis descritas no rodapé sem valor colado, nenhuma menção `@tool`).
5. Aberturas das 6 campanhas reescritas em 20/07 e consolidadas em `MENSAGENS - Aberturas das 6 campanhas.md`, prontas para o cliente aprovar. Seção 1 dos 6 checkpoints sincronizada.
6. Variáveis das campanhas Venda FAS e Venda CNPJ configuradas na plataforma em 20/07. Valores no DADOS OPERACIONAIS.
7. TESTE conversacional das 4 campanhas antigas: 12 conversas rodadas no playground. REC, Onboarding e SDR pós-aula 2 passaram; SDR pós-compra tinha bug de roteamento. Erros no `LOG DE OTIMIZAÇÃO - Testes.md`.
8. FIXES aplicados nos checkpoints locais (itens 1, 2, 5, 6 do log) — 2026-07-17. Ainda não subiram para a plataforma.

## PRÓXIMO PASSO (retomar exatamente daqui)

Na plataforma AWSales:
1. Recolar os 4 checkpoints antigos atualizados (fixes de 17/07 + abertura nova de 20/07 estão só nos arquivos locais).
2. Aplicar as 5 edições de FAQ das bases antigas e ATIVAR todas as FAQs (estavam Inativas — sem ativar, a IA não busca conhecimento).
3. Aplicar as 7 ações das bases novas e ativar as 60 FAQs:
   - `Venda FAS/FAQs/Otimização FAQs - Produto.md` (1 edição) e `- Playbook.md` (4 edições)
   - `Venda CNPJ/FAQs/Otimização FAQs - Produto.md` (1 remoção) e `- Playbook.md` (1 edição + 1 remoção)
4. Testar as 2 campanhas novas no playground, como foi feito com as 4 primeiras.

Tool de agendamento (RESOLVIDO 2026-07-21):
5. FEITO. As 2 tools de agenda (`@consultar_horarios_disponiveis` e `@criar_agendamento`) foram criadas via n8n (a Awsales pura não dava conta do encadeamento contato+evento e da conversão de data em epoch). Arquitetura: Awsales chama webhook n8n sem auth, o token do HighLevel mora no n8n. Testadas de ponta a ponta e funcionando. Detalhes técnicos completos (paths, IDs de calendário, fluxo nó a nó, token) em `Way group/SEGREDOS-tokens.md` (fora do Git). Já inseridas nos 2 checkpoints SDR no formato `@tool` correto, com a distinção de trilha starter (cap 5-10k) / scale (cap +10k).
6. FALTA `@mover_card_crm`: mover card é escopo PEDIDO pelo cliente (não opcional — corrigido). No grupo (14/07) Cardoso disse "vamos movimentar os leads entre as raias do CRM" e arruda quer a IA como "vendedor" no CRM pra ver métrica no dash. Ainda não construído. Perguntas mandadas ao grupo em 21/07: em quais raias mover e quando (arruda descreveu movimentação ao longo do fluxo, não só marcar "Agendou"); onde fica o card do lead ainda não qualificado por produto (Cardoso levantou, ficou sem resposta); pipeline do lead de call vai pra "Mentoria Starter/Scale" ou "Sessão Estratégica (Closers)". Quando responderem: adicionar 3º HTTP Request no workflow criar-agendamento + a tool. IDs de pipeline/raia já no SEGREDOS.
7. Pendências técnicas pequenas: apagar o agendamento de teste `F6YvUsU2Qpdjifv0YFY1` e contato "Teste Awsales" no HighLevel; mover o token pra credencial Header Auth do n8n (hoje em texto puro nos nós); recolar os 2 checkpoints SDR atualizados na plataforma.

Faltam criar:
8. FUPs / Follow-Up Inteligente das 6 campanhas. Nenhuma tem follow-up ainda.

Cobrar do cliente (não trava go-live, exceto o item do gatilho):
9. GATILHO DA SDR PÓS-AULA 2: não existe integração confirmada com a área de membros (MemberKit) que avise progresso de aula. As integrações previstas são só Meta, Assiny e webhook de compra de CNPJ. Sem esse evento, a campanha não tem o que a dispare, ou vira disparo por tempo, o que enfraquece o gatilho inteiro. Cobrar.
10. Aprovação das 6 aberturas. Nenhuma veio de material do cliente: a aba "Templates de abertura + follow-ups" da planilha foi preenchida com o Roteiro Comercial da Mentoria Way Scale, que é guia de ligação para SDR humano. Abertura é template HSM e precisa de aprovação da Meta de qualquer jeito.
11. Zona cinzenta capital R$ 3-5k; prazo de estorno; Pix/boleto no Assiny; elegibilidade CNPJ grátis + 10 produtos; aulas 12-15 do VTD; docs citados e não recebidos ("Base de Conhecimento de Produto v1.4", "Simulações de Conversa v1.0").

Go-live combinado no grupo: era segunda 20/07. Reconfirmar a data com o Cardoso/arruda dado o bloqueio da tool.

## Regras deste cliente (não esquecer)

- Garantia VTD: 7 dias incondicional + 120 dias de resultado (aplicou método + loja ativa + não faturou R$ 10 mil). NUNCA "30 dias" nem "primeira venda" (página desatualizada). As 3 condições da de 120d andam sempre juntas.
- Garantia FAS (diferente): participar de tudo + aplicar método + não faturar R$ 10 mil em 12 meses. NÃO tem "loja ativa" (isso é só do VTD). É condicional, nunca incondicional.
- Preços só no checkpoint: VTD 8x R$ 6,82 / R$ 47,90 · FAS 12x R$ 300,50 / R$ 2.997.
- Starter e Scale: valores são segredo do closer. IA nunca revela valor, faixa, piso nem meta de garantia — joga pra call.
- Bifurcação por capital (gatilho de roteamento do SDR): <R$ 1.500 = CNPJ Gratuito · R$ 1.500-3.000 = FAS venda direta · R$ 5.000+ = call. Zona 3-5k = FAS (call se pedir acompanhamento individual).
- SDR: capital é o gatilho, não ambição. Assim que souber o capital, rotear e parar de qualificar. Sinal de compra = mandar link na hora. Nunca ofertar sem saber o capital.
- SDR não fecha Starter/Scale (vende a call de 30 min). No FAS ele fecha.
- Objeção: ACOLHER → INVESTIGAR → REPOSICIONAR → AVANÇAR. Máx 2 insistências, na 3ª escala.
- Nunca perguntar limite de cartão. Nunca prometer Pix/boleto sem confirmar. CNPJ grátis + 10 produtos sempre "sujeito às condições do programa".
- Agendamento: horários sempre picados (11h15, 15h25), 2 opções.
- Onboarding: ativação primeiro, relacionamento depois, ponte por último. Nunca vender nas primeiras 48h. Citar aula por título, nunca por número, uma por vez.
- Dado mockado no playground: nome/e-mail/telefone divergentes do lead são mock do ambiente, NÃO alucinação. Não contar como erro.

## Decisões nossas de 2026-07-20 (não perguntar de novo)

- Preço do FAS é FIXO. A IA nunca negocia nem insinua margem. O `link_fas_desconto` é carta única, liberada só após 2 objeções reais de preço com intenção de fechar na hora, e a IA não informa o valor com desconto: manda o link dizendo que a condição já está aplicada. Isso fecha a seção 9 que o doc de objeções do cliente deixou em branco.
- Downsell do CNPJ dentro da campanha de FAS tem 2 gatilhos e só eles: lead declarou que nem o parcelado cabe, OU a objeção foi trabalhada 2 vezes e ele segue parado. Aparecer objeção NÃO é gatilho — senão a IA colapsa pro caminho barato na primeira resistência. Nenhum lead é encerrado sem receber o downsell.
- Custo mensal (R$ 360 de contabilidade no FAS; R$ 460 somando Prep Center no CNPJ) é revelado quando o lead perguntar de custo e obrigatoriamente ANTES de mandar checkout ou formulário, se a decisão dele passa pelo "CNPJ grátis". Nunca depois.
- Escassez só genérica ("vagas limitadas"). PROIBIDO número de vagas, "estou segurando sua vaga", "você foi selecionado" e "passo sua vaga pra outra pessoa". Os scripts de ligação do insumo estão cheios dessas frases porque foram escritos pra SDR humano ao telefone; não se sustentam por escrito e em escala.
- CTA de abertura nunca é pergunta de sim ou não. Alternativa só quando as opções são exaustivas (fato: "já vende ou vai começar?"); quando a pergunta é sobre motivo, usar convite aberto ("me conta o que te impediu que eu te ajudo a resolver"). Regra gravada no `Estrutura/ESTRUTURAS_E_EXEMPLOS.md`.
- Insumos das bases Venda FAS e Venda CNPJ: as FAQs foram geradas só a partir dos textos complementares (o campo "Fontes de Conhecimento" das 4 bases mostra apenas o texto). Decidido NÃO regerar com os insumos anexados, porque o doc da Way Econt carrega a falsa escassez dos scripts e contaminaria as FAQs. Cobertura atual dos 30 pares por base está adequada.
