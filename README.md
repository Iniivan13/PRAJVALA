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
Semua data demonstrasi disusun dalam Bahasa Indonesia dengan angka rupiah yang
realistis.

Fitur utama:

- **Dashboard anggaran** — KPI pagu/realisasi, arus kas bulanan (Recharts),
  komposisi sektor (donut interaktif), dan tabel RAB–LPJ yang dapat dicari,
  difilter, diurutkan, serta diekspor ke CSV.
- **Peta proyek** — Leaflet + OpenStreetMap dengan marker berwarna sesuai status,
  popup ringkasan, dan filter wilayah/kategori/status.
- **Detail proyek** — slider foto sebelum–sesudah, jejak milestone, rincian
  anggaran, koordinat geotag, dan skor validasi warga.
- **Validasi partisipatif** — feed laporan warga, dukungan (upvote), formulir
  laporan dengan simulasi pembersihan EXIF, deteksi GPS, unggah foto, dan
  penyimpanan lokal (localStorage).
- **Pusat informasi** — repositori dokumen APBD/APBDes, RAB, tender, LPJ, dan
  laporan akhir dengan ringkasan bahasa manusia, pencarian, unduhan `.txt`,
  pertanyaan umum, serta glosarium istilah anggaran.
- **Pemilih wilayah** — data seluruh halaman mengikuti wilayah yang dipilih dan
  pilihannya tersimpan di perangkat.
- **Akun warga** — daftar/masuk ramah pengguna, akun demo satu klik, prefilling
  identitas laporan, dan dasbor akun berisi ringkasan kontribusi perangkat.

## Akun warga (simulasi)

Halaman `/masuk`, `/daftar`, dan `/akun` menyediakan alur akun tanpa backend:

- Daftar cukup dengan nama, email, kata sandi, dan wilayah pantau utama.
- Kata sandi disimpan sebagai hash SHA-256 dengan salt acak (fallback hash lokal
  bila Web Crypto tidak tersedia). Tidak ada data yang dikirim ke server.
- Sesi aktif tersimpan di `localStorage`; akun dapat dihapus dari halaman akun.
- **Akun demo:** `warga@demo.prajvala.id` / `prajvala2026`, atau tekan tombol
  “Masuk dengan akun demo” pada halaman masuk.
- Pengguna yang sudah masuk mendapat nama terisi otomatis pada formulir laporan;
  tamu tetap dapat mengirim laporan dan akan melihat ajakan masuk yang tidak
  memblokir alur.

Ini murni simulasi untuk demonstrasi kompetisi. Jangan gunakan kata sandi akun
penting Anda. Karena tidak ada backend, fitur lupa kata sandi belum tersedia;
hapus akun dari halaman `/akun` lalu daftar ulang bila perlu.

## Teknologi

| Lapisan     | Teknologi                                       |
| ----------- | ----------------------------------------------- |
| Framework   | Next.js 15 (App Router), React 19, TypeScript   |
| Styling     | Tailwind CSS 3, desain sistem kustom            |
| Grafik      | Recharts 3, donut SVG interaktif                |
| Peta        | Leaflet 1.9 + react-leaflet 5                   |
| Ikon        | Lucide React                                    |
| Font        | Plus Jakarta Sans, Inter, JetBrains Mono        |
| Data demo   | Seed TypeScript + localStorage (mock API)       |

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
internet saat runtime. Seluruh fitur lain berjalan lokal.

## Struktur singkat

```
app/                 Rute App Router: /, /anggaran, /proyek, /proyek/[id], /informasi,
                     /masuk, /daftar, /akun
components/          UI, layout, grafik, peta, proyek, validasi, informasi, akun
lib/data.ts          Sumber data demo + agregasi wilayah
lib/api.ts           Mock API laporan, upvote, dan aktivitas perangkat (localStorage)
lib/utils.ts         Format rupiah, tanggal, persentase, slug
types/               Tipe TypeScript bersama
```

## Data demonstrasi

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
(contoh: “Rina Kusuma” → “Rina K.”). Data laporan dan dukungan disimpan hanya di
`localStorage` peramban pengguna pada versi demonstrasi ini.

## Lisensi & atribusi

Kode dan desain dibuat untuk Techcomfest 2027.

**Dikembangkan oleh Tim Aetherion Vanakei — Cyber University.**
# PRAJVALA
