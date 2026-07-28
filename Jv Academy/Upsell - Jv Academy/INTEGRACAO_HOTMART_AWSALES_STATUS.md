# Integração Hotmart Club -> Aw Sales | Status

## Objetivo

Criar uma integração no n8n para consultar o progresso dos alunos do curso Toque em 14 Dias no Hotmart Club e disparar campanhas de upsell da JV Academy na Aw Sales.

## Regra de negócio

- Gatilho 1: alunos com progresso entre 50% e 80%
- Gatilho 2: alunos com progresso acima de 80%
- Cada aluno deve receber cada gatilho apenas uma vez
- O telefone não vem no endpoint de progresso do Club; precisa ser cruzado com a venda original da Hotmart ou base existente
- Regra de retroativo ainda pendente: decidir depois se a primeira execução dispara para alunos que já estão nas faixas ou se apenas cria snapshot inicial.

## Dados já levantados

| Item | Valor |
|---|---|
| Cliente | Juliana Vieira |
| Curso origem | Toque em 14 Dias |
| Produto de upsell | JV Academy |
| Plataforma origem | Hotmart Club |
| Plataforma destino | Aw Sales |
| Orquestração | n8n self-hosted |
| URL do Club | https://hotmart.com/pt-br/club/cursosjulianavieira |
| Subdomínio/base do Club | cursosjulianavieira |
| URL do curso Toque em 14 Dias | https://hotmart.com/pt-br/club/cursosjulianavieira/products/5771195 |
| ID do curso no Club | 5771195 |
| Subdomínio técnico do produto/API | toqueem14dias |

## Decisões recomendadas

- Usar Postgres para persistir estado e controlar idempotência.
- Usar duas campanhas separadas na Aw Sales:
  - Campanha consultiva para 50% a 80%
  - Campanha direta para acima de 80%
- Usar webhook/export de vendas Hotmart para montar a base email -> telefone.

## Próxima pendência

Criar o workflow n8n Hotmart Club -> Google Sheets para consultar progresso e atualizar a aba alunos_progresso.

## Decisão operacional pendente: retroativo

A cliente ainda precisa confirmar se o fluxo deve enviar campanha para quem já está hoje nas faixas de 50% a 80% ou acima de 80%.

A integração deve ser desenhada para suportar os dois modos:

Modo 1: retroativo

- Na primeira execução, alunos que já estão entre 50% e 80% entram no Gatilho 1.
- Na primeira execução, alunos que já estão acima de 80% entram no Gatilho 2.
- Ainda assim, cada aluno só recebe cada gatilho uma vez.

Modo 2: apenas daqui para frente

- Na primeira execução, o n8n faz apenas um snapshot/base inicial dos alunos e seus progressos.
- A partir da segunda execução, o disparo só acontece quando houver travessia de faixa:

- Gatilho 1: aluno estava abaixo de 50% no snapshot anterior e passou para 50% a 80%.
- Gatilho 2: aluno estava em 80% ou menos no snapshot anterior e passou para acima de 80%.

Exemplos:

- Aluno já está com 65% na primeira execução: não recebe Gatilho 1.
- Aluno já está com 90% na primeira execução: não recebe Gatilho 2.
- Aluno estava com 42% e depois aparece com 55%: recebe Gatilho 1.
- Aluno estava com 70% e depois aparece com 83%: recebe Gatilho 2.
- Aluno estava com 40% e depois aparece direto com 85%: recebe Gatilho 2; decidir depois se também deve receber Gatilho 1 ou não. Recomendação: enviar apenas o Gatilho 2.

## Credenciais Hotmart

- Status: criadas
- Nome: n8n - Upsell JV Academy
- Ambiente: Produção
- Arquivo local sensível: CREDENCIAIS_HOTMART_API.md

## Teste OAuth Hotmart

- Status: sucesso
- Endpoint testado: https://api-sec-vlc.hotmart.com/security/oauth/token?grant_type=client_credentials
- Retorno: token bearer válido
- Expiração informada: 172799 segundos

## Testes de API Hotmart

