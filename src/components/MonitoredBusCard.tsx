// components/MonitoredBusCard.tsx
import React from "react";
import { useNavigate } from "react-router-dom";

interface MonitoredBusCardProps {
  imageUrl: string;
  regNumber: string;
  driver: string;
  route: string;
  busId: string;
  fuelLevel?: number;
  sensorStatus?: "Active" | "Inactive";
}

const MonitoredBusCard: React.FC<MonitoredBusCardProps> = ({
  imageUrl,
  regNumber,
  driver,
  route,
  busId,
  fuelLevel = 0,
  sensorStatus = "Active",
}) => {
  const navigate = useNavigate();

  const handleClick = () => {
    const params = new URLSearchParams({
    bus: busId,
    regNumber,
    driver,
    route,
    imageUrl,
  });
    navigate(`/fuel-theft?${params.toString()}`);
  };

  const badgeColor =
    sensorStatus === "Active" ? "bg-green-500" : "bg-gray-400";

  return (
    <div
      onClick={handleClick}
      title={`Bus ID: ${busId}\nFuel Level: ${fuelLevel}%`}
      className="group relative flex items-center border-2 border-gray-200 bg-white rounded-2xl shadow transition-all hover:shadow-lg hover:border-blue-500 hover:scale-[1.02] cursor-pointer w-full max-w-xl"
    >
      {/* Image Section */}
      <div className="w-32 h-32 overflow-hidden rounded-l-2xl">
        <img
          src={imageUrl}
          alt="Bus"
          className="w-full h-full object-cover transition-transform duration-300 ease-in-out group-hover:scale-110"
        />
      </div>

      {/* Info Section */}
      <div className="flex flex-col justify-between p-4 h-full flex-1">
        <div className="text-lg font-semibold text-gray-800">{regNumber}</div>
        <div className="text-gray-600">Driver: {driver}</div>
        <div className="text-gray-500 text-sm mt-1">Route: {route}</div>
      </div>

      {/* Sensor Badge */}
      <span
        className={`absolute top-2 right-2 text-xs text-white px-2 py-1 rounded-full shadow ${badgeColor}`}
      >
        {sensorStatus}
      </span>
    </div>
  );
};

export default MonitoredBusCard;
