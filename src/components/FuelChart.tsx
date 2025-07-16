// components/FuelChart.tsx
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

interface FuelChartProps {
  fuelData: {
    timestamp: string;
    fuelLevel: number;
    eventType?: "REFUEL" | "THEFT" | "DROP" | "NORMAL";
    description?: string;
  }[];
  events: FuelChartProps["fuelData"];
  busId: string;
}

const FuelChart: React.FC<FuelChartProps> = ({ fuelData, events, busId }) => {
  if (!fuelData.length) {
    return (
      <div className="bg-white rounded-xl shadow p-6 mt-10 text-center text-gray-500">
        No fuel data available for the selected date range.
      </div>
    );
  }

  const parsedData = fuelData.map((d) => ({
    time: new Date(d.timestamp).getTime(),
    fuelLevel: d.fuelLevel,
    event: d.eventType?.toUpperCase() || "NORMAL",
  }));

  // Dynamically color dots based on event type
  const getDotColor = (event: string) => {
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
            domain={["auto", "auto"]}
            label={{ value: "Fuel (Litres)", angle: -90, position: "insideLeft" }}
            tick={{ fontSize: 12 }}
          />
          <Tooltip
            labelFormatter={(label) => format(new Date(label), "PPpp")}
            formatter={(value: any, name: any, props: any) => {
              return [`${value} L`, "Fuel Level"];
            }}
            contentStyle={{ fontSize: "14px" }}
          />
          <Line
          type="monotone"
          dataKey="fuelLevel"
          stroke="#3b82f6"
          strokeWidth={2}
          dot={({ cx, cy, payload }) => (
            <circle
              cx={cx}
              cy={cy}
              r={4}
              fill={getDotColor(payload.event)}
              stroke="#fff"
              strokeWidth={1}
            />
          )}
          activeDot={({ cx, cy }) => (
            <circle
              cx={cx}
              cy={cy}
              r={6}
              fill="#3b82f6"
              stroke="#000"
              strokeWidth={1}
            />
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
