import { useAuth } from "../../context/AuthContext";
import { Link } from "react-router-dom";

interface HeroProps {
  activePage: "available" | "application";
  setActivePage: React.Dispatch<React.SetStateAction<"available" | "application">>;
}

function Hero({ activePage, setActivePage }: HeroProps) {
  const { user } = useAuth();
  return (
    <section
      className="relative pt-20 px-4 md:px-16 pb-12 bg-no-repeat bg-cover bg-center"
     
    >
      <div className="absolute inset-0 bg-[#F8FCFF] pointer-events-none" />
      <div className="relative max-w-5xl mx-auto flex flex-col-reverse md:flex-row items-center justify-between gap-8">
        <div className="flex-1 space-y-6">
          <h1 className="text-4xl md:text-4xl font-bold">
            <span className="text-black">{`Welcome Back${user?.username ? ", " + user.username : ""}!`}</span>
          </h1>
          <p className="text-gray-600 text-lg md:text-xl">
            Search, apply, and track your applications — all in one place.
          </p>

          <div className="w-full flex items-center justify-between bg-[#ECECF0] rounded-full p-1">
            <button
              onClick={() => setActivePage("available")}
              className={`flex-1 mx-1 py-2 rounded-full font-semibold transition ${
                activePage === "available" ? "bg-white text-black" : "hover:bg-white hover:text-black"
              }`}
            >
              Available Jobs
            </button>

            <button
              onClick={() => setActivePage("application")}
              className={`flex-1 mx-1 py-2 rounded-full font-semibold transition ${
                activePage === "application" ? "bg-white text-black" : "hover:bg-white hover:text-black"
              }`}
            >
              My Application
            </button>
          </div>

         
          <div className="flex justify-end">
            <Link
              to="/message"
              className="inline-flex items-center px-5 py-2 bg-[#2984df] text-white font-semibold rounded-full hover:bg-blue-700 transition"
            >
              Messages
            </Link>
          </div>
        
        </div>
      </div>
    </section>
  );
}

export default Hero;
