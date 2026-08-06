# Falcão das Milhas — Reduzir handoff no Suporte e nos Onboardings

**Pedro** · Prioridade alta
**Atualizada em 05/08/2026** com o que mudou depois da conversa com o cliente.

**Recorte da análise: 01 a 04/08/2026, 4 dias fechados, 161 tickets de handoff.**
Campanhas de onboarding nasceram em 27/07, então não existe histórico mais longo pra comparar. Suporte roda desde 15/04.

**Como os 161 se dividem:**

| | Tickets | % |
|---|---|---|
| Cancelamento / reembolso, handoff obrigatório por regra | 69 | 43% |
| Ação interna no sistema do Falcão (reset, liberação, jurídico) | 12 | 7% |
| **Evitável, escopo desta task** | **77** | **48%** |
| Depende de resposta do cliente | 1 | 1% |
| Indeterminado, precisa abrir trace | 2 | 1% |

**Dos 77 evitáveis, ~66 saem com os ajustes abaixo.** Em ordem de quantos tickets cada um resolve. Todas as citações são conversa real de produção.

> ⚠️ **Antes de começar:** o checkpoint de Suporte que está no drive está desatualizado (21 mil caracteres contra 27 mil em produção). Falta a Seção 6.1 inteira e a regra de cancelamento. **Trabalha sempre a partir da produção**, nunca do arquivo do drive. Depois atualiza o drive.

> ⚠️ **O que o cliente já sabe:** o Lucas já comunicou no grupo os itens 1, 4 e o ajuste de texto do item 7. O item 3 está travado esperando resposta do cliente. O resto é interno.

---

## 1. Etapa 2 da Onboarding 3, junta as 3 mensagens num bloco
### 30 tickets · 45% da campanha · LIBERADO, SOBE HOJE

**O que acontece:** o checkpoint manda enviar 3 mensagens separadas. O modelo gera uma resposta por turno, então manda tudo junto. O auditor reprova, tenta 5 vezes, desiste e escala.

**O detalhe que resolve isso rápido:** o conteúdo está **certo**. Veja o que ela mandou:

> "Você acabou de ganhar o direito de presentear aquele seu amigo que também ama viajar...
> Agora, você pode adicionar ele de graça no Buscador.
> E ele vai ter acesso às melhores passagens por causa de você!
> Para adicionar seu amigo de graça, é bem simples.
> 1) Você vai tocar no link abaixo
> 2) Vai encaminhar a mensagem para o seu amigo(a)
> 3) Ele vai criar a conta gratuitamente no Buscador Automático (...)
> Toque no link abaixo e mande seu presente agora: https://..."

É exatamente o texto das três mensagens, na ordem, sem inventar nada. O único problema é que veio numa mensagem só.

**O que fazer, escolhe uma:**
- **(a)** Splitter na entrega: põe delimitador no texto fixo e quebra no envio.
- **(b)** Se (a) não der nesta sprint: libera bloco único nessa etapa no auditor **hoje**. Uma mensagem junta é muito melhor que 5 retries e um humano.

**Ganho colateral de custo:** 60,6k tokens por sessão na Onb3 contra 31,7k na Onb2. R$ 0,21 por conversa contra R$ 0,09. A diferença é retry queimado.

---

## 2. Onboarding 3 está sendo disparada pra quem não preencheu o perfil
### 19 tickets · DIAGNÓSTICO MUDOU, LER COM ATENÇÃO

**Correção em relação à versão anterior desta task.** Eu tinha escrito que o problema era o gatilho de entrada da campanha, e o time levantou que era um follow-up sendo mandado pra qualquer caso. Fui verificar o que abre essas sessões e **não é o follow-up**.

Das 24 conversas afetadas, **18 abrem com o template de abertura da própria Onboarding 3**:

> "Agora sim, está tudo pronto para você começar a usar o Buscador Automático... `*PRESENTE GRATUITO:*` Por ter completado o seu perfil..."

Só **1** abriu com follow-up (*"Oi, Juliana! Tudo bem? Imagino que tenha surgido alguma dificuldade com o preenchimento do seu perfil de viagens..."*, em 03/08). Esse follow-up o time já retirou, e estava fora de lugar mesmo, mas responde por 1 de 24.

**Continua acontecendo.** Série de conversas mal roteadas por dia:

