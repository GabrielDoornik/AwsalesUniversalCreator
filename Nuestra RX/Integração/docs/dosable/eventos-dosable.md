# Catálogo de Eventos da Dosable (Nuestra RX)

Lista completa de eventos que a Dosable pode disparar pro nosso webhook, enviada pelo Willian
(2026-06-12). Serve de referência pra escolher input/output de qualquer campanha futura.

> Nota do Willian sobre o código de rastreio: "Subs ID da Dosable" — o rastreio é amarrado ao
> Subscription ID da assinatura na Dosable (ver `admin-panel-mapping.md`, hierarquia
> Lead → Partial → Customer → Subscription). A tela de Subscriptions mostra: Subscription ID,
> Date, Customer Name, Total, DR Status (Doctor Review), Subscription Status.

## Tabela de eventos

| Evento | Descrição |
|---|---|
| Account Support | Triggered when the client answers the patient, only once every 24 hours. |
| Admin Password Reset | Admin resets patient password from the admin portal. |
| Chargeback | Triggered when a transaction is flagged as a chargeback from the payment processor. |
| Chat Message | Outbound medical chat message to the patient, e.g. physician or Beluga webhook `DOCTOR_CHAT`. |
| CheckIn Reminder | Triggered for weightloss orders when a check-in is required and none exists in the prior 2-cycle window. |
| Checkout Complete | Triggered when payment is successful in checkout. (= nosso `order_paid` / pre-save) |
| Complete intake | Triggered when the "complete session" endpoint is called. |
| Complete intake stop | Triggered when the patient abandons intake via the complete-intake-stop autoresponder endpoint. |
| Consult Canceled | Triggered when Beluga Health returns a cancelled consult. |
| Customer Service Chat | Patient sends a message through Customer Service chat in patient portal. |
| Dosage Change | Triggered when patient requests an order change inside patient portal. |
| Email form submit | Triggered when the patient enters all the lead information. |
| First Time Charged | Triggered when a customer is successfully charged for the first time, initial sale. |
| First Time Login | User creates password and logs in for the first time on the thank you page. |
| Follow up confirmation | Triggered when the patient answers the follow up intake, final question. |
| Follow up reminder | Triggered several days before the next rebill and the prescription is expired or refills got to 0. |
| ID submitted | Triggered when the patient uploads all details on first modal inside patient portal. |
| New Sale Declined | Triggered when a new sale transaction is declined by the payment processor. |
| Order Expired | Triggered 7 days after the authorization transaction and it was not attended. |
| Password Changed | Triggered when the patient completes a password reset and sets a new password. |
| Password Created | Triggered when the patient creates the password during the `/thanks` page. |
| Patient Medical Message | Patient sent a message to medical chat from the portal. |
| Pre-billing | Triggered 3 days before the rebill happens. |
| Rebill | Triggered when any rebill attempt is processed through the recycle controller. |
| Rebill Decline | Triggered when a recurring rebill payment fails. |
| Recover Password | Triggered when a user requests a "forgot password" link. |
| Refund email | Triggered whenever there is a refund for a customer. |
| Rx Written | Happens when Beluga prescribed the order. (= médico APROVOU) |
| Shipping Confirmation | Triggered when the shipment webhook for pharmacy is called. (= pedido ENVIADO; é aqui que existe rastreio) |
| Skip month | Triggered when patient pauses its subscription through admin portal. |
| Subscription Cancelled | Triggered every time the patient cancels its subscription. |
| Successful Rebill | Triggered when a recurring subscription charge is processed successfully. |

## Mapa rápido pro novo Onboarding (pós-aprovação)

Fluxo novo desejado (substitui o antigo de "espera do médico"):
1. IA entra quando o médico aprova e o código de rastreio é enviado.
2. IA atua de novo quando o pedido chega (orientação de aplicação inicial).
3. IA faz follow-ups a cada 7 dias (adesão às doses).

Eventos candidatos a usar:
- `Rx Written` = médico aprovou (mas AINDA não tem rastreio — é só a aprovação).
- `Shipping Confirmation` = pedido despachado pela farmácia. É o momento em que o código de
  rastreio passa a existir. Forte candidato a INPUT do "manda o rastreio".
- Acompanhamento de doses / 7 dias: `CheckIn Reminder`, `Follow up reminder`, `Pre-billing`,
  `Rebill` podem alimentar os follow-ups recorrentes (avaliar depois).

## Código de rastreio — confirmado pelo Willian (2026-06-12)

- Na aprovação do médico (`Rx Written`) **ainda NÃO existe** código de rastreio — só significa que
  a receita foi emitida. A farmácia ainda não despachou.
- O código de rastreio só passa a existir a partir do **`Shipping Confirmation`** (farmácia
  despachou).
- O lead acompanha o pedido no **patient portal** (`https://patient.nuestrarx.com`) — status,
  mensagens médicas e andamento.
- Willian confirmou com a Dosable: o gatilho é o `Shipping Confirmation` e o **código de rastreio
  fica disponível para consumir via API** da Dosable.

### RESOLVIDO (2026-06-12): é PUSH, sem tool
Willian confirmou: o `Shipping Confirmation` chega no MESMO webhook que a gente já usa e já vem com
`tracking number`, `carrier`, `tracking URL` etc DENTRO do payload. Ou seja, o código de rastreio
NÃO precisa ser buscado via API/tool — ele vem no próprio evento.

### Desenho final
`Shipping Confirmation` (chega no webhook com tracking_number + carrier + tracking_url) -> n8n
normaliza (igual ao `rx_written`) -> manda pro AWSales como INPUT do novo Onboarding, com o rastreio
no metadata -> a IA abre com "tu pedido fue enviado, aquí está tu rastreo: {link}". Sem @tool.

### Único pendente
Pedir ao Willian um PAYLOAD DE EXEMPLO do `Shipping Confirmation` (igual ele mandou o do
`rx_written`), pra ver os nomes exatos dos campos (tracking_number, carrier, tracking_url, e como
vem o email/phone/Subs ID pra casar o lead). Com o sample, monto o normalizador + branch no Switch.
