# Onboarding 2 — Cadastro do perfil de viagens

Documento vivo. Preencher conforme o CS enviar os prints e o cliente responder as pendências.

Criado em: 2026-07-27.

---

## Escopo

Público: quem já criou a conta e fez o primeiro acesso ao Buscador, ou seja, quem saiu do Onboarding 1 em E1.

Objetivo: levar a pessoa a preencher o cadastro do perfil de viagens, conduzido por Typeform.

Output: formulário preenchido. É o E2 do board original do cliente.

Diferença em relação ao board: no desenho original o cadastro era feito dentro do Buscador, com os botões "COMPLETAR MEU PERFIL" e "APROVAR MEU PERFIL". Agora o caminho é um Typeform, mais fácil de conduzir por WhatsApp e de medir.

---

## Formulário

Link, recebido do CS em 2026-07-27:

```
https://emeo1uhrjwf.typeform.com/to/RSuIPOnP?utm_source=xxxxx&utm_medium=xxxxx&utm_campaign=xxxxx&utm_term=xxxxx&utm_content=xxxxx
```

Mesma conta Typeform usada pelo Suporte (`emeo1uhrjwf`), formulário diferente. O do Suporte é `SMEYLynR`, da Consultoria de retenção. Este é `RSuIPOnP`.

Atenção aos UTMs: vieram como `xxxxx`, que são placeholders. Precisa definir os valores reais antes de subir, senão o relatório do Typeform enche de "xxxxx" e não dá para separar o tráfego desta campanha. Sugestão de preenchimento:

```
utm_source=whatsapp
utm_medium=ia
utm_campaign=onboarding2-perfil
```

Os campos `utm_term` e `utm_content` podem sair da URL se não houver uso previsto. Confirmar com o CS antes.

Variável da campanha: `{{link_formulario_perfil}}`, com a URL final já montada.

---

## Conteúdo do formulário

Prints recebidos em 2026-07-27. Perguntas 1 a 10 mapeadas, faltam as demais.

Tela de abertura:

"Seja bem-vindo(a)! PREENCHA AS INFORMAÇÕES PARA SER DIRECIONADO(A) AO BUSCADOR AUTOMÁTICO. São algumas perguntas rápidas sobre os seus cartões de crédito, as suas emissões de passagens entre outros pontos que vão te ajudar a ter o máximo aproveitamento dos nossos serviços."

Todas as perguntas mapeadas até aqui são obrigatórias.

1. Quantas vezes você viaja de avião para fora do Brasil (por ano)? Escolha única: 1 vez, 2 vezes, 3 vezes, 4 vezes, 5 vezes ou mais, Não costumo viajar para fora do Brasil.
2. Você costuma viajar de classe executiva ou econômica? Escolha única: Executiva, Econômica.
3. Qual a sua profissão/ramo de atuação hoje? Texto aberto.
4. Onde você acumula a MAIORIA das suas milhas (CIA Aérea)? Escolha única: Azul, Gol/Smiles, Latam.
5. No total, quantas milhas você tem hoje? Escolha única: 50.001 a 100.000, 100.001 a 500.000, 500.001 a 1 Milhão, Mais de 1 Milhão, Menos de 50.000.
6. E sobre pontos nos bancos, você tem pontos em alguns desses programas de fidelidade? Múltipla escolha: Livelo, Esfera, Itaú (IUPP), Não tenho em nenhum desses.
7. No total, quantos pontos você tem hoje? (Livelo, Esfera, Itaú) Escolha única: 50.001 a 100.000, 100.001 a 500.000, 500.001 a 1 Milhão, Mais de 1 Milhão.
8. Qual o destino da sua próxima viagem internacional? Texto aberto.
9. Qual a data que você pretende fazer essa próxima viagem internacional (ida e volta)? Texto aberto, com a dica de preencher mês e ano se não houver data definida.
10. Você tem flexibilidade para alterar a data da sua viagem e conseguir aproveitar uma passagem mais barata? Escolha única: sem flexibilidade, até 1 semana, até 1 mês, flexibilidade total.

