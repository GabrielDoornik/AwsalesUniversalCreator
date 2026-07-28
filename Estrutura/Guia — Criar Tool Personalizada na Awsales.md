# Guia — Criar Tool Personalizada na Awsales

## Como usar este guia

Quando for criar uma nova tool, mande este arquivo + a documentação da API da plataforma (PDF, link, ou texto). Com isso terei tudo que preciso para te guiar tela a tela.

---

## O que coletar ANTES de começar

Antes de abrir a Awsales, você precisa ter em mãos:

| Item | O que é | Onde achar |
|---|---|---|
| Tipo de autenticação | Como a API autentica (API Key, Bearer Token, Basic Auth, etc.) | Documentação da API |
| Credenciais | Chaves, tokens, usuário/senha | Painel da plataforma (configurações > API) |
| Endpoints disponíveis | URLs de cada ação (GET, POST, etc.) | Documentação da API |
| Parâmetros de cada endpoint | Campos obrigatórios e opcionais, tipos, formatos | Documentação da API |
| Exemplo de resposta | JSON que a API retorna | Documentação ou teste manual |

---

## Estrutura de uma Tool na Awsales

Criar uma tool envolve **2 partes separadas**:

1. **Conexão** — cadastro das credenciais da plataforma (feito uma vez por plataforma)
2. **Tool HTTP** — configuração de cada endpoint (uma tool por endpoint)

---

## Parte 1 — Configurar a Conexão

Caminho: Habilidades Personalizadas → Nova Conexão

### Campos

**Nome da conexão**
Nome livre para identificar a plataforma. Ex: `Plataforma Uno`, `RD Station`, `HubSpot`.

**Tipo de Autenticação**

| Opção | Quando usar |
|---|---|
| Nenhuma | API pública sem autenticação |
| Basic Auth | API que usa usuário + senha |
| Bearer Token | API que usa `Authorization: Bearer xxx` |
| Header Personalizado | API que usa header(s) customizados (ex: `x-api-key`, `x-access-token`) |
| Query Parameter | Autenticação via parâmetro na URL (ex: `?api_key=xxx`) |

> **Importante:** A conexão aceita apenas **um** header. Se a API exigir dois headers de autenticação (ex: `x-access-token` + `x-secret-key`), cadastre o principal aqui e adicione o segundo diretamente nos Headers Customizados de cada tool.

**Organização**
Seleciona o cliente/organização da Awsales ao qual a conexão pertence.

---

## Parte 2 — Criar a Tool HTTP

### Tela 1 — Nome e Descrição

**Nome da Tool**
Nome curto e claro. Ex: `Consultar Horários Disponíveis`, `Criar Agendamento`, `Buscar Lead por Email`.

**Descrição (para a IA)**
Este campo é crítico — é o que a IA lê para decidir quando e como usar a tool. Deve responder:
- Quando usar esta tool?
- O que ela faz?
- O que a IA deve informar?

Modelo de descrição:
```
Use esta tool para [objetivo]. Chame esta tool [quando/condição]. Informe [parâmetros principais].
```

Exemplo:
```
Use esta tool para consultar os horários disponíveis na agenda da clínica antes de criar um agendamento.
Chame esta tool sempre que o lead quiser saber os horários livres ou antes de confirmar uma data.
Informe a data desejada e o tipo de serviço (serviceId).
```

---

### Tela 2 — Configuração da Requisição

**Método**
Seleciona o método HTTP: `GET`, `POST`, `PUT`, `PATCH`, `DELETE`.
- `GET` → consulta/leitura de dados
- `POST` → criação de registros ou envio de ações

**URL do Endpoint**
URL completa do endpoint. Ex: `https://api.plataforma.com/v1/scheduler/hours`

Se a URL tiver parâmetros dinâmicos no path, use chaves: `https://api.plataforma.com/v1/leads/{id}`

---

#### Headers Customizados

Use para adicionar headers que não foram cadastrados na conexão.

Campos:
- **Nome:** nome exato do header (ex: `x-secret-key`, `x-api-version`)
- **Valor:** valor do header

> Se a plataforma exige 2 headers de auth e a conexão só aceita 1, o segundo vai aqui.

---

#### Query Parameters (apenas GET)

Parâmetros que vão na URL como `?chave=valor`.

| Campo | O que é |
|---|---|
| Nome | Nome exato do parâmetro (ex: `date`, `serviceId`, `page`) |
| Tipo | Tipo do valor: `String`, `Number`, `Boolean` |
| Fonte | `IA` = a IA preenche dinamicamente / `Fixo` = valor estático definido por você |
| Descrição para IA | Explica para a IA o que colocar neste campo (obrigatório quando Fonte = IA) |
| Req | Marcar se o parâmetro é obrigatório para a API funcionar |

**Exemplo de Descrição para IA em Query Parameters:**
- `date` → `Data para consulta no formato DD/MM/YYYY. Ex: 15/04/2026`
- `serviceId` → `ID do serviço. Use 1 para Produto A, 2 para Produto B`

---

#### Body Schema JSON (apenas POST/PUT/PATCH)

Campos que vão no corpo da requisição.

| Campo | O que é |
|---|---|
| Nome do Campo | Nome exato da chave no JSON (ex: `name`, `cellPhone`, `date`) |
| Tipo | Tipo do valor: `String`, `Number`, `Boolean` |
| Fonte | `IA` = a IA preenche / `Fixo` = valor estático |
| Descrição para IA | O que a IA deve colocar neste campo |
| Req | Marcar se o campo é obrigatório para a API |

