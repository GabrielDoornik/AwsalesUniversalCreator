# Tool Consultar Acessos Cademi — Configuração na Awsales

Tool unificada que consulta todas as instâncias Cademi do cliente (EQJC + Ruptura) a partir de um único email e retorna a lista de cursos onde o aluno tem acesso ativo, com deeplink de auto-login de cada um.

**Estratégia adotada:** criação de uma **tool NOVA em paralelo** na Awsales (não edição da antiga). A tool antiga `Gerar Deep Link Cademi via n8n` (handle `@gerar_deep_link_cademi_via_n8n`) continua funcionando enquanto a nova é validada. Quando o checkpoint for atualizado pra usar a nova, a antiga pode ser deletada.

---

## Parte 1 — Conexão na Awsales

Conexão usada: `CR Treinamentos - Deep Link Cademi n8n` (mesma da tool antiga — tipo None, organização CR Treinamentos). Como a conexão é só agrupamento sem auth, dá pra ter ambas as tools (antiga e nova) dentro dela.

Os Bearer Tokens das instâncias Cademi (EQJC + Ruptura) vivem dentro dos nós HTTP do n8n, não na Awsales.

---

## Parte 2 — Criação da Tool nova

### Tela 1 — Nome e Descrição

- **Nome:** `Consultar Acessos Cademi`
- **ID (auto):** `consultar_acessos_cademi`
- **Descrição (para a IA):**
  ```
  Use esta tool para consultar em quais cursos Cademi o aluno tem acesso ativo e obter o link de acesso direto (login automático sem senha) de cada um. Chame esta tool quando o lead solicitar acesso à plataforma, esquecer a senha, ou pedir para entrar no curso. Informe o email cadastrado pelo aluno na compra. A tool retorna a lista de cursos onde o aluno está matriculado com o respectivo deeplink.
  ```

### Tela 2 — Configuração da Requisição

- **Método:** POST
- **URL (durante teste no dev):** `https://n8n-dev.awsales.io/webhook/cr-cademi-multi`
- **URL (depois do push para prod):** `https://flow.awsales.io/webhook/cr-cademi-multi`
- **Headers Customizados:** nenhum
- **Body (JSON):**

| Nome | Tipo | Fonte | Req | Descrição para IA |
|---|---|---|---|---|
| email | String | IA | ✓ | Email do aluno cadastrado no Cademi (mesmo email usado na compra do curso) |

### Tela 3 — Mapeamento de Resposta

| Nome para usar depois | Caminho na resposta |
|---|---|
| `ok` | `ok` |
| `qtd_cursos` | `qtd_cursos` |
| `nome_aluno` | `nome_aluno` |
| `cursos` | `cursos` |
| `mensagem` | `mensagem` |

> Recomendado: usar o botão "Executar e Mapear Automaticamente" com um email real (ex: `fefegood13@gmail.com`, que retorna EQJC) para a plataforma detectar os campos automaticamente. Foi feito assim na validação inicial em 2026-05-20.

---

## Contrato de resposta do webhook n8n

Sempre HTTP 200. Detalhes completos em `Fluxo n8n - cr-cademi-multi.md`.

**Aluno com 1 curso:**
```json
{
  "ok": true,
  "qtd_cursos": 1,
  "nome_aluno": "João Silva",
  "cursos": [
    { "id": "eqjc", "nome": "Os Exercícios Quânticos de Jesus Cristo", "deeplink": "https://exerciciosquanticos.cademi.com.br/auth/login?crstk=..." }
  ],
  "mensagem": ""
}
```

**Aluno com múltiplos cursos:**
```json
{
  "ok": true,
  "qtd_cursos": 2,
  "nome_aluno": "João Silva",
  "cursos": [
    { "id": "ruptura", "nome": "A Ruptura", "deeplink": "..." },
    { "id": "eqjc", "nome": "Os Exercícios Quânticos de Jesus Cristo", "deeplink": "..." }
  ],
  "mensagem": ""
}
```

> A ordem dos cursos no array é variável. O checkpoint deve iterar o array ou filtrar por `id`, nunca assumir índice fixo.

**Aluno não encontrado:**
```json
{
  "ok": false,
  "qtd_cursos": 0,
  "nome_aluno": "",
  "cursos": [],
  "mensagem": "Usuário não encontrado em nenhum curso"
}
```

