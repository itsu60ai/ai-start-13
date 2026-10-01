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
  // Draw img to fill the screen height, repeating sideways. Neighbouring copies overlap and the left edge of
  // each copy fades in, so the seam dissolves instead of showing a hard cut or a mirrored image.
  const OVERLAP = 0.14;
  function softTile(img) {
    if (img.soft) return img.soft;
    const c = document.createElement('canvas');
    c.width = img.width; c.height = img.height;
    const x = c.getContext('2d');
    x.drawImage(img, 0, 0);
    const g = x.createLinearGradient(0, 0, img.width * OVERLAP, 0);
    g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(1, 'rgba(0,0,0,1)');
    x.globalCompositeOperation = 'destination-in';
    x.fillStyle = g; x.fillRect(0, 0, img.width, img.height);
    img.soft = c;
    return c;
  }
  function tile(ctx, img, off, W, H) {
    const dw = img.width * H / img.height, pitch = dw * (1 - OVERLAP);
    const t = softTile(img);
    let i = Math.floor(off / pitch);
    for (let x = i * pitch - off; x < W; x += pitch, i++) ctx.drawImage(t, x, 0, dw, H);
  }
  function drawBg(ctx, stage, camX, t, W, H) {
    const L = layers[stage];
    if (!L || !L.far || !L.far.ready || (L.near && !L.near.ready)) return false;
    tile(ctx, L.far, camX * 0.15, W, H);
    if (L.near) tile(ctx, L.near, camX, W, H);
    return true;
  }

  // ---------------- characters ----------------
  // animation -> frames to try, in order; each character sheet has a different set of poses
  const CHOICES = {
    idle: ['idle'], windup: ['windup', 'idle'], aim: ['aim', 'jab', 'idle'],
    jab: ['jab', 'swing', 'cross', 'idle'], cross: ['cross', 'jab', 'swing', 'idle'], swing: ['swing', 'cross', 'jab', 'idle'],
    upper: ['upper', 'jab', 'idle'], kick: ['kick', 'jab', 'idle'], charge: ['charge', 'walk'],
    jump: ['jump', 'idle'], jumpkick: ['jumpkick', 'kick', 'jump'], grab: ['grab', 'jab', 'idle'],
    throw: ['throw', 'toss', 'swing', 'idle'], toss: ['toss', 'throw', 'swing', 'idle'], spin: ['cross', 'swing', 'kick'],
    hurt: ['hurt'], fall: ['fall', 'hurt'], down: ['down']
  };
  function walkFrame(c, e) {
    let n = c.walkN;
    if (n === undefined) { n = 0; while (c.d.frames['walk' + n]) n++; c.walkN = n; }
    if (!n) return null;
    const ph = ((e.walkPh || 0) % 6.2832 + 6.2832) % 6.2832;
    return c.d.frames['walk' + (Math.floor(ph / 6.2832 * n) % n)];
  }
  function pick(c, e) {
    const a = e.anim || 'idle';
    if (a === 'walk') return walkFrame(c, e);
    const F = c.d.frames;
    // the moment of firing: the game restarts 'aim' when the shot leaves the barrel
    if (a === 'aim' && e.st !== 'wind' && (e.animT || 0) < 0.18 && F.shoot) return F.shoot;
    if (a === 'grab' && e.kneeT > 0 && F.kick) return F.kick;
    // hero specials: a slam is an 'upper' while airborne, a hammer fan is an 'aim' just after the special fired
    if (a === 'upper' && e.slam && F.slam) return F.slam;
    if (a === 'aim' && e.specCd > 0.55 && F.fan) return F.fan;
    if (a === 'spin' && F.spin) return F.spin;
    const list = CHOICES[a];
    if (!list) return null;
    for (const n of list) {
      if (n === 'walk') return walkFrame(c, e);
      if (F[n]) return F[n];
    }
    return null;
  }
  function drawHuman(key, ctx, x, y, facing, e, t, flash) {
    const c = chars[key];
    if (!c || !c.img.ready) return false;
    const f = pick(c, e);
    if (!f) return false;
    const L = e.look || {};
    const s = TARGET_H * (L.h || 1) * (L.hs || 1) / c.d.ref;
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

  // ---------------- dinosaurs ----------------
  const DINO_H = { raptor: 100, rex: 85 }; // on-screen height at scale 1
  function dinoSheet(d) {
    if (d.kind === 'rex') return chars.rex;
    if (d.kind !== 'raptor') return null;
    return d.mood === 'enraged' ? chars.raptor_angry : chars.raptor_calm;
  }
  function dinoFrame(c, d, t) {
    const F = c.d.frames, st = d.st;
    if (st === 'down') return F.down;
    if (st === 'fall') return F.fall || F.hurt;
    if (st === 'hurt') return F.hurt;
    if (st === 'act') {
      if (d.kind === 'rex') { if ((d.actDur || 0) >= 0.99) return F.roar; if ((d.actDur || 0) >= 0.85) return F.stomp; return d.z > 5 ? F.pounce : F.bite; }
      return d.z > 5 ? (F.pounce || F.bite) : (F.bite || F.claw);
    }
    if (d.mood === 'exhausted') return F.sit || F.idle;
    if (d.mood === 'alert') return F.alert || F.idle;
    if (d.moving) {
      const ph = ((d.walkPh || 0) % 6.2832 + 6.2832) % 6.2832;
      return F['walk' + (Math.floor(ph / 6.2832 * 4) % 4)] || F.idle;
    }
    // calm animals fidget now and then
    if (d.mood === 'calm') { const k = Math.floor(t * 0.4 + (d.id || 0) * 1.7) % 6; if (k === 4 && F.look) return F.look; if (k === 5 && F.sniff) return F.sniff; }
    return F.idle;
  }
  function hasDino(d) { const c = dinoSheet(d); return !!(c && c.img.ready); }
  function drawDino(ctx, x, y, facing, d, t, flash) {
    const c = dinoSheet(d);
    if (!c || !c.img.ready) return false;
    const f = dinoFrame(c, d, t);
    if (!f) return false;
    // both raptor sheets share one scale, otherwise the hunched angry pose would be drawn larger
    const ref = d.kind === 'raptor' ? chars.raptor_calm.d.ref : c.d.ref;
    const s = DINO_H[d.kind] * (d.scale || 1) / ref;
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(facing * s, s);
    ctx.drawImage(c.img, f[0], f[1], f[2], f[3], -f[4], -f[5], f[2], f[3]);
    if (flash && c.white) { ctx.globalAlpha = 0.75; ctx.drawImage(c.white, f[0], f[1], f[2], f[3], -f[4], -f[5], f[2], f[3]); }
    ctx.restore();
    return true;
  }

  window.SPR = { drawBg, drawHuman, drawDino, hasDino };
})();
