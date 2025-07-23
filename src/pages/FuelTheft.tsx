// pages/FuelTheft.tsx
import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import axios from "axios";
import { API_BASE_URL } from "../config";

import BusTimeFilter from "../components/BusTimeFilter";
import FuelChart from "../components/FuelChart";
import MonitoredBusCard from "../components/MonitoredBusCard";
import { getDateRange } from "../utils/dateRangeFromTimeOption";

// Define BusDetailsResponse type
type BusDetailsResponse = {
  registrationNo: string;
  driver?: string;
  route?: string;
  currentFuelLevel?: number;
  status?: string;
  readings: Array<{
    eventType?: string;
    [key: string]: any;
  }>;
};


const FuelTheft: React.FC = () => {
  const location = useLocation();
  const query = new URLSearchParams(location.search);
  const initialBus = query.get("bus");

  const [selectedBus, setSelectedBus] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [timeRange, setTimeRange] = useState("Last 24 hours");
  const [showCustom, setShowCustom] = useState(false);
  const [startDate, setStartDate] = useState<Date>();
  const [endDate, setEndDate] = useState<Date>();
  const [showStartPicker, setShowStartPicker] = useState(true);
  const [showEndPicker, setShowEndPicker] = useState(true);

  const [fuelData, setFuelData] = useState<any[]>([]);
  const [events, setEvents] = useState<any[]>([]);
  const [busDetails, setBusDetails] = useState<any>(null);

  useEffect(() => {
    if (initialBus) {
      setSelectedBus(initialBus);
      setSearch(initialBus);
    }
  }, [initialBus]);

  useEffect(() => {
  if (!selectedBus) return;

  const { startDate: computedStart, endDate: computedEnd } = getDateRange(timeRange);

  const fetchBusData = async () => {
    try {
      const res = await axios.get<BusDetailsResponse>(
        `${API_BASE_URL}/buses/${selectedBus}/details`,
        {
          params: {
            timeRange,
            startDate: (showCustom ? startDate : computedStart)?.toISOString(),
            endDate: (showCustom ? endDate : computedEnd)?.toISOString(),
          },
        }
      );

      const readings = (res.data.readings || []).map((r: any) => ({
        ...r,
        eventType: r.eventType?.toUpperCase() || "NORMAL",
      }));

      setFuelData(readings);
      setEvents(readings.filter((r: any) => r.eventType !== "NORMAL"));
      setBusDetails(res.data);
    } catch (error) {
      console.error("Error fetching bus fuel data:", error);
    }
  };

  fetchBusData();
}, [selectedBus, timeRange, startDate, endDate, showCustom]);


  return (
    <div className="px-6 py-12 max-w-6xl mx-auto space-y-10 font-sans text-gray-800 dark:text-gray-100" >
      {/* Header */}
      <div className="text-center space-y-2">
        <h2 className="text-4xl sm:text-5xl font-extrabold text-blue-900 dark:text-blue-200">
          🚨 Fuel Theft Monitoring
        </h2>
        <p className="text-lg text-gray-600 dark:text-gray-300">
          Monitor your fleet’s fuel activity with real-time detection & analysis
        </p>
      </div>

      {/* Filter */}
      <div className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-2xl shadow-lg p-6">
        <BusTimeFilter
          busSearch={search}
          setBusSearch={setSearch}
          selectedBusId={selectedBus}
          setSelectedBusId={setSelectedBus}
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
      </div>

      {/* Placeholder */}
      {!selectedBus && (
        <div className="bg-gradient-to-br from-white to-blue-50 dark:from-gray-800 dark:to-gray-700 border dark:border-gray-600 rounded-xl shadow-md text-center py-24 px-4 text-gray-600 dark:text-gray-300 animate-fade-in">
          <div className="mb-4">
            <svg className="h-16 w-16 text-blue-300 mx-auto dark:text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.75 9.75h4.5M9.75 12.75h4.5M3.75 6h16.5M3.75 18h16.5M4.5 4.5v15M19.5 4.5v15" />
            </svg>
          </div>
          <h3 className="text-2xl font-semibold text-gray-700 dark:text-gray-100 mb-2">No Bus Selected</h3>
          <p className="max-w-md mx-auto text-base">
            Please select a <span className="font-semibold text-blue-600 dark:text-blue-400">bus number</span> and
            <span className="font-semibold text-blue-600 dark:text-blue-400"> time range</span> to view analytics.
          </p>
        </div>
      )}

      {/* Bus Info */}
      {selectedBus && busDetails && (
        <MonitoredBusCard
          busId={selectedBus}
          regNumber={busDetails.registrationNo}
          driver={busDetails.driver || "Unassigned"}
          route={busDetails.route || "Unknown"}
          fuelLevel={busDetails.currentFuelLevel}
          status={busDetails.status || "normal"}
          imageUrl="/src/assets/temp_bus.avif"
        />
      )}

      {/* Fuel Chart */}
      {selectedBus && (
        <FuelChart fuelData={fuelData} busId={selectedBus} />
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
