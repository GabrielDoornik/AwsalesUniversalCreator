# Tool Deep Link Cademi — Configuração na Awsales

Tool para gerar link de acesso direto (auto-login) do aluno à área de membros Cademi do cliente Fundamentos da Sintonização.

---

## Plataforma Cademi — Dados da API

- **Documentação oficial:** https://api-docs.cademi.com.br/
- **Base URL do cliente:** `https://fundamentosdasintonizacao.cademi.com.br/api/v1/`
- **Autenticação:** Bearer Token
- **Chave de API:** `061390ca-a7e3-476f-9263-07c55990510f`
- **Painel:** https://fundamentosdasintonizacao.cademi.com.br/dashboard/configuracao/administrador → aba **Chaves de API**

### Endpoint usado

`GET /usuario/{usuario_email_id_doc}` — retorna 1 usuário pelo ID, email ou documento.

**Resposta confirmada (200 OK):**
```json
{
    "success": true,
    "code": 200,
    "data": {
        "usuario": {
            "id": 34056678,
            "nome": "Teste Awsales",
            "email": "teste@awsales.io",
            "doc": null,
            "celular": null,
            "login_auto": "https://fundamentosdasintonizacao.cademi.com.br/auth/login?crstk=MS06MDA4Njo4NzY2NTA0MzpidmVuaGZoOjpvcDZyMjNyOTRzbnNzNDFyNHExb25vbzE0MHAwNW5yMg%3D%3D",
            "login_crstk": "MS06MDA4Njo4NzY2NTA0MzpidmVuaGZoOjpvcDZyMjNyOTRzbnNzNDFyNHExb25vbzE0MHAwNW5yMg%3D%3D",
            "gratis": false,
            "pontos": 0,
            "criado_em": "2026-05-05T15:44:41-03:00",
            "ultimo_acesso_em": null
        }
    }
}
```

Campo principal a extrair: **`data.usuario.login_auto`** — URL de auto-login pronta pra enviar no WhatsApp.

> Observação: a resposta real traz 2 campos não documentados na doc oficial — `login_crstk` (só o token, sem URL) e `pontos`. O `login_crstk` é útil se quisermos construir URLs custom no futuro.

### Códigos de erro observados

- **200** — sucesso
- **409** — "Erro de negócio" (na prática: email não cadastrado no Cademi). A Awsales mostra como `HTTP Error: 409 Conflict` sem body — tratar no checkpoint pedindo confirmação do email.

---

## Parte 1 — Conexão na Awsales

Caminho: Habilidades Personalizadas → Nova Conexão

| Campo | Valor |
|---|---|
| Nome da conexão | `Cademi - Fundamentos da Sintonização` |
| Tipo de Autenticação | Bearer Token |
| Token | `061390ca-a7e3-476f-9263-07c55990510f` |
| Organização | (selecionar cliente Fundamentos da Sintonização) |

---

## Parte 2 — Tool HTTP

### Tela 1 — Nome e Descrição

- **Nome:** `Gerar Deep Link de Acesso Cademi`
- **Descrição (para a IA):**
  ```
  Use esta tool para gerar o link de acesso direto do aluno à área de membros Cademi (login automático sem senha). Chame esta tool quando o lead solicitar acesso à plataforma, esquecer a senha, ou pedir para entrar no curso. Informe o email cadastrado pelo aluno na compra.
  ```

### Tela 2 — Configuração da Requisição

- **Método:** GET
- **URL:** `https://fundamentosdasintonizacao.cademi.com.br/api/v1/usuario/{email}`
- **Headers Customizados:** (nenhum — Bearer já vem da conexão)
- **Parâmetros (path):**

| Nome | Tipo | Fonte | Req | Descrição para IA |
|---|---|---|---|---|
| email | String | IA | ✓ | Email do aluno cadastrado no Cademi (mesmo email usado na compra do produto) |

### Tela 3 — Mapeamento de Resposta

Executar com email real e mapear:
- `data.usuario.login_auto` — link de acesso direto (variável principal)
- `data.usuario.nome` — nome do aluno (para personalizar mensagem)
- `success` — flag de sucesso

---

## Handle resultante

`@gerar_deep_link_de_acesso_cademi`

Uso correto no checkpoint (formato exato do guia):

```
Utilize a tool para gerar o link de acesso direto do aluno @gerar_deep_link_de_acesso_cademi
```

Variáveis mapeadas disponíveis pra usar no checkpoint/mensagens:
- `{{login_auto}}` — URL completa de auto-login
- `{{nome_aluno}}` — nome do aluno cadastrado no Cademi

---

## Tratamento de erro no Checkpoint

Como não há handoff configurado na campanha, instruir no checkpoint:

> Se a tool retornar erro ou não encontrar o usuário, peça ao lead para confirmar o email exato usado na compra (sugerir buscar no email da Hotmart/plataforma de checkout).

---

## Status

- [x] Chave de API gerada
- [x] Conexão criada na Awsales
- [x] Tool criada na Awsales
- [x] Teste manual com `teste@awsales.io` retornou 200 OK
- [x] Mapeamento de resposta configurado (`login_auto`, `nome_aluno`)
- [x] Handle anotado (`@gerar_deep_link_de_acesso_cademi`)
- [ ] Tool referenciada no checkpoint da campanha