> **Dica:** Campos opcionais (sem Req marcado) também são úteis — permitem que a IA adicione contexto, observações ou motivos quando relevante.

**Exemplo de campos Body:**

| Nome | Tipo | Fonte | Req | Descrição para IA |
|---|---|---|---|---|
| date | String | IA | ✓ | Data do agendamento no formato DD/MM/YYYY |
| hour | String | IA | ✓ | Horário no formato HH:MM. Ex: 09:00 |
| name | String | IA | ✓ | Nome completo do lead |
| cellPhone | String | IA | ✓ | Telefone com DDD. Ex: 31999999999 |
| serviceId | String | IA | ✓ | ID do serviço. Use 1 para X, 136 para Y |
| observation | String | IA | ✗ | Observações opcionais: motivo de reagendamento, produto de interesse, contexto relevante |

---

### Tela 3 — Mapeamento de Resposta

Esta tela extrai campos específicos da resposta da API para usar em outros lugares do fluxo.

**Mapeamento Automático (recomendado)**
1. Preenche os valores de teste com dados reais
2. Clica em "Executar e Mapear Automaticamente"
3. O sistema chama a API de verdade e detecta os campos disponíveis na resposta

> Se der erro 401 aqui mas a lógica de auth parece certa, tente criar a tool primeiro e testar depois — é um bug conhecido da plataforma.

**Valores de teste — boas práticas:**
- Use dados reais e válidos (datas futuras, IDs existentes, nomes reais de teste)
- Para datas, use sempre uma data futura no formato correto da API
- Para IDs, use IDs que existam de fato na plataforma

**Campos Mapeados**
Após o mapeamento automático, selecione quais campos da resposta você quer extrair como variáveis. Exemplos úteis:
- `appointmentId` — ID do agendamento criado
- `hours` — lista de horários disponíveis
- `ok` — status de sucesso da operação

---

## Referenciando a Tool no Checkpoint

Após criar a tool, o sistema atribui um handle com `@`. Use sempre o formato:

```
Utilize a tool para [ação] @nome_da_tool
```

Exemplos corretos:
```
Utilize a tool para consultar horários disponíveis @consultar_horarios_disponiveis
Utilize a tool para criar o agendamento @criar_agendamento
Utilize a tool para buscar o lead no CRM @buscar_lead
```

Exemplos INCORRETOS (não usar):
```
execute @consultar_horarios_disponiveis   ← errado
via @criar_agendamento                    ← errado
use @buscar_lead                          ← errado
```

---

## Checklist Rápido

Antes de criar:
- [ ] Tenho o tipo de autenticação e as credenciais
- [ ] Tenho a URL de cada endpoint
- [ ] Sei quais parâmetros cada endpoint exige (obrigatórios e opcionais)
- [ ] Sei o formato de cada parâmetro (data, telefone, IDs, etc.)

Durante a criação:
- [ ] Conexão criada com o header principal
- [ ] Segundo header de auth adicionado nos Headers Customizados da tool (se necessário)
- [ ] Nome e Descrição para IA preenchidos corretamente
- [ ] Todos os parâmetros com Descrição para IA
- [ ] Campos obrigatórios marcados com Req
- [ ] Mapeamento automático executado com sucesso
- [ ] Handle `@nome_da_tool` anotado para usar no checkpoint

No checkpoint:
- [ ] Tool referenciada no formato `Utilize a tool para [ação] @nome_da_tool`
- [ ] Tool posicionada no momento correto do fluxo
- [ ] Pré-requisitos da tool documentados antes da invocação

---

## Exemplo Real — Plataforma UNO (D'Leon)

### Conexão
- **Nome:** Plataforma Uno
- **Tipo:** Header Personalizado
- **Header:** `x-uno-access-token` / `BA779B6447B12E3F0150`
- **Segundo header (nas tools):** `x-uno-secret-key` / `d59217553f292c649dc74cbbbd14098eab16b26247b3e87e6c`

### Tool 1 — Consultar Horários Disponíveis
- **Método:** GET
- **URL:** `https://api.unobject.com.br/v1/scheduler/hours`
- **Parâmetros:**
  - `date` (String, IA, Req) — `Data no formato DD/MM/YYYY. Ex: 15/04/2026`
  - `serviceId` (String, IA, Req) — `ID do serviço. Use 1 para Lentes de Porcelana, 136 para Protocolo de Implantes, 137 para Harmonização Facial`
- **Handle:** `@consultar_horarios_disponiveis`

### Tool 2 — Criar Agendamento
- **Método:** POST
- **URL:** `https://api.unobject.com.br/v1/scheduler/create`
- **Body:**
  - `date` (String, IA, Req) — `Data no formato DD/MM/YYYY`
  - `hour` (String, IA, Req) — `Horário no formato HH:MM`
  - `name` (String, IA, Req) — `Nome completo do lead`
  - `cellPhone` (String, IA, Req) — `Telefone com DDD. Ex: 31999999999`
  - `serviceId` (String, IA, Req) — `ID do serviço. Use 1 para Lentes de Porcelana, 136 para Protocolo de Implantes, 137 para Harmonização Facial`
  - `observation` (String, IA, opcional) — `Observações sobre o lead ou motivo de reagendamento`
- **Handle:** `@criar_agendamento`

> Nota: este endpoint cria E substitui agendamentos — o mesmo endpoint serve para criar e reagendar.
