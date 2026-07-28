# PROMPT — Criar a campanha "Onboarding 1 (espera do produto)" da Nuestra RX

Você é um Especialista de CS da AWSales. Sua tarefa é criar do ZERO uma nova campanha da
Nuestra RX chamada **Onboarding 1**, seguindo o fluxo de 3 fases do projeto. Leia primeiro
todos os arquivos da seção "Arquivos a ler" antes de produzir qualquer coisa.

---

## 1. O que é essa campanha

Campanha de **Onboarding / Customer Success** que cuida da **fase de espera** logo depois que
o lead clica em "Complete Purchase" no checkout da Nuestra RX.

Contexto do modelo (CRÍTICO — leia o Contexto.md da Recuperação de Vendas, que é a
transcrição do áudio do Willian):

- No checkout a pessoa **não paga nada** (pre-save / "$0 ahora"). Ela só registra o cartão e
  reserva o pedido ao clicar "Complete Purchase".
- O pedido vai para os médicos da **Beluga Health**, que revisam em **menos de 24 horas**.
- **Só há cobrança SE o médico aprovar a receita.** Se não aprovar, não cobra nada.
- Aprovado → a farmácia 503A prepara e **envia refrigerado em 3 a 5 dias úteis**.
- Há gates do lado do cliente que ele precisa cumprir para liberar o envio (ver
  admin-panel-mapping.md): **criar conta/senha, verificação de identidade (ID), foto de corpo
  inteiro**, etc.

**Narrativa da campanha:** "deu tudo certo, seu pedido está reservado; agora um médico vai
revisar seu caso (em até 24h); você só será cobrado se ele aprovar; quando aprovar, seu
tratamento é enviado em 3-5 dias". Tom de quem acolhe, tranquiliza e mantém o lead seguro
durante a espera — e ajuda o lead a completar os passos pendentes (conta, ID, foto) para não
atrasar.

Objetivo: reduzir ansiedade/cancelamento na espera, tirar dúvidas dessa etapa e garantir que
o lead complete os gates pendentes para a aprovação/envio.

---

## 2. Ponto de partida do lead (contexto para o conteúdo)

A campanha começa no momento em que o lead acabou de clicar "Complete Purchase" — ou seja, ele
JÁ reservou o pedido (pre-save, $0 cobrado) e está aguardando a revisão médica. A IA abre a
conversa a partir desse ponto: parabeniza, tranquiliza e explica a espera.

Dados disponíveis para personalizar a conversa (chegam no evento que dispara a campanha, no
`metadata`): `order_id`, nome do produto/plano comprado (`product_name`), valor do plano
(`amount`), e o link do portal do paciente (`thankyou_link`). Use o `product_name` para
personalizar (ex: "tu pedido de Tirzepatida quedó reservado").

Este Onboarding 1 cobre só a fase de ESPERA (do clique no Complete Purchase até a
aprovação/envio). O que vem depois (pós-entrega, uso do medicamento) seria um Onboarding 2,
fora do escopo aqui.

> A parte técnica — qual evento dispara a campanha e qual a encerra, e a fiação no n8n/painel —
> é CONFIGURAÇÃO DE INTEGRAÇÃO, feita à parte, e NÃO faz parte deste prompt de conteúdo. Não se
> preocupe com isso aqui; foque em Texto Complementar, FAQs, Checkpoint e mensagens.

---

## 3. Tipo de campanha, agente e prompt de extração

- **Tipo de base / extração:** **Customer Success** (NÃO é Recuperação de Vendas). Use o
  arquivo `Prompts de extração/Prompt de extração - Customer Success.txt` para entender o que
  as FAQs vão capturar (onboarding, problemas frequentes, jornada, protocolos críticos).
- **Agente sugerido na AWSales:** **Onboarding** (aba Customer Success). NÃO usar agentes da
  aba Lançamento (eles alucinam abertura de carrinho).
- **Base de conhecimento NOVA:** não reaproveite a base das campanhas de recuperação (aquelas
  são sobre objeção/venda). Esta precisa de FAQs da fase de espera. Alguns FATOS de produto se
  repetem (envio, garantia, reembolso), mas reescritos para o contexto pós-compra.

---

## 4. O que a base de conhecimento precisa cobrir (dúvidas da fase de espera)

Crie o Texto Complementar (Produto + Playbook) direcionando a extração para FAQs como:

