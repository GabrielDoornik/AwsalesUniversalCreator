# Instalar e rodar — pg-langsmith-investigation (neste repositório)

Skill autocontida pra investigar IAs em produção via traces do LangSmith (+ cruzar com a base real via Metabase). **Read-only.**

## Dependências
- **Python 3** (só stdlib — nada de `pip install`). Aqui: `python` (3.12).
- Acesso de rede a `api.smith.langchain.com` e `metabase.awsales.io`.

## Chaves — passo obrigatório (1x por máquina)

⚠️ **Este repositório é PÚBLICO no GitHub.** O zip original trazia as duas chaves embutidas nos scripts (decisão tomada assumindo repo privado). Aqui elas foram **retiradas do código**: os scripts leem de variável de ambiente ou de `.env.local`, que é gitignorado.

```bash
cd ".claude/skills/pg-langsmith-investigation"
cp .env.example .env.local     # PowerShell: copy .env.example .env.local
# edite .env.local e cole as chaves reais (estão no zip original / com o PG)
```

`.env.local` está no `.gitignore` — confira com `git check-ignore -v .claude/skills/pg-langsmith-investigation/.env.local` antes de commitar qualquer coisa.

Mesmo sendo read-only, a chave do LangSmith lê **todos** os traces da org (conversas reais de lead, com PII) e a do Metabase lê o banco NEO. Se vazarem, rotacione.

## Descoberta
A skill vive em `.claude/skills/pg-langsmith-investigation/` — o Claude Code descobre sozinho ao abrir este repo. Nada a instalar.

## Como rodar
`cd` pro diretório da skill:
```bash
cd ".claude/skills/pg-langsmith-investigation"

# 1) Resolve QUALQUER link/id e puxa a conversa:
python scripts/ls_fetch.py "<link do LangSmith / link do neo / uuid>"
#    → cria build/<conversation_id>/raw_query.json + run_index.txt

# 2) (opcional, decisivo) cruza com a base real:
python scripts/kb_fetch.py <conversation_id> --grep "termo que a IA deveria saber"
#    → build/<conversation_id>/knowledge/*.txt + rag_queries.txt
```

A saída cai sempre em `<skill>/build/<conv>/` (caminho fixo, ancorado na pasta da skill — não depende do cwd). **`build/` é gitignorado**: contém transcrição real de conversa e base de conhecimento de cliente.

## Depois
Siga `workflow.md` (Gates 1–6). Uso manual = checklist sequencial; uso como orquestrador de IA = fan-out de sub-agentes.

## Diferenças em relação ao zip original
- Chaves fora do código (`scripts/_keys.py` resolve env → `.env.local` → erro instrutivo).
- `build/` ancorado na pasta da skill em vez de relativo ao cwd.
- Escrita de arquivo e `stdout` forçados em UTF-8 (no Windows os scripts quebravam com acento).
- `python3` → `python` nos exemplos.
- `GUIA.pdf` (guia de 4 páginas pro time, marcado Confidencial) **não foi versionado** — está gitignorado; original em `Downloads/skill-pg (1).zip`.
- `reference/modelo-mental-claude.md` veio junto no zip mas é doutrina geral de outro workspace: cita caminhos (`apps/awsales-skills/`, `investigations/`, `.claude/skills/_skill-convention.md`) que não existem aqui. Fica como leitura, não é carregado pela skill.
