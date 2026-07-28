# Fluxo n8n — cr-cademi-multi

Workflow que consulta múltiplas instâncias Cademi (EQJC + Ruptura + FDS) em paralelo a partir de um único email e retorna a lista de cursos onde o aluno tem acesso ativo. Criado em paralelo ao workflow antigo `cr-deep-link-cademi` (que continua atendendo a tool antiga `@gerar_deep_link_cademi_via_n8n`), pra não interromper produção durante a transição.

Webhook URL (dev): `https://n8n-dev.awsales.io/webhook/cr-cademi-multi`
Webhook URL (prod, depois do push): `https://flow.awsales.io/webhook/cr-cademi-multi`

## Filosofia anti-handoff

**Toda resposta DEVE ser HTTP 200 com JSON estruturado, mesmo em caso de erro técnico.** Na plataforma AWSales, falha técnica de tool dispara handoff automático para suporte humano via gatilho de Transferência Automática. Como o objetivo da campanha é reduzir taxa de handoff, o workflow encapsula qualquer erro (rede, timeout, payload inválido, falha de uma das instâncias Cademi) em `{ok: false, mensagem: "..."}` com 200, fazendo o Checkpoint Manager tratar como caminho conversacional normal.

Cenários cobertos:
- Email não cadastrado em nenhum Cademi → `ok: false`
- Email cadastrado em 1 ou mais Cademis → `ok: true` com array `cursos`
- Webhook recebido sem campo `email` → Cademi retorna 4xx (URL incompleta), Code trata como "não encontrado" → `ok: false`
- Erro inesperado no Code → `ok: false` com mensagem genérica
- 1 instância Cademi offline mas a outra responde → retorna só o curso disponível, sem disparar erro

---

## Ambiente

Empresa tem 2 instâncias n8n: dev (`n8n-dev.awsales.io`) e prod (`flow.awsales.io`). Workflow foi criado e validado no dev. Push pro prod feito quando os 4 cenários de teste passarem.

---

## Estrutura do workflow

```
Webhook1 (POST)
  ├──► Buscar Usuario Ruptura  (Continue on Error) ──┐
  ├──► Buscar Usuario EQJC      (Continue on Error) ──┼──► Merge ──► Agregar Resposta (Code) ──► Respond Sucesso
  └──► Buscar Usuario FDS       (Continue on Error) ──┘
```

7 nós no total: Webhook + 3 HTTPs + Merge + Code + Respond Sucesso.

**Por que o Merge é necessário:** o nó Code com múltiplas conexões de input (3 HTTPs) é executado uma vez por conexão, gerando outputs separados. O Merge combina os 3 outputs num único input pro Code, garantindo execução única.

---

## Nó 1 — Webhook1

- **Tipo:** Webhook
- **HTTP Method:** POST
- **Path:** `cr-cademi-multi`
- **Authentication:** None
- **Response Mode:** Using "Respond to Webhook" Node

**Payload esperado da Awsales:**
```json
{ "email": "aluno@email.com" }
```

Caminho do email dentro do nó: `{{ $json.body.email }}`

---

## Nó 2A — Buscar Usuario EQJC

- **Tipo:** HTTP Request
- **Method:** GET
- **URL:** `https://exerciciosquanticos.cademi.com.br/api/v1/usuario/{{ $json.body.email }}`
- **Authentication:** None
- **Send Query Parameters:** OFF
- **Send Headers:** ON
  - **Specify Headers:** Using Fields Below
  - Header 1:
    - **Name:** `Authorization`
    - **Value:** `Bearer fb0c97fd-ebe7-4207-981a-da7150e05203`
- **Send Body:** OFF

**Settings → On Error:** `Continue` (sem split)

Com `Continue` simples, tanto sucesso (200 OK) quanto erro (409 "email não cadastrado") fluem pelo mesmo pin de saída. O Code distingue lendo o campo `success` da resposta.

---

## Nó 2B — Buscar Usuario Ruptura

- **Tipo:** HTTP Request
- **Method:** GET
- **URL:** `https://aruptura.cademi.com.br/api/v1/usuario/{{ $json.body.email }}`
- **Authentication:** None
- **Send Query Parameters:** OFF
- **Send Headers:** ON
  - **Specify Headers:** Using Fields Below
  - Header 1:
    - **Name:** `Authorization`
    - **Value:** `Bearer 6d8c1067-ab21-45e2-8e9b-da409765567e`
- **Send Body:** OFF

**Settings → On Error:** `Continue` (igual ao nó EQJC)

---

## Nó 2C — Buscar Usuario FDS

- **Tipo:** HTTP Request
- **Method:** GET
- **URL:** `https://fundamentosdasintonizacao.cademi.com.br/api/v1/usuario/{{ $json.body.email }}`
- **Authentication:** None
- **Send Query Parameters:** OFF
- **Send Headers:** ON
  - **Specify Headers:** Using Fields Below
  - Header 1:
    - **Name:** `Authorization`
    - **Value:** `Bearer 061390ca-a7e3-476f-9263-07c55990510f`
