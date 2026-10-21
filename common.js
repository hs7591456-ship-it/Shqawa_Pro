const menuButton = document.getElementById('menuButton');
const mainNav = document.getElementById('mainNav');

menuButton?.addEventListener('click', () => {
  const open = mainNav.classList.toggle('open');
  menuButton.setAttribute('aria-expanded', String(open));
});

mainNav?.querySelectorAll('a').forEach(a => {
  a.addEventListener('click', () => {
    mainNav.classList.remove('open');
    menuButton?.setAttribute('aria-expanded', 'false');
  });
});

const WHATSAPP_NUMBER = '201038955357';
const CART_KEY = 'shqawa_cart_v1';

const cfg = window.SHQAWA_SUPABASE_CONFIG || {};
let db = null;

if (
  window.supabase?.createClient &&
  cfg.url &&
  cfg.publishableKey &&
  !cfg.publishableKey.includes('PASTE_YOUR')
) {
  db = window.supabase.createClient(
    cfg.url,
    cfg.publishableKey,
    {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true
      },
      global: {
        fetch: async (url, options = {}) => {
          try {
            const response = await fetch(url, options);

            if (!response.ok) {
              console.error(
                'Supabase HTTP error:',
                response.status,
                String(url)
              );
            }

            return response;
          } catch (error) {
            console.error('Supabase network request failed:', {
              url: String(url),
              message: error?.message || String(error),
              name: error?.name || 'Error'
            });

            throw error;
          }
        }
      }
    }
  );
}

window.SHQAWA_DB = db;

window.SHQAWA = {
  categories: {
    web: 'المواقع الإلكترونية',
    apps: 'التطبيقات',
    design: 'التصميمات',
    code: 'المشاريع البرمجية'
  },

  dbReady: !!db,

  async getItems() {
    return this.loadItems();
  },

  async loadItems() {
    if (!db) {
      throw new Error(
        'إعداد Supabase ناقص. راجع ملف supabase-config.js والمفتاح العام.'
      );
    }

    const { data, error } = await db
      .from('projects')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;

    const now = Date.now();
    return (data || []).filter(row => {
      const published = row.is_published !== false;
      const due = !row.publish_at || new Date(row.publish_at).getTime() <= now;
      return published && due;
    }).map(row => ({
      id: String(row.id), name: row.title || row.name || '',
      category: row.category || 'web', description: row.description || '',
      image: row.image_url || row.image || '', link: row.project_url || row.link || '',
      publishAt: row.publish_at || '', isPublished: row.is_published !== false,
      createdAt: row.created_at ? new Date(row.created_at).getTime() : Date.now()
    }));
  },

  async getGallery(projectId) {
    if (!db) return [];
    const { data, error } = await db.from('project_images').select('image_url,sort_order').eq('project_id', String(projectId)).order('sort_order', { ascending: true });
    if (error) { console.warn('Gallery table not installed yet:', error.message); return []; }
    return (data || []).map(x => x.image_url).filter(Boolean);
  },

  async getSetting(key) {
    if (!db) return '';
    const { data, error } = await db.from('site_settings').select('setting_value').eq('setting_key', key).maybeSingle();
    if (error) return '';
    return data?.setting_value || '';
  },

  async openGallery(item) {
    const modal = document.getElementById('projectGalleryModal'); if (!modal) return;
    const title = modal.querySelector('[data-gallery-title]'); const track = modal.querySelector('[data-gallery-track]');
    title.textContent = item.name || 'معرض المشروع'; track.innerHTML = '';
    let urls = await this.getGallery(item.id); if (!urls.length && item.image) urls = [item.image];
    if (!urls.length) { track.textContent = 'لا توجد صور إضافية لهذا المشروع حتى الآن.'; }
    urls.forEach((url, i) => { const img=document.createElement('img'); img.src=url; img.alt=(item.name||'المشروع')+' - صورة '+(i+1); img.loading='lazy'; track.appendChild(img); });
    modal.hidden = false; document.body.classList.add('gallery-lock');
  },

  categoryLabel(key) {
    return this.categories[key] || 'مشروع';
  },

  getCart() {
    try {
      return JSON.parse(localStorage.getItem(CART_KEY) || '[]');
    } catch {
      return [];
    }
  },

  saveCart(items) {
    localStorage.setItem(CART_KEY, JSON.stringify(items));
    this.renderCart();
  },

  orderOne(item) {
    const message =
      `السلام عليكم، عايز أطلب المشروع التالي من شقاوة برو:\n` +
      `اسم المشروع: ${item.name}\n` +
      `القسم: ${this.categoryLabel(item.category)}\n` +
      `${item.description ? `التفاصيل: ${item.description}\n` : ''}` +
      'من فضلك ابعتلي تفاصيل السعر وطريقة الاستلام.';

    window.open(
      `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`,
      '_blank',
      'noopener'
    );
  },

  addToCart(item) {
    const cart = this.getCart();

    if (
      !cart.some(
        x => x.name === item.name && x.category === item.category
      )
    ) {
      cart.push({
        name: item.name,
        category: item.category,
        description: item.description || '',
        link: item.link || ''
      });
    }

    this.saveCart(cart);

    const panel = document.getElementById('cartBackdrop');

    if (panel) {
      panel.hidden = false;
      document.body.classList.add('cart-lock');
    }
  },

  removeFromCart(index) {
    const cart = this.getCart();
    cart.splice(index, 1);
    this.saveCart(cart);
  },

  renderCart() {
    const cart = this.getCart();

    document.querySelectorAll('[data-cart-count]').forEach(el => {
      el.textContent = String(cart.length);
    });

    const root = document.getElementById('cartItems');
    const total = document.getElementById('cartTotal');

    if (!root) return;

    if (total) total.textContent = String(cart.length);

    root.innerHTML = '';

    if (!cart.length) {
      const p = document.createElement('p');
      p.className = 'cart-empty';
      p.textContent =
        'عربتك لسه فاضية. اختار مشروع واضغط «أضف للسلة».';
      root.appendChild(p);
      return;
    }

    cart.forEach((item, index) => {
      const row = document.createElement('article');
      row.className = 'cart-row';

      const info = document.createElement('div');
      info.className = 'cart-row-info';

      const title = document.createElement('b');
      title.textContent = item.name;

      const category = document.createElement('small');
      category.textContent = this.categoryLabel(item.category);

      info.append(title, category);

      const remove = document.createElement('button');
      remove.type = 'button';
      remove.className = 'cart-remove';
      remove.textContent = 'حذف';
      remove.addEventListener('click', () => {
        this.removeFromCart(index);
      });

      row.append(info, remove);
      root.appendChild(row);
    });
  },

  checkoutCart() {
    const cart = this.getCart();

    if (!cart.length) {
      alert('عربة التسوق فاضية. أضف مشروع الأول.');
      return;
    }

    const lines = cart
      .map((item, i) =>
        `${i + 1}. ${item.name} — ${this.categoryLabel(item.category)}` +
        `${item.description ? `\n   التفاصيل: ${item.description}` : ''}`
      )
      .join('\n');

    const message =
      `السلام عليكم، عايز أطلب المشاريع دي من شقاوة برو:\n\n` +
      `${lines}\n\n` +
      `عدد المشاريع: ${cart.length}\n` +
      'من فضلك ابعتلي تفاصيل الأسعار وطريقة الاستلام.';

    window.open(
      `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`,
      '_blank',
      'noopener'
    );
  }
};

