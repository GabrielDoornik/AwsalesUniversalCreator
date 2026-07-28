# Prompt para Segunda Análise da Campanha

Você é uma IA especialista em otimização de campanhas AWSales, SDR, análise de conversas comerciais e arquitetura de checkpoints para agentes multiagentes.

Preciso que você faça uma segunda análise crítica, como se estivesse auditando o trabalho de outra IA. O objetivo é encontrar gaps que possam ter passado batido, validar se as recomendações fazem sentido com base nas conversas reais e propor melhorias adicionais para aumentar performance da campanha.

## Contexto da campanha

Cliente: Clínica D'Leon - Lucas Firmino
Campanha: SDR - Lentes de Porcelana
Objetivo: qualificar leads e agendar avaliação presencial gratuita na clínica em BH, bairro Gutierrez.
Tipo: SDR receptivo. O lead inicia a conversa, geralmente vindo de anúncio.
Atendente: Julia.

## Arquivos obrigatórios para ler antes de opinar

Leia primeiro as regras universais do projeto:

1. `C:\Users\Pedro\Desktop\AwsalesUniversalCreator\Estrutura\ESTRUTURAS_E_EXEMPLOS.md`
2. `C:\Users\Pedro\Desktop\AwsalesUniversalCreator\Estrutura\PROMPT_SISTEMA_UNIVERSAL.md`

Depois leia os arquivos da campanha:

3. `C:\Users\Pedro\Desktop\AwsalesUniversalCreator\Lucas Firmino\SDR\Checkpoint\Checkpoint.md`
4. `C:\Users\Pedro\Desktop\AwsalesUniversalCreator\Lucas Firmino\SDR\MENSAGENS_FOLLOWUP.md`
5. `C:\Users\Pedro\Desktop\AwsalesUniversalCreator\Lucas Firmino\SDR\CONFIG_TOOLS.md`
6. `C:\Users\Pedro\Desktop\AwsalesUniversalCreator\Lucas Firmino\SDR\Texto Complementar - Produto.txt`
7. `C:\Users\Pedro\Desktop\AwsalesUniversalCreator\Lucas Firmino\SDR\Texto Complementar - Playbook.txt`

Leia as FAQs atuais e as otimizações já propostas:

8. `C:\Users\Pedro\Desktop\AwsalesUniversalCreator\Lucas Firmino\SDR\FAQs\SDR - Lucas Firmino - Produto.txt`
9. `C:\Users\Pedro\Desktop\AwsalesUniversalCreator\Lucas Firmino\SDR\FAQs\SDR - Lucas Firmino - Playbook.txt`
10. `C:\Users\Pedro\Desktop\AwsalesUniversalCreator\Lucas Firmino\SDR\FAQs\Otimização FAQs - Produto.md`
11. `C:\Users\Pedro\Desktop\AwsalesUniversalCreator\Lucas Firmino\SDR\FAQs\Otimização FAQs - Playbook.md`

Se precisar conferir as fontes originais em PDF:

12. `C:\Users\Pedro\Desktop\AwsalesUniversalCreator\Lucas Firmino\SDR\FAQs\SDR - Lucas Firmino - Produto.pdf`
13. `C:\Users\Pedro\Desktop\AwsalesUniversalCreator\Lucas Firmino\SDR\FAQs\SDR - Lucas Firmino - Playbook.pdf`

Leia os insumos originais:

14. `C:\Users\Pedro\Desktop\AwsalesUniversalCreator\Lucas Firmino\SDR\Insumo\Insumo - Lentes de Porcelana (limpo).txt`
15. `C:\Users\Pedro\Desktop\AwsalesUniversalCreator\Lucas Firmino\SDR\Insumo\Insumos Agente SDR IA — D'Leon x AWsalles (v2 — completo).txt`
16. `C:\Users\Pedro\Desktop\AwsalesUniversalCreator\Lucas Firmino\SDR\Insumo\Insumo - Protocolo e HOF (reserva futura).txt`

Leia a base de conversas real:

17. `C:\Users\Pedro\Desktop\AwsalesUniversalCreator\Lucas Firmino\SDR\Conversas\query_result_2026-06-01T18_53_54.730540091-03_00.xlsx`

