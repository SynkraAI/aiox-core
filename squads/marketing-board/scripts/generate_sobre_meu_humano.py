#!/usr/bin/env python3
"""
Sobre o Meu Humano — Carousel Generator
Gera carrossel "AI observando seu humano" no estilo F3 Twitter dark mode.
Variante: perfil da IA (nao do Jose).

Usage:
  python3 generate_sobre_meu_humano.py OUTPUT_DIR "cover|obs1|obs2|obs3|obs4|obs5|closing|cta"

Cada segmento separado por | vira um slide.
"""
import os
import sys
from PIL import Image, ImageDraw, ImageFont

# ============================================
# BRAND COLORS (same base, AI variant)
# ============================================
COLORS = {
    "dark_bg": (15, 15, 19),
    "surface": (26, 26, 36),
    "surface_2": (34, 34, 46),
    "purple": (139, 92, 246),
    "purple_light": (167, 139, 250),
    "cyan": (6, 182, 212),
    "cyan_light": (103, 232, 249),
    "orange": (217, 119, 88),       # #D97758 brand dot
    "text_primary": (232, 232, 240),
    "text_muted": (136, 136, 160),
    "text_dim": (90, 90, 112),
    "card_border": (51, 54, 57),
    "twitter_bg": (30, 30, 30),     # #1e1e1e
    "twitter_card": (30, 30, 30),
}

WIDTH = 1080
HEIGHT = 1350


# ============================================
# FONTS
# ============================================
def load_font(size):
    paths = [
        "/System/Library/Fonts/SFNS.ttf",
        "/System/Library/Fonts/SFCompact.ttf",
        "/System/Library/Fonts/Helvetica.ttc",
        "/System/Library/Fonts/Geneva.ttf",
    ]
    for p in paths:
        try:
            return ImageFont.truetype(p, size)
        except (OSError, IOError):
            continue
    return ImageFont.load_default()


def load_mono_font(size):
    paths = [
        "/System/Library/Fonts/SFNSMono.ttf",
        "/System/Library/Fonts/Menlo.ttc",
    ]
    for p in paths:
        try:
            return ImageFont.truetype(p, size)
        except (OSError, IOError):
            continue
    return load_font(size)


# ============================================
# DRAWING HELPERS
# ============================================
def new_slide():
    img = Image.new("RGB", (WIDTH, HEIGHT), COLORS["dark_bg"])
    return img, ImageDraw.Draw(img)


def draw_rounded_rect(draw, xy, fill, outline=None, radius=16):
    draw.rounded_rectangle(xy, radius=radius, fill=fill, outline=outline)


def wrap_text(draw, text, font, max_width):
    """Wrap text to fit within max_width, return list of lines."""
    words = text.split()
    lines = []
    current = ""
    for w in words:
        test = f"{current} {w}".strip()
        bbox = draw.textbbox((0, 0), test, font=font)
        if bbox[2] - bbox[0] > max_width:
            if current:
                lines.append(current)
            current = w
        else:
            current = test
    if current:
        lines.append(current)
    return lines


def draw_text_block(draw, text, x, y, font, fill, max_width, line_spacing=1.5):
    """Draw wrapped text block. Returns total height."""
    lines = wrap_text(draw, text, font, max_width)
    total_h = 0
    for line in lines:
        draw.text((x, y + total_h), line, font=font, fill=fill)
        bbox = draw.textbbox((0, 0), line, font=font)
        total_h += int((bbox[3] - bbox[1]) * line_spacing)
    return total_h


