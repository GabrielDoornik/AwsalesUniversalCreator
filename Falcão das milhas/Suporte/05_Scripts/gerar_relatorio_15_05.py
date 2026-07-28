"""Gera PDF do relatório de performance 15-05."""

from __future__ import annotations

import html
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
)
from reportlab.pdfgen import canvas


BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MD_PATH = os.path.join(
    BASE_DIR, "Relatório de Performance - Suporte Falcão das Milhas - 15-05.md"
)
PDF_PATH = os.path.join(
    BASE_DIR, "Relatório de Performance - Suporte Falcão das Milhas - 15-05.pdf"
)

PRIMARY = colors.HexColor("#1E55B8")
PRIMARY_DARK = colors.HexColor("#163F8C")
TEXT_DARK = colors.HexColor("#1F2937")
TEXT_MUTED = colors.HexColor("#4B5563")
TEXT_LABEL = colors.HexColor("#6B7280")
CARD_BORDER = colors.HexColor("#E5E7EB")
TABLE_ROW_ALT = colors.HexColor("#F9FAFB")
TABLE_BORDER = colors.HexColor("#E5E7EB")
GREEN = colors.HexColor("#16A34A")
RED = colors.HexColor("#DC2626")

styles = getSampleStyleSheet()

HEADER_KICKER = ParagraphStyle(
    "HeaderKicker",
    parent=styles["Normal"],
    fontName="Helvetica-Bold",
    fontSize=10,
    textColor=PRIMARY,
    leading=12,
    spaceAfter=4,
)

TITLE = ParagraphStyle(
    "TitleCustom",
    parent=styles["Title"],
    fontName="Helvetica-Bold",
    fontSize=22,
    textColor=TEXT_DARK,
    leading=26,
    spaceAfter=8,
    alignment=0,
)

SUBTITLE = ParagraphStyle(
    "Subtitle",
    parent=styles["Normal"],
    fontName="Helvetica",
    fontSize=10,
    textColor=TEXT_MUTED,
    leading=14,
    spaceAfter=18,
)

SECTION_TITLE = ParagraphStyle(
    "SectionTitle",
    parent=styles["Heading2"],
    fontName="Helvetica-Bold",
    fontSize=15,
    textColor=PRIMARY,
    leading=20,
    spaceBefore=16,
    spaceAfter=8,
)

BODY = ParagraphStyle(
    "Body",
    parent=styles["Normal"],
    fontName="Helvetica",
    fontSize=10,
    textColor=TEXT_DARK,
    leading=14,
    spaceAfter=8,
)

BULLET = ParagraphStyle(
    "Bullet",
    parent=BODY,
    leftIndent=10,
    firstLineIndent=0,
    bulletIndent=0,
    spaceAfter=5,
)

CARD_LABEL = ParagraphStyle(
    "CardLabel",
    parent=styles["Normal"],
    fontName="Helvetica-Bold",
    fontSize=7.5,
    textColor=TEXT_LABEL,
    leading=10,
    alignment=1,
    spaceAfter=4,
)

CARD_VALUE_BLUE = ParagraphStyle(
    "CardValueBlue",
    parent=styles["Normal"],
    fontName="Helvetica-Bold",
    fontSize=19,
    textColor=PRIMARY,
    leading=23,
    alignment=1,
    spaceAfter=4,
)

CARD_VALUE_GREEN = ParagraphStyle(
    "CardValueGreen",
    parent=CARD_VALUE_BLUE,
    textColor=GREEN,
)

CARD_VALUE_RED = ParagraphStyle(
    "CardValueRed",
    parent=CARD_VALUE_BLUE,
    textColor=RED,
)

CARD_VALUE_DARK = ParagraphStyle(
    "CardValueDark",
    parent=CARD_VALUE_BLUE,
    textColor=TEXT_DARK,
)

CARD_HINT = ParagraphStyle(
    "CardHint",
    parent=styles["Normal"],
    fontName="Helvetica",
    fontSize=7.5,
    textColor=TEXT_MUTED,
    leading=10,
    alignment=1,
)

TABLE_CELL = ParagraphStyle(
    "TableCell",
    parent=styles["Normal"],
    fontName="Helvetica",
    fontSize=8.5,
    textColor=TEXT_DARK,
    leading=11,
)

TABLE_HEADER = ParagraphStyle(
    "TableHeader",
    parent=styles["Normal"],
    fontName="Helvetica-Bold",
    fontSize=8.5,
    textColor=colors.white,
    leading=11,
)

