import type { PublicDocument } from "@/types";
import { slugify } from "@/lib/utils";

export function buildDocumentSummary(doc: PublicDocument, regionName: string): string {
  const points = doc.summaryPoints
    .map((point, index) => `${index + 1}. ${point}`)
    .join("\n");

  return `PRAJVALA — Platform Rakyat untuk Jaminan Validitas dan Akuntabilitas
RINGKASAN DOKUMEN PUBLIK
============================================================

Judul       : ${doc.title}
Kategori    : ${doc.category}
Wilayah     : ${regionName}
Tahun       : ${doc.year}
Diterbitkan : ${doc.publishedAt}
Halaman     : ${doc.pageCount} halaman
Ukuran      : ${doc.fileSize}

INTI DOKUMEN
------------------------------------------------------------
${doc.highlight}

RINGKASAN POIN UTAMA
------------------------------------------------------------
${points}

CATATAN
------------------------------------------------------------
Dokumen ini merupakan ringkasan percontohan yang disusun untuk
keperluan demonstrasi PRAJVALA pada Techcomfest 2027. Bukan
dokumen resmi pemerintah. Untuk implementasi penuh, dokumen
akan ditautkan ke sumber resmi (APBD/APBDes, SIPD, atau LPSE)
dengan jejak waktu pembaruan.

Dikembangkan oleh Tim Aetherion Vanakei — Cyber University.
`;
}

function downloadTextFile(filename: string, content: string): void {
  const blob = new Blob([`\uFEFF${content}`], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1500);
}

export function downloadDocumentFile(doc: PublicDocument, regionName: string): void {
  downloadTextFile(
    `PRAJVALA-${slugify(doc.title)}.txt`,
    buildDocumentSummary(doc, regionName),
  );
}

export function downloadDocumentIndex(
  documents: PublicDocument[],
  regionName: string,
): void {
  const entries = documents
    .map((doc, index) => {
      const points = doc.summaryPoints
        .map((point) => `   - ${point}`)
        .join("\n");
      return `${index + 1}. ${doc.title}
   Kategori    : ${doc.category}
   Tahun       : ${doc.year}
   Diterbitkan : ${doc.publishedAt}
   Halaman     : ${doc.pageCount} halaman
   Inti        : ${doc.highlight}
   Poin utama  :
${points}
`;
    })
    .join("\n");

  const content = `PRAJVALA — Platform Rakyat untuk Jaminan Validitas dan Akuntabilitas
INDEKS DOKUMEN PUBLIK
============================================================
Wilayah  : ${regionName}
Jumlah   : ${documents.length} dokumen
Dicetak  : ${new Date().toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  })}

${entries}
CATATAN
------------------------------------------------------------
Indeks ini merupakan ringkasan percontohan untuk demonstrasi
PRAJVALA pada Techcomfest 2027. Bukan dokumen resmi pemerintah.

Dikembangkan oleh Tim Aetherion Vanakei — Cyber University.
`;

  downloadTextFile(`PRAJVALA-indeks-dokumen-${slugify(regionName)}.txt`, content);
}
