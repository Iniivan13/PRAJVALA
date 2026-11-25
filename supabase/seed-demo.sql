-- ============================================================================
-- PRAJVALA — Akun demo Supabase
-- Jalankan setelah supabase/schema.sql.
-- Membuat (atau memperbarui) akun demo yang sudah dikonfirmasi:
--   email    : warga@demo.prajvala.id
--   password : prajvala2026
--
-- Catatan: kolom token auth wajib berisi string kosong, bukan NULL, agar
-- GoTrue dapat membaca baris auth.users saat login.
-- ============================================================================

do $$
declare
  demo_email text := 'warga@demo.prajvala.id';
  demo_password text := 'prajvala2026';
  demo_id uuid;
begin
  select id into demo_id
  from auth.users
  where email = demo_email and is_sso_user = false
  limit 1;

  if demo_id is null then
    demo_id := gen_random_uuid();

    insert into auth.users (
      instance_id,
      id,
      aud,
      role,
      email,
      encrypted_password,
      email_confirmed_at,
      raw_app_meta_data,
      raw_user_meta_data,
      created_at,
      updated_at
    ) values (
      '00000000-0000-0000-0000-000000000000',
      demo_id,
      'authenticated',
      'authenticated',
      demo_email,
      extensions.crypt(demo_password, extensions.gen_salt('bf')),
      now(),
      '{"provider":"email","providers":["email"]}'::jsonb,
      '{"full_name":"Warga Demo","region_id":"all"}'::jsonb,
      now(),
      now()
    );
  else
    update auth.users set
      encrypted_password = extensions.crypt(demo_password, extensions.gen_salt('bf')),
      email_confirmed_at = now(),
      updated_at = now(),
      raw_app_meta_data = '{"provider":"email","providers":["email"]}'::jsonb
    where id = demo_id;
  end if;

  -- Token kosong (bukan NULL) agar kompatibel dengan pemindaian GoTrue.
  update auth.users set
    confirmation_token = coalesce(confirmation_token, ''),
    recovery_token = coalesce(recovery_token, ''),
    email_change_token_new = coalesce(email_change_token_new, ''),
    email_change = coalesce(email_change, ''),
    email_change_token_current = coalesce(email_change_token_current, ''),
    phone_change = coalesce(phone_change, ''),
    phone_change_token = coalesce(phone_change_token, ''),
    reauthentication_token = coalesce(reauthentication_token, '')
  where id = demo_id;

  insert into auth.identities (
    provider_id,
    user_id,
    identity_data,
    provider,
    last_sign_in_at,
    created_at,
    updated_at
  ) values (
    demo_id::text,
    demo_id,
    jsonb_build_object(
      'sub', demo_id::text,
      'email', demo_email,
      'email_verified', true,
      'phone_verified', false
    ),
    'email',
    now(),
    now(),
    now()
  )
  on conflict (provider_id, provider) do nothing;

  insert into public.profiles (id, full_name, region_id)
  values (demo_id, 'Warga Demo', 'all')
  on conflict (id) do update set
    full_name = excluded.full_name,
    updated_at = now();
end $$;
