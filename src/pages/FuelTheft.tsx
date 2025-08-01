// pages/FuelTheft.tsx

import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import axios from "axios";
import { API_BASE_URL } from "../config";
import BusTimeFilter from "../components/BusTimeFilter";
import FuelChart from "../components/FuelChart";
import MonitoredBusCard from "../components/MonitoredBusCard";
import { getDateRange } from "../utils/dateRangeFromTimeOption";
import FuelStatsGrid from "../components/FuelStatsGrid";
import { markFuelEvents } from "../utils/markFuelEvents";

interface FuelUsageStats {
  totalFuelConsumed: number;
  totalFuelStolen: number;
  totalFuelRefueled: number;
  distanceTravelled: number;
  fuelEfficiency: number;
}

interface VehicleDetailResponse {
  registrationNo?: string;
  driver?: { name?: string };
  route?: { name?: string };
  alerts?: any[];
  readings?: any[];
  sensor?: {
    alerts?: any[];
    readings?: any[];
    isActive?: boolean;
  };
}

interface BusDetails {
  registrationNo: string;
  driver: string;
  route: string;
  currentFuelLevel: number;
  status: "normal" | "offline";
}

const toTitleCase = (str: string) =>
  str
    .split(" ")
    .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
    .join(" ");

const FuelTheft: React.FC = () => {
  const location = useLocation();
  const query = new URLSearchParams(location.search);
  const initialBus = query.get("bus");

  const [selectedBus, setSelectedBus] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [timeRange, setTimeRange] = useState("today");
  const [customStart, setCustomStart] = useState<string>("");
  const [customEnd, setCustomEnd] = useState<string>("");

  const [fuelData, setFuelData] = useState<any[]>([]);
  const [busDetails, setBusDetails] = useState<BusDetails | null>(null);
  const [fuelStats, setFuelStats] = useState<FuelUsageStats | null>(null);
  const [noData, setNoData] = useState(false);

  useEffect(() => {
    if (initialBus) {
      setSelectedBus(initialBus);
      setSearch(initialBus);
    }
  }, [initialBus]);

  useEffect(() => {
    if (!selectedBus) {
      setFuelData([]);
      setBusDetails(null);
      setFuelStats(null);
      setNoData(false);
      return;
    }

    const range =
      timeRange === "custom"
        ? {
            startDate: customStart ? new Date(customStart) : undefined,
            endDate: customEnd ? new Date(customEnd) : undefined,
          }
        : getDateRange(timeRange);

    const startDate = range?.startDate;
    const endDate = range?.endDate;

    const fetchBusData = async () => {
      try {
        const fromDate = startDate?.toISOString() ?? new Date().toISOString();
        const toDate = endDate?.toISOString() ?? new Date().toISOString();

        const res = await axios.get<VehicleDetailResponse>(
          `${API_BASE_URL}/vehicles/${selectedBus}/details`,
          {
            params: {
              include: "readings,alerts,events",
              from: fromDate,
              to: toDate,
            },
          }
        );

        const data = res.data;
        const alerts = data.sensor?.alerts ?? data.alerts ?? [];
        const rawReadings = data.sensor?.readings ?? data.readings ?? [];

        const readingsWithEvents = rawReadings.map((r: any) => {
          const match = alerts.find((a: any) => a.timestamp === r.timestamp);
          return {
            ...r,
            eventType: match?.type?.toUpperCase() || r.eventType?.toUpperCase(),
          };
        });

        const readings = markFuelEvents(readingsWithEvents);

        setFuelData(readings);
        setNoData(readings.length === 0);

        let sensorStatus = true;
        try {
          const sensorRes = await axios.get(`${API_BASE_URL}/sensor`, {
            params: { busId: selectedBus },
          });
          const sensors = Array.isArray(sensorRes.data) ? sensorRes.data : [];
          sensorStatus = sensors.length === 0 ? true : sensors.every((s: any) => s.isActive);
        } catch {
          sensorStatus = true;
        }

        setBusDetails({
          registrationNo: data.registrationNo ?? "Unknown",
          driver: data.driver?.name ?? "Unassigned",
          route: data.route?.name ?? "Unknown",
          currentFuelLevel: rawReadings.at(-1)?.fuelLevel ?? 0,
          status: sensorStatus ? "normal" : "offline",
        });

        const usage = await axios.get<FuelUsageStats>(`${API_BASE_URL}/fuelusage`, {
          params: {
            busId: selectedBus,
            fromDate,
            toDate,
          },
        });

        setFuelStats(usage.data);
      } catch (error) {
        console.error("Error fetching fuel data:", error);
        setFuelData([]);
        setBusDetails(null);
        setFuelStats(null);
        setNoData(true);
      }
    };

    fetchBusData();
  }, [selectedBus, timeRange, customStart, customEnd]);

  return (
    <div className="px-6 py-12 max-w-6xl mx-auto space-y-10 font-sans text-gray-800 dark:text-gray-100">
      <div className="text-center space-y-2">
        <h2 className="text-4xl sm:text-5xl font-extrabold text-blue-900 dark:text-blue-200">
          🚨 Fuel Theft Monitoring
        </h2>
        <p className="text-lg text-gray-600 dark:text-gray-300">
          Monitor your fleet’s fuel activity with real-time detection & analysis
        </p>
      </div>

      <div className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-2xl shadow-lg p-6">
        <BusTimeFilter
          busSearch={search}
          setBusSearch={setSearch}
          selectedBusId={selectedBus}
          setSelectedBusId={setSelectedBus}
          timeRange={timeRange}
          setTimeRange={setTimeRange}
          customStart={customStart}
          customEnd={customEnd}
          setCustomStart={setCustomStart}
          setCustomEnd={setCustomEnd}
        />
      </div>

      {!selectedBus && (
        <div className="text-center py-24 px-4 border rounded-xl bg-gradient-to-br from-white to-blue-50 dark:from-gray-800 dark:to-gray-700 dark:border-gray-600 text-gray-600 dark:text-gray-300 animate-fade-in">
          <h3 className="text-2xl font-semibold mb-2">No Bus Selected</h3>
          <p>
            Please select a <span className="font-semibold text-blue-600 dark:text-blue-400">bus</span> and
            <span className="font-semibold text-blue-600 dark:text-blue-400"> time range</span> to view analytics.
          </p>
        </div>
      )}

      {selectedBus && noData && (
        <div className="text-center py-24 px-4 border rounded-xl bg-gradient-to-br from-white to-blue-50 dark:from-gray-800 dark:to-gray-700 dark:border-gray-600 text-gray-600 dark:text-gray-300 animate-fade-in">
          <h3 className="text-2xl font-semibold mb-2">No Data Available</h3>
          <p>No fuel data found for the selected bus and time range.</p>
        </div>
      )}

      {selectedBus && busDetails && !noData && (
        <MonitoredBusCard
          busId={selectedBus}
          regNumber={busDetails.registrationNo}
          driver={busDetails.driver}
          route={busDetails.route}
          fuelLevel={busDetails.currentFuelLevel}
          status={busDetails.status}
          imageUrl="/src/assets/temp_bus.avif"
        />
      )}

      {selectedBus && !noData && (
        <>
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
        </>
      )}
    </div>
  );
};

export default FuelTheft;