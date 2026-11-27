import type { Metadata } from "next";

import { RegionalFiscalMonitor } from "@/components/fiscal/regional-fiscal-monitor";
import { getRegionalFiscalData } from "@/lib/djpk/service";
import { buildPageMetadata } from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata({
  title: "Monitor Fiskal Daerah",
  description:
    "Pagu dan realisasi APBD Kota Depok, Kabupaten Bogor, dan DKI Jakarta dari Portal Data SIKD DJPK Kementerian Keuangan RI — lengkap dengan periode, sumber, dan status integritas data.",
  path: "/fiskal",
});

/**
 * Halaman ini merender data APBD dari portal DJPK di server, lalu menghidrasi
 * komponen interaktif. Bila portal tidak dapat dijangkau, snapshot tersimpan
 * dipakai dan ditandai sebagai snapshot — bukan data realtime.
 */
export const revalidate = 900;

export default async function FiskalPage() {
  const data = await getRegionalFiscalData();
  return <RegionalFiscalMonitor initialData={data} />;
}