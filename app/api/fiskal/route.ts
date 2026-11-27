import { NextResponse } from "next/server";

import { getRegionalFiscalData } from "@/lib/djpk/service";

/**
 * Endpoint pembaruan data fiskal.
 *
 * `GET /api/fiskal` memakai cache 15 menit; `GET /api/fiskal?fresh=1` memaksa
 * pengambilan ulang dari portal DJPK. Bila portal gagal dijangkau, layanan
 * mengembalikan snapshot tersimpan dengan penanda `live: false` untuk setiap
 * wilayah yang gagal — bukan data palsu dan bukan status live palsu.
 */
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const fresh = url.searchParams.get("fresh") === "1";

  try {
    const data = await getRegionalFiscalData({ fresh });
    return NextResponse.json(data, {
      headers: {
        "Cache-Control": "no-store",
        "X-Data-Source": "DJPK SIKD Portal Data APBD",
      },
    });
  } catch {
    return NextResponse.json(
      {
        error:
          "Data fiskal tidak dapat dimuat saat ini. Silakan coba lagi; halaman tetap memakai snapshot tersimpan.",
      },
      { status: 503 },
    );
  }
}