11. Você deseja emitir essa passagem quando? Escolha única: Imediatamente, Nos próximos 15 dias, Nos próximos 30 dias, Nos próximos 3 meses, Por enquanto estou apenas cotando.
12. Falando especificamente dessa próxima viagem internacional, você vai emitir em qual classe? Escolha única: Econômica, Executiva.
13. Exercício de ancoragem. Apresenta uma passagem de Classe Executiva para a Europa a R$ 25.000 ida e volta, a mesma passagem por R$ 11.000, e a alternativa de R$ 3.500 em Econômica. Pergunta qual o respondente preferiria emitir. Escolha única: R$ 11.000 em Executiva, R$ 3.500 em Econômica, As duas estão fora do meu orçamento.
14. Quais cartões de crédito você mais usa? Texto aberto, com o formato Banco Bandeira Categoria e o exemplo "Santander Mastercard Black".
15. Qual valor você gasta mensalmente somando todos os seus cartões, em média? Escolha única, oito faixas de "Até R$ 3.000" a "Acima de R$ 100.000". A pergunta pede para somar os gastos do cônjuge.
16. Descreva a sua viagem dos sonhos. Texto aberto.

Ao final: nome, e-mail e telefone.

### O que isso esclarece

O formulário é um gate de acesso, não uma personalização opcional. A própria tela de abertura diz que a pessoa preenche para ser direcionada ao Buscador. Isso bate com a mensagem do board original, que dizia "vi que você ainda não completou seu perfil e por isso você não conseguiu acessar o Buscador", que na época eu tinha marcado como possível imprecisão.

Consequência para o argumento da campanha: o motivo de preencher não é deixar a experiência com a cara da pessoa, é destravar o Buscador. Argumento muito mais forte e, ao que tudo indica, verdadeiro. Confirmar com o cliente se o bloqueio é real ou se é só o caminho recomendado.

### O formulário é também um instrumento de qualificação

Da pergunta 11 em diante o formulário deixa de ser perfil de viagem e vira qualificação comercial. A 13 é um exercício clássico de ancoragem de preço. A 14 pergunta banco, bandeira e categoria dos cartões. A 15 pergunta a faixa de gasto mensal somando todos os cartões, incluindo os do cônjuge, com faixas que vão até acima de R$ 100.000.

Cruzando com a base de Suporte, as perguntas 1, 2 e 10 são exatamente os critérios que a FAQ "Quando indicar o Black Falcon ao cliente" manda usar para qualificar: quantas viagens internacionais por ano, econômica ou executiva, e flexibilidade de datas. Somando gasto de cartão e saldo de milhas e pontos, o formulário monta o perfil de quem tem potencial para Consultoria Individual e Black Falcon.

Isso não é problema, é o desenho do cliente, e é legítimo: gasto de cartão determina acúmulo de pontos, que é matéria-prima de milhas. Mas tem duas consequências diretas para a campanha:

Primeira, a IA nunca deve enquadrar o formulário como etapa comercial nem prometer contato de consultor. O enquadramento honesto e suficiente é o da própria tela de abertura: preencher direciona a pessoa ao Buscador e faz o serviço render mais para ela.

Segunda, e mais importante, vai haver desconfiança. Perguntar quais cartões a pessoa usa, quanto ela gasta por mês e quanto o cônjuge gasta, num público 45+ e por WhatsApp, ativa alarme de golpe. O checkpoint precisa de resposta pronta e verdadeira para isso, e precisa deixar explícito que a IA nunca pede número de cartão, senha, CPF ou dado bancário. A pergunta é sobre banco, bandeira e categoria, não sobre o número.

### Identificação do respondente, resolvido

O formulário pede nome, e-mail e telefone no final. Isso resolve o problema que parecia bloquear o fechamento automático: o webhook do Typeform vai carregar o telefone, e dá para casar com o lead na AWSales sem precisar de campo oculto na URL nem de link dinâmico por pessoa.

O link pode continuar estático como variável de campanha.

