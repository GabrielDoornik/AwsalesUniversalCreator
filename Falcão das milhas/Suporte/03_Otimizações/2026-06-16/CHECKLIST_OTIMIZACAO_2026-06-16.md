# Checklist de Otimização — Suporte Falcão das Milhas (2026-06-16)

Fonte: `Otimizações a serem feitas/AI DONT KNOW.pdf` (42 respostas do cliente) + `Melhorias IA.pdf` (itens 1.1–1.41 e 2.1–2.7).

## Como funciona

- `[ ]` pendente · `[x]` feito.
- Seções A, B, C = eu otimizo direto nos arquivos `.md` (checkpoint e FAQs). Marco conforme faço.
- Seção D = você cola na plataforma o que eu otimizei. Você me avisa, eu marco.
- Seção E = configuração externa (painel Intervenção Humana). Você faz, eu ajudo. Marco conforme você faz.
- Seção F = stand-by, travado aguardando resposta do cliente. Não mexer até responder.

Referências entre parênteses: `Q#` = pergunta do AI DONT KNOW; `#.#` = item do Melhorias IA.

---

## A. CHECKPOINT (eu otimizo)

Arquivo: `Checkpoint/checkpoint.md`

- [x] A1. Adicionar variáveis novas no rodapé e usar no corpo: `{{link_buscador}}`, `{{link_area_membros}}`, `{{whatsapp_oner}}`, `{{link_pagamento_buscador}}`, `{{link_pagamento_balcao}}`, `{{link_pagamento_consultoria}}`, `{{link_consultoria_retencao}}` (typeform grátis), `{{contrato_balcao}}` (clicksign), `{{email_balcao}}`, `{{grupo_wpp_promocoes}}`, `{{grupo_wpp_passagens}}`, `{{grupo_telegram_promocoes}}`, `{{grupo_telegram_passagens}}` (Q1, Q2, Q3, Q4, Q5, Q11, Q35, Q36)
- [x] A2. Remover The Travel de todo o checkpoint — produto descontinuado (Q33, 1.20)
- [x] A3. Canal Oner: passagem emitida / compra errada / alterar / remarcar / cancelar / problema de emissão → encaminhar `{{whatsapp_oner}}` pedindo localizador, print e e-mail, em vez de handoff genérico (Q3, Q6, Q39, Q40, 1.16, 2.6)
- [x] A4. Pedido de info de voo / emissão → mandar a orientação do Oner direto, não tentar resolver sozinho (1.16)
- [x] A5. Reset de acesso: senha não chega ou acesso travado → pedir e-mail de compra, informar que o acesso será resetado e passar pra humano. Ajustar a regra atual "nunca prometer reset" (IA não reseta, mas informa que o humano vai) (Q19, 1.26)
- [x] A6. Bônus não aparece após acessar a MemberClass → tratar como urgente, transferir humano para revisar/resetar acesso (Q17)
- [x] A7. Coleta antes do handoff: e-mail de compra + nome completo (+ print do extrato quando não localizar a compra). Nunca pedir "alguns caracteres" (Q22, 1.23, 1.31)
- [x] A8. Garantia 7 dias: pode mencionar que existe (CDC) no momento da compra; não confirmar elegibilidade individual. Dentro de 7d = reembolso; fora = só cancela (Q8, Q25, Q26, Q27)
- [x] A9. Renovação automática: não tratar como cancelamento; validar, explicar (12 meses, aviso ~30d antes, aceite nos termos), não admitir culpa da empresa; só seguir cancelamento se o cliente pedir (Q31, 1.34, 2.7)
- [x] A10. Cobrança duplicada / chargeback / contestação / suspeita de fraude → pedir e-mail de compra e passar pra humano (decisão Pedro — substitui o stand-by da Q32)
- [x] A11. Fluxo de compra: pagamento anual R$ 297, IA pode mandar `{{link_pagamento_buscador}}`; após pagar, cliente envia comprovante + e-mail → IA transfere humano pra conferir acesso (Q7, Q10, Q11)
- [x] A12. E-mail inicial sem instrução de cobrança/pagamento → transferir humano (Q12)
- [x] A13. Cancelamento: deixar o cliente dizer o motivo (não sugerir opções), tentar retenção antes do formulário, oferecer Consultoria gratuita via `{{link_consultoria_retencao}}` (Q18, Q36, 1.13, 1.21, 1.28, 1.29, 2.1, 2.4)
- [x] A14. Consultoria: gratuita como retenção; R$ 997 fora de retenção (Q18, Q36)
- [x] A15. Uma solução por vez; não oferecer duas opções juntas; avançar até o cliente aceitar ou pedir cancelamento (1.22)
- [x] A16. Operar pela intenção principal da conversa, não responder superficial nem repetir (1.19, 2.2)
- [x] A17. App não funciona → orientar acesso pelo link `{{link_buscador}}`, nunca mandar usar o app (1.5)
- [x] A18. Não pedir código localizador (Q42)
- [x] A19. Horário do suporte humano (seg-sex 09h-18h) e prazo de reembolso (72h úteis) — informar quando encaminhar (Q29, 2.5)
- [x] A20. Balcão de Milhas: explicar fluxo (análise → enviar documento → entrar no grupo WhatsApp); indicar quando "não tenho milhas" (Q4, Q35, 1.2, 1.7)
- [x] A21. Black Falcon: aplicar perguntas qualificatórias antes de indicar (Q34)
- [x] A22. Script do grupo WhatsApp → resolvido na FAQ Produto B12 (link estável na FAQ) (1.33)
- [x] A23. Pedir confirmação do cliente após preencher o formulário de reembolso (necessário pro reembolso) (Q28, 1.40)
- [x] A24. Validar checkpoint final contra regras de formatação: zero `*`/`**`, zero emoji, `@tool` (não há tools aqui), variáveis no rodapé, acentuação pt-br

