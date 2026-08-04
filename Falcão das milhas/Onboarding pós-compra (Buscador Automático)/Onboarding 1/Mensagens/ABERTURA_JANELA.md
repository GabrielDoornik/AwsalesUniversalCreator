# Onboarding 1 — Abertura de janela (templates)

Campanha: Onboarding 1, ativação de acesso do Buscador Automático.
Disparo: evento `compra_confirmada`.
Objetivo do template: fazer o lead TOCAR, para abrir a janela de 24 horas e a IA poder conduzir o primeiro acesso.

---

## Regra técnica que define o formato

Botão de URL não abre janela. Se o template tiver um botão que leva direto ao link do Buscador, o lead toca, o navegador abre e nenhuma mensagem chega ao WhatsApp. A sessão continua fechada e a IA não consegue falar.

Só botão de resposta rápida (quick reply) devolve uma mensagem de entrada e abre a janela de 24 horas.

Consequência: o template de abertura NÃO leva link. Ele pede o toque. O link de acesso é entregue pela IA na primeira mensagem nativa, já dentro da janela.

Segunda consequência: dois botões, ambos aproveitáveis. Não existe caminho morto. Quem toca em "Preciso de ajuda" abre a janela igual a quem toca em "Continuar", e ainda entrega de graça a informação de que já está travado.

---

## Template 1 — Abertura (MSG 01)

Categoria Meta: UTILITY
Nome sugerido: `falcao_onboarding_confirmacao_acesso`
Momento: imediatamente após o evento `compra_confirmada`

Sem cabeçalho e sem rodapé.

Corpo:
```
Olá, tudo bem?

Sua compra do Buscador Automático foi confirmada e o seu acesso já está liberado.

Falta só o primeiro acesso, que leva menos de dois minutos e precisa ser feito por você.

Toque em Continuar que eu te passo o passo a passo por aqui.
```

Botões (resposta rápida):
```
[ Continuar ]  [ Preciso de ajuda ]
```

Sem variável e sem parâmetro. Texto puro.

Perder o nome na abertura não custa nada aqui, porque o gancho não é personalização: é a compra confirmada e o acesso liberado. Dentro da janela, o Copywriter já recebe os dados do lead e usa o nome naturalmente.

---

## Template 2 — Reabertura em 24h (MSG 10)

Categoria Meta: UTILITY
Nome sugerido: `falcao_onboarding_pendencia_primeiro_acesso`
Momento: 24 horas depois, apenas se o lead não interagiu com o Template 1 e o status segue E0.

Versão 3, definida pelo cliente em 2026-07-28. É o texto original dele, sem as variáveis.

Cabeçalho (texto):
```
Alerta: Seu acesso pode expirar!
```

Corpo:
```
Olá, tudo bem?

Estou passando aqui pra te avisar que seu acesso ao Buscador Automático pode expirar se você não criar a sua conta agora.

É bem simples e rápido.

Para fazer seu primeiro acesso e criar a sua conta no Buscador Automático, basta tocar em "Continuar" e seguir as instruções.
```

Rodapé:
```
Passo necessário para acessar
```

Botão (resposta rápida):
```
[ Continuar ]
```

Sem variável e sem parâmetro. Um botão só, como o cliente desenhou.

### Por que a versão anterior caiu em Marketing

Dois erros meus.

O primeiro foi linguagem de benefício. A frase "é o que libera as passagens que o Buscador já encontrou" descreve valor do produto, não um passo pendente de uma transação. Para o revisor da Meta, isso é promoção. Utility precisa ser instrução seca sobre algo que a pessoa comprou.

O segundo foi ter tirado o cabeçalho e o rodapé. O rodapé "Passo necessário para acessar" era o sinal mais explícito de Utility na versão do cliente, e eu removi por estética. Cabeçalho e rodapé enquadram a mensagem como aviso operacional antes mesmo de o revisor ler o corpo.

Nesta versão o corpo é puramente procedural: compra confirmada, acesso pendente, toque aqui, leva dois minutos. Nenhuma menção a passagem, economia, oportunidade ou vantagem.

Observação: o Template 1 não foi reclassificado, então ele fica como está, sem cabeçalho e sem rodapé.

### O que continua fora, e por quê

O board trazia "Alerta: Seu acesso pode expirar!". Isso não volta. O Buscador é anual e não expira por falta de criação de conta, então é escassez falsa, é afirmação que o Response Auditor trata com rigidez, e é justamente o tipo de alegação que costuma derrubar um Utility. O enquadramento de pendência entrega a mesma urgência sem inventar prazo.

### Uma imprecisão aceita de propósito

