import React from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import { format } from "date-fns";

type EventType = "REFUEL" | "THEFT" | "DROP" | "NORMAL";

interface RawReading {
  timestamp: string;
  fuelLevel: number;
  eventType?: string;
  description?: string;
}

interface ParsedDataPoint {
  time: number;
  fuelLevel: number;
  event: EventType;
}

interface FuelChartProps {
  fuelData: RawReading[];
  busId: string;
}

const FuelChart: React.FC<FuelChartProps> = ({ fuelData, busId }) => {
  if (!fuelData.length) {
    return (
      <div className="bg-white rounded-xl shadow p-6 mt-10 text-center text-gray-500">
        No fuel data available for the selected date range.
      </div>
    );
  }

  const normalizeEvent = (rawEvent?: string): EventType => {
    const upper = rawEvent?.toUpperCase();
    if (upper === "REFUEL" || upper === "THEFT" || upper === "DROP") return upper;
    return "NORMAL";
  };

  const parsedData: ParsedDataPoint[] = fuelData.map((d) => ({
    time: new Date(d.timestamp).getTime(),
    fuelLevel: d.fuelLevel,
    event: normalizeEvent(d.eventType),
  }));

  const getDotColor = (event: EventType) => {
    switch (event) {
      case "THEFT":
        return "#ef4444"; // red
      case "REFUEL":
        return "#10b981"; // green
      case "DROP":
        return "#f59e0b"; // yellow
      default:
        return "#3b82f6"; // blue (normal)
    }
  };

  return (
    <section className="bg-white rounded-xl shadow p-6 mt-10">
      <h3 className="text-xl font-semibold text-gray-800 mb-4">
        📈 Fuel Level Graph – <span className="text-blue-600">{busId}</span>
      </h3>

      <p className="text-sm text-gray-500 mb-4">
        Showing data from{" "}
        <strong>{format(new Date(fuelData[0].timestamp), "PPpp")}</strong> to{" "}
        <strong>{format(new Date(fuelData[fuelData.length - 1].timestamp), "PPpp")}</strong>
      </p>

      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={parsedData} margin={{ top: 10, right: 30, left: 10, bottom: 10 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            dataKey="time"
            tickFormatter={(value) => format(new Date(value), "HH:mm")}
            type="number"
            domain={["dataMin", "dataMax"]}
            scale="time"
          />
          <YAxis
            domain={[0, "auto"]}
            label={{ value: "Fuel (Litres)", angle: -90, position: "insideLeft" }}
            tick={{ fontSize: 12 }}
          />
          <Tooltip
            labelFormatter={(label) => format(new Date(label), "PPpp")}
            formatter={(_, __, props: any) => {
              const event: EventType = props.payload?.event;
              return [`${props.payload.fuelLevel} L`, event !== "NORMAL" ? event : "Fuel Level"];
            }}
            contentStyle={{ fontSize: "14px" }}
          />
          <Line
            type="monotone"
            dataKey="fuelLevel"
            stroke="#3b82f6"
            strokeWidth={2}
            dot={({ cx, cy, payload }) => {
              const event = (payload as ParsedDataPoint).event;
              return (
                <circle
                  cx={cx}
                  cy={cy}
                  r={4}
                  fill={getDotColor(event)}
                  stroke="#fff"
                  strokeWidth={1}
                />
              );
            }}
            activeDot={({ cx, cy }) => (
              <circle cx={cx} cy={cy} r={6} fill="#3b82f6" stroke="#000" strokeWidth={1} />
            )}
          />
        </LineChart>
      </ResponsiveContainer>

      {/* Legend */}
      <div className="flex items-center gap-6 mt-4 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-red-500 rotate-45" /> Theft
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-green-500" /> Refuel
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-yellow-400 rounded-full" /> Drop
        </div>
      </div>
    </section>
  );
};

export default FuelChart;
