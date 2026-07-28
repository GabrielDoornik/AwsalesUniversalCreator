# O que é a Tool AI Handoff da Nuestra RX

## Resumo simples

A tool AI Handoff é a ponte que permite a IA da AWSales enviar para a Nuestra RX uma avaliação coletada pelo WhatsApp e receber de volta um link de checkout.

Ela não é o mesmo fluxo do webhook de abandono.

Fluxo de abandono:

```text
Nuestra RX forms-site -> n8n -> AWSales
```

Esse fluxo traz contexto para a AWSales iniciar ou continuar uma conversa com o lead.

Fluxo da tool:

```text
AWSales IA -> n8n adapter -> Nuestra RX /ai-handoff
```

Esse fluxo devolve para a Nuestra RX os dados que a IA coletou na conversa.

## O que foi criado

Criamos uma tool HTTP na AWSales chamada:

```text
Enviar avaliação Nuestra RX
```

Essa tool será chamada pela IA quando o lead quiser finalizar a avaliação pelo WhatsApp.

A chamada passa primeiro pelo n8n, porque a AWSales envia alguns campos complexos como texto. O n8n corrige isso e repassa para a Nuestra RX.

Arquitetura validada:

```text
AWSales Tool
  -> Webhook n8n adapter
  -> Code node para corrigir JSON
  -> HTTP Request para https://webhook.nuestrarx.com/ai-handoff
  -> checkout_url volta para a AWSales
```

## Por que usamos o n8n adapter

O endpoint da Nuestra RX espera campos como objetos JSON reais:

```json
{
  "contact": {
    "first_name": "Maria"
  },
  "answers": {
    "6403": {
      "value": "Female"
    }
  },
  "source": {
    "channel": "whatsapp"
  }
}
```

Mas a AWSales enviou esses campos como strings:

```json
{
  "contact": "{\"first_name\":\"Maria\"}",
  "answers": "{\"6403\":{\"value\":\"Female\"}}",
  "source": "{\"channel\":\"whatsapp\"}"
}
```

Por isso a chamada direta para a Nuestra RX retornava erro `400`.

O n8n adapter faz `JSON.parse` nesses campos e transforma texto em objeto antes de repassar.

## Payload esperado pela Nuestra RX

O corpo principal enviado para `/ai-handoff` tem estes campos:

```json
{
  "product": "semaglutide",
  "plan": "rush",
  "contact": {},
  "answers": {},
  "source": {}
}
```

Significado dos campos:

- `product`: tratamento escolhido, por exemplo `semaglutide` ou `tirzepatide`.
- `plan`: plano/oferta escolhido, por exemplo `rush`.
- `contact`: dados do lead, como nome, email, telefone, estado e endereço.
- `answers`: respostas clínicas da avaliação, usando os IDs das perguntas da Nuestra RX.
- `source`: origem da coleta, por exemplo WhatsApp e agente AWSales.

## De onde veio esse formato

Esse payload não foi inventado.

Ele veio de três lugares:

1. Arquivo `handoff-awsales-20260528/awsales_t64_schema.md`, enviado pela Nuestra RX.
2. Arquivo `handoff-awsales-20260528/sample_request.json`, também enviado pela Nuestra RX.
3. Teste real feito contra `https://webhook.nuestrarx.com/ai-handoff`, que retornou `ok: true` e `checkout_url`.

Ou seja, esse é o contrato atual do endpoint da Nuestra RX.

Se a Nuestra RX mudar o schema depois, a tool e o adapter precisam ser atualizados.

## Resultado validado

O teste final funcionou.

A AWSales chamou o webhook do n8n, o n8n corrigiu o body e enviou para a Nuestra RX.

A Nuestra RX respondeu:

```json
{
  "ok": true,
  "session_id": "98172146-1711-4527-8c48-09ea3ef62a7e",
  "lead_id": 246273,
  "checkout_url": "https://buy.nuestrarx.com/checkout?...",
  "product": "semaglutide",
  "plan": "rush",
  "tenant_id": 64
}
```

Com isso, a IA consegue pegar `checkout_url` e enviar o link para o lead finalizar a compra.
