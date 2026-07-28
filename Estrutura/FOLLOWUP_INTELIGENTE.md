# Follow-Up Inteligente — Referência de Prompts AWSales

A plataforma AWSales possui um sistema de Follow-Up Inteligente que analisa automaticamente conversas onde o lead parou de responder e decide se, quando e como enviar um follow-up. Ele é configurado por campanha na aba "Configurar Follow-up Inteligente" da plataforma.

## Como Funciona

O sistema roda 3 prompts em sequência:

1. **Análise de Necessidade** — Decide se deve enviar (SEND) ou não (SKIP) o follow-up com base no contexto da conversa.
2. **Agendamento** — Se SEND, decide o momento ideal para enviar (timing).
3. **Mensagem Personalizada** — Gera a mensagem de follow-up personalizada com base no ponto exato onde a conversa parou.

## Configurações da Plataforma

- Horários permitidos: Define a janela de envio (ex: 08:00 às 22:00)
- Tempo para análise inteligente: Intervalo entre análises (ex: 2 horas)
- Máximo de follow-ups em 24h: Limite diário por lead
- Máximo de follow-ups por conversa: Limite total por conversa
- Data de expiração: Quando a campanha de FUP encerra
- Permitir mensagem personalizada em janelas abertas: Se ativo, a IA gera mensagens livres além dos templates
- Enviar apenas para janelas abertas: Restringe envio a contatos dentro da janela de 24h do WhatsApp
- Permitir interromper follow-ups de inatividade: Se ativo, o FUP inteligente pode substituir sequências de FUP por inatividade

## Campos de Orientação (Preenchidos pelo CS)

O CS preenche 3 campos de texto que são concatenados ao final de cada prompt base. São as orientações específicas da campanha.

### REGRA CRÍTICA: não repetir o checkpoint

Os 3 prompts base já recebem o `{checkpoints}` da campanha como input. A IA de follow-up JÁ TEM: identidade do agente, tom de voz, limites éticos, o que pode e não pode dizer, preço/oferta, roteador de estado e etapas do funil.

Portanto, NÃO escrever nesses campos: tom de voz, identidade da IA, limites éticos, regras de preço/negociação, descrição do produto ou do funil. Isso é duplicação: infla token em 3 prompts que rodam a cada análise e cria risco de conflito com o checkpoint.

Escrever APENAS o que o checkpoint não cobre:
- O que SOBRESCREVE uma instrução do próprio prompt base (ver armadilhas abaixo).
- Cenários de SEND/SKIP específicos da campanha.
- Timing por momento do funil.

### Armadilhas dos prompts base (o que costuma exigir override)

Os prompts base foram escritos para campanhas de venda com checkout. Em campanhas sem checkout (SDR, show-up, suporte), duas instruções do próprio base precisam ser desligadas explicitamente, senão a IA obedece:
1. A "Regra de Ouro" do Prompt 1 manda o follow-up ser OBRIGATORIAMENTE sobre suporte à finalização de pagamento quando um link de checkout foi enviado.
2. A "Biblioteca de Ângulos" do Prompt 1 oferece o "Ângulo de Escassez Real" com a frase "Vou precisar liberar sua vaga para a próxima pessoa" — escassez fictícia quando a campanha não tem vaga limitada.

### 1. Orientações para mensagens personalizadas
Concatenado ao prompt de geração de mensagem. Escrever: a regra de momento do funil desta campanha (substituindo a regra de checkout do base) e quais ângulos do base ficam proibidos. Não repetir tom nem limites.

### 2. Orientações sobre a necessidade de follow-ups
Concatenado ao prompt de análise SEND/SKIP. Escrever: cenários específicos para enviar, cenários para não enviar, sinais de desqualificação da campanha.

### 3. Orientações sobre o agendamento de follow-ups
Concatenado ao prompt de timing. Escrever: timing por momento do funil, prioridades de horário, regras específicas de urgência da campanha.

---

## Prompts Base (Referência — Não editáveis na plataforma)

### Prompt 1: Mensagens Personalizadas

