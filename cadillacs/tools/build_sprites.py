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
    'isla': {'hero_isla_a.png': ['idle', 'jab', 'cross', 'upper', 'kick', 'jump', 'jumpkick', 'grab', 'throw', 'hurt', 'fall', 'down'],
            'hero_isla_b.png': ['walk0', 'walk1', 'walk2', 'walk3', 'walk4', 'walk5', 'spin', 'aim']},
    'dax': {'hero_dax_a.png': ['idle', 'jab', 'cross', 'upper', 'kick', 'jump', 'jumpkick', 'grab', 'throw', 'hurt', 'fall', 'down'],
            'hero_dax_b.png': ['walk0', 'walk1', 'walk2', 'walk3', 'walk4', 'walk5', 'spin', 'aim']},
    'anvil': {'hero_anvil_a.png': ['idle', 'jab', 'cross', 'upper', 'kick', 'jump', 'jumpkick', 'grab', 'throw', 'hurt', 'fall', 'down'],
            'hero_anvil_b.png': ['walk0', 'walk1', 'walk2', 'walk3', 'walk4', 'walk5', 'slam', 'aim']},
    'juno': {'hero_juno_a.png': ['idle', 'jab', 'cross', 'upper', 'kick', 'jump', 'jumpkick', 'grab', 'throw', 'hurt', 'fall', 'down'],
            'hero_juno_b.png': ['walk0', 'walk1', 'walk2', 'walk3', 'walk4', 'walk5', 'fan', 'aim']},
    'doc': {'hero_doc_a.png': ['idle', 'jab', 'cross', 'upper', 'kick', 'jump', 'jumpkick', 'grab', 'throw', 'hurt', 'fall', 'down'],
            'hero_doc_b.png': ['walk0', 'walk1', 'walk2', 'walk3', 'walk4', 'walk5', 'spin', 'aim']},
    'mara': {'hero_mara_a.png': ['idle', 'jab', 'cross', 'upper', 'kick', 'jump', 'jumpkick', 'grab', 'throw', 'hurt', 'fall', 'down'],
            'hero_mara_b.png': ['walk0', 'walk1', 'walk2', 'walk3', 'walk4', 'walk5', 'toss', 'aim']},
    'tomas': {'hero_tomas.png': ['idle', 'walk0', 'walk1', 'walk2',
                                 'walk3', 'jab', 'cross', 'jumpkick',
                                 'hurt', 'fall', 'down', 'jump']},
    'bram': {'boss_bram.png': ['idle', 'walk0', 'walk1', 'walk2',
                               'walk3', 'windup', 'swing', 'cross',
                               'hurt', 'fall', 'down', 'charge']},
    'gator': {'boss_gator.png': ['idle', 'walk0', 'walk1', 'walk2',
                                 'walk3', 'aim', 'shoot', 'swing',
                                 'hurt', 'fall', 'down', 'toss']},
    'holloway': {'boss_holloway.png': ['idle', 'walk0', 'walk1', 'walk2',
                                       'walk3', 'windup', 'upper', 'charge',
                                       'hurt', 'fall', 'down', 'kick']},
    'vane': {'boss_vane.png': ['idle', 'walk0', 'walk1', 'walk2',
                               'walk3', 'windup', 'jab', 'kick',
                               'hurt', 'fall', 'down', 'upper']},
    'raptor_calm': {'raptor_calm.png': ['idle', 'walk0', 'walk1', 'walk2',
                                        'walk3', 'look', 'sniff', 'sit',
                                        'hurt', 'fall', 'down', 'alert']},
    'raptor_angry': {'raptor_angry.png': ['idle', 'walk0', 'walk1', 'walk2',
                                          'walk3', 'bite', 'claw', 'pounce',
                                          'hurt', 'fall', 'down', 'roar']},
    'rex': {'rex.png': ['idle', 'walk0', 'walk1', 'walk2',
                        'walk3', 'roar', 'bite', 'stomp',
                        'hurt', 'fall', 'down', 'pounce']},
    'punk': {'enemy_punk.png': ['idle', 'walk0', 'walk1', 'walk2',
                                'walk3', 'windup', 'jab', 'kick',
                                'hurt', 'fall', 'down', 'upper']},
    'knifer': {'enemy_knifer.png': ['idle', 'walk0', 'walk1', 'walk2',
                                    'walk3', 'windup', 'swing', 'jab',
                                    'hurt', 'fall', 'down', 'toss']},
    'brute': {'enemy_brute.png': ['idle', 'walk0', 'walk1', 'walk2',
                                  'walk3', 'windup', 'upper', 'charge',
                                  'hurt', 'fall', 'down', 'kick']},
    'gunner': {'enemy_gunner.png': ['idle', 'walk0', 'walk1', 'walk2',
                                    'walk3', 'aim', 'shoot', 'swing',
                                    'hurt', 'fall', 'down', 'toss']},
    'poacher': {'enemy_poacher.png': ['idle', 'walk0', 'walk1', 'walk2',
                                      'walk3', 'aim', 'shoot', 'swing',
                                      'hurt', 'fall', 'down', 'toss']},
}
# Icon sheets: single objects with no walk cycle. The anchor is where the object stands: 'bottom' for things
# that rest on the ground (feet / wheels), 'center' for things that float or lie flat.
ANCHORS = {'props': 'bottom', 'weapons': 'center', 'car': 'bottom', 'truck': 'bottom'}
CHARACTERS.update({
    'props': {'props_items.png': ['barrel', 'oil', 'crate', 'apple', 'burger',
                                  'meat', 'fish', 'scrap', 'gold', 'ammo']},
    'weapons': {'weapons.png': ['revolver', 'shotgun', 'rifle',
                                'smg', 'dynamite', 'pipe',
                                'machete', 'wrench', 'club']},
    'car': {'car_duchess.png': ['car']},
    'truck': {'truck_hauler.png': ['truck']},
})
TITLE = 'title.png'
# Background layers: file -> (stage index, layer name, keyed)
BACKGROUNDS = {
    'bg1_far.png': (0, 'far', False),
    'bg1_near.png': (0, 'near', True),
    'stage2_far.png': (1, 'far', False),
    'stage2_near.png': (1, 'near', True),
    'stage3_far.png': (2, 'far', False),
    'stage3_near.png': (2, 'near', True),
    'stage4_far.png': (3, 'far', False),
    'stage4_near.png': (3, 'near', True),
    'stage5_far.png': (4, 'far', False),
    'stage5_near.png': (4, 'near', True),
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
    holes = strong & ~outside & (m > 0.85)
    bg = outside | holes
    # semi-transparent things (steam, thin leaves) are pink-tinted blends of object and background.
    # Any weakly magenta region that touches the real background is treated as a blend and un-mixed.
    mm = np.clip((np.minimum(r, b) - g) / 255.0, 0, 1)
    weak = mm > 0.1
    labw, _ = ndimage.label(weak)
    touch = np.unique(labw[bg])
    touch = touch[touch > 0]
    zone = np.isin(labw, touch) & ~bg
    edge = ndimage.binary_dilation(bg, iterations=2) & ~bg & ~zone
    alpha = np.ones(m.shape, np.float32)
    alpha[bg] = 0
    alpha[edge] = 1 - m[edge]
    # a blend of object and magenta: assume the object itself is not magenta (min(r,b)-g about -40)
    alpha[zone] = np.clip(1 - mm[zone] * 255.0 / (255.0 + 40.0), 0.0, 1.0)
    key = np.median(rgb[bg], axis=0) if bg.any() else np.array([255, 0, 255], np.float32)
    near = (ndimage.distance_transform_edt(~bg) <= 10) | zone
    return alpha, key, near


def cut_out(path, strong_despill=False):
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
    if strong_despill:
        # stages without pink neon: remove magenta bleed anywhere (specks inside palm fronds, tinted smoke)
        r, g, b = out[..., 0], out[..., 1], out[..., 2]
        bleed = np.clip(np.minimum(r, b) - g, 0, None)
        out[..., 0] -= bleed
        out[..., 2] -= bleed
    rgba = np.dstack([out, alpha * 255]).round().astype(np.uint8)
    return rgba


def split_frames(rgba, names):
    solid = rgba[..., 3] > 40
    # grow shapes a little so loose bits (a thrown knife, a muzzle flash) stay with their pose;
    # grow less when poses sit so close that they merge
    for grow in (5, 2, 0):
        lab, count = ndimage.label(ndimage.binary_dilation(solid, iterations=grow) if grow else solid)
        if count >= len(names):
            break
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
        # the leading hand: the right-most solid pixels in the upper part of the pose (a fist, or a gun already held)
        alpha = crop[..., 3] > 40
        top = alpha[:max(1, int(h * 0.72))]
        cols = np.nonzero(top.any(axis=0))[0]
        hx = float(cols.max()) if cols.size else crop.shape[1] / 2.0
        rows = np.nonzero(top[:, max(0, int(hx) - 6):int(hx) + 1].any(axis=1))[0]
        hy = float(rows.mean()) if rows.size else h * 0.3
        frames[name] = {'img': crop, 'ax': ax, 'ay': float(h), 'hx': hx, 'hy': hy}
    return frames


def purple_to_glass(img):
    """Re-tint violet pixels (the car's windshield came out lilac) to pale blue glass."""
    from PIL import ImageColor  # noqa: F401  (kept local, only the car needs it)
    rgba = Image.fromarray(img, 'RGBA')
    hsv = np.asarray(rgba.convert('RGB').convert('HSV')).astype(np.float32)
    h, s, v = hsv[..., 0] * 360 / 255, hsv[..., 1] / 255, hsv[..., 2] / 255
    mask = (h > 245) & (h < 335) & (s > 0.12) & (v > 0.35)
    hsv[..., 0][mask] = 198 * 255 / 360
    hsv[..., 1][mask] = np.clip(s[mask] * 0.7, 0, 1) * 255
    out = np.asarray(Image.fromarray(hsv.astype(np.uint8), 'HSV').convert('RGB'))
    res = np.dstack([out, np.asarray(rgba)[..., 3]])
    return res


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
        table[n] = [x, y, w, h, round(frames[n]['ax'], 1), round(frames[n]['ay'], 1), round(frames[n].get('hx', 0), 1), round(frames[n].get('hy', 0), 1)]
    return Image.fromarray(atlas, 'RGBA'), table


def main():
    os.makedirs(SPRITES, exist_ok=True)
    os.makedirs(BGDIR, exist_ok=True)
    data = {'chars': {}, 'bg': {}}
    for char, sheets in CHARACTERS.items():
        frames = {}
        extra = []
        icon = char in ANCHORS
        for fname, names in sheets.items():
            sheet = split_frames(cut_out(os.path.join(INCOMING, fname), strong_despill=icon), names)
            frames.update(sheet)
            if 'idle' not in sheet:
                extra.append(sheet)
        if icon:
            if char == 'car':
                for f in frames.values():
                    f['img'] = purple_to_glass(f['img'])
            for f in frames.values():
                h, w = f['img'].shape[:2]
                f['ax'] = w / 2.0
                f['ay'] = float(h) if ANCHORS[char] == 'bottom' else h / 2.0
            atlas, table = pack(frames)
            atlas.save(os.path.join(SPRITES, char + '.png'), optimize=True)
            data['chars'][char] = {'src': 'assets/sprites/%s.png' % char, 'ref': 1, 'frames': table}
            print(char, atlas.size, len(table), 'icons')
            continue
        ref = frames['idle']['img'].shape[0]
        # sheets without an idle pose (e.g. a separate walk cycle) may be drawn at another scale:
        # normalise their median height to the idle height
        for sheet in extra:
            s = ref / np.median([f['img'].shape[0] for f in sheet.values()])
            if abs(s - 1) <= 0.02:
                continue
            for f in sheet.values():
                img = Image.fromarray(f['img'], 'RGBA')
                img = img.resize((max(1, round(img.width * s)), max(1, round(img.height * s))), Image.LANCZOS)
                f['img'] = np.asarray(img); f['ax'] *= s; f['ay'] *= s; f['hx'] *= s; f['hy'] *= s
        # on-screen size is set from an upright pose: the walk frames (idle can be a crouch)
        walks = [f['img'].shape[0] for n, f in frames.items() if n.startswith('walk')]
        ref = float(np.median(walks)) if walks else ref
        atlas, table = pack(frames)
        out = os.path.join(SPRITES, char + '.png')
        atlas.save(out, optimize=True)
        data['chars'][char] = {'src': 'assets/sprites/%s.png' % char, 'ref': round(ref, 1), 'frames': table}
        print(char, atlas.size, len(table), 'frames, upright height', round(ref, 1))
    for fname, (stage, layer, keyed) in BACKGROUNDS.items():
        path = os.path.join(INCOMING, fname)
        if keyed:
            img = Image.fromarray(cut_out(path, strong_despill=stage > 0), 'RGBA')
        else:
            img = Image.open(path).convert('RGB')
        out = 'stage%d_%s.png' % (stage, layer)
        img.save(os.path.join(BGDIR, out), optimize=True)
        data['bg'].setdefault(str(stage), {})[layer] = 'assets/bg/' + out
        print(out, img.size, img.mode)
    title = Image.open(os.path.join(INCOMING, TITLE)).convert('RGB')
    title.save(os.path.join(BGDIR, 'title.jpg'), quality=90, optimize=True)
    data['title'] = 'assets/bg/title.jpg'
    print('title.jpg', title.size)
    with open(os.path.join(SPRITES, 'data.js'), 'w') as fh:
        fh.write('// generated by tools/build_sprites.py - do not edit\nwindow.SPRITE_DATA = ')
        fh.write(json.dumps(data, separators=(',', ':')))
        fh.write(';\n')


if __name__ == '__main__':
    main()
