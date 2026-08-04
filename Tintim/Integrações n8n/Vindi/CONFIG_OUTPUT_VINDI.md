# Configuração do Output de Vendas — Vindi -> AWSales via n8n (Tintim)

Status: CONSTRUÍDO no n8n, NÃO liberado. O fluxo existe e já recebeu payload real da Vindi (visto no pinData do Webhook4: `user-agent: Vindi-Hookshot/1.0`, evento `subscription_created`, subscription id 77088492, em 25/07/2026). Falta resolver o casamento do lead (ver seção abaixo) e setar o Evento de Conversão no painel da campanha. Export conferido em 2026-07-30.

Esta NÃO é uma tool. É a integração de OUTPUT (Evento de Conversão) da campanha Venda - Não-MQL: quando o lead assina na Vindi, a AWSales encerra a participação dele na campanha e a IA para de vender.

## Cadeia

```
Lead assina no checkout Vindi (Plano Inicial ou Plano Escala)
  -> Vindi dispara webhook de notificação (subscription_created)
    -> fluxo n8n integracao-vindi: Webhook4 -> Normaliza assinatura -> HTTP Request
      -> POST custom_action na credential output-vendas
        -> AWSales encerra o lead na campanha Venda - Não-MQL
```

Lado humano do CRM: card -> "Venda ganha". O lado perdido (lead não responde ou recusa) não depende da Vindi — o follow-up encerra quando esgota as tentativas e o card vai para "Venda perdida".

## Dados fixos

- Webhook n8n (entrada, vindo da Vindi): `https://n8n.nonprod.awsales.io/webhook/integracao-vindi` (POST, sem auth).
- Endpoint AWSales (saída): `https://app.awsales.io/api/webhooks/organizations/effffee8-1d6a-49e5-8c91-8309d1af6e4f/credentials/output-vendas` (POST, Body RAW JSON).
- Evento da Vindi consumido: `subscription_created`. Todos os outros (`test`, `bill_paid`, renovação mensal) são ignorados com `return []`.

Por que `subscription_created` e não `bill_paid`: `bill_paid` dispara a cada fatura, inclusive nas renovações mensais, e fecharia a campanha de novo todo mês. `subscription_created` dispara uma vez, no signup. Ressalva: assume checkout no cartão; com boleto a assinatura pode ser criada antes de o pagamento cair.

## Fluxo n8n "Tintim | Output de vendas"

```
Webhook4 (integracao-vindi) -> Code in JavaScript -> HTTP Request
```

1. Webhook4 — nó Webhook, POST, path `integracao-vindi`. Sem `responseMode`, então responde 200 na hora (onReceived). Correto para a Vindi, que só espera o ACK.
2. Code in JavaScript — nó Code. Filtra o evento e monta o payload de output como STRING (bodyJson). Código canônico: `Output de Vendas/Normaliza assinatura.js`.
3. HTTP Request — nó HTTP Request, POST na credential output-vendas, Body RAW `{{ $json.bodyJson }}`.

Os dois últimos nós estão com nome default no canvas. Renomear para "Normaliza assinatura" e "Registra output na AWSales".

## Casamento do lead (PENDÊNCIA CRÍTICA — bloqueia a liberação)

O output só encerra a campanha se a AWSales conseguir ligar o evento ao lead que está na conversa. Hoje os dois lados não têm nenhum campo em comum:

| | telefone | e-mail |
|---|---|---|
| INPUT da Venda (`kommo-nao-mql`) | real, E.164 com + | MOCKADO: `<telefone>@naoinformado.tintim.app` |
| OUTPUT da Vindi (`output-vendas`) | VAZIO (`lead.phone: ''`) | real, o que o comprador digitou no checkout |

Se a AWSales casa por telefone, o output não tem. Se casa por e-mail, o do input é falso. Nos dois casos a campanha de Venda nunca encerra e a IA continua vendendo para quem já comprou.

Duas frentes de conserto (fazer as duas):
1. Preencher `lead.phone` no `Normaliza assinatura` a partir do customer da Vindi. Conferir no payload real de onde vem (provavelmente `customer.phones[].number`, possivelmente `customer.code`) e normalizar em E.164 com `+`, no mesmo formato do input.
2. Confirmar no painel da AWSales qual campo é a chave de casamento do output. Se for e-mail, considerar coletar e-mail real no SDR antes do handoff, ou passar o telefone como chave.

Sem isso, não faz sentido setar o Evento de Conversão: o evento chega e não acha ninguém.

## Checklist para liberar

- [x] Jorge ativar o webhook na Vindi apontando para `integracao-vindi`.
- [x] Capturar o payload real da Vindi (feito em 25/07/2026, está no pinData do Webhook4).
- [x] Montar o normalizer (payload Vindi -> schema de output da AWSales).
- [ ] Resolver o casamento do lead (seção acima).
- [ ] Setar o Evento de Conversão da campanha Venda - Não-MQL: plataforma OUTPUT-VENDAS, evento `subscription_created`.
- [ ] Teste ponta a ponta: assinatura real (ou replay do payload gravado) -> conferir que o lead saiu da campanha na AWSales.

## Pendências / hardening

- `HTTP Request` sem `onError: continueRegularOutput` (os outros posts para a AWSales também não têm em todos os fluxos; padronizar). Se a AWSales devolver erro, a execução falha e ninguém trata.
- `HTTP Request` não manda `Accept: application/json`; os outros dois posts para a AWSales mandam. Padronizar.
- Webhook `integracao-vindi` sem auth e sem validação de assinatura da Vindi. Qualquer um que descubra a URL pode encerrar leads na campanha. Para produção: validar o secret/assinatura do webhook da Vindi.
- `metadata.valor` vem de `product_items[0].pricing_schema.short_format` — assume um item só na assinatura. Se o plano passar a ter mais de um item, o valor sai incompleto.
- O pinData do Webhook4 guarda um payload real com dados de cliente. Não copiar para arquivo versionado (o repositório é público).
