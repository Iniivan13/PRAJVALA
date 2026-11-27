# Data APBD DJPK SIKD

Folder ini menyimpan hasil tarikan nyata dari [Portal Data SIKD DJPK](https://djpk.kemenkeu.go.id/portal/data/apbd) untuk tiga entitas APBD yang dipakai PRAJVALA. Tidak ada angka yang dikarang atau diinterpolasi.

## Sumber dan pemetaan

Pemetaan diverifikasi lewat dropdown portal, bukan ditebak:

| Wilayah PRAJVALA | Entitas APBD | `provinsi` | `pemda` |
| --- | --- | --- | --- |
| Kota Depok | Pemerintah Kota Depok | `10` | `21` |
| Cibinong | Pemerintah Kabupaten Bogor | `10` | `03` |
| Koridor TB Simatupang | Pemerintah Provinsi DKI Jakarta | `09` | `00` |

- Endpoint peta provinsi: `GET /portal/provinsi/{tahun}`
- Endpoint peta pemda: `GET /portal/pemda/{provinsi}/{tahun}`
- Tabel postur: `GET /portal/data/apbd?periode={1-12}&tahun={tahun}&provinsi={kode}&pemda={kode}`
- Ekspor angka: `GET /portal/csv_apbd?type=apbd&periode=...` (sebenarnya SpreadsheetML XML, nominal rupiah penuh)

Cibinong dan TB Simatupang adalah **cakupan lokasi**, bukan entitas anggaran. Nilai APBD tidak didistribusikan ke kecamatan atau koridor tanpa data pendukung.

## Isi folder

| Berkas | Isi |
| --- | --- |
| `raw/*.xml` | Respons SpreadsheetML mentah per wilayah/periode, sebelum normalisasi. |
| `raw/*.html` | Tabel HTML periode terbaru (hierarki akun + metadata periode/versi). |
| `snapshots-2026-11.json` | Snapshot periode terbaru untuk fallback UI bila portal tidak dapat dihubungi. |
| `history-2026.json` | Titik tren 11 periode 2026 dari sumber. |
| `firestore-docs.json` | Payload unggah Firestore (turunan; tidak di-commit). |

## Model data

Baris snapshot mengikuti kontrak `regional_budget_snapshots`:

`region_id`, `fiscal_year`, `period_month`, `account_code`, `account_name`, `budget_amount`, `realization_amount`, `realization_percentage`, `source_url`, `source_name`, `reported_at`, `fetched_at`, `data_quality_status`.

Aturan integritas:

- Satuan kanonik adalah **rupiah bulat**. Nilai pecahan dari sumber dibulatkan, nilai mentah tetap disimpan (`raw_*`).
- `null` berarti tidak tersedia atau tidak dapat dihitung — **tidak pernah** diperlakukan sebagai nol. Pagu nol dengan realisasi positif menghasilkan persentase `null`, bukan `0%`.
- `realization_percentage` dihitung dari nominal; `source_percentage` menyimpan persentase portal untuk audit.
- Periode dan versi anggaran tidak dicampur. `period_month` adalah periode laporan ("realisasi APBD s.d. ..."), berbeda dari `reported_at` (tanggal data diterima SIKD).
- Total dan sub-akun divalidasi; selisih ditandai sebagai `warning`, bukan dihapus.
- `account_code` adalah kunci internal PRAJVALA yang diturunkan dari nama akun. Portal DJPK tidak menerbitkan kode BAS, jadi tidak ada kode resmi yang dikarang.

## Menjalankan sinkronisasi

```bash
npm run sync:djpk                       # tahun & periode default (2026, 11)
npm run sync:djpk -- --year 2026 --period 11
```

Skrip akan memverifikasi pemetaan provinsi/pemda, menarik seluruh periode 1..N, menulis ulang snapshot/history/raw, dan menghasilkan `firestore-docs.json`. Snapshot lama tidak ditimpa bila periode terbaru gagal diambil.

Unggah Firestore memakai ID deterministik `{region}__{tahun}__{bulan}__{versi}__{akun}` sehingga sinkronisasi berulang tidak menduplikasi baris.

## Catatan

Data ini adalah **laporan SIKD daerah**, bukan laporan keuangan yang telah diaudit. Selalu tampilkan periode, versi anggaran, tanggal terima, dan atribusi:

> Sumber: Direktorat Jenderal Perimbangan Keuangan, Kementerian Keuangan RI — Portal Data SIKD.