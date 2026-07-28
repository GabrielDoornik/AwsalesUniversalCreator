# Fluxo n8n — cr-deep-link-cademi

Workflow que encapsula a chamada à API Cademi e sempre retorna HTTP 200 com JSON estruturado para a tool `@gerar_deep_link_de_acesso_cademi` da Awsales.

Webhook URL: `https://n8n-dev.awsales.io/webhook/cr-deep-link-cademi`

---

## Estrutura do workflow

```
Webhook1 (POST)
  └─> Buscar Usuario Cademi (GET)
        ├─ Success ─> Edit Fields (Sucesso) ─> Respond Sucesso
        └─ Error   ─> Respond Não Encontrado
```

Apenas 1 chamada à API (diferente do Curseduca, que precisava de 2).

---

## Nó 1 — Webhook1

- **Tipo:** Webhook
- **HTTP Method:** POST
- **Path:** `cr-deep-link-cademi`
- **Authentication:** None
- **Response Mode:** Using "Respond to Webhook" Node
- **Response Data:** (não usar — quem responde são os nós Respond)

**Payload esperado da Awsales:**
```json
{
  "email": "aluno@email.com"
}
```

Caminho do email dentro do nó: `{{ $json.body.email }}`

---

## Nó 2 — Buscar Usuario Cademi

- **Tipo:** HTTP Request
- **Method:** GET
- **URL:** `https://fundamentosdasintonizacao.cademi.com.br/api/v1/usuario/{{ $json.body.email }}` (email no path, sem query param)
- **Authentication:** None
- **Send Query Parameters:** OFF
- **Send Headers:** ON
  - **Specify Headers:** Using Fields Below
  - Header 1:
    - **Name:** `Authorization`
    - **Value:** `Bearer 061390ca-a7e3-476f-9263-07c55990510f`
- **Send Body:** OFF

**Settings → On Error:** `Continue (using error output)` — habilita a saída Error do nó (o branch de baixo no print).

**Comportamento esperado:**
- Email existe → HTTP 200 com `{ success, code, data: { usuario: { login_auto, nome, ... } } }` → branch **Success**
- Email não existe → HTTP 409 (Erro de negócio Cademi) → branch **Error**

---

## Nó 3 — Edit Fields (Sucesso)

- **Tipo:** Edit Fields (Set)
- **Mode:** Manual Mapping
- **Include Other Fields:** OFF
- **Fields to Set:**

| Name | Type | Value |
|---|---|---|
| `ok` | Boolean | `true` |
| `deeplink` | String | `{{ $json.data.usuario.login_auto }}` |
| `nome_aluno` | String | `{{ $json.data.usuario.nome }}` |
| `mensagem` | String | `` (vazio) |

---

## Nó 4 — Respond Sucesso

- **Tipo:** Respond to Webhook
- **Respond With:** JSON
- **Response Body:** `{{ $json }}`
- **Response Code:** 200

---

## Nó 5 — Respond Não Encontrado

- **Tipo:** Respond to Webhook
- **Respond With:** JSON
- **Response Body:**
  ```json
  {
    "ok": false,
    "deeplink": "",
    "nome_aluno": "",
    "mensagem": "Usuário não encontrado"
  }
  ```
- **Response Code:** 200

> Importante: 200, NÃO 409. O ponto do n8n é justamente esconder o erro HTTP da Cademi para a Awsales nunca interpretar como falha técnica de tool.

---

## Teste manual

1. No n8n, executar o webhook em modo "Listen for test event"
2. Disparar via Awsales (ou curl):
   ```bash
   curl -X POST https://n8n-dev.awsales.io/webhook/cr-deep-link-cademi \
     -H "Content-Type: application/json" \
     -d '{"email":"teste@awsales.io"}'
   ```
3. Resposta esperada com email válido:
   ```json
   {
     "ok": true,
     "deeplink": "https://fundamentosdasintonizacao.cademi.com.br/auth/login?crstk=...",
     "nome_aluno": "Teste Awsales",
     "mensagem": ""
   }
   ```
4. Resposta esperada com email inexistente:
   ```json
   {
     "ok": false,
     "deeplink": "",
     "nome_aluno": "",
     "mensagem": "Usuário não encontrado"
   }
   ```

---

## Quando precisar mudar de cliente Cademi

Cada cliente Cademi tem sua própria base URL e Bearer Token. Para replicar para outro cliente:

1. Duplicar o workflow no n8n e renomear o path do Webhook (ex: `cr-deep-link-cademi-XYZ`)
2. Criar credencial nova `Cademi XYZ - Bearer` com o token do cliente novo
3. Trocar a URL do nó "Buscar Usuario Cademi" para a base URL do cliente novo
4. Criar conexão + tool nova na Awsales apontando para o novo webhook
