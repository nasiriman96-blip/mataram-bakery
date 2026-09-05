-- ============================================================
-- Skema Mataram Bakery untuk Supabase
-- Jalankan seluruh file ini di Supabase Dashboard -> SQL Editor
-- ============================================================

-- 1) Tabel profil user (menyimpan role: user / admin)
create table if not exists public.profiles (
  id uuid references auth.users(id) on delete cascade primary key,
  email text,
  role text not null default 'user' check (role in ('user','admin')),
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

-- User hanya boleh melihat profilnya sendiri
create policy "profiles_select_own"
on public.profiles for select
to authenticated
using (auth.uid() = id);

-- User boleh update namanya sendiri (role TIDAK bisa diubah lewat sini,
-- perubahan role hanya lewat SQL Editor / dashboard oleh pemilik project)
create policy "profiles_update_own"
on public.profiles for update
to authenticated
using (auth.uid() = id)
with check (auth.uid() = id and role = (select role from public.profiles where id = auth.uid()));

-- Otomatis membuat baris profil setiap kali ada user baru mendaftar
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, email, role)
  values (new.id, new.email, 'user');
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();


-- 2) Tabel riwayat transaksi (kasir, dompet, dsb.)
create table if not exists public.transactions (
  id bigint generated always as identity primary key,
  type text not null,
  date timestamptz not null default now(),
  total numeric,
  hpp numeric,
  profit numeric,
  items jsonb,
  amount numeric,
  note text,
  wallet text,
  "from" text,
  "to" text,
  created_by uuid references auth.users(id),
  created_at timestamptz not null default now()
);

alter table public.transactions enable row level security;

-- Semua user yang sudah login boleh melihat & menambah riwayat
create policy "transactions_select_all"
on public.transactions for select
to authenticated
using (true);

create policy "transactions_insert_all"
on public.transactions for insert
to authenticated
with check (true);

-- HANYA admin yang boleh menghapus riwayat
create policy "transactions_delete_admin_only"
on public.transactions for delete
to authenticated
using (
  exists (
    select 1 from public.profiles
    where profiles.id = auth.uid() and profiles.role = 'admin'
  )
);

-- ============================================================
-- Cara menjadikan sebuah akun sebagai admin:
-- (jalankan setelah akun tsb. mendaftar lewat aplikasi)
--
-- update public.profiles set role = 'admin' where email = 'admin@email-kamu.com';
-- ============================================================


-- 3) Tabel produk (menu roti/kue) — supaya tambah/hapus produk tersimpan permanen
create table if not exists public.products (
  id bigint generated always as identity primary key,
  name text not null,
  category text not null,
  kind text not null,
  cost numeric not null default 0,
  price numeric not null default 0,
  created_by uuid references auth.users(id),
  created_at timestamptz not null default now()
);

alter table public.products enable row level security;

create policy "products_select_all"
on public.products for select
to authenticated
using (true);

create policy "products_insert_all"
on public.products for insert
to authenticated
with check (true);

create policy "products_delete_all"
on public.products for delete
to authenticated
using (true);

-- Data awal (menu default) — hanya berjalan kalau tabel produk masih kosong
insert into public.products (name, category, kind, cost, price)
select * from (values
  ('Roti Tawar Gandum', 'roti', 'bread', 8000, 15000),
  ('Roti Sobek Keju', 'roti', 'bread', 11000, 20000),
  ('Croissant Butter', 'pastry', 'pastry', 9000, 18000),
  ('Cinnamon Roll', 'pastry', 'pastry', 10000, 20000),
  ('Donat Coklat', 'pastry', 'pastry', 4000, 8000),
  ('Brownies Slice', 'kue', 'cake', 7000, 15000),
  ('Kue Lapis Legit', 'kue', 'cake', 12000, 22000),
  ('Red Velvet Slice', 'kue', 'cake', 9000, 19000),
  ('Nastar Toples', 'kering', 'cookie', 15000, 28000),
  ('Kastengel Toples', 'kering', 'cookie', 16000, 30000)
) as seed(name, category, kind, cost, price)
where not exists (select 1 from public.products);


-- 3) Tabel produk (menu roti/kue di halaman Kasir)
create table if not exists public.products (
  id bigint generated always as identity primary key,
  name text not null,
  category text not null,
  kind text not null,
  cost numeric not null default 0,
  price numeric not null default 0,
  created_by uuid references auth.users(id),
  created_at timestamptz not null default now()
);

alter table public.products enable row level security;

-- Semua user yang login boleh lihat, tambah, ubah, dan hapus produk
create policy "products_select_all"
on public.products for select
to authenticated
using (true);

create policy "products_insert_all"
on public.products for insert
to authenticated
with check (true);

create policy "products_update_all"
on public.products for update
to authenticated
using (true)
with check (true);

create policy "products_delete_all"
on public.products for delete
to authenticated
using (true);

-- Isi data produk awal (hanya jika tabel produk masih kosong, aman dijalankan berkali-kali)
insert into public.products (name, category, kind, cost, price)
select * from (values
  ('Roti Tawar Gandum', 'roti', 'bread', 8000, 15000),
  ('Roti Sobek Keju', 'roti', 'bread', 11000, 20000),
  ('Croissant Butter', 'pastry', 'pastry', 9000, 18000),
  ('Cinnamon Roll', 'pastry', 'pastry', 10000, 20000),
  ('Donat Coklat', 'pastry', 'pastry', 4000, 8000),
  ('Brownies Slice', 'kue', 'cake', 7000, 15000),
  ('Kue Lapis Legit', 'kue', 'cake', 12000, 22000),
  ('Red Velvet Slice', 'kue', 'cake', 9000, 19000),
  ('Nastar Toples', 'kering', 'cookie', 15000, 28000),
  ('Kastengel Toples', 'kering', 'cookie', 16000, 30000)
) as seed(name, category, kind, cost, price)
where not exists (select 1 from public.products limit 1);
