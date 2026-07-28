# Mensagens de Disparo - Simpla Invest | Captação Página SII EI29

Objetivo das mensagens: abrir janela de conversa para o agente assumir e enviar o link rastreável de cadastro. O objetivo principal da campanha é fazer o lead se cadastrar na página de captação.

Categoria sugerida: MARKETING

Link da campanha para uso pelo agente após resposta do lead:
https://sou.simplainvest.com.br/cursogratuito-aws

## Abertura principal

Nome sugerido: `simpla_sii_captacao_abertura_v1`

```text
Oi, tudo bem?

A Simpla Invest abriu a inscrição para a Semana do Investidor Iniciante, com 4 aulas gratuitas e ao vivo para quem quer começar a investir com mais segurança.

As aulas acontecem nos dias 11, 12, 13 e 18 de maio, sempre às 20h.

Quer que eu te envie o caminho oficial para fazer sua inscrição gratuita?
```

Botões:

- Quero o link
- Não tenho interesse

## Abertura com dor

Nome sugerido: `simpla_sii_captacao_abertura_v2`

```text
Oi, tudo bem?

Se você ainda deixa dinheiro parado na poupança, CDB ou conta-corrente porque não sabe exatamente onde investir, a Semana do Investidor Iniciante pode te ajudar a dar os primeiros passos.

São 4 aulas gratuitas e ao vivo, nos dias 11, 12, 13 e 18 de maio, às 20h.

Quer receber o link oficial para fazer sua inscrição?
```

Botões:

- Quero me inscrever
- Não quero

## Abertura com prazo

Nome sugerido: `simpla_sii_captacao_abertura_v3`

```text
Oi, tudo bem?

As inscrições para a Semana do Investidor Iniciante estão abertas.

O evento é gratuito, ao vivo e começa no dia 11 de maio, às 20h. Depois do cadastro, você recebe o acesso ao grupo oficial com os avisos das aulas.

Quer que eu te mande o link oficial de cadastro?
```

Botões:

- Mandar link
- Não tenho interesse

## Contingência Marketing - Mais Forte

Use esta versão caso as aberturas mais conservadoras não aprovem ou não performem bem.

Nome sugerido: `simpla_sii_captacao_marketing_v1`

Categoria sugerida: MARKETING

```text
Oi, tudo bem?

Se você quer começar a investir, mas ainda trava por medo de escolher errado, deixar dinheiro parado ou não saber por onde começar, a Simpla Invest abriu uma série gratuita para te ajudar.

A Semana do Investidor Iniciante acontece nos dias 11, 12, 13 e 18 de maio, às 20h, com aulas ao vivo para quem quer sair do básico e investir com mais segurança.

Quer que eu te envie o link oficial da inscrição gratuita?
```

Botões:

- Quero me inscrever
- Não tenho interesse

## Contingência Marketing - Forte com Botão de Link

Use esta versão quando a estratégia for mandar o lead direto para a página de cadastro pelo botão URL, sem resposta rápida.

Nome sugerido: `simpla_sii_captacao_marketing_url_v1`

Categoria sugerida: MARKETING

```text
Oi, tudo bem?

Se você quer começar a investir, mas ainda trava por medo de escolher errado, deixar dinheiro parado ou não saber por onde começar, a Simpla Invest abriu uma série gratuita para te ajudar.

A Semana do Investidor Iniciante acontece nos dias 11, 12, 13 e 18 de maio, às 20h, com aulas ao vivo para quem quer sair do básico e investir com mais segurança.

Faça sua inscrição gratuita pelo botão abaixo.
```

Botão:

- URL: Fazer inscrição
- Link: https://sou.simplainvest.com.br/cursogratuito-aws

## Contingência Marketing - Prova e Autoridade

Nome sugerido: `simpla_sii_captacao_marketing_v2`

Categoria sugerida: MARKETING

```text
Oi, tudo bem?

O Rufino, fundador da Simpla Wealth, vai conduzir uma série gratuita para quem quer entender como começar a investir com mais segurança e evitar erros comuns de iniciante.

São 4 aulas ao vivo nos dias 11, 12, 13 e 18 de maio, sempre às 20h.

Quer receber o link oficial para fazer sua inscrição gratuita?
```

Botões:

- Receber link
- Não quero

## Contingência Marketing - Dor Direta

Nome sugerido: `simpla_sii_captacao_marketing_v3`

Categoria sugerida: MARKETING

```text
Oi, tudo bem?

Poupança, CDB e conta-corrente até parecem seguros, mas muita gente fica presa neles porque não sabe como dar o próximo passo com clareza.

Por isso a Simpla Invest abriu a Semana do Investidor Iniciante: 4 aulas gratuitas e ao vivo para aprender os primeiros passos para investir com mais segurança.

Quer que eu te mande o link de inscrição?
```

Botões:

- Quero o link
- Não quero

## FUP 1 - Sem resposta

Nome sugerido: `simpla_sii_captacao_fup1`

```text
Passando só para reforçar:

A Semana do Investidor Iniciante começa em 11 de maio, às 20h, com aulas gratuitas e ao vivo da Simpla Invest.

O cadastro leva poucos minutos e libera o grupo oficial com os avisos das aulas.

Quer que eu te envie o link?
```

Botões:

- Quero o link
- Não quero

## FUP 2 - Último toque

Nome sugerido: `simpla_sii_captacao_fup2`

```text
Último aviso por aqui:

A primeira aula da Semana do Investidor Iniciante acontece em 11 de maio, às 20h.

Se quiser participar, o próximo passo é preencher o cadastro oficial e responder as perguntas de perfil para liberar o grupo do evento.

Quer receber o link de inscrição?
```

Botões:

- Receber link
- Não quero

## Resposta esperada do agente após botão positivo

Use esta lógica no bot, não como template:

```text
Boa. O cadastro é por esse link oficial:
{{link_captura}}

É só preencher nome, e-mail e WhatsApp, responder as três perguntas de perfil e, no final, entrar no grupo oficial

Consegue preencher agora e me avisar quando aparecer o grupo?
```

## Observações operacionais

- Não usar variável de nome na mensagem de disparo.
- A abertura é para gerar resposta e abrir janela.
- O link rastreável deve ser enviado pelo agente depois da resposta positiva.
- Se a operação preferir mandar link direto no template, usar botão de URL com o mesmo link rastreável da planilha.
- Não prometer rentabilidade, retorno financeiro ou recomendação personalizada.
- Não usar linguagem de utilidade nesta campanha. O enquadramento correto é abertura de janela com objetivo de cadastro.
