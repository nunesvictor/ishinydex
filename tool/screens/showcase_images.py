"""As imagens do README a partir dos prints das cenas readme-* (#251).

    python3 showcase_images.py <pasta dos PNG> <docs/screenshots>

Cada print vira um cartão: recortado na parte que importa (sem a barra de
navegação e sem área vazia), com os cantos arredondados e uma borda leve,
para ficar ao lado do texto sem deixar buraco. A abertura junta três telas
inteiras lado a lado, a do meio um pouco acima.
"""

import sys

from PIL import Image, ImageDraw, ImageFilter

# O recorte de cada cena, em pixels do print (804×1624, 2x): (topo, base).
CROPS = {
    "readme-dex": (0, 1110),
    "readme-hunts": (0, 1200),
    "readme-compare": (60, 1440),
    "readme-moves": (60, 1330),
    "readme-team": (0, 1330),
    "readme-synergy": (0, 1440),
}
HERO = ["readme-dex", "readme-compare", "readme-synergy"]
CARD_WIDTH = 520  # o README mostra com 260 (2x)


def rounded(im: Image.Image, radius: int, border: bool) -> Image.Image:
    im = im.convert("RGBA")
    mask = Image.new("L", im.size, 0)
    box = (0, 0, im.width - 1, im.height - 1)
    ImageDraw.Draw(mask).rounded_rectangle(box, radius=radius, fill=255)
    if border:
        ImageDraw.Draw(im).rounded_rectangle(
            box, radius=radius, outline=(0, 0, 0, 40), width=2
        )
    im.putalpha(mask)
    return im


def card(path: str, top: int, bottom: int) -> Image.Image:
    im = Image.open(path)
    im = im.crop((0, top, im.width, bottom))
    height = round(im.height * CARD_WIDTH / im.width)
    im = im.resize((CARD_WIDTH, height), Image.LANCZOS)
    return rounded(im, 28, border=True)


def hero(paths: list[str]) -> Image.Image:
    w, gap, pad, lift = 300, 36, 40, 48
    shots = []
    for path in paths:
        im = Image.open(path)
        im = im.resize((w, round(im.height * w / im.width)), Image.LANCZOS)
        shots.append(rounded(im, 28, border=False))
    h = shots[0].height
    canvas = Image.new("RGBA", (pad * 2 + w * 3 + gap * 2, pad * 2 + h + lift))
    for i, im in enumerate(shots):
        x = pad + i * (w + gap)
        y = pad + (0 if i == 1 else lift)
        # A sombra: a forma da tela, borrada e clara.
        shade = Image.new("L", (w + 60, h + 60), 0)
        shade.paste(im.getchannel("A"), (30, 36))
        shade = shade.filter(ImageFilter.GaussianBlur(14)).point(
            lambda v: int(v * 0.35)
        )
        shadow = Image.new("RGBA", shade.size, (0, 0, 0, 0))
        shadow.putalpha(shade)
        canvas.alpha_composite(shadow, (x - 30, y - 30))
        canvas.alpha_composite(im, (x, y))
    return canvas


def main(src: str, dst: str) -> None:
    for suffix in ("", "-E"):
        for name, (top, bottom) in CROPS.items():
            card(f"{src}/{name}{suffix}.png", top, bottom).save(
                f"{dst}/{name}{suffix}.webp", "WEBP", quality=84, method=6
            )
        hero([f"{src}/{n}{suffix}.png" for n in HERO]).save(
            f"{dst}/readme-hero{suffix}.webp", "WEBP", quality=86, method=6
        )


if __name__ == "__main__":
    main(*sys.argv[1:])
