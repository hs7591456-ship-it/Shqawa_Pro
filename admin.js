
document.addEventListener('DOMContentLoaded', () => {
  const $ = id => document.getElementById(id);
  const db = window.SHQAWA_DB;

  const login = $('adminLogin');
  const loginForm = $('adminLoginForm');
  const loginError = $('adminLoginError');

  const form = $('itemForm');
  const file = $('itemImage');
  const preview = $('imagePreview');
  const message = $('formMessage');

  let imageUrl = '';
  let currentItems = [];

  function msg(t, ok = false) {
    if (!message) return;
    message.textContent = t;
    message.style.color = ok ? '#8ee0ae' : '#ff8796';
  }

  function loginMsg(t) {
    if (loginError) loginError.textContent = t;
  }

  function errorText(err) {
    return err?.message || err?.error_description ||
      'خطأ غير معروف. حاول مرة أخرى.';
  }

  if (!db) {
    loginMsg(
      'إعداد Supabase غير مكتمل. راجع ملف supabase-config.js والمفتاح العام.'
    );
    return;
  }

  // تسجيل دخول المدير
  loginForm?.addEventListener('submit', async e => {
    e.preventDefault();

    const email = $('adminEmail').value.trim();
    const password = $('adminPassword').value;

    if (!email || !password) {
      loginMsg('اكتب البريد الإلكتروني وكلمة المرور.');
      return;
    }

    loginMsg('جاري التحقق من الحساب...');
    const submitButton = loginForm.querySelector(
      'button[type="submit"], input[type="submit"]'
    );

    if (submitButton) submitButton.disabled = true;

    try {
      const { data, error } = await db.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        console.error('Supabase login error:', error);
        loginMsg('فشل تسجيل الدخول: ' + errorText(error));
        return;
      }

      if (!data.user) {
        loginMsg('لم يتم العثور على بيانات المستخدم.');
        return;
      }

      const {
        data: admin,
        error: adminError
      } = await db
        .from('site_admins')
        .select('user_id')
        .eq('user_id', data.user.id)
        .maybeSingle();

      if (adminError) {
        console.error('Admin permissions error:', adminError);
        await db.auth.signOut();
        loginMsg(
          'تعذر التحقق من صلاحيات المدير: ' +
          errorText(adminError)
        );
        return;
      }

      if (!admin) {
        await db.auth.signOut();
        loginMsg(
          'الحساب صحيح، لكنه غير مضاف إلى جدول مديري الموقع.'
        );
        return;
      }

      login.style.display = 'none';
      await loadAndRender();

    } catch (err) {
      console.error('Login request failed:', err);
      loginMsg(
        'تعذر إكمال تسجيل الدخول: ' + errorText(err) +
        '. تحقق من اتصال الإنترنت وإعدادات Supabase.'
      );
    } finally {
      if (submitButton) submitButton.disabled = false;
    }
  });

  // استعادة كلمة المرور
  const forgot = $('forgotPasswordButton');

  forgot?.addEventListener('click', async () => {
    const email = $('adminEmail').value.trim();

    if (!email) {
      loginMsg(
        'اكتب بريد المدير في الخانة بالأعلى، ثم اضغط نسيت كلمة المرور.'
      );
      return;
    }

    forgot.disabled = true;
    loginMsg('جاري إرسال رابط إعادة التعيين...');

    try {
      const { error } = await db.auth.resetPasswordForEmail(
        email,
        {
          redirectTo:
            window.location.origin + '/reset-password.html'
        }
      );

      if (error) {
        console.error('Password recovery error:', error);
        loginMsg('تعذر إرسال الرسالة: ' + errorText(error));
        return;
      }

      loginMsg(
        'تم طلب رابط إعادة التعيين. افحص بريدك الإلكتروني.'
      );

    } catch (err) {
      console.error('Password recovery request failed:', err);
      loginMsg(
        'فشل الاتصال أثناء إرسال الرابط: ' + errorText(err) +
        '. تأكد من الإنترنت وإعدادات Supabase.'
      );
    } finally {
      forgot.disabled = false;
    }
  });

  // استعادة جلسة المدير السابقة
  db.auth.getSession()
    .then(async ({ data, error }) => {
      if (error) {
        console.error('Session error:', error);
        return;
      }

      if (!data.session) return;

      const { data: admin, error: adminError } = await db
        .from('site_admins')
        .select('user_id')
        .eq('user_id', data.session.user.id)
        .maybeSingle();

      if (adminError) {
        console.error('Session admin check failed:', adminError);
        return;
      }

      if (admin) {
        login.style.display = 'none';
        await loadAndRender();
      } else {
        await db.auth.signOut();
      }
    })
    .catch(err => {
      console.error('Unable to restore session:', err);
    });

  // رفع الصور إلى Supabase Storage
  async function uploadImage(fileObj) {
    if (!fileObj) return '';

    if (!fileObj.type.startsWith('image/')) {
      throw new Error('اختار ملف صورة صحيح.');
    }

    if (fileObj.size > 8 * 1024 * 1024) {
      throw new Error(
        'حجم الصورة أكبر من 8 ميجابايت. اختار صورة أصغر.'
      );
    }

    const ext = (
      fileObj.name.split('.').pop() || 'jpg'
    ).toLowerCase().replace(/[^a-z0-9]/g, '') || 'jpg';

    const path =
      `projects/${Date.now()}-${crypto.randomUUID()}.${ext}`;

    const { error } = await db.storage
      .from('project-images')
      .upload(path, fileObj, {
        upsert: false,
        contentType: fileObj.type
      });

    if (error) throw error;

    const { data } = db.storage
      .from('project-images')
      .getPublicUrl(path);

    return data.publicUrl;
  }

  // معاينة الصورة قبل الحفظ
  file?.addEventListener('change', () => {
    imageUrl = '';
    preview.hidden = true;
    preview.innerHTML = '';

    if (!file.files[0]) return;

    const img = document.createElement('img');
    img.src = URL.createObjectURL(file.files[0]);
    img.alt = 'معاينة الصورة';

    preview.appendChild(img);
    preview.hidden = false;

    msg('الصورة جاهزة للرفع السحابي عند الحفظ.', true);
  });

  // إضافة مشروع أو تعديل مشروع موجود
  form?.addEventListener('submit', async e => {
    e.preventDefault();

    const save = $('saveButton');
    save.disabled = true;
    save.textContent = 'جاري الحفظ...';

    try {
      const id = $('itemId').value;

      const old = currentItems.find(
        x => String(x.id) === String(id)
      );

      let nextImage = old?.image || '';

      if (file.files[0]) {
        nextImage = await uploadImage(file.files[0]);
      }

      const payload = {
        title: $('itemName').value.trim(),
        category: $('itemCategory').value,
        description: $('itemDescription').value.trim(),
        image_url: nextImage || null,
        project_url: $('itemLink').value.trim() || null
      };

      if (!payload.title) {
        throw new Error('اكتب اسم المشروع الأول.');
      }

      let result;

      if (id) {
        result = await db
          .from('projects')
          .update(payload)
          .eq('id', id);
      } else {
        result = await db
          .from('projects')
          .insert(payload);
      }

      if (result.error) throw result.error;

      resetForm();
      await loadAndRender();

      msg(
        id
          ? 'تم تحديث المشروع على الموقع.'
          : 'تمت إضافة المشروع إلى الموقع.',
        true
      );

    } catch (err) {
      console.error('Save project error:', err);
      msg(
        'تعذر حفظ المشروع: ' + errorText(err)
      );
    } finally {
      save.disabled = false;
      save.textContent = $('itemId').value
        ? 'حفظ التعديلات'
        : 'حفظ المشروع';
    }
  });

  // إلغاء التعديل
  $('cancelEdit')?.addEventListener('click', () => {
    resetForm();
    msg('تم إلغاء التعديل.', true);
  });

  function resetForm() {
    $('itemId').value = '';
    form.reset();

    imageUrl = '';
    preview.hidden = true;
    preview.innerHTML = '';

    $('formTitle').textContent = '＋ إضافة مشروع جديد';
    $('saveButton').textContent = 'حفظ المشروع';
    $('cancelEdit').hidden = true;
  }

  // تحميل المشاريع
  async function loadAndRender() {
    try {
      currentItems = await window.SHQAWA.getItems();
      renderItems();
    } catch (err) {
      console.error('Load projects error:', err);
      msg(
        'تعذر تحميل المشاريع: ' + errorText(err)
      );
    }
  }

  // عرض المشاريع وأزرار التعديل والحذف
  function renderItems() {
    const root = $('adminItems');

    $('adminCount').textContent =
      currentItems.length + ' مشروع';

    root.innerHTML = '';

    if (!currentItems.length) {
      root.innerHTML =
        '<div class="empty-state">' +
        '<span>✦</span><b>لسه مفيش مشاريع</b>' +
        '<p>أضف أول مشروع من النموذج بالأعلى.</p></div>';
      return;
    }

    currentItems.forEach(item => {
      const row = document.createElement('article');
      row.className = 'admin-item';

      if (item.image) {
        const img = document.createElement('img');
        img.src = item.image;
        img.alt = '';
        row.appendChild(img);
      } else {
        const ph = document.createElement('div');
        ph.className = 'admin-thumb-placeholder';
        row.appendChild(ph);
      }

      const info = document.createElement('div');
      info.className = 'admin-item-main';

      const title = document.createElement('b');
      title.textContent = item.name;

      const meta = document.createElement('small');
      meta.textContent =
        window.SHQAWA.categoryLabel(item.category);

      info.append(title, meta);

      const actions = document.createElement('div');
      actions.className = 'admin-item-actions';

      // زر التعديل
      const edit = document.createElement('button');
      edit.className = 'small-button';
      edit.textContent = 'تعديل';

      edit.addEventListener('click', () => {
        $('itemId').value = item.id;
        $('itemName').value = item.name;
        $('itemCategory').value = item.category;
        $('itemDescription').value = item.description || '';
        $('itemLink').value = item.link || '';

        file.value = '';
        imageUrl = item.image || '';
        preview.innerHTML = '';

        if (imageUrl) {
          const im = document.createElement('img');
          im.src = imageUrl;
          im.alt = 'معاينة الصورة الحالية';
          preview.appendChild(im);
          preview.hidden = false;
        } else {
          preview.hidden = true;
        }

        $('formTitle').textContent = '✎ تعديل المشروع';
        $('saveButton').textContent = 'حفظ التعديلات';
        $('cancelEdit').hidden = false;

        msg('تقدر تعدّل البيانات أو تختار صورة جديدة.', true);

        $('editorCard').scrollIntoView({
          behavior: 'smooth'
        });
      });

      // زر الحذف
      const del = document.createElement('button');
      del.className = 'small-button delete';
      del.textContent = 'حذف';

      del.addEventListener('click', async () => {
        if (!confirm(
          'متأكد إنك عايز تحذف المشروع ده من الموقع لكل الزوار؟'
        )) {
          return;
        }

        del.disabled = true;

        try {
          const { error } = await db
            .from('projects')
            .delete()
            .eq('id', item.id);

          if (error) throw error;

          await loadAndRender();
          msg('تم حذف المشروع من الموقع.', true);

        } catch (err) {
          console.error('Delete project error:', err);
          msg('تعذر الحذف: ' + errorText(err));
          del.disabled = false;
        }
      });

      actions.append(edit, del);
      row.append(info, actions);
      root.appendChild(row);
    });
  }
});
