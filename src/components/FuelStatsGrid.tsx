// src/components/FuelStatsGrid.tsx
import React from "react";

interface FuelUsageStats {
  total_fuel_consumed?: number | string | null;
  total_fuel_stolen?: number | string | null;
  total_fuel_refueled?: number | string | null;
  distance_traveled?: number | string | null;
  fuel_efficiency?: number | string | null;
}

interface Props {
  stats?: Partial<FuelUsageStats> | null;   // allow partial / null while loading
  loading?: boolean;
}

const fmt = (val: unknown, unit = "", digits = 2) => {
  const num = typeof val === "string" ? Number(val) : (val as number);
  if (num == null || Number.isNaN(num) || !Number.isFinite(num)) return "--";
  return `${num.toFixed(digits)}${unit ? ` ${unit}` : ""}`;
};

const Card: React.FC<{ title: string; value: string; className?: string; }> = ({ title, value, className }) => (
  <div className={`bg-white dark:bg-gray-800 p-4 rounded-lg shadow border border-gray-100 dark:border-gray-700 ${className || ""}`}>
    <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">{title}</h4>
    <p className="text-xl font-semibold">{value}</p>
  </div>
);

const Skeleton: React.FC = () => (
  <div className="animate-pulse h-6 w-24 rounded bg-gray-200 dark:bg-gray-700" />
);

const FuelStatsGrid: React.FC<Props> = ({ stats, loading }) => {
  const consumed = fmt(stats?.total_fuel_consumed, "L");
  const stolen = fmt(stats?.total_fuel_stolen, "L");
  const refueled = fmt(stats?.total_fuel_refueled, "L");
  const distance = fmt(stats?.distance_traveled, "km");
  const efficiency = fmt(stats?.fuel_efficiency, "km/L");

  return (
    <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
      <Card
        title="Total Fuel Consumed"
        value={
          loading ? <Skeleton /> as unknown as string : (
            <span className="text-blue-600 dark:text-blue-300">{consumed}</span>
          ) as unknown as string
        }
      />
      <Card
        title="Fuel Stolen"
        value={
          loading ? <Skeleton /> as unknown as string : (
            <span className="text-red-600 dark:text-red-300">{stolen}</span>
          ) as unknown as string
        }
      />
      <Card
        title="Fuel Refueled"
        value={
          loading ? <Skeleton /> as unknown as string : (
            <span className="text-green-600 dark:text-green-300">{refueled}</span>
          ) as unknown as string
        }
      />
      <Card
        title="Distance Traveled"
        value={
          loading ? <Skeleton /> as unknown as string : (
            <span className="text-yellow-600 dark:text-yellow-300">{distance}</span>
          ) as unknown as string
        }
      />
      <Card
        title="Fuel Efficiency"
        value={
          loading ? <Skeleton /> as unknown as string : (
            <span className="text-purple-600 dark:text-purple-300">{efficiency}</span>
          ) as unknown as string
        }
      />
    </div>
  );
};

export default FuelStatsGrid;
