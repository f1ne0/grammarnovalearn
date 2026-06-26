import { create } from "zustand";
import { persist } from "zustand/middleware";

export type RangePreset = "7d" | "30d" | "semester";

interface DateRangeState {
  preset: RangePreset;
  setPreset: (p: RangePreset) => void;
}

export const useDateRange = create<DateRangeState>()(
  persist(
    (set) => ({
      preset: "30d",
      setPreset: (preset) => set({ preset }),
    }),
    { name: "grammar-daterange" },
  ),
);

const DAYS: Record<RangePreset, number> = {
  "7d": 7,
  "30d": 30,
  semester: 120,
};

export const PRESET_LABELS: Record<RangePreset, string> = {
  "7d": "Last 7 days",
  "30d": "Last 30 days",
  semester: "Semester",
};

/** Convert a preset to ISO from/to query params. */
export function rangeParams(preset: RangePreset): { from: string; to: string } {
  const to = new Date();
  const from = new Date(to.getTime() - DAYS[preset] * 24 * 3600 * 1000);
  return { from: from.toISOString(), to: to.toISOString() };
}
