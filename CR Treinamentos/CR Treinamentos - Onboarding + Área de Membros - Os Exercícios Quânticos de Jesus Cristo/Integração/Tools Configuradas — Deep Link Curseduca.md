# Tools Configuradas — Deep Link Curseduca

## Conexão

- **Nome:** Curseduca CR Treinamentos
- **Tipo de Autenticação:** Bearer Token
- **Token:** Access Token JWT do admin
- **Organização:** CR Treinamentos

---

## Tool 1 — Buscar Membro por Email

- **Handle:** `@buscar_membro_por_email`
- **Método:** GET
- **URL:** `https://prof.curseduca.pro/api/v1/members/by`

### Headers Customizados

| Nome | Valor |
|---|---|
| `api_key` | `082e7869190a6a99bfcc829058fa58044d077192` |

### Query Parameters

| Nome | Tipo | Fonte | Req | Descrição para IA |
|---|---|---|---|---|
| `email` | String | IA | Sim | Email do membro na Curseduca. Ex: joao@email.com |

### Mapeamento de Resposta

| Nome da variável | Caminho na resposta |
|---|---|
| `member_id` | `id` |
| `nome_membro` | `name` |

### Exemplo de resposta

```json
{
  "uuid": "168775ae-5767-4c7e-9a63-5f9af512e477",
  "id": 8191,
  "name": "Pedro Leite",
  "email": "pedro.leite@awsales.io",
  "image": null,
  "lastLogin": "2026-04-07T17:13:18.000Z",
  "phones": {
    "mobile": {
      "country": null,
      "area": null,
      "number": null
    }
  }
}
```

---

## Tool 2 — Gerar Deep Link Curseduca

- **Handle:** `@gerar_deep_link_curseduca`
- **Método:** POST
- **URL:** `https://prof.curseduca.pro/api/v1/deep-links`

### Headers Customizados

| Nome | Valor |
|---|---|
| `api_key` | `082e7869190a6a99bfcc829058fa58044d077192` |

### Body Schema (JSON)

| Nome do Campo | Tipo | Fonte | Req | Descrição para IA |
|---|---|---|---|---|
| `memberId` | Number | IA | Sim | ID numérico do membro na Curseduca |

### Mapeamento de Resposta

| Nome da variável | Caminho na resposta |
|---|---|
| `deep_link_token` | `token` |

### Exemplo de resposta

```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

---

## URL Final do Deep Link

O agente deve montar a URL concatenando o subdomínio do cliente + `/deeplink/` + o token:

```
https://crtreinamentos.curseduca.pro/deeplink/{deep_link_token}
```

---

## Fluxo no Checkpoint

1. Buscar o membro pelo email:
   ```
   Utilize a tool para buscar o membro pelo email @buscar_membro_por_email
   ```

2. Gerar o deep link com o memberId retornado:
   ```
   Utilize a tool para gerar o deep link do membro @gerar_deep_link_curseduca
   ```

3. Montar a URL: `https://crtreinamentos.curseduca.pro/deeplink/{deep_link_token}`

4. Enviar a URL ao membro no WhatsApp.

---

## Observações

- A documentação do Swagger não lista o body do POST /api/v1/deep-links, mas o campo obrigatório é `memberId` (Number). Descoberto via teste direto na API.
- A API exige dois headers de autenticação: `Authorization: Bearer {token}` (na conexão) e `api_key` (nos Headers Customizados de cada tool).
- O endpoint `GET /api/v1/members/by?email=...` não está documentado no Swagger de Deep Links, mas existe e funciona. Foi encontrado via `/docs-json`.
- O domínio do deep link é `crtreinamentos.curseduca.pro` (subdomínio do cliente), não `prof.curseduca.pro` (que é a API).
