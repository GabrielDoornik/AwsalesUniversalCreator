# Payloads CKC por Customer Type

Samples de payloads reais capturados via webhook `Nuestra-AWSales-Dev` → `https://n8n-dev.awsales.io/webhook/nuestra-champ`.

## ✅ Capturados (reais via n8n)

| Customer Type | Arquivo | Origem |
|---|---|---|
| Partial | [partial.md](partial.md) | 2 samples: Dosable funnel (Jose) + Order Entry (Test User3) |
| New Sale | [new-sale.md](new-sale.md) | 2 samples: External Payment PREPAID (Pedro Awsales) + Credit Card via gateway (Camila Possan, funil Dosable, Mastercard 4444) |
| Refunded | [refunded.md](refunded.md) | 1 sample: Full Refund Externally (Pedro Awsales) |
| Declined | [declined.md](declined.md) | 1 sample: Cancel Order via UI (Pedro Awsales). ⚠️ CKC trata Cancel Order como QA Decline. Sample de decline real do gateway ainda pendente. |
| Capture | [capture.md](capture.md) | 1 sample: Approve Order no QA (Pedro Awsales External Payment). ⚠️ orderStatus vem COMPLETE (não CAPTURE). |
| Rebill | [rebill.md](rebill.md) | 1 sample: Force Bill NOW (Pedro Awsales cycle 2). Discriminator: `billingCycleNumber > "1"` + `originalOrderId !== orderId`. |

## ⏳ Pendentes de captura

Routes configuradas no profile `Nuestra-AWSales-Dev` mas sem sample ainda:

| Customer Type | Como disparar |
|---|---|
| Capture | Aprovar order em QA com card real (Camila Possan ou similar) |
| Declined | Sale com card recusado (CVV `900` é declined no test card — mas test card é bloqueado de exportar; precisa card real recusado) |
| Refunded | Click "Full Refund" em order paga real |
| Chargeback | Disputa real (improvável testar) |
| Rebill | Cycle de subscription rebill (espera ciclo 30d após primeira venda real) |

## ⚠️ Limitações conhecidas

1. **Test Card orders não exportam.** Doc oficial CKC: *"Test Card orders will not export through the webhook system"*. Não tentar testar com card `0000000000000000`.
2. **Cycle 15min default.** Postback não é em tempo real — roda batch a cada 15min. Pra acelerar, reduzir Export Delay no profile.
3. **Logs ficam em customer history.** Cada postback gera entry no painel History do customer no CKC.
4. **Retry contínuo.** Falhas no destino (404, timeout) fazem CKC reagendar até suceder.

## Headers comuns

Todos payloads chegam via Cloudflare → n8n com:
- `x-original-forwarded-for`: IP CKC real (sempre `44.219.22.112` ou outro da lista oficial)
- `cf-connecting-ip`: igual ao original-forwarded-for
- `content-type: application/json` (forçado pelos Field Mappings com header `Content-Type: application/json`)
- HTTP method: `POST` (forçado pelo Field Mapping `httpMethod: POST`)

Lista oficial IPs CKC: `80.248.30.132, 80.248.30.141, 52.206.5.84, 44.219.22.112`.