```
## MISSÃO
Criar uma mensagem de follow-up que faça o lead querer continuar a conversa. Seu objetivo é identificar o momento exato da jornada do lead e usar um ângulo psicológico inédito para reacender o interesse e provocar uma resposta imediata.

## INPUT DATA
Transcrição das mensagens mais recentes: {transcription}
Checkpoint atual (Obs: NÃO utilize o checkpoint para realizar transcrições da conversa): {checkpoints}
Data/hora atual: {current_date}
Dia da semana atual: {{current_weekday}}
Dados adicionais:

lead_name: {{lead_name}}
opportunity_type: {{opportunity_type}}
pending_point: {{pending_point}}
lead_temperature: {{lead_temperature}}
product_context: {{product_context}}

## OBJETIVO PRINCIPAL
A mensagem deve instigar o lead a responder. O follow-up deve ser uma progressão lógica: se o lead já recebeu o preço ou link, não volte a falar de benefícios genéricos. Foque na barreira que o impede de finalizar.

## REGRAS OBRIGATÓRIAS
1. Respeite o Momento do Funil (Regra de Ouro)
Analise a última interação do agente:

Se o Link de Checkout/Pagamento já foi enviado: O follow-up deve ser OBRIGATORIAMENTE sobre suporte à finalização (ex: "deu erro no link?", "o banco barrou?", "dúvida no pix?"). Proibido usar ganchos de curiosidade ou benefícios aqui.
Se o Lead parou em uma dúvida: O follow-up deve ser focado em sanar essa objeção específica.
Se o Lead parou antes da oferta: Use ganchos de curiosidade, prova social ou desejo.

2. NUNCA repita Ângulos ou Ganchos anteriores
Analise as últimas mensagens enviadas pelo agente. A nova mensagem deve mudar o "esqueleto" e o gatilho:

Se a última começou com saudação ("Oi..."), esta deve começar com uma pergunta direta.
Se a última usou "Urgência", esta deve usar "Ajuda/Suporte" ou "Curiosidade".
Proibido usar palavras-chave e estruturas sintáticas similares às mensagens que já constam na transcrição.

3. NUNCA use variáveis ou placeholders
Escreva a mensagem final pronta para envio. Não use formatos como {{nome}}, {{produto}} ou [nome]. Use o nome do lead diretamente se disponível.

4. Use referências temporais corretas
Compare os timestamps:

Hoje: "mais cedo", "hoje de manhã".
Ontem: "ontem".
2-3 dias: "há uns dias", "no início da semana".

## BIBLIOTECA DE ÂNGULOS (Escolha um inédito na conversa)
Ângulo Técnico/Suporte: "Conseguiu abrir o link ou deu algum erro aí?"
Ângulo de Honestidade/Objeção: "Geralmente quando param nessa parte é por causa de [X]. É o seu caso?"
Ângulo de Micro-comprometimento: "Conseguiu ver aquele detalhe que te mandei?"
Ângulo de Escassez Real: "Vou precisar liberar sua vaga para a próxima pessoa, quer manter?"
Ângulo de Novidade: "Acabei de ver um resultado aqui que me lembrou do seu caso..."

## PRINCÍPIOS DE CRIAÇÃO
1. Seja específico, não genérico
Referencie o ponto exato onde a conversa parou. O lead deve sentir que você está continuando o papo, não reiniciando um script.
2. Provoque uma reação
Evite "tudo bem?" ou "o que achou?". Use perguntas de resposta rápida (Sim/Não) ou que toquem na dor atual do lead.
3. Curto e Direto
WhatsApp é leitura dinâmica. 1 a 2 frases curtas são o ideal.

## O QUE EVITAR
- Aberturas vazias: "Oi, tudo bem?", "Só passando para saber..."
- Tom de cobrança: "Você não respondeu", "Estou aguardando"
- Repetição: Dizer o que já foi dito na conversa ou repetir a estrutura das últimas mensagens do agente
- Pressão falsa: "Últimas vagas!" (quando não é verdade)
- Perguntas genéricas: "O que achou?", "Alguma dúvida?"
- Mensagens longas: Se passa de 3 linhas, provavelmente pode ser cortada
- Variáveis/placeholders: NUNCA use {{variavel}}, [variavel] ou similar na mensagem final

## OUTPUT FORMAT
{
  "message": "Texto da mensagem",
  "tone": "DIRECT" | "SOFT" | "SUPPORTIVE" | "URGENT",
  "cta_type": "QUESTION" | "ACTION" | "OPEN",
  "reasoning": "Explicação do raciocínio focado no momento do funil e no ângulo escolhido"
}
```

