# Configuração do Handoff Não-MQL — Kommo -> AWSales via n8n (Tintim)

Status: IMPLEMENTADO e em produção. Validado ponta a ponta em 2026-07-24 (retornou 201, payload custom_action correto). Export conferido em 2026-07-30.

Esta NÃO é uma tool (a IA não chama diretamente). É a integração de INPUT da campanha Venda - Não-MQL: quando o SDR classifica um lead como não-MQL e move o card para "Oferta Enviada", esse movimento vira um `custom_action` na AWSales, que abre a campanha de Venda com o lead.

## Cadeia completa

```
SDR classifica não-MQL
  -> Utilize a tool para atualizar o card no CRM para a etapa Oferta Enviada @atualizar_card_no_crm
    -> fluxo tintim-kommo-card: Monta resposta -> Filtra handoff (status_id 106939427?)
      -> Chama kommo-cal (POST no webhook kommo-cal)
        -> fluxo kommo-cal: Webhook3 -> Normaliza handoff -> Registra na AWSales
          -> POST custom_action na credential kommo-nao-mql (source.id sdr-nao-mql)
            -> abre a campanha Venda - Não-MQL com o lead
```

Por que "Oferta Enviada" é gatilho limpo: só o não-MQL cai lá. O MQL segue para "Agência / Parceiros" -> "Reunião Marcada", e o MQL que precisa de humano vai para "Handoff Humano Necessário". Confirmado com o cliente em 2026-07-24.

## Dados fixos

- Webhook n8n (entrada): `https://n8n.nonprod.awsales.io/webhook/kommo-cal` (POST, sem auth).
- Endpoint AWSales (saída): `https://app.awsales.io/api/webhooks/organizations/effffee8-1d6a-49e5-8c91-8309d1af6e4f/credentials/kommo-nao-mql` (POST, Body RAW JSON, header `Accept: application/json`).
- Produto que a AWSales materializa: `sdr-nao-mql` / name "SDR Tintim - Nao-MQL", criado a partir do `source.id` que o normalizer envia.
- Etapa gatilho: Oferta Enviada, status_id 106939427, pipeline IA [Awsales] 13859031.

Nome do fluxo no canvas: os nós estão com nome default (`Webhook3`). O grupo não tem sticky note. Recomendado batizar de "Tintim | Handoff Não-MQL" para casar com esta doc.

## Lado 1 — ramo de handoff dentro do fluxo tintim-kommo-card

Dois nós enxertados no fim do fluxo da tool do Kommo:

### Filtra handoff (Code)
Recebe a saída do "Monta resposta" e corta o ramo com `return []` quando a etapa não é Oferta Enviada. Código canônico: `Atualizar Card/Filtra handoff.js`.

### Chama kommo-cal (HTTP Request)
- POST `https://n8n.nonprod.awsales.io/webhook/kommo-cal`
- Body Content Type: RAW. Content Type: `application/json`. Body: `{{ $json.bodyJson }}`
- Settings -> On Error: Continue

Chamada n8n -> n8n com a base hard-coded no ambiente. Se a infra migrar para `flow.awsales.io`, este é um dos pontos que quebra silenciosamente (o outro é a URL configurada nas tools da AWSales).

## Lado 2 — fluxo kommo-cal

```
Webhook3 (kommo-cal) -> Normaliza handoff -> Registra na AWSales
```

1. Webhook3 — nó Webhook, POST, path `kommo-cal`. Sem `responseMode`, então responde 200 na hora (onReceived). Correto: quem chama é o outro fluxo do n8n, não a IA.
2. Normaliza handoff — nó Code. Traduz para o schema de input da AWSales. Código canônico: `Handoff Não-MQL/Normaliza handoff.js`.
3. Registra na AWSales — nó HTTP Request, POST na credential kommo-nao-mql, Body RAW `{{ $json.bodyJson }}`, header `Accept: application/json`, On Error: Continue.

## E-mail mockado (decisão consciente, com efeito colateral)

O schema de input da AWSales exige e-mail, e o não-MQL geralmente não informou nenhum (o SDR só coleta e-mail de quem vai agendar). O normalizer gera `<telefone>@naoinformado.tintim.app` quando falta.

Efeito colateral a resolver: o lead entra na Venda com telefone real e e-mail falso. O OUTPUT da Venda (assinatura na Vindi) traz o e-mail REAL do comprador e nenhum telefone, então os dois não casam por nenhum campo. Ver "Casamento do lead" em `../Vindi/CONFIG_OUTPUT_VINDI.md`.

## Pendências

- `Filtra handoff` ignora se o CRM deu certo: dispara o handoff mesmo na rota `erro` da busca (401/500) ou quando o "Cria card" falha, abrindo a Venda para um lead sem card em Oferta Enviada. Fix de uma linha: `if (!$input.first().json.ok) return [];`
- Posição no canvas: `Filtra handoff` (y 624) está acima do `Respond to Webhook` (y 816). Com executionOrder v1 a cadeia de handoff roda antes de a tool responder para a IA, somando latência (kommo-cal -> AWSales) na resposta de `@atualizar_card_no_crm`. Subir o Respond para y menor que 624.
- Sem dedup: se a IA chamar a tool duas vezes com "Oferta Enviada", saem dois `custom_action`. Confirmar se a AWSales deduplica por lead; se não, guardar estado ou checar a etapa atual do card antes de disparar.
- Webhook sem auth (mesma pendência de hardening dos outros fluxos).
- Batizar os nós e criar o sticky note do grupo.
