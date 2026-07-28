# Dosable

## O que é (resumo curto)

**API de intake médico (questionário inicial) pra telemedicina DTC.** Não é orquestrador completo, não é processador, não emite receita por si. É o **front-end do funil**: faz quiz médico, valida elegibilidade (idade, peso, estado, contraindicações), salva lead/session, e entrega o pacote pro provider clínico (Beluga Health no caso da Nuestra RX) revisar e prescrever.

Nome oficial da API: **"Dosable Intake API"** (OpenAPI 3.1.0).

## Papel no stack Nuestra RX

```
Cliente entra em nuestrarx.com (skin do Dosable)
              ↓
Quiz médico de 9 etapas (sexo, idade, IMC, objetivo, histórico,
                            segurança, tentativas, estado, contato)
              ↓
Dosable valida elegibilidade
   - blacklist-states (no ambiente de teste o TX é bloqueado; em produção entrega todos os estados — ver nota abaixo)
   - critério IMC ≥30 (ou ≥27 com comorbidade)
   - contraindicações (gravidez, câncer tireoide, etc.)
              ↓
Lead + Session salvos via API Dosable
              ↓
Beluga Health (provider clínico terceiro) revisa intake → emite receita
              ↓
Cliente é levado pro checkout (Checkout Champ)
              ↓
Pagamento via NMI
              ↓
Farmácia 503A/503B compounding dispensa o GLP-1
```

## Atores envolvidos

| Player | Função |
|---|---|
| **Dosable** | Intake + qualificação + funil |
| **Beluga Health** | Provider clínico — médicos revisam intake e prescrevem (terceiro, mencionado no site Nuestra RX) |
| **Farmácias 503A/503B** | Compounding pharmacies que preparam Semaglutida/Tirzepatida composta |
| **Nuestra RX** | "Marca" — branding, marketing, public-facing storefront |

## Documentação oficial (DESTRAVADA 2026-05-27)

✅ **Doc oficial obtida:** [`docs/dosable/Api/openapi.json`](Api/openapi.json) — OpenAPI 3.1.0 (~65k tokens)

**Conteúdo:**
- Quickstart manual
- Sandbox keys disponíveis no onboarding (pedidos ao time Dosable)
- Tenant-specific staging keys: 2 semanas antes do go-live
- Endpoints (tags): Authentication, Leads, Sessions, Questions, Products, Blacklist-states
- Auth: API keys (gerar/rotacionar/validar via `/auth/*`)
- Modo sandbox: testa intake completo MAS não permite checkout final ou retrieve products

**Restrições do sandbox:**
- ✅ Disponível: retrieve intake questions, save answers, retrieve/create/update leads + sessions
- ❌ Bloqueado: product retrieval, checkout completo
- 🚫 TX é **declined state** SÓ no sandbox (`GET /blacklist-states` → `["TX"]`). Isso é só um padrão do ambiente de teste do Dosable, não regra de produção. Em PRODUÇÃO o TX NÃO é bloqueado; o único estado bloqueado hoje é California (CA), confirmado pelo Matheus em 2026-06-17. O gate de CA fica no checkpoint da IA (não coletar / não chamar a tool para lead de CA).

## O que sabemos da operação Nuestra RX

**Funil real (visto em [nuestrarx.com/evaluacion](https://nuestrarx.com/evaluacion)):**
- 9 etapas
- 100% espanhol
- Coleta dados antropométricos (altura, peso, IMC), médicos (condições, alergias, cirurgias), reprodutivos (gravidez/lactância), oncológicos (câncer tireoide medular, MEN2)
- Final: oferece **Tirzepatida** ($255/mês "mais efetiva") ou **Semaglutida** ($165/mês "mais econômica") com planos mensal/trimestral/semestral

**Produtos finais:**
- Semaglutide compounded ($165/mês mensal)
- Tirzepatide compounded ($255/mês mensal)
- Versões 3-month e 6-month (preço unitário menor)

## Compliance

- **HIPAA** — Dosable lida com PHI (dados de saúde). BAA (Business Associate Agreement) obrigatório antes de prod.
- **Estados** — em PRODUÇÃO o único estado bloqueado hoje é California (CA), confirmado pelo Matheus em 2026-06-17. O Texas NÃO é bloqueado (o "TX bloqueado" que aparecia antes vinha só do ambiente de teste/sandbox do Dosable). O gate de CA fica no checkpoint da IA. Reconfirmar a lista com o Matheus quando mudar.
- **Compounded drugs** — não-FDA approved, vendidos sob exceção 503A/503B (farmácia magistral).

## Status atual do trabalho (2026-05-27)

- ✅ Doc oficial obtida (openapi.json)
- ⏳ Sandbox API Key não solicitada ainda
- ⏳ Webhook receiver Dosable no n8n não criado
- ⏳ Normalizer Dosable → AWSales não escrito
- ⏳ BAA HIPAA não confirmado

## Próximos passos

1. Ler openapi.json completo (estrutura, endpoints, schemas)
2. Solicitar **Sandbox API Key** ao time Dosable (referência: kirten@dosable.com OR via Ruben se ele já tem contato)
3. Confirmar com Ruben se já existe integração Dosable → Hub Vercel — pode ser que ele já tenha config rodando que a gente queira espelhar
4. Definir quais eventos da Dosable importam pra AWSales (lead criado? session completa? intake aprovado?)
5. Criar webhook receiver `/webhook/nuestra-dosable` no n8n
6. Escrever normalizer Dosable → AWSales

## Pendências (⚠️ confirmar)

- Dosable tem webhooks de eventos pra notificar consumers externos? (vamos descobrir no openapi.json)
- Beluga Health tem API/webhook próprio que entra no fluxo? Não mapeamos ainda.
- BAA HIPAA — assinado já? Por quem?
- Qual é o tenant ID da Nuestra RX dentro da Dosable?
