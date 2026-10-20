/* SHQAWA PRO motion system v10: visible, responsive effects across all pages */
(() => {
  const reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  document.documentElement.classList.add('motion-ready');
  const selectors = '.hero-content > *, .hero-visual, .section-title, .category-card, .project-tile, .empty-state, .contact-box, .category-hero > *, .category-tools, .items-grid > *, .admin-heading, .admin-card, .admin-panel, .admin-item, .site-footer';
  const seen = new WeakSet();
  const reveal = (scope=document) => {
    scope.querySelectorAll?.(selectors).forEach((el, index) => {
      if (seen.has(el)) return;
      seen.add(el);
      if (reduce) { el.classList.add('motion-visible'); return; }
      el.classList.add('motion-reveal');
      const siblings = Array.from(el.parentElement?.children || []);
      const delay = Math.min(Math.max(siblings.indexOf(el), 0), 6) * 55;
      el.style.setProperty('--motion-delay', `${delay}ms`);
      if (!('IntersectionObserver' in window)) { el.classList.add('motion-visible'); return; }
      observer.observe(el);
    });
  };
  const observer = !reduce && 'IntersectionObserver' in window ? new IntersectionObserver(entries => {
    entries.forEach(entry => { if (entry.isIntersecting) { entry.target.classList.add('motion-visible'); observer.unobserve(entry.target); } });
  }, {threshold: 0.04, rootMargin: '0px 0px -18px 0px'}) : null;
  reveal();
  // Home/category scripts insert cards after page load; animate those too.
  if ('MutationObserver' in window) new MutationObserver(records => records.forEach(record => record.addedNodes.forEach(node => { if (node.nodeType === 1) { if (node.matches?.(selectors)) reveal(node.parentElement || document); else reveal(node); } }))).observe(document.body, {childList:true,subtree:true});
})();