CARDS = [
    {
        "label": "CONVERSAS ANALISADAS",
        "value": "294",
        "value_style": CARD_VALUE_DARK,
        "hint": "IA 140 · Humano 119",
    },
    {
        "label": "RESOLUÇÃO PELA IA",
        "value": "47,6%",
        "value_style": CARD_VALUE_BLUE,
        "hint": "antes era 29%",
    },
    {
        "label": "CSAT MÉDIO",
        "value": "4,56/5",
        "value_style": CARD_VALUE_GREEN,
        "hint": "satisfação positiva",
    },
    {
        "label": "INTERVENÇÃO HUMANA",
        "value": "40,5%",
        "value_style": CARD_VALUE_RED,
        "hint": "antes era 66,7%",
    },
    {
        "label": "COBERTURA DA BASE",
        "value": "85,5%",
        "value_style": CARD_VALUE_BLUE,
        "hint": "leve melhora",
    },
]


def normalize_text(text: str) -> str:
    replacements = {
        "—": "-",
        "–": "-",
        "“": '"',
        "”": '"',
        "‘": "'",
        "’": "'",
        "\u00a0": " ",
    }
    for old, new in replacements.items():
        text = text.replace(old, new)
    return text


def inline_md(text: str) -> str:
    text = normalize_text(text)
    text = html.escape(text)
    text = re.sub(r"`([^`]+)`", r'<font name="Courier" size="8">\1</font>', text)
    text = re.sub(r"\*\*([^*]+)\*\*", r"<b>\1</b>", text)
    return text


def parse_row(line: str) -> list[str]:
    return [cell.strip() for cell in line.strip().strip("|").split("|")]


def parse_md(md_text: str):
    lines = md_text.splitlines()
    blocks = []
    i = 0
    while i < len(lines):
        s = lines[i].strip()
        if not s:
            i += 1
            continue
        if s.startswith("# "):
            blocks.append(("h1", s[2:].strip()))
            i += 1
            continue
        if s.startswith("## "):
            blocks.append(("h2", s[3:].strip()))
            i += 1
            continue
        if s.startswith("- "):
            items = []
            while i < len(lines) and lines[i].strip().startswith("- "):
                items.append(lines[i].strip()[2:].strip())
                i += 1
            blocks.append(("list", items))
            continue
        if s.startswith("|") and i + 1 < len(lines) and re.match(
            r"^\s*\|[\s\-:|]+\|\s*$", lines[i + 1]
        ):
            header = parse_row(s)
            i += 2
            rows = []
            while i < len(lines) and lines[i].lstrip().startswith("|"):
                rows.append(parse_row(lines[i]))
                i += 1
            blocks.append(("table", {"header": header, "rows": rows}))
            continue
        para_lines = [s]
        i += 1
        while (
            i < len(lines)
            and lines[i].strip()
            and not lines[i].strip().startswith("#")
            and not lines[i].strip().startswith("- ")
            and not lines[i].lstrip().startswith("|")
        ):
            para_lines.append(lines[i].strip())
            i += 1
        blocks.append(("para", " ".join(para_lines)))
    return blocks


def build_card(card):
    contents = [
        Paragraph(inline_md(card["label"]), CARD_LABEL),
        Paragraph(inline_md(card["value"]), card["value_style"]),
        Paragraph(inline_md(card["hint"]), CARD_HINT),
    ]
    table = Table([[c] for c in contents], colWidths=[33 * mm])
    table.setStyle(
        TableStyle(
            [
                ("BOX", (0, 0), (-1, -1), 0.6, CARD_BORDER),
                ("LEFTPADDING", (0, 0), (-1, -1), 6),
                ("RIGHTPADDING", (0, 0), (-1, -1), 6),
                ("TOPPADDING", (0, 0), (-1, -1), 4),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 4),
                ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
            ]
        )
    )
    return table


def build_cards_grid():
    table = Table([[build_card(card) for card in CARDS]], colWidths=[34 * mm] * 5)
    table.setStyle(
        TableStyle(
            [
                ("VALIGN", (0, 0), (-1, -1), "TOP"),
                ("LEFTPADDING", (0, 0), (-1, -1), 0),
                ("RIGHTPADDING", (0, 0), (-1, -1), 4),
            ]
        )
    )
    return table


def col_widths(n_cols: int, available_width: float):
    if n_cols == 2:
        return [available_width * 0.34, available_width * 0.66]
    if n_cols == 3:
        return [available_width * 0.25, available_width * 0.22, available_width * 0.53]
    if n_cols == 4:
        return [available_width * 0.25, available_width * 0.18, available_width * 0.2, available_width * 0.37]
    return [available_width / n_cols] * n_cols


