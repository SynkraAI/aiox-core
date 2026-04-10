"""
Gera PDF do calendario de conteudo social media - Tocks Custom
"""
import re
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.colors import HexColor, white
from reportlab.lib.units import mm
from reportlab.lib.enums import TA_LEFT, TA_CENTER, TA_JUSTIFY
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle,
    HRFlowable, KeepTogether
)

DARK = HexColor("#1a1a2e")
ACCENT = HexColor("#e94560")
BLUE = HexColor("#0f3460")
BLUE_LIGHT = HexColor("#e3f2fd")
GREEN = HexColor("#2e7d32")
GREEN_LIGHT = HexColor("#e8f5e9")
GRAY = HexColor("#616161")
GRAY_LIGHT = HexColor("#f5f5f5")
GRAY_BORDER = HexColor("#e0e0e0")
PURPLE = HexColor("#6a1b9a")
PURPLE_LIGHT = HexColor("#f3e5f5")

styles = getSampleStyleSheet()
styles.add(ParagraphStyle('DocTitle', fontSize=22, textColor=DARK, spaceAfter=4*mm, fontName='Helvetica-Bold', alignment=TA_CENTER))
styles.add(ParagraphStyle('DocSub', fontSize=11, textColor=GRAY, alignment=TA_CENTER, spaceAfter=8*mm))
styles.add(ParagraphStyle('H1', fontSize=16, textColor=DARK, spaceBefore=10*mm, spaceAfter=4*mm, fontName='Helvetica-Bold'))
styles.add(ParagraphStyle('H2', fontSize=13, textColor=BLUE, spaceBefore=7*mm, spaceAfter=3*mm, fontName='Helvetica-Bold'))
styles.add(ParagraphStyle('PostTitle', fontSize=12, textColor=ACCENT, spaceBefore=6*mm, spaceAfter=2*mm, fontName='Helvetica-Bold', backColor=HexColor("#fff0f3"), borderPadding=6, borderWidth=0.5, borderColor=ACCENT))
styles.add(ParagraphStyle('Body', fontSize=9.5, textColor=HexColor("#333333"), leading=14, spaceAfter=2*mm, alignment=TA_JUSTIFY))
styles.add(ParagraphStyle('Caption', fontSize=9.5, textColor=HexColor("#1a1a2e"), leading=14, spaceAfter=2*mm, leftIndent=4*mm, rightIndent=4*mm, backColor=HexColor("#fafafa"), borderPadding=8, borderWidth=0.5, borderColor=GRAY_BORDER))
styles.add(ParagraphStyle('Visual', fontSize=9, textColor=PURPLE, leading=13, spaceAfter=2*mm, leftIndent=4*mm, rightIndent=4*mm, backColor=PURPLE_LIGHT, borderPadding=6))
styles.add(ParagraphStyle('Script', fontSize=8.5, fontName='Courier', textColor=HexColor("#263238"), backColor=GRAY_LIGHT, leftIndent=4*mm, rightIndent=4*mm, spaceBefore=2*mm, spaceAfter=2*mm, leading=11, borderPadding=6))
styles.add(ParagraphStyle('Tag', fontSize=8, textColor=BLUE, leading=11, spaceAfter=2*mm, leftIndent=4*mm))
styles.add(ParagraphStyle('Meta', fontSize=9, textColor=GRAY, leading=12, spaceAfter=1*mm))
styles.add(ParagraphStyle('Footer', fontSize=7.5, textColor=GRAY, alignment=TA_CENTER))
styles.add(ParagraphStyle('BulletCustom', fontSize=9.5, textColor=HexColor("#333333"), leading=14, leftIndent=10*mm, bulletIndent=5*mm, spaceAfter=1.5*mm))
styles.add(ParagraphStyle('CellH', fontSize=8, leading=10, textColor=white, fontName='Helvetica-Bold'))
styles.add(ParagraphStyle('Cell', fontSize=8, leading=10, textColor=HexColor("#333333")))

def clean(t):
    t = re.sub(r'\*\*(.+?)\*\*', r'<b>\1</b>', t)
    t = t.replace('—', '&mdash;').replace('→', '&rarr;')
    return t

