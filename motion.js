/* SHQAWA PRO motion system — lightweight, responsive, and reduced-motion aware */
(() => {
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduceMotion) return;

  document.documentElement.classList.add('motion-enabled');

  const revealSelectors = [
    '.hero-content > *', '.hero-visual', '.section-title', '.category-card',
    '.project-tile', '.empty-state', '.contact-box', '.category-hero > *',
    '.category-tools', '.items-grid > *', '.admin-heading', '.admin-card',
    '.admin-panel', '.admin-item', '.site-footer'
  ];
  const targets = document.querySelectorAll(revealSelectors.join(','));
  targets.forEach((el, index) => {
    el.classList.add('motion-reveal');
    if (el.matches('.category-card, .project-tile, .items-grid > *')) {
      const siblings = Array.from(el.parentElement?.children || []);
      el.style.setProperty('--motion-delay', `${Math.min(siblings.indexOf(el), 7) * 65}ms`);
    } else {
      el.style.setProperty('--motion-delay', `${Math.min(index % 4, 3) * 45}ms`);
    }
  });

  const show = el => el.classList.add('motion-visible');
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          show(entry.target);
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.08, rootMargin: '0px 0px -28px 0px' });
    targets.forEach(el => observer.observe(el));
  } else {
    targets.forEach(show);
  }
})();
