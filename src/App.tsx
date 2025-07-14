import "react-day-picker/dist/style.css";

import {
  BrowserRouter as Router,
  Routes,
  Route,
} from "react-router-dom";
import Dashboard from "./pages/Dashboard.tsx";
import FuelTheft from "./pages/FuelTheft.tsx";
import BusEvents from "./pages/BusEvents.tsx";
import MainLayout from "./layout/MainLayout.tsx";

function App() {
  return (
    <Router>
      <Routes>
        <Route
          path="/"
          element={
            <MainLayout>
              <Dashboard />
            </MainLayout>
          }
        />
        <Route
          path="/fuel-theft"
          element={
            <MainLayout>
              <FuelTheft />
            </MainLayout>
          }
        />
        <Route
          path="/bus-events"
          element={
            <MainLayout>
              <BusEvents />
            </MainLayout>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