- API de vendas: sucesso com a credencial criada
- API de produtos: sucesso com a credencial criada
- Endpoint do Club testado: /club/api/v1/users
- Resultado do Club com subdomain cursosjulianavieira: não retornou JSON de alunos
- Resultado do Club com subdomain toqueem14dias: sucesso
- Endpoint funcional:

```text
GET https://developers.hotmart.com/club/api/v1/users?subdomain=toqueem14dias&max_results=5
```

- Retorno possui paginação por page_info.next_page_token
- Total retornado no teste: 3093 alunos
- Campos principais por aluno:
  - name
  - email
  - user_id
  - status
  - role
  - type
  - engagement
  - access_count
  - purchase_date
  - first_access_date
  - last_access_date
  - progress.total
  - progress.completed
  - progress.completed_percentage

## Teste API de vendas para telefone

- Endpoint testado: /payments/api/v1/sales/history
- Status: sucesso
- Produto Toque em 14 dias localizado na API de produtos:
  - Nome: Toque em 14 dias - do Zero ao Iniciante
  - Ucode: 5a9cd3c3-e599-4742-8609-130387bb16e1
  - Formato: ONLINE_COURSE
- Produto JV Academy localizado na API de produtos:
  - Nome: JV Academy | Juliana Vieira
  - Ucode: 1c3766ec-3bce-4717-b1c5-7874c874b66c
  - Formato: BUNDLE
- Resultado: a API de vendas retornou buyer.name, buyer.email e buyer.ucode, mas não retornou telefone nos primeiros testes.
- Decisão operacional:
  - Para compradores antigos: exportar relatório de vendas da Hotmart com coluna de telefone.
  - Para compras futuras: configurar webhook Hotmart para salvar email + telefone automaticamente.

## Relatório exportado da Hotmart

- Arquivo recebido:

```text
C:\Users\Pedro\Downloads\sales_history_20260513200504_D983693C12463479133598618938.xls
```

- Observação técnica: apesar da extensão .xls, o arquivo é um XLSX internamente.
- Produto no relatório: Toque em 14 dias - do Zero ao Iniciante
- Linhas de dados: 218
- Linhas com email preenchido: 218
- Linhas com telefone preenchido: 218
- Linhas com DDD + telefone preenchidos: 218
- Status encontrados:
  - Completo: 151
  - Aprovado: 67
- Colunas necessárias presentes:
  - Nome
  - Email
  - DDD
  - Telefone
  - Status
  - Transação
  - Data de Venda
  - Data de Confirmação

Alerta: o endpoint do Club retornou 3093 alunos, enquanto o relatório exportado tem 218 vendas. É necessário confirmar se o relatório foi exportado com período completo/histórico total ou se veio filtrado por data.

## Novo relatório exportado da Hotmart

- Arquivo recebido:

```text
C:\Users\Pedro\Downloads\sales_history_20260513200942_58EEE42213842604860932647855.xls
```

- Filtro informado pelo usuário: últimos 12 meses
- Produto no relatório: Toque em 14 dias - do Zero ao Iniciante
- Linhas de dados: 2846
- Emails únicos: 2840
- Telefones únicos: 2826
- Linhas com email preenchido: 2846
- Linhas com telefone preenchido: 2846
- Linhas com DDD + telefone preenchidos: 2837
- Status encontrados:
  - Completo: 2779
  - Aprovado: 67

Observação: este relatório já cobre a maior parte dos 3093 alunos retornados pelo Club. A diferença pode vir de alunos importados/manual, compras fora dos últimos 12 meses, acessos por outro produto/bundle ou divergência de email.

## Tamanho da base por gatilho

Consulta feita na API do Club com paginação completa.

- Total de alunos no Club: 3093
- Páginas consultadas: 32
- Gatilho 1, progresso entre 50% e 80%: 181 alunos
- Gatilho 1 com telefone encontrado no export: 171 alunos
- Gatilho 2, progresso acima de 80%: 235 alunos
- Gatilho 2 com telefone encontrado no export: 204 alunos
- Fora dos gatilhos no momento da consulta: 2677 alunos
- Emails do export com telefone para cruzamento: 2831

