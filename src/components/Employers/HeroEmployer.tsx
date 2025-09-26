
import React from "react";
import { Link } from "react-router-dom";

interface HeroProps {
  activePage: "jobs" | "application" | "browserTech" | "reviews";
  setActivePage: React.Dispatch<
    React.SetStateAction<"jobs" | "application" | "browserTech" | "reviews">
  >;
}

function HeroEmployer({ activePage, setActivePage }: HeroProps) {
  return (
    <section className="px-4 md:px-16 pb-12 dark:text-gray-100">
      <div className="max-w-7xl mx-auto flex flex-col-reverse md:flex-row items-center justify-between gap-8">
        <div className="flex-1 space-y-2">
          <h1 className="text-4xl font-bold leading-tight text-black dark:text-gray-100">Employer Dashboard</h1>
          <p className="text-gray-500 text-lg md:text-base dark:text-gray-400">
            Manage your job postings and find the right talent
          </p>

          <div className="w-full flex items-center justify-between bg-[#ECECF0] dark:bg-gray-800 rounded-full p-1 mt-6">
            <button
              onClick={() => setActivePage("jobs")}
              className={`flex-1 mx-1 py-2 rounded-full font-semibold transition ${
                activePage === "jobs" ? "bg-white text-black dark:bg-gray-900 dark:text-gray-100" : "hover:bg-white hover:text-black dark:hover:bg-gray-900 dark:hover:text-gray-100"
              }`}
            >
              My Jobs
            </button>

            <button
              onClick={() => setActivePage("application")}
              className={`flex-1 mx-1 py-2 rounded-full font-semibold transition ${
                activePage === "application" ? "bg-white text-black dark:bg-gray-900 dark:text-gray-100" : "hover:bg-white hover:text-black dark:hover:bg-gray-900 dark:hover:text-gray-100"
              }`}
            >
              Application
            </button>

            <button
              onClick={() => setActivePage("browserTech")}
              className={`flex-1 mx-1 py-2 rounded-full font-semibold transition ${
                activePage === "browserTech" ? "bg-white text-black dark:bg-gray-900 dark:text-gray-100" : "hover:bg-white hover:text-black dark:hover:bg-gray-900 dark:hover:text-gray-100"
              }`}
            >
              Browser Technicians
            </button>

            <button
              onClick={() => setActivePage("reviews")}
              className={`flex-1 mx-1 py-2 rounded-full font-semibold transition ${
                activePage === "reviews" ? "bg-white text-black dark:bg-gray-900 dark:text-gray-100" : "hover:bg-white hover:text-black dark:hover:bg-gray-900 dark:hover:text-gray-100"
              }`}
            >
              Reviews
            </button>
          </div>
        </div>
      </div>
      <div className="max-w-7xl mx-auto flex justify-end mt-2">
        <Link
          to="/employer/messages"
          className="inline-flex items-center px-5 py-2 bg-[#2984df] text-white font-semibold rounded-full hover:bg-blue-700 transition dark:bg-[#145ea8] dark:hover:bg-[#0f4c88]"
        >
          Messages
        </Link>
      </div>
    </section>
  );
}

export default HeroEmployer;
