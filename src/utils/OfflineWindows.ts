// src/utils/offlineWindows.ts
export type OfflineWindow = { start: number; end: number };

type HealthEvent = {
  type?: string;                  // e.g. "OFFLINE" | "ONLINE"
  start?: string;                 // ISO
  end?: string | null;            // ISO or null if ongoing
};

type SensorRow = {
  isActive?: boolean;
  lastSeen?: string;              // ISO
  healthEvents?: HealthEvent[];
};

export function buildOfflineWindows(
  rangeStart: Date,
  rangeEnd: Date,
  sensors: SensorRow[]
): OfflineWindow[] {
  const rs = rangeStart.getTime();
  const re = rangeEnd.getTime();
  const bands: OfflineWindow[] = [];

  for (const s of sensors) {
    const evts = Array.isArray(s.healthEvents) ? s.healthEvents : [];

    // 1) Use explicit OFFLINE events if provided
    for (const e of evts) {
      if ((e.type || "").toUpperCase() !== "OFFLINE") continue;
      const sMs = e.start ? new Date(e.start).getTime() : Number.NaN;
      const eMs = e.end ? new Date(e.end).getTime() : Date.now();
      if (!Number.isFinite(sMs)) continue;
      const start = Math.max(sMs, rs);
      const end = Math.min(eMs, re);
      if (start < end) bands.push({ start, end });
    }

    // 2) Fallback: if sensor is inactive, show from lastSeen->rangeEnd
    if (s.isActive === false) {
      const last = s.lastSeen ? new Date(s.lastSeen).getTime() : rs;
      const start = Math.max(last, rs);
      const end = re;
      if (start < end) bands.push({ start, end });
    }
  }

  // Optional: merge overlaps
  return mergeOverlaps(bands);
}

export function mergeOverlaps(bands: OfflineWindow[]): OfflineWindow[] {
  if (bands.length <= 1) return bands.slice();
  const sorted = bands.slice().sort((a, b) => a.start - b.start);
  const out: OfflineWindow[] = [sorted[0]];
  for (let i = 1; i < sorted.length; i++) {
    const prev = out[out.length - 1];
    const cur = sorted[i];
    if (cur.start <= prev.end) {
      prev.end = Math.max(prev.end, cur.end);
    } else {
      out.push({ ...cur });
    }
  }
  return out;
}