def build():
    path = "D:/AIOS/docs/ads-data/tocks/social-media-calendario-abril-2026.pdf"
    doc = SimpleDocTemplate(path, pagesize=A4, leftMargin=15*mm, rightMargin=15*mm, topMargin=18*mm, bottomMargin=18*mm, title="Calendario Social Media - Tocks Custom", author="Copy Chief Squad")
    story = []

    # Cover
    story.append(Spacer(1, 15*mm))
    story.append(HRFlowable(width="100%", thickness=2, color=ACCENT))
    story.append(Spacer(1, 4*mm))
    story.append(Paragraph("CALENDARIO DE CONTEUDO", styles['DocTitle']))
    story.append(Paragraph("TOCKS CUSTOM — REDES SOCIAIS", styles['DocTitle']))
    story.append(Spacer(1, 3*mm))
    story.append(Paragraph("14-27 Abril 2026 | Instagram + Facebook | @tockscustom<br/>14 posts | 4 Reels + 5 Carrosseis + 3 Fotos + 1 Stories + 1 Depoimento", styles['DocSub']))
    story.append(HRFlowable(width="100%", thickness=2, color=ACCENT))
    story.append(Spacer(1, 6*mm))

    # Summary table
    pw = A4[0] - 30*mm
    header = [Paragraph(h, styles['CellH']) for h in ['Dia', 'Data', 'Tema', 'Formato', 'Horario']]
    rows_data = [
        ['Seg', '14/04', 'Processo fabricacao', 'Carrossel 5 slides', '12h00'],
        ['Ter', '15/04', 'Produto: Tenro Luxo', 'Foto unica', '19h00'],
        ['Qua', '16/04', 'Lifestyle momentos', 'Reels 30s', '20h00'],
        ['Qui', '17/04', 'Como escolher mesa', 'Carrossel 7 slides', '12h30'],
        ['Sex', '18/04', 'Monaco 2em1', 'Reels 30s', '18h00'],
        ['Sab', '19/04', 'Depoimento cliente', 'Foto + quote', '10h00'],
        ['Dom', '20/04', 'Personalizacao', 'Stories 5 frames', '11h00'],
        ['Seg', '21/04', 'Antes e Depois', 'Carrossel 3 slides', '12h00'],
        ['Ter', '22/04', 'Pebolim Nobus', 'Foto/video curto', '19h30'],
        ['Qua', '23/04', 'Bastidores fabrica', 'Reels 40s', '12h00'],
        ['Qui', '24/04', 'Produto: Ark', 'Carrossel 4 slides', '19h00'],
        ['Sex', '25/04', 'Prova social arquitetos', 'Carrossel 3 slides', '14h00'],
        ['Sab', '26/04', 'Game room aspiracional', 'Reels 25s', '11h00'],
        ['Dom', '27/04', 'CTA forte', 'Foto impactante', '19h00'],
    ]
    data = [header] + [[Paragraph(c, styles['Cell']) for c in row] for row in rows_data]
    t = Table(data, colWidths=[pw*0.08, pw*0.10, pw*0.35, pw*0.30, pw*0.12], repeatRows=1)
    t.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), BLUE),
        ('ROWBACKGROUNDS', (0, 1), (-1, -1), [white, GRAY_LIGHT]),
        ('GRID', (0, 0), (-1, -1), 0.5, GRAY_BORDER),
        ('VALIGN', (0, 0), (-1, -1), 'TOP'),
        ('TOPPADDING', (0, 0), (-1, -1), 4),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 4),
    ]))
    story.append(t)

    # Read and parse the markdown
    with open("D:/AIOS/docs/ads-data/tocks/social-media-calendario-abril-2026.md", "r", encoding="utf-8") as f:
        content = f.read()

    lines = content.split('\n')
    i = 0
    in_code = False
    code_buf = []

    while i < len(lines):
        line = lines[i]
        s = line.strip()

        if s.startswith('```'):
            if in_code:
                txt = '<br/>'.join(l.replace('<', '&lt;').replace('>', '&gt;').replace(' ', '&nbsp;') for l in code_buf)
                if txt.strip():
                    story.append(Paragraph(txt, styles['Script']))
                code_buf = []
                in_code = False
            else:
                in_code = True
            i += 1
            continue

        if in_code:
            code_buf.append(line)
            i += 1
            continue

        if not s or s == '---':
            if s == '---':
                story.append(Spacer(1, 2*mm))
                story.append(HRFlowable(width="100%", thickness=0.5, color=GRAY_BORDER))
                story.append(Spacer(1, 2*mm))
            i += 1
            continue

        # Skip the header section (already in cover)
        if s.startswith('# CALENDARIO') or s.startswith('**Periodo') or s.startswith('**Plataforma') or s.startswith('**Perfil') or s.startswith('**WhatsApp') or s.startswith('**Site'):
            i += 1
            continue

        if s.startswith('## SEMANA'):
            story.append(Paragraph(clean(s[3:]), styles['H1']))
            i += 1
            continue

        if s.startswith('### POST'):
            story.append(Paragraph(clean(s[4:]), styles['PostTitle']))
            i += 1
            continue

        if s.startswith('## GUIA'):
            story.append(Paragraph(clean(s[3:]), styles['H1']))
            i += 1
            continue

        if s.startswith('### '):
            story.append(Paragraph(clean(s[4:]), styles['H2']))
            i += 1
            continue

        if s.startswith('**VISUAL') or s.startswith('**VISUAL ('):
            # Collect visual description
            vis_lines = [clean(s)]
            i += 1
            while i < len(lines) and lines[i].strip() and not lines[i].strip().startswith('**CAPTION') and not lines[i].strip().startswith('**SCRIPT') and not lines[i].strip().startswith('**STORY') and not lines[i].strip().startswith('###') and not lines[i].strip().startswith('**Tema') and not lines[i].strip().startswith('**Formato') and not lines[i].strip().startswith('**Melhor'):
                vis_lines.append(clean(lines[i].strip()))
                i += 1
            story.append(Paragraph('<br/>'.join(vis_lines), styles['Visual']))
            continue

        if s.startswith('**CAPTION'):
            cap_lines = []
            i += 1
            while i < len(lines) and not lines[i].strip().startswith('#') and not lines[i].strip().startswith('**Melhor') and not lines[i].strip().startswith('**STORY') and not lines[i].strip().startswith('---'):
                cap_lines.append(lines[i])
                i += 1
            txt = '<br/>'.join(clean(l) for l in cap_lines if l.strip())
            if txt.strip():
                story.append(Paragraph(txt, styles['Caption']))
            continue

        if s.startswith('**SCRIPT'):
            i += 1
            continue

        if s.startswith('**STORY'):
            story.append(Paragraph(clean(s), styles['Visual']))
            i += 1
            continue

        if s.startswith('**Tema:') or s.startswith('**Formato:'):
            story.append(Paragraph(clean(s), styles['Meta']))
            i += 1
            continue

        if s.startswith('**Melhor'):
            story.append(Paragraph(clean(s), styles['Meta']))
            i += 1
            continue

        if s.startswith('- '):
            story.append(Paragraph('&bull; ' + clean(s[2:]), styles['BulletCustom']))
            i += 1
            continue

        story.append(Paragraph(clean(s), styles['Body']))
        i += 1

    # Footer
    story.append(Spacer(1, 10*mm))
    story.append(HRFlowable(width="100%", thickness=1.5, color=ACCENT))
    story.append(Spacer(1, 3*mm))
    story.append(Paragraph("<i>Calendario criado pelo Copy Chief Squad — Abril 2026<br/>Tocks Custom — Desde 1988 — Itajai/SC</i>", styles['Footer']))

    def page_num(canvas, doc):
        canvas.saveState()
        canvas.setFont('Helvetica', 7)
        canvas.setFillColor(GRAY)
        canvas.drawCentredString(A4[0] / 2, 10*mm, f"Tocks Custom — Calendario Social Media — Pagina {doc.page}")
        canvas.restoreState()

    doc.build(story, onFirstPage=page_num, onLaterPages=page_num)
    print(f"PDF: {path}")

build()
