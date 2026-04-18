import { useEffect } from 'react';

export function InteractiveDots() {
  useEffect(() => {
    const root = document.documentElement;
    let tx = 0;
    let ty = 0;
    let x = 0;
    let y = 0;
    let raf = 0;

    const animate = () => {
      x += (tx - x) * 0.08;
      y += (ty - y) * 0.08;
      root.style.setProperty('--dot-shift-x', `${x.toFixed(2)}px`);
      root.style.setProperty('--dot-shift-y', `${y.toFixed(2)}px`);
      raf = window.requestAnimationFrame(animate);
    };

    const onMove = (e: MouseEvent) => {
      const px = (e.clientX / window.innerWidth - 0.5) * 2;
      const py = (e.clientY / window.innerHeight - 0.5) * 2;
      tx = px * 18;
      ty = py * 18;
    };

    const onLeave = () => {
      tx = 0;
      ty = 0;
    };

    raf = window.requestAnimationFrame(animate);
    window.addEventListener('mousemove', onMove, { passive: true });
    window.addEventListener('mouseleave', onLeave);

    return () => {
      window.cancelAnimationFrame(raf);
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseleave', onLeave);
      root.style.setProperty('--dot-shift-x', '0px');
      root.style.setProperty('--dot-shift-y', '0px');
    };
  }, []);

  return null;
}

