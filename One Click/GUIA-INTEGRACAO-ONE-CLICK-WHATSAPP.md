# Guia de Integração — One-Click WhatsApp

Documento de contrato de integração do serviço `service-one-click-whatsapp`.
Público: time de integração, produto e parceiros.

Este guia explica **como chamar o serviço** e **o que esperar de volta**. Ele descreve as rotas, os campos de entrada, os formatos de resposta e as regras de negócio aplicadas. Não cobre detalhes internos de implementação.

---

## 1. Visão geral

O **One-Click WhatsApp** permite que um cliente que já comprou antes na Assiny faça uma **nova compra em um único toque**, direto da conversa no WhatsApp, sem precisar digitar dados de cartão novamente.

Na prática, a integração responsável pela conversa no WhatsApp (o chatbot) chama este serviço passando quem é o cliente e qual checkout ele quer pagar. O serviço identifica o cliente, recupera o cartão que ele já tem salvo (no caso de crédito) ou prepara um Pix, monta a transação e a envia para o motor de pagamentos da Assiny (o **bff-pay**). A resposta diz se a transação foi **criada** e devolve o que o chatbot precisa para continuar a conversa (o identificador da transação e, no Pix, o código copia-e-cola).

> **Importante desde já:** a resposta deste serviço confirma que a **transação foi criada**. A confirmação final de pagamento (aprovado / pago) chega **depois**, de forma assíncrona, por webhook do gateway — fora do escopo deste serviço. Veja a seção 7.

---

## 2. Autenticação

Toda chamada à rota principal exige autenticação por **JWT da organização**. Cada organização tem seu próprio token.

São obrigatórios **dois cabeçalhos**:

| Cabeçalho | Obrigatório | Descrição |
|---|---|---|
| `Authorization` | Sim | Token no formato `Bearer <jwt>`. |
| `X-Organization-Id` | Sim | Identificador da organização. Precisa bater com o `organization_id` que está dentro do token. |

Regras de validação aplicadas:

- Se faltar o cabeçalho `Authorization` → erro.
- Se faltar o cabeçalho `X-Organization-Id` → erro.
- Se o token for inválido, malformado ou assinado de forma inesperada → erro.
- Se o `organization_id` de dentro do token **não bater** com o valor do cabeçalho `X-Organization-Id` → erro (`organization_id mismatch`).

Para emitir o token de uma organização, use a rota auxiliar descrita na seção 4.

> **Nota para o integrador:** falhas de autenticação retornam erro com o motivo descrito no **corpo** da resposta (ex.: `missing Authorization header`, `Invalid token`, `organization_id mismatch`). Recomendação: **trate qualquer resposta de erro inspecionando o corpo**, e não apenas o código HTTP.

---

## 3. Rota principal — Criar transação One-Click

```
POST /v1/whatsapp/
```

Cria uma transação one-click para um cliente, a partir de um checkout existente. Suporta **crédito** (cartão salvo) e **Pix**.

### 3.1. Cabeçalhos

| Cabeçalho | Obrigatório | Valor |
|---|---|---|
| `Authorization` | Sim | `Bearer <jwt>` |
| `X-Organization-Id` | Sim | Identificador da organização |
| `Content-Type` | Sim | `application/json` |
| `X-Dry-Run` | Não | Modo simulação. Veja 3.4. |

### 3.2. Corpo da requisição (JSON)

| Campo | Tipo | Obrigatório | Descrição |
|---|---|---|---|
| `client_id` | string (UUID) | Sim | Identificador do cliente. Deve ser um UUID válido. |
| `payment_type` | string | Sim | Forma de pagamento. Aceita apenas `"CREDIT"` ou `"PIX"`. |
| `installments` | inteiro | Sim | Número de parcelas. Entre `1` e `12`. No Pix é sempre tratado como `1` internamente (veja regras). |
| `short_funnel_id` | string | Sim | Identificador do funil/checkout de origem. |
| `node_edge_id` | string | Sim | Identificador do nó/etapa de origem. |
| `phone` | string | Não | Telefone do cliente no formato BR (ex.: `"5511999999999"`). É **best-effort**: no Pix (Easy Pay) o bff-pay preenche os dados do cliente a partir da base, então o campo pode ser omitido. |
| `tracks` | objeto | Não | Dados de origem/atribuição (UTMs e afins). Quando ausente, o serviço usa `"direct"` como padrão. Veja 3.3. |

### 3.3. Objeto `tracks` (opcional)

Todos os campos são strings opcionais:

`utm_source`, `utm_medium`, `utm_campaign`, `utm_term`, `utm_content`, `referrer`, `trk_src`, `trk_cpg`, `trk_adgp`, `trk_ad`.

### 3.4. Modo simulação (Dry-Run)

Para validar uma chamada **sem cobrar nada**, envie o cabeçalho de simulação:

- `X-Dry-Run: true` (também aceita `1`, `yes`, `on`; e ainda o cabeçalho alternativo `Dry-Run`).

