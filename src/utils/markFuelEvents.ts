// src/utils/markFuelEvents.ts
import type { EventType, FuelReading } from "../types/fuel";

const normalizeEvent = (t?: string | null): EventType => {
  const upper = String(t ?? "NORMAL").toUpperCase();
  return (upper === "REFUEL" || upper === "THEFT" || upper === "DROP"
    ? upper
    : "NORMAL") as EventType;
};

// Optional thresholds used only if you explicitly enable { infer: true }
const EPS = 0.2;      // ignore tiny jitter (L)
const REFUEL_MIN = 10; // L
const THEFT_MIN  = 10; // L

type OutRow = FuelReading & { eventType: EventType; fuelChange?: number };

/**
 * Normalizes backend readings.
 * - Always sorts by timestamp and ensures `id`.
 * - Always normalizes eventType to one of: REFUEL | THEFT | DROP | NORMAL.
 * - By default, **does not infer** anything; it trusts backend labels.
 * - If `opts.infer === true`, it will infer from `fuelChange` first, then
 *   from delta with previous reading (using REFUEL_MIN/THEFT_MIN).
 */
export function markFuelEvents(
  rows: FuelReading[],
  opts: { infer?: boolean } = {}
): OutRow[] {
  const { infer = false } = opts;

  if (!Array.isArray(rows) || rows.length === 0) return [];

  const sorted = [...rows]
    .filter(Boolean)
    .sort(
      (a, b) =>
        new Date(a.timestamp as any).getTime() -
        new Date(b.timestamp as any).getTime()
    );

  return sorted.map((row, i, arr) => {
    // stable id
    const id =
      row.id ??
      `${new Date(row.timestamp as any).getTime() || i}-${i}`;

    // normalize existing labels
    let event = normalizeEvent((row.eventType as string) ?? (row.type as string));

    // normalize fuelChange (null -> undefined)
    const fuelChange =
      typeof row.fuelChange === "number" ? row.fuelChange : undefined;

    // ─────────────────────────────────────────────────────────────
    // Inference is OFF by default (Option A). Only run if infer=true.
    // ─────────────────────────────────────────────────────────────
    if (infer && event === "NORMAL") {
      // prefer backend-provided fuelChange sign
      if (typeof fuelChange === "number" && Math.abs(fuelChange) > EPS) {
        event = fuelChange > 0 ? "REFUEL" : "THEFT";
      } else if (i > 0 && typeof row.fuelLevel === "number") {
        const prevLevel = Number(arr[i - 1]?.fuelLevel);
        const currLevel = Number(row.fuelLevel);
        if (Number.isFinite(prevLevel) && Number.isFinite(currLevel)) {
          const delta = currLevel - prevLevel;
          if (delta >= REFUEL_MIN) event = "REFUEL";
          else if (delta <= -THEFT_MIN) event = "THEFT";
        }
      }
    }

    return {
      ...row,
      id,
      eventType: event,
      fuelChange,
    };
  });
}
