# CONTEXTO — Onboardings pós-compra (Buscador Automático)

Documento vivo. Guarda o contexto compartilhado dos três onboardings que rodam DEPOIS da compra aprovada do Buscador Automático. Atualizar conforme o cliente/CS trouxer definição nova.

Criado em: 2026-07-27
Cliente: Falcão das Milhas
Produto: Buscador Automático (R$ 297,00, pagamento anual, renovação após 12 meses)

---

## 1. Posição no funil

```txt
Recuperação de Vendas (Buscador Automático) 297
        ↓ compra aprovada (output da recuperação)
Onboarding 1
Onboarding 2
Onboarding 3
```

A compra aprovada é o evento que encerra a campanha de recuperação e dá início ao onboarding. Ver o modelo de input/output em `Estrutura/INPUT_OUTPUT_CAMPANHAS.md`: quando o output de compra aprovada chega, a recuperação para de cobrar e o lead vira cliente.

Campanha de origem (referência de tom, produto e variáveis):
- Checkpoint: `Falcão das Milhas - Recuperação de Vendas (Buscador Automático) 297/Checkpoint/checkpoint.md`
- FAQs: `Falcão das Milhas - Recuperação de Vendas (Buscador Automático) 297/FAQs/`

Detalhe herdado da recuperação: a IA da recuperação se chama Sofia. A IA de Suporte não tem nome pessoal ("assistente de suporte do Buscador Automático"). Definir com o cliente qual identidade os onboardings vão usar, porque o cliente não pode sentir que troca de atendente a cada etapa do funil (regra de nomenclatura unificada do prompt universal).

---

## 2. Base de conhecimento

Decisão do CS (2026-07-27): a base de Suporte foi DUPLICADA para os onboardings. Os três onboardings usam essa cópia, que é independente da base de Suporte em produção. Editar, desativar ou criar FAQ aqui não afeta a campanha de Suporte.

Consequência prática: a restrição de base compartilhada entre campanhas deixa de valer para o par Onboarding x Suporte. Dá para podar e reescrever à vontade. Continua valendo entre os três onboardings, que dividem a mesma cópia.

Curadoria da cópia (o que manter, desativar, reescrever e criar): `BASE_CONHECIMENTO_ONBOARDING.md`.

Origem da cópia, para referência do conteúdo herdado:

- Produto: `Falcão das milhas/Suporte/FAQs/IA de Suporte - Falcão das Milhas - Produto.pdf` (49 documentos, ID `8a977399-f9fa-4ba9-a318-483d93ae1eb5`)
- Playbook: `Falcão das milhas/Suporte/FAQs/IA de Suporte - Falcão das Milhas - Playbook.pdf` (30 documentos, ID `420f139a-f9cf-4acc-a1c4-99bd2453edb7`)
- Extração em `.txt` já disponível na mesma pasta (gerada com `pdf-to-txt.py` em 27/07/2026).

Avaliação inicial: a base de Suporte cobre bem o que um onboarding precisa (acesso, área de membros, bônus, grupos, uso do Buscador, Tarifas Awards vs busca manual, milhas, hubs, monitoramento, renovação, ecossistema). O que ela NÃO cobre hoje é conteúdo de ativação sequenciada (o que fazer no dia 1, dia 3, dia 7), porque a base foi escrita para atendimento reativo. Se algum onboarding precisar de conteúdo que não existe lá, criar FAQ nova na base compartilhada, sem duplicar base.

Atenção ao usar base compartilhada entre campanhas: valores, ofertas e condições de pagamento não podem ficar hard-coded na FAQ, porque a mesma base atende Suporte + os três onboardings. Número vai no checkpoint de cada campanha.

Exceção já validada nesta conta (registrada no CLAUDE.md): em campanhas de suporte/onboarding, link estável de informação (acesso, área de membros, grupos, WhatsApp do Oner, contrato do Balcão) pode ficar como URL crua na FAQ, porque o link É a resposta. Link comercial/condicional (pagamento, formulário de reembolso, consultoria de retenção) continua como variável no checkpoint.