| Dia | Conversas | LIE_DETECTOR |
|---|---|---|
| 01/08 | 3 | 4 |
| 02/08 | 5 | 1 |
| 03/08 | 7 | 7 |
| 04/08 | 5 | 7 |
| **05/08** | **3** | **4** |

**A prova de que a pessoa não preencheu:** dentro dessas sessões da Onb3, a mensagem do cliente é resposta ao template do **Onboarding 2**, o convite pra *preencher* o formulário:

| Mensagem do cliente | Vezes |
|---|---|
| "RESGATAR PRESENTE" (template correto da Onb3) | 97 |
| **"Continuar"**, resposta ao template do Onboarding 2 | **13** |
| **"Preciso de ajuda"**, resposta ao template do Onboarding 2 | **4** |

**Ticket real:**
> "A IA afirmou que o cliente já completou o perfil e ganhou um presente, mas o cliente respondeu 'Continuar' ao formulário, indicando que ele ainda não o preencheu."

A IA não inventou. Ela leu isso no checkpoint, Seção 1: *"Seu público são clientes que acabaram de completar o cadastro do perfil de viagens."*

**O que fazer:**

**2a. PRIMEIRO, descobre o que dispara a abertura da Onboarding 3 hoje.** Como o webhook do Typeform não está plugado, não existe sinal de "formulário enviado", então o gatilho é outra coisa. Se for tempo depois da Onb2, é exatamente isso que está pegando quem não preencheu. **Traz a resposta antes de mexer**, porque o ajuste depende do que for.

**2b. Sobe hoje, independente do 2a:** trava na Etapa 1 pra IA não afirmar o que ela não sabe.
- de: `"Comemorar em uma frase que o perfil está completo."`
- para: `"Confirmar antes de comemorar. Perguntar se ele concluiu o perfil e só seguir para o presente com a confirmação dele. Não afirmar que o perfil está completo sem evento do sistema."`

**2c.** Adicionar `link_formulario_perfil` = `https://rebrand.ly/buscador-perfil` nas variáveis da Onb3, com regra de que os links do amigo nunca são formulário de perfil. Um dos tickets é a IA mandando `link_cadastro_amigo` no lugar.

**2d.** Regra de e-mail: a IA escreveu `henrique.fariarios@gmail.com` quando o metadata dizia `henrique.fariario@gmail.com`. Adicionar: *"Copiar `{{metadata.email_compra}}` literalmente. Nunca redigitar, reescrever ou completar e-mail de memória."*

> ⚠️ Este é o bucket com a estimativa mais frágil da análise. Classifiquei os 19 pelos resumos, sem abrir cada conversa. Ver **I3**.

> **O que o cliente sabe:** o Lucas não colocou esse ponto na comunicação, porque o ajuste ainda está em pé. Não é pra tratar como resolvido.

---

## 3. Onboarding 2, "cerca de cinco minutos"
### 15 tickets · 75% da campanha · TRAVADO, ESPERANDO O CLIENTE

**Não mexer ainda.** O Lucas perguntou ao cliente qual caminho seguir e as duas direções são opostas. Se você editar antes da resposta, tem chance de refazer.

**O que acontece:** o template de abertura fala de tempo, a IA repete, e o checkpoint proíbe falar de tempo.

**O template que o cliente recebe** (226 disparos no recorte, 382 desde 27/07):

> "Sua conta no Buscador Automático já está criada, mas o cadastro do seu perfil de viagens ainda não foi preenchido. É o passo que falta para concluir seu cadastro. São algumas perguntas sobre o seu jeito de viajar e **leva cerca de cinco minutos**."

**A IA, na conversa, depois:**

> "Perfeito, Paulo! Esse é o link para o formulário: [...] Como comentei, **são cerca de cinco minutos** para responder."

**Detalhe importante de leitura:** no recorte só **2 mensagens da IA com o número chegaram ao cliente**, mas são **15 tickets**. O auditor reprova a resposta antes de ela sair, então cada ticket são ~5 tentativas barradas que ninguém viu. Ou seja, isso quase não polui a conversa: **queima token e enche a fila silenciosamente.**

