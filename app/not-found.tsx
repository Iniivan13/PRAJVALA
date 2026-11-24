import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, BookOpen, Compass, FolderSearch, Home, MapPinOff } from "lucide-react";

export const metadata: Metadata = {
  title: "Halaman tidak ditemukan",
  description: "Halaman yang Anda cari tidak tersedia di PRAJVALA.",
};

export default function NotFound() {
  return (
    <section className="relative overflow-hidden">
      <div
        className="surface-grid pointer-events-none absolute inset-0 opacity-60 [mask-image:linear-gradient(to_bottom,black,transparent_85%)]"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute -right-24 top-0 h-80 w-80 rounded-full bg-amber-400/10 blur-[90px]"
        aria-hidden="true"
      />
      <div className="container-page relative flex min-h-[68vh] flex-col items-center justify-center py-16 text-center">
        <span className="inline-flex items-center gap-2 rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.14em] text-amber-700">
          <MapPinOff size={12} aria-hidden="true" />
          Error 404
        </span>

        <p className="mt-6 font-mono text-[64px] font-bold leading-none tracking-tight text-ink-200 sm:text-[96px]">
          404
        </p>
        <h1 className="mt-2 max-w-2xl font-display text-[28px] font-extrabold tracking-tight text-ink-900 text-balance sm:text-[38px]">
          Halaman ini belum terpetakan.
        </h1>
        <p className="mt-3 max-w-xl text-pretty text-[14px] leading-relaxed text-ink-500">
          Tautan yang Anda buka mungkin sudah dipindahkan atau tidak pernah ada. Mari
          kembali ke jalur yang jelas — anggaran dan proyek publik tetap bisa Anda pantau.
        </p>

        <div className="mt-7 flex flex-col items-center gap-2.5 sm:flex-row">
          <Link href="/" className="btn-primary h-11 px-5 py-0 text-[12.5px]">
            <Home size={15} aria-hidden="true" />
            Kembali ke beranda
          </Link>
          <Link href="/proyek" className="btn-secondary h-11 px-5 py-0 text-[12.5px]">
            <Compass size={15} aria-hidden="true" />
            Telusuri proyek
            <ArrowRight size={13} aria-hidden="true" />
          </Link>
        </div>

        <div className="mt-10 grid w-full max-w-2xl gap-3 sm:grid-cols-3">
          {[
            {
              href: "/anggaran",
              icon: FolderSearch,
              title: "Dashboard anggaran",
              body: "Pagu, realisasi, dan RAB-LPJ.",
            },
            {
              href: "/proyek",
              icon: Compass,
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
                className="group rounded-2xl border border-ink-200/80 bg-white p-4 text-left shadow-soft transition-all duration-300 hover:-translate-y-0.5 hover:border-ink-300 hover:shadow-lifted"
              >
                <span className="grid h-9 w-9 place-items-center rounded-xl bg-ink-100 text-ink-600 transition-colors group-hover:bg-amber-50 group-hover:text-amber-600">
                  <Icon size={15} aria-hidden="true" />
                </span>
                <p className="mt-3 text-[12px] font-semibold text-ink-900">
                  {item.title}
                </p>
                <p className="mt-0.5 text-[10.5px] leading-relaxed text-ink-500">
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
