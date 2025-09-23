import { useState } from "react";
import { FaRegEdit } from "react-icons/fa";
import { CiLocationOn } from "react-icons/ci";
import { IoStar } from "react-icons/io5";
import { CiCalendar } from "react-icons/ci";
import Overview from "../../app/Technician/Overview";
import ContactInfo from "../../app/Technician/ContactInfo";
import SkillsCerts from "../../app/Technician/SkillsCerts";
import Reviews from "../../app/Technician/Reviews";
function TechProfile() {
  const [activePage, setActivePage] = useState("overview");

  return (
    <div className="pt-24 px-6">
      <div
        className="bg-white rounded-2xl p-6 transition border border-gray-300"
        style={{ boxShadow: "0px 1px 1px rgba(0,0,0,0.25)" }}
      >
        <div className="flex justify-between items-center">
          <div className="flex space-x-4">
            <p className="w-20 h-20 flex items-center justify-center text-2xl rounded-full bg-[#1877D3] text-white font-bold ">
              asjksdfjk
            </p>
            <div className="space-y-4">
              <h2 className="text-2xl font-bold text-gray-800">me</h2>
              <div className="flex space-x-8 mt-2">
                <div className="space-y-4">
                  <p className="px-4 py-0.5  border bg-[#FFF9F9] border-gray-300 text-sm text-gray-700 rounded-full inline-block">
                    Technician
                  </p>
                  <div className="flex items-center text-gray-600 text-sm">
                    <CiLocationOn className="mr-1 text-xl" />
                    <span>Kigali, Rwanda</span>
                  </div>
                </div>

                <div className="space-y-5">
                  <div className="flex items-center text-sm text-gray-700">
                    <IoStar className="text-yellow-500 mr-1 text-xl" />
                    <p>4.8 (23 reviews)</p>
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <CiCalendar className="mr-1 text-xl" />
                    <p>Joined Jan 2025</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <button className="inline-flex items-center px-6 py-2 text-sm font-medium bg-[#1877D3] text-white rounded-md shadow hover:bg-[#145ba8] transition">
            <FaRegEdit className="mr-2" /> Edit
          </button>
        </div>
      </div>

      <div className="w-full flex items-center justify-between bg-[#ECECF0] rounded-2xl p-1 mt-6 shadow-sm">
        <button
          onClick={() => setActivePage("overview")}
          className={`flex-1 mx-1 py-2 rounded-full font-semibold transition ${
            activePage === "overview"
              ? "bg-white text-black shadow"
              : "hover:bg-white hover:text-black"
          }`}
        >
          Overview
        </button>

        <button
          onClick={() => setActivePage("contact")}
          className={`flex-1 mx-1 py-2 rounded-full font-semibold transition ${
            activePage === "contact"
              ? "bg-white text-black shadow"
              : "hover:bg-white hover:text-black"
          }`}
        >
          Contact Info
        </button>

        <button
          onClick={() => setActivePage("skills")}
          className={`flex-1 mx-1 py-2 rounded-full font-semibold transition ${
            activePage === "skills"
              ? "bg-white text-black shadow"
              : "hover:bg-white hover:text-black"
          }`}
        >
          Skills & Certs
        </button>

        <button
          onClick={() => setActivePage("reviews")}
          className={`flex-1 mx-1 py-2 rounded-full font-semibold transition ${
            activePage === "reviews"
              ? "bg-white text-black shadow"
              : "hover:bg-white hover:text-black"
          }`}
        >
          Reviews
        </button>
      </div>

    
      <div className="mt-6 space-y-4">
        {activePage === "overview" && <Overview />}
        {activePage === "contact" && <ContactInfo />}
        {activePage === "skills" && <SkillsCerts />}
        {activePage === "reviews" && <Reviews />}
      </div>
    </div>
  );
}

export default TechProfile;