**São 4 fontes empurrando o número:**
1. O template (`leva cerca de cinco minutos`)
2. A proibição do checkpoint, que cita o número literal (`Nada de cinco minutos, dois minutos`). Exemplo negativo com o valor dentro é a forma mais confiável de fazer o modelo produzir aquilo
3. A FAQ ativa do playbook *"Como motivar um cliente que está procrastinando a decisão?"* (usada 23x): *"Deixe claro que o primeiro acesso leva menos de dois minutos"*
4. O histórico: o `ABERTURA_JANELA.md` registra *"Os cinco minutos aparecem já no template, de propósito"*, com justificativa boa (16 perguntas, evitar abandono na pergunta 8). Em **29/07** o cliente decidiu o contrário e o template nunca foi atualizado

### Caminho A, se o cliente disser que os cinco minutos podem ficar

Mais rápido, não depende da Meta, sobe no mesmo dia.

- Checkpoint, Seção 3: **remover a proibição de citar duração** e trocar por orientação de usar a mesma informação da abertura, de forma consistente
- Template fica como está
- FAQ do procrastinando fica como está
- Os 15 tickets vão a zero porque a IA para de ser barrada

### Caminho B, se o cliente quiser tirar o tempo

**B1. Template** (reenvio pra Meta):
- de: `"São algumas perguntas sobre o seu jeito de viajar e leva cerca de cinco minutos."`
- para: `"São algumas perguntas sobre o seu jeito de viajar, a maioria de múltipla escolha."`
- Continua UTILITY. Mantém cabeçalho e rodapé.

**B2. Checkpoint, Seção 3:**
- de: `"- Dizer quantos minutos leva. Nada de cinco minutos, dois minutos, nem qualquer número."`
- para: `"- Não dar estimativa de duração, mesmo se o cliente perguntar direto."`
- de: `"- Dizer quantas perguntas são. Nada de dezesseis, nem 'umas quinze', nem faixa aproximada."`
- para: `"- Não dar o número de perguntas nem faixa aproximada, mesmo se o cliente perguntar direto."`

Sem nenhum número no texto da proibição.

**B3. FAQ do playbook** "Como motivar um cliente que está procrastinando a decisão?":
- de: `"leva menos de dois minutos"` para: `"é rápido"`

### Em qualquer um dos dois caminhos

**3c. Falso positivo do auditor, verificar.** Um dos tickets reprovou a IA por dizer **"bem rápido"**, expressão que o checkpoint **manda** usar três vezes (linha 43: *"dizer que é bem rápido e emendar no motivo"*; linha 148; linha 192). Confirma se o gate de false_promise está pegando "bem rápido" e ajusta. Escalada gerada do nada.

---

## 4. Suporte não tem o link do formulário de perfil, e manda o de reembolso no lugar
### 10 tickets · LIBERADO, SOBE HOJE

**O que acontece:** o cliente pede o formulário de perfil ao Suporte. O Suporte não tem esse link em lugar nenhum.

Conferi as três fontes:

| Onde a IA poderia buscar | Tem? |
|---|---|
| Variáveis da campanha de Suporte | Não |
| Checkpoint de Suporte | Não. Zero menção ao formulário de perfil |
| Base de Suporte (518 + 106 docs) | Não. As 6 FAQs do formulário só existem na base "(Onboarding)" |
| Qualquer uma das 16 bases da org | `rebrand.ly/buscador-perfil` não aparece em nenhum dos 2.000+ docs |

**Causa raiz:** o checkpoint de Suporte foi escrito antes do onboarding existir. O onboarding nasceu em 27/07 e passou a mandar centenas de pessoas para um formulário. Essas pessoas escrevem para o Suporte, e o Suporte nunca foi informado de que esse formulário existe.

**O sintoma pior, e a explicação dele.** Dois tickets reais:
> "A IA enviou o link de reembolso (`link_formulario_reembolso`) afirmando ser o formulário de cadastro de perfil."

Os dois formulários são Typeform **da mesma conta**. Reembolso é `emeo1uhrjwf.typeform.com/to/YK4GtVkl`, perfil é `emeo1uhrjwf.typeform.com/to/RSuIPOnP`. O de reembolso era o único que ela tinha na mão.

E a proibição do checkpoint tem um buraco exatamente ali. Seção 2:
> `"{{link_formulario_reembolso}}: Nunca para acesso, login, bônus, renovação, erro técnico ou passagem."`

