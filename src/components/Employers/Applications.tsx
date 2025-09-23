import { IoTimeOutline } from "react-icons/io5";
import { CiStar } from "react-icons/ci";
import { FaRegMessage } from "react-icons/fa6";
import { GoVerified } from "react-icons/go";
import { MdOutlineCancel } from "react-icons/md";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { listApplicants, listTechnicians, setApplicantStatus, myJobs } from "../../api/employers";
import type { EmployerApplication, Paginated, TechnicianMini } from "../../types/employer";
import Modal from "../ui/Modal";
import Input from "../ui/Input";
import Button from "../ui/Button";

function Application() {
  const [data, setData] = useState<Paginated<EmployerApplication> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newMsgOpen, setNewMsgOpen] = useState(false);
  const [q, setQ] = useState("");
  const [techs, setTechs] = useState<Paginated<TechnicianMini> | null>(null);
  const [searching, setSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [jobTitles, setJobTitles] = useState<Record<number, string>>({});

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await listApplicants({ page_size: 50 });
      setData(res);
    } catch (e: any) {
      setError(e?.message || "Failed to load applications");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Load employer's jobs to map job id -> title for display
  useEffect(() => {
    (async () => {
      try {
        const res = await myJobs({ page_size: 200 });
        const map: Record<number, string> = {};
        for (const j of res.results) map[j.id] = j.title;
        setJobTitles(map);
      } catch {
        // silently ignore; UI will fall back to id
      }
    })();
  }, []);

  const runSearch = async () => {
    setSearching(true);
    setSearchError(null);
    try {
      const res = await listTechnicians(q ? { search: q, page_size: 12 } : { page_size: 12 });
      setTechs(res);
    } catch (e: any) {
      setSearchError(e?.message || "Failed to search technicians");
    } finally {
      setSearching(false);
    }
  };

  const updateStatus = async (
    id: number,
    status: "SHORTLISTED" | "REJECTED"
  ) => {
    try {
      await setApplicantStatus(id, status);
      setData((prev) =>
        prev
          ? {
              ...prev,
              results: prev.results.map((a) =>
                a.id === id ? { ...a, status } : a
              ),
            }
          : prev
      );
    } catch (e: any) {
      alert(e?.message || "Failed to update status");
    }
  };

  return (
    <section className="px-4 md:px-16 pb-12">
      <div className="max-w-7xl mx-auto flex flex-col-reverse md:flex-row items-start gap-8">
        <div className="flex-1 space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold text-black">Job Applications</h2>
            <Button onClick={() => { setNewMsgOpen(true); setTechs(null); setQ(""); }}>New Message</Button>
          </div>

          {loading && <div className="text-gray-600">Loading...</div>}
          {error && <div className="text-red-600">{error}</div>}

          {!loading &&
            !error &&
            data?.results.map((app) => (
              <div
                key={app.id}
                className="bg-white rounded-2xl p-6 transition border border-gray-300"
                style={{ boxShadow: "0px 0px 0px 1px rgba(0,0,0,0.08)" }}
              >
                <div className="flex justify-between">
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-1">
                      {app.technician_profile.first_name}{" "}
                      {app.technician_profile.last_name}
                    </h3>
                    <p className="text-gray-500 mb-5">
                      Applied for {jobTitles[app.job] || (app as any).job_title || `Job #${app.job}`}
                    </p>
                  </div>
                  <span className="inline-flex items-center px-4 h-8 text-xs font-medium bg-yellow-100 text-yellow-800 rounded-2xl">
                    {app.status}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm text-gray-600 mb-4">
                  <div className="flex items-center gap-2">
                    <IoTimeOutline className="text-2xl text-gray-500" />
                    <span>
                      Applied{" "}
                      {new Date(app.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CiStar className="text-2xl text-orange-400" />
                    <span>
                      {app.technician_profile.rating_avg ?? 0} rating
                    </span>
                  </div>

                  <div className="col-span-2">
                    <h3 className="text-sm font-medium text-gray-400 mb-2">
                      Skills:
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {(app.technician_profile.skills || []).map((s) => (
                        <span
                          key={s.id}
                          className="px-3 py-1 border border-gray-300 rounded-lg text-sm text-black"
                        >
                          {s.name}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span>Cover Message:</span>
                  </div>
                </div>

                {app.cover_letter && (
                  <p className="text-gray-800 bg-[#ECECF0] rounded-2xl p-3 mb-4">
                    {app.cover_letter}
                  </p>
                )}

                <div className="flex gap-3 items-center pt-2">
                  <button
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white border border-gray-300 rounded-lg text-sm font-medium hover:bg-blue-700 transition"
                    onClick={() => updateStatus(app.id, "SHORTLISTED")}
                  >
                    <GoVerified className="text-white" /> Accept
                  </button>
                  <button
                    className="flex items-center gap-2 px-4 py-2 text-black border border-gray-300 rounded-lg text-sm font-medium hover:bg-blue-100 hover:border-blue-300 transition"
                    onClick={() => updateStatus(app.id, "REJECTED")}
                  >
                    <MdOutlineCancel className="text-black" /> Cancel
                  </button>
                  <Link
                    className="flex items-center gap-2 px-4 py-2 text-black border border-gray-300 rounded-lg text-sm font-medium hover:bg-blue-100 hover:border-blue-300 transition"
                    to={`/employer/messages?recipient=${app.technician}`}
                  >
                    <FaRegMessage className="text-black" /> Message
                  </Link>
                </div>
              </div>
            ))}
        </div>
      </div>
      {/* New Message Modal */}
      <Modal open={newMsgOpen} onClose={() => setNewMsgOpen(false)} title="Start a new chat">
        <div className="space-y-4">
          <div className="flex gap-2 items-end">
            <div className="flex-1">
              <Input
                label="Search technicians"
                placeholder="Name, location, skill..."
                value={q}
                onChange={(e) => setQ(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") runSearch(); }}
              />
            </div>
            <Button variant="outline" onClick={runSearch} loading={searching}>Search</Button>
          </div>
          {searchError && <div className="text-sm text-red-600">{searchError}</div>}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-80 overflow-y-auto">
            {(techs?.results || []).map((t: TechnicianMini, idx) => (
              <Link
                key={idx}
                to={`/employer/messages?recipient=${t.user_id}`}
                className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:bg-blue-50 transition"
                onClick={() => setNewMsgOpen(false)}
              >
                <div className="w-10 h-10 rounded-full bg-[#2984df] text-white font-bold flex items-center justify-center">
                  {(t.first_name?.[0] || '')}{(t.last_name?.[0] || '')}
                </div>
                <div>
                  <div className="font-semibold text-gray-900">{t.first_name} {t.last_name}</div>
                  <div className="text-xs text-gray-500">{t.location || '-'} · {t.years_experience ?? 0} yrs</div>
                </div>
                <span className="ml-auto text-sm text-blue-700">Message →</span>
              </Link>
            ))}
            {!searching && techs && techs.results.length === 0 && (
              <div className="text-sm text-gray-600">No results. Try another search.</div>
            )}
          </div>
        </div>
      </Modal>
    </section>
  );
}

export default Application;
