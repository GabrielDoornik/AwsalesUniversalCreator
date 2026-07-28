# Proposta de melhorias conversacionais — Nuestra RX

Baseado na leitura das conversas reais da campanha Recuperação de Formulário e na configuração atual do checkpoint/normalizer.

Objetivo deste documento: listar somente melhorias conversacionais com potencial real de aumentar conversão ou reduzir atrito, para uma segunda IA avaliar antes de aplicar.

## 1. Tratar leads que já usaram GLP-1 como mais quentes e experientes

### Evidência nas conversas

Alguns leads já chegaram com experiência prévia em Semaglutida, Tirzepatida ou Mounjaro:

- Regina: já tinha usado Semaglutida e Tirzepatida.
- Nelda: disse que se injetava Mounjaro/Tirzepatida.
- Blanca: disse que usou Mounjaro por 3 meses e buscava outra opção após perder o seguro.

Esses leads não são iniciantes. Eles já conhecem o tipo de tratamento, já têm referência de aplicação e tendem a estar mais próximos da decisão.

### Problema atual

A IA às vezes conduz esses leads como se fossem totalmente novos, repetindo explicações genéricas e fazendo perguntas em ritmo de formulário padrão.

### Melhoria proposta

Criar um caminho conversacional específico para lead com experiência prévia em GLP-1:

- reconhecer a experiência;
- reduzir explicações básicas;
- focar em continuidade, segurança, plano e checkout;
- perguntar apenas o que falta para a revisão médica.

### Exemplo de resposta desejada

```text
Perfecto, como ya usaste Mounjaro/Tirzepatida, te hago solo unas preguntas para que el médico revise continuidad y seguridad. Así no tienes que repetir todo desde cero.
```

Ou:

```text
Eso ayuda mucho, porque ya conoces el tipo de tratamiento y la aplicación. Vamos a dejar tu evaluación lista para que el médico revise si puedes continuar con Tirzepatida.
```

### Impacto esperado

Menos fricção para leads mais quentes, maior sensação de personalização e avanço mais rápido para escolha de plano/checkout.

## 2. Ajustar a resposta para "qual é melhor?" sem soar como prescrição médica

### Evidência nas conversas

Leads perguntaram qual medicamento escolher:

- Luis: "Cuál me recomiendas", "Yo quiero el que haga el mayor efecto".
- Outros leads demonstraram indecisão entre Semaglutida e Tirzepatida.

### Problema atual

A IA precisa ajudar o lead a decidir, mas sem parecer que está fazendo recomendação médica individual ou prescrevendo. Em alguns momentos, ela pode soar muito assertiva clinicamente, como se estivesse dizendo qual opção é "indicada" para aquele caso.

### Melhoria proposta

Manter a escolha com o lead e explicar por critérios comerciais/comparativos, não como prescrição:

- Semaglutida: mais conhecida, econômica, bom ponto de entrada.
- Tirzepatida: mais recente, dupla ação, costuma ter eficácia média maior e custa mais.
- O lead escolhe com qual quer que o médico revise o caso.

### Exemplo de resposta desejada

```text
Si buscas una opción más económica para empezar, Semaglutida suele ser la más elegida. Si buscas una opción más reciente, de doble acción y con mayor eficacia promedio, muchos prefieren Tirzepatida.

Tú eliges con cuál quieres que el médico revise tu caso.
```

### Impacto esperado

Ajuda na decisão sem risco de compliance, reduz indecisão e evita empurrar a escolha para o médico, que era um ponto já corrigido na configuração atual.

## 3. Usar "$0 agora" como alavanca obrigatória nos momentos certos

### Evidência nas conversas

Muitos leads perguntaram preço, impostos, segurança da cobrança ou se o pagamento seria recorrente. A explicação de "agora não paga nada" reduz risco percebido e ajuda a avançar.

### Problema atual

A configuração atual já contém a regra correta: usar "ahora no pagas nada" e não "hoy" nem "24 horas" como janela de cobrança. A melhoria não é repetir isso o tempo todo, e sim garantir que apareça nos momentos de maior objeção.

### Melhoria proposta

Transformar "$0 agora" em alavanca conversacional obrigatória em três momentos:

- quando o lead pergunta preço;
- quando demonstra medo de cobrança, imposto, recorrência ou aprovação;
- antes de enviar o checkout.

### Exemplo de resposta desejada

```text
Ahora no pagas nada. Solo se procesa el cobro si el médico aprueba tu receta. Si no aprueba, no se cobra nada.
```

### Impacto esperado

Reduz medo de cobrança, reduz objeção de risco e melhora a taxa de avanço para checkout.

## 4. Melhorar a última mensagem quando a tool falha

### Contexto importante

Quando a tool falha, a IA não consegue "voltar sozinha" uma hora depois para mandar o link. A IA responde apenas quando há turno de conversa. Se a tool falha e o lead não responde mais, quem pode retomar depois é o humano ou o Follow-Up Inteligente.

Portanto, a melhoria não é fazer a IA esperar e mandar depois. A melhoria é deixar a última mensagem pós-falha mais forte, mais clara e mais segura.

### Problema atual

A mensagem atual pode ficar vaga demais, por exemplo:

```text
Dame un momento, estoy dejando tu enlace listo aquí mismo.
```

Isso segura pouco o lead e não explica que ele não precisará recomeçar.

### Melhoria proposta

Quando a tool falhar, a IA deve:

- não inventar causa técnica;
- não mandar para suporte automaticamente;
- reforçar que os dados já ficaram avançados;
- dizer que o lead não precisa voltar ao site nem repetir tudo;
- preparar terreno para retomada por follow-up ou humano, se necessário.

### Exemplo de resposta desejada

```text
Ya tengo tus datos principales. Estoy intentando dejar tu enlace listo por aquí.

Si el sistema no lo entrega en este intento, no necesitas empezar de nuevo: tu evaluación queda avanzada y retomamos desde este mismo punto.
```

Alternativa mais comercial:

```text
Tus datos ya están prácticamente listos. Estoy intentando generar tu enlace para que no tengas que volver al sitio ni repetir la evaluación.

Si tarda un poco, retomamos desde aquí mismo.
```

### Impacto esperado

Reduz ansiedade, evita abandono no momento mais sensível e deixa o lead melhor preparado caso um humano ou follow-up retome depois.

## 5. Não tratar a duplicidade aparente de follow-up como problema confirmado

### Evidência nas conversas

Na extração, algumas mensagens de follow-up por inatividade aparecem duplicadas no mesmo minuto.

### Interpretação

Não há evidência suficiente de que o lead recebeu duas mensagens duplicadas. Pode ser bug de visualização, bug da exportação ou duplicidade aparente na extração.

### Recomendação

Não levar isso ao cliente como falha conversacional confirmada.

Se for investigar, tratar como hipótese operacional:

```text
Verificar se a duplicidade vista na extração representa envio real no WhatsApp ou apenas duplicidade de visualização/exportação.
```

## Priorização recomendada

1. Aplicar o caminho de lead experiente em GLP-1.
2. Refinar a resposta de escolha entre Semaglutida e Tirzepatida.
3. Garantir "$0 agora" nos três momentos de objeção.
4. Melhorar a mensagem final quando a tool falha.
5. Apenas verificar a duplicidade aparente de follow-up, sem tratar como problema confirmado.

## Observação final

Essas melhorias não substituem os consertos técnicos já feitos no normalizer e no checkpoint. Elas são uma camada conversacional adicional, baseada nos padrões observados nas conversas reais.