- **Send Body:** OFF

**Settings → On Error:** `Continue` (igual aos nós EQJC e Ruptura)

Token herdado do workflow antigo `cr-deep-link-cademi` (ver `CR Treinamentos/Área de membros e entrada de grupos - FDS/Tool personalizada/Fluxo n8n - cr-deep-link-cademi.md`). Confirmar com o cliente se ainda é válido.

---

## Nó 3 — Merge

- **Tipo:** Merge
- **Mode:** `Append`
- **Number of Inputs:** 3

**Conexões:**
- Input 1: Buscar Usuario Ruptura
- Input 2: Buscar Usuario EQJC
- Input 3: Buscar Usuario FDS

O Merge no modo Append concatena os items das 3 entradas num único array de output. Esse array vira o input único do Code.

---

## Nó 4 — Agregar Resposta (Code)

- **Tipo:** Code
- **Mode:** Run Once for All Items
- **Language:** JavaScript

**Código (robusto — não depende de nomes de nós):**

```javascript
try {
  const cursos = [];
  let nome_aluno = '';

  // Pega TODOS os items que chegaram do Merge (3 items, um de cada HTTP)
  // Não depende dos nomes dos nós — independente da ordem ou label
  const allInputs = $input.all();

  for (const item of allInputs) {
    const resp = item?.json;

    // Só processa se for resposta válida da Cademi (sucesso com deeplink)
    if (resp?.success !== true || !resp?.data?.usuario?.login_auto) continue;

    const deeplink = resp.data.usuario.login_auto;
    let id = '';
    let nome = '';

    // Identifica o curso pelo domínio embutido no deeplink
    if (deeplink.includes('exerciciosquanticos.cademi.com.br')) {
      id = 'eqjc';
      nome = 'Os Exercícios Quânticos de Jesus Cristo';
    } else if (deeplink.includes('aruptura.cademi.com.br')) {
      id = 'ruptura';
      nome = 'A Ruptura';
    } else if (deeplink.includes('fundamentosdasintonizacao.cademi.com.br')) {
      id = 'fds';
      nome = 'Fundamentos da Sintonização';
    } else {
      // Domínio Cademi desconhecido — ignora
      continue;
    }

    cursos.push({ id, nome, deeplink });

    if (!nome_aluno && resp.data.usuario.nome) {
      nome_aluno = resp.data.usuario.nome;
    }
  }

  return [{
    json: {
      ok: cursos.length > 0,
      qtd_cursos: cursos.length,
      nome_aluno,
      cursos,
      mensagem: cursos.length === 0 ? 'Usuário não encontrado em nenhum curso' : ''
    }
  }];

} catch (e) {
  return [{
    json: {
      ok: false,
      qtd_cursos: 0,
      nome_aluno: '',
      cursos: [],
      mensagem: 'Erro técnico ao consultar acessos. Tente novamente em instantes.'
    }
  }];
}
```

> Por que essa versão é robusta:
> - Não depende dos nomes dos nós HTTP (`$('Buscar Usuario EQJC')` quebra se o nó for renomeado/duplicado).
> - Itera `$input.all()` — pega qualquer item que chegar do Merge, em qualquer ordem.
> - Identifica o curso pelo domínio embutido no `login_auto` (única fonte 100% confiável).
> - Erros HTTP (409, timeout, network) caem no `if (resp?.success !== true)` e são silenciosamente ignorados, sem precisar tratar shape de erro.
>
> Pra adicionar novo curso Cademi no futuro, basta adicionar um `else if (deeplink.includes('NOVO_DOMINIO.cademi.com.br'))` no Code (e adicionar 1 nó HTTP novo + 1 input no Merge).

---

## Nó 5 — Respond Sucesso

- **Tipo:** Respond to Webhook
- **Respond With:** First Incoming Item
- **Response Code:** 200

Sempre 200, mesmo quando `ok=false`. É a peça final da filosofia anti-handoff.

---

## Contrato de resposta

**Aluno com 1 curso (apenas EQJC):**
```json
{
  "ok": true,
  "qtd_cursos": 1,
  "nome_aluno": "Odaisa Silva dos Santos",
  "cursos": [
    {
      "id": "eqjc",
      "nome": "Os Exercícios Quânticos de Jesus Cristo",
      "deeplink": "https://exerciciosquanticos.cademi.com.br/auth/login?crstk=..."
    }
  ],
  "mensagem": ""
}
```

**Aluno com 2 cursos (EQJC + Ruptura):**
```json
{
  "ok": true,
  "qtd_cursos": 2,
  "nome_aluno": "Ricardo Teste Aw Sales",
  "cursos": [
    {
      "id": "ruptura",
      "nome": "A Ruptura",
      "deeplink": "https://aruptura.cademi.com.br/auth/login?crstk=..."
    },
    {
      "id": "eqjc",
      "nome": "Os Exercícios Quânticos de Jesus Cristo",
      "deeplink": "https://exerciciosquanticos.cademi.com.br/auth/login?crstk=..."
    }
  ],
  "mensagem": ""
}
```

