# PRAJVALA

**Platform Rakyat untuk Jaminan Validitas dan Akuntabilitas** — sebuah purwarupa
civic-tech untuk membaca anggaran publik, menelusuri proyek pembangunan, dan
memverifikasi kondisi lapangan bersama warga.

> Dikembangkan oleh **Tim Aetherion Vanakei — Cyber University** untuk
> **Techcomfest 2027** (Smart Governance & Public Service / SDG 16).

---

## Ringkasan

PRAJVALA (dari bahasa Sanskerta: *cahaya yang menyinari*) menghubungkan tiga hal
yang biasanya terpisah: dokumen anggaran, bukti fisik proyek, dan suara warga.
Seluruh antarmuka dan data percontohan disusun dalam Bahasa Indonesia dengan angka
rupiah yang realistis.

Fitur utama:

- **Dashboard anggaran** — KPI pagu/realisasi, arus kas bulanan (Recharts),
  komposisi sektor (donut interaktif), dan tabel RAB–LPJ yang dapat dicari,
  difilter, diurutkan, serta diekspor ke CSV.
- **Peta proyek** — Leaflet + OpenStreetMap dengan marker berwarna sesuai status,
  popup ringkasan, dan filter wilayah/kategori/status.
- **Detail proyek** — slider foto sebelum–sesudah, jejak milestone, rincian
  anggaran, koordinat geotag, dan skor validasi warga.
- **Validasi partisipatif** — feed laporan warga, dukungan (upvote), formulir
  laporan dengan simulasi pembersihan EXIF, deteksi GPS, unggah foto, serta
  penyimpanan langsung ke Supabase.
- **Pusat informasi** — repositori dokumen APBD/APBDes, RAB, tender, LPJ, dan
  laporan akhir dengan ringkasan bahasa manusia, pencarian, unduhan `.txt`,
  pertanyaan umum, serta glosarium istilah anggaran.
- **Pemilih wilayah** — data seluruh halaman mengikuti wilayah yang dipilih dan
  pilihannya tersimpan di perangkat.
- **Akun warga** — daftar/masuk dengan Supabase Auth, prefilling identitas
  laporan, dan dasbor akun berisi riwayat kontribusi tersinkron.

## Akun warga & Supabase

Halaman `/masuk`, `/daftar`, dan `/akun` memakai **Supabase sebagai satu-satunya
backend** autentikasi dan kontribusi warga:

- Akun memakai Supabase Auth, laporan masuk ke tabel `reports`, dan dukungan
  tersimpan di `report_votes`.
- Tidak ada akun demo, akun lokal, atau fallback `localStorage`. Bila Supabase
  belum dikonfigurasi atau tidak terjangkau, UI menampilkan pesan yang jelas.
- Pendaftaran memerlukan konfirmasi email sebelum akun dapat masuk.

Proyek Supabase `ifmjceyehvyauwmhwsbk` sudah memiliki skema dan RLS yang aktif.

### 1. Variabel lingkungan

Salin `.env.example` menjadi `.env.local`, lalu isi:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://<project>.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_...
```

`.env.local` sudah masuk `.gitignore` dan tidak boleh di-commit.

### 2. Skema database

Buka **Supabase Dashboard → SQL Editor**, tempel seluruh isi
[`supabase/schema.sql`](supabase/schema.sql), lalu jalankan. Skema tersebut membuat:

- `profiles` — profil warga (nama, wilayah) dengan RLS dan trigger otomatis.
- `reports` — laporan warga; nama pelapor disimpan tersamar (`Rina K.`).
- `report_votes` + view `report_vote_counts` — dukungan per laporan.
- Fungsi `delete_user()` (`security definer`) untuk hapus akun mandiri.

### 3. URL redirect autentikasi

Di **Authentication → URL Configuration**, tambahkan:

- `http://localhost:3000/**`
- `https://prajvala.vercel.app/**`

Tanpa ini, tautan konfirmasi email akan ditolak Supabase.

### 4. Konfirmasi email

Proyek Supabase saat ini memakai `mailer_autoconfirm: false`, sehingga pendaftar
baru harus mengonfirmasi email sebelum masuk. UI menampilkan status
“Cek email Anda” setelah pendaftaran berhasil; akun baru dapat masuk setelah
tautan konfirmasi dibuka.

Halaman masuk/daftar juga memeriksa kesiapan database. Bila tabel belum dibuat,
muncul peringatan untuk menjalankan `supabase/schema.sql`; bila server tidak
terjangkau, aplikasi menampilkan pesan koneksi.

### Alur yang didukung

