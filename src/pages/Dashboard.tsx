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
import bus1 from "../assets/bus1.jpg";
import { getDateRange } from "../utils/dateRangeFromTimeOption";
import FuelChart from "../components/FuelChart";


interface Reading {
  timestamp: string;
  fuelLevel: number;
  eventType?: "THEFT" | "REFUEL" | "LOW_FUEL" | "UNKNOWN";
  description?: string;
}

interface Bus {
  busId: string;
  registrationNo: string;
  driverName: string;
  routeName: string;
  fuelLevel: number;
  status: "normal" | "alert" | "offline";
}

interface DashboardStats {
  totalBuses: number;
  activeAlerts: number;
  thefts: number;
  refuels: number;
  topBuses: Bus[];
}

const Dashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats>({
    totalBuses: 0,
    activeAlerts: 0,
    thefts: 0,
    refuels: 0,
    topBuses: [],
  });

  const [selectedBus, setSelectedBus] = useState<string | null>(null);
  const [fuelData, setFuelData] = useState<Reading[]>([]);
  const [events, setEvents] = useState<Reading[]>([]);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const res = await axios.get<DashboardStats>(`${API_BASE_URL}/dashboard`);
        setStats(res.data);
      } catch (err) {
        console.error("Error fetching dashboard:", err);
      }
    };
    fetchDashboard();
  }, []);

 useEffect(() => {
  if (!selectedBus) return;

  const { startDate: computedStart, endDate: computedEnd } = getDateRange("This Week");

  const fetchBusDetails = async () => {
    try {
      const res = await axios.get<{ readings: Reading[] }>(
        `${API_BASE_URL}/buses/${selectedBus}/details`,
        {
          params: {
            timeRange: "This Week",
            startDate: computedStart?.toISOString(),
            endDate: computedEnd?.toISOString(),
          },
        }
      );

      const readings = res.data.readings || [];

      setFuelData(readings);
      setEvents(readings.filter((r) => r.eventType && r.eventType !== "UNKNOWN"));
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
    <div className="space-y-10 px-6 py-8 max-w-7xl mx-auto text-gray-800 dark:text-gray-100">
      <section className="relative overflow-hidden bg-gradient-to-br from-blue-50 to-white dark:from-gray-800 dark:to-gray-900 rounded-2xl p-8 shadow border border-blue-100 dark:border-gray-700">
        <div className="absolute inset-0 opacity-10 pointer-events-none">
          <img src={bus1} alt="Bus" className="h-full w-full object-cover rounded-2xl" />
        </div>
        <div className="relative z-10 text-center py-12 px-6 bg-white/80 dark:bg-gray-800/80 backdrop-blur rounded-2xl shadow-lg max-w-4xl mx-auto space-y-6">
          <p className="text-lg md:text-xl leading-relaxed font-medium">
            Welcome to <span className="font-signord font-semibold text-blue-600 dark:text-blue-300">FuelSafe</span> — your centralized platform to monitor fuel usage, detect theft, and track refueling activities.
          </p>
          <div className="flex flex-wrap justify-center gap-3 mt-4">
            <span className="bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-4 py-2 rounded-full text-sm font-medium">
              🔍 Real-time Monitoring
            </span>
            <span className="bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-100 px-4 py-2 rounded-full text-sm font-medium">
              ⚠️ Anomaly Detection
            </span>
            <span className="bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-100 px-4 py-2 rounded-full text-sm font-medium">
              ✅ {stats.totalBuses} Buses Monitored
            </span>
          </div>
        </div>
      </section>

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

      <div>
        <h3 className="text-2xl font-semibold mb-4 text-gray-700 dark:text-gray-100">🚌 Monitored Buses</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {stats.topBuses.map((bus, idx) => (
            <MonitoredBusCard
              key={idx}
              busId={bus.busId}
              regNumber={bus.registrationNo}
              driver={bus.driverName}
              route={bus.routeName}
              fuelLevel={bus.fuelLevel}
              status={bus.status}
              imageUrl=""
              onClick={() => setSelectedBus(bus.busId)}
            />
          ))}
        </div>
      </div>

      {!selectedBus && (
        <div className="mt-10 text-gray-500 dark:text-gray-400 text-sm italic">
          Click a bus to view its fuel chart and events.
        </div>
      )}

      {selectedBus && (
        <div className="mt-10 space-y-8">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow border border-gray-100 dark:border-gray-700">
            <h3 className="text-xl font-semibold mb-4">
              Fuel Level Over Time – <span className="text-blue-600 dark:text-blue-400">{selectedBus}</span>
            </h3>
           <FuelChart
  fuelData={fuelData.map((r) => ({
    ...r,
    eventType: ["THEFT", "REFUEL", "DROP"].includes(r.eventType as string)
      ? (r.eventType as "THEFT" | "REFUEL" | "DROP")
      : "NORMAL",
  }))}
  busId={selectedBus}
/>



          </div>

          {/* <section className="bg-white dark:bg-gray-800 rounded-xl shadow p-6 border border-gray-100 dark:border-gray-700">
            <h3 className="text-xl font-semibold mb-4">Recent Events</h3>
            <ul className="space-y-4">
              {events.map((event, idx) => {
                const icon =
                  event.eventType === "REFUEL"
                    ? "⛽"
                    : event.eventType === "THEFT"
                    ? "🚨"
                    : "🔻";

                return (
                  <li
                    key={idx}
                    className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg shadow-sm border-l-4 border-blue-500"
                  >
                    <div className="flex items-start gap-3">
                      <div className="text-2xl">{icon}</div>
                      <div>
                        <p className="font-medium text-blue-700 dark:text-blue-300">{event.eventType}</p>
                        <p className="text-sm text-gray-600 dark:text-gray-300">
                          {event.timestamp} – {event.description || "Event detected"}
                        </p>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          </section> */}
        </div>
      )}
    </div>
  );
};

export default Dashboard;
