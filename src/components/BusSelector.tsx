// components/BusSelector.tsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import { BsFillBusFrontFill } from "react-icons/bs";

interface Props {
  search: string;
  setSearch: (value: string) => void;
  selectedBus: string | null;
  setSelectedBus: (bus: string | null) => void;
}

const BusSelector: React.FC<Props> = ({
  search,
  setSearch,
  selectedBus,
  setSelectedBus,
}) => {
  const [busList, setBusList] = useState<string[]>([]);

  useEffect(() => {
    const fetchBuses = async () => {
      try {
        const res = await axios.get("/dashboard");
        const buses = res.data?.topBuses || [];
        const busIds = buses.map((bus: any) => bus.busId);
        setBusList(busIds);
      } catch (err) {
        console.error("Error fetching buses:", err);
      }
    };

    fetchBuses();
  }, []);

  const filtered =
    search.length === 0
      ? []
      : busList.filter((bus) =>
          bus.toLowerCase().includes(search.toLowerCase())
        );

  return (
    <section className="bg-white rounded-xl p-6 shadow border space-y-4">
      <label className="block text-sm font-semibold text-gray-700">
        Select Bus
      </label>
      <div className="relative">
        <input
          type="text"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setSelectedBus(null);
          }}
          placeholder="Search by bus ID..."
          className="w-full border border-gray-300 rounded-md px-4 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />

        {filtered.length > 0 && search !== selectedBus && (
          <ul className="absolute z-10 w-full bg-white border border-gray-200 mt-1 rounded-md shadow-md max-h-48 overflow-y-auto">
            {filtered.map((bus) => (
              <li
                key={bus}
                onClick={() => {
                  setSelectedBus(bus);
                  setSearch(bus);
                }}
                className="px-4 py-2 cursor-pointer hover:bg-blue-100 text-sm"
              >
                {bus}
              </li>
            ))}
          </ul>
        )}
      </div>

      {selectedBus ? (
        <p className="text-sm text-gray-600">
          Selected: <span className="font-medium">{selectedBus}</span>
        </p>
      ) : (
        <p className="text-sm text-gray-400 italic">No bus selected</p>
      )}
    </section>
  );
};

export default BusSelector;
