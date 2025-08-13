// src/types/fuel.ts

export type EventType = "REFUEL" | "THEFT" | "DROP" | "NORMAL";

export interface FuelReading {
  /** optional: backend sometimes omits it; we can synthesize one */
  id?: string;

  /** can arrive as ISO string, number (epoch), or Date — charts will parse it */
  timestamp: string | number | Date;

  fuelLevel: number;

  /** raw backend type if present (e.g., "REFUEL", "THEFT") */
  type?: string | null;

  /** our normalized event type (always uppercase when we set it) */
  eventType?: EventType | string | null;

  /** litres added (+) or removed (-); may be null/undefined from backend */
  fuelChange?: number | null;

  /** optional human text */
  description?: string | null;

  // keep the door open for extra fields the backend may add
  [key: string]: unknown;
}

