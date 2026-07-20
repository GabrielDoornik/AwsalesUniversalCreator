# DADOS OPERACIONAIS — Way Group (Lucas Arruda)

Memória persistente do projeto. Dados soltos que chegaram por chat/planilha e não estão nos arquivos de insumo. Atualizar aqui sempre que chegar dado novo.

Última atualização: 2026-07-16

## Visão geral do funil

Cliente: Way Group (Lucas Arruda — "Embaixador Amazon Brasil"). Ecossistema de produtos Amazon FBA.

Escada de produtos:
- VTD — Treinamento Venda Todo Dia (front, low ticket)
- FAS — Formação Amazon Seller (~R$ 2 mil) — leads com 2k a 5k para investir ("Lead_2k")
- Mentoria Starter — leads com 5k a 10k ("MQL1")
- Mentoria Scale (Way Scale) — leads com +10k ("MQL2"). 6 meses de acompanhamento com mentor certificado Amazon, hotseats com Lucas Arruda, CNPJ custeado, 90 dias de Prep Center
- CNPJ Gratuito (Way Econt) — downsell. CNPJ ME grátis (~R$ 1.500 custeado pelo grupo) + contabilidade R$ 360/mês (contrato 6 meses) + prep center R$ 100/mês + R$ 1,50/unidade

Estratégia definida no grupo (13/07/2026, Lucas Cardoso):
- Começa pelo VTD: recuperação de vendas, meta ROAS 1 no front
- 50% dos compradores VTD: onboarding → acessar área de membros → assistir 2 primeiras aulas → trigger aciona IA SDR
- Outros 50%: sem onboarding, IA SDR aborda direto pós-compra
- SDR qualifica para 3 caminhos: (1) agendamento com closer conforme ticket, (2) oferta FAS R$ 2 mil se qualificado, (3) downsell CNPJ
- Garantias: ROAS 1x na rec de vendas; ROAS 3x no funil pós-compra do VTD
- 5 campanhas no total: Rec de vendas, Onboarding, SDR, Venda FAS, Venda CNPJ (as 2 últimas reaproveitáveis no segundo funil)

## UTM nos links de checkout (definido 2026-07-17)

Todo link de checkout enviado pela IA leva `?utm_source=awsales` (só source, sem medium/campaign). Valores prontos para as variáveis da plataforma:
- REC `link_checkout`: https://pay.assiny.com.br/4XZFws/node/zwGh42?utm_source=awsales
- SDRs `link_fas`: https://pay.assiny.com.br/a06faa/node/k4HKSV?utm_source=awsales
- SDRs `link_fas_desconto`: https://pay.assiny.com.br/1bf813/node/qKg3Pe?utm_source=awsales
Pendente: confirmar que a Assiny captura UTM (compra teste).

## Campanha REC de vendas VTD

- Link do checkout: https://pay.assiny.com.br/4XZFws/node/zwGh42
- Suporte humano (reembolso/acesso): 55 31 97144 4590 / suporte@olucasarruda.com.br
- Nome da oferta no checkout (gatilho da campanha): [VTD] - Treinamento Venda Todo Dia
- Nome do produto no checkout: Venda Todo Dia
- Página de vendas: https://vtd-v2.olucasarruda.com.br/
- Grupo da comunidade (para lead que recusa compra): https://chat.whatsapp.com/LXuwGevglH99BoJ00XNTAn?s=cl&p=i&ilr=1
- Prova social: destaques do Instagram (link nos insumos da planilha)
- Link de checkout com desconto: NÃO informado (célula vazia na planilha)
- Preço VTD: 8x de R$ 6,82 ou R$ 47,90 à vista (âncora "De R$ 297,90")
- GARANTIA (doc mestre de objeções 2026-07-15, fonte da verdade): 7 dias incondicional (CDC) + 120 dias de resultado (seguiu método, loja ativa, não faturou R$ 10.000 → 100% de volta). NUNCA dizer "30 dias" nem condicionar à "primeira venda" — página de vendas e FAQ antiga dizem 30 dias e estão DESATUALIZADAS
- Acesso VTD: 1 ano · Área de aulas: lucas-arruda-amazon-pro.memberkit.com.br · +1.200 alunos · Comunidade VTD nota 9,52
- Entregáveis VTD: +15h de aulas práticas, metodologia passo a passo, fornecedores validados, comunidade de alunos, suporte para dúvidas, aulas atualizadas, apoio para abertura de CNPJ + 10 produtos para primeiras vendas (novos vendedores elegíveis, condições do programa)
- Suporte: 9h–18h BRT seg–sex
- A confirmar com Lucas (não inventar): prazo de estorno; formas de pagamento no Assiny além de cartão (Pix/boleto?); elegibilidade exata do CNPJ grátis + 10 produtos

## FAS — Formação Amazon Seller (produto R$ 2 mil do SDR)

