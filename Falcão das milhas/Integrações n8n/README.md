# Integrações n8n — Falcão das Milhas

Organização AWSales: `a21b2ab2-e4d4-4cf4-a1af-74674b75d568`.

Dois fluxos de input do funil pós-compra do Buscador Automático. Ambos são eventos que entram na AWSales, não tools que o agente chama, então não seguem o padrão de responder sempre 200 com flag `ok`.

Última atualização: 2026-07-28.

---

## Hosts observados

- `n8n.nonprod.awsales.io` — dev, usado no fluxo de compra aprovada.
- `n8n.prod.awsales.io` — produção, usado no fluxo de primeiro acesso.

Atenção: o `CLAUDE.md` do projeto registra a produção como `flow.awsales.io`. O fluxo de primeiro acesso está publicado em `n8n.prod.awsales.io`. Confirmar qual é o host correto de produção hoje antes de migrar o fluxo de compra aprovada.

---

## Fluxo 1 — Compra aprovada (Hubla)

Origem: Hubla, evento `invoice.payment_succeeded`.
Webhook n8n: path `compra-aprovada-asinny` em `n8n.nonprod.awsales.io`.
Destino: `POST https://app.awsales.io/api/webhooks/organizations/a21b2ab2-e4d4-4cf4-a1af-74674b75d568/credentials/compra-aprovada-hubla`

Papel no funil: input do Onboarding 1 e output da campanha de Recuperação de Vendas 297.

Nós: Webhook, Code de normalização, HTTP Request.

O Code converte o payload da Hubla para o schema de transação da AWSales, com `event: APPROVED_PURCHASE`. Pontos que exigiram cuidado:

- Preço do produto não vem em `products[].price` no payload real. Vem em `products[].offers[0].amountCents`. Sem fallback, o item sai zerado.
- `subscriptions[0].type` chega como `recurring`, não `subscription`. O Buscador é assinatura anual, `billingCycleMonths: 12`.
- Taxa e líquido saem dos `receivers`, não de cálculo: taxa é a soma dos receivers com role diferente de seller, líquido é o total do seller.
- Valores em centavos, convertidos para decimal com duas casas.
- Nome do comprador chega em caixa alta e é normalizado.
- `utm.source` é forçado para `awsales`, exigência da AWSales para a conversão aparecer no dashboard. A origem real fica em `metadata.utm_source_original`. Se o webhook passar a receber toda compra, e não só as da campanha, isso superatribui e a flag deve ser desligada.
- O nó ignora qualquer coisa que não seja `invoice.payment_succeeded` com `status: paid`.

Nomenclatura: o path do webhook diz `asinny` e a credencial da AWSales diz `hubla`. O payload é Hubla. Padronizar quando for para produção.

Pendência: `transaction.cycle` está fixo em 1. A renovação anual vai chegar como evento novo e também sairia como ciclo 1. Ajustar quando houver um payload de renovação para inspecionar.

HTTP Request: Body Content Type JSON e Specify Body em Using JSON, com `{{ JSON.stringify($json) }}`. Header `Accept: application/json`. Autenticação None, porque a credencial está no path. Retry On Fail ligado.

---

## Fluxo 2 — Primeiro acesso ao Buscador (flook-server)

Origem: `flook-server`, sistema do Falcão, quando o comprador conclui o primeiro acesso.
Webhook n8n: path `2c4011e1-807c-4b98-9351-58216f141c96` em `n8n.prod.awsales.io`.
Destino: `POST https://app.awsales.io/api/webhooks/organizations/a21b2ab2-e4d4-4cf4-a1af-74674b75d568/credentials/primeiro-acesso`

Papel no funil: output do Onboarding 1 e input do Onboarding 2. É o evento que resolve o E0 para E1 e que faz a IA parar de cobrar criação de conta.

Payload de entrada, enxuto:

```json
{ "name": "Rebecca Cardoso Brandão", "email": "rebeccabcardoso@gmail.com", "phone": "5573988606155" }
```

O Code monta o schema de integração personalizada da AWSales, com `event: custom_action`, e normaliza:

- Nome para caixa de título, preservando conectores como de, da, dos. O nome cru fica em `metadata.nome_original`.
- Telefone para E.164, com DDI 55 quando vier sem, e nono dígito para celular brasileiro de oito dígitos.
- E-mail em minúsculas, com validação de formato.
- Marca `valido: false` com a lista de erros quando e-mail ou telefone não passam, para um nó IF barrar antes do HTTP Request.
- Gera `dedupe_key` no formato `E1:email`, para um Remove Duplicates blindar retry do flook.

O que a IA enxerga: os campos de `metadata`, referenciáveis na conversa como `{{metadata.campo}}`. Hoje o nó publica `email_compra`, `status_onboarding`, `primeiro_acesso`, `action_details`, `engagement_level`, `intent_level`, `emotional_tone`, `context_notes`, `nome_original` e `origem_tecnica`.

HTTP Request: contentType raw com `application/json`, body `{{ $json.bodyJson }}`.

### Sobre usar metadata no checkpoint

Este evento chega DEPOIS do primeiro acesso. Portanto:

- No Onboarding 1 não serve. A campanha precisa do e-mail antes do acesso, para dizer ao cliente com qual e-mail ele entra. Quando o evento chega, o objetivo já foi cumprido. O papel dele ali é encerrar a campanha, não alimentar a conversa. Por isso o checkpoint do Onboarding 1 continua sem afirmar o e-mail do cliente.
- No Onboarding 2 serve. A campanha começa depois do acesso, então `metadata` está disponível. O ganho é não precisar pedir o e-mail na hora do handoff, confirmando em vez de perguntar.

Cuidado de nomenclatura: o campo se chama `email_compra`, mas o valor vem do flook e é o e-mail da CONTA, não necessariamente o da compra. Quando a pessoa compra com um e-mail e cria a conta com outro, os dois divergem, e é justamente o caso que as FAQs de acesso tratam. Se esse campo for usado no checkpoint, tratar como e-mail da conta e nunca afirmar que é o e-mail da compra. O ideal é renomear para `email_acesso` no nó de normalização.

---

## Fluxo 3 — Cadastro do perfil (Typeform)

Ainda não construído. Será o output do Onboarding 2.

O Typeform `RSuIPOnP` tem webhook nativo e pede nome, e-mail e telefone no fim do formulário, então dá para casar o respondente com o lead sem campo oculto na URL.

Limitação conhecida: quem abandona no meio não é identificável, porque os campos de identificação ficam no fim. Para tratar abandono seria preciso mover a identificação para o começo do formulário.
