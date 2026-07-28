# Recomendações Operacionais - Otimização 11/05

Campanha: IA de Suporte - Falcão das Milhas

Este arquivo registra pontos do feedback que não devem entrar como configuração técnica no checkpoint nem nas FAQs, porque dependem do painel da campanha, da Central de Atendimento, equipes, timers ou canais oficiais do cliente.

## 1. Encerramento automático de atendimentos humanos respondidos

Problema observado:

- Conversas assumidas por operadores ficam em "Meus Atendimentos", seção "Respondidos", mesmo depois de o cliente parar de responder.
- Se o ticket permanece aberto por dias, a IA fica pausada e não atende imediatamente caso o cliente volte a chamar.
- Isso também acumula atendimentos no nome do mesmo operador.

Recomendação:

- Configurar sequência de inatividade do lead para atendimento humano.
- Encerrar automaticamente tickets em "Respondidos" após 1 dia sem nova mensagem do cliente, se essa regra estiver disponível na campanha.
- Usar mensagem curta e neutra antes do encerramento, sem tom de cobrança.

Mensagem sugerida:

```text
Oi, passando para confirmar se você ainda precisa de ajuda por aqui.

Se sim, é só responder esta mensagem que seguimos o atendimento.
```

Mensagem de encerramento sugerida:

```text
Como não tivemos retorno, vou encerrar este atendimento por enquanto.

Se precisar de ajuda novamente, é só mandar uma nova mensagem por aqui.
```

## 2. Horário oficial de atendimento humano

Problema observado:

- Quando há transferência para humano, o cliente pode ficar sem expectativa de retorno.

Recomendação:

- Confirmar com a Falcão das Milhas qual é o horário oficial de suporte humano.
- Cadastrar esse horário na equipe ou na configuração da campanha.
- Permitir que a IA informe o horário apenas depois de confirmado oficialmente.

Exemplo citado no feedback do cliente, pendente de confirmação:

```text
O suporte humano funciona de segunda a sexta, das 09h às 18h.
```

Enquanto o horário não estiver confirmado, evitar promessa de prazo exato.

## 3. Contatos oficiais que precisam ser cadastrados

Problema observado:

- O feedback pede direcionamento para WhatsApp oficial do suporte do Buscador em casos de emissão/compra de passagem.
- O feedback também pede direcionamento para contato da Oner em casos de passagem comprada errada ou suporte de passagem já emitida.
- Nenhum contato oficial foi encontrado nos insumos lidos.

Recomendação:

- Solicitar ao cliente e cadastrar os contatos oficiais antes de liberar a IA para enviar qualquer canal externo.
- Contatos necessários:
  - WhatsApp oficial do suporte do Buscador.
  - Contato oficial da Oner.
  - Link correto da área de membros, se a IA puder orientar acesso por link.

Regra de segurança:

- Não usar o link https://falcaodasmilhas.cademi.com.br.
- Não inventar WhatsApp, e-mail, link de área de membros ou contato da Oner.
- Enquanto os contatos não estiverem cadastrados, a IA deve coletar e-mail de compra e fazer handoff humano.

## 4. Revisão de gatilhos de handoff

Recomendação:

- Manter handoff para acesso travado após tentativa básica, renovação/cobrança, passagem já emitida, compra errada, emissão operacional, pedido insistente de humano e hostilidade.
- Evitar handoff automático por frustração comum com uso do Buscador, comparação com Skyscanner ou dúvida sobre Tarifas Awards. Nesses casos, a IA deve primeiro educar e tentar retenção.

## 5. Interpretação para relatório interno

O ponto central da otimização operacional é evitar que a IA fique pausada desnecessariamente em tickets humanos antigos e garantir que, quando houver transferência, o cliente saiba o que esperar sem receber promessa não confirmada.

## 6. Leitura do Optimization Hub - 11/05/2026

Relatório lido: `optimization-hub-2026-05-11.pdf`

Período analisado: 11/04/2026 a 11/05/2026.

Principais indicadores:

- Conversas no período: 21.
- Resolvidas 100% pela IA: 6.
- Deflexão: 29%.
- Intervenção humana: 66,7%.
- Transbordo automático: 100% dos handoffs.
- Cobertura RAG: 83,9%.
- CSAT médio: 4,5/5.
- Tempo médio de resolução: 21h19m.
- Tempo médio na fila: 11h07m.
- Aguardando agora: 35.

Principais motivos de transbordo:

- AI_DONT_KNOW.
- Cancelamento confirmado, solicitado ou insistente.
- Problema de acesso.
- Reembolso/cancelamento.
- LIE_DETECTOR.

Interpretação:

- O relatório reforça que o foco da otimização deve ser aumentar resolução pela IA antes do handoff, especialmente em dúvidas comuns de uso, acesso e cancelamento.
- O motivo `AI_DONT_KNOW` sustenta as novas regras de não responder genericamente, usar FAQs antes de escalar e não prometer verificação interna.
- Os motivos ligados a cancelamento/reembolso sustentam o novo fluxo de retenção antes do formulário.
- O problema de acesso e o ponto de fricção "erro 404" sustentam o reforço do protocolo de acesso e a proibição de links não cadastrados.
- O volume de tickets aguardando e o tempo médio em fila reforçam a recomendação de configurar inatividade/encerramento automático e revisar operação humana.

Pontos adicionados após leitura do relatório:

- Tratamento específico para erro 404 na área de membros.
- Tratamento específico para mudança na exibição de preços ou quantidade de milhas no Buscador.
- Reforço de que dúvidas de uso e comparação com buscadores comuns devem ser educadas antes de handoff.
