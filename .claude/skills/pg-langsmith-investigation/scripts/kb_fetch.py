#!/usr/bin/env python3
"""
pg-langsmith-investigation — KB cross-check via Metabase (read-only).

Dado um conversation_id, puxa o CONTEÚDO REAL das bases de conhecimento que a conversa
usou — pra distinguir "a base NÃO tinha o dado" (gap de conteúdo) de "a base TINHA mas o
RAG não recuperou" (falha de retrieval). Sem isso, o LangSmith só mostra o que o RAG
DEVOLVEU, não o que EXISTIA.

Cadeia (schema NEO / awsales_backoffice_db, Metabase db=7):
  conversation_id → messages.conversation_agent_session_id
                  → conversations_agents_sessions.(playbook|product)_knowledge_base_id
                  → knowledge_bases_sources.extracted_content

Uso:  python kb_fetch.py <conversation_id> [outdir]   (ou: --grep "termo1,termo2")
Key:  $METABASE_API_KEY ou .env.local na raiz da skill (ver scripts/_keys.py).
      NUNCA embutir a chave aqui — este repositório é público.
Saída: <skill>/build/<conversation_id>/knowledge/ (caminho fixo, não depende do cwd).
"""
import sys, os, json, hashlib, urllib.request, urllib.error
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import _keys

MB  = os.environ.get("METABASE_URL", "https://metabase.awsales.io")
DB  = int(os.environ.get("METABASE_DB_ID", "7"))   # NEO (awsales_backoffice_db)
KEY = _keys.get("METABASE_API_KEY")
try:  # Windows: console em cp1252 quebra com ✓/acento
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")
except Exception:
    pass

def q(sql):
    body = json.dumps({"database": DB, "type": "native", "native": {"query": sql}}).encode()
    req = urllib.request.Request(MB + "/api/dataset", data=body, method="POST",
          headers={"x-api-key": KEY, "Content-Type": "application/json", "User-Agent": "curl/8.4.0"})
    try:
        with urllib.request.urlopen(req, timeout=120) as r:
            d = json.loads(r.read())
    except urllib.error.HTTPError as e:
        raise SystemExit(f"Metabase HTTP {e.code}: {e.read()[:200]}")
    if "data" not in d:
        raise SystemExit(f"Metabase erro: {json.dumps(d)[:300]}")
    cols = [c["name"] for c in d["data"]["cols"]]
    return cols, d["data"]["rows"]

def esc(s):  # escapa aspas simples pra SQL inline
    return s.replace("'", "''")

def main():
    if len(sys.argv) < 2:
        print(__doc__); sys.exit(1)
    conv = sys.argv[1]
    outdir = None; grep_terms = []
    args = sys.argv[2:]
    i = 0
    while i < len(args):
        if args[i] == "--grep" and i + 1 < len(args):
            grep_terms = [t.strip() for t in args[i+1].split(",") if t.strip()]; i += 2
        else:
            outdir = args[i]; i += 1
    outdir = outdir or os.path.join(_keys.skill_root(), "build", conv, "knowledge")
    os.makedirs(outdir, exist_ok=True)

    # 1+2: conversation → session → kb ids
    _, rows = q(f"""SELECT cas.id, cas.playbook_knowledge_base_id, cas.product_knowledge_base_id
                    FROM conversations_agents_sessions cas
                    WHERE cas.id IN (SELECT DISTINCT conversation_agent_session_id
                                     FROM messages WHERE conversation_id='{esc(conv)}')""")
    if not rows:
        raise SystemExit(f"Nenhuma agent-session pra conversation_id {conv} (confira o id / a org).")
    sessions = rows
    kb_ids = sorted({k for r in rows for k in (r[1], r[2]) if k})
    print(f"✓ agent-session(s): {[r[0] for r in sessions]}")
    print(f"✓ knowledge bases : playbook+product = {kb_ids}")

    # 3: pull all sources + content
    in_list = ",".join("'" + esc(k) + "'" for k in kb_ids)
    cols, srcs = q(f"""SELECT kb.type, kb.name, kbs.knowledge_base_id, kbs.source_type, kbs.source,
                              length(kbs.extracted_content) AS len, kbs.extracted_content
                       FROM knowledge_bases_sources kbs
                       LEFT JOIN knowledge_bases kb ON kb.id = kbs.knowledge_base_id
                       WHERE kbs.knowledge_base_id IN ({in_list})
                       ORDER BY kb.type, len DESC""")
    ci = {c: i for i, c in enumerate(cols)}
    manifest = []
    seen_hash = {}
    for n, r in enumerate(srcs):
        typ, name, kbid, stype, source, ln, content = (r[ci["type"]], r[ci["name"]], r[ci["knowledge_base_id"]],
            r[ci["source_type"]], r[ci["source"]], r[ci["len"]], r[ci["extracted_content"]] or "")
        h = hashlib.md5(content.encode("utf-8")).hexdigest()  # determinístico entre runs
        dup = seen_hash.get(h)
        fn = f"{typ or 'kb'}__{stype}__{n:02d}.txt"
        with open(f"{outdir}/{fn}", "w", encoding="utf-8") as f:
            f.write(content)
        hit = {t: (t.lower() in content.lower()) for t in grep_terms} if grep_terms else {}
        manifest.append({"file": fn, "kb_type": typ, "kb_id": kbid, "source_type": stype,
                         "source": source, "chars": ln, "dup_of": dup, "grep": hit})
        seen_hash.setdefault(h, fn)
    json.dump(manifest, open(f"{outdir}/_manifest.json", "w", encoding="utf-8"), ensure_ascii=False, indent=2)

    # 4: o que o RAG REALMENTE perguntou e puxou (query + score por mensagem)
    try:
        _, rag = q(f"""SELECT mrd.query, count(*) AS docs, min(mrd.score) AS score_min, max(mrd.score) AS score_max
                       FROM messages_rag_documents mrd JOIN messages m ON m.id = mrd.message_id
                       WHERE m.conversation_id='{esc(conv)}' GROUP BY mrd.query ORDER BY max(mrd.score) DESC""")
        lines = ["query | docs | score_min | score_max"] + [f"{r[0]} | {r[1]} | {r[2]} | {r[3]}" for r in rag]
        open(f"{outdir}/rag_queries.txt", "w", encoding="utf-8").write("\n".join(lines))
        print(f"✓ RAG queries     : {len(rag)} queries distintas (o que o RAG buscou) → {outdir}/rag_queries.txt")
    except SystemExit as e:
        print(f"  (messages_rag_documents indisponível: {e})")

    total = sum(m["chars"] for m in manifest)
    uniq = sum(1 for m in manifest if not m["dup_of"])
    print(f"✓ fontes          : {len(manifest)} ({uniq} únicas, dups flaggeadas em _manifest.json) · {total:,} chars · salvas em {os.path.abspath(outdir)}/")
    if grep_terms:
        print(f"✓ grep {grep_terms}:")
        for t in grep_terms:
            files = [m["file"] for m in manifest if m["grep"].get(t)]
            print(f"    {t!r}: {'ACHADO em '+str(files) if files else 'NÃO está em nenhuma fonte'}")
    print(f"\nPróximo: grep o conteúdo em {outdir}/ pelo dado que o RAG NÃO devolveu.")
    print("Se o dado ESTÁ aqui mas o RAG não trouxe → falha de RETRIEVAL (não gap de conteúdo).")

if __name__ == "__main__":
    main()