- Preço: R$ 2.997,00 à vista ou 12x de R$ 300,50 (PDF "FAS 2026", extração em `SDR pós-VTD/Insumos/FAS 2026 - página de vendas EXTRAÍDA.txt`)
- Checkout: https://pay.assiny.com.br/a06faa/node/k4HKSV
- Checkout com desconto: https://pay.assiny.com.br/1bf813/node/qKg3Pe
- Nome da oferta e do produto no checkout: Formação Amazon Seller
- Suporte: 5531971444590
- Garantia: participar de reuniões/treinamentos, aplicar metodologia e não faturar R$ 10.000 em 12 meses → dinheiro de volta
- Entregáveis: 12 meses acompanhamento profissional, comunidade sellers WhatsApp, 12 encontros quinzenais com equipe do Lucas, +100 fornecedores validados, CNPJ gratuito, encontros semanais com mentores em grupo, análise dos produtos minerados, 30 dias MZHUB, 30 dias Gestor Seller, +70h gravadas
- Faixas internas (NUNCA revelar ao lead): Starter R$ 5-10k, Scale R$ 15-25k — margem de negociação do closer
- CNPJ da empresa (para objeção "é golpe?"): 48.426.950/0001-09 · Instagram @olucas.arruda
- Dados de mercado p/ objeção saturação: Amazon investe ~R$ 30 bi/ano no Brasil, ~200 mil sellers, <1% fatura +R$ 100 mil/mês

## Regras do agente SDR (doc de quebra de objeções FAS, jul/2026)

- Agente SDR destrava avanço, NÃO quebra objeção de fechamento (Starter/Scale = call do closer). Exceção: FAS em modo venda direta, aí o agente fecha
- NUNCA revelar preço/faixa/piso de Starter e Scale, nem meta da garantia deles (R$ 30k/60k/100k revela o preço)
- Estrutura de resposta: ACOLHER → INVESTIGAR → REPOSICIONAR → AVANÇAR (pergunta fechada)
- Máx 2 insistências na mesma objeção; 3ª vez = escalar humano
- Bifurcação por capital declarado: <R$ 1.500 desqualifica p/ CNPJ · R$ 1.500-3.000 FAS venda direta · R$ 5.000+ agendamento
- Não quebrar objeção de: desempregado/endividado, luto/doença, pediu 2x pra não ser contatado (LGPD), irritado (escalar), expectativa irreal (corrigir)
- Pendências do doc: autonomia de desconto do FAS (tem link de checkout com desconto — falta regra de quando usar), como comunicar R$ 360/mês contabilidade na venda direta FAS, resposta para "você é uma IA?", zonas cinzentas de capital (R$ 1.000-1.500, R$ 3.000-5.000, R$ 10.000-15.000), validação jurídica da fala de garantia condicional
- Docs complementares citados e NÃO recebidos: "Base de Conhecimento de Produto (v1.4)" e "Simulações de Conversa (v1.0)"

## Funil CNPJ (Way Econt)

- "Venda" = preenchimento do forms, sem checkout
- Forms de documentos do lead: https://link.wayecom.com.br/widget/form/0XMJFpBBCLlWtDff25n7
- Dúvidas sobre contabilidade: 31 972658059
- Dúvidas com CNPJ já feito: +55 21 98825-1178

## CRM (HighLevel / Plataforma Uno?)

- CRM: HighLevel. Calls marcadas direto no calendário do HighLevel integrado ao Google Meet (invite automático para vendedor e lead)
- 1 pipeline por produto: "Formação Amazon Seller (FAS)", "Mentoria Starter", "Mentoria Scale"
- Raias de cada pipe: Aplicou → Prospecção → Follow-up 1 → Follow-up 2 → Follow-up 3 → Follow-up 4 → Em conversa → Agendamento → Fechado → Perdido
- Cliente quer a IA aparecendo como "vendedor" no CRM para métricas no dash (Awsales integra via API, card pode ser criado como vendedor "IA")
- Integrações previstas: Meta (2 números), Assiny, webhook da plataforma de compras de CNPJ da Amazon

## Estrutura de pastas local

- `Recuperação de vendas - VTD/` — base 1 (tipo Recuperação)
- `Onboarding - VTD/` — base 2 (tipo Customer Success)
- `SDR pós-VTD/` — base 3 compartilhada (tipo SDR); subpastas `SDR pós-compra/` e `SDR pós-aula 2/` com checkpoint próprio
- `Insumos/` na raiz = dump bruto original (material Way Econt/CNPJ)

## Estado dos entregáveis (2026-07-16)

- Textos complementares: prontos e aplicados na plataforma (3 bases criadas)
- FAQs: geradas e avaliadas — 5 edições entregues nos arquivos `Otimização FAQs - *.md`; documentos estavam Inativos no painel
- Checkpoints: 4 criados e validados (zero asteriscos/emojis, caixas de marcação, variáveis no rodapé)
- Decisões assumidas nos checkpoints SDR (validar com cliente): zona cinzenta R$ 3-5k = ofertar FAS com call como alternativa se pedir acompanhamento individual; desconto FAS = só após 2 objeções reais de preço com intenção de fechar na hora
- Sem menção a tools nos checkpoints: agendamento/CRM via integração da Awsales (API), sem tool nomeada ainda. Se criarem tools de agenda/CRM, adicionar menção no formato correto depois
- Falta: mensagens de abertura + FUPs (aberturas provisórias já embutidas nos checkpoints)

## Observações / pendências

- Doc "Fluxo de Mensagens" da aba REC na verdade é o Roteiro Comercial da Mentoria Way Scale (SDR de agendamento/qualificação) — serve mais à base SDR do que à REC
- Falta exportar: Documento de Quebra de Objeções do VTD (Google Doc da planilha), abas Onboarding, SDR, Venda 2k e CNPJ
- Preço do VTD: ainda não visto nos insumos (deve estar na página de vendas/checkout)
- Testes das campanhas Rec/Onboarding/SDR prometidos pelo Cardoso para 16/07; Venda FAS e CNPJ para 17/07; go-live 100% na segunda 20/07
