import {
  BrowserRouter as Router,
  Routes,
  Route,
  Link,
} from "react-router-dom";
import Dashboard from "./pages/Dashboard.tsx";
import FuelTheft from "./pages/FuelTheft.tsx";
import BusEvents from "./pages/BusEvents.tsx";

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-100 text-gray-800">
        {/* Navigation Bar */}
        <nav className="bg-white shadow-md px-6 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-blue-600">Fuel Theft Monitoring</h1>
          <ul className="flex gap-6 font-medium">
            <li><Link to="/" className="hover:text-blue-500">Dashboard</Link></li>
            <li><Link to="/fuel-theft" className="hover:text-blue-500">Fuel Theft</Link></li>
            <li><Link to="/bus-events" className="hover:text-blue-500">Bus Events</Link></li>
          </ul>
        </nav>

        {/* Page Content */}
        <main className="p-6">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/fuel-theft" element={<FuelTheft />} />
            <Route path="/bus-events" element={<BusEvents />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;

