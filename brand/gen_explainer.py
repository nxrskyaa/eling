#!/usr/bin/env python3
"""Eling Walz explainer carousel — 5 panels, 1080x1080, Lego-playful brand."""
from PIL import Image, ImageDraw, ImageFont
import os

OUT = os.path.expanduser("~/workspace/walrus-hackathon/eling/brand/explainer")
os.makedirs(OUT, exist_ok=True)

CREAM = (255, 249, 240); CREAM2 = (253, 239, 217)
INK = (35, 32, 26); INK_SOFT = (110, 100, 88)
ORANGE = (255, 107, 26); BLUE = (79, 70, 229); YELLOW = (255, 197, 49)
NAVY = (22, 42, 74); GREEN = (34, 197, 94); WHITE = (255, 255, 255)

def F(size): return ImageFont.truetype('/tmp/fredoka700.ttf', size)          # display
def N(size, w=400):
    return ImageFont.truetype(f'/tmp/nunito-{w}.ttf', size)                   # body

def brick_card(d, xy, fill, radius=28, shadow=8, bw=5):
    x0, y0, x1, y1 = xy
    d.rounded_rectangle([x0+shadow, y0+shadow, x1+shadow, y1+shadow], radius, fill=(0,0,0,40))
    d.rounded_rectangle(xy, radius, fill=fill, outline=INK, width=bw)

def wrap(d, text, font, max_w):
    words, lines, cur = text.split(), [], ""
    for w in words:
        t = (cur + " " + w).strip()
        if d.textlength(t, font=font) <= max_w: cur = t
        else: lines.append(cur); cur = w
    if cur: lines.append(cur)
    return lines

def centered(d, cx, y, text, font, fill):
    d.text((cx - d.textlength(text, font=font)/2, y), text, font=font, fill=fill)

def bubble(d, x, y, max_w, text, fg, bg, font, radius=24, pad=22):
    lines = wrap(d, text, font, max_w - pad*2)
    lh = font.size + 10
    w = max(d.textlength(l, font=font) for l in lines) + pad*2
    h = len(lines)*lh + pad*2 - 6
    d.rounded_rectangle([x, y, x+w, y+h], radius, fill=bg, outline=INK, width=4)
    ty = y + pad - 4
    for l in lines:
        d.text((x+pad, ty), l, font=font, fill=fg); ty += lh
    return h

