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
  laporan dengan pembersihan EXIF nyata, deteksi GPS, unggah foto terkompres,
  serta penyimpanan langsung ke Firestore.
- **Pusat informasi** — repositori dokumen APBD/APBDes, RAB, tender, LPJ, dan
  laporan akhir dengan ringkasan bahasa manusia, pencarian, unduhan `.txt`,
  pertanyaan umum, serta glosarium istilah anggaran.
- **Pemilih wilayah** — data seluruh halaman mengikuti wilayah yang dipilih dan
  pilihannya tersimpan di perangkat.
- **Akun warga** — daftar/masuk dengan Firebase Auth, prefilling identitas
  laporan, dan dasbor akun berisi riwayat kontribusi tersinkron.
- **Panel administrator** — moderasi laporan (verifikasi/tandai/pending), hapus
  laporan, penerbitan bukti resmi berfoto, log audit, dan ganti kata sandi.
  Akses memakai custom claim Firebase Auth `admin: true`.

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

- `profiles/{uid}` hanya dapat dibaca/ditulis pemiliknya; admin boleh membaca.
- `reports` dapat dibaca publik. Warga hanya dapat membuat laporan `pending`
  yang belum terverifikasi; admin dapat menerbitkan bukti resmi berfoto.
- Update moderasi (`verified`, `moderationStatus`, `moderationNote`,
  `moderatedAt`, `moderatedBy`) hanya boleh dilakukan admin.
- `upvoteCount` hanya boleh berubah satu langkah dan wajib disertai dokumen
  suara milik pengguna yang sesuai.
- `userVotes/{uid}` hanya dapat diakses pemiliknya.
- `adminLogs` hanya dapat dibaca dan ditambah admin; tidak ada update/delete.

Foto bukti disimpan sebagai data URL JPEG di dokumen laporan (maks. 680.000
karakter di klien, 720.000 di rules). Ini dipakai karena Cloud Storage belum
tersedia tanpa billing/Blaze; foto dikompres ulang di peramban sehingga metadata
EXIF/GPS benar-benar hilang.

### 4. Membuat atau mempromosikan administrator

Peran admin **tidak** disimpan sebagai field yang bisa diubah klien. Peran
berasal dari custom claim Firebase Auth:

1. Buat akun lewat Firebase Console atau Authentication REST API.
2. Pasang claim dengan Firebase Admin SDK / Firebase CLI:
   ```js
   await admin.auth().setCustomUserClaims(uid, { admin: true });
   ```
3. Pastikan dokumen `profiles/{uid}` berisi `fullName`, `email`, `regionId`,
   dan `role: "admin"`.
4. Keluar lalu masuk kembali agar ID token memuat claim baru.

Setelah itu menu akun menampilkan **Panel admin** dan rute `/admin` terbuka.
Tanpa claim tersebut, `/admin` hanya menampilkan gerbang akses terbatas.

### 5. Domain yang diizinkan

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
- Laporan warga baru masuk sebagai **menunggu tinjauan**. Skor validasi hanya
  menghitung laporan yang sudah diverifikasi admin.
- Admin dapat memverifikasi, menandai, mengembalikan ke pending, menghapus
  laporan, menerbitkan bukti resmi berfoto, dan mengganti kata sandi sendiri.
  Semua tindakan tercatat di `adminLogs`.

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
                     /masuk, /daftar, /akun, /admin
components/          UI, layout, grafik, peta, proyek, validasi, informasi, akun, admin
lib/data.ts          Sumber data percontohan + agregasi wilayah
lib/api.ts           Lapisan data laporan/upvote/aktivitas/moderasi (Firestore)
lib/admin.ts         Log audit tindakan administrator
lib/image.ts         Kompresi foto + pembersihan metadata di peramban
lib/utils.ts         Format rupiah, tanggal, persentase, slug
types/               Tipe TypeScript bersama
firestore.rules      Aturan keamanan Firestore (termasuk peran admin)
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

Formulir laporan warga mengompres ulang foto di peramban, sehingga metadata EXIF
(lokasi asli dan identitas perangkat) benar-benar dibuang sebelum dikirim. Nama
pelapor disamarkan otomatis (contoh: “Rina Kusuma” → “Rina K.”) dan hanya nama
tersamar itu yang dikirim ke Firestore. Laporan dan dukungan disimpan di database
melalui aturan keamanan dan memerlukan akun aktif. Kata sandi dikelola sepenuhnya
oleh Firebase Authentication.

## Lisensi & atribusi

Kode dan desain dibuat untuk Techcomfest 2027.

**Dikembangkan oleh Tim Aetherion Vanakei — Cyber University.**
