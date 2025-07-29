// components/DashboardTimeFilter.tsx
import React from "react";

interface DashboardTimeFilterProps {
  range: string;
  customStart: string;
  customEnd: string;
  onRangeChange: (range: string) => void;
  onCustomDateChange: (start: string, end: string) => void;
}

const timeOptions = [
  { label: "Today", value: "today" },
  { label: "Yesterday", value: "yesterday" },
  { label: "Last 7 Days", value: "week" },
  { label: "Last 30 Days", value: "month" },
  { label: "Custom", value: "custom" },
];

const DashboardTimeFilter: React.FC<DashboardTimeFilterProps> = ({
  range,
  customStart,
  customEnd,
  onRangeChange,
  onCustomDateChange,
}) => {
  return (
    <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center mb-4">
      <select
        value={range}
        onChange={(e) => onRangeChange(e.target.value)}
        className="px-3 py-2 rounded bg-white text-gray-800 dark:bg-gray-800 dark:text-white"
      >
        {timeOptions.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>

      {range === "custom" && (
        <div className="flex gap-2">
          <input
            type="date"
            value={customStart}
            onChange={(e) => onCustomDateChange(e.target.value, customEnd)}
            className="px-2 py-1 rounded bg-white dark:bg-gray-800 text-gray-800 dark:text-white"
          />
          <input
            type="date"
            value={customEnd}
            onChange={(e) => onCustomDateChange(customStart, e.target.value)}
            className="px-2 py-1 rounded bg-white dark:bg-gray-800 text-gray-800 dark:text-white"
          />
        </div>
      )}
    </div>
  );
};

export default DashboardTimeFilter;
