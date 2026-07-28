# Tools CRM MG Capital — Configuração na AWSales (auditoria)

Documento de referência das tools personalizadas das campanhas de Recuperação (Refinanciamento e Saque Complementar). Capturado dos prints da plataforma em 2026-06-25 para auditar por que a tool não está funcionando no n8n.

---

## Conexão

- Nome da conexão: `MG Capital - CRM - Telefone`
- Tools configuradas nessa conexão: 2 (`consultar_proposta_por_telefone` e `consultar_proposta_por_cpf`)

> Observação: as DUAS tools apontam para a MESMA URL de webhook n8n (ver abaixo). A única diferença é o campo enviado no body (`telefone` vs `cpf`). O fluxo n8n precisa tratar os dois casos no mesmo webhook.

---

## Tool 1 — Consultar proposta por telefone

### Tela 1 — Nome e Descrição
- Nome da Tool: `Consultar proposta por telefone`
- ID (handle): `consultar_proposta_por_telefone`
- Descrição (para a IA):
  > Consulta a proposta de crédito ativa de um cliente pelo número de telefone. Use esta tool quando precisar obter os dados do contrato do lead: o produto, o link do contrato, o valor, o status e a ação a ser passada ao cliente. Retorna também o nome e o CPF do cliente.

### Tela 2 — Requisição
- Método: `POST`
- URL do Endpoint: `https://n8n.prod.awsales.io/webhook/82b9bb4c-75ba-46c5-950d-20d50b09fad9`
- Headers Customizados: 0 (nenhum)
- Query Parameters: 0 (nenhum)
- Body Schema (JSON): 1 campo

| Nome do Campo | Tipo | Fonte | Req | Descrição para IA |
|---|---|---|---|---|
| `telefone` | String | IA | NÃO marcado | "Número de telefone do cliente com có[...]" (texto cortado no print; provavelmente "com código do país" / DDI) |

> Atenção auditoria: o checkbox `Req` do campo `telefone` aparece DESMARCADO no print. Confirmar se isso é intencional.

### Tela 3 — Mapeamento de Resposta (Campos Mapeados)
Campos extraídos do JSON de retorno do n8n (Nome para usar depois → Caminho na resposta / JSON Path):

| Nome para usar depois | Caminho na resposta |
|---|---|
| `produto` | `produto` |
| `link` | `link` |
| `status` | `status` |
| `acaoCliente` | `acaoCliente` |
| `valor` | `valor` |
| `banco` | `banco` |
| `nomeCliente` | `nomeCliente` |
| `cpf` | `cpf` |

> Nota: o print pode ter mais campos abaixo de `cpf` (a lista estava com rolagem). Confirmar se há mais algum.

---

## Tool 2 — Consultar proposta por CPF

### Tela 1 — Nome e Descrição
- Nome da Tool: `Consultar proposta por CPF`
- ID (handle): `consultar_proposta_por_cpf`
- Descrição (para a IA):
  > Consulta a proposta de crédito ativa de um cliente pelo cpf. Use esta tool quando precisar obter os dados do contrato do lead: o produto, o link do contrato, o valor, o status e a ação a ser passada ao cliente. Retorna também o nome e o CPF do cliente.

### Tela 2 — Requisição
- Método: `POST`
- URL do Endpoint: `https://n8n.prod.awsales.io/webhook/82b9bb4c-75ba-46c5-950d-20d50b09fad9` (MESMA URL da Tool 1)
- Headers Customizados: 0 (nenhum)
- Query Parameters: 0 (nenhum)
- Body Schema (JSON): 1 campo

| Nome do Campo | Tipo | Fonte | Req | Descrição para IA |
|---|---|---|---|---|
| `cpf` | String | IA | SIM (marcado) | "CPF do cliente, somente dígitos, sem p[...]" (texto cortado no print; provavelmente "sem pontuação") |

### Tela 3 — Mapeamento de Resposta (Campos Mapeados)
Idêntico ao da Tool 1 (Nome para usar depois → Caminho na resposta / JSON Path):

| Nome para usar depois | Caminho na resposta |
|---|---|
| `produto` | `produto` |
| `link` | `link` |
| `status` | `status` |
| `acaoCliente` | `acaoCliente` |
| `valor` | `valor` |
| `banco` | `banco` |
| `nomeCliente` | `nomeCliente` |
| `cpf` | `cpf` |

---

## Comparação rápida das duas tools

| Item | Tool 1 (telefone) | Tool 2 (cpf) |
|---|---|---|
| Handle | `consultar_proposta_por_telefone` | `consultar_proposta_por_cpf` |
| Método | POST | POST |
| URL webhook | `/webhook/82b9bb4c-...09fad9` | `/webhook/82b9bb4c-...09fad9` (IGUAL) |
| Headers | 0 | 0 |
| Query params | 0 | 0 |
| Body | `telefone` (String, IA) | `cpf` (String, IA) |
| Req do campo | DESMARCADO | MARCADO |
| Campos mapeados | produto, link, status, acaoCliente, valor, banco, nomeCliente, cpf | (idênticos) |

---

## Observações para a auditoria (a confirmar com erro + doc do n8n)

1. CONFIRMADO: ambas as tools usam exatamente a MESMA URL de webhook (`/webhook/82b9bb4c-75ba-46c5-950d-20d50b09fad9`). O n8n recebe ora `{ "telefone": "..." }`, ora `{ "cpf": "..." }`, e precisa ramificar internamente por qual campo chegou. Se o fluxo n8n só trata um dos campos (ex: só `telefone`), a consulta por CPF quebra silenciosamente. Suspeito nº 1 para investigar no erro.
2. O checkpoint das duas campanhas espera os campos de retorno: `produto`, `valor`, `link`, `status`, `nomeCliente`, `acaoCliente` (e usa `produto` para rotear REFIN/RCC). O mapeamento cobre todos esses + `banco` + `cpf`. Cobertura OK do lado da plataforma.
3. O checkpoint trata o "não achou" como `status: nao_encontrado`. Confirmar se o n8n devolve esse valor literal no campo `status` e SEMPRE 200 OK (sem erro HTTP), senão o fallback por CPF e a derivação para suporte não disparam corretamente.
4. Inconsistência de `Req`: o campo `telefone` está com `Req` DESMARCADO e o `cpf` com `Req` MARCADO. Verificar se a IA pode chamar a tool de telefone sem enviar o número (corpo vazio → n8n não encontra → comportamento indefinido).
5. Nenhum header de autenticação nas duas tools (Headers Customizados = 0). Se o webhook n8n exigir auth/token, faltaria aqui — confirmar na doc do n8n.
6. Descrições de IA truncadas nos prints (`telefone`: "...com có[...]"; `cpf`: "...sem p[...]"). Confirmar o texto completo, principalmente o FORMATO esperado do telefone (com/sem DDI, com/sem +55), porque divergência de formato entre o que a IA manda e o que o CRM tem cadastrado é causa clássica de "não encontrado".
