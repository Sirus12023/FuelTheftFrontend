import React, { useState, useEffect } from "react";
import { format } from "date-fns";
import axios from "axios";

// 🔴 Severity Color Utility
const getSeverityColor = (severity: string) => {
  switch (severity) {
    case "High":
      return "bg-red-100 text-red-700";
    case "Medium":
      return "bg-yellow-100 text-yellow-800";
    case "Low":
      return "bg-green-100 text-green-700";
    default:
      return "bg-gray-100 text-gray-700";
  }
};

const BusEvents: React.FC = () => {
  const [alerts, setAlerts] = useState<any[]>([]);
  const [busFilter, setBusFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [debouncedBusFilter, setDebouncedBusFilter] = useState(busFilter);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // Debounce search input
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedBusFilter(busFilter), 300);
    return () => clearTimeout(handler);
  }, [busFilter]);

  // 🔄 Fetch alerts from backend
  useEffect(() => {
    const fetchAlerts = async () => {
      try {
        const res = await axios.get("/alerts/all");
        setAlerts(res.data);
      } catch (err) {
        console.error("Failed to fetch alerts:", err);
      }
    };

    fetchAlerts();
  }, []);

  // 🔍 Apply Filters
  const filteredAlerts = alerts.filter((alert) => {
    return (
      (debouncedBusFilter === "" || alert.busId.includes(debouncedBusFilter)) &&
      (typeFilter === "" || alert.type === typeFilter)
    );
  });

  const pageCount = Math.ceil(filteredAlerts.length / itemsPerPage);
  const paginatedAlerts = filteredAlerts.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="px-6 py-8 max-w-6xl mx-auto space-y-10">
      <h2 className="text-3xl font-bold text-gray-800">🛑 Alerts History</h2>

      {/* Filters */}
      <div className="flex flex-wrap gap-4 items-center">
        <input
          type="text"
          placeholder="Filter by Bus ID"
          value={busFilter}
          onChange={(e) => {
            setBusFilter(e.target.value);
            setCurrentPage(1);
          }}
          className="border border-gray-300 rounded px-3 py-2"
        />
        <select
          value={typeFilter}
          onChange={(e) => {
            setTypeFilter(e.target.value);
            setCurrentPage(1);
          }}
          className="border border-gray-300 rounded px-3 py-2"
        >
          <option value="">All Event Types</option>
          <option value="Theft">Theft</option>
          <option value="Refuel">Refuel</option>
          <option value="Drop">Drop</option>
        </select>
      </div>

      {/* Count */}
      <p className="text-sm text-gray-500">
        Showing {filteredAlerts.length} alert{filteredAlerts.length !== 1 ? "s" : ""}
      </p>

      {/* Table */}
      <div className="overflow-x-auto rounded-xl border shadow-sm bg-white">
        {filteredAlerts.length === 0 ? (
          <div className="p-6 text-center text-gray-500">
            No alerts found for the selected filters.
          </div>
        ) : (
          <table className="min-w-full table-auto text-sm">
            <thead className="bg-gray-100 text-gray-700 text-left">
              <tr>
                <th className="px-6 py-3">Bus ID</th>
                <th className="px-6 py-3">Event Type</th>
                <th className="px-6 py-3">Timestamp</th>
                <th className="px-6 py-3">Location</th>
                <th className="px-6 py-3">Fuel Change</th>
                <th className="px-6 py-3">Severity</th>
              </tr>
            </thead>
            <tbody>
              {paginatedAlerts.map((alert, idx) => (
                <tr key={idx} className="border-t hover:bg-gray-50">
                  <td className="px-6 py-4 font-medium">{alert.busId}</td>
                  <td className="px-6 py-4">{alert.type}</td>
                  <td className="px-6 py-4">
                    {format(new Date(alert.timestamp), "PPpp")}
                  </td>
                  <td className="px-6 py-4">
                    {alert.location
                      ? `(${alert.location.lat.toFixed(2)}, ${alert.location.lng.toFixed(2)})`
                      : "N/A"}
                  </td>
                  <td className="px-6 py-4">
                    {alert.fuelChange != null
                      ? `${alert.fuelChange > 0 ? "+" : ""}${alert.fuelChange} L`
                      : "—"}
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${getSeverityColor(
                        alert.severity
                      )}`}
                    >
                      {alert.severity}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination */}
      {pageCount > 1 && (
        <div className="flex justify-center mt-4 space-x-2">
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
