# Teste A/B — Recuperação de Vendas Nuestra RX — Prova Social Visual

## O que é este teste

Teste A/B de UMA variável: enviar (ou não) uma imagem de prova social de antes e depois durante a
recuperação de checkout abandonado.

- Variação A (controle): a campanha de Recuperação de Vendas que já roda hoje, sem alteração. Pasta:
  `Nuestra RX/Campanhas - Nova Estratégia/Recuperação de Vendas`.
- Variação B (esta pasta): idêntica à A em tudo (agente, mensagens, tools, preços, cupons, FAQs), com UMA
  única diferença: a IA envia uma imagem de antes e depois como prova de valor (objeção de preço) e prova
  de resultado (credibilidade).

A única diferença entre A e B é a imagem. Todo o resto é igual, para o resultado do teste ser limpo.

## Métrica do teste

- Métrica principal: taxa de conclusão de checkout (conversão da recuperação).
- Rodar com divisão de tráfego (ex.: 50/50) por tempo suficiente para volume estatístico.
- Hipótese: a prova visual dissolve o medo de errar de novo (avatar que "já tentou de tudo") e aumenta a
  conclusão do checkout.

## O que muda no artefato (delta A -> B)

Checkpoint (`Checkpoint/checkpoint.md`): igual ao da campanha A, com a adição da seção 3 "Prova social
visual", que define o MOMENTO EXATO de enviar `{{imagen_antes_despues}}`.

Estratégia v2 (2026-07-10, após análise de conversas — 0 disparos da imagem em 2 dias e 78% das objeções
reais do funil sendo preço/dinheiro):

- A imagem entra TAMBÉM no fluxo de preço, como prova de valor. Sequência: validar a objeção de preço →
  imagem como contraste de valor → se o lead seguir travado, cupom no turno seguinte.
- Continua valendo para credibilidade/resultado: lead duvida que funciona, diz "ya probé de todo y nada",
  pede prova/fotos, ou hesita.
- Enviar uma única vez por conversa, contextualizando em uma frase, com "los resultados varían", NUNCA na
  mesma mensagem que o cupom (uma alavanca por vez).
- NÃO enviar em erro técnico, troca de plano, dúvida factual simples, nem quando o lead já quer finalizar
  (aí é link, não imagem).

FAQs: as mesmas 30 da campanha A (15 Produto + 15 Playbook), sem edição. Só entra 1 FAQ nova de Produto
(`FAQs/Nova FAQ - Prova Social Visual (Produto).md`) que hospeda a imagem e captura a intenção do lead por
busca semântica ("¿vale la pena?", "¿de verdad funciona?", "¿tienen fotos?").

## Como configurar na plataforma

1. Duplicar a campanha de Recuperação de Vendas atual (mesma casca de agente: Aniquilador de Objeções).
   Nomear algo como "Recuperação de Vendas - B (Prova Social)". Manter o MESMO nome humano da IA (Juan) para
   o lead não perceber troca de atendente.
2. Base de conhecimento: criar uma CÓPIA da base atual (as mesmas 30 FAQs, idênticas) e apontar a campanha B
   para essa cópia. NÃO reaproveitar a base compartilhada da A (ver "Isolamento" abaixo).
3. Na base copiada da B, adicionar a FAQ nova de Produto, anexar a imagem gerada e nomear a variável do
   arquivo exatamente `imagen_antes_despues`. Ativar.
4. Substituir o checkpoint da campanha B pelo desta pasta (`Checkpoint/checkpoint.md`).
5. Configurar a divisão de tráfego entre A e B.
6. Validar em conversa de teste com DOIS cenários: (a) objeção de preço "está muy caro" — a imagem deve
   chegar como contraste de valor ANTES do cupom; (b) objeção de credibilidade "no creo que a mí me
   funcione / ya probé de todo". Nos dois, confirmar que a imagem chega uma única vez, com o enquadramento
   e "los resultados varían", e que o cupom só aparece no turno seguinte se o lead seguir travado.

