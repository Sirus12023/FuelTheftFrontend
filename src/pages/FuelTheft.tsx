// FuelTheft.tsx
import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import BusTimeFilter from "../components/BusTimeFilter";
import FuelChart from "../components/FuelChart";
import bus1 from "../assets/bus1.jpg";


const busDetails = [
  {
    busId: "Bus1001",
    imageUrl: bus1, 
    regNumber: "UP32AB1234",
    driver: "Ravi Kumar",
    route: "Route 1",
    fuelLevel: 76,
    sensorStatus: "Online",
  },
  {
    busId: "Bus1002",
    imageUrl: bus1,
    regNumber: "MH12CD5678",
    driver: "Sunita Sharma",
    route: "Route 2",
    fuelLevel: 83,
    sensorStatus: "Offline",
  },
  {
    busId: "Bus1003",
    imageUrl: bus1,
    regNumber: "DL8CAF9876",
    driver: "Amit Verma",
    route: "Route 3",
    fuelLevel: 64,
    sensorStatus: "Online",
  },
  {
    busId: "Bus1004",
    imageUrl: bus1,
    regNumber: "RJ14XY6543",
    driver: "Pooja Singh",
    route: "Route 4",
    fuelLevel: 28,
    sensorStatus: "Online",
  },
  {
    busId: "Bus1005",
    imageUrl: bus1,
    regNumber: "KA03MN1122",
    driver: "Rajesh Meena",
    route: "Route 5",
    fuelLevel: 58,
    sensorStatus: "Offline",
  },
];

const FuelTheft: React.FC = () => {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const initialBus = queryParams.get("bus");

  const [selectedBusId, setSelectedBusId] = useState<string | null>(initialBus);
  const [search, setSearch] = useState(initialBus || "");
  const [timeRange, setTimeRange] = useState("Last 24 hours");

  const [showCustom, setShowCustom] = useState(false);
  const [startDate, setStartDate] = useState<Date | undefined>();
  const [endDate, setEndDate] = useState<Date | undefined>();
  const [showStartPicker, setShowStartPicker] = useState(true);
  const [showEndPicker, setShowEndPicker] = useState(true);

  const selectedBus = busDetails.find(bus => bus.busId === selectedBusId);

  useEffect(() => {
    const param = new URLSearchParams(location.search).get("bus");
    if (param) {
      setSelectedBusId(param);
      setSearch(param);
    }
  }, [location.search]);

  return (
    <div className="px-6 py-8 max-w-5xl mx-auto space-y-10">
      <h2 className="text-3xl font-bold text-gray-800">🚨 Fuel Theft Monitoring</h2>

      <BusTimeFilter
        busSearch={search}
        setBusSearch={setSearch}
        selectedBusId={selectedBusId}
        setSelectedBusId={setSelectedBusId}
        timeRange={timeRange}
        setTimeRange={setTimeRange}
        showCustom={showCustom}
        setShowCustom={setShowCustom}
        startDate={startDate}
        setStartDate={setStartDate}
        endDate={endDate}
        setEndDate={setEndDate}
        showStartPicker={showStartPicker}
        setShowStartPicker={setShowStartPicker}
        showEndPicker={showEndPicker}
        setShowEndPicker={setShowEndPicker}
      />

      {selectedBus && (
        <div className="bg-white p-6 rounded-xl shadow border space-y-4">
          <div className="flex items-center gap-6">
            <img
              src={selectedBus.imageUrl}
              alt="Bus"
              className="w-32 h-32 rounded-lg object-cover border"
            />
            <div className="space-y-1">
              <p className="text-lg font-semibold text-gray-800">{selectedBus.regNumber}</p>
              <p className="text-gray-600">Driver: {selectedBus.driver}</p>
              <p className="text-gray-600">Route: {selectedBus.route}</p>
              <p className="text-gray-600">Fuel Level: {selectedBus.fuelLevel}L</p>
              <span className={`inline-block text-xs font-medium px-2 py-1 rounded 
                ${selectedBus.sensorStatus === "Online" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                Sensor: {selectedBus.sensorStatus}
              </span>
            </div>
          </div>
        </div>
      )}

      {selectedBus && <FuelChart />}
    </div>
  );
};

export default FuelTheft;
