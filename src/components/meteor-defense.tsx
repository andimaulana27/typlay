"use client";

import { useEffect, useRef, useState } from "react";
import { readBest, writeBest } from "@/lib/best";
import { accuracyPercent, multiplierFor, rankFor, wordsPerMinute } from "@/lib/drills";
import { sfx } from "@/lib/sfx";
import { meteorWord } from "@/lib/words";

type Phase = "idle" | "playing" | "paused" | "over";

type Enemy = {
  id: number;
  word: string;
  typed: number;
  x: number;
  y: number;
  speed: number;
  r: number;
  angle: number;
  spin: number;
  verts: number[];
  color: string;
  flash: number;
  doomed: boolean;
  value: number;
  boss: boolean;
};

type Bullet = { x: number; y: number; px: number; py: number; enemy: number; last: boolean };

type Particle = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  max: number;
  size: number;
  color: string;
  ring?: number;
  text?: string;
};

type World = {
  w: number;
  h: number;
  enemies: Enemy[];
  bullets: Bullet[];
  particles: Particle[];
  stars: { x: number; y: number; z: number }[];
  target: number | null;
  shipAngle: number;
  shipKick: number;
  shipFlash: number;
  score: number;
  combo: number;
  bestCombo: number;
  lives: number;
  wave: number;
  toSpawn: number;
  spawnTimer: number;
  bossPending: boolean;
  emp: number;
  shake: number;
  keys: number;
  correct: number;
  kills: number;
  playMs: number;
  banner: { text: string; sub: string; t: number } | null;
  nextId: number;
};

type Summary = {
  score: number;
  wave: number;
  kills: number;
  wpm: number;
  accuracy: number;
  bestCombo: number;
  best: number;
  newBest: boolean;
};

const COLORS = ["#ff5fa2", "#ffc53d", "#22d3a0", "#38b6ff", "#ff8a3d"];
const INK = "#1d1b3a";
const BEST_KEY = "meteor";
const MAX_LIVES = 3;

function makeStars(w: number, h: number) {
  return Array.from({ length: 140 }, () => ({ x: Math.random() * w, y: Math.random() * h, z: Math.random() }));
}

function newWorld(w: number, h: number): World {
  return {
    w,
    h,
    enemies: [],
    bullets: [],
    particles: [],
    stars: makeStars(w, h),
    target: null,
    shipAngle: 0,
    shipKick: 0,
    shipFlash: 0,
    score: 0,
    combo: 0,
    bestCombo: 0,
    lives: MAX_LIVES,
    wave: 1,
    toSpawn: waveSize(1),
    spawnTimer: 0.6,
    bossPending: false,
    emp: 1,
    shake: 0,
    keys: 0,
    correct: 0,
    kills: 0,
    playMs: 0,
    banner: { text: "Wave 1", sub: "type the words to shoot", t: 0 },
    nextId: 1,
  };
}

function waveSize(wave: number) {
  return 5 + wave * 2;
}

function ship(world: World) {
  return { x: world.w / 2, y: world.h - 54 };
}

function spawn(world: World, boss = false) {
  const taken = new Set(world.enemies.filter((enemy) => !enemy.doomed).map((enemy) => enemy.word[0]));
  const word = meteorWord(world.wave, taken, boss);
  const r = boss ? 34 : 13 + Math.min(word.length, 10) * 1.5;
  const scale = world.h / 600;
  const base = (30 + world.wave * 5.5) * scale * (boss ? 0.55 : 1.15 - Math.min(word.length, 10) * 0.035);
  const verts = Array.from({ length: boss ? 13 : 9 }, () => 0.72 + Math.random() * 0.36);
  world.enemies.push({
    id: world.nextId++,
    word,
    typed: 0,
    x: 50 + Math.random() * (world.w - 100),
    y: -r - 8,
    speed: base * (0.85 + Math.random() * 0.3),
    r,
    angle: Math.random() * Math.PI,
    spin: (Math.random() - 0.5) * (boss ? 0.6 : 1.8),
    verts,
    color: boss ? "#7b5cff" : (COLORS[Math.floor(Math.random() * COLORS.length)] ?? "#ff5fa2"),
    flash: 0,
    doomed: false,
    value: 0,
    boss,
  });
}

function sparks(world: World, x: number, y: number, color: string, count: number, speed: number) {
  for (let index = 0; index < count; index += 1) {
    const angle = Math.random() * Math.PI * 2;
    const velocity = speed * (0.3 + Math.random() * 0.8);
    const max = 0.4 + Math.random() * 0.6;
    world.particles.push({
      x,
      y,
      vx: Math.cos(angle) * velocity,
      vy: Math.sin(angle) * velocity,
      life: max,
      max,
      size: 1.5 + Math.random() * 2.5,
      color: Math.random() < 0.3 ? "#ffffff" : color,
    });
  }
}

