/* SHQAWA PRO V8 - subtle full-screen red particle background */
(() => {
  const start = () => {
    if (document.getElementById('red-particle-background')) return;
    const canvas = document.createElement('canvas');
    canvas.id = 'red-particle-background';
    canvas.setAttribute('aria-hidden', 'true');
    document.body.prepend(canvas);
    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;
    let w = 0, h = 0, dpr = 1, particles = [];
    const reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const resize = () => {
      w = window.innerWidth; h = window.innerHeight;
      dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      canvas.width = Math.round(w * dpr); canvas.height = Math.round(h * dpr);
      canvas.style.width = w + 'px'; canvas.style.height = h + 'px';
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const count = Math.max(24, Math.min(72, Math.round(w * h / 15500)));
      particles = Array.from({length: count}, () => ({
        x: Math.random() * w, y: Math.random() * h,
        r: 0.7 + Math.random() * 1.8,
        vx: (Math.random() - .5) * .34,
        vy: (Math.random() - .5) * .34,
        a: .22 + Math.random() * .58,
        phase: Math.random() * Math.PI * 2
      }));
    };
    let tick = 0;
    const draw = () => {
      ctx.clearRect(0, 0, w, h);
      tick += .012;
      for (const p of particles) {
        if (!reduceMotion) { p.x += p.vx; p.y += p.vy; }
        if (p.x < -8) p.x = w + 8; if (p.x > w + 8) p.x = -8;
        if (p.y < -8) p.y = h + 8; if (p.y > h + 8) p.y = -8;
        const pulse = .72 + .28 * Math.sin(tick + p.phase);
        ctx.beginPath(); ctx.arc(p.x, p.y, p.r * (1 + pulse * .12), 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 45, 76, ${p.a * pulse})`; ctx.fill();
        ctx.beginPath(); ctx.arc(p.x, p.y, p.r * 3.6, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 35, 65, ${p.a * .075 * pulse})`; ctx.fill();
      }
      if (!reduceMotion) requestAnimationFrame(draw);
    };
    resize(); draw();
    window.addEventListener('resize', resize, {passive:true});
    if (reduceMotion) return;
    // Browsers automatically pause requestAnimationFrame in background tabs.
  };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start, {once:true}); else start();
})();
