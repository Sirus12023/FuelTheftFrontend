// src/utils/markFuelEvents.ts
import type { EventType, FuelReading } from "../types/fuel";

// ignore tiny sensor jitter (litres)
const EPS = 0.2;

const normalizeEvent = (t?: string | null): EventType => {
  const upper = (t ?? "NORMAL").toString().toUpperCase();
  return (upper === "REFUEL" || upper === "THEFT" || upper === "DROP" ? upper : "NORMAL") as EventType;
};

/**
 * Normalizes/infers event types on a time-ordered fuel series.
 * - Prefer backend-provided eventType/type when present.
 * - If backend provides fuelChange, use its sign to infer event unless server already set one.
 * - Otherwise infer from delta between consecutive points:
 *     delta >= +10 => REFUEL, delta <= -10 => THEFT, |delta| <= EPS => NORMAL.
 * - Coerces fuelChange to number | undefined (not null).
 * - Ensures every row has an id (fallback synthesized).
 */
export function markFuelEvents(
  rows: FuelReading[]
): (FuelReading & { eventType: EventType; fuelChange?: number })[] {
  if (!Array.isArray(rows) || rows.length === 0) return [];

  // defensive copy + sort by timestamp ASC
  const sorted = [...rows]
    .filter(Boolean)
    .sort((a, b) => {
      const ta = new Date(a.timestamp as any).getTime();
      const tb = new Date(b.timestamp as any).getTime();
      return ta - tb;
    });

  return sorted.map((row, i, arr) => {
    const id = row.id ?? `${new Date(row.timestamp as any).getTime() || i}-${i}`;

    // prefer server-provided type
    let event: EventType = normalizeEvent((row.eventType as string) ?? (row.type as string));

    // coerce fuelChange (null -> undefined)
    const fuelChange = typeof row.fuelChange === "number" ? row.fuelChange : undefined;

    // If backend didn't give a strong event, try fuelChange first
    if (event === "NORMAL" && typeof fuelChange === "number" && Math.abs(fuelChange) > EPS) {
      event = fuelChange > 0 ? "REFUEL" : "THEFT";
    }

    // If still NORMAL, infer from delta vs previous reading
    if (event === "NORMAL" && i > 0 && typeof row.fuelLevel === "number") {
      const prev = arr[i - 1];
      const prevLevel = Number(prev?.fuelLevel ?? NaN);
      const currLevel = Number(row.fuelLevel);
      if (!Number.isNaN(prevLevel) && !Number.isNaN(currLevel)) {
        const delta = currLevel - prevLevel;
        if (Math.abs(delta) <= EPS) {
          event = "NORMAL";
        } else if (delta >= 10) {
          event = "REFUEL";
        } else if (delta <= -10) {
          event = "THEFT";
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
