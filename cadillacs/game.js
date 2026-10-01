// game.js - TAILFINS & TYRANTS: core engine, combat, AI, stages, story, UI
(function () {
  'use strict';
  const W = 960, H = 540, GT = 300, GB = 528;
  const cv = document.getElementById('game');
  const ctx = cv.getContext('2d');
  const A = window.ART;
  const SFX = window.SFX || { init() {}, play() {}, music() {}, stopMusic() {}, engineStart() {}, engineSet() {}, engineStop() {}, toggleMute() {}, muted: false };
  const BG = window.BG || null;
  const rnd = (a, b) => a + Math.random() * (b - a);
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const lsGet = (k, d) => { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : d; } catch (e) { return d; } };
  const lsSet = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} };

  // ---------------- heroes ----------------
  const HEROES = [
    { name: 'COLE HARLAN', tag: 'Balanced mechanic', spd: 3, pow: 3, rng: 3, hp: 100,
      look: { skin: '#c68a5e', hair: '#2a1a12', hairStyle: 'curly', top: '#e0782a', topStyle: 'jumpsuit', pants: '#b85f22', boots: '#3b2616', accent: '#f4d35e', goggles: true, h: 1, w: 1, sprite: 'cole' }, perk: 'Wrench combo. Special: Torque haymaker.' },
    { name: 'ISLA VARGA', tag: 'Agile scout', spd: 4, pow: 2, rng: 4, hp: 90,
      look: { skin: '#a8714f', hair: '#1b1210', hairStyle: 'braid', top: '#1f8a8a', topStyle: 'jacket', pants: '#2c3a4a', boots: '#4a2c1a', accent: '#f0c060', h: 0.95, w: 0.9, sprite: 'isla' }, perk: 'Long reach, high jump. Special: baton cyclone.' },
    { name: 'DAX OKAFOR', tag: 'Speed kicker', spd: 5, pow: 2, rng: 2, hp: 90,
      look: { skin: '#5a3825', hair: '#111', hairStyle: 'buzz', top: '#c8202e', topStyle: 'jacket', stripe: true, pants: '#1e1e24', boots: '#f2f2f2', accent: '#ffffff', h: 1.02, w: 0.92, sprite: 'dax' }, perk: 'Kick chains, fastest runner. Special: whirlwind kick.' },
    { name: 'ANVIL KASZA', tag: 'Tank grappler', spd: 1, pow: 5, rng: 3, hp: 140,
      look: { skin: '#d7a282', hair: '#9a9a9a', hairStyle: 'buzz', beard: '#8f8f8f', top: '#3b5b86', topStyle: 'vest', pants: '#344e73', boots: '#2b1d14', accent: '#c9a227', arm: true, h: 1.14, w: 1.35, belly: 5, sprite: 'anvil' }, perk: 'Huge throws, steam arm. Special: ground slam.' },
    { name: 'JUNO PARK', tag: 'Gunslinger', spd: 3, pow: 2, rng: 3, hp: 90,
      look: { skin: '#e2b894', hair: '#0f0f14', hairStyle: 'long', top: '#5b2a86', topStyle: 'coat', pants: '#2a2230', boots: '#1a1a1a', accent: '#e0c050', shades: true, h: 0.97, w: 0.9, sprite: 'juno' }, perk: 'Every life starts with a revolver. Special: fan the hammer.' },
    { name: 'DOC FROST', tag: 'Field medic', spd: 2, pow: 3, rng: 3, hp: 110,
      look: { skin: '#f0cfb0', hair: '#e8e8e8', hairStyle: 'short', beard: '#e0e0e0', top: '#e8ecef', topStyle: 'coat', pants: '#445566', boots: '#2b2b2b', accent: '#d33', h: 1.03, w: 1.05, sprite: 'doc' }, perk: 'Special heals the whole team a little.' },
    { name: 'MARA QUILL', tag: 'Knife artist', spd: 4, pow: 2, rng: 2, hp: 85,
      look: { skin: '#caa07a', hair: '#b8321e', hairStyle: 'mohawk', top: '#26262e', topStyle: 'tank', pants: '#4a3b2a', boots: '#1a1a1a', accent: '#b8321e', bandana: '#b8321e', h: 0.96, w: 0.88, sprite: 'mara' }, perk: 'Special throws a fan of 3 knives.' },
    { name: 'TOMAS & PEBBLE', tag: 'Kid + tamed raptor', spd: 4, pow: 3, rng: 3, hp: 100, rider: true,
      look: { skin: '#b07a55', hair: '#2a1a10', hairStyle: 'cap', top: '#f2c14e', topStyle: 'tank', pants: '#3a5a3a', boots: '#3a2a1a', accent: '#2f7fd0', h: 0.72, w: 0.85, sprite: 'tomas', hs: 1.3 }, perk: 'Pebble bites for you. Special: raptor pounce.' }
  ];

  // ---------------- enemy looks ----------------
  const FOES = {
    punk: { hp: 45, spd: 95, dmg: 7, score: 100, look: { skin: '#d6a07a', hair: '#e84aa0', hairStyle: 'mohawk', top: '#3a3a44', topStyle: 'vest', pants: '#51472f', boots: '#222', accent: '#e84aa0', h: 1, w: 1, sprite: 'punk' } },
    knifer: { hp: 40, spd: 125, dmg: 9, score: 150, look: { skin: '#b98260', hair: '#222', hairStyle: 'short', bandana: '#d8d020', top: '#7a2020', topStyle: 'tank', pants: '#2c2c34', boots: '#222', accent: '#d8d020', h: 0.98, w: 0.9, sprite: 'knifer' }, weapon: 'machete' },
    brute: { hp: 130, spd: 70, dmg: 14, score: 300, look: { skin: '#e0b090', hair: '#5a3a1a', hairStyle: 'buzz', beard: '#5a3a1a', top: '#6a5a40', topStyle: 'tank', pants: '#3a3020', boots: '#1a1a1a', accent: '#999', h: 1.2, w: 1.5, belly: 8, sprite: 'brute' } },
    gunner: { hp: 50, spd: 85, dmg: 10, score: 200, look: { skin: '#c49070', hair: '#333', hairStyle: 'helmet', top: '#e8e3d3', topStyle: 'jacket', pants: '#c8bfa3', boots: '#3a2a1a', accent: '#c8a332', h: 1, w: 1, sprite: 'gunner' }, weapon: 'rifle' },
    poacher: { hp: 55, spd: 90, dmg: 10, score: 200, look: { skin: '#b88a66', hair: '#444', hairStyle: 'cap', top: '#6b7a3a', topStyle: 'vest', pants: '#4a4a30', boots: '#2a1a0a', accent: '#c8a332', h: 1, w: 1.05, sprite: 'poacher' }, weapon: 'shotgun' }
  };
  const BOSSES = {
    bram: { name: 'BUTCHER BRAM', hp: 520, spd: 90, dmg: 16, score: 5000, look: { skin: '#d9a883', hair: '#222', hairStyle: 'buzz', beard: '#222', top: '#8a1c1c', topStyle: 'tank', pants: '#2a2a2a', boots: '#111', accent: '#ccc', h: 1.3, w: 1.6, belly: 10, sprite: 'bram' }, weapon: 'machete' },
    gator: { name: 'GATOR McCAIN', hp: 480, spd: 100, dmg: 12, score: 5000, look: { skin: '#b07850', hair: '#5a4020', hairStyle: 'cap', beard: '#6a4a2a', top: '#3f5a2a', topStyle: 'vest', pants: '#3a2a1a', boots: '#2a1a0a', accent: '#6a8a3a', h: 1.1, w: 1.2, sprite: 'gator' }, weapon: 'shotgun' },
    holloway: { name: 'MAJOR HOLLOWAY', hp: 650, spd: 80, dmg: 18, score: 6000, look: { skin: '#e2b598', hair: '#ddd', hairStyle: 'short', beard: '#ddd', top: '#c8a332', topStyle: 'coat', pants: '#3b3b3b', boots: '#111', accent: '#c8a332', h: 1.25, w: 1.5, belly: 6, sprite: 'holloway' }, weapon: 'club' },
    vane: { name: 'AUGUSTINE VANE', hp: 700, spd: 130, dmg: 16, score: 8000, look: { skin: '#e6c8b0', hair: '#f0f0f0', hairStyle: 'short', top: '#f2eee6', topStyle: 'coat', pants: '#f2eee6', boots: '#8a6a2a', accent: '#ffb000', h: 1.15, w: 1.1, sprite: 'vane' } }
  };

  // ---------------- stages ----------------
  const STAGES = [
    { name: 'RUST HARBOR', bg: 0, music: 'city', len: 3600, boss: 'bram',
      waves: [[400, ['punk', 'punk', 'punk']], [1000, ['punk', 'knifer', 'punk', 'raptorCalm']], [1700, ['punk', 'brute', 'knifer', 'punk']], [2400, ['gunner', 'punk', 'knifer', 'punk', 'punk']], [3000, ['brute', 'punk', 'gunner', 'knifer']]] },
    { name: 'MANGROVE ROAD', bg: 1, music: 'swamp', len: 3800, boss: 'gator',
      waves: [[350, ['poacher', 'raptorCalm', 'raptorCalm', 'punk']], [1000, ['knifer', 'knifer', 'punk', 'raptorCalm']], [1700, ['poacher', 'poacher', 'raptorCalm', 'raptorCalm', 'brute']], [2500, ['gunner', 'knifer', 'punk', 'punk', 'poacher']], [3200, ['brute', 'poacher', 'knifer', 'raptorCalm']]] },
    { name: 'FLOODED HIGHWAY', bg: 2, music: 'highway', drive: true, len: 42000 },
    { name: 'POACHER CAMP', bg: 3, music: 'village', len: 4000, boss: 'holloway',
      waves: [[350, ['poacher', 'poacher', 'raptorCalm', 'punk']], [1000, ['brute', 'knifer', 'poacher', 'raptorCalm', 'raptorCalm']], [1700, ['gunner', 'gunner', 'punk', 'punk', 'knifer']], [2400, ['brute', 'brute', 'poacher', 'raptorCalm']], [3200, ['gunner', 'knifer', 'knifer', 'poacher', 'punk', 'brute']]] },
    { name: 'MARROW REFINERY', bg: 4, music: 'refinery', len: 4200, boss: 'vane',
      waves: [[350, ['gunner', 'punk', 'punk', 'knifer']], [1000, ['brute', 'gunner', 'poacher', 'raptorCalm']], [1700, ['knifer', 'knifer', 'knifer', 'gunner', 'brute']], [2500, ['poacher', 'poacher', 'raptorCalm', 'raptorCalm', 'brute', 'gunner']], [3300, ['brute', 'brute', 'gunner', 'gunner', 'knifer', 'punk']]] }
  ];
  const STORY = [
    [['NARRATOR', '1979. A comet called the Deepwater Event melted the ice caps. The seas rose sixty meters.'],
     ['NARRATOR', 'From the cracked seabed, something impossible crawled back into the light: the dinosaurs.'],
     ['NARRATOR', 'Forty years later, Rust Harbor runs on salvaged V8s and an uneasy peace with the beasts.'],
     ['COLE', 'The Ivory Consortium is poaching again. They boil dinos down into marrow oil.'],
     ['ISLA', 'The Lagoon Assembly will not stand for it. Neither will I.'],
     ['VANE', 'Marrow oil is progress. Anyone who stands in its way becomes... fuel.'],
     ['ANVIL', 'Then let\'s go stand in his way.']],
    [['DAX', 'The Consortium trucks cut through the Mangrove Road. Tracks are fresh.'],
     ['ISLA', 'Careful with the herds. A calm dino ignores you. Hit one and its eyes go red.'],
     ['COLE', 'And a red-eyed raptor bites whoever is closest. Let the poachers learn that the hard way.']],
    [['COLE', 'The marrow hauler is running for the refinery. Everybody into The Duchess!'],
     ['DAX', 'Driver steers and rams. Everyone else shoots. Jump to hop wrecks, special for nitro.'],
     ['ANVIL', 'Try not to scratch the paint.']],
    [['ANVIL', 'Cages. Dozens of them. Raptors, horned ones... even hatchlings.'],
     ['VANE', 'Major Holloway, please remove the mechanics from my inventory.'],
     ['COLE', 'We bust the cages after we bust some heads.']],
    [['ISLA', 'The Marrow Refinery. Every tank in there used to be a living animal.'],
     ['VANE', 'You have cost me a fortune. Let me show you what marrow oil can really do.'],
     ['DAX', 'Is he... glowing? He\'s been drinking his own product.']]
  ];
  const ENDING = [['NARRATOR', 'The refinery burns. The cages open. The herds walk free into the drowned world.'],
    ['ISLA', 'The Assembly will want a treaty. People and beasts, sharing the shore.'],
    ['ANVIL', 'Treaties later. Engine\'s still warm.'],
    ['COLE', 'Then who wants to drive home?']];
  const SPEAKER_LOOK = { COLE: 0, ISLA: 1, DAX: 2, ANVIL: 3 };

  // ---------------- input ----------------
  const keys = {}, hits = {};
  const KB = [
    { id: 'kb1', l: ['KeyA'], r: ['KeyD'], u: ['KeyW'], d: ['KeyS'], atk: ['KeyJ', 'KeyF'], jmp: ['KeyK', 'KeyG'], spc: ['KeyL', 'KeyH'], start: ['Enter', 'Space'] },
    { id: 'kb2', l: ['ArrowLeft'], r: ['ArrowRight'], u: ['ArrowUp'], d: ['ArrowDown'], atk: ['Numpad1', 'Comma', 'KeyZ'], jmp: ['Numpad2', 'Period', 'KeyX'], spc: ['Numpad3', 'Slash', 'KeyC'], start: ['NumpadEnter', 'ShiftRight'] }
  ];
  const touch = { active: false, stick: null, sx: 0, sy: 0, dx: 0, dy: 0, atk: false, jmp: false, spc: false, start: false, used: false };
  const sources = {};
  function src(id) { return sources[id] || (sources[id] = { id, l: 0, r: 0, u: 0, d: 0, atk: 0, jmp: 0, spc: 0, start: 0, p: {} }); }
  const anyDown = k => k.some(c => keys[c] || hits[c]);
  addEventListener('keydown', e => { if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Space'].includes(e.code)) e.preventDefault(); keys[e.code] = true; hits[e.code] = true; SFX.init(); if (e.code === 'KeyM') SFX.toggleMute(); if (e.code === 'Escape' || e.code === 'KeyP') togglePause(); });
  addEventListener('keyup', e => { keys[e.code] = false; });
  function pollInput() {
    const set = (s, st) => { for (const k of ['l', 'r', 'u', 'd', 'atk', 'jmp', 'spc', 'start']) { const v = st[k] ? 1 : 0; s.p[k] = v && !s[k]; s[k] = v; } };
    for (const m of KB) set(src(m.id), { l: anyDown(m.l), r: anyDown(m.r), u: anyDown(m.u), d: anyDown(m.d), atk: anyDown(m.atk), jmp: anyDown(m.jmp), spc: anyDown(m.spc), start: anyDown(m.start) });
    const pads = navigator.getGamepads ? navigator.getGamepads() : [];
    for (let i = 0; i < pads.length; i++) {
      const g = pads[i]; if (!g) continue;
      const b = n => g.buttons[n] && g.buttons[n].pressed; const ax = g.axes[0] || 0, ay = g.axes[1] || 0;
      set(src('pad' + i), { l: ax < -0.4 || b(14), r: ax > 0.4 || b(15), u: ay < -0.4 || b(12), d: ay > 0.4 || b(13), atk: b(2) || b(3), jmp: b(0), spc: b(1) || b(5), start: b(9) });
    }
    for (const c in hits) delete hits[c];
    if (touch.used) set(src('touch'), { l: touch.dx < -0.35, r: touch.dx > 0.35, u: touch.dy < -0.35, d: touch.dy > 0.35, atk: touch.atk, jmp: touch.jmp, spc: touch.spc, start: touch.start });
  }
  const TB = { atk: [868, 452, 44], jmp: [770, 488, 38], spc: [872, 350, 36], start: [912, 40, 26] };
  function toCanvas(e) { const r = cv.getBoundingClientRect(); return [(e.clientX - r.left) / r.width * W, (e.clientY - r.top) / r.height * H]; }
  const pointers = {};
  function refreshTouch() {
    touch.atk = touch.jmp = touch.spc = touch.start = false; touch.dx = touch.dy = 0;
    for (const id in pointers) {
      const p = pointers[id];
      if (p.stick) { const dx = p.x - p.sx, dy = p.y - p.sy, L = Math.max(1, Math.hypot(dx, dy)); const m = Math.min(1, L / 60); touch.dx = dx / L * m; touch.dy = dy / L * m; }
      else for (const k in TB) { const b = TB[k]; if (Math.hypot(p.x - b[0], p.y - b[1]) < b[2] + 18) touch[k] = true; }
    }
  }
  cv.addEventListener('pointerdown', e => {
    SFX.init(); if (e.pointerType !== 'touch') { menuClick(toCanvas(e)); return; }
    touch.used = true; const [x, y] = toCanvas(e);
    pointers[e.pointerId] = { x, y, sx: x, sy: y, stick: x < W * 0.45 && y > H * 0.35 };
    refreshTouch(); e.preventDefault();
  }, { passive: false });
  cv.addEventListener('pointermove', e => { const p = pointers[e.pointerId]; if (!p) return; [p.x, p.y] = toCanvas(e); refreshTouch(); });
  const endP = e => { delete pointers[e.pointerId]; refreshTouch(); };
  cv.addEventListener('pointerup', endP); cv.addEventListener('pointercancel', endP);
  function menuClick() { const s = src('kb1'); s.p.start = true; }

  // ---------------- game state ----------------
  const G = { state: 'title', t: 0, stage: 0, players: [], ents: [], parts: [], camX: 0, lockX: null, wave: 0, shake: 0, hitstop: 0, flash: 0, msg: null, msgT: 0, goT: 0, menu: 0, sel: {}, story: null, hi: lsGet('tt_hi', []), boss: null, car: null, mercy: 0, paused: false, continueT: 0, idc: 1, banner: 0 };
  function togglePause() { if (G.state === 'play' || G.state === 'drive') G.paused = !G.paused; }

  function makePlayer(sourceId, heroIdx, slot) {
    const h = HEROES[heroIdx];
    return { id: G.idc++, kind: 'player', faction: 'hero', src: sourceId, slot, hero: heroIdx, look: h.look, name: h.name, x: G.camX + 120 + slot * 30, y: 380 + (slot % 4) * 34, z: 0, vx: 0, vy: 0, vz: 0, face: 1, hp: h.hp, maxhp: h.hp, hpShow: h.hp, lives: 3, score: 0, anim: 'idle', animT: 0, st: 'idle', stT: 0, combo: 0, comboT: 0, inv: 2, weapon: heroIdx === 4 ? { kind: 'revolver', ammo: 6 } : null, grab: null, walkPh: 0, dead: false, out: false, pebble: h.rider ? { kind: 'raptor', color: '#4f8a3a', belly: '#d9d2a0', stripe: '#2f5a24', scale: 0.95, mood: 'calm', jaw: 0 } : null };
  }

  function spawnFoe(type, x, y, boss) {
    if (type === 'raptorCalm') return spawnDino(x, y);
    const d = boss ? BOSSES[type] : FOES[type];
    const n = Math.max(1, G.players.filter(p => !p.out).length);
    const hpMul = boss ? 1 + 0.45 * (n - 1) : 1 + 0.15 * (n - 1);
    const e = { id: G.idc++, kind: 'foe', faction: 'foe', type, boss: !!boss, name: boss ? d.name : type.toUpperCase(), look: d.look, x, y, z: 0, vx: 0, vy: 0, vz: 0, face: -1, hp: d.hp * hpMul, maxhp: d.hp * hpMul, spd: d.spd, dmg: d.dmg, score: d.score, anim: 'idle', animT: 0, st: 'enter', stT: 0, walkPh: 0, think: rnd(0.2, 1), weapon: d.weapon ? { kind: d.weapon, ammo: 99 } : null, hitShow: 0, target: null, phase: 1 };
    G.ents.push(e); return e;
  }
  function spawnDino(x, y, rex) {
    const d = { id: G.idc++, kind: 'dino', faction: 'dino', name: rex ? 'THE TYRANT' : 'RAPTOR', x, y, z: 0, vx: 0, vy: 0, vz: 0, face: Math.random() < 0.5 ? 1 : -1, hp: rex ? 1400 : 70, maxhp: rex ? 1400 : 70, mood: rex ? 'enraged' : 'calm', moodT: 0, target: null, anim: 'idle', animT: 0, st: 'wander', stT: 0, walkPh: 0, color: rex ? '#6b3a2a' : ['#4f8a3a', '#7a8a2a', '#3a7a6a'][Math.floor(Math.random() * 3)], belly: rex ? '#caa27a' : '#d9d2a0', stripe: rex ? '#3a1a10' : '#2f5a24', scale: rex ? 2.6 : 1, dkind: rex ? 'rex' : 'raptor', rex: !!rex, boss: !!rex, jaw: 0, hitShow: 0, score: rex ? 10000 : 400, think: 1 };
    G.ents.push(d); return d;
  }
  function spawnProp(x, y, kind) { G.ents.push({ id: G.idc++, kind: 'prop', faction: 'none', prop: kind, x, y, z: 0, hp: kind === 'oil' ? 10 : 20, hitShow: 0 }); }
  function spawnItem(x, y, item) { G.ents.push({ id: G.idc++, kind: 'item', item, x, y: clamp(y, GT + 20, GB - 6), z: 0, life: 14 }); }
  const FOOD = { apple: 20, fish: 30, burger: 45, meat: 90 };
  const GUNS = { revolver: 6, shotgun: 5, rifle: 8, smg: 30, dynamite: 3, pipe: 12, machete: 12, wrench: 12, club: 12 };
  function randomDrop(x, y, luck) {
    const r = Math.random();
    if (r < 0.28 * luck) spawnItem(x, y, ['apple', 'fish', 'burger', 'meat'][Math.floor(Math.random() * (r < 0.05 ? 4 : 3))]);
    else if (r < 0.42 * luck) spawnItem(x, y, ['revolver', 'shotgun', 'rifle', 'smg', 'dynamite', 'pipe', 'machete'][Math.floor(Math.random() * 7)]);
    else if (r < 0.55 * luck) spawnItem(x, y, Math.random() < 0.5 ? 'gold' : 'ammo');
  }

  // ---------------- particles ----------------
  function part(o) { if (G.parts.length > 400) G.parts.shift(); G.parts.push(Object.assign({ z: 0, vx: 0, vy: 0, vz: 0, g: 0, life: 0.4, t: 0, size: 3 }, o)); }
  function sparks(x, y, z, n, col, big) {
    for (let i = 0; i < n; i++) { const a = rnd(0, 6.28), s = rnd(120, big ? 520 : 340); part({ type: 'spark', x, y, z, vx: Math.cos(a) * s, vz: Math.sin(a) * s, life: rnd(0.12, 0.3), col: col || '#ffe08a', size: big ? 3 : 2 }); }
    part({ type: 'ring', x, y, z, life: 0.18, size: big ? 44 : 26, col: col || '#fff' });
  }
  function dust(x, y, n) { for (let i = 0; i < n; i++) part({ type: 'dust', x: x + rnd(-20, 20), y, z: 2, vx: rnd(-80, 80), vz: rnd(20, 80), life: rnd(0.3, 0.6), size: rnd(5, 11), col: 'rgba(200,180,150,' }); }
  function boom(x, y, r) {
    SFX.play('explosion'); G.shake = Math.max(G.shake, 10); G.flash = 0.12;
    for (let i = 0; i < 26; i++) { const a = rnd(0, 6.28), s = rnd(60, 320); part({ type: 'fire', x, y, z: 20, vx: Math.cos(a) * s, vz: Math.abs(Math.sin(a)) * s, life: rnd(0.3, 0.8), size: rnd(10, 26) }); }
    for (let i = 0; i < 10; i++) part({ type: 'dust', x: x + rnd(-30, 30), y, z: rnd(10, 60), vx: rnd(-40, 40), vz: rnd(40, 120), life: rnd(0.8, 1.4), size: rnd(14, 26), col: 'rgba(60,55,50,' });
    for (const e of G.ents) { if (e.dead || e.kind === 'item') continue; const dx = e.x - x, dy = (e.y - y) * 2; if (Math.hypot(dx, dy) < r) hurt(e, 40, null, 'knock', Math.sign(dx) || 1, 'boom'); }
  }
  function floatText(x, y, z, txt, col) { part({ type: 'text', x, y, z, vz: 60, life: 0.9, txt, col: col || '#fff' }); }

  // ---------------- combat ----------------
  function hostile(a, b) {
    if (a === b || b.dead || b.kind === 'item' || b.kind === 'proj') return false;
    if (b.kind === 'prop') return a.faction === 'hero';
    if (a.faction === 'dino') { if (a.mood !== 'enraged') return false; return b.faction !== 'dino'; }
    if (b.faction === 'dino') return a.faction === 'hero' || a.faction === 'foe';
    return a.faction !== b.faction;
  }
  function hurt(t, dmg, from, type, dirX, src) {
    if (t.dead || t.kind === 'item') return false;
    if (t.kind === 'player' && (t.inv > 0 || t.st === 'down' && t.stT < 0.9)) return false;
    if (t.kind === 'prop') {
      t.hp -= dmg; t.hitShow = 0.1; SFX.play('hit', { pitch: 0.7 });
      if (t.hp <= 0) { t.dead = true; breakProp(t.x, t.y, t.prop); }
      return true;
    }
    if (t.kind === 'foe' && t.boss && t.st === 'enter') return false;
    if (t.kind === 'dino') {
      if (from && from.faction !== 'dino') { if (t.mood !== 'enraged') { SFX.play(t.rex ? 'roar' : 'raptor'); floatText(t.x, t.y, 90, '!!', '#ff4030'); } t.mood = 'enraged'; t.moodT = 10; t.target = from.kind === 'proj' ? from.owner : from; }
    }
    t.hp -= dmg; t.hitShow = 0.08; t.hitKick = 1; t.lastHit = from;
    if (from && from.kind === 'player' && from.specCost) { from.hp = Math.max(1, from.hp - from.specCost); from.specCost = 0; }
    if (t.kind !== 'player' && from && from.kind === 'player') { from.score += Math.round(dmg * 2); from.comboCount = (from.comboCount || 0) + 1; from.comboShow = 1.2; }
    const heavy = type === 'knock';
    G.hitstop = Math.max(G.hitstop, heavy ? 0.13 : 0.07);
    if (heavy) G.shake = Math.max(G.shake, t.boss ? 6 : 4);
    sparks(t.x, t.y, (t.z || 0) + 60 * (t.rex ? 2 : 1), heavy ? 10 : 6, src === 'bullet' ? '#ffd27a' : heavy ? '#ffb347' : '#fff3c4', heavy);
    SFX.play(src === 'bullet' ? 'hit' : heavy ? 'heavyhit' : 'punch', { pitch: rnd(0.9, 1.1) });
    if (t.kind === 'player') t.inv = Math.max(t.inv, heavy ? 0.9 : 0.4);
    if (t.kind === 'player' && t.weapon && heavy && Math.random() < 0.6) { dropWeapon(t); }
    if (t.grab) releaseGrab(t);
    if (t.carry && (heavy || Math.random() < 0.5)) t.carry = null;
    if (t.grabbedBy) { const g = t.grabbedBy; g.grab = null; t.grabbedBy = null; }
    const big = t.boss && !heavy;
    if (t.hp <= 0) { killEnt(t, from, dirX); return true; }
    if (t.rex) { t.st = 'hurt'; t.stT = 0; return true; }
    if (heavy && !(t.boss && Math.random() < 0.5)) { setSt(t, 'fall'); t.vx = dirX * (t.boss ? 180 : 260); t.vz = 320; t.z = Math.max(t.z, 1); }
    else if (!big || Math.random() < 0.35) { setSt(t, 'hurt'); t.vx = dirX * 170; }
    return true;
  }
  function killEnt(t, from, dirX) {
    t.hp = 0;
    if (t.kind === 'player') { setSt(t, 'fall'); t.vx = dirX * 240; t.vz = 360; t.z = 1; t.dying = true; SFX.play('ko'); return; }
    t.dead = false; t.dying = true; setSt(t, 'fall'); t.vx = dirX * 280; t.vz = 380; t.z = Math.max(1, t.z); t.hp = 0;
    SFX.play(t.kind === 'dino' ? 'raptor' : 'scream', { pitch: t.boss ? 0.6 : rnd(0.9, 1.2) });
    const scorer = from && (from.kind === 'player' ? from : from.owner && from.owner.kind === 'player' ? from.owner : null);
    if (scorer) { scorer.score += t.score; floatText(t.x, t.y, 100, '+' + t.score, '#ffe08a'); }
    if (t.kind === 'dino' && !t.rex && scorer) { G.mercyLost = (G.mercyLost || 0) + 1; }
    if (t.boss) { G.hitstop = 0.5; G.slowmo = 1.2; G.shake = 10; SFX.play('ko', { pitch: 0.6 }); }
    if (t.kind === 'foe' && !t.boss) randomDrop(t.x, t.y, 1);
    if (t.kind === 'foe' && t.weapon && ['rifle', 'shotgun', 'revolver', 'smg'].includes(t.weapon.kind) && Math.random() < 0.55) spawnItem(t.x, t.y, t.weapon.kind);
  }
  function setSt(e, s) { e.st = s; e.stT = 0; e.anim = s === 'fall' ? 'fall' : s === 'hurt' ? 'hurt' : s === 'down' ? 'down' : e.anim; e.animT = 0; }
  function releaseGrab(p) { if (p.grab) { p.grab.grabbedBy = null; p.grab = null; } }
  function dropWeapon(p) { if (!p.weapon) return; if (p.weapon.ammo > 0) spawnItem(p.x - p.face * 20, p.y, p.weapon.kind); p.weapon = null; }

  function meleeHit(a, reach, dmg, type, zMax, multi) {
    let hit = false;
    // players live in G.players, not G.ents: without them in this loop no enemy blow could ever land
    for (const t of G.ents.concat(G.players)) {
      if (t.out) continue;
      if (!hostile(a, t)) continue;
      if (t.dying || t.st === 'down' && t.kind !== 'prop') continue;
      const dx = (t.x - a.x) * a.face, dy = Math.abs(t.y - a.y);
      const tr = t.rex ? 120 : t.kind === 'car' ? 0 : 0;
      if (dx > -12 && dx < reach + tr && dy < (t.rex ? 40 : 22) && (t.z || 0) < (zMax || 70)) {
        if (hurt(t, dmg, a, type, a.face, 'melee')) { hit = true; if (!multi) break; }
      }
    }
    return hit;
  }
  function projectile(owner, kind, x, y, z, vx, opts) {
    G.ents.push(Object.assign({ id: G.idc++, kind: 'proj', pk: kind, owner, faction: owner.faction, x, y, z, vx, vy: 0, vz: 0, life: 1.2, dmg: 12, pierce: 0, hits: {} }, opts || {}));
  }

  // ---------------- players ----------------
  function heroStat(p) { return HEROES[p.hero]; }
  function playerAttack(p, s) {
    const h = heroStat(p), pow = 0.7 + h.pow * 0.18, reach = 44 + h.rng * 6;
    const w = p.weapon;
    if (w && GUNS[w.kind] && ['revolver', 'shotgun', 'rifle', 'smg'].includes(w.kind)) {
      if (w.ammo <= 0) { // throw the empty gun
        projectile(p, 'gun', p.x + p.face * 20, p.y, 60, p.face * 620, { dmg: 22, knock: true, life: 0.8, spin: 1, gk: w.kind });
        p.weapon = null; SFX.play('throw'); p.anim = 'toss'; p.animT = 0; setAct(p, 'toss', 0.3); return;
      }
      w.ammo--; p.anim = 'aim'; p.animT = 0;
      const gy = 76 * (p.look.h || 1);
      if (w.kind === 'shotgun') { SFX.play('shotgun'); G.shake = Math.max(G.shake, 3); for (let i = -1; i <= 1; i++) projectile(p, 'bullet', p.x + p.face * 40, p.y + i * 14, gy, p.face * 900, { dmg: 16, knock: true, life: 0.35 }); setAct(p, 'aim', 0.45); }
      else if (w.kind === 'rifle') { SFX.play('rifle'); projectile(p, 'bullet', p.x + p.face * 44, p.y, gy, p.face * 1300, { dmg: 26, pierce: 3, knock: true }); setAct(p, 'aim', 0.4); }
      else if (w.kind === 'smg') { SFX.play('uzi'); projectile(p, 'bullet', p.x + p.face * 30, p.y + rnd(-4, 4), gy, p.face * 1000, { dmg: 7 }); setAct(p, 'aim', 0.09); }
      else { SFX.play('pistol'); projectile(p, 'bullet', p.x + p.face * 26, p.y, gy, p.face * 1100, { dmg: 14 }); setAct(p, 'aim', 0.22); }
      part({ type: 'flash', x: p.x + p.face * 40, y: p.y, z: gy, life: 0.06, size: 16 });
      part({ type: 'chunk', x: p.x, y: p.y, z: gy, vx: -p.face * 80, vz: 160, g: 900, life: 0.6, col: '#e8c56a', size: 3 });
      return;
    }
    if (w && w.kind === 'dynamite') {
      projectile(p, 'dyn', p.x + p.face * 20, p.y, 70, p.face * 380, { vz: 300, fuse: 1.1, life: 3 }); SFX.play('throw');
      if (--w.ammo <= 0) p.weapon = null; setAct(p, 'toss', 0.35); return;
    }
    if (w) { // melee weapon
      setAct(p, 'swing', 0.34); SFX.play('whoosh');
      p.pending = { at: 0.12, fn: () => { if (meleeHit(p, reach + 26, 20 * pow, 'knock', 90, true)) { if (--w.ammo <= 0) { p.weapon = null; SFX.play('glass'); } } } };
      return;
    }
    // grab check
    if (p.grab) {
      p.kneeT = 0.18; p.grabHits = (p.grabHits || 0) + 1; SFX.play('punch');
      const g = p.grab;
      if (p.grabHits >= 3) { throwGrab(p); return; }
      hurtGrabbed(g, 8 * pow, p); setAct(p, 'grab', 0.2); return;
    }
    const kicker = p.hero === 2;
    const moves = kicker ? ['kick', 'kick', 'jumpkick'] : ['jab', 'cross', p.hero === 3 ? 'upper' : 'kick'];
    if (p.hero === 7) { // Pebble bites
      p.combo = (p.combo + 1) % 3; setAct(p, 'jab', 0.3); p.pebble.jaw = 1; SFX.play('raptor', { vol: 0.4, pitch: 1.4 });
      const fin = p.combo === 0;
      p.pending = { at: 0.1, fn: () => meleeHit(p, reach + 30, (fin ? 16 : 9) * pow, fin ? 'knock' : 'light', 70) };
      return;
    }
    const idx = p.comboT > 0 ? p.combo : 0;
    const mv = moves[idx]; const fin = idx === 2;
    p.combo = (idx + 1) % 3; p.comboT = 0.5;
    setAct(p, mv === 'jumpkick' ? 'kick' : mv, fin ? 0.36 : 0.22); SFX.play('whoosh', { vol: 0.5 });
    p.pending = { at: fin ? 0.12 : 0.07, fn: () => { const hit = meleeHit(p, reach + (mv === 'kick' ? 10 : 0), (fin ? 15 : 8) * pow, fin ? 'knock' : 'light', 80); if (hit && fin) G.shake = Math.max(G.shake, 2); } };
  }
  function setAct(p, anim, dur) { p.st = 'act'; p.stT = 0; p.actDur = dur; p.anim = anim; p.animT = 0; }
  function hurtGrabbed(g, dmg, p) { g.hp -= dmg; g.hitShow = 0.08; G.hitstop = 0.05; sparks(g.x, g.y, 50, 5); p.score += 20; if (g.hp <= 0) { g.grabbedBy = null; p.grab = null; killEnt(g, p, p.face); } }
  function throwGrab(p) {
    const g = p.grab; releaseGrab(p); p.grabHits = 0; setAct(p, 'throw', 0.4); SFX.play('throw');
    const pow = HEROES[p.hero].pow;
    g.x = p.x + p.face * 10; g.face = -p.face; g.thrown = p; setSt(g, 'fall'); g.vx = p.face * (300 + pow * 40); g.vz = 380; g.z = 30;
    g.hp -= 12 + pow * 4; if (g.hp <= 0) g.hp = 1; g.throwDmg = 14 + pow * 5;
  }
  function playerSpecial(p) {
    if (p.specCd > 0 || p.st === 'down' || p.st === 'fall') return;
    p.specCd = 0.9; p.inv = Math.max(p.inv, 0.5);
    let cost = true;
    const h = p.hero, pow = 0.7 + HEROES[h].pow * 0.18;
    if (h === 4) { cost = false; if (!p.weapon) p.weapon = { kind: 'revolver', ammo: 0 }; for (let i = 0; i < 4; i++) projectile(p, 'bullet', p.x + p.face * 26, p.y + (i - 1.5) * 10, 66, p.face * 1100, { dmg: 12, knock: i === 3 }); SFX.play('pistol'); setAct(p, 'aim', 0.4); }
    else if (h === 6) { for (let i = -1; i <= 1; i++) projectile(p, 'knife', p.x + p.face * 20, p.y + i * 22, 64, p.face * 800, { dmg: 16, knock: true }); SFX.play('knife'); setAct(p, 'toss', 0.35); }
    else if (h === 5) { setAct(p, 'spin', 0.5); meleeHit(p, 70, 12, 'knock', 90, true); const f = p.face; p.face = -f; meleeHit(p, 70, 12, 'knock', 90, true); p.face = f; for (const q of G.players) if (!q.out && !q.dying) { q.hp = Math.min(q.maxhp, q.hp + 12); floatText(q.x, q.y, 120, '+12', '#7dff9a'); } SFX.play('pickup'); }
    else if (h === 3) { setAct(p, 'upper', 0.5); p.vz = 360; p.slam = true; SFX.play('grunt'); }
    else if (h === 7) { setAct(p, 'jab', 0.5); p.vx = p.face * 520; p.vz = 260; p.pebble.jaw = 1; SFX.play('raptor'); p.pending = { at: 0.15, fn: () => meleeHit(p, 90, 26 * pow, 'knock', 100, true) }; }
    else if (h === 0) { setAct(p, 'windup', 0.5); p.pending = { at: 0.22, fn: () => { p.anim = 'cross'; p.animT = 0.3; if (meleeHit(p, 80, 34 * pow, 'knock', 90, true)) { G.shake = 7; } } }; SFX.play('grunt'); }
    else { setAct(p, 'spin', 0.45); SFX.play('whoosh'); const f = p.face; meleeHit(p, 80, 18 * pow, 'knock', 90, true); p.face = -f; meleeHit(p, 80, 18 * pow, 'knock', 90, true); p.face = f; }
    p.specCost = cost ? 6 : 0;
  }

  function updatePlayer(p, dt) {
    const s = src(p.src), h = heroStat(p);
    p.hitShow = Math.max(0, (p.hitShow || 0) - dt); p.hitKick = Math.max(0, (p.hitKick || 0) - dt * 5); // hitShow never decayed for players: that was the stuck white flash
    p.inv = Math.max(0, p.inv - dt); p.specCd = Math.max(0, (p.specCd || 0) - dt); p.comboT -= dt; p.kneeT = Math.max(0, (p.kneeT || 0) - dt);
    p.comboShow = Math.max(0, (p.comboShow || 0) - dt); if (p.comboShow <= 0) p.comboCount = 0;
    if (p.pebble) p.pebble.jaw = Math.max(0, p.pebble.jaw - dt * 4);
    p.hpShow += (p.hp - p.hpShow) * Math.min(1, dt * 3);
    p.stT += dt; p.animT += dt;
    if (p.st === 'fall' || p.st === 'hurt' || p.st === 'down') { physics(p, dt); if (p.st === 'hurt' && p.stT > 0.3) p.st = 'idle'; if (p.st === 'down' && p.stT > 1.0) { if (p.dying) { loseLife(p); return; } p.st = 'idle'; p.inv = 1.2; } return; }
    if (p.pending && p.stT >= p.pending.at) { const f = p.pending.fn; p.pending = null; f(); }
    // air
    if (p.z > 0 || p.vz > 0) {
      p.vz -= 1500 * dt; p.z += p.vz * dt; p.x += p.vx * dt; p.y = clamp(p.y + p.vy * dt, GT + 10, GB);
      if (p.z > 0 && s.p.atk && !p.airAtk) { p.airAtk = true; p.anim = 'jumpkick'; p.animT = 0; SFX.play('whoosh'); }
      if (p.airAtk) meleeHit(p, 60, 14 * (0.7 + h.pow * 0.18), 'knock', 150) && (p.airAtk = 'done');
      if (p.z <= 0) { p.z = 0; p.vz = 0; p.vx = 0; p.airAtk = false; SFX.play('land', { vol: 0.4 }); dust(p.x, p.y, 3); p.st = 'idle'; if (p.slam) { p.slam = false; G.shake = 8; SFX.play('stomp'); for (const t of G.ents) if (hostile(p, t) && Math.abs(t.x - p.x) < 140 && Math.abs(t.y - p.y) < 60) hurt(t, 26, p, 'knock', Math.sign(t.x - p.x) || 1); dust(p.x, p.y, 12); } }
      p.anim = p.airAtk ? 'jumpkick' : p.slam ? 'upper' : 'jump';
      clampToCam(p); return;
    }
    if (p.st === 'act') { p.x += (p.vx || 0) * dt; p.vx *= 0.9; if (p.stT >= p.actDur) { p.st = 'idle'; p.vx = 0; p.specCost = 0; } else { if (s.p.spc) playerSpecial(p); clampToCam(p); return; } }
    const sp = (120 + h.spd * 22) * (p.carry ? 0.75 : 1);
    let mx = (s.r ? 1 : 0) - (s.l ? 1 : 0), my = (s.d ? 1 : 0) - (s.u ? 1 : 0);
    if (p.grab) {
      const g = p.grab; g.x = p.x + p.face * 34; g.y = p.y; g.st = 'grabbed'; g.stT = 0; g.anim = 'hurt';
      p.anim = 'grab'; p.grabT = (p.grabT || 0) + dt;
      if (s.p.atk) playerAttack(p, s);
      if (s.p.jmp || (mx && Math.sign(mx) !== p.face) || p.grabT > 2.2) { if (mx && Math.sign(mx) !== p.face) { p.face = -p.face; throwGrab(p); } else { releaseGrab(p); } }
      return;
    }
    // run: double-tap left/right (touch: push the stick all the way)
    if (s.p.r || s.p.l) { const d = s.p.r ? 1 : -1; if (p.tapDir === d && G.t - p.tapT < 0.3) { p.running = true; p.runDir = d; SFX.play('skid', { vol: 0.4 }); } p.tapDir = d; p.tapT = G.t; }
    if (p.src === 'touch' && Math.abs(touch.dx) > 0.92) { p.running = true; p.runDir = Math.sign(touch.dx); }
    if (!mx || mx !== p.runDir) p.running = false;
    const rs = p.running ? 1.9 : 1;
    if (mx) p.face = mx;
    p.x += mx * sp * rs * dt; p.y = clamp(p.y + my * sp * 0.62 * dt, GT + 10, GB);
    if (mx || my) { p.anim = 'walk'; p.walkPh += dt * (8 + h.spd) * (p.running ? 2.1 : 1); } else p.anim = 'idle';
    if (p.running && Math.random() < dt * 14) dust(p.x - p.face * 14, p.y, 1);
    if (p.pebble) { p.pebble.moving = !!(mx || my); p.pebble.walkPh = p.walkPh; }
    // auto-grab: walking into a stunned enemy
    if (mx && !p.weapon && p.hero !== 7) for (const t of G.ents) { if (t.kind === 'foe' && !t.boss && t.st === 'hurt' && !t.dying && Math.abs(t.y - p.y) < 14 && (t.x - p.x) * p.face > 0 && Math.abs(t.x - p.x) < 40) { p.grab = t; t.grabbedBy = p; p.grabT = 0; p.grabHits = 0; SFX.play('grunt', { vol: 0.5 }); break; } }
    if (s.p.jmp) { p.vz = 520 + h.spd * 12; p.z = 1; p.vx = mx * sp * rs; p.vy = my * sp * 0.5; SFX.play('jump', { vol: 0.5 }); }
    else if (s.p.atk && p.running && !p.weapon) { // dash attack
      p.running = false; setAct(p, p.hero === 2 ? 'jumpkick' : 'kick', 0.42); p.vx = p.face * 460; SFX.play('whoosh');
      p.pending = { at: 0.06, fn: () => { if (meleeHit(p, 70, 16 * (0.7 + h.pow * 0.18), 'knock', 90, true)) G.shake = Math.max(G.shake, 4); } };
    }
    else if (s.p.spc) playerSpecial(p);
    else if (s.p.atk) {
      // pick up item under feet
      let it = null; for (const e of G.ents) if (e.kind === 'item' && Math.abs(e.x - p.x) < 34 && Math.abs(e.y - p.y) < 20) { it = e; break; }
      if (it && !(p.hero === 7 && GUNS[it.item])) pickup(p, it);
      else if (p.carry) throwCarry(p);
      else if (!p.weapon && p.hero !== 7 && tryLift(p)) { /* lifted a prop or a downed enemy */ }
      else playerAttack(p, s);
    }
    clampToCam(p);
  }
  function pickup(p, it) {
    it.dead = true;
    if (FOOD[it.item]) { p.hp = Math.min(p.maxhp, p.hp + FOOD[it.item]); SFX.play('eat'); floatText(p.x, p.y, 110, '+' + FOOD[it.item] + ' HP', '#7dff9a'); }
    else if (it.item === 'gold') { p.score += 1000; SFX.play('coin'); floatText(p.x, p.y, 110, '+1000', '#ffe08a'); }
    else if (it.item === 'ammo') { if (p.weapon && GUNS[p.weapon.kind]) { p.weapon.ammo = GUNS[p.weapon.kind]; SFX.play('reload'); floatText(p.x, p.y, 110, 'RELOAD', '#fff'); } else { p.score += 300; SFX.play('coin'); } }
    else { if (p.weapon) dropWeapon(p); p.weapon = { kind: it.item, ammo: GUNS[it.item] }; SFX.play('reload'); floatText(p.x, p.y, 110, it.item.toUpperCase(), '#fff'); }
  }
  // Lift a barrel or crate standing next to you, or pick a downed enemy off the floor (then the normal grab moves apply).
  function tryLift(p) {
    let best = null, bd = 1e9;
    for (const t of G.ents) {
      if (t.dead || t.kind !== 'prop') continue;
      const dx = (t.x - p.x) * p.face;
      if (Math.abs(t.y - p.y) < 22 && dx > -22 && dx < 54) { const d = Math.abs(t.x - p.x); if (d < bd) { bd = d; best = t; } }
    }
    if (best) { best.dead = true; p.carry = { kind: best.prop }; SFX.play('grunt', { vol: 0.6 }); floatText(p.x, p.y, 130, 'LIFT', '#fff'); return true; }
    for (const t of G.ents) {
      if (t.kind === 'foe' && !t.boss && t.st === 'down' && !t.dying && t.stT > 0.15 && Math.abs(t.y - p.y) < 22 && Math.abs(t.x - p.x) < 56) {
        p.grab = t; t.grabbedBy = p; t.z = 0; t.st = 'grabbed'; p.grabT = 0; p.grabHits = 0; SFX.play('grunt', { vol: 0.5 }); return true;
      }
    }
    return false;
  }
  function throwCarry(p) {
    const k = p.carry.kind; p.carry = null;
    projectile(p, 'gun', p.x + p.face * 26, p.y, 78, p.face * 540, { dmg: 26, knock: true, life: 0.9, spin: 1, gk: 'prop:' + k });
    setAct(p, 'throw', 0.35); SFX.play('throw');
  }
  function breakProp(x, y, kind) {
    SFX.play('glass');
    for (let i = 0; i < 10; i++) part({ type: 'chunk', x, y, z: 20, vx: rnd(-200, 200), vz: rnd(100, 300), g: 900, life: 0.8, col: kind === 'crate' ? '#8b6232' : kind === 'oil' ? '#b8341f' : '#6d4a2c', size: rnd(4, 8) });
    if (kind === 'oil') boom(x, y, 120);
    randomDrop(x, y, 1.2);
  }
  function loseLife(p) {
    p.lives--; p.dying = false;
    if (p.lives < 0) { p.out = true; p.lives = 0; return; }
    p.hp = p.maxhp; p.hpShow = p.maxhp; p.st = 'idle'; p.inv = 3; p.z = 200; p.vz = 0; p.weapon = p.hero === 4 ? { kind: 'revolver', ammo: 6 } : null;
    p.x = G.camX + 200; p.y = 400;
  }
  function clampToCam(e) {
    const lo = G.camX + 30, hi = G.camX + W - 30;
    e.x = clamp(e.x, lo, hi);
  }
  function physics(e, dt) {
    e.x += e.vx * dt; e.vx *= Math.pow(0.02, dt);
    if (e.z > 0 || e.vz > 0) {
      e.vz -= 1500 * dt; e.z += e.vz * dt;
      if (e.thrown) { for (const t of G.ents) if (t !== e && t.kind === 'foe' && !t.dying && t.st !== 'fall' && Math.abs(t.x - e.x) < 36 && Math.abs(t.y - e.y) < 24) { hurt(t, e.throwDmg || 18, e.thrown, 'knock', Math.sign(e.vx) || 1); } }
      if (e.z <= 0) {
        e.z = 0;
        if (e.st === 'fall' && !e.bounced && Math.abs(e.vx) > 60) { e.bounced = true; e.vz = 140; e.z = 1; G.shake = Math.max(G.shake, 2); SFX.play('land'); dust(e.x, e.y, 5); if (e.thrown) { hurt(e, e.throwDmg || 10, e.thrown, 'light', 1); } }
        else { e.vz = 0; e.bounced = false; e.thrown = null; if (e.st === 'fall') { e.st = 'down'; e.stT = 0; e.anim = 'down'; dust(e.x, e.y, 4); } }
      }
    }
    if (e.kind !== 'player') e.x = clamp(e.x, G.camX - 200, G.camX + W + 200);
  }

  // ---------------- foes ----------------
  function nearestPlayer(e) { let b = null, bd = 1e9; for (const p of G.players) { if (p.out || p.dying) continue; const d = Math.abs(p.x - e.x) + Math.abs(p.y - e.y) * 1.5; if (d < bd) { bd = d; b = p; } } return b; }
  function updateFoe(e, dt) {
    e.stT += dt; e.animT += dt; e.hitShow = Math.max(0, e.hitShow - dt); e.hitKick = Math.max(0, (e.hitKick || 0) - dt * 5);
    if (e.st === 'grabbed') { if (!e.grabbedBy) e.st = 'idle'; return; }
    if (e.st === 'fall' || e.st === 'down' || e.st === 'hurt') {
      physics(e, dt);
      if (e.st === 'hurt' && e.stT > 0.35) e.st = 'idle';
      if (e.st === 'down') { if (e.dying && e.stT > 0.7) { e.dead = true; if (e.boss) bossDown(e); } else if (!e.dying && e.stT > (e.boss ? 0.6 : 1.4)) { e.st = 'idle'; e.inv = 0.4; } }
      return;
    }
    if (e.st === 'enter') { e.face = e.x > G.camX + W / 2 ? -1 : 1; e.x += e.face * e.spd * dt; e.anim = 'walk'; e.walkPh += dt * 8; if (e.x > G.camX + 60 && e.x < G.camX + W - 60) { e.st = 'idle'; } return; }
    const tgt = e.type === 'poacher' && G.ents.find(d => d.kind === 'dino' && !d.dying && d.mood === 'calm' && Math.abs(d.x - e.x) < 400) || nearestPlayer(e);
    if (!tgt) { e.anim = 'idle'; return; }
    const d = BOSSES[e.type] || FOES[e.type];
    if (e.st === 'wind') {
      e.anim = e.type === 'brute' || e.type === 'holloway' ? 'windup' : e.weapon && ['rifle', 'shotgun'].includes(e.weapon.kind) ? 'aim' : 'windup';
      if (e.stT > e.windT) doFoeAttack(e, tgt);
      return;
    }
    if (e.st === 'act') { if (e.pending && e.stT >= e.pending.at) { const f = e.pending.fn; e.pending = null; f(); } if (e.charging) { e.x += e.face * 420 * dt; meleeHit(e, 50, e.dmg, 'knock', 80, true); } if (e.stT > e.actDur) { e.st = 'idle'; e.charging = false; if (!e.boss) e.backT = rnd(0.25, 0.7); } return; }
    e.think -= dt; e.backT = Math.max(0, (e.backT || 0) - dt);
    const ranged = e.weapon && ['rifle', 'shotgun'].includes(e.weapon.kind);
    // Enemies pick a side and a lane, take turns attacking (limited slots) and circle while they wait,
    // so a fight is never one enemy standing still while the player walks away.
    if (e.tgtId !== tgt.id) { e.tgtId = tgt.id; e.side = e.x < tgt.x ? -1 : 1; e.flanked = false; }
    if (e.id % 3 === 0 && !e.flanked && !ranged && Math.abs(e.x - tgt.x) < 280) { e.side = -e.side; e.flanked = true; } // some come round the back
    const pl = G.players.filter(q => !q.out && !q.dying).length || 1;
    let busy = 0; for (const o of G.ents) if (o !== e && o.kind === 'foe' && !o.dead && !o.boss && (o.st === 'wind' || o.st === 'act')) busy++;
    const slots = 1 + pl;
    const queue = !ranged && !e.boss && busy >= slots;
    const want = ranged ? 260 : e.backT > 0 ? 120 : queue ? 140 : 56;
    const lane = ((e.id * 37) % 5 - 2) * 9;
    const gx = tgt.x + e.side * want, gy = tgt.y + (queue ? lane * 2 + Math.sin(G.t * 1.4 + e.id) * 34 : lane * 0.3);
    const dx = gx - e.x, dy = gy - e.y;
    e.face = tgt.x > e.x ? 1 : -1;
    // sidestep when the player swings at us
    e.dodgeT = Math.max(0, (e.dodgeT || 0) - dt);
    if (!e.boss && e.id % 3 === 1 && e.dodgeT <= 0 && tgt.st === 'act' && ['jab', 'cross', 'kick', 'swing', 'upper'].includes(tgt.anim) && Math.abs(tgt.x - e.x) < 80 && Math.random() < dt * 2) { e.dodgeT = 0.28; e.dodgeDy = (Math.random() < 0.5 ? -1 : 1) * 190; }
    if (e.dodgeT > 0) { e.y = clamp(e.y + e.dodgeDy * dt, GT + 10, GB); e.anim = 'walk'; e.walkPh += dt * 12; return; }
    if (Math.abs(dx) > 8 || Math.abs(dy) > 6) {
      const far = Math.abs(e.x - tgt.x) > 300;
      const sp = e.spd * (e.boss && e.phase === 2 ? 1.3 : 1) * (far ? 1.35 : 1);
      e.x += clamp(dx, -1, 1) * sp * dt * (Math.abs(dx) > 8 ? 1 : 0); e.y = clamp(e.y + clamp(dy, -1, 1) * sp * 0.7 * dt * (Math.abs(dy) > 6 ? 1 : 0), GT + 10, GB);
      e.anim = 'walk'; e.walkPh += dt * (far ? 11 : 8);
    } else e.anim = 'idle';
    const inRange = ranged ? Math.abs(e.y - tgt.y) < 30 && Math.abs(e.x - tgt.x) < 480 : Math.abs(e.x - tgt.x) < 76 && Math.abs(e.y - tgt.y) < 18; // must be inside the reach of the blow, or it whiffs
    if (e.think <= 0 && e.backT <= 0 && (inRange && (e.boss || ranged || busy < slots) || e.boss && Math.random() < 0.3)) {
      e.think = (e.boss ? rnd(0.5, 1.0) : rnd(0.5, 1.2)) / (e.phase || 1);
      e.st = 'wind'; e.stT = 0; e.windT = ranged ? 0.5 : e.boss ? 0.3 : 0.3; e.atkKind = pickFoeAttack(e, tgt);
      if (e.atkKind === 'charge') { e.windT = 0.5; SFX.play('grunt'); }
    }
  }
  function pickFoeAttack(e, tgt) {
    if (e.type === 'brute' || e.type === 'holloway') return Math.random() < 0.4 ? 'charge' : 'smash';
    if (e.type === 'bram') return Math.random() < 0.35 ? 'charge' : 'slash';
    if (e.type === 'vane') { const r = Math.random(); return r < 0.3 ? 'charge' : r < 0.5 && e.phase === 2 ? 'wave' : 'combo'; }
    if (e.type === 'gator') return Math.random() < 0.6 ? 'shoot' : 'dyn';
    if (e.type === 'holloway' && Math.random() < 0.3) return 'dyn';
    if (e.weapon && ['rifle', 'shotgun'].includes(e.weapon.kind)) return 'shoot';
    if (e.type === 'knifer' && Math.random() < 0.3) return 'toss';
    return 'hit';
  }
  function doFoeAttack(e, tgt) {
    e.st = 'act'; e.stT = 0; e.actDur = 0.35;
    const k = e.atkKind;
    if (k === 'shoot') {
      e.anim = 'aim'; e.animT = 0;
      if (e.weapon.kind === 'shotgun') { SFX.play('shotgun'); for (let i = -1; i <= 1; i++) projectile(e, 'bullet', e.x + e.face * 40, e.y + i * 12, 76, e.face * 700, { dmg: e.dmg * 0.8, knock: true, life: 0.5 }); }
      else { SFX.play('rifle'); projectile(e, 'bullet', e.x + e.face * 44, e.y, 76, e.face * 900, { dmg: e.dmg, knock: true }); }
      part({ type: 'flash', x: e.x + e.face * 44, y: e.y, z: 76, life: 0.06, size: 16 });
      if (e.boss && Math.random() < 0.5) { e.atkKind = 'shoot'; e.st = 'wind'; e.stT = 0.2; }
    } else if (k === 'dyn') { e.anim = 'toss'; e.animT = 0; SFX.play('throw'); const dist = clamp(Math.abs(tgt.x - e.x), 100, 420); projectile(e, 'dyn', e.x + e.face * 20, e.y, 80, e.face * dist * 0.95, { vz: 420, vy: (tgt.y - e.y) * 0.9, fuse: 1.0, life: 3 }); e.actDur = 0.5; }
    else if (k === 'toss') { e.anim = 'toss'; e.animT = 0; SFX.play('knife'); projectile(e, 'knife', e.x + e.face * 20, e.y, 60, e.face * 600, { dmg: 10 }); e.actDur = 0.5; }
    else if (k === 'charge') { e.anim = 'charge'; e.charging = true; e.actDur = 0.6; SFX.play('whoosh'); }
    else if (k === 'wave') { e.anim = 'upper'; e.animT = 0; e.actDur = 0.6; SFX.play('zap'); for (let i = 0; i < 2; i++) projectile(e, 'wave', e.x + e.face * 30, e.y, 20, e.face * (520 + i * 160), { dmg: 16, knock: true, life: 1.4 }); }
    else if (k === 'combo') { e.anim = 'jab'; e.animT = 0; e.actDur = 0.5; SFX.play('whoosh'); e.pending = { at: 0.08, fn: () => { meleeHit(e, 80, e.dmg * 0.6, 'light', 80); e.anim = 'kick'; e.animT = 0; e.pending = { at: 0.3, fn: () => meleeHit(e, 90, e.dmg, 'knock', 80) }; } }; }
    else { e.anim = e.type === 'brute' || e.type === 'holloway' ? 'upper' : e.weapon ? 'swing' : Math.random() < 0.5 ? 'jab' : 'kick'; e.animT = 0; SFX.play('whoosh', { vol: 0.5 }); meleeHit(e, e.weapon ? 100 : 92, e.dmg, k === 'smash' || k === 'slash' || e.type === 'brute' ? 'knock' : 'light', 80); }
  }
  function bossDown(e) {
    if (e.type === 'vane' && !G.rexDone) {
      G.rexDone = true; G.boss = spawnDino(G.camX + W + 150, 400, true); G.boss.st = 'enter'; SFX.play('boss_warning'); SFX.music('finalboss');
      G.msg = 'VANE\'S TYRANT BREAKS FREE!'; G.msgT = 3; return;
    }
    G.boss = null; stageClear();
  }

  // ---------------- dinos ----------------
  function updateDino(d, dt) {
    d.stT += dt; d.hitShow = Math.max(0, d.hitShow - dt); d.hitKick = Math.max(0, (d.hitKick || 0) - dt * 5); d.jaw = Math.max(0, d.jaw - dt * 3);
    if (d.st === 'fall' || d.st === 'down' || d.st === 'hurt') { physics(d, dt); d.moving = false; if (d.st === 'hurt' && d.stT > 0.3) d.st = 'idle'; if (d.st === 'down') { if (d.dying && d.stT > 0.8) { d.dead = true; if (d.rex) { G.boss = null; stageClear(); } } else if (!d.dying && d.stT > 0.8) d.st = 'idle'; } return; }
    if (d.st === 'enter') { d.face = -1; d.x -= 160 * dt; d.moving = true; d.walkPh += dt * 6; if (d.x < G.camX + W - 180) { d.st = 'idle'; SFX.play('roar'); G.shake = 10; } return; }
    if (d.mood === 'enraged' && !d.rex) { d.moodT -= dt; if (d.moodT <= 0 || d.hp < d.maxhp * 0.5 && !d.halfDone) { d.halfDone = d.hp < d.maxhp * 0.5; d.mood = 'exhausted'; d.moodT = 8; } }
    if (d.mood === 'exhausted') { d.moodT -= dt; d.moving = false; if (d.moodT <= 0) d.mood = 'calm'; return; }
    if (d.st === 'act') { if (d.pending && d.stT >= d.pending.at) { const f = d.pending.fn; d.pending = null; f(); } if (d.leap) { d.x += d.face * (d.rex ? 300 : 420) * dt; } if (d.stT > d.actDur) { d.st = 'idle'; d.leap = false; d.pounce = false; } physicsZ(d, dt); return; }
    if (d.mood === 'calm') {
      d.think -= dt; if (d.think <= 0) { d.think = rnd(1.5, 4); d.wx = d.x + rnd(-160, 160); d.wy = rnd(GT + 30, GB - 10); }
      const dx = (d.wx || d.x) - d.x, dy = (d.wy || d.y) - d.y;
      d.moving = Math.abs(dx) > 6; if (d.moving) { d.face = Math.sign(dx); d.x += Math.sign(dx) * 50 * dt; d.y += clamp(dy, -1, 1) * 30 * dt; d.walkPh += dt * 5; }
      d.x = clamp(d.x, G.camX + 20, G.camX + W - 20);
      return;
    }
    // enraged
    let t = d.target; if (!t || t.dead || t.dying || t.out) { t = d.rex ? nearestPlayer(d) : nearestAny(d); d.target = t; }
    if (!t) { d.moving = false; return; }
    const dx = t.x - d.x, dy = t.y - d.y; d.face = Math.sign(dx) || 1;
    const reach = d.rex ? 170 : 80, sp = d.rex ? 110 : 200;
    if (Math.abs(dx) > reach * 0.7 || Math.abs(dy) > 16) { d.moving = true; d.walkPh += dt * (d.rex ? 5 : 10); d.x += clamp(dx, -1, 1) * sp * dt * (Math.abs(dx) > reach * 0.7 ? 1 : 0); d.y += clamp(dy, -1, 1) * sp * 0.6 * dt; }
    else d.moving = false;
    d.think -= dt;
    if (d.think <= 0 && Math.abs(dx) < reach * 1.8 && Math.abs(dy) < 30) {
      d.think = d.rex ? rnd(1.0, 1.8) : rnd(0.9, 1.6); d.st = 'act'; d.stT = 0;
      const r = Math.random();
      if (d.rex && r < 0.25) { d.actDur = 1.0; SFX.play('roar'); G.shake = 8; d.jaw = 1; d.pending = { at: 0.5, fn: () => { for (const p of G.players) if (!p.out && Math.abs(p.x - d.x) < 400 && p.z === 0) hurt(p, 10, d, 'light', Math.sign(p.x - d.x)); } }; }
      else if (d.rex && r < 0.5) { d.actDur = 0.9; d.pending = { at: 0.55, fn: () => { G.shake = 9; SFX.play('stomp'); dust(d.x, d.y, 14); projectile(d, 'wave', d.x, d.y, 10, 500, { dmg: 18, knock: true, life: 1.2 }); projectile(d, 'wave', d.x, d.y, 10, -500, { dmg: 18, knock: true, life: 1.2 }); } }; }
      else { d.actDur = d.rex ? 0.7 : 0.55; d.leap = !d.rex || r < 0.7; d.pounce = true; d.vz = d.rex ? 0 : 280; d.jaw = 1; SFX.play(d.rex ? 'roar' : 'raptor', { vol: 0.6 }); d.pending = { at: d.rex ? 0.35 : 0.25, fn: () => { d.jaw = 1; meleeHit(d, reach, d.rex ? 22 : 11, 'knock', 120, true); } }; }
    }
  }
  function physicsZ(d, dt) { if (d.z > 0 || d.vz > 0) { d.vz -= 1500 * dt; d.z += d.vz * dt; if (d.z <= 0) { d.z = 0; d.vz = 0; } } }
  function nearestAny(d) { let b = null, bd = 1e9; for (const e of G.ents) { if (e.dying || e.dead || (e.kind !== 'foe' && e.kind !== 'player') || e.out) continue; const k = Math.abs(e.x - d.x) + Math.abs(e.y - d.y) * 2; if (k < bd) { bd = k; b = e; } } for (const p of G.players) { if (p.out || p.dying) continue; const k = Math.abs(p.x - d.x) + Math.abs(p.y - d.y) * 2; if (k < bd) { bd = k; b = p; } } return b; }

  // ---------------- projectiles ----------------
  function updateProj(pr, dt) {
    pr.life -= dt; if (pr.life <= 0) { pr.dead = true; if (pr.pk === 'dyn') boom(pr.x, pr.y, 110); return; }
    pr.x += pr.vx * dt; pr.y = clamp(pr.y + pr.vy * dt, GT + 6, GB);
    if (pr.pk === 'dyn') { pr.vz -= 1100 * dt; pr.z += pr.vz * dt; if (pr.z <= 0) { pr.z = 0; pr.vz = Math.abs(pr.vz) * 0.3; pr.vx *= 0.5; pr.vy *= 0.5; } pr.fuse -= dt; if (pr.fuse <= 0) { pr.dead = true; boom(pr.x, pr.y, 115); } if (Math.random() < 0.6) part({ type: 'spark', x: pr.x, y: pr.y, z: pr.z + 12, vx: rnd(-40, 40), vz: rnd(40, 120), life: 0.2, col: '#ffcc55', size: 2 }); return; }
    if (pr.pk === 'wave') { if (Math.random() < 0.8) part({ type: 'fire', x: pr.x, y: pr.y, z: 10, vx: 0, vz: rnd(40, 120), life: 0.4, size: rnd(8, 16) }); }
    for (const t of G.ents) {
      if (t === pr || t === pr.owner || pr.hits[t.id]) continue;
      if (!hostile(pr.owner, t) && !(pr.owner.faction !== 'dino' && t.kind === 'dino')) continue;
      if (t.kind === 'prop' && pr.owner.faction !== 'hero') continue;
      if (t.dying || t.st === 'down') continue;
      const hitW = t.rex ? 110 : 26;
      if (Math.abs(t.x - pr.x) < hitW && Math.abs(t.y - pr.y) < (t.rex ? 40 : 22) && pr.z < (t.rex ? 220 : 120) + (t.z || 0)) {
        pr.hits[t.id] = 1; hurt(t, pr.dmg, pr.owner, pr.knock ? 'knock' : 'light', Math.sign(pr.vx) || 1, 'bullet');
        if (pr.pierce-- <= 0) { pr.dead = true; break; }
      }
    }
    for (const p of G.players) {
      if (pr.dead || pr.owner.faction === 'hero' || pr.hits[p.id] || p.out || p.dying) continue;
      if (Math.abs(p.x - pr.x) < 24 && Math.abs(p.y - pr.y) < 20 && pr.z < 120 + p.z) { pr.hits[p.id] = 1; hurt(p, pr.dmg, pr.owner, pr.knock ? 'knock' : 'light', Math.sign(pr.vx) || 1, 'bullet'); if (pr.pk !== 'wave') pr.dead = true; }
    }
    if (pr.x < G.camX - 100 || pr.x > G.camX + W + 100) pr.dead = true;
  }

  // ---------------- stage flow ----------------
  function startGame() {
    G.players = []; let slot = 0;
    for (const id in G.sel) { const s = G.sel[id]; if (s.locked) G.players.push(makePlayer(id, s.hero, slot++)); }
    if (!G.players.length) return;
    G.stage = 0; G.continues = 3; beginStory(0);
  }
  function beginStory(i) { G.state = 'story'; G.story = { lines: i === 'end' ? ENDING : STORY[i], i: 0, ch: 0, next: i }; SFX.music('story'); }
  function beginStage(i) {
    const st = STAGES[i]; G.stage = i; G.ents = []; G.parts = []; G.camX = 0; G.lockX = null; G.goArrow = true; G.wave = 0; G.boss = null; G.rexDone = false; G.mercyLost = 0; G.banner = 3; G.slowmo = 0; G.clearT = 0;
    for (const p of G.players) { if (p.out) continue; p.x = 140 + p.slot * 34; p.y = 360 + (p.slot % 4) * 40; p.z = 0; p.vz = 0; p.st = 'idle'; p.inv = 2; p.dying = false; p.grab = null; }
    SFX.music(st.music);
    if (st.drive) { beginDrive(); return; }
    G.state = 'play';
    for (let x = 500; x < st.len - 400; x += rnd(380, 700)) spawnProp(x, rnd(GT + 40, GB - 30), Math.random() < 0.25 ? 'oil' : Math.random() < 0.5 ? 'crate' : 'barrel');
    if (i > 0) for (let k = 0; k < 2; k++) spawnDino(rnd(600, st.len - 800), rnd(GT + 40, GB - 20));
  }
  function stageClear() {
    if (G.state === 'clear') return;
    G.state = 'clear'; G.clearT = 0; SFX.music('victory');
    const alive = G.ents.filter(e => e.kind === 'dino' && !e.dying && !e.dead && !e.rex).length;
    G.mercyBonus = alive * 1000 + (G.mercyLost ? 0 : 2000);
    for (const p of G.players) if (!p.out) p.score += G.mercyBonus;
  }
  function nextAfterClear() {
    if (G.stage + 1 >= STAGES.length) { beginStory('end'); return; }
    beginStory(G.stage + 1);
  }
  function updateStageFlow(dt) {
    const st = STAGES[G.stage];
    const alive = G.players.filter(p => !p.out);
    if (!alive.length) { gameOver(); return; }
    // camera
    const ax = alive.reduce((s, p) => s + p.x, 0) / alive.length;
    const minX = Math.min(...alive.map(p => p.x));
    for (const p of alive) if (p.x < G.camX + 40 && G.lockX === null) p.x = Math.max(p.x, G.camX + 40);
    const maxX = Math.max(...alive.map(p => p.x));
    let target = Math.max(ax - W * 0.42, maxX - W * 0.62);
    target = Math.max(G.camX, target);
    if (G.lockX !== null) target = Math.min(target, G.lockX);
    target = Math.min(target, st.len - W);
    G.camX += (target - G.camX) * Math.min(1, dt * 5);
    // waves
    const waves = st.waves;
    if (G.lockX === null && G.wave < waves.length && G.camX >= waves[G.wave][0] - 2) {
      G.lockX = waves[G.wave][0]; G.camX = G.lockX; const list = waves[G.wave][1].slice();
      const n = alive.length; if (n > 1) for (let k = 0; k < Math.min(6, (n - 1) * 2); k++) list.push(['punk', 'knifer', 'gunner', 'brute'][k % 4]);
      G.spawnQ = list.map((t, k) => ({ t, at: k * 0.5 }));
      G.spawnT = 0; G.wave++;
    }
    if (G.lockX === null && G.wave >= waves.length && !G.bossSpawned && G.camX >= st.len - W - 4) {
      G.lockX = st.len - W; G.bossSpawned = true;
      G.boss = spawnFoe(st.boss, G.camX + W + 80, 410, true); G.boss.st = 'enter';
      SFX.play('boss_warning'); SFX.music('boss'); G.msg = 'WARNING: ' + BOSSES[st.boss].name; G.msgT = 2.5;
      spawnFoe('punk', G.camX - 60, 360); if (G.stage >= 3) spawnFoe('knifer', G.camX + W + 60, 460);
    }
    if (G.spawnQ && G.spawnQ.length) {
      G.spawnT += dt;
      while (G.spawnQ.length && G.spawnQ[0].at <= G.spawnT) { const q = G.spawnQ.shift(); const left = Math.random() < 0.35; const x = left ? G.camX - 50 : G.camX + W + 50; if (q.t === 'raptorCalm') spawnDino(G.camX + rnd(200, W - 100), rnd(GT + 30, GB - 10)); else spawnFoe(q.t, x, rnd(GT + 25, GB - 10)); }
    }
    const foesLeft = G.ents.some(e => e.kind === 'foe' && !e.dead) || (G.spawnQ && G.spawnQ.length);
    if (G.lockX !== null && !foesLeft && !G.bossSpawned) { G.lockX = null; G.goT = 2.5; G.goArrow = true; SFX.play('menu_select'); }
    G.goT = Math.max(0, G.goT - dt);
    // enraged dinos still count as hazards but not blockers
  }
  function gameOver() {
    if (G.state === 'continue') return;
    G.state = 'continue'; G.continueT = 9.99; SFX.music('gameover');
  }
  function recordScores() {
    for (const p of G.players) G.hi.push({ n: HEROES[p.hero].name, s: p.score });
    G.hi.sort((a, b) => b.s - a.s); G.hi = G.hi.slice(0, 8); lsSet('tt_hi', G.hi);
  }

  // ---------------- driving stage ----------------
  function beginDrive() {
    G.state = 'drive';
    G.car = { y: 420, z: 0, vz: 0, sx: 220, speed: 0.4, hp: 100, maxhp: 100, hpShow: 100, nitro: 100, nitroT: 0, inv: 2, flash: 0, look: { paint: '#d8323c', trim: '#f4efe6' }, dist: 0, spawnT: 1.5, truck: null };
    G.ents = []; SFX.engineStart();
  }
  function updateDrive(dt) {
    const c = G.car, st = STAGES[G.stage];
    const alive = G.players.filter(p => !p.out); if (!alive.length) { SFX.engineStop(); gameOver(); return; }
    let steer = 0, thr = 0; const drv = alive[0];
    for (const p of alive) { const s = src(p.src); steer += (s.d ? 1 : 0) - (s.u ? 1 : 0); if (p === drv) thr = (s.r ? 1 : 0) - (s.l ? 1 : 0);
      p.fireCd = Math.max(0, (p.fireCd || 0) - dt); p.firing = Math.max(0, (p.firing || 0) - dt);
      if ((s.atk) && p.fireCd <= 0) { p.fireCd = p === drv && alive.length > 1 ? 0.35 : 0.18; p.firing = 0.08; SFX.play(alive.length > 1 && p !== drv ? 'shotgun' : 'uzi', { vol: 0.6 }); projectile(p, 'bullet', G.camX + c.sx + 150, c.y + (p.slot % 3 - 1) * 10, 70 + c.z, 1400, { dmg: p === drv ? 10 : 16, life: 0.8 }); }
      if (s.p.jmp && c.z === 0) { c.vz = 520; SFX.play('jump'); }
      if (s.p.spc && c.nitro >= 30 && c.nitroT <= 0) { c.nitroT = 1.4; c.nitro -= 30; SFX.play('horn'); }
    }
    c.y = clamp(c.y + clamp(steer, -1, 1) * 260 * dt, GT + 50, GB - 4);
    c.speed = clamp(c.speed + thr * dt * 0.8 - (thr === 0 ? (c.speed - 0.5) * dt : 0), 0.15, 1);
    c.nitroT -= dt; c.nitro = Math.min(100, c.nitro + dt * 6);
    const spd = 420 + c.speed * 520 + (c.nitroT > 0 ? 500 : 0);
    SFX.engineSet(Math.min(1, spd / 1400));
    c.sx += ((180 + c.speed * 160 + (c.nitroT > 0 ? 80 : 0)) - c.sx) * dt * 2;
    if (c.z > 0 || c.vz > 0) { c.vz -= 1500 * dt; c.z += c.vz * dt; if (c.z <= 0) { c.z = 0; c.vz = 0; G.shake = 3; SFX.play('land'); } }
    c.inv -= dt; c.flash -= dt; c.hpShow += (c.hp - c.hpShow) * dt * 3;
    if (!c.truck) { G.camX += spd * dt; c.dist += spd * dt; }
    else G.camX += spd * dt;
    // spawn traffic
    c.spawnT -= dt;
    if (!c.truck && c.dist < st.len && c.spawnT <= 0) {
      c.spawnT = rnd(0.45, 1.1);
      const r = Math.random(), y = rnd(GT + 50, GB - 6), x = G.camX + W + 80;
      if (r < 0.35) G.ents.push({ id: G.idc++, kind: 'road', rk: 'biker', x, y, z: 0, hp: 20, vx: 380 + rnd(0, 200), look: FOES.punk.look, anim: 'drive', animT: 0 });
      else if (r < 0.55) G.ents.push({ id: G.idc++, kind: 'road', rk: 'thug', x, y, z: 0, hp: 10, vx: 0, look: [FOES.punk, FOES.knifer, FOES.gunner][Math.floor(rnd(0, 3))].look, anim: 'idle', animT: 0 });
      else if (r < 0.75) G.ents.push({ id: G.idc++, kind: 'road', rk: 'wreck', x, y, z: 0, hp: 40, vx: 0 });
      else if (r < 0.85) G.ents.push({ id: G.idc++, kind: 'road', rk: 'mine', x, y, z: 0, hp: 1, vx: 0 });
      else { const d = { id: G.idc++, kind: 'road', rk: 'raptor', x, y, z: 0, hp: 30, vx: 60, vy: rnd(-60, 60), color: '#4f8a3a', belly: '#d9d2a0', stripe: '#2f5a24', mood: 'calm', scale: 0.9, moving: true, walkPh: 0 }; G.ents.push(d); }
    }
    if (!c.truck && c.dist >= st.len) { c.truck = { x: G.camX + W + 300, y: 420, hp: 900 * (1 + 0.4 * (alive.length - 1)), maxhp: 900 * (1 + 0.4 * (alive.length - 1)), flash: 0, t: 0, atk: 2, vy: 0 }; SFX.play('boss_warning'); SFX.music('boss'); G.msg = 'WARNING: MARROW HAULER'; G.msgT = 2.5; }
    const carX = G.camX + c.sx;
    for (const e of G.ents) {
      if (e.dead) continue;
      if (e.kind === 'proj') { updateProjDrive(e, dt); continue; }
      if (e.kind !== 'road') { if (e.kind === 'item') e.dead = true; continue; }
      e.x += e.vx * dt; if (e.vy) e.y = clamp(e.y + e.vy * dt, GT + 40, GB); e.walkPh = (e.walkPh || 0) + dt * 10; e.animT += dt || 0;
      if (e.rk === 'biker') { e.vy = clamp(c.y - e.y, -1, 1) * 80; e.y += e.vy * dt; e.vy = 0; }
      if (e.x < G.camX - 200) { e.dead = true; continue; }
      const dx = e.x - carX, dy = Math.abs(e.y - c.y);
      if (dx > -150 && dx < 170 && dy < 30 && c.z < 30) {
        if (e.rk === 'wreck' || e.rk === 'mine') { if (c.inv <= 0 && c.nitroT <= 0) { carHit(e.rk === 'mine' ? 18 : 12); } e.dead = true; if (e.rk === 'mine') boomFx(e.x, e.y); else { SFX.play('crash'); for (let i = 0; i < 10; i++) part({ type: 'chunk', x: e.x, y: e.y, z: 20, vx: rnd(100, 500), vz: rnd(100, 300), g: 900, life: 0.8, col: '#555', size: rnd(4, 9) }); } }
        else { e.dead = true; SFX.play('heavyhit'); sparks(e.x, e.y, 50, 8, '#ffb347', true); G.hitstop = 0.05; G.shake = 4; const pts = e.rk === 'raptor' ? 0 : 150; if (e.rk === 'raptor') { G.mercyLost = (G.mercyLost || 0) + 1; floatText(e.x, e.y, 90, 'NO MERCY', '#ff6a4a'); } else { alive[0].score += pts; floatText(e.x, e.y, 90, '+' + pts, '#ffe08a'); } if (e.rk === 'biker' && c.nitroT <= 0 && c.inv <= 0) carHit(4); part({ type: 'body', x: e.x, y: e.y, z: 30, vx: 500, vz: 500, g: 1300, life: 1, look: e.look }); }
      }
    }
    const tr = c.truck;
    if (tr) {
      tr.t += dt; tr.flash -= dt; tr.x += ((G.camX + W - 190) - tr.x) * dt * 1.5; tr.y += (clamp(c.y + Math.sin(tr.t * 0.8) * 60, GT + 60, GB - 10) - tr.y) * dt * 0.8;
      tr.atk -= dt;
      if (tr.atk <= 0) { tr.atk = rnd(0.9, 1.6); SFX.play('throw'); projectile({ faction: 'foe', kind: 'truck' }, 'bomb', tr.x - 150, tr.y, 120, -rnd(250, 500), { vz: 300, vy: rnd(-120, 120), fuse: 1.2, life: 3 }); }
      const dx = tr.x - 170 - (carX + 160); if (Math.abs(tr.y - c.y) < 40 && dx < 0 && c.z < 30) { if (c.nitroT > 0 || c.speed > 0.7) { truckHit(c.nitroT > 0 ? 60 : 25); c.sx -= 60; c.speed = 0.3; SFX.play('crash'); } }
      if (tr.hp <= 0 && !tr.done) { tr.done = true; boomFx(tr.x, tr.y); boomFx(tr.x - 100, tr.y); boomFx(tr.x + 80, tr.y); for (const p of alive) p.score += 8000; SFX.engineStop(); setTimeout(() => stageClear(), 900); }
    }
    for (const p of G.players) { p.hpShow += (p.hp - p.hpShow) * dt * 3; }
  }
  function truckHit(d) { const tr = G.car.truck; if (!tr || tr.done) return; tr.hp -= d; tr.flash = 0.08; sparks(tr.x - 150, tr.y, 90, 5, '#ffd27a'); SFX.play('hit', { pitch: 0.7 }); }
  function carHit(d) { const c = G.car; c.hp -= d; c.flash = 0.12; c.inv = 0.6; G.shake = 7; SFX.play('crash'); if (c.hp <= 0) { for (const p of G.players) if (!p.out) { p.lives--; if (p.lives < 0) { p.out = true; p.lives = 0; } } c.hp = c.maxhp; c.inv = 3; G.msg = 'THE DUCHESS STALLED! -1 LIFE'; G.msgT = 2; } }
  function boomFx(x, y) { SFX.play('explosion'); G.shake = 10; G.flash = 0.1; for (let i = 0; i < 22; i++) { const a = rnd(0, 6.28), s = rnd(60, 320); part({ type: 'fire', x, y, z: 30, vx: Math.cos(a) * s, vz: Math.abs(Math.sin(a)) * s, life: rnd(0.3, 0.8), size: rnd(10, 26) }); } }
  function updateProjDrive(pr, dt) {
    pr.life -= dt; if (pr.life <= 0) { pr.dead = true; if (pr.pk === 'bomb') bombBlast(pr); return; }
    pr.x += pr.vx * dt; pr.y = clamp(pr.y + (pr.vy || 0) * dt, GT + 40, GB);
    if (pr.pk === 'bomb') { pr.vz -= 1100 * dt; pr.z += pr.vz * dt; if (pr.z <= 0) { pr.z = 0; pr.vz = 0; pr.vx = -(420 + G.car.speed * 520) * 0.2; pr.vy = 0; } pr.fuse -= dt; if (pr.fuse <= 0) { pr.dead = true; bombBlast(pr); } return; }
    for (const e of G.ents) { if (e.kind !== 'road' || e.dead || e.rk === 'mine') continue; if (Math.abs(e.x - pr.x) < 30 && Math.abs(e.y - pr.y) < 26) { e.hp -= pr.dmg; sparks(e.x, e.y, 50, 4); pr.dead = true; if (e.hp <= 0) { e.dead = true; if (e.rk === 'raptor') { G.mercyLost = (G.mercyLost || 0) + 1; floatText(e.x, e.y, 90, 'NO MERCY', '#ff6a4a'); } else { pr.owner.score += 150; floatText(e.x, e.y, 90, '+150', '#ffe08a'); } if (e.rk === 'wreck') boomFx(e.x, e.y); else part({ type: 'body', x: e.x, y: e.y, z: 30, vx: 300, vz: 400, g: 1300, life: 1, look: e.look }); } break; } }
    const tr = G.car.truck; if (!pr.dead && tr && Math.abs(pr.x - (tr.x - 60)) < 140 && Math.abs(pr.y - tr.y) < 50) { pr.dead = true; truckHit(pr.dmg * 0.8); }
    if (pr.x > G.camX + W + 100) pr.dead = true;
  }
  function bombBlast(pr) { boomFx(pr.x, pr.y); const c = G.car; if (Math.abs(pr.x - (G.camX + c.sx)) < 170 && Math.abs(pr.y - c.y) < 50 && c.z < 40 && c.inv <= 0) carHit(14); }

  // ---------------- main update ----------------
  function update(dt) {
    G.t += dt; pollInput();
    for (const id in sources) { const s = sources[id]; if (s.p.start && (G.state === 'play' || G.state === 'drive') && !G.players.some(p => p.src === id)) joinMidGame(id); }
    if (G.paused) { for (const id in sources) if (sources[id].p.start) G.paused = false; return; }
    if (G.state === 'title') return updateTitle();
    if (G.state === 'select') return updateSelect(dt);
    if (G.state === 'story') return updateStory(dt);
    if (G.state === 'continue') return updateContinue(dt);
    if (G.state === 'ending') return updateEnding(dt);
    if (G.state === 'clear') { G.clearT += dt; tickWorld(dt * 0.5, true); if (G.clearT > 4.5) nextAfterClear(); return; }
    if (G.hitstop > 0) { G.hitstop -= dt; G.shake = Math.max(0, G.shake - dt * 30); return; }
    if (G.slowmo > 0) { G.slowmo -= dt; dt *= 0.3; }
    G.shake = Math.max(0, G.shake - dt * 30); G.flash = Math.max(0, G.flash - dt); G.msgT -= dt; G.banner -= dt;
    if (G.state === 'drive') { updateDrive(dt); updateParts(dt); G.ents = G.ents.filter(e => !e.dead); return; }
    tickWorld(dt, false);
    updateStageFlow(dt);
  }
  function tickWorld(dt, frozen) {
    for (const p of G.players) if (!p.out) { if (frozen) { p.anim = 'idle'; p.animT += dt; } else updatePlayer(p, dt); }
    for (const e of G.ents) {
      if (e.dead) continue;
      if (e.kind === 'foe') updateFoe(e, dt);
      else if (e.kind === 'dino') updateDino(e, dt);
      else if (e.kind === 'proj') { updateProj(e, dt); if (e.dead && e.gk && e.gk.startsWith('prop:') && !e.broke) { e.broke = true; breakProp(e.x, e.y, e.gk.slice(5)); } }
      else if (e.kind === 'item') { e.life -= dt; if (e.life <= 0) e.dead = true; }
      else if (e.kind === 'prop') e.hitShow = Math.max(0, e.hitShow - dt);
    }
    G.ents = G.ents.filter(e => !e.dead);
    updateParts(dt);
  }
  function updateParts(dt) {
    for (const q of G.parts) { q.t += dt; q.x += q.vx * dt; q.z += q.vz * dt; if (q.g) q.vz -= q.g * dt; if (q.z < 0) { q.z = 0; q.vz *= -0.3; q.vx *= 0.6; } if (q.type === 'spark') { q.vx *= 0.9; q.vz *= 0.9; } }
    G.parts = G.parts.filter(q => q.t < q.life);
  }
  function joinMidGame(id) {
    if (G.players.length >= 8) return;
    const used = G.players.map(p => p.hero); let h = 0; for (let i = 0; i < 8; i++) if (!used.includes(i)) { h = i; break; }
    const p = makePlayer(id, h, G.players.length); p.x = G.camX + 100; p.z = 200; G.players.push(p); SFX.play('coin'); G.msg = 'NEW CHALLENGER: ' + HEROES[h].name; G.msgT = 2;
  }

  // ---------------- menus ----------------
  function anyPressed(k) { for (const id in sources) if (sources[id].p[k]) return id; return null; }
  function updateTitle() {
    SFX.music('title');
    if (anyPressed('u')) { G.menu = (G.menu + 2) % 3; SFX.play('menu_move'); }
    if (anyPressed('d')) { G.menu = (G.menu + 1) % 3; SFX.play('menu_move'); }
    const id = anyPressed('start') || anyPressed('atk');
    if (id) {
      SFX.play('menu_select');
      if (G.menu === 0) { G.state = 'select'; G.sel = {}; G.sel[id] = { hero: 0, locked: false }; G.selT = null; }
      else G.showPanel = G.showPanel === G.menu ? 0 : G.menu;
    }
  }
  function updateSelect(dt) {
    for (const id in sources) {
      const s = sources[id]; let q = G.sel[id];
      if (!q) { if ((s.p.atk || s.p.start) && Object.keys(G.sel).length < 8) { G.sel[id] = { hero: Object.keys(G.sel).length % 8, locked: false }; SFX.play('coin'); G.selT = null; } continue; }
      if (!q.locked) {
        if (s.p.l) { q.hero = (q.hero + 7) % 8; SFX.play('menu_move'); }
        if (s.p.r) { q.hero = (q.hero + 1) % 8; SFX.play('menu_move'); }
        if (s.p.u) { q.hero = (q.hero + 4) % 8; SFX.play('menu_move'); }
        if (s.p.d) { q.hero = (q.hero + 4) % 8; SFX.play('menu_move'); }
        if (s.p.atk || s.p.start) { q.locked = true; SFX.play('menu_select'); SFX.play('grunt'); if (G.selT === null) G.selT = 4; }
      } else if (s.p.jmp) { q.locked = false; } else if (s.p.start && G.selT !== null) G.selT = 0;
    }
    if (G.selT !== null) { const all = Object.values(G.sel).every(q => q.locked); G.selT -= all ? dt * 3 : dt; if (G.selT <= 0) startGame(); }
  }
  function updateStory(dt) {
    const S = G.story; const line = S.lines[S.i];
    const before = Math.floor(S.ch); S.ch += dt * 45; if (Math.floor(S.ch) > before && Math.floor(S.ch) % 3 === 0 && S.ch < line[1].length) SFX.play('text');
    if (anyPressed('atk') || anyPressed('start') || anyPressed('jmp')) {
      if (S.ch < line[1].length) S.ch = line[1].length;
      else { S.i++; S.ch = 0; if (S.i >= S.lines.length) { if (S.next === 'end') { G.state = 'ending'; G.endT = 0; recordScores(); SFX.music('victory'); } else beginStage(S.next); } }
    }
  }
  function updateContinue(dt) {
    G.continueT -= dt;
    if ((anyPressed('start') || anyPressed('atk')) && G.continues > 0) {
      G.continues--; for (const p of G.players) { p.out = false; p.lives = 2; p.hp = p.maxhp; p.score = 0; p.st = 'idle'; p.inv = 3; p.dying = false; p.x = G.camX + 150 + p.slot * 30; p.z = 150; }
      G.state = STAGES[G.stage].drive ? 'drive' : 'play'; SFX.music(STAGES[G.stage].music); if (G.state === 'drive') { G.car.hp = G.car.maxhp; SFX.engineStart(); }
    } else if (G.continueT <= 0 || G.continues <= 0 && G.continueT < 8) { recordScores(); G.state = 'title'; G.menu = 0; G.showPanel = 2; }
  }
  function updateEnding(dt) { G.endT += dt; if (G.endT > 3 && (anyPressed('start') || anyPressed('atk'))) { G.state = 'title'; G.showPanel = 2; } }

  // ---------------- render ----------------
  let q = 1;
  function resize() {
    const vw = innerWidth, vh = innerHeight, s = Math.min(vw / W, vh / H);
    cv.style.width = Math.floor(W * s) + 'px'; cv.style.height = Math.floor(H * s) + 'px';
    q = Math.min(2, (devicePixelRatio || 1) * s); q = Math.max(1, q);
    cv.width = Math.round(W * q); cv.height = Math.round(H * q);
  }
  addEventListener('resize', resize); resize();

  function drawBG() {
    const st = STAGES[G.stage];
    if (BG) BG.draw(ctx, st.bg, G.camX, G.t, W, H, GT);
    else { const g = ctx.createLinearGradient(0, 0, 0, GT); g.addColorStop(0, '#2a1e4a'); g.addColorStop(1, '#e0703a'); ctx.fillStyle = g; ctx.fillRect(0, 0, W, GT); ctx.fillStyle = '#3a3438'; ctx.fillRect(0, GT, W, H - GT); ctx.fillStyle = '#4a4448'; for (let x = -(G.camX % 120); x < W; x += 120) ctx.fillRect(x, 420, 60, 6); }
  }
  function drawShadow(x, y, z, r) { ctx.fillStyle = 'rgba(0,0,0,' + Math.max(0.1, 0.38 - z / 600) + ')'; ctx.beginPath(); ctx.ellipse(x, y, r * Math.max(0.5, 1 - z / 400), r * 0.28, 0, 0, 6.28); ctx.fill(); }
  function drawWorld() {
    const list = [];
    for (const e of G.ents) list.push(e);
    for (const p of G.players) if (!p.out) list.push(p);
    list.sort((a, b) => a.y - b.y);
    for (const e of list) {
      const x = e.x - G.camX; if (x < -300 || x > W + 300) continue;
      if (e.kind === 'player' || e.kind === 'foe') {
        drawShadow(x, e.y, e.z, e.boss ? 40 : 28 * (e.look.w || 1));
        const blink = e.kind === 'player' && e.inv > 0 && Math.floor(G.t * 20) % 2 === 0;
        if (blink) continue;
        const jit = e.hitShow > 0 ? rnd(-2, 2) : 0;
        if (e.pebble && e.look.sprite && window.SPR && window.SPR.drawHuman(e.look.sprite, ctx, x + jit, e.y - e.z, e.face, e, G.t, e.hitShow > 0.04)) { }
        else if (e.pebble) { A.drawDino(ctx, x + jit - e.face * 6, e.y - e.z, e.face, e.pebble, G.t, false); A.drawHuman(ctx, x + jit + e.face * 2, e.y - e.z - 34, e.face, { look: e.look, anim: 'drive', animT: 0, weapon: e.weapon }, G.t, e.hitShow > 0); }
        else A.drawHuman(ctx, x + jit, e.y - e.z, e.face, e, G.t, e.hitShow > 0.04);
        if (e.carry) A.drawProp(ctx, x + jit, e.y - e.z - 112 * (e.look.h || 1), e.carry.kind, 0, false, true);
        if (e.kind === 'player') { ctx.fillStyle = PCOL[e.slot % 8]; ctx.font = 'bold 12px Arial'; ctx.textAlign = 'center'; ctx.fillText('P' + (e.slot + 1), x, e.y - e.z - 148 * (e.look.h || 1)); ctx.textAlign = 'left'; }
        if (e.kind === 'foe' && e.st === 'wind' && e.weapon && ['rifle', 'shotgun'].includes(e.weapon.kind)) { ctx.strokeStyle = 'rgba(255,40,40,0.6)'; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(x + e.face * 40, e.y - 76); ctx.lineTo(x + e.face * 500, e.y - 76); ctx.stroke(); }
        if (e.kind === 'foe' && e.st === 'wind' && !e.weapon || e.kind === 'foe' && e.st === 'wind' && e.atkKind === 'charge') { ctx.fillStyle = 'rgba(255,220,60,' + (0.5 + 0.5 * Math.sin(G.t * 40)) + ')'; ctx.font = 'bold 18px Arial'; ctx.fillText('!', x - 3, e.y - 150 * (e.look.h || 1)); }
        if (e.kind === 'foe' && !e.boss && e.hp < e.maxhp && !e.dying) miniBar(x, e.y - 138 * (e.look.h || 1), e.hp / e.maxhp);
      } else if (e.kind === 'dino') {
        drawShadow(x, e.y, e.z, 44 * e.scale);
        e.kindDino = e.dkind; const d = Object.assign({}, e, { kind: e.dkind, moving: e.moving });
        if (e.st === 'down' && !(window.SPR && window.SPR.hasDino(d))) { ctx.save(); ctx.translate(x, e.y); ctx.rotate(-0.3 * e.face); A.drawDino(ctx, 0, 0, e.face, d, G.t, false); ctx.restore(); }
        else A.drawDino(ctx, x + (e.hitShow > 0 ? rnd(-2, 2) : 0), e.y - e.z, e.face, d, G.t, e.hitShow > 0.04);
        if (!e.rex && !e.dying) moodIcon(x, e.y - 100 * e.scale, e.mood);
        if (!e.rex && e.hp < e.maxhp && !e.dying) miniBar(x, e.y - 88, e.hp / e.maxhp);
      } else if (e.kind === 'prop') A.drawProp(ctx, x + (e.hitShow > 0 ? rnd(-2, 2) : 0), e.y, e.prop, e.hp, e.hitShow > 0);
      else if (e.kind === 'item') { if (e.life > 3 || Math.floor(G.t * 10) % 2) A.drawItem(ctx, x, e.y, e.item, G.t); }
      else if (e.kind === 'proj') drawProj(e, x);
    }
  }
  const PCOL = ['#ff5a4a', '#4ab0ff', '#7dff6a', '#ffd84a', '#d07aff', '#ff9a3a', '#4affe0', '#ff7ad0'];
  function miniBar(x, y, f) { ctx.fillStyle = 'rgba(0,0,0,0.6)'; ctx.fillRect(x - 22, y, 44, 5); ctx.fillStyle = f > 0.5 ? '#6adf5a' : f > 0.25 ? '#ffc23a' : '#ff4a3a'; ctx.fillRect(x - 21, y + 1, 42 * f, 3); }
  function moodIcon(x, y, m) {
    ctx.save(); ctx.translate(x, y); ctx.lineWidth = 2; ctx.strokeStyle = '#111';
    if (m === 'calm') { ctx.fillStyle = '#4fd35a'; ctx.beginPath(); ctx.arc(0, 0, 6, 0, 6.28); ctx.fill(); ctx.stroke(); }
    else if (m === 'alert' || m === 'exhausted') { ctx.fillStyle = m === 'alert' ? '#ffc93a' : '#9aa0a8'; ctx.beginPath(); ctx.moveTo(0, -7); ctx.lineTo(7, 6); ctx.lineTo(-7, 6); ctx.closePath(); ctx.fill(); ctx.stroke(); }
    else { ctx.fillStyle = '#ff3a2a'; ctx.beginPath(); for (let i = 0; i < 10; i++) { const a = i / 10 * 6.28, r = i % 2 ? 4 : 9; ctx.lineTo(Math.cos(a) * r, Math.sin(a) * r); } ctx.closePath(); ctx.fill(); ctx.stroke(); }
    ctx.restore();
  }
  function drawProj(p, x) {
    const y = p.y - p.z;
    if (p.pk === 'bullet') { ctx.strokeStyle = '#fff2b0'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x - Math.sign(p.vx) * 26, y); ctx.stroke(); ctx.strokeStyle = 'rgba(255,200,80,0.5)'; ctx.lineWidth = 6; ctx.stroke(); }
    else if (p.pk === 'knife') { ctx.save(); ctx.translate(x, y); ctx.scale(Math.sign(p.vx), 1); ctx.fillStyle = '#dfe6ee'; ctx.fillRect(-10, -2, 18, 4); ctx.fillStyle = '#4a2b17'; ctx.fillRect(-16, -2.5, 7, 5); ctx.restore(); }
    else if (p.pk === 'gun' && p.gk && p.gk.startsWith('prop:')) { ctx.save(); ctx.translate(x, y); ctx.rotate(G.t * 14 * Math.sign(p.vx)); A.drawProp(ctx, 0, 24, p.gk.slice(5), 0, false, true); ctx.restore(); }
    else if (p.pk === 'gun') { ctx.save(); ctx.translate(x, y); ctx.rotate(G.t * 20); A.drawHeldWeapon(ctx, [0, 0], [0, 0], 1.57, { kind: p.gk }, ''); ctx.restore(); }
    else if (p.pk === 'dyn' || p.pk === 'bomb') { drawShadow(x, p.y, p.z, 10); ctx.save(); ctx.translate(x, y); ctx.rotate(G.t * 8); ctx.fillStyle = p.pk === 'bomb' ? '#222' : '#c9302c'; if (p.pk === 'bomb') { ctx.beginPath(); ctx.arc(0, 0, 10, 0, 6.28); ctx.fill(); } else ctx.fillRect(-4, -10, 8, 20); ctx.restore(); }
    else if (p.pk === 'wave') { ctx.globalCompositeOperation = 'lighter'; ctx.fillStyle = 'rgba(255,160,40,0.5)'; ctx.beginPath(); ctx.ellipse(x, p.y - 20, 22, 30, 0, 0, 6.28); ctx.fill(); ctx.globalCompositeOperation = 'source-over'; }
  }
  function drawParts() {
    for (const p of G.parts) {
      const x = p.x - G.camX, y = p.y - p.z, k = p.t / p.life;
      if (p.type === 'spark') { ctx.globalCompositeOperation = 'lighter'; ctx.strokeStyle = p.col; ctx.lineWidth = p.size; ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x - p.vx * 0.03, y + p.vz * 0.03); ctx.stroke(); ctx.globalCompositeOperation = 'source-over'; }
      else if (p.type === 'ring') { ctx.strokeStyle = 'rgba(255,255,255,' + (1 - k) + ')'; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(x, y, p.size * (0.3 + k), 0, 6.28); ctx.stroke(); }
      else if (p.type === 'flash') { ctx.globalCompositeOperation = 'lighter'; ctx.fillStyle = 'rgba(255,220,120,0.9)'; ctx.beginPath(); ctx.arc(x, y, p.size, 0, 6.28); ctx.fill(); ctx.globalCompositeOperation = 'source-over'; }
      else if (p.type === 'dust') { ctx.fillStyle = p.col + (0.5 * (1 - k)) + ')'; ctx.beginPath(); ctx.arc(x, y, p.size * (1 + k), 0, 6.28); ctx.fill(); }
      else if (p.type === 'fire') { ctx.globalCompositeOperation = 'lighter'; ctx.fillStyle = k < 0.3 ? 'rgba(255,240,180,0.9)' : 'rgba(255,' + Math.floor(160 - k * 120) + ',40,' + (1 - k) + ')'; ctx.beginPath(); ctx.arc(x, y, p.size * (1 - k * 0.5), 0, 6.28); ctx.fill(); ctx.globalCompositeOperation = 'source-over'; }
      else if (p.type === 'chunk') { ctx.fillStyle = p.col; ctx.fillRect(x, y, p.size, p.size); }
      else if (p.type === 'text') { ctx.font = 'bold 16px Arial'; ctx.textAlign = 'center'; ctx.fillStyle = '#000'; ctx.fillText(p.txt, x + 1, y + 1); ctx.fillStyle = p.col; ctx.globalAlpha = 1 - k * k; ctx.fillText(p.txt, x, y); ctx.globalAlpha = 1; ctx.textAlign = 'left'; }
      else if (p.type === 'body') { A.drawHuman(ctx, x, y, -1, { look: p.look, anim: 'fall', animT: 1 }, G.t, false); }
    }
  }
  function panel(x, y, w, h, a) { ctx.fillStyle = 'rgba(8,10,20,' + (a || 0.72) + ')'; ctx.beginPath(); ctx.roundRect ? ctx.roundRect(x, y, w, h, 8) : ctx.rect(x, y, w, h); ctx.fill(); ctx.strokeStyle = 'rgba(255,255,255,0.12)'; ctx.lineWidth = 1; ctx.stroke(); }
  function drawHUD() {
    const ps = G.players; const n = ps.length; const cols = Math.min(4, n), rows = n > 4 ? 2 : 1; const pw = Math.min(232, (W - 16) / cols - 6), ph = rows > 1 ? 44 : 58;
    ps.forEach((p, i) => {
      const cx = 8 + (i % 4) * (pw + 6), cy = 6 + Math.floor(i / 4) * (ph + 4);
      panel(cx, cy, pw, ph, 0.65);
      ctx.fillStyle = PCOL[p.slot % 8]; ctx.fillRect(cx, cy, 4, ph);
      ctx.save(); ctx.beginPath(); ctx.rect(cx + 6, cy + 2, 40, ph - 4); ctx.clip(); ctx.translate(cx + 22, cy + (rows > 1 ? 12 : 18)); ctx.scale(1.3 / (p.look.h || 1), 1.3 / (p.look.h || 1)); A.drawHuman(ctx, 0, 110 * (p.look.h || 1), 1, { look: p.look, anim: 'idle', animT: 0, id: 0 }, 0, false); ctx.restore();
      ctx.font = 'bold 12px Arial'; ctx.fillStyle = '#fff'; ctx.fillText(p.name.split(' ')[0] + (p.out ? '  - OUT' : ''), cx + 50, cy + 15);
      ctx.fillStyle = '#ffe08a'; ctx.textAlign = 'right'; ctx.fillText(String(p.score).padStart(7, '0'), cx + pw - 6, cy + 15); ctx.textAlign = 'left';
      const bw = pw - 58; ctx.fillStyle = '#222'; ctx.fillRect(cx + 50, cy + 21, bw, 9);
      ctx.fillStyle = '#c33'; ctx.fillRect(cx + 50, cy + 21, bw * clamp(p.hpShow / p.maxhp, 0, 1), 9);
      const f = clamp(p.hp / p.maxhp, 0, 1); const g = ctx.createLinearGradient(0, cy + 21, 0, cy + 30); g.addColorStop(0, f > 0.3 ? '#9dff6a' : '#ffcf4a'); g.addColorStop(1, f > 0.3 ? '#2f9a2a' : '#c07a10'); ctx.fillStyle = g; ctx.fillRect(cx + 50, cy + 21, bw * f, 9);
      if (rows === 1) { ctx.font = '11px Arial'; ctx.fillStyle = '#ddd'; ctx.fillText('x' + p.lives, cx + 50, cy + 46); if (p.weapon) { ctx.fillStyle = '#fff'; ctx.fillText(p.weapon.kind.toUpperCase() + ' ' + p.weapon.ammo, cx + 80, cy + 46); } if (p.comboCount > 2) { ctx.fillStyle = '#ffb347'; ctx.textAlign = 'right'; ctx.fillText(p.comboCount + ' HITS', cx + pw - 6, cy + 46); ctx.textAlign = 'left'; } }
    });
    const b = G.boss && !G.boss.dying ? G.boss : null;
    if (b && b.st !== 'enter') { panel(180, H - 42, 600, 32, 0.7); ctx.font = 'bold 13px Arial'; ctx.fillStyle = '#ff6a5a'; ctx.fillText(b.name, 192, H - 21); ctx.fillStyle = '#222'; ctx.fillRect(370, H - 32, 396, 12); ctx.fillStyle = '#e8402a'; ctx.fillRect(370, H - 32, 396 * clamp(b.hp / b.maxhp, 0, 1), 12); }
    if (G.goArrow && G.lockX === null && !G.bossSpawned && Math.floor(G.t * 2.5) % 2 === 0) { const gx = W - 190 + Math.sin(G.t * 6) * 8; ctx.font = 'bold 44px Impact, Arial Black, sans-serif'; ctx.fillStyle = '#ffd23a'; ctx.strokeStyle = '#000'; ctx.lineWidth = 5; ctx.strokeText('GO ▶', gx, H / 2 - 40); ctx.fillText('GO ▶', gx, H / 2 - 40); }
    if (G.msgT > 0) bigText(G.msg, H / 2 - 90, 30, '#ff5a3a');
    if (G.banner > 0 && G.state !== 'clear') { const a = Math.min(1, G.banner); ctx.globalAlpha = a; bigText('STAGE ' + (G.stage + 1), H / 2 - 50, 26, '#ffd23a'); bigText(STAGES[G.stage].name, H / 2 - 10, 50, '#fff'); ctx.globalAlpha = 1; }
    if (G.state === 'clear') { bigText('STAGE CLEAR', H / 2 - 40, 58, '#ffd23a'); bigText('MERCY BONUS  +' + G.mercyBonus, H / 2 + 10, 24, '#7dff9a'); if (G.mercyLost) bigText(G.mercyLost + ' dinosaur' + (G.mercyLost > 1 ? 's' : '') + ' harmed', H / 2 + 40, 16, '#ff9a8a'); }
    if (G.paused) { ctx.fillStyle = 'rgba(0,0,0,0.6)'; ctx.fillRect(0, 0, W, H); bigText('PAUSED', H / 2, 50, '#fff'); bigText('press START / ENTER to resume', H / 2 + 40, 16, '#ccc'); }
    const free = Object.keys(sources).filter(id => !ps.some(p => p.src === id)).length;
    if (ps.length < 8 && (G.state === 'play' || G.state === 'drive') && Math.floor(G.t * 1.5) % 2 === 0) { ctx.font = 'bold 11px Arial'; ctx.fillStyle = 'rgba(255,255,255,0.7)'; ctx.textAlign = 'right'; ctx.fillText('MORE PLAYERS: PRESS START ON A FREE CONTROLLER', W - 10, H - 8); ctx.textAlign = 'left'; }
  }
  function bigText(t, y, size, col) { ctx.font = 'bold ' + size + 'px Impact, "Arial Black", sans-serif'; ctx.textAlign = 'center'; ctx.lineWidth = Math.max(3, size / 8); ctx.strokeStyle = '#000'; ctx.strokeText(t, W / 2, y); ctx.fillStyle = col; ctx.fillText(t, W / 2, y); ctx.textAlign = 'left'; }
  function drawTouch() {
    if (!touch.used) return;
    ctx.globalAlpha = 0.45;
    let st = null; for (const id in pointers) if (pointers[id].stick) st = pointers[id];
    const bx = st ? st.sx : 120, by = st ? st.sy : 430;
    ctx.fillStyle = '#000'; ctx.beginPath(); ctx.arc(bx, by, 62, 0, 6.28); ctx.fill(); ctx.strokeStyle = '#fff'; ctx.lineWidth = 2; ctx.stroke();
    ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(bx + touch.dx * 50, by + touch.dy * 50, 26, 0, 6.28); ctx.fill();
    const lab = { atk: 'HIT', jmp: 'JUMP', spc: 'SPEC', start: 'II' };
    for (const k in TB) { const b = TB[k]; ctx.fillStyle = touch[k] ? '#ffd23a' : '#000'; ctx.beginPath(); ctx.arc(b[0], b[1], b[2], 0, 6.28); ctx.fill(); ctx.stroke(); ctx.fillStyle = '#fff'; ctx.font = 'bold 13px Arial'; ctx.textAlign = 'center'; ctx.fillText(lab[k], b[0], b[1] + 5); ctx.textAlign = 'left'; }
    ctx.globalAlpha = 1;
  }

  function drawDrive() {
    drawBG();
    const c = G.car; const list = G.ents.slice(); list.push({ kind: 'car', y: c.y }); if (c.truck) list.push({ kind: 'truck', y: c.truck.y });
    list.sort((a, b) => a.y - b.y);
    for (const e of list) {
      if (e.kind === 'car') { const riders = G.players.filter(p => !p.out).slice(0, 4); if (!(c.inv > 0 && Math.floor(G.t * 20) % 2)) A.drawCar(ctx, c.sx, c.y - c.z, G.t, c.look, riders, c.flash > 0); if (c.nitroT > 0) { ctx.globalCompositeOperation = 'lighter'; for (let i = 0; i < 4; i++) { ctx.fillStyle = 'rgba(80,180,255,0.5)'; ctx.beginPath(); ctx.ellipse(c.sx - 160 - i * 18 - rnd(0, 20), c.y - c.z - 24, 22, 7, 0, 0, 6.28); ctx.fill(); } ctx.globalCompositeOperation = 'source-over'; } continue; }
      if (e.kind === 'truck') { A.drawTruck(ctx, c.truck.x - G.camX, c.truck.y, G.t, c.truck.flash > 0, Math.floor((1 - c.truck.hp / c.truck.maxhp) * 12)); continue; }
      const x = e.x - G.camX;
      if (e.kind === 'proj') { drawProj(e, x); continue; }
      if (e.rk === 'wreck') { drawShadow(x, e.y, 0, 50); ctx.fillStyle = '#4a3a3a'; ctx.fillRect(x - 50, e.y - 36, 100, 32); ctx.fillStyle = '#6a4a3a'; ctx.fillRect(x - 30, e.y - 54, 60, 20); ctx.fillStyle = '#222'; ctx.beginPath(); ctx.arc(x - 30, e.y - 6, 12, 0, 6.28); ctx.arc(x + 30, e.y - 6, 12, 0, 6.28); ctx.fill(); }
      else if (e.rk === 'mine') { ctx.fillStyle = '#333'; ctx.beginPath(); ctx.ellipse(x, e.y - 4, 16, 7, 0, 0, 6.28); ctx.fill(); ctx.fillStyle = Math.floor(G.t * 6) % 2 ? '#ff3030' : '#661010'; ctx.beginPath(); ctx.arc(x, e.y - 9, 3, 0, 6.28); ctx.fill(); }
      else if (e.rk === 'raptor') { drawShadow(x, e.y, 0, 40); A.drawDino(ctx, x, e.y, 1, Object.assign({}, e, { kind: 'raptor' }), G.t, false); moodIcon(x, e.y - 100, 'calm'); }
      else if (e.rk === 'biker') { drawShadow(x, e.y, 0, 40); ctx.fillStyle = '#222'; ctx.beginPath(); ctx.arc(x - 26, e.y - 14, 14, 0, 6.28); ctx.arc(x + 26, e.y - 14, 14, 0, 6.28); ctx.fill(); ctx.fillStyle = '#8a1c1c'; ctx.fillRect(x - 26, e.y - 36, 52, 12); A.drawHuman(ctx, x - 4, e.y - 6, 1, { look: e.look, anim: 'drive', animT: 0 }, G.t, false); }
      else { drawShadow(x, e.y, 0, 26); A.drawHuman(ctx, x, e.y, -1, { look: e.look, anim: 'idle', animT: 0, id: e.id }, G.t, false); }
    }
    drawParts();
    if (BG) BG.drawFront(ctx, STAGES[G.stage].bg, G.camX, G.t, W, H);
    drawHUD();
    // car bars
    panel(W / 2 - 170, H - 44, 340, 36, 0.7); ctx.font = 'bold 12px Arial'; ctx.fillStyle = '#fff'; ctx.fillText('THE DUCHESS', W / 2 - 160, H - 28); ctx.fillText('NITRO', W / 2 - 160, H - 13);
    ctx.fillStyle = '#222'; ctx.fillRect(W / 2 - 60, H - 38, 220, 10); ctx.fillRect(W / 2 - 60, H - 22, 220, 8);
    ctx.fillStyle = '#e84a3a'; ctx.fillRect(W / 2 - 60, H - 38, 220 * clamp(c.hpShow / c.maxhp, 0, 1), 10);
    ctx.fillStyle = '#4ab0ff'; ctx.fillRect(W / 2 - 60, H - 22, 220 * c.nitro / 100, 8);
    if (!c.truck) { const f = clamp(c.dist / STAGES[G.stage].len, 0, 1); ctx.fillStyle = 'rgba(0,0,0,0.5)'; ctx.fillRect(W - 230, H - 30, 210, 8); ctx.fillStyle = '#ffd23a'; ctx.fillRect(W - 230, H - 30, 210 * f, 8); ctx.fillStyle = '#fff'; ctx.font = '11px Arial'; ctx.fillText('DISTANCE TO HAULER', W - 230, H - 36); }
    else { const tr = c.truck; panel(180, 64 + (G.players.length > 4 ? 48 : 0), 600, 28, 0.7); ctx.fillStyle = '#ff6a5a'; ctx.font = 'bold 13px Arial'; ctx.fillText('MARROW HAULER', 192, 83 + (G.players.length > 4 ? 48 : 0)); ctx.fillStyle = '#222'; ctx.fillRect(370, 72 + (G.players.length > 4 ? 48 : 0), 396, 12); ctx.fillStyle = '#e8402a'; ctx.fillRect(370, 72 + (G.players.length > 4 ? 48 : 0), 396 * clamp(tr.hp / tr.maxhp, 0, 1), 12); }
  }

  function drawTitle() {
    G.camX += 0.6;
    const art = window.SPR && window.SPR.drawTitle(ctx, W, H, G.t); // painted key art; the old procedural scene stays as a fallback
    const tx = art ? 680 : W / 2, ly = art ? 110 : 120, my = art ? 262 : 300, py = art ? 400 : 420;
    if (!art) {
    BG ? BG.draw(ctx, Math.floor(G.t / 12) % 5, G.camX * 3, G.t, W, H, GT) : (ctx.fillStyle = '#201830', ctx.fillRect(0, 0, W, H));
    ctx.fillStyle = 'rgba(5,5,15,0.45)'; ctx.fillRect(0, 0, W, H);
    // parade: car + tyrant
    const cx = ((G.t * 160) % (W + 700)) - 300;
    A.drawDino(ctx, cx - 280, 470, 1, { kind: 'rex', color: '#6b3a2a', belly: '#caa27a', stripe: '#3a1a10', scale: 1.7, moving: true, walkPh: G.t * 7, mood: 'enraged', jaw: 0.5 + 0.5 * Math.sin(G.t * 3) }, G.t, false);
    A.drawCar(ctx, cx + 60, 490, G.t, { paint: '#d8323c', trim: '#f4efe6' }, [{ look: HEROES[0].look }, { look: HEROES[1].look }, { look: HEROES[2].look }, { look: HEROES[3].look }], false);
    }
    // logo
    ctx.save(); ctx.translate(tx, ly); ctx.rotate(-0.04);
    ctx.font = 'bold 86px Impact, "Arial Black", sans-serif'; ctx.textAlign = 'center';
    const g = ctx.createLinearGradient(0, -70, 0, 10); g.addColorStop(0, '#fff6d8'); g.addColorStop(0.45, '#ffc23a'); g.addColorStop(0.55, '#d8641a'); g.addColorStop(1, '#7a1a10');
    ctx.lineWidth = 12; ctx.strokeStyle = '#140a08'; ctx.strokeText('TAILFINS', 0, 0); ctx.fillStyle = g; ctx.fillText('TAILFINS', 0, 0);
    ctx.font = 'bold 40px Impact, "Arial Black", sans-serif'; ctx.lineWidth = 8; ctx.strokeText('&', 0, 42); ctx.fillStyle = '#fff'; ctx.fillText('&', 0, 42);
    ctx.font = 'bold 86px Impact, "Arial Black", sans-serif'; const g2 = ctx.createLinearGradient(0, 40, 0, 120); g2.addColorStop(0, '#d7ffd0'); g2.addColorStop(0.5, '#5ad35a'); g2.addColorStop(1, '#0f4a1a');
    ctx.lineWidth = 12; ctx.strokeText('TYRANTS', 0, 118); ctx.fillStyle = g2; ctx.fillText('TYRANTS', 0, 118);
    ctx.restore();
    const items = ['START GAME', 'HOW TO PLAY', 'HIGH SCORES'];
    items.forEach((t, i) => { const sel = G.menu === i; ctx.font = 'bold ' + (sel ? 26 : 20) + 'px Impact, Arial Black, sans-serif'; ctx.textAlign = 'center'; ctx.fillStyle = sel ? '#ffd23a' : '#ddd'; ctx.strokeStyle = '#000'; ctx.lineWidth = 4; const y = my + i * 34; ctx.strokeText((sel ? '▶ ' : '') + t, tx, y); ctx.fillText((sel ? '▶ ' : '') + t, tx, y); });
    ctx.textAlign = 'center'; ctx.font = '12px Arial'; ctx.fillStyle = 'rgba(255,255,255,0.7)';
    ctx.fillText('Original fan-made spiritual successor. All art, music and characters are new.   M = mute', W / 2, H - 10);
    ctx.textAlign = 'left';
    if (G.showPanel === 1) {
      panel(150, 150, 660, 300, 0.92); ctx.fillStyle = '#ffd23a'; ctx.font = 'bold 20px Arial'; ctx.fillText('HOW TO PLAY', 170, 180); ctx.font = '14px Arial'; ctx.fillStyle = '#eee';
      ['Player keyboard A:  WASD move · J attack · K jump · L special · Enter start', 'Player keyboard B:  Arrows move · Z / , attack · X / . jump · C / slash special', 'Gamepads (up to 4): stick move · X attack · A jump · B special · Start join', 'Phone: left thumb = stick, right buttons HIT / JUMP / SPEC', '', 'Double-tap left/right to RUN. Attack while running = DASH ATTACK.', 'Walk into a staggered enemy to GRAB, attack to knee, attack x3 or reverse to THROW.', 'Stand on an item + attack to pick it up. Empty gun? Attack throws it.', 'Special = crowd-clear move, costs a little health.', 'Dinosaurs start CALM (green). Hit one and it turns RED and bites whoever hit it.', 'Keep calm dinosaurs alive for a MERCY BONUS. Up to 8 players, press Start to join.']
        .forEach((l, i) => ctx.fillText(l, 170, 210 + i * 23));
    }
    if (G.showPanel === 2) {
      panel(300, 150, 360, 290, 0.92); ctx.fillStyle = '#ffd23a'; ctx.font = 'bold 20px Arial'; ctx.fillText('HIGH SCORES', 320, 180); ctx.font = '15px Arial'; ctx.fillStyle = '#eee';
      if (!G.hi.length) ctx.fillText('No scores yet. Be the first.', 320, 215);
      G.hi.forEach((h, i) => { ctx.fillText((i + 1) + '.  ' + h.n, 320, 215 + i * 27); ctx.textAlign = 'right'; ctx.fillText(String(h.s), 640, 215 + i * 27); ctx.textAlign = 'left'; });
    }
    if (Math.floor(G.t * 2) % 2 === 0 && !G.showPanel) { ctx.textAlign = 'center'; ctx.font = 'bold 16px Arial'; ctx.fillStyle = '#fff'; ctx.fillText(touch.used ? 'TAP HIT TO START' : 'PRESS ENTER / ATTACK / START', tx, py); ctx.textAlign = 'left'; }
  }
  function drawSelect() {
    BG ? BG.draw(ctx, 0, G.t * 30, G.t, W, H, GT) : (ctx.fillStyle = '#201830', ctx.fillRect(0, 0, W, H));
    ctx.fillStyle = 'rgba(5,5,15,0.7)'; ctx.fillRect(0, 0, W, H);
    bigText('CHOOSE YOUR FIGHTER', 50, 34, '#ffd23a');
    const cw = 222, ch = 200;
    HEROES.forEach((h, i) => {
      const x = 22 + (i % 4) * (cw + 8), y = 70 + Math.floor(i / 4) * (ch + 8);
      const pickers = Object.entries(G.sel).filter(([, q]) => q.hero === i);
      panel(x, y, cw, ch, 0.75);
      if (pickers.length) { ctx.strokeStyle = PCOL[Object.keys(G.sel).indexOf(pickers[0][0]) % 8]; ctx.lineWidth = 3; ctx.strokeRect(x + 1, y + 1, cw - 2, ch - 2); }
      const fake = { look: h.look, anim: pickers.some(([, q]) => q.locked) ? 'jab' : 'idle', animT: (G.t % 0.6), id: i, weapon: i === 4 ? { kind: 'revolver' } : null };
      if (h.rider && h.look.sprite && window.SPR && window.SPR.drawHuman(h.look.sprite, ctx, x + 60, y + 160, 1, fake, G.t, false)) { }
      else if (h.rider) { A.drawDino(ctx, x + 70, y + 150, 1, { kind: 'raptor', color: '#4f8a3a', belly: '#d9d2a0', stripe: '#2f5a24', scale: 0.8, mood: 'calm' }, G.t, false); A.drawHuman(ctx, x + 74, y + 120, 1, { look: h.look, anim: 'drive', animT: 0 }, G.t, false); }
      else A.drawHuman(ctx, x + 60, y + 160, 1, fake, G.t, false);
      ctx.font = 'bold 14px Arial'; ctx.fillStyle = '#fff'; ctx.fillText(h.name, x + 110, y + 24);
      ctx.font = '11px Arial'; ctx.fillStyle = '#aaa'; ctx.fillText(h.tag, x + 110, y + 40);
      [['SPD', h.spd], ['POW', h.pow], ['RNG', h.rng]].forEach(([k, v], j) => { ctx.fillStyle = '#ccc'; ctx.fillText(k, x + 110, y + 62 + j * 16); for (let b = 0; b < 5; b++) { ctx.fillStyle = b < v ? '#ffc23a' : '#333'; ctx.fillRect(x + 142 + b * 13, y + 53 + j * 16, 10, 9); } });
      wrap(h.perk, x + 110, y + 124, 106, 13, '#9fd0ff');
      pickers.forEach(([id, q], k) => { const n = Object.keys(G.sel).indexOf(id); ctx.fillStyle = PCOL[n % 8]; ctx.font = 'bold 13px Arial'; ctx.fillText('P' + (n + 1) + (q.locked ? ' ✔' : ''), x + 8 + k * 38, y + 18); });
    });
    ctx.textAlign = 'center'; ctx.font = '14px Arial'; ctx.fillStyle = '#ddd';
    ctx.fillText('Move to choose · ATTACK to lock in · JUMP to change · any free controller: press ATTACK to join (up to 8)', W / 2, H - 42);
    if (G.selT !== null) { ctx.font = 'bold 22px Impact, Arial'; ctx.fillStyle = '#ffd23a'; ctx.fillText('STARTING IN ' + Math.max(0, Math.ceil(G.selT)) + '  (START to go now)', W / 2, H - 14); }
    ctx.textAlign = 'left';
  }
  function wrap(t, x, y, w, lh, col) { ctx.fillStyle = col; const words = t.split(' '); let line = ''; for (const wd of words) { const tst = line + wd + ' '; if (ctx.measureText(tst).width > w && line) { ctx.fillText(line, x, y); line = wd + ' '; y += lh; } else line = tst; } ctx.fillText(line, x, y); }
  function drawStory() {
    const S = G.story; const nxt = S.next === 'end' ? 4 : S.next;
    BG ? BG.draw(ctx, STAGES[nxt].bg, G.t * 20, G.t, W, H, GT) : (ctx.fillStyle = '#201830', ctx.fillRect(0, 0, W, H));
    ctx.fillStyle = 'rgba(0,0,0,0.55)'; ctx.fillRect(0, 0, W, H);
    ctx.fillStyle = '#000'; ctx.fillRect(0, 0, W, 50); ctx.fillRect(0, H - 50, W, 50);
    const line = S.lines[S.i]; const who = line[0];
    if (S.next !== 'end' && S.i === 0 && S.ch < 30) bigText('STAGE ' + (nxt + 1) + ' - ' + STAGES[nxt].name, 36, 22, '#ffd23a');
    // speaker
    if (who !== 'NARRATOR') {
      ctx.save(); ctx.translate(170, 400);
      if (who === 'VANE') A.drawHuman(ctx, 0, 0, 1, { look: BOSSES.vane.look, anim: 'idle', animT: 0, id: 1 }, G.t, false);
      else A.drawHuman(ctx, 0, 0, 1, { look: HEROES[SPEAKER_LOOK[who]].look, anim: 'idle', animT: 0, id: 2 }, G.t, false);
      ctx.restore();
    }
    panel(90, 410, 780, 90, 0.85);
    ctx.font = 'bold 16px Arial'; ctx.fillStyle = who === 'VANE' ? '#ffb000' : '#ffd23a'; ctx.fillText(who === 'VANE' ? 'AUGUSTINE VANE' : who, 110, 436);
    ctx.font = '17px Georgia, serif'; ctx.fillStyle = '#fff'; wrap(line[1].slice(0, Math.floor(S.ch)), 110, 462, 740, 22, '#fff');
    if (S.ch >= line[1].length && Math.floor(G.t * 2) % 2) { ctx.fillStyle = '#ffd23a'; ctx.fillText('▼', 840, 488); }
    ctx.font = '11px Arial'; ctx.fillStyle = '#888'; ctx.fillText('ATTACK / ENTER to continue', 740, H - 20);
  }
  function drawContinue() {
    drawBG(); drawWorld(); ctx.fillStyle = 'rgba(0,0,0,0.65)'; ctx.fillRect(0, 0, W, H);
    bigText(G.continues > 0 ? 'CONTINUE?' : 'GAME OVER', H / 2 - 30, 60, '#ff5a3a');
    if (G.continues > 0) { bigText(String(Math.ceil(G.continueT)), H / 2 + 40, 60, '#fff'); bigText('PRESS START / ATTACK   (' + G.continues + ' left, score resets)', H / 2 + 80, 16, '#ddd'); }
  }
  function drawEnding() {
    BG ? BG.draw(ctx, 0, G.endT * 40, G.t, W, H, GT) : (ctx.fillStyle = '#201830', ctx.fillRect(0, 0, W, H));
    ctx.fillStyle = 'rgba(0,0,0,0.5)'; ctx.fillRect(0, 0, W, H);
    A.drawCar(ctx, ((G.endT * 120) % (W + 400)) - 200, 470, G.t, { paint: '#d8323c', trim: '#f4efe6' }, G.players.slice(0, 4), false);
    bigText('THE END', 110, 64, '#ffd23a'); bigText('The herds are free. For now.', 150, 20, '#fff');
    G.players.forEach((p, i) => bigText(p.name + '   ' + p.score, 200 + i * 26, 18, PCOL[i % 8]));
    bigText('Thanks for playing TAILFINS & TYRANTS', 420, 18, '#ddd');
    if (G.endT > 3) bigText('Press START to return to title', 450, 14, '#aaa');
  }

  function render() {
    ctx.setTransform(q, 0, 0, q, 0, 0);
    ctx.clearRect(0, 0, W, H);
    if (G.state === 'title') { drawTitle(); drawTouch(); return; }
    if (G.state === 'select') { drawSelect(); drawTouch(); return; }
    if (G.state === 'story') { drawStory(); drawTouch(); return; }
    if (G.state === 'ending') { drawEnding(); drawTouch(); return; }
    const sx = G.shake > 0 ? rnd(-G.shake, G.shake) : 0, sy = G.shake > 0 ? rnd(-G.shake, G.shake) * 0.6 : 0;
    ctx.save(); ctx.translate(sx, sy);
    if (G.state === 'continue') { drawContinue(); ctx.restore(); drawTouch(); return; }
    if (G.state === 'drive' || (G.state === 'clear' && STAGES[G.stage].drive)) { drawDrive(); }
    else { drawBG(); drawWorld(); drawParts(); if (BG) BG.drawFront(ctx, STAGES[G.stage].bg, G.camX, G.t, W, H); drawHUD(); }
    ctx.restore();
    if (G.flash > 0) { ctx.fillStyle = 'rgba(255,240,220,' + G.flash * 4 + ')'; ctx.fillRect(0, 0, W, H); }
    drawTouch();
  }

  let last = performance.now();
  function frame(now) {
    let dt = Math.min(0.05, (now - last) / 1000); last = now;
    try { update(dt); render(); } catch (err) { console.error(err); }
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
  window.__TT = G; window.__TTdbg = { beginStage, beginStory, spawnFoe, spawnDino }; // debug handle
})();
