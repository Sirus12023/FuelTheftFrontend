// utils/markFuelEvents.ts

/**
 * Mark fuel events based on backend conventions.
 * 
 * - If backend already provides eventType, use it (normalize to uppercase: "REFUEL", "THEFT", "NORMAL").
 * - If not, infer from fuelLevel delta (>=10: REFUEL, <=-10: THEFT, else NORMAL).
 * - Always return eventType as uppercase string.
 */
export const markFuelEvents = (data: any[]) => {
  return data.map((point, idx, arr) => {
    // If backend provides eventType, use it (normalize to uppercase)
    if (point.eventType) {
      return { ...point, eventType: String(point.eventType).toUpperCase() };
    }

    // Otherwise, infer from fuelLevel delta
    if (idx === 0) {
      return { ...point, eventType: "NORMAL" };
    }

    const prev = arr[idx - 1];
    const delta = point.fuelLevel - prev.fuelLevel;

    if (delta >= 10) {
      return { ...point, eventType: "REFUEL" };
    } else if (delta <= -10) {
      return { ...point, eventType: "THEFT" };
    }

    return { ...point, eventType: "NORMAL" };
  });
};
