// pages/Dashboard.tsx

import React, { useEffect, useState } from "react";
import axios from "axios";
import { API_BASE_URL } from "../config";
import MonitoredBusCard from "../components/MonitoredBusCard";
import { getDateRange } from "../utils/dateRangeFromTimeOption";
import FuelChart from "../components/FuelChart";
import StatCards from "../components/StatCards";
import FuelStatsGrid from "../components/FuelStatsGrid";
import { BusFront } from "lucide-react";
import CountUp from "react-countup";

interface Reading {
  timestamp: string;
  fuelLevel: number;
  eventType?: string;
  description?: string;
  type?: string; // Added to fix compile error
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
  topBuses: Bus[];
}

interface FuelUsageStats {
  totalFuelConsumed: number;
  totalFuelStolen: number;
  totalFuelRefueled: number;
  distanceTravelled: number;
  fuelEfficiency: number;
}

interface BusDetailsResponse {
  readings: Reading[];
  alerts?: Reading[];
}

const Dashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats>({
    totalBuses: 0,
    topBuses: [],
  });

  const [selectedBus, setSelectedBus] = useState<string | null>(null);
  const [fuelData, setFuelData] = useState<Reading[]>([]);
  const [events, setEvents] = useState<Reading[]>([]);
  const [fuelStats, setFuelStats] = useState<FuelUsageStats | null>(null);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const res = await axios.get<Bus[]>(`${API_BASE_URL}/vehicles`);
        const buses = res.data;

        const topBuses = await Promise.all(
          buses.map(async (bus: any) => {
            try {
              const detailRes = await axios.get<BusDetailsResponse>(
  `${API_BASE_URL}/vehicles/${bus.id}/details?include=readings`
);
const readings = detailRes.data.readings || [];
              const latestFuel = readings.at(-1)?.fuelLevel ?? 0;

              const sensorRes = await axios.get(`${API_BASE_URL}/sensor`, {
                params: { busId: bus.id },
              });
              const sensors = Array.isArray(sensorRes.data) ? sensorRes.data : [];
              const allSensorsActive = sensors.every((s: any) => s.isActive);

              return {
                busId: bus.id,
                registrationNo: bus.registrationNo,
                driverName: bus.driver,
                routeName: bus.route,
                fuelLevel: latestFuel,
                status: allSensorsActive ? ("normal" as "normal" | "alert" | "offline") : ("offline" as "normal" | "alert" | "offline"),
              };
            } catch {
              return {
                busId: bus.id,
                registrationNo: bus.registrationNo,
                driverName: bus.driver,
                routeName: bus.route,
                fuelLevel: 0,
                status: "offline" as "normal" | "alert" | "offline",
              };
            }
          })
        );

        setStats({ totalBuses: buses.length, topBuses });
      } catch (err) {
        console.error("Error fetching dashboard data:", err);
      }
    };

    fetchDashboard();
  }, []);

  useEffect(() => {
    if (!selectedBus) return;

    const { startDate, endDate } = getDateRange("This Week");

    const fetchBusDetails = async () => {
      try {
        const res = await axios.get(
          `${API_BASE_URL}/vehicles/${selectedBus}/details?include=readings,alerts`
        );

        const data = res.data as BusDetailsResponse;
        const readings = data.readings || [];
        const alerts = data.alerts || [];

        const enrichedReadings = readings.map((r: any) => {
          const readingTime = new Date(r.timestamp).getTime();
          const matchedAlert = alerts.find((a: any) => {
            const alertTime = new Date(a.timestamp).getTime();
            return Math.abs(alertTime - readingTime) < 60000;
          });

          return {
            timestamp: r.timestamp,
            fuelLevel: r.fuelLevel,
            eventType: matchedAlert?.type?.toUpperCase() || "NORMAL",
            description: matchedAlert?.description,
          };
        });

        setFuelData(enrichedReadings);
        setEvents(enrichedReadings.filter((r) => r.eventType !== "NORMAL"));

        const usageRes = await axios.get<FuelUsageStats>(`${API_BASE_URL}/fuel-usage`, {
         params: {
  busId: selectedBus,
  fromDate: (startDate ?? new Date()).toISOString(),
  toDate: (endDate ?? new Date()).toISOString(),
},
        });

        setFuelStats(usageRes.data);
      } catch (err) {
        console.error("Error fetching selected bus details:", err);
      }
    };

    fetchBusDetails();
  }, [selectedBus]);

  return (
    <div className="space-y-10 px-6 py-8 max-w-7xl mx-auto text-gray-800 dark:text-gray-100">
      {/* Intro */}
      <div className="relative z-10 text-center py-12 px-6 bg-white/80 dark:bg-gray-800/80 backdrop-blur rounded-2xl shadow-lg max-w-4xl mx-auto space-y-6">
        <p className="text-lg md:text-xl leading-relaxed font-medium">
          Welcome to <span className="font-signord font-semibold text-blue-600 dark:text-blue-300">FuelSafe</span> — your centralized platform to monitor fuel usage, detect theft, and track refueling activities.
        </p>
        <div className="flex flex-wrap justify-center gap-3 mt-4">
          <span className="bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-4 py-2 rounded-full text-sm font-medium">🔍 Real-time Monitoring</span>
          <span className="bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-100 px-4 py-2 rounded-full text-sm font-medium">⚠️ Anomaly Detection</span>
          <span className="bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-100 px-4 py-2 rounded-full text-sm font-medium">✅ {stats.totalBuses} Buses Monitored</span>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-gradient-to-r from-blue-500 to-blue-700 text-white p-6 rounded-xl shadow-md flex flex-col gap-2 hover:scale-[1.02] transition-transform">
          <div className="flex justify-between items-center">
            <BusFront className="w-8 h-8 text-white" />
            <div className="w-8 h-8" />
          </div>
          <h3 className="text-sm">Total Buses</h3>
          <p className="text-2xl font-bold">
            <CountUp end={stats.totalBuses} duration={1.2} separator="," />
          </p>
        </div>

        <StatCards title="Ongoing Alerts" icon="alert" color="from-red-500 to-red-700" apiPath="/alerts/count" />
        <StatCards title="Fuel Theft Events" icon="fuel" color="from-yellow-500 to-yellow-700" apiPath="/alerts/count?type=THEFT" />
        <StatCards title="Refueling Events" icon="refuel" color="from-green-500 to-green-700" apiPath="/alerts/count?type=REFUEL" />
      </div>

      {/* Monitored Buses */}
      <div>
        <h3 className="text-2xl font-semibold mb-4">🚌 Monitored Buses</h3>
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
              onClick={() => setSelectedBus((prev) => (prev === bus.busId ? null : bus.busId))}
              selected={selectedBus === bus.busId}
            />
          ))}
        </div>
      </div>

      {/* Selected Bus Chart */}
      {selectedBus && (
        <div className="mt-10 space-y-8">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow border border-gray-100 dark:border-gray-700">
            <h3 className="text-xl font-semibold mb-4">
              Fuel Level Over Time – <span className="text-blue-600 dark:text-blue-400">{selectedBus}</span>
            </h3>
            <FuelChart fuelData={fuelData} busId={selectedBus} />


            {fuelStats && <FuelStatsGrid stats={fuelStats} />}
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
