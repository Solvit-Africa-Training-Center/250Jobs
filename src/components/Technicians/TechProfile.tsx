import { useState, useEffect } from "react";
import { getCurrentTechnician, updateCurrentTechnician } from "../../api/technicians";
import type { TechnicianProfile } from "../../types/technician";
import { FaRegEdit } from "react-icons/fa";
import { CiLocationOn } from "react-icons/ci";
import { IoStar } from "react-icons/io5";
import { CiCalendar } from "react-icons/ci";
import Overview from "../../app/Technician/Overview";
import ContactInfo from "../../app/Technician/ContactInfo";
import SkillsCerts from "../../app/Technician/SkillsCerts";
import Reviews from "../../app/Technician/Reviews";
import Button from "../ui/Button";
import { useTheme } from "../../context/ThemeContext";

function TechProfile() {
  const [activePage, setActivePage] = useState("overview");
  const [profile, setProfile] = useState<TechnicianProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);
  const [draftUsername, setDraftUsername] = useState("");
  const [draftPhone, setDraftPhone] = useState("");
  const [draftLocation, setDraftLocation] = useState("");
  const [draftBio, setDraftBio] = useState("");
  const [draftYears, setDraftYears] = useState<string>("");
   const { theme } = useTheme(); 
  const isDark = theme === "dark";

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const me = await getCurrentTechnician();
        if (mounted) {
          setProfile(me);
          const full = `${me.first_name || ""} ${me.last_name || ""}`.trim().replace(/\s+/g, " ");
          setDraftUsername(full);
          setDraftPhone((me as any).phone || (me as any).phone_number || "");
          setDraftLocation(me.location || "");
          setDraftBio(me.bio || "");
          setDraftYears(typeof me.years_experience === "number" ? String(me.years_experience) : "");
        }
      } catch (err: any) {
        if (mounted) {
          setError(err?.message || "Failed to load profile");
        }
        console.error("Error fetching technician profile:", err);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const openEditor = () => {
    
    setActivePage("overview");
    setEditError(null);
    if (profile) {
      const full = `${profile.first_name || ""} ${profile.last_name || ""}`.trim().replace(/\s+/g, " ");
      setDraftUsername(full);
      setDraftPhone((profile as any).phone || (profile as any).phone_number || "");
      setDraftLocation(profile.location || "");
      setDraftBio(profile.bio || "");
      setDraftYears(typeof profile.years_experience === "number" ? String(profile.years_experience) : "");
    }
    setEditing(true);
  };

  const cancelAll = () => {
    if (!profile) {
      setEditing(false);
      return;
    }
    const full = `${profile.first_name || ""} ${profile.last_name || ""}`.trim().replace(/\s+/g, " ");
    setDraftUsername(full);
    setDraftPhone((profile as any).phone || (profile as any).phone_number || "");
    setDraftLocation(profile.location || "");
    setDraftBio(profile.bio || "");
    setDraftYears(typeof profile.years_experience === "number" ? String(profile.years_experience) : "");
    setEditing(false);
  };

  const saveAll = async () => {
    try {
      setSaving(true);
      setEditError(null);
      const name = (draftUsername || "").trim().replace(/\s+/g, " ");
      const [first_name, ...rest] = name.split(" ");
      const last_name = rest.join(" ");
      const payload = {
        first_name,
        last_name,
        phone: draftPhone,
        phone_number: draftPhone,
        location: draftLocation,
        bio: draftBio,
        years_experience: draftYears.trim() === "" ? undefined : Number(draftYears),
      } as const;
      const updated = await updateCurrentTechnician(payload as any);
      
      const patched = { ...updated, phone: (updated as any).phone ?? (updated as any).phone_number ?? draftPhone } as TechnicianProfile;
      setProfile(patched);
      setEditing(false);
    } catch (e: any) {
      setEditError(e?.message || "Failed to save changes");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    
    return (
      <div className="flex justify-center pt-24 px-6 pb-24">
        <div className="w-full max-w-5xl min-h-[60vh]" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="pt-24 px-6 text-red-600">Error: {error}</div>
    );
  }

  return (
    <div className="flex justify-center pt-24 px-6 pb-24">
      <div className="w-full max-w-5xl">
      <div
        className="bg-white rounded-2xl p-6 transition border border-gray-300"
        style={{ boxShadow: "0px 1px 1px rgba(0,0,0,0.25)" }}
      >
        <div className="flex justify-between items-center">
          <div className="flex space-x-4">
            <p className="w-20 h-20 flex items-center justify-center text-2xl rounded-full bg-[#1877D3] text-white font-bold ">
                {profile ? (
                  <>
                  {profile.first_name?.[0]}
                  {profile.last_name?.[0]}
                  </>
                  ) : (
                  "AP"
                  )}
            </p>
            <div className="space-y-4">
              <h2 className="text-2xl font-bold text-gray-800">
                {profile
                  ? `${profile.first_name} ${profile.last_name}`
                  : "AGABA Patrick"}
              </h2>
              <div className="flex space-x-8 mt-2">
               <div className="space-y-4">
  <p className={`px-4 py-0.5 border border-gray-300 text-sm rounded-full inline-block ${
    isDark 
      ? "bg-gray-700 text-gray-200" 
      : "bg-[#FFF9F9] text-gray-700"
  }`}>
    Technician
  </p>
  <div className={`flex items-center text-sm ${
    isDark ? "text-gray-300" : "text-gray-600"
  }`}>
    <CiLocationOn className="mr-1 text-xl" />
    <span>{profile?.location || "Kigali, Rwanda"}</span>
  </div>
</div>

                <div className="space-y-5">
                  <div className="flex items-center text-sm text-gray-700">
                    <IoStar className="text-yellow-500 mr-1 text-xl" />
                    <p>
                      {profile?.rating_avg ?? 0} (
                      {profile?.rating_count ?? 0} reviews)
                    </p>
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <CiCalendar className="mr-1 text-xl" />
                    <p>{profile?.email}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {!editing ? (
              <button
                onClick={openEditor}
                className="inline-flex items-center px-6 py-2 text-sm font-medium bg-[#1877D3] text-white rounded-md shadow hover:bg-[#145ba8] transition"
              >
                <FaRegEdit className="mr-2" /> Edit
              </button>
            ) : (
              <>
                <Button variant="secondary" onClick={cancelAll} disabled={saving}>Cancel</Button>
                <Button onClick={saveAll} loading={saving}>Save Changes</Button>
              </>
            )}
          </div>
        </div>
      </div>
  <div className={`w-full flex items-center justify-between rounded-2xl p-1 mt-6 shadow-sm ${
          isDark ? "bg-gray-800" : "bg-[#ECECF0]"
        }`}>
          <button
            onClick={() => setActivePage("overview")}
            className={`flex-1 mx-1 py-2 rounded-full font-semibold transition ${
              activePage === "overview"
                ? "bg-white text-black shadow"
                : isDark 
                  ? "text-gray-300 hover:bg-gray-700 hover:text-white" 
                  : "text-gray-700 hover:bg-white hover:text-black"
            }`}
          >
            Overview
          </button>

          <button
            onClick={() => setActivePage("contact")}
            className={`flex-1 mx-1 py-2 rounded-full font-semibold transition ${
              activePage === "contact"
                ? "bg-white text-black shadow"
                : isDark 
                  ? "text-gray-300 hover:bg-gray-700 hover:text-white" 
                  : "text-gray-700 hover:bg-white hover:text-black"
            }`}
          >
            Contact Info
          </button>

          <button
            onClick={() => setActivePage("skills")}
            className={`flex-1 mx-1 py-2 rounded-full font-semibold transition ${
              activePage === "skills"
                ? "bg-white text-black shadow"
                : isDark 
                  ? "text-gray-300 hover:bg-gray-700 hover:text-white" 
                  : "text-gray-700 hover:bg-white hover:text-black"
            }`}
          >
            Skills & Certs
          </button>

          <button
            onClick={() => setActivePage("reviews")}
            className={`flex-1 mx-1 py-2 rounded-full font-semibold transition ${
              activePage === "reviews"
                ? "bg-white text-black shadow"
                : isDark 
                  ? "text-gray-300 hover:bg-gray-700 hover:text-white" 
                  : "text-gray-700 hover:bg-white hover:text-black"
            }`}
          >
            Reviews
          </button>
        </div>

      <div className="mt-6 space-y-4 no-anchor min-h-[70vh]">
        {activePage === "overview" && (
          <Overview
            editMode={editing}
            profile={profile}
            draftBio={draftBio}
            setDraftBio={setDraftBio}
            draftYears={draftYears}
            setDraftYears={setDraftYears}
          />
        )}
        {activePage === "contact" && (
          <ContactInfo
            editMode={editing}
            profile={profile || undefined}
            draftUsername={draftUsername}
            setDraftUsername={setDraftUsername}
            draftPhone={draftPhone}
            setDraftPhone={setDraftPhone}
            draftLocation={draftLocation}
            setDraftLocation={setDraftLocation}
          />
        )}
        {activePage === "skills" && (
          <SkillsCerts editMode={editing} onUpdated={(p) => setProfile(p)} />
        )}
        {activePage === "reviews" && <Reviews />}
      </div>
      
      </div>
    </div>
  );
}

export default TechProfile;
