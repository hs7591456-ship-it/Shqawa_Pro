/* يقرأ إعداد الخلفية ويضيف صورة أو فيديو خلف محتوى الصفحة، دون تغيير عناصر الموقع الأصلية */
(function(){
  const cfg = window.SHQAWA_BACKGROUND || {};
  if (!cfg.type || cfg.type === 'none') return;
  const layer = document.createElement('div');
  layer.id = 'custom-site-background';
  layer.setAttribute('aria-hidden','true');
  Object.assign(layer.style,{position:'fixed',inset:'0',zIndex:'0',overflow:'hidden',pointerEvents:'none',opacity:String(Math.max(0,Math.min(1,Number(cfg.opacity ?? 0.28))))});
  if (cfg.type === 'image' && cfg.image) {
    const img = document.createElement('img'); img.src = cfg.image; img.alt='';
    Object.assign(img.style,{width:'100%',height:'100%',objectFit:cfg.fit||'cover',display:'block'});
    layer.appendChild(img);
  } else if (cfg.type === 'video' && cfg.video) {
    const video = document.createElement('video'); video.src = cfg.video; video.autoplay = true; video.muted = true; video.loop = true; video.playsInline = true; video.setAttribute('aria-hidden','true');
    Object.assign(video.style,{width:'100%',height:'100%',objectFit:cfg.fit||'cover',display:'block'});
    layer.appendChild(video);
  } else return;
  document.addEventListener('DOMContentLoaded',()=>{document.body.prepend(layer); document.body.style.position = document.body.style.position || 'relative'; document.body.querySelectorAll(':scope > *:not(#custom-site-background)').forEach(el=>{ if(getComputedStyle(el).position==='static') el.style.position='relative'; if(!el.style.zIndex) el.style.zIndex='1'; });}, {once:true});
})();