Duas observações: o telefone informado no formulário pode não ser o mesmo do WhatsApp da campanha, então o casamento precisa de uma regra de fallback pelo e-mail. E, como esses campos ficam no fim de um formulário de dezesseis perguntas, quem abandona no meio não é identificável. Para tratar abandono, ou o cliente move os campos de identificação para o começo, ou aceitamos não saber quem parou no meio.

### Problemas encontrados no formulário

Pergunta 7 fica sem resposta possível para parte das pessoas. Ela é obrigatória e as faixas começam em 50.001, mas a pergunta 6 permite responder "Não tenho em nenhum desses". Quem não tem pontos, ou tem menos de 50 mil, não encontra opção válida. Ou existe lógica condicional escondendo a 7, ou a pessoa mente ou abandona. Vale conferir. A pergunta 5, sobre milhas, tem "Menos de 50.000" e não sofre disso, embora a opção esteja fora de ordem, depois de "Mais de 1 Milhão".

Perguntas 8 e 9 são obrigatórias e assumem que existe uma próxima viagem internacional, mas a pergunta 1 permite responder "Não costumo viajar para fora do Brasil". Mesmo problema da 7.

### Tamanho e expectativa

Dez perguntas mapeadas e ainda faltam outras. A tela de abertura chama de "algumas perguntas rápidas", o que subestima. Num público 45+ isso é longo.

Duas consequências para a campanha:

- A IA não pode prometer que leva um minuto. Só dar estimativa de tempo depois que o número final de perguntas estiver fechado, e usar um número honesto.
- Vai haver abandono no meio. O Typeform consegue emitir webhook de resposta parcial, então dá para tratar quem começou e não terminou de forma diferente de quem nem abriu. Vale desenhar isso no checkpoint.

---

## Vantagem operacional deste desenho

O Typeform tem webhook nativo. Isso significa que o evento de conclusão do Onboarding 2 não depende do time técnico do Falcão, diferente do evento de primeiro acesso que trava o Onboarding 1. O Typeform avisa o n8n quando alguém submete, e o n8n fecha a campanha na AWSales.

É o único dos três outputs do funil que está totalmente na nossa mão.

---

## Pendências

Resolvidas: conteúdo completo do formulário mapeado (16 perguntas mais nome, e-mail e telefone) e identificação do respondente garantida pelos próprios campos finais.

Bloqueiam o go-live, não a escrita:

- [ ] Confirmar se o Buscador fica realmente bloqueado sem o formulário preenchido, ou se é apenas o caminho recomendado. O checkpoint hoje usa a formulação da própria tela de abertura, que é o caminho seguro.

- [ ] Valores reais dos UTMs.
- [ ] Ligar o webhook do Typeform ao n8n.
- [ ] Decidir se vamos tratar resposta parcial de forma diferente de quem nem abriu.

Para o cliente corrigir no formulário:

- [ ] Pergunta 7 é obrigatória e não tem opção para quem marcou "Não tenho em nenhum desses" na 6, nem para quem tem menos de 50 mil pontos.
- [ ] Perguntas 8 e 9 são obrigatórias e assumem próxima viagem internacional, mas a 1 permite responder que não costuma viajar para fora.
- [ ] Na pergunta 5, "Menos de 50.000" aparece depois de "Mais de 1 Milhão".
- [ ] A tela de abertura promete "algumas perguntas rápidas" para um formulário de dez ou mais perguntas.

---

## Base de conhecimento

Mesma base dos três onboardings: "IA de Suporte - Falcão das Milhas (Onboarding)". Produto ID `3be720b8-608b-4e85-a98f-ac934cd258b8`, Playbook ID `4aedb65e-52cf-4be3-84ff-9507d00a01bb`.

Hoje ela tem 31 FAQs e nenhuma trata de cadastro de perfil. Vão precisar ser criadas, e o conteúdo delas depende dos prints.

Rever também as 12 FAQs deixadas inativas na curadoria (Tarifas Awards, hubs, busca manual, programas de milhas). Fazia sentido cortar no Onboarding 1, onde a pessoa nem tinha entrado. Aqui ela já está dentro e vai perguntar como usar.
