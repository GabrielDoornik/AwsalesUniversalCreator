# Input e Output de Campanhas AWSales

Este documento registra o modelo operacional de input e output usado nas campanhas da AWSales quando existe integracao com sistemas externos.

## Visao geral

Uma campanha pode ser iniciada, atualizada ou encerrada a partir de eventos vindos de plataformas externas, como checkout, gateway de pagamento, formulario, CRM ou sistema proprio do cliente.

Fluxo padrao:

```txt
Sistema externo
Checkout / forms / CRM / gateway
        ↓
Webhook no n8n
        ↓
Normalizer em Code node
        ↓
HTTP Request para AWSales
        ↓
AWSales cria/atualiza objeto no banco
        ↓
Esse objeto vira input ou output da campanha
```

## Input

Input e o evento que da motivo para a campanha comecar ou continuar.

Exemplos comuns:

- Carrinho abandonado.
- Cartao recusado.
- Pix expirado.
- Lead abandonou um formulario.
- Lead chegou em uma etapa especifica do funil.
- Lead gerou checkout mas nao pagou.

Na pratica, o n8n recebe o payload externo, normaliza os campos para o formato esperado pelo AWSales e envia esse evento para o sistema. O AWSales registra esse objeto e usa ele como entrada da campanha.

## Output

Output e o evento que mostra que o objetivo da campanha foi concluido ou que a campanha deve parar/alterar estado.

Exemplos comuns:

- Compra aprovada.
- Pagamento capturado.
- Assinatura criada.
- Lead comprou depois de uma recuperacao.
- Evento de conclusao que torna desnecessario continuar conversando.

Quando um output de sucesso chega, a IA deve parar de insistir no objetivo antigo, porque ele ja foi concluido. Exemplo: se a campanha era recuperacao de checkout e chega compra aprovada, a campanha nao deve continuar cobrando o lead para comprar.

## Papel do n8n

O n8n e a camada de integracao entre o sistema externo e o AWSales.

Responsabilidades do n8n:

- Receber o payload bruto no webhook.
- Identificar o tipo de evento.
- Normalizar campos importantes.
- Mapear o evento externo para um evento interno AWSales.
- Enviar para o endpoint correto do AWSales via HTTP Request.
- Evitar duplicidades quando o sistema externo envia autosaves ou retries.

## Exemplo generico

### Recuperacao de venda

```txt
Checkout envia cartao recusado
        ↓
n8n recebe payload
        ↓
n8n normaliza para evento de input
        ↓
AWSales cria input de recuperacao de pagamento
        ↓
Campanha chama o lead no WhatsApp
```

### Encerramento por compra

```txt
Checkout/gateway envia compra aprovada
        ↓
n8n recebe payload
        ↓
n8n normaliza para evento de output
        ↓
AWSales registra compra aprovada
        ↓
Campanha de recuperacao para de conversar
```

## Nota sobre links que ja abrem WhatsApp

Nem todo evento do formulario precisa virar disparo ativo da AWSales.

Se o proprio site ja direciona o usuario para o WhatsApp da IA, como no botao:

```txt
Continuar la atencion por WhatsApp con un agente
```

entao o lead chega de forma receptiva/inbound no numero da IA. Nesse caso, nao e necessario criar um input para disparar uma mensagem ativa nesse exato momento.

O evento ainda pode ser util para:

- Guardar contexto da sessao.
- Associar `session_id`, `dosable_session_id`, telefone e link de retomada.
- Ajudar a IA a entender de onde o lead veio quando ele chamar no WhatsApp.
- Auditar o funil.

Mas a acao principal de abrir o WhatsApp ja foi feita pelo site.

## Aplicacao no forms-site Nuestra RX

No forms-site da Nuestra RX, os eventos precisam ser avaliados pelo momento do funil:

- `wa-handoff`: o site ja abriu o WhatsApp da IA; nao precisa disparo ativo imediato.
- `intake_progress`: normalmente representa progresso/autosave; pode atualizar estado, mas nao necessariamente vira campanha.
- `intake_plan_selected`: evento forte para recuperacao de checkout, porque ja traz `checkout_url`.
- Compra aprovada vinda de CKC/NMI: output para parar recuperacao.

Antes de transformar qualquer payload em input/output, confirmar se ele representa uma acao real de campanha ou apenas um autosave tecnico.
