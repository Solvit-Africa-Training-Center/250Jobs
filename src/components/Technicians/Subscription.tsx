import { useState } from "react";
import CurrentSub from "../../app/Technician/CurrentSub";
import AvailablePlan from "../../app/Technician/AvailablePlan";
import { useTheme } from "../../context/ThemeContext";

function Subscription() {
  const [activePage, setActivePage] = useState("AvailablePlan");
  const { theme } = useTheme();
  const isDark = theme === "dark";

  return (
    <div className="pt-24 px-6">
      <div className="text-center">
        <h2 className={`text-2xl font-bold ${isDark ? "text-white" : "text-gray-800"}`}>
          Choose Your Plan
        </h2>
        <p className={`mt-1 ${isDark ? "text-gray-400" : "text-gray-500"}`}>
          Unlock more opportunities with our premium features
        </p>
      </div>

      {/* Tabs */}
      <div className={`w-full flex items-center justify-between rounded-2xl p-1 mt-6 shadow-sm max-w-xl mx-auto ${
        isDark ? "bg-gray-800" : "bg-[#ECECF0]"
      }`}>
        <button
          onClick={() => setActivePage("AvailablePlan")}
          className={`flex-1 mx-1 py-2 rounded-full font-semibold transition ${
            activePage === "AvailablePlan"
              ? isDark
                ? "bg-gray-700 text-white shadow"
                : "bg-white text-black shadow"
              : isDark
                ? "text-gray-300 hover:bg-gray-700 hover:text-white"
                : "text-gray-700 hover:bg-white hover:text-black"
          }`}
        >
          Available Plans
        </button>

        <button
          onClick={() => setActivePage("CurrentSub")}
          className={`flex-1 mx-1 py-2 rounded-full font-semibold transition ${
            activePage === "CurrentSub"
              ? isDark
                ? "bg-gray-700 text-white shadow"
                : "bg-white text-black shadow"
              : isDark
                ? "text-gray-300 hover:bg-gray-700 hover:text-white"
                : "text-gray-700 hover:bg-white hover:text-black"
          }`}
        >
          Current Subscription
        </button>
      </div>

      <div className="mt-8 space-y-4">
        {activePage === "AvailablePlan" && <AvailablePlan />}
        {activePage === "CurrentSub" && <CurrentSub />}
      </div>
    </div>
  );
}

export default Subscription;
