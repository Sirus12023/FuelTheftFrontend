import React, { useState, useEffect } from "react";
import { API_BASE_URL } from "../config";
import axios from "axios";
import MonitoredBusCard from "../components/MonitoredBusCard";

import FuelChart from "../components/FuelChart";
import type { FuelReading, FuelUsageStats } from "../types/fuel";

interface BusCard {
  busId: string;
  registrationNo: string;
  driverName: string;
  routeName: string;
  fuelLevel: number;
  status: "normal" | "alert" | "offline";
  lastSeen?: string | null;
}

const Dashboard: React.FC = () => {
  const [buses, setBuses] = useState<BusCard[]>([]);
  const [selectedBus, setSelectedBus] = useState<string | null>(null);
  const [fuelData, setFuelData] = useState<FuelReading[]>([]);
  const [fuelStats, setFuelStats] = useState<FuelUsageStats>({
    totalFuelConsumed: 0,
    totalFuelRefueled: 0,
    totalFuelStolen: 0,
    distanceTravelled: 0,
    fuelEfficiency: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        setLoading(true);
        const res = await axios.get<any>(`${API_BASE_URL}/vehicles`);
        const busesData = res.data?.data || res.data;

        const enriched: BusCard[] = await Promise.all(
          busesData.map(async (bus: any) => {
            try {
              const detailsRes = await axios.get<any>(
                `${API_BASE_URL}/vehicles/${bus.id}/details`
              );
              const details = detailsRes.data;
              const readings: FuelReading[] = details.readings || [];
              const latestFuel = readings.length > 0
                ? Number(readings[readings.length - 1].fuelLevel) || 0
                : 0;

              return {
                busId: bus.id,
                registrationNo: bus.registrationNo,
                driverName: bus.driver || "Unknown",
                routeName: bus.route || "Unknown",
                fuelLevel: latestFuel,
                status: "normal",
              };
            } catch (err) {
              console.warn(`Failed to fetch details for bus ${bus.id}:`, err);
              return {
                busId: bus.id,
                registrationNo: bus.registrationNo,
                driverName: "Unknown",
                routeName: "Unknown",
                fuelLevel: 0,
                status: "offline",
              };
            }
          })
        );

        setBuses(enriched);
        if (enriched.length > 0) {
          setSelectedBus(enriched[0].busId);
        }
        setError(null);
      } catch (err) {
        console.error("Dashboard fetch error:", err);
        setError("Failed to load dashboard data");
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, []);

  useEffect(() => {
    if (!selectedBus) return;

    const fetchBusData = async () => {
      try {
        const toDate = new Date();
        const fromDate = new Date(toDate.getTime() - 24 * 60 * 60 * 1000);

        const [fuelRes, alertsRes] = await Promise.all([
          axios.get<FuelReading[]>(`${API_BASE_URL}/vehicles/${selectedBus}/fuel`, {
            params: {
              fromDate: fromDate.toISOString(),
              toDate: toDate.toISOString(),
            },
          }),
          axios.get<any>(`${API_BASE_URL}/vehicles/${selectedBus}/alerts`, {
            params: {
              fromDate: fromDate.toISOString(),
              toDate: toDate.toISOString(),
            },
          }),
        ]);

        setFuelData(fuelRes.data || []);
        
        // Calculate basic stats from alerts
        const alerts = alertsRes.data || [];
        let refueled = 0;
        let stolen = 0;
        
        alerts.forEach((alert: any) => {
          if (alert.type === "REFUEL" || alert.type === "REFILL") {
            const match = alert.description?.match(/Δ=\+([\d.]+)L/);
            if (match) refueled += parseFloat(match[1]);
          } else if (alert.type === "THEFT" || alert.type === "DROP") {
            const match = alert.description?.match(/Δ=-([\d.]+)L/);
            if (match) stolen += parseFloat(match[1]);
          }
        });

        setFuelStats({
          totalFuelConsumed: 0,
          totalFuelRefueled: refueled,
          totalFuelStolen: stolen,
          distanceTravelled: 0,
          fuelEfficiency: 0,
        } as any);
      } catch (err) {
        console.error("Bus data fetch error:", err);
      }
    };

    fetchBusData();
  }, [selectedBus]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Loading dashboard...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-red-600">Error: {error}</div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Dashboard
        </h1>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Fuel Refueled</h3>
          <p className="text-2xl font-bold text-green-600">{fuelStats.totalFuelRefueled.toFixed(2)} L</p>
        </div>
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Fuel Stolen</h3>
          <p className="text-2xl font-bold text-red-600">{fuelStats.totalFuelStolen.toFixed(2)} L</p>
        </div>
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Fuel Consumed</h3>
          <p className="text-2xl font-bold text-blue-600">{fuelStats.totalFuelConsumed.toFixed(2)} L</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Monitored Buses
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {buses.map((bus) => (
              <MonitoredBusCard
                key={bus.busId}
                busId={bus.busId}
                regNumber={bus.registrationNo}
                driver={bus.driverName}
                route={bus.routeName}
                fuelLevel={bus.fuelLevel}
                status={bus.status}
                selected={selectedBus === bus.busId}
                onClick={() => setSelectedBus(bus.busId)}
              />
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Fuel Level Chart
          </h2>
          {selectedBus && fuelData.length > 0 ? (
            <FuelChart
              fuelData={fuelData}
              busId={selectedBus}
              theftTotalOverride={fuelStats.totalFuelStolen}
            />
          ) : (
            <div className="flex items-center justify-center h-64 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <p className="text-gray-500 dark:text-gray-400">
                Select a bus to view fuel data
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
