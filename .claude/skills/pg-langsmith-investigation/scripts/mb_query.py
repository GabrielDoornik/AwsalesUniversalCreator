#!/usr/bin/env python3
"""
Metabase — SELECT ad-hoc read-only em qualquer banco da AWSales.

Bancos (confirmado 2026-07-29):
   3 = APP  (awsales_db / Plataforma legado, postgres)  ← conversas, leads, campanhas, conversion_window
   7 = NEO  (awsales_backoffice_db, postgres)           ← knowledge_bases, messages_rag_documents
   4/8 = Awsales 3.0 / Awsales 3 (mysql)                6 = BigQuery legado

Uso:
  python scripts/mb_query.py --db 3 "SELECT ..."
  python scripts/mb_query.py --db 3 --file query.sql
  python scripts/mb_query.py --db 3 --tables "%conversion%"     (atalho: procura tabela)
  python scripts/mb_query.py --db 3 --columns conversion_window (atalho: schema da tabela)

Key: $METABASE_API_KEY ou .env.local. Bloqueia qualquer coisa que nao seja SELECT/WITH.
"""
import sys, os, json, argparse, urllib.request, urllib.error
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import _keys

MB = os.environ.get("METABASE_URL", "https://metabase.awsales.io")
BLOCKED = ("insert", "update", "delete", "drop", "alter", "create", "truncate", "grant", "copy")
try:
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")
except Exception:
    pass


def query(sql, db):
    low = sql.strip().lower()
    if not (low.startswith("select") or low.startswith("with")):
        raise SystemExit("READ-ONLY: so SELECT/WITH sao permitidos.")
    for kw in BLOCKED:
        if f" {kw} " in f" {low} ":
            raise SystemExit(f"READ-ONLY: comando '{kw}' bloqueado.")
    body = json.dumps({"database": int(db), "type": "native", "native": {"query": sql}}).encode()
    req = urllib.request.Request(MB + "/api/dataset", data=body, method="POST",
          headers={"x-api-key": _keys.get("METABASE_API_KEY"),
                   "Content-Type": "application/json",
                   "User-Agent": "curl/8.4.0"})  # Metabase bloqueia Python-urllib com 403
    try:
        d = json.loads(urllib.request.urlopen(req, timeout=180).read())
    except urllib.error.HTTPError as e:
        raise SystemExit(f"Metabase HTTP {e.code}: {e.read().decode()[:400]}")
    if "data" not in d:
        raise SystemExit(f"Metabase erro: {json.dumps(d)[:400]}")
    return [c["name"] for c in d["data"]["cols"]], d["data"]["rows"]


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("sql", nargs="?")
    ap.add_argument("--db", default="3")
    ap.add_argument("--file")
    ap.add_argument("--tables", help="padrao ILIKE para procurar tabela")
    ap.add_argument("--columns", help="nome da tabela para listar colunas")
    ap.add_argument("--json", action="store_true")
    a = ap.parse_args()

    if a.tables:
        sql = (f"SELECT table_name FROM information_schema.tables WHERE table_schema='public' "
               f"AND table_name ILIKE '{a.tables}' ORDER BY table_name")
    elif a.columns:
        sql = (f"SELECT column_name, data_type FROM information_schema.columns "
               f"WHERE table_schema='public' AND table_name='{a.columns}' ORDER BY ordinal_position")
    elif a.file:
        sql = open(a.file, encoding="utf-8").read()
    elif a.sql:
        sql = a.sql
    else:
        print(__doc__); sys.exit(1)

    cols, rows = query(sql, a.db)
    if a.json:
        print(json.dumps([dict(zip(cols, r)) for r in rows], ensure_ascii=False, indent=2)); return
    print(" | ".join(cols))
    print("-" * 80)
    for r in rows:
        print(" | ".join("" if v is None else str(v).replace("\n", " ")[:70] for v in r))
    print(f"\n{len(rows)} linha(s)")


if __name__ == "__main__":
    main()
