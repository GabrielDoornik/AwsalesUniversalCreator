# Endpoint `/dosable/subscription` (Worker webhook.nuestrarx.com)

Endpoint passado pelo Willian (2026-07-01) para a ideia da tool de "consultar status do lead no
Dosable": lead entra na campanha receptiva dizendo que já preencheu o formulário, a IA consulta o
estado real dele no funil e roteia a conversa a partir disso.

`https://webhook.nuestrarx.com/dosable/subscription`

Mesmo Worker Cloudflare que hospeda `/ai-handoff`, mas por baixo ele consulta o **Konnektive/
Dosable admin direto** (`source: "admin.nuestrarx"`). Contrato descoberto/confirmado sondando o
endpoint (2026-07-01).

## Contrato confirmado

| Item | Valor |
|---|---|
| Método | `GET` |
| Auth | header **`X-NRX-Dosable-Secret`** (NÃO é Bearer; é header próprio) |
| Secret | `subk_3c16578921849814eb4a21908353dbb6f1d5a49cbb8c1026` (guardar em Credentials, não versionar solto) |
| Identificador | query `?email=` **ou** `?phone=` (E164). `session_id` NÃO é aceito |
| Content-Type | não precisa (é GET) |

Auth é header customizado, por isso as tentativas iniciais com `Authorization: Bearer` batiam
401. A conexão na AWSales deve ser tipo "Header Personalizado" com nome `X-NRX-Dosable-Secret`.

## Respostas observadas

Sem identificador:
```json
{"ok":false,"error":"missing_identifier","detail":"provide email or phone"}
```

Identificador sem match no admin:
```json
{"ok":true,"source":"admin.nuestrarx","found":false}
```

Com match (positivo real — match veio por phone `+13055551234`):
```json
{"ok":true,"source":"admin.nuestrarx","found":true,
 "customer":{"name":"Maria Lopez","city":null,"state":"FL",
 "subscription_status":"PARTIAL","order_status":"PARTIAL",
 "consult_status":"PENDING","ltv":null}}
```

Campos de `customer`: `name`, `city`, `state`, `subscription_status`, `order_status`,
`consult_status`, `ltv`. Valores vistos: `subscription_status`/`order_status` = `PARTIAL`,
`consult_status` = `PENDING`. Outros valores prováveis (do admin-panel-mapping): status
`ACTIVE`/`CANCELLED`, consult/DR `APPROVED`/`DECLINED` — confirmar quando aparecer em produção.

## Duas descobertas que definem o uso no checkpoint

1. **NÃO retorna `checkout_url`.** Era a segunda parte da pergunta original ("a mesma consulta
   traz o link do checkout?"): a resposta é NÃO. Esse endpoint é **verificador de status de
   funil**, não gerador de link. O link continua vindo de metadata / `form_resume_url` /
   `@enviar_avaliacao_nuestra_rx`.

2. **Phone bateu, email não (nos meus testes).** `?phone=+13055551234` achou a Maria; 3 emails
   (incl. `test@nuestrarx.com` e o da Maria via ai-handoff) deram `found:false`. Bom: o telefone
   do WhatsApp é matcher de atrito zero (não precisa pedir email). A confirmar com o Willian se o
   match por email funciona de fato (pode ser só que aqueles emails não existem no Konnektive).

## Semântica do funil (o que o status significa)

Hierarquia Dosable: Lead -> Partial -> Customer -> Subscription (ver `admin-panel-mapping.md`).
- `found:false` -> não existe registro de customer/partial no Konnektive (ainda é só lead, ou
  fez o intake mas não chegou ao checkout). Não distingue "intake feito sem checkout" de "nada";
  pra isso usar em conjunto com `{{metadata.form_resume_url}}`.
- `found:true` + `PARTIAL` -> chegou ao checkout/pre-save mas não concluiu (consult PENDING =
  médico ainda não revisou). Logo, completou o intake.
- status ativo/customer -> concluiu pre-save (ou já é assinante).

## Teste pronto (funcionando)

```bash
H="X-NRX-Dosable-Secret: subk_3c16578921849814eb4a21908353dbb6f1d5a49cbb8c1026"
curl -sS -X GET -H "$H" "https://webhook.nuestrarx.com/dosable/subscription?phone=+13055551234"
curl -sS -X GET -H "$H" "https://webhook.nuestrarx.com/dosable/subscription?email=<email_do_lead>"
```

## Como vira tool na AWSales

- Conexão: tipo Header Personalizado, header `X-NRX-Dosable-Secret` = secret acima.
- Tool HTTP: método GET, URL `https://webhook.nuestrarx.com/dosable/subscription`, query params
  `email` (IA) e/ou `phone` (IA, E164 — de preferência o telefone do WhatsApp do lead).
- Mapear da resposta: `found`, `customer.subscription_status`, `customer.order_status`,
  `customer.consult_status`, `customer.name`, `customer.state`.
- Handle sugerido: `@consultar_status_evaluacion` (nome final sai quando a tool for criada).
- Uso no checkpoint: verificar status quando o lead afirmar que já preencheu/comprou; rotear e
  personalizar a fala pelo estado. NÃO usar como fonte de link (não tem checkout_url).

## Pendências pro Willian

- [ ] Confirmar se o match por `email` funciona (só consegui positivo por phone).
- [ ] Se possível, incluir `checkout_url` na resposta do `found:true` (era a ideia original de
      já devolver o link junto do status). Se não der, seguimos pegando link do metadata.
- [ ] Confirmar os valores possíveis de `subscription_status` / `order_status` / `consult_status`.
