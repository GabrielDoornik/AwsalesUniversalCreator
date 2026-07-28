# CONTINUE — Relatório Final de Estágio Pedro Henrique Leite Mendes

> **Para o Claude que está continuando este trabalho em outro computador.**
> Leia este arquivo INTEIRO antes de mexer em qualquer coisa. Ele tem todo o contexto que você precisa.

## Contexto do trabalho

O usuário (Pedro Henrique Leite Mendes) está fazendo estágio supervisionado obrigatório na **AwSales LTDA** desde 01/10/2025 e continua na empresa até hoje. Curso: **Engenharia de Controle e Automação**, **UNIFEI Campus Itabira**, Instituto de Ciências e Tecnologias.

Quem deveria fazer o relatório é o supervisor (Daniel Roscoe Oliveira, Gerente de Estratégia e Operações), mas ele autorizou Pedro a redigir e mandar para avaliação. O documento será compilado no **Overleaf** (pdfLaTeX). O destino final é a Coordenação Local de Estágios do Campus Itabira (Coordenador: Tiago Gaiba de Oliveira).

Orientador acadêmico: Prof. Ericson Marquiere Reis Silva (marquiere@unifei.edu.br).

## Arquivos existentes nesta pasta `Estágio/`

```
Estágio/
├── Arquivos que enviei/         # ENTRADA: PDFs ASSINADOS que o Pedro entregou na Coordenação
│   ├── 1._Termo_de_Compromisso_de_Estagio...pdf
│   ├── 3._Requerimento_de_Matricula...pdf
│   └── Modelo_de_atividades_-_Awsales...pdf
│
├── Arquivos templates/          # REFERÊNCIA: TEMPLATES OFICIAIS BRANCOS baixados do site da UNIFEI
│   ├── 6. Modelo de Declaração e Avaliação de Horas Estagiadas.doc
│   └── 7. Modelo de Relatório Final.pdf
│
├── Exemplos/                    # REFERÊNCIA: relatórios REAIS de outros alunos JÁ APROVADOS pela Coordenação
│   ├── Wesley/                       # Eng. Elétrica, formato mínimo (passou raspando)
│   │   └── RELATÓRIO_FINAL_DE_ESTÁGIO.pdf
│   └── Pedro Goias/                  # Eng. Elétrica, formato mais robusto — REFERÊNCIA CANÔNICA
│       ├── RELATÓRIO_FINAL_DE_ESTÁGIO___PEDRO_HENRIQUE_BARBOSA_OLIVEIRA.pdf
│       └── Declaração e Avaliação de Horas Estagiadas Signed.pdf
│
├── relatorio_estagio.tex        # SAÍDA: relatório em LaTeX que estamos construindo (compila no Overleaf)
├── declaracao_horas.tex         # SAÍDA: declaração pré-preenchida para o supervisor (Daniel) assinar
└── CONTINUE_ESTAGIO.md          # ESTE ARQUIVO
```

### Semântica das pastas (importante)

- **`Arquivos que enviei/`** → Documentos **já assinados** pelo Pedro, pela empresa e pela UNIFEI no momento do cadastro do estágio (02/12/2025). São a **fonte da verdade** para datas, jornada, CNPJ, dados pessoais, supervisor, atividades previstas (Cláusula 9 do TCE). Sempre que houver dúvida sobre algum dado oficial, é aqui.

