# Inputs e Outputs das Campanhas — Tintim

Referência de configuração de INPUT (o que inicia a campanha) e OUTPUT / Evento de Conversão (o que encerra a participação do lead na campanha) de cada campanha do Tintim na AWSales. Modelo conceitual em `Estrutura/INPUT_OUTPUT_CAMPANHAS.md`.

Organização Tintim na AWSales: `effffee8-1d6a-49e5-8c91-8309d1af6e4f`.

## Resumo

| Campanha | Tipo | INPUT | OUTPUT (Evento de Conversão) | Status |
|---|---|---|---|---|
| SDR - Home e Site | Receptiva (inbound) | Lead chega pelo botão de WhatsApp do site (sem evento ativo) | CAL-INTEGRACAO / Reunião Programa de Parceiros (2153406) / Evento Agendado | Ativa |
| Venda - Não-MQL | Ativa (abre com template) | KOMMO-NAO-MQL / SDR Tintim - Nao-MQL (`sdr-nao-mql`) / CUSTOM_ACTION | Vindi: assinatura paga (PENDENTE) | Input pronto; output pendente |
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
- Validado ponta a ponta em 2026-07-24 (retornou 201, payload custom_action correto).
- OUTPUT (Evento de Conversão): assinatura criada na Vindi (`subscription_created`). EM CONSTRUÇÃO — endpoints prontos, aguardando o payload real da Vindi (24/07/2026).
  - Checkout: Vindi (Plano Inicial e Plano Escala — ver `Insumos/Link de checkout/`).
  - Plano: webhook de notificação da Vindi no evento de fatura paga -> n8n -> output da AWSales -> Venda para de vender; card -> "Venda ganha".
  - Evento escolhido: `subscription_created` (assinatura criada). Dispara uma vez, no signup — o `bill_paid`/fatura paga dispararia todo mês na renovação, por isso não serve. (Ressalva: assume checkout no cartão; com boleto a assinatura pode ser criada antes de pagar — refinar depois se preciso.)
  - Endpoints prontos (24/07/2026): webhook n8n que recebe da Vindi = `https://n8n.nonprod.awsales.io/webhook/integracao-vindi`; endpoint de output da AWSales = `.../organizations/effffee8-1d6a-49e5-8c91-8309d1af6e4f/credentials/output-vendas`.
  - Falta: (1) o Jorge ativar o webhook na Vindi apontando pro `integracao-vindi`; (2) capturar o payload real que a Vindi mandar; (3) montar o normalizer no fluxo n8n `integracao-vindi` (payload Vindi -> schema de output da AWSales) que posta no `output-vendas`; (4) setar o Evento de Conversão da Venda para a plataforma OUTPUT-VENDAS + evento subscription_created.
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
- Webhooks n8n (base `https://n8n.nonprod.awsales.io/webhook/`):
  - `integracao-cal` — Cal.com -> AWSales (normaliza booking). Doc: `Integrações n8n/Cal.com/CONFIG_INTEGRACAO_CAL.md`.
  - `tintim-kommo-card` — tool @atualizar_card_no_crm (cria/move card) + ramo de handoff. Doc: `Integrações n8n/Kommo/CONFIG_TOOLS_KOMMO.md`.
  - `kommo-cal` — recebe o handoff do tintim-kommo-card, normaliza e posta no kommo-nao-mql. (Nós: Webhook3 -> Normaliza handoff -> Registra na AWSales.)
  - `tintim-cal-horarios`, `tintim-cal-agendar`, `tintim-cal-cancelar` — tools do Cal. Doc: `Integrações n8n/Cal.com/CONFIG_TOOLS_CAL.md`.

## Pendências

- Venda: construir o OUTPUT (webhook Vindi de fatura paga -> n8n -> AWSales). Depende de acesso/config do painel Vindi do Tintim (Jorge).
- Toda a integração roda no n8n `nonprod` — confirmar se as campanhas de produção não deveriam usar um n8n de produção (uma queda do nonprod derruba tudo).
- Apagar o produto fantasma `AWSALES:effffee8-...` no cal-integracao.
- Documentar os nós Code do fluxo kommo-cal (`Normaliza handoff`) e o ramo `Filtra handoff` do tintim-kommo-card em `.js`, no padrão dos outros.
