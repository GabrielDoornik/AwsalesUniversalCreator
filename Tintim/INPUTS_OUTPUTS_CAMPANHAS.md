# Inputs e Outputs das Campanhas — Tintim

Referência de configuração de INPUT (o que inicia a campanha) e OUTPUT / Evento de Conversão (o que encerra a participação do lead na campanha) de cada campanha do Tintim na AWSales. Modelo conceitual em `Estrutura/INPUT_OUTPUT_CAMPANHAS.md`.

Organização Tintim na AWSales: `effffee8-1d6a-49e5-8c91-8309d1af6e4f`.

## Resumo

| Campanha | Tipo | INPUT | OUTPUT (Evento de Conversão) | Status |
|---|---|---|---|---|
| SDR - Home e Site | Receptiva (inbound) | Lead chega pelo botão de WhatsApp do site (sem evento ativo) | CAL-INTEGRACAO / Reunião Programa de Parceiros (2153406) / Evento Agendado | Ativa |
| Venda - Não-MQL | Ativa (abre com template) | KOMMO-NAO-MQL / SDR Tintim - Nao-MQL (`sdr-nao-mql`) / CUSTOM_ACTION | OUTPUT-VENDAS / Vindi `subscription_created` | Input pronto; output construído no n8n, não liberado |
| Lembrete - Comparecimento | Ativa (abertura + Sequência de Lembretes) | CAL-INTEGRACAO / Reunião Programa de Parceiros (2153406) / meeting_scheduled | Não tem evento de conversão (comparecimento não é detectável; cancelamento é tratado no nível da reunião) | Ativa |

## 1. SDR - Home e Site

- Tipo: receptiva. O lead manda a 1ª mensagem pelo botão de WhatsApp do site. Não há evento de input ativo nem mensagem de abertura da IA.
- OUTPUT (Evento de Conversão), configurado no painel:
  - Plataforma de conclusão: CAL-INTEGRACAO
  - Produto de atuação: Reunião Programa de Parceiros (id `2153406`)
  - Evento: Evento Agendado (= `meeting_scheduled`)
  - Ou seja: o SDR conclui quando a reunião do MQL é agendada no Cal.
- Observação: esse evento de conversão só fecha o SDR para o MQL que agenda. O não-MQL não dispara ele — sai pelo handoff (vira input da Venda) e o Follow-Up Inteligente dá SKIP para ele.

## 2. Venda - Não-MQL

- Tipo: ativa. Abre a janela com template quando um lead não-MQL é encaminhado.
- INPUT (Eventos de Input), configurado no painel:
  - Plataforma de Origem: KOMMO-NAO-MQL (credential `kommo-nao-mql`)
  - Produto de atuação: SDR Tintim - Nao-MQL (`source.id = sdr-nao-mql`)
  - Evento: CUSTOM_ACTION (= `custom_action`)
- Mecanismo do handoff (como o input dispara):
  ```
  SDR classifica não-MQL -> move card p/ "Oferta Enviada" (@atualizar_card_no_crm)
    -> fluxo n8n tintim-kommo-card detecta status_id 106939427
      -> ramo "Filtra handoff" -> "Chama kommo-cal" (POST no webhook kommo-cal)
        -> fluxo n8n kommo-cal: Normaliza handoff -> Registra na AWSales
          -> POST custom_action no endpoint kommo-nao-mql (source.id sdr-nao-mql)
            -> abre a campanha de Venda com o lead
  ```
- Validado ponta a ponta em 2026-07-24 (retornou 201, payload custom_action correto). Doc reproduzível do handoff: `Integrações n8n/Kommo/CONFIG_HANDOFF_NAO_MQL.md`.
- OUTPUT (Evento de Conversão): assinatura criada na Vindi (`subscription_created`). CONSTRUÍDO NO N8N, NÃO LIBERADO (auditoria de 30/07/2026). Doc completa: `Integrações n8n/Vindi/CONFIG_OUTPUT_VINDI.md`.
  - Checkout: Vindi (Plano Inicial e Plano Escala — ver `Insumos/Link de checkout/`).
  - Plano: webhook de notificação da Vindi no evento de assinatura criada -> n8n -> output da AWSales -> Venda para de vender; card -> "Venda ganha".
  - Evento escolhido: `subscription_created` (assinatura criada). Dispara uma vez, no signup — o `bill_paid`/fatura paga dispararia todo mês na renovação, por isso não serve. (Ressalva: assume checkout no cartão; com boleto a assinatura pode ser criada antes de pagar — refinar depois se preciso.)
  - Endpoints: webhook n8n que recebe da Vindi = `https://n8n.nonprod.awsales.io/webhook/integracao-vindi`; endpoint de output da AWSales = `.../organizations/effffee8-1d6a-49e5-8c91-8309d1af6e4f/credentials/output-vendas`.
  - FEITO: (1) Jorge ativou o webhook na Vindi; (2) payload real capturado em 25/07/2026 (evento `subscription_created`, subscription id 77088492, gravado no pinData do Webhook4); (3) normalizer montado no fluxo `integracao-vindi` (Webhook4 -> Code in JavaScript -> HTTP Request).
  - FALTA: (4) resolver o casamento do lead, que é BLOQUEADOR (ver abaixo); (5) setar o Evento de Conversão da Venda para a plataforma OUTPUT-VENDAS + evento subscription_created; (6) teste ponta a ponta.
  - BLOQUEADOR (casamento do lead): o input e o output não têm nenhum campo em comum. O lead entra na Venda pelo `kommo-nao-mql` com telefone real e e-mail MOCKADO (`<telefone>@naoinformado.tintim.app`, porque o schema exige e-mail e o não-MQL não informou nenhum); o output da Vindi manda o e-mail REAL do comprador e `lead.phone` VAZIO. Casando por telefone, o output não tem; casando por e-mail, o do input é falso. Nos dois casos a campanha nunca encerra e a IA segue vendendo para quem já comprou. Conserto: preencher `lead.phone` no normalizer a partir do customer da Vindi e confirmar no painel qual campo é a chave de casamento.
  - O lado "perdido" (lead não responde / recusa) não precisa da Vindi — o follow-up encerra quando esgota as tentativas; card -> "Venda perdida".

