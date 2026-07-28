# NMI — Documentação

Pasta de consulta da integração com o gateway NMI (Network Merchants Inc).

## Índice

### Visão geral
- [overview.md](overview.md) — o que é a NMI, onde se encaixa no stack Nuestra RX
- [api-reference.md](api-reference.md) — endpoints v5 + Classic Direct Post, autenticação, paginação
- [webhooks.md](webhooks.md) — mecanismo de webhooks, HMAC-SHA256, eventos, IPs
- [links.md](links.md) — URLs oficiais (docs, portal merchant, portal partner, sandbox)

### Normalizer NMI → AWSales
Pasta [normalizer/](normalizer/) — tudo relacionado ao Code node do n8n que converte payload NMI no formato canônico do AWSales:
- [mapping.md](normalizer/mapping.md) — tabela de mapeamento (event_type, status, fields), decisões e pendências
- [code-node.js](normalizer/code-node.js) — JavaScript pronto pra colar no n8n
- [sample-real-payload.md](normalizer/sample-real-payload.md) — payload real capturado em 2026-05-26 + algoritmo HMAC

### Payloads de evento
Pasta [payloads/](payloads/) — samples de payload (doc oficial NMI) por `event_type`:
- [README.md](payloads/README.md) — índice + status de subscrição

## Estado atual do trabalho

- ✅ Webhook NMI cadastrado em `https://n8n-dev.awsales.io/webhook/nuestra-nmi`
- ✅ Signing Key compartilhada com hub Vercel preexistente (`DA3BBBE...`, da conta NUESTRA RX LLC)
- ✅ Workflow n8n recebendo + normalizando + POSTando pro AWSales
- ⏳ Pendente: validação HMAC, IF skip filter, testes end-to-end com produto real