---

## 3. Fatos operacionais que todo onboarding precisa respeitar

Extraídos da base de Suporte e do checkpoint de Suporte, para não haver conflito entre campanhas:

- Acesso ao Buscador e área de membros são endereços DIFERENTES. Buscador é onde se pesquisa passagem; área de membros é onde ficam cursos, bônus e materiais. O Buscador fica dentro da área de membros. Nunca tratar um como sinônimo do outro nem enviar link de memória: puxar sempre da FAQ correspondente.
- O aplicativo não funciona hoje. Sempre orientar acesso pelo navegador, via link oficial.
- Existem duas versões do Buscador em uso (Novo e Antigo). Nunca afirmar a posição exata de um botão na tela.
- Bônus gratuitos: dois grupos de WhatsApp (alerta de passagens e alerta de promoções de acúmulo), mais cursos e planilhas na área de membros. O grupo Alerta Prioritário é PAGO e não é bônus incluso.
- Diferencial do produto está nas Tarifas Awards (oportunidades já encontradas pelo sistema), não na busca manual. Esse é o ponto de ativação mais importante: cliente que só usa busca manual acha que é igual a Skyscanner e pede reembolso.
- Orientar a filtrar por destino, não por origem, e a ativar monitoramento de rota.
- O Buscador não emite passagem, não cria promoção e não altera preço. A emissão acontece no site da companhia ou parceiro.
- Renovação após 12 meses, aceita nos termos da compra, com aviso ~30 dias antes.
- Garantia de 7 dias (CDC) existe, mas a IA nunca confirma elegibilidade individual.
- Suporte humano: segunda a sexta, 09h às 18h. Retorno após encaminhamento: até 72 horas úteis.
- Passagem já emitida, comprada errada ou erro de emissão vai para o Oner (WhatsApp na FAQ), nunca para a fila interna.
- Ecossistema para indicação: Balcão de Milhas (não tem milhas no programa certo), Consultoria Individual R$ 997,00 (quer aprender, baixa autonomia — gratuita SÓ como retenção de cancelamento), Black Falcon (quer delegar tudo). The Travel está descontinuado e nunca deve ser mencionado.
- Sem emoji e sem asterisco no checkpoint. Mensagem de abertura de janela sem emoji.

---

## 4. Agente da plataforma

Recomendação por enquanto, a confirmar quando o escopo de cada onboarding estiver definido:

- Aba Customer Success, agente Onboarding. É a casca certa para entrada pós-venda (orienta acesso à área de membros, resolve problema comum e garante sucesso no primeiro contato).
- Evitar agentes da aba Lançamento, porque eles alucinam abertura de carrinho que não existe nesta campanha.

---

## 5. O que a AWSales consegue e o que não consegue (grade de avaliação)

O CS já sinalizou que nem tudo do desenho do onboarding roda na AWSales. Usar esta grade para avaliar o print/fluxo de cada onboarding antes de prometer entrega.

Roda nativamente:
- Disparo ativo a partir de um input externo (compra aprovada via webhook n8n → AWSales).
- Conversa com Checkpoint Manager, base de conhecimento por busca semântica, Copywriter e Response Auditor.
- Follow-Up Inteligente por campanha (3 prompts, orientações preenchidas pelo CS no painel).
- Envio de mídia anexada em FAQ, via variável de arquivo.
- Variáveis de link cadastradas na campanha.
- Tools personalizadas via `@nome_da_tool`, tipicamente com gateway n8n (padrão: sempre HTTP 200 com flag `ok`).
- Handoff para humano.
- Output que encerra a campanha quando o objetivo é atingido.

