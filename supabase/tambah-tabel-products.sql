-- ============================================================
-- Jalankan file INI saja kalau kamu SUDAH pernah menjalankan
-- schema.sql sebelumnya (supaya tidak error "already exists").
-- Cukup tambah tabel products yang baru.
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

drop policy if exists "products_select_all" on public.products;
create policy "products_select_all"
on public.products for select
to authenticated
using (true);

drop policy if exists "products_insert_all" on public.products;
create policy "products_insert_all"
on public.products for insert
to authenticated
with check (true);

drop policy if exists "products_delete_all" on public.products;
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
