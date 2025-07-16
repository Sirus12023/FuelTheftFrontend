import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import axios from "axios";
import { API_BASE_URL } from "../config";

import BusTimeFilter from "../components/BusTimeFilter";
import FuelChart from "../components/FuelChart";
<<<<<<< HEAD
import MonitoredBusCard from "../components/MonitoredBusCard";

const FuelTheft: React.FC = () => {
  const location = useLocation();
  const query = new URLSearchParams(location.search);
  const initialBus = query.get("bus");

  const [selectedBus, setSelectedBus] = useState<string | null>(null);
  const [search, setSearch] = useState("");
=======
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
    driver: "Sumit Sharma",
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
    driver: "Pawan Singh",
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
>>>>>>> d354f6165184b973dcd9ff24a44fe8ddfc03ce57
  const [timeRange, setTimeRange] = useState("Last 24 hours");

  const [showCustom, setShowCustom] = useState(false);
  const [startDate, setStartDate] = useState<Date | undefined>();
  const [endDate, setEndDate] = useState<Date | undefined>();
  const [showStartPicker, setShowStartPicker] = useState(true);
  const [showEndPicker, setShowEndPicker] = useState(true);

<<<<<<< HEAD
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
=======
  const selectedBus = busDetails.find((bus) => bus.busId === selectedBusId);

  useEffect(() => {
    const param = new URLSearchParams(location.search).get("bus");
    if (param) {
      setSelectedBusId(param);
      setSearch(param);
    }
  }, [location.search]);
>>>>>>> d354f6165184b973dcd9ff24a44fe8ddfc03ce57

  return (
    <div className="px-6 py-12 max-w-6xl mx-auto space-y-10 font-sans">
      {/* Header */}
      <div className="text-center space-y-2">
        <h2 className="text-4xl sm:text-5xl font-extrabold text-blue-900">
          🚨 Fuel Theft Monitoring
        </h2>
        <p className="text-gray-600 text-lg">
          Monitor your fleet’s fuel activity with real-time detection & analysis
        </p>
      </div>

      {/* Filter */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
<<<<<<< HEAD
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
=======
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
>>>>>>> d354f6165184b973dcd9ff24a44fe8ddfc03ce57
      </div>

      {/* No Bus Selected */}
      {!selectedBus && (
        <div className="bg-gradient-to-br from-white to-blue-50 border rounded-xl shadow-md text-center py-24 px-4 text-gray-600 animate-fade-in">
          <div className="mb-4">
            <svg className="h-16 w-16 text-blue-300 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.75 9.75h4.5M9.75 12.75h4.5M3.75 6h16.5M3.75 18h16.5M4.5 4.5v15M19.5 4.5v15" />
            </svg>
          </div>
          <h3 className="text-2xl font-semibold text-gray-700 mb-2">No Bus Selected</h3>
          <p className="max-w-md mx-auto text-base text-gray-600">
            Please select a <span className="font-semibold text-blue-600">bus number</span> and
            <span className="font-semibold text-blue-600"> time range</span> to view its analytics and events.
          </p>
        </div>
      )}

<<<<<<< HEAD

      {/* Bus Details */}
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
=======
      {/* Bus Details */}
      {selectedBus && (
        <div className="bg-gradient-to-br from-white via-blue-50 to-white p-6 rounded-xl shadow-xl border border-blue-100 transition-all duration-300">
          <div className="flex items-center gap-6">
            <img
              src={selectedBus.imageUrl}
              alt="Bus"
              className="w-32 h-32 rounded-xl object-cover border shadow"
            />
            <div className="space-y-2">
              <h3 className="text-xl font-bold text-blue-900">
                {selectedBus.regNumber}
              </h3>
              <p className="text-gray-700">👤 Driver: {selectedBus.driver}</p>
              <p className="text-gray-700">🛣️ Route: {selectedBus.route}</p>
              <p className="text-gray-700">⛽ Fuel Level: {selectedBus.fuelLevel} L</p>
              <span className={`inline-block px-3 py-1 text-xs font-medium rounded-full 
                ${selectedBus.sensorStatus === "Online"
                  ? "bg-green-100 text-green-700"
                  : "bg-red-100 text-red-700"}`}>
                🔧 Sensor: {selectedBus.sensorStatus}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Chart */}
      {selectedBus && <FuelChart />}
>>>>>>> d354f6165184b973dcd9ff24a44fe8ddfc03ce57
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
