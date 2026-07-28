import sys
import os
import argparse
from pypdf import PdfReader


def parse_args():
    parser = argparse.ArgumentParser(
        prog="pdf-to-txt",
        description="Extrai texto de PDFs e salva em arquivos .txt",
        formatter_class=argparse.RawTextHelpFormatter,
        epilog=(
            "Exemplos:\n"
            '  python pdf-to-txt.py "FAQs - Igor Miguel/produto.pdf"\n'
            '  python pdf-to-txt.py "FAQs - Igor Miguel" --overwrite'
        ),
    )
    parser.add_argument("input", help="Arquivo PDF ou pasta")
    parser.add_argument("--out", help="Arquivo de saída (só para input de arquivo único)")
    parser.add_argument("--no-recursive", dest="recursive", action="store_false", default=True)
    parser.add_argument("--overwrite", action="store_true", default=False)
    return parser.parse_args()


def find_pdfs(path, recursive):
    if os.path.isfile(path):
        if not path.lower().endswith(".pdf"):
            print(f"Erro: arquivo não é PDF: {path}")
            sys.exit(1)
        return [path]

    if not os.path.isdir(path):
        print(f"Erro: caminho não encontrado: {path}")
        sys.exit(1)

    pdfs = []
    for entry in os.scandir(path):
        if entry.is_file() and entry.name.lower().endswith(".pdf"):
            pdfs.append(entry.path)
        elif entry.is_dir() and recursive:
            pdfs.extend(find_pdfs(entry.path, recursive))
    return pdfs


def extract_pdf(pdf_path):
    reader = PdfReader(pdf_path)
    text = ""
    for i, page in enumerate(reader.pages, start=1):
        text += f"--- PAGINA {i} ---\n"
        text += (page.extract_text() or "") + "\n\n"
    return text, len(reader.pages)


def main():
    args = parse_args()
    input_path = os.path.abspath(args.input)

    if not os.path.exists(input_path):
        print(f"Erro: caminho não encontrado: {input_path}")
        sys.exit(1)

    pdfs = find_pdfs(input_path, args.recursive)

    if not pdfs:
        print("Nenhum arquivo PDF encontrado.")
        sys.exit(1)

    single = len(pdfs) == 1
    ok = 0
    skipped = 0

    for pdf in pdfs:
        out_path = (
            os.path.abspath(args.out)
            if args.out and single
            else pdf[:-4] + ".txt"
        )

        if os.path.exists(out_path) and not args.overwrite:
            print(f"Pulando (já existe): {out_path}")
            skipped += 1
            continue

        text, pages = extract_pdf(pdf)
        with open(out_path, "w", encoding="utf-8") as f:
            f.write(text)
        print(f"OK: {pdf} -> {out_path} ({pages} páginas, {len(text)} chars)")
        ok += 1

    print(f"\nConcluído. Convertidos: {ok}. Pulados: {skipped}.")


if __name__ == "__main__":
    main()
