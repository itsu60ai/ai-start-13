/* TAILFINS & TYRANTS - procedural Web Audio SFX + music. Exposes window.SFX */
(function () {
  'use strict';
  var AC = window.AudioContext || window.webkitAudioContext;
  var ctx = null, master, comp, musicBus, sfxBus, verb, verbSend, noiseBuf;
  var last = {}, muted = false;
  try { muted = localStorage.getItem('tt_muted') === '1'; } catch (e) {}

  function mkImpulse(sec) {
    var n = Math.floor(ctx.sampleRate * sec), b = ctx.createBuffer(2, n, ctx.sampleRate);
    for (var c = 0; c < 2; c++) { var d = b.getChannelData(c); for (var i = 0; i < n; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / n, 3); }
    return b;
  }
  function init() {
    if (!AC) return null;
    if (!ctx) {
      ctx = new AC();
      comp = ctx.createDynamicsCompressor();
      comp.threshold.value = -14; comp.ratio.value = 4; comp.attack.value = 0.003; comp.release.value = 0.2;
      master = ctx.createGain(); master.gain.value = muted ? 0 : 1;
      musicBus = ctx.createGain(); musicBus.gain.value = 0.45;
      sfxBus = ctx.createGain(); sfxBus.gain.value = 0.8;
      verb = ctx.createConvolver(); verb.buffer = mkImpulse(1.4);
      verbSend = ctx.createGain(); verbSend.gain.value = 0.18;
      musicBus.connect(master); sfxBus.connect(master);
      verbSend.connect(verb); verb.connect(master);
      master.connect(comp); comp.connect(ctx.destination);
      var n = ctx.sampleRate * 2; noiseBuf = ctx.createBuffer(1, n, ctx.sampleRate);
      var d = noiseBuf.getChannelData(0); for (var i = 0; i < n; i++) d[i] = Math.random() * 2 - 1;
    }
    if (ctx.state === 'suspended' && ctx.resume) ctx.resume();
    return ctx;
  }

  // ---------- primitives ----------
  function env(g, t, a, dur, v) {
    g.gain.setValueAtTime(0.0001, t);
    g.gain.linearRampToValueAtTime(v, t + a);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  }
  function cleanup(src, nodes) { src.onended = function () { src.disconnect(); for (var i = 0; i < nodes.length; i++) nodes[i].disconnect(); }; }
  // tone(type,f0,f1,t,dur,vol,dest,opts{a,filt,filtEnd,q,vib,rev,detune})
  function tone(type, f0, f1, t, dur, vol, dest, o) {
    o = o || {};
    var osc = ctx.createOscillator(), g = ctx.createGain(), nodes = [g], out = osc;
    osc.type = type; osc.frequency.setValueAtTime(Math.max(1, f0), t);
    if (f1 && f1 !== f0) osc.frequency.exponentialRampToValueAtTime(Math.max(1, f1), t + dur);
    if (o.detune) osc.detune.value = o.detune;
    if (o.vib) {
      var lfo = ctx.createOscillator(), lg = ctx.createGain();
      lfo.frequency.value = 5.5; lg.gain.value = f0 * o.vib; lfo.connect(lg); lg.connect(osc.frequency);
      lfo.start(t + 0.08); lfo.stop(t + dur + 0.05); cleanup(lfo, [lg]);
    }
    if (o.filt) {
      var f = ctx.createBiquadFilter(); f.type = o.ftype || 'lowpass'; f.frequency.setValueAtTime(o.filt, t); f.Q.value = o.q || 1;
      if (o.filtEnd) f.frequency.exponentialRampToValueAtTime(o.filtEnd, t + dur);
      out.connect(f); out = f; nodes.push(f);
    }
    out.connect(g); env(g, t, o.a || 0.004, dur, vol); g.connect(dest);
    if (o.rev) g.connect(verbSend);
    osc.start(t); osc.stop(t + dur + 0.02); cleanup(osc, nodes);
  }
  // noise(t,dur,vol,dest,ftype,f0,f1,q,rev)
  function noise(t, dur, vol, dest, ftype, f0, f1, q, rev, a) {
    var s = ctx.createBufferSource(), f = ctx.createBiquadFilter(), g = ctx.createGain();
    s.buffer = noiseBuf; s.loop = true;
    f.type = ftype || 'lowpass'; f.frequency.setValueAtTime(f0 || 4000, t); f.Q.value = q || 0.7;
    if (f1) f.frequency.exponentialRampToValueAtTime(f1, t + dur);
    s.connect(f); f.connect(g); env(g, t, a || 0.002, dur, vol); g.connect(dest);
    if (rev) g.connect(verbSend);
    s.start(t, Math.random() * 1.5); s.stop(t + dur + 0.02); cleanup(s, [f, g]);
  }

  // ---------- SFX ----------
  var D = null; // dest assigned at play time
  function gun(t, v, p, body, len, bright) {
    noise(t, len, v * 0.9, D, 'lowpass', bright * p, 300, 1, true);
    tone('square', body * p, body * 0.3 * p, t, len * 0.6, v * 0.5, D);
    noise(t, 0.02, v * 0.6, D, 'highpass', 3000);
  }
  var S = {
    punch: function (t, v, p) { noise(t, 0.09, v, D, 'lowpass', 2200 * p, 200); tone('sine', 180 * p, 50, t, 0.1, v * 0.9, D); },
    hit: function (t, v, p) { noise(t, 0.12, v, D, 'bandpass', 1500 * p, 400, 1.5); tone('triangle', 220 * p, 60, t, 0.12, v * 0.8, D); },
    heavyhit: function (t, v, p) { noise(t, 0.25, v, D, 'lowpass', 3000 * p, 120, 1, true); tone('sine', 140 * p, 35, t, 0.3, v, D); tone('square', 90 * p, 40, t, 0.12, v * 0.3, D); },
    whoosh: function (t, v, p) { noise(t, 0.18, v * 0.5, D, 'bandpass', 600 * p, 3000 * p, 3, false, 0.06); },
    jump: function (t, v, p) { tone('square', 220 * p, 520 * p, t, 0.13, v * 0.25, D, { filt: 2500 }); },
    land: function (t, v, p) { noise(t, 0.08, v * 0.6, D, 'lowpass', 800 * p, 150); tone('sine', 110 * p, 50, t, 0.08, v * 0.5, D); },
    pistol: function (t, v, p) { gun(t, v, p, 300, 0.16, 5000); },
    uzi: function (t, v, p) { gun(t, v * 0.7, p, 380, 0.07, 6000); },
    shotgun: function (t, v, p) { gun(t, v, p, 160, 0.4, 3500); noise(t + 0.02, 0.35, v * 0.5, D, 'lowpass', 1200, 100, 1, true); },
    rifle: function (t, v, p) { gun(t, v, p, 240, 0.28, 7000); tone('sawtooth', 1200 * p, 200, t, 0.05, v * 0.3, D); },
    explosion: function (t, v, p) { noise(t, 1.1, v, D, 'lowpass', 2500 * p, 60, 1, true); tone('sine', 90 * p, 25, t, 0.8, v, D); noise(t, 0.1, v * 0.8, D, 'highpass', 1500); },
    pickup: function (t, v, p) { [0, 4, 7, 12].forEach(function (s, i) { tone('square', 660 * p * Math.pow(2, s / 12), 0, t + i * 0.045, 0.09, v * 0.2, D, { filt: 4000 }); }); },
    eat: function (t, v, p) { for (var i = 0; i < 3; i++) { noise(t + i * 0.09, 0.06, v * 0.5, D, 'bandpass', 900 * p, 500, 2); tone('square', (300 + i * 80) * p, 200, t + i * 0.09, 0.06, v * 0.15, D); } tone('square', 880 * p, 1320 * p, t + 0.3, 0.15, v * 0.2, D); },
    ko: function (t, v, p) { tone('sawtooth', 400 * p, 60, t, 0.6, v * 0.4, D, { filt: 1800, filtEnd: 200, rev: true }); noise(t, 0.3, v * 0.5, D, 'lowpass', 1500, 100); },
    roar: function (t, v, p) {
      [-18, 0, 13].forEach(function (dt) { tone('sawtooth', 95 * p, 55 * p, t, 1.2, v * 0.35, D, { detune: dt, a: 0.12, filt: 300, filtEnd: 1800, q: 6, vib: 0.06, rev: true }); });
      noise(t, 1.2, v * 0.45, D, 'lowpass', 400, 2400, 3, true, 0.15);
    },
    raptor: function (t, v, p) { tone('sawtooth', 900 * p, 1500 * p, t, 0.08, v * 0.3, D, { filt: 3000, q: 4 }); tone('sawtooth', 1500 * p, 500 * p, t + 0.08, 0.3, v * 0.3, D, { filt: 2800, vib: 0.08, rev: true }); noise(t, 0.35, v * 0.3, D, 'bandpass', 2500, 1200, 4); },
    crash: function (t, v, p) { noise(t, 0.7, v, D, 'highpass', 1500 * p, 4000, 0.5, true); noise(t, 0.4, v * 0.8, D, 'lowpass', 900, 80); tone('square', 120 * p, 40, t, 0.3, v * 0.4, D); for (var i = 0; i < 4; i++) tone('triangle', (2000 + Math.random() * 3000) * p, 0, t + i * 0.05, 0.15, v * 0.1, D); },
    menu_move: function (t, v, p) { tone('square', 880 * p, 0, t, 0.04, v * 0.15, D, { filt: 3000 }); },
    menu_select: function (t, v, p) { tone('square', 660 * p, 0, t, 0.06, v * 0.2, D); tone('square', 1320 * p, 0, t + 0.06, 0.15, v * 0.2, D, { rev: true }); },
    coin: function (t, v, p) { tone('square', 988 * p, 0, t, 0.07, v * 0.2, D); tone('square', 1319 * p, 0, t + 0.07, 0.35, v * 0.2, D, { rev: true }); },
    boss_warning: function (t, v, p) { for (var i = 0; i < 3; i++) tone('sawtooth', 440 * p, 330 * p, t + i * 0.5, 0.4, v * 0.35, D, { filt: 2000, rev: true }); },
    knife: function (t, v, p) { noise(t, 0.12, v * 0.5, D, 'highpass', 3000 * p, 8000); tone('sine', 3200 * p, 2400 * p, t, 0.15, v * 0.1, D); },
    glass: function (t, v, p) { noise(t, 0.3, v * 0.6, D, 'highpass', 4000 * p, 0, 1, true); for (var i = 0; i < 6; i++) tone('sine', (2500 + Math.random() * 4000) * p, 0, t + Math.random() * 0.15, 0.2, v * 0.12, D); },
    scream: function (t, v, p) { tone('sawtooth', 700 * p, 400 * p, t, 0.6, v * 0.25, D, { filt: 1800, q: 5, vib: 0.05, a: 0.03 }); noise(t, 0.5, v * 0.15, D, 'bandpass', 1500, 900, 3); },
    text: function (t, v, p) { tone('square', 1200 * p, 0, t, 0.025, v * 0.05, D, { filt: 3000 }); },
    grunt: function (t, v, p) { tone('sawtooth', 140 * p, 90 * p, t, 0.15, v * 0.35, D, { filt: 700, q: 4 }); noise(t, 0.1, v * 0.2, D, 'lowpass', 600); },
    throw: function (t, v, p) { noise(t, 0.2, v * 0.45, D, 'bandpass', 400 * p, 2500 * p, 2); tone('triangle', 200 * p, 400 * p, t, 0.1, v * 0.15, D); },
    reload: function (t, v, p) { noise(t, 0.04, v * 0.5, D, 'bandpass', 2500 * p, 0, 5); noise(t + 0.12, 0.05, v * 0.6, D, 'bandpass', 1800 * p, 0, 5); tone('square', 600 * p, 0, t + 0.12, 0.03, v * 0.15, D); },
    empty: function (t, v, p) { noise(t, 0.03, v * 0.4, D, 'bandpass', 3000 * p, 0, 6); },
    horn: function (t, v, p) {
      // signature two-tone horn: major third, beep-beeeep
      [[0, 0.14], [0.2, 0.45]].forEach(function (b) {
        [370, 466].forEach(function (f) { tone('sawtooth', f * p, 0, t + b[0], b[1], v * 0.18, D, { filt: 2200, q: 2, a: 0.01, rev: true }); tone('square', f * p * 1.003, 0, t + b[0], b[1], v * 0.08, D, { filt: 1500 }); });
      });
    },
    skid: function (t, v, p) { noise(t, 0.6, v * 0.4, D, 'bandpass', 2200 * p, 1600 * p, 8, false, 0.03); tone('sawtooth', 1400 * p, 1100 * p, t, 0.6, v * 0.06, D, { filt: 3000, vib: 0.02 }); }
  };

  function play(name, opts) {
    var fn = S[name]; if (!fn) return;
    if (!init()) return;
    var now = ctx.currentTime;
    if (last[name] && now - last[name] < 0.03) return;
    last[name] = now;
    opts = opts || {};
    D = sfxBus;
    try { fn(now + 0.005, opts.vol == null ? 1 : opts.vol, opts.pitch || 1); } catch (e) {}
  }

  // ---------- MUSIC ----------
  var SC = { min: [0, 2, 3, 5, 7, 8, 10], dor: [0, 2, 3, 5, 7, 9, 10], phr: [0, 1, 3, 5, 7, 8, 10], maj: [0, 2, 4, 5, 7, 9, 11], hm: [0, 2, 3, 5, 7, 8, 11] };
  var DR = { // kick, snare, hat (16 steps)
    straight: ['x...x...x...x...', '....x.......x...', '..x...x...x...x.'],
    drive: ['x.x.x..xx.x.x..x', '....x.......x...', 'xxxxxxxxxxxxxxxx'],
    half: ['x.......x..x....', '........x.......', 'x.x.x.x.x.x.x.x.'],
    swing: ['x.....x.x.......', '....x.......x..x', 'x..x..x.x..x..x.'],
    boss: ['x..x..x.x..x..x.', '....x..x....x.xx', 'x.xxx.xxx.xxx.xx'],
    none: ['................', '................', '................']
  };
  // T: bpm, root midi, scale, 8-bar chord degrees, drum style, rng seed, lead octave, lead density
  var TR = {
    title: { bpm: 100, root: 45, sc: 'min', prog: [0, 5, 3, 6, 0, 5, 3, 4], dr: 'half', seed: 11, oct: 2, den: 0.45 },
    city: { bpm: 126, root: 40, sc: 'dor', prog: [0, 0, 6, 6, 5, 5, 3, 4], dr: 'straight', seed: 23, oct: 2, den: 0.6 },
    swamp: { bpm: 96, root: 38, sc: 'phr', prog: [0, 1, 0, 6, 0, 1, 5, 4], dr: 'swing', seed: 37, oct: 2, den: 0.45 },
    highway: { bpm: 150, root: 42, sc: 'min', prog: [0, 6, 5, 6, 0, 6, 3, 4], dr: 'drive', seed: 41, oct: 2, den: 0.65 },
    village: { bpm: 112, root: 43, sc: 'dor', prog: [0, 3, 0, 4, 0, 3, 6, 4], dr: 'swing', seed: 53, oct: 2, den: 0.5 },
    refinery: { bpm: 134, root: 39, sc: 'hm', prog: [0, 0, 5, 5, 3, 3, 4, 4], dr: 'straight', seed: 67, oct: 2, den: 0.55 },
    boss: { bpm: 158, root: 41, sc: 'hm', prog: [0, 1, 0, 1, 5, 4, 5, 4], dr: 'boss', seed: 71, oct: 2, den: 0.7 },
    finalboss: { bpm: 168, root: 36, sc: 'phr', prog: [0, 1, 6, 0, 5, 4, 1, 4], dr: 'boss', seed: 89, oct: 3, den: 0.75 },
    story: { bpm: 80, root: 48, sc: 'maj', prog: [0, 5, 3, 4, 0, 5, 1, 4], dr: 'none', seed: 97, oct: 1, den: 0.3 },
    victory: { bpm: 140, root: 48, sc: 'maj', once: [[0, 0, 2], [2, 2, 2], [4, 4, 2], [6, 7, 6], [12, 5, 2], [14, 6, 2], [16, 7, 16]], len: 36 },
    gameover: { bpm: 90, root: 45, sc: 'min', once: [[0, 4, 4], [4, 3, 4], [8, 2, 4], [12, 1, 3], [15, 0, 8]], len: 24 }
  };
  function rng(seed) { var s = seed * 9301 + 49297; return function () { s = (s * 9301 + 49297) % 233280; return s / 233280; }; }
  // build 2-bar lead motifs (32 steps, value = scale degree or null)
  function motif(r, den) {
    var m = [], d = 4 + Math.floor(r() * 3);
    for (var i = 0; i < 32; i++) {
      var strong = i % 4 === 0;
      if (r() < (strong ? den + 0.3 : den * 0.5)) { d += Math.floor(r() * 5) - 2; d = Math.max(0, Math.min(11, d)); m.push(d); }
      else m.push(i % 2 && r() < 0.3 ? -1 : null); // -1 = hold/rest
    }
    return m;
  }
  function mtof(n) { return 440 * Math.pow(2, (n - 69) / 12); }
  function deg(sc, root, d) { var o = Math.floor(d / 7), i = ((d % 7) + 7) % 7; return root + o * 12 + sc[i]; }

  var cur = null, curName = null, step = 0, nextT = 0, timer = null, M = {};
  function buildTrack(name) {
    var T = TR[name]; if (T.built) return T;
    T.scale = SC[T.sc];
    if (!T.once) { var r = rng(T.seed); T.A = motif(r, T.den); T.B = motif(r, T.den); T.bass = []; for (var i = 0; i < 16; i++) T.bass.push(i % 4 === 0 || r() < 0.4 ? (r() < 0.25 ? 7 : 0) : null); }
    T.built = true; return T;
  }
  function kick(t, v) { tone('sine', 150, 40, t, 0.28, v, musicBus); }
  function snare(t, v) { noise(t, 0.16, v * 0.7, musicBus, 'highpass', 1200, 0, 0.7, true); tone('triangle', 220, 120, t, 0.08, v * 0.4, musicBus); }
  function hat(t, v) { noise(t, 0.035, v * 0.25, musicBus, 'highpass', 7000); }
  function bassN(t, n, dur, v) { tone('sawtooth', mtof(n), 0, t, dur, v * 0.45, musicBus, { filt: 900, filtEnd: 200, q: 4 }); }
  function lead(t, n, dur, v) { tone('square', mtof(n), 0, t, dur, v * 0.13, musicBus, { filt: 3200, vib: 0.012, a: 0.01, rev: true }); }
  function pad(t, n, dur) { [0, 7].forEach(function (s, i) { tone('sawtooth', mtof(n + s), 0, t, dur, 0.035, musicBus, { detune: i ? 8 : -8, a: 0.3, filt: 1200, rev: true }); }); }

  function schedStep(T, t, s) {
    var sd = 60 / T.bpm / 4;
    if (T.once) {
      T.once.forEach(function (e) { if (e[0] === s) { var n = deg(T.scale, T.root + 24, e[1]); lead(t, n, e[2] * sd, 1.2); bassN(t, deg(T.scale, T.root, e[1]), e[2] * sd, 0.7); if (e[2] > 5) pad(t, deg(T.scale, T.root + 12, e[1]), e[2] * sd); } });
      if (s === 0 && T === TR.victory) kick(t, 0.6);
      return;
    }
    var bar = Math.floor(s / 16) % 8, i = s % 16, ch = T.prog[bar], dr = DR[T.dr];
    if (dr[0][i] === 'x') kick(t, 0.9);
    if (dr[1][i] === 'x') snare(t, 0.8);
    if (dr[2][i] === 'x') hat(t, i % 4 === 2 ? 1 : 0.6);
    var b = T.bass[i]; if (b !== null) bassN(t, deg(T.scale, T.root, ch + b), sd * 1.8, 1);
    if (i === 0) pad(t, deg(T.scale, T.root + 12, ch), sd * 16);
    // lead: bars 0-3 = A A' ; 4-7 = B A'' (A/B variation)
    var half = Math.floor(bar / 2), mot = half === 2 ? T.B : T.A, idx = (bar % 2) * 16 + i, d = mot[idx];
    if (half === 1 && idx >= 24 && T.B[idx] !== null) d = T.B[idx];
    if (half === 3 && idx >= 28) d = idx === 28 ? 0 : null;
    if (d !== null && d >= 0) {
      var len = 1; while (idx + len < 32 && mot[idx + len] === null && len < 4) len++;
      lead(t, deg(T.scale, T.root + 12 * T.oct, d + ch % 3), sd * len * 0.95, 1);
    }
  }
  function tick() {
    if (!cur || !ctx) return;
    var sd = 60 / cur.bpm / 4;
    while (nextT < ctx.currentTime + 0.12) {
      if (cur.once && step >= cur.len) { stopMusic(); return; }
      try { schedStep(cur, nextT, step); } catch (e) {}
      nextT += sd; step++;
    }
  }
  function music(name) {
    if (!TR[name]) return;
    if (curName === name && cur) return;
    if (!init()) return;
    stopMusic();
    cur = buildTrack(name); curName = name; step = 0; nextT = ctx.currentTime + 0.06;
    timer = setInterval(tick, 25); tick();
  }
  function stopMusic() { if (timer) clearInterval(timer); timer = null; cur = null; curName = null; }

  // ---------- ENGINE ----------
  var eng = null;
  function engineStart() {
    if (eng || !init()) return;
    var o1 = ctx.createOscillator(), o2 = ctx.createOscillator(), f = ctx.createBiquadFilter(), g = ctx.createGain();
    var lfo = ctx.createOscillator(), lg = ctx.createGain();
    o1.type = 'sawtooth'; o2.type = 'square'; o1.frequency.value = 45; o2.frequency.value = 22.6;
    f.type = 'lowpass'; f.frequency.value = 350; f.Q.value = 3;
    lfo.frequency.value = 18; lg.gain.value = 0.04; lfo.connect(lg); lg.connect(g.gain);
    g.gain.value = 0.0001; g.gain.linearRampToValueAtTime(0.12, ctx.currentTime + 0.3);
    o1.connect(f); o2.connect(f); f.connect(g); g.connect(sfxBus);
    o1.start(); o2.start(); lfo.start();
    eng = { o1: o1, o2: o2, f: f, g: g, lfo: lfo, lg: lg };
  }
  function engineSet(s) {
    if (!eng) return; s = Math.max(0, Math.min(1, s || 0));
    var t = ctx.currentTime, f = 40 + s * 90;
    eng.o1.frequency.setTargetAtTime(f, t, 0.1); eng.o2.frequency.setTargetAtTime(f * 0.502, t, 0.1);
    eng.f.frequency.setTargetAtTime(300 + s * 1400, t, 0.1); eng.lfo.frequency.setTargetAtTime(14 + s * 30, t, 0.1);
  }
  function engineStop() {
    if (!eng) return; var e = eng, t = ctx.currentTime; eng = null;
    e.g.gain.cancelScheduledValues(t); e.g.gain.setTargetAtTime(0.0001, t, 0.08);
    [e.o1, e.o2, e.lfo].forEach(function (o) { o.stop(t + 0.4); });
    e.o1.onended = function () { [e.o1, e.o2, e.lfo, e.lg, e.f, e.g].forEach(function (n) { n.disconnect(); }); };
  }

  function setMuted(b) {
    muted = !!b; SFX.muted = muted;
    try { localStorage.setItem('tt_muted', muted ? '1' : '0'); } catch (e) {}
    if (ctx) master.gain.setTargetAtTime(muted ? 0 : 1, ctx.currentTime, 0.02);
  }

  var SFX = {
    muted: muted, init: init, play: play, music: music, stopMusic: stopMusic,
    engineStart: engineStart, engineSet: engineSet, engineStop: engineStop,
    setMuted: setMuted, toggleMute: function () { setMuted(!muted); return muted; },
    get track() { return curName; }
  };
  window.SFX = SFX;
})();
