"""Gera o PDF do Relatório de Performance e Impacto - Suporte Falcão das Milhas - Junho/2026.

Adaptado de gerar_relatorio.py: mesmos estilos/visual, com cards, datas e caminhos de junho.
"""

import os
import re

from reportlab.lib import colors
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import mm
from reportlab.platypus import (
    BaseDocTemplate,
    Frame,
    PageTemplate,
    Paragraph,
    Spacer,
    Table,
    TableStyle,
    KeepTogether,
)
from reportlab.pdfgen import canvas

REPORT_DIR = r"C:\Users\Pedro\Desktop\AwsalesUniversalCreator\Falcão das milhas\Suporte\02_Relatórios Entregues\2026-06-30"
MD_PATH = os.path.join(REPORT_DIR, "Relatório de Performance e Impacto - Suporte Falcão das Milhas - 30-06.md")
PDF_PATH = os.path.join(REPORT_DIR, "Relatório de Performance e Impacto - Suporte Falcão das Milhas - 30-06.pdf")

PRIMARY = colors.HexColor("#1E55B8")
PRIMARY_DARK = colors.HexColor("#163F8C")
TEXT_DARK = colors.HexColor("#1F2937")
TEXT_MUTED = colors.HexColor("#4B5563")
TEXT_LABEL = colors.HexColor("#6B7280")
CARD_BORDER = colors.HexColor("#E5E7EB")
TABLE_HEADER_BG = PRIMARY
TABLE_HEADER_TEXT = colors.white
TABLE_ROW_ALT = colors.HexColor("#F9FAFB")
TABLE_BORDER = colors.HexColor("#E5E7EB")
GREEN = colors.HexColor("#16A34A")
RED = colors.HexColor("#DC2626")

styles = getSampleStyleSheet()

HEADER_KICKER = ParagraphStyle("HeaderKicker", parent=styles["Normal"], fontName="Helvetica-Bold", fontSize=10, textColor=PRIMARY, leading=12, spaceAfter=4)
TITLE = ParagraphStyle("Title", parent=styles["Title"], fontName="Helvetica-Bold", fontSize=22, textColor=TEXT_DARK, leading=26, spaceAfter=8, alignment=0)
SUBTITLE = ParagraphStyle("Subtitle", parent=styles["Normal"], fontName="Helvetica", fontSize=10, textColor=TEXT_MUTED, leading=14, spaceAfter=18)
SECTION_TITLE = ParagraphStyle("SectionTitle", parent=styles["Heading2"], fontName="Helvetica-Bold", fontSize=15, textColor=PRIMARY, leading=20, spaceBefore=16, spaceAfter=8)
SUB_TITLE = ParagraphStyle("SubTitle", parent=styles["Heading3"], fontName="Helvetica-Bold", fontSize=12, textColor=TEXT_DARK, leading=16, spaceBefore=10, spaceAfter=6)
BODY = ParagraphStyle("Body", parent=styles["Normal"], fontName="Helvetica", fontSize=10, textColor=TEXT_DARK, leading=14, spaceAfter=8)
CARD_LABEL = ParagraphStyle("CardLabel", parent=styles["Normal"], fontName="Helvetica-Bold", fontSize=7.5, textColor=TEXT_LABEL, leading=10, alignment=1, spaceAfter=4)
CARD_VALUE_BLUE = ParagraphStyle("CardValueBlue", parent=styles["Normal"], fontName="Helvetica-Bold", fontSize=18, textColor=PRIMARY, leading=22, alignment=1, spaceAfter=4)
CARD_VALUE_GREEN = ParagraphStyle("CardValueGreen", parent=CARD_VALUE_BLUE, textColor=GREEN)
CARD_VALUE_RED = ParagraphStyle("CardValueRed", parent=CARD_VALUE_BLUE, textColor=RED)
CARD_VALUE_DARK = ParagraphStyle("CardValueDark", parent=CARD_VALUE_BLUE, textColor=TEXT_DARK)
CARD_HINT = ParagraphStyle("CardHint", parent=styles["Normal"], fontName="Helvetica", fontSize=7.5, textColor=TEXT_MUTED, leading=10, alignment=1)
TABLE_CELL = ParagraphStyle("TableCell", parent=styles["Normal"], fontName="Helvetica", fontSize=9, textColor=TEXT_DARK, leading=12)
TABLE_HEADER = ParagraphStyle("TableHeader", parent=styles["Normal"], fontName="Helvetica-Bold", fontSize=9.5, textColor=TABLE_HEADER_TEXT, leading=12)