- **`Arquivos templates/`** → Templates **em branco** disponibilizados pela Coordenação Geral de Estágios do Campus Itabira (fonte: https://graduacaoitabira.unifei.edu.br/coordenacao-geral-de-estagios/). Dois documentos finais precisam ser entregues seguindo esses templates:
  - **Relatório Final** (template `7.`) → o `relatorio_estagio.tex` segue esse template
  - **Declaração e Avaliação de Horas** (template `6.`, .doc) → o `declaracao_horas.tex` segue esse template, com tabela de avaliação que **só o supervisor preenche e assina**

- **`Exemplos/`** → Relatórios **reais de outros alunos** já aprovados pela Coordenação, usados como referência de forma e estilo (não de conteúdo). Pedro Goias é a referência canônica porque o documento dele é mais polido e tem Seção 7 (Referências). Wesley é mais cru e simples. **Não copiar conteúdo, só formato.**

- **`relatorio_estagio.tex` e `declaracao_horas.tex`** → São os arquivos que o Pedro vai compilar no Overleaf e entregar à Coordenação. **São os únicos `.tex` da pasta.**

## Dados-chave do estágio

- **Estagiário:** Pedro Henrique Leite Mendes, RA 2020030824, CPF 114.125.966-45
- **Email:** pedrohlmendes@hotmail.com / pedrohlmendes@gmail.com
- **Empresa:** AwSales LTDA, CNPJ 59.298.768/0001-36, Nova Lima/MG, Rua Min. Orozimbo Nonato, 102, Vila da Serra, CEP 34006-053
- **Site:** https://www.awsales.io/
- **Supervisor:** Daniel Roscoe Oliveira, Gerente de Estratégia e Operações, daniel@mambaculture.com, (31) 99979-1279
- **Orientador UNIFEI:** Ericson Marquiere Reis Silva, marquiere@unifei.edu.br
- **Coordenador de Estágio:** Tiago Gaiba de Oliveira
- **Período (TCE):** 01/10/2025 a 01/01/2026 (TCE original)
- **Período do RELATÓRIO (decidido 2026-06-11):** 01/10/2025 a **01/05/2026**, ~870h. Fundamento: em 30/04/2026 Pedro assinou um NOVO contrato de prestação de serviço (aumento), vigência a partir de 01/05/2026 (PDF em `Estágio/Contrato Awsales/Contrato PEDRO HENRIQUE LEITE MENDES (1).pdf`). Esse marco fecha o "estágio". O fato de o vínculo ser PJ/serviço (não estágio formal) NÃO entra no texto do relatório.
- **Período real:** 01/10/2025 a hoje (Pedro continua na empresa)
- **Jornada:** 13:00–20:00, 1h intervalo, 6h/dia, 5 dias/semana, 30h/semana, presencial
- **Tipo:** Estágio Obrigatório, não remunerado
- **Carga mínima curricular:** 175h
- **Projeto:** Desenvolvimento de Agentes de IA
- **Data cadastro/assinatura TCE:** 02/12/2025 (Itabira)

## ⚠️ Pendência crítica não resolvida

**TCE original vence 01/01/2026.** Pedro continua trabalhando depois disso, então tecnicamente precisa de **Termo Aditivo** (Cláusula 7 do TCE) para legitimar o período após 01/01/2026 perante a Coordenação. **Pergunte ao Pedro se ele tem Termo Aditivo assinado.** Se não tiver:

1. Opção A: limitar a declaração de horas e o relatório até 01/01/2026 (parcial, 384h)
2. Opção B: regularizar com Termo Aditivo via Coordenação ANTES de entregar
3. Opção C: declarar até a data real e arriscar a Coordenação aceitar (preferência do Pedro pelo que conversamos antes)

Hoje a versão do `.tex` está na **Opção C**, agora com término **01/05/2026** e **~870h** (ver tabela). Data de ENTREGA na capa segue 25/05/2026 (pendente Pedro decidir; recalcular nada da entrega, só a capa e os "Acesso em" das referências quando decidir).

## Cálculo de horas (referência)

Dias úteis no período (01/10/2025 → 30/04/2026), descontando feriados federais brasileiros + Carnaval em MG. **Maio/2026 NÃO conta** (término 01/05, e 01/05 é feriado):

| Mês | Dias úteis | Observação |
|-----|------------|-----------|
| Out/2025 | 23 | 12/10 caiu domingo |
| Nov/2025 | 19 | -20/11 Consciência Negra (quinta) |
| Dez/2025 | 22 | -25/12 Natal (quinta) |
| Jan/2026 | 21 | -01/01 Ano Novo (quinta) |
| Fev/2026 | 18 | -16,17/02 Carnaval (seg/ter) |
| Mar/2026 | 22 | — |
| Abr/2026 | 20 | -03/04 Sexta Santa, -21/04 Tiradentes |
| **Total** | **145** | × 6h = **870 horas** |

Bem acima do mínimo curricular (175h). Se mudar a data de término, recalcule.

## O que JÁ foi feito (resumo)

1. **Pesquisa de modelos UNIFEI:** confirmado que o curso de ECA Itabira adota o **modelo SIGAA genérico** (`7. Modelo de Relatório Final.pdf`), não o modelo elaborado das Diretrizes ECA. Modelo aprovado pelo curso tem 6 seções:
   1. Introdução (com subseções 1.1 Objetivo, 1.2 Dados do aluno, 1.3 Dados da empresa, 1.4 Período, 1.5 Dados do supervisor)
   2. Atividades desenvolvidas (2.1 Descrição da empresa, 2.2 Cronologia)
   3. Metodologia e tecnologias envolvidas (3.1, 3.2, 3.3 subseções)
   4. Resultados obtidos
   5. Participação do estagiário (5.1 Disciplinas, 5.2 Conhecimentos complementares, 5.3 Contribuições, 5.4 Atividades que mais contribuíram)
   6. Conclusão
   7. Referências Bibliográficas (Pedro Goias incluiu, Wesley não)

2. **Formatação obrigatória (Diretrizes ECA Itabira):**
   - Times New Roman ou Arial **12**, espaçamento **1,5**
   - Margens **3 cm** em todas as direções
   - Parágrafos a **7 espaços** da margem esquerda (≈ 1,25 cm — implementado com `\setlength{\parindent}{1.25cm}`)
   - A4 branco
   - Encadernação espiral ou capa dura

3. **Relatório `.tex` escrito:** segue o modelo Pedro Goias (referência mais polida), com ótica de Engenharia de Controle e Automação. Cobre casos reais documentados no `CLAUDE.md` da raiz: SDR Lucas Firmino (D'Leon, -47% checkpoint), Falcão das Milhas (-58% checkpoint), refatoração tool deep link via n8n, padronização de docs universais.

4. **Declaração pré-preenchida (`declaracao_horas.tex`):** segue o template oficial `6. Modelo de Declaração e Avaliação de Horas Estagiadas.doc`. Daniel só precisa marcar X na tabela de avaliação (9 itens × 6 colunas) e assinar.

5. **Pesquisa atual sobre AwSales (consultada em 23/05/2026):**
   - Posicionamento atual: **Autonomous Service Builder**
   - 4 módulos: Agent Studio, AgentsCore, Memory Base, Cortex
   - +100 integrações, implantação em até 14 dias
   - Meta Business Partner
   - Clientes enterprise citados no site: Uniasselvi, G4 Educação, Emive
   - Fontes: https://www.awsales.io/ e https://awsales.io/meta
   - Cargo Daniel: "Gerente de Estratégia e Operações" (confirmado via RocketReach)

## ⚠️ Grade curricular REAL do Pedro (verificada 2026-06-11 — NÃO inventar disciplinas)

Pedro confirmou (2026-06-11): **grade 2015** de ECA Itabira (documentada no PPC revisado de maio/2018, baixado do SIGAA, idProducao=300374 — códigos ECAi01, ECOi02 etc.). Erros já cometidos e corrigidos no relatório: citar "Engenharia Econômica" (NÃO existe na grade), tratar "Programação" como disciplina central, citar "Redes de Computadores" (ECOI21 — NÃO está no histórico dele; o "Redes" que ele cursou é Redes Industriais).

Pedro colou o **histórico completo de turmas (2020.1–2026.1)** na conversa de 2026-06-11. Disciplinas cursadas relevantes pro estágio (confirmadas no histórico): Redes Industriais (2024.2), Princípios de Comunicação (2024.2), Automação de Sistemas Industriais I (2024.1) e II (2024.2), **Automação de Sistemas a Eventos Discretos (optativa, 2025.1)**, Sistemas Embarcados e de Tempo Real (2024.2), Controle Adaptativo e Preditivo, Introdução aos Sistemas de Controle (2023.2), Modelagem e Análise de Sistemas Dinâmicos (2022), Identificação de Sistemas (2023.2), Estatística (2020.2), Lógica de Programação (2020.1), AED I (2020.2), Introdução à Economia (2024.1), Introdução à Gestão de Operações (2025.1), Pesquisa Operacional (2025.1), Microcontroladores, PDS, Projeto de Sistemas de Automação (2025.1), Manipuladores Robóticos, Robótica Móvel. **NÃO cursou:** Redes de Computadores, Inteligência Artificial (nunca citar nenhuma das duas).

Na 5.1 atual: Redes Industriais, Princípios de Comunicação, Automação de Sistemas Industriais I/II, Automação de Sistemas a Eventos Discretos, Introdução aos Sistemas de Controle, Identificação de Sistemas, Estatística, Introdução à Gestão de Operações, Lógica de Programação, AED I.

## Regras de escrita do relatório (feedback do Pedro, 2026-06-11 — NÃO violar)

1. **Zero linguagem interna AWSales**: não citar nomes de módulos da plataforma (Agent Studio, AgentsCore, Memory Base, Cortex), "checkpoint", "normalizador", "payload" etc. Avaliador é professor da UNIFEI, não conhece o vocabulário da empresa.
2. **NÃO citar n8n** (nem outra ferramenta intermediária de automação) — Pedro acha que nomear a ferramenta diminui a grandeza do trabalho. Falar em "camada de integração" construída, sem nomear o runtime.
3. **Relatório curto** — Pedro reclamou que estava grande demais. Modelo Wesley (mínimo) passou. Enxugar sempre; não estender parágrafos.
4. **Sem negrito no texto corrido** — nada de \textbf em nomes de disciplinas ou destaques no corpo. Negrito só nos títulos das referências bibliográficas (ABNT).
5. **Breadth + depth, não um cliente só** (feedback 2026-06-11): focar SÓ na Nuestra RX deixa o relatório vago, como se o estágio fosse visitar um cliente. A carteira inteira (~10 clientes, +20 campanhas) é a espinha dorsal que mostra escopo; a integração da telemedicina é a vitrine técnica de profundidade. Sempre os dois.
6. **Ótica do leitor = coordenador de ECA** (não professor de IA). Escrever na língua nativa dele: "sistema reativo a eventos discretos", "comunicação confiável entre sistemas heterogêneos", "verificação de origem/integridade", "realimentação / medir-agir-medir". Não explicar o paralelo de engenharia de forma piegas; deixar embutido. A seção 5.1 nomeia as disciplinas; as seções 3.x falam a engenharia nativamente.
7. **Esqueleto das 7 seções é obrigatório** (modelo SIGAA da Coordenação Itabira, não é cópia do exemplo). Profundidade/voz é onde inovar, não nos títulos.
8. **ZERO em-dash (`---`) em prosa** (feedback repetido 2026-06-11): travessão em frase é assinatura de IA. Usar vírgula, dois-pontos ou parênteses. Os `--` (en-dash) em endereço/título tipo "Nova Lima -- MG" são padrão tipográfico, pode manter. Validar com grep `---` ao final de cada edição.
9. **Mostrar TÉCNICA, não "escrevi textos"** (feedback 2026-06-11 sobre a 3.1): o coordenador não pode achar que o estágio foi só digitar prompt. A 3.1 agora descreve a config de agente como projetar um fluxo de decisão (estados/transições/travas) sobre uma cadeia multiagente + base com busca semântica + hooks de tools, sem usar nomes internos da plataforma.
10. **Escala real** (feedback 2026-06-11): NÃO subdimensionar. São "mais de cem campanhas" e "dezenas de clientes" (não 20/10). Repos que comprovam: este (`AwsalesUniversalCreator`, ~10 clientes) + `AwsalesCampaign` (~17 clientes: Carol Bazzo, Fer Brunet, Fábio Coelho, Granconato, Helena Tannure, Igor Miguel, Jesus Copy, Josué, Lamartine, Marcelo Toledo, MEVAM, Roberta Fázio, Tati Joslin...).
11. **Objetivos de campanha sem jargão** (2026-06-11): nada de "upsell/onboarding/checkout" cru no corpo onde o coordenador lê. Traduzir por função (upsell → "reengajar clientes para novas ofertas", etc.).
12. **Repos extras com técnica** (oferecidos por Pedro 2026-06-11, caso precise enriquecer SEM alongar): `C:\Users\pedro\OneDrive\Área de Trabalho\AwsalesCampaign` (mais clientes/campanhas) e `C:\Users\pedro\OneDrive\Área de Trabalho\analisador-de-conversas` (pipeline real em Python/pandas: analyze.py, deep_analysis.py, criterios.py, relatorio_cliente.py, df.pkl — sustenta a frente de análise de dados da 3.3/5.4).
13. **Ponto do banco de dados** (2026-06-11): Pedro quer valorizado, não vago. A 2.2 agora diz que no início a config era feita editando registros/relações direto no banco do sistema antigo (entender o modelo de dados) e depois veio a migração pra aplicação web — visão do dado bruto até a camada de aplicação.
14. **5.1 enxuta** (2026-06-11): removidas Estatística e Introdução à Gestão de Operações. Lógica de Programação + AED I ficam, mas SEM citar linguagem específica (só aprenderam C++, que não foi usado no trabalho) — falar de "raciocínio lógico e algorítmico".
15. **5.2 = vitrine de IA** (2026-06-11): deixar EVIDENTE o conhecimento de IA adquirido (LLMs, agentes, multiagente, busca semântica, projeto de comportamento), porque trabalhou em empresa de IA. **NÃO** colocar a "sugestão à universidade de criar disciplina de IA" — Pedro mandou tirar explícito (ficou puto). Já removida.
16. **NÃO subdimensionar a complexidade da Nuestra RX** (2026-06-11): NÃO vender o caso como "quatro fontes de evento" (Pedro acha isso pouco, ele faz 4+ rotineiramente). A complexidade real a destacar é a HETEROGENEIDADE: protocolos/formatos diferentes por sistema, mecanismos de auth distintos (HMAC vs IP allowlist+segredo), cobrança recorrente (renovação/reembolso/estorno), dados médicos sensíveis, sistema sem doc. Nunca usar a contagem de fontes como métrica de mérito.
17. **NÃO limitar números** (2026-06-11): o corte de checkpoint NÃO é "em dois agentes (47% e 58%)" — Pedro fez muito mais. Usar "em diversas campanhas, reduções que chegaram a ~58%". Mesma lógica pra tudo: nunca usar o que está visível no repo como teto do que ele fez. Pedro: "tá limitando meu estágio a pouca coisa".
18. **Anti-redundância** (2026-06-11): Pedro detesta "encher linguiça". Cada seção deve ADICIONAR, não repetir. Itens que viviam repetidos e foram desduplicados: "camada de integração", corte de custo %, método "medir-agir-validar" (agora só na 3.3), "formato único de eventos", caso telemedicina. Regra: resultados (4) = só desfecho; 5.3 = só o legado único (docs-padrão); 5.4 = só QUAIS/POR QUÊ, sem re-descrever; conclusão (6) = recap curto de 1 frase, não terceira repetição. Validar ao final: nenhuma frase-conceito aparece em 3+ seções com mesma redação.

## Reescrita de 2026-06-11 (feedback do Pedro: "relatório não tá bom")

Pedro reclamou que o relatório estava preso aos 2-3 exemplos do CLAUDE.md e ignorava a amplitude real do repositório. Reescritas as seções 2.2, 3.2, 3.3, 4, 5.1, 5.4 e 6 ancorando em:
- Carteira de ~10 clientes / ~30 campanhas (venda, recuperação, suporte, onboarding, SDR, upsell, lista de espera)
- **Integração Nuestra RX** (caso principal da seção 3.2, anonimizado como "operação internacional de telemedicina"): 4 fontes de eventos (formulário do site, intake médico, Checkout Champ, gateway NMI) → receivers n8n → normalizers JavaScript → API AwSales; HMAC-SHA256, allowlist de IP, segredo compartilhado, filtro de test mode, payloads reais documentados. Fonte: `Nuestra RX/Integração/HANDOFF.md`
- Tool deep link n8n (falha controlada, ok:false em vez de 404)
- Relatório EQJC: 455 atendimentos, 80,9% resolução automática (anonimizado)
- Cortes de checkpoint 47%/58%

## Logo da UNIFEI na capa (2026-06-11)

Capa agora tem `\includegraphics[width=2.5cm]{imagens/unifei.png}` acima do nome da universidade (padrão do `Exemplo.tex` do Vinícius). O arquivo está em `Estágio/imagens/unifei.png` (brasão engrenagem+raio, 2000x2000, baixado do Wikimedia EFEI_logo), versionado. **No Overleaf, subir a pasta `imagens/` com o unifei.png dentro** ou o build quebra. `graphicx` já no preâmbulo.

## O que o usuário disse que ainda tem coisa "errada"

Pedro afirmou que "quer corrigir muitas coisas que estão erradas ainda" mas não detalhou quais. **Pergunte a ele o que precisa corrigir** antes de assumir.

Itens conhecidos que podem ser ajustados:

- Conteúdo técnico das seções 3, 4 e 5 (revisão de tom, redução de "viagem" se ficar pretensioso demais)
- Possíveis números a ajustar (horas reais, datas)
- Cronograma — está bem genérico, pode precisar de mais especificidade por mês
- Capa e formatação visual (já corrigida a indentação dos blocos de dados com `itemize`)
- Conclusão — atualmente cita "Gerente de Operações" em vez do cargo completo

## Regras importantes do projeto AwSales (puxado do `CLAUDE.md` na raiz)

Estes pontos foram aplicados no relatório e devem ser preservados:
- A IA da AwSales é tratada como "IA" ou "agente de IA", nunca "bot"
- O checkpoint é o artefato mais crítico, mas deve ser ENXUTO (não duplicar FAQs)
- Tools sempre no formato `Utilize a tool para [ação] @nome_da_tool`
- Cargo correto Daniel: "Gerente de Estratégia e Operações"
- AwSales é Meta Business Partner

## Workflow para retomar (passo a passo)

1. Leia este arquivo
2. Leia o `.tex` atual: `Estágio/relatorio_estagio.tex`
3. Leia também `Estágio/declaracao_horas.tex`
4. Pergunte ao Pedro: **o que ainda está errado?** e **tem Termo Aditivo do TCE?**
5. Faça os ajustes que ele pedir, sem inventar mudanças não solicitadas
6. Se precisar reler os exemplos: `Estágio/Exemplos/Pedro Goias/` é a referência canônica
7. Compile mental ou pedir para Pedro compilar no Overleaf
8. Quando finalizar, commit + push para o repo `pedroleitel/AwsalesUniversalCreator`

## Comandos úteis

```bash
# extrair texto de PDFs (caso precise)
pdftotext -layout "Estágio/Exemplos/Pedro Goias/RELATÓRIO_FINAL_DE_ESTÁGIO___PEDRO_HENRIQUE_BARBOSA_OLIVEIRA.pdf" /tmp/exemplo.txt

# git status
git status

# após mudanças
git add Estágio/
git commit -m "feat(estágio): <descrição>"
git push origin main
```

## Tom de resposta esperado (preferência do Pedro)

Pedro usa **CAVEMAN MODE** (full). Respostas curtas, fragmentos OK, sem fluff. Mas código/commits/arquivos: escrita normal. Veja `~/.claude/plugins/cache/caveman/` se precisar do skill.

## Dados não verificados (não usar como fato sem confirmar)

- Número "R$ 3,5 milhões em faturamento" do AwSales — está no `CLAUDE.md` mas não bate com o site público. **Não use no relatório.** Já foi removido.
- "Margem líquida 40%", "80% recorrente" — mesma situação. Não use.

## Próximos passos sugeridos (se Pedro não disser nada)

1. Perguntar sobre Termo Aditivo
2. Perguntar quais correções específicas ele quer
3. Revisar a Conclusão (cargo desatualizado do supervisor)
4. Validar cronograma com Pedro (mês a mês está correto?)
5. Revisar se R$ 280–370 de economia da campanha SDR Lucas Firmino é número que Pedro quer manter no relatório oficial (é dado interno; ok citar?)
6. Confirmar se ele quer figuras (Wesley e Pedro Goias usaram). Pode adicionar screenshot da plataforma AwSales como Figura 1.
