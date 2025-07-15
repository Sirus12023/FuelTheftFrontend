import React from "react";
import { useSpring, animated } from "@react-spring/web";
import { CircularProgressbar, buildStyles } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";
import { useNavigate } from "react-router-dom";

interface Props {
  id: string;
  route: string;
  fuelLevel: number;
  status: "normal" | "alert" | "offline";
  selected?: boolean;
}

const BusStatusCard: React.FC<Props> = ({
  id,
  route,
  fuelLevel,
  status,
  selected,
}) => {
  const navigate = useNavigate();

  const fuelColor =
    fuelLevel < 30
      ? "#ef4444"
      : fuelLevel < 60
      ? "#f59e0b"
      : "#10b981";

  const { animatedValue } = useSpring({
    from: { animatedValue: 0 },
    to: { animatedValue: fuelLevel },
    config: { duration: 800 },
  });

  return (
    <div
      className={`bg-white border rounded-xl p-4 shadow transition hover:shadow-md cursor-pointer ${
        selected ? "border-blue-500 bg-blue-50" : ""
      }`}
      onClick={() => navigate(`/fuel-theft?bus=${id}`)}
    >
      <div className="flex items-center gap-4">
        <div className="w-16 h-16">
          <animated.div style={{ width: "100%", height: "100%" }}>
            <animated.div>
              <CircularProgressbar
                value={fuelLevel}
                text={`${Math.round(fuelLevel)}%`}
                styles={buildStyles({
                  textSize: "28px",
                  pathColor: fuelColor,
                  textColor: fuelColor,
                  trailColor: "#E5E7EB",
                })}
              />
            </animated.div>
          </animated.div>
        </div>
        <div>
          <h4 className="text-lg font-semibold">{id}</h4>
          <p className="text-sm text-gray-600">{route}</p>
          <span
            className={`text-xs font-medium ${
              status === "alert"
                ? "text-red-600"
                : status === "offline"
                ? "text-gray-500"
                : "text-green-600"
            }`}
          >
            {status.toUpperCase()}
          </span>
        </div>
      </div>
    </div>
  );
};

export default BusStatusCard;
