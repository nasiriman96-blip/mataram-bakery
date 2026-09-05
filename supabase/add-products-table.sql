-- ============================================================
-- MIGRASI TAMBAHAN: Tabel produk
-- Jalankan file ini di Supabase SQL Editor kalau kamu SUDAH PERNAH
-- menjalankan schema.sql sebelumnya (supaya tidak error "already exists").
-- Kalau ini instalasi baru, cukup jalankan schema.sql saja (sudah termasuk ini).
-- ============================================================

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

create policy "products_update_all"
on public.products for update
to authenticated
using (true)
with check (true);

create policy "products_delete_all"
on public.products for delete
to authenticated
using (true);

-- Isi data produk awal (hanya jika tabel produk masih kosong)
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