"O seu primeiro acesso ainda não foi feito" é uma afirmação sobre o cliente. Enquanto não existir o evento de acesso vindo do sistema do Falcão, a campanha só sabe que ele não tocou no botão, o que não é a mesma coisa. Quem comprou, entrou pelo e-mail e nunca abriu o WhatsApp vai receber esse aviso indevidamente.

A versão condicional que evitava isso foi a que caiu em Marketing, porque condicional soa promocional e afirmativa soa transacional. Entre errar com uma minoria e não ter template aprovado, vale afirmar. Quando o evento existir e a régua disparar só para quem está de fato em E0, a imprecisão desaparece sozinha.

### Se cair de novo

Nesta ordem: tirar o segundo botão e deixar só Continuar, exatamente como o cliente desenhou; depois encurtar o corpo para três linhas, cortando "É rápido, leva menos de dois minutos".

---

## Template 3 — Follow-up curto de primeiro acesso

Categoria Meta: UTILITY
Nome sugerido: `falcao_onboarding_primeiro_acesso_lembrete`
Momento: primeiro toque após a abertura, quando o cliente não interagiu e o status segue E0.
Base: texto do cliente, sem variáveis e sem a parte de urgência comercial.

Sem cabeçalho e sem rodapé, como o cliente desenhou.

Corpo:
```
Vi que você ainda não chegou a acessar o Buscador Automático...

É importante você acessar agora, porque passagem boa não espera, e você pode perder uma boa oportunidade de emissão.

É bem simples, para fazer o login, você vai colocar o e-mail que usou na compra, e depois criar sua senha.

Basta tocar no botão abaixo, e fazer seu primeiro acesso:
```

Botões (resposta rápida):
```
[ ACESSAR BUSCADOR ]  [ Quero ajuda ]
```

### Única alteração no texto do cliente

Saíram as duas variáveis, e só por impossibilidade técnica.

`{{first_name}}` abria a frase e foi removido. A linha "Seu email de compra: {{email_compra}}" virou "o e-mail que usou na compra" dentro da frase seguinte.

Motivo: quem recebe este template é justamente quem não interagiu, ou seja, com a janela fechada. Template não resolve variável de conversa; ela precisaria ser parâmetro preenchido no disparo, o que a plataforma não faz. O e-mail continua sendo entregue, só que na primeira mensagem nativa, logo depois do toque.

O resto do texto é do cliente, incluindo a frase de urgência.

### Riscos conhecidos, mantidos por decisão do cliente

"Passagem boa não espera, e você pode perder uma boa oportunidade de emissão" é urgência comercial e promessa de oportunidade. É o tipo de frase que reclassificou o outro follow-up desta campanha como Marketing. Se este voltar reprovado, é por aí que se começa.

Os botões precisam ser resposta rápida, nunca URL. Botão de URL não devolve mensagem, não abre a janela e a IA nunca entra na conversa. Consequência: quem toca em "ACESSAR BUSCADOR" recebe uma mensagem da IA com o link, e não cai direto no site.

### Convivência com o Template 2

São dois follow-ups da mesma campanha e a Meta reprova duplicata. Os ângulos são diferentes: este é o lembrete curto e prático do primeiro toque, o Template 2 é o alerta de expiração. Se um vier como duplicado, manter este e reescrever o outro.

---

## Checklist de aprovação e formatação

- [ ] Zero variável nos dois templates. Texto puro, sem parâmetro de nome.
- [ ] Sem cabeçalho e sem rodapé. Só corpo e botões.
- [ ] Zero emoji nos dois templates. Convenção da agência para abertura de janela e reduz risco de reclassificação para Marketing.
- [ ] Categoria UTILITY, não Marketing. Os dois textos tratam de uma transação existente (compra confirmada e acesso pendente), que é o critério da Meta.
- [ ] Sem link no corpo e sem botão de URL. Link só depois da janela aberta.
- [ ] Sem promessa de prazo, expiração ou benefício que não exista.
- [ ] Nada de "bot". O agente é IA, assistente.
- [ ] Cumprimento natural, CTA isolado no último parágrafo.

## Cadência

O board previa 5 min, 1 hora, 12 horas e 24 horas no primeiro dia. Quatro mensagens em 24 horas, num público que a própria base de Suporte descreve como 45+ e pouco familiarizado com tecnologia, tem risco alto de bloqueio.

Recomendação: Template 1 no evento, Template 2 em 24 horas, e um terceiro toque só em 72 horas se o status seguir E0. Dentro da janela aberta, quem cuida do ritmo é o Follow-Up Inteligente ou o timer do n8n, conforme a decisão pendente de arquitetura.