document.addEventListener('DOMContentLoaded', () => {
  const backdrop = document.getElementById('cartBackdrop');

  document.querySelectorAll('[data-open-cart]').forEach(btn => {
    btn.addEventListener('click', () => {
      if (backdrop) {
        backdrop.hidden = false;
        document.body.classList.add('cart-lock');
        window.SHQAWA.renderCart();
      }
    });
  });

  document.querySelectorAll('[data-close-cart]').forEach(btn => {
    btn.addEventListener('click', closeCart);
  });

  backdrop?.addEventListener('click', e => {
    if (e.target === backdrop) closeCart();
  });

  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') closeCart();
  });

  document.getElementById('cartCheckout')?.addEventListener(
    'click',
    () => window.SHQAWA.checkoutCart()
  );

  document.getElementById('cartClear')?.addEventListener(
    'click',
    () => window.SHQAWA.saveCart([])
  );

  window.SHQAWA.renderCart();

  function closeCart() {
    if (backdrop) {
      backdrop.hidden = true;
      document.body.classList.remove('cart-lock');
    }
  }

  // عدد الإشعارات في القائمة العلوية.
  (async()=>{const badge=document.getElementById('navNotificationCount');if(!badge||!window.SHQAWA_DB)return;try{const {count,error}=await window.SHQAWA_DB.from('site_updates').select('id',{count:'exact',head:true}).eq('is_published',true);if(!error&&count>0)badge.textContent=count>9?'9+':String(count);}catch(_){}})();

  // معرض الصور: إغلاق النافذة بزر الإغلاق أو الخلفية أو Escape.
  const galleryModal = document.getElementById('projectGalleryModal');
  galleryModal?.querySelector('[data-gallery-close]')?.addEventListener('click', () => { galleryModal.hidden=true; document.body.classList.remove('gallery-lock'); });
  galleryModal?.addEventListener('click', e => { if(e.target===galleryModal){galleryModal.hidden=true;document.body.classList.remove('gallery-lock');} });
  document.addEventListener('keydown', e => { if(e.key==='Escape' && galleryModal && !galleryModal.hidden){galleryModal.hidden=true;document.body.classList.remove('gallery-lock');} });

  // إعدادات الإعلان ورابط التواصل من مركز تحكم الأدمن.
  (async()=>{const contact=await window.SHQAWA.getSetting('contact_url');if(contact){document.querySelectorAll('a[href*="wa.me/"]').forEach(a=>a.href=contact);}})();

  // المساعد الذكي المحلي: يرشح من بيانات المشاريع الموجودة دون API مدفوع.
  const assistantForm=document.getElementById('assistantForm');
  assistantForm?.addEventListener('submit',async e=>{e.preventDefault();const root=document.getElementById('assistantResults');const q=document.getElementById('assistantQuery').value.trim().toLowerCase();if(!q){root.textContent='اكتب وصفًا بسيطًا للي بتدور عليه.';return;}root.textContent='بندور على أنسب المشاريع...';try{const items=await window.SHQAWA.getItems();const terms=q.split(/\s+/).filter(x=>x.length>1);const ranked=items.map(item=>({item,score:terms.reduce((n,t)=>n+((item.name+' '+item.description+' '+window.SHQAWA.categoryLabel(item.category)).toLowerCase().includes(t)?1:0),0)})).filter(x=>x.score>0).sort((a,b)=>b.score-a.score).slice(0,4);root.innerHTML='';if(!ranked.length){root.textContent='ملقيناش تطابق واضح. جرّب كلمات زي تطبيقات أو تصميمات أو مواقع.';return;}ranked.forEach(({item})=>{const card=document.createElement('article');card.className='assistant-result';const b=document.createElement('b');b.textContent=item.name;const p=document.createElement('p');p.textContent=item.description||window.SHQAWA.categoryLabel(item.category);card.append(b,p);if(item.image){const img=document.createElement('img');img.src=item.image;img.alt=item.name;card.prepend(img);}if(item.id){const btn=document.createElement('button');btn.className='small-button';btn.textContent='عرض الصور';btn.onclick=()=>window.SHQAWA.openGallery(item);card.append(btn);}if(item.link){const a=document.createElement('a');a.href=item.link;a.target='_blank';a.rel='noopener';a.textContent='فتح المشروع ↗';card.append(a);}root.append(card);});}catch(err){root.textContent='تعذر تحميل المشاريع حاليًا.';console.error(err);}});

  // سجل التحديثات والتصويت على الصفحة الرئيسية.
  (async()=>{const root=document.getElementById('publicUpdates');if(root){try{const {data,error}=await window.SHQAWA_DB.from('site_updates').select('title,body,created_at').eq('is_published',true).order('created_at',{ascending:false}).limit(4);if(error)throw error;root.innerHTML='';(data||[]).forEach(u=>{const card=document.createElement('article');card.className='update-card';const h=document.createElement('h3');h.textContent=u.title;const p=document.createElement('p');p.textContent=u.body||'';const small=document.createElement('small');small.textContent=new Date(u.created_at).toLocaleDateString('ar-EG');card.append(h,p,small);root.append(card);});if(!(data||[]).length)root.textContent='مفيش تحديثات جديدة حاليًا.';}catch(_){root.textContent='شغّل ملف SUPABASE-FEATURES.sql لتفعيل سجل التحديثات.';}}
  const polls=document.getElementById('publicPolls');if(polls){try{const {data,error}=await window.SHQAWA_DB.from('site_polls').select('*').eq('is_active',true).order('created_at',{ascending:false}).limit(2);if(error)throw error;for(const poll of data||[]){const card=document.createElement('article');card.className='poll-card';const h=document.createElement('h3');h.textContent=poll.question;card.append(h);const options=Array.isArray(poll.options)?poll.options:[];options.forEach((option,index)=>{const label=document.createElement('label');label.className='poll-option';const radio=document.createElement('input');radio.type='radio';radio.name='poll-'+poll.id;radio.value=String(index);label.append(radio,document.createTextNode(option));card.append(label);});const btn=document.createElement('button');btn.className='btn btn-primary';btn.textContent='صوّت';const result=document.createElement('p');result.className='field-note';btn.onclick=async()=>{const chosen=card.querySelector('input:checked');if(!chosen){result.textContent='اختار إجابة الأول.';return;}const tokenKey='shqawa_poll_'+poll.id;let token=localStorage.getItem(tokenKey);if(!token){token=(crypto.randomUUID?crypto.randomUUID():String(Date.now())+Math.random());localStorage.setItem(tokenKey,token);}const {error:voteError}=await window.SHQAWA_DB.from('site_poll_votes').insert({poll_id:poll.id,option_index:Number(chosen.value),voter_token:token});if(voteError){result.textContent=voteError.code==='23505'?'إنت صوّت قبل كده من الجهاز ده.':'تعذر تسجيل التصويت. حاول لاحقًا.';return;}result.textContent='شكرًا على تصويتك!';btn.disabled=true;};card.append(btn,result);polls.append(card);}}catch(_){polls.textContent='شغّل ملف SUPABASE-FEATURES.sql لتفعيل التصويت.';}}
  })();

});