Não fala "cadastro" nem "perfil". Ela respeitou a lista.

**O que fazer:**

**4a.** Criar a variável na campanha de Suporte: `link_formulario_perfil` = `https://rebrand.ly/buscador-perfil`

**4b.** Fechar o buraco, Seção 2:
- de: `"Nunca para acesso, login, bônus, renovação, erro técnico ou passagem."`
- para: `"Nunca para acesso, login, cadastro, perfil de viagens, bônus, renovação, erro técnico ou passagem."`

**4c.** Criar um bloco na Seção 5 do checkpoint de Suporte explicando: o que é o formulário de perfil, quando mandar, e que ele **não** é o de reembolso.

**4d.** Copiar as 6 FAQs do formulário de perfil da base "(Onboarding)" (`4aedb65e...` playbook / `3be720b8...` produto) pra base de Suporte (`420f139a...` / `8a977399...`), e **colocar a URL dentro da resposta** da FAQ "Pra que serve esse formulário de perfil de viagens?". Hoje nenhuma das 6 diz qual é o endereço.

---

## 5. O mesmo formulário está sendo enviado em dois links diferentes
### Sem ticket, mas vai dar

Duas mensagens reais da mesma campanha, Onboarding 2:

> "o próximo passo é preencher este formulário: **https://rebrand.ly/buscador-perfil**"

> "Esse é o link para o formulário: **https://emeo1uhrjwf.typeform.com/to/RSuIPOnP?utm_source=awsales**"

O primeiro é a variável. O segundo é o Typeform cru. Dois endereços pro mesmo formulário quebra a medição de UTM e, se um dia o rebrand.ly mudar de destino, tem gente indo pro lugar errado.

**O que fazer:** achar de onde sai o link cru (FAQ ou variável antiga) e padronizar em `{{link_formulario_perfil}}`. Reforçar no checkpoint que o endereço vem sempre da variável.

---

## 6. A IA pede confirmação de preenchimento, e o checkpoint proíbe
### Sem ticket

Mensagem real:
> "Assim que concluir, **é só me avisar por aqui, combinado?**"

O checkpoint da Onb2 proíbe isso em dois lugares:
> `"Nunca pedir que o cliente avise, confirme ou mande um 'ok' depois de preencher o formulário. Nem na entrega do link, nem nas retomadas, nem no fechamento."`

> `"pedir confirmação transforma uma tarefa em duas"`

**O que fazer:** verificar se o gate está pegando isso. Se não estiver, é ponto cego. A IA está transformando uma tarefa em duas e provavelmente derrubando conversão de preenchimento **sem gerar ticket nenhum**.

---

## 7. O texto obrigatório do presente promete preço
### 2 tickets · APROVAÇÃO JÁ PEDIDA AO CLIENTE

A Mensagem 2 da Etapa 2 manda dizer:
> "Ele vai criar a conta gratuitamente no Buscador Automático **para ter acesso às passagens mais baratas**"

Mas a Seção 3 do mesmo checkpoint diz:
> "O convite que o amigo recebe fala em acesso gratuito ao Buscador de passagens. **É até aí que você pode ir.**"

Ticket real:
> "a IA incluiu uma promessa de que o amigo terá acesso às passagens 'mais baratas'"

Ela foi reprovada por copiar o texto que o checkpoint manda copiar literalmente.

**O que fazer, assim que o cliente aprovar:** na Mensagem 2, item 3:
- de: `"para ter acesso às passagens mais baratas"`
- para: `"para ver as oportunidades do Buscador"`

---

## 8. A Mensagem 1 anuncia o presente duas vezes
### Junto com o item 2

A Etapa 1 já manda anunciar o presente. Aí a Mensagem 1 da Etapa 2 anuncia de novo (*"Você acabou de ganhar o direito de presentear..."*) e afirma um fato sobre o cliente, que é justo o que dispara o problema do item 2.

**O que fazer:** cortar o reanúncio. Começar a Mensagem 1 direto em *"Agora, você pode adicionar ele de graça no Buscador."*

---

## 9. Asteriscos: estão no template, não é a IA
### 1 ticket · CORREÇÃO em relação à versão anterior

Eu tinha escrito que a IA estava imitando caixa alta. Errado. **O template de abertura da Onb3 sai literalmente com asterisco:**

