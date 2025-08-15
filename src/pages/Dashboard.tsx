// src/pages/Dashboard.tsx
import React, {
  useEffect,
  useState,
  useCallback,
  useMemo,
  useRef,
} from "react";
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
import type { TimeRangeValue } from "../components/DashboardTimeFilter";
import { markFuelEvents } from "../utils/markFuelEvents";
import type { FuelReading } from "../types/fuel";

interface Alert {
  id: string;
  timestamp: string;
  type: string;
  description?: string;
  bus?: {
    id?: string;
    registrationNumber?: string;
    registrationNo?: string;
  };
  vehicleId?: string; // be tolerant
  busId?: string; // be tolerant
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

  const [fuelData, setFuelData] = useState<FuelReading[]>([]);
  const [events, setEvents] = useState<Alert[]>([]);
  const [fuelStats, setFuelStats] = useState<FuelUsageStats | null>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [timeRange, setTimeRange] = useState<TimeRangeValue>("today");
  const [customStart, setCustomStart] = useState("");
  const [customEnd, setCustomEnd] = useState("");

  // Ref used to auto-scroll to the chart section
  const chartRef = useRef<HTMLDivElement | null>(null);

  // Map regNo -> busId for quick lookups (used when alerts reference registration)
  const regToId = useMemo(() => {
    const map: Record<string, string> = {};
    for (const b of topBuses) map[b.registrationNo] = b.busId;
    return map;
  }, [topBuses]);

