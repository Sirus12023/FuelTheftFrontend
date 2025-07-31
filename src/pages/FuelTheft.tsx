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
  total_fuel_consumed: number;
  total_fuel_stolen: number;
  total_fuel_refueled: number;
  distance_traveled: number;
  fuel_efficiency: number;
}

interface BusDetails {
  registrationNo: string;
  driver: string;
  route: string;
  currentFuelLevel: number;
  status: "normal" | "offline";
}

const FuelTheft: React.FC = () => {
  const location = useLocation();
  const query = new URLSearchParams(location.search);
  const initialBus = query.get("bus");

  const [selectedBus, setSelectedBus] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [timeRange, setTimeRange] = useState("Last 24 hours");
  const [showCustom, setShowCustom] = useState(false);
  const [startDate, setStartDate] = useState<Date>();
  const [endDate, setEndDate] = useState<Date>();
  const [showStartPicker, setShowStartPicker] = useState(true);
  const [showEndPicker, setShowEndPicker] = useState(true);

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

    const { startDate: computedStart, endDate: computedEnd } = getDateRange(timeRange);

    const fetchBusData = async () => {
      try {
        const res = await axios.get(
          `${API_BASE_URL}/vehicles/${selectedBus}/details`,
          {
            params: {
              include: "readings,alerts,events",
              from: (computedStart ?? startDate ?? new Date()).toISOString(),
              to: (computedEnd ?? endDate ?? new Date()).toISOString(),
            },
          }
        );

        const data = res.data as {
          alerts?: any[];
          readings?: any[];
          registrationNo?: string;
          driver?: { name?: string };
          route?: { name?: string };
          sensor?: {
            alerts?: any[];
            readings?: any[];
          };
        };

        const alerts = (data.sensor?.alerts && Array.isArray(data.sensor.alerts))
          ? data.sensor.alerts
          : (data.alerts || []);

        const readingsRaw = (data.sensor?.readings && Array.isArray(data.sensor.readings))
          ? data.sensor.readings
          : (data.readings || []);

        const readingsWithEvents = readingsRaw.map((r: any) => {
          const matchingAlert = alerts.find((a: any) => a.timestamp === r.timestamp);
          return {
            ...r,
            eventType: matchingAlert?.type?.toUpperCase() || r.eventType?.toUpperCase() || undefined,
          };
        });

        const readings = markFuelEvents(readingsWithEvents);

        setFuelData(readings);
        setNoData(readings.length === 0);

        let allSensorsActive = true;
        try {
          const sensorRes = await axios.get(`${API_BASE_URL}/sensor`, {
            params: { busId: selectedBus },
          });
          const sensors = Array.isArray(sensorRes.data) ? sensorRes.data : [];
          allSensorsActive = sensors.length === 0 ? true : sensors.every((s: any) => s.isActive);
        } catch {
          allSensorsActive = true;
        }

        setBusDetails({
          registrationNo: data.registrationNo || "Unknown",
          driver: data.driver?.name || "Unassigned",
          route: data.route?.name || "Unknown",
          currentFuelLevel: data.readings?.[data.readings.length - 1]?.fuelLevel ?? 0,
          status: allSensorsActive ? "normal" : "offline",
        });

        const usageRes = await axios.get(`${API_BASE_URL}/fuelusage`, {
          params: {
            busId: selectedBus,
            fromDate: (computedStart ?? startDate ?? new Date()).toISOString(),
            toDate: (computedEnd ?? endDate ?? new Date()).toISOString(),
          },
        });
        setFuelStats(usageRes.data as FuelUsageStats);
      } catch (error) {
        console.error("Error fetching fuel data:", error);
        setFuelData([]);
        setBusDetails(null);
        setFuelStats(null);
        setNoData(true);
      }
    };

    fetchBusData();
  }, [selectedBus, timeRange, startDate, endDate, showCustom]);

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
          showCustom={showCustom}
          setShowCustom={setShowCustom}
          startDate={startDate}
          setStartDate={setStartDate}
          endDate={endDate}
          setEndDate={setEndDate}
          showStartPicker={showStartPicker}
          setShowStartPicker={setShowStartPicker}
          showEndPicker={showEndPicker}
          setShowEndPicker={setShowEndPicker}
        />
      </div>

      {!selectedBus && (
        <div className="bg-gradient-to-br from-white to-blue-50 dark:from-gray-800 dark:to-gray-700 border dark:border-gray-600 rounded-xl shadow-md text-center py-24 px-4 text-gray-600 dark:text-gray-300 animate-fade-in">
          <h3 className="text-2xl font-semibold mb-2">No Bus Selected</h3>
          <p>
            Please select a <span className="font-semibold text-blue-600 dark:text-blue-400">bus</span> and
            <span className="font-semibold text-blue-600 dark:text-blue-400"> time range</span> to view analytics.
          </p>
        </div>
      )}

      {selectedBus && noData && (
        <div className="bg-gradient-to-br from-white to-blue-50 dark:from-gray-800 dark:to-gray-700 border dark:border-gray-600 rounded-xl shadow-md text-center py-24 px-4 text-gray-600 dark:text-gray-300 animate-fade-in">
          <h3 className="text-2xl font-semibold mb-2">No Data Available</h3>
          <p>
            No fuel data found for the selected bus and time range. Try a different time range or bus.
          </p>
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
          {fuelStats && <FuelStatsGrid stats={fuelStats} />}
        </>
      )}
    </div>
  );
};

export default FuelTheft;