## Isolamento do teste (importante)

A imagem vive anexada a uma FAQ. Se A e B compartilharem a mesma base de conhecimento, a campanha A também
poderia recuperar essa FAQ e enviar a imagem, contaminando o controle. Por isso a B usa uma cópia própria da
base com a FAQ da imagem; a base da A permanece sem essa FAQ. "Usar as mesmas FAQs" aqui significa mesmo
conteúdo, não a mesma instância de base.

Nota de mecânica: o envio da imagem ocorre pela variável de arquivo da FAQ. O checkpoint referencia
`{{imagen_antes_despues}}` para orientar o momento; se na validação a plataforma só disparar a imagem via
match semântico da FAQ, o checkpoint garante que a IA conduza a conversa para acionar essa FAQ no momento
certo. Confirmar o comportamento na conversa de teste do passo 6.

## Compliance da imagem (prova social)

A imagem é gerada por IA. Alinhado ao Texto Complementar da campanha ("prova social com responsabilidade,
casos reais, los resultados varían") e às regras de endosso da FTC:

- Marcar a peça como imagem ilustrativa e manter "los resultados varían y no están garantizados" na resposta.
- Preferir basear o visual em caso real com consentimento quando possível; o rosto borrado ajuda nesse
  cenário.
- Nunca prometer resultado, número ou prazo, nem comparar com marcas.

## Prompt da imagem (Variação B — antes e depois)

Prompt usado para gerar a imagem (mesma pessoa, rosto borrado, roupa diferente, pose e ângulo levemente
diferentes, mesmo quarto com objetos em posição diferente, como duas fotos reais tiradas com meses de
intervalo). Ver as iterações no histórico; versão consolidada:

```
Two separate real photos of the SAME Latina woman, taken MONTHS APART in the SAME bedroom, placed side by side in one image. This is NOT a symmetrical diptych and NOT a mirrored copy: because they were shot on different days, the outfit, the pose, the camera angle, the lighting and the clutter around the room all differ naturally between the two photos. What stays identical is only the woman's identity and the room itself.

Same across both: warm tan skin, dark hair in a low bun, same height and bone structure, same face shape, the same bedroom with the same large full-length mirror, the same bed frame, the same tiled floor, the same window. Her face is heavily blurred with a soft gaussian blur in both, everything else sharp and in focus.

Left photo (earlier, heavier): visibly heavier with a clearly fuller midsection, rounder belly, softer waistline and fuller arms; wearing a FITTED, form-hugging grey tank top (snug against the body, cropped or tucked so the stomach and waistline are visible, NOT baggy or oversized) and black leggings, so her fuller figure reads clearly; standing straight-on, one hand holding the phone; the bed is messy with a green blanket bunched at the foot and a few clothes piled on it, a towel draped over the footboard.

Right photo (later, slimmer): noticeably slimmer and more toned with a flat stomach and defined waist; wearing a DIFFERENT outfit, a fitted white tank top and mid-blue jeans; standing at a slightly different angle with a relaxed hip shift, phone in the other hand; the same bed is now arranged differently, the green blanket gone, different clothes tossed on the sheets, no towel on the footboard, brighter daylight from the window as if shot at a different time of day.

Authentic UGC look: two amateur iPhone mirror selfies, slightly grainy, natural imperfect indoor lighting, faint phone reflection on the mirror, realistic skin texture with pores and small imperfections, no professional retouching, no studio lighting, lived-in bedroom. Photorealistic, candid, believable, self-shot.

Negative: any text, letters, words, labels, captions, watermark, identical mirrored pose, copy-paste duplicate, clone, same clutter in the same position, same outfit in both panels, oversized or baggy top hiding the body on the left, loose t-shirt covering the belly, sharp or visible face, two different people, mismatched skin tone or hair, professional model, studio backdrop, glamour retouching, distorted hands, extra fingers, cartoon, illustration.
```
