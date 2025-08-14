// src/components/MonitoredBusCard.tsx
import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { AlertTriangle } from "lucide-react";

interface MonitoredBusCardProps {
  imageUrl?: string;
  regNumber: string;                 // registrationNo from backend
  driver: string;
  route: string;
  busId: string;                     // internal id
  fuelLevel?: number | string;       //  backend may send string
  status: "normal" | "alert" | "offline";
  onClick?: () => void;
  selected?: boolean;
  hasTheft?: boolean;                // highlight if theft in current range
}

const MonitoredBusCard: React.FC<MonitoredBusCardProps> = ({
  imageUrl = "/src/assets/temp_bus.avif",
  regNumber,
  driver,
  route,
  busId,
  fuelLevel = 0,
  status = "normal",
  onClick,
  selected = false,
  hasTheft = false,
}) => {
  const location = useLocation();
  const navigate = useNavigate();

  // Only auto-navigate from places other than the fuel theft page
  const isFuelTheftPage = location.pathname === "/fuel-theft";

  const go = () => {
    if (onClick) {
      onClick();
    } else if (!isFuelTheftPage) {
      // FuelTheft expects ?bus=<registrationNo>
      navigate(`/fuel-theft?bus=${encodeURIComponent(regNumber)}`);
    }
  };

  const handleClick = () => go();

  const handleKeyDown: React.KeyboardEventHandler<HTMLDivElement> = (e) => {
    if ((onClick || !isFuelTheftPage) && (e.key === "Enter" || e.key === " ")) {
      e.preventDefault();
      go();
    }
  };

  const getStatusBadge = () => {
    switch (status) {
      case "alert":
        return "bg-red-500 text-white";
      case "offline":
        return "bg-gray-500 text-white";
      case "normal":
      default:
        return "bg-green-500 text-white";
    }
  };

  // Safe fuel formatting
  const fuelNum =
    typeof fuelLevel === "string" ? Number(fuelLevel) : (fuelLevel as number);
  const fuelDisplay = Number.isFinite(fuelNum) ? fuelNum.toFixed(1) : "0.0";

  // Visual emphasis if theft present
  const theftClasses = hasTheft
    // ? "border-red-500 ring-2 ring-red-300/60 dark:ring-red-400/50 bg-red-50/40 dark:bg-red-900/20"
    // : "";

  const selectedClasses = selected
    ? "border-blue-600 ring-2 ring-blue-400/60 dark:ring-blue-300/60"
    : "";

  return (
    <div
      role={onClick || !isFuelTheftPage ? "button" : undefined}
      aria-pressed={selected || undefined}
      tabIndex={onClick || !isFuelTheftPage ? 0 : -1}
      onClick={isFuelTheftPage ? undefined : handleClick}
      onKeyDown={handleKeyDown}
      aria-label={`Bus ${regNumber}, driver ${driver}, route ${route}, fuel ${fuelDisplay} liters, status ${status}${
        hasTheft ? ", theft detected in range" : ""
      }`}
      data-theft={hasTheft ? "true" : "false"}
      className={[
        "group relative flex items-center border-2 rounded-2xl shadow transition-all w-full",
        onClick || !isFuelTheftPage ? "cursor-pointer" : "cursor-default",
        "bg-white text-gray-800 dark:bg-gray-900 dark:text-white",
        "hover:shadow-lg hover:scale-[1.02]",
        // base border
        "border-gray-200 dark:border-gray-700",
        // emphasis states
        theftClasses,
        selected && !hasTheft ? selectedClasses : "",
        // subtle hover border (don’t override theft red)
        !hasTheft ? "hover:border-blue-500 dark:hover:border-blue-400" : "",
        // nice focus ring for keyboard users
        "focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-blue-500 dark:focus-visible:ring-blue-400",
      ].join(" ")}
    >
     
      {/* Theft badge */}
      {hasTheft && (
        <div
          className="absolute right-2 top-2 z-10 inline-flex items-center gap-1 rounded-full px-2 py-1 text-[11px] font-semibold
                     bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-200 shadow"
          title="Theft detected in selected time range"
        >
          <AlertTriangle className="w-3.5 h-3.5" />
          Theft
        </div>
      )}

      {/* Bus Image */}
      <div className="w-32 h-32 overflow-hidden rounded-l-2xl shrink-0">
        <img
          src={imageUrl}
          alt={`Bus ${regNumber}`}
          className="w-full h-full object-cover transition-transform duration-300 ease-in-out group-hover:scale-110"
          loading="lazy"
        />
      </div>

      {/* Bus Info */}
      <div className="flex flex-col justify-between p-4 h-full flex-1">
        <div
          className={`text-lg font-semibold ${
            hasTheft ? "text-red-600 dark:text-red-300" : ""
          }`}
          title={hasTheft ? "Theft detected in selected time range" : undefined}
        >
          {regNumber}
        </div>

        <div className="text-sm text-gray-600 dark:text-gray-300">
          Driver: {driver}
        </div>
        <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
          Route: {route}
        </div>

        {/* Status + Fuel */}
        <div className="flex justify-between items-center mt-3">
          <div className="text-xs text-blue-600 dark:text-blue-300 font-medium">
            ⛽ Fuel: {fuelDisplay} L
          </div>
          <div
            className={`px-2 py-0.5 text-[10px] rounded-full font-bold uppercase ${getStatusBadge()}`}
          >
            {status}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MonitoredBusCard;