- Daftar dengan nama, email, kata sandi, dan wilayah pantau utama.
- Masuk dengan email/kata sandi; pesan error dipetakan ke Bahasa Indonesia.
- Sesi diperbarui lewat middleware Supabase (`utils/supabase/middleware.ts`).
- Pengguna yang sudah masuk mendapat nama terisi otomatis pada formulir laporan;
  tamu tetap dapat mengirim laporan.
- Dukungan (upvote) memerlukan akun aktif agar tersimpan di Supabase.
- Riwayat kontribusi di `/akun` dibaca langsung dari Supabase.
- Hapus akun memanggil RPC `delete_user()`; laporan tetap tersimpan sebagai
  laporan anonim.

Ini purwarupa kompetisi. Jangan gunakan kata sandi akun penting Anda.

## Teknologi

| Lapisan     | Teknologi                                       |
| ----------- | ----------------------------------------------- |
| Framework   | Next.js 15 (App Router), React 19, TypeScript   |
| Styling     | Tailwind CSS 3, desain sistem kustom            |
| Grafik      | Recharts 3, donut SVG interaktif                |
| Peta        | Leaflet 1.9 + react-leaflet 5                   |
| Ikon        | Lucide React                                    |
| Font        | Plus Jakarta Sans, Inter, JetBrains Mono        |
| Auth & data | Supabase Auth + Postgres/RLS                  |
| Data proyek | Seed TypeScript (percontohan)                  |

## Menjalankan proyek

Prasyarat: Node.js 20+ dan npm.

```bash
npm install
npm run dev        # http://localhost:3000
```

Perintah lain:

```bash
npm run typecheck  # pemeriksaan TypeScript
npm run build      # build produksi
npm run start      # menjalankan hasil build
```

Catatan: ubin peta OpenStreetMap dan foto proyek Unsplash memerlukan koneksi
internet saat runtime. Akun, laporan, dan dukungan memerlukan Supabase aktif.

## Deploy

Produksi berjalan di Vercel: **https://prajvala.vercel.app**

Tambahkan kedua variabel lingkungan berikut di **Vercel → Project Settings →
Environment Variables** (Production, Preview, dan Development):

```bash
NEXT_PUBLIC_SUPABASE_URL=https://ifmjceyehvyauwmhwsbk.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_...
```

Lalu deploy ulang (`vercel --prod` atau push ke branch produksi).

Di **Supabase → Authentication → URL Configuration**, daftarkan:

- Site URL: `https://prajvala.vercel.app`
- Redirect URLs: `https://prajvala.vercel.app/**` dan `http://localhost:3000/**`

Tanpa daftar ini, tautan konfirmasi email dari domain produksi akan ditolak.

## Struktur singkat

```
app/                 Rute App Router: /, /anggaran, /proyek, /proyek/[id], /informasi,
                     /masuk, /daftar, /akun
components/          UI, layout, grafik, peta, proyek, validasi, informasi, akun
lib/data.ts          Sumber data percontohan + agregasi wilayah
lib/api.ts           Lapisan data laporan/upvote/aktivitas (Supabase ketat)
lib/utils.ts         Format rupiah, tanggal, persentase, slug
types/               Tipe TypeScript bersama
supabase/schema.sql  Skema tabel, RLS, trigger, view, dan RPC hapus akun
utils/supabase/      Klien browser/server + pembaruan sesi middleware
middleware.ts        Menjaga cookie sesi Supabase tetap segar
```

## Data percontohan

- 3 wilayah percontohan: **Tanjung Barat** (Kelurahan, Jakarta Selatan),
  **Sukamaju** (Desa, Kota Depok), dan **Tembalang** (Kecamatan, Semarang).
- 9 proyek, 47 item RAB, 20 laporan warga awal, 11 dokumen publik, 6 FAQ, dan
  12 istilah glosarium.
- Total pagu agregat **Rp19.400.000.000** dengan serapan **±72,8%**.

Semua nama proyek, penyedia, laporan, dan dokumen adalah data percontohan untuk
keperluan kompetisi; tidak merujuk pada pihak tertentu.

## Catatan privasi

Formulir laporan warga menyimulasikan penghapusan metadata EXIF (lokasi asli dan
identitas perangkat) sebelum laporan ditampilkan. Nama pelapor disamarkan otomatis
(contoh: “Rina Kusuma” → “Rina K.”) dan hanya nama tersamar itu yang dikirim ke
Supabase. Laporan dan dukungan disimpan di database melalui RLS dan memerlukan akun
aktif. Kata sandi dikelola sepenuhnya oleh Supabase Auth.

## Lisensi & atribusi

Kode dan desain dibuat untuk Techcomfest 2027.

**Dikembangkan oleh Tim Aetherion Vanakei — Cyber University.**
