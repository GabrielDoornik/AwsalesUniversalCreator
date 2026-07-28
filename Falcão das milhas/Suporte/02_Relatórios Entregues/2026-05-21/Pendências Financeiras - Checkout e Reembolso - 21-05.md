# Pendências Financeiras - Checkout e Reembolso - 21/05/2026

Este arquivo registra o que ainda precisa ser cruzado depois, quando houver acesso/extração do checkout do cliente.

## Objetivo

Fechar a parte financeira pedida na reunião:

- taxa de reembolso atual;
- valor recuperado pela AWSales em pedidos de reembolso;
- pedidos retidos ou preservados após atendimento da IA/humano.

## O que já sabemos

- Custo informado da IA no mês até 21/05/2026: R$ 3.873,52.
- Baseline histórico de reembolso informado pelo João: aproximadamente 22,5% a 23%.
- Taxa parcial de reembolso no checkout em 21/05: 16,21%.
- Reembolsos totais no painel: 241.
- Valor reembolsado no painel: R$ 67.918,29.
- Chargebacks: 15 casos, somando R$ 3.448,64.
- Diferença macro vs. benchmark histórico: 6,29 a 6,79 pontos percentuais.
- Diferença potencial vs. benchmark histórico: R$ 26,35 mil a R$ 28,45 mil.
- No recorte de suporte de 16/05 a 21/05, houve 65 conversas com tópico de cancelamento de assinatura.
- Dessas 65 conversas, 13 foram resolvidas pela IA, 50 foram transferidas para humano e 2 foram abandonadas.
- Ainda não há evidência segura para atribuir valor recuperado confirmado diretamente à IA, porque falta o cruzamento pedido a pedido entre conversas e status final no checkout.

## Dados necessários do checkout

Exportar, se possível, com estas colunas:

| Campo | Uso |
|---|---|
| ID do pedido | Chave principal da compra |
| E-mail do cliente | Cruzar com conversas |
| Telefone do cliente | Cruzar com conversas |
| Produto | Separar Buscador, Balcão e outros produtos |
| Valor da compra | Calcular valor em risco |
| Data da compra | Filtrar período |
| Status da compra | Identificar ativo, cancelado, reembolsado, pendente |
| Data de solicitação de reembolso | Medir reembolsos no período |
| Data de reembolso concluído | Confirmar perda |
| Valor reembolsado | Calcular perda efetiva |
| Motivo do reembolso | Entender causa raiz |

## Como calcular depois

1. Filtrar pedidos do período analisado.
2. Cruzar e-mail/telefone com conversas de cancelamento/reembolso.
3. Separar:
   - pedidos reembolsados;
   - pedidos em análise;
   - pedidos mantidos ativos;
   - pedidos sem solicitação formal.
4. Validar taxa parcial de reembolso contra o painel.
5. Comparar contra baseline de 22,5% a 23%.
6. Calcular valor recuperado confirmado por origem:
   - retido diretamente pela IA;
   - retido pelo humano após triagem da IA;
   - mantido ativo sem solicitação formal.
7. Calcular valor recuperado confirmado:
   - soma dos pedidos que tiveram intenção de reembolso/cancelamento, mas permaneceram ativos.
8. Calcular diferença potencial vs. benchmark histórico:
   - diferença entre baseline histórico e taxa parcial, aplicada ao volume financeiro da leitura.

## Regra de segurança

Não afirmar valor recuperado confirmado sem cruzamento pedido a pedido. Enquanto não houver esse cruzamento, usar:

- volume de conversas de cancelamento;
- tentativa de retenção/educação;
- casos resolvidos pela IA no fluxo de cancelamento;
- taxa macro de reembolso do painel;
- diferença potencial frente ao benchmark histórico;
- pendência de atribuição direta para cruzamento posterior.
