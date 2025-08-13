import React, { useMemo } from "react";
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
} from "recharts";
import { format } from "date-fns";
import type { FuelReading } from "../types/fuel";

type EventType = "REFUEL" | "THEFT" | "DROP" | "NORMAL";

interface FuelChartProps {
  fuelData: FuelReading[];
  busId: string;
}

interface ParsedDataPoint {
  time: number;
  fuelLevel: number;
  event: EventType;
  fuelChange?: number;
  description?: string;
}

const normalizeEvent = (rawType?: string): EventType => {
  const upper = rawType?.toUpperCase();
  return (["REFUEL", "THEFT", "DROP"].includes(upper || "") ? upper : "NORMAL") as EventType;
};

const LegendItem = ({ color, label }: { color: string; label: string }) => (
  <div className="flex items-center gap-2">
    <div className="w-3 h-3" style={{ backgroundColor: color, borderRadius: 2 }} /> {label}
  </div>
);

const EPS = 0.2;

const FuelChart: React.FC<FuelChartProps> = ({ fuelData, busId }) => {
  // HOOKS MUST COME FIRST (unconditional)
  const [isDark, setIsDark] = React.useState(false);
  React.useEffect(() => {
    setIsDark(document.documentElement.classList.contains("dark"));
  }, []);

  const { parsedData, totalTheft, fromStr, toStr } = useMemo(() => {
    const sorted = [...(fuelData || [])]
      .filter(d => d && d.timestamp && !Number.isNaN(new Date(d.timestamp as any).getTime()))
      .sort((a, b) => new Date(a.timestamp as any).getTime() - new Date(b.timestamp as any).getTime());

    const parsed: ParsedDataPoint[] = sorted.map((d) => ({
      time: new Date(d.timestamp as any).getTime(),
      fuelLevel: d.fuelLevel,
      event: normalizeEvent((d as any).eventType || (d as any).type),
      fuelChange: (d as any).fuelChange,
      description: (d as any).description,
    }));

    let theft = 0;
    for (let i = 0; i < parsed.length; i++) {
      if (parsed[i].event === "THEFT") {
        const fc = parsed[i].fuelChange;
        if (typeof fc === "number" && fc < -EPS) {
          theft += Math.abs(fc);
        } else if (i > 0) {
          const drop = parsed[i - 1].fuelLevel - parsed[i].fuelLevel;
          if (drop > EPS) theft += drop;
        }
      }
    }

    let fromStr = "N/A";
    let toStr = "N/A";
    if (parsed.length > 0) {
      try {
        fromStr = format(new Date(parsed[0].time), "PPpp");
        toStr = format(new Date(parsed[parsed.length - 1].time), "PPpp");
      } catch {}
    }

    return { parsedData: parsed, totalTheft: theft, fromStr, toStr };
  }, [fuelData]);

  // SAFE EARLY RETURN AFTER HOOKS
  if (!parsedData || parsedData.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-6 mt-10 text-center text-gray-500 dark:text-gray-400">
        No fuel data available for the selected date range or bus.
      </div>
    );
  }

  const getDotColor = (event: EventType) => {
    switch (event) {
      case "THEFT": return "#ef4444";
      case "REFUEL": return "#10b981";
      case "DROP": return "#f59e0b";
      default: return "#3b82f6";
    }
  };

  return (
    <section className="bg-white dark:bg-gray-800 rounded-xl shadow p-6 mt-10">
      <div className="flex flex-wrap items-center justify-between mb-4">
        <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-100">
          📈 Fuel Level Graph – <span className="text-blue-600 dark:text-blue-300">{busId}</span>
        </h3>
        <div className="bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-200 px-3 py-1.5 rounded-lg text-sm font-medium">
          🚩 Total Fuel Theft: <span className="font-bold">{totalTheft.toFixed(2)} L</span>
        </div>
      </div>

      <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
        Showing data from <strong>{fromStr}</strong> to <strong>{toStr}</strong> ({parsedData.length} data points)
      </p>

      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={parsedData} margin={{ top: 10, right: 30, left: 10, bottom: 10 }}>
          <CartesianGrid stroke={isDark ? "#374151" : "#ccc"} strokeDasharray="3 3" />
          <XAxis
            dataKey="time"
            tickFormatter={(value) => { try { return format(new Date(value), "HH:mm"); } catch { return ""; } }}
            type="number"
            domain={["dataMin", "dataMax"]}
            scale="time"
            tick={{ fill: isDark ? "#d1d5db" : "#374151", fontSize: 12 }}
          />
          <YAxis
            domain={[0, "auto"]}
            label={{ value: "Fuel (Litres)", angle: -90, position: "insideLeft", fill: isDark ? "#d1d5db" : "#374151" }}
            tick={{ fill: isDark ? "#d1d5db" : "#374151", fontSize: 12 }}
          />
          <Tooltip
            labelFormatter={(label) => { try { return format(new Date(label), "PPpp"); } catch { return ""; } }}
            formatter={(value: number, _name: string, props: any) => {
              const event = props?.payload?.event || "NORMAL";
              const description = props?.payload?.description;
              const fuelChange = props?.payload?.fuelChange as number | undefined;

              if (event !== "NORMAL") {
                const eventLabel = event.charAt(0) + event.slice(1).toLowerCase();
                const changeStr =
                  typeof fuelChange === "number" && Math.abs(fuelChange) > EPS
                    ? ` (${fuelChange > 0 ? "+" : ""}${fuelChange.toFixed(2)} L)`
                    : "";
                return [`${value} L`, `${eventLabel}${changeStr}: ${description || "Detected Event"}`];
              }
              return [`${value} L`, "Fuel Level"];
            }}
            contentStyle={{ backgroundColor: isDark ? "#1f2937" : "#fff", border: "none", color: isDark ? "#f3f4f6" : "#1f2937", fontSize: "14px" }}
            labelStyle={{ color: isDark ? "#d1d5db" : "#4b5563" }}
          />
          <Line
            type="monotone"
            dataKey="fuelLevel"
            stroke="#3b82f6"
            strokeWidth={2}
            dot={({ cx, cy, payload }) => {
              const event = (payload as ParsedDataPoint).event;
              return <circle cx={cx} cy={cy} r={4} fill={getDotColor(event)} stroke="#fff" strokeWidth={1} />;
            }}
            activeDot={(props) => {
              const { cx, cy } = props as any;
              return <circle cx={cx} cy={cy} r={6} fill="#3b82f6" stroke="#000" strokeWidth={1} />;
            }}
          />
        </LineChart>
      </ResponsiveContainer>

      <div className="flex items-center gap-6 mt-4 text-sm text-gray-700 dark:text-gray-300">
        <LegendItem color="#ef4444" label="Theft" />
        <LegendItem color="#10b981" label="Refuel" />
        <LegendItem color="#f59e0b" label="Drop" />
        <LegendItem color="#3b82f6" label="Normal" />
      </div>
    </section>
  );
};

export default FuelChart;
