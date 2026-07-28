# Configuração do nó "Tool http" no n8n — Plataforma Uno

## Method
POST

## URL
```
https://api.unobject.com.br/v1/scheduler/create
```

---

## Autenticação — duas opções

### Opção A (simples) — Authentication: None + Headers hardcodados

Deixar `Authentication: None` e colar no JSON de Headers (Send Headers ON, Specify Headers: Using JSON):

```json
{
  "x-uno-access-token": "BA779B6447B12E3F0150",
  "x-uno-secret-key": "d59217553f292c649dc74cbbbd14098eab16b26247b3e87e6c"
}
```

### Opção B (segura) — Generic Credential Type: Custom Auth

1. Authentication: **Generic Credential Type**
2. Generic Auth Type: **Custom Auth**
3. Criar nova credential com nome `Uno Plataforma D'Leon` e colar em **Credential Data (JSON)**:

```json
{
  "headers": {
    "x-uno-access-token": "BA779B6447B12E3F0150",
    "x-uno-secret-key": "d59217553f292c649dc74cbbbd14098eab16b26247b3e87e6c"
  }
}
```

4. Salvar a credential
5. Esvaziar o JSON de Headers do nó (ou desligar Send Headers) — a Custom Auth injeta os headers automaticamente

> Por que Custom Auth e não Header Auth: Header Auth aceita só 1 header. Custom Auth aceita N headers (e ainda query params, body, etc.).

---

## Send Headers (ON) — apenas se usar Opção A

```json
{
  "x-uno-access-token": "BA779B6447B12E3F0150",
  "x-uno-secret-key": "d59217553f292c649dc74cbbbd14098eab16b26247b3e87e6c"
}
```

---

## Send Body (ON) — Body Content Type: JSON — Specify Body: Using JSON

```json
{
  "date": "{{ $('Webhook1').item.json.body.date }}",
  "hour": "{{ $('Webhook1').item.json.body.hour }}",
  "name": "{{ $('Webhook1').item.json.body.name }}",
  "cellPhone": "{{ $('Webhook1').item.json.body.cellPhone }}",
  "serviceId": "{{ $('Webhook1').item.json.body.serviceId }}",
  "observation": "{{ $('Webhook1').item.json.body.observation }}"
}
```

---

## Observação

Se o nó **Code in JavaScript** já estiver transformando o payload (ex: `return items[0].json.body`), trocar as expressões para a forma curta:

```json
{
  "date": "{{ $json.date }}",
  "hour": "{{ $json.hour }}",
  "name": "{{ $json.name }}",
  "cellPhone": "{{ $json.cellPhone }}",
  "serviceId": "{{ $json.serviceId }}",
  "observation": "{{ $json.observation }}"
}
```
