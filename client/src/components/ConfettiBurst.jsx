import React, { useEffect, useRef } from 'react';

export const ConfettiBurst = ({ active, onDone }) => {
  const canvasRef = useRef(null);

  useEffect(() => {
    if (!active) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const dpr = window.devicePixelRatio || 1;
    canvas.width = window.innerWidth * dpr;
    canvas.height = window.innerHeight * dpr;
    ctx.scale(dpr, dpr);

    const colors = ['#4f46e5', '#10b981', '#f59e0b', '#0ea5e9', '#f43f5e'];
    const pieces = Array.from({ length: 140 }).map(() => ({
      x: Math.random() * window.innerWidth,
      y: -20 - Math.random() * 80,
      r: 4 + Math.random() * 6,
      c: colors[Math.floor(Math.random() * colors.length)],
      vy: 3 + Math.random() * 5,
      vx: -2 + Math.random() * 4,
      rot: Math.random() * Math.PI
    }));

    let frame;
    const start = performance.now();
    const draw = (now) => {
      ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
      pieces.forEach((p) => {
        p.y += p.vy;
        p.x += p.vx;
        p.rot += 0.1;
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rot);
        ctx.fillStyle = p.c;
        ctx.fillRect(-p.r / 2, -p.r / 2, p.r, p.r * 1.6);
        ctx.restore();
      });
      if (now - start < 2200) {
        frame = requestAnimationFrame(draw);
      } else if (onDone) {
        onDone();
      }
    };
    frame = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(frame);
  }, [active, onDone]);

  if (!active) return null;

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none fixed inset-0 z-[80]"
      aria-hidden="true"
    />
  );
};