> "Agora sim, está tudo pronto para você começar a usar o Buscador Automático... `*PRESENTE GRATUITO:*` Por ter completado o seu perfil..."

O `MENSAGENS.md` do drive tem sem asterisco, a produção tem com. A IA espelhou o template, e o checkpoint proíbe asterisco nas duas campanhas.

**O que fazer:** tirar o asterisco do template (não a caixa alta), ou liberar ênfase no checkpoint. Decidir e alinhar as duas pontas.

---

## 10. Rótulo do handoff, não reduz volume, destrava métrica

No Suporte, os 52 tickets de cancelamento aparecem com **24 nomes diferentes**: CANCELAMENTO_REEMBOLSO, _SOLICITADO, _REAFIRMADO, _REITERADO, _INSISTENTE, _PRAZO_7_DIAS, STATUS_CANCELAMENTO, ESTORNO_SOLICITADO...

**Não é bug.** Existe **um** custom trigger na campanha ("Cancelamento, reembolso e financeiro") e o campo de rótulo é texto livre, então a IA nomeia pela condição que disparou. As condições vêm da lista da Seção 5/6.1 do checkpoint:

| Rótulo gerado | Condição no checkpoint |
|---|---|
| CANCELAMENTO_REAFIRMADO | *"reafirmou o pedido depois da primeira tentativa"* |
| CANCELAMENTO_PRAZO_7_DIAS | *"cita prazo de 7 dias, CDC, Procon"* |
| STATUS_CANCELAMENTO | *"pede confirmação do cancelamento, do estorno ou de status"* |
| CONTESTACAO_COBRANCA | *"contestação, chargeback"* |

Comportamento correto num campo livre. Só que no painel parece que são 24 problemas quando é 1.

**O que fazer:**
- **10a.** Fixar 5 valores no custom trigger: `CANCELAMENTO`, `REEMBOLSO`, `ESTORNO_CONTESTACAO`, `STATUS_PEDIDO`, `COBRANCA_DUPLICIDADE`
- **10b.** Onb2 e Onb3 têm **zero** custom triggers. Copiar o do Suporte pras duas, com fila própria. Os checkpoints já mandam a coisa certa, falta só o gate.

---

# Investigar e voltar com resposta, sem implementar

## I0. Atribuição de UTM mudou em 27/07 · URGENTE, PARA ANTES DE QUALQUER REPORT

Isso não é handoff, mas é o mais urgente da lista porque afeta o que a gente reporta como receita atribuída.

Vendas do Buscador Automático, por dia, todas as fontes:

| Dia | meta | awsales | total de vendas |
|---|---|---|---|
| 25/07 | 38 | **0** | 56 |
| 26/07 | 46 | **0** | 68 |
| **27/07** | 31 | **11** | 73 |
| 28/07 | 41 | **42** | 63 |
| 30/07 | 7 | **49** | 67 |
| 01/08 | 4 | **46** | 57 |
| 04/08 | 4 | **32** | 41 |

O `utm_source=awsales` sai de **zero** e vai pra 30 a 49 por dia a partir de 27/07, e `meta` desaba de ~40 pra ~4 a 12. **O total de vendas fica praticamente igual.**

Se a mídia da Meta tivesse sido pausada, o total teria caído junto. Não caiu. Isso tem cara de **mudança de atribuição, não de receita nova**.

**Por que é urgente:** se alguém reportar essas vendas como resultado da Awsales e depois descobrirem que foi troca de rótulo de UTM, o dano de credibilidade é grande.

**Ressalva do meu lado:** essas contagens por UTM podem ter dupla contagem, porque um pedido com order bump gera várias linhas com o mesmo `transaction_id` e nem todas têm UTM. Eu não terminei de resolver isso. Então **trata os números acima como direção, não como valor final**, e refaz com um UTM por transação.

**O que descobrir:** o que mudou em 27/07 (pixel, parâmetro de link, integração Hubla, checkout) e se as vendas com `utm_source=awsales` são de verdade originadas em conversa da IA. Cruzar `transactions.leads_events_id` → `leads_events.lead_id` → `conversion_window` pra ver se existe conversa por trás.

## I1. Por que a retenção é pulada em metade dos cancelamentos

