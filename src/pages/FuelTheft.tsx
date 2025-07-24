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
import { markFuelEvents } from "../utils/markFuelEvents"; // <-- Import event marking utility

// Backend: FuelUsageStats keys must match backend response
interface FuelUsageStats {
  total_fuel_consumed: number;
  total_fuel_stolen: number;
  total_fuel_refueled: number;
  distance_traveled: number;
  fuel_efficiency: number;
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
  const [events, setEvents] = useState<any[]>([]);
  const [busDetails, setBusDetails] = useState<any>(null);
  const [fuelStats, setFuelStats] = useState<FuelUsageStats | null>(null);
  const [noData, setNoData] = useState(false);

  // Ensure that when timeRange, startDate, or endDate changes, the data is refetched and the chart updates.
  useEffect(() => {
    if (initialBus) {
      setSelectedBus(initialBus);
      setSearch(initialBus);
    }
  }, [initialBus]);

  useEffect(() => {
    if (!selectedBus) {
      setFuelData([]);
      setEvents([]);
      setBusDetails(null);
      setFuelStats(null);
      setNoData(false);
      return;
    }

    // Always recompute the date range when timeRange or custom dates change
    const { startDate: computedStart, endDate: computedEnd } = getDateRange(timeRange);

    const fetchBusData = async () => {
      try {
        // Backend: Use /vehicles/:id/details?include=readings,alerts,events
        const res = await axios.get(
          `${API_BASE_URL}/vehicles/${selectedBus}/details`,
          {
            params: {
              include: "readings,alerts,events",
              // Always use the latest computed date range for the query
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

        // Backend: alerts and readings are separate, match by timestamp if needed
        const alerts = (data.sensor && Array.isArray(data.sensor.alerts)) ? data.sensor.alerts : (data.alerts || []);
        const readingsRaw = (data.sensor && Array.isArray(data.sensor.readings)) ? data.sensor.readings : (data.readings || []);

        // Use markFuelEvents to ensure eventType is always set and normalized
        const readingsWithEvents = readingsRaw.map((r: any) => {
          const matchingAlert = alerts.find((a: any) => a.timestamp === r.timestamp);
          return {
            ...r,
            eventType: matchingAlert?.type?.toUpperCase() || r.eventType?.toUpperCase() || undefined,
          };
        });
        const readings = markFuelEvents(readingsWithEvents);

        setFuelData(readings);
        setEvents(readings.filter((r: any) => r.eventType && r.eventType !== "NORMAL"));

        // If there is no data in the chosen time range, set noData to true
        if (!readings || readings.length === 0) {
          setNoData(true);
        } else {
          setNoData(false);
        }

        // Backend: /sensor?busId=... returns array of sensors
        let allSensorsActive = true;
        try {
          const sensorRes = await axios.get(`${API_BASE_URL}/sensor`, {
            params: { busId: selectedBus },
          });
          const sensors = Array.isArray(sensorRes.data) ? sensorRes.data : [];
          allSensorsActive = sensors.length === 0 ? true : sensors.every((s: any) => s.isActive);
        } catch (e) {
          // If sensor endpoint fails, assume normal
          allSensorsActive = true;
        }

        setBusDetails({
          registrationNo: data.registrationNo,
          driver: data.driver?.name || "Unassigned",
          route: data.route?.name || "Unknown",
          currentFuelLevel: data.readings?.[data.readings.length - 1]?.fuelLevel ?? 0,
          status: allSensorsActive ? "normal" : "offline",
        });

        // Backend: /fuel-usage expects busId, fromDate, toDate, returns FuelUsageStats
        const usageRes = await axios.get(`${API_BASE_URL}/fuelusage`, {
          params: {
            busId: selectedBus,
            fromDate: (computedStart ?? startDate ?? new Date()).toISOString(),
            toDate: (computedEnd ?? endDate ?? new Date()).toISOString(),
          },
        });
        setFuelStats(usageRes.data as FuelUsageStats);
        // Optionally log for debugging
        // console.log("Readings:", readings);
        // console.log("FuelStats:", usageRes.data);
      } catch (error) {
        console.error("Error fetching bus fuel data or fuel stats:", error);
        setFuelData([]);
        setEvents([]);
        setBusDetails(null);
        setFuelStats(null);
        setNoData(false);
      }
    };

    fetchBusData();
    // Refetch whenever selectedBus, timeRange, startDate, endDate, or showCustom changes
  }, [selectedBus, timeRange, startDate, endDate, showCustom]);

  return (
    <div className="px-6 py-12 max-w-6xl mx-auto space-y-10 font-sans text-gray-800 dark:text-gray-100">
      {/* Header */}
      <div className="text-center space-y-2">
        <h2 className="text-4xl sm:text-5xl font-extrabold text-blue-900 dark:text-blue-200">
          🚨 Fuel Theft Monitoring
        </h2>
        <p className="text-lg text-gray-600 dark:text-gray-300">
          Monitor your fleet’s fuel activity with real-time detection & analysis
        </p>
      </div>

      {/* Filter */}
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

      {/* No selection placeholder */}
      {!selectedBus && (
        <div className="bg-gradient-to-br from-white to-blue-50 dark:from-gray-800 dark:to-gray-700 border dark:border-gray-600 rounded-xl shadow-md text-center py-24 px-4 text-gray-600 dark:text-gray-300 animate-fade-in">
          <div className="mb-4">
            <svg className="h-16 w-16 text-blue-300 mx-auto dark:text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.75 9.75h4.5M9.75 12.75h4.5M3.75 6h16.5M3.75 18h16.5M4.5 4.5v15M19.5 4.5v15" />
            </svg>
          </div>
          <h3 className="text-2xl font-semibold text-gray-700 dark:text-gray-100 mb-2">No Bus Selected</h3>
          <p className="max-w-md mx-auto text-base">
            Please select a <span className="font-semibold text-blue-600 dark:text-blue-400">bus number</span> and
            <span className="font-semibold text-blue-600 dark:text-blue-400"> time range</span> to view analytics.
          </p>
        </div>
      )}

      {/* No data in time range placeholder */}
      {selectedBus && noData && (
        <div className="bg-gradient-to-br from-white to-blue-50 dark:from-gray-800 dark:to-gray-700 border dark:border-gray-600 rounded-xl shadow-md text-center py-24 px-4 text-gray-600 dark:text-gray-300 animate-fade-in">
          <div className="mb-4">
            <svg className="h-16 w-16 text-blue-300 mx-auto dark:text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="text-2xl font-semibold text-gray-700 dark:text-gray-100 mb-2">No Data Available</h3>
          <p className="max-w-md mx-auto text-base">
            No fuel data found for the selected bus and time range. Try a different time range or bus.
          </p>
        </div>
      )}

      {/* Bus Info */}
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

      {/* Fuel Chart */}
      {selectedBus && !noData && (
        <>
          <FuelChart
            fuelData={fuelData}
            busId={selectedBus}
          />

          {fuelStats && <FuelStatsGrid stats={fuelStats} />}

        </>
      )}
    </div>
  );
};

export default FuelTheft;
