// src/pages/FuelTheft.tsx
import React, { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import { API_BASE_URL } from "../config";
import BusTimeFilter from "../components/BusTimeFilter";
import FuelChart from "../components/FuelChart";
import MonitoredBusCard from "../components/MonitoredBusCard";
import { getDateRange } from "../utils/dateRangeFromTimeOption";
import FuelStatsGrid from "../components/FuelStatsGrid";
import { markFuelEvents } from "../utils/markFuelEvents";
import type { FuelReading } from "../types/fuel";

// If your backend expects `busId` instead of `vehicleId` for /sensor, switch here
const SENSOR_ID_PARAM = "vehicleId" as const; // change to "busId" if backend needs that

type ISODate = string;

interface FuelUsageStats {
  totalFuelConsumed: number;
  totalFuelStolen: number;
  totalFuelRefueled: number;
  distanceTravelled: number;
  fuelEfficiency: number;
}

interface Alert {
  id: string;
  timestamp: ISODate;
  type: string;
  description?: string;
}

interface VehicleDetailResponse {
  registrationNo?: string;
  driver?: { name?: string };
  route?: { name?: string };
  alerts?: Alert[];
  readings?: FuelReading[];
  sensor?: {
    alerts?: Alert[];
    readings?: FuelReading[];
    isActive?: boolean;
  };
}

interface Vehicle {
  id: string;
  registrationNo: string;
  driver?: { name?: string };
  route?: { name?: string };
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
  const navigate = useNavigate();
  const query = new URLSearchParams(location.search);
  const initialRegNo = query.get("bus"); // bus query param = registration number

  // bootstrap vehicles for suggestions + id mapping
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const regToId = useMemo(() => {
    const map: Record<string, string> = {};
    vehicles.forEach((v) => {
      map[v.registrationNo] = v.id;
    });
    return map;
  }, [vehicles]);

  // UI State
  const [selectedReg, setSelectedReg] = useState<string | null>(null); // registration number for UI/URL
  const [selectedVehicleId, setSelectedVehicleId] = useState<string | null>(null); // internal id for API calls
  const [search, setSearch] = useState("");
  const [timeRange, setTimeRange] = useState("today");
  const [customStart, setCustomStart] = useState<string>("");
  const [customEnd, setCustomEnd] = useState<string>("");

  const [fuelData, setFuelData] = useState<FuelReading[]>([]);
  const [busDetails, setBusDetails] = useState<BusDetails | null>(null);
  const [fuelStats, setFuelStats] = useState<FuelUsageStats | null>(null);
  const [noData, setNoData] = useState(false);

  // Load vehicles once
  useEffect(() => {
    (async () => {
      try {
        const res = await axios.get<Vehicle[]>(`${API_BASE_URL}/vehicles`);
        setVehicles(res.data || []);
      } catch (e) {
        console.error("Failed to load vehicles", e);
      }
    })();
  }, []);

  // Initialize selection from URL (?bus=REGNO)
  useEffect(() => {
    if (!initialRegNo || vehicles.length === 0) return;
    setSelectedReg(initialRegNo);
    setSearch(initialRegNo);
    const id = regToId[initialRegNo];
    setSelectedVehicleId(id || null);
  }, [initialRegNo, vehicles, regToId]);

  // Suggestions (sorted & de-duped)
  const busSuggestions = useMemo(
    () => Array.from(new Set(vehicles.map((v) => v.registrationNo))).sort(),
    [vehicles]
  );

  // When the user picks a bus in the filter
  const handleSelectBus = (regNo: string) => {
    if (!regToId[regNo]) return; // ignore unknown
    setSelectedReg(regNo);
    setSearch(regNo);
    setSelectedVehicleId(regToId[regNo]);
    // keep URL shareable by reg no
    navigate(`?bus=${encodeURIComponent(regNo)}`, { replace: false });
  };

  useEffect(() => {
    if (!selectedVehicleId) {
      setFuelData([]);
      setBusDetails(null);
      setFuelStats(null);
      setNoData(false);
      return;
    }

    // date range
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
        // Require both dates; if missing, default to today
        const now = new Date();
        const fromDate = (startDate ?? new Date(now.setHours(0, 0, 0, 0))).toISOString();
        const toDate = (endDate ?? new Date()).toISOString();

        const res = await axios.get<VehicleDetailResponse>(
          `${API_BASE_URL}/vehicles/${selectedVehicleId}/details`,
          {
            params: {
              include: "readings,alerts,events",
              fromDate, // backend expects fromDate
              toDate,   // backend expects toDate
            },
          }
        );

        const data = res.data;
        const alerts = data.sensor?.alerts ?? data.alerts ?? [];
        const rawReadings = (data.sensor?.readings ?? data.readings ?? []) as FuelReading[];

        // tolerant event matching (±60s) and normalized shape
        const readingsWithEvents: FuelReading[] = rawReadings.map((r) => {
          const rTs = new Date(r.timestamp as any).getTime();
          const match = alerts.find((a: any) => {
            const aTs = new Date(a.timestamp).getTime();
            return Math.abs(aTs - rTs) <= 60_000; // within 60 seconds
          });

          return {
            ...r,
            eventType: (match?.type || r.eventType || r.type || "NORMAL").toString().toUpperCase(),
            description: (r as any).description ?? match?.description ?? null,
            fuelChange:
              typeof (r as any).fuelChange === "number" ? (r as any).fuelChange : undefined,
          };
        });

        const readings = markFuelEvents(readingsWithEvents) as FuelReading[];

        setFuelData(readings);
        setNoData(readings.length === 0);

        // Sensor status (switch SENSOR_ID_PARAM if your backend needs busId)
        let sensorStatus = true;
        try {
          const sensorRes = await axios.get(`${API_BASE_URL}/sensor`, {
            params: { [SENSOR_ID_PARAM]: selectedVehicleId },
          });
          const sensors = Array.isArray(sensorRes.data) ? sensorRes.data : [];
          sensorStatus =
            sensors.length === 0 ? true : sensors.every((s: any) => s.isActive !== false);
        } catch {
          sensorStatus = true;
        }

        const v = vehicles.find((x) => x.id === selectedVehicleId);
        setBusDetails({
          registrationNo: data.registrationNo ?? v?.registrationNo ?? "Unknown",
          driver: data.driver?.name ?? v?.driver?.name ?? "Unassigned",
          route: data.route?.name ?? v?.route?.name ?? "Unknown",
          currentFuelLevel: (rawReadings.at(-1)?.fuelLevel as number) ?? 0,
          status: sensorStatus ? "normal" : "offline",
        });

        const usage = await axios.get<FuelUsageStats>(`${API_BASE_URL}/fuelusage`, {
          params: {
            busId: selectedVehicleId, // per backend route
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
  }, [selectedVehicleId, timeRange, customStart, customEnd, vehicles]);

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
          selectedBusId={selectedReg}
          setSelectedBusId={(val: string | null) => {
            if (val && regToId[val]) {
              setSelectedReg(val);
              setSearch(val);
              setSelectedVehicleId(regToId[val]);
              navigate(`?bus=${encodeURIComponent(val)}`, { replace: false });
            } else {
              setSelectedReg(null);
              setSearch("");
              setSelectedVehicleId(null);
              navigate(`?`, { replace: false });
            }
          }}
          timeRange={timeRange}
          setTimeRange={setTimeRange}
          customStart={customStart}
          customEnd={customEnd}
          setCustomStart={setCustomStart}
          setCustomEnd={setCustomEnd}
          busSuggestions={busSuggestions}
        />
      </div>

      {!selectedVehicleId && (
        <div className="text-center py-24 px-4 border rounded-xl bg-gradient-to-br from-white to-blue-50 dark:from-gray-800 dark:to-gray-700 dark:border-gray-600 text-gray-600 dark:text-gray-300 animate-fade-in">
          <h3 className="text-2xl font-semibold mb-2">No Bus Selected</h3>
          <p>
            Please select a <span className="font-semibold text-blue-600 dark:text-blue-400">bus</span> and
            <span className="font-semibold text-blue-600 dark:text-blue-400"> time range</span> to view analytics.
          </p>
        </div>
      )}

      {selectedVehicleId && noData && (
        <div className="text-center py-24 px-4 border rounded-xl bg-gradient-to-br from-white to-blue-50 dark:from-gray-800 dark:to-gray-700 dark:border-gray-600 text-gray-600 dark:text-gray-300 animate-fade-in">
          <h3 className="text-2xl font-semibold mb-2">No Data Available</h3>
          <p>No fuel data found for the selected bus and time range.</p>
        </div>
      )}

      {selectedVehicleId && busDetails && !noData && (
        <MonitoredBusCard
          busId={selectedVehicleId}
          regNumber={busDetails.registrationNo}
          driver={busDetails.driver}
          route={busDetails.route}
          fuelLevel={busDetails.currentFuelLevel}
          status={busDetails.status}
          imageUrl="/src/assets/temp_bus.avif"
        />
      )}

      {selectedVehicleId && !noData && (
        <>
          <FuelChart fuelData={fuelData} busId={selectedVehicleId} />
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