## Comparação com tabela transactions interna

Arquivo analisado:

```text
C:\Users\Pedro\Downloads\query_result_2026-05-13T20_25_33.309274879Z.xlsx
```

Filtros informados:

- Organization Name: JV Academy
- Product Name: Toque em 14 dias - do Zero ao Iniciante
- Status: paid, completed

Resultado da tabela transactions:

- Linhas: 1694
- Emails únicos: 1693
- Emails com telefone: 1693
- Telefones únicos: 1692
- Status:
  - completed: 1615
  - paid: 79
- Produto: Toque em 14 dias - do Zero ao Iniciante

Comparação com export Hotmart 12 meses:

- Emails da transactions também encontrados no export Hotmart: 1680
- Emails da transactions não encontrados no export Hotmart: 13
- Emails do export Hotmart que não estão na transactions: 1160

Cobertura no Club:

- Total de alunos no Club: 3093
- Club com telefone via transactions: 1680
- Club com telefone via export Hotmart: 2840

Cobertura dos gatilhos:

- Gatilho 1 total: 181
- Gatilho 1 com telefone via transactions: 99
- Gatilho 1 com telefone via export Hotmart: 171
- Gatilho 2 total: 235
- Gatilho 2 com telefone via transactions: 84
- Gatilho 2 com telefone via export Hotmart: 204

Conclusão: a tabela transactions bate com o produto e os status, mas não cobre a base completa. Melhor desenho: importar o export Hotmart uma vez como base histórica de telefones e usar a tabela transactions ou webhook para manter novos compradores atualizados daqui para frente.

## Arquivo normalizado para Google Sheets

Arquivo criado para importar direto na aba telefones_hotmart:

```text
C:\Users\Pedro\Desktop\AwsalesUniversalCreator\Jv Academy\Upsell - Jv Academy\telefones_hotmart_import.csv
```

- Linhas: 2840 emails únicos
- telefone_completo formatado com código do país 55 + DDD + telefone
- Fonte marcada como hotmart_export_12m
- Status informado pelo usuário: importado na aba telefones_hotmart
- Hipóteses:
  - Confirmado: o subdomínio técnico do produto não é o mesmo slug da URL pública do Club
  - Confirmado: o endpoint do Club exige o subdomínio encontrado dentro das configurações do produto
  - Pode haver necessidade de permissão/escopo específico para dados do Club

## Pendências depois das credenciais

- Testar endpoint de progresso do Hotmart Club. Status: feito.
- Confirmar formato real do JSON retornado. Status: feito.
- Confirmar se o endpoint aceita filtro por curso/produto ou se será necessário filtrar pelo retorno.
- Exportar vendas antigas ou configurar webhook Hotmart para obter email + telefone.
- Obter endpoint/token da Aw Sales para envio de leads.
- Definir se aluno que recebeu Gatilho 1 pode receber Gatilho 2 depois.
- Definir limite de disparos por lote.

## Andamento no n8n em 2026-05-13

- OAuth Hotmart funcionando no node HTTP Request.
- Endpoint do Club funcionando com o subdomínio `toqueem14dias`.
- Primeira página retorna 99 alunos e `page_info.next_page_token`.
- Normalização dos alunos funcionando com campos de progresso, status, engajamento e datas.
- Upsert na aba `alunos_progresso` funcionando por `email`.
- Próximo ajuste: substituir a paginação nativa do HTTP Request por loop controlado página por página, para evitar carregar um JSON grande no navegador.

## Ajuste de campanha em 2026-05-14

- Cliente simplificou a estratégia para gatilho único.
- Regra nova: aluno com progresso a partir de 50% no curso Toque em 14 Dias.
- Fluxo 1: Hotmart -> Google Sheets, agendado para 8am.
- Fluxo 2: Google Sheets -> Aw Sales, agendado para 9am.
- Custom action Aw Sales testada com sucesso, retorno `status: success`.
- Controle de idempotência: coluna `trigger_1_sent`.
- Ajuste necessário no Fluxo 2: trocar filtro de `50 <= progress <= 80` para `progress >= 50`.
