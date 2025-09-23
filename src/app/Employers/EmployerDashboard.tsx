import { useState } from "react";
import MyJobs from "../../components/Employers/MyJobs";
import Application from "../../components/Employers/Applications";
import HeroEmployer from "../../components/Employers/HeroEmployer";
import BrowserTech from "../../components/Employers/BrowserTech";
import Reviews from "../../components/Employers/Reviews";

function EmployerDashboard() {
  const [activePage, setActivePage] = useState<
    "jobs" | "application" | "browserTech" | "reviews"
  >("jobs");

  return (
    <section className="pt-30">
      {/* Single Hero controlling all pages */}
      <HeroEmployer activePage={activePage} setActivePage={setActivePage} />

      <div className="max-w-7xl mx-auto">
        {activePage === "jobs" && <MyJobs />}
        {activePage === "application" && <Application />}
        {activePage === "browserTech" && <BrowserTech/>}
        {activePage === "reviews" && <Reviews/> }
      </div>
    </section>
  );
}

export default EmployerDashboard;
