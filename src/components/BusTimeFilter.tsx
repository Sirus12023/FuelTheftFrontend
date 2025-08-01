// components/BusTimeFilter.tsx
import React, { useEffect, useState } from "react";
import { format } from "date-fns";
import { DayPicker } from "react-day-picker";
import axios from "axios";
import "react-day-picker/dist/style.css";
import { API_BASE_URL } from "../config";

interface BusOption {
  id: string;
  registrationNo: string;
  [key: string]: any;
}

interface Props {
  busSearch: string;
  setBusSearch: (val: string) => void;
  selectedBusId: string | null;
  setSelectedBusId: (val: string | null) => void;
  timeRange: string;
  setTimeRange: (val: string) => void;
  customStart: string;
  setCustomStart: (val: string) => void;
  customEnd: string;
  setCustomEnd: (val: string) => void;
}

const timeOptions = [
  "today",
  "yesterday",
  "this week",
  "last week",
  "this month",
  "last month",
  "custom",
];


const BusTimeFilter: React.FC<Props> = ({
  busSearch,
  setBusSearch,
  selectedBusId,
  setSelectedBusId,
  timeRange,
  setTimeRange,
  customStart,
  setCustomStart,
  customEnd,
  setCustomEnd,
}) => {
  const [busOptions, setBusOptions] = useState<BusOption[]>([]);
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);

  useEffect(() => {
    const fetchBuses = async () => {
      try {
        const res = await axios.get<BusOption[]>(`${API_BASE_URL}/vehicles`);
        setBusOptions(res.data || []);
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
    setSelectedBusId(match ? match.id : null);
  }, [busSearch, busOptions, setSelectedBusId]);

  const parsedStart = customStart ? new Date(customStart) : undefined;
  const parsedEnd = customEnd ? new Date(customEnd) : undefined;

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
            autoComplete="off"
          />
          {busSearch && !selectedBusId && (
            <p className="text-sm text-red-500 mt-2">
              ⚠️ Bus not found. Please check the registration number.
            </p>
          )}
        </div>
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
            if (val !== "custom") {
              setCustomStart("");
              setCustomEnd("");
              setShowStartPicker(false);
              setShowEndPicker(false);
            }
          }}
          className="w-full border border-gray-300 dark:border-gray-600 rounded-md px-4 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-900 dark:text-white"
        >
          {timeOptions.map((option) => (
  <option key={option} value={option}>
    {option.charAt(0).toUpperCase() + option.slice(1)}
  </option>
))}
        </select>
      </div>

      {/* Custom Range Picker */}
      {timeRange === "custom" && (
        <div className="flex flex-wrap gap-6 pt-2">
          {/* Start Date */}
          <div>
            <label className="text-sm font-medium dark:text-gray-100">Start Date</label>
            {showStartPicker ? (
              <DayPicker
                mode="single"
                selected={parsedStart}
                onSelect={(date) => {
                  if (date) setCustomStart(date.toISOString());
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
                    {parsedStart ? format(parsedStart, "PPP") : "Not selected"}
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
                selected={parsedEnd}
                onSelect={(date) => {
                  if (date) setCustomEnd(date.toISOString());
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
                    {parsedEnd ? format(parsedEnd, "PPP") : "Not selected"}
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
