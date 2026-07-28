# Análise de Conversas 01/06 a 11/06

Campanha: SDR - Lucas Firmino
Base analisada: Conversa (01-06 a 11-06)
Arquivo: query_result_2026-06-11T20_02_33.998984314-03_00.xlsx

## 1. Resumo quantitativo

- Período real da base: 02/06/2026 02:31 a 11/06/2026 21:22.
- Leads únicos analisados: 60.
- Mensagens totais: 1.409.
- Mensagens da IA: 858.
- Mensagens dos leads: 551.

Entradas mais comuns:

- 19 leads: "Olá! Tenho interesse e queria mais informações, por favor."
- 11 leads: "Olá! Gostaria de saber mais sobre a campanha HOMEM DAS LENTES."
- 10 leads: "Olá! Gostaria de saber mais sobre a campanha 2026 ano da transformação !"

Categorias encontradas por lead:

- Dor estética ou desejo de sorriso: 42.
- Agendamento, horário ou avaliação: 31.
- Preço, valor ou parcelamento: 24.
- Dúvida técnica sobre procedimento: 24.
- Casos clínicos sensíveis: 14.
- Pedido/referência ao Dr. Lucas: 16.
- Localização, distância, BH ou logística: 10.
- Falta de dinheiro/caro/vou pensar: 3.

Estados finais aproximados:

- Parou em pergunta de dor: 13.
- Parou em escolha de horário: 8.
- Parou em validação presencial: 2.
- Parou após valor: 2.
- Parou após fotos/prova social: 1.
- Agendamento confirmado identificado: 2.
- Encerrado ou porta aberta: 1.
- Outro/histórico longo/follow-up: 28.

## 2. O que a base confirma da análise anterior

## 2.1 Pergunta aberta ainda derruba lead frio

A IA antiga ainda usou muitas vezes "o que mais te incomoda no seu sorriso hoje?" para lead de anúncio frio. Isso aparece nos leads que pararam na primeira pergunta e também em follow-ups com "fiquei curiosa".

Status: já corrigido no checkpoint atual.

O checkpoint agora força a pergunta por opções: cor, formato/tamanho ou espaços entre os dentes.

## 2.2 Casos clínicos sensíveis continuam relevantes

A base trouxe cárie, perda óssea, dentes quebrados, resina, perda de dentes, implante e prótese. Em alguns momentos a IA antiga ainda soou afirmativa demais, como se lente resolvesse o caso.

Status: já coberto no checkpoint e nas FAQs atuais.

O checkpoint atual reforça: não prometer indicação de lentes, não descartar o lead e conduzir para avaliação gratuita.

## 2.3 Distância e sábado seguem como gargalo

Os leads de fora ou com agenda limitada continuam aparecendo. Sábado é muito importante, mas a agenda frequentemente retorna lotada, o que cria queda na etapa de horário.

Status: checkpoint mantido com condução logística antes de desqualificar.

Ponto operacional: vale alinhar com a clínica se há política de encaixe/prioridade para leads de fora ou para sábado.

## 3. Novos gaps encontrados

## 3.1 Follow-ups duplicados

Foram encontrados 38 casos de mensagens idênticas enviadas em sequência, em 37 leads. Isso dá aparência de erro operacional e reduz naturalidade.

Ajuste aplicado:

- MENSAGENS_FOLLOWUP.md agora orienta nunca enviar a mesma mensagem duas vezes em sequência.
- A regra de necessidade agora manda SKIP quando a última mensagem da IA já foi follow-up e o lead ainda não respondeu.
- Checkpoint também recebeu regra geral de não enviar duas mensagens idênticas em sequência.

Observação: se continuar acontecendo, é provável ajuste operacional no disparador do Follow-Up Inteligente, não só prompt.

## 3.2 Nome da campanha aparece como Homem das Lentes

11 leads entraram com "HOMEM DAS LENTES", além dos leads que entraram com "2026 ano da transformação".

Ajuste aplicado:

- Checkpoint agora reconhece 2026 O Ano da Transformação e Homem das Lentes como nomes da campanha.
- Regra de valores permite enquadrar como Homem das Lentes quando o lead vier desse anúncio.

## 3.3 Endereço divergente em confirmação

Foi visto um caso em que a IA confirmou endereço diferente do endereço atual da base. A base atual aponta Rua André Cavalcanti, 53, Gutierrez, BH, com estacionamento na Rua Herculano de Freitas, 58.

Ajuste aplicado:

- Checkpoint agora fixa o endereço oficial e manda priorizar o checkpoint se houver divergência.
- Variáveis finais do checkpoint também registram endereço e estacionamento.

## 3.4 Desconfiança sobre atendimento e pedido de ligação

Houve lead perguntando "você é uma pessoa de verdade?" e outro querendo ligação/diferencial contra concorrente. A IA antiga respondeu de forma repetitiva e pouco orientada.

Ajuste aplicado:

- Checkpoint ganhou rota para dúvida sobre atendimento humano ou pedido de ligação.
- Checkpoint ganhou rota para comparação com concorrentes sem atacar outra clínica.

## 4. Arquivos alterados nesta rodada

- Checkpoint/Checkpoint.md
- MENSAGENS_FOLLOWUP.md

## 5. Arquivos auxiliares gerados

- Conversa (01-06 a 11-06)/classificacao_leads_01-06_a_11-06.csv
- Conversa (01-06 a 11-06)/transcricoes_agrupadas_01-06_a_11-06.txt

## 6. Próximo passo recomendado

- Colar o checkpoint atualizado na plataforma.
- Atualizar as orientações do Follow-Up Inteligente com o MENSAGENS_FOLLOWUP.md.
- Monitorar se as mensagens duplicadas continuam. Se continuarem, investigar configuração/execução do disparador de follow-up.
- Alinhar com a clínica disponibilidade real de sábado e possibilidade de encaixe para leads de fora.
