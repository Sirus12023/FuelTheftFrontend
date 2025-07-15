import React, { useEffect, useState } from "react";
import axios from "axios";
import { API_BASE_URL } from "../config";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import MonitoredBusCard from "../components/MonitoredBusCard";

const Dashboard: React.FC = () => {
  const [stats, setStats] = useState({
    totalBuses: 0,
    activeAlerts: 0,
    thefts: 0,
    refuels: 0,
    topBuses: [],
  });

  const [selectedBus, setSelectedBus] = useState<string | null>(null);
  const [fuelData, setFuelData] = useState([]);
  const [events, setEvents] = useState([]);

  // Fetch dashboard stats + bus list
  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const res = await axios.get(`${API_BASE_URL}/dashboard`);
        setStats(res.data);
      } catch (err) {
        console.error("Error fetching dashboard:", err);
      }
    };

    fetchDashboard();
  }, []);

  // Fetch fuel + events of selected bus
  useEffect(() => {
    if (!selectedBus) return;

    const fetchBusDetails = async () => {
      try {
        const res = await axios.get(`${API_BASE_URL}/buses/${selectedBus}/details`);
        const readings = res.data.readings || [];

        setFuelData(readings);
        setEvents(readings.filter((r: any) => r.eventType && r.eventType !== "Normal"));
      } catch (err) {
        console.error("Error fetching bus details:", err);
      }
    };

    fetchBusDetails();
  }, [selectedBus]);

  const statCards = [
    { title: "Total Buses", value: stats.totalBuses, icon: "🚌", color: "from-blue-500 to-blue-700" },
    { title: "Ongoing Alerts", value: stats.activeAlerts, icon: "🚨", color: "from-red-500 to-red-700" },
    { title: "Fuel Theft Events", value: stats.thefts, icon: "🔻", color: "from-yellow-500 to-yellow-700" },
    { title: "Refueling Events", value: stats.refuels, icon: "⛽", color: "from-green-500 to-green-700" },
  ];

  return (
    <div className="space-y-10 px-6 py-8 max-w-7xl mx-auto">
      {/* Header */}
      <section className="bg-white rounded-2xl p-6 shadow border border-blue-100">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Welcome to Fuel Theft Monitoring!</h1>
        <p className="text-gray-600 text-sm leading-relaxed">
          Monitor real-time fuel usage and alerts across your fleet.
        </p>
        <p className="text-sm italic mt-2 text-gray-500">
          Currently monitoring {stats.totalBuses} buses during testing phase.
        </p>
      </section>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, idx) => (
          <div
            key={idx}
            className={`bg-gradient-to-r ${stat.color} text-white p-6 rounded-xl shadow-md flex items-center gap-4 hover:scale-[1.02] transition-transform`}
          >
            <div className="text-4xl">{stat.icon}</div>
            <div>
              <h3 className="text-sm">{stat.title}</h3>
              <p className="text-2xl font-bold">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Bus Cards */}
      <div>
        <h3 className="text-2xl font-semibold mb-4 text-gray-700">🚌 Monitored Buses</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {stats.topBuses.map((bus: any, idx: number) => (
            <MonitoredBusCard
              key={idx}
              {...bus}
              onClick={() => setSelectedBus(bus.busId)}
            />
          ))}
        </div>
      </div>

      {!selectedBus && (
        <div className="mt-10 text-gray-500 text-sm italic">
          Click a bus to view its fuel chart and event logs.
        </div>
      )}

      {selectedBus && (
        <div className="mt-10 space-y-8">
          {/* Fuel Chart */}
          <div className="bg-white p-6 rounded-2xl shadow border">
            <h3 className="text-xl font-semibold mb-4 text-gray-800">
              Fuel Level Over Time – <span className="text-blue-600">{selectedBus}</span>
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={fuelData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="timestamp" />
                <YAxis label={{ value: "Fuel (%)", angle: -90, position: "insideLeft" }} />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="fuelLevel"
                  stroke="#3b82f6"
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Events */}
          <section className="bg-white rounded-xl shadow p-6 border border-gray-100">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">Recent Events</h3>
            <ul className="space-y-4">
              {events.map((event: any, idx: number) => {
                const icon =
                  event.eventType === "Refuel"
                    ? "⛽"
                    : event.eventType === "Theft"
                    ? "🚨"
                    : "🔻";

                return (
                  <li key={idx} className="bg-gray-50 p-4 rounded-lg shadow-sm border-l-4 border-blue-500">
                    <div className="flex items-start gap-3">
                      <div className="text-2xl">{icon}</div>
                      <div>
                        <p className="font-medium text-blue-700">{event.eventType}</p>
                        <p className="text-sm text-gray-600">{event.timestamp} – {event.description || "Event detected"}</p>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          </section>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
