# Eventos do Worker Nuestra RX para AWSales

## Resposta do Willian

Willian confirmou que pode criar um durable object por `session_id` com alarme.

Com isso, o Worker passa a emitir:

```text
intake_abandoned
```

Timeout informado:

```text
20 minutos
```

Isso significa que o Worker, e não o n8n, fica responsável por esperar o lead parar de interagir antes de declarar abandono.

## Decisão de integração

Não usar mais `intake_progress` como gatilho direto de campanha de abandono.

Motivo:

`intake_progress` também chega enquanto o lead está preenchendo o formulário normalmente. Ele é snapshot/progresso, não abandono confirmado.

Gatilho correto de abandono de formulário:

```text
intake_abandoned
```

## Validação pós-ajuste do Worker

Pasta analisada:

```text
docs/forms-site/payload dps da att do willian/
```

Cenário `abandono`:

- `1.json`: `intake_partial`, step `4`, contato capturado.
- `2.json`: `intake_abandoned`, step `gastricBypass`, mesmo `tracking.session_id`.
- `abandon.reason`: `inactivity_timeout`
- `abandon.idle_seconds`: `1200`
- `abandon.last_event`: `intake_progress`
- `abandon.detected_at`: `2026-06-05T19:32:42.681Z`

Conclusão:

```text
O Worker realmente emitiu intake_abandoned depois de 20 minutos de inatividade.
```

Cenário `Lead chegou no checkout`:

- `1.json`: `intake_partial`
- `2.json`: `intake_submitted`
- `3.json`: `intake_plan_selected` com `checkout_url`
- `4.json`: arquivo vazio, ignorado na análise.

Conclusão:

```text
Quem conclui e chega ao checkout não gera intake_abandoned nesse teste.
```

## Como o n8n deve tratar cada evento

### `intake_partial`

Significado:

Contato capturado.

Tratamento:

```text
Não enviar campanha.
Guardar apenas como contexto/debug.
```

No normalizador:

```text
event_kind = contact_captured
should_send_to_awsales_now = false
```

### `intake_progress`

Significado:

Snapshot/progresso/autosave do formulário.

Tratamento:

```text
Não enviar campanha.
Guardar apenas como contexto/debug.
```

No normalizador:

```text
event_kind = form_progress_snapshot
should_send_to_awsales_now = false
```

### `intake_abandoned`

Significado:

Abandono confirmado pelo Worker depois de 20 minutos sem avanço por `session_id`.

Tratamento:

```text
Enviar para AWSales imediatamente.
```

No normalizador:

```text
event_kind = form_abandonment_confirmed
awsales_event = form_response_partial
should_send_to_awsales_now = true
debounce_minutes = 0
```

Metadata preservado:

```text
abandon_reason
abandon_idle_seconds
abandon_last_step
abandon_last_event
abandon_detected_at
```

Timestamp usado pelo payload AWSales:

```text
abandon.detected_at
```

### `intake_submitted`

Significado:

Formulário/consentimento concluído.

Tratamento:

```text
Não tratar como abandono.
```

No normalizador:

```text
event_kind = form_completed_no_checkout
should_send_to_awsales_now = false
```

### `intake_plan_selected`

Significado:

Lead chegou no checkout e existe `checkout_url`.

Tratamento:

```text
Checkout abandonment / reaquecimento de checkout.
```

Ainda pode precisar de uma regra própria de debounce/pagamento, porque o lead pode pagar logo depois de chegar ao checkout.

No normalizador atual:

```text
event_kind = checkout_abandonment
awsales_event = form_response
should_send_after_debounce = true
debounce_minutes = 10
```

## Fluxo recomendado no n8n agora

Para abandono de formulário:

```text
Webhook -> Code normalizer -> IF should_send_to_awsales_now === true -> HTTP AWSales
```

O IF deve testar:

```text
{{ $json.routing.should_send_to_awsales_now }}
```

Quando for `true`, enviar:

```text
{{ $json.awsales_payload_json }}
```

como Raw JSON para AWSales.

## O que mudou no normalizador

Arquivo:

```text
docs/forms-site/normalize-abandono-awsales.n8n.js
```

Mudanças:

- `intake_abandoned` agora vira `form_abandonment_confirmed`.
- `intake_abandoned` envia imediatamente para AWSales.
- `intake_progress` não dispara campanha.
- `intake_partial` não dispara campanha.
- `intake_plan_selected` continua separado como checkout abandonment.
