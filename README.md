# PRAJVALA

**Platform Rakyat untuk Jaminan Validitas dan Akuntabilitas** — purwarupa
civic-tech untuk membaca anggaran publik, menelusuri proyek pembangunan, dan
memverifikasi kondisi lapangan bersama warga.

> Dikembangkan oleh **Tim Aetherion Vanakei — Cyber University** untuk
> **Techcomfest 2027** (Smart Governance & Public Service / SDG 16).
>
> Tagline merek: **Search · Discover · Empower**.

---

## Daftar isi

- [Ringkasan](#ringkasan)
- [Fitur](#fitur)
- [Teknologi](#teknologi)
- [Menjalankan proyek](#menjalankan-proyek)
- [Rute dan hak akses](#rute-dan-hak-akses)
- [Arsitektur dan struktur repositori](#arsitektur-dan-struktur-repositori)
- [Model data dan koleksi Firestore](#model-data-dan-koleksi-firestore)
- [Alur data utama](#alur-data-utama)
- [Data percontohan](#data-percontohan)
- [Merek, aset, dan SEO](#merek-aset-dan-seo)
- [Desain, navigasi, dan aksesibilitas](#desain-navigasi-dan-aksesibilitas)
- [Privasi dan keamanan](#privasi-dan-keamanan)
- [Deploy](#deploy)
- [Troubleshooting](#troubleshooting)
- [Batasan purwarupa](#batasan-purwarupa)
- [Lisensi dan atribusi](#lisensi-dan-atribusi)

---

## Ringkasan

PRAJVALA (dari bahasa Sanskerta: *cahaya yang menyinari*) menghubungkan tiga hal
yang biasanya terpisah: **dokumen anggaran**, **bukti fisik proyek**, dan
**suara warga**. Seluruh antarmuka dan data percontohan disusun dalam Bahasa
Indonesia dengan angka rupiah yang realistis.

Repositori ini berisi satu aplikasi Next.js (App Router) yang mencakup:

- presentasi anggaran dan proyek publik dalam tampilan pixel-art;
- peta geospasial proyek dengan Leaflet + OpenStreetMap;
- autentikasi warga dan riwayat kontribusi berbasis Firebase;
- alur pelaporan lapangan dengan foto terkompres dan metadata yang dibersihkan;
- panel pengelola untuk moderasi, direktori pengguna, bukti resmi, sumber
  publik, log audit, dan keamanan akun;
- metadata SEO, kartu bagikan Open Graph, favicon, manifest PWA, `robots.txt`,
  dan `sitemap.xml` yang dihasilkan oleh App Router.

> **Catatan penting:** ini purwarupa kompetisi. Seluruh nama proyek, penyedia,
> laporan, dan dokumen adalah data percontohan; tidak merujuk pada pihak tertentu
> dan bukan dokumen resmi pemerintah.

## Fitur

### Halaman publik

- **Beranda** — hero bergaya dunia pixel, pencarian cepat, KPI wilayah terpilih,
  tiga langkah cara kerja, proyek sorotan, kutipan laporan warga, dan CTA.
- **Dashboard anggaran (`/anggaran`)** — KPI pagu/realisasi/sisa, arus kas
  bulanan (Recharts), donut komposisi sektor, catatan indikator kewajaran harga,
  serta tabel RAB–LPJ yang dapat dicari, difilter, diurutkan, dan diekspor CSV.
- **Peta dan proyek (`/proyek`)** — peta Leaflet dengan marker sesuai status,
  popup ringkasan, filter wilayah/kategori/status, dan kartu proyek.
- **Detail proyek (`/proyek/[id]`)** — slider foto sebelum–sesudah, jejak
  milestone, rincian anggaran, koordinat geotag, skor validasi warga, dan tautan
  berbagi.
- **Papan laporan (`/laporan`)** — feed laporan warga dengan pencarian, filter
  status kesesuaian, cakupan wilayah, dukungan (upvote), dan tautan ke proyek.
- **Pusat informasi (`/informasi`)** — arsip dokumen APBD/APBDes, RAB, tender,
  LPJ, dan laporan akhir dengan ringkasan bahasa manusia, pencarian, unduhan
  `.txt`, pustaka sumber publik, FAQ, dan glosarium.
- **Write Up (`/write-up`)** — halaman jurnal yang disusun dari FAQ (bab) dan
  glosarium (apendiks) dengan daftar isi lengket.
- **Pemilih wilayah** — data seluruh halaman mengikuti wilayah yang dipilih
  (`Semua wilayah`, `Tanjung Barat`, `Sukamaju`, `Tembalang`) dan pilihannya
  tersimpan di perangkat.

### Akun warga

- Daftar dan masuk dengan **Firebase Authentication** (email/kata sandi).
- Profil tersimpan di koleksi `profiles`; laporan dan dukungan tersimpan di
  Firestore.
- Formulir laporan otomatis mengisi nama pengguna yang sudah masuk; tamu tetap
  dapat membaca dan menjelajah, tetapi kontribusi memerlukan akun.
- Dasbor `/akun` menampilkan identitas, wilayah pantau, riwayat laporan,
  distribusi status kesesuaian, jumlah dukungan, dan aksi cepat.
- Ganti kata sandi dengan reautentikasi, serta hapus akun (profil + akun
  Firebase) tanpa menghapus laporan yang sudah terkirim.

### Panel pengelola

Panel `/admin` hanya terbuka untuk akun dengan peran pengelola. Enam tab yang
tersedia:

| Tab | Isi | Admin | PJ daerah |
| --- | --- | --- | --- |
| **Moderasi** | Antrean laporan: verifikasi, tandai, kembalikan ke pending, hapus | Ya | Hanya wilayah tugasnya |
| **Pengguna** | Direktori akun, pencarian, penetapan peran dan wilayah | Ya | Tidak |
| **Sumber publik** | Templat pencarian aman + pustaka tautan terkurasi | Ya | Tidak |
| **Bukti resmi** | Penerbitan bukti berfoto dengan status terverifikasi | Ya | Tidak |
| **Log audit** | Jejak tindakan pengelola (append-only) | Ya | Menulis ya, membaca tidak |
| **Keamanan** | Ganti kata sandi dan penjelasan peran | Ya | Ya |

Catatan: PJ daerah dapat **menulis** log audit untuk tindakan moderasinya, tetapi
hanya admin yang dapat **membaca** `adminLogs`.

### Sumber anggaran publik

Panel **Sumber publik** menyediakan **9 templat pencarian** tetap untuk dokumen
anggaran publik: Google Drive (semua, file, folder, open), Docs, Sheets, Slides,
dan Forms. Semua templat memakai `site:go.id` dan kata kunci "anggaran"; kueri
tidak dapat diedit bebas.

Kategori **File Sensitif**, **Login & Admin**, **Config & Error**, dan
**Data Leak** sengaja tidak dibuat. Tautan yang disimpan wajib HTTPS dan hanya
boleh mengarah ke host `drive.google.com` atau `docs.google.com`, divalidasi di
klien dan di Firestore Rules.

## Teknologi

| Lapisan | Teknologi |
| --- | --- |
| Framework | Next.js **15.5.29** (App Router), React **19.3**, TypeScript **5.9** |
| Styling | Tailwind CSS **3.4**, token dan utilitas desain kustom |
| Grafik | Recharts **3.11**, donut SVG interaktif |
| Peta | Leaflet **1.9** + react-leaflet **5** (OpenStreetMap) |
| Ikon | Lucide React |
| Font | Press Start 2P & VT323 (pixel), Plus Jakarta Sans, Inter, JetBrains Mono |
| Auth & data | Firebase **13.4** (Authentication + Firestore) |
| Data proyek | Seed TypeScript di `lib/data.ts` (percontohan) |
| Deploy | Vercel (produksi: `prajvala.vercel.app`) |

Tidak ada backend kustom, API route, atau server database terpisah. Semua data
dinamis warga ditangani langsung oleh Firebase SDK di sisi klien dengan
Firestore Security Rules sebagai penegak utama.

## Menjalankan proyek

### Prasyarat

- Node.js **20+** dan npm.
- Proyek Firebase dengan Authentication (Email/Password) dan Firestore aktif.
- Koneksi internet untuk tile peta OpenStreetMap dan foto proyek Unsplash.

### Instalasi

```bash
npm install
cp .env.example .env.local   # lalu isi nilainya
npm run dev                  # http://localhost:3000
```

Perintah lain:

```bash
npm run typecheck   # tsc --noEmit
npm run build       # build produksi
npm run start       # menjalankan hasil build
npm run lint        # ESLint interaktif (lihat Batasan)
```

### 1. Variabel lingkungan

Salin `.env.example` menjadi `.env.local`, lalu isi dari
**Firebase Console → Project settings → Your apps → SDK setup and configuration**:

```bash
NEXT_PUBLIC_FIREBASE_API_KEY=...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=prajvala.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=prajvala
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=prajvala.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=...
NEXT_PUBLIC_FIREBASE_APP_ID=...

# Opsional: URL publik untuk canonical, Open Graph, sitemap, dan robots.
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

`.env.local` sudah masuk `.gitignore` dan tidak boleh di-commit. Kunci Web API
Firebase aman dipakai di browser selama **Firestore Security Rules** terpasang.

Bila `NEXT_PUBLIC_SITE_URL` tidak diisi, nilai bawaan adalah
`https://prajvala.vercel.app`.

### 2. Aktifkan metode masuk

Di **Firebase Console → Authentication → Sign-in method**, aktifkan
**Email/Password**. Tanpa langkah ini, pendaftaran dan login gagal dengan
`auth/operation-not-allowed` atau `auth/configuration-not-found`.

### 3. Deploy Firestore Rules

Aturan keamanan ada di [`firestore.rules`](firestore.rules). Deploy ulang dengan
Firebase CLI:

```bash
firebase deploy --only firestore:rules --project prajvala
```

`firebase.json` dan `.firebaserc` sudah menunjuk proyek `prajvala`.

### 4. Membuat administrator pertama

Peran pengelola disimpan di `profiles/{uid}` sebagai `warga`, `pj_daerah`, atau
`admin`. Aturan Firestore menolak klien yang mencoba menaikkan perannya sendiri.

1. Buat akun lewat `/daftar`, Firebase Console, atau Authentication REST.
2. (Opsional, disarankan) pasang custom claim sebagai jalur bootstrap:
   ```js
   await admin.auth().setCustomUserClaims(uid, { admin: true });
   ```
3. Pastikan dokumen `profiles/{uid}` berisi `fullName`, `email`, `regionId`,
   `role: "admin"`.
4. Buka `/admin` → tab **Pengguna** untuk menetapkan peran akun lain:
   - **Warga** — mengirim laporan dan dukungan seperti biasa.
   - **Penanggung Jawab Daerah** — wajib memilih satu wilayah tugas; hanya
     meninjau laporan dengan `regionId` yang sama.
   - **Administrator** — akses penuh ke semua tab.

Admin diakui dari custom claim `admin: true` **atau** `role: "admin"` pada
dokumen profil. Perubahan peran berlaku setelah pengguna memuat ulang halaman
atau masuk kembali.

### 5. Domain yang diizinkan

Di **Firebase Console → Authentication → Settings → Authorized domains**,
pastikan `localhost`, domain Vercel proyek, dan domain kustom (bila ada)
terdaftar. Domain ini diperlukan untuk alur reset kata sandi dan popup
autentikasi.

## Rute dan hak akses

| Rute | Akses | Isi |
| --- | --- | --- |
| `/` | Publik | Beranda, hero, KPI, proyek sorotan, kutipan laporan |
| `/anggaran` | Publik | Dashboard pagu, realisasi, arus kas, sektor, tabel RAB–LPJ |
| `/proyek` | Publik | Peta + filter + kartu proyek |
| `/proyek/[id]` | Publik | Detail proyek, bukti foto, milestone, RAB, validasi |
| `/laporan` | Publik (baca), akun (kirim/dukung) | Papan laporan warga |
| `/informasi` | Publik | Dokumen, sumber publik, FAQ, glosarium |
| `/write-up` | Publik | Jurnal penjelasan dan glosarium |
| `/masuk` | Publik, `noindex` | Masuk akun warga |
| `/daftar` | Publik, `noindex` | Pendaftaran akun warga |
| `/akun` | Akun, `noindex` | Dasbor dan riwayat kontribusi |
| `/admin` | Admin / PJ daerah, `noindex` | Panel pengelola |
| `not-found` | Publik | Empty state dengan tiga jalan kembali |
| `/robots.txt` | Publik | Aturan crawler |
| `/sitemap.xml` | Publik | Rute publik + seluruh detail proyek |
| `/manifest.webmanifest` | Publik | Manifest PWA |
| `/icon.png`, `/apple-icon.png` | Publik | Favicon dan ikon Apple |

Halaman `/admin`, `/akun`, `/masuk`, dan `/daftar` memakai `robots: noindex,
follow` dan diblokir di `robots.txt`.

## Arsitektur dan struktur repositori

```
app/                        Rute App Router
├── layout.tsx              Root layout: font, provider, metadata global, JSON-LD
├── page.tsx                Beranda
├── globals.css             Token desain, utilitas pixel, kelas komponen
├── anggaran/page.tsx       Dashboard anggaran
├── proyek/page.tsx         Peta + daftar proyek
├── proyek/[id]/page.tsx    Detail proyek + generateMetadata
├── laporan/page.tsx        Papan laporan warga
├── informasi/page.tsx      Pusat informasi
├── write-up/page.tsx       Jurnal
├── masuk/page.tsx          Masuk
├── daftar/page.tsx         Daftar
├── akun/page.tsx           Dasbor akun
├── admin/page.tsx          Panel pengelola
├── not-found.tsx           Halaman 404
├── robots.ts               MetadataRoute robots
├── sitemap.ts              MetadataRoute sitemap
├── manifest.ts             MetadataRoute manifest
├── icon.png                Favicon
└── apple-icon.png          Ikon Apple touch

components/
├── admin/                  Dashboard, moderasi, pengguna, bukti, audit, sumber
├── auth/                   Layar auth dan dasbor akun
├── brand/                  Komponen Logo (mark raster + wordmark pixel)
├── budget/                 Dashboard dan tabel anggaran
├── charts/                 Grafik arus kas dan donut sektor
├── information/            Pusat informasi, preview dokumen, FAQ, glosarium
├── landing/                Hero, pencarian, KPI, snapshot beranda
├── layout/                 Navbar, footer, bottom nav, page hero
├── maps/                   Canvas Leaflet dan peta proyek
├── projects/               Kartu, slider, timeline, tabel, tombol bagikan
├── providers/              AuthProvider dan RegionProvider
├── reports/                Papan laporan
├── ui/                     Token-level UI: badge, KPI, sprite, progress, picker
└── validation/             Formulir laporan dan seksi validasi

lib/
├── data.ts                 Seed percontohan + agregasi wilayah
├── api.ts                  Laporan, moderasi, upvote, aktivitas akun
├── admin.ts                Log audit (append-only)
├── users.ts                Direktori pengguna + perubahan peran
├── public-sources.ts       Templat pencarian aman + CRUD sumber publik
├── documents.ts            Ringkasan dan unduhan dokumen
├── image.ts                Kompresi foto + pembersihan metadata
├── site.ts                 Identitas situs (URL, nama, deskripsi, OG)
├── seo.ts                  Pembangun metadata per halaman
├── focus-trap.ts           Utilitas fokus untuk dialog/sheet
└── utils.ts                Rupiah, tanggal, angka, slug, inisial

types/index.ts              Tipe data bersama (Project, Region, Report, dll.)
utils/firebase/client.ts    Inisialisasi Firebase Auth + Firestore
firestore.rules             Aturan keamanan Firestore
firebase.json               Konfigurasi deploy rules
.env.example                Contoh variabel lingkungan
DESIGN.md                   Sumber kebenaran desain
public/brand/               Aset merek teroptimasi + kartu OG
```

Tidak ada folder `pages/`, API route, atau server terpisah. Seluruh halaman
memakai App Router dengan komponen klien untuk interaksi.

## Model data dan koleksi Firestore

### Tipe utama (`types/index.ts`)

| Tipe | Ringkasan |
| --- | --- |
| `Region` | Wilayah (kelurahan/desa/kecamatan), anggaran, serapan, skor, sektor, arus kas |
| `Project` | Proyek: kategori, status, anggaran, vendor, kontrak, progres, foto, milestone |
| `ProjectImage` | Foto + alt + waktu + koordinat |
| `Milestone` | Tahap proyek dengan status `selesai`/`aktif`/`menunggu` |
| `BudgetItem` | Item RAB: volume, satuan, harga satuan, total, harga acuan, kewajaran |
| `CitizenReport` | Laporan warga: status kesesuaian, rating, komentar, foto, moderasi |
| `PublicDocument` | Dokumen publik: kategori, tahun, ringkasan poin, highlight |
| `PublicSourceLink` | Tautan sumber publik tervalidasi |
| `UserProfile` | Profil: nama, email, wilayah, peran |
| `UserRole` | `warga` \| `pj_daerah` \| `admin` |
| `ModerationStatus` | `pending` \| `verified` \| `flagged` |
| `Suitability` | `Sesuai Target` \| `Terlambat` \| `Indikasi Kejanggalan` |
| `ProjectStatus` | `Terverifikasi` \| `Dalam Pengerjaan` \| `Perlu Audit` \| `Direncanakan` |
| `ProjectCategory` | Infrastruktur Jalan, Pendidikan, Kesehatan, Pemberdayaan UMKM, Bantuan Sosial, Infrastruktur Umum |
| `DocumentCategory` | APBD/APBDes, RAB, Tender, LPJ, Laporan Akhir |

### Koleksi Firestore dan aturannya

| Koleksi | Baca | Tulis |
| --- | --- | --- |
| `config/{docId}` | Publik | Tidak ada (hanya untuk cek koneksi) |
| `profiles/{uid}` | Pemilik dan admin | Pemilik: `fullName`/`regionId` saja; admin: `role`/`regionId`/`updatedAt`/`promotedBy`; hapus oleh pemilik |
| `reports/{reportId}` | Publik | Warga: laporan `pending` miliknya; admin: bukti resmi berfoto; update moderasi oleh admin/PJ sesuai wilayah; hapus oleh penulis atau moderator |
| `reports/{id}/votes/{uid}` | Publik | Pemilik dokumen suara (create/delete) |
| `userVotes/{uid}/reports/{reportId}` | Pemilik | Pemilik (create/delete) |
| `adminLogs/{logId}` | Admin | Admin dan PJ daerah (create); tanpa update/delete |
| `publicSources/{sourceId}` | Publik | Admin (create/delete); tanpa update |

Detail penting pada `reports`:

- Komentar wajib **20–2.000 karakter**, rating **1–5**, `regionId` wajib string.
- Laporan warga selalu `verified: false`, `moderationStatus: "pending"`,
  `upvoteCount: 0`, dan tidak boleh menandai dirinya `official`.
- Bukti resmi admin wajib `official: true`, `verified: true`,
  `moderationStatus: "verified"`, dan `photoUrl` berupa string.
- `photoUrl` maksimal **720.000 karakter** (klien membatasi **680.000**).
- Perubahan `upvoteCount` hanya boleh ±1 dan wajib disertai dokumen suara yang
  sesuai; moderasi hanya boleh mengubah lima kolom moderasi.

`publicSources` memvalidasi `title` 4–120 karakter, `url` ≤500 karakter dengan
pola `^https://(drive|docs)\.google\.com/.+`, kategori yang diizinkan, tahun
2000–2100, `addedBy` sama dengan UID penulis, dan catatan ≤280 karakter.

## Alur data utama

### Mengirim laporan

1. Pengguna membuka formulir pada halaman detail proyek atau seksi validasi.
2. Nama pelapor disamarkan otomatis (`Rina Kusuma` → `Rina K.`); nama tersamar
   itulah yang dikirim, dan nama di bawah 3 karakter menjadi `Warga Anonim`.
3. Foto (opsional) dikompres di peramban: sumber maksimal **12 MiB**, sisi
   terpanjang **1.600 px**, lalu di-encode ulang menjadi JPEG secara iteratif
   sampai data URL ≤ **680.000 karakter**.
4. Laporan disimpan ke `reports` dengan `regionId` proyek dan status `pending`.
5. Hanya laporan berstatus `verified` yang dihitung dalam skor validasi warga.

Menggambar ulang foto ke canvas membuang metadata EXIF/GPS asli, sehingga klaim
"metadata dibersihkan" pada formulir benar-benar terjadi.

### Dukungan (upvote)

`toggleUpvote` menjalankan transaksi Firestore yang:

1. membaca dokumen `reports/{id}/votes/{uid}`;
2. menambah atau menghapus dokumen suara dan `userVotes/{uid}/reports/{id}`;
3. menaikkan atau menurunkan `upvoteCount` tepat satu langkah.

Aturan Firestore memverifikasi bahwa perubahan hitungan selalu disertai
dokumen suara yang sesuai, sehingga klien tidak dapat mengubah hitungan secara
sewenang-wenang.

### Moderasi dan bukti resmi

- Status moderasi: `pending` → `verified` atau `flagged`, dan dapat dikembalikan
  ke `pending`. Kolom `verified` selalu dicerminkan dari status.
- Admin dapat memoderasi semua laporan; PJ daerah hanya laporan dengan
  `regionId` yang sama dengan wilayah tugasnya.
- Bukti resmi pengelola diterbitkan dengan foto wajib dan langsung berstatus
  terverifikasi.
- Setiap tindakan moderasi, penghapusan, penerbitan bukti, perubahan peran, dan
  pengelolaan sumber publik dicatat ke `adminLogs`.

### Akun dan penghapusan

- Sesi dikelola Firebase Authentication di klien (IndexedDB).
- Riwayat kontribusi `/akun` dibaca dari `reports` (`authorId == uid`) dan
  `userVotes`.
- Ganti kata sandi memakai reautentikasi dengan kata sandi saat ini.
- Hapus akun menghapus dokumen `profiles/{uid}` dan akun Firebase; laporan yang
  sudah terkirim tetap tersimpan dengan nama tersamar.

## Data percontohan

Seluruh angka berasal dari seed TypeScript di `lib/data.ts`. Tidak ada
permintaan jaringan untuk data proyek/anggaran.

### Wilayah

| Wilayah | Tingkat | Kota/Provinsi | Penduduk | Pagu | Serapan | Skor akuntabilitas |
| --- | --- | --- | --- | --- | --- | --- |
| Tanjung Barat | Kelurahan | Jakarta Selatan, DKI Jakarta | 38.420 | Rp4.850.000.000 | Rp3.802.400.000 | 92 |
| Sukamaju | Desa | Kota Depok, Jawa Barat | 14.280 | Rp1.950.000.000 | Rp1.257.750.000 | 81 |
| Tembalang | Kecamatan | Semarang, Jawa Tengah | 189.650 | Rp12.600.000.000 | Rp9.059.400.000 | 88 |

Agregat tiga wilayah: **pagu Rp19.400.000.000**, **serapan
Rp14.119.550.000** (**±72,8%**). Tahun anggaran percontohan: **2026**.

### Proyek

| Proyek | Wilayah | Kategori | Status |
| --- | --- | --- | --- |
| Revitalisasi Jalan Lingkungan H. Saidi | Tanjung Barat | Infrastruktur Jalan | Terverifikasi |
| Pembangunan Posyandu Melati Terpadu | Tanjung Barat | Kesehatan | Terverifikasi |
| Normalisasi Saluran Drainase Jalan Merpati | Tanjung Barat | Infrastruktur Umum | Perlu Audit |
| Pembangunan Jembatan Penghubung Dusun Krajan | Sukamaju | Infrastruktur Jalan | Dalam Pengerjaan |
| Rehabilitasi 3 Ruang Kelas SDN Sukamaju 02 | Sukamaju | Pendidikan | Terverifikasi |
| Pengadaan Penerangan Jalan Umum Tenaga Surya | Sukamaju | Infrastruktur Umum | Perlu Audit |
| Peningkatan Jalan Tembalang–Rowosari | Tembalang | Infrastruktur Jalan | Dalam Pengerjaan |
| Revitalisasi Pasar Rakyat Bulusan | Tembalang | Pemberdayaan UMKM | Dalam Pengerjaan |
| Renovasi Puskesmas Tembalang | Tembalang | Kesehatan | Terverifikasi |

Jumlah data seed:

- **9 proyek**, **47 item RAB**, **20 laporan contoh** di papan laporan,
  **11 dokumen publik**, **6 FAQ**, **12 istilah glosarium**, **9 templat
  pencarian**.
- Kartu proyek membawa penghitung laporan agregat; total penghitung seluruh
  proyek adalah **782 laporan** (angka agregat percontohan, bukan jumlah baris
  feed contoh).

Foto proyek memakai URL Unsplash dan tile peta memakai OpenStreetMap; keduanya
memerlukan koneksi internet saat runtime.

## Merek, aset, dan SEO

### Logo dan aset merek

Logo 2026 menggantikan crest lama: kaca pembesar dengan lensa bohlam dan kilau
emas, garis maroon di atas bidang krem, wordmark `PRAJVALA`, dan tagline
**Search · Discover · Empower**.

| Aset | Path | Penggunaan |
| --- | --- | --- |
| Mark (bidang krem) | `public/brand/prajvala-mark.png` | Tile logo di navbar, footer, dan layar auth |
| Lockup penuh | `public/brand/prajvala-logo.png` | Referensi merek/ekspor |
| Ikon 192 / 512 | `public/brand/prajvala-icon-192.png`, `prajvala-icon-512.png` | Manifest, favicon, logo structured data |
| Ikon maskable | `public/brand/prajvala-icon-maskable-512.png` | Ikon PWA maskable |
| Apple touch icon | `public/brand/prajvala-apple-icon.png` | Layar utama iOS |
| Kartu bagikan | `public/brand/og-image.png` | Open Graph dan Twitter Card 1200×630 |

Favicon dilayani dari `app/icon.png` dan `app/apple-icon.png`. Tile logo tetap
krem (`#FDF6E0`) pada tema terang maupun gelap karena bidang krem adalah bagian
dari mark; hanya warna wordmark/tagline yang berubah mengikuti tema.

Sumber mentah `logo.png` diabaikan Git; versi web yang sudah dioptimasi ada di
`public/brand/`.

### SEO dan berbagi tautan

Metadata global berada di `app/layout.tsx`, identitas situs di `lib/site.ts`, dan
pembangun metadata per halaman di `lib/seo.ts`.

- `metadataBase` + `title.template` (`%s | PRAJVALA`).
- Canonical, Open Graph (`id_ID`), dan Twitter Card
  (`summary_large_image`) per halaman publik.
- Halaman detail proyek memakai judul, deskripsi, dan foto proyek sebagai
  gambar bagikan.
- Structured data `Organization` dan `WebSite` (JSON-LD) di root layout.
- `robots.txt` memblokir `/admin`, `/akun`, `/masuk`, dan `/daftar`.
- `sitemap.xml` memuat enam rute publik dan seluruh detail proyek.
- `manifest.webmanifest` menyediakan nama, warna tema, dan tiga ikon PWA.

URL absolut metadata memakai `NEXT_PUBLIC_SITE_URL`, dengan bawaan
`https://prajvala.vercel.app`. Bila domain produksi berubah, isi variabel ini di
lingkungan deploy:

```bash
NEXT_PUBLIC_SITE_URL=https://domain-anda.example
```

Pratinjau kartu bagikan baru muncul setelah aplikasi dideploy dan platform
sosial mengambil ulang (re-scrape) URL; platform umumnya menyimpan cache.

## Desain, navigasi, dan aksesibilitas

[`DESIGN.md`](DESIGN.md) adalah sumber kebenaran desain. Ringkasannya:

- Identitas pixel-art/retro-game adalah bahasa visual utama, bukan dekorasi.
- Warna: maroon `#711022`, krem `#FDF6E0`, emas `#E9B872`, dengan panel dan
  bayangan bertepi keras.
- Font pixel (Press Start 2P, VT323) untuk wayfinding dan label; Plus Jakarta
  Sans/Inter untuk teks bacaan; JetBrains Mono untuk angka.
- **Desktop:** navigasi horizontal di header (Beranda, Anggaran, Proyek,
  Laporan, Informasi) plus pemilih wilayah dan menu akun.
- **Mobile:** bar bawah tetap dengan lima item (Beranda, Anggaran, Proyek,
  Laporan, Lainnya). Tidak ada hamburger di breakpoint mana pun; rute sekunder
  berada di bottom sheet "Lainnya".
- Target sentuh, fokus keyboard, skip-link, `prefers-reduced-motion`, dan kontras
  tetap dijaga.
- Grafik mempertahankan skala, label, satuan, legenda, dan ringkasan aksesibel.

## Privasi dan keamanan

- **Nama pelapor disamarkan** sebelum dikirim; nama lengkap tidak disimpan di
  laporan.
- **Metadata foto dibuang** dengan menggambar ulang gambar ke canvas sebelum
  dikirim; tidak ada EXIF/GPS asli yang tersimpan.
- **Foto sebagai data URL** di dokumen laporan karena Cloud Storage belum
  tersedia tanpa billing. Batas ukuran menjaga dokumen tetap di bawah 1 MiB.
- **Kata sandi** dikelola sepenuhnya oleh Firebase Authentication; aplikasi tidak
  menyimpan kata sandi.
- **Peran tidak dapat dinaikkan sendiri**; aturan Firestore menolak perubahan
  `role` oleh pemilik akun.
- **Log audit tidak dapat diubah atau dihapus** dari klien.
- **Sumber publik dibatasi** ke Google Drive/Docs resmi; tidak ada pencarian
  bebas, pengunduhan otomatis, atau pengambilan kredensial.
- Halaman akun/auth/admin ditandai `noindex` dan diblokir dari crawler.

## Deploy

Produksi berjalan di Vercel: **https://prajvala.vercel.app**

1. Tambahkan variabel lingkungan di **Vercel → Project Settings → Environment
   Variables** untuk Production, Preview, dan Development:

   ```bash
   NEXT_PUBLIC_FIREBASE_API_KEY=...
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=prajvala.firebaseapp.com
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=prajvala
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=prajvala.firebasestorage.app
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=...
   NEXT_PUBLIC_FIREBASE_APP_ID=...

   # Opsional: URL publik untuk canonical, Open Graph, sitemap, dan robots.
   NEXT_PUBLIC_SITE_URL=https://prajvala.vercel.app
   ```

2. Deploy ulang (`vercel --prod` atau push ke branch produksi).
3. Tambahkan domain produksi ke **Firebase Console → Authentication → Settings
   → Authorized domains**.
4. Deploy aturan Firestore bila berubah:
   ```bash
   firebase deploy --only firestore:rules --project prajvala
   ```

## Troubleshooting

| Gejala | Penyebab umum | Solusi |
| --- | --- | --- |
| `auth/operation-not-allowed` | Email/Password belum aktif | Aktifkan di Firebase Authentication → Sign-in method |
| `auth/configuration-not-found` | Layanan Auth belum disiapkan untuk proyek | Aktifkan Authentication dan pastikan konfigurasi `.env.local` benar |
| `auth/email-already-in-use` | Email sudah terdaftar | Masuk atau gunakan email lain |
| `auth/invalid-credential` | Email/kata sandi salah | Periksa kredensial; reset kata sandi bila perlu |
| `auth/too-many-requests` | Terlalu banyak percobaan | Tunggu beberapa menit |
| `auth/requires-recent-login` | Sesi terlalu lama untuk aksi sensitif | Masuk ulang lalu ulangi |
| `permission-denied` | Aturan Firestore menolak | Masuk ulang, pastikan peran admin/PJ sesuai, dan rules sudah dideploy |
| Firestore `unavailable` | Koneksi buruk atau backend tidak terjangkau | Klien masuk mode offline; periksa jaringan lalu muat ulang |
| Peringatan "Failed to fetch RSC payload" | Navigasi cepat berulang saat pengujian | Navigasi klik tunggal normal; muat ulang bila perlu |
| Peta atau foto proyek kosong | Tidak ada koneksi internet | Tile OpenStreetMap dan foto Unsplash memerlukan jaringan |
| Pratinjau tautan lama | Cache platform sosial | Deploy lalu re-scrape URL di platform terkait |
| `next lint` berhenti menunggu input | ESLint interaktif | Gunakan `npm run typecheck`/`npm run build`; build memang mengabaikan ESLint |

## Batasan purwarupa

- **Data percontohan, bukan data resmi.** Nama proyek, vendor, laporan, dan
  dokumen tidak merujuk pada pihak nyata.
- **Tanpa Cloud Storage.** Firebase project berjalan tanpa billing/Blaze, jadi
  foto disimpan sebagai data URL di Firestore dengan batas ukuran.
- **Tidak ada admin SDK di runtime.** Bootstrap administrator pertama dilakukan
  lewat Firebase Console, REST, atau custom claim; setelah itu pengelolaan peran
  dilakukan dari panel.
- **Peta dan foto eksternal** memerlukan internet; tidak ada fallback tile lokal.
- **`npm run lint`** memakai ESLint interaktif dan tidak cocok untuk pipeline
  non-interaktif saat ini; `next build` mengabaikan ESLint.
- **Kartu bagikan** tidak dapat diverifikasi penuh secara lokal; platform sosial
  memerlukan URL produksi dan re-scrape.
- Ini purwarupa kompetisi: jangan gunakan kata sandi akun penting.

## Lisensi dan atribusi

Kode dan desain dibuat untuk **Techcomfest 2027** (Smart Governance & Public
Service / SDG 16).

**Dikembangkan oleh Tim Aetherion Vanakei — Cyber University.**