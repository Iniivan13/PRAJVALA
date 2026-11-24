"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { REGIONS, getRegion, getRegionSummary } from "@/lib/data";
import type { Region, RegionSummary } from "@/types";

const STORAGE_KEY = "prajvala:region:v1";

interface RegionContextValue {
  activeRegionId: string;
  activeRegion: Region | undefined;
  summary: RegionSummary;
  setActiveRegionId: (regionId: string) => void;
  isHydrated: boolean;
}

const RegionContext = createContext<RegionContextValue | null>(null);

export function RegionProvider({ children }: { children: React.ReactNode }) {
  const [activeRegionId, setActiveRegionIdState] = useState("all");
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY);
      if (stored && (stored === "all" || REGIONS.some((region) => region.id === stored))) {
        setActiveRegionIdState(stored);
      }
    } catch {
      // localStorage bisa tidak tersedia pada mode privat.
    }
    setIsHydrated(true);
  }, []);

  const setActiveRegionId = useCallback((regionId: string) => {
    const valid =
      regionId === "all" || REGIONS.some((region) => region.id === regionId)
        ? regionId
        : "all";
    setActiveRegionIdState(valid);
    try {
      window.localStorage.setItem(STORAGE_KEY, valid);
    } catch {
      // Abaikan kegagalan penyimpanan.
    }
  }, []);

  const summary = useMemo(() => getRegionSummary(activeRegionId), [activeRegionId]);
  const activeRegion = useMemo(() => getRegion(activeRegionId), [activeRegionId]);

  const value = useMemo(
    () => ({
      activeRegionId,
      activeRegion,
      summary,
      setActiveRegionId,
      isHydrated,
    }),
    [activeRegionId, activeRegion, summary, setActiveRegionId, isHydrated],
  );

  return <RegionContext.Provider value={value}>{children}</RegionContext.Provider>;
}

export function useRegion(): RegionContextValue {
  const context = useContext(RegionContext);
  if (!context) {
    throw new Error("useRegion harus digunakan di dalam RegionProvider.");
  }
  return context;
}
