# Análise de Conversas e Otimizações

Campanha: SDR - Lucas Firmino
Base analisada: Conversas exportadas em 01/06/2026

## 1. Resumo quantitativo

- Leads únicos analisados: 252
- Mensagens totais: 3561
- Mensagens da IA: 2308
- Mensagens dos leads: 1253
- Entrada mais comum: "Olá! Gostaria de saber mais sobre a campanha 2026 ano da transformação" em 164 leads

Categorias mais frequentes nas mensagens dos leads:

- Dor estética: 125 leads
- Preço, valor, investimento ou parcelamento: 101 leads
- Agendamento, horário ou avaliação: 65 leads
- Dúvida técnica sobre procedimento: 62 leads
- Localização, BH, distância ou logística: 47 leads
- Falta de dinheiro, caro, vou pensar ou depois: 18 leads
- Ruído, spam ou mensagem sem relação com a campanha: 17 leads
- Pedido ou referência ao Dr. Lucas: 15 leads

Pontos de parada identificados pelo último estado claro da IA:

- Parou na pergunta de dor: 74 leads
- Parou na validação presencial em BH: 18 leads
- Parou após valor ou condição: 14 leads
- Agendado ou confirmado: 11 leads
- Parou após prova social: 5 leads
- Parou escolhendo horário: 3 leads
- Parou em coleta de dados: 2 leads

Observação: houve 120 conversas classificadas como "outro" porque muitas terminam em follow-up personalizado, encerramento informal ou histórico longo. Mesmo assim, os padrões acima aparecem com força suficiente para orientar otimização.

## 2. Principais gaps encontrados

## 2.1 Pergunta de dor muito aberta para lead de anúncio frio

O maior ponto de perda está logo depois da pergunta "o que mais te incomoda no seu sorriso hoje?". A pergunta é boa para conversa consultiva, mas muitos leads chegam frios pelo anúncio genérico e ainda não querem se expor.

Ajuste aplicado:

- O checkpoint agora orienta dar contexto em uma frase e trocar a pergunta aberta por opções concretas: cor, formato/tamanho ou espaços entre os dentes.
- O follow-up também deve retomar com opções concretas quando o lead não respondeu à primeira pergunta.

## 2.2 Lead pede preço e a IA às vezes volta para diagnóstico

Preço apareceu em 101 leads. Em SDR, pedido de preço é sinal de interesse e precisa ser respondido antes de nova pergunta. Quando a IA insiste em dor, fotos ou procedimento antes de responder, o lead tende a abandonar.

Ajuste aplicado:

- O checkpoint agora define "Pedido de preço" como roteador próprio.
- Se o lead pede preço, a IA responde primeiro com os valores oficiais e depois conecta à avaliação gratuita.

## 2.3 Follow-up genérico e, em alguns casos, com emoji

Alguns follow-ups retomavam com frases como "fiquei curiosa" ou perguntas amplas, mesmo quando já havia pendência clara. Também apareceram emojis em mensagens da IA, apesar do checkpoint proibir.

Ajuste aplicado:

- O checkpoint ganhou orientação específica para Follow-Up Inteligente.
- O arquivo MENSAGENS_FOLLOWUP.md foi atualizado para proibir emojis e retomar a pendência real: preço, fotos, distância, horário ou dor.

## 2.4 Falta de campos de estado para Smart Follow-Up

O checkpoint antigo tinha etapas, mas não tinha campos marcáveis de status, temperatura, dor, trava e próximo passo. Isso deixa o follow-up menos contextual e aumenta chance de retomada genérica.

Ajuste aplicado:

- Foram adicionados campos com caixas de marcação e critérios observáveis:
  - Status do lead
  - Temperatura
  - Dor principal identificada
  - Trava ou objeção ativa
  - Próximo passo pendente

## 2.5 Leads de fora de BH precisam de condução menos binária

