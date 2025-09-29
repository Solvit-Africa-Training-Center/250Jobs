import { motion } from "framer-motion";
import {

  Search, Wrench, PlugZap, Hammer, Bolt, Paintbrush, Shield, Clock,

  Building2, Users, Mail, MapPin, ArrowRight

} from "lucide-react";

import Header from "../components/Header";
import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";



type SectionProps = {

  id?: string;

  title?: string;

  subtitle?: string;

  children: ReactNode;

};



const Section = ({ id, title, subtitle, children }: SectionProps) => (

  <section id={id} className="py-16 md:py-24">

    <div className="mx-auto max-w-7xl px-4">

      {title && (

        <div className="mb-10 text-center">

          <h2 className="text-2xl md:text-4xl font-bold tracking-tight text-slate-900">

            {title}

          </h2>

          {subtitle && (

            <p className="mt-3 text-slate-600 max-w-2xl mx-auto">{subtitle}</p>

          )}

          <div

            className="mt-4 h-1 w-24 rounded-full mx-auto"

            style={{ background: "linear-gradient(90deg, #0065CE 0%, #003368 100%)" }}

          />

        </div>

      )}

      {children}

    </div>

  </section>

);



type PillProps = { icon: LucideIcon; label: string };



const Pill = ({ icon: Icon, label }: PillProps) => (

  <button

    className="inline-flex items-center gap-2 rounded-full border-2 border-white bg-white px-6 py-2.5 text-sm font-semibold text-slate-900 transition hover:bg-blue-50"

  >

    <Icon size={16} /> {label}

  </button>

);



const categories = [

  { icon: Wrench, label: "Plumbing" },

  { icon: Hammer, label: "Construction" },

  { icon: PlugZap, label: "Electricity" },

  { icon: Bolt, label: "Welding" },

  { icon: Paintbrush, label: "Electronics" },

];



const logos = [

  {

    name: "Horizon Construction",

    src: "https://dummyimage.com/180x80/edf2f7/0f172a&text=HORIZON",

  },

  {

    name: "RURA",

    src: "https://dummyimage.com/180x80/edf2f7/0f172a&text=RURA",

  },

  {

    name: "EjoHeza",

    src: "https://dummyimage.com/180x80/edf2f7/0f172a&text=EjoHeza",

  },

  {

    name: "Shelter Group",

    src: "https://dummyimage.com/180x80/edf2f7/0f172a&text=SHELTER",

  },

  {

    name: "FRRA",

    src: "https://dummyimage.com/180x80/edf2f7/0f172a&text=FRRA",

  },

  {

    name: "GoGreen",

    src: "https://dummyimage.com/180x80/edf2f7/0f172a&text=GOGREEN",

  },

];



const jobs = [

  {

    title: "Plumbing Work at Kabeza/Kigali",

    tag: "Plumbing",

    location: "Kicukiro/Kabeza",

    age: "2d ago",

    image: "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=160&h=160&q=80",

    description: "Fix leaking pipes and refurbish bathroom fixtures for a residential home.",

  },

  {

    title: "Construction at Kicukiro",

    tag: "Construction",

    location: "Nyarugenge",

    age: "3d ago",

    image: "https://images.unsplash.com/photo-1503387762-592deb58ef4e?auto=format&fit=crop&w=160&h=160&q=80",

    description: "Assist with wall framing, roofing, and site cleanup on a two-week build.",

  },

  {

    title: "House Electricity Installation",

    tag: "Electric",

    location: "Gasabo/Kimironko",

    age: "6d ago",

    image: "https://images.unsplash.com/photo-1517430816045-df4b7de11d1d?auto=format&fit=crop&w=160&h=160&q=80",

    description: "Wire a new home, install sockets, and ensure main panel compliance.",

  },

  {

    title: "One Week House Painting",

    tag: "Painting",

    location: "Nyarugenge",

    age: "10d ago",

    image: "https://images.unsplash.com/photo-1503387762-592deb58ef4e?auto=format&fit=crop&w=160&h=160&q=80",

    description: "Prep and repaint interior rooms with moisture-resistant coatings.",

  },

  {

    title: "Welding at a Construction Site",

    tag: "Welding",

    location: "Kicukiro/Kanombe",

    age: "2w ago",

    image: "https://images.unsplash.com/photo-1517430816045-df4b7de11d1d?auto=format&fit=crop&w=160&h=160&q=80",

    description: "Fabricate door frames and reinforce structural beams on site.",

  },

  {

    title: "Electronics Repair",

    tag: "Electronic",

    location: "Rubavu",

    age: "8d ago",

    image: "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=160&h=160&q=80",

    description: "Diagnose and repair consumer electronics in a retail workshop.",

  },

];