## 3. Lembrete - Comparecimento

- Tipo: ativa. Dispara a abertura quando a reunião é agendada e roda a Sequência de Lembretes (8h antes + 1h antes) antes da reunião.
- INPUT:
  - Plataforma: CAL-INTEGRACAO (credential `cal-integracao`)
  - Produto: Reunião Programa de Parceiros (id `2153406`)
  - Evento: `meeting_scheduled`
- OUTPUT: NÃO tem evento de conversão configurado, de propósito. Motivos: (1) comparecimento não é detectável — não existe sinal de que o lead entrou na call; (2) os lembretes são amarrados ao horário da reunião, então se esgotam sozinhos depois do horário; (3) cancelamento/remarcação é tratado no nível da REUNIÃO, não da campanha — quando o lead cancela (ou reagenda), o Cal dispara BOOKING_CANCELLED/CREATED, o `cal-integracao` atualiza o objeto da reunião na AWSales, e a Sequência de Lembretes para (ou reprograma) sozinha por estar amarrada àquela reunião. Validar num teste real de cancelamento que os lembretes realmente param.

## Objetos / produtos e armadilhas

- **cal-integracao** expõe dois produtos:
  - `2153406` (name "Reunião Programa de Parceiros") -> o CERTO. É o eventTypeId real do Cal; todo booking real manda esse id. SDR (output) e Lembrete (input) devem apontar aqui.
  - `AWSALES:effffee8-...` -> FANTASMA, criado por uma injeção de teste antiga sem `source`. Ignorar ou apagar. Cuidado: os dois têm o mesmo nome no dropdown; confirmar sempre que é o `2153406`.
- **kommo-nao-mql** expõe o produto `sdr-nao-mql` (name "SDR Tintim - Nao-MQL"), criado a partir do `source.id` que o normalizer do kommo-cal envia.

## Endpoints e fluxos n8n (referência)

- Endpoints de input/output da AWSales (base `.../organizations/effffee8-1d6a-49e5-8c91-8309d1af6e4f/credentials/`):
  - `cal-integracao` (reuniões: input do Lembrete, output do SDR)
  - `kommo-nao-mql` (handoff não-MQL: input da Venda)
- Endpoint de output da AWSales: `output-vendas` (assinatura Vindi: output da Venda).
- Webhooks n8n (base `https://n8n.nonprod.awsales.io/webhook/`):
  - `integracao-cal` — Cal.com -> AWSales (normaliza booking). Doc: `Integrações n8n/Cal.com/CONFIG_INTEGRACAO_CAL.md`.
  - `tintim-kommo-card` — tool @atualizar_card_no_crm (cria/move card) + ramo de handoff. Doc: `Integrações n8n/Kommo/CONFIG_TOOLS_KOMMO.md`.
  - `kommo-cal` — recebe o handoff do tintim-kommo-card, normaliza e posta no kommo-nao-mql. (Nós: Webhook3 -> Normaliza handoff -> Registra na AWSales.) Doc: `Integrações n8n/Kommo/CONFIG_HANDOFF_NAO_MQL.md`.
  - `integracao-vindi` — recebe a notificação da Vindi, filtra subscription_created e posta no output-vendas. (Nós: Webhook4 -> Code in JavaScript -> HTTP Request.) Doc: `Integrações n8n/Vindi/CONFIG_OUTPUT_VINDI.md`.
  - `tintim-cal-horarios`, `tintim-cal-agendar`, `tintim-cal-cancelar` — tools do Cal. Doc: `Integrações n8n/Cal.com/CONFIG_TOOLS_CAL.md`.

## Pendências

- Venda: liberar o OUTPUT. O fluxo n8n está construído e já recebeu payload real da Vindi; falta resolver o casamento do lead (bloqueador, ver seção 2) e setar o Evento de Conversão no painel.
- Toda a integração roda no n8n `nonprod` — confirmar se as campanhas de produção não deveriam usar um n8n de produção (uma queda do nonprod derruba tudo).
- Apagar o produto fantasma `AWSALES:effffee8-...` no cal-integracao.
- Handoff do não-MQL: o `Filtra handoff` dispara mesmo quando a operação no CRM falhou (abre a Venda para lead sem card em Oferta Enviada) e está posicionado de forma que a cadeia de handoff roda antes de a tool responder à IA. Ver pendências em `Integrações n8n/Kommo/CONFIG_HANDOFF_NAO_MQL.md`.

Feito em 30/07/2026: auditoria do canvas do n8n contra o repositório. Os 9 nós Code já versionados batem byte a byte; os 3 que faltavam (`Filtra handoff`, `Normaliza handoff`, normalizer da Vindi) foram documentados em `.js`, e os fluxos kommo-cal e integracao-vindi ganharam doc reproduzível.
