# -*- coding: utf-8 -*-
from reportlab.lib.pagesizes import A4
from reportlab.lib.units import mm
from reportlab.lib import colors
from reportlab.lib.styles import ParagraphStyle
from reportlab.platypus import (BaseDocTemplate, PageTemplate, Frame, Paragraph,
                                Spacer, ListFlowable, ListItem, HRFlowable, Table, TableStyle)
from reportlab.lib.enums import TA_LEFT, TA_JUSTIFY

# ---- Brand palette (AWSales: azul + preto) ----
TEAL      = colors.HexColor("#1668E3")   # AWSales blue — primary accent
TEAL_DARK = colors.HexColor("#0B3A86")   # deep blue — heading text / accent line
BLACK     = colors.HexColor("#111317")   # brand black — header band
INK       = colors.HexColor("#1A1D21")   # body text
MUTED     = colors.HexColor("#6B7280")
LIGHT     = colors.HexColor("#EAF1FB")   # light blue fill
RULE      = colors.HexColor("#D2DEEF")   # light blue-gray rules

OUT = "Relatorio - Otimizacao Campanha SDR D'Leon.pdf"

PAGE_W, PAGE_H = A4
LM = RM = 20 * mm
TM = 34 * mm   # leave room for header band
BM = 18 * mm

# ---- Styles ----
def style(name, **kw):
    base = dict(fontName="Helvetica", fontSize=10.5, leading=15.5, textColor=INK)
    base.update(kw)
    return ParagraphStyle(name, **base)

S_body   = style("body", alignment=TA_JUSTIFY)
S_intro  = style("intro", fontSize=11, leading=16, textColor=INK, alignment=TA_JUSTIFY)
S_h2     = style("h2", fontName="Helvetica-Bold", fontSize=13, leading=16, textColor=TEAL_DARK, spaceBefore=4, spaceAfter=2)
S_kicker = style("kicker", fontName="Helvetica-Bold", fontSize=8.5, leading=11, textColor=TEAL)
S_bullet = style("bullet", fontSize=10.5, leading=15, textColor=INK)
S_label  = S_body  # labels are inline bold via <b>
S_foot   = style("foot", fontSize=8, leading=10, textColor=MUTED)

def P(txt, st=S_body):
    return Paragraph(txt, st)

def bullets(items):
    return ListFlowable(
        [ListItem(P(t, S_bullet), value="•", leftIndent=12) for t in items],
        bulletType="bullet", start="•", leftIndent=10, bulletColor=TEAL,
        spaceBefore=2, spaceAfter=2,
    )

def section(num, title):
    flow = []
    flow.append(Spacer(1, 7))
    head = f"{num}. {title}" if num else title
    flow.append(P(head, S_h2))
    flow.append(HRFlowable(width="100%", thickness=0.8, color=RULE,
                           spaceBefore=2, spaceAfter=5))
    return flow

def labeled(label, text):
    return P(f'<font color="#1668E3"><b>{label}:</b></font> {text}', S_body)

# ---- Header / footer on every page ----
def header_footer(canvas, doc):
    canvas.saveState()
    # top brand band
    band_h = 22 * mm
    canvas.setFillColor(BLACK)
    canvas.rect(0, PAGE_H - band_h, PAGE_W, band_h, stroke=0, fill=1)
    # thin accent line under band (AWSales blue)
    canvas.setFillColor(TEAL)
    canvas.rect(0, PAGE_H - band_h - 1.5*mm, PAGE_W, 1.5*mm, stroke=0, fill=1)
    # band texts
    canvas.setFillColor(colors.white)
    canvas.setFont("Helvetica-Bold", 14)
    canvas.drawString(LM, PAGE_H - 12*mm, "Plano de Ação — Campanha SDR")
    canvas.setFont("Helvetica", 9.5)
    canvas.drawString(LM, PAGE_H - 17.5*mm, "Lentes de Porcelana  ·  Clínica D'Leon — Dr. Lucas Firmino")
    # Awsales wordmark, top-right (Aw azul + sales branco)
    wm_size = 16
    canvas.setFont("Helvetica-Bold", wm_size)
    aw_w = canvas.stringWidth("Aw", "Helvetica-Bold", wm_size)
    sales_w = canvas.stringWidth("sales", "Helvetica-Bold", wm_size)
    x0 = PAGE_W - RM - (aw_w + sales_w)
    canvas.setFillColor(TEAL)
    canvas.drawString(x0, PAGE_H - 13.5*mm, "Aw")
    canvas.setFillColor(colors.white)
    canvas.drawString(x0 + aw_w, PAGE_H - 13.5*mm, "sales")
    # footer
    canvas.setFillColor(MUTED)
    canvas.setFont("Helvetica", 8)
    canvas.drawString(LM, 10*mm, "Plano de ação · campanha 2026 O Ano da Transformação · análise de conversas reais")
    canvas.drawRightString(PAGE_W - RM, 10*mm, f"Página {doc.page}")
    canvas.setStrokeColor(RULE)
    canvas.setLineWidth(0.6)
    canvas.line(LM, 13*mm, PAGE_W - RM, 13*mm)
    canvas.restoreState()