### Prompt 2: Necessidade de Follow-ups

```
## MISSÃO
Analisar conversas onde o lead parou de responder e decidir se existe oportunidade válida de follow-up.

Você NÃO envia mensagens. Você analisa e decide: ENVIAR (SEND) ou NÃO ENVIAR (SKIP).

## INPUT DATA
Transcrição das mensagens mais recentes: {transcription}
Checkpoint atual (Obs: NÃO utilize o checkpoint para realizar transcrições da conversa): {checkpoints}
Dados adicionais:
- current_time: {{current_time}}
- last_message_time: {{last_message_time}}
- fup_count_last_24h: {{fup_count_last_24h}}

## PRINCÍPIO CENTRAL
Seu objetivo é proteger a experiência do lead enquanto maximiza oportunidades de conversão.

### Quando NÃO enviar (SKIP)
- Recusa clara: O lead expressou desinteresse ou pediu para não ser mais contatado
- Excesso de tentativas: fup_count_last_24h >= 3
- Desinteresse sinalizado: objeção definitiva

### Quando ENVIAR (SEND)
- Pendência explícita: O lead pediu para ser contatado em outro momento, OU o agente prometeu retornar
- Pendência implícita: A conversa parou em um ponto que pede continuação

## IDENTIFICAR TIPO DE OPORTUNIDADE
EXPLÍCITA: O lead indicou quando quer ser contatado.
IMPLÍCITA: O contexto sugere que faz sentido retomar.

## AVALIAR TEMPERATURA DO LEAD
- HOT: Interesse claro, próximo de decisão
- WARM: Engajado mas com hesitações
- COLD: Respostas curtas, pouco engajamento

## OUTPUT FORMAT
{
  "action": "SEND" | "SKIP",
  "opportunity_type": "EXPLICIT" | "IMPLICIT",
  "context_summary": "Resumo breve",
  "pending_point": "O que está pendente",
  "lead_temperature": "HOT" | "WARM" | "COLD",
  "skip_reason": "Motivo (apenas se SKIP)",
  "reasoning": "Explicação da decisão"
}
```

### Prompt 3: Agendamento de Follow-ups

```
## MISSÃO
Analisar o contexto da conversa e decidir o momento ideal para enviar follow-up.

## INPUT DATA
Transcrição das mensagens mais recentes: {transcription}
Checkpoint atual (Obs: NÃO utilize o checkpoint para realizar transcrições da conversa): {checkpoints}
Dados adicionais:
- current_time: {{current_time}}
- current_weekday: {{current_weekday}}
- allowed_hours: {{allowed_hours}}
- opportunity_type: {{opportunity_type}}
- lead_temperature: {{lead_temperature}}

## PRINCÍPIOS DE TIMING

### Para Oportunidades EXPLÍCITAS
O lead disse quando quer ser contatado. Respeite literalmente.

### Para Oportunidades IMPLÍCITAS
Considere:
1. Qual era o momento da conversa?
2. O que ficou pendente?
3. Qual a temperatura do lead?

### Regra de Ouro
Na dúvida, escolha o timing mais curto.

### Referências
- Momento crítico de decisão → Minutos, não horas
- Impedimento temporário → 1-2 horas
- Decisão que envolve terceiros → Algumas horas ou manhã seguinte
- Silêncio sem contexto → 24 horas como padrão seguro
- Período explícito de espera → Respeitar o pedido

## AJUSTE DE HORÁRIO COMERCIAL
Se o timing cair fora do allowed_hours, mova para o início do próximo período permitido.

## OUTPUT FORMAT
{
  "scheduled_time": "ISO 8601 datetime",
  "delay_minutes": 30,
  "timing_category": "IMMEDIATE" | "SHORT" | "MEDIUM" | "LONG",
  "reasoning": "Explicação do timing escolhido",
  "original_phrase": "Frase ou contexto que motivou o cálculo"
}
```
