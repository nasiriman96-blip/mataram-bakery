# Mataram Bakery — Kasir & Keuangan (dengan Login Supabase)

Aplikasi kasir toko roti dengan login aman, dua peran user (**user** & **admin**),
riwayat transaksi tersimpan di Supabase, dan akses hapus riwayat khusus admin.

## Apa yang berubah dari versi sebelumnya
- ✅ Login & daftar akun (email + kata sandi) memakai **Supabase Auth**.
- ✅ Data user & role (`user` / `admin`) disimpan di tabel `profiles` di Supabase.
- ✅ Riwayat transaksi disimpan di tabel `transactions` di Supabase (bukan lagi data acak sementara).
- ✅ Hanya akun dengan role **admin** yang bisa menghapus riwayat (per item atau hapus semua), diproteksi lewat Row Level Security (RLS) di database — bukan cuma disembunyikan di tampilan.
- ✅ Ikon dompet **Modal** diganti jadi ikon **kucing** 🐱.

---

## 1. Buat project Supabase

1. Buka https://supabase.com → buat project baru (gratis).
2. Buka **SQL Editor** di dashboard Supabase, tempel seluruh isi file
   `supabase/schema.sql` dari folder ini, lalu klik **Run**.
   Ini akan membuat tabel `profiles`, `transactions`, trigger otomatis, dan aturan keamanan (RLS).
3. Buka **Project Settings → API**, salin:
   - `Project URL`
   - `anon public key`

### Rekomendasi pengaturan keamanan login (disarankan, opsional)
Di **Authentication → Providers/Policies** Supabase:
- Aktifkan **Confirm email** agar pendaftaran wajib verifikasi email.
- Atur **Minimum password length** ke 8+.
- Aktifkan **Leaked password protection** jika tersedia di plan kamu.

## 2. Jadikan satu akun sebagai Admin

1. Daftar dulu lewat aplikasi (langkah 4) menggunakan email yang ingin dijadikan admin.
2. Kembali ke **SQL Editor** Supabase, jalankan:
   ```sql
   update public.profiles set role = 'admin' where email = 'admin@email-kamu.com';
   ```
3. Akun tersebut sekarang bisa menghapus riwayat transaksi (per item atau hapus semua) di tab **Riwayat**.

## 3. Konfigurasi environment lokal

```bash
cp .env.example .env
```
Isi `.env` dengan `Project URL` dan `anon public key` dari langkah 1.
File `.env` sudah otomatis diabaikan git (lihat `.gitignore`) supaya kunci rahasia tidak ikut ter-upload ke GitHub.

## 4. Jalankan aplikasi

```bash
npm install
npm run dev
```
Buka alamat yang muncul di terminal (biasanya `http://localhost:5173`).

## 5. Unggah ke GitHub

```bash
git init
git add .
git commit -m "Mataram Bakery: login Supabase + akses admin"
git branch -M main
git remote add origin https://github.com/USERNAME/NAMA-REPO.git
git push -u origin main
```
Ganti `USERNAME/NAMA-REPO` dengan repo GitHub kamu. **Jangan** meng-commit file `.env` — file itu berisi kunci Supabase.

## 6. Deploy agar bisa diakses online (opsional)

Supabase menyediakan backend (auth + database), tapi tidak meng-host tampilan React-nya.
Cara termudah menaruh tampilan ini online: hubungkan repo GitHub kamu ke **Vercel** atau **Netlify**
(gratis untuk project kecil), lalu tambahkan `VITE_SUPABASE_URL` dan `VITE_SUPABASE_ANON_KEY`
di pengaturan Environment Variables platform tersebut.

---

## Struktur folder
```
src/
  App.jsx              -> gerbang login (menampilkan Login atau MainApp)
  MainApp.jsx           -> seluruh tampilan kasir/dompet/riwayat (dari desain asli kamu)
  styles.js             -> semua CSS aplikasi
  lib/supabaseClient.js -> koneksi ke Supabase
  hooks/useAuth.js      -> status login & role user
  components/Login.jsx  -> form masuk & daftar
supabase/schema.sql      -> skema database + aturan keamanan (jalankan di SQL Editor)
```

## Catatan
- Data produk (menu roti/kue) kini juga tersimpan permanen di Supabase (tabel `products`), jadi tambah/hapus produk tidak akan hilang saat refresh atau dibuka dari perangkat lain.
- Saya (Claude) tidak bisa langsung login ke akun Supabase/GitHub kamu untuk melakukan deploy — langkah di atas perlu dijalankan sendiri karena butuh kredensial akun kamu. Kalau ada error di salah satu langkah, tempel pesan errornya ke saya, saya bantu perbaiki.