Muitos leads perguntam onde fica, moram fora de BH ou só podem sábado. A pergunta "você consegue vir?" é necessária, mas quando usada sozinha vira uma barreira. O ideal é distinguir impossibilidade real de dificuldade logística.

Ajuste aplicado:

- O checkpoint agora orienta perguntar se existe alguma data em que o lead venha a BH.
- Foi sugerida nova FAQ sobre quantidade de idas e limite de promessa para quem mora longe.

## 2.6 Casos clínicos que podem não ser apenas lentes

Conversas trouxeram cárie, dentes quebrados, implantes, perda de dentes e facetas antigas. A IA não deve afirmar que lentes resolvem tudo.

Ajuste aplicado:

- O checkpoint agora manda não prometer indicação de lentes nesses casos.
- Foi sugerida nova FAQ Produto para orientar esses cenários com segurança.

## 2.7 Anúncio ou promessa comercial divergente

Um lead citou anúncio com condição diferente da base. Esse é um ponto sensível porque a IA não pode confirmar condição não autorizada nem chamar o anúncio de enganoso.

Ajuste aplicado:

- O checkpoint ganhou rota para "confusão de anúncio".
- Foi sugerida FAQ Produto específica para preço ou quantidade divergente do anúncio.

## 3. Objeções observadas

- Quanto custa, qual média de valores, qual investimento.
- Entrada, parcelas, orçamento não cabe, caro, vou pensar.
- Sou de outra cidade, é longe, precisa ir quantas vezes.
- Quero sábado, domingo ou data específica.
- Quero poucas lentes, lentes avulsas, 4 dentes, menos de 10.
- Tenho cárie, dente quebrado, implante, perda de dentes ou faceta antiga.
- Lente de resina, faceta, porcelana, diferença entre materiais.
- Dói, desgasta o dente, precisa manutenção, quebra.
- Quero ser atendido pelo Dr. Lucas ou vi anúncio do Dr. Lucas.
- Vi anúncio com valor/quantidade diferente.
- Não me incomoda nada, só queria estética ou curiosidade.

## 4. Informações que vale pedir ao cliente

1. Criativos e anúncios ativos
Pedir prints ou links dos anúncios atuais, especialmente os que citam valor, quantidade de lentes, celebridades, influenciadores ou referências como "30 lentes por R$ 400". Isso evita conflito entre anúncio e base.

2. Política para menos de 10 lentes
Confirmar se a clínica quer incentivar avaliação para 2, 4 ou 6 lentes, como explicar valor individual e se há algum pacote intermediário.

3. Política para leads de fora de BH
Confirmar se existe possibilidade de compactar agenda para quem vem de outra cidade, se há preferência por sábado e qual limite real para prometer organização logística.

4. Outros procedimentos no mesmo fluxo
Definir se leads com cárie, dente quebrado, implante, perda dentária, resina ou HOF devem seguir para avaliação geral, suporte humano ou outra campanha.

5. Confirmação das integrações
Validar no painel os parâmetros operacionais finais das integrações de agenda e RP: serviceId, campaignSlug, rating e campos de origem.

6. Avaliadores e presença do Dr. Lucas
Confirmar como responder quando o lead espera ser atendido pelo Dr. Lucas por causa do anúncio. A base atual diz que ele pode participar conforme disponibilidade, mas convém alinhar frase exata.

7. Disponibilidade real de sábado
Como muitos leads de fora só conseguem sábado, vale confirmar se a clínica quer priorizar sábado para esse perfil ou manter regra comum.

## 5. Arquivos alterados

- Checkpoint/Checkpoint.md
- MENSAGENS_FOLLOWUP.md
- FAQs/Otimização FAQs - Produto.md
- FAQs/Otimização FAQs - Playbook.md

## 6. Próximo passo recomendado

- Atualizar o checkpoint na plataforma.
- Criar as FAQs novas sugeridas na base Produto e Playbook.
- Validar com o cliente os pontos da seção 4.
- Revisar os criativos ativos antes de avaliar performance novamente.
