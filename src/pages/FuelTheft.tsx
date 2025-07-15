import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import axios from "axios";
import { API_BASE_URL } from "../config";

import BusTimeFilter from "../components/BusTimeFilter";
import FuelChart from "../components/FuelChart";
import MonitoredBusCard from "../components/MonitoredBusCard";

const FuelTheft: React.FC = () => {
  const location = useLocation();
  const query = new URLSearchParams(location.search);
  const initialBus = query.get("bus");

  const [selectedBus, setSelectedBus] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [timeRange, setTimeRange] = useState("Last 24 hours");

  const [showCustom, setShowCustom] = useState(false);
  const [startDate, setStartDate] = useState<Date | undefined>();
  const [endDate, setEndDate] = useState<Date | undefined>();
  const [showStartPicker, setShowStartPicker] = useState(true);
  const [showEndPicker, setShowEndPicker] = useState(true);

  const [fuelData, setFuelData] = useState([]);
  const [events, setEvents] = useState([]);
  const [busDetails, setBusDetails] = useState<any>(null);

  // Apply initial bus from URL
  useEffect(() => {
    if (initialBus) {
      setSelectedBus(initialBus);
    }
  }, [initialBus]);

  // Fetch bus fuel + info data
  useEffect(() => {
    if (!selectedBus) return;

    const fetchBusData = async () => {
      try {
        const res = await axios.get(`${API_BASE_URL}/buses/${selectedBus}/details`, {
          params: {
            timeRange,
            startDate: startDate?.toISOString(),
            endDate: endDate?.toISOString(),
          },
        });

        const data = res.data;

        const readings = (data.readings || []).map((r: any) => ({
          ...r,
          eventType: r.eventType?.toUpperCase() || "NORMAL",
        }));

        setFuelData(readings);
        setEvents(readings.filter((r: any) => r.eventType !== "NORMAL"));
        setBusDetails(data);
      } catch (error) {
        console.error("Error fetching bus fuel data:", error);
      }
    };

    fetchBusData();
  }, [selectedBus, timeRange, startDate, endDate]);

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

      {selectedBus && busDetails && (
        <div className="w-full">
        <MonitoredBusCard
          busId={selectedBus}
          regNumber={busDetails.registrationNo}
          driver={busDetails.driver || "Unassigned"}
          route={busDetails.route || "Unknown"}
          fuelLevel={busDetails.currentFuelLevel}
          status={"normal"} // you can change this to actual if backend adds it
          imageUrl="/src/assets/temp_bus.avif"
        />
        </div>
      )}

      {selectedBus && (
        <FuelChart fuelData={fuelData} events={events} busId={selectedBus} />
      )}
    </div>
  );
};

export default FuelTheft;





// // FuelTheft.tsx
// import React, { useEffect, useState } from "react";
// import { useLocation } from "react-router-dom";
// import BusTimeFilter from "../components/BusTimeFilter";
// import FuelChart from "../components/FuelChart";
// import axios from "axios";
// import { API_BASE_URL } from "../config";


// const FuelTheft: React.FC = () => {
//   const location = useLocation();
//   const query = new URLSearchParams(location.search);
//   const initialBus = query.get("bus");

//   const [selectedBus, setSelectedBus] = useState<string | null>(null);
//   const [search, setSearch] = useState("");
//   const [timeRange, setTimeRange] = useState("Last 24 hours");

//   // Date range controls
//   const [showCustom, setShowCustom] = useState(false);
//   const [startDate, setStartDate] = useState<Date | undefined>();
//   const [endDate, setEndDate] = useState<Date | undefined>();
//   const [showStartPicker, setShowStartPicker] = useState(true);
//   const [showEndPicker, setShowEndPicker] = useState(true);

//   // Data states
//   const [fuelData, setFuelData] = useState([]);
//   const [events, setEvents] = useState([]);

//   // Apply initial bus from URL
//   useEffect(() => {
//     if (initialBus) {
//       setSelectedBus(initialBus);
//     }
//   }, [initialBus]);

//   // Fetch fuel data when bus is selected
//  useEffect(() => {
//   if (!selectedBus) return;

//   const fetchBusData = async () => {
//   try {
//     const params: any = {};
//     if (startDate) params.start = startDate.toISOString();
//     if (endDate) params.end = endDate.toISOString();

//     // const res = await axios.get(`${API_BASE_URL}/buses/${selectedBus}/details`, { params });
//     const res = await axios.get(`${API_BASE_URL}/buses/${selectedBus}/details`, {
//   params: {
//     timeRange,
//     startDate: startDate?.toISOString(),
//     endDate: endDate?.toISOString(),
//   },
// });

//     const rawReadings = res.data.readings || [];

//     const readings = rawReadings.map((r: any) => ({
//       ...r,
//       eventType: r.eventType?.toUpperCase(),
//     }));

//     setFuelData(readings);
//     setEvents(readings.filter((r: any) => r.eventType && r.eventType !== "NORMAL"));
//   } catch (error) {
//     console.error("Error fetching bus fuel data:", error);
//   }
// };


//   fetchBusData();
// }, [selectedBus, timeRange, startDate, endDate]);


//   return (
//     <div className="px-6 py-8 max-w-5xl mx-auto space-y-10">
//       <h2 className="text-3xl font-bold text-gray-800">🚨 Fuel Theft Monitoring</h2>

//       <BusTimeFilter
//         busSearch={search}
//         setBusSearch={setSearch}
//         selectedBus={selectedBus}
//         setSelectedBus={setSelectedBus}
//         timeRange={timeRange}
//         setTimeRange={setTimeRange}
//         showCustom={showCustom}
//         setShowCustom={setShowCustom}
//         startDate={startDate}
//         setStartDate={setStartDate}
//         endDate={endDate}
//         setEndDate={setEndDate}
//         showStartPicker={showStartPicker}
//         setShowStartPicker={setShowStartPicker}
//         showEndPicker={showEndPicker}
//         setShowEndPicker={setShowEndPicker}
//       />

//       {/* Show chart only when bus is selected */}
//       {selectedBus && (
//         <FuelChart
//           fuelData={fuelData}
//           events={events}
//           busId={selectedBus}
//         />
//       )}
//     </div>
//   );
// };

// export default FuelTheft;
