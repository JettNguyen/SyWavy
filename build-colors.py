"""Picks one color from each cover for the lyrics pages to use.

Run it after adding a cover:  python3 build-colors.py
It writes assets/covers/colors.json, which build.js reads. The site build itself
runs on GitHub with plain Node, so the colors are worked out here and committed.

The color is the hue with the most vivid pixels behind it on the cover,
lightened so text in it reads on the site's near-black. A cover with no real
color in it (black and white art) gets the site's teal.
"""
import colorsys, json, math, os
from PIL import Image

ROOT = os.path.dirname(os.path.abspath(__file__))
COVERS = os.path.join(ROOT, 'assets', 'covers')
TEAL = '#56e2d3'


# A few covers where the color the release is about isn't the loudest one on
# the art: the blossoms on Japanese Cherry Blossom are a soft pink beside a lot of
# aqua, and the red on Red Lights is too dark to pick out of the black.
OVERRIDES = {'jcb': '#e590a9', 'red-lights': '#e87d7d'}


def pick(path):
    """The hue with the most vivid pixels behind it, from 24 bins around the color wheel."""
    img = Image.open(path).convert('RGB').resize((96, 96))
    bins = [[0.0, 0.0, 0.0, 0.0] for _ in range(24)]  # weight, sum sin, sum cos, sum sat
    total = 96 * 96
    pixels = img.get_flattened_data() if hasattr(img, 'get_flattened_data') else img.getdata()
    for r, g, b in pixels:
        h, l, s = colorsys.rgb_to_hls(r / 255, g / 255, b / 255)
        if s < 0.3 or l < 0.1 or l > 0.9:
            continue
        w = s * (1 - abs(l - 0.5))
        k = int(h * 24) % 24
        bins[k][0] += w
        bins[k][1] += w * math.sin(h * 2 * math.pi)
        bins[k][2] += w * math.cos(h * 2 * math.pi)
        bins[k][3] += w * s
    # Each bin with its two neighbors, so a hue split across a bin edge still counts once
    best = max(range(24), key=lambda k: sum(bins[(k + d) % 24][0] for d in (-1, 0, 1)))
    group = [bins[(best + d) % 24] for d in (-1, 0, 1)]
    weight = sum(b[0] for b in group)
    if weight / total < 0.012:
        return TEAL
    hue = math.atan2(sum(b[1] for b in group), sum(b[2] for b in group)) / (2 * math.pi) % 1
    sat = sum(b[3] for b in group) / weight
    # Light enough to read as text on the dark page, never neon
    r, g, b = colorsys.hls_to_rgb(hue, 0.7, min(max(sat, 0.5), 0.78))
    return '#%02x%02x%02x' % tuple(round(c * 255) for c in (r, g, b))


def main():
    out = {}
    for name in sorted(os.listdir(COVERS)):
        if name.endswith('-480.webp'):
            key = name[: -len('-480.webp')]
            out[key] = OVERRIDES.get(key) or pick(os.path.join(COVERS, name))
    with open(os.path.join(COVERS, 'colors.json'), 'w') as f:
        json.dump(out, f, indent=2)
        f.write('\n')
    print(f'{len(out)} cover colors')


if __name__ == '__main__':
    main()