Em dry-run, **todo o fluxo roda** (validações de entrada, regras de negócio, montagem do payload), mas **nenhuma transação é criada e nada é cobrado**. A resposta mostra exatamente o que **seria** enviado ao bff-pay. Veja o formato na seção 5.

### 3.5. Exemplo — CRÉDITO (cartão salvo)

No crédito, o serviço usa o **cartão salvo do cliente** (card-on-file): pagamento automático, sem CVV e sem 3DS.

```bash
curl -X POST "https://<host>/v1/whatsapp/" \
  -H "Authorization: Bearer <jwt>" \
  -H "X-Organization-Id: <organization_id>" \
  -H "Content-Type: application/json" \
  -d '{
    "client_id": "1f9a2c44-8b3e-4f1d-9a77-2c5e0d6b1a30",
    "payment_type": "CREDIT",
    "installments": 3,
    "short_funnel_id": "funnel_abc123",
    "node_edge_id": "node_xyz789",
    "phone": "5511999999999",
    "tracks": {
      "utm_source": "whatsapp",
      "utm_medium": "chatbot",
      "utm_campaign": "reativacao_junho"
    }
  }'
```

Resposta de sucesso (transação criada):

```json
{
  "transactionId": "8c1e0a2b-3d4f-5a6b-7c8d-9e0f1a2b3c4d"
}
```

> A aprovação ou recusa final do cartão chega **depois**, por webhook. Esta resposta confirma apenas a **criação** da transação. Veja também o caso de **recusa "soft"** na seção 5.

### 3.6. Exemplo — PIX

No Pix, **não há cartão**. O bff-pay preenche os dados do cliente e do endereço a partir da base (Easy Pay). O número de parcelas é forçado a `1` internamente.

```bash
curl -X POST "https://<host>/v1/whatsapp/" \
  -H "Authorization: Bearer <jwt>" \
  -H "X-Organization-Id: <organization_id>" \
  -H "Content-Type: application/json" \
  -d '{
    "client_id": "1f9a2c44-8b3e-4f1d-9a77-2c5e0d6b1a30",
    "payment_type": "PIX",
    "installments": 1,
    "short_funnel_id": "funnel_abc123",
    "node_edge_id": "node_xyz789"
  }'
```

Resposta de sucesso (transação criada):

```json
{
  "transactionId": "8c1e0a2b-3d4f-5a6b-7c8d-9e0f1a2b3c4d",
  "pixCopyPaste": "00020126580014br.gov.bcb.pix... (string EMV copia-e-cola)"
}
```

> O campo `pixCopyPaste` é a string **EMV copia-e-cola**. O consumidor renderiza o QR Code a partir dela. A confirmação de **pago** chega depois, por webhook.

---

## 4. Rota auxiliar — Gerar o JWT da organização

```
GET /v1/jwt/generate/:organizationId
```

Emite o JWT de uma organização. Seu consumidor previsto é o **backend de Administração da Assiny**, no provisionamento de organizações.

> Esta rota possui um *guard* opcional por cabeçalho `X-Service-Token`, que **só é exigido quando configurado**. Por padrão ele está inerte e a rota passa direto.

### 4.1. Exemplo

```bash
curl -X GET "https://<host>/v1/jwt/generate/<organization_id>"
```

Resposta de sucesso:

```json
{
  "token": "<jwt>"
}
```

Se `organizationId` vier vazio na URL, a resposta é **HTTP 400**.

---

## 5. Tabela de respostas

> **Regra de ouro para o integrador:** trate qualquer **2xx** como "requisição aceita" e **sempre inspecione o corpo**. Existem casos importantes — em especial a **recusa de cartão** — que voltam como **HTTP 200** com um corpo que indica que **não houve aprovação**. Não confie apenas no código HTTP. Verifique sempre a presença de `transactionId`/`pixCopyPaste` e o campo `authorized`.

| Caso | Status HTTP | Corpo (resumo) | Como tratar |
|---|---|---|---|
| **Sucesso — criação CRÉDITO** | 2xx (tipicamente 201; idempotência e dry-run retornam 200) | `{ "transactionId": "..." }` | Transação criada. A aprovação final virá por webhook. |
| **Sucesso — criação PIX** | 2xx | `{ "transactionId": "...", "pixCopyPaste": "..." }` | Gerar/exibir o QR a partir do copia-e-cola. O "pago" virá por webhook. |
| **Cartão NÃO autorizado (recusa "soft")** | **200** | `{ "authorized": false, "assinyCode": "...", "externalMessage": "...", "sellerMessage": "...", "internalMessage": "..." }` | **Não é erro de transporte.** Cheque `authorized` / a presença de `assinyCode`. `externalMessage`/`sellerMessage` são mensagens amigáveis (comprador/vendedor); `internalMessage` é o detalhe técnico. |
| **Erro de validação do corpo** | 400 | `{ "message": "...", "causes": "Invalid parameters", "status": "..." }` | Corrigir a entrada (ex.: `client_id` ausente/UUID inválido, `payment_type` fora de `CREDIT`/`PIX`, `installments` fora de 1..12, `short_funnel_id`/`node_edge_id` ausentes). |
| **Regra de negócio — parcelas acima do limite do checkout** | 400 | `{ "message": "maximum number of installments is N", "causes": "invalid number of installments", "status": "400" }` | Reduzir o número de parcelas para o limite informado. |
| **Regra de negócio — checkout com plano de assinatura** | 400 | `{ "message": "this checkout is linked to a subscription plan, which is not supported by the one-click whatsapp flow", "causes": "subscription plan not supported", "status": "400" }` | Fluxo não suportado para este checkout. Veja a seção 6. |
| **Dry-run (simulação)** | 200 | `{ "dryRun": true, "simulatedRequest": { ... }, "sessionId": "..." }` | Nada é cobrado. `simulatedRequest` é o payload que **seria** enviado ao bff-pay. |
| **Falha interna / bff-pay indisponível** | status do bff-pay (não-2xx) ou 500 | Corpo de erro com a mensagem da falha | Erro de processamento. Repetir com retentativa/observação. A idempotência (seção 6) protege contra duplicidade em reenvios. |
| **Falha de autenticação (JWT)** | erro (veja seção 2) | `{ "message": "<causa>", "causes": "...", "status": "..." }` | Inspecionar o corpo: cabeçalho ausente, token inválido, ou `organization_id` divergente. |

