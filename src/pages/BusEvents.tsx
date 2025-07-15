import React, { useEffect, useState, useMemo } from "react";
import axios from "axios";
import { format, subDays, isWithinInterval } from "date-fns";
import { API_BASE_URL } from "../config";

interface Alert {
  type: "THEFT" | "REFUEL" | "DROP" | string;
  timestamp: string;
  description: string;
  location: {
    lat: number;
    long: number;
  };
  bus: {
    id: string;
    registrationNo: string;
    driver: string;
    route: string;
  };
}

const BusEvents: React.FC = () => {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedBus, setSelectedBus] = useState<string | null>(null);
  const [typeFilter, setTypeFilter] = useState<string>("");
  const [dateFilter, setDateFilter] = useState<string>("all");
  const [customStartDate, setCustomStartDate] = useState<string>("");
  const [customEndDate, setCustomEndDate] = useState<string>("");
  const [currentPage, setCurrentPage] = useState(1);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const itemsPerPage = 10;

  useEffect(() => {
    const fetchAlerts = async () => {
      try {
        const res = await axios.get(`${API_BASE_URL}/alerts/all`);
        setAlerts(res.data);
      } catch (err) {
        console.error("Error fetching alerts:", err);
      }
    };
    fetchAlerts();
  }, []);

  // Get unique buses for suggestions
  const busSuggestions = useMemo(() => {
    const buses = alerts.map(alert => alert.bus.registrationNo);
    return [...new Set(buses)];
  }, [alerts]);

  // Filter alerts based on selected filters
  const filteredAlerts = useMemo(() => {
    if (!selectedBus) return []; // Return empty array if no bus is selected
    
    return alerts.filter((alert) => {
      // Filter by bus if selected
      const busMatch = 
        alert.bus.registrationNo.toLowerCase().includes(selectedBus.toLowerCase());
      
      // Filter by type if selected
      const typeMatch = !typeFilter || alert.type === typeFilter;
      
      // Filter by date
      const eventDate = new Date(alert.timestamp);
      let dateMatch = true;
      
      if (dateFilter === "today") {
        const today = new Date();
        dateMatch = format(eventDate, 'yyyy-MM-dd') === format(today, 'yyyy-MM-dd');
      } else if (dateFilter === "yesterday") {
        const yesterday = subDays(new Date(), 1);
        dateMatch = format(eventDate, 'yyyy-MM-dd') === format(yesterday, 'yyyy-MM-dd');
      } else if (dateFilter === "week") {
        const weekAgo = subDays(new Date(), 7);
        dateMatch = isWithinInterval(eventDate, { start: weekAgo, end: new Date() });
      } else if (dateFilter === "month") {
        const monthAgo = subDays(new Date(), 30);
        dateMatch = isWithinInterval(eventDate, { start: monthAgo, end: new Date() });
      } else if (dateFilter === "custom" && customStartDate && customEndDate) {
        dateMatch = isWithinInterval(eventDate, { 
          start: new Date(customStartDate), 
          end: new Date(customEndDate) 
        });
      }
      
      return busMatch && typeMatch && dateMatch;
    });
  }, [alerts, selectedBus, typeFilter, dateFilter, customStartDate, customEndDate]);

  // Pagination logic
  const paginatedAlerts = useMemo(() => {
    return filteredAlerts.slice(
      (currentPage - 1) * itemsPerPage,
      currentPage * itemsPerPage
    );
  }, [filteredAlerts, currentPage]);

  const pageCount = Math.ceil(filteredAlerts.length / itemsPerPage);

  const eventIcon = (type: string) => {
    if (type === "REFUEL") return "⛽";
    if (type === "THEFT") return "🚨";
    return "🔻";
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setShowSuggestions(e.target.value.length > 0);
  };

  const selectBus = (bus: string) => {
    setSelectedBus(bus);
    setSearchTerm(bus);
    setShowSuggestions(false);
    setCurrentPage(1); // Reset to first page when selecting a new bus
  };

  const clearFilters = () => {
    setSelectedBus(null);
    setSearchTerm("");
    setTypeFilter("");
    setDateFilter("all");
    setCustomStartDate("");
    setCustomEndDate("");
    setCurrentPage(1);
  };

  return (
    <div className="px-4 py-6 max-w-6xl mx-auto space-y-6">
      <h2 className="text-3xl font-bold text-gray-800">🛑 Alerts History</h2>

      {/* Filters Section */}
      <div className="bg-white rounded-xl shadow p-6 border border-gray-100 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Bus Search with Dropdown */}
          <div className="relative">
            <label className="block text-sm font-medium text-gray-700 mb-1">Bus Registration*</label>
            <div className="relative">
              <input
                type="text"
                placeholder="Search and select a bus..."
                value={searchTerm}
                onChange={handleSearchChange}
                onFocus={() => setShowSuggestions(true)}
                className="border px-3 py-2 rounded shadow-sm w-full"
              />
              {showSuggestions && searchTerm && (
                <ul className="absolute z-10 mt-1 w-full bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto">
                  {busSuggestions
                    .filter(bus => 
                      bus.toLowerCase().includes(searchTerm.toLowerCase()))
                    .map((bus, index) => (
                      <li
                        key={index}
                        className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                        onClick={() => selectBus(bus)}
                      >
                        {bus}
                      </li>
                    ))}
                </ul>
              )}
            </div>
          </div>

          {/* Event Type Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Event Type</label>
            <select
              value={typeFilter}
              onChange={(e) => {
                setTypeFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="border border-gray-300 rounded px-3 py-2 w-full"
              disabled={!selectedBus}
            >
              <option value="">All Types</option>
              <option value="THEFT">Theft</option>
              <option value="REFUEL">Refuel</option>
            </select>
          </div>

          {/* Date Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Date Range</label>
            <select
              value={dateFilter}
              onChange={(e) => {
                setDateFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="border border-gray-300 rounded px-3 py-2 w-full"
              disabled={!selectedBus}
            >
              <option value="all">All Time</option>
              <option value="today">Today</option>
              <option value="yesterday">Yesterday</option>
              <option value="week">Last 7 Days</option>
              <option value="month">Last 30 Days</option>
              <option value="custom">Custom Range</option>
            </select>
          </div>

          {/* Clear Filters Button */}
          <div className="flex items-end">
            <button
              onClick={clearFilters}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition w-full"
            >
              Clear Filters
            </button>
          </div>
        </div>

        {/* Custom Date Range Picker (shown when 'custom' is selected) */}
        {dateFilter === "custom" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
              <input
                type="date"
                value={customStartDate}
                onChange={(e) => setCustomStartDate(e.target.value)}
                className="border border-gray-300 rounded px-3 py-2 w-full"
                disabled={!selectedBus}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
              <input
                type="date"
                value={customEndDate}
                onChange={(e) => setCustomEndDate(e.target.value)}
                className="border border-gray-300 rounded px-3 py-2 w-full"
                disabled={!selectedBus}
              />
            </div>
          </div>
        )}
      </div>

      {/* Results Count */}
      {selectedBus ? (
        <div className="text-sm text-gray-600">
          Showing {filteredAlerts.length} results
          {selectedBus && ` for bus ${selectedBus}`}
          {typeFilter && ` (${typeFilter} events)`}
        </div>
      ) : (
        <div className="text-sm text-gray-600">
          Please select a bus to view alerts
        </div>
      )}

      {/* Alerts Table */}
      {selectedBus ? (
        <div className="bg-white rounded-xl shadow overflow-hidden border border-gray-100">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Bus</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Driver</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Route</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Location</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Time</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {paginatedAlerts.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-4 text-center text-gray-500">
                      No alerts found matching your criteria
                    </td>
                  </tr>
                ) : (
                  paginatedAlerts.map((alert, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <span className="text-2xl mr-2">{eventIcon(alert.type)}</span>
                          <span className="text-sm font-medium capitalize">{alert.type.toLowerCase()}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{alert.bus.registrationNo}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{alert.bus.driver}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{alert.bus.route}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">{alert.description}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">
                          {alert.location.lat.toFixed(4)}, {alert.location.long.toFixed(4)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">
                          {format(new Date(alert.timestamp), "PPpp")}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {pageCount > 1 && (
            <div className="bg-gray-50 px-6 py-3 flex items-center justify-between border-t border-gray-200">
              <div className="flex-1 flex justify-between sm:hidden">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                >
                  Previous
                </button>
                <button
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, pageCount))}
                  disabled={currentPage === pageCount}
                  className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                >
                  Next
                </button>
              </div>
              <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-gray-700">
                    Showing <span className="font-medium">{(currentPage - 1) * itemsPerPage + 1}</span> to{' '}
                    <span className="font-medium">
                      {Math.min(currentPage * itemsPerPage, filteredAlerts.length)}
                    </span>{' '}
                    of <span className="font-medium">{filteredAlerts.length}</span> results
                  </p>
                </div>
                <div>
                  <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                    <button
                      onClick={() => setCurrentPage(1)}
                      disabled={currentPage === 1}
                      className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
                    >
                      <span className="sr-only">First</span>
                      «
                    </button>
                    <button
                      onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                      disabled={currentPage === 1}
                      className="relative inline-flex items-center px-2 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
                    >
                      <span className="sr-only">Previous</span>
                      ‹
                    </button>
                    
                    {Array.from({ length: Math.min(5, pageCount) }, (_, i) => {
                      let pageNum;
                      if (pageCount <= 5) {
                        pageNum = i + 1;
                      } else if (currentPage <= 3) {
                        pageNum = i + 1;
                      } else if (currentPage >= pageCount - 2) {
                        pageNum = pageCount - 4 + i;
                      } else {
                        pageNum = currentPage - 2 + i;
                      }
                      
                      return (
                        <button
                          key={pageNum}
                          onClick={() => setCurrentPage(pageNum)}
                          className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                            currentPage === pageNum
                              ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                              : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                          }`}
                        >
                          {pageNum}
                        </button>
                      );
                    })}
                    
                    <button
                      onClick={() => setCurrentPage(prev => Math.min(prev + 1, pageCount))}
                      disabled={currentPage === pageCount}
                      className="relative inline-flex items-center px-2 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
                    >
                      <span className="sr-only">Next</span>
                      ›
                    </button>
                    <button
                      onClick={() => setCurrentPage(pageCount)}
                      disabled={currentPage === pageCount}
                      className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
                    >
                      <span className="sr-only">Last</span>
                      »
                    </button>
                  </nav>
                </div>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow p-6 border border-gray-100 text-center text-gray-500">
          Please select a bus from the search above to view its alerts
        </div>
      )}
    </div>
  );
};

export default BusEvents;