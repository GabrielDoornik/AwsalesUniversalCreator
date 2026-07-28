# Curseduca API — Deep Links

Base URL: `https://prof.curseduca.pro`

Documentação extraída do Swagger UI em 07/04/2026.

---

## Autenticação

A API da Curseduca exige **dois headers** de autenticação em todas as chamadas:

| Header | Tipo | Descrição |
|--------|------|-----------|
| `api_key` | Header customizado | API Key da plataforma |
| `Authorization` | Bearer Token | Access Token do administrador (formato: `Bearer {token}`) |

**Onde encontrar as credenciais:**
No painel da Curseduca: clique no avatar do admin (canto superior direito) → "Credenciais API" → Selecione o administrador → copie API Key e Access Token.

---

## POST /api/v1/deep-links

**Descrição:** Gerar novo deeplink token (público)

**Parameters:** No parameters (Swagger não exibe body nem query params)

**Responses:**

| Code | Descrição |
|------|-----------|
| 201  | Token gerado com sucesso |
| 400  | Parâmetros obrigatórios faltando |
| 401  | API Key inválida |

**Response 201:**
```json
{
  "token": "string"
}
```

**Response 400:**
```json
{
  "statusCode": 0,
  "message": "string",
  "error": "string"
}
```

**Response 401:**
```json
{
  "statusCode": 0,
  "message": "string",
  "error": "string"
}
```

---

## POST /api/v1/deep-links/me

**Descrição:** Generate a deep link for the authenticated user

**Parameters:** No parameters

**Responses:**

| Code | Descrição |
|------|-----------|
| 201  | Token generated successfully |
| 400  | Missing required parameters |
| 401  | Invalid API key |
| 403  | Tenant is not available for the authenticated user |
| 404  | Authenticated member not found |

**Response 201:**
```json
{
  "token": "string"
}
```

**Response 400/401:**
```json
{
  "statusCode": 0,
  "message": "string",
  "error": "string"
}
```

---

## GET /deep-links/{token}

**Descrição:** Validar deeplink token

**Parameters:**

| Nome  | Tipo   | Local | Obrigatório | Descrição |
|-------|--------|-------|-------------|-----------|
| token | string | path  | Sim         | Token gerado pelo POST |

**Responses:**

| Code | Descrição |
|------|-----------|
| 200  | Token validado com sucesso |
| 401  | API Key inválida |
| 404  | Token não encontrado |

**Response 200:**
```json
{
  "url": "string",
  "accessToken": "string"
}
```

**Response 401/404:**
```json
{
  "statusCode": 0,
  "message": "string",
  "error": "string"
}
```

---

## Resumo do fluxo

1. Chamar `POST /api/v1/deep-links` → recebe `{ "token": "abc123" }`
2. O token gera uma URL de acesso direto (sem login) para o membro
3. Validação opcional via `GET /deep-links/{token}` → retorna `{ "url": "...", "accessToken": "..." }`

## Observações importantes

- O Swagger mostra "No parameters" no POST, mas o response 400 diz "Parâmetros obrigatórios faltando" — isso indica que provavelmente existe um body ou query param não documentado no Swagger (possivelmente email, memberId ou UUID do membro). Testar na prática.
- A autenticação usa dois headers simultâneos: `api_key` (header customizado) e `Authorization: Bearer {access-token}`.
- As credenciais ficam no painel da Curseduca em: Avatar do admin → Credenciais API → Selecionar administrador.
