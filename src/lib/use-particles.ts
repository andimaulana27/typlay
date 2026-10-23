"use client";

import { useCallback, useEffect, useRef } from "react";

type Particle = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  max: number;
  size: number;
  color: string;
  confetti: boolean;
  spin: number;
};

type BurstOptions = {
  count?: number;
  colors?: string[];
  speed?: number;
  confetti?: boolean;
};

// Canvas overlay for bursts; the loop only runs while particles are alive.
export function useParticles() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particles = useRef<Particle[]>([]);
  const frame = useRef(0);
  const last = useRef(0);

  const tick = useCallback((now: number) => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) {
      frame.current = 0;
      return;
    }
    const dt = Math.min(0.05, (now - (last.current || now)) / 1000);
    last.current = now;
    const dpr = window.devicePixelRatio || 1;
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;
    if (canvas.width !== Math.round(width * dpr) || canvas.height !== Math.round(height * dpr)) {
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
    }
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, width, height);

    particles.current = particles.current.filter((p) => {
      p.life -= dt;
      if (p.life <= 0) return false;
      p.vy += (p.confetti ? 420 : 160) * dt;
      p.vx *= p.confetti ? 0.985 : 0.95;
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.spin += dt * 8;
      const alpha = Math.min(1, p.life / (p.max * 0.6));
      ctx.globalAlpha = alpha;
      ctx.fillStyle = p.color;
      if (p.confetti) {
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.spin);
        ctx.fillRect(-p.size / 2, -p.size / 4, p.size, p.size / 2);
        ctx.restore();
      } else {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * alpha, 0, Math.PI * 2);
        ctx.fill();
      }
      return true;
    });
    ctx.globalAlpha = 1;

    if (particles.current.length) {
      frame.current = requestAnimationFrame(tick);
    } else {
      frame.current = 0;
      last.current = 0;
    }
  }, []);

  useEffect(() => () => cancelAnimationFrame(frame.current), []);

  const burst = useCallback(
    (x: number, y: number, options: BurstOptions = {}) => {
      const { count = 18, colors = ["#d6ff4a", "#f4f7fb"], speed = 260, confetti = false } = options;
      for (let index = 0; index < count; index += 1) {
        const angle = confetti ? -Math.PI / 2 + (Math.random() - 0.5) * 2.2 : Math.random() * Math.PI * 2;
        const velocity = speed * (0.35 + Math.random() * 0.75);
        const max = confetti ? 1.6 + Math.random() : 0.45 + Math.random() * 0.4;
        particles.current.push({
          x,
          y,
          vx: Math.cos(angle) * velocity,
          vy: Math.sin(angle) * velocity,
          life: max,
          max,
          size: confetti ? 8 + Math.random() * 6 : 2 + Math.random() * 2.5,
          color: colors[index % colors.length] ?? "#d6ff4a",
          confetti,
          spin: Math.random() * Math.PI,
        });
      }
      if (!frame.current) frame.current = requestAnimationFrame(tick);
    },
    [tick],
  );

  return { canvasRef, burst };
}
