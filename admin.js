
document.addEventListener('DOMContentLoaded', () => {
  const $ = id => document.getElementById(id);
  const db = window.SHQAWA_DB;

  const login = $('adminLogin');
  const loginForm = $('adminLoginForm');
  const loginError = $('adminLoginError');

  const form = $('itemForm');
  const file = $('itemImage');
  const galleryInput = $('itemGallery');
  const galleryPreview = $('galleryPreview');
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
  galleryInput?.addEventListener('change', () => {
    galleryPreview.innerHTML = '';
    const files = Array.from(galleryInput.files || []);
    galleryPreview.hidden = !files.length;
    files.forEach(f => { const img = document.createElement('img'); img.src = URL.createObjectURL(f); img.alt = f.name; galleryPreview.appendChild(img); });
    if (files.length) msg(`تم اختيار ${files.length} صورة للمعرض.`, true);
  });

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

      const publishAtRaw = $('publishAt')?.value || '';
      const payload = {
        title: $('itemName').value.trim(), category: $('itemCategory').value,
        description: $('itemDescription').value.trim(), image_url: nextImage || null,
        project_url: $('itemLink').value.trim() || null,
        is_published: $('isPublished')?.checked !== false,
        publish_at: publishAtRaw ? new Date(publishAtRaw).toISOString() : null
      };

      if (!payload.title) {
        throw new Error('اكتب اسم المشروع الأول.');
      }

      let result;

      let projectId = id;
      if (id) {
        result = await db.from('projects').update(payload).eq('id', id);
      } else {
        result = await db.from('projects').insert(payload).select('id').single();
        if (!result.error) projectId = result.data?.id;
      }
      if (result.error) throw result.error;

      const galleryFiles = Array.from(galleryInput?.files || []);
      if (galleryFiles.length) {
        const rows = [];
        for (let i = 0; i < galleryFiles.length; i++) {
          const url = await uploadImage(galleryFiles[i]);
          rows.push({ project_id: String(projectId), image_url: url, sort_order: i });
          if (!nextImage && i === 0) nextImage = url;
        }
        const { error: galleryError } = await db.from('project_images').insert(rows);
        if (galleryError) throw new Error('تم حفظ بيانات المشروع لكن تعذر حفظ معرض الصور. شغّل ملف SUPABASE-FEATURES.sql ثم جرّب رفع صور المعرض مرة أخرى. ' + galleryError.message);
        if (!id && nextImage) {
          const { error: coverError } = await db.from('projects').update({ image_url: nextImage }).eq('id', projectId);
          if (coverError) console.warn('Could not set gallery cover:', coverError.message);
        }
      }

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
    if (galleryInput) galleryInput.value = '';
    if (galleryPreview) { galleryPreview.hidden = true; galleryPreview.innerHTML = ''; }
    if ($('isPublished')) $('isPublished').checked = true;

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
      const { data, error } = await db.from('projects').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      currentItems = (data || []).map(row => ({ id:String(row.id), name:row.title || row.name || '', category:row.category || 'web', description:row.description || '', image:row.image_url || row.image || '', link:row.project_url || row.link || '', publishAt:row.publish_at || '', isPublished:row.is_published !== false }));
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
        '<span>S</span><b>لسه مفيش مشاريع</b>' +
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
      meta.textContent = window.SHQAWA.categoryLabel(item.category) + (item.publishAt && new Date(item.publishAt) > new Date() ? ' · مجدول' : (item.isPublished === false ? ' · مخفي' : '')); 

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
        if ($('publishAt')) $('publishAt').value = item.publishAt ? new Date(item.publishAt).toISOString().slice(0,16) : '';
        if ($('isPublished')) $('isPublished').checked = item.isPublished !== false;
        if (galleryInput) galleryInput.value = '';
        if (galleryPreview) { galleryPreview.hidden = true; galleryPreview.innerHTML = ''; }

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

  // أدوات مركز التحكم: الإعدادات، سجل التحديثات، والتصويت.
  const settingForm = $('siteSettingsForm');
  settingForm?.addEventListener('submit', async e => {
    e.preventDefault(); const out = $('settingsMessage');
    try {
      const rows = [
        {setting_key:'announcement', setting_value:$('settingAnnouncement').value.trim(), updated_at:new Date().toISOString()},
        {setting_key:'contact_url', setting_value:$('settingContact').value.trim(), updated_at:new Date().toISOString()}
      ];
      const {error} = await db.from('site_settings').upsert(rows, {onConflict:'setting_key'});
      if (error) throw error; out.textContent = 'تم حفظ إعدادات الموقع.'; out.style.color='#8ee0ae';
    } catch(err) { out.textContent = 'تعذر حفظ الإعدادات. تأكد من تشغيل SUPABASE-FEATURES.sql. ' + errorText(err); out.style.color='#ff8796'; }
  });
  (async()=>{ try { const {data,error}=await db.from('site_settings').select('setting_key,setting_value'); if(error) return; (data||[]).forEach(x=>{if(x.setting_key==='announcement') $('settingAnnouncement').value=x.setting_value;if(x.setting_key==='contact_url') $('settingContact').value=x.setting_value;}); } catch(_){} })();

  $('updateForm')?.addEventListener('submit', async e => {
    e.preventDefault(); const out=$('updateMessage');
    try { const {error}=await db.from('site_updates').insert({title:$('updateTitle').value.trim(),body:$('updateBody').value.trim(),is_published:true}); if(error) throw error; $('updateForm').reset(); out.textContent='تم نشر التحديث.'; out.style.color='#8ee0ae'; await renderAdminUpdates(); }
    catch(err){out.textContent='تعذر النشر. شغّل SUPABASE-FEATURES.sql. '+errorText(err);out.style.color='#ff8796';}
  });
  async function renderAdminUpdates(){ const root=$('adminUpdates'); if(!root)return; try{const {data,error}=await db.from('site_updates').select('*').order('created_at',{ascending:false}).limit(5);if(error)throw error;root.innerHTML='';(data||[]).forEach(u=>{const d=document.createElement('div');d.className='admin-mini-row';const b=document.createElement('b');b.textContent=u.title;const del=document.createElement('button');del.className='small-button delete';del.textContent='حذف';del.onclick=async()=>{if(confirm('حذف التحديث؟')){const r=await db.from('site_updates').delete().eq('id',u.id);if(!r.error)renderAdminUpdates();}};d.append(b,del);root.appendChild(d);});}catch(_){} }
  renderAdminUpdates();

  $('pollForm')?.addEventListener('submit', async e => {
    e.preventDefault(); const out=$('pollMessage'); const options=$('pollOptions').value.split('\n').map(x=>x.trim()).filter(Boolean);
    if(options.length<2){out.textContent='اكتب اختيارين على الأقل، كل اختيار في سطر.';return;}
    try { const {error}=await db.from('site_polls').insert({question:$('pollQuestion').value.trim(),options,is_active:true});if(error)throw error;$('pollForm').reset();out.textContent='تم نشر التصويت.';out.style.color='#8ee0ae';await renderAdminPolls(); }
    catch(err){out.textContent='تعذر نشر التصويت. شغّل SUPABASE-FEATURES.sql. '+errorText(err);out.style.color='#ff8796';}
  });
  async function renderAdminPolls(){const root=$('adminPolls');if(!root)return;try{const {data,error}=await db.from('site_polls').select('*').order('created_at',{ascending:false}).limit(5);if(error)throw error;root.innerHTML='';for(const p of (data||[])){const d=document.createElement('div');d.className='admin-mini-row';const info=document.createElement('div');const b=document.createElement('b');b.textContent=p.question;info.appendChild(b);const {data:votes}=await db.from('site_poll_votes').select('option_index').eq('poll_id',p.id);const counts=(Array.isArray(p.options)?p.options:[]).map((option,i)=>`${option}: ${(votes||[]).filter(v=>v.option_index===i).length}`);const small=document.createElement('small');small.textContent=counts.join(' · ');info.appendChild(small);const del=document.createElement('button');del.className='small-button delete';del.textContent='حذف';del.onclick=async()=>{if(confirm('حذف التصويت؟')){const r=await db.from('site_polls').delete().eq('id',p.id);if(!r.error)renderAdminPolls();}};d.append(info,del);root.appendChild(d);}}catch(_){} }
  renderAdminPolls();

});
