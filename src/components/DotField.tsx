import { useEffect, useMemo, useRef } from 'react';

type Mode = 'auth' | 'app';

export function DotField({ mode }: { mode: Mode }) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const mouseRef = useRef<{ x: number; y: number; active: boolean }>({ x: 0, y: 0, active: false });

  const config = useMemo(() => {
    return {
      spacing: 26,
      radius: 1.15,
      // Mouse repulsion
      repelRadius: 92,
      repelStrength: 22,
      // App drift (matrix-like wave)
      driftAmp: 3.2,
      driftSpeed: 0.0008
    };
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let raf = 0;
    let width = 0;
    let height = 0;
    let dpr = 1;
    let points: { x: number; y: number; px: number; py: number }[] = [];

    const rebuild = () => {
      const parent = canvas.parentElement;
      const rect = parent ? parent.getBoundingClientRect() : { width: window.innerWidth, height: window.innerHeight };
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = Math.max(1, Math.floor(rect.width));
      height = Math.max(1, Math.floor(rect.height));

      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      const cols = Math.ceil(width / config.spacing) + 2;
      const rows = Math.ceil(height / config.spacing) + 2;
      const startX = -config.spacing;
      const startY = -config.spacing;
      points = [];
      for (let r = 0; r < rows; r += 1) {
        for (let c = 0; c < cols; c += 1) {
          const x = startX + c * config.spacing;
          const y = startY + r * config.spacing;
          points.push({ x, y, px: x, py: y });
        }
      }
    };

    const onMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouseRef.current.x = e.clientX - rect.left;
      mouseRef.current.y = e.clientY - rect.top;
      mouseRef.current.active = true;
    };
    const onLeave = () => {
      mouseRef.current.active = false;
    };

    const animate = (t: number) => {
      ctx.clearRect(0, 0, width, height);

      // soft paper tint + mustard base is handled by body; here we only draw dots
      ctx.fillStyle = 'rgba(17, 17, 17, 0.22)';

      const mx = mouseRef.current.x;
      const my = mouseRef.current.y;
      const mActive = mode === 'auth' && mouseRef.current.active;

      for (const p of points) {
        let ox = 0;
        let oy = 0;

        if (mode === 'app') {
          // Matrix-like wave: even spacing, slow continuous motion.
          const phase = (p.x * 0.018 + p.y * 0.014) * 0.9;
          const w1 = Math.sin(t * config.driftSpeed + phase);
          const w2 = Math.cos(t * (config.driftSpeed * 0.83) + phase * 1.3);
          ox += (w1 + w2) * (config.driftAmp * 0.5);
          oy += (w1 - w2) * (config.driftAmp * 0.5);
        }

        if (mActive) {
          const dx = p.x - mx;
          const dy = p.y - my;
          const dist = Math.hypot(dx, dy);
          if (dist > 0.001 && dist < config.repelRadius) {
            const k = 1 - dist / config.repelRadius;
            const force = (k * k) * config.repelStrength;
            ox += (dx / dist) * force;
            oy += (dy / dist) * force;
          }
        }

        // Smooth to avoid jitter
        p.px += (p.x + ox - p.px) * 0.12;
        p.py += (p.y + oy - p.py) * 0.12;

        ctx.beginPath();
        ctx.arc(p.px, p.py, config.radius, 0, Math.PI * 2);
        ctx.fill();
      }

      raf = window.requestAnimationFrame(animate);
    };

    rebuild();
    raf = window.requestAnimationFrame(animate);

    window.addEventListener('resize', rebuild, { passive: true });
    window.addEventListener('mousemove', onMove, { passive: true });
    window.addEventListener('mouseleave', onLeave);

    return () => {
      window.cancelAnimationFrame(raf);
      window.removeEventListener('resize', rebuild);
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseleave', onLeave);
    };
  }, [config, mode]);

  return <canvas ref={canvasRef} className="pointer-events-none fixed inset-0 z-0" aria-hidden />;
}

