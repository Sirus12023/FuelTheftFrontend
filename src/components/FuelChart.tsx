// src/components/FuelChart.tsx
import React, { useMemo } from "react";
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, ReferenceArea,
} from "recharts";
import { format } from "date-fns";
import type { FuelReading } from "../types/fuel";

type EventType = "REFUEL" | "THEFT" | "DROP" | "NORMAL";

interface FuelChartProps {
  fuelData: FuelReading[];
  busId: string;
  /** Use backend summary when available */
  theftTotalOverride?: number;
  /** offline bands (epoch ms) */
  offlineWindows?: { start: number; end: number }[];
}

interface ParsedDataPoint {
  time: number;
  fuelLevel: number;
  event: EventType;
  fuelChange?: number;
  description?: string;
  /** used only for plotting (null inside offline ranges) */
  fuelLevelPlot: number | null;
}

const normalizeEvent = (rawType?: string): EventType => {
  const upper = rawType?.toUpperCase();
  return (["REFUEL", "THEFT", "DROP"].includes(upper || "") ? upper : "NORMAL") as EventType;
};

const THEFT_EVENTS = new Set<EventType>(["THEFT"]);
// const THEFT_EVENTS = new Set<EventType>(["THEFT", "DROP"]);

const EPS = 0.2;

/** Dot renderer that hides during offline windows by returning an empty <g /> */
const DotRenderer: React.FC<any> = ({ cx, cy, payload }) => {
  if (!payload || payload.fuelLevelPlot == null) return <g />; // not null
  const event: EventType = payload.event ?? "NORMAL";
  const fill =
    event === "THEFT" ? "#ef4444" :
    event === "REFUEL" ? "#10b981" :
    event === "DROP" ? "#f59e0b" :
    "#3b82f6";
  return <circle cx={cx} cy={cy} r={4} fill={fill} stroke="#fff" strokeWidth={1} />;
};

/** Active (hover) dot renderer; also hidden during offline windows */
const ActiveDotRenderer: React.FC<any> = ({ cx, cy, payload }) => {
  if (!payload || payload.fuelLevelPlot == null) return <g />; // not null
  return <circle cx={cx} cy={cy} r={6} fill="#3b82f6" stroke="#000" strokeWidth={1} />;
};

