"""Convert generated art (magenta background) into game-ready assets.

Input:  cadillacs/assets/incoming/*.png  (as generated, flat magenta #FF00FF background)
Output: cadillacs/assets/sprites/<name>.png  packed RGBA atlas per character
        cadillacs/assets/bg/stage<N>_<layer>.png  background layers
        cadillacs/assets/sprites/data.js  frame table (plain script, works from file://)

Run from the repo root:  python3 cadillacs/tools/build_sprites.py
Needs: pillow, numpy, scipy
"""
import json
import os

import numpy as np
from PIL import Image
from scipy import ndimage

ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..')
INCOMING = os.path.join(ROOT, 'assets', 'incoming')
SPRITES = os.path.join(ROOT, 'assets', 'sprites')
BGDIR = os.path.join(ROOT, 'assets', 'bg')

# Character sheets: file -> frame names in reading order (rows top to bottom, left to right).
CHARACTERS = {
    'cole': {
        'cole_moves.png': ['idle', 'jab', 'cross', 'upper',
                           'kick', 'jump', 'jumpkick', 'grab',
                           'throw', 'hurt', 'fall', 'down'],
        'cole_walk.png': ['walk0', 'walk1', 'walk2', 'walk3',
                          'walk4', 'walk5', 'walk6', 'walk7'],
    },
}
# Background layers: file -> (stage index, layer name, keyed)
BACKGROUNDS = {
    'bg1_far.png': (0, 'far', False),
    'bg1_near.png': (0, 'near', True),
}


def magenta_alpha(rgb):
    """Return (alpha 0..1, key colour) for an RGB float array on a magenta background."""
    r, g, b = rgb[..., 0], rgb[..., 1], rgb[..., 2]
    # how magenta a pixel is: red and blue high, green low
    m = np.clip((np.minimum(r, b) - g - 90) / 110, 0, 1) * np.clip((np.minimum(r, b) - 150) / 60, 0, 1)
    strong = m > 0.5
    lab, _ = ndimage.label(strong)
    border = np.unique(np.concatenate([lab[0], lab[-1], lab[:, 0], lab[:, -1]]))
    border = border[border > 0]
    outside = np.isin(lab, border)
    # enclosed holes (between arms, legs) only when they are almost pure magenta,
    # so pink neon or magenta clothing inside a shape is not cut out
    holes = strong & ~outside & (m > 0.6)
    holes = ndimage.binary_opening(holes, iterations=1)
    bg = outside | holes
    edge = ndimage.binary_dilation(bg, iterations=2) & ~bg
    alpha = np.ones(m.shape, np.float32)
    alpha[bg] = 0
    alpha[edge] = 1 - m[edge]
    key = np.median(rgb[bg], axis=0) if bg.any() else np.array([255, 0, 255], np.float32)
    near = ndimage.distance_transform_edt(~bg) <= 10
    return alpha, key, near


def cut_out(path):
    rgb = np.asarray(Image.open(path).convert('RGB'), np.float32)
    alpha, key, near = magenta_alpha(rgb)
    a = np.clip(alpha, 1e-3, 1)[..., None]
    # un-mix the magenta from semi-transparent edge pixels
    out = np.clip((rgb - (1 - a) * key) / a, 0, 255)
    # despill: thin details next to the cut (vines, hair) pick up a magenta tint;
    # pull red and blue down to green there. Limited to the edge band so neon inside shapes survives.
    r, g, b = out[..., 0], out[..., 1], out[..., 2]
    excess = np.clip(np.minimum(r, b) - g, 0, None) * near
    out[..., 0] -= excess
    out[..., 2] -= excess
    rgba = np.dstack([out, alpha * 255]).round().astype(np.uint8)
    return rgba


