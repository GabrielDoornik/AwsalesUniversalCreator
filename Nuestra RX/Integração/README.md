# Nuestra RX — Documentação de APIs

Pasta de consulta pra montar os fluxos de integração no **n8n** entre as plataformas da operação.

## O que é a Nuestra RX

Operação de telemedicina **hispana nos EUA**, foco em emagrecimento via GLP-1 (Semaglutide e Tirzepatide composto). Cliente entra em [nuestrarx.com](https://nuestrarx.com), responde quiz médico de 9 etapas em espanhol, é qualificado, paga, e recebe medicamento de farmácia compounding 503A/503B. Tudo automatizado.

Preços: Semaglutide $165/mês, Tirzepatide $255/mês. Cobertura quase nacional: em produção o único estado bloqueado hoje é California (CA) — Matheus confirmou em 2026-06-17. O TX NÃO é bloqueado (era só do ambiente de teste do Dosable). Aprovação <24h, garantia 12 meses.

## Stack — quem faz o quê

| Plataforma | Papel | Resumo |
|---|---|---|
| **[Dosable](docs/dosable/overview.md)** | Intake médico | Faz o quiz de 9 etapas, valida elegibilidade, salva lead/session, entrega pra revisão clínica |
| **Beluga Health** | Provider clínico | Médicos terceiros que revisam intake e emitem receita. Mencionado no site, ainda não integrado |
| **[Checkout Champ](docs/checkout-champ/overview.md)** | CRM + Checkout + Rebill | Cobra cartão, guarda customer, processa upsells, agenda cobrança recorrente, dispara webhooks |
| **[NMI](docs/nmi/overview.md)** | Gateway de pagamento | Autoriza/captura cartão via processador (EPX), gerencia tokens, dispara webhooks |
| **Farmácias 503A/503B** | Compounding | Preparam e enviam o medicamento composto |

## Como o fluxo conversa

```
1. Cliente entra em nuestrarx.com → Dosable Intake API
       ↓
2. Quiz médico (9 etapas): sexo → idade → IMC → objetivo → histórico
                          → segurança → tentativas → estado → contato
       ↓
3. Beluga Health revisa e prescreve (clinical provider)
       ↓
4. Cliente vai pro checkout (Checkout Champ)
       ↓
5. Checkout Champ pega cartão → manda pra NMI autorizar
       ↓
6. NMI autoriza com processador (EPX) → responde
       ↓
7. Webhooks disparam pra hubs receivers:
       ├── Hub Vercel (nuestrarx-hub.vercel.app) — Ruben
       └── n8n-dev.awsales.io — nosso
       ↓
8. n8n normaliza pro formato AWSales e POSTa em
   https://app.awsales.io/api/webhooks/organizations/{org_id}/credentials/...
```

## Índice da documentação

### [NMI](docs/nmi/) — gateway
- [Overview](docs/nmi/overview.md) — papel no stack + config real
- [API Reference](docs/nmi/api-reference.md) — endpoints v5 + Classic
- [Webhooks](docs/nmi/webhooks.md) — HMAC, eventos, IPs
- [Normalizer NMI → AWSales](docs/nmi/normalizer/) — code-node.js + mapping.md
- [Payloads por evento](docs/nmi/payloads/) — samples
- [Links oficiais](docs/nmi/links.md)

### [Checkout Champ](docs/checkout-champ/) — CRM/OMS/checkout
- [Overview](docs/checkout-champ/overview.md) — papel + config real
- [API Reference](docs/checkout-champ/api-reference.md)
- [Webhooks](docs/checkout-champ/webhooks.md) — Postback Export Profiles
- [Links oficiais](docs/checkout-champ/links.md)

### [Dosable](docs/dosable/) — intake médico
- [Overview](docs/dosable/overview.md) — papel + status doc
- [API Spec oficial](docs/dosable/Api/openapi.json) — OpenAPI 3.1.0 da Dosable Intake API ✅ destravada 2026-05-27
- [Solicitação de doc (template e-mail)](docs/dosable/pending-api-docs.md) — ⚠️ OBSOLETO, manter como histórico
- [Links](docs/dosable/links.md)

## Checklist de credenciais

[credenciais-checklist.md](credenciais-checklist.md) — o que coletar de cada plataforma pra Credentials do n8n.

## Estado atual (2026-05-27)

| Plataforma | Doc | Webhook | Normalizer | Status |
|---|---|---|---|---|
| **NMI** | ✅ Completa | ✅ Recebendo payload real | ✅ Pronto | ⏳ Validar HMAC, testar com produto real |
| **Checkout Champ** | ✅ Completa | ⏳ Configurado mas postback não chega ainda | ❌ Pendente | 🚨 Bloqueado em dedupe "already purchased" |
| **Dosable** | ✅ openapi.json obtido | ❌ Não configurado | ❌ Não escrito | ⏳ Solicitar Sandbox API Key |
| **Beluga Health** | ❌ Não mapeado | ❌ — | ❌ — | ⚠️ Investigar se entra no fluxo |

## Continuação de contexto

📄 **[HANDOFF.md](HANDOFF.md)** — fonte de verdade do estado do projeto. Próxima IA/Pedro deve ler INTEIRO antes de fazer qualquer coisa. Inclui:
- Erros já cometidos pra não repetir
- Credenciais coletadas (referências, não valores)
- Descobertas técnicas (MID, signing keys, hub do Ruben, etc.)
- Próximos passos em ordem

## Convenções

- 🟢 **n8n é o runtime** — não tem código próprio. Esta pasta é só documentação + checklist + handoff.
- 🔐 Credenciais sensíveis ficam em **Credentials do n8n**, nunca em texto plano em arquivos commitados.
- ⚠️ Marcação `⚠️ confirmar` em qualquer fato ambíguo da doc — validar antes de cravar.
- 🇪🇸 **UTF-8 obrigatório** em todos os normalizers (operação 100% espanhol).
- 🩺 **PHI sensível** — cuidado com logs de payloads médicos. Considerar redação de campos em logs cold.
- 🤝 **Ruben** é colega da operação (mantém hub Vercel). Compartilha Signing Key NMI e X-Hub-Secret do CKC. Coordenar antes de regenerar credenciais.