const FuelChart: React.FC<FuelChartProps> = ({ fuelData, busId, theftTotalOverride, offlineWindows = [] }) => {
  const [isDark, setIsDark] = React.useState(false);
  React.useEffect(() => {
    setIsDark(document.documentElement.classList.contains("dark"));
  }, []);

  const isInOffline = React.useCallback(
    (t: number) => offlineWindows.some(w => t >= w.start && t <= w.end),
    [offlineWindows]
  );

  const { parsedData, computedTheft, fromStr, toStr } = useMemo(() => {
    const sorted = [...(fuelData || [])]
      .filter(d => d && d.timestamp && !Number.isNaN(new Date(d.timestamp as any).getTime()))
      .sort((a, b) => new Date(a.timestamp as any).getTime() - new Date(b.timestamp as any).getTime());

    const parsed: ParsedDataPoint[] = sorted.map((d) => {
      const t = new Date(d.timestamp as any).getTime();
      const ev = normalizeEvent((d as any).eventType || (d as any).type);
      const chRaw = (d as any).fuelChange;
      const ch = typeof chRaw === "number"
        ? chRaw
        : (typeof chRaw === "string" && chRaw.trim() !== "" ? Number(chRaw) : undefined);

      return {
        time: t,
        fuelLevel: Number(d.fuelLevel),
        event: ev,
        fuelChange: Number.isFinite(ch as number) ? (ch as number) : undefined,
        description: (d as any).description,
        fuelLevelPlot: null, // filled below based on offline windows
      };
    });

    // break the line inside offline windows by nulling fuelLevelPlot
    for (const p of parsed) {
      p.fuelLevelPlot = isInOffline(p.time) ? null : p.fuelLevel;
    }

    // Strict: only sum provided fuelChange for theft-like events
    let theft = 0;
    for (let i = 0; i < parsed.length; i++) {
      if (THEFT_EVENTS.has(parsed[i].event)) {
        const fc = parsed[i].fuelChange;
        if (typeof fc === "number" && Math.abs(fc) > EPS) {
          theft += Math.abs(fc);
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

    return { parsedData: parsed, computedTheft: theft, fromStr, toStr };
  }, [fuelData, isInOffline]);

  const totalTheft = typeof theftTotalOverride === "number"
    ? theftTotalOverride
    : computedTheft;

  if (!parsedData || parsedData.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-6 mt-10 text-center text-gray-500 dark:text-gray-400">
        No fuel data available for the selected date range or bus.
      </div>
    );
  }

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
          {/* offline bands */}
          {offlineWindows.map((w, i) => (
            <ReferenceArea
              key={`off-${w.start}-${w.end}-${i}`}
              x1={w.start}
              x2={w.end}
              y1="dataMin"
              y2="dataMax"
              fill={isDark ? "#6b7280" : "#9ca3af"}   // gray-500/400
              fillOpacity={0.25}
              strokeOpacity={0}
            />
          ))}

          <CartesianGrid stroke={isDark ? "#374151" : "#ccc"} strokeDasharray="3 3" />
          <XAxis
            dataKey="time"
            tickFormatter={(v) => { try { return format(new Date(v), "HH:mm"); } catch { return ""; } }}
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
                  typeof fuelChange === "number" && !Number.isNaN(fuelChange)
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
            dataKey="fuelLevelPlot"
            connectNulls={false}          // breaks across offline windows
            stroke="#3b82f6"
            strokeWidth={2}
            // IMPORTANT: supply ELEMENTS, not functions; never return null
            dot={<DotRenderer />}
            activeDot={<ActiveDotRenderer />}
          />
        </LineChart>
      </ResponsiveContainer>

      <div className="flex items-center gap-6 mt-4 text-sm text-gray-700 dark:text-gray-300">
        <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-sm" style={{ backgroundColor: "#ef4444" }} />Theft</div>
        <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-sm" style={{ backgroundColor: "#10b981" }} />Refuel</div>
        <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-sm" style={{ backgroundColor: "#f59e0b" }} />Drop</div>
        <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-sm" style={{ backgroundColor: "#3b82f6" }} />Normal</div>
        {offlineWindows.length > 0 && (
          <div className="ml-auto text-xs italic text-gray-500 dark:text-gray-400">
            Grey band = sensor offline
          </div>
        )}
      </div>
    </section>
  );
};

export default FuelChart;


























// // src/components/FuelChart.tsx
// import React, { useMemo } from "react";
// import {
//   LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
// } from "recharts";
// import { format } from "date-fns";
// import type { FuelReading } from "../types/fuel";

// type EventType = "REFUEL" | "THEFT" | "DROP" | "NORMAL";

// interface FuelChartProps {
//   fuelData: FuelReading[];
//   busId: string;
//   /** NEW: use backend summary when available */
//   theftTotalOverride?: number;
// }

// interface ParsedDataPoint {
//   time: number;
//   fuelLevel: number;
//   event: EventType;
//   fuelChange?: number;
//   description?: string;
// }

// const normalizeEvent = (rawType?: string): EventType => {
//   const upper = rawType?.toUpperCase();
//   return (["REFUEL", "THEFT", "DROP"].includes(upper || "") ? upper : "NORMAL") as EventType;
// };

// // If your backend marks theft as DROP, switch to include it:
// const THEFT_EVENTS = new Set<EventType>(["THEFT"]);
// // const THEFT_EVENTS = new Set<EventType>(["THEFT", "DROP"]);

// const EPS = 0.2;

// const FuelChart: React.FC<FuelChartProps> = ({ fuelData, busId, theftTotalOverride }) => {
//   const [isDark, setIsDark] = React.useState(false);
//   React.useEffect(() => {
//     setIsDark(document.documentElement.classList.contains("dark"));
//   }, []);

//   const { parsedData, computedTheft, fromStr, toStr } = useMemo(() => {
//     const sorted = [...(fuelData || [])]
//       .filter(d => d && d.timestamp && !Number.isNaN(new Date(d.timestamp as any).getTime()))
//       .sort((a, b) => new Date(a.timestamp as any).getTime() - new Date(b.timestamp as any).getTime());

//     const parsed: ParsedDataPoint[] = sorted.map((d) => ({
//       time: new Date(d.timestamp as any).getTime(),
//       fuelLevel: Number(d.fuelLevel),
//       event: normalizeEvent((d as any).eventType || (d as any).type),
//       // coerce to number if string (e.g. "-12.4")
//       fuelChange: typeof (d as any).fuelChange === "number"
//         ? (d as any).fuelChange
//         : (typeof (d as any).fuelChange === "string" && (d as any).fuelChange.trim() !== ""
//             ? Number((d as any).fuelChange)
//             : undefined),
//       description: (d as any).description,
//     }));

//     // Strict: only sum provided fuelChange for theft-like events
//     let theft = 0;
//     for (let i = 0; i < parsed.length; i++) {
//       if (THEFT_EVENTS.has(parsed[i].event)) {
//         const fc = parsed[i].fuelChange;
//         if (typeof fc === "number" && Math.abs(fc) > EPS) {
//           theft += Math.abs(fc);
//         }
//       }
//     }

//     let fromStr = "N/A";
//     let toStr = "N/A";
//     if (parsed.length > 0) {
//       try {
//         fromStr = format(new Date(parsed[0].time), "PPpp");
//         toStr = format(new Date(parsed[parsed.length - 1].time), "PPpp");
//       } catch {}
//     }

//     return { parsedData: parsed, computedTheft: theft, fromStr, toStr };
//   }, [fuelData]);

//   // prefer backend summary when given
//   const totalTheft = typeof theftTotalOverride === "number"
//     ? theftTotalOverride
//     : computedTheft;

//   if (!parsedData || parsedData.length === 0) {
//     return (
//       <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-6 mt-10 text-center text-gray-500 dark:text-gray-400">
//         No fuel data available for the selected date range or bus.
//       </div>
//     );
//   }

//   const getDotColor = (event: EventType) => {
//     switch (event) {
//       case "THEFT": return "#ef4444";
//       case "REFUEL": return "#10b981";
//       case "DROP": return "#f59e0b";
//       default: return "#3b82f6";
//     }
//   };

//   return (
//     <section className="bg-white dark:bg-gray-800 rounded-xl shadow p-6 mt-10">
//       <div className="flex flex-wrap items-center justify-between mb-4">
//         <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-100">
//           📈 Fuel Level Graph – <span className="text-blue-600 dark:text-blue-300">{busId}</span>
//         </h3>
//         <div className="bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-200 px-3 py-1.5 rounded-lg text-sm font-medium">
//           🚩 Total Fuel Theft: <span className="font-bold">{totalTheft.toFixed(2)} L</span>
//         </div>
//       </div>

//       <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
//         Showing data from <strong>{fromStr}</strong> to <strong>{toStr}</strong> ({parsedData.length} data points)
//       </p>

//       <ResponsiveContainer width="100%" height={300}>
//         <LineChart data={parsedData} margin={{ top: 10, right: 30, left: 10, bottom: 10 }}>
//           <CartesianGrid stroke={isDark ? "#374151" : "#ccc"} strokeDasharray="3 3" />
//           <XAxis
//             dataKey="time"
//             tickFormatter={(v) => { try { return format(new Date(v), "HH:mm"); } catch { return ""; } }}
//             type="number"
//             domain={["dataMin", "dataMax"]}
//             scale="time"
//             tick={{ fill: isDark ? "#d1d5db" : "#374151", fontSize: 12 }}
//           />
//           <YAxis
//             domain={[0, "auto"]}
//             label={{ value: "Fuel (Litres)", angle: -90, position: "insideLeft", fill: isDark ? "#d1d5db" : "#374151" }}
//             tick={{ fill: isDark ? "#d1d5db" : "#374151", fontSize: 12 }}
//           />
//           <Tooltip
//             labelFormatter={(label) => { try { return format(new Date(label), "PPpp"); } catch { return ""; } }}
//             formatter={(value: number, _name: string, props: any) => {
//               const event = props?.payload?.event || "NORMAL";
//               const description = props?.payload?.description;
//               const fuelChange = props?.payload?.fuelChange as number | undefined;

//               if (event !== "NORMAL") {
//                 const eventLabel = event.charAt(0) + event.slice(1).toLowerCase();
//                 const changeStr =
//                   typeof fuelChange === "number" && !Number.isNaN(fuelChange)
//                     ? ` (${fuelChange > 0 ? "+" : ""}${fuelChange.toFixed(2)} L)`
//                     : "";
//                 return [`${value} L`, `${eventLabel}${changeStr}: ${description || "Detected Event"}`];
//               }
//               return [`${value} L`, "Fuel Level"];
//             }}
//             contentStyle={{ backgroundColor: isDark ? "#1f2937" : "#fff", border: "none", color: isDark ? "#f3f4f6" : "#1f2937", fontSize: "14px" }}
//             labelStyle={{ color: isDark ? "#d1d5db" : "#4b5563" }}
//           />
//           <Line
//             type="monotone"
//             dataKey="fuelLevel"
//             stroke="#3b82f6"
//             strokeWidth={2}
//             dot={(props: any) => {
//               const { cx, cy, payload, index } = props;
//               const event = payload?.event ?? "NORMAL";
//               return (
//                 <circle
//                   key={`dot-${index}`}
//                   cx={cx}
//                   cy={cy}
//                   r={4}
//                   fill={getDotColor(event)}
//                   stroke="#fff"
//                   strokeWidth={1}
//                 />
//               );
//             }}
//             activeDot={(props: any) => {
//               const { cx, cy, index } = props;
//               return <circle key={`activedot-${index}`} cx={cx} cy={cy} r={6} fill="#3b82f6" stroke="#000" strokeWidth={1} />;
//             }}
//           />
//         </LineChart>
//       </ResponsiveContainer>

//       <div className="flex items-center gap-6 mt-4 text-sm text-gray-700 dark:text-gray-300">
//         <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-sm" style={{ backgroundColor: "#ef4444" }} />Theft</div>
//         <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-sm" style={{ backgroundColor: "#10b981" }} />Refuel</div>
//         <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-sm" style={{ backgroundColor: "#f59e0b" }} />Drop</div>
//         <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-sm" style={{ backgroundColor: "#3b82f6" }} />Normal</div>
//       </div>
//     </section>
//   );
// };

// export default FuelChart;
