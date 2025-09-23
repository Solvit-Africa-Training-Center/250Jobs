import { useState } from "react";
import Hero from "../../components/Technicians/Hero";
import AvailableJobs from "./AvailableJob";
import MyApplication from "./MyApplication";

function TechnicianDashboard() {
  const [activePage, setActivePage] = useState<"available" | "application">("available");

  return (
    <section>
      <Hero activePage={activePage} setActivePage={setActivePage} />

      <div className="pt-6 max-w-7xl mx-auto px-4 md:px-16 no-anchor min-h-[70vh]">
        {activePage === "available" && <AvailableJobs />}
        {activePage === "application" && <MyApplication />}
      </div>
    </section>
  );
}

export default TechnicianDashboard;
