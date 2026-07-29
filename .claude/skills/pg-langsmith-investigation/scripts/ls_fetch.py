#!/usr/bin/env python3
"""
pg-langsmith-investigation — fetcher autocontido (read-only).

Recebe QUALQUER link/id e se vira: resolve projeto + conversation_id, puxa TODOS os
root runs da conversa, monta o índice e salva evidência. Sem fricção de achar id na mão.

Aceita:
  - URL do LangSmith com filtro conversation_id  (smith.langchain.com/.../p/<PROJ>?...metadata_value="<conv>")
  - URL do LangSmith com filtro run_id           (idem, metadata_key="run_id")  → resolve a conversa
  - URL do neo                                    (neo.awsales.io/conversations?id=<conv>) → acha o projeto
  - UUID cru (conversation_id ou run_id)          → tenta os dois

Uso:  python ls_fetch.py "<link ou uuid>" [outdir]
Key:  $LANGSMITH_API_KEY ou .env.local na raiz da skill (ver scripts/_keys.py).
      NUNCA embutir a chave aqui — este repositório é público.
Saída: <skill>/build/<conversation_id>/ (caminho fixo, não depende do cwd).
"""
import sys, os, json, time, re, urllib.parse, urllib.request, urllib.error
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import _keys

KEY  = _keys.get("LANGSMITH_API_KEY")
BASE = os.environ.get("LANGSMITH_API_BASE", "https://api.smith.langchain.com")
try:  # Windows: console em cp1252 quebra com ✓/acento
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")
except Exception:
    pass
UUID = r"[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}"

def api(path, method="GET", body=None, tries=6):
    data = json.dumps(body).encode() if body is not None else None
    for i in range(tries):
        req = urllib.request.Request(BASE + path, data=data, method=method,
              headers={"x-api-key": KEY, "Content-Type": "application/json"})
        try:
            with urllib.request.urlopen(req, timeout=60) as r:
                return json.loads(r.read())
        except urllib.error.HTTPError as e:
            if e.code == 429:
                time.sleep(12); continue
            raise SystemExit(f"HTTP {e.code} em {path}: {e.read()[:200]}")
    raise SystemExit(f"rate limited após {tries} tentativas: {path}")

def conv_filter(cid):
    return f'and(eq(is_root, true), and(eq(metadata_key, "conversation_id"), eq(metadata_value, "{cid}")))'
def runid_filter(rid):
    return f'and(eq(is_root, true), and(eq(metadata_key, "run_id"), eq(metadata_value, "{rid}")))'

def all_projects():
    ids, off = [], 0
    while True:
        arr = api(f"/sessions?limit=100&offset={off}")
        arr = arr if isinstance(arr, list) else arr.get("sessions", [])
        if not arr: break
        ids += [p["id"] for p in arr]
        if len(arr) < 100: break
        off += 100; time.sleep(1)
    return ids

def parse_link(link):
    """→ dict: project, conv, rid (qualquer um pode ser None)."""
    out = {"project": None, "conv": None, "rid": None}
    dec = urllib.parse.unquote_plus(link).replace('\\"', '"')  # +→espaço, %5C%22→"
    if "smith.langchain.com" in link:
        m = re.search(r"/projects/p/(" + UUID + ")", link)
        if m: out["project"] = m.group(1)
        mk = re.search(r'metadata_key,\s*"([^"]+)"', dec)
        mv = re.search(r'metadata_value,\s*"([^"]+)"', dec)
        if mk and mv:
            if mk.group(1) == "conversation_id": out["conv"] = mv.group(1)
            elif mk.group(1) == "run_id":        out["rid"]  = mv.group(1)
            else:                                 out["conv"] = mv.group(1)  # tenta como conv
        return out
    if "neo.awsales.io" in link or "/conversations" in link:
        q = urllib.parse.parse_qs(urllib.parse.urlparse(link).query)
        if q.get("id"):
            out["conv"] = q["id"][0]
        else:  # path-style /conversations/<uuid> ou hash-router #/conversations?id= → pega o uuid da string
            m = re.search(UUID, link)
            if m: out["conv"] = m.group(0)
        return out
    m = re.search(UUID, link)            # uuid cru
    if m: out["conv"] = m.group(0)       # tenta como conversation_id; fallback p/ run_id depois
    return out

