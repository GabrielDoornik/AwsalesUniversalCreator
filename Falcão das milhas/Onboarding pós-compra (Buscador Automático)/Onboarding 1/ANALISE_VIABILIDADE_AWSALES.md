# Onboarding 1 — Análise de viabilidade na AWSales

Avaliação do desenho em `FLUXO_ORIGINAL.md` contra o que a plataforma AWSales faz. Data: 2026-07-27.

Legenda: NATIVO / PRECISA N8N / PRECISA EVENTO DO CLIENTE / CONFIRMAR / INVIÁVEL.

---

## 1. Diagnóstico de arquitetura

O board foi desenhado como automação de builder visual (estilo ManyChat): nós de atraso, nós de condição, botões clicáveis em toda mensagem e ramificação por status.

A AWSales não é builder visual. Ela é uma cadeia multiagente conversacional: um input dispara a campanha, o Checkpoint Manager guarda o estado, o Information Manager busca a base de conhecimento e o Copywriter escreve a resposta. Não existe nó de "aguarde 12 horas" nem nó de "condição" para o CS arrastar.

Isso não significa que o fluxo não roda. Significa que ele muda de lugar:

| Elemento do board | Onde vive na AWSales |
|---|---|
| Nós de decisão (Interagiu, Acessou, Completou) | Campos de estado no checkpoint, em caixas `- [ ]` |
| Status E0 / E1 / E2 | Campo de estado no checkpoint, atualizado por evento externo |
| Nós de atraso (5 min, 1h, 12h, 24h) | Follow-Up Inteligente (timing decidido pela IA) ou timers no n8n (timing exato) |
| Botões clicáveis | Só em template HSM. Em mensagem nativa vira texto com link |
| Mensagens Utility | Templates de disparo cadastrados e aprovados na Meta |
| Mensagens Nativas | Resposta gerada pelo Copywriter, não texto fixo |
| Encerra a automação | Evento de output |

Ganho da troca: no board, o lead que responde "não recebi o e-mail" cai num nó que não existe e morre no fluxo. Na AWSales ele é atendido pela base de conhecimento do Suporte. Esse é justamente o motivo de reaproveitar a base de Suporte, e é o argumento mais forte a favor da arquitetura AWSales nessa conversa com o cliente. Para dimensionar: a FAQ "Não consigo acessar ou criar minha conta" já foi usada 992 vezes e a de "recuperação de senha não funciona" 1.993 vezes no Suporte. Esse é o volume real de gente travando exatamente na etapa que este onboarding quer resolver.

Perda da troca: o timing deixa de ser cronometrado e as mensagens deixam de ser literais, a menos que a cadência seja empurrada pelo n8n.

---

## 2. Avaliação nó a nó

### Webhook `compra_confirmada` — NATIVO
Padrão já documentado em `Estrutura/INPUT_OUTPUT_CAMPANHAS.md`. O n8n recebe o evento de compra aprovada, normaliza e cria o input na AWSales. Mesmo evento que encerra a campanha de Recuperação 297.

### MSG 01 - Utility com botão "Continuar" — NATIVO, com precedente
Template Utility com botão já foi feito nesta operação (CR Treinamentos, Show Up Burra: template UTILITY com botão de link e botão secundário). O clique num botão de resposta rápida chega como mensagem do lead, então o "Interagiu / Não interagiu" do board funciona: interagiu é o lead ter respondido.

Ponto de atenção: o board usa `{primeiro nome}` aqui e `{{first_name}}` na MSG 02. Padronizar. Nome em template é parâmetro do template preenchido no disparo; em mensagem nativa o Copywriter já recebe os dados do lead e usa o nome naturalmente, sem variável escrita no texto.

### MSG 02 - Nativa com `{{email_compra}}` e botão ACESSAR BUSCADOR — PARCIAL
- O texto: NATIVO, mas será reescrito pelo Copywriter a cada conversa. Se o cliente exige a mensagem literal, ela precisa ser disparo, não resposta da IA.
- `{{email_compra}}`: PRECISA N8N. O e-mail de compra tem que vir no payload do input e virar variável ou metadata do lead. Precedente na conta: `{{lead_email}}` na campanha de Suporte EQJC.
- Botão: mensagem nativa não tem botão. Vira link no texto.
- Conteúdo: o link de acesso ao Buscador e o da área de membros são endereços diferentes e já estão nas FAQs de Suporte. Usar o da FAQ, nunca de memória.

### "Acessou o Buscador?" e "Completou o cadastro?" — PRECISA EVENTO DO CLIENTE
Este é o ponto que decide se o fluxo existe ou não. A AWSales não tem como saber se a pessoa logou ou preencheu o perfil. O board já prevê isso corretamente com os nós GATILHO EXTERNO (Push) status = E1 / E2.

Sem o time técnico do Falcão publicando esses dois eventos (primeiro acesso e cadastro completo) para o n8n, o fluxo inteiro colapsa: não há E0, E1 nem E2, e a IA só pode perguntar ao lead se ele conseguiu, acreditando na resposta.

Perguntar ao lead é o plano B viável, mas muda o desenho: a cadência passa a reagir ao que ele responde, não ao que o sistema observa.