Produto (o "o quê"):
- "¿Qué pasa ahora que completé mi pedido?" (revisão médica em <24h)
- "¿Cuándo y cómo me van a cobrar?" (só após aprovação médica; valor do plano)
- "¿Cuánto tarda en llegar el medicamento?" (3-5 días úteis após aprovação, refrigerado)
- "¿Cómo sé que el médico aprobó?" (notificação / WhatsApp / e-mail — confirmar canal)
- "¿Qué pasa si el médico no aprueba?" (não cobra; reembolso conforme política)
- "¿Puedo cancelar mientras espero?" (política de cancelamento / 7 dias)
- "¿Qué necesito hacer ahora?" (criar conta/senha, verificación de identidad, foto de corpo
  inteiro — os gates do admin-panel-mapping.md)
- "¿Dónde sigo mi pedido?" (thankyou_link / portal do paciente patient.nuestrarx.com)
- "¿Cómo me guardo y aplico el medicamento?" (conservação 2-8°C, instruções no primeiro envio)

Playbook (o "como" atender — empatia/onboarding, lente do CS):
- Como tranquilizar a ansiedade da espera ("¿ya pasó un día y no sé nada?")
- Como conduzir o lead a completar os gates pendentes (ID, foto) sem fricção
- Como reduzir o medo de ter sido cobrado ("¿me cobraron ya?")
- Como lidar com quem quer desistir na espera (lembrar do risco zero, do próximo passo)
- Quando escalar ao suporte humano (dúvida clínica, problema de pagamento real, demora
  fora do normal)

Regras de FAQ do projeto (ler ESTRUTURAS_E_EXEMPLOS.md e PROMPT_SISTEMA_UNIVERSAL.md):
- FAQs SEM valores/preços e SEM links/variáveis (preços e links vão no checkpoint).
- Resposta = instrução ao agente, não script.
- As FAQs saem em ESPANHOL (lead latino) — atenção: o prompt de extração é em português, então
  reforce no Texto Complementar que o conteúdo é para gerar FAQ em espanhol.

---

## 5. Checkpoint (criar do zero, na Fase 2)

Siga a estrutura e regras de ESTRUTURAS_E_EXEMPLOS.md e PROMPT_SISTEMA_UNIVERSAL.md. Pontos
obrigatórios desta campanha:

- **Identidade:** conserje privado de NuestraRx (NÃO "asistente", NÃO chatbot). Tom acolhedor,
  premium, tranquilizador.
- **IDIOMA (regra acima de todas):** responder SEMPRE em espanhol neutro latino-americano. As
  instruções e FAQs podem estar em português; a resposta ao lead é sempre espanhol. (As campanhas
  de recuperação tiveram vazamento de português — não repita.)
- **Sem asteriscos, sem emojis. Acentuação pt-br correta nas instruções, espanhol correto nas
  mensagens. Variáveis no rodapé. Formato `@tool` correto se houver tool.**
- **Narrativa central:** parabenizar pela reserva, explicar a revisão médica (<24h), reforçar
  "ahora no pagas nada; solo se cobra si el médico aprueba", e o envio em 3-5 dias após aprovar.
- **Conduzir aos gates pendentes** (conta/senha, ID, foto de corpo inteiro) — passo a passo,
  sem assustar.
- **Não prometer** aprovação médica, prazo clínico exato nem resultado. A aprovação depende do
  médico.
- **Usar o metadata do order_paid** (order_id, product_name) para personalizar.
- **Gates de handoff:** dúvida clínica específica, problema de pagamento real, ou demora fora do
  padrão → suporte humano.
