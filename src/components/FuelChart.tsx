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
import { format, subMinutes } from "date-fns";

const base = new Date();

const mockFuelData = [
  { time: subMinutes(base, 600).getTime(), fuelLevel: 95, event: null },
  { time: subMinutes(base, 570).getTime(), fuelLevel: 94, event: null },
  { time: subMinutes(base, 540).getTime(), fuelLevel: 91, event: "Drop" },
  { time: subMinutes(base, 510).getTime(), fuelLevel: 90, event: null },
  { time: subMinutes(base, 480).getTime(), fuelLevel: 89, event: null },
  { time: subMinutes(base, 450).getTime(), fuelLevel: 88, event: "Drop" },
  { time: subMinutes(base, 420).getTime(), fuelLevel: 86, event: null },
  { time: subMinutes(base, 390).getTime(), fuelLevel: 72, event: "Theft" },
  { time: subMinutes(base, 360).getTime(), fuelLevel: 70, event: null },
  { time: subMinutes(base, 330).getTime(), fuelLevel: 68, event: "Drop" },
  { time: subMinutes(base, 300).getTime(), fuelLevel: 92, event: "Refuel" },
  { time: subMinutes(base, 270).getTime(), fuelLevel: 90, event: null },
  { time: subMinutes(base, 240).getTime(), fuelLevel: 89, event: null },
  { time: subMinutes(base, 210).getTime(), fuelLevel: 85, event: "Drop" },
  { time: subMinutes(base, 180).getTime(), fuelLevel: 83, event: null },
  { time: subMinutes(base, 150).getTime(), fuelLevel: 79, event: null },
  { time: subMinutes(base, 120).getTime(), fuelLevel: 76, event: null },
  { time: subMinutes(base, 90).getTime(), fuelLevel: 60, event: "Theft" },
  { time: subMinutes(base, 60).getTime(), fuelLevel: 59, event: null },
  { time: subMinutes(base, 30).getTime(), fuelLevel: 75, event: "Refuel" },
  { time: base.getTime(), fuelLevel: 74, event: null },
];

const FuelChart: React.FC = () => {
  return (
    <section className="bg-white rounded-xl shadow p-6 mt-10">
      <h3 className="text-xl font-semibold text-gray-800 mb-4">📈 Fuel Level Graph</h3>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={mockFuelData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            dataKey="time"
            tickFormatter={(value) => format(new Date(value), "HH:mm")}
            type="number"
            domain={["dataMin", "dataMax"]}
            scale="time"
          />
          <YAxis />
          <Tooltip />
          <Line
            type="monotone"
            dataKey="fuelLevel"
            stroke="#3b82f6"
            strokeWidth={2}
            dot={false}
          />
          <Scatter
            data={mockFuelData.filter((d) => d.event === "Theft")}
            fill="#ef4444"
            shape="triangle"
          />
          <Scatter
            data={mockFuelData.filter((d) => d.event === "Refuel")}
            fill="#10b981"
            shape="square"
          />
          <Scatter
            data={mockFuelData.filter((d) => d.event === "Drop")}
            fill="#f59e0b"
            shape="circle"
          />
        </LineChart>
      </ResponsiveContainer>

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
