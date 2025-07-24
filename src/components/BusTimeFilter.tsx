// components/BusTimeFilter.tsx
import React, { useEffect, useState } from "react";
import { format } from "date-fns";
import { DayPicker } from "react-day-picker";
import axios from "axios";
import "react-day-picker/dist/style.css";
import { API_BASE_URL } from "../config";

interface BusOption {
  busId: string;
  registrationNo: string;
}

interface Props {
  busSearch: string;
  setBusSearch: (val: string) => void;
  selectedBusId: string | null;
  setSelectedBusId: (val: string | null) => void;
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
  "Today",
  "Yesterday",
  "This Week",
  "Last Week",
  "This Month",
  "Last Month",
  "Custom",
];

const BusTimeFilter: React.FC<Props> = ({
  busSearch,
  setBusSearch,
  selectedBusId,
  setSelectedBusId,
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
  const [busOptions, setBusOptions] = useState<BusOption[]>([]);

  useEffect(() => {
    const fetchBuses = async () => {
      try {
        const res = await axios.get<{ topBuses: BusOption[] }>(`${API_BASE_URL}/dashboard`);
        const topBuses = res.data?.topBuses || [];
        setBusOptions(
          topBuses.map((b) => ({
            busId: b.busId,
            registrationNo: b.registrationNo,
          }))
        );
      } catch (err) {
        console.error("Failed to fetch buses:", err);
      }
    };

    fetchBuses();
  }, []);

  useEffect(() => {
    const match = busOptions.find(
      (b) => b.registrationNo.toLowerCase() === busSearch.toLowerCase()
    );
    if (match) {
      setSelectedBusId(match.busId);
    } else {
      setSelectedBusId(null);
    }
  }, [busSearch, busOptions]);

  const filteredSuggestions = busOptions.filter(
    (b) =>
      b.registrationNo.toLowerCase().includes(busSearch.toLowerCase()) &&
      b.registrationNo.toLowerCase() !== busSearch.toLowerCase()
  );

  return (
    <section className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow border border-gray-200 dark:border-gray-700 space-y-6">
      {/* Bus Search */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-100 mb-1">
          Search by Bus Registration No.
        </label>
        <div className="relative">
          <input
            type="text"
            value={busSearch}
            onChange={(e) => setBusSearch(e.target.value)}
            placeholder="e.g. UP32AB1234"
            className="w-full border border-gray-300 dark:border-gray-600 rounded-md px-4 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-900 dark:text-white"
          />

          {filteredSuggestions.length > 0 && (
            <ul className="absolute z-10 w-full bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 mt-1 rounded-md shadow max-h-40 overflow-y-auto">
              {filteredSuggestions.map((b) => (
                <li
                  key={b.busId}
                  onClick={() => {
                    setBusSearch(b.registrationNo);
                    setSelectedBusId(b.busId);
                  }}
                  className="px-4 py-2 cursor-pointer hover:bg-blue-100 dark:hover:bg-gray-700"
                >
                  {b.registrationNo}
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Validation */}
        {busSearch && !selectedBusId && (
          <p className="text-sm text-red-500 mt-2">
            ⚠️ Bus not found. Please check the registration number.
          </p>
        )}

        {selectedBusId && (
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Selected Bus ID: <span className="font-semibold">{selectedBusId}</span>
          </p>
        )}
      </div>

      {/* Time Range */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-100 mb-1">
          Time Range
        </label>
        <select
          value={timeRange}
          onChange={(e) => {
            const val = e.target.value;
            setTimeRange(val);
            setShowCustom(val === "Custom");
            if (val !== "Custom") {
              setShowStartPicker(false);
              setShowEndPicker(false);
            }
          }}
          className="w-full border border-gray-300 dark:border-gray-600 rounded-md px-4 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-900 dark:text-white"
        >
          {timeOptions.map((option) => (
            <option key={option}>{option}</option>
          ))}
        </select>
      </div>

      {/* Custom Range */}
      {showCustom && (
        <div className="flex flex-wrap gap-6 pt-2">
          {/* Start Date */}
          <div>
            <label className="text-sm font-medium dark:text-gray-100">Start Date</label>
            {showStartPicker ? (
              <DayPicker
                mode="single"
                selected={startDate}
                onSelect={(date) => {
                  setStartDate(date);
                  setShowStartPicker(false);
                }}
                fromDate={new Date(2020, 0, 1)}
                toDate={new Date()}
                captionLayout="dropdown"
                className="border rounded-md p-2 dark:bg-gray-900 dark:border-gray-600"
              />
            ) : (
              <>
                <p className="text-sm text-gray-700 dark:text-gray-300 mt-2">
                  Selected:{" "}
                  <span className="font-semibold">
                    {startDate ? format(startDate, "PPP") : "Not selected"}
                  </span>
                </p>
                <button
                  className="text-sm text-blue-600 dark:text-blue-400 underline mt-1"
                  onClick={() => setShowStartPicker(true)}
                >
                  Change Start Date
                </button>
              </>
            )}
          </div>

          {/* End Date */}
          <div>
            <label className="text-sm font-medium dark:text-gray-100">End Date</label>
            {showEndPicker ? (
              <DayPicker
                mode="single"
                selected={endDate}
                onSelect={(date) => {
                  setEndDate(date);
                  setShowEndPicker(false);
                }}
                fromDate={new Date(2020, 0, 1)}
                toDate={new Date()}
                captionLayout="dropdown"
                className="border rounded-md p-2 dark:bg-gray-900 dark:border-gray-600"
              />
            ) : (
              <>
                <p className="text-sm text-gray-700 dark:text-gray-300 mt-2">
                  Selected:{" "}
                  <span className="font-semibold">
                    {endDate ? format(endDate, "PPP") : "Not selected"}
                  </span>
                </p>
                <button
                  className="text-sm text-blue-600 dark:text-blue-400 underline mt-1"
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

