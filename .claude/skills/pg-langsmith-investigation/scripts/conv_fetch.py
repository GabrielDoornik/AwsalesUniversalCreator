#!/usr/bin/env python3
"""
Conversa REAL do banco APP (db 3) a partir de TELEFONE — sem depender do LangSmith.

Por que existe: as campanhas do legado (ex: Falcao das Milhas Onboarding) NAO tem trace
no LangSmith, e a base de conhecimento (kb_fetch.py) vive no NEO (db 7), outro banco.
Quem guarda a conversa e o banco APP (db 3). Este script faz a cadeia inteira:

  telefone -> leads."phoneNumber" (+ organizations, pois o MESMO telefone existe em varias orgs)
           -> conversion_window (a janela: start/end, status, handoff, trigger)
           -> messages  (conversion_window.id == messages.conversation_id)

Uso:
  python scripts/conv_fetch.py --phone "<telefone do lead>" --org falc
  python scripts/conv_fetch.py --phone "<telefone>" --org falc --campaign onboarding
  python scripts/conv_fetch.py --lead <lead_id> --since 2026-07-01

Saida: <skill>/build/<lead_id>/janelas.txt + conversa.txt (gitignorado: PII de lead).
Key: $METABASE_API_KEY ou .env.local. Read-only.
"""
import sys, os, re, argparse
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import _keys
from mb_query import query

DB = 3
try:
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")
except Exception:
    pass


def esc(s):
    return str(s).replace("'", "''")


def find_leads(phone_digits, org_like):
    # sufixo: cobre com e sem o 9 do celular e com/sem +55
    sql = f"""SELECT l.id, l."phoneNumber", l.name, o.name AS org, l.organization_id
              FROM leads l LEFT JOIN organizations o ON o.id = l.organization_id
              WHERE l."phoneNumber" LIKE '%{esc(phone_digits)}%'"""
    if org_like:
        sql += f" AND o.name ILIKE '%{esc(org_like)}%'"
    sql += " ORDER BY o.name LIMIT 50"
    return query(sql, DB)


def find_windows(lead_id, campaign_like, since):
    sql = f"""SELECT cw.id, c.name AS campanha, cw.start_at, cw.end_at, cw.window_status,
                     cw.status, cw.trigger_type, cw.interaction, cw.lead_status,
                     cw.smart_fup_took_control, cw.human_handoff_on, cw.human_handoff_on_at,
                     cw.channel, cw.channel_conversation_id, coalesce(cw.resume,'') AS resume
              FROM conversion_window cw LEFT JOIN campaigns c ON c.id = cw.campaign_id
              WHERE cw.lead_id = '{esc(lead_id)}'"""
    if campaign_like:
        sql += f" AND c.name ILIKE '%{esc(campaign_like)}%'"
    if since:
        sql += f" AND cw.start_at >= '{esc(since)}'"
    sql += " ORDER BY cw.start_at"
    return query(sql, DB)


