"""
Gera PDF da auditoria Traffic Masters - Tocks Custom
"""
import re
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.colors import HexColor, black, white
from reportlab.lib.units import mm, cm
from reportlab.lib.enums import TA_LEFT, TA_CENTER, TA_JUSTIFY
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle,
    PageBreak, HRFlowable, KeepTogether
)

# ── Colors ──
DARK = HexColor("#1a1a2e")
ACCENT = HexColor("#e94560")
ACCENT_LIGHT = HexColor("#fce4ec")
BLUE = HexColor("#0f3460")
BLUE_LIGHT = HexColor("#e3f2fd")
GREEN = HexColor("#2e7d32")
GREEN_LIGHT = HexColor("#e8f5e9")
YELLOW = HexColor("#f57f17")
YELLOW_LIGHT = HexColor("#fff8e1")
RED = HexColor("#c62828")
RED_LIGHT = HexColor("#ffebee")
GRAY = HexColor("#616161")
GRAY_LIGHT = HexColor("#f5f5f5")
GRAY_BORDER = HexColor("#e0e0e0")
WHITE = white

# ── Styles ──
styles = getSampleStyleSheet()

styles.add(ParagraphStyle(
    'DocTitle', parent=styles['Title'],
    fontSize=22, textColor=DARK, spaceAfter=4*mm,
    fontName='Helvetica-Bold', alignment=TA_CENTER
))
styles.add(ParagraphStyle(
    'DocSubtitle', parent=styles['Normal'],
    fontSize=11, textColor=GRAY, alignment=TA_CENTER,
    spaceAfter=8*mm
))
styles.add(ParagraphStyle(
    'H1', parent=styles['Heading1'],
    fontSize=16, textColor=DARK, spaceBefore=10*mm, spaceAfter=4*mm,
    fontName='Helvetica-Bold', borderWidth=0, borderPadding=0,
    borderColor=ACCENT, leftIndent=0
))
styles.add(ParagraphStyle(
    'H2', parent=styles['Heading2'],
    fontSize=13, textColor=BLUE, spaceBefore=7*mm, spaceAfter=3*mm,
    fontName='Helvetica-Bold'
))
styles.add(ParagraphStyle(
    'H3', parent=styles['Heading3'],
    fontSize=11, textColor=ACCENT, spaceBefore=5*mm, spaceAfter=2*mm,
    fontName='Helvetica-Bold'
))
styles.add(ParagraphStyle(
    'BodyText2', parent=styles['Normal'],
    fontSize=9.5, textColor=HexColor("#333333"), leading=14,
    spaceAfter=2*mm, alignment=TA_JUSTIFY
))
styles.add(ParagraphStyle(
    'BulletItem', parent=styles['Normal'],
    fontSize=9.5, textColor=HexColor("#333333"), leading=14,
    leftIndent=12*mm, bulletIndent=6*mm, spaceAfter=1.5*mm
))
styles.add(ParagraphStyle(
    'CodeBlock', parent=styles['Normal'],
    fontSize=8.5, fontName='Courier', textColor=HexColor("#263238"),
    backColor=GRAY_LIGHT, leftIndent=4*mm, rightIndent=4*mm,
    spaceBefore=2*mm, spaceAfter=2*mm, leading=12,
    borderWidth=0.5, borderColor=GRAY_BORDER, borderPadding=6
))
styles.add(ParagraphStyle(
    'AlertRed', parent=styles['Normal'],
    fontSize=9.5, textColor=RED, fontName='Helvetica-Bold',
    backColor=RED_LIGHT, leftIndent=4*mm, rightIndent=4*mm,
    spaceBefore=2*mm, spaceAfter=2*mm, leading=13, borderPadding=6
))
styles.add(ParagraphStyle(
    'CellNormal', parent=styles['Normal'],
    fontSize=8, leading=10, textColor=HexColor("#333333")
))
styles.add(ParagraphStyle(
    'CellBold', parent=styles['Normal'],
    fontSize=8, leading=10, textColor=DARK, fontName='Helvetica-Bold'
))
styles.add(ParagraphStyle(
    'CellHeader', parent=styles['Normal'],
    fontSize=8, leading=10, textColor=WHITE, fontName='Helvetica-Bold'
))
styles.add(ParagraphStyle(
    'Footer', parent=styles['Normal'],
    fontSize=7.5, textColor=GRAY, alignment=TA_CENTER
))

def clean(text):
    """Clean markdown formatting for PDF paragraphs."""
    text = re.sub(r'\*\*(.+?)\*\*', r'<b>\1</b>', text)
    text = re.sub(r'`(.+?)`', r'<font face="Courier" size="8">\1</font>', text)
    text = text.replace('—', '&mdash;').replace('→', '&rarr;')
    text = text.replace('←', '&larr;').replace('×', '&times;')
    # Remove markdown links
    text = re.sub(r'\[(.+?)\]\(.+?\)', r'\1', text)
    return text

