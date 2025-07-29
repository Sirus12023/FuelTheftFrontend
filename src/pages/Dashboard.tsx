// ✅ Dashboard.tsx — Final Version

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
import busImage from "../assets/bus1.jpg";
import DashboardTimeFilter from "../components/DashboardTimeFilter";

// --- Types ---
interface Reading {
  id: string;
  timestamp: string;
  fuelLevel: number;
  eventType?: string;
  description?: string;
}

interface Alert {
  id: string;
  timestamp: string;
  type: string;
  description: string;
}

interface Bus {
  id: string;
  registrationNo: string;
  driver?: string;
  route?: string;
}

interface BusCard {
  busId: string;
  registrationNo: string;
  driverName: string;
  routeName: string;
  fuelLevel: number;
  status: "normal" | "alert" | "offline";
}

interface FuelUsageStats {
  totalFuelConsumed: number;
  totalFuelStolen: number;
  totalFuelRefueled: number;
  distanceTravelled: number;
  fuelEfficiency: number;
}

const Dashboard: React.FC = () => {
  const [topBuses, setTopBuses] = useState<BusCard[]>([]);
  const [totalBuses, setTotalBuses] = useState(0);
  const [selectedBus, setSelectedBus] = useState<string | null>(null);
  const [fuelData, setFuelData] = useState<Reading[]>([]);
  const [events, setEvents] = useState<Alert[]>([]);
  const [fuelStats, setFuelStats] = useState<FuelUsageStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [timeRange, setTimeRange] = useState("today");
  const [customStart, setCustomStart] = useState("");
  const [customEnd, setCustomEnd] = useState("");

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        setLoading(true);
        const res = await axios.get<Bus[]>(`${API_BASE_URL}/vehicles`);
        const buses = res.data;

        const enriched: BusCard[] = await Promise.all(
          buses.map(async (bus) => {
            try {
              const detailsRes = await axios.get<any>(
                `${API_BASE_URL}/vehicles/${bus.id}/details?include=readings,alerts,sensor`
              );
              const details = detailsRes.data;

              const readings = details.sensor?.readings ?? details.readings ?? [];
              const latestFuel = readings.length > 0 ? readings.at(-1).fuelLevel : 0;

              const isSensorActive = details.sensor?.isActive !== false;

              return {
                busId: bus.id,
                registrationNo: bus.registrationNo,
                driverName: bus.driver || details.driver?.name || "Unknown",
                routeName: bus.route || details.route?.name || "Unknown",
                fuelLevel: latestFuel,
                status: isSensorActive ? "normal" : "offline",
              };
            } catch {
              return {
                busId: bus.id,
                registrationNo: bus.registrationNo,
                driverName: bus.driver || "Unknown",
                routeName: bus.route || "Unknown",
                fuelLevel: 0,
                status: "offline",
              };
            }
          })
        );

        setTopBuses(enriched);
        setTotalBuses(buses.length);
        setError(null);
      } catch (err) {
        console.error("Dashboard fetch error:", err);
        setError("Failed to load dashboard data.");
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, []);

  useEffect(() => {
    if (!selectedBus) return;

    const range =
      timeRange === "custom"
        ? {
            startDate: customStart ? new Date(customStart) : undefined,
            endDate: customEnd ? new Date(customEnd) : undefined,
          }
        : getDateRange(timeRange);

    const startDate = range?.startDate;
    const endDate = range?.endDate;
    if (!startDate || !endDate) return;

    const fetchBusDetails = async () => {
      try {
        setLoading(true);
        const res = await axios.get<any>(
          `${API_BASE_URL}/vehicles/${selectedBus}/details`,
          {
            params: {
              include: "readings,alerts,sensor",
              fromDate: startDate.toISOString(),
              toDate: endDate.toISOString(),
            },
          }
        );
        const details = res.data;
        const readings = details.sensor?.readings ?? details.readings ?? [];
        const alerts = details.sensor?.alerts ?? details.alerts ?? [];

        const enriched = readings.map((r: any) => {
          const matched = alerts.find(
            (a: any) =>
              Math.abs(
                new Date(a.timestamp).getTime() - new Date(r.timestamp).getTime()
              ) < 60000
          );
          return {
            ...r,
            eventType: r.eventType || matched?.type || "NORMAL",
            description: r.description || matched?.description,
          };
        });

        setFuelData(enriched);
        setEvents(alerts);

        const usage = await axios.get<FuelUsageStats>(
          `${API_BASE_URL}/fuelusage`,
          {
            params: {
              busId: selectedBus,
              fromDate: startDate.toISOString(),
              toDate: endDate.toISOString(),
            },
          }
        );

        setFuelStats({
          ...usage.data,
          fuelEfficiency: usage.data.fuelEfficiency ?? 0,
        });

        setError(null);
      } catch (err) {
        console.error("Bus detail fetch error:", err);
        setError("Failed to load bus details.");
      } finally {
        setLoading(false);
      }
    };

    fetchBusDetails();
  }, [selectedBus, timeRange, customStart, customEnd]);

  if (loading && topBuses.length === 0) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin h-12 w-12 border-t-2 border-b-2 border-blue-500 rounded-full"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-10 px-6 py-8 max-w-7xl mx-auto text-gray-800 dark:text-gray-100">
      {/* Intro */}
      <div className="text-center py-10 bg-white dark:bg-gray-800 rounded-xl shadow-lg space-y-6">
        <p className="text-xl font-medium">
          Welcome to{" "}
          <span className="text-blue-600 dark:text-blue-300 font-bold">FuelSafe</span>
        </p>
        <div className="flex justify-center gap-3 flex-wrap">
          <span className="badge">🔍 Real-time Monitoring</span>
          <span className="badge">⚠️ Anomaly Detection</span>
          <span className="badge">✅ {totalBuses} Buses Monitored</span>
        </div>
      </div>

      {/* Time Filter */}
      <DashboardTimeFilter
        range={timeRange}
        customStart={customStart}
        customEnd={customEnd}
        onRangeChange={setTimeRange}
        onCustomDateChange={(start, end) => {
          setCustomStart(start);
          setCustomEnd(end);
        }}
      />

      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-blue-600 text-white p-6 rounded-lg shadow flex flex-col">
          <BusFront className="w-8 h-8 mb-2" />
          <h4 className="text-sm">Total Buses</h4>
          <p className="text-2xl font-bold">
            <CountUp end={totalBuses} duration={1} />
          </p>
        </div>
        <StatCards
          title="Ongoing Alerts"
          icon="alert"
          color="from-red-500 to-red-700"
          apiPath="/alerts"
          timeRange={timeRange}
          customStart={customStart}
          customEnd={customEnd}
        />
        <StatCards
          title="Fuel Theft Events"
          icon="fuel"
          color="from-yellow-500 to-yellow-700"
          apiPath="/alerts?type=THEFT"
          timeRange={timeRange}
          customStart={customStart}
          customEnd={customEnd}
        />
        <StatCards
          title="Refueling Events"
          icon="refuel"
          color="from-green-500 to-green-700"
          apiPath="/alerts?type=REFUEL"
          timeRange={timeRange}
          customStart={customStart}
          customEnd={customEnd}
        />
      </div>

      {/* Monitored Buses */}
      <h3 className="text-xl font-semibold mt-10">🚌 Monitored Buses</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {topBuses.map((bus) => (
          <MonitoredBusCard
            key={bus.busId}
            busId={bus.busId}
            regNumber={bus.registrationNo}
            driver={bus.driverName}
            route={bus.routeName}
            fuelLevel={bus.fuelLevel}
            status={bus.status}
            imageUrl={busImage}
            onClick={() => setSelectedBus(bus.busId)}
            selected={selectedBus === bus.busId}
          />
        ))}
      </div>

      {/* Fuel Chart + Stats */}
      {selectedBus && (
        <div className="mt-10 space-y-6">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow">
            <h4 className="font-semibold text-lg mb-3">
              Fuel Level –{" "}
              {topBuses.find((b) => b.busId === selectedBus)?.registrationNo || selectedBus}
            </h4>
            <FuelChart fuelData={fuelData} busId={selectedBus} />
            {fuelStats && (
              <FuelStatsGrid
                stats={{
                  total_fuel_consumed: fuelStats.totalFuelConsumed,
                  total_fuel_stolen: fuelStats.totalFuelStolen,
                  total_fuel_refueled: fuelStats.totalFuelRefueled,
                  distance_traveled: fuelStats.distanceTravelled,
                  fuel_efficiency: fuelStats.fuelEfficiency,
                }}
              />
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