def split_frames(rgba, names):
    solid = rgba[..., 3] > 40
    lab, _ = ndimage.label(ndimage.binary_dilation(solid, iterations=5))
    objs = ndimage.find_objects(lab)
    items = []
    for i, sl in enumerate(objs):
        area = int((lab[sl] == i + 1).sum())
        items.append((area, i + 1, sl))
    items.sort(reverse=True)
    items = items[:len(names)]
    if len(items) < len(names):
        raise SystemExit('found %d frames, expected %d' % (len(items), len(names)))
    # reading order: group into rows by vertical centre, then left to right
    items = [(sl[0].start, sl[0].stop, sl[1].start, idx, sl) for _, idx, sl in items]
    items.sort(key=lambda it: (it[0] + it[1]) / 2)
    rows, cur = [], []
    for it in items:
        if cur and (it[0] + it[1]) / 2 > max(c[1] for c in cur):
            rows.append(cur); cur = []
        cur.append(it)
    rows.append(cur)
    ordered = [it for row in rows for it in sorted(row, key=lambda it: it[2])]
    frames = {}
    for name, (y0, y1, x0, idx, sl) in zip(names, ordered):
        crop = rgba[sl].copy()
        crop[lab[sl] != idx, 3] = 0  # drop pieces of neighbouring frames
        ys, xs = np.nonzero(crop[..., 3] > 40)
        crop = crop[ys.min():ys.max() + 1, xs.min():xs.max() + 1]
        h = crop.shape[0]
        # anchor: feet at the bottom, x at the hips (centroid of a band 45-60% down the frame)
        band = crop[int(h * 0.45):max(int(h * 0.6), int(h * 0.45) + 1), :, 3] > 40
        cols = np.nonzero(band.any(axis=0))[0]
        ax = float(np.mean(np.nonzero(band)[1])) if cols.size else crop.shape[1] / 2
        frames[name] = {'img': crop, 'ax': ax, 'ay': float(h)}
    return frames


def pack(frames, pad=4):
    """Shelf-pack frames into one atlas. Returns (atlas image, {name: [x, y, w, h, ax, ay]})."""
    order = sorted(frames, key=lambda n: -frames[n]['img'].shape[0])
    width = 2048
    x = y = shelf = 0
    rects = {}
    for n in order:
        h, w = frames[n]['img'].shape[:2]
        if x + w > width:
            x = 0; y += shelf + pad; shelf = 0
        rects[n] = (x, y, w, h)
        x += w + pad; shelf = max(shelf, h)
    atlas = np.zeros((y + shelf, width, 4), np.uint8)
    table = {}
    for n, (x, y, w, h) in rects.items():
        atlas[y:y + h, x:x + w] = frames[n]['img']
        table[n] = [x, y, w, h, round(frames[n]['ax'], 1), round(frames[n]['ay'], 1)]
    return Image.fromarray(atlas, 'RGBA'), table


def main():
    os.makedirs(SPRITES, exist_ok=True)
    os.makedirs(BGDIR, exist_ok=True)
    data = {'chars': {}, 'bg': {}}
    for char, sheets in CHARACTERS.items():
        frames = {}
        for fname, names in sheets.items():
            sheet = split_frames(cut_out(os.path.join(INCOMING, fname)), names)
            # each sheet may be drawn at a different scale: normalise to the moves sheet's idle height
            frames.update(sheet)
        ref = frames['idle']['img'].shape[0]
        walk_h = np.median([frames['walk%d' % i]['img'].shape[0] for i in range(8)])
        for i in range(8):
            f = frames['walk%d' % i]
            s = ref / walk_h
            if abs(s - 1) > 0.02:
                img = Image.fromarray(f['img'], 'RGBA')
                img = img.resize((max(1, round(img.width * s)), max(1, round(img.height * s))), Image.LANCZOS)
                f['img'] = np.asarray(img); f['ax'] *= s; f['ay'] *= s
        atlas, table = pack(frames)
        out = os.path.join(SPRITES, char + '.png')
        atlas.save(out, optimize=True)
        data['chars'][char] = {'src': 'assets/sprites/%s.png' % char, 'ref': ref, 'frames': table}
        print(char, atlas.size, len(table), 'frames, idle height', ref)
    for fname, (stage, layer, keyed) in BACKGROUNDS.items():
        path = os.path.join(INCOMING, fname)
        if keyed:
            img = Image.fromarray(cut_out(path), 'RGBA')
        else:
            img = Image.open(path).convert('RGB')
        out = 'stage%d_%s.png' % (stage, layer)
        img.save(os.path.join(BGDIR, out), optimize=True)
        data['bg'].setdefault(str(stage), {})[layer] = 'assets/bg/' + out
        print(out, img.size, img.mode)
    with open(os.path.join(SPRITES, 'data.js'), 'w') as fh:
        fh.write('// generated by tools/build_sprites.py - do not edit\nwindow.SPRITE_DATA = ')
        fh.write(json.dumps(data, separators=(',', ':')))
        fh.write(';\n')


if __name__ == '__main__':
    main()
