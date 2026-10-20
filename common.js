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

    return (data || []).map(row => ({
      id: String(row.id),
      name: row.title || row.name || '',
      category: row.category || 'web',
      description: row.description || '',
      image: row.image_url || row.image || '',
      link: row.project_url || row.link || '',
      createdAt: row.created_at
        ? new Date(row.created_at).getTime()
        : Date.now()
    }));
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
});