### Nós "Atraso inteligente" (5 min, 1h, 12h, 24h) — PRECISA N8N para o tempo exato
Duas opções, e a escolha é do cliente:

- Follow-Up Inteligente da AWSales: nativo, personaliza a mensagem pelo ponto exato onde a conversa parou, mas decide o timing sozinho. Não entrega 5 min / 1h / 12h cravados.
- Cadência empurrada pelo n8n: o n8n guarda o status e o relógio e dispara cada etapa na hora exata, como no board. Mais trabalho de integração, controle total do timing.

Observação sobre a cadência desenhada: quatro mensagens nas primeiras 24 horas para quem acabou de comprar, num público que a própria base de Suporte descreve como 45+ e com baixa familiaridade com tecnologia, tem risco alto de bloqueio e de reclamação. Vale propor 5 min, 12h e 48h.

### Nós "Condição: status está E0/E1/E2" — NATIVO como estado do checkpoint
Vira campo de classificação no checkpoint, com caixa `- [ ]`, critério observável e default seguro (regra registrada em `Estrutura/ESTRUTURAS_E_EXEMPLOS.md`). Quem escreve o valor é o evento externo, não a IA.

### Ramo E1, mensagens com botões COMPLETAR MEU PERFIL / APROVAR MEU PERFIL — PARCIAL
Se forem templates: botão OK. Se forem nativas: vira link.
A mensagem de 1 hora usa `{{nome_IA}}`: desnecessário, escrever o nome direto no checkpoint.

### Ramo E2, MSG 03 e campanha de indicação — PARCIAL, e provavelmente campanha própria
- O disparo por status E2: NATIVO via evento.
- "encaminhar a mensagem pronta pra ele(a)" com BOTÃO ENVIAR PRESENTE: CONFIRMAR. Não existe botão de encaminhar no WhatsApp Business API. O caminho equivalente é um link `wa.me` com texto pré-preenchido, que abre a lista de contatos do lead com a mensagem pronta. Funciona como botão de URL em template ou como link em mensagem nativa.
- O amigo responde formulário e cria conta: fora da AWSales. É página do cliente. A AWSales só entra de novo se o formulário disparar um input.
- Recomendação: a indicação tem objetivo próprio (aquisição), estado próprio e métrica própria. Encaixa melhor como campanha separada, disparada pelo evento E2, do que como cauda do Onboarding 1. Isso também resolve a medição: dá para saber quantos indicaram sem misturar com quem só ativou.

### "Encerra a automação" — NATIVO
Evento de output. Também precisa existir um output de sucesso: quando o status virar E2, a campanha de ativação para de cobrar acesso.

---

## 3. Problemas de conteúdo, independentes de plataforma

Estes valem levantar com o cliente antes de escrever qualquer artefato.

1. "Seu acesso pode expirar se você não criar a sua conta agora" (MSG 10). Isso não é verdade: o Buscador é anual e não expira por falta de criação de conta. Além de ser escassez falsa, que a política deste projeto proíbe, é afirmação factual que o Response Auditor trata com rigidez e que aumenta risco de reprovação do template Utility na Meta. Trocar por algo verdadeiro, do tipo lembrete de pendência de primeiro acesso.

2. Gênero e identidade da IA inconsistentes. Uma mensagem diz "Sou a {{nome_IA}}" e outra diz "estou preocupado com você". Some-se a isso que a Recuperação 297 usa "Sofia" e o Suporte usa assistente sem nome. Precisa de uma decisão única para o funil inteiro.

3. Emoji em template. As mensagens "Você está com uma pendência... ✨ 👉" e "⚠️ Ação Necessária" parecem templates. A convenção da agência é template de abertura de janela sem emoji, e a Meta costuma reprovar Utility com tom de marketing.

4. Duas grafias de variável de nome no mesmo fluxo: `{primeiro nome}` e `{{first_name}}`.

5. "vi que você ainda não completou seu perfil... e por isso, você não conseguiu acessar o Buscador" (E1, 5 min). Afirma um nexo causal que pode estar errado: o lead em E1 acessou, ele só não completou o cadastro. Se a frase chegar em quem já está dentro do Buscador, soa desinformada.

6. O board não tem nenhuma saída para o lead que responde com problema real ("não recebi o e-mail", "diz e-mail não cadastrado", "não acho o Buscador"). É o cenário mais frequente segundo os dados do Suporte. Na AWSales isso é resolvido pela base, mas precisa estar previsto no checkpoint com gate de handoff.

---

## 4. O que precisa ser decidido para destravar

- [ ] O time técnico do Falcão consegue publicar os eventos de primeiro acesso e cadastro completo? Sem isso, não há E0/E1/E2.
- [ ] Timing exato via n8n ou timing adaptativo via Follow-Up Inteligente?
- [ ] Quais mensagens são template Utility (precisam ir para aprovação na Meta) e quais são nativas?
- [ ] Identidade única da IA para Recuperação, Onboarding e Suporte.
- [ ] A indicação vira campanha separada ou fica dentro do Onboarding 1?
- [ ] Corrigir a alegação de expiração de acesso na MSG 10.
- [ ] O e-mail de compra vem no payload de `compra_confirmada`?
