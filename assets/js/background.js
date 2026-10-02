/*
 * Engineering-lab background behind the hero section. It animates only while the
 * hero is on screen.
 *
 * Layers, back to front:
 *   static       dot texture, ambient light, PCB traces, chips, sensors, floor.
 *                Its own canvas, painted once; parallax is a CSS transform.
 *   electronics  data pulses: sensors → controller → processing → output
 *   mechanical   meshing gears
 *   robotics     robotic arm (pick and place), rover, drone
 *   atmosphere   dust particles
 * The content column is faded by a static CSS mask on the wrapper, and key text
 * blocks are cleared from the live canvas, so the page always reads first.
 *
 * Desktop shows everything, tablet drops the arm, mobile keeps traces, a few gears
 * and particles. prefers-reduced-motion renders a single still frame.
 */
(() => {
  "use strict";

  const TAU = Math.PI * 2;
  const QUIET = ".hero__text";
  const reduceMQ = matchMedia("(prefers-reduced-motion: reduce)");

  const wrap = document.createElement("div");
  wrap.className = "lab-bg";
  wrap.setAttribute("aria-hidden", "true");
  const staticCanvas = document.createElement("canvas");
  const canvas = document.createElement("canvas");
  wrap.append(staticCanvas, canvas);
  const hero = document.querySelector(".hero");
  if (!hero) return;
  hero.prepend(wrap);
  const ctx = canvas.getContext("2d");
  const sctx = staticCanvas.getContext("2d");
  if (!ctx || !sctx) return;

  // ---------- Colours ----------

  const hex = (getComputedStyle(document.documentElement).getPropertyValue("--accent").trim() || "#10b981").slice(1);
  const ACCENT = [0, 2, 4].map((i) => parseInt(hex.slice(i, i + 2), 16));
  const STEEL = [150, 166, 173];
  const rgba = (c, a) => `rgba(${c[0]},${c[1]},${c[2]},${a})`;
  const METAL = "#13181a";
  const METAL_DARK = "#0f1315";

  // ---------- Helpers ----------

  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
  const lerp = (a, b, t) => a + (b - a) * t;
  const easeInOut = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
  const easeSine = (t) => -(Math.cos(Math.PI * t) - 1) / 2;
  const dir = (a) => [Math.sin(a), -Math.cos(a)]; // angle 0 = straight up, clockwise positive

  function seeded(seed) {
    return () => {
      seed |= 0;
      seed = (seed + 0x6d2b79f5) | 0;
      let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }
  let rand = Math.random;
  const range = (a, b) => a + rand() * (b - a);

  function offscreen(w, h) {
    const c = document.createElement("canvas");
    c.width = Math.max(1, Math.ceil(w * dpr));
    c.height = Math.max(1, Math.ceil(h * dpr));
    const g = c.getContext("2d");
    g.scale(dpr, dpr);
    return [c, g];
  }

  function roundRect(g, x, y, w, h, r) {
    g.beginPath();
    if (g.roundRect) g.roundRect(x, y, w, h, r);
    else g.rect(x, y, w, h);
  }

  // ---------- Paths (PCB traces) ----------

  // Cut each right-angle corner at 45°, like routed copper.
  function chamfer(pts, r = 7) {
    const out = [pts[0]];
    for (let i = 1; i < pts.length - 1; i++) {
      const [a, p, b] = [pts[i - 1], pts[i], pts[i + 1]];
      const l1 = Math.hypot(p[0] - a[0], p[1] - a[1]);
      const l2 = Math.hypot(b[0] - p[0], b[1] - p[1]);
      const d1 = [(p[0] - a[0]) / l1, (p[1] - a[1]) / l1];
      const d2 = [(b[0] - p[0]) / l2, (b[1] - p[1]) / l2];
      if (Math.abs(d1[0] * d2[1] - d1[1] * d2[0]) < 1e-3) {
        out.push(p);
        continue;
      }
      const k = Math.min(r, l1 / 2, l2 / 2);
      out.push([p[0] - d1[0] * k, p[1] - d1[1] * k], [p[0] + d2[0] * k, p[1] + d2[1] * k]);
    }
    out.push(pts[pts.length - 1]);
    return out;
  }

  function makePath(raw, opts = {}) {
    raw = raw.filter((p, i) => !i || Math.hypot(p[0] - raw[i - 1][0], p[1] - raw[i - 1][1]) > 0.5);
    const pts = chamfer(raw);
    const lens = [0];
    for (let i = 1; i < pts.length; i++) lens.push(lens[i - 1] + Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]));
    return { pts, lens, total: lens[lens.length - 1], ...opts };
  }

  function pointAt(path, s) {
    const { pts, lens } = path;
    s = clamp(s, 0, path.total);
    let i = 1;
    while (i < lens.length - 1 && lens[i] < s) i++;
    const t = (s - lens[i - 1]) / (lens[i] - lens[i - 1] || 1);
    return [lerp(pts[i - 1][0], pts[i][0], t), lerp(pts[i - 1][1], pts[i][1], t)];
  }

  // ---------- State ----------

  let W = 0;
  let H = 0;
  let dpr = 1;
  let tier = "desktop";
  let scene = null;
  let staticShift = "";
  let zones = [];
  let zonesDirty = true;
  let raf = 0;
  let running = false;
  let last = 0;
  let clock = 0;
  let gearBoost = 0;
  let lastScrollY = window.scrollY;
  const mouse = { x: 0, y: 0, tx: 0, ty: 0, px: -1e4, py: -1e4 };

  // ---------- Gears ----------

  function gearSprite(teeth, m) {
    const rp = (teeth * m) / 2;
    const ra = rp + m;
    const rr = rp - 1.25 * m;
    const size = (ra + 2) * 2;
    const [c, g] = offscreen(size, size);
    g.translate(size / 2, size / 2);
    const step = TAU / teeth;

    g.beginPath();
    for (let k = 0; k < teeth; k++) {
      const a = k * step;
      g.lineTo(Math.cos(a - 0.3 * step) * rr, Math.sin(a - 0.3 * step) * rr);
      g.lineTo(Math.cos(a - 0.15 * step) * ra, Math.sin(a - 0.15 * step) * ra);
      g.lineTo(Math.cos(a + 0.15 * step) * ra, Math.sin(a + 0.15 * step) * ra);
      g.lineTo(Math.cos(a + 0.3 * step) * rr, Math.sin(a + 0.3 * step) * rr);
      g.arc(0, 0, rr, a + 0.3 * step, a + 0.7 * step);
    }
    g.closePath();
    const fill = g.createRadialGradient(0, 0, rr * 0.2, 0, 0, ra);
    fill.addColorStop(0, "#1a2023");
    fill.addColorStop(1, METAL);
    g.fillStyle = fill;
    g.fill();
    g.strokeStyle = rgba(STEEL, 0.2);
    g.lineWidth = 1;
    g.stroke();

    // Rim, lightening holes and hub
    g.beginPath();
    g.arc(0, 0, rr - m * 1.2, 0, TAU);
    g.strokeStyle = rgba(STEEL, 0.1);
    g.stroke();
    if (teeth >= 18) {
      const holes = teeth >= 30 ? 6 : 5;
      const hr = rr * 0.19;
      g.save();
      g.globalCompositeOperation = "destination-out";
      for (let k = 0; k < holes; k++) {
        const a = (k * TAU) / holes;
        g.beginPath();
        g.arc(Math.cos(a) * rr * 0.56, Math.sin(a) * rr * 0.56, hr, 0, TAU);
        g.fill();
      }
      g.restore();
      g.strokeStyle = rgba(STEEL, 0.14);
      for (let k = 0; k < holes; k++) {
        const a = (k * TAU) / holes;
        g.beginPath();
        g.arc(Math.cos(a) * rr * 0.56, Math.sin(a) * rr * 0.56, hr, 0, TAU);
        g.stroke();
      }
    }
    g.beginPath();
    g.arc(0, 0, Math.max(4, rr * 0.24), 0, TAU);
    g.fillStyle = METAL_DARK;
    g.fill();
    g.strokeStyle = rgba(STEEL, 0.22);
    g.stroke();
    g.beginPath();
    g.arc(0, 0, Math.max(1.5, rr * 0.08), 0, TAU);
    g.fillStyle = "#0b0d0e";
    g.fill();
    return { canvas: c, size, rp, rr };
  }

  // Light comes from the upper left and does not rotate with the gear.
  function sheenSprite(r) {
    const [c, g] = offscreen(r * 2, r * 2);
    const grad = g.createRadialGradient(r * 0.6, r * 0.5, 0, r, r, r);
    grad.addColorStop(0, "rgba(220,235,240,0.07)");
    grad.addColorStop(0.6, "rgba(220,235,240,0.015)");
    grad.addColorStop(1, "rgba(220,235,240,0)");
    g.fillStyle = grad;
    g.beginPath();
    g.arc(r, r, r, 0, TAU);
    g.fill();
    return c;
  }

  // Gear B meshes with A at direction theta. Its phase follows A with the
  // tooth ratio, reversed, and starts half a tooth offset so the teeth interlock.
  function meshWith(a, teeth, theta, alpha = 1) {
    const dist = ((a.teeth + teeth) * a.m) / 2;
    return {
      teeth,
      m: a.m,
      x: a.x + Math.cos(theta) * dist,
      y: a.y + Math.sin(theta) * dist,
      alpha,
      drive: a,
      phase: (pa) => theta + Math.PI - Math.PI / teeth - (pa - theta) * (a.teeth / teeth),
    };
  }

  function buildGears(col) {
    const list = [];
    const add = (g) => (list.push(g), g);
    if (tier === "mobile") {
      const g1 = add({ teeth: 26, m: 2.2, x: W - 12, y: H * 0.8, alpha: 0.9, speed: 0.1 });
      add(meshWith(g1, 14, Math.PI + 0.65, 0.8));
      add({ teeth: 20, m: 2.2, x: -8, y: H * 0.2, alpha: 0.7, speed: -0.08 });
    } else {
      const m = tier === "desktop" ? 3.1 : 2.5;
      const gx = clamp(col.l * 0.3, 30, 120);
      const g1 = add({ teeth: 36, m, x: gx, y: H * 0.3, alpha: 1, speed: 0.11 });
      const g2 = add(meshWith(g1, 20, 0.85, 0.95));
      add(meshWith(g2, 13, -0.35, 0.85));
      add(meshWith(g1, 28, 2.15, 0.6));
      if (tier === "desktop") {
        const r1 = add({ teeth: 24, m: 2.6, x: W + 16, y: H * 0.66, alpha: 0.7, speed: -0.16 });
        add(meshWith(r1, 12, Math.PI - 0.35, 0.65));
      }
    }
    for (const g of list) {
      g.sprite = gearSprite(g.teeth, g.m);
      g.sheen = sheenSprite(g.sprite.rp);
      g.angle = 0;
    }
    return list;
  }

  function updateGears(gears, dt) {
    for (const g of gears) {
      if (g.drive) g.angle = g.phase(g.drive.angle);
      else g.angle += g.speed * (1 + gearBoost) * dt;
    }
  }

  function drawGears(gears) {
    for (const g of gears) {
      const { canvas: c, size, rp } = g.sprite;
      ctx.globalAlpha = g.alpha;
      ctx.save();
      ctx.translate(g.x, g.y);
      ctx.rotate(g.angle);
      ctx.drawImage(c, -size / 2, -size / 2, size, size);
      ctx.restore();
      ctx.drawImage(g.sheen, g.x - rp, g.y - rp, rp * 2, rp * 2);
    }
    ctx.globalAlpha = 1;
  }

  // ---------- Robotic arm ----------

  function buildArm(floorY) {
    const s = clamp(H / 900, 0.75, 1.05);
    const bx = W - 120 * s;
    const by = floorY;
    const arm = { s, bx, by, L1: 92 * s, L2: 78 * s, L3: 18 * s, F: 14 * s, block: 10 * s, flash: 0 };
    arm.S = [bx, by - 28 * s];

    // Inverse kinematics for the tool point with the gripper pointing straight down,
    // elbow-up solution.
    arm.ik = (tx, ty) => {
      const wx = tx;
      const wy = ty - (arm.L3 + arm.F * 0.6);
      const dx = wx - arm.S[0];
      const dy = arm.S[1] - wy;
      const D = Math.min(Math.hypot(dx, dy), arm.L1 + arm.L2 - 0.5);
      const c = clamp((D * D - arm.L1 ** 2 - arm.L2 ** 2) / (2 * arm.L1 * arm.L2), -1, 1);
      const a2 = -Math.acos(c);
      const a1 = Math.atan2(dx, dy) - Math.atan2(arm.L2 * Math.sin(a2), arm.L1 + arm.L2 * Math.cos(a2));
      return [a1, a2, Math.PI - (a1 + a2)];
    };

    const blockY = by - arm.block / 2;
    arm.spots = [bx - 150 * s, bx - 85 * s];
    arm.home = [bx - 60 * s, by - 150 * s];
    arm.blockPos = [arm.spots[0], blockY];
    arm.from = 0;
    arm.carry = false;

    arm.plan = () => {
      const [P, Q] = arm.from === 0 ? arm.spots : [arm.spots[1], arm.spots[0]];
      const up = blockY - 50 * s;
      arm.keys = [
        { p: arm.home, grip: 1, dur: 1.6, hold: 1 },
        { p: [P, up], grip: 1, dur: 1.8, hold: 0.3 },
        { p: [P, blockY], grip: 1, dur: 1.1, hold: 0.2 },
        { p: [P, blockY], grip: 0.3, dur: 0.6, hold: 0.3, on: () => (arm.carry = true) },
        { p: [P, up], grip: 0.3, dur: 1.1, hold: 0 },
        { p: [Q, up], grip: 0.3, dur: 1.8, hold: 0.2 },
        { p: [Q, blockY], grip: 0.3, dur: 1.1, hold: 0.2 },
        { p: [Q, blockY], grip: 1, dur: 0.6, hold: 0.3, on: () => ((arm.carry = false), (arm.blockPos = [Q, blockY])) },
        { p: [Q, up], grip: 1, dur: 1, hold: 0 },
        { p: arm.home, grip: 1, dur: 1.6, hold: range(1.5, 4) }, // occasional longer pause
      ].map((k) => ({ ...k, pose: arm.ik(k.p[0], k.p[1]) }));
      arm.k = 0;
      arm.t = 0;
    };

    arm.plan();
    arm.pose = [...arm.keys[0].pose];
    arm.prev = [...arm.pose];
    arm.grip = 1;
    arm.prevGrip = 1;
    return arm;
  }

  function updateArm(arm, dt) {
    arm.flash = Math.max(0, arm.flash - dt * 1.5);
    const key = arm.keys[arm.k];
    arm.t += dt;
    const e = easeInOut(clamp(arm.t / key.dur, 0, 1));
    for (let i = 0; i < 3; i++) arm.pose[i] = lerp(arm.prev[i], key.pose[i], e);
    arm.grip = lerp(arm.prevGrip, key.grip, e);
    if (arm.t >= key.dur && !key.done) {
      key.done = true;
      key.on?.();
    }
    if (arm.t >= key.dur + key.hold) {
      arm.prev = [...key.pose];
      arm.prevGrip = key.grip;
      arm.k++;
      arm.t = 0;
      if (arm.k >= arm.keys.length) {
        arm.from = 1 - arm.from;
        arm.plan();
      }
    }
  }

  function armPoints(arm) {
    const [a1, a2, a3] = arm.pose;
    const S = arm.S;
    const d1 = dir(a1);
    const E = [S[0] + d1[0] * arm.L1, S[1] + d1[1] * arm.L1];
    const d2 = dir(a1 + a2);
    const Wr = [E[0] + d2[0] * arm.L2, E[1] + d2[1] * arm.L2];
    const d3 = dir(a1 + a2 + a3);
    const T = [Wr[0] + d3[0] * arm.L3, Wr[1] + d3[1] * arm.L3];
    const tool = [T[0] + d3[0] * arm.F * 0.6, T[1] + d3[1] * arm.F * 0.6];
    return { S, E, Wr, T, d3, tool };
  }

  function link(a, b, w) {
    ctx.beginPath();
    ctx.moveTo(a[0], a[1]);
    ctx.lineTo(b[0], b[1]);
    ctx.lineWidth = w + 2;
    ctx.strokeStyle = rgba(STEEL, 0.2);
    ctx.stroke();
    ctx.lineWidth = w;
    ctx.strokeStyle = METAL;
    ctx.stroke();
    ctx.lineWidth = 1;
    ctx.strokeStyle = rgba(STEEL, 0.08);
    ctx.stroke();
  }

  function joint(p, r, led) {
    ctx.beginPath();
    ctx.arc(p[0], p[1], r, 0, TAU);
    ctx.fillStyle = METAL_DARK;
    ctx.fill();
    ctx.lineWidth = 1;
    ctx.strokeStyle = rgba(STEEL, 0.28);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(p[0], p[1], r * 0.32, 0, TAU);
    ctx.fillStyle = rgba(ACCENT, led);
    ctx.fill();
  }

  function drawArm(arm) {
    const { s, bx, by } = arm;
    const p = armPoints(arm);
    const led = 0.35 + arm.flash * 0.55;
    ctx.lineCap = "round";

    // Workpiece
    const b = arm.carry ? p.tool : arm.blockPos;
    const bs = arm.block;
    roundRect(ctx, b[0] - bs / 2, b[1] - bs / 2, bs, bs, 2);
    ctx.fillStyle = rgba(ACCENT, 0.08);
    ctx.fill();
    ctx.strokeStyle = rgba(ACCENT, 0.4);
    ctx.lineWidth = 1;
    ctx.stroke();

    // Pedestal
    ctx.beginPath();
    ctx.moveTo(bx - 26 * s, by);
    ctx.lineTo(bx - 15 * s, by - 22 * s);
    ctx.lineTo(bx + 15 * s, by - 22 * s);
    ctx.lineTo(bx + 26 * s, by);
    ctx.closePath();
    ctx.fillStyle = METAL;
    ctx.fill();
    ctx.strokeStyle = rgba(STEEL, 0.22);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(bx - 20 * s, by - 8 * s);
    ctx.lineTo(bx + 20 * s, by - 8 * s);
    ctx.strokeStyle = rgba(STEEL, 0.1);
    ctx.stroke();

    // Cable from the pedestal to the elbow
    ctx.beginPath();
    ctx.moveTo(bx + 12 * s, by - 18 * s);
    ctx.quadraticCurveTo(p.S[0] + 22 * s, (p.S[1] + p.E[1]) / 2, p.E[0] + 4 * s, p.E[1] + 4 * s);
    ctx.strokeStyle = rgba(STEEL, 0.1);
    ctx.lineWidth = 1.2;
    ctx.stroke();

    link(p.S, p.E, 11 * s);
    link(p.E, p.Wr, 8 * s);
    link(p.Wr, p.T, 5 * s);

    // Gripper: a cross bar and two fingers along the tool direction
    const n = [-p.d3[1], p.d3[0]];
    const open = (3 + 7 * arm.grip) * s;
    const bar = open + 3 * s;
    ctx.beginPath();
    ctx.moveTo(p.T[0] - n[0] * bar, p.T[1] - n[1] * bar);
    ctx.lineTo(p.T[0] + n[0] * bar, p.T[1] + n[1] * bar);
    for (const side of [-1, 1]) {
      const fx = p.T[0] + n[0] * open * side;
      const fy = p.T[1] + n[1] * open * side;
      ctx.moveTo(fx, fy);
      ctx.lineTo(fx + p.d3[0] * arm.F, fy + p.d3[1] * arm.F);
    }
    ctx.lineWidth = 2.5 * s;
    ctx.strokeStyle = rgba(STEEL, 0.32);
    ctx.stroke();

    joint(p.S, 7 * s, led);
    joint(p.E, 6 * s, led);
    joint(p.Wr, 4.5 * s, led);
  }

  // ---------- Rover ----------

  function buildRover(floorY, minX, maxX) {
    return { x: lerp(minX, maxX, 0.35), y: floorY, minX, maxX, dir: 1, face: 1, state: "move", timer: range(3, 6), turnT: 0, wheel: 0, scan: 0, speed: 15 };
  }

  function updateRover(r, dt) {
    r.timer -= dt;
    if (r.state === "move") {
      r.x += r.dir * r.speed * dt;
      r.wheel += (r.dir * r.speed * dt) / 5;
      const atEdge = r.x <= r.minX || r.x >= r.maxX;
      if (atEdge) r.x = clamp(r.x, r.minX, r.maxX);
      if (r.timer <= 0 || atEdge) {
        r.state = "stop";
        r.timer = range(1.2, 3);
        r.mustTurn = atEdge;
      }
    } else if (r.state === "stop") {
      r.scan += dt;
      if (r.timer <= 0) {
        if (r.mustTurn || rand() < 0.4) {
          r.state = "turn";
          r.turnT = 0;
        } else {
          r.state = "move";
          r.timer = range(2.5, 6);
        }
      }
    } else {
      r.turnT += dt / 0.9;
      r.face = r.dir * Math.cos(Math.PI * clamp(r.turnT, 0, 1));
      if (r.turnT >= 1) {
        r.dir = -r.dir;
        r.face = r.dir;
        r.state = "move";
        r.timer = range(3, 7);
      }
    }
  }

  function drawRover(r) {
    ctx.save();
    ctx.translate(r.x, r.y);
    ctx.scale(r.face || 0.001, 1);
    ctx.lineWidth = 1;

    // Scanning beam while stopped
    if (r.state === "stop") {
      ctx.beginPath();
      ctx.moveTo(9, -24);
      ctx.lineTo(48, -30);
      ctx.lineTo(48, -10);
      ctx.closePath();
      ctx.fillStyle = rgba(ACCENT, 0.04 + 0.03 * Math.sin(r.scan * 5));
      ctx.fill();
    }
    roundRect(ctx, -16, -18, 32, 11, 3);
    ctx.fillStyle = METAL;
    ctx.fill();
    ctx.strokeStyle = rgba(STEEL, 0.28);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(-11, -14);
    ctx.lineTo(4, -14);
    ctx.strokeStyle = rgba(STEEL, 0.12);
    ctx.stroke();

    // Sensor mast
    ctx.beginPath();
    ctx.moveTo(8, -18);
    ctx.lineTo(8, -24);
    ctx.strokeStyle = rgba(STEEL, 0.3);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(9, -24, 2, 0, TAU);
    ctx.fillStyle = rgba(ACCENT, r.state === "stop" ? 0.75 : 0.45);
    ctx.fill();

    for (const wx of [-10, 10]) {
      ctx.beginPath();
      ctx.arc(wx, -5, 5, 0, TAU);
      ctx.fillStyle = METAL_DARK;
      ctx.fill();
      ctx.strokeStyle = rgba(STEEL, 0.3);
      ctx.stroke();
      const c = Math.cos(r.wheel) * 3.5;
      const s = Math.sin(r.wheel) * 3.5;
      ctx.beginPath();
      ctx.moveTo(wx - c, -5 - s);
      ctx.lineTo(wx + c, -5 + s);
      ctx.moveTo(wx + s, -5 - c);
      ctx.lineTo(wx - s, -5 + c);
      ctx.strokeStyle = rgba(STEEL, 0.2);
      ctx.stroke();
    }
    ctx.restore();
  }

  // ---------- Drone ----------

  function buildDrone(zone, top) {
    const d = { zone, top, x: lerp(zone.l, zone.r, 0.5), y: lerp(zone.t, zone.b, 0.4), vx: 0, hold: 2, spin: 0, blink: 0 };
    d.from = [d.x, d.y];
    d.to = [d.x, d.y];
    d.t = 1;
    d.dur = 1;
    return d;
  }

  function nextWaypoint(d) {
    // Mostly hover around its own zone; now and then drift along the top band.
    if (d.top && rand() < 0.15) return [range(d.top.l, d.top.r), range(d.top.t, d.top.b)];
    return [range(d.zone.l, d.zone.r), range(d.zone.t, d.zone.b)];
  }

  function updateDrone(d, dt) {
    d.spin += dt * 38;
    d.blink += dt;
    const px = d.x;
    if (d.t < 1) {
      d.t = Math.min(1, d.t + dt / d.dur);
      const e = easeSine(d.t);
      d.bx = lerp(d.from[0], d.to[0], e);
      d.by = lerp(d.from[1], d.to[1], e);
      if (d.t >= 1) d.hold = range(2, 5);
    } else {
      d.hold -= dt;
      if (d.hold <= 0) {
        d.from = [d.bx ?? d.x, d.by ?? d.y];
        d.to = nextWaypoint(d);
        d.dur = Math.max(3.5, Math.hypot(d.to[0] - d.from[0], d.to[1] - d.from[1]) / 20);
        d.t = 0;
      }
    }
    d.bx ??= d.x;
    d.by ??= d.y;
    d.x = d.bx + Math.sin(clock * 0.7) * 2.5;
    d.y = d.by + Math.sin(clock * 1.3) * 3;
    d.vx = lerp(d.vx, (d.x - px) / Math.max(dt, 1e-3), 0.1);
  }

  function drawDrone(d) {
    ctx.save();
    ctx.translate(d.x, d.y);
    ctx.rotate(clamp(d.vx * 0.012, -0.16, 0.16));
    ctx.lineWidth = 1;

    if (d.t >= 1) {
      ctx.beginPath();
      ctx.moveTo(-3, 4);
      ctx.lineTo(3, 4);
      ctx.lineTo(12, 40);
      ctx.lineTo(-12, 40);
      ctx.closePath();
      const beam = ctx.createLinearGradient(0, 4, 0, 40);
      beam.addColorStop(0, rgba(ACCENT, 0.07));
      beam.addColorStop(1, rgba(ACCENT, 0));
      ctx.fillStyle = beam;
      ctx.fill();
    }

    ctx.beginPath();
    ctx.moveTo(-19, -1);
    ctx.lineTo(19, -1);
    ctx.strokeStyle = rgba(STEEL, 0.3);
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.lineWidth = 1;
    roundRect(ctx, -8, -5, 16, 9, 3);
    ctx.fillStyle = METAL;
    ctx.fill();
    ctx.strokeStyle = rgba(STEEL, 0.3);
    ctx.stroke();

    for (const rx of [-19, 19]) {
      ctx.beginPath();
      ctx.moveTo(rx, -1);
      ctx.lineTo(rx, -5);
      ctx.strokeStyle = rgba(STEEL, 0.3);
      ctx.stroke();
      ctx.beginPath();
      ctx.ellipse(rx, -5, 10, 1.8, 0, 0, TAU);
      ctx.fillStyle = rgba(STEEL, 0.06);
      ctx.fill();
      const a = Math.cos(d.spin + rx) * 10;
      const b = Math.sin(d.spin + rx) * 10;
      ctx.beginPath();
      ctx.moveTo(rx - a, -5);
      ctx.lineTo(rx + a, -5);
      ctx.moveTo(rx - b, -5);
      ctx.lineTo(rx + b, -5);
      ctx.strokeStyle = rgba(STEEL, 0.22);
      ctx.stroke();
    }

    ctx.beginPath();
    ctx.arc(0, 4.5, 1.8, 0, TAU);
    ctx.fillStyle = rgba(STEEL, 0.35);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(5, -1, 1.2, 0, TAU);
    ctx.fillStyle = rgba(ACCENT, d.blink % 1.4 < 0.15 ? 0.9 : 0.3);
    ctx.fill();
    ctx.restore();
  }

  // ---------- Circuit: sensors → controller → processing → output ----------

  function chip(x, y, size, label, labelSide) {
    return { x, y, size, label, labelSide, glow: 0 };
  }

  function buildCircuit(col, floorY, arm) {
    const traces = [];
    const chips = [];
    const sensors = [];
    const labels = [];
    const vias = [];
    const c = { traces, chips, sensors, labels, vias, pulses: [], queue: [], timer: 1.5 };

    // Decorative edge traces with vias
    const edge = (side, y0, len, inset) => {
      const x0 = side < 0 ? -4 : W + 4;
      const xi = side < 0 ? inset : W - inset;
      const jog = side < 0 ? 10 : -10;
      const raw = [
        [x0, y0],
        [xi, y0],
        [xi, y0 + len * 0.5],
        [xi + jog, y0 + len * 0.5 + 10],
        [xi + jog, y0 + len],
      ];
      const p = makePath(raw, { speed: range(35, 60), every: range(5, 11), next: range(1, 8) });
      traces.push(p);
      vias.push(raw[raw.length - 1]);
    };

    if (tier === "mobile") {
      edge(-1, H * 0.34, 90, 12);
      edge(-1, H * 0.52, 70, 22);
      edge(1, H * 0.14, 80, 14);
      edge(1, H * 0.42, 110, 24);
      return c;
    }

    edge(-1, H * 0.08 + 64, 70, 26);
    edge(1, H * 0.52, 60, 16);
    edge(1, H * 0.06 + 64, 50, 22);

    // Controller near the lower left, fed by three sensors on the left edge
    const mx = clamp(col.l * 0.45, 90, 150);
    const my = H * 0.72;
    const mcu = chip(mx, my, 34, "CTRL", true);
    chips.push(mcu);
    labels.push(["SENSORS", 12, H * 0.56 - 16]);
    c.sensorPaths = [];
    for (let i = 0; i < 3; i++) {
      const sy = H * 0.56 + i * 26;
      sensors.push([14, sy]);
      const x1 = mx - 30 - (2 - i) * 7;
      const y2 = my - 8 + i * 8;
      const p = makePath([[26, sy], [x1, sy], [x1, y2], [mx - 17, y2]], { speed: 70 });
      traces.push(p);
      c.sensorPaths.push(p);
    }

    // Processing chip on the right, linked to the controller by a bus along the bottom
    const px = W - 60;
    const py = H * 0.46;
    const proc = chip(px, py, 34, "PROC", false);
    chips.push(proc);
    const busY = H - 14;
    c.bus = makePath([[mx, my + 17], [mx, busY], [W - 22, busY], [W - 22, py], [px + 17, py]], { speed: 190 });
    traces.push(c.bus);

    // Output: to the arm's controller, or to a pad where the arm would stand
    const outX = arm ? arm.bx + 24 * arm.s : W - 130;
    const outY = arm ? floorY - 10 : floorY - 16;
    const outPts = [[px - 17, py + 6], [outX, py + 6], [outX, outY]];
    if (arm) outPts.push([outX - 8, outY]);
    c.out = makePath(outPts, { speed: 80 });
    traces.push(c.out);
    if (!arm) vias.push([outX, outY]);
    labels.push(["OUT", outX + 6, arm ? floorY - 30 : outY - 8]);

    c.mcu = mcu;
    c.proc = proc;
    return c;
  }

  function renderChip(g, ch) {
    const h = ch.size / 2;
    g.strokeStyle = rgba(STEEL, 0.18);
    g.lineWidth = 1;
    for (let k = -3; k <= 3; k++) {
      const o = k * (ch.size / 8);
      g.beginPath();
      g.moveTo(ch.x - h - 4, ch.y + o);
      g.lineTo(ch.x + h + 4, ch.y + o);
      g.moveTo(ch.x + o, ch.y - h - 4);
      g.lineTo(ch.x + o, ch.y + h + 4);
      g.stroke();
    }
    roundRect(g, ch.x - h, ch.y - h, ch.size, ch.size, 3);
    g.fillStyle = "#101416";
    g.fill();
    g.strokeStyle = rgba(STEEL, 0.24);
    g.stroke();
    g.beginPath();
    g.arc(ch.x - h + 6, ch.y - h + 6, 1.6, 0, TAU);
    g.fillStyle = rgba(STEEL, 0.25);
    g.fill();
    g.fillStyle = rgba(STEEL, 0.3);
    g.font = '500 9px "JetBrains Mono", ui-monospace, monospace';
    // Beside the chip when traces leave from above and below, otherwise above it
    g.textAlign = ch.labelSide ? "left" : "center";
    g.fillText(ch.label, ch.labelSide ? ch.x + h + 9 : ch.x, ch.labelSide ? ch.y + 3 : ch.y - h - 9);
  }

  function renderStatic() {
    const g = sctx;
    staticCanvas.width = Math.round(W * dpr);
    staticCanvas.height = Math.round(H * dpr);
    g.setTransform(dpr, 0, 0, dpr, 0, 0);

    // Dot texture
    g.fillStyle = rgba(STEEL, 0.045);
    for (let y = 16; y < H; y += 32) for (let x = 16; x < W; x += 32) g.fillRect(x, y, 1, 1);

    // Ambient light pools
    const glow = (x, y, r, a) => {
      const grad = g.createRadialGradient(x, y, 0, x, y, r);
      grad.addColorStop(0, rgba(ACCENT, a));
      grad.addColorStop(1, rgba(ACCENT, 0));
      g.fillStyle = grad;
      g.fillRect(x - r, y - r, r * 2, r * 2);
    };
    if (scene.gears[0]) glow(scene.gears[0].x, scene.gears[0].y, 220, tier === "mobile" ? 0.025 : 0.035);
    if (scene.arm) glow(scene.arm.bx - 80, scene.arm.by - 60, 260, 0.04);

    // Floor with ticks
    if (scene.floorY) {
      g.strokeStyle = rgba(STEEL, 0.07);
      g.lineWidth = 1;
      g.beginPath();
      g.moveTo(0, scene.floorY + 0.5);
      g.lineTo(W, scene.floorY + 0.5);
      g.stroke();
      g.strokeStyle = rgba(STEEL, 0.045);
      g.beginPath();
      for (let x = 12; x < W; x += 24) {
        g.moveTo(x + 0.5, scene.floorY + 1);
        g.lineTo(x + 0.5, scene.floorY + 5);
      }
      g.stroke();
    }

    // Traces, vias, sensors, chips, labels
    const cir = scene.circuit;
    g.lineJoin = "round";
    g.lineCap = "round";
    g.strokeStyle = rgba(STEEL, 0.11);
    g.lineWidth = 1.2;
    for (const t of cir.traces) {
      g.beginPath();
      t.pts.forEach(([x, y], i) => (i ? g.lineTo(x, y) : g.moveTo(x, y)));
      g.stroke();
    }
    g.strokeStyle = rgba(STEEL, 0.2);
    for (const [x, y] of cir.vias) {
      g.beginPath();
      g.arc(x, y, 2.6, 0, TAU);
      g.stroke();
    }
    for (const [x, y] of cir.sensors) {
      roundRect(g, x - 6, y - 4, 12, 8, 2);
      g.fillStyle = "#101416";
      g.fill();
      g.strokeStyle = rgba(STEEL, 0.24);
      g.stroke();
      g.beginPath();
      g.arc(x, y, 1.6, 0, TAU);
      g.fillStyle = rgba(ACCENT, 0.35);
      g.fill();
    }
    for (const ch of cir.chips) renderChip(g, ch);
    g.fillStyle = rgba(STEEL, 0.28);
    g.font = '500 9px "JetBrains Mono", ui-monospace, monospace';
    g.textAlign = "left";
    for (const [t, x, y] of cir.labels) g.fillText(t, x, y);
  }

  function spawn(path, speed = path.speed) {
    scene.circuit.pulses.push({ path, s: 0, speed });
  }

  function updateCircuit(c, dt) {
    if (c.sensorPaths) {
      c.timer -= dt;
      if (c.timer <= 0) {
        c.timer = range(1.8, 3.4);
        spawn(c.sensorPaths[Math.floor(rand() * c.sensorPaths.length)]);
      }
    }
    for (const t of c.traces) {
      if (t.every === undefined) continue;
      t.next -= dt;
      if (t.next <= 0) {
        t.next = t.every + range(0, 4);
        spawn(t);
      }
    }
    for (const q of c.queue) q.at -= dt;
    while (c.queue.length && c.queue[0].at <= 0) c.queue.shift().fn();

    for (const ch of c.chips) ch.glow = Math.max(0, ch.glow - dt * 1.2);
    c.pulses = c.pulses.filter((p) => {
      p.s += p.speed * dt;
      if (p.s < p.path.total) return true;
      // Hand the signal on to the next stage
      if (c.sensorPaths?.includes(p.path)) {
        c.mcu.glow = 1;
        c.queue.push({ at: 0.3, fn: () => spawn(c.bus) });
      } else if (p.path === c.bus) {
        c.proc.glow = 1;
        c.queue.push({ at: 0.4, fn: () => spawn(c.out) });
      } else if (p.path === c.out && scene.arm) {
        scene.arm.flash = 1;
      }
      return false;
    });
  }

  function drawCircuit(c, ox, oy) {
    for (const ch of c.chips) {
      if (ch.glow <= 0) continue;
      const h = ch.size / 2;
      roundRect(ctx, ch.x - h, ch.y - h, ch.size, ch.size, 3);
      ctx.strokeStyle = rgba(ACCENT, 0.45 * ch.glow);
      ctx.lineWidth = 1;
      ctx.stroke();
      ctx.fillStyle = rgba(ACCENT, 0.06 * ch.glow);
      ctx.fill();
    }
    ctx.lineCap = "round";
    for (const p of c.pulses) {
      const head = pointAt(p.path, p.s);
      const near = Math.hypot(head[0] + ox - mouse.px, head[1] + oy - mouse.py) < 140 ? 1 : 0;
      const tail = 28;
      ctx.beginPath();
      for (let k = 0; k <= 4; k++) {
        const q = pointAt(p.path, p.s - (tail * k) / 4);
        k ? ctx.lineTo(q[0], q[1]) : ctx.moveTo(q[0], q[1]);
      }
      ctx.strokeStyle = rgba(ACCENT, 0.28 + near * 0.2);
      ctx.lineWidth = 1.4;
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(head[0], head[1], 4 + near * 2, 0, TAU);
      ctx.fillStyle = rgba(ACCENT, 0.1 + near * 0.08);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(head[0], head[1], 1.6, 0, TAU);
      ctx.fillStyle = rgba(ACCENT, 0.85);
      ctx.fill();
    }
  }

  // ---------- Particles ----------

  function buildParticles(n) {
    return Array.from({ length: n }, () => ({
      x: rand() * W,
      y: rand() * H,
      vy: -range(2, 6),
      ph: rand() * TAU,
      r: range(0.5, 1.5),
      a: range(0.08, 0.3),
      accent: rand() < 0.3,
      ox: 0,
      oy: 0,
    }));
  }

  function updateParticles(list, dt, shift) {
    for (const p of list) {
      p.y += p.vy * dt;
      p.x += Math.sin(clock * 0.3 + p.ph) * 3 * dt;
      if (p.y < -4) {
        p.y = H + 4;
        p.x = rand() * W;
      }
      // Ease away from the cursor a little, then drift back
      const dx = p.x + shift[0] - mouse.px;
      const dy = p.y + shift[1] - mouse.py;
      const d = Math.hypot(dx, dy);
      const push = d < 110 ? (1 - d / 110) * 14 : 0;
      const tx = push ? (dx / d) * push : 0;
      const ty = push ? (dy / d) * push : 0;
      p.ox += (tx - p.ox) * Math.min(1, dt * 3);
      p.oy += (ty - p.oy) * Math.min(1, dt * 3);
    }
  }

  function drawParticles(list) {
    for (const p of list) {
      ctx.fillStyle = rgba(p.accent ? ACCENT : STEEL, p.a);
      ctx.fillRect(p.x + p.ox - p.r / 2, p.y + p.oy - p.r / 2, p.r, p.r);
    }
  }

  // ---------- Keeping the content clear ----------

  // Static mask: full strength in the side gutters, faded across the content column.
  function setColumnMask(col) {
    const k = tier === "mobile" ? 0.35 : tier === "tablet" ? 0.5 : 0.6;
    const dim = `rgba(0,0,0,${1 - k})`;
    const r = (v) => `${Math.round(v)}px`;
    const mask = `linear-gradient(to right, #000 ${r(col.l - 90)}, ${dim} ${r(col.l + 60)}, ${dim} ${r(col.r - 60)}, #000 ${r(col.r + 90)})`;
    wrap.style.webkitMaskImage = mask;
    wrap.style.maskImage = mask;
  }

  // Zones in hero coordinates; they only move when the layout changes.
  function readZones() {
    const o = wrap.getBoundingClientRect();
    zones = [];
    for (const el of hero.querySelectorAll(QUIET)) {
      const r = el.getBoundingClientRect();
      if (r.width) zones.push({ left: r.left - o.left, top: r.top - o.top, width: r.width, height: r.height });
    }
    zonesDirty = false;
  }

  function clearContent() {
    ctx.globalCompositeOperation = "destination-out";
    // Three stacked soft rectangles give a feathered edge without a blur filter.
    for (const r of zones) {
      for (const [pad, a] of [[44, 0.3], [22, 0.45], [4, 0.6]]) {
        roundRect(ctx, r.left - pad, r.top - pad, r.width + pad * 2, r.height + pad * 2, pad + 8);
        ctx.fillStyle = `rgba(0,0,0,${a})`;
        ctx.fill();
      }
    }
    ctx.globalCompositeOperation = "source-over";
  }

  // ---------- Layout ----------

  function layout() {
    const w = wrap.clientWidth;
    const h = wrap.clientHeight;
    if (!w || !h) return false;
    W = w;
    H = h;
    tier = W < 768 ? "mobile" : W < 1200 ? "tablet" : "desktop";
    dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    canvas.width = Math.round(W * dpr);
    canvas.height = Math.round(H * dpr);
    rand = seeded(1729);

    const gutter = parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--gutter")) || 24;
    const cw = Math.min(W, 1160);
    const col = { l: (W - cw) / 2 + gutter, r: (W + cw) / 2 - gutter };

    scene = { col, floorY: tier === "mobile" ? 0 : H - 34 };
    scene.gears = buildGears(col);
    scene.arm = tier === "desktop" ? buildArm(scene.floorY) : null;
    scene.rover = tier === "mobile" ? null : buildRover(scene.floorY, 24, Math.min(W * 0.45, W - 320));
    if (tier !== "mobile") {
      const gr = W - col.r;
      const zone = gr > 110 ? { l: col.r + 40, r: W - 40 } : { l: W * 0.84, r: W - 40 };
      zone.t = Math.max(H * 0.1, 30);
      zone.b = Math.max(zone.t + 40, H * 0.34);
      const top = { l: W * 0.55, r: W * 0.8, t: 28, b: 60 };
      scene.drone = buildDrone(zone, tier === "desktop" ? top : null);
    }
    scene.circuit = buildCircuit(col, scene.floorY, scene.arm);
    scene.particles = buildParticles(tier === "mobile" ? 16 : tier === "tablet" ? 28 : 46);
    renderStatic();
    setColumnMask(col);
    rand = Math.random; // seeded layout, live behaviour varies
    zonesDirty = true;
    return true;
  }

  // ---------- Frame ----------

  function update(dt) {
    clock += dt;
    mouse.x += (mouse.tx - mouse.x) * Math.min(1, dt * 2);
    mouse.y += (mouse.ty - mouse.y) * Math.min(1, dt * 2);
    gearBoost *= Math.exp(-dt * 1.5);
    updateGears(scene.gears, dt);
    if (scene.arm) updateArm(scene.arm, dt);
    if (scene.rover) updateRover(scene.rover, dt);
    if (scene.drone) updateDrone(scene.drone, dt);
    updateCircuit(scene.circuit, dt);
    updateParticles(scene.particles, dt, [-mouse.x * 12, -mouse.y * 12]);
  }

  function draw() {
    if (zonesDirty) readZones();
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, W, H);
    const layer = (depth, fn) => {
      ctx.save();
      ctx.translate(-mouse.x * depth, -mouse.y * depth);
      fn();
      ctx.restore();
    };
    const shift = `translate3d(${(-mouse.x * 3).toFixed(1)}px,${(-mouse.y * 3).toFixed(1)}px,0)`;
    if (shift !== staticShift) staticCanvas.style.transform = staticShift = shift;
    layer(3, () => drawCircuit(scene.circuit, -mouse.x * 3, -mouse.y * 3));
    layer(5, () => drawGears(scene.gears));
    layer(8, () => {
      if (scene.rover) drawRover(scene.rover);
      if (scene.arm) drawArm(scene.arm);
      if (scene.drone) drawDrone(scene.drone);
    });
    layer(12, () => drawParticles(scene.particles));
    clearContent();
  }

  function frame(now) {
    raf = requestAnimationFrame(frame);
    const fps = tier === "mobile" ? 24 : 30;
    if (now - last < 1000 / fps - 2) return;
    const dt = Math.min((now - last) / 1000, 0.1);
    last = now;
    if (document.documentElement.classList.contains("is-locked")) return; // a dialog covers the page
    update(dt);
    draw();
  }

  // A representative still frame: arm mid-reach, drone hovering, no pulses.
  function drawStill() {
    if (!scene) return;
    if (scene.arm) {
      const k = scene.arm.keys[2];
      scene.arm.pose = [...k.pose];
    }
    mouse.x = mouse.y = 0;
    draw();
  }

  let visible = true;

  function stop() {
    running = false;
    cancelAnimationFrame(raf);
  }

  function start() {
    if (!scene && !layout()) return;
    if (reduceMQ.matches) {
      stop();
      drawStill();
    } else if (!visible) {
      stop();
    } else if (!running) {
      running = true;
      last = performance.now();
      raf = requestAnimationFrame(frame);
    }
  }

  // ---------- Events ----------

  // Nothing runs while the hero is scrolled out of view.
  new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting;
    start();
  }).observe(wrap);

  let resizeTimer = 0;
  new ResizeObserver(() => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      if (wrap.clientWidth === W && wrap.clientHeight === H) return;
      if (layout() && !running) drawStill();
    }, 150);
  }).observe(wrap);

  window.addEventListener(
    "scroll",
    () => {
      const y = window.scrollY;
      if (running) gearBoost = Math.min(gearBoost + Math.abs(y - lastScrollY) * 0.0015, 1.2);
      lastScrollY = y;
    },
    { passive: true }
  );

  window.addEventListener(
    "pointermove",
    (e) => {
      if (e.pointerType !== "mouse" || !running) return;
      const o = wrap.getBoundingClientRect();
      mouse.px = e.clientX - o.left;
      mouse.py = e.clientY - o.top;
      mouse.tx = clamp((mouse.px / W) * 2 - 1, -1, 1);
      mouse.ty = clamp((mouse.py / H) * 2 - 1, -1, 1);
    },
    { passive: true }
  );
  document.documentElement.addEventListener("pointerleave", () => {
    mouse.tx = mouse.ty = 0;
    mouse.px = mouse.py = -1e4;
  });

  // Reveal animations and late-loading fonts can shift the hero text.
  setInterval(() => (zonesDirty = true), 1000);

  reduceMQ.addEventListener?.("change", start);
  // Chip labels use the mono web font; repaint the static layer once it is ready.
  document.fonts?.ready.then(() => {
    if (!scene) return;
    renderStatic();
    zonesDirty = true;
    if (!running) drawStill();
  });
  start();
})();
