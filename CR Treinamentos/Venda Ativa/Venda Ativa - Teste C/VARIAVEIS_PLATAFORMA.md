# VARIÁVEIS DA PLATAFORMA — TESTE C

Cole os valores abaixo no painel de variáveis da campanha "Venda Ativa - Teste C" na AWSales.

Este teste tem 2 links: o replay da aula gratuita (porta de entrada) e o checkout da imersão paga A Ruptura por R$ 37 (após captura de dúvidas).

## link_aula_c

Backhalf Rebrandly: `a-ruptura-aula`

Destino: URL do replay da aula gratuita do Paulo Aguiar (você precisa me confirmar a URL).

URL final que vai no painel (após criar o link no Rebrandly):
```
https://<seu-dominio-rebrandly>/a-ruptura-aula
```

## link_vendas_c

Backhalf Rebrandly: `a-ruptura-metodo`

Destino (Assiny — checkout da imersão paga A Ruptura por R$ 37):
```
https://pay.assiny.com.br/eeaef8/node/rxgVJz?utm_medium=1x1&utm_source=awsales&utm_campaign=ASC-MAI-2026&utm_content=teste-c
```

URL final que vai no painel (após criar o link no Rebrandly):
```
https://<seu-dominio-rebrandly>/a-ruptura-metodo
```

Observação: Teste A e Teste C usam o mesmo Assiny base (`eeaef8/rxgVJz` = R$ 37). A diferenciação no relatório é feita pelo `utm_content` (teste-a vs teste-c).

## link_suporte

Conteúdo: canal/link de suporte padrão da equipe (não passa por Rebrandly).