export default function Landing250Jobs() {

  return (

    <div className="min-h-screen bg-white text-slate-800">

      <div id="hero" className="relative isolate overflow-hidden text-white">

        <img

          src="/images/hero.png"

          alt="Construction workers on site"

          className="absolute inset-0 h-full w-full object-cover"

          style={{ opacity: 0.62, filter: "saturate(0.9) contrast(1.05)" }}

        />



        <div

          className="absolute inset-0"

          style={{

            background:

              "linear-gradient(160deg," +

              " rgba(0,51,94,0.80) 20%," +        

              " rgba(0,69,148,0.68) 100%," +     

              " rgba(0,101,206,0.80) 100%" +   

              ")",

          }}

        />

        <div

          className="absolute inset-0"

          style={{

            background:

              "radial-gradient(70% 45% at 50% 35%, rgba(255,255,255,0.10) 0%, rgba(255,255,255,0) 60%)",

          }}

        />



      

        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-[#0065CE]/40 to-transparent" />

        <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-transparent to-transparent" />



        <Header />



      

        <div className="relative mx-auto flex min-h-[620px] max-w-5xl flex-col items-center justify-center px-4 pb-24 pt-32 text-center lg:px-6">

          <span className="rounded-full border border-white/30 bg-white/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.35em] text-white/90">

            No. 1 Job Searching platform

          </span>



          <motion.h1

            initial={{ opacity: 0, y: 24 }}

            animate={{ opacity: 1, y: 0 }}

            transition={{ duration: 0.6 }}

            className="mt-5 text-4xl md:text-6xl font-extrabold leading-tight tracking-tight text-white"

          >

            Find a Skilled Individual<br className="hidden md:block" />

            <span className="text-blue-300">To Do The Job</span>

          </motion.h1>



          <p className="mt-5 max-w-2xl text-base md:text-lg text-white/90">

            Skills + Jobs for job to explore, in the main line, join a stand to find your job

          </p>



        

          <div

            className="mt-10 w-full max-w-4xl rounded-full border border-white/25 bg-white p-2 shadow-[0_35px_80px_rgba(0,51,104,0.35)]"

          >

            <div className="flex flex-col gap-2 md:flex-row md:items-center">

              <div className="flex flex-1 items-center gap-3 rounded-full bg-white px-5 py-3 text-slate-700">

                <Search size={20} className="text-[#0065CE]" />

                <input

                  className="w-full bg-transparent text-sm font-medium text-slate-700 placeholder:text-slate-400 focus:outline-none"

                  placeholder="Job title, Important or scripted"

                />

              </div>



            

              <div className="hidden md:block h-4 w-px bg-slate-200/60" />



              <div className="flex flex-1 items-center gap-3 rounded-full bg-white px-5 py-3 text-slate-700">

                <Building2 size={20} className="text-[#0065CE]" />

                <input

                  className="w-full bg-transparent text-sm font-medium text-slate-700 placeholder:text-slate-400 focus:outline-none"

                  placeholder="Enter the name of your city"

                />

              </div>



             

              <button

                className="flex shrink-0 items-center justify-center rounded-full px-8 py-3 text-sm font-semibold text-white transition hover:brightness-110"

                style={{ backgroundColor: "#0065CE" }}

              >

                Search

              </button>

            </div>

          </div>



         

          <div className="mt-8 flex flex-col items-center gap-3">

            <div className="flex flex-wrap justify-center gap-3">

              {categories.slice(0, 3).map((c) => (

                <Pill key={c.label} icon={c.icon} label={c.label} />

              ))}

            </div>

            <div className="flex flex-wrap justify-center gap-3">

              {categories.slice(3).map((c) => (

                <Pill key={c.label} icon={c.icon} label={c.label} />

              ))}

            </div>

          </div>

        </div>

      </div>



<Section

  id="how"

>



  <div className="text-center pb-8 mb-4">

    <span className="inline-block px-6 py-1 rounded-full bg-[#EDF5FE] text-[#007AFF] font-semibold  tracking-wide uppercase text-sm">

      How It Works

    </span>

  </div>



<h2 className="text-center text-3xl font-bold text-gray-900 mb-2 ">

  Making Your Job Search Easy

</h2>



<div className="mx-auto mt-2 h-1 w-24 rounded-full bg-gradient-to-r from-[#0065CE] via-[#007AFF] to-[#003368]" />









 



  <div className="grid gap-16 md:grid-cols-2 items-center  pt-20">

    

    <div className="relative flex justify-center">

      

      <div className="absolute inset-0 -z-10 bg-gradient-to-br from-[#f5f8ff] via-[#eef3fa] to-[#ffffff]" />



      

      <div className="relative flex justify-center" />



      <img

        src="/images/cowork.png"

        alt="Technician"

        className=" mb-26 "

      />

    </div>



    <div className="grid gap-8 md:grid-cols-2">

      {[

        {

          step: "01",

          title: "Login or Register",

          desc: "Create an account and start using our platform with great and quick service.",

        },

        {

          step: "02",

          title: "Create a Profile",

          desc: "Show your skills, certificates, and experience. Help employers trust your abilities.",

        },

        {

          step: "03",

          title: "Browse Jobs",

          desc: "Find listings that match your skills, apply directly, and chat with employers.",

        },

        {

          step: "04",

          title: "Track Applications",

          desc: "Stay updated on every stage on a single page and never miss a response.",

        },

      ].map((c) => (

        <div

          key={c.step}

          className="group rounded-2xl border border-slate-100 bg-white/80 backdrop-blur-sm p-6 shadow-md hover:shadow-2xl hover:-translate-y-1 transition-all duration-300"

        >

          <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-r from-[#0065CE] to-[#0a75d1] text-white text-sm font-bold shadow-md group-hover:scale-110 transition-transform duration-300">

            {c.step}

          </span>

          <h3 className="mt-5 text-lg font-semibold text-slate-800 group-hover:text-[#0065CE] transition-colors duration-300">

            {c.title}

          </h3>

          <p className="mt-2 text-sm text-slate-600 leading-relaxed">

            {c.desc}

          </p>

        </div>

      ))}

    </div>

  </div>

</Section>







   <div className="bg-blue-50">

  <Section

    title="Why Choose 250Jobs"

    subtitle="We connect Kigali and beyond with trusted technicians across many trades."

  >

    <div className="grid gap-8 md:grid-cols-3">

      {[

        {

          Icon: Clock,

          title: "Quick Hire",

          desc: "We remove time-wasters so you can connect faster. Post a job and receive responses quickly.",

        },

        {

          Icon: Users,

          title: "A Lot of Professions",

          desc: "From skilled trades to professional services, discover opportunities across industries.",

        },

        {

          Icon: Shield,

          title: "Used Countrywide",

          desc: "Find verified talent across regions — built for reliability and growth.",

        },

      ].map(({ Icon, title, desc }, i) => (

        <div

          key={i}

          className="group relative rounded-3xl border border-slate-100 

                     bg-white/80 backdrop-blur-sm p-8 shadow-md 

                     hover:shadow-2xl transition-all duration-500 

                     hover:-translate-y-2 overflow-hidden"

        >

         

          <div className="absolute inset-0 -z-10 bg-gradient-to-br from-blue-50 via-white to-blue-100 opacity-40 group-hover:opacity-60 transition-opacity duration-500" />



          

          <div className="absolute -z-10 top-0 right-0 h-40 w-40 rounded-full bg-white  group-hover:scale-125 transition-transform duration-500" />



         

          <div className="flex items-center justify-center h-16 w-16 rounded-2xl 

                          bg-[#007AFF]

                          text-white shadow-lg group-hover:scale-110 transition-transform duration-300">

            <Icon className="h-7 w-7" />

          </div>



        

          <h3 className="mt-6 text-xl font-semibold text-slate-800 group-hover:text-[#0065CE] transition-colors duration-300">

            {title}

          </h3>



        

          <p className="mt-3 text-sm text-slate-600 leading-relaxed">

            {desc}

          </p>

        </div>

      ))}

    </div>

  </Section>

</div>





     

   <Section id="jobs" title="Browse the Latest Job Posts">

  <div className="grid gap-6 md:grid-cols-3">

    {jobs.map((j, i) => (

      <div

        key={i}

        className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:shadow-md"

      >

        <div className="flex gap-4">

          <img

            src={j.image}

            alt={`${j.tag} job illustration`}

            className="h-16 w-16 flex-none rounded-xl object-cover"

            loading="lazy"

          />

          <div className="flex-1">

            <h4 className="text-base font-semibold text-slate-800">{j.title}</h4>

            <div className="mt-2 flex items-center justify-between text-xs text-slate-500">

              <span className="inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-semibold text-slate-500">

                {j.tag}

              </span>

              <span>{j.age}</span>

            </div>

          </div>

        </div>

        <p className="text-sm text-slate-600 leading-relaxed">{j.description}</p>

        <div className="flex items-center justify-between pt-4">

          <div

            className="inline-flex items-center gap-2 rounded-full px-3 py-2 text-sm font-medium"

            style={{ backgroundColor: "#E6F1FF", color: "#003368" }}

          >

            <MapPin size={14} className="text-[#1877D3]" />

            <span>{j.location}</span>

          </div>

          <button className="rounded-xl px-4 py-2 text-sm font-medium text-[#1877D3] transition hover:bg-blue-50">

            View details

          </button>

        </div>

      </div>

    ))}

  </div>



  <div className="mt-8 text-center">

    <button

      className="inline-flex items-center gap-2 rounded-xl px-6 py-3 text-sm font-semibold text-white transition hover:brightness-110"

      style={{ backgroundColor: "#0065CE" }}

    >

      <span>Browse more</span>

      <ArrowRight size={16} />

    </button>

  </div>

</Section>





      {/* ===== SUBSCRIBE BANNER ===== */}

      <Section>

        <div className="relative overflow-hidden rounded-[2.5rem] bg-[#003368] px-6 py-16 text-center text-white sm:px-10">

          <div className="mx-auto max-w-2xl space-y-3">

            <h3 className="text-2xl font-semibold md:text-3xl">A Job hunting Experience</h3>

            <p className="text-lg font-semibold text-white/90 md:text-2xl">like no other</p>

            <p className="text-sm text-white/80 sm:text-base">Why search when you can discover? Let the right job come to you.</p>

          </div>

          <form className="mx-auto mt-8 flex max-w-xl items-center gap-2 rounded-full bg-white/95 px-3 py-2 shadow-lg">

            <Mail size={18} className="text-slate-400" />

            <input

              type="email"

              placeholder="Enter your email"

              className="flex-1 bg-transparent text-sm text-slate-700 outline-none placeholder:text-slate-400"

            />

            <button

              type="submit"

              className="rounded-full bg-[#0065CE] px-5 py-2 text-sm font-semibold text-white transition hover:brightness-110"

            >

              Subscribe

            </button>

          </form>

        </div>



      </Section>



      {/* ===== PARTNER COMPANIES ===== */}

      <Section

        id="companies"

        title="Top Companies hiring from 250 Jobs"

        subtitle="Discover top-tier companies actively seeking talent through 250 Jobs. We connect you with leaders and innovators offering roles that value expertise, creativity, and growth."

      >

        <div className="mx-auto max-w-5xl">

          <div className="grid grid-cols-2 gap-6 pt-6 md:grid-cols-3">

            {logos.map((logo) => (

              <div

                key={logo.name}

                className="flex items-center justify-center rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-100"

              >

                <img

                  src={logo.src}

                  alt={`${logo.name} logo`}

                  className="max-h-14 w-full object-contain"

                  loading="lazy"

                />

              </div>

            ))}

          </div>

        </div>

      </Section>



      {/* ===== FOOTER ===== */}

      <footer className="border-t border-slate-200 bg-[#E0F0FF] text-slate-700">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center gap-12 text-center lg:flex-row lg:items-start lg:justify-between lg:text-left">
            <div className="flex w-full max-w-xl flex-col items-center gap-6 text-center lg:items-start lg:text-left">
              <div className="flex items-center gap-5">
                <div className="relative flex items-center justify-center overflow-hidden rounded-full bg-white p-3 shadow-lg shadow-[#0065CE]/25 ring-1 ring-[#0065CE]/15">
                  <img src="/images/logo2.png" alt="250Jobs logo" className="h-9 w-auto object-contain" />
                </div>
                <div className="flex flex-col items-center text-center lg:items-start lg:text-left">
                  <span className="text-xl font-semibold text-slate-900">250Jobs</span>
                  <span className="text-xs font-medium uppercase tracking-[0.35em] text-[#0065CE]">Hire Smarter</span>
                </div>
              </div>
              <p className="max-w-md text-sm leading-relaxed text-slate-700">
                Skilled technicians on demand for projects that need to be done right. We match certified talent with employers who value precision.
              </p>
              <div className=" flex w-full flex-col gap-3 sm:flex-row sm:items-center sm:justify-center lg:justify-start">
                <a
                  href="#hero"
                  className="inline-flex items-center justify-center rounded-full bg-[#0065CE] px-5 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-[#004f9d] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0065CE]"
                >
                  Join the platform
                </a>
                <a
                  href="#jobs"
                  className="inline-flex items-center justify-center rounded-full border border-[#0065CE]/40 px-5 py-2 text-sm font-semibold text-[#0065CE] transition hover:border-[#0065CE] hover:text-[#004f9d] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0065CE]"
                >
                  Explore jobs
                </a>
              </div>
            </div>
            <nav className="flex w-full flex-col items-center gap-10 text-center sm:flex-row sm:items-start sm:justify-center sm:text-left lg:max-w-md lg:flex-col lg:items-end lg:text-right" aria-label="Footer">
              <div className="w-full max-w-sm">
                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">Quick links</p>
                <ul className="mt-4 grid grid-cols-1 gap-3 text-sm font-medium text-slate-800 sm:grid-cols-2 lg:grid-cols-1">
                  <li><a href="#how" className="transition hover:text-[#0065CE]">How it works</a></li>
                  <li><a href="#jobs" className="transition hover:text-[#0065CE]">Browse jobs</a></li>
                  <li><a href="#companies" className="transition hover:text-[#0065CE]">Top companies</a></li>
                </ul>
              </div>
             
            </nav>
          </div>
          <div className="mt-12 flex flex-col gap-2 border-t border-slate-300 pt-6 text-xs text-slate-500 sm:flex-row sm:items-center sm:justify-between">
            <span>&copy; {new Date().getFullYear()} 250Jobs Inc. All rights reserved.</span>
            <span>Built for teams who rely on certified technicians.</span>
          </div>
        </div>
      </footer>

    </div>

  );

}











































