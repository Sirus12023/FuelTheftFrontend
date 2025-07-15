import React, { useEffect, useState } from "react";
import { format } from "date-fns";
import { DayPicker } from "react-day-picker";
import axios from "axios";
import "react-day-picker/dist/style.css";

interface Props {
  busSearch: string;
  setBusSearch: (val: string) => void;
  selectedBus: string | null;
  setSelectedBus: (val: string | null) => void;
  timeRange: string;
  setTimeRange: (val: string) => void;
  showCustom: boolean;
  setShowCustom: (val: boolean) => void;
  startDate: Date | undefined;
  setStartDate: (val: Date | undefined) => void;
  endDate: Date | undefined;
  setEndDate: (val: Date | undefined) => void;
  showStartPicker: boolean;
  setShowStartPicker: (val: boolean) => void;
  showEndPicker: boolean;
  setShowEndPicker: (val: boolean) => void;
}

const timeOptions = [
  "Today", "Yesterday", "This Week", "Last Week",
  "This Month", "Last Month", "Custom"
];

const BusTimeFilter: React.FC<Props> = ({
  busSearch,
  setBusSearch,
  selectedBus,
  setSelectedBus,
  timeRange,
  setTimeRange,
  showCustom,
  setShowCustom,
  startDate,
  setStartDate,
  endDate,
  setEndDate,
  showStartPicker,
  setShowStartPicker,
  showEndPicker,
  setShowEndPicker,
}) => {
  const [busOptions, setBusOptions] = useState<string[]>([]);

  useEffect(() => {
    const fetchBuses = async () => {
      try {
        const res = await axios.get("/dashboard");
        const topBuses = res.data?.topBuses || [];
        const ids = topBuses.map((b: any) => b.busId);
        setBusOptions(ids);
      } catch (err) {
        console.error("Failed to fetch buses:", err);
      }
    };

    fetchBuses();
  }, []);

  // Auto-select if exact match
  useEffect(() => {
    const match = busOptions.find((b) => b.toLowerCase() === busSearch.toLowerCase());
    setSelectedBus(match || null);
  }, [busSearch, busOptions]);

  return (
    <section className="bg-white rounded-xl p-6 shadow border space-y-6">
      {/* Bus Input */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-1">
          Bus Number
        </label>
        <div className="relative">
          <input
            type="text"
            value={busSearch}
            onChange={(e) => setBusSearch(e.target.value)}
            placeholder="Enter bus number..."
            className="w-full border border-gray-300 rounded-md px-4 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />

          {busSearch && !busOptions.includes(busSearch) && (
            <ul className="absolute z-10 w-full bg-white border mt-1 rounded-md shadow max-h-40 overflow-y-auto">
              {busOptions
                .filter((bus) =>
                  bus.toLowerCase().includes(busSearch.toLowerCase())
                )
                .map((bus) => (
                  <li
                    key={bus}
                    onClick={() => {
                      setBusSearch(bus);
                      setSelectedBus(bus);
                    }}
                    className="px-4 py-2 cursor-pointer hover:bg-blue-100"
                  >
                    {bus}
                  </li>
                ))}
            </ul>
          )}
        </div>

        {/* Warning */}
        {busSearch && !selectedBus && (
          <p className="text-sm text-red-500 mt-2">
            ⚠️ Bus not found. Please check the number or select from suggestions.
          </p>
        )}

        {selectedBus && (
          <p className="text-sm text-gray-500 mt-1">
            Selected: <span className="font-semibold">{selectedBus}</span>
          </p>
        )}
      </div>

      {/* Time Range Dropdown */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-1">
          Time Range
        </label>
        <select
          value={timeRange}
          onChange={(e) => {
            const val = e.target.value;
            setTimeRange(val);
            setShowCustom(val === "Custom");
            if (val !== "Custom") {
              setShowStartPicker(true);
              setShowEndPicker(true);
            }
          }}
          className="w-full border border-gray-300 rounded-md px-4 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {timeOptions.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      </div>

      {/* Custom Date Range */}
      {showCustom && (
        <div className="flex flex-wrap gap-6 pt-2">
          {/* Start Picker */}
          <div>
            <label className="text-sm font-medium">Start Date</label>
            {showStartPicker ? (
              <DayPicker
                mode="single"
                selected={startDate}
                onSelect={(date) => {
                  setStartDate(date);
                  setShowStartPicker(false);
                }}
                captionLayout="dropdown"
                fromDate={new Date(2020, 0, 1)}
                toDate={new Date(new Date().getFullYear() + 1, 11, 31)}
                className="border rounded-md p-2"
              />
            ) : (
              <>
                <p className="text-sm text-gray-700 mt-2">
                  Selected:{" "}
                  <span className="font-semibold">
                    {startDate ? format(startDate, "PPP") : "Not selected"}
                  </span>
                </p>
                <button
                  className="text-sm text-blue-600 underline mt-1"
                  onClick={() => setShowStartPicker(true)}
                >
                  Change Start Date
                </button>
              </>
            )}
          </div>

          {/* End Picker */}
          <div>
            <label className="text-sm font-medium">End Date</label>
            {showEndPicker ? (
              <DayPicker
                mode="single"
                selected={endDate}
                onSelect={(date) => {
                  setEndDate(date);
                  setShowEndPicker(false);
                }}
                captionLayout="dropdown"
                fromDate={new Date(2020, 0, 1)}
                toDate={new Date(new Date().getFullYear() + 1, 11, 31)}
                className="border rounded-md p-2"
              />
            ) : (
              <>
                <p className="text-sm text-gray-700 mt-2">
                  Selected:{" "}
                  <span className="font-semibold">
                    {endDate ? format(endDate, "PPP") : "Not selected"}
                  </span>
                </p>
                <button
                  className="text-sm text-blue-600 underline mt-1"
                  onClick={() => setShowEndPicker(true)}
                >
                  Change End Date
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </section>
  );
};

export default BusTimeFilter;