CARDS = [
    {"label": "CONVERSAS ANALISADAS", "value": "1.422", "value_style": CARD_VALUE_DARK, "hint": "IA 464 · Humano 772"},
    {"label": "RESOLUÇÃO PELA IA", "value": "32,6%", "value_style": CARD_VALUE_BLUE, "hint": "464 conversas, 24/7"},
    {"label": "CSAT DA IA", "value": "4,76/5", "value_style": CARD_VALUE_GREEN, "hint": "estável vs maio (4,85)"},
    {"label": "REEMBOLSO BUSCADOR", "value": "~19%", "value_style": CARD_VALUE_GREEN, "hint": "histórico 22,5-23%"},
    {"label": "CUSTO / CONVERSA", "value": "R$ 6,23", "value_style": CARD_VALUE_DARK, "hint": "R$ 8.861 no mês"},
]


def build_card(card):
    contents = [Paragraph(card["label"], CARD_LABEL), Paragraph(card["value"], card["value_style"]), Paragraph(card["hint"], CARD_HINT)]
    t = Table([[c] for c in contents], colWidths=[33 * mm])
    t.setStyle(TableStyle([
        ("BOX", (0, 0), (-1, -1), 0.6, CARD_BORDER),
        ("LEFTPADDING", (0, 0), (-1, -1), 6), ("RIGHTPADDING", (0, 0), (-1, -1), 6),
        ("TOPPADDING", (0, 0), (0, 0), 8), ("BOTTOMPADDING", (0, 0), (0, 0), 2),
        ("TOPPADDING", (0, 1), (0, 1), 2), ("BOTTOMPADDING", (0, 1), (0, 1), 2),
        ("TOPPADDING", (0, 2), (0, 2), 2), ("BOTTOMPADDING", (0, 2), (0, 2), 8),
        ("BACKGROUND", (0, 0), (-1, -1), colors.white),
    ]))
    return t


def build_cards_grid():
    cards = [build_card(c) for c in CARDS]
    grid = Table([cards], colWidths=[34 * mm] * len(cards))
    grid.setStyle(TableStyle([
        ("LEFTPADDING", (0, 0), (-1, -1), 0), ("RIGHTPADDING", (0, 0), (-1, -1), 1),
        ("TOPPADDING", (0, 0), (-1, -1), 0), ("BOTTOMPADDING", (0, 0), (-1, -1), 0),
        ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
    ]))
    return grid


def parse_md(md_text):
    lines = md_text.split("\n")
    blocks = []
    i = 0
    while i < len(lines):
        s = lines[i].strip()
        if not s:
            i += 1; continue
        if s.startswith("# "):
            blocks.append(("h1", s[2:].strip())); i += 1; continue
        if s.startswith("## "):
            blocks.append(("h2", s[3:].strip())); i += 1; continue
        if s.startswith("### "):
            blocks.append(("h3", s[4:].strip())); i += 1; continue
        if s.startswith(">"):
            blocks.append(("para", s.lstrip("> ").strip())); i += 1; continue
        if s.startswith("|") and i + 1 < len(lines) and re.match(r"^\s*\|[\s\-:|]+\|\s*$", lines[i + 1]):
            header_cells = parse_row(s); i += 2
            rows = []
            while i < len(lines) and lines[i].lstrip().startswith("|"):
                rows.append(parse_row(lines[i].strip())); i += 1
            blocks.append(("table", {"header": header_cells, "rows": rows})); continue
        para_lines = [s]; i += 1
        while i < len(lines) and lines[i].strip() and not lines[i].strip().startswith("#") and not lines[i].lstrip().startswith("|") and not lines[i].strip().startswith(">"):
            para_lines.append(lines[i].strip()); i += 1
        blocks.append(("para", " ".join(para_lines)))
    return blocks


def parse_row(line):
    return [c.strip() for c in line.strip().strip("|").split("|")]


def md_inline_to_html(text):
    text = text.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;")
    text = re.sub(r"`([^`]+)`", r'<font name="Courier" size="9">\1</font>', text)
    text = re.sub(r"\*\*([^*]+)\*\*", r"<b>\1</b>", text)
    return text


