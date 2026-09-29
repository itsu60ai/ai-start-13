// sprites.js - painted art (characters and stage layers) from assets/, built by tools/build_sprites.py.
// Anything without painted art keeps the procedural drawing in art.js / backgrounds.js.
(function () {
  'use strict';
  const DATA = window.SPRITE_DATA || { chars: {}, bg: {} };
  const TARGET_H = 132; // on-screen height of a standing character with look.h = 1 (matches art.js)

  function load(src, onload) {
    const img = new Image();
    img.onload = function () { img.ready = true; if (onload) onload(img); };
    img.src = src;
    return img;
  }
  // white silhouette of an atlas, for the hit flash
  function whiteOf(img) {
    const c = document.createElement('canvas');
    c.width = img.width; c.height = img.height;
    const x = c.getContext('2d');
    x.drawImage(img, 0, 0);
    x.globalCompositeOperation = 'source-in';
    x.fillStyle = '#fff'; x.fillRect(0, 0, c.width, c.height);
    return c;
  }

  const chars = {};
  for (const k in DATA.chars) {
    const d = DATA.chars[k];
    chars[k] = { d, img: load(d.src, function (img) { chars[k].white = whiteOf(img); }), white: null };
  }
  const layers = {};
  for (const s in DATA.bg) {
    layers[s] = {};
    for (const name in DATA.bg[s]) layers[s][name] = load(DATA.bg[s][name]);
  }

  // ---------------- stage layers ----------------
  // Draw img to fill the screen height, repeating sideways. Every other copy is mirrored so the seams always match.
  function tile(ctx, img, off, W, H) {
    const dw = img.width * H / img.height;
    let i = Math.floor(off / dw);
    for (let x = i * dw - off; x < W; x += dw, i++) {
      if (i & 1) { ctx.save(); ctx.translate(x + dw, 0); ctx.scale(-1, 1); ctx.drawImage(img, 0, 0, dw, H); ctx.restore(); }
      else ctx.drawImage(img, x, 0, dw, H);
    }
  }
  function drawBg(ctx, stage, camX, t, W, H) {
    const L = layers[stage];
    if (!L || !L.far || !L.far.ready || (L.near && !L.near.ready)) return false;
    tile(ctx, L.far, camX * 0.15, W, H);
    if (L.near) tile(ctx, L.near, camX, W, H);
    return true;
  }

  // ---------------- characters ----------------
  const SIMPLE = { idle: 'idle', windup: 'idle', jab: 'jab', aim: 'jab', cross: 'cross', swing: 'cross', upper: 'upper', kick: 'kick', jump: 'jump', jumpkick: 'jumpkick', grab: 'grab', throw: 'throw', toss: 'throw', hurt: 'hurt', fall: 'fall', down: 'down' };
  function pick(e) {
    const a = e.anim || 'idle';
    if (a === 'walk' || a === 'charge') {
      const ph = ((e.walkPh || 0) % 6.2832 + 6.2832) % 6.2832;
      return 'walk' + (Math.floor(ph / 6.2832 * 8) % 8);
    }
    if (a === 'grab' && e.kneeT > 0) return 'kick';
    if (a === 'spin') return 'cross';
    return SIMPLE[a] || null;
  }
  function drawHuman(key, ctx, x, y, facing, e, t, flash) {
    const c = chars[key];
    if (!c || !c.img.ready) return false;
    const name = pick(e);
    const f = name && c.d.frames[name];
    if (!f) return false;
    const L = e.look || {};
    const s = TARGET_H * (L.h || 1) / c.d.ref;
    let dir = facing;
    if (e.anim === 'spin') dir *= Math.floor((e.animT || 0) * 14) % 2 ? -1 : 1;
    const breathe = e.anim === 'idle' || !e.anim ? 1 + 0.012 * Math.sin(t * 3 + (e.id || 0)) : 1;
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(dir * s, s * breathe);
    ctx.drawImage(c.img, f[0], f[1], f[2], f[3], -f[4], -f[5], f[2], f[3]);
    if (flash && c.white) { ctx.globalAlpha = 0.75; ctx.drawImage(c.white, f[0], f[1], f[2], f[3], -f[4], -f[5], f[2], f[3]); }
    ctx.restore();
    return true;
  }

  window.SPR = { drawBg, drawHuman };
})();
