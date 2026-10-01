// art.js - procedural character, dinosaur, vehicle and item art (no image files)
(function () {
  const cache = new Map();
  function shade(hex, amt) {
    const k = hex + amt;
    if (cache.has(k)) return cache.get(k);
    let c = hex.replace('#', '');
    if (c.length === 3) c = c.split('').map(x => x + x).join('');
    let r = parseInt(c.substr(0, 2), 16), g = parseInt(c.substr(2, 2), 16), b = parseInt(c.substr(4, 2), 16);
    if (amt < 0) { r *= 1 + amt; g *= 1 + amt; b *= 1 + amt; }
    else { r += (255 - r) * amt; g += (255 - g) * amt; b += (255 - b) * amt; }
    const out = 'rgb(' + (r | 0) + ',' + (g | 0) + ',' + (b | 0) + ')';
    cache.set(k, out);
    return out;
  }
  const OUT = '#120c10';
  const dir = (a, l) => [Math.sin(a) * l, Math.cos(a) * l];

  function limb(ctx, x1, y1, x2, y2, w, col, outline) {
    ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2);
    if (outline) { ctx.strokeStyle = OUT; ctx.lineWidth = w + 4; ctx.stroke(); return; }
    ctx.strokeStyle = col; ctx.lineWidth = w; ctx.stroke();
    ctx.strokeStyle = shade(col, 0.25); ctx.lineWidth = w * 0.35;
    ctx.beginPath(); ctx.moveTo(x1 - w * 0.18, y1 - w * 0.18); ctx.lineTo(x2 - w * 0.18, y2 - w * 0.18); ctx.stroke();
  }
  function circ(ctx, x, y, r, col, outline) {
    ctx.beginPath(); ctx.arc(x, y, outline ? r + 2 : r, 0, 6.2832);
    ctx.fillStyle = outline ? OUT : col; ctx.fill();
  }

  // pose: angles in radians measured from straight down, positive = toward facing
  const BASE = { hipY: -54, lean: 0.06, fh1: 0.12, fh2: 0.18, lh1: -0.12, lh2: 0.2, fa1: 0.45, fa2: 1.7, la1: 0.3, la2: 1.8, head: 0, rot: 0, by: 0 };

  function poseFor(e, t) {
    const p = Object.assign({}, BASE);
    const s = e.anim || 'idle', k = e.animT || 0;
    const ext = k < 0.35 ? k / 0.35 : Math.max(0, 1 - (k - 0.35) / 0.65);
    if (s === 'idle') { p.by = Math.sin(t * 3 + (e.id || 0)) * 1.2; }
    else if (s === 'walk') {
      const ph = e.walkPh || 0, sw = Math.sin(ph);
      p.fh1 = sw * 0.55; p.lh1 = -sw * 0.55;
      p.fh2 = 0.2 + Math.max(0, -Math.cos(ph)) * 0.7; p.lh2 = 0.2 + Math.max(0, Math.cos(ph)) * 0.7;
      p.fa1 = 0.4 - sw * 0.35; p.la1 = 0.3 + sw * 0.35; p.by = -Math.abs(Math.cos(ph)) * 2.5;
    } else if (s === 'jab') { p.fa1 = 0.5 + ext * 1.15; p.fa2 = 1.7 * (1 - ext); p.lean += ext * 0.18; }
    else if (s === 'cross') { p.la1 = 0.3 + ext * 1.3; p.la2 = 1.8 * (1 - ext); p.lean += ext * 0.3; p.fa1 = 0.2; }
    else if (s === 'kick') { p.fh1 = ext * 1.7; p.fh2 = (1 - ext) * 1.3; p.lean = -0.25 * ext; p.lh1 = -0.2; p.fa1 = -0.3 * ext; }
    else if (s === 'upper') { p.fa1 = 0.5 + ext * 2.4; p.fa2 = 1.2 * (1 - ext) + 0.3; p.lean = 0.2 - ext * 0.4; p.hipY = -50 - ext * 6; }
    else if (s === 'jump') { p.fh1 = 0.9; p.fh2 = 1.5; p.lh1 = 0.3; p.lh2 = 1.3; p.fa1 = 1.8; p.la1 = 2.1; p.fa2 = 0.6; p.la2 = 0.6; }
    else if (s === 'jumpkick') { p.fh1 = 1.45; p.fh2 = 0.05; p.lh1 = -0.5; p.lh2 = 1.3; p.lean = -0.35; p.fa1 = -0.4; p.la1 = 0.9; }
    else if (s === 'hurt') { p.lean = -0.4; p.head = -0.3; p.fa1 = -0.5; p.la1 = -0.7; p.fa2 = 0.4; p.la2 = 0.4; }
    else if (s === 'down') { p.rot = -1.5; p.fh1 = 0.3; p.lh1 = -0.2; p.fa1 = 2.5; p.la1 = 2.9; p.fa2 = 0.3; p.la2 = 0.3; p.head = -0.2; }
    else if (s === 'fall') { p.rot = -0.9 * Math.min(1, k * 2); p.fa1 = 2; p.la1 = 2.5; p.fh1 = 0.6; p.lh1 = 0.1; }
    else if (s === 'spin') { p.fa1 = 1.57; p.la1 = -1.57; p.fa2 = 0; p.la2 = 0; p.fh1 = 0.5; p.lh1 = -0.5; }
    else if (s === 'grab') { p.fa1 = 1.3; p.fa2 = 0.4; p.la1 = 1.2; p.la2 = 0.5; p.lean = 0.15; if (e.kneeT > 0) { p.fh1 = 1.4; p.fh2 = 1.7; } }
    else if (s === 'throw') { p.lean = -0.35 + k * 0.8; p.fa1 = 3 - k * 2; p.la1 = 3 - k * 2; p.fa2 = 0.2; p.la2 = 0.2; }
    else if (s === 'aim') { p.fa1 = 1.57; p.fa2 = 0; p.la1 = 1.35; p.la2 = 0.35; p.lean = 0.02; if (k < 0.3) p.lean = -0.08; }
    else if (s === 'swing') { p.fa1 = 2.9 - ext * 2.2; p.fa2 = 0.3; p.lean = ext * 0.25; }
    else if (s === 'toss') { p.fa1 = -0.6 + ext * 2.4; p.fa2 = 0.3; p.lean = ext * 0.2; }
    else if (s === 'windup') { p.fa1 = -0.3; p.fa2 = 1.6; p.lean = -0.15; p.hipY = -50; }
    else if (s === 'charge') { p.lean = 0.5; p.fa1 = 0.4; p.la1 = 0.2; p.fh1 = Math.sin(t * 20) * 0.7; p.lh1 = -p.fh1; }
    else if (s === 'drive') { p.hipY = -30; p.fa1 = 1.3; p.fa2 = 0.4; p.fh1 = 1.5; p.lh1 = 1.4; }
    return p;
  }

  // look: {skin,hair,hairStyle,top,topStyle,pants,boots,accent,h,w,belly,beard,goggles,bandana,arm}
  function drawHuman(ctx, x, y, facing, e, t, flash) {
    if (e.look && e.look.sprite && window.SPR && window.SPR.drawHuman(e.look.sprite, ctx, x, y, facing, e, t, flash)) return;
    const L = e.look, p = poseFor(e, t);
    const s = (L.h || 1) * 1.15, wd = L.w || 1;
    const C = flash ? (() => '#ffffff') : (c => c);
    ctx.save();
    ctx.translate(x, y + p.by);
    ctx.scale(facing * s, s);
    if (p.rot) { ctx.translate(0, -6); ctx.rotate(p.rot); }
    ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    const hip = [0, p.hipY];
    const T = 36;
    const neck = [hip[0] + Math.sin(p.lean) * T, hip[1] - Math.cos(p.lean) * T];
    const sh = [neck[0] - Math.sin(p.lean) * 4, neck[1] + Math.cos(p.lean) * 4];
    const headC = [neck[0] + Math.sin(p.lean + p.head) * 12, neck[1] - Math.cos(p.lean + p.head) * 12];
    const legPts = (h1, h2) => { const d1 = dir(h1, 27), kn = [hip[0] + d1[0], hip[1] + d1[1]]; const d2 = dir(h1 - h2, 27); return [kn, [kn[0] + d2[0], kn[1] + d2[1]]]; };
    const armPts = (a1, a2) => { const d1 = dir(a1, 19), el = [sh[0] + d1[0], sh[1] + d1[1]]; const d2 = dir(a1 + a2, 19); return [el, [el[0] + d2[0], el[1] + d2[1]]]; };
    const [fk, ff] = legPts(p.fh1, p.fh2), [bk, bf] = legPts(p.lh1, p.lh2);
    const [fe, fhd] = armPts(p.fa1, p.fa2), [be, bhd] = armPts(p.la1, p.la2);
    const sleeve = L.topStyle === 'tank' ? L.skin : L.top;
    const armCol = L.arm ? '#8a8f98' : sleeve;
    const lw = 11 * wd, aw = 8.5 * wd;

    const drawArm = (el, hd, o, back, mech) => {
      const dim = back ? -0.25 : 0;
      limb(ctx, sh[0], sh[1], el[0], el[1], aw, C(shade(mech ? armCol : sleeve, dim)), o);
      limb(ctx, el[0], el[1], hd[0], hd[1], aw * 0.9, C(shade(mech ? '#9aa0aa' : (L.topStyle === 'coat' ? L.top : L.skin), dim)), o);
      circ(ctx, hd[0], hd[1], 5.2 * wd, C(shade(mech ? '#b0b6bf' : L.skin, dim)), o);
    };
    const drawLeg = (kn, ft, o, back, kick) => {
      const dim = back ? -0.25 : 0;
      limb(ctx, hip[0], hip[1], kn[0], kn[1], lw, C(shade(L.pants, dim)), o);
      limb(ctx, kn[0], kn[1], ft[0], ft[1], lw * 0.85, C(shade(L.pants, dim)), o);
      // boot
      const bx = ft[0], by = ft[1];
      ctx.beginPath(); ctx.ellipse(bx + 4, by - 1, o ? 10 : 8, o ? 6 : 4.5, 0, 0, 6.28);
      ctx.fillStyle = o ? OUT : C(shade(L.boots, dim)); ctx.fill();
    };
    const drawTorso = (o) => {
      const bw = 10 * wd + (L.belly || 0);
      const nx = -Math.cos(p.lean), ny = -Math.sin(p.lean);
      ctx.beginPath();
      ctx.moveTo(hip[0] - bw * 0.9 * nx * -1 - 7 * wd, hip[1] + 4);
      ctx.quadraticCurveTo(hip[0] + bw + 4, hip[1] - 14, neck[0] + 9 * wd, neck[1] + 3);
      ctx.lineTo(neck[0] - 9 * wd, neck[1] + 1);
      ctx.quadraticCurveTo(hip[0] - bw - 2, hip[1] - 18, hip[0] - 8 * wd, hip[1] + 4);
      ctx.closePath();
      if (o) { ctx.strokeStyle = OUT; ctx.lineWidth = 4; ctx.stroke(); return; }
      const g = ctx.createLinearGradient(hip[0] - 12, 0, hip[0] + 14, 0);
      g.addColorStop(0, C(shade(L.top, -0.3))); g.addColorStop(0.6, C(L.top)); g.addColorStop(1, C(shade(L.top, 0.2)));
      ctx.fillStyle = flash ? '#fff' : g; ctx.fill();
      if (L.topStyle === 'tank') { ctx.fillStyle = C(L.skin); ctx.beginPath(); ctx.arc(neck[0] + 2, neck[1] + 5, 6 * wd, 0, 6.28); ctx.fill(); }
      if (L.topStyle === 'vest' || L.topStyle === 'jumpsuit') { ctx.strokeStyle = C(L.accent); ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(neck[0] + 3, neck[1] + 4); ctx.lineTo(hip[0] + 4, hip[1] - 4); ctx.stroke(); }
      if (L.stripe) { ctx.strokeStyle = C(L.accent); ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(neck[0] - 4, neck[1] + 8); ctx.lineTo(hip[0] - 3, hip[1] - 2); ctx.stroke(); }
      // belt
      ctx.fillStyle = C('#2a1d16'); ctx.fillRect(hip[0] - 10 * wd, hip[1] - 4, 20 * wd + (L.belly || 0), 6);
      ctx.fillStyle = C('#d8b24a'); ctx.fillRect(hip[0] + 2, hip[1] - 3, 5, 4);
    };
    const drawHead = (o) => {
      const [hx, hy] = headC;
      ctx.save(); ctx.translate(hx, hy); ctx.rotate(p.lean * 0.5 + p.head);
      if (o) { ctx.beginPath(); ctx.ellipse(0, 0, 13, 14.5, 0, 0, 6.28); ctx.fillStyle = OUT; ctx.fill(); ctx.restore(); return; }
      // hair back
      if (L.hairStyle === 'long' || L.hairStyle === 'braid') { ctx.fillStyle = C(L.hair); ctx.beginPath(); ctx.ellipse(-6, 6, 7, 13, 0.2, 0, 6.28); ctx.fill(); }
      const g = ctx.createRadialGradient(3, -3, 2, 0, 0, 14);
      g.addColorStop(0, C(shade(L.skin, 0.15))); g.addColorStop(1, C(shade(L.skin, -0.2)));
      ctx.fillStyle = flash ? '#fff' : g; ctx.beginPath(); ctx.ellipse(0, 0, 11, 12.5, 0, 0, 6.28); ctx.fill();
      ctx.beginPath(); ctx.moveTo(9, -2); ctx.lineTo(13.5, 2); ctx.lineTo(9, 4); ctx.fill(); // nose
      ctx.fillStyle = C(shade(L.skin, -0.15)); ctx.beginPath(); ctx.ellipse(-3, 1, 3, 4, 0, 0, 6.28); ctx.fill(); // ear
      ctx.fillStyle = C('#fff'); ctx.fillRect(4, -3, 4, 3);
      ctx.fillStyle = C('#1a1a1a'); ctx.fillRect(6, -3, 2, 3);
      ctx.fillRect(3, -6.5, 6, 1.6);
      if (L.beard) { ctx.fillStyle = C(L.beard); ctx.beginPath(); ctx.moveTo(-4, 3); ctx.quadraticCurveTo(4, 17, 12, 5); ctx.lineTo(10, 3); ctx.quadraticCurveTo(3, 8, -4, 3); ctx.fill(); }
      ctx.fillStyle = C(L.hair);
      const hs = L.hairStyle;
      if (hs === 'short' || hs === 'curly') { ctx.beginPath(); ctx.ellipse(-1, -7, 12, 7.5, -0.15, Math.PI * 0.95, Math.PI * 2.1); ctx.fill(); if (hs === 'curly') for (let i = 0; i < 5; i++) { ctx.beginPath(); ctx.arc(-9 + i * 4, -10 + Math.abs(i - 2), 3.6, 0, 6.28); ctx.fill(); } }
      else if (hs === 'long' || hs === 'braid') { ctx.beginPath(); ctx.ellipse(-1, -6, 12.5, 8, -0.1, Math.PI * 0.9, Math.PI * 2.1); ctx.fill(); if (hs === 'braid') { for (let i = 0; i < 4; i++) { ctx.beginPath(); ctx.arc(-11 - i * 1.5, 8 + i * 6, 3.6, 0, 6.28); ctx.fill(); } } }
      else if (hs === 'mohawk') { ctx.beginPath(); ctx.moveTo(-8, -6); ctx.lineTo(-4, -22); ctx.lineTo(2, -18); ctx.lineTo(6, -11); ctx.fill(); }
      else if (hs === 'buzz') { ctx.beginPath(); ctx.ellipse(-1, -7, 11.5, 6, -0.1, Math.PI, Math.PI * 2.05); ctx.fill(); }
      else if (hs === 'cap') { ctx.fillStyle = C(L.accent); ctx.beginPath(); ctx.ellipse(-1, -8, 12, 7, 0, Math.PI, Math.PI * 2); ctx.fill(); ctx.fillRect(4, -9, 12, 3); }
      else if (hs === 'helmet') { ctx.fillStyle = C('#3b3f46'); ctx.beginPath(); ctx.ellipse(0, -4, 13, 11, 0, Math.PI * 0.9, Math.PI * 2.1); ctx.fill(); ctx.fillStyle = C('#e23b2e'); ctx.fillRect(2, -5, 11, 3); }
      if (L.goggles) { ctx.fillStyle = C('#3a2a1a'); ctx.fillRect(-10, -11, 22, 3); ctx.fillStyle = C('#7fd6ff'); ctx.beginPath(); ctx.arc(7, -10, 3.4, 0, 6.28); ctx.fill(); }
      if (L.bandana) { ctx.fillStyle = C(L.bandana); ctx.fillRect(-11, -9, 22, 4); ctx.beginPath(); ctx.moveTo(-10, -8); ctx.lineTo(-18, -4); ctx.lineTo(-16, -1); ctx.fill(); }
      if (L.shades) { ctx.fillStyle = C('#111'); ctx.fillRect(2, -4.5, 10, 3.5); }
      ctx.restore();
    };
    for (const o of [true, false]) {
      drawArm(be, bhd, o, true, false);
      drawLeg(bk, bf, o, true);
      drawLeg(fk, ff, o, false);
      drawTorso(o);
      drawHead(o);
      if (!o && e.weapon) drawHeldWeapon(ctx, fe, fhd, p.fa1 + p.fa2, e.weapon, e.anim);
      drawArm(fe, fhd, o, false, !!L.arm);
    }
    ctx.restore();
  }

  function drawHeldWeapon(ctx, el, hd, ang, w, anim) {
    ctx.save(); ctx.translate(hd[0], hd[1]); ctx.rotate(-ang + Math.PI / 2);
    // now +x points along forearm direction
    const k = w.kind;
    if (k === 'pipe' || k === 'wrench' || k === 'machete' || k === 'club') {
      ctx.rotate(-Math.PI / 2);
      if (k === 'machete') { ctx.fillStyle = '#d7dde4'; ctx.beginPath(); ctx.moveTo(-2, 0); ctx.lineTo(3, -34); ctx.lineTo(7, -30); ctx.lineTo(3, 0); ctx.fill(); ctx.fillStyle = '#4a2b17'; ctx.fillRect(-3, -2, 7, 10); }
      else { ctx.strokeStyle = OUT; ctx.lineWidth = 7; ctx.beginPath(); ctx.moveTo(0, 8); ctx.lineTo(0, -34); ctx.stroke(); ctx.strokeStyle = k === 'wrench' ? '#b9c2cc' : k === 'club' ? '#6b4a2a' : '#8d99a6'; ctx.lineWidth = 4; ctx.stroke(); if (k === 'wrench') { ctx.fillStyle = '#b9c2cc'; ctx.fillRect(-6, -40, 12, 7); } }
    } else if (k === 'dynamite' || k === 'molotov') {
      ctx.fillStyle = k === 'dynamite' ? '#c9302c' : '#3f7d3a'; ctx.fillRect(-3, -10, 7, 14);
    } else {
      const len = k === 'rifle' ? 44 : k === 'shotgun' ? 40 : k === 'smg' ? 26 : 18;
      ctx.fillStyle = OUT; ctx.fillRect(-4, -6, len + 4, 9);
      ctx.fillStyle = k === 'smg' ? '#3d4550' : '#2b2f36'; ctx.fillRect(-2, -4.5, len, 5);
      if (k === 'rifle' || k === 'shotgun') { ctx.fillStyle = '#6b4424'; ctx.fillRect(-14, -4, 14, 7); }
      ctx.fillStyle = '#6b4424'; ctx.fillRect(-2, 0, 5, 8);
    }
    ctx.restore();
  }

  // ---------- dinosaurs ----------
  function drawDino(ctx, x, y, facing, d, t, flash) {
    if (window.SPR && window.SPR.drawDino(ctx, x, y, facing, d, t, flash)) return;
    const s = d.scale || 1;
    const col = flash ? '#fff' : d.color, belly = flash ? '#fff' : d.belly;
    const mood = d.mood || 'calm';
    ctx.save(); ctx.translate(x, y); ctx.scale(facing * s, s);
    ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    const ph = d.walkPh || 0, moving = d.moving;
    const bob = moving ? Math.sin(ph * 2) * 2 : Math.sin(t * 2) * 1;
    const bodyY = -46 + bob + (d.pounce ? -6 : 0);
    const isRex = d.kind === 'rex';
    const jaw = d.jaw || 0;
    // tail
    const tail = (o) => {
      ctx.beginPath(); ctx.moveTo(-18, bodyY - 4);
      const sw = Math.sin(t * 3 + ph) * 6;
      ctx.quadraticCurveTo(-50, bodyY - 12 + sw, -86, bodyY - 20 + sw * 1.6);
      ctx.quadraticCurveTo(-52, bodyY + 6 + sw, -14, bodyY + 12);
      ctx.closePath();
      if (o) { ctx.strokeStyle = OUT; ctx.lineWidth = 5; ctx.stroke(); } else { ctx.fillStyle = shade(col, -0.1); ctx.fill(); }
    };
    const leg = (o, off, back) => {
      const a = moving ? Math.sin(ph + off) * 0.7 : 0.1;
      const hx = -6, hy = bodyY + 6;
      const kx = hx + Math.sin(a + 0.5) * 22, ky = hy + Math.cos(a + 0.5) * 20;
      const ax = kx + Math.sin(a - 0.9) * 18, ay = ky + Math.cos(a - 0.9) * 16;
      const fx = ax + 4, fy = 0;
      const c = back ? shade(col, -0.3) : col;
      limb(ctx, hx, hy, kx, ky, 14, c, o); limb(ctx, kx, ky, ax, ay, 9, c, o); limb(ctx, ax, ay, fx, fy, 7, c, o);
      if (!o) { ctx.fillStyle = '#e8e0cc'; ctx.beginPath(); ctx.moveTo(fx + 3, fy - 2); ctx.lineTo(fx + 12, fy); ctx.lineTo(fx + 3, fy + 1); ctx.fill(); }
    };
    for (const o of [true, false]) {
      leg(o, Math.PI, true);
      tail(o);
      // body
      ctx.beginPath(); ctx.ellipse(0, bodyY, 32, 18, -0.15, 0, 6.28);
      if (o) { ctx.strokeStyle = OUT; ctx.lineWidth = 5; ctx.stroke(); }
      else {
        const g = ctx.createLinearGradient(0, bodyY - 18, 0, bodyY + 18);
        g.addColorStop(0, shade(col, 0.15)); g.addColorStop(0.6, col); g.addColorStop(1, belly);
        ctx.fillStyle = flash ? '#fff' : g; ctx.fill();
        if (!flash && d.stripe) { ctx.strokeStyle = d.stripe; ctx.lineWidth = 3; for (let i = 0; i < 4; i++) { ctx.beginPath(); ctx.moveTo(-18 + i * 10, bodyY - 16); ctx.lineTo(-22 + i * 10, bodyY - 4); ctx.stroke(); } }
      }
      // neck + head
      const nx = isRex ? 26 : 24, ny = bodyY - (isRex ? 16 : 22);
      limb(ctx, 18, bodyY - 6, nx, ny, isRex ? 20 : 12, col, o);
      ctx.save(); ctx.translate(nx + 4, ny - 4); ctx.rotate(d.pounce ? 0.2 : Math.sin(t * 1.5) * 0.05);
      const hl = isRex ? 36 : 28, hh = isRex ? 16 : 10;
      ctx.beginPath(); ctx.moveTo(-6, -hh); ctx.quadraticCurveTo(hl * 0.6, -hh - 4, hl, -2); ctx.lineTo(hl, 2); ctx.lineTo(-4, 6); ctx.closePath();
      if (o) { ctx.strokeStyle = OUT; ctx.lineWidth = 5; ctx.stroke(); } else { ctx.fillStyle = shade(col, 0.08); ctx.fill(); }
      // jaw
      ctx.save(); ctx.translate(-2, 4); ctx.rotate(jaw * 0.5);
      ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(hl - 4, 0); ctx.lineTo(hl - 8, hh * 0.5); ctx.lineTo(0, hh * 0.6); ctx.closePath();
      if (o) { ctx.strokeStyle = OUT; ctx.lineWidth = 5; ctx.stroke(); } else { ctx.fillStyle = belly; ctx.fill(); if (jaw > 0.1) { ctx.fillStyle = '#fff'; for (let i = 0; i < 5; i++) ctx.fillRect(6 + i * (hl - 12) / 5, -3, 2, 4); } }
      ctx.restore();
      if (!o) {
        const eyeC = mood === 'enraged' ? '#ff2a1a' : mood === 'alert' ? '#ffcc22' : '#1d1d1d';
        ctx.fillStyle = '#f2e7b8'; ctx.beginPath(); ctx.arc(hl * 0.45, -hh * 0.45, isRex ? 4 : 3, 0, 6.28); ctx.fill();
        ctx.fillStyle = eyeC; ctx.beginPath(); ctx.arc(hl * 0.45 + 1, -hh * 0.45, isRex ? 2.4 : 1.8, 0, 6.28); ctx.fill();
        if (mood === 'enraged') { ctx.globalCompositeOperation = 'lighter'; ctx.fillStyle = 'rgba(255,60,30,0.5)'; ctx.beginPath(); ctx.arc(hl * 0.45, -hh * 0.45, 6, 0, 6.28); ctx.fill(); ctx.globalCompositeOperation = 'source-over'; }
      }
      ctx.restore();
      // arm
      limb(ctx, 20, bodyY + 2, 30, bodyY + 12 + (d.pounce ? -8 : 0), isRex ? 5 : 6, shade(col, -0.1), o);
      leg(o, 0, false);
    }
    ctx.restore();
  }

  // ---------- the car: "The Duchess" (fictional 1959 Laurent) ----------
  function drawCar(ctx, x, y, t, look, riders, flash) {
    ctx.save(); ctx.translate(x, y);
    const body = flash ? '#fff' : look.paint, trim = look.trim;
    const bounce = Math.sin(t * 18) * 1.2;
    // shadow
    ctx.fillStyle = 'rgba(0,0,0,0.35)'; ctx.beginPath(); ctx.ellipse(0, 4, 150, 16, 0, 0, 6.28); ctx.fill();
    ctx.translate(0, bounce);
    // riders
    (riders || []).forEach((r, i) => {
      const rx = -40 + i * 34 - (i > 1 ? 12 : 0);
      ctx.fillStyle = r.look.top; ctx.beginPath(); ctx.ellipse(rx, -64, 12, 14, 0, 0, 6.28); ctx.fill();
      ctx.fillStyle = r.look.skin; ctx.beginPath(); ctx.arc(rx + 2, -84, 10, 0, 6.28); ctx.fill();
      ctx.fillStyle = r.look.hair; ctx.beginPath(); ctx.ellipse(rx + 1, -89, 10, 6, 0, Math.PI, 6.28); ctx.fill();
      if (r.firing > 0) { ctx.fillStyle = '#ffe28a'; ctx.beginPath(); ctx.arc(rx + 34, -70, 7, 0, 6.28); ctx.fill(); ctx.fillStyle = '#333'; ctx.fillRect(rx + 8, -73, 24, 5); }
    });
    // windshield
    ctx.fillStyle = 'rgba(170,220,255,0.45)'; ctx.beginPath(); ctx.moveTo(24, -54); ctx.lineTo(44, -84); ctx.lineTo(50, -84); ctx.lineTo(40, -54); ctx.fill();
    ctx.strokeStyle = '#d9dee4'; ctx.lineWidth = 2; ctx.stroke();
    // body path
    const bp = () => {
      ctx.beginPath();
      ctx.moveTo(-150, -44); ctx.lineTo(-138, -70); ctx.lineTo(-118, -58); // tail fin
      ctx.lineTo(-40, -56); ctx.lineTo(40, -56); ctx.quadraticCurveTo(110, -58, 146, -44);
      ctx.lineTo(150, -22); ctx.lineTo(-152, -20); ctx.closePath();
    };
    bp(); ctx.strokeStyle = OUT; ctx.lineWidth = 5; ctx.stroke();
    const g = ctx.createLinearGradient(0, -70, 0, -18);
    g.addColorStop(0, shade(body, 0.35)); g.addColorStop(0.35, body); g.addColorStop(1, shade(body, -0.4));
    ctx.fillStyle = flash ? '#fff' : g; bp(); ctx.fill();
    // two-tone sweep
    ctx.fillStyle = trim; ctx.beginPath(); ctx.moveTo(-120, -40); ctx.quadraticCurveTo(0, -46, 110, -40); ctx.lineTo(110, -36); ctx.quadraticCurveTo(0, -40, -120, -34); ctx.fill();
    // chrome
    ctx.fillStyle = '#e9eef3'; ctx.fillRect(-154, -26, 20, 7); ctx.fillRect(132, -30, 22, 9);
    ctx.fillStyle = '#ffe9a8'; ctx.beginPath(); ctx.arc(146, -38, 5, 0, 6.28); ctx.fill();
    ctx.fillStyle = '#ff4030'; ctx.fillRect(-150, -46, 6, 10);
    // ram plow
    ctx.fillStyle = '#5b5f66'; ctx.beginPath(); ctx.moveTo(150, -34); ctx.lineTo(172, -12); ctx.lineTo(150, -8); ctx.fill();
    ctx.strokeStyle = '#9aa1a9'; ctx.lineWidth = 2; for (let i = 0; i < 3; i++) { ctx.beginPath(); ctx.moveTo(152, -30 + i * 7); ctx.lineTo(166, -14 + i * 2); ctx.stroke(); }
    // wheels
    for (const wx of [-92, 92]) {
      ctx.fillStyle = OUT; ctx.beginPath(); ctx.arc(wx, -18, 21, 0, 6.28); ctx.fill();
      ctx.fillStyle = '#1b1b1f'; ctx.beginPath(); ctx.arc(wx, -18, 19, 0, 6.28); ctx.fill();
      ctx.fillStyle = '#f2f2f2'; ctx.beginPath(); ctx.arc(wx, -18, 12, 0, 6.28); ctx.fill();
      ctx.fillStyle = '#b8c0c8'; ctx.beginPath(); ctx.arc(wx, -18, 8, 0, 6.28); ctx.fill();
      ctx.strokeStyle = '#6d747c'; ctx.lineWidth = 2;
      for (let i = 0; i < 3; i++) { const a = t * 30 + i * 2.09; ctx.beginPath(); ctx.moveTo(wx, -18); ctx.lineTo(wx + Math.cos(a) * 8, -18 + Math.sin(a) * 8); ctx.stroke(); }
    }
    ctx.restore();
  }

  function drawTruck(ctx, x, y, t, flash, dmg) {
    ctx.save(); ctx.translate(x, y);
    ctx.fillStyle = 'rgba(0,0,0,0.35)'; ctx.beginPath(); ctx.ellipse(0, 4, 190, 18, 0, 0, 6.28); ctx.fill();
    ctx.translate(0, Math.sin(t * 14) * 1.5);
    const c = flash ? '#fff' : '#4b5320';
    ctx.fillStyle = OUT; ctx.fillRect(-184, -134, 262, 112); ctx.fillRect(74, -104, 110, 84);
    ctx.fillStyle = c; ctx.fillRect(-180, -130, 254, 104);
    ctx.fillStyle = flash ? '#fff' : '#3c421a'; ctx.fillRect(78, -100, 102, 76);
    ctx.fillStyle = '#9fd0ff'; ctx.fillRect(130, -94, 40, 26);
    ctx.fillStyle = '#c8a332'; ctx.fillRect(-170, -80, 234, 10);
    ctx.fillStyle = '#e8e8e8'; ctx.font = 'bold 20px Impact, sans-serif'; ctx.fillText('IVORY CONSORTIUM', -160, -95);
    ctx.fillStyle = '#2b2b2b'; ctx.fillRect(-60, -150, 60, 20); ctx.fillRect(-10, -148, 50, 8); // turret
    for (let i = 0; i < dmg; i++) { ctx.fillStyle = 'rgba(20,20,20,0.6)'; ctx.beginPath(); ctx.arc(-150 + ((i * 97) % 220), -110 + ((i * 53) % 80), 8, 0, 6.28); ctx.fill(); }
    for (const wx of [-140, -80, 130]) { ctx.fillStyle = OUT; ctx.beginPath(); ctx.arc(wx, -18, 23, 0, 6.28); ctx.fill(); ctx.fillStyle = '#222'; ctx.beginPath(); ctx.arc(wx, -18, 20, 0, 6.28); ctx.fill(); ctx.fillStyle = '#777'; ctx.beginPath(); ctx.arc(wx, -18, 8, 0, 6.28); ctx.fill(); }
    ctx.restore();
  }

  function drawItem(ctx, x, y, kind, t) {
    ctx.save(); ctx.translate(x, y - 6 + Math.sin(t * 4 + x) * 2);
    ctx.fillStyle = 'rgba(0,0,0,0.3)'; ctx.beginPath(); ctx.ellipse(0, 6 - Math.sin(t * 4 + x) * 2, 14, 4, 0, 0, 6.28); ctx.fill();
    ctx.lineWidth = 2; ctx.strokeStyle = OUT;
    const R = (c, x0, y0, w, h) => { ctx.fillStyle = c; ctx.fillRect(x0, y0, w, h); ctx.strokeRect(x0, y0, w, h); };
    switch (kind) {
      case 'apple': ctx.fillStyle = '#d42a2a'; ctx.beginPath(); ctx.arc(0, -8, 9, 0, 6.28); ctx.fill(); ctx.stroke(); ctx.fillStyle = '#3e9a38'; ctx.fillRect(1, -21, 6, 4); break;
      case 'burger': R('#d99a45', -13, -20, 26, 8); R('#5a2d14', -13, -12, 26, 5); R('#57b04a', -14, -8, 28, 3); R('#d99a45', -13, -5, 26, 6); break;
      case 'meat': ctx.fillStyle = '#b5452f'; ctx.beginPath(); ctx.ellipse(-3, -10, 14, 10, -0.3, 0, 6.28); ctx.fill(); ctx.stroke(); R('#efe6cf', 8, -20, 12, 5); break;
      case 'fish': ctx.fillStyle = '#7fa8c9'; ctx.beginPath(); ctx.ellipse(0, -9, 14, 6, 0, 0, 6.28); ctx.fill(); ctx.stroke(); ctx.beginPath(); ctx.moveTo(-12, -9); ctx.lineTo(-20, -15); ctx.lineTo(-20, -3); ctx.fill(); break;
      case 'scrap': R('#9aa3ad', -10, -16, 12, 12); R('#c78d3a', 0, -12, 10, 8); break;
      case 'gold': R('#f2c230', -12, -14, 24, 10); ctx.fillStyle = '#fff6c0'; ctx.fillRect(-9, -12, 8, 2); break;
      case 'ammo': R('#4f5d2f', -11, -16, 22, 12); ctx.fillStyle = '#e8c56a'; ctx.fillRect(-7, -20, 3, 5); ctx.fillRect(-1, -20, 3, 5); ctx.fillRect(5, -20, 3, 5); break;
      default: { const w = { kind }; ctx.rotate(-0.3); drawHeldWeapon(ctx, [0, -10], [0, -10], Math.PI / 2, w, ''); }
    }
    ctx.restore();
  }

  function drawProp(ctx, x, y, kind, hp, flash) {
    ctx.save(); ctx.translate(x, y);
    ctx.fillStyle = 'rgba(0,0,0,0.3)'; ctx.beginPath(); ctx.ellipse(0, 0, 22, 6, 0, 0, 6.28); ctx.fill();
    ctx.strokeStyle = OUT; ctx.lineWidth = 3;
    if (kind === 'barrel' || kind === 'oil') {
      const c = flash ? '#fff' : kind === 'oil' ? '#b8341f' : '#6d4a2c';
      ctx.fillStyle = c; ctx.beginPath(); ctx.moveTo(-17, 0); ctx.lineTo(-19, -24); ctx.lineTo(-17, -48); ctx.lineTo(17, -48); ctx.lineTo(19, -24); ctx.lineTo(17, 0); ctx.closePath(); ctx.fill(); ctx.stroke();
      ctx.fillStyle = 'rgba(0,0,0,0.35)'; ctx.fillRect(-19, -36, 38, 4); ctx.fillRect(-19, -14, 38, 4);
      if (kind === 'oil') { ctx.fillStyle = '#ffd23a'; ctx.font = 'bold 12px sans-serif'; ctx.fillText('!', -3, -20); }
    } else {
      ctx.fillStyle = flash ? '#fff' : '#8b6232'; ctx.fillRect(-22, -40, 44, 40); ctx.strokeRect(-22, -40, 44, 40);
      ctx.strokeStyle = '#5a3c1c'; ctx.beginPath(); ctx.moveTo(-22, -40); ctx.lineTo(22, 0); ctx.moveTo(22, -40); ctx.lineTo(-22, 0); ctx.stroke();
    }
    ctx.restore();
  }

  window.ART = { shade, drawHuman, drawDino, drawCar, drawTruck, drawItem, drawProp, drawHeldWeapon };
})();
