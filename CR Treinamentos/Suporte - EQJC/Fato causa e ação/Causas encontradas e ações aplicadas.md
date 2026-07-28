# Causas encontradas e ações aplicadas

Resumo das principais causas de handoff identificadas na campanha de suporte EQJC e o que foi feito para reduzir novas transferências.

| Causa encontrada | O que fizemos para contornar |
|---|---|
| Grande parte dos handoffs vinha de falha técnica nas tools antigas de acesso. | Trocamos as tools antigas por uma única tool nova, `gerar_deep_link_de_acesso`, que trata e-mail não encontrado como resposta normal, sem gerar erro técnico automático. |
| Quando o e-mail do aluno não era encontrado, a IA acabava transferindo rápido demais para humano. | Ajustamos o fluxo para a IA pedir confirmação do e-mail e orientar o aluno a conferir o e-mail usado na compra antes de escalar. |
| Dúvidas de “matrículas bloqueadas” e login ainda estavam gerando atrito. | Atualizamos a FAQ desse tema para a IA tentar o protocolo completo de acesso antes de mandar para humano. |
| Alunos que compraram e não encontravam o acesso podiam cair em handoff cedo. | Atualizamos as FAQs de acesso após compra e de cobrança sem acesso para a IA tentar deep link antes da transferência. |
| A base ainda tinha referência à tool antiga `buscar_membro_por_email`. | Removemos/substituímos essa instrução para evitar que a IA siga um fluxo antigo. |
| Algumas FAQs faziam a IA prometer ações humanas, como acompanhar, registrar ou verificar depois. | Limpamos essas promessas para evitar acionamento do Lie Detector e handoff desnecessário. |
| A IA podia prolongar conversas já resolvidas. | Criamos uma FAQ de encerramento para finalizar corretamente quando o aluno confirma que resolveu. |

## Próximo acompanhamento

Depois de 1 a 2 dias de novos dados, acompanhar no Optimization Hub se `TOOL_FAILURE` caiu, se as tools antigas pararam de aparecer e se `gerar_deep_link_de_acesso` segue com alta taxa de sucesso.

## Números do relatório

No período analisado, 7,4% das conversas tiveram intervenção humana. Dentro desses transbordos, 76,47% foram por `TOOL_FAILURE` (13 casos), ou seja, a maior causa de handoff era falha de ferramenta.

Também no relatório, as tools antigas ainda apareciam com volume alto: `buscar_membro_por_email` teve 979 chamadas com 91,1% de sucesso, enquanto `gerar_deep_link_curseduca` teve 931 chamadas com 99,5% de sucesso. A nova tool `gerar_deep_link_de_acesso` apareceu com 206 chamadas e 100% de sucesso.

Por isso a leitura principal é: o maior problema numérico era falha/erro operacional das tools antigas, e a principal correção foi centralizar o acesso na nova tool que não transforma “e-mail não encontrado” em erro técnico de handoff.
