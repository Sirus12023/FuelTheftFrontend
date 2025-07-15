// pages/BusEvents.tsx
import React, { useEffect, useState } from "react";
import axios from "axios";

interface Alert {
  id: string;
  type: string;
  busId: string;
  timestamp: string;
  severity: string;
}

const BusEvents: React.FC = () => {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [filteredAlerts, setFilteredAlerts] = useState<Alert[]>([]);
  const [typeFilter, setTypeFilter] = useState("All");
  const [severityFilter, setSeverityFilter] = useState("All");

  // Fetch or mock data
  useEffect(() => {
    const mockData: Alert[] = [
      {
        id: "1",
        type: "Theft",
        busId: "Bus1001",
        timestamp: new Date().toISOString(),
        severity: "High",
      },
      {
        id: "2",
        type: "Refuel",
        busId: "Bus1002",
        timestamp: new Date(Date.now() - 3600000).toISOString(),
        severity: "Low",
      },
      {
        id: "3",
        type: "Drop",
        busId: "Bus1003",
        timestamp: new Date(Date.now() - 7200000).toISOString(),
        severity: "Medium",
      },
      {
        id: "4",
        type: "SensorOff",
        busId: "Bus1004",
        timestamp: new Date(Date.now() - 10800000).toISOString(),
        severity: "Low",
      },
    ];

    // Simulate API delay
    setTimeout(() => {
      setAlerts(mockData);
      setFilteredAlerts(mockData);
    }, 300);

    // Uncomment for real backend later:
    /*
    axios.get("/alerts/all").then((res) => {
      setAlerts(res.data);
      setFilteredAlerts(res.data);
    });
    */
  }, []);

  // Filtering logic
  useEffect(() => {
    let data = [...alerts];
    if (typeFilter !== "All") {
      data = data.filter((a) => a.type === typeFilter);
    }
    if (severityFilter !== "All") {
      data = data.filter((a) => a.severity === severityFilter);
    }
    setFilteredAlerts(data);
  }, [typeFilter, severityFilter, alerts]);

  const typeColors: Record<string, string> = {
    Theft: "bg-red-100 text-red-700",
    Refuel: "bg-green-100 text-green-700",
    Drop: "bg-yellow-100 text-yellow-700",
    SensorOff: "bg-gray-100 text-gray-700",
  };

  const severityColors: Record<string, string> = {
    High: "bg-red-200 text-red-800",
    Medium: "bg-yellow-200 text-yellow-800",
    Low: "bg-green-200 text-green-800",
  };

  const typeIcons: Record<string, string> = {
    Theft: "🚨",
    Refuel: "⛽",
    Drop: "🔻",
    SensorOff: "📴",
  };

  return (
    <div className="max-w-6xl mx-auto px-6 py-10 space-y-8">
      <h2 className="text-3xl font-extrabold text-blue-900">📋 Bus Events Log</h2>

      {/* Filters */}
      <div className="flex flex-wrap gap-4 items-center">
        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm"
        >
          <option value="All">All Types</option>
          <option value="Theft">Theft</option>
          <option value="Refuel">Refuel</option>
          <option value="Drop">Drop</option>
          <option value="SensorOff">Sensor Off</option>
        </select>

        <select
          value={severityFilter}
          onChange={(e) => setSeverityFilter(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm"
        >
          <option value="All">All Severity</option>
          <option value="High">High</option>
          <option value="Medium">Medium</option>
          <option value="Low">Low</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-white shadow rounded-xl overflow-hidden border">
        <table className="w-full table-auto text-sm">
          <thead className="bg-gray-100 text-gray-700 text-left">
            <tr>
              <th className="px-4 py-3">Type</th>
              <th className="px-4 py-3">Bus ID</th>
              <th className="px-4 py-3">Timestamp</th>
              <th className="px-4 py-3">Severity</th>
            </tr>
          </thead>
          <tbody>
            {filteredAlerts.length > 0 ? (
              filteredAlerts.map((alert) => (
                <tr key={alert.id} className="border-t hover:bg-gray-50 transition">
                  <td className="px-4 py-3 font-medium text-gray-800">
                    <span
                      className={`inline-flex items-center gap-2 px-2 py-1 rounded text-xs font-medium ${typeColors[alert.type] || "bg-gray-100 text-gray-700"}`}
                    >
                      {typeIcons[alert.type] || "📍"} {alert.type}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-800">{alert.busId}</td>
                  <td className="px-4 py-3 text-gray-600">
                    {new Date(alert.timestamp).toLocaleString()}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`px-2 py-1 rounded text-xs font-medium ${severityColors[alert.severity] || "bg-gray-100 text-gray-700"}`}
                    >
                      {alert.severity}
                    </span>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={4} className="text-center py-6 text-gray-500">
                  No alerts found for the selected filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default BusEvents;