**Erros técnicos (sem email, exceção interna):** também retornam HTTP 200 com `ok: false` e mensagem específica — nunca propagam erro real. Ver "Filosofia anti-handoff" em `Fluxo n8n - cr-cademi-multi.md`.

---

## Handle resultante

`@consultar_acessos_cademi`

Uso correto no checkpoint:

```
Utilize a tool para consultar os acessos do aluno @consultar_acessos_cademi
```

Variáveis disponíveis no checkpoint após a chamada:
- `{{ok}}` — `true` se encontrou pelo menos um curso, `false` caso contrário
- `{{qtd_cursos}}` — número de cursos onde o aluno tem acesso
- `{{nome_aluno}}` — nome do aluno (vazio se `ok=false`)
- `{{cursos}}` — array com `{id, nome, deeplink}` de cada curso
- `{{mensagem}}` — mensagem de erro/contexto (vazio se `ok=true`)

---

## Tratamento no Checkpoint

Lógica recomendada na Seção 7 (Protocolo de Resolução de Acesso) da campanha de Suporte EQJC:

1. **Se `ok=false` (qtd_cursos=0):** seguir Nível 2 (confirmar email com o aluno).
2. **Se `ok=true` e `qtd_cursos=1`:** enviar o deeplink direto, identificando o curso.
   Ex: "Achei seu acesso ao curso [cursos[0].nome]. Clica aqui pra entrar: [cursos[0].deeplink]"
3. **Se `ok=true` e `qtd_cursos≥2`:** perguntar qual curso o aluno quer acessar agora, listando os nomes retornados (iterando o array, não assumindo posição).
   Ex: "Você tem acesso a mais de um curso aqui. Em qual você quer entrar agora: [cursos[0].nome] ou [cursos[1].nome]?"
   Após resposta, enviar o deeplink correspondente (buscar no array pelo `id` ou pela menção do aluno).
4. **Curto-circuito:** se o aluno mencionou explicitamente o curso ANTES da consulta (ex: "não consigo entrar no Ruptura") e o curso aparece na lista, enviar direto sem perguntar.

---

## Ordem da migração (janela curta)

Como a tool nova existe em paralelo à antiga, a migração pode ser feita em sequência tranquila:

1. **Push do workflow `cr-cademi-multi`** do n8n dev para prod.
2. **Atualizar URL da tool na Awsales** de `n8n-dev.awsales.io` para `flow.awsales.io` (Tela 2 da tool).
3. **Testar a tool em prod** pelo botão "Executar Requisição" — confirmar que retorna o contrato novo.
4. **Atualizar o checkpoint Suporte EQJC** na Awsales:
   - Substituir todas as menções a `@gerar_deep_link_cademi_via_n8n` por `@consultar_acessos_cademi`
   - Substituir Seção 7 inteira pela nova versão (com roteamento por curso e iteração de array)
   - Atualizar variável `link_area_de_membros_A_Ruptura` para o link Cademi novo
5. **Monitorar 1-7 dias** os atendimentos de acesso. Validar:
   - Aluno só do EQJC continua recebendo deeplink correto
   - Aluno do Ruptura recebe deeplink Cademi (não mais Curseduca)
   - Aluno com 2 cursos é perguntado qual quer
6. **Limpeza (depois de 7 dias estável):**
   - Deletar tool antiga `Gerar Deep Link Cademi via n8n` na Awsales
   - Desativar/deletar workflow antigo `cr-deep-link-cademi` no n8n

Idealmente fora de horário de pico no passo 4 (atualização do checkpoint).

---

## Status

- [x] Workflow n8n `cr-cademi-multi` criado e testado no dev (ver `Fluxo n8n - cr-cademi-multi.md`)
- [x] Tool nova `Consultar Acessos Cademi` criada na Awsales (conexão CR Treinamentos - Deep Link Cademi n8n)
- [x] Mapeamento de resposta detectado automaticamente
- [x] Testes em dev passaram nos 4 cenários
- [ ] Push do workflow para prod
- [ ] URL da tool na Awsales atualizada para `flow.awsales.io`
- [ ] Seção 7 do checkpoint reformulada (roteamento por curso)
- [ ] Variável `link_area_de_membros_A_Ruptura` atualizada para Cademi
- [ ] Checkpoint salvo em prod e atendimentos validados
- [ ] Tool antiga e workflow antigo deletados (após 7 dias estável)
