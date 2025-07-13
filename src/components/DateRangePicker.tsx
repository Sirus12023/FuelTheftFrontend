// components/DateRangePicker.tsx
import React from "react";
import { format } from "date-fns";
import { DayPicker } from "react-day-picker";
import "react-day-picker/dist/style.css";

interface Props {
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

const DateRangePicker: React.FC<Props> = ({
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
  return (
    <section className="bg-white rounded-xl p-6 shadow border space-y-4">
      <label className="block text-sm font-semibold text-gray-700">
        Select Time Range
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
        {timeOptions.map((opt) => (
          <option key={opt} value={opt}>
            {opt}
          </option>
        ))}
      </select>

      {showCustom && (
        <div className="flex flex-wrap gap-6 pt-4">
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
                  Selected: <span className="font-semibold">{startDate ? format(startDate, "PPP") : "Not selected"}</span>
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
                  Selected: <span className="font-semibold">{endDate ? format(endDate, "PPP") : "Not selected"}</span>
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

export default DateRangePicker;
