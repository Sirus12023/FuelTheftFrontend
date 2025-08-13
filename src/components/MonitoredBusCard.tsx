import React from "react";
import { useLocation, useNavigate } from "react-router-dom";

interface MonitoredBusCardProps {
  imageUrl?: string;
  regNumber: string;                 // registrationNo from backend
  driver: string;
  route: string;
  busId: string;                     // internal id
  fuelLevel?: number | string;       // be lenient; backend may send string
  status: "normal" | "alert" | "offline";
  onClick?: () => void;
  selected?: boolean;
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
}) => {
  const location = useLocation();
  const navigate = useNavigate();

  // Only auto-navigate from places other than the fuel theft page
  const isFuelTheftPage = location.pathname === "/fuel-theft";

  const handleClick = () => {
    if (onClick) {
      onClick();
    } else if (!isFuelTheftPage) {
      // IMPORTANT: FuelTheft expects ?bus=<registrationNo>
      navigate(`/fuel-theft?bus=${encodeURIComponent(regNumber)}`);
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
  const fuelDisplay =
    Number.isFinite(fuelNum) ? fuelNum.toFixed(1) : "0.0";

  return (
    <div
      role={onClick || !isFuelTheftPage ? "button" : undefined}
      tabIndex={onClick || !isFuelTheftPage ? 0 : -1}
      onClick={isFuelTheftPage ? undefined : handleClick}
      onKeyDown={(e) => {
        if ((onClick || !isFuelTheftPage) && (e.key === "Enter" || e.key === " ")) {
          e.preventDefault();
          handleClick();
        }
      }}
      aria-label={`Bus ${regNumber}, driver ${driver}, route ${route}, fuel ${fuelDisplay} liters, status ${status}`}
      className={`group relative flex items-center border-2 rounded-2xl shadow transition-all w-full
        ${onClick || !isFuelTheftPage ? "cursor-pointer" : "cursor-default"}
        ${selected ? "border-blue-600 ring-2 ring-blue-400 dark:ring-blue-300" : "border-gray-200 dark:border-gray-700"}
        bg-white text-gray-800 dark:bg-gray-900 dark:text-white
        hover:shadow-lg hover:border-blue-500 hover:scale-[1.02] dark:hover:border-blue-400
      `}
    >
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
        <div className="text-lg font-semibold">{regNumber}</div>
        <div className="text-sm text-gray-600 dark:text-gray-300">Driver: {driver}</div>
        <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">Route: {route}</div>

        {/* Status + Fuel */}
        <div className="flex justify-between items-center mt-3">
          <div className="text-xs text-blue-600 dark:text-blue-300 font-medium">
            ⛽ Fuel: {fuelDisplay} L
          </div>
          <div className={`px-2 py-0.5 text-[10px] rounded-full font-bold uppercase ${getStatusBadge()}`}>
            {status}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MonitoredBusCard;
