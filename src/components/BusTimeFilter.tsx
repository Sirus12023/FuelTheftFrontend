<<<<<<< HEAD
import React, { useEffect, useState } from "react";
=======
// components/BusTimeFilter.tsx
import React, { useEffect } from "react";
>>>>>>> d354f6165184b973dcd9ff24a44fe8ddfc03ce57
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

<<<<<<< HEAD
const timeOptions = [
  "Today",
  "Yesterday",
  "This Week",
  "Last Week",
  "This Month",
  "Last Month",
  "Custom",
=======
const knownBuses = [
  "Bus1001", "Bus1002", "Bus1003", "Bus1004", "Bus1005"
];

const timeOptions = [
  "Today", "Yesterday", "This Week", "Last Week", "This Month", "Last Month", "Custom"
>>>>>>> d354f6165184b973dcd9ff24a44fe8ddfc03ce57
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
<<<<<<< HEAD
    const fetchBuses = async () => {
      try {
        const res = await axios.get(`${API_BASE_URL}/dashboard`);
        const topBuses = res.data?.topBuses || [];
        setBusOptions(topBuses.map((b: any) => ({
          busId: b.busId,
          registrationNo: b.registrationNo
        })));
      } catch (err) {
        console.error("Failed to fetch buses:", err);
      }
    };

    fetchBuses();
  }, []);

  // Auto-select exact match on registration number
  useEffect(() => {
    const match = busOptions.find(
      (b) => b.registrationNo.toLowerCase() === busSearch.toLowerCase()
    );
    if (match) {
      setSelectedBus(match.busId);
    } else {
      setSelectedBus(null);
    }
  }, [busSearch, busOptions]);

  const filteredSuggestions = busOptions.filter(
    (b) =>
      b.registrationNo.toLowerCase().includes(busSearch.toLowerCase()) &&
      b.registrationNo.toLowerCase() !== busSearch.toLowerCase()
=======
    const exactMatch = knownBuses.find(b => b.toLowerCase() === busSearch.toLowerCase());
    setSelectedBusId(exactMatch || null);
  }, [busSearch]);

  const filteredSuggestions = knownBuses.filter(b =>
    b.toLowerCase().includes(busSearch.toLowerCase())
>>>>>>> d354f6165184b973dcd9ff24a44fe8ddfc03ce57
  );

  return (
    <section className="bg-white rounded-xl p-6 shadow border space-y-6">
<<<<<<< HEAD
      {/* Bus Registration Number Search */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-1">
          Search by Bus Registration No.
        </label>
=======
      {/* 🔍 Bus Input */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-1">Bus Number</label>
>>>>>>> d354f6165184b973dcd9ff24a44fe8ddfc03ce57
        <div className="relative">
          <input
            type="text"
            value={busSearch}
            onChange={(e) => setBusSearch(e.target.value)}
            placeholder="e.g. TEST-1234"
            className="w-full border border-gray-300 rounded-md px-4 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />

<<<<<<< HEAD
          {/* Suggestions */}
          {filteredSuggestions.length > 0 && (
            <ul className="absolute z-10 w-full bg-white border mt-1 rounded-md shadow max-h-40 overflow-y-auto">
              {filteredSuggestions.map((b) => (
                <li
                  key={b.busId}
                  onClick={() => {
                    setBusSearch(b.registrationNo);
                    setSelectedBus(b.busId);
                  }}
                  className="px-4 py-2 cursor-pointer hover:bg-blue-100"
                >
                  {b.registrationNo}
=======
          {busSearch && filteredSuggestions.length > 0 && busSearch !== selectedBusId &&(
            <ul className="absolute z-10 w-full bg-white border mt-1 rounded-md shadow max-h-40 overflow-y-auto">
              {filteredSuggestions.map((bus) => (
                <li
                  key={bus}
                  onClick={() => {
                    setBusSearch(bus);
                    setSelectedBusId(bus);
                      document.activeElement instanceof HTMLElement && document.activeElement.blur(); // removes focus
                  }}
                  className="px-4 py-2 cursor-pointer hover:bg-blue-100"
                >
                  {bus}
>>>>>>> d354f6165184b973dcd9ff24a44fe8ddfc03ce57
                </li>
              ))}
            </ul>
          )}
        </div>
        {busSearch && !knownBuses.some(b => b.toLowerCase() === busSearch.toLowerCase()) && (
  <p className="text-sm text-red-500 mt-2">
    ⚠️ Bus not found. Please check the number or select from suggestions.
  </p>
)}

<<<<<<< HEAD
        {/* Validation */}
        {busSearch && !selectedBus && (
          <p className="text-sm text-red-500 mt-2">
            ⚠️ Bus not found. Please check the registration number.
          </p>
        )}

        {selectedBus && (
          <p className="text-sm text-gray-500 mt-1">
            Selected Bus ID: <span className="font-semibold">{selectedBus}</span>
          </p>
        )}
      </div>

      {/* Time Range Dropdown */}
=======
      </div>

      {/* 🕒 Time Range */}
>>>>>>> d354f6165184b973dcd9ff24a44fe8ddfc03ce57
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-1">Time Range</label>
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
          className="w-full border border-gray-300 rounded-md px-4 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {timeOptions.map((option) => (
            <option key={option}>{option}</option>
          ))}
        </select>
      </div>

<<<<<<< HEAD
      {/* Custom Date Range Pickers */}
=======
      {/* 📅 Custom Date Range */}
>>>>>>> d354f6165184b973dcd9ff24a44fe8ddfc03ce57
      {showCustom && (
        <div className="flex flex-wrap gap-6 pt-2">
          {/* Start Date */}
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
                fromDate={new Date(2020, 0, 1)}
                toDate={new Date()}
                captionLayout="dropdown"
                className="border rounded-md p-2"
              />
            ) : (
              <>
                <p className="text-sm text-gray-700 mt-2">
                  Selected: <span className="font-semibold">{startDate ? format(startDate, "PPP") : "Not selected"}</span>
                </p>
                <button className="text-sm text-blue-600 underline mt-1" onClick={() => setShowStartPicker(true)}>
                  Change Start Date
                </button>
              </>
            )}
          </div>

          {/* End Date */}
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
                fromDate={new Date(2020, 0, 1)}
                toDate={new Date()}
                captionLayout="dropdown"
                className="border rounded-md p-2"
              />
            ) : (
              <>
                <p className="text-sm text-gray-700 mt-2">
                  Selected: <span className="font-semibold">{endDate ? format(endDate, "PPP") : "Not selected"}</span>
                </p>
                <button className="text-sm text-blue-600 underline mt-1" onClick={() => setShowEndPicker(true)}>
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
