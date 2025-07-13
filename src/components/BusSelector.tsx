// components/BusSelector.tsx
import React from "react";

const mockBuses = [
  "Bus 1001",
  "Bus 1002",
  "Bus 1003",
  "Bus 1004",
  "Bus 1005",
  "Bus 1020",
  "Bus 1055",
];

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
  const filtered =
    search.length === 0
      ? []
      : mockBuses.filter((bus) =>
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
          placeholder="Enter bus number..."
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
                className="px-4 py-2 cursor-pointer hover:bg-blue-100"
              >
                {bus}
              </li>
            ))}
          </ul>
        )}
      </div>

      {selectedBus && (
        <p className="text-sm text-gray-600">
          Selected Bus: <span className="font-medium">{selectedBus}</span>
        </p>
      )}
    </section>
  );
};

export default BusSelector;
