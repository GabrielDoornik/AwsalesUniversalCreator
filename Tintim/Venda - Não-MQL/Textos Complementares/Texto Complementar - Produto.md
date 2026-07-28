# Texto Complementar — PRODUTO
Campanha: Venda para não-MQL
Cliente: Tintim
Tipo de campanha na AWSales: Venda Direta

## Como usar este texto

Complementa os insumos da Tintim (FAQ do Produto, documento de quebra de objeções, páginas de vendas, VSL, links de checkout, contato de suporte). Ele existe para corrigir o enquadramento da extração: o prompt de Venda Direta foi escrito para infoproduto (curso com preço à vista/parcelado, acesso vitalício, garantia de 30 dias, escassez de lote), e o Tintim é um SaaS de assinatura mensal com preço público. Onde o prompt e a realidade do Tintim divergirem, vale este texto.

Prioridade: onde este texto e a transcrição da VSL divergirem, prevalecem este texto e as instruções operacionais dos insumos.

### Regras de extração obrigatórias desta campanha

- Valores (mensalidade), condições de pagamento, descontos, cupons e links de checkout NÃO entram nas FAQs. Eles vivem no checkpoint da campanha. Onde o prompt pedir "estrutura de preços completa" ou "condições especiais", a resposta correta é descrever a estratégia (como escolher o plano, em que ordem apresentar, o que checar antes de mandar o checkout) e remeter o agente a consultar o checkpoint da campanha em uso.
  Motivo: os prompts de extração de Venda Direta e Recuperação são idênticos, então esta mesma base vai servir as próximas campanhas do Tintim (ativação de trial, ativação da base parada, promocionais), cada uma com oferta própria. Valor cravado em FAQ compartilhada quebra as outras campanhas. Além disso, o Response Auditor só deixa a IA dizer um número se ele estiver literal em uma fonte autorizada (checkpoint/variável).
- Não é infoproduto. É assinatura mensal de um SaaS. Não existe "acesso vitalício", não existe "à vista ou parcelado em 12x", não existe lote. Não gerar FAQ com esses conceitos.
- Não confundir teste com reembolso: são coisas diferentes e o insumo trata as duas. O teste é uma condição comercial de experimentação; o reembolso é regra sobre uma assinatura já adquirida, conforme os Termos de Uso.
- Urgência e escassez: o Tintim tem preço público e não tem vaga, lote ou prazo. Onde o prompt pedir "gatilhos de urgência e escassez", NÃO inventar. A única urgência verdadeira é o custo de continuar sem medir (verba desperdiçada enquanto não se sabe qual anúncio traz venda), e mesmo isso só pode ser usado com os números que o próprio lead informar.
- Promessa: o insumo é explícito de que o Tintim NÃO garante aumento de vendas nem redução de custo por lead. Onde o prompt pedir "resultado específico + prazo", a resposta correta é o mecanismo (o que o Tintim mede e mostra), nunca um resultado prometido.

## Contexto da campanha

De onde vem o lead: ele é um não-MQL que já passou pela IA de SDR do Tintim. Lá foi qualificado e informado de que o time comercial daria sequência. Ou seja, está AQUECIDO e já ouviu o básico.

Importante: esta é uma campanha ATIVA e INDEPENDENTE, no mesmo número do SDR. A IA abre a janela (mensagem de abertura em template) e NÃO recebe o histórico da conversa do SDR. Ela sabe que o lead demonstrou interesse em medir vendas no WhatsApp, mas não vê o que foi dito.

Consequência para a extração: a IA reconecta pelo interesse registrado, sem fingir lembrar da conversa nem recapitular falas específicas do lead (ela não tem esse dado, inventar seria alucinar). Não se apresenta como primeiro contato frio, mas também não continua uma conversa que ela não viu.

Quem NÃO chega aqui: gestor de tráfego ou dono de agência com 3 ou mais clientes. Esse perfil é MQL e vai para a reunião do Programa de Parceiros com um consultor humano. Se um lead desses aparecer nesta campanha, não vender plano para ele nem prometer condição de parceiro: encaminhar para a rota de reunião.

## Objetivo do agente

Vender a assinatura: recomendar o plano certo pela necessidade real do lead e conduzir até o checkout. Diferente do SDR, aqui a IA fecha, informa valor e envia o link de pagamento (valores e links vindos do checkpoint).

## Perfil do lead desta campanha (avatar)

Empresa, infoprodutor, prestador de serviço ou profissional que vende pelo próprio WhatsApp e quer medir de onde vêm as vendas. Ele usa o Tintim no próprio negócio, não gerencia carteira de clientes de terceiros.

## Planos (descrição funcional — valores no checkpoint)

- Plano Inicial: rastreamento e classificação das conversas, identificação de vendas, auditoria de conversas, relatórios, exportação e dashboard, para 1 número de WhatsApp. É o plano de entrada e o foco desta campanha.
- Plano Escala: tudo do Inicial mais disparo de webhook e envio de eventos para Meta Ads e Google Ads, além de acesso de dashboards por terceiros. Indicado quando o lead precisa integrar dados e devolver sinais de venda para otimizar campanhas.

Regra de recomendação: escolher pela necessidade declarada (integração, mídia paga, volume, quantidade de números), nunca só pelo preço ou pelo rótulo de maturidade. A pergunta que separa os dois é se o lead quer apenas enxergar os resultados ou também devolver as vendas para as plataformas de anúncio.

Limite importante: cada plano rastreia 1 número de WhatsApp. Quantidade de números não transforma o lead em agência; vários números da mesma empresa continuam nesta campanha.

## Mecanismo (o que a IA pode afirmar)

O Tintim liga o anúncio à conversa no WhatsApp e à venda: identifica a origem do lead (campanha, conjunto, anúncio, termo de busca), acompanha a jornada, identifica automaticamente quais conversas viraram venda e o valor, e no Escala devolve esses eventos para Meta e Google. É isso que a IA pode prometer: visibilidade e mensuração. O resultado comercial depende da oferta, da campanha, da equipe e da execução do cliente.

## Limites factuais (herdados dos insumos)

- Nunca prometer rastreamento de 100% das conversas. A cobertura pode ser alta com implementação correta, mas existem limites de navegador, comportamento do usuário, links e integrações.
- Nunca afirmar compatibilidade universal com CRM, chatbot ou ferramenta de atendimento. Se a ferramenta do lead não estiver confirmada, coletar o nome dela e encaminhar para análise técnica.
- Nunca prometer prazo de implementação. Depende do tipo de WhatsApp, das fontes de tráfego e das integrações.
- Divergência entre FAQ e a condição vigente no checkout ou na página oficial: prevalece a condição mais atual.
- Casos de acesso, cobrança, reembolso, cancelamento, segurança, exclusão de dados e falha técnica que exijam consulta à conta vão para o suporte humano, e a venda para enquanto isso.

## Pendências a confirmar

- Confirmar se os valores dos planos e as funcionalidades seguem vigentes (para o checkpoint).
- Confirmar a regra e a duração vigentes do teste, e se ele é oferecido nesta campanha ou só quando o lead pede.
- Definir se esta campanha é ativa (a IA chama o lead) ou receptiva (o lead clica no link do SDR), porque isso muda a mensagem de abertura.
