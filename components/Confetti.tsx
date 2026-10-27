'use client';

import { useEffect, useRef } from 'react';

const CONFETTI_KLEUREN = ['#3b5633', '#d56119', '#758d69', '#9e3816', '#1a4a7a', '#f4c293', '#fcebdc'];

export default function Confetti({ kleuren = CONFETTI_KLEUREN }: { kleuren?: readonly string[] }) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const stukjes = Array.from({ length: 180 }, () => ({
      x: Math.random() * canvas.width,
      y: -20 - Math.random() * canvas.height * 0.6,
      w: 6 + Math.random() * 8,
      h: 10 + Math.random() * 10,
      snelheid: 2 + Math.random() * 4,
      drift: (Math.random() - 0.5) * 3,
      hoek: Math.random() * Math.PI * 2,
      draai: (Math.random() - 0.5) * 0.3,
      kleur: kleuren[Math.floor(Math.random() * kleuren.length)],
    }));

    let frame = 0;
    let stop = false;
    const start = performance.now();

    function teken(nu: number) {
      if (stop || !ctx || !canvas) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const fade = Math.max(0, 1 - Math.max(0, nu - start - 4000) / 1500);
      ctx.globalAlpha = fade;
      for (const s of stukjes) {
        s.y += s.snelheid;
        s.x += s.drift + Math.sin(s.y / 40);
        s.hoek += s.draai;
        ctx.save();
        ctx.translate(s.x, s.y);
        ctx.rotate(s.hoek);
        ctx.fillStyle = s.kleur;
        ctx.fillRect(-s.w / 2, -s.h / 2, s.w, s.h);
        ctx.restore();
      }
      if (fade > 0) frame = requestAnimationFrame(teken);
      else ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
    frame = requestAnimationFrame(teken);

    return () => {
      stop = true;
      cancelAnimationFrame(frame);
    };
  }, [kleuren]);

  return <canvas ref={ref} aria-hidden className="fixed inset-0 z-50 pointer-events-none" />;
}
