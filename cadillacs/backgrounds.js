/* TAILFINS & TYRANTS - procedural parallax backgrounds (Canvas 2D, no modules) */
(function () {
  'use strict';
  function hash(i) {
    var x = Math.sin(i * 127.1 + 311.7) * 43758.5453;
    return x - Math.floor(x);
  }
  function h2(i, s) { return hash(i * 7.13 + s * 101.7); }
  function lin(ctx, y0, y1, stops) {
    var g = ctx.createLinearGradient(0, y0, 0, y1);
    for (var k = 0; k < stops.length; k += 2) g.addColorStop(stops[k], stops[k + 1]);
    return g;
  }
  // iterate visible indices of a repeating layer
  function layer(camX, factor, spacing, W, pad, fn) {
    var off = camX * factor;
    var i0 = Math.floor((off - pad) / spacing), i1 = Math.floor((off + W + pad) / spacing);
    for (var i = i0; i <= i1; i++) fn(i, i * spacing - off);
  }
  function glow(ctx, x, y, r, col, a) {
    var g = ctx.createRadialGradient(x, y, 0, x, y, r);
    g.addColorStop(0, col); g.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.globalAlpha = a; ctx.fillStyle = g;
    ctx.fillRect(x - r, y - r, r * 2, r * 2);
    ctx.globalAlpha = 1;
  }
  function fog(ctx, y0, y1, col, W) {
    ctx.fillStyle = lin(ctx, y0, y1, [0, 'rgba(0,0,0,0)', 0.6, col, 1, col]);
    ctx.fillRect(0, y0, W, y1 - y0);
  }
  function tower(ctx, x, base, w, h, tilt, body, win, seed, vines) {
    ctx.save();
    ctx.translate(x + w / 2, base);
    ctx.rotate(tilt);
    ctx.fillStyle = body;
    ctx.fillRect(-w / 2, -h, w, h + 40);
    // broken top
    ctx.beginPath();
    ctx.moveTo(-w / 2, -h);
    ctx.lineTo(-w / 4, -h - 10 - h2(seed, 3) * 18);
    ctx.lineTo(w * 0.1, -h + 4);
    ctx.lineTo(w / 2, -h - h2(seed, 4) * 12);
    ctx.lineTo(w / 2, -h + 2);
    ctx.fill();
    if (win) {
      ctx.fillStyle = win;
      var cols = Math.max(2, Math.floor(w / 12)), rows = Math.floor(h / 16);
      for (var r = 1; r < rows; r++) for (var c = 0; c < cols; c++) {
        if (h2(seed + r * 13 + c, 9) < 0.45) continue;
        ctx.fillRect(-w / 2 + 4 + c * (w - 8) / cols, -h + r * 16, (w - 8) / cols - 4, 7);
      }
    }
    if (vines) {
      ctx.strokeStyle = vines; ctx.lineWidth = 3;
      for (var v = 0; v < 3; v++) {
        var vx = -w / 2 + h2(seed, 20 + v) * w, vl = h * (0.3 + h2(seed, 30 + v) * 0.5);
        ctx.beginPath(); ctx.moveTo(vx, -h);
        ctx.quadraticCurveTo(vx + 8, -h + vl / 2, vx - 4, -h + vl);
        ctx.stroke();
      }
    }
    ctx.restore();
  }

  /* ---------------- STAGE 0 : RUST HARBOR ---------------- */
  function s0(ctx, camX, t, W, H, gt) {
    ctx.fillStyle = lin(ctx, 0, gt, [0, '#2a1a4a', 0.35, '#7a3163', 0.6, '#e0664a', 0.78, '#ffb35c', 1, '#ffcf80']);
    ctx.fillRect(0, 0, W, gt);
    var sunX = W * 0.62;
    ctx.globalCompositeOperation = 'lighter';
    glow(ctx, sunX, 200, 220, 'rgba(255,150,70,0.8)', 0.6);
    ctx.globalCompositeOperation = 'source-over';
    ctx.fillStyle = '#ffe2a0'; ctx.beginPath(); ctx.arc(sunX, 200, 38, 0, 6.283); ctx.fill();
    // cloud streaks
    ctx.fillStyle = 'rgba(120,50,100,0.45)';
    layer(camX, 0.03, 380, W, 300, function (i, x) {
      var y = 60 + h2(i, 1) * 110;
      ctx.fillRect(x, y, 180 + h2(i, 2) * 200, 5 + h2(i, 3) * 6);
      ctx.fillRect(x + 40, y + 12, 120 + h2(i, 4) * 100, 3);
    });
    // pterosaurs
    ctx.strokeStyle = 'rgba(50,20,50,0.7)'; ctx.lineWidth = 2;
    for (var p = 0; p < 5; p++) {
      var px = ((h2(p, 5) * W + t * (12 + p * 4) - camX * 0.05) % (W + 200) + W + 200) % (W + 200) - 100;
      var py = 70 + h2(p, 6) * 80 + Math.sin(t * 0.7 + p) * 8, f = Math.sin(t * 5 + p * 2) * 6, s = 7 + p * 1.5;
      ctx.beginPath(); ctx.moveTo(px - s * 1.5, py - f); ctx.quadraticCurveTo(px - s * 0.5, py - 3, px, py);
      ctx.quadraticCurveTo(px + s * 0.5, py - 3, px + s * 1.5, py - f); ctx.stroke();
    }
    // far skyline 0.05
    ctx.fillStyle = '#8a4a78';
    layer(camX, 0.05, 70, W, 100, function (i, x) {
      var h = 30 + h2(i, 7) * 70;
      ctx.fillRect(x, 222 - h, 40 + h2(i, 8) * 20, h);
    });
    // water
    ctx.fillStyle = lin(ctx, 220, gt, [0, '#d77a5c', 0.4, '#8a3d63', 1, '#3b1d45']);
    ctx.fillRect(0, 220, W, gt - 220);
    ctx.globalCompositeOperation = 'lighter';
    ctx.fillStyle = 'rgba(255,190,110,0.35)';
    for (var k = 0; k < 14; k++) {
      var wy = 226 + k * 5.5, ww = 90 - k * 4 + Math.sin(t * 2 + k) * 14;
      ctx.fillRect(sunX - ww / 2 + Math.sin(t + k * 1.7) * 6, wy, ww, 2);
    }
    ctx.globalCompositeOperation = 'source-over';
    // mid towers 0.2
    layer(camX, 0.2, 150, W, 200, function (i, x) {
      if (h2(i, 10) < 0.25) return;
      tower(ctx, x, 238, 50 + h2(i, 11) * 40, 90 + h2(i, 12) * 110, (h2(i, 13) - 0.5) * 0.25, '#5a2a55', 'rgba(255,170,90,0.25)', i, null);
    });
    fog(ctx, 180, 250, 'rgba(230,120,100,0.45)', W);
    // near towers 0.45 + rope bridges
    var tops = [];
    layer(camX, 0.45, 260, W, 300, function (i, x) {
      if (h2(i, 14) < 0.35) { tops.push(null); return; }
      var w = 70 + h2(i, 15) * 50, hh = 150 + h2(i, 16) * 110, tl = (h2(i, 17) - 0.5) * 0.18;
      tower(ctx, x, 262, w, hh, tl, '#361735', 'rgba(255,140,70,0.35)', i + 500, '#2d5a2e');
      tops.push([x + w / 2 + Math.sin(tl) * hh * 0.6, 262 - hh * 0.6 * Math.cos(tl)]);
      ctx.fillStyle = 'rgba(255,170,100,0.25)';
      ctx.fillRect(x - 10, 262, w + 20, 3);
    });
    ctx.strokeStyle = '#2a1228'; ctx.lineWidth = 2;
    for (var b = 1; b < tops.length; b++) if (tops[b] && tops[b - 1]) {
      var a0 = tops[b - 1], a1 = tops[b], mx = (a0[0] + a1[0]) / 2, my = Math.max(a0[1], a1[1]) + 30;
      ctx.beginPath(); ctx.moveTo(a0[0], a0[1]); ctx.quadraticCurveTo(mx, my, a1[0], a1[1]); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(a0[0], a0[1] - 10); ctx.quadraticCurveTo(mx, my - 10, a1[0], a1[1] - 10); ctx.stroke();
    }
    // near debris 0.8: wrecked cars / palms at edge
    layer(camX, 0.8, 340, W, 200, function (i, x) {
      var r = h2(i, 18);
      ctx.fillStyle = '#24101f';
      if (r < 0.4) { // palm
        ctx.strokeStyle = '#24101f'; ctx.lineWidth = 6;
        ctx.beginPath(); ctx.moveTo(x, gt); ctx.quadraticCurveTo(x + 10, gt - 60, x + 25, gt - 120); ctx.stroke();
        for (var f = 0; f < 6; f++) {
          var an = f * 1.05 + Math.sin(t + i) * 0.08;
          ctx.beginPath(); ctx.moveTo(x + 25, gt - 120);
          ctx.quadraticCurveTo(x + 25 + Math.cos(an) * 30, gt - 135 + Math.sin(an) * 10, x + 25 + Math.cos(an) * 55, gt - 110 + Math.abs(Math.sin(an)) * 15);
          ctx.lineWidth = 4; ctx.stroke();
        }
      } else if (r < 0.7) { // rusted car hulk
        ctx.beginPath(); ctx.moveTo(x, gt); ctx.lineTo(x + 8, gt - 18); ctx.lineTo(x + 40, gt - 22); ctx.lineTo(x + 58, gt - 38);
        ctx.lineTo(x + 100, gt - 38); ctx.lineTo(x + 118, gt - 22); ctx.lineTo(x + 150, gt - 26); ctx.lineTo(x + 152, gt); ctx.fill();
        ctx.fillStyle = 'rgba(255,150,80,0.3)'; ctx.fillRect(x + 62, gt - 34, 34, 10);
      } else { // lamp post
        ctx.fillRect(x, gt - 110, 4, 110); ctx.fillRect(x, gt - 110, 26, 4);
      }
    });
  }
  function f0(ctx, camX, W, H, gt) {
    ctx.fillStyle = lin(ctx, gt, H, [0, '#4a3a40', 1, '#2a2028']);
    ctx.fillRect(0, gt, W, H - gt);
    layer(camX, 1, 120, W, 60, function (i, x) {
      // expansion joints
      ctx.fillStyle = 'rgba(0,0,0,0.25)'; ctx.fillRect(x, gt, 2, H - gt);
      // faded lane dashes
      ctx.fillStyle = 'rgba(235,210,150,0.22)';
      if (h2(i, 1) > 0.15) ctx.fillRect(x + 20, 418, 60, 5);
      // cracks + grass
      if (h2(i, 2) > 0.45) {
        var cx = x + h2(i, 3) * 100, cy = gt + 30 + h2(i, 4) * 190;
        ctx.strokeStyle = 'rgba(15,8,12,0.7)'; ctx.lineWidth = 2;
        ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(cx + 18, cy + 8); ctx.lineTo(cx + 30, cy + 2); ctx.lineTo(cx + 50, cy + 14); ctx.stroke();
        ctx.fillStyle = '#4f7a34';
        for (var g = 0; g < 5; g++) ctx.fillRect(cx + 14 + g * 6, cy + 2 - h2(i, 5 + g) * 10, 2, 6 + h2(i, 5 + g) * 8);
      }
      if (h2(i, 9) > 0.7) { ctx.fillStyle = 'rgba(20,10,20,0.35)'; ctx.beginPath(); ctx.ellipse(x + 60, gt + 80 + h2(i, 10) * 120, 30, 8, 0, 0, 6.283); ctx.fill(); }
    });
    ctx.fillStyle = 'rgba(255,180,120,0.06)'; ctx.fillRect(0, gt, W, 60);
  }

  /* ---------------- STAGE 1 : MANGROVE ROAD ---------------- */
  function mangrove(ctx, x, base, s, col, moss, seed, t) {
    ctx.fillStyle = col; ctx.strokeStyle = col;
    ctx.lineWidth = 3 * s;
    for (var r = 0; r < 5; r++) {
      ctx.beginPath(); ctx.moveTo(x, base - 40 * s);
      ctx.quadraticCurveTo(x + (r - 2) * 18 * s, base - 30 * s, x + (r - 2) * 26 * s, base + 4);
      ctx.stroke();
    }
    ctx.beginPath();
    ctx.moveTo(x - 7 * s, base - 30 * s);
    ctx.quadraticCurveTo(x - 16 * s, base - 110 * s, x - 4 * s, base - 170 * s);
    ctx.lineTo(x + 8 * s, base - 170 * s);
    ctx.quadraticCurveTo(x + 2 * s, base - 100 * s, x + 9 * s, base - 30 * s);
    ctx.fill();
    ctx.lineWidth = 5 * s;
    for (var b = 0; b < 4; b++) {
      var dir = b % 2 ? 1 : -1, by = base - (110 + b * 18) * s, len = (50 + h2(seed, b) * 40) * s;
      ctx.beginPath(); ctx.moveTo(x, by); ctx.quadraticCurveTo(x + dir * len * 0.5, by - 30 * s, x + dir * len, by - 10 * s); ctx.stroke();
      ctx.beginPath(); ctx.ellipse(x + dir * len, by - 20 * s, 40 * s, 22 * s, 0, 0, 6.283); ctx.fill();
      // moss drapes
      ctx.fillStyle = moss;
      for (var m = 0; m < 4; m++) {
        var mx = x + dir * len * (0.4 + m * 0.2), ml = (20 + h2(seed, b * 5 + m) * 40) * s, sw = Math.sin(t * 0.8 + m + seed) * 3;
        ctx.beginPath(); ctx.moveTo(mx - 4 * s, by - 8 * s); ctx.lineTo(mx + 4 * s, by - 8 * s); ctx.lineTo(mx + sw, by + ml); ctx.fill();
      }
      ctx.fillStyle = col;
    }
    ctx.beginPath(); ctx.ellipse(x, base - 180 * s, 55 * s, 30 * s, 0, 0, 6.283); ctx.fill();
  }
  function s1(ctx, camX, t, W, H, gt) {
    ctx.fillStyle = lin(ctx, 0, gt, [0, '#06141f', 0.5, '#123a44', 1, '#2d6a68']);
    ctx.fillRect(0, 0, W, gt);
    var mx = W * 0.75;
    ctx.globalCompositeOperation = 'lighter';
    glow(ctx, mx, 90, 160, 'rgba(160,230,220,0.6)', 0.5);
    ctx.globalCompositeOperation = 'source-over';
    ctx.fillStyle = '#e6f5e8'; ctx.beginPath(); ctx.arc(mx, 90, 34, 0, 6.283); ctx.fill();
    ctx.fillStyle = 'rgba(160,190,180,0.35)'; ctx.beginPath(); ctx.arc(mx - 10, 84, 8, 0, 6.283); ctx.arc(mx + 12, 100, 5, 0, 6.283); ctx.fill();
    // stars
    ctx.fillStyle = 'rgba(220,255,250,0.6)';
    for (var s = 0; s < 40; s++) { var tw = 0.5 + 0.5 * Math.sin(t * 2 + s); ctx.globalAlpha = 0.3 + tw * 0.5; ctx.fillRect(h2(s, 1) * W, h2(s, 2) * 150, 1.5, 1.5); }
    ctx.globalAlpha = 1;
    // far treeline 0.05
    ctx.fillStyle = '#1d4a50';
    ctx.beginPath(); ctx.moveTo(0, 230);
    for (var x = -20; x <= W + 40; x += 20) {
      var wi = Math.floor((x + camX * 0.05) / 20);
      ctx.lineTo(x - ((camX * 0.05) % 20), 200 - h2(wi, 3) * 40);
    }
    ctx.lineTo(W, 230); ctx.fill();
    // water
    ctx.fillStyle = lin(ctx, 225, gt, [0, '#2f6e6a', 1, '#0c2429']);
    ctx.fillRect(0, 225, W, gt - 225);
    ctx.globalCompositeOperation = 'lighter';
    ctx.fillStyle = 'rgba(180,240,230,0.25)';
    for (var k = 0; k < 12; k++) { var ww = 60 - k * 3; ctx.fillRect(mx - ww / 2 + Math.sin(t * 1.5 + k) * 8, 230 + k * 6, ww, 1.5); }
    ctx.globalCompositeOperation = 'source-over';
    fog(ctx, 150, 240, 'rgba(90,170,160,0.35)', W);
    layer(camX, 0.2, 170, W, 150, function (i, x) {
      if (h2(i, 4) < 0.3) return;
      mangrove(ctx, x, 245, 0.55 + h2(i, 5) * 0.2, '#16393c', '#1f4b43', i, t);
    });
    fog(ctx, 170, 262, 'rgba(70,150,140,0.45)', W);
    layer(camX, 0.45, 300, W, 250, function (i, x) {
      if (h2(i, 6) < 0.25) return;
      // reflection
      ctx.save(); ctx.globalAlpha = 0.25; ctx.translate(0, 2 * 272); ctx.scale(1, -1);
      mangrove(ctx, x, 272, 0.9, '#0a1f22', '#0a1f22', i + 50, t);
      ctx.restore();
      mangrove(ctx, x, 272, 0.9 + h2(i, 7) * 0.2, '#0c2528', '#1b4a3a', i + 50, t);
    });
    layer(camX, 0.8, 260, W, 200, function (i, x) {
      ctx.fillStyle = '#071517';
      if (h2(i, 8) < 0.5) { // reeds
        for (var r = 0; r < 7; r++) { var rh = 30 + h2(i, 9 + r) * 40, sw = Math.sin(t * 1.2 + r + i) * 3; ctx.beginPath(); ctx.moveTo(x + r * 7, gt); ctx.lineTo(x + r * 7 + 3, gt); ctx.lineTo(x + r * 7 + sw + 1, gt - rh); ctx.fill(); }
      } else { ctx.fillRect(x, gt - 50, 8, 50); ctx.fillRect(x + 90, gt - 44, 8, 44); ctx.fillRect(x, gt - 46, 98, 3); }
    });
    fog(ctx, 240, gt, 'rgba(120,200,190,0.25)', W);
  }
  function f1(ctx, camX, W, H, gt) {
    ctx.fillStyle = lin(ctx, gt, H, [0, '#5a4330', 1, '#35261a']);
    ctx.fillRect(0, gt, W, H - gt);
    // horizontal plank rows with staggered seams
    var rows = 8, rh = (H - gt) / rows;
    for (var r = 0; r < rows; r++) {
      var y = gt + r * rh;
      ctx.fillStyle = r % 2 ? 'rgba(255,220,170,0.04)' : 'rgba(0,0,0,0.06)';
      ctx.fillRect(0, y, W, rh);
      ctx.fillStyle = 'rgba(20,12,6,0.6)'; ctx.fillRect(0, y, W, 2);
      layer(camX, 1, 160, W, 20, function (i, x) {
        var sx = x + (r % 3) * 53;
        ctx.fillStyle = 'rgba(20,12,6,0.6)'; ctx.fillRect(sx, y, 2, rh);
        ctx.fillStyle = 'rgba(15,10,5,0.8)'; ctx.fillRect(sx + 6, y + rh / 2 - 1, 2, 2); ctx.fillRect(sx - 8, y + rh / 2 - 1, 2, 2);
        if (h2(i * 9 + r, 2) > 0.7) { ctx.fillStyle = 'rgba(40,60,30,0.35)'; ctx.fillRect(sx + 30, y + 3, 40 + h2(i + r, 3) * 50, rh - 5); }
        if (h2(i * 9 + r, 4) > 0.85) { ctx.fillStyle = 'rgba(8,20,22,0.85)'; ctx.fillRect(sx + 80, y + 2, 26, rh - 3); }
      });
    }
    ctx.fillStyle = 'rgba(120,220,210,0.05)'; ctx.fillRect(0, gt, W, 50);
  }

  /* ---------------- STAGE 2 : FLOODED HIGHWAY ---------------- */
  function s2(ctx, camX, t, W, H, gt) {
    ctx.fillStyle = lin(ctx, 0, 230, [0, '#2f84d8', 0.6, '#7cc0ee', 1, '#d6ecf5']);
    ctx.fillRect(0, 0, W, 230);
    ctx.globalCompositeOperation = 'lighter';
    glow(ctx, W * 0.2, 50, 200, 'rgba(255,250,220,0.8)', 0.5);
    ctx.globalCompositeOperation = 'source-over';
    // clouds
    ctx.fillStyle = 'rgba(255,255,255,0.85)';
    layer(camX, 0.05, 420, W, 300, function (i, x) {
      var y = 40 + h2(i, 1) * 90, s = 0.6 + h2(i, 2) * 0.8;
      ctx.beginPath();
      ctx.ellipse(x, y, 70 * s, 18 * s, 0, 0, 6.283); ctx.ellipse(x + 40 * s, y - 14 * s, 45 * s, 22 * s, 0, 0, 6.283); ctx.ellipse(x - 30 * s, y - 8 * s, 35 * s, 16 * s, 0, 0, 6.283);
      ctx.fill();
    });
    // sea
    ctx.fillStyle = lin(ctx, 200, gt, [0, '#4aa3c8', 1, '#12628a']);
    ctx.fillRect(0, 200, W, gt - 200);
    ctx.fillStyle = 'rgba(255,255,255,0.35)';
    layer(camX, 0.2, 60, W, 60, function (i, x) {
      var y = 206 + h2(i, 3) * 60; ctx.fillRect(x + Math.sin(t * 2 + i) * 4, y, 14 + h2(i, 4) * 20, 2);
    });
    // broken overpasses 0.2
    layer(camX, 0.2, 520, W, 400, function (i, x) {
      if (h2(i, 5) < 0.3) return;
      var y = 175 + h2(i, 6) * 20, len = 240 + h2(i, 7) * 160;
      ctx.fillStyle = '#7d98a8';
      ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + len, y + (h2(i, 8) - 0.3) * 30); ctx.lineTo(x + len - 10, y + 14 + (h2(i, 8) - 0.3) * 30); ctx.lineTo(x, y + 14); ctx.fill();
      ctx.fillStyle = '#6a8595';
      for (var p = 0; p < len - 40; p += 90) ctx.fillRect(x + 20 + p, y + 14, 12, 225 - y);
    });
    // heat haze band
    ctx.globalCompositeOperation = 'lighter';
    ctx.fillStyle = 'rgba(255,240,210,0.1)';
    for (var k = 0; k < 6; k++) ctx.fillRect(0, 228 + k * 5 + Math.sin(t * 6 + k) * 1.5, W, 2);
    ctx.globalCompositeOperation = 'source-over';
    // island / flooded buildings 0.45
    layer(camX, 0.45, 380, W, 300, function (i, x) {
      if (h2(i, 9) < 0.4) return;
      tower(ctx, x, 262, 40 + h2(i, 10) * 40, 40 + h2(i, 11) * 70, (h2(i, 12) - 0.5) * 0.3, '#56788a', 'rgba(20,40,60,0.4)', i, '#4e8a4a');
    });
    fog(ctx, 200, 270, 'rgba(230,245,250,0.35)', W);
    // guardrail at 0.8? spec: guardrail at top of floor -> drawn in floor at 1.0
    layer(camX, 0.8, 220, W, 100, function (i, x) {
      if (h2(i, 13) < 0.5) return;
      ctx.fillStyle = '#2d5570';
      ctx.fillRect(x, gt - 70, 6, 70); ctx.fillRect(x - 30, gt - 72, 70, 8);
      ctx.fillStyle = '#e8f2f5'; ctx.fillRect(x - 26, gt - 70, 62, 4);
    });
  }
  function f2(ctx, camX, W, H, gt) {
    ctx.fillStyle = lin(ctx, gt, H, [0, '#55595e', 1, '#3a3d42']);
    ctx.fillRect(0, gt, W, H - gt);
    // guardrail
    ctx.fillStyle = '#9aa4ac'; ctx.fillRect(0, gt + 4, W, 10);
    ctx.fillStyle = '#c8d0d6'; ctx.fillRect(0, gt + 5, W, 3);
    layer(camX, 1, 80, W, 20, function (i, x) {
      ctx.fillStyle = '#6a7278'; ctx.fillRect(x, gt + 2, 6, 22);
    });
    // shoulder line
    ctx.fillStyle = 'rgba(250,210,70,0.8)'; ctx.fillRect(0, gt + 30, W, 4);
    var lanes = [370, 430, 490];
    layer(camX, 1, 140, W, 100, function (i, x) {
      ctx.fillStyle = 'rgba(245,245,240,0.8)';
      for (var l = 0; l < lanes.length; l++) ctx.fillRect(x, lanes[l], 70, 4);
      if (h2(i, 1) > 0.6) { ctx.fillStyle = 'rgba(20,20,25,0.35)'; ctx.fillRect(x + 20, gt + 50 + h2(i, 2) * 180, 60 + h2(i, 3) * 60, 3); }
      if (h2(i, 4) > 0.8) { ctx.fillStyle = 'rgba(60,120,160,0.3)'; ctx.beginPath(); ctx.ellipse(x + 90, gt + 60 + h2(i, 5) * 170, 40, 7, 0, 0, 6.283); ctx.fill(); }
    });
    ctx.fillStyle = 'rgba(240,240,230,0.7)'; ctx.fillRect(0, H - 8, W, 3);
  }

  /* ---------------- STAGE 3 : POACHER CAMP ---------------- */
  function flame(ctx, x, y, s, t, seed) {
    for (var k = 0; k < 3; k++) {
      var fl = Math.sin(t * 9 + seed + k * 2) * 0.15 + 1, w = (18 - k * 5) * s, h = (46 - k * 12) * s * fl;
      ctx.fillStyle = k === 0 ? 'rgba(255,80,20,0.8)' : k === 1 ? 'rgba(255,160,40,0.85)' : 'rgba(255,240,170,0.9)';
      ctx.beginPath(); ctx.moveTo(x - w, y); ctx.quadraticCurveTo(x - w * 0.6, y - h * 0.6, x + Math.sin(t * 7 + seed) * 4 * s, y - h);
      ctx.quadraticCurveTo(x + w * 0.6, y - h * 0.6, x + w, y); ctx.fill();
    }
  }
  function s3(ctx, camX, t, W, H, gt) {
    ctx.fillStyle = lin(ctx, 0, gt, [0, '#12040a', 0.5, '#4a0d12', 0.85, '#a8301a', 1, '#d9602a']);
    ctx.fillRect(0, 0, W, gt);
    // smoke columns
    layer(camX, 0.05, 300, W, 200, function (i, x) {
      for (var k = 0; k < 6; k++) {
        var yy = 220 - k * 38 - (t * 10 % 38), r = 30 + k * 12;
        ctx.fillStyle = 'rgba(30,10,14,' + (0.35 - k * 0.04) + ')';
        ctx.beginPath(); ctx.arc(x + Math.sin(k + t * 0.5 + i) * 20 + k * 10, yy, r, 0, 6.283); ctx.fill();
      }
    });
    // far jungle
    ctx.fillStyle = '#2a0a10';
    layer(camX, 0.2, 60, W, 80, function (i, x) {
      var h = 60 + h2(i, 1) * 50;
      ctx.beginPath(); ctx.ellipse(x, 250 - h * 0.5, 45, h * 0.6, 0, 0, 6.283); ctx.fill();
      if (h2(i, 2) > 0.6) { ctx.fillRect(x - 2, 250 - h - 40, 4, 50); ctx.beginPath(); ctx.ellipse(x, 250 - h - 40, 30, 8, 0, 0, 6.283); ctx.fill(); }
    });
    ctx.globalCompositeOperation = 'lighter';
    glow(ctx, W * 0.5, gt, 500, 'rgba(255,90,30,0.6)', 0.5);
    ctx.globalCompositeOperation = 'source-over';
    fog(ctx, 180, 270, 'rgba(120,30,20,0.4)', W);
    // tents + cages 0.45
    layer(camX, 0.45, 280, W, 200, function (i, x) {
      var r = h2(i, 3), b = 275;
      if (r < 0.45) { // tent
        ctx.fillStyle = '#3a1810';
        ctx.beginPath(); ctx.moveTo(x - 70, b); ctx.lineTo(x, b - 70); ctx.lineTo(x + 70, b); ctx.fill();
        ctx.fillStyle = 'rgba(255,140,60,0.5)'; ctx.beginPath(); ctx.moveTo(x - 14, b); ctx.lineTo(x, b - 40); ctx.lineTo(x + 14, b); ctx.fill();
      } else if (r < 0.8) { // cage
        ctx.fillStyle = '#1c0708'; ctx.fillRect(x - 50, b - 70, 100, 8); ctx.fillRect(x - 50, b - 4, 100, 6);
        for (var k = 0; k <= 8; k++) ctx.fillRect(x - 50 + k * 12, b - 66, 4, 64);
        ctx.fillStyle = 'rgba(28,7,8,0.8)'; ctx.beginPath(); ctx.ellipse(x, b - 22, 30, 16, 0, 0, 6.283); ctx.fill();
        ctx.fillStyle = 'rgba(255,200,60,0.9)'; ctx.fillRect(x + 16, b - 30, 4, 3);
      } else { // watchtower
        ctx.fillStyle = '#1c0708'; ctx.fillRect(x - 30, b - 140, 6, 140); ctx.fillRect(x + 24, b - 140, 6, 140); ctx.fillRect(x - 40, b - 150, 80, 22);
        ctx.globalCompositeOperation = 'lighter'; glow(ctx, x, b - 140, 60, 'rgba(255,220,150,0.8)', 0.5); ctx.globalCompositeOperation = 'source-over';
      }
    });
    // fires 0.8
    layer(camX, 0.8, 360, W, 150, function (i, x) {
      if (h2(i, 4) < 0.4) return;
      ctx.globalCompositeOperation = 'lighter';
      glow(ctx, x, gt - 20, 110, 'rgba(255,110,30,0.7)', 0.55);
      flame(ctx, x, gt - 2, 1.2, t, i);
      ctx.globalCompositeOperation = 'source-over';
      ctx.fillStyle = '#140405'; ctx.fillRect(x - 26, gt - 6, 52, 6);
    });
  }
  function f3(ctx, camX, W, H, gt) {
    ctx.fillStyle = lin(ctx, gt, H, [0, '#4a2418', 1, '#20100c']);
    ctx.fillRect(0, gt, W, H - gt);
    layer(camX, 1, 90, W, 40, function (i, x) {
      for (var k = 0; k < 3; k++) {
        var sx = x + h2(i, k) * 90, sy = gt + 20 + h2(i, k + 5) * (H - gt - 30), r = 3 + h2(i, k + 9) * 7;
        ctx.fillStyle = 'rgba(15,6,4,0.5)'; ctx.beginPath(); ctx.ellipse(sx + 2, sy + 3, r * 1.2, r * 0.6, 0, 0, 6.283); ctx.fill();
        ctx.fillStyle = '#6d4636'; ctx.beginPath(); ctx.ellipse(sx, sy, r, r * 0.7, 0, 0, 6.283); ctx.fill();
        ctx.fillStyle = 'rgba(255,150,90,0.35)'; ctx.fillRect(sx - r * 0.5, sy - r * 0.5, r * 0.6, 1.5);
      }
      if (h2(i, 20) > 0.6) { ctx.strokeStyle = 'rgba(20,8,5,0.5)'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(x, gt + 60 + h2(i, 21) * 150); ctx.lineTo(x + 90, gt + 70 + h2(i, 22) * 150); ctx.stroke(); }
    });
    ctx.globalCompositeOperation = 'lighter';
    ctx.fillStyle = lin(ctx, gt, gt + 120, [0, 'rgba(255,90,30,0.18)', 1, 'rgba(0,0,0,0)']);
    ctx.fillRect(0, gt, W, 120);
    ctx.globalCompositeOperation = 'source-over';
  }

  /* ---------------- STAGE 4 : MARROW REFINERY ---------------- */
  function s4(ctx, camX, t, W, H, gt) {
    ctx.fillStyle = lin(ctx, 0, gt, [0, '#0c0a10', 0.6, '#2a1c1a', 1, '#5a3a1c']);
    ctx.fillRect(0, 0, W, gt);
    // smokestacks 0.05
    layer(camX, 0.05, 180, W, 100, function (i, x) {
      var h = 120 + h2(i, 1) * 80;
      ctx.fillStyle = '#1e1618'; ctx.fillRect(x, 240 - h, 22, h);
      ctx.fillStyle = 'rgba(200,40,30,0.8)'; ctx.fillRect(x, 240 - h + 10, 22, 4);
      if (Math.sin(t * 3 + i) > 0.3) { ctx.globalCompositeOperation = 'lighter'; glow(ctx, x + 11, 240 - h, 16, 'rgba(255,40,30,1)', 0.8); ctx.globalCompositeOperation = 'source-over'; }
      for (var k = 0; k < 4; k++) { var yy = 240 - h - 20 - k * 30 - (t * 12 % 30); ctx.fillStyle = 'rgba(60,50,50,' + (0.3 - k * 0.06) + ')'; ctx.beginPath(); ctx.arc(x + 11 + k * 12, yy, 16 + k * 8, 0, 6.283); ctx.fill(); }
    });
    // tanks 0.2
    layer(camX, 0.2, 200, W, 150, function (i, x) {
      var w = 80 + h2(i, 2) * 50, h = 60 + h2(i, 3) * 60, b = 255;
      ctx.fillStyle = lin(ctx, b - h, b, [0, '#3a3030', 1, '#1e1818']);
      ctx.fillRect(x, b - h, w, h);
      ctx.beginPath(); ctx.ellipse(x + w / 2, b - h, w / 2, 10, 0, 0, 6.283); ctx.fill();
      ctx.fillStyle = 'rgba(0,0,0,0.35)'; for (var k = 1; k < 4; k++) ctx.fillRect(x, b - h + k * h / 4, w, 2);
      ctx.fillStyle = '#2a2222'; ctx.fillRect(x + w, b - h * 0.7, 120, 8);
    });
    fog(ctx, 160, 260, 'rgba(120,80,40,0.35)', W);
    // pipes rack 0.45
    var off = camX * 0.45;
    ctx.fillStyle = '#2c2426';
    ctx.fillRect(0, 196, W, 10); ctx.fillRect(0, 214, W, 6);
    layer(camX, 0.45, 110, W, 50, function (i, x) {
      ctx.fillStyle = '#231c1d'; ctx.fillRect(x, 190, 8, 90); ctx.fillRect(x - 4, 194, 16, 4);
    });
    // marrow vats 0.45
    layer(camX, 0.45, 330, W, 200, function (i, x) {
      if (h2(i, 4) < 0.3) return;
      var b = 280, w = 110;
      ctx.fillStyle = '#1a1414'; ctx.fillRect(x, b - 70, w, 70);
      ctx.globalCompositeOperation = 'lighter';
      glow(ctx, x + w / 2, b - 70, 110, 'rgba(255,170,40,0.9)', 0.45 + Math.sin(t * 2 + i) * 0.1);
      ctx.fillStyle = 'rgba(255,190,60,0.9)'; ctx.beginPath(); ctx.ellipse(x + w / 2, b - 70, w / 2 - 4, 8, 0, 0, 6.283); ctx.fill();
      ctx.fillStyle = 'rgba(255,140,30,0.6)'; ctx.fillRect(x + 10, b - 55, w - 20, 5);
      ctx.globalCompositeOperation = 'source-over';
      ctx.fillStyle = '#e8b830'; for (var k = 0; k < 6; k++) { ctx.fillStyle = k % 2 ? '#e8b830' : '#1a1414'; ctx.fillRect(x + k * w / 6, b - 20, w / 6, 8); }
    });
    // alarm lights + catwalk 0.8
    layer(camX, 0.8, 300, W, 150, function (i, x) {
      ctx.fillStyle = '#120e0f'; ctx.fillRect(x, gt - 120, 10, 120); ctx.fillRect(x - 60, gt - 120, 130, 6);
      for (var r = 0; r < 5; r++) ctx.fillRect(x - 60 + r * 30, gt - 114, 2, 22);
      ctx.fillRect(x - 60, gt - 94, 130, 3);
      var pulse = 0.5 + 0.5 * Math.sin(t * 6 + i);
      ctx.fillStyle = 'rgb(' + (140 + pulse * 115 | 0) + ',20,20)'; ctx.fillRect(x - 2, gt - 134, 14, 12);
      ctx.globalCompositeOperation = 'lighter';
      glow(ctx, x + 5, gt - 128, 90, 'rgba(255,30,20,1)', 0.25 + pulse * 0.4);
      ctx.globalCompositeOperation = 'source-over';
    });
    ctx.globalCompositeOperation = 'lighter';
    ctx.fillStyle = 'rgba(255,20,20,' + (0.04 + 0.04 * Math.sin(t * 6)) + ')'; ctx.fillRect(0, 0, W, gt);
    ctx.globalCompositeOperation = 'source-over';
  }
  function f4(ctx, camX, W, H, gt) {
    ctx.fillStyle = lin(ctx, gt, H, [0, '#3a3638', 1, '#1e1b1d']);
    ctx.fillRect(0, gt, W, H - gt);
    // grating: vertical bars 1:1 + horizontal rows
    layer(camX, 1, 16, W, 20, function (i, x) { ctx.fillStyle = 'rgba(10,8,9,0.45)'; ctx.fillRect(x, gt + 34, 3, H - gt - 34); });
    ctx.fillStyle = 'rgba(10,8,9,0.5)';
    for (var y = gt + 40; y < H; y += 14) ctx.fillRect(0, y, W, 3);
    ctx.fillStyle = 'rgba(200,190,190,0.08)';
    for (var y2 = gt + 43; y2 < H; y2 += 14) ctx.fillRect(0, y2, W, 1);
    // hazard stripe at top and panel seams
    layer(camX, 1, 40, W, 40, function (i, x) {
      ctx.fillStyle = i % 2 ? '#e2b020' : '#141112';
      ctx.beginPath(); ctx.moveTo(x, gt + 34); ctx.lineTo(x + 20, gt + 14); ctx.lineTo(x + 40, gt + 14); ctx.lineTo(x + 20, gt + 34); ctx.fill();
    });
    layer(camX, 1, 240, W, 40, function (i, x) {
      ctx.fillStyle = 'rgba(0,0,0,0.6)'; ctx.fillRect(x, gt + 34, 4, H - gt);
      if (h2(i, 1) > 0.5) { ctx.globalCompositeOperation = 'lighter'; ctx.fillStyle = 'rgba(255,160,40,0.12)'; ctx.beginPath(); ctx.ellipse(x + 120, gt + 100 + h2(i, 2) * 120, 60, 12, 0, 0, 6.283); ctx.fill(); ctx.globalCompositeOperation = 'source-over'; }
    });
  }

  var SKY = [s0, s1, s2, s3, s4], FLOOR = [f0, f1, f2, f3, f4];

  /* ---------------- FRONT ---------------- */
  var GRADE = ['rgba(255,120,60,0.08)', 'rgba(40,160,150,0.1)', 'rgba(255,230,160,0.05)', 'rgba(255,60,20,0.1)', 'rgba(255,140,30,0.08)'];
  var FGCOL = ['rgba(25,10,22,0.75)', 'rgba(3,12,12,0.8)', 'rgba(30,40,50,0.6)', 'rgba(12,2,2,0.8)', 'rgba(8,6,6,0.8)'];
  function wrap(v, m) { return ((v % m) + m) % m; }

  function drawFront(ctx, stage, camX, t, W, H) {
    stage = stage | 0; if (stage < 0 || stage > 4) stage = 0;
    ctx.save();
    var k, x, y;
    if (stage === 0) { // drifting dust / ash motes
      ctx.fillStyle = 'rgba(255,210,160,0.5)';
      for (k = 0; k < 30; k++) { x = wrap(hash(k) * W - camX * 0.3 + t * 20, W); y = wrap(hash(k + 50) * H + t * 8, H); ctx.fillRect(x, y, 2, 2); }
    } else if (stage === 1) { // fireflies
      ctx.globalCompositeOperation = 'lighter';
      for (k = 0; k < 28; k++) {
        x = wrap(hash(k) * W - camX * 0.4 + Math.sin(t * 0.7 + k) * 30, W);
        y = 160 + hash(k + 9) * 340 + Math.sin(t * 1.3 + k * 2) * 20;
        var a = 0.4 + 0.6 * Math.max(0, Math.sin(t * 3 + k * 1.7));
        glow(ctx, x, y, 12, 'rgba(200,255,120,1)', a * 0.6);
        ctx.fillStyle = 'rgba(240,255,190,' + a + ')'; ctx.fillRect(x - 1, y - 1, 3, 3);
      }
      ctx.globalCompositeOperation = 'source-over';
    } else if (stage === 2) { // speed lines + dust
      ctx.fillStyle = 'rgba(255,255,255,0.35)';
      for (k = 0; k < 24; k++) { x = wrap(hash(k) * W * 2 - camX * 1.6, W + 300) - 150; y = 310 + hash(k + 7) * 230; ctx.fillRect(x, y, 80 + hash(k + 3) * 120, 1.5); }
      ctx.fillStyle = 'rgba(210,190,150,0.35)';
      for (k = 0; k < 20; k++) { x = wrap(hash(k + 30) * W - camX * 1.2, W); y = 330 + hash(k + 40) * 200 - wrap(t * 30 + k * 13, 40); ctx.beginPath(); ctx.arc(x, y, 2 + hash(k) * 4, 0, 6.283); ctx.fill(); }
    } else if (stage === 3) { // embers
      ctx.globalCompositeOperation = 'lighter';
      for (k = 0; k < 45; k++) {
        var sp = 30 + hash(k + 3) * 50;
        y = H - wrap(t * sp + hash(k) * H, H + 40);
        x = wrap(hash(k + 11) * W - camX * 0.9 + Math.sin(t * 2 + k) * 15, W);
        ctx.fillStyle = 'rgba(255,' + (120 + (hash(k + 2) * 100 | 0)) + ',40,' + (0.5 + 0.5 * Math.sin(t * 8 + k)) + ')';
        ctx.fillRect(x, y, 2.5, 2.5);
      }
      ctx.globalCompositeOperation = 'source-over';
    } else { // steam puffs
      for (k = 0; k < 10; k++) {
        var ph = wrap(t * 0.35 + hash(k), 1);
        x = wrap(hash(k + 5) * W * 1.5 - camX * 1.1, W + 200) - 100 + ph * 30;
        y = 520 - ph * 220;
        ctx.fillStyle = 'rgba(220,210,200,' + (0.18 * (1 - ph)) + ')';
        ctx.beginPath(); ctx.arc(x, y, 20 + ph * 60, 0, 6.283); ctx.fill();
      }
    }
    // foreground silhouettes, parallax 1.3
    ctx.fillStyle = FGCOL[stage];
    layer(camX, 1.3, 1100, W, 200, function (i, x) {
      if (stage === 2 || hash(i * 3.3 + stage) < 0.45) return;
      var r = hash(i + stage * 17);
      if (stage === 1 || stage === 3 || (stage === 0 && r < 0.5)) { // leafy fronds from bottom corner
        for (var f = 0; f < 5; f++) {
          ctx.beginPath(); ctx.moveTo(x + f * 14, H + 10);
          ctx.quadraticCurveTo(x + f * 30 - 40, H - 120 - f * 12, x + f * 40 - 70 + Math.sin(t + f) * 6, H - 150 - f * 10);
          ctx.quadraticCurveTo(x + f * 22 - 10, H - 80, x + f * 14 + 18, H + 10); ctx.fill();
        }
      } else { // pole / girder
        ctx.fillRect(x, 0, 34, H);
        ctx.fillRect(x - 20, H - 60, 74, 60);
      }
    });
    // color grade + vignette
    ctx.fillStyle = GRADE[stage]; ctx.fillRect(0, 0, W, H);
    var vg = ctx.createRadialGradient(W / 2, H / 2, H * 0.35, W / 2, H / 2, W * 0.72);
    vg.addColorStop(0, 'rgba(0,0,0,0)'); vg.addColorStop(1, stage === 2 ? 'rgba(0,10,30,0.35)' : 'rgba(0,0,0,0.6)');
    ctx.fillStyle = vg; ctx.fillRect(0, 0, W, H);
    ctx.restore();
  }

  function draw(ctx, stage, camX, t, W, H, groundTop) {
    stage = stage | 0; if (stage < 0 || stage > 4) stage = 0;
    W = W || 960; H = H || 540; var gt = groundTop == null ? 300 : groundTop;
    ctx.save();
    SKY[stage](ctx, camX, t, W, H, gt);
    FLOOR[stage](ctx, camX, W, H, gt);
    // darker seam band at top of floor
    ctx.fillStyle = lin(ctx, gt, gt + 26, [0, 'rgba(0,0,0,0.55)', 1, 'rgba(0,0,0,0)']);
    ctx.fillRect(0, gt, W, 26);
    ctx.fillStyle = 'rgba(0,0,0,0.6)'; ctx.fillRect(0, gt, W, 2);
    ctx.restore();
  }

  window.BG = {
    draw: draw,
    drawFront: drawFront,
    names: ['RUST HARBOR', 'MANGROVE ROAD', 'FLOODED HIGHWAY', 'POACHER CAMP', 'MARROW REFINERY'],
    hash: hash
  };
})();
