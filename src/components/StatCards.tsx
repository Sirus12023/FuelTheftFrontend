// src/components/StatCards.tsx
import React, { useEffect, useState } from "react";
import { getDateRange } from "../utils/dateRangeFromTimeOption";
import axios from "axios";
import { API_BASE_URL } from "../config";
import { AlertCircle, Fuel, RefreshCcw } from "lucide-react";
import CountUp from "react-countup";

interface Props {
  title: string;
  icon: "alert" | "fuel" | "refuel";
  color: string;       // e.g. "from-red-500 to-red-700"
  apiPath: string;     // e.g. "/history?type=THEFT" or "/history?type=THEFT,DROP"
  timeRange: string;   // "today" | "yesterday" | "week" | "month" | "custom"
  customStart: string; // "YYYY-MM-DD"
  customEnd: string;   // "YYYY-MM-DD"
}

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

const StatCards: React.FC<Props> = ({
  title,
  icon,
  color,
  apiPath,
  timeRange,
  customStart,
  customEnd,
}) => {
  const [count, setCount] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    const fetchCount = async () => {
      // 1) Resolve date range
      let startDate: Date | undefined;
      let endDate: Date | undefined;

      if (timeRange === "custom") {
        if (!customStart || !customEnd) {
          setCount(null);
          return;
        }
        startDate = new Date(customStart);
        endDate = new Date(customEnd);
      } else {
        const rangeObj = getDateRange(timeRange);
        startDate = rangeObj?.startDate;
        endDate = rangeObj?.endDate;
      }

      setLoading(true);
      setError(null);

      try {
        // 2) Parse apiPath and build params
        let url = `${API_BASE_URL}${apiPath}`;
        const params: Record<string, any> = {};

        if (apiPath.includes("?")) {
          const [base, query] = apiPath.split("?");
          url = `${API_BASE_URL}${base}`;
          query.split("&").forEach((kv) => {
            const [key, value] = kv.split("=");
            if (key) params[key] = decodeURIComponent(value || "");
          });
        }

        // 3) Use backend’s expected date param names
        if (startDate) params.fromDate = startDate.toISOString();
        if (endDate) params.toDate = endDate.toISOString();

        const res = await axios.get<any>(url, { params });
        if (cancelled) return;

        // 4) Normalize response shapes
        let data: any[] = Array.isArray(res.data)
          ? res.data
          : Array.isArray(res.data?.data)
          ? res.data.data
          : [];

        // 5) Support comma-separated type filters (e.g. "THEFT,DROP")
        if (typeof params.type === "string" && params.type.trim()) {
          const wanted = params.type
            .split(",")
            .map((t: string) => t.trim().toUpperCase())
            .filter(Boolean);

          if (wanted.length) {
            data = data.filter((item) => {
              const t =
                (item?.type ?? item?.eventType ?? "")
                  .toString()
                  .toUpperCase();
              return wanted.includes(t);
            });
          }
        }

        // 6) Prefer server-provided count, else use filtered array length
        const serverCount =
          res?.data && typeof res.data.count === "number"
            ? res.data.count
            : undefined;

        setCount(typeof serverCount === "number" ? serverCount : data.length);
      } catch (err) {
        if (cancelled) return;
        console.error(`Error fetching ${title} count`, err);
        setError("Failed to load data");
        setCount(null);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchCount();
    return () => {
      cancelled = true;
    };
  }, [apiPath, title, timeRange, customStart, customEnd]);

  return (
    <div
      className={`bg-gradient-to-r ${color} text-white p-6 rounded-xl shadow-md flex flex-col gap-3 hover:scale-[1.02] transition-transform overflow-hidden`}
    >
      <div className="flex justify-between items-start gap-3 flex-wrap">
        <div className="flex-shrink-0">{getIcon(icon)}</div>
        <div className="flex flex-col sm:items-end w-full sm:w-auto max-w-full" />
      </div>

      <h3 className="text-sm mt-2">{title}</h3>
      <p className="text-3xl font-bold min-h-[2.5rem] flex items-center">
        {loading ? (
          <span className="animate-spin inline-block w-6 h-6 border-2 border-white border-t-transparent rounded-full" />
        ) : error ? (
          <span className="text-red-200 text-base">{error}</span>
        ) : count !== null ? (
          <CountUp end={count} duration={0.8} />
        ) : (
          <span className="text-gray-200 text-base">No data</span>
        )}
      </p>
    </div>
  );
};

export default StatCards;