def make_table(headers, rows, col_widths=None):
    """Create a styled table."""
    page_width = A4[0] - 30*mm

    header_cells = [Paragraph(clean(h), styles['CellHeader']) for h in headers]
    data = [header_cells]

    for row in rows:
        cells = []
        for i, cell in enumerate(row):
            cell_text = clean(cell.strip()) if cell else ""
            style = styles['CellBold'] if i == 0 else styles['CellNormal']
            cells.append(Paragraph(cell_text, style))
        data.append(cells)

    ncols = len(headers)
    if col_widths:
        widths = col_widths
    else:
        widths = [page_width / ncols] * ncols

    t = Table(data, colWidths=widths, repeatRows=1)
    t.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), BLUE),
        ('TEXTCOLOR', (0, 0), (-1, 0), WHITE),
        ('FONTSIZE', (0, 0), (-1, 0), 8),
        ('BOTTOMPADDING', (0, 0), (-1, 0), 6),
        ('TOPPADDING', (0, 0), (-1, 0), 6),
        ('BACKGROUND', (0, 1), (-1, -1), WHITE),
        ('ROWBACKGROUNDS', (0, 1), (-1, -1), [WHITE, GRAY_LIGHT]),
        ('GRID', (0, 0), (-1, -1), 0.5, GRAY_BORDER),
        ('VALIGN', (0, 0), (-1, -1), 'TOP'),
        ('LEFTPADDING', (0, 0), (-1, -1), 4),
        ('RIGHTPADDING', (0, 0), (-1, -1), 4),
        ('TOPPADDING', (0, 1), (-1, -1), 4),
        ('BOTTOMPADDING', (0, 1), (-1, -1), 4),
    ]))
    return t

def parse_md_table(lines):
    """Parse markdown table lines into headers and rows."""
    headers = []
    rows = []
    for i, line in enumerate(lines):
        cells = [c.strip() for c in line.strip().strip('|').split('|')]
        if i == 0:
            headers = cells
        elif i == 1:
            continue  # separator line
        else:
            # Pad row to match headers
            while len(cells) < len(headers):
                cells.append("")
            rows.append(cells[:len(headers)])
    return headers, rows