def build_table(header, rows, available_width):
    n_cols = len(header)
    if n_cols == 2:
        col_widths = [available_width * 0.5, available_width * 0.5]
    elif n_cols == 3:
        col_widths = [available_width * 0.40, available_width * 0.30, available_width * 0.30]
    else:
        col_widths = [available_width / n_cols] * n_cols
    data = [[Paragraph(md_inline_to_html(c), TABLE_HEADER) for c in header]]
    for row in rows:
        while len(row) < n_cols:
            row.append("")
        row = row[:n_cols]
        data.append([Paragraph(md_inline_to_html(c), TABLE_CELL) for c in row])
    t = Table(data, colWidths=col_widths, repeatRows=1)
    style = [
        ("BACKGROUND", (0, 0), (-1, 0), TABLE_HEADER_BG),
        ("BOX", (0, 0), (-1, -1), 0.6, TABLE_BORDER),
        ("INNERGRID", (0, 0), (-1, -1), 0.4, TABLE_BORDER),
        ("VALIGN", (0, 0), (-1, -1), "TOP"),
        ("LEFTPADDING", (0, 0), (-1, -1), 6), ("RIGHTPADDING", (0, 0), (-1, -1), 6),
        ("TOPPADDING", (0, 0), (-1, -1), 6), ("BOTTOMPADDING", (0, 0), (-1, -1), 6),
    ]
    for r in range(2, len(data), 2):
        style.append(("BACKGROUND", (0, r), (-1, r), TABLE_ROW_ALT))
    t.setStyle(TableStyle(style))
    return t


def on_page(canv, doc):
    canv.saveState()
    width, height = A4
    if doc.page > 1:
        canv.setStrokeColor(PRIMARY); canv.setLineWidth(0.8)
        canv.line(20 * mm, height - 18 * mm, width - 20 * mm, height - 18 * mm)
        canv.setFillColor(PRIMARY_DARK); canv.setFont("Helvetica-Bold", 8.5)
        canv.drawString(20 * mm, height - 15 * mm, "Relatório de Performance e Impacto - IA de Suporte Falcão das Milhas")
    canv.setFillColor(TEXT_MUTED); canv.setFont("Helvetica", 8)
    canv.drawString(20 * mm, 12 * mm, "Relatório gerado em 30/06/2026 · Análise de IA · AWSales · Falcão das Milhas")
    canv.drawRightString(width - 20 * mm, 12 * mm, f"Página {doc.page}")
    canv.restoreState()


def build_doc(blocks):
    doc = BaseDocTemplate(PDF_PATH, pagesize=A4, leftMargin=20 * mm, rightMargin=20 * mm, topMargin=20 * mm, bottomMargin=18 * mm,
                          title="Relatório de Performance e Impacto - IA de Suporte Falcão das Milhas", author="AWSales")
    frame_first = Frame(doc.leftMargin, doc.bottomMargin, doc.width, doc.height, id="first", showBoundary=0)
    frame_other = Frame(doc.leftMargin, doc.bottomMargin, doc.width, doc.height - 8 * mm, id="other", showBoundary=0)
    doc.addPageTemplates([
        PageTemplate(id="first", frames=[frame_first], onPage=on_page),
        PageTemplate(id="later", frames=[frame_other], onPage=on_page),
    ])
    available_width = doc.width
    story = []
    story.append(Paragraph("AWSALES · RELATÓRIO DE PERFORMANCE E IMPACTO", HEADER_KICKER))
    story.append(Paragraph("Agente de Atendimento IA — Campanha de Suporte Falcão das Milhas", TITLE))
    story.append(Paragraph("Período analisado: 01/06/2026 a 30/06/2026 · Mês fechado de junho", SUBTITLE))
    story.append(build_cards_grid())
    story.append(Spacer(1, 14))
    for kind, content in blocks:
        if kind == "h1":
            continue
        if kind == "para" and (content.startswith("Período analisado") or content.startswith("Campanha:") or content.startswith("Objetivo:") or content.startswith("Relatório gerado em")):
            continue
        if kind == "h2":
            story.append(Paragraph(md_inline_to_html(content), SECTION_TITLE))
        elif kind == "h3":
            story.append(Paragraph(md_inline_to_html(content), SUB_TITLE))
        elif kind == "para":
            story.append(Paragraph(md_inline_to_html(content), BODY))
        elif kind == "table":
            story.append(KeepTogether([build_table(content["header"], content["rows"], available_width)]))
            story.append(Spacer(1, 6))
    doc.build(story)


def main():
    with open(MD_PATH, "r", encoding="utf-8") as f:
        md_text = f.read()
    build_doc(parse_md(md_text))
    print(f"OK: {PDF_PATH}")


if __name__ == "__main__":
    main()
