# Tool Deep Link Cademi n8n — Configuração na Awsales

Tool reformulada para chamar um webhook do n8n em vez de bater direto na API Cademi. O n8n encapsula a chamada à Cademi e SEMPRE retorna HTTP 200 com JSON estruturado, eliminando o erro 409 que hoje vira `HTTP Error: 409 Conflict` na Awsales.

---

## Parte 1 — Conexão na Awsales

Caminho: Habilidades Personalizadas → Nova Conexão

| Campo | Valor |
|---|---|
| Nome da conexão | `CR Treinamentos - Deep Link Cademi n8n` |
| Tipo de Autenticação | None (sem auth — webhook n8n é público) |
| Organização | CR Treinamentos |

A conexão antiga `Cademi - Fundamentos da Sintonização` (Bearer Token) **não é mais usada pela tool da Awsales**. O Bearer Token agora vive dentro do nó HTTP do n8n.

---

## Parte 2 — Tool HTTP

### Tela 1 — Nome e Descrição

- **Nome:** `Gerar Deep Link de Acesso Cademi`
- **ID:** `gerar_deep_link_de_acesso_cademi`
- **Descrição (para a IA):**
  ```
  Use esta tool para gerar o link de acesso direto do aluno à área de membros Cademi (login automático sem senha). Chame esta tool quando o lead solicitar acesso à plataforma, esquecer a senha, ou pedir para entrar no curso. Informe o email cadastrado pelo aluno na compra.
  ```

### Tela 2 — Configuração da Requisição

- **Método:** POST
- **URL:** `https://n8n-dev.awsales.io/webhook/cr-deep-link-cademi`
- **Headers Customizados:** (nenhum)
- **Body (JSON):**

| Nome | Tipo | Fonte | Req | Descrição para IA |
|---|---|---|---|---|
| email | String | IA | ✓ | Email do aluno cadastrado no Cademi (mesmo email usado na compra do produto) |

### Tela 3 — Mapeamento de Resposta

| Nome para usar depois | Caminho na resposta |
|---|---|
| `ok` | `ok` |
| `login_auto` | `deeplink` |
| `nome_aluno` | `nome_aluno` |
| `mensagem` | `mensagem` |

---

## Contrato de resposta do webhook n8n

Sempre HTTP 200, com o seguinte JSON:

**Sucesso (email encontrado):**
```json
{
  "ok": true,
  "deeplink": "https://fundamentosdasintonizacao.cademi.com.br/auth/login?crstk=...",
  "nome_aluno": "Teste Awsales",
  "mensagem": ""
}
```

**Falha (email não encontrado / erro 409 da Cademi):**
```json
{
  "ok": false,
  "deeplink": "",
  "nome_aluno": "",
  "mensagem": "Usuário não encontrado"
}
```

---

## Handle resultante

`@gerar_deep_link_de_acesso_cademi`

Uso correto no checkpoint:

```
Utilize a tool para gerar o link de acesso direto do aluno @gerar_deep_link_de_acesso_cademi
```

Variáveis disponíveis no checkpoint após a chamada:
- `{{ok}}` — `true` ou `false`
- `{{login_auto}}` — URL completa de auto-login (vazio se `ok=false`)
- `{{nome_aluno}}` — nome do aluno (vazio se `ok=false`)
- `{{mensagem}}` — mensagem de erro (vazio se `ok=true`)

---

## Tratamento de erro no Checkpoint

Em vez de tratar `HTTP Error: 409 Conflict`, o checkpoint lê `ok=false` como caminho conversacional normal:

> Se `ok=false`, peça ao lead para confirmar o email exato usado na compra (sugerir buscar no email da Hotmart/plataforma de checkout) e tente de novo com o email confirmado.

---

## Status

- [ ] Workflow `cr-deep-link-cademi` criado no n8n (ver `Fluxo n8n - cr-deep-link-cademi.md`)
- [ ] Conexão `CR Treinamentos - Deep Link Cademi n8n` criada na Awsales
- [ ] Tool `Gerar Deep Link de Acesso Cademi` reconfigurada (POST + webhook + body JSON)
- [ ] Mapeamento de resposta atualizado
- [ ] Checkpoint da campanha atualizado para ler `{{ok}}` e tratar erro conversacionalmente
