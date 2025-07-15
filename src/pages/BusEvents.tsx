// pages/BusEvents.tsx
import React, { useEffect, useState } from "react";
import { format } from "date-fns";
import axios from "axios";
import BusTimeFilter from "../components/BusTimeFilter";
import { API_BASE_URL } from "../config";

interface Alert {
  busId: string;
  type: "THEFT" | "REFUEL" | "DROP" | string;
  timestamp: string;
  fuelChange?: number;
  location?: {
    lat: number;
    lng: number;
  };
  description?: string;
}

const BusEvents: React.FC = () => {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Filter states
  const [busSearch, setBusSearch] = useState("");
  const [selectedBus, setSelectedBus] = useState<string | null>(null);
  const [typeFilter, setTypeFilter] = useState("");
  const [timeRange, setTimeRange] = useState("Today");
  const [showCustom, setShowCustom] = useState(false);
  const [startDate, setStartDate] = useState<Date | undefined>();
  const [endDate, setEndDate] = useState<Date | undefined>();
  const [showStartPicker, setShowStartPicker] = useState(true);
  const [showEndPicker, setShowEndPicker] = useState(true);

  // Fetch alerts
  useEffect(() => {
    const fetchAlerts = async () => {
      try {
        const res = await axios.get(`${API_BASE_URL}/alerts/all`);
        setAlerts(res.data);
      } catch (err) {
        console.error("Failed to fetch alerts:", err);
      }
    };
    fetchAlerts();
  }, []);

  // Filter logic
  const filteredAlerts = alerts.filter((alert) => {
    const matchBus = !selectedBus || alert.busId === selectedBus;
    const matchType = !typeFilter || alert.type === typeFilter;
    return matchBus && matchType;
  });

  const paginatedAlerts = filteredAlerts.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const pageCount = Math.ceil(filteredAlerts.length / itemsPerPage);

  // Icons for visual clarity
  const eventIcon = (type: string) =>
    type === "REFUEL" ? "⛽" : type === "THEFT" ? "🚨" : "🔻";

  return (
    <div className="px-6 py-8 max-w-5xl mx-auto space-y-10">
      <h2 className="text-3xl font-bold text-gray-800">🛑 Alerts History</h2>

      <BusTimeFilter
        busSearch={busSearch}
        setBusSearch={setBusSearch}
        selectedBus={selectedBus}
        setSelectedBus={setSelectedBus}
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

      {/* Event Type Filter */}
      <div className="flex flex-wrap gap-4 items-center">
        <select
          value={typeFilter}
          onChange={(e) => {
            setTypeFilter(e.target.value);
            setCurrentPage(1);
          }}
          className="border border-gray-300 rounded px-3 py-2"
        >
          <option value="">All Event Types</option>
          <option value="THEFT">Theft</option>
          <option value="REFUEL">Refuel</option>
          <option value="DROP">Drop</option>
        </select>
      </div>

      {/* Alert List */}
      <section className="bg-white rounded-xl shadow p-6 border border-gray-100">
        <h3 className="text-xl font-semibold text-gray-800 mb-4">Recent Events</h3>

        {paginatedAlerts.length === 0 ? (
          <div className="text-center text-gray-500">No alerts found.</div>
        ) : (
          <ul className="space-y-4">
            {paginatedAlerts.map((event, idx) => (
              <li
                key={idx}
                className="bg-gray-50 p-4 rounded-lg shadow-sm border-l-4 border-blue-500"
              >
                <div className="flex items-start gap-3">
                  <div className="text-2xl">{eventIcon(event.type)}</div>
                  <div>
                    <p className="font-medium text-blue-700">
                      {event.type} – {event.busId}
                    </p>
                    <p className="text-sm text-gray-600">
                      {format(new Date(event.timestamp), "PPpp")}{" "}
                      {event.fuelChange != null &&
                        ` • ${event.fuelChange > 0 ? "+" : ""}${event.fuelChange}L`}
                    </p>
                    {event.location && (
                      <p className="text-xs text-gray-500 mt-1">
                        📍 {event.location.lat.toFixed(2)},{" "}
                        {event.location.lng.toFixed(2)}
                      </p>
                    )}
                    {event.description && (
                      <p className="text-sm text-gray-500 mt-1 italic">
                        {event.description}
                      </p>
                    )}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* Pagination */}
      {pageCount > 1 && (
        <div className="flex justify-center mt-6 space-x-2">
          {Array.from({ length: pageCount }, (_, i) => (
            <button
              key={i}
              onClick={() => setCurrentPage(i + 1)}
              className={`px-3 py-1 border rounded-full text-sm font-medium shadow-sm ${
                currentPage === i + 1
                  ? "bg-blue-500 text-white"
                  : "bg-white text-gray-700"
              }`}
            >
              {i + 1}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default BusEvents;
