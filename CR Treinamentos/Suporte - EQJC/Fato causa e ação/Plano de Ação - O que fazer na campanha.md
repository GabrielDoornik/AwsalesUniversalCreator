# Plano de Ação - O que fazer na campanha

Arquivo enxuto com apenas ações que ainda podem influenciar handoff, fila, operação ou qualidade mensurável da campanha.

## Status atual

FAQs já aplicadas pelo CS:

- FAQ antiga que citava `@buscar_membro_por_email`.
- FAQ de “matrículas bloqueadas”.
- FAQ “Como acessar o produto após a compra”.
- FAQ “Fui cobrado mas não recebi o acesso”.
- FAQs de Playbook com promessa humana ou acompanhamento futuro.
- FAQ nova de encerramento após resolução.

Fato confirmado no checkpoint atual:

- O checkpoint não cita `@buscar_membro_por_email`.
- O checkpoint não cita `@gerar_deep_link_curseduca`.
- A única tool citada no checkpoint é `@gerar_deep_link_de_acesso`.

Portanto, não há ação restante de checkpoint relacionada às tools antigas neste momento.

---

## 1. Monitorar se a troca de tool resolveu o principal handoff

Motivo:

O relatório ainda pegou o período anterior à troca da tool, então os `TOOL_FAILURE` podem estar contaminados por erro antigo já resolvido.

O que fazer:

Depois de 1 a 2 dias de dados novos no Optimization Hub, conferir:

- Se `buscar_membro_por_email` parou de aparecer em execuções.
- Se `gerar_deep_link_curseduca` parou de aparecer em execuções.
- Se `gerar_deep_link_de_acesso` continua com sucesso alto.
- Se `TOOL_FAILURE` caiu.
- Se “Matrículas Bloqueadas/login” deixou de aparecer como gap principal.
- Se `Lie Detector` reduziu depois da limpeza das FAQs.

Se as tools antigas ainda aparecerem depois das FAQs e checkpoint atualizados:

- Aí sim investigar o painel da campanha ou conversas reais, porque o problema não estará no checkpoint local.

---

## 2. Decidir se liga IA de acompanhamento da fila

Fato:

Nos prints, havia 208 tickets aguardando na fila e alerta de fila acima do SLA.

Impacto:

Isso não reduz handoff diretamente, mas melhora a experiência depois que o handoff já aconteceu e reduz sensação de abandono.

Quando ligar:

Ligar se o cliente realmente mantém fila humana e se os tickets podem ficar aguardando por horas.

Texto sugerido para orientação da IA de fila:

```text
Quando o atendimento já estiver na fila humana, apenas tranquilize o aluno. Informe que o caso foi encaminhado para o time responsável e que ele não precisa repetir as informações. O horário de atendimento é segunda a sexta, das 9h às 18h, com resposta em até 48h úteis. Não prometa prazo menor, não tente resolver novamente o caso que já foi transferido e não diga que a IA falhou.
```

Pergunta para o cliente:

```text
Quando o aluno está aguardando na fila humana, vocês querem que a IA envie mensagens de acompanhamento avisando que o caso já foi encaminhado?
```

---

## 3. Decidir se liga “Respeitar horário de atendimento”

Fato:

Hoje a opção aparece desligada nos prints.

Impacto:

Se ligada, a transferência automática só acontece dentro do horário da equipe. Fora do horário, a IA continua atendendo normalmente.

Quando ligar:

Ligar se o cliente não quer acumular tickets humanos fora do horário de atendimento.

Antes de ligar, confirmar o horário real da equipe.

Pergunta para o cliente:

```text
Vocês querem que a IA continue atendendo normalmente fora do horário humano e só transfira dentro do horário da equipe?
```

---

## 4. Não ligar Timers sem SLA real

Fato:

Timers e redistribuição aparecem desligados.

Recomendação:

Não ligar agora sem alinhamento operacional. Timer só faz sentido se o time humano tiver rotina e SLA real.

Pergunta para o cliente:

```text
Qual prazo real o time humano consegue cumprir para primeira resposta: 30 min, 1h, algumas horas ou até 48h úteis?
```

Observação:

Se a resposta for “até 48h úteis”, cuidado com timer agressivo. Um timer incompatível com a operação pode suspender operadores e piorar a fila.

---

## 5. Acompanhar aprovação do CSAT

Fato:

O template de CSAT aparece como pendente na Meta.

Impacto:

Fora da janela de 24h, a pesquisa pode não ser enviada corretamente até o template ser aprovado.

O que fazer:

- Aguardar aprovação do template.
- Depois conferir se o botão/flow funciona fora da janela de 24h.
- Não colocar instrução de CSAT no checkpoint nem em FAQ.

As mensagens atuais estão adequadas:

```text
Conseguimos resolver seu problema?
De 1 a 5, como você avalia nosso atendimento?
```

---

## 6. Validar conteúdo temporário de A Ascensão e A Ruptura

Fato:

As FAQs têm conteúdos com datas e regras temporárias de A Ascensão e A Ruptura.

Impacto:

Depois que o evento passa, FAQ temporária pode gerar resposta desatualizada. Isso pode virar baixa confiança, resposta errada ou handoff desnecessário.

Pergunta para o cliente:

```text
Depois que A Ascensão e A Ruptura passarem, devemos manter essas FAQs ativas, editar para “evento encerrado/gravação” ou desativar?
```

---

## 7. Corrigir variável de A Ruptura somente se esse fluxo continuar ativo

Fato:

No checkpoint local existe uma linha com variável malformada para o grupo de A Ruptura:

```text
{{[https://sndflw.com/i/a-ruptura](https://sndflw.com/i/a-ruptura)}}
```

Impacto:

Isso não é estética. Se o fluxo de A Ruptura continuar ativo e o bot precisar enviar esse grupo via checkpoint, essa variável pode falhar ou confundir o agente.

Ação somente se A Ruptura continuar ativa no suporte:

Trocar por uma variável real cadastrada no painel, por exemplo:

```text
{{link_do_grupo_A_Ruptura}}
```

Se A Ruptura não for mais atendida por essa campanha, essa ação pode ficar para depois ou ser resolvida junto da limpeza das FAQs temporárias.

---

## Checklist restante

- [ ] Monitorar 1 a 2 dias se `TOOL_FAILURE` caiu após as FAQs e tool nova.
- [ ] Conferir se tools antigas pararam de aparecer nos dados novos do Optimization Hub.
- [ ] Decidir com o cliente sobre IA de acompanhamento da fila.
- [ ] Decidir com o cliente sobre respeitar horário de atendimento.
- [ ] Não ligar Timers até o cliente confirmar SLA real.
- [ ] Acompanhar aprovação do template de CSAT.
- [ ] Perguntar ao cliente o que fazer com FAQs temporárias de A Ascensão e A Ruptura.
- [ ] Corrigir variável de A Ruptura apenas se esse fluxo continuar ativo.
