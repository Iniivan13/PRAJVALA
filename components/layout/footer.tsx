import Link from "next/link";
import { ArrowUpRight, Mail, MapPin, ShieldCheck } from "lucide-react";
import { Logo } from "@/components/brand/logo";
import { REGIONS } from "@/lib/data";

const NAVIGATION = [
  { href: "/anggaran", label: "Dashboard Anggaran" },
  { href: "/proyek", label: "Peta & Proyek" },
  { href: "/informasi", label: "Pusat Informasi" },
  { href: "/informasi#glosarium", label: "Glosarium Anggaran" },
];

const RESOURCES = [
  { href: "/informasi#dokumen", label: "Dokumen APBD/APBDes" },
  { href: "/informasi#faq", label: "Pertanyaan Umum" },
  { href: "/informasi#glosarium", label: "Istilah Anggaran" },
  { href: "/proyek", label: "Kirim Laporan Warga" },
];

const ACCOUNT_LINKS = [
  { href: "/masuk", label: "Masuk ke akun" },
  { href: "/daftar", label: "Daftar akun warga" },
  { href: "/akun", label: "Akun saya" },
];

export function Footer() {
  return (
    <footer className="relative overflow-hidden bg-ink-950 text-ink-300">
      <div className="surface-grid-dark absolute inset-0 opacity-60" aria-hidden="true" />
      <div
        className="pointer-events-none absolute -left-24 top-0 h-80 w-80 rounded-full bg-amber-500/10 blur-[100px]"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute -bottom-24 right-0 h-96 w-96 rounded-full bg-navy/40 blur-[120px]"
        aria-hidden="true"
      />

      <div className="container-page relative py-14 sm:py-16">
        <div className="grid gap-10 lg:grid-cols-[1.5fr_1fr_1fr_1.15fr]">
          <div>
            <Logo theme="dark" showTagline />
            <p className="mt-5 max-w-sm text-[13px] leading-relaxed text-ink-400">
              Platform Rakyat untuk Jaminan Validitas dan Akuntabilitas. Menyinari
              setiap rupiah anggaran publik agar dapat dilihat, dipahami, dan
              diawasi bersama.
            </p>
            <div className="mt-5 flex flex-wrap gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-[10px] font-semibold text-ink-300">
                <ShieldCheck size={12} className="text-amber-400" aria-hidden="true" />
                SDG 16 · Strong Institutions
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-[10px] font-semibold text-ink-300">
                <MapPin size={12} className="text-amber-400" aria-hidden="true" />
                3 wilayah percontohan
              </span>
            </div>
          </div>

          <div>
            <h2 className="text-[11px] font-bold uppercase tracking-[0.16em] text-white">
              Navigasi
            </h2>
            <ul className="mt-4 space-y-2.5">
              {NAVIGATION.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-[13px] text-ink-400 transition-colors hover:text-amber-400"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h2 className="text-[11px] font-bold uppercase tracking-[0.16em] text-white">
              Sumber Daya
            </h2>
            <ul className="mt-4 space-y-2.5">
              {RESOURCES.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-[13px] text-ink-400 transition-colors hover:text-amber-400"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>

            <h2 className="mt-7 text-[11px] font-bold uppercase tracking-[0.16em] text-white">
              Akun Warga
            </h2>
            <ul className="mt-4 space-y-2.5">
              {ACCOUNT_LINKS.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-[13px] text-ink-400 transition-colors hover:text-amber-400"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h2 className="text-[11px] font-bold uppercase tracking-[0.16em] text-white">
              Wilayah Pantau
            </h2>
            <ul className="mt-4 space-y-2.5">
              {REGIONS.map((region) => (
                <li key={region.id}>
                  <Link
                    href="/proyek"
                    className="group flex items-center justify-between gap-2 text-[13px] text-ink-400 transition-colors hover:text-amber-400"
                  >
                    <span>
                      {region.name}
                      <span className="ml-1.5 text-[10px] text-ink-600">{region.level}</span>
                    </span>
                    <ArrowUpRight
                      size={13}
                      className="opacity-0 transition-opacity group-hover:opacity-100"
                      aria-hidden="true"
                    />
                  </Link>
                </li>
              ))}
            </ul>
            <a
              href="mailto:halo@prajvala.id"
              className="mt-5 inline-flex items-center gap-2 text-[12px] font-medium text-ink-300 transition-colors hover:text-amber-400"
            >
              <Mail size={14} aria-hidden="true" />
              halo@prajvala.id
            </a>
          </div>
        </div>

        <div className="mt-12 flex flex-col gap-4 border-t border-white/10 pt-6 text-[11px] text-ink-500 sm:flex-row sm:items-center sm:justify-between">
          <p>© 2026 PRAJVALA. Ruang publik untuk transparansi anggaran.</p>
          <p className="flex flex-wrap items-center gap-x-2 gap-y-1">
            <span>Dikembangkan oleh</span>
            <span className="font-semibold text-ink-300">Tim Aetherion Vanakei</span>
            <span className="text-ink-700">—</span>
            <span>Cyber University</span>
            <span className="text-ink-700">·</span>
            <span>Techcomfest 2027</span>
          </p>
        </div>
        <p className="mt-3 text-[10px] leading-relaxed text-ink-600">
          Seluruh data pada versi demonstrasi ini merupakan data percontohan yang
          disusun untuk keperluan kompetisi. Nama proyek, penyedia, dan laporan warga
          tidak merujuk pada pihak tertentu.
        </p>
      </div>

      <span
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-8 left-1/2 -translate-x-1/2 select-none font-display text-[92px] font-extrabold tracking-[0.2em] text-white/[0.025] sm:text-[140px]"
      >
        PRAJVALA
      </span>
    </footer>
  );
}
