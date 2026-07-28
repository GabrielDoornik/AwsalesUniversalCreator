# Checkout Champ — Webhooks (Export Profiles / Postbacks)

## Como funciona

Não é um sistema de webhook clássico com signing key. Checkout Champ usa **Export Profiles** configurados em **Admin → Exports → New Export Profile → tipo Postback**:

1. Crie o profile com nome e marque tipo **Postback** (alternativas: FTP, Email, S3).
2. Insira a URL **sem query string** no campo "URL" — você adiciona os campos via "Field Mappings", não direto na URL.
3. Configure **Field Mappings**: cada campo do order/transaction vira uma chave no postback. `Export Name` = nome da chave na requisição; `Field` = nome interno do campo no CKC.
4. Configure **Routing**: quais campanhas e quais eventos (sale, partial, cancel, refund, subscription_stop, decline, …) acionam esse profile.
5. Por padrão a entrega é **GET** com tudo na query. Trocar para **POST** é opcional (step 5 da config).

## Eventos exportáveis (selecionáveis no Routing)

- `SALE` — venda principal aprovada
- `PARTIAL` — venda parcial (sub-total, parcelas)
- `DECLINE` — recusa de cartão
- `CANCEL` — cancelamento manual / pelo customer
- `REFUND` — reembolso
- `CHARGEBACK` — chargeback recebido
- `SUBSCRIPTION_STOP` — assinatura cancelada
- `UPSELL` — upsell processado
- `RETURN` — devolução de produto físico

⚠️ Lista parcial — o conjunto exato depende da versão e dos addons habilitados no tenant. Validar em Admin → Exports → Field Mappings.

## Estrutura do payload

Não é envelope JSON padrão. **É flat**: cada Field Mapping vira um campo no postback.

Exemplo (GET):
```
GET https://seu-backend.com/ckc-postback?
  orderId=12345&
  customerId=67890&
  emailAddress=foo@bar.com&
  totalAmount=99.95&
  transactionId=tx_abc&
  campaignId=42&
  responseType=SUCCESS&
  productId_1=101&
  ...
```

Em POST, mesmos campos como `application/x-www-form-urlencoded` no body.

## Verificação / autenticação do postback

⚠️ **Crítico:** Checkout Champ **não tem HMAC nativo** equivalente ao NMI. A validação se faz por **uma combinação de**:

1. **IP allowlist** — só aceitar requisições vindas de:
   - `80.248.30.132`
   - `80.248.30.141`
   - `52.206.5.84`
   - `44.219.22.112`
2. **Shared secret em campo custom** — convencionalmente adiciona-se um Field Mapping com nome tipo `secret_token` e valor estático conhecido só pelo seu backend e pelo CKC. Seu endpoint compara o valor recebido com o esperado em tempo constante (`crypto.timingSafeEqual`).
3. **Cross-check via Query API** — para eventos críticos (refund/chargeback), seu handler dispara um `transactions/query/?transactionId=X` de volta ao CKC para confirmar que o evento existe e está no estado anunciado. Defesa contra replay/spoofing.

⚠️ Confirmar com Suporte CKC se há campo de signature/HMAC mais recente — pode existir feature liberada por addon.

## Limitações conhecidas

- **Test cards não exportam** pelo sistema de webhook. Para validar o fluxo end-to-end em homologação, use cartões reais com `paymentMethod=TEST` desativado ou peça ao CKC para emitir um cartão de validação.
- Não há retry automático visível no painel — se o seu endpoint cair, o evento **pode ser perdido**. Mitigação: gerar um job diário que faz `transactions/query/` por janela de data e reconcilia com seu DB.
- Sem `Idempotency-Key` no payload — usar `transactionId` (ou `orderId` + tipo) como chave de dedupe.

## Boas práticas no recebimento

1. **Idempotência**: dedupe por `transactionId` + `responseType`.
2. **IP allowlist + secret token** como primeira camada.
3. **Resposta 200 OK imediata**, processamento async em fila.
4. **Storage cold** do payload bruto + headers + IP de origem por ≥ 90 dias.
5. **Job de reconciliação noturno** via Query API para fechar a janela do que falhou.

## Integrações de webhook conhecidas (referência)

- Visiopt — exemplo de implementação de postback CKC → tracker
- Cometly — server-side conversion tracking via postback
- Everflow — afiliação via postback compartilhado
- Konnektive legacy — postback profiles continuam compatíveis no CKC