---

## B. FAQs PRODUTO (eu otimizo)

Arquivo a criar: `FAQs/Otimização FAQs - Produto.md`

- [x] B1. FAQ "Quando indicar Black Falcon ou The Travel" → remover The Travel, manter só Black Falcon (Q33)
- [x] B2. FAQ "O que é o Buscador Automático" → incorporar texto sugerido pelo cliente + que o Buscador fica dentro da MemberClass + grupo bônus diário (Q13, 1.18, 1.24)
- [x] B3. Bônus/benefícios: criar/ajustar FAQ — bônus (cursos + planilhas) na MemberClass, os "8 benefícios", onde acessar, e que não aparecer = humano urgente (Q13, Q14, Q15, Q16, Q17)
- [x] B4. Renovação automática: 12 meses, aviso ~30d antes, aceite nos termos (Q31) — sem valores
- [x] B5. Erros de login específicos: "Error signing in" → conferir e-mail; "não foi possível concluir o cadastro" → e-mail tem que ser o da compra (Q20, Q21)
- [x] B6. Celular roubado/perdido → orientar "Esqueci minha senha" (Q23)
- [x] B7. Reserva não localizada no app/Buscador → fica no site da companhia aérea (Q41)
- [x] B8. Generalizar Buscador Novo vs Antigo: tirar referência ao local exato "seção Tarifas Awards logo abaixo da busca manual", usar linguagem abrangente (1.8 — afeta várias FAQs)
- [x] B9. Primeira busca = busca manual (menos desconto); melhores tarifas nas oportunidades/Tarifas Awards, sem citar local fixo (1.27)
- [x] B10. Reforçar Buscador = radar de passagens; filtrar por destino, não origem (1.25)
- [x] B11. Conferir conflitos de preço/link nas FAQs Produto (suporte: link estável pode ir na FAQ como URL crua; preço comercial fica no checkpoint) — conferido
- [x] B12. FAQ de grupos de promoções (WhatsApp/Telegram) com links corretos; corrige o script antigo que dizia que o grupo não é mais canal de ofertas (1.33, Q5)

