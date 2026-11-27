"use client";

import {
  AlertTriangle,
  Camera,
  Clock3,
  Loader2,
  RefreshCw,
  ShieldCheck,
  Trash2,
  UserCog,
} from "lucide-react";
import {
  ADMIN_ACTION_LABEL,
  type AdminAction,
  type AdminLogEntry,
} from "@/lib/admin";
import { getProject } from "@/lib/data";
import { cn, formatDateLong, timeAgo } from "@/lib/utils";

const ACTION_STYLE: Record<
  AdminAction,
  { chip: string; icon: typeof ShieldCheck }
> = {
  moderate: { chip: "bg-emerald-50 text-emerald-900", icon: ShieldCheck },
  delete: { chip: "bg-rose-50 text-rose-900", icon: Trash2 },
  publish: { chip: "bg-pixel-sun text-pixel-line", icon: Camera },
  role: { chip: "bg-amber-50 text-amber-900", icon: UserCog },
};

interface AuditLogProps {
  logs: AdminLogEntry[];
  loading: boolean;
  error: string;
  onRefresh: () => void;
}

/**
 * Jejak audit tindakan administrator.
 *
 * Log ditulis setiap kali laporan dimoderasi, dihapus, atau bukti resmi
 * diterbitkan. Koleksi `adminLogs` bersifat tambah-baca saja; tidak ada tombol
 * ubah atau hapus, karena tujuan panel ini adalah ketertelusuran.
 */
export function AuditLog({ logs, loading, error, onRefresh }: AuditLogProps) {
  return (
    <div>
      <div className="flex flex-col gap-3 border-4 border-pixel-line bg-white p-3.5 shadow-card sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="font-pixel text-[10px] uppercase leading-[1.8] text-pixel-line">
            Jejak audit
          </h2>
          <p className="mt-1 text-[10px] leading-relaxed text-pixel-ink/70">
            Catatan tindakan pengelola. Log tidak dapat diubah atau dihapus dari
            panel ini.
          </p>
        </div>
        <button
          type="button"
          onClick={onRefresh}
          disabled={loading}
          className="inline-flex min-h-9 items-center justify-center gap-1.5 border-2 border-pixel-line bg-white px-2.5 font-pixel text-[7px] uppercase text-pixel-line shadow-chip hover:bg-pixel-sun disabled:opacity-50"
        >
          {loading ? (
            <Loader2 size={11} className="animate-spin" aria-hidden="true" />
          ) : (
            <RefreshCw size={11} aria-hidden="true" />
          )}
          {loading ? "Memuat…" : "Muat ulang"}
        </button>
      </div>

      {error ? (
        <div
          role="alert"
          className="mt-3 flex items-start gap-2 border-4 border-pixel-line bg-rose-50 px-3 py-2.5 text-[10.5px] leading-relaxed text-rose-900"
        >
          <AlertTriangle size={13} className="mt-0.5 shrink-0" aria-hidden="true" />
          {error}
        </div>
      ) : null}

      <div className="mt-4 space-y-2.5">
        {logs.map((log) => {
          const style = ACTION_STYLE[log.action] ?? ACTION_STYLE.moderate;
          const Icon = style.icon;
          const project = log.projectId ? getProject(log.projectId) : undefined;

          return (
            <article
              key={log.id}
              className="border-4 border-pixel-line bg-white p-3 shadow-card"
            >
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div className="flex min-w-0 items-start gap-2.5">
                  <span
                    className={cn(
                      "grid h-8 w-8 shrink-0 place-items-center border-2 border-pixel-line",
                      style.chip,
                    )}
                  >
                    <Icon size={13} aria-hidden="true" />
                  </span>
                  <div className="min-w-0">
                    <p className="flex flex-wrap items-center gap-1.5 text-[11.5px] font-bold text-pixel-line">
                      {ADMIN_ACTION_LABEL[log.action] ?? "Tindakan admin"}
                      <span className="border border-pixel-line/40 bg-pixel-cream px-1 text-[8.5px] font-semibold text-pixel-ink/70">
                        {log.actorName}
                      </span>
                    </p>
                    <p className="mt-0.5 text-[10px] leading-relaxed text-pixel-ink/70">
                      {log.detail ?? "Tanpa catatan tambahan."}
                    </p>
                    {project ? (
                      <p className="mt-1 text-[9.5px] text-pixel-ink/60">
                        Proyek: {project.name}
                      </p>
                    ) : null}
                  </div>
                </div>
                <span className="inline-flex shrink-0 items-center gap-1 text-[9px] text-pixel-ink/55">
                  <Clock3 size={9} aria-hidden="true" />
                  <time dateTime={log.createdAt} title={formatDateLong(log.createdAt)}>
                    {timeAgo(log.createdAt)}
                  </time>
                </span>
              </div>
            </article>
          );
        })}

        {!loading && logs.length === 0 ? (
          <div className="border-4 border-dashed border-pixel-line/45 bg-white px-5 py-12 text-center">
            <span className="mx-auto grid h-11 w-11 place-items-center border-[3px] border-pixel-line bg-pixel-panel text-pixel-line">
              <ShieldCheck size={18} aria-hidden="true" />
            </span>
            <p className="mt-3 font-pixel text-[9px] uppercase leading-[1.8] text-pixel-line">
              Belum ada catatan audit
            </p>
            <p className="mx-auto mt-1.5 max-w-sm text-[10.5px] leading-relaxed text-pixel-ink/70">
              Tindakan moderasi, penghapusan, dan penerbitan bukti resmi akan
              tercatat di sini.
            </p>
          </div>
        ) : null}
      </div>
    </div>
  );
}