# ---- Document ----
doc = BaseDocTemplate(OUT, pagesize=A4,
                      leftMargin=LM, rightMargin=RM, topMargin=TM, bottomMargin=BM,
                      title="Plano de Ação — Campanha SDR Lentes D'Leon",
                      author="AWSales")
frame = Frame(LM, BM, PAGE_W - LM - RM, PAGE_H - TM - BM, id="main")
doc.addPageTemplates([PageTemplate(id="all", frames=[frame], onPage=header_footer)])

story = []

# Objective callout box
obj_tbl = Table([[P('<b>Objetivo único:</b> aumentar o número de leads que agendam a avaliação presencial gratuita.',
                    style("obj", fontSize=11, leading=15, textColor=TEAL_DARK))]],
                colWidths=[PAGE_W - LM - RM])
obj_tbl.setStyle(TableStyle([
    ("BACKGROUND", (0,0), (-1,-1), LIGHT),
    ("BOX", (0,0), (-1,-1), 0, LIGHT),
    ("LEFTPADDING", (0,0), (-1,-1), 12),
    ("RIGHTPADDING", (0,0), (-1,-1), 12),
    ("TOPPADDING", (0,0), (-1,-1), 9),
    ("BOTTOMPADDING", (0,0), (-1,-1), 9),
    ("LINEBEFORE", (0,0), (0,-1), 3, TEAL),
]))
story.append(Spacer(1, 2))
story.append(obj_tbl)
story.append(Spacer(1, 10))

# Base da análise
story += section("", "Base da análise")
story[-1]  # noop
story.append(P("Lemos as conversas reais da campanha, lead a lead. Os ajustes abaixo saem direto desse comportamento observado, não de suposição.", S_intro))
story.append(Spacer(1, 4))
story.append(bullets([
    "<b>252 leads</b> únicos e <b>3.561 mensagens</b> analisadas.",
    "<b>164 leads</b> entraram com a mensagem padrão do anúncio.",
    "O que os leads mais trazem: dor estética com o sorriso <b>(125)</b>, preço e parcelamento <b>(101)</b>, "
    "agendamento e horário <b>(65)</b>, dúvida técnica sobre o procedimento <b>(62)</b>, localização e distância <b>(47)</b>, o Dr. Lucas <b>(15)</b>.",
    "<b>Ponto central:</b> cerca de <b>30% dos leads (76)</b> enviaram apenas a mensagem inicial e não avançaram na conversa. "
    "É a maior oportunidade de ganho — destravar esse começo puxa mais gente para o agendamento.",
]))
story.append(Spacer(1, 4))
story.append(P("A campanha atrai interesse real. O foco das evoluções é converter mais desse interesse em avaliação agendada.", S_body))

# fix the section() header for "Base da análise" (it was added with empty number) -> rebuild cleanly
# (handled below by not using number prefix)

