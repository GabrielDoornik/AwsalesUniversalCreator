# NMI — Webhooks

## Como ativar

**Merchant Portal → Settings → Webhooks → Create**:
1. Inserir URL HTTPS do endpoint que vai receber.
2. Selecionar os tipos de evento a escutar.
3. NMI começa a entregar imediatamente.

Não há criação programática via API hoje (⚠️ confirmar — Sign-Up API tem webhook subscription endpoints, mas são para o fluxo de onboarding de merchant, não para gateway events).

## Verificação de assinatura

Cada postback chega com o header:

```
Webhook-Signature: t=<nonce>,s=<signature>
```

Onde `signature` é o HMAC-SHA256 calculado como:

```
hash_hmac("sha256", nonce + "." + raw_request_body, SIGNING_KEY)
```

- `SIGNING_KEY` é o segredo gerado no painel ao criar o webhook (guardar em vault, não commitar).
- `raw_request_body` deve ser a string **bruta** (não o JSON re-serializado), porque o HMAC depende de bytes exatos.
- `nonce` é único por entrega — também serve para anti-replay.

Implementação em Node/TypeScript (esboço):

```ts
import crypto from 'node:crypto';

function verifyNmiSignature(rawBody: string, header: string, signingKey: string): boolean {
  const [tPart, sPart] = header.split(',');
  const nonce = tPart.replace('t=', '');
  const signature = sPart.replace('s=', '');
  const expected = crypto
    .createHmac('sha256', signingKey)
    .update(`${nonce}.${rawBody}`)
    .digest('hex');
  return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected));
}
```

**Atenção (Express/Fastify):** capturar o `rawBody` antes de qualquer middleware de JSON parse. Caso contrário a verificação falha.

## IP allowlist (entrada — webhooks NMI → seu servidor)

Webhooks são entregues exclusivamente destes ranges. Se você tiver firewall, libere:

- `104.192.32.81` — `104.192.32.87`
- `104.192.36.81` — `104.192.36.87`

⚠️ Confirmar com NMI antes de produção — ranges podem mudar.

## Eventos disponíveis

| Grupo | Eventos |
|---|---|
| **Transação** | sale, auth, capture, void, refund, credit, validate (aprovado / declinado / pendente) |
| **ACH / Check** | check status changes |
| **Recurring** | subscription_created, subscription_charge_success, subscription_charge_failure, subscription_complete, subscription_cancelled |
| **Settlement** | batch_settled |
| **Chargeback** | chargeback_added, retrieval_added |
| **Account Updater (ACU)** | card_updated, card_closed, expiration_updated, contact_card_holder |

Documentação por grupo:
- Transactions: https://docs.nmi.com/reference/transaction-events
- Recurring: https://docs.nmi.com/reference/recurring-events
- Check status: https://docs.nmi.com/reference/check-status
- Settlement: https://docs.nmi.com/reference/settlement-events
- Chargebacks: https://docs.nmi.com/reference/chargeback-events
- Account Updater: https://docs.nmi.com/reference/acu-events

## Retry logic

NMI faz retentativas com backoff em caso de não-2xx. ⚠️ Confirmar a janela e a quantidade exata em https://docs.nmi.com/reference/retry-logic. Como regra: responder **sempre** `200 OK` o mais rápido possível e processar o payload assíncrono. Erros 4xx/5xx do seu lado disparam retry.

## Sign-Up API (onboarding) — webhooks separados

Para o fluxo de onboarding de merchants (Create Merchant, Application), há um set separado de eventos:
- `applicationApproved`, `applicationDeclined`, `applicationCancelled`
- `applicationUpdatedDataRequested`
- `applicationMerchantBoarded`, `applicationMerchantClosed`
- `merchantFirstBatch`, `merchantProcessingStart`, `merchantProcessingStop`
- `merchantChargebackAdded`, `merchantDepositNew`, `merchantStatementNew`
- `merchantRetrievalAdded`, `merchantResidualsPublished`

Endpoints de subscription programática para esses eventos: `POST /v4/webhooks/subscriptions` (vide `api-reference.md` — Sign-Up API).

## Boas práticas no recebimento

1. Endpoint deve ser **idempotente**: NMI pode reenviar o mesmo evento. Use `event_id` (ou nonce) como chave de deduplicação.
2. **Verifique a assinatura sempre**, mesmo com IP allowlist (defesa em camadas).
3. Responda 2xx rápido. Enfileire o processamento (BullMQ, SQS, Redis stream) para retorno < 1s.
4. Logue o payload bruto + headers em storage cold (S3) por pelo menos 90 dias — útil para reconciliação e disputa de chargeback.
