// FuelTheft.tsx
import React, { useEffect,useState } from "react";
import { useLocation } from "react-router-dom";
import BusTimeFilter from "../components/BusTimeFilter";
import FuelChart from "../components/FuelChart";

const FuelTheft: React.FC = () => {
    const location = useLocation();
  const query = new URLSearchParams(location.search);
  const initialBus = query.get("bus");
  
  const [selectedBus, setSelectedBus] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [timeRange, setTimeRange] = useState("Last 24 hours");

  // New states for custom date range
  const [showCustom, setShowCustom] = useState(false);
  const [startDate, setStartDate] = useState<Date | undefined>();
  const [endDate, setEndDate] = useState<Date | undefined>();
  const [showStartPicker, setShowStartPicker] = useState(true);
  const [showEndPicker, setShowEndPicker] = useState(true);

  return (
    <div className="px-6 py-8 max-w-5xl mx-auto space-y-10">
      <h2 className="text-3xl font-bold text-gray-800">🚨 Fuel Theft Monitoring</h2>

      <BusTimeFilter
        busSearch={search}
        setBusSearch={setSearch}
        selectedBus={selectedBus}
        setSelectedBus={setSelectedBus}
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

    

      {/* Show fuel chart only after a valid bus is selected */}
      {selectedBus && <FuelChart />}
    </div>
  );
};

export default FuelTheft;