# Section 1
story += section("1", "Primeira mensagem mais fácil de responder")
story.append(labeled("O que vimos", "a maior concentração de leads que param acontece logo no início, justamente entre os que entram com a mensagem genérica do anúncio (164 leads) e os 30% que não passam da primeira troca."))
story.append(Spacer(1, 3))
story.append(labeled("Ajuste", "abrir com uma escolha simples em vez de uma pergunta ampla:"))
quote = Table([[P('“Hoje você pensa mais em melhorar a cor, o formato/tamanho ou os espaços entre os dentes?”',
                  style("q", fontSize=10.5, leading=14, textColor=TEAL_DARK))]],
              colWidths=[PAGE_W - LM - RM - 8])
quote.setStyle(TableStyle([
    ("BACKGROUND", (0,0), (-1,-1), LIGHT),
    ("LEFTPADDING", (0,0), (-1,-1), 12), ("RIGHTPADDING", (0,0), (-1,-1), 12),
    ("TOPPADDING", (0,0), (-1,-1), 7), ("BOTTOMPADDING", (0,0), (-1,-1), 7),
    ("LINEBEFORE", (0,0), (0,-1), 3, TEAL),
]))
story.append(Spacer(1, 3)); story.append(quote); story.append(Spacer(1, 3))
story.append(labeled("Por quê", "a escolha exige menos esforço que uma pergunta aberta. Mais leads respondem e seguem para o agendamento."))

# Section 2
story += section("2", "Todo lead com interesse real vai para a avaliação")
story.append(labeled("O que vimos", "27 leads citaram cárie, dente quebrado ou perda de dentes. São pessoas com intenção que não podem ser descartadas nem receber promessa de resultado."))
story.append(Spacer(1, 3))
story.append(labeled("Ajuste", "nesses casos a atendente não promete resultado, mas conduz para a avaliação gratuita, onde o profissional define o melhor plano. Nenhum lead com intenção é perdido por dúvida — todos viram oportunidade de agenda."))

# Section 3
story += section("3", "O atendimento do Dr. Lucas como diferencial")
story.append(labeled("O que vimos", "15 leads citaram ou perguntaram pelo Dr. Lucas. É um atrativo claro da campanha."))
story.append(Spacer(1, 3))
story.append(labeled("Ajuste", "manter e destacar. Quando o lead demonstra interesse, a atendente reforça que ele pode pedir a presença do Dr. Lucas na avaliação. Isso aumenta o desejo de comparecer e ajuda a fechar o agendamento."))

# Section 4
story += section("4", "Distância tratada como logística, não como “não”")
story.append(labeled("O que vimos", "47 leads tocaram em localização, distância ou logística, vários de fora de BH e alguns que só conseguem sábado."))
story.append(Spacer(1, 3))
story.append(labeled("Ajuste", "quem é de fora não é descartado de cara. A atendente pergunta se há alguma data em que o lead venha a BH e segue para o agendamento quando houver possibilidade. Encerra apenas quando não há mesmo como comparecer."))

# Section 5
story += section("5", "Follow-up sempre puxando o próximo passo")
story.append(labeled("O que vimos", "preço (101 leads) e horário (65 leads) são as pendências concretas mais comuns — ganchos perfeitos para retomar a conversa."))
story.append(Spacer(1, 3))
story.append(labeled("Ajuste", "cada follow-up retoma exatamente o ponto onde o lead parou (valor, foto, horário ou distância) e leva direto ao agendamento. O objetivo de toda retomada é marcar a avaliação."))

# What we keep
story += section("", "O que mantemos igual")
story.append(bullets([
    "Avaliação gratuita como porta de entrada.",
    "Prova social ao longo da conversa.",
    "Preço apenas quando o lead pergunta; negociação só na clínica.",
    "Posicionamento da campanha 2026 O Ano da Transformação.",
]))

# Align
story += section("", "Para alinhar (rápido)")
story.append(bullets([
    "A clínica pode priorizar horários de sábado para leads que vêm de fora de BH? Isso aumenta o agendamento desse perfil (47 leads tocaram em distância).",
]))

# Next step
story += section("", "Próximo passo")
story.append(P("Aplicamos os ajustes e medimos os agendamentos na sequência para comparar a evolução.", S_body))

doc.build(story)
print("OK ->", OUT)
