# Fluxo n8n — Hotmart Club Progresso -> Google Sheets -> Aw Sales

## Objetivo

Consultar o progresso dos alunos do curso Toque em 14 Dias no Hotmart Club, persistir estado no Google Sheets e, depois, enviar alunos elegíveis para campanhas da Aw Sales.

## Status atual

- Hotmart OAuth: testado com sucesso
- Endpoint do Club: testado com sucesso
- Subdomínio técnico correto: toqueem14dias
- Google Sheets criado
- Aba telefones_hotmart importada com base histórica

## Parte 1 — Workflow de progresso

Nesta primeira etapa, o workflow deve apenas:

1. Buscar token Hotmart
2. Buscar todos os alunos do Club com paginação
3. Normalizar os dados
4. Atualizar a aba alunos_progresso

O envio para Aw Sales entra depois.

## Endpoint OAuth

```text
POST https://api-sec-vlc.hotmart.com/security/oauth/token?grant_type=client_credentials&client_id={{CLIENT_ID}}&client_secret={{CLIENT_SECRET}}
```

Headers:

```text
Authorization: Basic ...
Content-Type: application/json
```

## Endpoint de alunos/progresso

```text
GET https://developers.hotmart.com/club/api/v1/users?subdomain=toqueem14dias&max_results=100
```

Paginação:

```text
page_info.next_page_token
```

Próxima página:

```text
GET https://developers.hotmart.com/club/api/v1/users?subdomain=toqueem14dias&max_results=100&page_token={{next_page_token}}
```

## Campos vindos do Club

```text
email
name
user_id
status
progress.total
progress.completed
progress.completed_percentage
access_count
engagement
first_access_date
last_access_date
```

## Colunas da aba alunos_progresso

```text
email
nome
user_id
status_aluno
progress_total
progress_completed
progress_percentage
previous_progress_percentage
access_count
engagement
first_seen_at
last_seen_at
trigger_1_sent
trigger_2_sent
```

## Regras de atualização

- email é a chave principal.
- Se o email ainda não existe na aba alunos_progresso:
  - criar nova linha
  - first_seen_at = agora
  - last_seen_at = agora
  - previous_progress_percentage = progress_percentage atual
  - trigger_1_sent = false
  - trigger_2_sent = false
- Se o email já existe:
  - previous_progress_percentage recebe o valor antigo de progress_percentage
  - progress_percentage recebe o valor novo
  - last_seen_at = agora
  - preservar trigger_1_sent e trigger_2_sent

## Regra de elegibilidade futura

Decisão de retroativo ainda pendente. O workflow deve suportar os dois modos:

Modo retroativo:

- Se progress_percentage entre 50 e 80 e trigger_1_sent != true, elegível Gatilho 1
- Se progress_percentage acima de 80 e trigger_2_sent != true, elegível Gatilho 2

Modo a partir de agora:

- Se previous_progress_percentage < 50 e progress_percentage entre 50 e 80, elegível Gatilho 1
- Se previous_progress_percentage <= 80 e progress_percentage acima de 80, elegível Gatilho 2

Recomendação técnica: criar uma variável/configuração no workflow chamada retroactive_mode com true/false.

## Próxima etapa depois da Parte 1

Depois que a aba alunos_progresso estiver atualizando corretamente, montar:

1. Cruzamento com telefones_hotmart
2. Filtro de elegíveis
3. Envio para Aw Sales
4. Registro em disparos
