// src/utils/sensor.ts
export type SensorInfo = {
  sensorId?: string;
  sensorCode?: string;
  isActive?: boolean;
  lastSeen?: string; // ISO string
  healthEvents?: any[];
};

export type OfflineWindow = { start: number; end: number };

/**
 * Your backend only gives current sensor state (not history).
 * If it's inactive *and* stale past a threshold, we synthesize a single
 * offline band from lastSeen -> rangeEnd (clamped to range start).
 */
export function synthesizeOfflineWindowFromCurrent(
  sensor: SensorInfo | null | undefined,
  rangeStart: Date,
  rangeEnd: Date,
  staleMinutes = 5
): OfflineWindow[] {
  if (!sensor) return [];
  const { isActive, lastSeen } = sensor;

  // Explicitly online: no band
  if (isActive === true) return [];

  const end = rangeEnd.getTime();
  const startOfRange = rangeStart.getTime();

  // If no lastSeen and it's inactive, show whole window offline
  if (!lastSeen && isActive === false) {
    return [{ start: startOfRange, end }];
  }

  const ls = lastSeen ? new Date(lastSeen).getTime() : NaN;
  if (Number.isNaN(ls)) return [];

  const thresholdMs = staleMinutes * 60 * 1000;
  const isStale = end - ls >= thresholdMs;

  if (isActive === false && isStale) {
    const start = Math.max(ls, startOfRange);
    if (end > start) return [{ start, end }];
  }

  return [];
}
