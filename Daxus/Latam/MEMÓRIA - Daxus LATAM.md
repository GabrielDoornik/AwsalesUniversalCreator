# MEMÓRIA — Campanhas Daxus LATAM (estado vivo)

Última atualização: 2026-07-16

## Contexto do cliente

Cliente: Daxus (plataforma de cursos — Power BI, Excel, IA, Python, SQL). Contatos no grupo WhatsApp "Awsales | Daxus": Renato De Freitas (22 99201-5069), Pietro (22 99760-6569). CS Awsales: Lucas Cardoso. Produto: Plataforma Daxus. Não aluno: USD 197 à vista / 6x USD 37 recorrência automática. Aluno declarado: USD 137 à vista / 3x USD 55 recorrência automática. IA: "Diego - Daxus". Idioma: sempre espanhol. Carrinho aberto em 15/07/2026 ~23h.

Duas campanhas LATAM ativadas 15/07/2026 (+ duas BR equivalentes): **Venda Receptiva LATAM** e **Recuperação de Vendas LATAM**. Compartilham FAQs (Produto + Playbook) e o mesmo set de variáveis; só o checkpoint difere.

Arquivos:
- `Receptiva/Checkpoint/checkpoint.md`
- `Recuperação de vendas/Checkpoint/checkpoint.md`
- `FAQs/` (PDFs das bases + `Otimização FAQs - 2026-07-16.md`)

## Otimização 16/07/2026 (aplicada na plataforma, validada em playground)

Demanda: "Otimizar campanha com novos links e informações da Argentina" (contexto no grupo WhatsApp, 15-16/07).

- **Links Argentina trocados** (sndflw.com não carrega pra ~30% dos argentinos): não aluno à vista = página `www.daxus.com/metodos-pago-argentina`; não aluno cuotas = página `www.daxus.com/metodos-pago-argentina-cuotas`; aluno à vista = página `www.daxus.com/metodos-pago-argentina-alumnos`; aluno cuotas = dLocal `link_aluno_parcelado_argentina`. Roteamento do Bloco 3 reescrito com variáveis `{{...}}` + rodapé de variáveis.
- **Gate de cuotas** (pedido do Renato 16/07 11:57): IA NUNCA oferece/menciona cuotas sem o lead pedir explicitamente ou declarar falta do valor total. Mesmo padrão do boleto parcelado do bot Brasil.
- **Exceção Argentina:** transferência bancária NÃO é handoff (tem link próprio).
- **FAQs corrigidas** via `FAQs/Otimização FAQs - 2026-07-16.md`: FAQ Argentina (4.664 usos) tinha links sndflw velhos hard-coded — era a causa do bot mandar link antigo; 3 FAQs de Playbook ofereciam cuotas proativamente (causa raiz do comportamento reclamado).

## Aprendizados de engenharia de checkpoint (casos reais desta campanha)

1. **Campo em checklist de qualificação induz o agente a perguntar.** "Modalidade: à vista / cuotas (somente se pedir)" fez a IA perguntar "¿al contado o en cuotas?" — a anotação entre parênteses não segura. Fix: campo declarado como "NUNCA perguntar, padrão à vista" + regra espelhada no NUNCA do Bloco 2. Idem "Aluno declarado".
2. **Exceção isolada perde para regra geral repetida.** "Transferência → handoff" aparecia em 3 lugares (checklist Etapa 3, NUNCA Bloco 2, REGRA GERAL Bloco 3); a exceção da Argentina escrita só no Bloco 3 foi ignorada. Fix: exceção espelhada nos 3 pontos.
3. **IA alucina conteúdo de página que não conhece.** Ao enviar a página de métodos de pagamento da Argentina, inventou "conversión automática a moneda local" e "datos de la cuenta BBVA" (BBVA veio da regra da Colômbia). Fix: regra no Bloco 3 proibindo descrever o conteúdo da página.
4. **Conflito aluno vs não aluno em cuotas.** FAQ de produto informava aluno 3x USD 55, mas checkpoint só tinha "ALUNO somente à vista" e regra genérica de cuotas 6x USD 37. No teste, após o lead estar no contexto de aluno, a IA misturou valores/links e ofereceu não aluno. Fix: separar valores e roteamento por tipo de lead; aluno declarado usa somente links/valores de aluno; se não houver variável/link para a combinação, handoff.

## Testes playground 16/07 (Receptiva)

- À vista cartão Argentina → página metodos-pago, sem cuotas, sem pergunta de aluno/modalidade ✓
- Cuotas explícitas + cartão → dLocal ✓
- Adiamento ("después compro") → urgência sem cuotas ✓
- Transferência Argentina → link (não handoff) ✓ (após fix do aprendizado 2)
- Recuperação: mesma lógica/FAQs; usuário confirmou aplicação do checkpoint idêntico.

## Pendências (cobrar Lucas/cliente)

- [x] `link_aluno_argentina_avista` atualizado para página oficial `https://www.daxus.com/metodos-pago-argentina-alumnos?utm_source=awsales`
- [ ] Confirmar se a página metodos-pago-argentina converte pra moeda local (IA já afirmou isso sem insumo)
- [ ] Reaplicar na plataforma a versão com a regra anti-alucinação de conteúdo de página (adicionada após o teste de transferência)
- [x] Aplicar links/valor de 6 cuotas para não aluno (valor oficial 6x USD 37) e separar aluno (3x USD 55)
- [x] Variáveis `link_aluno_parcelado` e `link_aluno_parcelado_argentina` adicionadas nas campanhas
- [ ] Página intermediária de UTM — nova rodada de troca de valores das variáveis quando vier
- [ ] Validar com Renato se cuotas pode ser oferecida quando lead diz "cartão sem limite" (FAQ mantida oferecendo — ver item 5 do doc de otimização de FAQs)
