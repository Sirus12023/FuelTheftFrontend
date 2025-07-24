import React, { useEffect, useState } from "react";
import { getDateRange } from "../utils/dateRangeFromTimeOption";
import axios from "axios";
import { API_BASE_URL } from "../config";
import { AlertCircle, Fuel, RefreshCcw } from "lucide-react";
import CountUp from "react-countup";

interface Props {
  title: string;
  icon: "alert" | "fuel" | "refuel";
  color: string;
  apiPath: string;
}

const timeOptions = [
  { label: "Today", value: "today" },
  { label: "Yesterday", value: "yesterday" },
  { label: "Last 7 Days", value: "week" },
  { label: "Last 30 Days", value: "month" },
  { label: "Custom", value: "custom" },
];

const getIcon = (name: string) => {
  const baseClass = "w-8 h-8 text-white min-w-8";
  switch (name) {
    case "alert":
      return <AlertCircle className={baseClass} />;
    case "fuel":
      return <Fuel className={baseClass} />;
    case "refuel":
      return <RefreshCcw className={baseClass} />;
    default:
      return null;
  }
};

const StatCards: React.FC<Props> = ({ title, icon, color, apiPath }) => {
  const [count, setCount] = useState<number | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [range, setRange] = useState<string>("today");
  const [customStart, setCustomStart] = useState<string>("");
  const [customEnd, setCustomEnd] = useState<string>("");

  useEffect(() => {
    const fetchCount = async () => {
      let startDate: Date | undefined;
      let endDate: Date | undefined;
      let effectiveRange = range;

      // If nothing is selected, default to "today"
      if (!range || range === "") {
        effectiveRange = "today";
        setRange("today");
      }

      if (effectiveRange === "custom") {
        startDate = customStart ? new Date(customStart) : undefined;
        endDate = customEnd ? new Date(customEnd) : undefined;
        // Don't fetch if custom range is incomplete
        if (!customStart || !customEnd) {
          setCount(null);
          return;
        }
      } else {
        const rangeObj = getDateRange(effectiveRange);
        startDate = rangeObj?.startDate;
        endDate = rangeObj?.endDate;
      }

      setLoading(true);
      setError(null);

      try {
        // Parse query params from apiPath if any
        let url = `${API_BASE_URL}${apiPath}`;
        const params: Record<string, any> = {};

        // Extract and parse query string from apiPath
        if (apiPath.includes("?")) {
          const [base, query] = apiPath.split("?");
          url = `${API_BASE_URL}${base}`;
          query.split("&").forEach((kv) => {
            const [key, value] = kv.split("=");
            params[key] = value;
          });
        }

        // Add time filters only if present
        if (startDate) params.startDate = startDate.toISOString();
        if (endDate) params.endDate = endDate.toISOString();

        // Always expect array response, filter by time and type if needed
        const res = await axios.get(url, { params });

        let data: any[] = [];
        if (Array.isArray(res.data)) {
          data = res.data;
        } else if (typeof res.data === "object" && res.data !== null && Array.isArray((res.data as any).data)) {
          data = (res.data as any).data;
        } else if (typeof res.data === "object" && res.data !== null && "count" in res.data) {
          // fallback for { count } response
          setCount(typeof res.data.count === "number" ? res.data.count : 0);
          setLoading(false);
          return;
        } else {
          setCount(0);
          setLoading(false);
          return;
        }

        // Filter by time range if startDate/endDate are present
        if (startDate && endDate) {
          data = data.filter((item) => {
            const ts = new Date(item.timestamp);
            return ts >= startDate! && ts <= endDate!;
          });
        }

        // If apiPath has a type filter (e.g. ?type=THEFT), filter by type
        if (params.type) {
          data = data.filter((item) => item.type === params.type);
        }

        setCount(data.length);
      } catch (err: any) {
        setError("Failed to load data");
        setCount(null);
        console.error(`Error fetching ${title} count`, err);
      } finally {
        setLoading(false);
      }
    };

    fetchCount();
    // eslint-disable-next-line
  }, [range, customStart, customEnd, apiPath, title]);

  return (
    <div
      className={`bg-gradient-to-r ${color} text-white p-6 rounded-xl shadow-md flex flex-col gap-3 hover:scale-[1.02] transition-transform overflow-hidden`}
    >
      <div className="flex justify-between items-start gap-3 flex-wrap">
        <div className="flex-shrink-0">{getIcon(icon)}</div>

        <div className="flex flex-col sm:items-end w-full sm:w-auto max-w-full">
          <select
            value={range}
            onChange={(e) => setRange(e.target.value)}
            className="bg-white/20 text-white text-sm rounded px-2 py-1 mb-2 outline-none w-full sm:w-auto"
          >
            {timeOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>

          {range === "custom" && (
            <div className="flex flex-col sm:flex-row gap-2 w-full max-w-full">
              <input
                type="date"
                value={customStart}
                onChange={(e) => setCustomStart(e.target.value)}
                className="bg-white/10 text-white px-2 py-1 rounded outline-none w-full sm:w-1/2 min-w-0"
              />
              <input
                type="date"
                value={customEnd}
                onChange={(e) => setCustomEnd(e.target.value)}
                className="bg-white/10 text-white px-2 py-1 rounded outline-none w-full sm:w-1/2 min-w-0"
              />
            </div>
          )}
        </div>
      </div>

      <h3 className="text-sm mt-2">{title}</h3>
      <p className="text-3xl font-bold min-h-[2.5rem] flex items-center">
        {loading ? (
          <span className="animate-spin inline-block w-6 h-6 border-2 border-white border-t-transparent rounded-full"></span>
        ) : error ? (
          <span className="text-red-200 text-base">{error}</span>
        ) : count !== null ? (
          <CountUp end={count} duration={1} />
        ) : (
          <span className="text-gray-200 text-base">No data</span>
        )}
      </p>
    </div>
  );
};

export default StatCards;
