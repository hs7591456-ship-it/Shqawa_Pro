-- شقاوة برو: إعدادات مكملة للجداول التي أنشأها SQL السابق.
-- لا يحذف هذا الملف جدول projects أو بياناته.

-- تأكيد سياسات القراءة والكتابة على جدول المشاريع الموجود (title/image_url/project_url).
alter table public.projects enable row level security;
drop policy if exists "Public can view projects" on public.projects;
create policy "Public can view projects" on public.projects for select to anon, authenticated using (true);
drop policy if exists "Admins can insert projects" on public.projects;
create policy "Admins can insert projects" on public.projects for insert to authenticated
with check (exists (select 1 from public.site_admins where user_id = (select auth.uid())));
drop policy if exists "Admins can update projects" on public.projects;
create policy "Admins can update projects" on public.projects for update to authenticated
using (exists (select 1 from public.site_admins where user_id = (select auth.uid())))
with check (exists (select 1 from public.site_admins where user_id = (select auth.uid())));
drop policy if exists "Admins can delete projects" on public.projects;
create policy "Admins can delete projects" on public.projects for delete to authenticated
using (exists (select 1 from public.site_admins where user_id = (select auth.uid())));

-- أنشئ bucket عام لعرض صور المشاريع. الكتابة ما زالت محصورة في المديرين.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('project-images', 'project-images', true, 8388608, array['image/jpeg','image/png','image/webp','image/gif'])
on conflict (id) do update set public = true, file_size_limit = 8388608,
allowed_mime_types = array['image/jpeg','image/png','image/webp','image/gif'];

drop policy if exists "Public can view project images" on storage.objects;
create policy "Public can view project images" on storage.objects for select to anon, authenticated
using (bucket_id = 'project-images');
drop policy if exists "Admins can upload project images" on storage.objects;
create policy "Admins can upload project images" on storage.objects for insert to authenticated
with check (bucket_id = 'project-images' and exists (select 1 from public.site_admins where user_id = (select auth.uid())));
drop policy if exists "Admins can update project images" on storage.objects;
create policy "Admins can update project images" on storage.objects for update to authenticated
using (bucket_id = 'project-images' and exists (select 1 from public.site_admins where user_id = (select auth.uid())))
with check (bucket_id = 'project-images' and exists (select 1 from public.site_admins where user_id = (select auth.uid())));
drop policy if exists "Admins can delete project images" on storage.objects;
create policy "Admins can delete project images" on storage.objects for delete to authenticated
using (bucket_id = 'project-images' and exists (select 1 from public.site_admins where user_id = (select auth.uid())));

-- بعد إنشاء حساب المدير من Authentication > Users، انسخ UUID الخاص به
-- وشغّل هذا السطر وحده بعد استبدال UUID_HERE:
-- insert into public.site_admins (user_id) values ('UUID_HERE') on conflict do nothing;