> A ordem dos cursos no array é variável (depende de qual HTTP terminou primeiro). O checkpoint não deve assumir índice fixo — sempre iterar o array ou buscar por `id`.

**Aluno não encontrado em nenhum curso:**
```json
{
  "ok": false,
  "qtd_cursos": 0,
  "nome_aluno": "",
  "cursos": [],
  "mensagem": "Usuário não encontrado em nenhum curso"
}
```

**Erro inesperado no Code (timeout, exceção, etc):**
```json
{
  "ok": false,
  "qtd_cursos": 0,
  "nome_aluno": "",
  "cursos": [],
  "mensagem": "Erro técnico ao consultar acessos. Tente novamente em instantes."
}
```

---

## Teste manual

Após salvar no dev, ativar o workflow (toggle Active no canto superior direito) e disparar via curl:

```bash
# Email cadastrado só no EQJC (testado: fefegood13@gmail.com → Odaisa Silva dos Santos)
curl -X POST https://n8n-dev.awsales.io/webhook/cr-cademi-multi \
  -H "Content-Type: application/json" \
  -d '{"email":"fefegood13@gmail.com"}'

# Email cadastrado em ambos (testado: retornou Ricardo Teste Aw Sales com 2 cursos)
curl -X POST https://n8n-dev.awsales.io/webhook/cr-cademi-multi \
  -H "Content-Type: application/json" \
  -d '{"email":"EMAIL_EM_AMBOS@dominio.com"}'

# Email inexistente
curl -X POST https://n8n-dev.awsales.io/webhook/cr-cademi-multi \
  -H "Content-Type: application/json" \
  -d '{"email":"naoexiste@teste.com"}'

# Payload sem email
curl -X POST https://n8n-dev.awsales.io/webhook/cr-cademi-multi \
  -H "Content-Type: application/json" \
  -d '{}'
```

Resultados validados em 2026-05-20:

| Teste | `ok` | `qtd_cursos` | Status |
|---|---|---|---|
| Email só EQJC | true | 1 | ✅ `cursos[0].id == "eqjc"` |
| Email só Ruptura | true | 1 | ✅ `cursos[0].id == "ruptura"` |
| Email em ambos | true | 2 | ✅ `cursos` com EQJC e Ruptura (ordem variável) |
| Email inexistente | false | 0 | ✅ `mensagem: "Usuário não encontrado em nenhum curso"` |
| Sem email | false | 0 | ✅ mesmo retorno do "inexistente" |

Todos retornam **HTTP 200** independente do resultado.

---

## Para adicionar novos cursos Cademi no futuro

1. Criar nó HTTP novo no n8n espelhando `Buscar Usuario EQJC`, trocando URL e Bearer Token.
2. Conectar: entrada vinda do Webhook1, saída para um novo input do Merge (Number of Inputs += 1).
3. No Code, adicionar bloco análogo dentro do for:
   ```javascript
   } else if (deeplink.includes('NOVO_DOMINIO.cademi.com.br')) {
     id = 'novo_id';
     nome = 'Nome Amigável do Curso';
   }
   ```
4. Nada muda na tool da Awsales nem no checkpoint — a IA recebe automaticamente o curso novo na lista.

---

## Status

- [x] Workflow `cr-cademi-multi` criado no n8n dev
- [x] Credencial Cademi Ruptura cadastrada (Bearer `6d8c1067-...`)
- [x] Teste: email só de EQJC → `qtd_cursos: 1, id: eqjc`
- [x] Teste: email só de Ruptura → `qtd_cursos: 1, id: ruptura`
- [x] Teste: email de ambos → `qtd_cursos: 2`
- [x] Teste: email inexistente → `ok: false`
- [x] Workflow ativado no dev (Active)
- [ ] Nó "Buscar Usuario FDS" adicionado ao workflow (dev) — domínio `fundamentosdasintonizacao.cademi.com.br`, Bearer `061390ca-...`
- [ ] Merge atualizado para 3 inputs
- [ ] Code "Agregar Resposta" atualizado com bloco `else if` do FDS
- [ ] Teste: email só de FDS → `qtd_cursos: 1, id: fds`
- [ ] Teste: email em 3 cursos → `qtd_cursos: 3`
- [ ] Push do workflow do dev para prod
- [ ] Tool da Awsales atualizada com URL prod (depois do push)
- [ ] Checkpoint Suporte EQJC atualizado (Seção 7 + variável Ruptura)
- [ ] Tool antiga `@gerar_deep_link_cademi_via_n8n` e workflow antigo `cr-deep-link-cademi` deletados (depois de monitorar 7 dias)