### 5.1. Formato do envelope de erro

As respostas de erro seguem um envelope padrão da Assiny com os seguintes campos:

| Campo | Descrição |
|---|---|
| `message` | Mensagem principal do erro (o detalhe da causa). |
| `causes` | Rótulo/categoria do erro (ex.: `Invalid parameters`, `subscription plan not supported`). |
| `status` | Status como string (ex.: `"400"`). Pode vir vazio em alguns caminhos. |
| `assinyCode` | Código interno do erro, quando aplicável (omitido quando vazio). |

Exemplo de envelope de erro de validação:

```json
{
  "message": "client_id: cannot be blank.",
  "causes": "Invalid parameters",
  "status": ""
}
```

---

## 6. Regras de negócio

Esta seção é o ponto de atenção mais importante do contrato. As **duas primeiras** regras são as que mais impactam a integração.

### Regra 1 — Valor mínimo da parcela no cartão (≥ R$ 5,00)

Só é possível processar transação de cartão cuja **parcela** seja **≥ R$ 5,00**.

> **Nuance crítica:** esta regra **NÃO é validada neste serviço (one-click)** por enquanto. Ela é validada no **bff-pay**, no momento do método de pagamento. Ou seja: se o consumidor pedir um número de parcelas que faça o valor da parcela cair **abaixo de R$ 5,00**, a **rejeição virá do bff-pay**, e não deste serviço. Em termos práticos, o integrador pode receber essa rejeição como uma falha vinda do bff-pay (status do bff-pay propagado) e **não** como um 400 de validação local. **Regra aplicada no bff-pay, não neste serviço.**

### Regra 2 — Assinatura com plano NÃO é suportada

Checkouts **vinculados a um plano de assinatura NÃO são processados** por este fluxo. **É uma limitação atual — ainda não implementado.**

> **Diferente da Regra 1**, esta regra **É validada neste serviço**, com bloqueio **upfront**:
> - **HTTP 400**
> - `causes`: `subscription plan not supported`
> - `message`: `this checkout is linked to a subscription plan, which is not supported by the one-click whatsapp flow`

### Demais regras validadas neste serviço

Sem motivo para preocupação — são validações simples de entrada e de coerência:

- **`payment_type`**: aceita somente `CREDIT` ou `PIX`.
- **`installments`**: entre `1` e `12`, **e** não pode exceder o **limite de parcelas configurado no checkout**. Se exceder o limite do checkout → `400` com `causes: "invalid number of installments"` e `message: "maximum number of installments is N"`.
- **Pix sempre em 1 parcela**: no Pix o número de parcelas é normalizado para `1` internamente (o bff-pay rejeita Pix com parcelas diferentes de 1). O chatbot pode enviar outro valor; o serviço ajusta.
- **`client_id`**: deve ser um **UUID válido**.
- **`short_funnel_id`** e **`node_edge_id`**: obrigatórios.

### Idempotência (proteção contra duplo clique)

Cliques repetidos com **os mesmos dados** (mesmo cliente + mesmo checkout + mesmo cartão + mesmo valor + mesmas parcelas) **não geram cobrança duplicada**. O serviço reconhece a repetição e **devolve a mesma transação**, respondendo **HTTP 200**. Isso protege a experiência contra duplo toque no WhatsApp.

---

## 7. O que NÃO é responsabilidade deste serviço

Para evitar suposições incorretas na integração:

- **Não fala com o WhatsApp/Meta diretamente.** Quem conversa com o usuário no WhatsApp é a **integração de chatbot do canal**. Este serviço apenas recebe a chamada dessa integração e cria a transação.
- **Não confirma o pagamento.** A resposta deste serviço confirma a **criação** da transação. A confirmação final — **cartão aprovado** ou **Pix pago** — chega de forma **assíncrona, por webhook do gateway**, e é tratada fora deste serviço (pelo chatbot/fluxo de notificação).