  // --- Fetch details for selected bus ---
  const fetchBusDetails = useCallback(
    async (busId: string, range: { startDate?: Date; endDate?: Date }) => {
      if (!busId || !range?.startDate || !range?.endDate) {
        setFuelData([]);
        setEvents([]);
        setFuelStats(null);
        return;
      }
      try {
        setLoading(true);

        const detailsRes = await axios.get<any>(
          `${API_BASE_URL}/vehicles/${busId}/details`,
          {
            params: {
              include: "readings,alerts,sensor",
              fromDate: range.startDate.toISOString(),
              toDate: range.endDate.toISOString(),
            },
          }
        );
        const details = detailsRes.data;
        const readingsRaw: FuelReading[] =
          details.sensor?.readings ?? details.readings ?? [];
        const alerts: Alert[] = details.sensor?.alerts ?? details.alerts ?? [];

        const enriched: FuelReading[] = readingsRaw.map((r) => {
          const rTs = new Date(r.timestamp as any).getTime();
          const matched = alerts.find((a) => {
            const aTs = new Date(a.timestamp).getTime();
            return Math.abs(aTs - rTs) <= 60_000;
          });
          return {
            ...r,
            eventType: (matched?.type || r.eventType || r.type || "NORMAL")
              ?.toString()
              .toUpperCase(),
            description: (r as any).description ?? matched?.description ?? null,
            fuelChange:
              typeof (r as any).fuelChange === "number"
                ? (r as any).fuelChange
                : undefined,
          };
        });

        // If your markFuelEvents supports options, we pass { infer:false } to avoid inferring:
        const finalized = markFuelEvents(enriched, { infer: false }) as FuelReading[];
        setFuelData(finalized);
        setEvents(alerts);

        

        const usage = await axios.get<FuelUsageStats>(
          `${API_BASE_URL}/fuelusage`,
          {
            params: {
              busId,
              fromDate: range.startDate.toISOString(),
              toDate: range.endDate.toISOString(),
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
        setFuelData([]);
        setEvents([]);
        setFuelStats(null);
        setError("Failed to load bus details.");
      } finally {
        setLoading(false);
      }
    },
    []
  );

  // --- Fetch dashboard buses on mount ---
  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        setLoading(true);
        const res = await axios.get<Bus[]>(`${API_BASE_URL}/vehicles`);
        const buses = res.data;

        const toDate = new Date();
        const fromDate = new Date(toDate.getTime() - 24 * 60 * 60 * 1000);

        const enriched: BusCard[] = await Promise.all(
          buses.map(async (bus) => {
            try {
              const detailsRes = await axios.get<any>(
                `${API_BASE_URL}/vehicles/${bus.id}/details`,
                {
                  params: {
                    include: "readings,alerts,sensor",
                    fromDate: fromDate.toISOString(),
                    toDate: toDate.toISOString(),
                  },
                }
              );
              const details = detailsRes.data;
              const readings: FuelReading[] =
                details.sensor?.readings ?? details.readings ?? [];
              const latestFuel =
                readings.length > 0
                  ? Number(readings[readings.length - 1].fuelLevel) || 0
                  : 0;
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

        if (enriched.length > 0 && !selectedBus) {
          setSelectedBus(enriched[0].busId);
        }

        setError(null);
      } catch (err) {
        console.error("Dashboard fetch error:", err);
        setError("Failed to load dashboard data.");
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // --- Build date range (and validate) ---
  const range = useMemo(() => {
    if (timeRange === "custom") {
      return {
        startDate: customStart ? new Date(customStart) : undefined,
        endDate: customEnd ? new Date(customEnd) : undefined,
      };
    }
    return getDateRange(timeRange);
  }, [timeRange, customStart, customEnd]);

  // --- Fetch selected bus details when range changes ---
  useEffect(() => {
    if (
      !selectedBus ||
      !range?.startDate ||
      !range?.endDate ||
      isNaN(range.startDate.getTime()) ||
      isNaN(range.endDate.getTime())
    ) {
      setFuelData([]);
      setEvents([]);
      setFuelStats(null);
      return;
    }
    fetchBusDetails(selectedBus, range);
  }, [selectedBus, range?.startDate, range?.endDate, fetchBusDetails]);

  // --- Fetch theft events for current window (to highlight cards) ---
  const [theftBusIds, setTheftBusIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    const fetchThefts = async () => {
      if (!range?.startDate || !range?.endDate) {
        setTheftBusIds(new Set());
        return;
      }
      try {
        const res = await axios.get<Alert[]>(`${API_BASE_URL}/history`, {
          params: {
            type: "THEFT",
            fromDate: range.startDate.toISOString(),
            toDate: range.endDate.toISOString(),
          },
        });
        const rows = Array.isArray(res.data) ? res.data : [];

        const ids = new Set<string>();
        for (const a of rows) {
          // Try direct id fields first
          const directId = a.bus?.id || a.busId || a.vehicleId;
          if (directId) {
            ids.add(String(directId));
            continue;
          }
          // Try matching by registration number
          const reg =
            a.bus?.registrationNumber ||
            a.bus?.registrationNo ||
            undefined;
          if (reg && regToId[reg]) {
            ids.add(regToId[reg]);
          }
        }
        setTheftBusIds(ids);
      } catch (e) {
        console.error("Failed to fetch theft events", e);
        setTheftBusIds(new Set());
      }
    };
    fetchThefts();
  }, [range?.startDate, range?.endDate, regToId]);

  // When a card is clicked, set the bus and scroll to the chart
  const handleBusCardClick = (busId: string) => {
    setSelectedBus(busId);
    requestAnimationFrame(() => {
      chartRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  };

  // Also scroll if selectedBus changes in other ways
  useEffect(() => {
    if (selectedBus && chartRef.current) {
      chartRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [selectedBus]);

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
      <div className="text-center py-10 bg-white dark:bg-gray-800 rounded-xl shadow-lg space-y-6">
        <p className="text-xl font-medium">
          Welcome to{" "}
          <span className="font-signord font-semibold text-blue-600 dark:text-blue-300">
            FuelSafe
          </span>{" "}
          — your centralized platform to monitor fuel usage, detect theft, and
          track refueling activities.
        </p>
        <div className="flex justify-center gap-3 flex-wrap">
          <span className="bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-4 py-2 rounded-full text-sm font-medium">
            🔍 Real-time Monitoring
          </span>
          <span className="bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-100 px-4 py-2 rounded-full text-sm font-medium">
            ⚠️ Anomaly Detection
          </span>
          <span className="bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-100 px-4 py-2 rounded-full text-sm font-medium">
            ✅ {totalBuses} Buses Monitored
          </span>
        </div>
      </div>

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
          apiPath="/history"
          timeRange={timeRange}
          customStart={customStart}
          customEnd={customEnd}
        />
        <StatCards
          title="Fuel Theft Events"
          icon="fuel"
          color="from-yellow-500 to-yellow-700"
          apiPath="/history?type=THEFT"
          timeRange={timeRange}
          customStart={customStart}
          customEnd={customEnd}
        />
        <StatCards
          title="Refueling Events"
          icon="refuel"
          color="from-green-500 to-green-700"
          apiPath="/history?type=REFUEL"
          timeRange={timeRange}
          customStart={customStart}
          customEnd={customEnd}
        />
      </div>

      <h3 className="text-xl font-semibold mt-10">🚌 Monitored Buses</h3>
      <div className="flex flex-wrap gap-6 justify-center">
        {topBuses.map((bus) => (
          <MonitoredBusCard
            key={bus.busId}
             className="w-full sm:w-[calc(50%-12px)] lg:w-[calc(33.333%-16px)] max-w-md" 
            busId={bus.busId}
            regNumber={bus.registrationNo}
            driver={bus.driverName}
            route={bus.routeName}
            fuelLevel={bus.fuelLevel}
            status={bus.status}
            hasTheft={theftBusIds.has(bus.busId)}
            imageUrl={busImage}
            onClick={() => handleBusCardClick(bus.busId)}
            selected={selectedBus === bus.busId}
          />
        ))}
      </div>

  {selectedBus && (
  <div className="mt-10 space-y-6" ref={chartRef}>
    <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow">
      <h4 className="font-semibold text-lg mb-3">
        Fuel Level – {topBuses.find((b) => b.busId === selectedBus)?.registrationNo || selectedBus}
      </h4>
      <FuelChart
        fuelData={Array.isArray(fuelData) ? fuelData : []}
        busId={selectedBus}
        theftTotalOverride={fuelStats?.totalFuelStolen}   
      />
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
