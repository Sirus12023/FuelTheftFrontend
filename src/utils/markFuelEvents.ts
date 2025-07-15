// utils/markFuelEvents.ts
export const markFuelEvents = (data: any[]) => {
  const marked = data.map((point, idx, arr) => {
    if (idx === 0) return { ...point };

    const prev = arr[idx - 1];
    const delta = point.fuelLevel - prev.fuelLevel;

    if (delta >= 10) {
      return { ...point, eventType: "refuel" }; // Green dot
    } else if (delta <= -10) {
      return { ...point, eventType: "theft" }; // Red dot
    }

    return { ...point };
  });

  return marked;
};
