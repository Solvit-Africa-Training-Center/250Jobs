import { useAuth } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext"; 
import React from "react";

interface HeroProps {
  activePage: "jobs" | "application" | "browserTech" | "reviews";
  setActivePage: React.Dispatch<
    React.SetStateAction<"jobs" | "application" | "browserTech" | "reviews">
  >;
}

function HeroEmployer({ activePage, setActivePage }: HeroProps) {
  const { user } = useAuth();
  const { theme } = useTheme(); 
  const isDark = theme === "dark";

  const tabs = [
    { key: "jobs", label: "My Jobs" },
    { key: "application", label: "Application" },
    { key: "browserTech", label: "Browser Technicians" },
    { key: "reviews", label: "Reviews" },
  ];

  return (
    <section
      className={`relative pt-12 pb-12 px-4 md:px-16 bg-no-repeat bg-cover bg-center ${
        isDark ? "bg-gray-900" : "bg-white"
      }`}
    >
      {/* Overlay */}
      <div
        className={`absolute inset-0 pointer-events-none ${
          isDark ? "bg-gray-800" : "bg-[#F8FCFF]"
        }`}
      />

      {/* Main content */}
      <div className="relative max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-8">
        <div className="flex-1 space-y-6">
          <div className="relative">
            {/* Decorative circles */}
            <div className="absolute -top-10 -left-10 w-72 h-72 bg-gradient-to-r from-blue-400 to-indigo-500 rounded-full opacity-20 blur-3xl pointer-events-none"></div>
            <div className="absolute -bottom-10 -right-10 w-72 h-72 bg-gradient-to-r from-purple-400 to-pink-500 rounded-full opacity-20 blur-3xl pointer-events-none"></div>

            <h1
              className={`relative text-4xl sm:text-5xl md:text-6xl font-extrabold leading-snug ${
                isDark ? "text-white" : "text-gray-900"
              }`}
            >
              Employer Dashboard
            </h1>
            <p className="text-gray-500 text-lg md:text-base">
              Manage your job postings and find the right talent
            </p>
          </div>

          {/* Tabs/buttons */}
          <div
            className={`w-full flex items-center justify-between rounded-full p-1 mt-8 ${
              isDark ? "bg-gray-700" : "bg-[#ECECF0]"
            }`}
          >
            {tabs.map((tab) => (
              <button
                key={tab.key}
                type="button"
                onClick={() => setActivePage(tab.key as any)}
                className={`flex-1 mx-1 py-2 rounded-full font-semibold transition ${
                  activePage === tab.key
                    ? "bg-white text-black"
                    : isDark
                    ? "bg-gray-700 text-gray-300 hover:bg-gray-600 hover:text-white"
                    : "bg-[#ECECF0] text-gray-700 hover:bg-white hover:text-black"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

export default HeroEmployer;
