import { useAuth } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext"; 

interface HeroProps {
  activePage: "available" | "application";
  setActivePage: React.Dispatch<React.SetStateAction<"available" | "application">>;
}

function Hero({ activePage, setActivePage }: HeroProps) {
  const { user } = useAuth();
  const { theme } = useTheme(); 
  const isDark = theme === "dark";

  return (
    <section
      className={`relative  pt-20 px-4 md:px-16 pb-12 bg-no-repeat bg-cover bg-center ${
        isDark ? "bg-gray-900" : "bg-white"
      }`}
    >
     
      <div
        className={`absolute inset-0 pointer-events-none ${
          isDark ? "bg-gray-800" : "bg-[#F8FCFF]"
        }`}
      />

      
      <div className="relative max-w-5xl mx-auto flex flex-col-reverse md:flex-row items-center justify-between gap-8">
       
        <div className="flex-1 space-y-6 mt-8">
        
          <div className="relative">
            <div className="absolute -top-10 -left-10 w-72 h-72 bg-gradient-to-r from-blue-400 to-indigo-500 rounded-full opacity-20 blur-3xl pointer-events-none"></div>
            <div className="absolute -bottom-10 -right-10 w-72 h-72 bg-gradient-to-r from-purple-400 to-pink-500 rounded-full opacity-20 blur-3xl pointer-events-none"></div>

           
            <h1
              className={`relative text-4xl sm:text-5xl md:text-6xl font-extrabold leading-snug ${
                isDark ? "text-white" : "text-gray-900"
              }`}
            >
              Your Job Dashboard
            </h1>
          </div>

          <div
  className={`w-full flex items-center justify-between rounded-full p-1 mt-20 ${
    isDark ? "bg-gray-700" : "bg-[#ECECF0]"
  }`}
>
  <button
    onClick={() => setActivePage("available")}
    className={`flex-1 mx-1 py-2 rounded-full font-semibold transition
      ${activePage === "available"
        ? "bg-white text-black"         
        : isDark
        ? "bg-gray-700 text-gray-300 hover:bg-gray-600 hover:text-white"  
        : "bg-[#ECECF0] text-gray-700 hover:bg-white hover:text-black"   
      }`}
  >
    Available Jobs
  </button>

     <button
       onClick={() => setActivePage("application")}
     className={`flex-1 mx-1 py-2 rounded-full font-semibold transition
      ${activePage === "application"
        ? "bg-white text-black"
        : isDark
        ? "bg-gray-700 text-gray-300 hover:bg-gray-600 hover:text-white" 
        : "bg-[#ECECF0] text-gray-700 hover:bg-white hover:text-black"   
      }`}
     >
      My Application
     </button>
      </div>

          
        </div>
      </div>
    </section>
  );
}

export default Hero;