def build_table(header, rows, available_width):
    n_cols = len(header)
    data = [[Paragraph(inline_md(cell), TABLE_HEADER) for cell in header]]
    for row in rows:
        row = (row + [""] * n_cols)[:n_cols]
        data.append([Paragraph(inline_md(cell), TABLE_CELL) for cell in row])
    table = Table(data, colWidths=col_widths(n_cols, available_width), repeatRows=1)
    style = [
        ("BACKGROUND", (0, 0), (-1, 0), PRIMARY),
        ("BOX", (0, 0), (-1, -1), 0.6, TABLE_BORDER),
        ("INNERGRID", (0, 0), (-1, -1), 0.4, TABLE_BORDER),
        ("VALIGN", (0, 0), (-1, -1), "TOP"),
        ("LEFTPADDING", (0, 0), (-1, -1), 5),
        ("RIGHTPADDING", (0, 0), (-1, -1), 5),
        ("TOPPADDING", (0, 0), (-1, -1), 5),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 5),
    ]
    for row_idx in range(2, len(data), 2):
        style.append(("BACKGROUND", (0, row_idx), (-1, row_idx), TABLE_ROW_ALT))
    table.setStyle(TableStyle(style))
    return table


def on_page(canv: canvas.Canvas, doc):
    canv.saveState()
    width, height = A4
    if doc.page > 1:
        canv.setStrokeColor(PRIMARY)
        canv.setLineWidth(0.8)
        canv.line(20 * mm, height - 18 * mm, width - 20 * mm, height - 18 * mm)
        canv.setFillColor(PRIMARY_DARK)
        canv.setFont("Helvetica-Bold", 8.5)
        canv.drawString(
            20 * mm,
            height - 15 * mm,
            "Relatório de Performance - Suporte Falcão das Milhas",
        )
    canv.setFillColor(TEXT_MUTED)
    canv.setFont("Helvetica", 8)
    canv.drawString(
        20 * mm,
        12 * mm,
        "Relatório gerado em 15/05/2026 · Análise de IA · Awsales · Falcão das Milhas",
    )
    canv.drawRightString(width - 20 * mm, 12 * mm, f"Página {doc.page}")
    canv.restoreState()


def build_pdf(blocks):
    doc = BaseDocTemplate(
        PDF_PATH,
        pagesize=A4,
        leftMargin=20 * mm,
        rightMargin=20 * mm,
        topMargin=20 * mm,
        bottomMargin=18 * mm,
        title="Relatório de Performance - Suporte Falcão das Milhas",
        author="Awsales",
    )
    frame_first = Frame(doc.leftMargin, doc.bottomMargin, doc.width, doc.height, id="first")
    frame_other = Frame(doc.leftMargin, doc.bottomMargin, doc.width, doc.height - 8 * mm, id="other")
    doc.addPageTemplates(
        [
            PageTemplate(id="first", frames=[frame_first], onPage=on_page),
            PageTemplate(id="later", frames=[frame_other], onPage=on_page),
        ]
    )

    story = [
        Paragraph("AWSALES · RELATÓRIO DE PERFORMANCE", HEADER_KICKER),
        Paragraph("Agente de Atendimento IA - Suporte Falcão das Milhas", TITLE),
        Paragraph(
            "Período analisado: 15/04/2026 a 15/05/2026 · Campanha: IA de Suporte - Falcão das Milhas",
            SUBTITLE,
        ),
        build_cards_grid(),
        Spacer(1, 14),
    ]

    for kind, content in blocks:
        if kind == "h1":
            continue
        if kind == "para" and (
            content.startswith("Período analisado:")
            or content.startswith("Campanha:")
        ):
            continue
        if kind == "h2":
            story.append(Paragraph(inline_md(content), SECTION_TITLE))
        elif kind == "para":
            story.append(Paragraph(inline_md(content), BODY))
        elif kind == "list":
            for item in content:
                story.append(Paragraph(inline_md(item), BULLET, bulletText="•"))
        elif kind == "table":
            story.append(build_table(content["header"], content["rows"], doc.width))
            story.append(Spacer(1, 6))

    doc.build(story)


def main():
    with open(MD_PATH, "r", encoding="utf-8") as file:
        md_text = file.read()
    build_pdf(parse_md(md_text))
    print(PDF_PATH)


if __name__ == "__main__":
    main()
