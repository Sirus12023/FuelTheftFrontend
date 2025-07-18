import React from "react";
import { useLocation, useNavigate } from "react-router-dom";

interface MonitoredBusCardProps {
  imageUrl: string;
  regNumber: string;
  driver: string;
  route: string;
  busId: string;
  fuelLevel?: number;
  sensorStatus?: "Active" | "Inactive";
  status: "normal" | "alert" | "offline";
  onClick?: () => void;
  selected?: boolean; // actively selected
}

const MonitoredBusCard: React.FC<MonitoredBusCardProps> = ({
  imageUrl = "src/assets/temp_bus.avif",
  regNumber,
  driver,
  route,
  busId,
  fuelLevel = 0,
  sensorStatus = "Active",
  status = "normal",
  onClick,
  selected = false,
}) => {
  const location = useLocation();
  const navigate = useNavigate();

  const isFuelTheftPage = location.pathname.includes("/fuel-theft");

  const handleClick = () => {
    if (onClick) {
      onClick();
    } else if (!isFuelTheftPage) {
      navigate(`/fuel-theft?bus=${busId}`);
    }
  };

  return (
    <div
      onClick={isFuelTheftPage ? undefined : handleClick}
      title={`Bus ID: ${busId}\nFuel Level: ${fuelLevel}%`}
      className={`group relative flex items-center border-2 rounded-2xl shadow transition-all w-full
        ${isFuelTheftPage ? "cursor-default" : "cursor-pointer"}
        ${
          selected
            ? "border-blue-600 ring-2 ring-blue-400 dark:ring-blue-300"
            : "border-gray-200 dark:border-gray-700"
        }
        bg-white text-gray-800 dark:bg-gray-900 dark:text-white
        hover:shadow-lg hover:border-blue-500 hover:scale-[1.02] dark:hover:border-blue-400
      `}
    >
      {/* Image */}
      <div className="w-32 h-32 overflow-hidden rounded-l-2xl">
        <img
          src={imageUrl}
          alt="Bus"
          className="w-full h-full object-cover transition-transform duration-300 ease-in-out group-hover:scale-110"
        />
      </div>

      {/* Text */}
      <div className="flex flex-col justify-between p-4 h-full flex-1">
        <div className="text-lg font-semibold">{regNumber}</div>
        <div className="text-sm text-gray-600 dark:text-gray-300">Driver: {driver}</div>
        <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">Route: {route}</div>
      </div>
    </div>
  );
};

export default MonitoredBusCard;