def fetch_messages(win_ids):
    # left(current_checkpoint,1) so pra saber SE veio: a coluna carrega o checkpoint
    # INTEIRO em cada linha e infla a saida em milhares de linhas se for selecionada crua.
    ids = ",".join("'" + esc(w) + "'" for w in win_ids)
    sql = f"""SELECT conversation_id, datetime, "from", "to", sent_by, is_template, is_followup,
                     status, media_type, left(coalesce(current_checkpoint,''),1) AS tem_ckpt,
                     content, thought, failed_details
              FROM messages WHERE conversation_id IN ({ids}) ORDER BY datetime"""
    return query(sql, DB)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--phone", help="telefone em qualquer formato; usa os digitos como sufixo")
    ap.add_argument("--lead", help="lead_id exato (pula a busca por telefone)")
    ap.add_argument("--org", help="filtro ILIKE no nome da organizacao")
    ap.add_argument("--campaign", help="filtro ILIKE no nome da campanha")
    ap.add_argument("--since", help="data minima da janela, ex 2026-07-01")
    a = ap.parse_args()
    if not (a.phone or a.lead):
        print(__doc__); sys.exit(1)

    lead_phone = None
    if a.lead:
        lead_ids = [a.lead]
        c, r = query(f"""SELECT "phoneNumber" FROM leads WHERE id='{esc(a.lead)}'""", DB)
        lead_phone = r[0][0] if r else None
    else:
        digits = re.sub(r"\D", "", a.phone)[-8:]  # ultimos 8 digitos: imune a +55/DDD/9
        c, r = find_leads(digits, a.org)
        if not r:
            raise SystemExit(f"Nenhum lead com telefone terminando em {digits}"
                             + (f" na org ~{a.org}" if a.org else ""))
        print(f"leads encontrados ({len(r)}):")
        for x in r:
            print(f"   {x[0]} | {x[1]} | {x[2]} | org={x[3]}")
        if len(r) > 1 and not a.org:
            print("\nATENCAO: o mesmo telefone existe em varias orgs. Use --org para escolher.")
        lead_ids = [x[0] for x in r]
        lead_phone = r[0][1]

    for lead_id in lead_ids:
        cw, wins = find_windows(lead_id, a.campaign, a.since)
        if not wins:
            print(f"\nlead {lead_id}: nenhuma janela"
                  + (f" para campanha ~{a.campaign}" if a.campaign else ""))
            continue
        out = os.path.join(_keys.skill_root(), "build", lead_id)
        os.makedirs(out, exist_ok=True)

        with open(f"{out}/janelas.txt", "w", encoding="utf-8") as f:
            for x in wins:
                d = dict(zip(cw, x))
                f.write(f"--- {d['campanha']}  ({d['id']})\n")
                for k in cw:
                    if k not in ("id", "campanha"):
                        f.write(f"    {k:24} {d[k]}\n")
                f.write("\n")

        win_ids = [x[0] for x in wins]
        label = {x[0]: f"{x[1]} - {str(x[2])[:16]}" for x in wins}
        cm, msgs = fetch_messages(win_ids)
        with open(f"{out}/conversa.txt", "w", encoding="utf-8") as f:
            atual = None
            for x in msgs:
                d = dict(zip(cm, x))
                if d["conversation_id"] != atual:
                    atual = d["conversation_id"]
                    n = sum(1 for m in msgs if m[0] == atual)
                    f.write("\n" + "=" * 90 + f"\n{label[atual]}  ({atual[:8]})  {n} msgs\n" + "=" * 90 + "\n")
                who = "LEAD" if str(d["from"]) == str(lead_phone) else "IA  "
                tag = []
                if d["is_template"]: tag.append("TEMPLATE")
                if d["is_followup"]: tag.append("FUP")
                if d["media_type"]: tag.append(f"media={d['media_type']}")
                if d["tem_ckpt"]: tag.append("ckpt=SIM")
                f.write(f"\n[{str(d['datetime'])[5:19]}] {who} {' '.join(tag)} status={d['status']}\n")
                f.write(f"  {d['content']}\n")
                if d["thought"]: f.write(f"  THOUGHT: {d['thought']}\n")
                if d["failed_details"]: f.write(f"  FALHA: {d['failed_details']}\n")

        handoffs = sum(1 for x in wins if dict(zip(cw, x))["human_handoff_on"])
        print(f"\n✓ lead        : {lead_id} ({lead_phone})")
        print(f"✓ janelas     : {len(wins)}  |  handoff registrado em: {handoffs}")
        print(f"✓ mensagens   : {len(msgs)}")
        print(f"✓ salvo em    : {out}/  (janelas.txt + conversa.txt)")
        print("\nLembre: interaction/lead_status/resume/smart_fup_took_control costumam vir NULOS —")
        print("nao os use como prova. Veja reference/banco-conversas-app.md antes de concluir.")


if __name__ == "__main__":
    main()