def build_pdf():
    output_path = "D:/AIOS/docs/ads-data/tocks/auditoria-traffic-masters-2026-04-10.pdf"

    doc = SimpleDocTemplate(
        output_path, pagesize=A4,
        leftMargin=15*mm, rightMargin=15*mm,
        topMargin=18*mm, bottomMargin=18*mm,
        title="Auditoria Completa - Tocks Custom",
        author="Traffic Masters Squad"
    )

    story = []

    # Read source
    with open("D:/AIOS/docs/ads-data/tocks/auditoria-traffic-masters-2026-04-10.md", "r", encoding="utf-8") as f:
        content = f.read()

    lines = content.split('\n')

    # ── Cover / Header ──
    story.append(Spacer(1, 10*mm))
    story.append(HRFlowable(width="100%", thickness=2, color=ACCENT))
    story.append(Spacer(1, 4*mm))
    story.append(Paragraph("AUDITORIA COMPLETA", styles['DocTitle']))
    story.append(Paragraph("TOCKS CUSTOM", styles['DocTitle']))
    story.append(Spacer(1, 2*mm))
    story.append(Paragraph(
        "Data: 2026-04-10 | Periodo: Ultimos 30 dias (marco-abril 2026)<br/>"
        "Budget total: R$2.888/mes (~R$96/dia) | Squad: Traffic Masters (7 especialistas)<br/>"
        "Baseline: Diagnostico anterior de 2026-03-24 (budget era R$155/dia)",
        styles['DocSubtitle']
    ))
    story.append(Spacer(1, 2*mm))
    story.append(HRFlowable(width="100%", thickness=2, color=ACCENT))
    story.append(Spacer(1, 8*mm))

    # ── Score Box ──
    score_data = [
        ["Dimensao", "Score", "Peso", "Comentario"],
        ["Estrutura de conta Google", "4/10", "20%", "16 campanhas, 14 pausadas - poluicao legado"],
        ["Estrutura de conta Meta", "3/10", "20%", "18 campanhas, 15 pausadas - fragmentacao severa"],
        ["Tracking e atribuicao", "1/10", "25%", "ROAS 0,00 - sem valor de conversao, cego total"],
        ["Quality Score Google", "2/10", "15%", "QS 0-3 em 90%+ das keywords - critico"],
        ["Budget allocation", "4/10", "10%", "PMAX come 87% do Google, Search subcapitalizada"],
        ["Criativos", "6/10", "10%", "RSAs bons, Meta precisa teste sistematico"],
    ]

    story.append(Paragraph("SCORE GERAL: 3.8 / 10", styles['H1']))

    pw = A4[0] - 30*mm
    score_table = make_table(
        score_data[0], score_data[1:],
        col_widths=[pw*0.25, pw*0.08, pw*0.08, pw*0.59]
    )
    # Color-code the tracking row red
    score_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 3), (-1, 3), RED_LIGHT),
    ]))
    story.append(score_table)
    story.append(Spacer(1, 2*mm))
    story.append(Paragraph(
        clean("**Variacao vs diagnostico anterior (24/mar):** Budget caiu 38% (R$155 -> R$96/dia). Problemas estruturais de tracking PERSISTEM. Quality Scores degradaram."),
        styles['BodyText2']
    ))

    # ── Process remaining lines ──
    i = 22  # skip already-processed header/score section
    in_code_block = False
    code_lines = []
    table_lines = []
    in_table = False

    while i < len(lines):
        line = lines[i]
        stripped = line.strip()

        # Code blocks
        if stripped.startswith('```'):
            if in_code_block:
                # End code block
                code_text = '<br/>'.join(
                    l.replace('<', '&lt;').replace('>', '&gt;').replace(' ', '&nbsp;')
                    for l in code_lines
                )
                if code_text.strip():
                    story.append(Paragraph(code_text, styles['CodeBlock']))
                code_lines = []
                in_code_block = False
            else:
                # Flush any table
                if in_table and table_lines:
                    headers, rows = parse_md_table(table_lines)
                    if headers and rows:
                        story.append(make_table(headers, rows))
                    table_lines = []
                    in_table = False
                in_code_block = True
            i += 1
            continue

        if in_code_block:
            code_lines.append(line)
            i += 1
            continue

        # Table lines
        if '|' in stripped and stripped.startswith('|'):
            if not in_table:
                in_table = True
                table_lines = []
            table_lines.append(stripped)
            i += 1
            continue
        elif in_table:
            # Flush table
            headers, rows = parse_md_table(table_lines)
            if headers and rows:
                story.append(make_table(headers, rows))
                story.append(Spacer(1, 2*mm))
            table_lines = []
            in_table = False

        # Horizontal rule
        if stripped == '---':
            story.append(Spacer(1, 3*mm))
            story.append(HRFlowable(width="100%", thickness=1, color=GRAY_BORDER))
            story.append(Spacer(1, 3*mm))
            i += 1
            continue

        # Empty line
        if not stripped:
            i += 1
            continue

        # Headers
        if stripped.startswith('# ') and not stripped.startswith('## '):
            # Skip main title (already in cover)
            i += 1
            continue

        if stripped.startswith('## '):
            title = clean(stripped[3:])
            story.append(Paragraph(title, styles['H1']))
            i += 1
            continue

        if stripped.startswith('### '):
            title = clean(stripped[4:])
            story.append(Paragraph(title, styles['H2']))
            i += 1
            continue

        if stripped.startswith('#### '):
            title = clean(stripped[5:])
            story.append(Paragraph(title, styles['H3']))
            i += 1
            continue

        # Alert lines
        if stripped.startswith('**ALERTA') or stripped.startswith('**PROBLEMA') or 'CRITICO' in stripped.upper() and stripped.startswith('**'):
            story.append(Paragraph(clean(stripped), styles['AlertRed']))
            i += 1
            continue

        # Bullet points
        if stripped.startswith('- ') or stripped.startswith('* '):
            bullet_text = clean(stripped[2:])
            story.append(Paragraph(f"&bull; {bullet_text}", styles['BulletItem']))
            i += 1
            continue

        # Numbered items
        num_match = re.match(r'^(\d+)\.\s+(.+)', stripped)
        if num_match:
            num, text = num_match.groups()
            story.append(Paragraph(f"<b>{num}.</b> {clean(text)}", styles['BulletItem']))
            i += 1
            continue

        # Regular paragraph
        story.append(Paragraph(clean(stripped), styles['BodyText2']))
        i += 1

    # Flush remaining table
    if in_table and table_lines:
        headers, rows = parse_md_table(table_lines)
        if headers and rows:
            story.append(make_table(headers, rows))

    # ── Footer signature ──
    story.append(Spacer(1, 10*mm))
    story.append(HRFlowable(width="100%", thickness=1.5, color=ACCENT))
    story.append(Spacer(1, 3*mm))
    story.append(Paragraph(
        "<i>Auditoria executada pelo Traffic Masters Squad completo:<br/>"
        "@molly-pittman (Traffic Engine), @kasim-aslam (Google Ads), @depesh-mandalia (Meta BPM),<br/>"
        "@nicholas-kusmich (Lead Gen), @tom-breeze (YouTube/Video), @ralph-burns (Scaling/Creative), @pedro-sobral (Operacao Brasil)</i>",
        styles['Footer']
    ))
    story.append(Spacer(1, 2*mm))
    story.append(Paragraph(
        "<i>Frameworks: Traffic Engine 9 Steps, Golden Ratio, BPM Method, 4-Step Lead Gen, ADUCATE, Creative Lab 7 Steps, DPI2, Metodologia ABC</i>",
        styles['Footer']
    ))

    # ── Build ──
    def add_page_number(canvas, doc):
        canvas.saveState()
        canvas.setFont('Helvetica', 7)
        canvas.setFillColor(GRAY)
        canvas.drawCentredString(A4[0] / 2, 10*mm, f"Tocks Custom — Auditoria Traffic Masters — Pagina {doc.page}")
        canvas.restoreState()

    doc.build(story, onFirstPage=add_page_number, onLaterPages=add_page_number)
    print(f"PDF gerado: {output_path}")

if __name__ == "__main__":
    build_pdf()
