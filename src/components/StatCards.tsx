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
  timeRange: string;
  customStart: string;
  customEnd: string;
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
    const fetchCount = async () => {
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
        let url = `${API_BASE_URL}${apiPath}`;
        const params: Record<string, any> = {};

        if (apiPath.includes("?")) {
          const [base, query] = apiPath.split("?");
          url = `${API_BASE_URL}${base}`;
          query.split("&").forEach((kv) => {
            const [key, value] = kv.split("=");
            params[key] = value;
          });
        }

        if (startDate) params.startDate = startDate.toISOString();
        if (endDate) params.endDate = endDate.toISOString();

        const res = await axios.get<{ count?: number; data?: any[] }>(url, { params });

        // Handle various response shapes
        let data: any[] = [];

        if (Array.isArray(res.data)) {
          data = res.data;
        } else if (res.data && Array.isArray(res.data.data)) {
          data = res.data.data;
        } else if ("count" in res.data) {
          setCount(typeof res.data.count === "number" ? res.data.count : 0);
          return;
        } else {
          setCount(0);
          return;
        }

        // Filter by timestamp
        if (startDate && endDate) {
          data = data.filter((item) => {
            const ts = new Date(item.timestamp);
            return !isNaN(ts.getTime()) && ts >= startDate && ts <= endDate;
          });
        }

        // Filter by alert type if needed
        if (params.type) {
          data = data.filter((item) => item.type === params.type);
        }

        setCount(data.length);
      } catch (err) {
        console.error(`Error fetching ${title} count`, err);
        setError("Failed to load data");
        setCount(null);
      } finally {
        setLoading(false);
      }
    };

    fetchCount();
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
          <CountUp end={count} duration={1} />
        ) : (
          <span className="text-gray-200 text-base">No data</span>
        )}
      </p>
    </div>
  );
};

export default StatCards;