| Suporte, 01 a 04/08 | |
|---|---|
| Conversas em que o cliente falou de cancelar | 54 |
| Viraram ticket | 52 |
| **Retenção que funcionou** | **2** |
| Conversas em que a Consultoria **nem foi mencionada** | **28 de 54** |

O checkpoint manda oferecer a Consultoria gratuita como alternativa ao reembolso antes de encaminhar. Em mais da metade dos casos isso não acontece.

**Minha hipótese:** a Seção 6.1 martela que *"dizer que encaminhou e não transferir é o pior resultado possível do atendimento"*, e a Seção 4 põe cancelamento como exceção à regra de "handoff é último passo". Juntas, elas podem estar empurrando o modelo pro handoff imediato. A instrução mais enfática do documento virou "transfira de verdade", e a retenção ficou fraca ao lado dela.

**Abre 4 ou 5 traces** dessas 28 conversas e descobre se é (a) o gate disparando antes de o Copywriter formular a retenção, ou (b) o texto desbalanceando o reforço. **Traz o diagnóstico antes de mexer na Seção 4.** Essa é a alavanca de maior valor do projeto e não vale errar a causa.

O Lucas ainda não levou esse dado ao cliente, justamente esperando esse diagnóstico. Não comentar externamente.

## I2. Quem é "Jéssica, designer de interiores"?
Na Onboarding 2 a IA se apresentou como *"Jéssica, designer de interiores"* em vez de "Nicole, assistente do Buscador Automático". Designer de interiores não tem nada a ver com milhas. Abre o trace. Se for contaminação de prompt entre orgs, 1 ticket não reflete a gravidade, escala na hora.

## I3. Confirmar caso a caso os 19 tickets do item 2
Classifiquei pelos resumos, não abrindo cada conversa. É a estimativa mais frágil da análise e a que pode mudar a projeção de ganho.

## I4. URL_HALLUCINATION no Suporte
1 ticket, rejeição determinística (*"a resposta contém URL sem comprovação nas fontes autorizadas"*). Provavelmente é o mesmo buraco do item 4, mas confirma no trace qual URL era.

## I5. Rodar o teste de busca semântica que já está escrito
O `BASE_CONHECIMENTO_ONBOARDING.md`, seção 6, tem 10 frases de lead pra testar. Foi escrito quando só a Onb1 existia. Roda de novo com Onb2 e Onb3 no ar, principalmente *"não tô conseguindo, acho que não é pra mim"* e *"não achei nada bom"*. Se voltar fluxo de cancelamento ou oferta de Consultoria, faltou desativar alguma coisa.

Contexto: **a base está bem curada.** Conferi, das 498 FAQs de playbook da base de onboarding só 14 estão ativas, das 92 de produto 35, e nenhuma FAQ de cancelamento/reembolso/Consultoria está ativa. As três marcadas como "reescrever" foram reescritas de fato. Só falta revalidar com o escopo novo.

## I6. A Onboarding 3 deveria poder atender suporte?
O que o RAG da Onb3 mais buscou no recorte: escalar pra humano 19x, erro de acesso 16x, problema no acesso 12x, senha 10x, bônus 8x, erro 404 6x. Sobre o presente: quase nada.

Uma campanha de presente onde as pessoas chegam com problema de acesso. A base já tem esses docs com score 85 a 86. **Avalia e traz recomendação** se vale deixar a IA resolver o acesso e retomar o presente depois. Não implementa sem alinhar.

## I7. A Onboarding 1 está viva?
8 sessões no recorte contra 235 da Onb2 e 259 da Onb3. Split desbalanceado ou campanha desligada? Até saber, **não trata as três como A/B**, não são comparáveis.

---

# Contexto de volume, importante pra medir o resultado

**O volume de conversa está caindo, e isso vai contaminar a medição se você olhar handoff em número absoluto.**

Campanha de Suporte, conversas por dia:

| | Julho (01-31) | Agosto (01-04) | Variação |
|---|---|---|---|
| Conversas/dia | 51,2 | 24,3 | -53% |
| **Conversas/dia útil** | **55,0** | **31,0** | **-44%** |
| Conversas/fim de semana | 40,4 | 17,5 | -57% |

A queda começou na **semana de 20/07**, não em agosto: o pico foi 405 conversas na semana de 13/07 e caiu pra 243 na semana seguinte.