- Campos de estado para o Follow-Up Inteligente (status da espera, temperatura, próximo passo).
- Variáveis: link do portal do paciente, link de suporte, etc. (pegar os reais do insumo; o
  WhatsApp de suporte é https://wa.me/19732826268).

---

## 6. Mensagens de disparo

- **Abertura (template HSM, sem emoji):** dispara logo após o Complete Purchase. Gancho:
  "¡Felicidades! Tu pedido quedó reservado..." + reforço do risco zero + próximo passo
  (revisão médica / completar perfil). CTA isolado.
- FUPs: ângulo de tranquilizar a espera e lembrar de completar os gates. (Ou usar Follow-Up
  Inteligente — ver FOLLOWUP_INTELIGENTE.md.)

---

## 7. Fluxo obrigatório de 3 fases (NÃO pular)

Siga RIGOROSAMENTE o PROMPT_SISTEMA_UNIVERSAL.md:

- **Fase 1:** ler insumos → criar **Texto Complementar (Produto + Playbook)** focado na fase de
  espera → **PARAR** e pedir ao usuário para gerar as FAQs na plataforma (com o prompt de
  extração de Customer Success). Não criar checkpoint nem mensagens antes das FAQs.
- **Fase 2:** usuário traz as FAQs → avaliar objetivamente (só listar EDITAR/REMOVER em `.md`,
  resto "ativar") → criar **Checkpoint** → criar **Mensagens de disparo**.
- **Fase 3:** otimizações conforme feedback do cliente.

Salvar tudo dentro de `Nuestra RX/Campanhas/Onboarding 1/` (Texto Complementar, Checkpoint em
`/Checkpoint`, FAQs/avaliação em `/FAQs`, mensagens).

---

## 8. Arquivos a ler (copy path — caminhos completos)

Regras e estrutura do projeto:
- C:\Users\Pedro\Desktop\AwsalesUniversalCreator\CLAUDE.md
- C:\Users\Pedro\Desktop\AwsalesUniversalCreator\Estrutura\PROMPT_SISTEMA_UNIVERSAL.md
- C:\Users\Pedro\Desktop\AwsalesUniversalCreator\Estrutura\ESTRUTURAS_E_EXEMPLOS.md
- C:\Users\Pedro\Desktop\AwsalesUniversalCreator\Estrutura\INPUT_OUTPUT_CAMPANHAS.md
- C:\Users\Pedro\Desktop\AwsalesUniversalCreator\Estrutura\FOLLOWUP_INTELIGENTE.md

Prompt de extração (tipo Customer Success):
- C:\Users\Pedro\Desktop\AwsalesUniversalCreator\Prompts de extração\Prompt de extração - Customer Success.txt

Modelo de negócio / fluxo pós-compra (transcrição do áudio do Willian + gates):
- C:\Users\Pedro\Desktop\AwsalesUniversalCreator\Nuestra RX\Campanhas\Recuperação de vendas\Contexto.md
- C:\Users\Pedro\Desktop\AwsalesUniversalCreator\Nuestra RX\Integração\docs\dosable\admin-panel-mapping.md
- C:\Users\Pedro\Desktop\AwsalesUniversalCreator\Nuestra RX\Integração\docs\dosable\overview.md
- C:\Users\Pedro\Desktop\AwsalesUniversalCreator\Nuestra RX\Integração\docs\dosable\Api\openapi.json

Conhecimento do produto / site (reusar fatos, reescrever para pós-compra):
- C:\Users\Pedro\Desktop\AwsalesUniversalCreator\Nuestra RX\Base de conhecimento\Texto Complementar - Produto.md
- C:\Users\Pedro\Desktop\AwsalesUniversalCreator\Nuestra RX\Base de conhecimento\Texto Complementar - Playbook.md
- Site oficial (ler online): https://nuestrarx.com/ (e /politica-de-reembolso, /informacion-de-seguridad)

Integração do order_paid (o input desta campanha):
- C:\Users\Pedro\Desktop\AwsalesUniversalCreator\Nuestra RX\Integração\docs\forms-site\order-paid-output-awsales.n8n.js
- C:\Users\Pedro\Desktop\AwsalesUniversalCreator\Nuestra RX\Integração\docs\forms-site\ARQUITETURA-CAMPANHAS-AWSALES.md

Campanhas existentes (referência de estilo de checkpoint, conserje, regras):
- C:\Users\Pedro\Desktop\AwsalesUniversalCreator\Nuestra RX\Campanhas\Recuperação de vendas\Checkpoint\checkpoint.md
- C:\Users\Pedro\Desktop\AwsalesUniversalCreator\Nuestra RX\Campanhas\Recuperação de formulário\Checkpoint\checkpoint.md

---

## 9. Payload do input (order_paid) — para referência

O `order_paid` cru chega assim (campos principais):

```json
{
  "event": "order_paid",
  "order_id": "8CBB9090EC",
  "customer_id": "247335",
  "email": "...",
  "phone": "...",
  "amount": "199.00",
  "product_id": "3359",
  "product_name": "Medivera Semaglutide Injectable (monthly supply)",
  "dosable_session_id": "...",
  "dosable_raw": { "thankyou_link": "https://patient.nuestrarx.com/thanks?orderId=...&tenant=64" }
}
```

No AWSales ele vira um `custom_action` (ver order-paid-output-awsales.n8n.js) com esses dados
em `metadata` (order_id, amount, product_id, product_name, dosable_lead_id, dosable_session_id,
thankyou_link). A IA do Onboarding usa esse metadata para personalizar a conversa.

---

## 10. Pendências de CONTEÚDO para confirmar com o usuário/Willian

(Só o que afeta o conteúdo das FAQs/checkpoint. A fiação de integração é tratada à parte.)

- **Canal de aviso de aprovação** (WhatsApp? e-mail? portal do paciente?) — para a FAQ
  "¿cómo sé que el médico aprobó?" e para o checkpoint dizer ao lead onde acompanhar.
- **Sequência exata dos gates do cliente** (criar conta/senha, verificación de identidad, foto
  de corpo inteiro): quando precisam ser completados (antes ou depois da aprovação) e onde —
  para o checkpoint guiar o lead corretamente. Confirmar no painel Dosable / com o Willian.