function ring(world: World, x: number, y: number, color: string, radius: number, life = 0.5) {
  world.particles.push({ x, y, vx: 0, vy: 0, life, max: life, size: 3, color, ring: radius });
}

function floatText(world: World, x: number, y: number, text: string, color: string) {
  world.particles.push({ x, y, vx: 0, vy: -50, life: 0.9, max: 0.9, size: 0, color, text });
}

export function MeteorDefense() {
  const wrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const worldRef = useRef<World | null>(null);
  const phaseRef = useRef<Phase>("idle");
  const [phase, setPhaseState] = useState<Phase>("idle");
  const [summary, setSummary] = useState<Summary | null>(null);
  const [best, setBest] = useState(0);

  function setPhase(next: Phase) {
    phaseRef.current = next;
    setPhaseState(next);
  }

  useEffect(() => {
    setBest(readBest(BEST_KEY));
  }, []);

  function start() {
    const world = worldRef.current;
    if (!world) return;
    worldRef.current = { ...newWorld(world.w, world.h), stars: world.stars };
    setSummary(null);
    setPhase("playing");
    sfx.start();
    inputRef.current?.focus({ preventScroll: true });
    wrapRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
  }

  function gameOver(world: World) {
    const previous = readBest(BEST_KEY);
    const newBest = world.score > previous;
    if (newBest) writeBest(BEST_KEY, world.score);
    setBest(Math.max(previous, world.score));
    setSummary({
      score: world.score,
      wave: world.wave,
      kills: world.kills,
      wpm: wordsPerMinute(world.correct, world.playMs),
      accuracy: accuracyPercent(world.correct, world.keys),
      bestCombo: world.bestCombo,
      best: Math.max(previous, world.score),
      newBest,
    });
    setPhase("over");
  }

  function explode(world: World, enemy: Enemy) {
    world.enemies = world.enemies.filter((item) => item.id !== enemy.id);
    world.kills += 1;
    world.score += enemy.value;
    world.shake = Math.min(16, world.shake + (enemy.boss ? 12 : 4));
    sparks(world, enemy.x, enemy.y, enemy.color, enemy.boss ? 70 : 28, enemy.boss ? 420 : 260);
    ring(world, enemy.x, enemy.y, enemy.color, enemy.r * 2.6);
    floatText(world, enemy.x, enemy.y - enemy.r, `+${enemy.value}`, enemy.color);
    sfx.boom();
  }

  function hitShip(world: World, enemy: Enemy) {
    const s = ship(world);
    world.enemies = world.enemies.filter((item) => item.id !== enemy.id);
    if (world.target === enemy.id) world.target = null;
    world.lives -= enemy.boss ? 2 : 1;
    world.combo = 0;
    world.shake = 22;
    world.shipFlash = 1;
    sparks(world, s.x, s.y, "#ff5a5f", 60, 380);
    ring(world, s.x, s.y, "#ff5a5f", 140, 0.7);
    sfx.hurt();
    if (world.lives <= 0) {
      world.lives = 0;
      sparks(world, s.x, s.y, "#ff8a3d", 120, 520);
      gameOver(world);
    }
  }

  function fireEmp(world: World) {
    if (world.emp <= 0) return;
    world.emp -= 1;
    world.target = null;
    const s = ship(world);
    ring(world, s.x, s.y, "#38b6ff", Math.hypot(world.w, world.h), 0.9);
    world.shake = 14;
    sfx.emp();
    for (const enemy of [...world.enemies]) {
      if (enemy.doomed) continue;
      enemy.value = Math.round(enemy.word.length * 5);
      explode(world, enemy);
    }
  }

  function typeKey(key: string) {
    const world = worldRef.current;
    if (!world || phaseRef.current !== "playing") return;
    world.keys += 1;
    let enemy = world.enemies.find((item) => item.id === world.target && !item.doomed);
    if (!enemy) {
      const candidates = world.enemies.filter((item) => !item.doomed && item.typed === 0 && item.word[0] === key);
      enemy = candidates.sort((a, b) => b.y - a.y)[0];
      if (enemy) world.target = enemy.id;
    }
    const s = ship(world);
    if (!enemy || enemy.word[enemy.typed] !== key) {
      world.combo = 0;
      world.shipFlash = 0.6;
      world.shake = Math.max(world.shake, 3);
      sfx.miss();
      return;
    }

    enemy.typed += 1;
    enemy.flash = 1;
    world.correct += 1;
    world.combo += 1;
    world.bestCombo = Math.max(world.bestCombo, world.combo);
    world.shipKick = 1;
    world.shipAngle = Math.atan2(enemy.y - s.y, enemy.x - s.x) + Math.PI / 2;
    // Knock the meteor back a little with every hit.
    const dx = s.x - enemy.x;
    const dy = s.y - enemy.y;
    const d = Math.hypot(dx, dy) || 1;
    enemy.x -= (dx / d) * 5;
    enemy.y -= (dy / d) * 5;
    const last = enemy.typed === enemy.word.length;
    world.bullets.push({ x: s.x, y: s.y - 16, px: s.x, py: s.y - 16, enemy: enemy.id, last });
    sparks(world, s.x, s.y - 18, "#ffc53d", 4, 120);
    sfx.laser();
    if (last) {
      const mult = multiplierFor(world.combo);
      enemy.doomed = true;
      enemy.value = enemy.word.length * 10 * mult * (enemy.boss ? 3 : 1);
      world.target = null;
    }
  }

  function onKeyDown(event: KeyboardEvent) {
    if (event.metaKey || event.ctrlKey || event.altKey) return;
    const el = event.target;
    if (el instanceof Element && el !== inputRef.current && el.closest("input, textarea, select, [contenteditable='true']")) return;
    const current = phaseRef.current;
    const world = worldRef.current;

    if (current === "idle" || current === "over") {
      if (event.key === "Enter") {
        event.preventDefault();
        start();
      }
      return;
    }
    if (event.key === "Escape") {
      event.preventDefault();
      setPhase(current === "paused" ? "playing" : "paused");
      return;
    }
    if (current === "paused") {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        setPhase("playing");
      }
      return;
    }
    if (!world) return;
    if (event.key === "Enter") {
      event.preventDefault();
      fireEmp(world);
      return;
    }
    if (event.key === "Backspace") {
      event.preventDefault();
      const enemy = world.enemies.find((item) => item.id === world.target);
      if (enemy) enemy.typed = 0;
      world.target = null;
      return;
    }
    if (event.key.length !== 1) return;
    event.preventDefault();
    const key = event.key.toLowerCase();
    if (key >= "a" && key <= "z") typeKey(key);
  }

  const keyHandler = useRef(onKeyDown);
  useEffect(() => {
    keyHandler.current = onKeyDown;
  });

  // Keyboard, resize, tab visibility and the render loop all live for the component's lifetime.
  useEffect(() => {
    const wrap = wrapRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!wrap || !canvas || !ctx) return;

    const css = getComputedStyle(document.documentElement);
    const mono = css.getPropertyValue("--font-mono").trim() || "ui-monospace, monospace";
    const display = css.getPropertyValue("--font-display").trim() || "Arial, sans-serif";

    function resize() {
      if (!wrap || !canvas) return;
      const width = wrap.clientWidth;
      // Fit the whole field (ship included) on screen, even on short laptop displays.
      const height = Math.round(Math.max(400, Math.min(640, width * 0.66, window.innerHeight - 32)));
      const dpr = window.devicePixelRatio || 1;
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      canvas.style.height = `${height}px`;
      const world = worldRef.current;
      if (!world) {
        worldRef.current = { ...newWorld(width, height), banner: null };
      } else {
        world.w = width;
        world.h = height;
        world.stars = makeStars(width, height);
      }
    }
    resize();
    const observer = new ResizeObserver(resize);
    observer.observe(wrap);

    const listener = (event: KeyboardEvent) => keyHandler.current(event);
    window.addEventListener("keydown", listener);
    const onVisibility = () => {
      if (document.hidden && phaseRef.current === "playing") setPhase("paused");
    };
    document.addEventListener("visibilitychange", onVisibility);

    let frame = 0;
    let last = performance.now();

    function update(world: World, dt: number) {
      const s = ship(world);
      world.playMs += dt * 1000;

      if (world.banner) world.banner.t += dt;
      if (world.banner && world.banner.t > 2.2) world.banner = null;

      world.spawnTimer -= dt;
      if (world.spawnTimer <= 0 && (world.toSpawn > 0 || world.bossPending)) {
        if (world.bossPending) {
          world.bossPending = false;
          spawn(world, true);
        } else {
          spawn(world);
          world.toSpawn -= 1;
        }
        const interval = Math.max(0.5, 2.1 - world.wave * 0.16);
        world.spawnTimer = interval * (0.7 + Math.random() * 0.6);
      }

      for (const enemy of [...world.enemies]) {
        const dx = s.x - enemy.x;
        const dy = s.y - enemy.y;
        const d = Math.hypot(dx, dy) || 1;
        enemy.x += (dx / d) * enemy.speed * dt;
        enemy.y += (dy / d) * enemy.speed * dt;
        enemy.angle += enemy.spin * dt;
        enemy.flash = Math.max(0, enemy.flash - dt * 6);
        if (!enemy.doomed && d < enemy.r + 20) {
          hitShip(world, enemy);
          if (phaseRef.current !== "playing") return;
        }
      }

      world.bullets = world.bullets.filter((bullet) => {
        const enemy = world.enemies.find((item) => item.id === bullet.enemy);
        if (!enemy) return false;
        const dx = enemy.x - bullet.x;
        const dy = enemy.y - bullet.y;
        const d = Math.hypot(dx, dy);
        const step = 1500 * dt;
        bullet.px = bullet.x;
        bullet.py = bullet.y;
        if (d <= step + enemy.r * 0.5) {
          sparks(world, enemy.x - (dx / d) * enemy.r * 0.6, enemy.y - (dy / d) * enemy.r * 0.6, enemy.color, 6, 160);
          if (bullet.last) explode(world, enemy);
          return false;
        }
        bullet.x += (dx / d) * step;
        bullet.y += (dy / d) * step;
        return true;
      });

      if (world.toSpawn === 0 && !world.bossPending && world.enemies.length === 0) {
        const bonus = world.wave * 100;
        world.score += bonus;
        world.wave += 1;
        world.toSpawn = waveSize(world.wave);
        world.bossPending = world.wave % 3 === 0;
        world.spawnTimer = 2.2;
        world.emp = Math.min(3, world.emp + (world.wave % 2 === 1 ? 1 : 0));
        world.banner = {
          text: `Wave ${world.wave}`,
          sub: world.bossPending ? `+${bonus} · boss incoming` : `+${bonus} wave bonus`,
          t: 0,
        };
        sfx.combo();
      }

      world.shipKick = Math.max(0, world.shipKick - dt * 8);
      world.shipFlash = Math.max(0, world.shipFlash - dt * 3);
      if (world.target === null) world.shipAngle *= 1 - Math.min(1, dt * 4);
    }

    function pill(x: number, y: number, width: number, height: number, fill: string) {
      if (!ctx) return;
      ctx.fillStyle = INK;
      ctx.beginPath();
      ctx.roundRect(x + 3, y + 3, width, height, height / 2);
      ctx.fill();
      ctx.fillStyle = fill;
      ctx.strokeStyle = INK;
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.roundRect(x, y, width, height, height / 2);
      ctx.fill();
      ctx.stroke();
    }

    function draw(world: World, now: number, playing: boolean) {
      if (!canvas || !ctx) return;
      const dpr = window.devicePixelRatio || 1;
      const { w, h } = world;
      const s = ship(world);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      // Candy-coloured nebula sky
      const bg = ctx.createLinearGradient(0, 0, 0, h);
      bg.addColorStop(0, "#1b1240");
      bg.addColorStop(0.6, "#2c1a66");
      bg.addColorStop(1, "#3b1f7a");
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, w, h);
      for (const [x, y, r, color] of [
        [w * 0.85, h * 0.1, w * 0.45, "rgba(255,95,162,0.28)"],
        [w * 0.1, h * 0.35, w * 0.4, "rgba(56,182,255,0.22)"],
        [w * 0.55, h * 0.75, w * 0.5, "rgba(123,92,255,0.30)"],
      ] as const) {
        const glow = ctx.createRadialGradient(x, y, 0, x, y, r);
        glow.addColorStop(0, color);
        glow.addColorStop(1, "rgba(0,0,0,0)");
        ctx.fillStyle = glow;
        ctx.fillRect(0, 0, w, h);
      }

      for (const star of world.stars) {
        const length = playing ? 2 + star.z * 12 : 2;
        ctx.globalAlpha = 0.35 + star.z * 0.65;
        ctx.fillStyle = star.z > 0.9 ? "#ffc53d" : star.z > 0.8 ? "#ff5fa2" : "#ffffff";
        ctx.fillRect(star.x, star.y, star.z > 0.6 ? 2.5 : 1.5, length);
      }
      ctx.globalAlpha = 1;

      ctx.save();
      if (world.shake > 0.2) ctx.translate((Math.random() - 0.5) * world.shake, (Math.random() - 0.5) * world.shake);

      // Home planet along the bottom edge.
      const planetR = w * 1.14;
      const planetY = h + w * 1.1;
      const planet = ctx.createLinearGradient(0, h - 50, 0, h);
      planet.addColorStop(0, "#22d3a0");
      planet.addColorStop(1, "#38b6ff");
      ctx.fillStyle = planet;
      ctx.strokeStyle = INK;
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.arc(w / 2, planetY, planetR, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.strokeStyle = "rgba(255,255,255,0.35)";
      ctx.lineWidth = 6;
      ctx.beginPath();
      ctx.arc(w / 2, planetY, planetR - 12, Math.PI * 1.35, Math.PI * 1.45);
      ctx.stroke();

      // Meteors
      for (const enemy of world.enemies) {
        const isTarget = enemy.id === world.target;
        const dx = s.x - enemy.x;
        const dy = s.y - enemy.y;
        const d = Math.hypot(dx, dy) || 1;
        const tailX = enemy.x - (dx / d) * enemy.r * 4.5;
        const tailY = enemy.y - (dy / d) * enemy.r * 4.5;
        const trail = ctx.createLinearGradient(enemy.x, enemy.y, tailX, tailY);
        trail.addColorStop(0, `${enemy.color}cc`);
        trail.addColorStop(1, `${enemy.color}00`);
        ctx.strokeStyle = trail;
        ctx.lineWidth = enemy.r * 1.3;
        ctx.lineCap = "round";
        ctx.beginPath();
        ctx.moveTo(enemy.x, enemy.y);
        ctx.lineTo(tailX, tailY);
        ctx.stroke();

        ctx.save();
        ctx.translate(enemy.x, enemy.y);
        ctx.rotate(enemy.angle);
        ctx.beginPath();
        enemy.verts.forEach((v, index) => {
          const a = (index / enemy.verts.length) * Math.PI * 2;
          const x = Math.cos(a) * enemy.r * v;
          const y = Math.sin(a) * enemy.r * v;
          if (index === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        });
        ctx.closePath();
        ctx.fillStyle = enemy.flash > 0.4 ? "#ffffff" : enemy.color;
        ctx.fill();
        ctx.strokeStyle = INK;
        ctx.lineWidth = enemy.boss ? 4 : 3;
        ctx.stroke();
        ctx.fillStyle = "rgba(29,27,58,0.22)";
        for (const [cx, cy, cr] of [
          [0.25, -0.2, 0.22],
          [-0.3, 0.25, 0.16],
          [0.1, 0.4, 0.1],
        ] as const) {
          ctx.beginPath();
          ctx.arc(enemy.r * cx, enemy.r * cy, enemy.r * cr, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.restore();

        if (isTarget) {
          ctx.save();
          ctx.translate(enemy.x, enemy.y);
          ctx.rotate(now / 350);
          ctx.strokeStyle = "#ffffff";
          ctx.lineWidth = 3;
          ctx.setLineDash([8, 8]);
          ctx.beginPath();
          ctx.arc(0, 0, enemy.r + 12, 0, Math.PI * 2);
          ctx.stroke();
          ctx.restore();
          ctx.setLineDash([]);
        }

        // Word label
        const size = enemy.boss ? 20 : 17;
        ctx.font = `700 ${size}px ${mono}`;
        const width = ctx.measureText(enemy.word).width;
        const labelY = Math.max(size + 8, enemy.y + enemy.r + 22);
        const left = Math.min(w - width - 16, Math.max(16, enemy.x - width / 2));
        ctx.globalAlpha = enemy.doomed ? 0.4 : 1;
        pill(left - 10, labelY - size - 2, width + 20, size + 12, isTarget ? "#ffc53d" : "#ffffff");
        const typed = enemy.word.slice(0, enemy.typed);
        ctx.textBaseline = "alphabetic";
        ctx.fillStyle = "#ff5fa2";
        ctx.fillText(typed, left, labelY);
        ctx.fillStyle = INK;
        ctx.fillText(enemy.word.slice(enemy.typed), left + ctx.measureText(typed).width, labelY);
        ctx.globalAlpha = 1;
      }

      // Lasers
      for (const bullet of world.bullets) {
        const tx = bullet.px - (bullet.x - bullet.px) * 1.6;
        const ty = bullet.py - (bullet.y - bullet.py) * 1.6;
        ctx.lineCap = "round";
        ctx.strokeStyle = "#ff5fa2";
        ctx.lineWidth = 7;
        ctx.beginPath();
        ctx.moveTo(tx, ty);
        ctx.lineTo(bullet.x, bullet.y);
        ctx.stroke();
        ctx.strokeStyle = "#fff1c7";
        ctx.lineWidth = 3;
        ctx.stroke();
      }

      // Particles
      for (const p of world.particles) {
        const alpha = Math.max(0, p.life / p.max);
        ctx.globalAlpha = alpha;
        if (p.ring) {
          ctx.strokeStyle = p.color;
          ctx.lineWidth = 5 * alpha + 1;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.ring * (1 - alpha) + 4, 0, Math.PI * 2);
          ctx.stroke();
        } else if (p.text) {
          ctx.font = `700 22px ${display}`;
          ctx.textAlign = "center";
          ctx.lineWidth = 5;
          ctx.strokeStyle = INK;
          ctx.strokeText(p.text, p.x, p.y);
          ctx.fillStyle = p.color;
          ctx.fillText(p.text, p.x, p.y);
          ctx.textAlign = "start";
        } else {
          ctx.fillStyle = p.color;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size * 1.2, 0, Math.PI * 2);
          ctx.fill();
        }
      }
      ctx.globalAlpha = 1;

      // Ship
      if (world.lives > 0 || phaseRef.current !== "over") {
        ctx.save();
        ctx.translate(s.x, s.y + world.shipKick * 4);
        ctx.rotate(world.shipAngle);
        const flame = 12 + Math.sin(now / 40) * 5 + (playing ? 8 : 0);
        ctx.fillStyle = "#ff8a3d";
        ctx.strokeStyle = INK;
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.moveTo(-9, 12);
        ctx.lineTo(0, 14 + flame);
        ctx.lineTo(9, 12);
        ctx.fill();
        ctx.stroke();
        ctx.fillStyle = "#ffc53d";
        ctx.beginPath();
        ctx.moveTo(-4, 12);
        ctx.lineTo(0, 10 + flame * 0.6);
        ctx.lineTo(4, 12);
        ctx.fill();
        ctx.beginPath();
        ctx.moveTo(0, -26);
        ctx.lineTo(19, 15);
        ctx.lineTo(0, 8);
        ctx.lineTo(-19, 15);
        ctx.closePath();
        ctx.fillStyle = world.shipFlash > 0.2 ? "#ff5a5f" : "#ffffff";
        ctx.fill();
        ctx.lineWidth = 3;
        ctx.stroke();
        ctx.fillStyle = "#38b6ff";
        ctx.beginPath();
        ctx.arc(0, -5, 5, 0, Math.PI * 2);
        ctx.fill();
        ctx.lineWidth = 2;
        ctx.stroke();
        ctx.restore();
      }
      ctx.restore();

      // Danger vignette when something is close
      const closest = world.enemies.reduce((min, enemy) => (enemy.doomed ? min : Math.min(min, Math.hypot(enemy.x - s.x, enemy.y - s.y))), Infinity);
      const danger = Math.max(0, 1 - closest / (h * 0.45));
      if (danger > 0 && playing) {
        const vignette = ctx.createRadialGradient(w / 2, h / 2, Math.min(w, h) * 0.35, w / 2, h / 2, Math.max(w, h) * 0.75);
        vignette.addColorStop(0, "rgba(255,90,95,0)");
        vignette.addColorStop(1, `rgba(255,90,95,${0.35 * danger * (0.75 + Math.sin(now / 120) * 0.25)})`);
        ctx.fillStyle = vignette;
        ctx.fillRect(0, 0, w, h);
      }

      if (phaseRef.current === "idle") return;

      // HUD
      ctx.textBaseline = "middle";
      ctx.font = `700 20px ${display}`;
      const scoreText = `★ ${world.score.toLocaleString("en-US")}`;
      pill(14, 14, ctx.measureText(scoreText).width + 28, 38, "#ffc53d");
      ctx.fillStyle = INK;
      ctx.fillText(scoreText, 28, 34);

      const waveText = `Wave ${world.wave}`;
      const waveWidth = ctx.measureText(waveText).width + 28;
      pill(w - waveWidth - 108, 14, waveWidth, 38, "#38b6ff");
      ctx.fillStyle = INK;
      ctx.fillText(waveText, w - waveWidth - 94, 34);
      pill(w - 96, 14, 82, 38, "#ffffff");
      for (let index = 0; index < MAX_LIVES; index += 1) {
        heart(ctx, w - 88 + index * 22, 25, index < world.lives);
      }

      const mult = multiplierFor(world.combo);
      if (world.combo > 0) {
        ctx.font = `700 15px ${display}`;
        const comboText = `combo ${world.combo} · x${mult}`;
        pill(14, 60, ctx.measureText(comboText).width + 22, 28, mult > 1 ? "#ff5fa2" : "#ffffff");
        ctx.fillStyle = mult > 1 ? "#ffffff" : INK;
        ctx.fillText(comboText, 25, 75);
      }

      ctx.font = `700 14px ${display}`;
      pill(14, h - 46, 150, 32, "#ffffff");
      ctx.fillStyle = INK;
      ctx.fillText("EMP", 26, h - 30);
      for (let index = 0; index < 3; index += 1) {
        ctx.fillStyle = index < world.emp ? "#7b5cff" : "rgba(29,27,58,0.15)";
        ctx.beginPath();
        ctx.arc(70 + index * 16, h - 30, 6, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.fillStyle = "#5f5b7d";
      ctx.fillText("enter", 118, h - 30);
      ctx.textBaseline = "alphabetic";

      if (world.banner) {
        const t = world.banner.t;
        const appear = Math.min(1, t / 0.3);
        const alpha = t > 1.6 ? Math.max(0, 1 - (t - 1.6) / 0.6) : 1;
        const scale = 0.5 + 0.5 * (1 - (1 - appear) ** 3) + Math.sin(appear * Math.PI) * 0.12;
        ctx.save();
        ctx.globalAlpha = alpha;
        ctx.translate(w / 2, h * 0.38);
        ctx.rotate(-0.05);
        ctx.scale(scale, scale);
        ctx.textAlign = "center";
        ctx.font = `700 ${Math.min(84, w * 0.12)}px ${display}`;
        ctx.lineJoin = "round";
        ctx.lineWidth = 10;
        ctx.strokeStyle = INK;
        const label = world.banner.text.toUpperCase();
        ctx.fillStyle = INK;
        ctx.fillText(label, 5, 5);
        ctx.strokeText(label, 0, 0);
        ctx.fillStyle = "#ffc53d";
        ctx.fillText(label, 0, 0);
        ctx.font = `700 18px ${display}`;
        const subWidth = ctx.measureText(world.banner.sub).width + 30;
        ctx.textAlign = "start";
        pill(-subWidth / 2, 22, subWidth, 34, "#ff5fa2");
        ctx.textAlign = "center";
        ctx.fillStyle = "#ffffff";
        ctx.fillText(world.banner.sub, 0, 45);
        ctx.restore();
      }
    }

    function heart(context: CanvasRenderingContext2D, x: number, y: number, full: boolean) {
      context.save();
      context.translate(x, y);
      context.beginPath();
      context.moveTo(8, 15);
      context.bezierCurveTo(-5, 6, 0, -4, 8, 3);
      context.bezierCurveTo(16, -4, 21, 6, 8, 15);
      context.fillStyle = full ? "#ff5a5f" : "rgba(29,27,58,0.15)";
      context.fill();
      context.strokeStyle = INK;
      context.lineWidth = 2;
      context.stroke();
      context.restore();
    }

    function loop(now: number) {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      const world = worldRef.current;
      if (world) {
        const current = phaseRef.current;
        const playing = current === "playing";
        const starSpeed = playing ? 260 : current === "paused" ? 0 : 40;
        for (const star of world.stars) {
          star.y += (0.2 + star.z) * starSpeed * dt;
          if (star.y > world.h) {
            star.y = -10;
            star.x = Math.random() * world.w;
          }
        }
        if (playing) update(world, dt);
        if (current !== "paused") {
          world.particles = world.particles.filter((p) => {
            p.life -= dt;
            p.x += p.vx * dt;
            p.y += p.vy * dt;
            p.vx *= 0.96;
            p.vy *= 0.96;
            return p.life > 0;
          });
          world.shake *= 0.86;
        }
        draw(world, now, playing);
      }
      frame = requestAnimationFrame(loop);
    }
    frame = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      window.removeEventListener("keydown", listener);
      document.removeEventListener("visibilitychange", onVisibility);
    };
    // The loop reads everything through refs; it must mount once.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div ref={wrapRef} className="sticker relative overflow-hidden bg-space shadow-pop-lg">
      <canvas ref={canvasRef} className="block w-full" onClick={() => inputRef.current?.focus({ preventScroll: true })} />
      <input
        ref={inputRef}
        aria-label="Type here"
        autoCapitalize="none"
        autoCorrect="off"
        autoComplete="off"
        spellCheck={false}
        className="absolute left-0 top-0 h-px w-px opacity-0"
        onInput={(event) => {
          const value = event.currentTarget.value.toLowerCase();
          event.currentTarget.value = "";
          const char = value.slice(-1);
          if (char >= "a" && char <= "z") typeKey(char);
        }}
      />

      {phase === "idle" ? (
        <Overlay>
          <span className="chip bg-bubble text-white">☄️ Mode 02</span>
          <h2 className="mt-3 font-display text-4xl font-bold md:text-5xl">Ready for launch?</h2>
          <p className="mx-auto mt-3 max-w-sm font-semibold text-mute">
            Type a meteor&apos;s word to lock on and fire. Finish the word to blow it up before it reaches your ship!
          </p>
          <ul className="mx-auto mt-5 grid max-w-md gap-2 text-sm font-bold sm:grid-cols-3">
            <Hint k="a–z" text="lock & shoot" bg="#ffe1ee" />
            <Hint k="enter" text="EMP blast" bg="#e9e3ff" />
            <Hint k="esc" text="pause" bg="#dbf1ff" />
          </ul>
          <button type="button" onClick={start} className="btn mt-7 bg-sun">
            🚀 Launch <span className="font-mono text-xs opacity-70">enter</span>
          </button>
          {best > 0 ? <p className="mt-4 text-sm font-bold text-mute">🏆 best {best.toLocaleString("en-US")}</p> : null}
        </Overlay>
      ) : null}

      {phase === "paused" ? (
        <Overlay>
          <p className="text-5xl">⏸️</p>
          <h2 className="mt-2 font-display text-4xl font-bold">Paused</h2>
          <p className="mt-2 font-semibold text-mute">Press esc or enter to continue.</p>
          <button type="button" onClick={() => setPhase("playing")} className="btn mt-6 bg-mint">
            ▶ Resume
          </button>
        </Overlay>
      ) : null}

      {phase === "over" && summary ? (
        <Overlay>
          <span className={`chip ${summary.newBest ? "animate-wiggle bg-bubble text-white" : "bg-coral text-white"}`}>
            {summary.newBest ? "🎉 New high score!" : "💥 Ship destroyed"}
          </span>
          <p className="mt-3 font-display text-7xl font-bold tabular-nums leading-none" style={{ color: "#ffc53d", WebkitTextStroke: "2px #1d1b3a", textShadow: "4px 4px 0 #1d1b3a" }}>
            {summary.score.toLocaleString("en-US")}
          </p>
          <p className="mt-2 font-bold text-mute">
            Reached wave {summary.wave} · {rankFor(summary.wpm).title}
          </p>
          <dl className="mx-auto mt-5 grid max-w-lg grid-cols-2 gap-2 text-sm sm:grid-cols-4">
            <Fact label="WPM" value={summary.wpm} bg="#dbf1ff" />
            <Fact label="Accuracy" value={`${summary.accuracy}%`} bg="#d5f8ec" />
            <Fact label="Meteors" value={summary.kills} bg="#ffe6d5" />
            <Fact label="Best combo" value={summary.bestCombo} bg="#ffe1ee" />
          </dl>
          <button type="button" onClick={start} className="btn mt-7 bg-sun">
            🔁 Play again <span className="font-mono text-xs opacity-70">enter</span>
          </button>
          <p className="mt-4 text-sm font-bold text-mute">🏆 best {summary.best.toLocaleString("en-US")}</p>
        </Overlay>
      ) : null}
    </div>
  );
}

function Overlay({ children }: { children: React.ReactNode }) {
  return (
    <div className="absolute inset-0 grid place-items-center overflow-y-auto bg-space/55 p-4 backdrop-blur-[2px]">
      <div className="sticker w-full max-w-xl animate-enter p-6 text-center shadow-pop-lg md:p-8">{children}</div>
    </div>
  );
}

function Hint({ k, text, bg }: { k: string; text: string; bg: string }) {
  return (
    <li className="rounded-control border-2 border-ink px-3 py-2" style={{ background: bg }}>
      <kbd className="rounded-md border-2 border-ink bg-white px-1.5 font-mono text-xs">{k}</kbd> {text}
    </li>
  );
}

function Fact({ label, value, bg }: { label: string; value: number | string; bg: string }) {
  return (
    <div className="rounded-control border-2 border-ink px-3 py-2" style={{ background: bg }}>
      <dt className="text-xs font-extrabold uppercase text-ink/60">{label}</dt>
      <dd className="font-mono text-xl font-bold">{value}</dd>
    </div>
  );
}