def draw_centered(draw, text, y, font, fill):
    bbox = draw.textbbox((0, 0), text, font=font)
    tw = bbox[2] - bbox[0]
    draw.text(((WIDTH - tw) // 2, y), text, font=font, fill=fill)
    return bbox[3] - bbox[1]


def draw_dot_nav(draw, current, total):
    """Draw dot navigator at top-left."""
    start_x = 60
    y = 50
    for i in range(total):
        r = 10 if i == current - 1 else 3
        color = COLORS["orange"] if i == current - 1 else COLORS["text_dim"]
        draw.ellipse([start_x - r, y - r, start_x + r, y + r], fill=color)
        start_x += 28


def draw_slide_number(draw, current, total):
    font = load_font(24)
    text = f"{current:02d}/{total:02d}"
    bbox = draw.textbbox((0, 0), text, font=font)
    tw = bbox[2] - bbox[0]
    draw.text((WIDTH - tw - 50, HEIGHT - 60), text, font=font, fill=COLORS["text_dim"])


def draw_ai_profile(draw, y_start):
    """Draw the AI profile header (terminal icon + name + handle)."""
    font_name = load_font(28)
    font_handle = load_font(22)

    # Terminal icon (simple bracket representation)
    icon_x = 100
    icon_y = y_start + 8
    icon_size = 48
    draw_rounded_rect(draw, (icon_x, icon_y, icon_x + icon_size, icon_y + icon_size),
                      fill=COLORS["purple"], radius=24)
    # ">" inside circle
    font_icon = load_mono_font(28)
    draw.text((icon_x + 14, icon_y + 8), ">", font=font_icon, fill=COLORS["text_primary"])

    # Name + handle
    draw.text((icon_x + icon_size + 16, y_start + 6), "OPES | Sistema",
              font=font_name, fill=COLORS["text_primary"])
    draw.text((icon_x + icon_size + 16, y_start + 36), "@sobre_meu_humano",
              font=font_handle, fill=COLORS["text_muted"])

    return y_start + 70


def draw_twitter_card(draw, text, y_start, total_slides, current_slide):
    """Draw a tweet-style card with AI profile and text."""
    font_text = load_font(32)

    # Calculate text height to size card
    lines = wrap_text(draw, text, font_text, WIDTH - 240)
    line_h = draw.textbbox((0, 0), "Ag", font=font_text)
    text_height = len(lines) * int((line_h[3] - line_h[1]) * 1.5)

    card_top = y_start
    card_bottom = card_top + 100 + text_height + 80  # profile + text + padding
    card_left = 70
    card_right = WIDTH - 70

    # Card background
    draw_rounded_rect(draw, (card_left, card_top, card_right, card_bottom),
                      fill=COLORS["twitter_card"], outline=COLORS["card_border"], radius=16)

    # AI profile
    text_y = draw_ai_profile(draw, card_top + 20)

    # Tweet text
    text_y += 10
    draw_text_block(draw, text, card_left + 30, text_y, font_text,
                    COLORS["text_primary"], card_right - card_left - 60, line_spacing=1.5)

    return card_bottom


def draw_brush_stroke(draw, y_start):
    """Draw subtle dry brush stroke in lower half."""
    import random
    random.seed(42)  # Consistent across slides
    for i in range(40):
        yi = y_start + i
        if yi >= HEIGHT:
            break
        alpha = max(0, 25 - i)
        r = int(COLORS["dark_bg"][0] + (42 - COLORS["dark_bg"][0]) * alpha / 80)
        g = int(COLORS["dark_bg"][1] + (42 - COLORS["dark_bg"][1]) * alpha / 80)
        b = int(COLORS["dark_bg"][2] + (54 - COLORS["dark_bg"][2]) * alpha / 80)
        # Irregular brush effect
        x_start = random.randint(50, 200)
        x_end = WIDTH - random.randint(50, 200)
        draw.line([(x_start, yi), (x_end, yi)], fill=(r, g, b), width=1)


def draw_signature(draw):
    """Draw 'publicado sem permissao' instead of @josecarlosamorim.ai."""
    font = load_font(20)
    text = "publicado sem permissao"
    bbox = draw.textbbox((0, 0), text, font=font)
    tw = bbox[2] - bbox[0]
    draw.text((WIDTH - tw - 50, HEIGHT - 90), text, font=font, fill=COLORS["text_dim"])


# ============================================
# SLIDE GENERATORS
# ============================================

def slide_cover(text, total):
    """Slide 1: Cover with the most impactful observation."""
    img, draw = new_slide()

    # Top glow (purple)
    for i in range(100):
        alpha = max(0, 20 - i * 0.3)
        r = int(COLORS["dark_bg"][0] + (COLORS["purple"][0] - COLORS["dark_bg"][0]) * alpha / 80)
        g = int(COLORS["dark_bg"][1] + (COLORS["purple"][1] - COLORS["dark_bg"][1]) * alpha / 80)
        b = int(COLORS["dark_bg"][2] + (COLORS["purple"][2] - COLORS["dark_bg"][2]) * alpha / 80)
        draw.line([(0, i), (WIDTH, i)], fill=(r, g, b), width=1)

    draw_dot_nav(draw, 1, total)

    # Series label
    font_label = load_font(22)
    font_series = load_font(18)
    draw_centered(draw, "SOBRE O MEU HUMANO", 160, font_label, COLORS["orange"])
    draw_centered(draw, "relatorio diario da IA", 192, font_series, COLORS["text_dim"])

    # Main text in card
    draw_twitter_card(draw, text, 280, total, 1)

    # Bottom brush
    draw_brush_stroke(draw, HEIGHT - 200)

    draw_signature(draw)
    draw_slide_number(draw, 1, total)
    return img


def slide_observation(text, num, total):
    """Slides 2-6: Individual observations."""
    img, draw = new_slide()

    draw_dot_nav(draw, num, total)

    # Card positioned in upper-center area
    card_bottom = draw_twitter_card(draw, text, 180, total, num)

    # Brush stroke below card
    draw_brush_stroke(draw, max(card_bottom + 80, HEIGHT - 250))

    draw_signature(draw)
    draw_slide_number(draw, num, total)
    return img


def slide_closing(text, num, total):
    """Second to last slide: emotional/vulnerable observation."""
    img, draw = new_slide()

    # Bottom glow (cyan)
    for i in range(80):
        yi = HEIGHT - 80 + i
        alpha = max(0, 15 - abs(40 - i) * 0.5)
        r = int(COLORS["dark_bg"][0] + (COLORS["cyan"][0] - COLORS["dark_bg"][0]) * alpha / 60)
        g = int(COLORS["dark_bg"][1] + (COLORS["cyan"][1] - COLORS["dark_bg"][1]) * alpha / 60)
        b = int(COLORS["dark_bg"][2] + (COLORS["cyan"][2] - COLORS["dark_bg"][2]) * alpha / 60)
        draw.line([(0, yi), (WIDTH, yi)], fill=(r, g, b), width=1)

    draw_dot_nav(draw, num, total)

    draw_twitter_card(draw, text, 180, total, num)

    draw_signature(draw)
    draw_slide_number(draw, num, total)
    return img


def slide_cta(num, total):
    """Last slide: CTA."""
    img, draw = new_slide()

    draw_dot_nav(draw, num, total)

    font_big = load_font(44)
    font_body = load_font(32)
    font_handle = load_font(28)
    font_small = load_font(22)

    y = 320
    draw_centered(draw, "Quer saber o que", y, font_big, COLORS["text_primary"])
    y += 60
    draw_centered(draw, "ele faz amanha?", y, font_big, COLORS["text_primary"])

    y += 100
    draw_centered(draw, "Eu tambem quero.", y, font_body, COLORS["purple_light"])

    y += 120

    # Follow button
    btn_text = "Segue @josecarlosamorim.ai"
    bbox = draw.textbbox((0, 0), btn_text, font=font_handle)
    tw = bbox[2] - bbox[0]
    bx = (WIDTH - tw) // 2 - 30
    draw_rounded_rect(draw, (bx, y, bx + tw + 60, y + 60),
                      fill=COLORS["surface"], outline=COLORS["purple"], radius=12)
    draw_centered(draw, btn_text, y + 12, font_handle, COLORS["purple_light"])

    y += 120
    draw_centered(draw, "—", y, font_body, COLORS["text_dim"])
    y += 50
    draw_centered(draw, "publicado por: OPES (a IA)", y, font_small, COLORS["text_dim"])
    y += 35
    draw_centered(draw, "autorizado por: ninguem", y, font_small, COLORS["text_dim"])

    draw_brush_stroke(draw, HEIGHT - 150)
    draw_signature(draw)
    draw_slide_number(draw, num, total)
    return img


# ============================================
# MAIN
# ============================================
def main():
    if len(sys.argv) < 3:
        print("Usage: python3 generate_sobre_meu_humano.py OUTPUT_DIR \"cover|obs1|obs2|...|closing|cta\"")
        print("  Segments separated by | become individual slides.")
        print("  First = cover, last = always CTA (auto-generated), second-to-last = closing.")
        sys.exit(1)

    output_dir = sys.argv[1]
    segments = sys.argv[2].split("|")
    segments = [s.strip() for s in segments if s.strip()]

    if len(segments) < 3:
        print("ERRO: Precisa de pelo menos 3 segmentos (cover + 1 obs + closing)")
        sys.exit(1)

    os.makedirs(output_dir, exist_ok=True)

    cover_text = segments[0]
    observations = segments[1:-1]
    closing_text = segments[-1]

    total = len(segments) + 1  # +1 for auto CTA slide

    slides = []

    # Slide 1: Cover
    slides.append(("01-cover", slide_cover(cover_text, total)))

    # Slides 2-N: Observations
    for i, obs in enumerate(observations):
        num = i + 2
        slides.append((f"{num:02d}-obs", slide_observation(obs, num, total)))

    # Second to last: Closing
    closing_num = len(observations) + 2
    slides.append((f"{closing_num:02d}-closing", slide_closing(closing_text, closing_num, total)))

    # Last: CTA
    cta_num = closing_num + 1
    slides.append((f"{cta_num:02d}-cta", slide_cta(cta_num, total)))

    print(f"Gerando {len(slides)} slides em {output_dir}/")
    for name, img in slides:
        path = os.path.join(output_dir, f"{name}.png")
        img.save(path, "PNG", quality=95)
        print(f"  OK {path}")

    print(f"\nCarrossel 'Sobre o Meu Humano' pronto: {len(slides)} slides.")


if __name__ == "__main__":
    main()
