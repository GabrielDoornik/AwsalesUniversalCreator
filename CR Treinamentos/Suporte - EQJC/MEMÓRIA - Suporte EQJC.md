# MEMÓRIA — Campanha Suporte EQJC

Estado vivo da campanha "CR Treinamentos | Suporte | Os Exercícios Quânticos de Jesus Cristo". Bot de suporte do Paulo Aguiar para alunos matriculados no EQJC e A Ruptura. Em ciclo de otimização contínua para reduzir taxa de handoff.

A cada nova rodada de otimização, adicionar uma seção em "Otimizações aplicadas" descrevendo o que mudou e por quê.

---

## Otimizações aplicadas

### 1. Refactor da tool de Deep Link (2026-05-04)

**Problema resolvido:** As 2 tools antigas que eram chamadas pelo bot (`@buscar_membro_por_email` + `@gerar_deep_link_curseduca`, conexão "Curseduca CR Treinamentos") batiam direto na API da Curseduca e retornavam erro HTTP 404 quando o email não existia. Esse erro era interpretado como "falha técnica de tool" pelo gatilho da Transferência Automática 2.0 e disparava handoff humano automaticamente, mesmo em casos triviais (lead tentou logar com email diferente do cadastrado).

**Solução aplicada:** As 2 tools antigas foram substituídas por 1 tool única `@gerar_deep_link_de_acesso` (conexão "CR Treinamentos - Deep Link n8n", sem auth) que aponta para um webhook do n8n: `https://n8n-dev.awsales.io/webhook/cr-deep-link`. O n8n encapsula a lógica de buscar membro + gerar deep link na Curseduca e SEMPRE retorna HTTP 200 com um JSON estruturado:

- Sucesso: `{ "ok": true, "deeplink": "https://crtreinamentos.curseduca.pro/deeplink/<token>", "mensagem": "" }`
- Falha: `{ "ok": false, "deeplink": "", "mensagem": "Usuário não encontrado" }`

Resultado: o bot nunca mais vê erro HTTP da Curseduca. "Member not found" virou caminho conversacional normal — o Checkpoint Manager lê `ok=false` e segue o protocolo do checkpoint.

**Checkpoint atualizado:** Seção 7 (Protocolo de Resolução de Acesso) reestruturada em 7 níveis. Os 3 primeiros níveis lidam com email não encontrado sem escalar:
- Nível 1: tenta com `{{lead_email}}` (email cadastrado no sistema)
- Nível 2: se ok=false, pede confirmação de email ao aluno e tenta de novo
- Nível 3: se ainda ok=false, manda buscar o email da confirmação de compra na Hotmart e tenta de novo
- Nível 4: deep link enviado mas link não funcionou (gera novo, descarta expiração)
- Nível 5: limpeza de cache e ambiente
- Nível 6: recuperação manual de senha
- Nível 7: handoff humano

Seção 10 item 13 atualizado: só escala após esgotar Níveis 1, 2 e 3 da Seção 7.

**Tools antigas:** não foram desativadas fisicamente na plataforma. Como o checkpoint não as referencia mais, ficam dormentes (o Checkpoint Manager só invoca tools mencionadas via `@handle`).

Checkpoint atualizado já aplicado no painel da plataforma AWSales.

---

## Próximo passo planejado

O usuário (CS) vai fazer uma análise paralela conversa por conversa dos atendimentos que ainda escalam para humano, para identificar outras causas de handoff além do erro técnico de tool já resolvido. Após essa análise:

1. Otimizar a base de conhecimento (FAQs Produto + Playbook) com base nos novos achados.
2. Otimizar o checkpoint conforme padrões de escalonamento detectados.

Aguardar a análise paralela do usuário antes de propor novas mudanças nesses artefatos.

---

## Entregáveis vivos da campanha

Sempre editar nos arquivos abaixo, depois aplicar manualmente no painel da plataforma:

- `CR Treinamentos/Suporte/Checkpoint/checkpoint.md` — checkpoint
- `C:\Users\Pedro\Desktop\AwsalesUniversalCreator\CR Treinamentos\Suporte\FAQs\CR Treinamentos  Suporte - Exercícios Quânticos de Jesus Cristo - Produto.pdf` — FAQs de Produto
- `C:\Users\Pedro\Desktop\AwsalesUniversalCreator\CR Treinamentos\Suporte\FAQs\CR Treinamentos  Suporte - Exercícios Quânticos de Jesus Cristo - Playbook.pdf` — FAQs de Playbook

---

## Variáveis utilizadas no checkpoint

`{{link_area_de_membros}}`, `{{link_do_grupo}}`, `{{link_pagamento_alt}}`, `{{link_reembolso_7d}}`, `{{link_reembolso_21d}}`, `{{link_matricula}}`, `{{link_ascensao_grupo}}`, `{{link_ascensao_youtube}}`, `{{lead_email}}`, `{{link_area_de_membros_A_Ruptura}}`, `{{link_pagamento_alt_A_Ruptura}}`.

---

## Tools utilizadas no checkpoint

- `@gerar_deep_link_de_acesso` — única tool ativa. Recebe email, retorna `{ ok, deeplink, mensagem }` via webhook n8n.

---

## Trabalho paralelo em andamento

`CR Treinamentos/Suporte/CONTEXTO_E_PROXIMOS_PASSOS.md` — handoff de gap-closing iniciado em 2026-04-17. Análise de relatório de 455 atendimentos (80.9% resolvidos pela IA, 18.7% escalados) e 33 casos de escalonamento gerou um PDF com 12 blocos de dúvidas enviado ao Paulo Aguiar. Aguardando respostas do cliente para fechar gaps restantes nas FAQs e checkpoint.
