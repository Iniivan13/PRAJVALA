import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, BookOpen, Compass, FolderSearch, Home } from "lucide-react";
import { SpriteQuest, SpriteSignpost } from "@/components/ui/pixel-sprites";

export const metadata: Metadata = {
  title: "Halaman tidak ditemukan",
  description: "Halaman yang Anda cari tidak tersedia di PRAJVALA.",
};

/**
 * Lost-path page: a signpost in the middle of the world, with three waymarked
 * routes back into the product. All decoration is flat pixel, no blur.
 */
export default function NotFound() {
  return (
    <section className="relative overflow-hidden border-b-4 border-pixel-line bg-pixel-sky">
      <div
        className="pointer-events-none absolute inset-0 opacity-40 surface-grid"
        aria-hidden="true"
      />
      <div className="container-page relative flex min-h-[68vh] flex-col items-center justify-center py-14 text-center">
        <span className="inline-flex items-center gap-1.5 border-2 border-pixel-line bg-pixel-sun px-2 py-1 font-pixel text-[7px] uppercase leading-[1.7] text-pixel-line shadow-chip">
          <SpriteSignpost size={11} />
          Error 404
        </span>

        <p className="mt-5 font-pixel text-[52px] leading-none text-pixel-line/25 sm:text-[80px]">
          404
        </p>
        <h1 className="mt-3 max-w-2xl font-pixel text-[18px] uppercase leading-[1.75] text-pixel-line text-shadow-pixel-light sm:text-[24px]">
          Halaman ini belum terpetakan.
        </h1>
        <p className="mt-3 max-w-xl text-pretty text-[12.5px] leading-relaxed text-pixel-ink/85">
          Tautan yang Anda buka mungkin sudah dipindahkan atau tidak pernah ada. Mari
          kembali ke jalur yang jelas — anggaran dan proyek publik tetap bisa Anda pantau.
        </p>

        <div className="mt-6 flex w-full max-w-md flex-col items-stretch gap-2.5 sm:w-auto sm:flex-row sm:items-center">
          <Link href="/" className="btn-primary">
            <Home size={14} aria-hidden="true" />
            Kembali ke beranda
          </Link>
          <Link href="/proyek" className="btn-secondary">
            <Compass size={14} aria-hidden="true" />
            Telusuri proyek
            <ArrowRight size={12} aria-hidden="true" />
          </Link>
        </div>

        <div className="mt-9 grid w-full max-w-2xl gap-3 sm:grid-cols-3">
          {[
            {
              href: "/anggaran",
              icon: FolderSearch,
              title: "Dashboard anggaran",
              body: "Pagu, realisasi, dan RAB-LPJ.",
            },
            {
              href: "/proyek",
              icon: SpriteQuest,
              title: "Peta proyek",
              body: "Temukan proyek di sekitar Anda.",
            },
            {
              href: "/informasi",
              icon: BookOpen,
              title: "Informasi publik",
              body: "Dokumen, FAQ, dan glosarium.",
            },
          ].map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className="group border-4 border-pixel-line bg-white p-3.5 text-left shadow-card transition-transform hover:-translate-y-0.5"
              >
                <span className="grid h-8 w-8 place-items-center border-2 border-pixel-line bg-pixel-panel text-pixel-line transition-colors group-hover:bg-pixel-sun">
                  <Icon size={15} />
                </span>
                <p className="mt-2.5 font-pixel text-[7.5px] uppercase leading-[1.8] text-pixel-line">
                  {item.title}
                </p>
                <p className="mt-1 text-[10px] leading-relaxed text-pixel-ink/70">
                  {item.body}
                </p>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
