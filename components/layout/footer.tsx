import Link from "next/link";
import { Mail } from "lucide-react";
import { Logo } from "@/components/brand/logo";
import { REGIONS } from "@/lib/data";
import { SpriteArrowRight } from "@/components/ui/pixel-sprites";

const NAVIGATION = [
  { href: "/anggaran", label: "Dashboard Anggaran" },
  { href: "/fiskal", label: "Monitor Fiskal Daerah" },
  { href: "/proyek", label: "Peta & Proyek" },
  { href: "/laporan", label: "Laporan Warga" },
  { href: "/informasi", label: "Pusat Informasi" },
  { href: "/write-up", label: "Write Up" },
];

const RESOURCES = [
  { href: "/informasi#dokumen", label: "Dokumen APBD/APBDes" },
  { href: "/informasi#faq", label: "Pertanyaan Umum" },
  { href: "/informasi#glosarium", label: "Istilah Anggaran" },
];

const ACCOUNT_LINKS = [
  { href: "/masuk", label: "Masuk ke akun" },
  { href: "/daftar", label: "Daftar akun warga" },
  { href: "/akun", label: "Akun saya" },
];

const LINK_CLASS =
  "inline-flex min-h-8 items-center text-[12.5px] text-pixel-cream/85 transition-colors hover:text-pixel-sun hover:underline hover:decoration-2 hover:underline-offset-4";

/**
 * Footer sits on the reference's deep grass band, closing the world with a
 * solid pixel block instead of a blurred dark gradient.
 */
export function Footer() {
  return (
    <footer className="relative border-t-4 border-pixel-line bg-pixel-grass-deep text-pixel-cream">
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.12] surface-tiles"
        aria-hidden="true"
      />

      <div className="container-page relative py-12 sm:py-14">
        <div className="grid gap-9 lg:grid-cols-[1.4fr_1fr_1fr_1.1fr]">
          <div>
            <Logo theme="dark" showTagline />
            <p className="mt-5 max-w-sm font-retro text-[16px] leading-snug text-pixel-cream/90">
              Platform Rakyat untuk Jaminan Validitas dan Akuntabilitas. Menyinari
              setiap rupiah anggaran publik agar dapat dilihat, dipahami, dan
              diawasi bersama.
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              <span className="inline-flex items-center gap-1.5 border-2 border-pixel-line bg-pixel-sun px-2 py-1 font-pixel text-[7px] uppercase text-pixel-line shadow-chip">
                SDG 16 · Strong Institutions
              </span>
              <span className="inline-flex items-center gap-1.5 border-2 border-pixel-line bg-pixel-cream px-2 py-1 font-pixel text-[7px] uppercase text-pixel-line shadow-chip">
                3 wilayah percontohan
              </span>
            </div>
          </div>

          <div>
            <h2 className="font-pixel text-[9px] uppercase tracking-[0.06em] text-pixel-sun">
              Navigasi
            </h2>
            <ul className="mt-3.5 space-y-1.5">
              {NAVIGATION.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className={LINK_CLASS}>
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h2 className="font-pixel text-[9px] uppercase tracking-[0.06em] text-pixel-sun">
              Sumber Daya
            </h2>
            <ul className="mt-3.5 space-y-1.5">
              {RESOURCES.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className={LINK_CLASS}>
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>

            <h2 className="mt-6 font-pixel text-[9px] uppercase tracking-[0.06em] text-pixel-sun">
              Akun Warga
            </h2>
            <ul className="mt-3.5 space-y-1.5">
              {ACCOUNT_LINKS.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className={LINK_CLASS}>
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h2 className="font-pixel text-[9px] uppercase tracking-[0.06em] text-pixel-sun">
              Wilayah Pantau
            </h2>
            <ul className="mt-3.5 space-y-1.5">
              {REGIONS.map((region) => (
                <li key={region.id}>
                  <Link
                    href="/proyek"
                    className="group flex min-h-8 items-center justify-between gap-2 text-[12.5px] text-pixel-cream/85 transition-colors hover:text-pixel-sun"
                  >
                    <span>
                      {region.name}
                      <span className="ml-1.5 text-[10.5px] text-pixel-cream/65">
                        {region.level}
                      </span>
                    </span>
                    <SpriteArrowRight
                      size={11}
                      className="opacity-0 transition-opacity group-hover:opacity-100"
                    />
                  </Link>
                </li>
              ))}
            </ul>
            <a
              href="mailto:halo@prajvala.id"
              className="mt-4 inline-flex min-h-8 items-center gap-2 border-2 border-pixel-line bg-pixel-cream px-2.5 py-1.5 font-pixel text-[7.5px] uppercase text-pixel-line shadow-chip"
            >
              <Mail size={11} aria-hidden="true" />
              halo@prajvala.id
            </a>
          </div>
        </div>

        <div className="mt-10 flex flex-col gap-3 border-t-[3px] border-pixel-cream/25 pt-5 text-[11px] text-pixel-cream/80 sm:flex-row sm:items-center sm:justify-between">
          <p>© 2026 PRAJVALA. Ruang publik untuk transparansi anggaran.</p>
          <p className="flex flex-wrap items-center gap-x-2 gap-y-1">
            <span>Dikembangkan oleh</span>
            <span className="font-semibold text-pixel-cream">Tim Aetherion Vanakei</span>
            <span aria-hidden="true">—</span>
            <span>Cyber University</span>
            <span aria-hidden="true">·</span>
            <span>Techcomfest 2027</span>
          </p>
        </div>
        <p className="mt-3 text-[10.5px] leading-relaxed text-pixel-cream/70">
          Seluruh data pada versi ini merupakan data percontohan yang disusun untuk
          keperluan kompetisi. Nama proyek, penyedia, dan laporan warga tidak merujuk
          pada pihak tertentu.
        </p>
      </div>
    </footer>
  );
}