Leia também a análise e relatório já feitos, mas trate como material para auditar, não como verdade absoluta:

18. `C:\Users\Pedro\Desktop\AwsalesUniversalCreator\Lucas Firmino\SDR\ANALISE_CONVERSAS_E_OTIMIZACOES.md`
19. `C:\Users\Pedro\Desktop\AwsalesUniversalCreator\Lucas Firmino\SDR\RELATORIO_CLIENTE_OTIMIZACAO_CAMPANHA.md`

Arquivos auxiliares, se quiser contexto operacional:

20. `C:\Users\Pedro\Desktop\AwsalesUniversalCreator\Lucas Firmino\SDR\Tabela de detalhes\Qualify & Schedule - Agente.txt`
21. `C:\Users\Pedro\Desktop\AwsalesUniversalCreator\Lucas Firmino\SDR\Tabela de detalhes\Custos da campanha - Lucas Firmino.xlsx`

## O que quero que você analise

Faça uma análise independente das conversas reais e responda:

1. Quais são os maiores pontos de perda da campanha?
2. O relatório atual deixou algum gap importante passar?
3. O checkpoint atual está bom para performance ou ainda tem trechos que podem gerar fricção?
4. O checkpoint tem risco de loop, excesso de etapas, pergunta demais ou demora para agendar lead quente?
5. As FAQs atuais e as FAQs novas propostas cobrem bem as objeções reais?
6. Existe alguma FAQ que deveria ser editada, adicionada ou removida?
7. As objeções de preço, distância, quantidade de lentes, menos de 10 lentes, resina/faceta, cárie/implante/dente quebrado e Dr. Lucas estão bem tratadas?
8. O follow-up inteligente está bem orientado ou ainda pode ser melhorado?
9. Quais informações devemos pedir ao cliente antes de publicar mudanças?
10. O relatório para cliente está convincente, claro e bem embasado ou precisa mudar tom/estrutura?

## Critérios importantes

- Não dê opinião genérica. Baseie tudo em evidências das conversas, FAQs, checkpoint e insumos.
- Se identificar um gap, diga em qual artefato ele deve ser corrigido: Checkpoint, FAQ Produto, FAQ Playbook, Follow-Up ou pergunta ao cliente.
- Não invente informações comerciais. Use apenas o que está nos arquivos.
- O nome correto da tool de registro é `@registrar_lead_no_rp`.
- O checkpoint final não pode ter asteriscos, emojis ou variáveis sem rodapé.
- Em SDR, se o lead pede preço, horário, fotos ou avaliação, trate isso como sinal de interesse. Não obrigue o lead quente a passar por diagnóstico longo.
- Diferencie recomendação interna de texto que será enviado ao cliente.

## Formato de resposta esperado

Entregue em português, com esta estrutura:

## Veredito Geral

Diga se o relatório atual está bom, parcial ou fraco, e por quê.

## Gaps Encontrados

Liste os gaps que você encontrou e que não estão bem cobertos no relatório atual. Para cada gap, traga:

- Evidência observada.
- Impacto provável na campanha.
- Artefato afetado.
- Recomendação objetiva.

## Ajustes Recomendados no Checkpoint

Traga mudanças específicas. Se possível, escreva trechos prontos para inserir ou substituir.

## Ajustes Recomendados em FAQs

Separe em Produto e Playbook. Traga pergunta e resposta pronta quando recomendar FAQ nova ou edição.

## Ajustes Recomendados no Follow-Up

Traga regras práticas para os 3 campos do Follow-Up Inteligente.

## Pontos para Perguntar ao Cliente

Liste perguntas essenciais, com motivo comercial/operacional.

## Melhorias no Relatório para Cliente

Sugira como deixar o relatório mais convincente, objetivo e defensável para uma reunião com cliente que deu muitos palpites.

## Riscos Antes de Publicar

Liste qualquer risco de ferramenta, regra, promessa, tom, formatação ou dados comerciais.

## Prioridade de Implementação

Classifique em:

- Alta prioridade.
- Média prioridade.
- Baixa prioridade.

Não faça alterações nos arquivos nesta primeira resposta. Apenas analise e recomende.