def resolve(info):
    """→ (project, conversation_id). Faz as chamadas necessárias."""
    project, conv, rid = info["project"], info["conv"], info["rid"]
    # run_id explícito → achar a conversa
    if rid and not conv:
        sessions = [project] if project else all_projects()
        d = api("/runs/query", "POST", {"session": sessions, "filter": runid_filter(rid),
                                        "select": ["id", "extra", "session_id"], "limit": 5})
        runs = d.get("runs", [])
        if not runs: raise SystemExit(f"run_id {rid} não encontrado.")
        conv = (runs[0].get("extra") or {}).get("metadata", {}).get("conversation_id")
        project = project or runs[0].get("session_id")
        if not conv: raise SystemExit(f"run_id {rid} achado mas sem conversation_id no metadata.")
    # conv conhecida mas sem projeto → achar o projeto (busca multi-session)
    if conv and not project:
        sessions = all_projects()
        d = api("/runs/query", "POST", {"session": sessions, "filter": conv_filter(conv),
                                        "select": ["id", "session_id"], "limit": 1})
        runs = d.get("runs", [])
        if runs:
            project = runs[0].get("session_id")
        else:
            # talvez o uuid cru fosse na verdade um run_id
            d2 = api("/runs/query", "POST", {"session": sessions, "filter": runid_filter(conv),
                                             "select": ["id", "extra", "session_id"], "limit": 5})
            r2 = d2.get("runs", [])
            if not r2: raise SystemExit(f"conversation_id/run_id {conv} não encontrado em nenhum projeto.")
            project = r2[0].get("session_id")
            conv = (r2[0].get("extra") or {}).get("metadata", {}).get("conversation_id") or conv
    if not (project and conv): raise SystemExit(f"não consegui resolver projeto+conversa de: {info}")
    return project, conv

def fetch_conversation(project, conv, outdir):
    runs, cur = [], None
    while True:
        body = {"session": [project], "filter": conv_filter(conv), "limit": 100}
        if cur: body["cursor"] = cur
        d = api("/runs/query", "POST", body)
        runs += d.get("runs", [])
        cur = (d.get("cursors") or {}).get("next")
        if not cur or len(d.get("runs", [])) == 0: break
        time.sleep(1)
    os.makedirs(outdir, exist_ok=True)
    json.dump({"runs": runs}, open(f"{outdir}/raw_query.json", "w", encoding="utf-8"), ensure_ascii=False)
    runs.sort(key=lambda x: x.get("start_time", ""))
    idx = []
    for i, r in enumerate(runs):
        md = (r.get("extra") or {}).get("metadata", {}); mdl = md.get("model", {})
        t = mdl.get("kwargs", {}).get("temperature") if isinstance(mdl, dict) else None
        idx.append(f"{i:2d} {r.get('start_time','')[11:19]} {r.get('status',''):7s} {r.get('name',''):34s} "
                   f"model={md.get('model_name') or md.get('ls_model_name')} temp={t} "
                   f"tok={r.get('total_tokens')} err={'Y' if r.get('status')=='error' else ''}")
    open(f"{outdir}/run_index.txt", "w", encoding="utf-8").write("\n".join(idx))
    return runs

def main():
    if len(sys.argv) < 2:
        print(__doc__); sys.exit(1)
    link = sys.argv[1]
    info = parse_link(link)
    project, conv = resolve(info)
    outdir = sys.argv[2] if len(sys.argv) > 2 else os.path.join(_keys.skill_root(), "build", conv)
    runs = fetch_conversation(project, conv, outdir)
    print(f"✓ projeto       : {project}")
    print(f"✓ conversation  : {conv}")
    print(f"✓ root runs      : {len(runs)}")
    print(f"✓ salvo em       : {os.path.abspath(outdir)}/ (raw_query.json + run_index.txt)")
    print(f"\nPróximo: rodar o trilho (Gate 2 input-vs-output em diante) sobre {outdir}/raw_query.json")

if __name__ == "__main__":
    main()