Duas causas candidatas: o motor de smart follow-up parou (228 disparos no Suporte entre 20 e 31/07, **zero em agosto**, último em 31/07), e queda de demanda real. Vendas do Buscador caíram só ~18 a 22% no mesmo período, então venda não explica a queda de 44% em conversa.

**Consequência pra esta task:** na recontagem de 7 dias, medir **handoff por conversa**, não handoff absoluto. Baseline do recorte: **Suporte 76 tickets sobre 87 conversas = 0,87 handoff por conversa.** É essa taxa que isola o efeito da otimização.

---

# Meta

Dos 77 tickets evitáveis, tirar ~66 (86%).

Recontar 7 dias depois do deploy, **mesmo recorte de 4 dias fechados**, medindo **handoff por conversa**.

---

# Status por item

| Item | Situação |
|---|---|
| 1. Etapa 2 da Onb3 | Liberado, sobe hoje |
| 2b, 2c, 2d. Trava da Etapa 1, variável, e-mail | Liberado, sobe hoje |
| 2a. Descobrir o gatilho da Onb3 | Investigar primeiro |
| 3. Cinco minutos | **Travado**, esperando resposta do cliente |
| 4. Formulário de perfil no Suporte | Liberado, sobe hoje |
| 5. Dois links pro mesmo formulário | Liberado |
| 6. Pedido de confirmação | Verificar gate |
| 7. "Passagens mais baratas" | Esperando aprovação do cliente |
| 8. Reanúncio da Mensagem 1 | Liberado |
| 9. Asterisco no template | Liberado |
| 10. Rótulo de handoff | Liberado |
| I0. Atribuição de UTM | **Urgente, antes de qualquer report** |
| I1 a I7 | Investigar e trazer resposta |

---

# Pendências do cliente (já pedidas, só acompanhar)

1. **Cinco minutos: manter nas duas pontas ou tirar da abertura?** Destrava o item 3.
2. **Reset de acesso:** endpoint pro time técnico expor. Resolve 7 dos 12 tickets de ação interna.
3. **Prazo real da fila** de cancelamento e de liberação de bônus.
4. **O Buscador bloqueia sem o perfil preenchido?** Não é de handoff (1 ticket), é de copy: o follow-up de perfil pendente afirma *"e por isso, você não conseguiu acessar o Buscador"* e ninguém confirmou se é verdade.
5. **Acesso ao Typeform**, pro webhook de "formulário preenchido". O Lucas tirou esse pedido da comunicação por ora, então não é urgente.

---

# Como puxar os dados

Metabase **db 7 (NEO)** pra conversa, IA e base. **db 3 (APP)** pra venda e custo.
Org Falcão = `a21b2ab2-e4d4-4cf4-a1af-74674b75d568` (mesmo id nos dois bancos)
Campanhas: Suporte `ffbc47ff-425b-4027-a23f-ec0ee5ec8c73` · Onb1 `b46abedb-0e64-40f0-b778-623902574555` · Onb2 `4814732e-276c-402b-93cf-416934c08cbe` · Onb3 `e071f730-044f-472d-8775-f193d6ce2e4c`

Tabelas úteis no NEO: `handoff_tickets` (motivo e resumo) · `messages` (`template_metadata` separa template de mensagem da IA) · `messages_rag_documents` (o que o RAG buscou e o score) · `documents` + `knowledge_bases` · `campaigns` (`checkpoint`, `variables`, `handoff_config`) · `smart_follow_ups`

⚠️ **Três cuidados que me custaram tempo:**
- `created_at` está em UTC nos dois bancos, mas `transactions.order_date` está em São Paulo. Converter sempre: `((created_at at time zone 'UTC') at time zone 'America/Sao_Paulo')::date`
- **Filtrar data nas duas pontas.** Se filtrar só a sessão e não a mensagem, pega a vida inteira da campanha em vez do recorte. Foi assim que eu errei o número de disparos do template na primeira passada.
- **Usar só dias fechados.** O dado é vivo: a mesma query rodada com 1h de diferença me deu 156 e 168 tickets.
- Em `transactions`, contar venda por `count(distinct transaction_id)`. Pedido com order bump gera uma linha por produto com o mesmo id, e as linhas podem ter UTM diferente entre si.
