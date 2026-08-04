# Mensagem de Abertura — Upsell Desafio: Primeira Venda em 72H00

```
Parabéns e seja muito bem-vindo(a) ao Profissão Home Sales, [nome]!

Aqui é o concierge virtual da equipe Pablo Marçal. Vou te ajudar com os primeiros passos, pode ser?

As informações de acesso vão pro seu e-mail (o mesmo da compra). Procure por "Profissão Home Sales", inclusive no Spam e na aba Promoções.
Ou acesse direto:

{{link_area_de_membros}}

Login: e-mail da compra | Senha: enviada no e-mail de confirmação
Qualquer dificuldade, fala comigo: {{link_suporte_whatsapp}}

E pra você não travar só na teoria: o Profissão Home Sales te dá o método, mas é ter acompanhamento nos primeiros dias que decide se você já sai vendendo ou fica parado(a). No Desafio: Primeira Venda em 72H00 você tem um passo a passo guiado pra fechar sua primeira comissão em até 72 horas.

Toca em Quero comprar e garanta agora em 12x de R$10,03 ou R$97 à vista.

Ao tocar, a cobrança é feita automaticamente no mesmo método que você usou no Profissão Home Sales, sem abrir página nem preencher nada.

Boas aulas!

[Quero comprar]
[Acessar Profissão Home Sales]
```

## Variáveis usadas

- `{{link_area_de_membros}}` = https://pablomarcal.cademi.com.br/auth/login
- `{{link_suporte_whatsapp}}` = https://wa.me/5511997269378

## Observações

- Sem emoji (regra de abertura/HSM da AWSales).
- Preço parcelado citado antes do à vista.
- Botão "Quero comprar" já entrega a explicação do One Click inline — no checkpoint isso conta como o "sim" do Bloco CONSENT (ver Bloco 0 do `Checkpoint.md`), pulando direto para o Bloco COMPRA.
- Botão "Acessar Profissão Home Sales" é só acesso ao front, sem gatilho de compra.
