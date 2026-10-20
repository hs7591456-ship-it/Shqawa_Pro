/* SHQAWA PRO V9 - HEAVY RED PARTICLES FULL SCREEN */
(() => {
  const start = () => {
    if (document.getElementById('red-particle-background')) return;
    const canvas = document.createElement('canvas');
    canvas.id = 'red-particle-background';
    canvas.setAttribute('aria-hidden', 'true');
    
    // ستايل يخليها فول سكرين ورا كل حاجة
    Object.assign(canvas.style, {
      position: 'fixed',
      top: '0',
      left: '0',
      width: '100%',
      height: '100%',
      pointerEvents: 'none',
      zIndex: '0',
    });

    document.body.prepend(canvas);
    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;
    let w = 0, h = 0, dpr = 1, particles = [];
    const reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const resize = () => {
      w = window.innerWidth; h = window.innerHeight;
      dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      canvas.width = Math.round(w * dpr); 
      canvas.height = Math.round(h * dpr);
      canvas.style.width = w + 'px'; 
      canvas.style.height = h + 'px';
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      
      // زودت العدد جامد - من 24 لـ 150 كورة
      const count = Math.max(80, Math.min(180, Math.round(w * h / 6000)));
      particles = Array.from({length: count}, () => ({
        x: Math.random() * w, 
        y: Math.random() * h,
        r: 0.8 + Math.random() * 2.5,
        // سرعة 3 اضعاف القديمة
        vx: (Math.random() - .5) * 1.02,
        vy: (Math.random() - .5) * 1.02,
        a: .35 + Math.random() * .65,
        phase: Math.random() * Math.PI * 2
      }));
    };

    let tick = 0;
    const draw = () => {
      ctx.clearRect(0, 0, w, h);
      tick += .012;
      for (const p of particles) {
        if (!reduceMotion) { p.x += p.vx; p.y += p.vy; }
        if (p.x < -10) p.x = w + 10; if (p.x > w + 10) p.x = -10;
        if (p.y < -10) p.y = h + 10; if (p.y > h + 10) p.y = -10;
        
        const pulse = .72 + .28 * Math.sin(tick + p.phase);
        // الكورة الاساسية
        ctx.beginPath(); 
        ctx.arc(p.x, p.y, p.r * (1 + pulse * .12), 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 45, 76, ${p.a * pulse})`; 
        ctx.fill();
        // التوهج اللي حواليها
        ctx.beginPath(); 
        ctx.arc(p.x, p.y, p.r * 4.2, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 35, 65, ${p.a * .09 * pulse})`; 
        ctx.fill();
      }
      if (!reduceMotion) requestAnimationFrame(draw);
    };
    resize(); draw();
    window.addEventListener('resize', resize, {passive:true});
  };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start, {once:true}); else start();
})();
