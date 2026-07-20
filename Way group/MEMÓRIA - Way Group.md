# MEMÓRIA — Way Group (estado vivo)

Última atualização: 2026-07-20. Ponto de entrada para retomar o projeto em qualquer máquina. Ler junto: `DADOS OPERACIONAIS - Way Group.md` (links, preços, contatos, funil, CRM, regras do SDR) e `LOG DE OTIMIZAÇÃO - Testes.md` (erros dos testes e o que já foi corrigido).

## O que é o projeto

Cliente Way Group (Lucas Arruda, "Embaixador Amazon Brasil", BH). Ecossistema Amazon FBA. 4 campanhas no funil do VTD:

1. REC de vendas VTD (recuperação de checkout/indeciso/reembolso)
2. Onboarding VTD (ativação pós-compra, 50% dos compradores)
3. SDR pós-compra do VTD (outros 50%, abordagem comercial direta)
4. SDR pós-aula 2 (os 50% onboardados, gatilho = assistiu 2 primeiras aulas)

Arquitetura (validada): 3 bases de conhecimento — REC (tipo Recuperação), Onboarding (tipo Customer Success), SDR compartilhada pelos 2 SDRs (tipo SDR). Diferença entre os SDRs vive só no checkpoint/abertura. Venda FAS e Venda CNPJ são campanhas do Cardoso (Awsales), não nossas — mas a base SDR já carrega o conteúdo delas.

IA da campanha: Nome = **Manu** (mesmo nas 4, pro lead não sentir troca de atendente). Cliente não batizou; Manu foi escolha provisória nossa (validar com o Lucas se quiser trocar). Nunca usar nome de pessoa real.

Agente/casca na plataforma para os 2 SDRs: **Qualify & Schedule**. (REC e Onboarding usam as cascas dos respectivos tipos.)

## Estado atual (o que está PRONTO)

1. Estrutura de pastas criada. Insumos coletados/convertidos em cada `Insumos/`. (PDF do FAS era imagem → extração manual em `SDR pós-VTD/Insumos/FAS 2026 - página de vendas EXTRAÍDA.txt`.)
2. FASE 1 — 6 textos complementares (Produto + Playbook × 3 bases) em `Texto Complementar/`. Aplicados na plataforma.
3. FAQs geradas (91) e avaliadas. 5 edições prontas para copiar/colar (ver "pendências").
4. FASE 2 — 4 checkpoints criados, validados (zero asterisco/emoji, caixas de estado, variáveis no rodapé) e com abertura final embutida na Seção 1 (nome Manu).
5. Variáveis configuradas na plataforma nas 4 campanhas. Links de checkout levam `?utm_source=awsales` (só source). Valores no DADOS OPERACIONAIS.
6. TESTE conversacional completo: 12 conversas (3 cenários × 4 campanhas) rodadas no playground. Resultado: REC, Onboarding e SDR pós-aula 2 passaram; SDR pós-compra tinha bug de roteamento. Todos os erros no `LOG DE OTIMIZAÇÃO - Testes.md`.
7. FIXES aplicados nos checkpoints locais (itens 1, 2, 5, 6 do log) — 2026-07-17:
   - Item 5 (BLOQUEADOR, os 2 SDRs): bloco "REGRA DE ROTEAMENTO" na Seção 4 + Etapa 2 reescrita. Capital é o gatilho; para de qualificar assim que o capital aparece; sinal de compra manda o link na hora; nunca oferta sem capital.
   - Item 6 (os 2 SDRs): objeção de preço do FAS = parcelamento 12x como ponte, nunca rebaixar pra CNPJ por não ter à vista.
   - Item 1 (REC): garantia 120d sempre com as 3 condições juntas (inclui "loja ativa").
   - Item 2 (Onboarding): citar aula pelo título, nunca por número; empurrar uma aula por vez.

## PRÓXIMO PASSO (retomar exatamente daqui)

Na plataforma AWSales (aplicar o que foi corrigido/avaliado):
1. Recolar os 4 checkpoints atualizados (os fixes de 17/07 estão só nos arquivos locais, falta subir).
2. Aplicar as 5 edições de FAQ e ATIVAR todas as FAQs (estavam Inativas no painel — sem ativar, a IA não busca conhecimento). Arquivos:
   - `SDR pós-VTD/FAQs compartilhadas/Otimização FAQs - Produto.md` (3)
   - `Recuperação de vendas - VTD/FAQs/Otimização FAQs - Playbook.md` (1)
   - `Onboarding - VTD/FAQs/Otimização FAQs - Playbook.md` (1)

Tool de agendamento (item 3 do log, o mais travado):
3. A tool de agenda do SDR chama a **API do HighLevel** (não o Google — o HighLevel gera o Meet automático). Precisamos de 3 tools: `@consultar_horarios_disponiveis` (free-slots), `@criar_agendamento` (create appointment) e opcional `@mover_card_crm`.
4. BLOQUEIO: gerar o token exige "Private Integrations", que está DESLIGADO na conta. Precisa o admin (arruda/Vitor) (a) ativar "Private Integrations" no **Labs** das configurações de agência do HighLevel e (b) dar permissão de gerenciar Private Integrations / Admin ao nosso usuário. Mensagem já foi passada pra eles — conferir se responderam/ativaram.
5. Quando o token vier: criar Conexão na Awsales (Bearer + header `Version`), montar as tools com os IDs (locationId, calendarId, userId do closer, pipeline/stage), testar (Tela 3), e inserir os `@tool` no formato correto ("Utilize a tool para [ação] @nome") nos 2 checkpoints SDR. Guia: `Estrutura/Guia — Criar Tool Personalizada na Awsales.md`. Enquanto não houver tool, a Manu inventa horário (visto no teste) — risco de double-booking.

Faltam criar:
6. FUPs / Follow-Up Inteligente das 4 campanhas (aberturas já existem no disparo; falta o follow-up de quem não responde).

Cobrar do cliente (não trava go-live):
7. Zona cinzenta capital R$ 3-5k (assumido: FAS, call se pedir individual); gate do desconto FAS (assumido: só após 2 objeções reais de preço + intenção de fechar); prazo de estorno; Pix/boleto no Assiny; elegibilidade CNPJ grátis + 10 produtos; aulas 12-15 do VTD (base tem acesso?); docs citados e não recebidos ("Base de Conhecimento de Produto v1.4", "Simulações de Conversa v1.0").

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
- Nunca perguntar limite de cartão. Nunca prometer Pix/boleto sem confirmar. Nunca falsa escassez. CNPJ grátis + 10 produtos sempre "sujeito às condições do programa".
- Agendamento: horários sempre picados (11h15, 15h25), 2 opções.
- Onboarding: ativação primeiro, relacionamento depois, ponte por último. Nunca vender nas primeiras 48h. Citar aula por título, nunca por número, uma por vez.
- Dado mockado no playground: nome/e-mail/telefone divergentes do lead são mock do ambiente, NÃO alucinação. Não contar como erro.
