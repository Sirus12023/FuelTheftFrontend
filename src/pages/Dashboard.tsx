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
import type { FuelReading } from "../types/fuel";
import { markFuelEvents } from "../utils/markFuelEvents";

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
  vehicleId?: string;
  busId?: string;
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

        // vehicle details + readings + alerts
        const detailsRes = await axios.get<any>(
          `${API_BASE_URL}/vehicles/${busId}/details`,
          {
            params: {
              include: "readings,alerts,sensor",
              // send both pairs to be compatible with either backend variant
              fromDate: range.startDate.toISOString(),
              toDate: range.endDate.toISOString(),
              startDate: range.startDate.toISOString(),
              endDate: range.endDate.toISOString(),
            },
          }
        );
        const details = detailsRes.data;
        
        // Extract readings and alerts from the response
        const readingsRaw: FuelReading[] =
          details.sensor?.readings ?? details.readings ?? [];
        let alerts: Alert[] = details.sensor?.Alert ?? details.sensor?.alerts ?? details.alerts ?? [];

        console.log("Raw readings:", readingsRaw);
        console.log("Raw alerts:", alerts);
        console.log("API Response details:", details);

        // If no alerts found in vehicle details, try fetching from /history endpoint
        if (alerts.length === 0) {
          try {
            console.log("No alerts in vehicle details, fetching from /history endpoint...");
            const historyRes = await axios.get<any>(`${API_BASE_URL}/history`, {
              params: {
                vehicleId: busId,
                fromDate: range.startDate.toISOString(),
                toDate: range.endDate.toISOString(),
                startDate: range.startDate.toISOString(),
                endDate: range.endDate.toISOString(),
              },
            });
            alerts = historyRes.data?.data || historyRes.data || [];
            console.log("Alerts from /history:", alerts);
          } catch (historyErr) {
            console.error("Failed to fetch alerts from /history:", historyErr);
          }
        }

        // Sort readings by timestamp
        const readingsSorted = [...readingsRaw].sort(
          (a, b) => new Date(a.timestamp as any).getTime() - new Date(b.timestamp as any).getTime()
        );

        // Create a map of alerts by timestamp for quick lookup
        const alertsByTime = new Map<number, Alert[]>();
        alerts.forEach(alert => {
          const alertTime = new Date(alert.timestamp).getTime();
          if (!alertsByTime.has(alertTime)) {
            alertsByTime.set(alertTime, []);
          }
          alertsByTime.get(alertTime)!.push(alert);
        });

        // Process readings and attach events
        const enrichedReadings: FuelReading[] = readingsSorted.map((reading, index) => {
          const readingTime = new Date(reading.timestamp as any).getTime();
          
          // Extract event information from the reading's raw data
          const rawData = (reading as any).raw?.sim;
          let eventType = "NORMAL";
          let description = "";
          let fuelChange: number | undefined;

          if (rawData) {
            // Get event type from raw data
            const rawEventType = String(rawData.eventType || "").toUpperCase();
            if (rawEventType === "THEFT" || rawEventType === "DROP") {
              eventType = "THEFT";
            } else if (rawEventType === "REFUEL" || rawEventType === "REFILL") {
              eventType = "REFUEL";
            } else {
              eventType = rawEventType;
            }
            
            // Get fuel change from raw data
            if (typeof rawData.fuel_diff === "number") {
              fuelChange = rawData.fuel_diff;
            }
            
            description = `${eventType} event detected`;
          }

          // Also check for alerts that are close to this reading (within 5 minutes)
          const MATCH_WINDOW_MS = 5 * 60 * 1000; // 5 minutes
          let matchedAlerts: Alert[] = [];
          
          // Check exact time match first
          if (alertsByTime.has(readingTime)) {
            matchedAlerts = alertsByTime.get(readingTime)!;
          } else {
            // Check for nearby alerts
            for (const [alertTime, alertList] of alertsByTime.entries()) {
              if (Math.abs(alertTime - readingTime) <= MATCH_WINDOW_MS) {
                matchedAlerts.push(...alertList);
              }
            }
          }

          // If we found alerts, use their information to override
          if (matchedAlerts.length > 0) {
            // Prioritize fuel-related events over system events
            const fuelEventPriority = ["REFUEL", "REFILL", "THEFT", "DROP"];
            let primaryAlert = matchedAlerts[0];
            
            // Find the highest priority fuel event if multiple alerts exist
            for (const alert of matchedAlerts) {
              const alertType = String(alert.type || "").toUpperCase();
              if (fuelEventPriority.includes(alertType)) {
                primaryAlert = alert;
                break;
              }
            }
            
            const alertType = String(primaryAlert.type || "").toUpperCase();
            
            // Map alert types to event types
            if (alertType === "THEFT" || alertType === "DROP") {
              eventType = "THEFT";
            } else if (alertType === "REFUEL" || alertType === "REFILL") {
              eventType = "REFUEL";
            } else {
              eventType = alertType;
            }
            
            description = primaryAlert.description || `${eventType} detected`;
            
            // Try to extract fuel change from alert
            if (typeof (primaryAlert as any).fuelChange === "number") {
              fuelChange = (primaryAlert as any).fuelChange;
            }
          }

          return {
            ...reading,
            id: reading.id ?? `${readingTime}-${index}`,
            eventType,
            description: description || undefined,
            fuelChange,
          } as FuelReading;
        });

        // Add virtual points for alerts that don't have nearby readings
        const virtualPoints: FuelReading[] = [];
        const processedAlertTimes = new Set<number>();
        
        alerts.forEach(alert => {
          const alertTime = new Date(alert.timestamp).getTime();
          
          // Check if this alert was already processed with a reading
          let wasProcessed = false;
          for (const reading of enrichedReadings) {
            const readingTime = new Date(reading.timestamp as any).getTime();
            if (Math.abs(alertTime - readingTime) <= 5 * 60 * 1000) { // 5 minutes
              wasProcessed = true;
              break;
            }
          }
          
          if (!wasProcessed && !processedAlertTimes.has(alertTime)) {
            const alertType = String(alert.type || "").toUpperCase();
            
            // Skip system events for virtual points - they don't need visual representation
            if (["SENSOR_HEALTH", "LOW_FUEL"].includes(alertType)) {
              return; // Use return instead of continue in forEach
            }
            
            processedAlertTimes.add(alertTime);
            
            // Find the closest reading to get fuel level
            let closestReading: FuelReading | null = null;
            let minDiff = Infinity;
            
            for (const reading of readingsSorted) {
              const readingTime = new Date(reading.timestamp as any).getTime();
              const diff = Math.abs(alertTime - readingTime);
              if (diff < minDiff) {
                minDiff = diff;
                closestReading = reading;
              }
            }
            
            let eventType = "NORMAL";
            if (alertType === "THEFT" || alertType === "DROP") {
              eventType = "THEFT";
            } else if (alertType === "REFUEL" || alertType === "REFILL") {
              eventType = "REFUEL";
            } else {
              eventType = alertType;
            }
            
            virtualPoints.push({
              id: `virt-${alert.id || alertTime}`,
              timestamp: new Date(alertTime).toISOString(),
              fuelLevel: closestReading ? Number(closestReading.fuelLevel) : 0,
              eventType,
              description: alert.description || `${eventType} detected`,
              fuelChange: typeof (alert as any).fuelChange === "number" ? (alert as any).fuelChange : undefined,
            } as FuelReading);
          }
        });

        // Merge and sort all data points
        const allDataPoints = [...enrichedReadings, ...virtualPoints].sort(
          (a, b) => new Date(a.timestamp as any).getTime() - new Date(b.timestamp as any).getTime()
        );

        // Apply final processing with markFuelEvents
        const finalized = markFuelEvents(allDataPoints, { infer: false, treatDropAsTheft: true });
        
        console.log("Finalized fuel data:", finalized);
        console.log("Event breakdown:", finalized.reduce((acc, reading) => {
          const eventType = (reading as any).eventType || "NORMAL";
          acc[eventType] = (acc[eventType] || 0) + 1;
          return acc;
        }, {} as Record<string, number>));
        
        setFuelData(finalized);
        setEvents(alerts);

        // usage summary (supports both new & old param names)
        const usage = await axios.get<FuelUsageStats>(
          `${API_BASE_URL}/fuelusage`,
          {
            params: {
              busId: busId, // backend expects busId
              startDate: range.startDate.toISOString(),
              endDate: range.endDate.toISOString(),
              // tolerant duplicates — ignored if not used
              busid: busId,
              fromDate: range.startDate.toISOString(),
              toDate: range.endDate.toISOString(),
            },
          }
        );

        // Use backend stats as primary source, with alert-based calculation as fallback
        let finalStats = { ...usage.data, fuelEfficiency: usage.data.fuelEfficiency ?? 0 };
        
        // Verify backend stats are reasonable, use alert-based calculation as fallback if needed
        const backendRefueled = usage.data.totalFuelRefueled || 0;
        const backendStolen = usage.data.totalFuelStolen || 0;
        
        // Calculate from alerts as verification/fallback
        let alertBasedRefueled = 0;
        let alertBasedStolen = 0;
        
        if (alerts.length > 0) {
          // Calculate refuel amount from alerts
          const refuelAlerts = alerts.filter(alert => 
            alert.type === "REFUEL" || alert.type === "REFILL"
          );
          
          if (refuelAlerts.length > 0) {
            refuelAlerts.forEach(alert => {
              // Extract fuel amount from description like "Δ=+107.83L"
              const match = alert.description?.match(/Δ=\+([\d.]+)L/);
              if (match) {
                alertBasedRefueled += parseFloat(match[1]);
              }
            });
            console.log("Alert-based refuel calculation:", alertBasedRefueled);
          }
          
          // Calculate theft amount from alerts
          const theftAlerts = alerts.filter(alert => 
            alert.type === "THEFT" || alert.type === "DROP"
          );
          
          if (theftAlerts.length > 0) {
            theftAlerts.forEach(alert => {
              // Extract fuel amount from description like "Δ=-5.05L"
              const match = alert.description?.match(/Δ=-([\d.]+)L/);
              if (match) {
                alertBasedStolen += parseFloat(match[1]);
              }
            });
            console.log("Alert-based theft calculation:", alertBasedStolen);
            console.log("Theft alerts processed:", theftAlerts.length);
          }
        }
        
        // Use backend stats if they're reasonable, otherwise fall back to alert-based calculation
        if (backendRefueled > 0 && Math.abs(backendRefueled - alertBasedRefueled) < 5) {
          // Backend refuel amount is reasonable (within 5L tolerance)
          finalStats.totalFuelRefueled = backendRefueled;
          console.log("Using backend refuel amount:", backendRefueled);
        } else if (alertBasedRefueled > 0) {
          // Fall back to alert-based calculation
          finalStats.totalFuelRefueled = alertBasedRefueled;
          console.log("Using alert-based refuel amount (fallback):", alertBasedRefueled);
        }
        
        if (backendStolen > 0 && Math.abs(backendStolen - alertBasedStolen) < 5) {
          // Backend theft amount is reasonable (within 5L tolerance)
          finalStats.totalFuelStolen = backendStolen;
          console.log("Using backend theft amount:", backendStolen);
        } else if (alertBasedStolen > 0) {
          // Fall back to alert-based calculation
          finalStats.totalFuelStolen = alertBasedStolen;
          console.log("Using alert-based theft amount (fallback):", alertBasedStolen);
        }
        
        setFuelStats(finalStats);

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
        const res = await axios.get<any>(`${API_BASE_URL}/vehicles`);
        const buses = res.data?.data || res.data;

        const toDate = new Date();
        const fromDate = new Date(toDate.getTime() - 24 * 60 * 60 * 1000);
        
        // For testing, use August data where we know there are events
        // const toDate = new Date('2025-08-31T23:59:59.999Z');
        // const fromDate = new Date('2025-08-01T00:00:00.000Z');

        const enriched: BusCard[] = await Promise.all(
          buses.map(async (bus: any) => {
            try {
              const detailsRes = await axios.get<any>(
                `${API_BASE_URL}/vehicles/${bus.id}/details`,
                {
                  params: {
                    include: "readings,alerts,sensor",
                    fromDate: fromDate.toISOString(),
                    toDate: toDate.toISOString(),
                    startDate: fromDate.toISOString(),
                    endDate: toDate.toISOString(),
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
        const res = await axios.get<any>(`${API_BASE_URL}/history`, {
          params: {
            type: "THEFT",
            fromDate: range.startDate.toISOString(),
            toDate: range.endDate.toISOString(),
            startDate: range.startDate.toISOString(),
            endDate: range.endDate.toISOString(),
          },
        });

        const rows = Array.isArray(res.data?.data) ? res.data.data : (Array.isArray(res.data) ? res.data : []);

        const ids = new Set<string>();
        for (const a of rows) {
          const directId = a.bus?.id || a.busId || a.vehicleId;
          if (directId) {
            ids.add(String(directId));
            continue;
          }
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
              Fuel Level –{" "}
              {topBuses.find((b) => b.busId === selectedBus)?.registrationNo ||
                selectedBus}
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
