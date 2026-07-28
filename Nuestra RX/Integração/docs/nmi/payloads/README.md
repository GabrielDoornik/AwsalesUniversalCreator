# Payloads NMI por event_type

Samples de payload da doc oficial NMI, organizados por evento.

## Cross-ref com Subscribed Events do nosso webhook

### ✅ Subscritos COM payload doc (15)

| event_type | Arquivo |
|---|---|
| transaction.sale.success | [transaction.sale.success.md](transaction.sale.success.md) |
| transaction.sale.failure | [transaction.sale.failure.md](transaction.sale.failure.md) |
| transaction.auth.success | [transaction.auth.success.md](transaction.auth.success.md) |
| transaction.capture.success | [transaction.capture.success.md](transaction.capture.success.md) |
| transaction.void.success | [transaction.void.success.md](transaction.void.success.md) |
| transaction.refund.success | [transaction.refund.success.md](transaction.refund.success.md) |
| recurring.subscription.add | [recurring.subscription.add.md](recurring.subscription.add.md) |
| recurring.subscription.update | [recurring.subscription.update.md](recurring.subscription.update.md) |
| recurring.subscription.delete | [recurring.subscription.delete.md](recurring.subscription.delete.md) |
| settlement.batch.complete | [settlement.batch.complete.md](settlement.batch.complete.md) |
| settlement.batch.failure | [settlement.batch.failure.md](settlement.batch.failure.md) |
| chargeback.batch.complete | [chargeback.batch.complete.md](chargeback.batch.complete.md) |
| acu.summary.automaticallyupdated | [acu.summary.automaticallyupdated.md](acu.summary.automaticallyupdated.md) |
| acu.summary.contactcustomer | [acu.summary.contactcustomer.md](acu.summary.contactcustomer.md) |
| acu.summary.closedaccount | [acu.summary.closedaccount.md](acu.summary.closedaccount.md) |

### ❌ Subscritos SEM payload doc ainda (10)

Doc oficial NMI não publica samples separados para `.failure` e `.unknown` de cada tipo. Usar os existentes como base e capturar real via Test Mode quando precisar:

- transaction.sale.unknown
- transaction.auth.failure, transaction.auth.unknown
- transaction.capture.failure, transaction.capture.unknown
- transaction.void.failure, transaction.void.unknown
- transaction.refund.failure, transaction.refund.unknown
- transaction.credit.unknown

### 📁 Existem no folder mas NÃO subscritos (ignorar por ora)

- transaction.check.status.{settle,return,latereturn} — só ACH/check (Nuestra RX é cc-first)
- recurring.plan.{add,update,delete} — plans são templates, raramente mudam

## Observação importante

Payloads da doc são **subset-compatíveis** com o real. Real tem ~20 campos extras (network tokenization, VAT/tax internacional, tap_to_mobile, etc.) que a doc não mostra mas que não quebram a normalização. Ver detalhes em [../normalizer/sample-real-payload.md](../normalizer/sample-real-payload.md).
