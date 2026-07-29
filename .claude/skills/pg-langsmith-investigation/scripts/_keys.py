"""Resolve chaves de API SEM embuti-las no codigo (este repo e PUBLICO).

Ordem de busca, primeiro que existir vence:
  1. variavel de ambiente (LANGSMITH_API_KEY / METABASE_API_KEY)
  2. .env.local na raiz da skill (gitignorado) — linhas CHAVE=valor
  3. erro com instrucao de como configurar

Nunca commitar .env.local. Ver .env.example ao lado.
"""
import os

_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
_ENV_FILE = os.path.join(_ROOT, ".env.local")
_cache = None


def _load_file():
    global _cache
    if _cache is not None:
        return _cache
    _cache = {}
    if os.path.exists(_ENV_FILE):
        with open(_ENV_FILE, encoding="utf-8-sig", errors="replace") as f:
            for line in f:
                line = line.strip()
                if not line or line.startswith("#") or "=" not in line:
                    continue
                k, v = line.split("=", 1)
                _cache[k.strip()] = v.strip().strip('"').strip("'")
    return _cache


def get(name, hint=""):
    val = os.environ.get(name) or _load_file().get(name)
    # Tolera o erro comum de colar a linha inteira sobre o placeholder,
    # o que gera NOME=NOME=valor. Sem isto, a chave viaja errada e a API da 401/403.
    while val and val.startswith(name + "="):
        val = val[len(name) + 1:].strip().strip('"').strip("'")
    if not val:
        raise SystemExit(
            f"Chave {name} nao configurada.\n"
            f"  Opcao 1: set {name}=... no ambiente\n"
            f"  Opcao 2: crie {_ENV_FILE} com a linha {name}=...\n"
            f"  (copie de .env.example; o arquivo e gitignorado){hint}"
        )
    return val


def skill_root():
    return _ROOT