Não roda nativamente (precisa de n8n, de outra campanha ou não é possível):
- Régua de nutrição por tempo com N mensagens agendadas em datas fixas independentes de resposta. O que existe é Follow-Up Inteligente, que decide envio/timing por análise da conversa. Régua fixa precisa de disparo externo.
- Encadeamento automático de uma campanha para a outra sem evento. Cada passagem de Onboarding 1 para 2 e de 2 para 3 precisa de um evento de input/output.
- Leitura de comportamento dentro do produto (se o cliente logou, se usou o Buscador, se ativou monitoramento). Só chega à IA se o sistema do cliente mandar esse evento para o n8n.
- Análise de print, foto, áudio ou tela pela IA.
- Ação executada pela IA no sistema do cliente (resetar senha, liberar acesso, cancelar) sem tool dedicada.
- Variável `{{nome}}` nas mensagens de disparo.

Quando o print chegar, marcar cada etapa do desenho como: nativo / precisa de n8n / precisa de evento do cliente / inviável.

---

## 6. Estado de cada onboarding

### Onboarding 1 — Primeiro acesso
- Escopo (confirmado pelo CS em 2026-07-27): um objetivo só, levar o comprador a criar a conta e fazer o primeiro acesso ao Buscador. Dois status: E0 não acessou, E1 acessou. E1 é o output desta campanha e o input do Onboarding 2.
- O cadastro do perfil de viagens NÃO é desta campanha. É o Onboarding 2, conduzido por Typeform.
- O board original do cliente juntava acesso, cadastro e indicação numa automação só. Na AWSales isso vira três campanhas, uma por output. Não usar o board como fronteira de escopo.
- Insumo recebido em 2026-07-27: board do cliente (6 prints + CSV com os textos dos nós). CSV preservado em `Onboarding 1/Insumo/board-onboarding-1.csv`.
- Desenho reconstruído: `Onboarding 1/FLUXO_ORIGINAL.md`
- Viabilidade na AWSales: `Onboarding 1/ANALISE_VIABILIDADE_AWSALES.md`
- Status: aguardando decisões do cliente (principalmente se o time técnico do Falcão consegue publicar os eventos de primeiro acesso e cadastro completo; sem eles não existe E0/E1/E2).

### Onboarding 2 — Cadastro do perfil de viagens
- Escopo: levar quem já acessou (E1) a completar o cadastro do perfil de viagens, conduzindo por Typeform.
- Formulário recebido em 2026-07-27: `emeo1uhrjwf.typeform.com/to/RSuIPOnP`. Detalhes, UTMs e pendências em `Onboarding 2/CONTEXTO_ONBOARDING_2.md`.
- Ponto forte: o Typeform tem webhook nativo e pede nome, e-mail e telefone no fim, então o output desta campanha não depende do time técnico do Falcão. É o único dos três que está inteiramente na nossa mão.
- Status em 2026-07-27: checkpoint, abertura de janela e 7 FAQs novas escritos e aplicados na plataforma. Pronto para teste conversacional, roteiro em `Onboarding 2/OTIMIZACOES_TESTE.md`.
- Pendências: print da tela de encerramento do formulário (falta a FAQ de "já preenchi, e agora"), webhook do Typeform no n8n, valores reais dos UTMs, e confirmar se o Buscador fica mesmo bloqueado sem o cadastro.

### Onboarding 3
- Escopo: PENDENTE.
- Pasta: `Onboarding 3/`
- Status: aguardando contexto do CS.

---

## 7. Pendências

- [ ] Receber o print do Onboarding 1 e avaliar viabilidade etapa por etapa contra a grade da Seção 5.
- [ ] Receber o contexto dos Onboardings 2 e 3.
- [ ] Definir a identidade da IA nos onboardings (Sofia, assistente sem nome, ou nome novo) e alinhar com recuperação e suporte.
- [ ] Definir os eventos de input/output de cada onboarding (o que dispara, o que encerra, o que passa para a etapa seguinte).
- [ ] Confirmar se a base de Suporte supre tudo ou se será preciso criar FAQs de ativação na base compartilhada.
- [ ] Definir se cada onboarding usa Follow-Up Inteligente ou FUP estático.