def badge(d, cx, y, text, font, fg, bg):
    pad_x, pad_y = 26, 12
    w = d.textlength(text, font=font) + pad_x*2
    h = font.size + pad_y*2
    d.rounded_rectangle([cx-w/2, y, cx+w/2, y+h], h//2, fill=bg, outline=INK, width=4)
    centered(d, cx, y+pad_y-2, text, font, fg)
    return h

# ============ PANEL 1 — cover ============
img = Image.new('RGB', (1080, 1080), NAVY); d = ImageDraw.Draw(img)
badge(d, 540, 64, "WALRUS SESSION 8  ·  CHATBOTS THAT REMEMBER", N(30, 800), CREAM, ORANGE)
logo = Image.open(os.path.expanduser("~/workspace/walrus-hackathon/eling/brand/eling-logo.png")).resize((560, 560), Image.LANCZOS)
img.paste(logo, (260, 190))
centered(d, 540, 800, "ELING WALZ", F(104), CREAM)
centered(d, 540, 930, "The bot that never forgets.", N(46), (200, 210, 235))
img.save(f"{OUT}/01-cover.png")

# ============ PANEL 2 — problem ============
img = Image.new('RGB', (1080, 1080), CREAM); d = ImageDraw.Draw(img)
centered(d, 540, 56, "Most chatbots", F(78), INK)
centered(d, 540, 148, "have amnesia.", F(78), INK)
brick_card(d, (90, 280, 990, 900), WHITE)
y = 320
y += bubble(d, 480, y, 420, "Remember: I'm allergic to peanuts.", WHITE, BLUE, N(34, 700)) + 18
y += bubble(d, 130, y, 420, "Okay, noted!", INK, CREAM2, N(34, 700)) + 26
centered(d, 540, y, "— 7 days later —", N(30, 700), INK_SOFT); y += 56
y += bubble(d, 480, y, 420, "What's safe for me to eat?", WHITE, BLUE, N(34, 700)) + 18
y += bubble(d, 130, y, 470, "I don't know what you're allergic to. Tell me!", INK, CREAM2, N(34, 700))
centered(d, 540, 940, "Every session starts from zero.", N(38), INK_SOFT)
img.save(f"{OUT}/02-problem.png")

# ============ PANEL 3 — how it works ============
img = Image.new('RGB', (1080, 1080), CREAM); d = ImageDraw.Draw(img)
centered(d, 540, 56, "How Eling remembers", F(72), INK)
steps = [
    ("1", ORANGE, "You chat", "Talk on Telegram, like with a friend."),
    ("2", BLUE, "Eling recalls", "Memories fetched from Walrus Memory."),
    ("3", YELLOW, "Gemini replies", "Your memories become the answer's context."),
    ("4", GREEN, "New facts saved", "Deduplicated, encrypted, stored on Walrus."),
]
y = 210
for num, col, title, desc in steps:
    brick_card(d, (90, y, 990, y+168), WHITE, radius=24)
    d.ellipse([130, y+52, 202, y+124], fill=col, outline=INK, width=4)
    centered(d, 166, y+62, num, F(52), WHITE if col != YELLOW else INK)
    d.text((232, y+34), title, font=F(46), fill=INK)
    for i, ln in enumerate(wrap(d, desc, N(34), 700)):
        d.text((232, y+96+i*44), ln, font=N(34), fill=INK_SOFT)
    y += 200
img.save(f"{OUT}/03-how.png")

# ============ PANEL 4 — money moment ============
img = Image.new('RGB', (1080, 1080), CREAM); d = ImageDraw.Draw(img)
centered(d, 540, 56, "The difference", F(76), INK)
# without
brick_card(d, (90, 200, 990, 500), WHITE)
badge(d, 540, 224, "WITHOUT MEMORY", N(30, 800), INK_SOFT, CREAM2)
bubble(d, 150, 300, 700, "What's safe for me to eat?", WHITE, BLUE, N(34, 700))
bubble(d, 150, 420, 740, "I don't know what you're allergic to.", INK, CREAM2, N(34, 700))
# with
brick_card(d, (90, 560, 990, 930), WHITE)
badge(d, 540, 584, "WITH ELING", N(30, 800), WHITE, ORANGE)
d.rounded_rectangle([150, 668, 150+d.textlength("allergic to peanuts · 7 days ago", font=N(30, 800))+44, 716],
                    12, fill=YELLOW, outline=INK, width=4)
d.text((172, 674), "allergic to peanuts · 7 days ago", font=N(30, 800), fill=INK)
bubble(d, 150, 740, 740, "No peanuts! You're allergic — I still remember from last week.", INK, CREAM2, N(34, 700))
centered(d, 540, 966, "Same question. Real memory.", N(36, 700), INK_SOFT)
img.save(f"{OUT}/04-difference.png")

# ============ PANEL 5 — CTA ============
img = Image.new('RGB', (1080, 1080), NAVY); d = ImageDraw.Draw(img)
centered(d, 540, 120, "Try Eling now", F(88), CREAM)
# big handle button
txt, font = "@ElingWalz_bot", F(72)
bw = d.textlength(txt, font=font) + 110; bh = 150
brick_card(d, (540-bw/2, 300, 540+bw/2, 300+bh), ORANGE, radius=30, shadow=10, bw=6)
centered(d, 540, 300+38, txt, font, WHITE)
centered(d, 540, 500, "on Telegram — send /start", N(44), (200, 210, 235))
# trilingual pill — mixed fonts (Nunito lacks CJK glyphs)
def CJK(size): return ImageFont.truetype('/tmp/noto-sc-700.ttf', size)
seg1, seg2, seg3, f1, f2 = "ID  ·  EN  ·  ", "中文", "", N(44, 700), CJK(44)
w1, w2 = d.textlength(seg1, font=f1), d.textlength(seg2, font=f2)
x = 540 - (w1 + w2) / 2
d.text((x, 620), seg1, font=f1, fill=YELLOW)
d.text((x + w1, 620), seg2, font=f2, fill=YELLOW)
d.line([180, 730, 900, 730], fill=(60, 80, 120), width=3)
centered(d, 540, 770, "eling-landing-nxrskyaas-projects.vercel.app", N(36), (200, 210, 235))
centered(d, 540, 830, "github.com/nxrskyaa/eling", N(36), (200, 210, 235))
badge(d, 540, 930, "WALRUS SESSION 8", N(30, 800), CREAM, BLUE)
img.save(f"{OUT}/05-cta.png")
print("done:", sorted(os.listdir(OUT)))
