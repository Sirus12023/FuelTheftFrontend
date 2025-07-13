// FuelTheft.tsx
import React, { useState } from "react";
import BusSelector from "../components/BusSelector";
import DateRangePicker from "../components/DateRangePicker";
import FuelChart from "../components/FuelChart";

const FuelTheft: React.FC = () => {
  const [selectedBus, setSelectedBus] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [timeRange, setTimeRange] = useState("Today");
  const [showCustom, setShowCustom] = useState(false);
  const [startDate, setStartDate] = useState<Date | undefined>();
  const [endDate, setEndDate] = useState<Date | undefined>();
  const [showStartPicker, setShowStartPicker] = useState(true);
  const [showEndPicker, setShowEndPicker] = useState(true);

  return (
    <div className="px-6 py-8 max-w-5xl mx-auto space-y-10">
      <h2 className="text-3xl font-bold text-gray-800">🚨 Fuel Theft Monitoring</h2>

      <BusSelector
        search={search}
        setSearch={setSearch}
        selectedBus={selectedBus}
        setSelectedBus={setSelectedBus}
      />

      {selectedBus && (
        <DateRangePicker
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
      )}

      {selectedBus && <FuelChart />}
    </div>
  );
};

export default FuelTheft;
