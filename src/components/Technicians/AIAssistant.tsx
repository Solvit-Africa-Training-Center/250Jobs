import { LuTv } from "react-icons/lu";
import { MdLightbulbOutline } from "react-icons/md";
import { LuSend } from "react-icons/lu";
import { CiFilter, CiStar, CiSearch } from "react-icons/ci";
import { MdOutlineWorkOutline } from "react-icons/md";

function AIAssistant() {
  return (
    <div className="flex justify-center pt-24 px-6 pb-24">
      
      <div className="w-full max-w-5xl">
       
        <div className="mb-8 pt-6">
          <div className="flex  gap-2">
            <LuTv className="text-3xl text-blue-600" />
            <h2 className="text-3xl font-bold text-gray-800">AI Assistant</h2>
          </div>
          <p className="text-gray-500 mt-2">
            Discover job opportunities tailored to your skills and preferences
          </p>
        </div>

        {/* Card */}
        <div className="space-y-4">
          <div className="bg-white rounded-2xl  transition border border-gray-200 overflow-hidden">
          
            <div className="p-6">
              <div className="flex items-center gap-2 mb-3">
                <div className="bg-blue-100 p-2 rounded-full">
                  <LuTv className="text-blue-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-800">
                  Smart Job Search
                </h3>
              </div>
              <p className="text-gray-500 text-sm">
                Ask me anything about finding jobs. I understand natural language queries!
              </p>
            </div>

          
            <div className="w-full h-[1px] bg-gray-300"></div>

           
            <div className="p-6 space-y-4">
              <div className="flex items-start gap-3">
                <div className="bg-blue-50 p-2 rounded-full mt-1">
                  <LuTv className="text-blue-400 text-lg" />
                </div>
                <div className="bg-gray-100 px-4 py-3 rounded-lg  w-full">
                  <p className="text-gray-800 leading-relaxed">
                    Hi there! I'm here to help you find the perfect job
                    opportunities. I can search for jobs based on your<br /> skills,
                    preferred location, salary expectations, and job type. What kind of work are you looking for?
                  </p>
                  <p className="text-xs text-gray-500 text-left mt-2">
                    9:36:29 AM
                  </p>
                </div>
              </div>

             
              <div className="pt-3 space-y-2">
                <div className="flex items-center gap-2 mb-2">
                  <div className="bg-yellow-100 p-2 rounded-full">
                    <MdLightbulbOutline className="text-yellow-500 text-lg" />
                  </div>
                  <h3 className="text-gray-600 text-sm font-medium">Quick suggestions:</h3>
                </div>
                {[
                  "Find electrical jobs in Kigali",
                  "Show me high-paying HVAC positions",
                  "I want full-time maintenance jobs",
                  "Find jobs that match my skills",
                ].map((suggestion, index) => (
                  <p
                    key={index}
                    className="flex items-center gap-2 border border-gray-300 font-semibold px-4 py-2 rounded-md hover:bg-blue-50 cursor-pointer transition"
                  >
                    <CiStar className="text-gray-500" />
                    {suggestion}
                  </p>
                ))}
              </div>
            </div>

            
            <div className="mt-28 space-y-3">
             
              <div className="w-full bg-gray-300 h-[1px]"></div>

              
           
          <div className="p-6 space-y-6">

        <div className="flex gap-2 items-center">
        <input
        type="text"
        placeholder="e.g., 'Show me electrical jobs in Kigali with good pay'"
       className="flex-1 bg-gray-100 px-4 py-2  rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-300"
        />
       <button className="bg-blue-500 hover:bg-blue-600 p-2 rounded-lg text-white transition flex items-center justify-center">
       <LuSend />
      </button>
      </div>


       <div className="flex flex-wrap gap-2 items-center">
        <button className="flex items-center gap-2 px-2 py-1 border border-gray-400 text-black rounded-full hover:bg-blue-50 transition text-sm">
       <CiSearch /> Natural language Search
       </button>

       <button className="flex items-center gap-2 px-2 py-1 border border-gray-400 text-black rounded-full hover:bg-blue-50 transition text-sm">
        <CiFilter /> Smart filtering
       </button>

       <button className="flex items-center gap-2 px-2 py-1 border border-gray-400 text-black rounded-full hover:bg-blue-50 transition text-sm">
        <CiStar /> AI recommendations
      </button>
      </div>
       </div>
        </div>
        </div>
        </div>

<div className="mt-8">
  <h2 className="text-xl font-semibold mb-4">Popular Searches</h2>
  <div className="flex gap-4 overflow-x-auto">
    {[1, 2, 3].map((item) => (
      <div
        key={item}
        className="flex items-start gap-3 border border-gray-300 rounded-md p-4 min-w-[250px] bg-white shadow-sm"
      >
        <div className="bg-blue-50 p-2 rounded-full">
          <MdOutlineWorkOutline className="text-blue-600 text-2xl" />
        </div>
        <div>
          <p className="font-semibold text-gray-800">High-Paying Electrical Jobs</p>
          <p className="text-gray-500 text-sm">Kigali area</p>
        </div>
      </div>
    ))}
  </div>
</div>
</div>
</div>
  );
}

export default AIAssistant;
