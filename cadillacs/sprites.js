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
    const F = c.d.frames;
    if (e.carry && (a === 'idle' || a === 'walk') && F.throw) return F.throw; // both hands up holding something
    if (a === 'walk') return walkFrame(c, e);
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
  // The weapon a hero is holding, drawn at the leading hand of the current pose (frame[6], frame[7]).
  const HELD_LEN = { revolver: 46, shotgun: 92, rifle: 104, smg: 72, dynamite: 50, pipe: 84, machete: 80, wrench: 66, club: 80 };
  const GUN = { revolver: 1, shotgun: 1, rifle: 1, smg: 1 };
  function drawHeld(ctx, e, f, s, t) {
    const wc = chars.weapons, kind = e.weapon.kind, wf = wc && wc.d.frames[kind];
    if (!wc || !wc.img.ready || !wf || !HELD_LEN[kind]) return;
    const sc = HELD_LEN[kind] / s / wf[2];
    let ang = 0;
    if (GUN[kind]) ang = e.anim === 'aim' ? 0 : 0.18;
    else if (kind === 'dynamite') ang = -0.2;
    else if (e.anim === 'swing') ang = -1.7 + 2.5 * Math.min(1, (e.animT || 0) / 0.2); // sweeps down through the hit
    else ang = -1.0;                                                                 // resting on the shoulder
    const gripX = GUN[kind] ? wf[2] * 0.3 : wf[2] * 0.1, gripY = wf[3] * (GUN[kind] ? 0.55 : 0.5);
    ctx.save();
    ctx.translate(f[6] - f[4], f[7] - f[5]);
    ctx.rotate(ang);
    ctx.scale(sc, sc);
    ctx.drawImage(wc.img, wf[0], wf[1], wf[2], wf[3], -gripX, -gripY, wf[2], wf[3]);
    ctx.restore();
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
    const run = e.running && e.anim === 'walk';
    const k = e.hitKick || 0; // 1 right after a hit, fades to 0
    ctx.save();
    ctx.translate(x, y);
    // running leans the whole body forward and bounces harder; a hit snaps it back and squashes it
    ctx.rotate(dir * ((run ? 0.2 : 0) - k * 0.2));
    if (run) ctx.translate(0, -Math.abs(Math.sin((e.walkPh || 0) * 2)) * 4);
    ctx.scale(dir * s * (1 + k * 0.07), s * breathe * (1 - k * 0.07));
    ctx.drawImage(c.img, f[0], f[1], f[2], f[3], -f[4], -f[5], f[2], f[3]);
    if (flash && c.white) { ctx.globalAlpha = 0.75; ctx.drawImage(c.white, f[0], f[1], f[2], f[3], -f[4], -f[5], f[2], f[3]); ctx.globalAlpha = 1; }
    if (e.kind === 'player' && e.weapon && f[6]) drawHeld(ctx, e, f, s, t);
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

  // ---------------- props, pickups, vehicles, title ----------------
  const PROP_H = { barrel: 58, oil: 58, crate: 48 };
  const ITEM_H = { apple: 26, burger: 26, meat: 30, fish: 24, scrap: 26, gold: 22, ammo: 26 };
  const WEAPON_W = { revolver: 30, shotgun: 56, rifle: 62, smg: 44, dynamite: 38, pipe: 50, machete: 48, wrench: 40, club: 48 };
  function put(c, name, flash, h, w) {
    const f = c.d.frames[name];
    const s = h ? h / f[3] : w / f[2];
    ctx_scale(s, f, c, flash);
  }
  let _ctx = null;
  function ctx_scale(s, f, c, flash) {
    const ctx = _ctx;
    ctx.save();
    ctx.scale(s, s);
    ctx.drawImage(c.img, f[0], f[1], f[2], f[3], -f[4], -f[5], f[2], f[3]);
    if (flash && c.white) { ctx.globalAlpha = 0.75; ctx.drawImage(c.white, f[0], f[1], f[2], f[3], -f[4], -f[5], f[2], f[3]); }
    ctx.restore();
  }
  function ready(c) { return c && c.img.ready; }
  function drawProp(ctx, x, y, kind, hp, flash, noShadow) {
    const c = chars.props, name = kind === 'barrel' || kind === 'oil' ? kind : 'crate';
    if (!ready(c)) return false;
    ctx.save(); ctx.translate(x, y);
    if (!noShadow) { ctx.fillStyle = 'rgba(0,0,0,0.3)'; ctx.beginPath(); ctx.ellipse(0, 0, 24, 7, 0, 0, 6.28); ctx.fill(); }
    _ctx = ctx; put(c, name, flash, PROP_H[name]);
    ctx.restore();
    return true;
  }
  function drawItem(ctx, x, y, kind, t) {
    const bob = Math.sin(t * 4 + x) * 2;
    if (ITEM_H[kind] && ready(chars.props)) {
      ctx.save(); ctx.translate(x, y - 6 + bob);
      ctx.fillStyle = 'rgba(0,0,0,0.3)'; ctx.beginPath(); ctx.ellipse(0, 6 - bob, 14, 4, 0, 0, 6.28); ctx.fill();
      _ctx = ctx; put(chars.props, kind, false, ITEM_H[kind]);
      ctx.restore(); return true;
    }
    if (WEAPON_W[kind] && ready(chars.weapons)) {
      ctx.save(); ctx.translate(x, y - 6 + bob);
      ctx.fillStyle = 'rgba(0,0,0,0.3)'; ctx.beginPath(); ctx.ellipse(0, 6 - bob, 16, 4, 0, 0, 6.28); ctx.fill();
      ctx.translate(0, -12); ctx.rotate(-0.3);
      _ctx = ctx; put(chars.weapons, kind, false, 0, WEAPON_W[kind]);
      ctx.restore(); return true;
    }
    return false;
  }
  const CAR_W = 330;
  function drawCar(ctx, x, y, t, look, riders, flash) {
    const c = chars.car;
    if (!ready(c)) return false;
    const f = c.d.frames.car, s = CAR_W / f[2], H = f[3] * s;
    ctx.save(); ctx.translate(x + 10, y + 3);
    ctx.fillStyle = 'rgba(0,0,0,0.35)'; ctx.beginPath(); ctx.ellipse(0, 1, 150, 15, 0, 0, 6.28); ctx.fill();
    ctx.translate(0, Math.sin(t * 18) * 1.2);
    _ctx = ctx; put(c, 'car', flash, 0, CAR_W);
    // riders: head and chest only, clipped at the top of the doors
    const beltY = -H * 0.66;
    (riders || []).forEach((r, i) => {
      const rc = r.look && r.look.sprite && chars[r.look.sprite];
      if (!ready(rc)) return;
      const rf = rc.d.frames.idle, rs = 0.55 * TARGET_H * (r.look.h || 1) * (r.look.hs || 1) / rc.d.ref;
      const rx = 2 - i * 32; // the first player drives, the others sit behind
      ctx.save();
      ctx.beginPath(); ctx.rect(rx - 60, -H * 1.6, 120, H * 1.6 + beltY); ctx.clip();
      ctx.translate(rx, beltY + 34); ctx.scale(rs, rs);
      ctx.drawImage(rc.img, rf[0], rf[1], rf[2], rf[3], -rf[4], -rf[5], rf[2], rf[3]);
      ctx.restore();
      if (r.firing > 0) { ctx.fillStyle = '#ffe28a'; ctx.beginPath(); ctx.arc(rx + 34, beltY - 6, 7, 0, 6.28); ctx.fill(); ctx.fillStyle = '#333'; ctx.fillRect(rx + 8, beltY - 9, 24, 5); }
    });
    ctx.restore();
    return true;
  }
  const TRUCK_W = 368;
  function drawTruck(ctx, x, y, t, flash, dmg) {
    const c = chars.truck;
    if (!ready(c)) return false;
    const f = c.d.frames.truck, s = TRUCK_W / f[2], H = f[3] * s;
    ctx.save(); ctx.translate(x, y + 4);
    ctx.fillStyle = 'rgba(0,0,0,0.35)'; ctx.beginPath(); ctx.ellipse(0, 0, 190, 18, 0, 0, 6.28); ctx.fill();
    ctx.translate(0, Math.sin(t * 14) * 1.5);
    _ctx = ctx; put(c, 'truck', flash, 0, TRUCK_W);
    for (let i = 0; i < dmg; i++) { ctx.fillStyle = 'rgba(15,15,15,0.4)'; ctx.beginPath(); ctx.arc(-150 + ((i * 97) % 300), -H * 0.75 + ((i * 53) % 90), 9, 0, 6.28); ctx.fill(); }
    if (dmg >= 6) for (let i = 0; i < 5; i++) { const k = (t * 0.8 + i * 0.2) % 1; ctx.fillStyle = 'rgba(40,40,40,' + (0.55 * (1 - k)) + ')'; ctx.beginPath(); ctx.arc(120 + Math.sin(k * 6 + i) * 8, -H * 0.55 - k * 70, 10 + k * 16, 0, 6.28); ctx.fill(); }
    ctx.restore();
    return true;
  }
  const titleImg = DATA.title ? load(DATA.title) : null;
  function drawTitle(ctx, W, H, t) {
    if (!titleImg || !titleImg.ready) return false;
    const z = 1.04 + 0.02 * Math.sin(t * 0.25), ox = Math.sin(t * 0.17) * 8;
    ctx.save();
    ctx.translate(W / 2 + ox, H / 2); ctx.scale(z, z);
    ctx.drawImage(titleImg, -W / 2, -H / 2, W, H);
    ctx.restore();
    const g = ctx.createLinearGradient(W * 0.4, 0, W, 0); g.addColorStop(0, 'rgba(5,5,15,0)'); g.addColorStop(1, 'rgba(5,5,15,0.4)');
    ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
    const v = ctx.createRadialGradient(W / 2, H / 2, H * 0.45, W / 2, H / 2, H * 0.95); v.addColorStop(0, 'rgba(0,0,0,0)'); v.addColorStop(1, 'rgba(0,0,0,0.45)');
    ctx.fillStyle = v; ctx.fillRect(0, 0, W, H);
    return true;
  }

  window.SPR = { drawBg, drawHuman, drawDino, hasDino, drawProp, drawItem, drawCar, drawTruck, drawTitle };
})();
