# Dosable — Solicitação de documentação técnica

> **⚠️ ARQUIVO OBSOLETO (2026-05-27)** — A doc oficial foi obtida e está em [`Api/openapi.json`](Api/openapi.json) (OpenAPI 3.1.0 da Dosable Intake API). Este arquivo é mantido como histórico do que foi feito quando ainda não tínhamos doc.
>
> **Pendência real agora:** solicitar **Sandbox API Key** ao time Dosable (conforme o próprio openapi.json instrui: "Sandbox API keys can be provided upon request to all clients at the start of onboarding"). Tenant-specific staging keys vêm 2 semanas antes do go-live.

## Status (histórico)

A Dosable não publica documentação de API publicamente. Para destravar a integração precisamos solicitar acesso direto ao time deles.

## Contato sugerido

Primário (descoberto no site institucional): `kirten@dosable.com` — ⚠️ confirmar se ainda é o ponto de contato técnico atual.
Alternativo: formulário "Book a Demo" em https://dosable.com/

## Template de e-mail

> **Assunto:** Solicitação de documentação de API para integração — Nuestra RX
>
> Olá [Nome],
>
> Sou [seu nome / cargo] na operação Nuestra RX e estamos finalizando a arquitetura de integração entre nossas três peças: Dosable (funil/intake), Checkout Champ (CRM/OMS) e NMI (gateway).
>
> Para escrever o conector da Dosable com fidelidade preciso da seguinte documentação:
>
> 1. **API reference completa**: endpoints REST disponíveis (pacientes, intake, prescrições, pedidos, renovações, status), métodos HTTP, schema de request/response.
> 2. **Autenticação**: tipo de credencial (API key, OAuth2), como obter, expiração, rotação.
> 3. **URLs**: base de produção e de homologação/sandbox.
> 4. **Webhooks**: lista de eventos disponíveis, payload de cada um, mecanismo de assinatura (HMAC, secret), retry policy, IPs de origem.
> 5. **SDKs / Postman**: se houver SDK oficial ou collection Postman.
> 6. **Rate limits**: limites por minuto/hora por endpoint.
> 7. **HIPAA / BAA**: requisitos para assinar BAA antes do go-live e qual entidade da Nuestra RX precisa figurar no acordo.
> 8. **Ambiente de teste**: como solicitar credenciais sandbox e quais dados de paciente fictício são aceitos.
>
> Se possível, agendamos também uma call técnica de 30 min com alguém do time de engenharia/integrations da Dosable para esclarecer dúvidas pontuais depois que tivermos a doc.
>
> Obrigado,
> [seu nome]
> [empresa / contato]

## Quando receber a doc, alimentar

- `docs/dosable/overview.md` (sobrescrever assumptions com fatos)
- `docs/dosable/api-reference.md` (criar)
- `docs/dosable/webhooks.md` (criar)
- `docs/dosable/links.md` (atualizar)
- `.env.example` (adicionar variáveis reais — `DOSABLE_API_KEY`, `DOSABLE_BASE_URL`, `DOSABLE_WEBHOOK_SECRET`, etc.)

## Perguntas adicionais para fechar gaps de arquitetura

Quando estiver na call com a Dosable, perguntar também:
- A Dosable repassa o `paymentToken` (Collect.js do NMI) para o Checkout Champ, ou ela mesma faz a sale e chama o CKC só para logar order?
- Quem é "source of truth" do customer/paciente — Dosable ou Checkout Champ?
- Qual o fluxo de renewal (rebill mensal de GLP-1, por exemplo): roda do CKC, do NMI ou de um scheduler interno da Dosable?
- Como Dosable lida com cancelamento iniciado pelo paciente (botão "cancel" no portal): dispara webhook? Cancela subscription no CKC?
- Qual a política de dados de saúde (PHI) — campos sensíveis ficam só na Dosable ou também no Checkout Champ?