---

## C. FAQs PLAYBOOK (eu otimizo)

Arquivo a criar: `FAQs/Otimização FAQs - Playbook.md`

- [x] C1. FAQs de cancelamento/retenção: deixar o cliente falar o motivo, oferecer Consultoria gratuita antes do formulário, foco em radar de passagens (1.13, 1.21, 1.28, 1.29, 2.1, 2.4)
- [x] C2. Renovação automática: validar, explicar, não assumir cancelamento, não admitir culpa (1.34, 2.7)
- [x] C3. Explicar Tarifas Awards com retenção emocional e percepção de valor, não só "o buscador não cria promoções" (2.3)
- [x] C4. FAQ de diagnóstico de perfil: remover The Travel das indicações (Q33)
- [x] C5. Generalizar local da seção Tarifas Awards também nas FAQs de Playbook (1.8)

---

## D. APLICAÇÃO NA PLATAFORMA (você faz, me avisa)

- [x] D1. Checkpoint atualizado colado na plataforma
- [x] D2. FAQs Produto otimizadas aplicadas
- [x] D3. FAQs Playbook otimizadas aplicadas
- [x] D4. Variáveis novas cadastradas na campanha (mapear `{{...}}` → URL real)

---

## E. CONFIGURAÇÃO EXTERNA — Painel Intervenção Humana (você faz, eu ajudo)

Não é checkpoint nem FAQ. É configuração de Intervenção Humana / Sequência de Inatividade / fila.

- [x] E1. Sequência de Inatividade: parar mensagens repetidas de encerramento e de fila (1.4, 1.12, 1.14, 1.38)
- [x] E2. Posição na fila: remover; trocar por mensagem de prazo de 72h úteis (1.35, 1.36, 1.38)
- [x] E3. Remover mensagem "você está disponível?" disparada fora de horário (1.10)
- [x] E4. Remover mensagem que faz a conversa descer e some do campo de visão da equipe (1.11)
- [x] E5. Sem ação: só 1 equipe (Geral), checkpoint já pede e-mail, e o "OK pra manter em Aguardando" (E8) cobre a marcação indevida (1.32)
- [x] E6. João analista já está Inativo, não recebe atribuição automática. Nota antiga, sem ação (1.41)
- [x] E7. Autoresponder de fim de semana: avisar que o atendimento é só em dias úteis (1.39)
- [x] E8. Pedir "OK"/confirmação pra manter a conversa em "Aguardando atendimento" (1.37)
- [x] E9. SLAs do Atendimento ON (30min + escalar prioridade) e Redistribuir ticket ON (1.6)
- [x] E10. Confirmação após formulário → resolvido no checkpoint (A23), comportamento da IA, sem automação no painel (1.40)

---

## F. STAND-BY — RESOLVIDO

Cliente respondeu em 2026-06-16 (João Victor França): cotação descontinuada por enquanto — "tá não, pode tirar ela do script, por enquanto, vamos estruturar melhor pra fazer aqui". Liberado, vira ação:

- [x] F1. Remover cotação personalizada do checkpoint (Seção 5) e da FAQ "Quero que vocês cotem uma viagem específica" (549 usos). Quando pedirem cotação, IA não promete — redireciona: Buscador (busca manual + oportunidades), Consultoria (aprender a achar), Black Falcon (delegar tudo), Balcão (sem milhas); passagem emitida → Oner. Itens 1.2, 1.3, 1.15, Q37, Q38
- [x] F2. Remover "taxa" e caução R$ 99,99 — caíram junto com a cotação (1.9)

---

## Resolvidos / sem ação

- F1/F2 (cotação): cliente confirmou OFF. Vira ação de remoção no checkpoint + FAQs.
- Q32 (chargeback): decidido — pedir e-mail e passar pra humano. Virou A10.
- 1.30 (formulário correto): confirmado que é o mesmo `{{link_formulario_reembolso}}`. Sem mudança de variável.
