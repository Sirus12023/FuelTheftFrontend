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
  Scatter,
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
  const parsedData = fuelData.map((d) => ({
    time: new Date(d.timestamp).getTime(),
    fuelLevel: d.fuelLevel,
    event: d.eventType?.toUpperCase() || null,
  }));
  
  if (!fuelData.length) {
    return (
      <div className="bg-white rounded-xl shadow p-6 mt-10 text-center text-gray-500">
        No fuel data available for the selected date range.
      </div>
    );
  }
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
            label={{ value: "Fuel (%)", angle: -90, position: "insideLeft" }}
            tick={{ fontSize: 12 }}
          />

          <Tooltip
            labelFormatter={(label) => format(new Date(label), "PPpp")}
            formatter={(value: any) => [`${value}%`, "Fuel Level"]}
          />
          <Line
            type="monotone"
            dataKey="fuelLevel"
            stroke="#3b82f6"
            strokeWidth={2}
            dot={{ r: 2 }}
            activeDot={{ r: 5 }}
          />


          {/* Event markers */}
          <Scatter
            data={parsedData.filter((d) => d.event === "THEFT")}
            fill="#ef4444"
            shape="triangle"
          />
          <Scatter
            data={parsedData.filter((d) => d.event === "REFUEL")}
            fill="#10b981"
            shape="square"
          />
          <Scatter
            data={parsedData.filter((d) => d.event === "DROP")}
            fill="#f59e0b"
            shape="circle"
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
