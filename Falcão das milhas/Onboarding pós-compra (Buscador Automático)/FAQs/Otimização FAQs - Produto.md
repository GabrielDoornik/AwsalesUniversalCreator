# Otimização FAQs — Produto (Base de Onboarding)

Base: `IA de Suporte - Falcão das Milhas (Onboarding)` — Produto, ID `3be720b8-608b-4e85-a98f-ac934cd258b8`.
Data: 2026-08-05. Origem: investigação I6 da task de redução de handoff.

Motivo: a Onboarding 3 é uma campanha de presente e a base não tem uma única FAQ sobre o presente. Medido em 10 dias, o que o RAG mais devolveu nela foi "Quais situações devem escalar para suporte humano" (36 vezes, score 72), seguido das FAQs de erro de acesso (score 86 a 89). Quando o cliente pergunta do presente, o melhor match disponível é a FAQ de escalar. A campanha roda 100% no checkpoint e o Information Manager não tem o que entregar ao Copywriter.

Duas regras respeitadas nas respostas abaixo:

- **Nenhum link e nenhuma variável.** O convite e o cadastro do amigo são links condicionais entregues pelo checkpoint da Onb3 (`{{link_convite_amigo}}` e `{{link_cadastro_amigo}}`). As respostas dizem para usar o link da campanha, sem citar endereço.
- **A base é compartilhada pelos três onboardings.** Uma FAQ do presente pode ser acionada numa conversa da Onb1 ou da Onb2, onde o presente ainda não existe. Por isso as respostas nunca mandam anunciar nem oferecer o presente: elas respondem quando o cliente pergunta. Os checkpoints da Onb1 e da Onb2 continuam proibindo anunciar campanha futura.

---

## CRIAR 1

Pergunta:

```
Ganhei um presente, o que é isso?
```

Resposta:

```
O presente é o direito de liberar um acesso gratuito ao Buscador Automático para uma pessoa, ganho por ter completado o cadastro do perfil de viagens. Explique o caminho em três passos, na ordem: o cliente toca no link do convite, encaminha a mensagem para o amigo, e o amigo cria a conta gratuitamente no Buscador. Deixe claro que não existe formulário nenhum no caminho do amigo: ele vai direto para o cadastro. Nunca diga que o amigo precisa responder um questionário. O presente é para uma pessoa, e ao dizer isso não use expressões que prometam uma segunda chance, como "uma por vez" ou "por enquanto uma". O link do convite vem da campanha, nunca de memória: se ele não estiver disponível na conversa, não invente endereço. Se o cliente perguntar onde o presente está na conta dele, esclareça que a entrega é pela conversa e não dentro da plataforma. Não anuncie nem ofereça o presente por conta própria; só responda quando o cliente trouxer o assunto.
```

---

## CRIAR 2

Pergunta:

```
O que o meu amigo ganha e por quanto tempo vale?
```

Resposta:

```
Responda que o amigo libera um acesso gratuito ao Buscador de passagens e vê as condições no próprio cadastro. Este é um caso em que o certo é dizer que não tem o detalhe, em vez de preencher a lacuna: não existe informação confirmada sobre por quanto tempo o acesso do amigo vale, nem se é acesso completo ou parcial. Nunca invente prazo e nunca diga "para sempre", "um ano", "acesso total" nem "o mesmo acesso que o seu". Se o cliente insistir em confirmação exata, ofereça encaminhar para o time verificar. Sobre quem indica: ele não ganha nada além do gesto. Nunca prometa desconto, extensão de acesso, bônus, milhas, sorteio ou vantagem de qualquer tipo por ter indicado. O prêmio dele é presentear alguém. E não diga que o presente expira, que as vagas são limitadas ou que ele precisa correr, porque não existe prazo confirmado.
```

---

## Ativar sem alteração

As 35 FAQs ativas atuais da base de Produto seguem como estão.

---

## Candidatas, criar só se aparecer volume

Ficaram de fora para não inflar a base sem evidência. Vale medir antes.

- "Posso indicar mais de uma pessoa?" — hoje está coberta dentro da CRIAR 2 e pela Seção 3 do checkpoint da Onb3.
- "Vai cobrar alguma coisa do meu amigo?" — a desconfiança de cobrança. Se aparecer volume, a FAQ é de Playbook, não de Produto.
