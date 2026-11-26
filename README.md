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
  penyimpanan langsung ke Firestore.
- **Pusat informasi** — repositori dokumen APBD/APBDes, RAB, tender, LPJ, dan
  laporan akhir dengan ringkasan bahasa manusia, pencarian, unduhan `.txt`,
  pertanyaan umum, serta glosarium istilah anggaran.
- **Pemilih wilayah** — data seluruh halaman mengikuti wilayah yang dipilih dan
  pilihannya tersimpan di perangkat.
- **Akun warga** — daftar/masuk dengan Firebase Auth, prefilling identitas
  laporan, dan dasbor akun berisi riwayat kontribusi tersinkron.

## Akun warga & Firebase

Halaman `/masuk`, `/daftar`, dan `/akun` memakai **Firebase sebagai satu-satunya
backend** autentikasi dan kontribusi warga:

- Akun memakai Firebase Authentication, profil disimpan di `profiles`, laporan
  masuk ke koleksi `reports`, dan dukungan tersimpan di subkoleksi `votes`.
- Tidak ada akun demo, akun lokal, atau fallback `localStorage`. Bila Firebase
  belum dikonfigurasi atau tidak terjangkau, UI menampilkan pesan yang jelas.
- Pendaftaran langsung memberi sesi (tanpa email konfirmasi), sehingga warga
  bisa mulai berkontribusi seketika.

Proyek Firebase `prajvala` sudah memiliki Firestore (lokasi `asia-southeast2`)
dan aturan keamanan di [`firestore.rules`](firestore.rules).

### 1. Variabel lingkungan

Salin `.env.example` menjadi `.env.local`, lalu isi dari
**Firebase Console → Project settings → Your apps → SDK setup**:

```bash
NEXT_PUBLIC_FIREBASE_API_KEY=...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=prajvala.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=prajvala
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=prajvala.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=...
NEXT_PUBLIC_FIREBASE_APP_ID=...
```

`.env.local` sudah masuk `.gitignore` dan tidak boleh di-commit.

### 2. Aktifkan metode masuk

Di **Firebase Console → Authentication → Sign-in method**, aktifkan
**Email/Password**. Tanpa langkah ini, pendaftaran dan login akan gagal dengan
error `auth/operation-not-allowed`.

### 3. Aturan Firestore

Aturan keamanan ada di [`firestore.rules`](firestore.rules) dan dapat
dideploy ulang dengan:

```bash
firebase deploy --only firestore:rules --project prajvala
```

Aturan tersebut menjamin:

- `profiles/{uid}` hanya dapat dibaca/ditulis pemiliknya.
- `reports` dapat dibaca publik, ditulis warga yang masuk, dan hanya penulis
  yang boleh menghapus.
- `upvoteCount` hanya boleh berubah satu langkah dan wajib disertai dokumen
  suara milik pengguna yang sesuai.
- `userVotes/{uid}` hanya dapat diakses pemiliknya.

### 4. Domain yang diizinkan

Di **Firebase Console → Authentication → Settings → Authorized domains**,
pastikan `localhost` dan `prajvala.vercel.app` terdaftar. Domain ini diperlukan
untuk alur email (reset kata sandi) dan popup autentikasi.

### Alur yang didukung

- Daftar dengan nama, email, kata sandi, dan wilayah pantau utama.
- Masuk dengan email/kata sandi; pesan error dipetakan ke Bahasa Indonesia.
- Sesi dikelola Firebase Authentication di sisi klien (IndexedDB).
- Pengguna yang sudah masuk mendapat nama terisi otomatis pada formulir laporan;
  tamu tetap dapat mengirim laporan.
- Dukungan (upvote) memerlukan akun aktif agar tersimpan di Firestore.
- Riwayat kontribusi di `/akun` dibaca langsung dari Firestore.
- Hapus akun menghapus profil dan akun Firebase; laporan yang sudah terkirim
  tetap tersimpan dengan nama tersamar.

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
| Auth & data | Firebase Auth + Firestore                  |
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
internet saat runtime. Akun, laporan, dan dukungan memerlukan Firebase aktif.

## Deploy

Produksi berjalan di Vercel: **https://prajvala.vercel.app**

Tambahkan variabel lingkungan Firebase berikut di **Vercel → Project Settings →
Environment Variables** (Production, Preview, dan Development):

```bash
NEXT_PUBLIC_FIREBASE_API_KEY=...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=prajvala.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=prajvala
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=prajvala.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=...
NEXT_PUBLIC_FIREBASE_APP_ID=...
```

Lalu deploy ulang (`vercel --prod` atau push ke branch produksi).

Di **Firebase Console → Authentication → Settings → Authorized domains**,
tambahkan `prajvala.vercel.app` bila belum ada.

## Struktur singkat

```
app/                 Rute App Router: /, /anggaran, /proyek, /proyek/[id], /informasi,
                     /masuk, /daftar, /akun
components/          UI, layout, grafik, peta, proyek, validasi, informasi, akun
lib/data.ts          Sumber data percontohan + agregasi wilayah
lib/api.ts           Lapisan data laporan/upvote/aktivitas (Firestore)
lib/utils.ts         Format rupiah, tanggal, persentase, slug
types/               Tipe TypeScript bersama
firestore.rules      Aturan keamanan Firestore
firebase.json        Konfigurasi deploy aturan Firestore
utils/firebase/      Inisialisasi Firebase Auth + Firestore
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
Firestore. Laporan dan dukungan disimpan di database melalui aturan keamanan dan
memerlukan akun aktif. Kata sandi dikelola sepenuhnya oleh Firebase Authentication.

## Lisensi & atribusi

Kode dan desain dibuat untuk Techcomfest 2027.

**Dikembangkan oleh Tim Aetherion Vanakei — Cyber University.**
