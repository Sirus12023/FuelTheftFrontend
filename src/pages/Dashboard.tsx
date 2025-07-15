import React from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import MonitoredBusCard from "../components/MonitoredBusCard";
import bus1 from "../assets/bus1.jpg";


const Dashboard: React.FC = () => {
  const stats = [
    {
      title: "Total Buses",
      value: 5,
      icon: "🚌",
      color: "from-blue-500 to-blue-700",
    },
    {
      title: "Ongoing Alerts",
      value: 5,
      icon: "🚨",
      color: "from-red-500 to-red-700",
    },
    {
      title: "Fuel Theft Events",
      value: 2,
      icon: "🔻",
      color: "from-yellow-500 to-yellow-700",
    },
    {
      title: "Refueling Events",
      value: 3,
      icon: "⛽",
      color: "from-green-500 to-green-700",
    },
  ];

  const mockFuelData = [
    { time: "10:00", fuelLevel: 90 },
    { time: "10:30", fuelLevel: 88 },
    { time: "11:00", fuelLevel: 85 },
    { time: "11:30", fuelLevel: 70 },
    { time: "12:00", fuelLevel: 68 },
    { time: "12:30", fuelLevel: 92 },
    { time: "13:00", fuelLevel: 89 },
  ];

  const mockEvents = [
    { time: "10:45", type: "Drop", description: "Sudden fuel drop detected" },
    { time: "11:30", type: "Theft", description: "Potential theft detected" },
    { time: "12:30", type: "Refuel", description: "Refueling completed" },
  ];

  const buses = [
    { id: "Bus 1001", route: "Route 20", fuelLevel: 76, status: "normal" },
    { id: "Bus 1004", route: "Route 10", fuelLevel: 42, status: "alert" },
    { id: "Bus 1005", route: "Route 15", fuelLevel: 28, status: "alert" },
    { id: "Bus 1020", route: "Route 5", fuelLevel: 87, status: "normal" },
  ];

  const [selectedBus, setSelectedBus] = React.useState<string | null>(null);

  return (
    <div className="space-y-10 px-6 py-8 max-w-7xl mx-auto">
   {/* Intro Section with Styling */}
<section className="relative overflow-hidden bg-gradient-to-br from-blue-50 to-white rounded-2xl p-8 shadow border border-blue-100">
  <div className="absolute inset-y-0 right-0 w-32 opacity-10 pointer-events-none">
    <img
      src="/bus1.jpg"
      alt="Bus Illustration"
      className="h-full w-full object-cover rounded-r-2xl"
    />
  </div>

  <div className="relative z-10 space-y-3">
    <h1 className="text-4xl font-extrabold text-blue-900 flex items-center gap-2">
      🛡️ FuelSafe Dashboard
    </h1>

    <p className="text-gray-700 text-base leading-relaxed max-w-2xl">
      Welcome to <span className="font-semibold text-blue-600">FuelSafe</span> — your centralized platform
      to monitor fuel usage, detect theft, and track refueling activities across your fleet in real-time.
    </p>

    <div className="flex flex-wrap gap-4 mt-4">
      <span className="bg-blue-100 text-blue-700 text-sm font-medium px-3 py-1 rounded-full">
        🔍 Real-time Monitoring
      </span>
      <span className="bg-yellow-100 text-yellow-800 text-sm font-medium px-3 py-1 rounded-full">
        ⚠️ Anomaly Detection
      </span>
      <span className="bg-green-100 text-green-800 text-sm font-medium px-3 py-1 rounded-full">
        ✅ 5 Buses Under Observation
      </span>
    </div>

    <p className="mt-4 text-sm text-gray-600 max-w-lg">
      We're currently in the testing phase with 5 buses actively monitored.
      Our system continuously analyzes fuel consumption and sensor status to ensure data integrity.
      Scaling to full fleet support is planned in the next deployment.
    </p>
  </div>
</section>

      {/* Overview Heading */}
      <h2 className="text-2xl font-bold text-gray-800">📊 Dashboard Overview</h2>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, idx) => (
          <div
            key={idx}
            className={`bg-gradient-to-r ${stat.color} text-white p-6 rounded-xl shadow-md flex items-center gap-4 hover:scale-[1.02] transition-transform`}
          >
            <div className="text-4xl">{stat.icon}</div>
            <div>
              <h3 className="text-sm">{stat.title}</h3>
              <p className="text-2xl font-bold">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>


     {/* Bus Overview Cards */}
<div>
  <h3 className="text-2xl font-semibold mb-4 text-gray-700">🚌 Monitored Buses</h3>
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
    {[
      {
        imageUrl: bus1,
        regNumber: "UP32AB1234",
        driver: "Ravi Kumar",
        route: "Route 1",
        busId: "Bus1001",
        
      },
      {
        imageUrl: bus1,
        regNumber: "MH12CD5678",
        driver: "Sunita Sharma",
        route: "Route 2",
        busId: "Bus1002",
      },
      {
        imageUrl: bus1,
        regNumber: "DL8CAF9876",
        driver: "Amit Verma",
        route: "Route 3",
        busId: "Bus1003",
      },
      {
        imageUrl: bus1,
        regNumber: "RJ14XY6543",
        driver: "Pooja Singh",
        route: "Route 4",
        busId: "Bus1004",
      },
      {
        imageUrl: bus1,
        regNumber: "KA03MN1122",
        driver: "Rajesh Meena",
        route: "Route 5",
        busId: "Bus1005",
      },
    ].map((bus, idx) => (
      <MonitoredBusCard key={idx} {...bus} />
    ))}
  </div>
</div>


      {!selectedBus && (
        <div className="mt-10 text-gray-500 text-sm italic">
          Click a bus to view its fuel level graph and recent events.
        </div>
      )}

      {/* Fuel Level Graph & Events */}
      {selectedBus && (
        <div className="mt-10 space-y-8">
          <div className="bg-white p-6 rounded-2xl shadow border">
            <h3 className="text-xl font-semibold mb-4 text-gray-800">
              Fuel Level Over Time – <span className="text-blue-600">{selectedBus}</span>
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={mockFuelData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="time" />
                <YAxis label={{ value: "Fuel (%)", angle: -90, position: "insideLeft" }} />
                <Tooltip />
                <Line type="monotone" dataKey="fuelLevel" stroke="#3b82f6" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Events List */}
          <section className="bg-white rounded-xl shadow p-6 border border-gray-100">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">Recent Events</h3>
            <ul className="space-y-4">
              {mockEvents.map((event, idx) => {
                const getIcon = () => {
                  switch (event.type) {
                    case "Drop": return "🔻";
                    case "Theft": return "🚨";
                    case "Refuel": return "⛽";
                    default: return "📍";
                  }
                };

                return (
                  <li
                    key={idx}
                    className="bg-gray-50 p-4 rounded-lg shadow-sm border-l-4 border-blue-500"
                  >
                    <div className="flex items-start gap-3">
                      <div className="text-2xl">{getIcon()}</div>
                      <div>
                        <p className="font-medium text-blue-700">{event.type}</p>
                        <p className="text-sm text-gray-600">{event.time} – {event.description}</p>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          </section>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
